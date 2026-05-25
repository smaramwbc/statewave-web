/*
 * Multi-route prerender into the built dist/.
 *
 * Each route gets its own server-rendered HTML response, written so
 * Vercel serves it as a static file (faster TTFB, no SPA cold-paint).
 * The SPA still hydrates on top, so client routing keeps working
 * exactly as before — visiting another route then back to a prerendered
 * one is still a client-side navigation, no full reload.
 *
 * Routes prerendered:
 *   1. `/`               — the homepage hero shell
 *   2. `/blog`           — the blog index
 *   3. `/blog/<slug>`    — one file per published blog post
 *
 * Layout of dist/:
 *   dist/index.html           (route `/`)
 *   dist/blog/index.html      (route `/blog`)
 *   dist/blog/<slug>/index.html
 *
 * Vercel's default static-file resolution serves `dist/blog/foo/index.html`
 * for `/blog/foo` before the SPA catch-all rewrite kicks in. Other client-
 * only routes (e.g. /demo, /launch) fall through to the rewrite → SPA
 * shell as before.
 *
 * Pipeline (package.json):
 *   1. build:client       — vite build → dist/
 *   2. build:ssr-bundle   — vite build --ssr → dist-ssr/entry.server.js
 *   3. build:postbuild    — node scripts/post-build.mjs (this script + RSS
 *                            + sitemap; dist-ssr is deleted at the end).
 *   4. build:server       — tsc -p tsconfig.server.json
 *
 * Rollback: revert this file, drop the build:postbuild step, restore the
 * static public/sitemap.xml. The site falls back to single-route prerender
 * (the previous shape) with no other code changes.
 */

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const DIST = path.resolve('dist')
const SSR_DIST = path.resolve('dist-ssr')

const STATIC_ROUTES = ['/', '/blog']

const FALLBACK_MARKER = 'Switched to client rendering because the server rendering errored'
const MIN_BYTES = 5_000

async function ssr(render, url, template) {
  const appHtml = await render(url)
  if (appHtml.includes(FALLBACK_MARKER)) {
    throw new Error(
      `SSR errored and React fell back to client-only rendering for ${url}. ` +
        `Snippet: ${appHtml.slice(0, 400)}`,
    )
  }
  if (appHtml.length < MIN_BYTES) {
    throw new Error(
      `SSR output for ${url} is only ${appHtml.length} bytes (expected ≥ ${MIN_BYTES}). ` +
        `Snippet: ${appHtml.slice(0, 400)}`,
    )
  }
  return template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
}

async function writeRoutePage(routePath, html) {
  // Map `/` → dist/index.html (overwrite the Vite template), every other
  // route → dist/<route>/index.html so Vercel resolves it as a directory
  // index without further routing config.
  const outDir = routePath === '/' ? DIST : path.join(DIST, routePath)
  await mkdir(outDir, { recursive: true })
  const outFile = path.join(outDir, 'index.html')
  await writeFile(outFile, html, 'utf-8')
  console.log(`Prerendered ${routePath} → ${path.relative(DIST, outFile)}`)
}

export async function runPrerender() {
  const entryUrl = pathToFileURL(path.join(SSR_DIST, 'entry.server.js')).href
  const { render, BLOG_POSTS, blogPostUrl } = await import(entryUrl)

  const template = await readFile(path.join(DIST, 'index.html'), 'utf-8')
  if (!template.includes('<div id="root"></div>')) {
    throw new Error(
      'dist/index.html no longer contains the empty <div id="root"></div> ' +
        'placeholder — the prerender injection point. If the build template ' +
        'changed, update the placeholder string in scripts/prerender.mjs.',
    )
  }

  for (const route of STATIC_ROUTES) {
    const html = await ssr(render, route, template)
    await writeRoutePage(route, html)
  }

  for (const post of BLOG_POSTS) {
    const route = blogPostUrl(post.meta.slug)
    const html = await ssr(render, route, template)
    await writeRoutePage(route, html)
  }

  return {
    routes: [...STATIC_ROUTES, ...BLOG_POSTS.map((p) => blogPostUrl(p.meta.slug))],
  }
}

async function main() {
  await runPrerender()
  await rm(SSR_DIST, { recursive: true, force: true })
}

// Allow this file to be imported by scripts/post-build.mjs (which keeps
// SSR_DIST alive until sitemap + RSS have also run) AND to be executed
// directly via `node scripts/prerender.mjs`.
const isDirectRun = import.meta.url === pathToFileURL(process.argv[1]).href
if (isDirectRun) {
  main().catch((err) => {
    console.error('Prerender failed:', err)
    process.exit(1)
  })
}
