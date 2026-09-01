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
 *
 * Head metadata: the template's <head> (title, og:*, twitter:*, canonical)
 * is otherwise static — it's whatever dist/index.html shipped with, because
 * `render()` only returns the <body> tree and usePageSEO's client-side
 * useEffect never runs during SSR. Left alone, every prerendered route
 * (all blog posts included) shipped the SAME homepage title/description/
 * image to link-preview bots (Slack, WhatsApp, X, ...), which don't execute
 * JS and only ever see this static markup. applyHeadMeta() below patches
 * the template's head tags per route right before writing the file, using
 * the same values the SPA would set after hydration — so a crawler and a
 * real browser agree on what a given URL is about.
 */

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const DIST = path.resolve('dist')
const SSR_DIST = path.resolve('dist-ssr')

const STATIC_ROUTES = ['/', '/blog', '/blog/statewave-guide', '/faq']

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

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// All helpers below stay within a single tag's attribute list ([^>]*, never
// [\s\S]*) so a lazy match can't skip past this tag's `>` and patch the
// wrong element further down the document.
function replaceTitle(html, newTitle) {
  const re = /<title>[\s\S]*?<\/title>/
  if (!re.test(html)) throw new Error('Could not find <title> in template')
  return html.replace(re, `<title>${escapeHtml(newTitle)}</title>`)
}

function replaceCanonical(html, newUrl) {
  const re = /(<link[^>]*\brel=["']canonical["'][^>]*\bhref=["'])[^"']*(["'])/i
  if (!re.test(html)) throw new Error('Could not find <link rel="canonical"> in template')
  return html.replace(re, (_m, pre, post) => `${pre}${escapeHtml(newUrl)}${post}`)
}

function replaceMetaContent(html, attrName, attrValue, newContent) {
  const re = new RegExp(
    `(<meta[^>]*\\b${attrName}=["']${attrValue}["'][^>]*\\bcontent=["'])[^"']*(["'])`,
    'i',
  )
  if (!re.test(html)) {
    throw new Error(`Could not find <meta ${attrName}="${attrValue}"> in template`)
  }
  return html.replace(re, (_m, pre, post) => `${pre}${escapeHtml(newContent)}${post}`)
}

/** Patch the template's <head> tags for one route's meta (title,
 *  description, canonical, OG + Twitter card). See the header comment for
 *  why this exists — it's what makes non-JS crawlers see the right thing. */
function applyHeadMeta(html, meta) {
  html = replaceTitle(html, meta.title)
  html = replaceMetaContent(html, 'name', 'description', meta.description)
  html = replaceCanonical(html, meta.url)
  html = replaceMetaContent(html, 'property', 'og:title', meta.title)
  html = replaceMetaContent(html, 'property', 'og:description', meta.description)
  html = replaceMetaContent(html, 'property', 'og:image', meta.image)
  html = replaceMetaContent(html, 'property', 'og:image:alt', meta.imageAlt)
  html = replaceMetaContent(html, 'property', 'og:url', meta.url)
  html = replaceMetaContent(html, 'property', 'og:type', meta.ogType)
  html = replaceMetaContent(html, 'name', 'twitter:title', meta.title)
  html = replaceMetaContent(html, 'name', 'twitter:description', meta.description)
  html = replaceMetaContent(html, 'name', 'twitter:image', meta.image)
  html = replaceMetaContent(html, 'name', 'twitter:image:alt', meta.imageAlt)
  return html
}

/** Inject route-specific JSON-LD into <head>, right before it closes. This
 *  is the server-side equivalent of what usePageSEO's `jsonLd` option does
 *  client-side — that hook runs in a useEffect, which never fires during
 *  SSR, so without this, BlogPosting / FAQPage / HowTo schema (and the
 *  breadcrumb) would exist in the React tree but never reach a crawler
 *  that doesn't execute JS. The static Organization / WebSite blocks
 *  already in the template are untouched; this only adds route-specific
 *  nodes alongside them. */
function injectJsonLd(html, nodes) {
  if (nodes.length === 0) return html
  const scripts = nodes
    .map((node) => `<script type="application/ld+json">${JSON.stringify(node)}</script>`)
    .join('')
  if (!html.includes('</head>')) throw new Error('Could not find </head> in template')
  return html.replace('</head>', `${scripts}</head>`)
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
  const {
    render,
    BLOG_POSTS,
    blogPostUrl,
    PAGE_META,
    BASE_URL,
    canonicalUrl,
    DEFAULT_OG_IMAGE,
    DEFAULT_OG_IMAGE_ALT,
    softwareApplicationJsonLd,
    faqPageJsonLd,
    breadcrumbJsonLd,
    articleJsonLd,
    supportAgentHowToJsonLd,
    FAQ_ENTRIES,
    POST_FAQ,
    HOWTO_SLUGS,
  } = await import(entryUrl)

  function jsonLdForStaticRoute(routePath) {
    if (routePath === '/') return [softwareApplicationJsonLd(), faqPageJsonLd(FAQ_ENTRIES)]
    if (routePath === '/faq') {
      return [
        faqPageJsonLd(FAQ_ENTRIES),
        breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'FAQ', path: '/faq' }]),
      ]
    }
    return []
  }

  function jsonLdForPost(post) {
    const nodes = [
      articleJsonLd(post),
      breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Blog', path: '/blog' },
        { name: post.meta.title, path: blogPostUrl(post.meta.slug) },
      ]),
    ]
    const faqs = POST_FAQ[post.meta.slug]
    if (faqs) nodes.push(faqPageJsonLd(faqs))
    if (HOWTO_SLUGS.includes(post.meta.slug)) nodes.push(supportAgentHowToJsonLd())
    return nodes
  }

  const template = await readFile(path.join(DIST, 'index.html'), 'utf-8')
  if (!template.includes('<div id="root"></div>')) {
    throw new Error(
      'dist/index.html no longer contains the empty <div id="root"></div> ' +
        'placeholder — the prerender injection point. If the build template ' +
        'changed, update the placeholder string in scripts/prerender.mjs.',
    )
  }

  function metaForStaticRoute(routePath) {
    const page = PAGE_META[routePath]
    return {
      title: page.title,
      description: page.description,
      image: DEFAULT_OG_IMAGE,
      imageAlt: DEFAULT_OG_IMAGE_ALT,
      ogType: page.ogType ?? 'website',
      url: canonicalUrl(routePath),
    }
  }

  function metaForPost(post) {
    const hasImage = Boolean(post.meta.image)
    return {
      title: `${post.meta.title} — Statewave Blog`,
      description: post.meta.description,
      image: hasImage ? `${BASE_URL}${post.meta.image}` : DEFAULT_OG_IMAGE,
      imageAlt: hasImage ? post.meta.title : DEFAULT_OG_IMAGE_ALT,
      ogType: 'article',
      url: canonicalUrl(blogPostUrl(post.meta.slug)),
    }
  }

  for (const route of STATIC_ROUTES) {
    let html = await ssr(render, route, template)
    html = applyHeadMeta(html, metaForStaticRoute(route))
    html = injectJsonLd(html, jsonLdForStaticRoute(route))
    await writeRoutePage(route, html)
  }

  for (const post of BLOG_POSTS) {
    const route = blogPostUrl(post.meta.slug)
    let html = await ssr(render, route, template)
    html = applyHeadMeta(html, metaForPost(post))
    html = injectJsonLd(html, jsonLdForPost(post))
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
