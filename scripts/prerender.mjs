/*
 * Prerender the homepage `/` into the built `dist/index.html`.
 *
 * Why: the homepage's hero <h1> is the LCP element on mobile, but the SPA
 * shipped an empty <div id="root"></div> — so the browser couldn't paint
 * anything meaningful until the entry JS bundle downloaded, parsed, and
 * React mounted. Mobile cold LCP was ~3.9s. Baking the rendered hero into
 * the initial HTML response lets the browser paint immediately and React
 * hydrate over it.
 *
 * Scope: prerender just `/`. Every other route stays a normal SPA. Adding
 * more routes is a one-line change here (append to ROUTES) once the
 * components on those routes are also SSR-safe.
 *
 * Pipeline (driven by package.json):
 *   1. `npm run build:client`        — normal Vite client build → dist/
 *   2. `npm run build:ssr-bundle`    — `vite build --ssr src/entry.server.tsx`
 *                                      → dist-ssr/entry.server.js
 *   3. `npm run build:prerender`     — this script
 *
 * Rollback: delete this file, drop the `build:ssr-bundle` + `build:prerender`
 * steps from package.json, revert main.tsx to `createRoot(...).render(...)`.
 * The site falls back to plain SPA behavior with no other changes required.
 */

import { readFile, writeFile, rm } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const ROUTES = ['/']

const DIST = path.resolve('dist')
const SSR_DIST = path.resolve('dist-ssr')

async function main() {
  const entryUrl = pathToFileURL(path.join(SSR_DIST, 'entry.server.js')).href
  const { render } = await import(entryUrl)

  const template = await readFile(path.join(DIST, 'index.html'), 'utf-8')

  if (!template.includes('<div id="root"></div>')) {
    throw new Error(
      'dist/index.html no longer contains the empty <div id="root"></div> ' +
        'placeholder — the prerender injection point. If the build template ' +
        'changed, update the placeholder string in scripts/prerender.mjs.',
    )
  }

  for (const url of ROUTES) {
    if (url !== '/') {
      throw new Error(
        `Multi-route prerender not implemented: only / is supported. ` +
          `Each additional route needs its own output path and rewrite.`,
      )
    }
    const appHtml = render(url)

    // Sanity floor: if React fell back to client-only rendering (e.g.
    // because of an unguarded `window` access in the render path) it
    // produces a tiny <template> stub of a few KB instead of the full
    // page. Catch that here so the build fails loudly instead of
    // silently shipping an SPA-only homepage.
    const FALLBACK_MARKER = 'Switched to client rendering because the server rendering errored'
    // Floor sits above React's client-rendering-fallback template (~2.6 kB)
    // but below the legitimate above-the-fold-only payload (~11 kB at the
    // time this was tuned). If the homepage is intentionally shrunk further,
    // adjust — but the FALLBACK_MARKER check below is the real guard.
    const MIN_BYTES = 5_000
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

    const out = template.replace(
      '<div id="root"></div>',
      `<div id="root">${appHtml}</div>`,
    )
    await writeFile(path.join(DIST, 'index.html'), out, 'utf-8')
    const bytes = Buffer.byteLength(appHtml, 'utf-8')
    console.log(`Prerendered ${url}: ${bytes} bytes of SSR HTML injected`)
  }

  await rm(SSR_DIST, { recursive: true, force: true })
}

main().catch((err) => {
  console.error('Prerender failed:', err)
  process.exit(1)
})
