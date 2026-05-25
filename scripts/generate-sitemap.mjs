/*
 * Generates dist/sitemap.xml from the canonical route table in
 * src/lib/seo-meta.ts + the published blog posts. Replaces the previous
 * hand-maintained public/sitemap.xml — keeping it in sync with blog posts
 * by hand was a drift hazard (the audit reminded us that "every new
 * content page should be in the sitemap"), and now the sitemap is just
 * a function of the route table.
 *
 * Format: sitemap protocol 0.9. priority + changefreq come from PAGE_META
 * for marketing routes and a small per-post calculation for blog posts
 * (recent posts get higher priority + weekly changefreq; older posts
 * decay to monthly).
 */

import { writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const DIST = path.resolve('dist')
const SSR_DIST = path.resolve('dist-ssr')

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function postPriority(date) {
  // Recent posts get higher priority. Decays smoothly so the sitemap
  // accurately reflects how fresh each post is.
  const ageMs = Date.now() - new Date(date).getTime()
  const ageDays = ageMs / (1000 * 60 * 60 * 24)
  if (ageDays < 30) return 0.7
  if (ageDays < 180) return 0.6
  return 0.5
}

function postChangefreq(date) {
  const ageDays = (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
  return ageDays < 90 ? 'weekly' : 'monthly'
}

export async function generateSitemap() {
  const entryUrl = pathToFileURL(path.join(SSR_DIST, 'entry.server.js')).href
  const { BLOG_POSTS, blogPostUrl, PUBLIC_ROUTES, PAGE_META, BASE_URL } =
    await import(entryUrl)

  const urls = []

  for (const route of PUBLIC_ROUTES) {
    const meta = PAGE_META[route]
    urls.push({
      loc: `${BASE_URL}${route === '/' ? '/' : route}`,
      changefreq: meta.changefreq,
      priority: meta.priority,
    })
  }

  for (const post of BLOG_POSTS) {
    urls.push({
      loc: `${BASE_URL}${blogPostUrl(post.meta.slug)}`,
      lastmod: post.meta.date,
      changefreq: postChangefreq(post.meta.date),
      priority: postPriority(post.meta.date),
    })
  }

  const body = urls
    .map((u) => {
      const parts = [`    <loc>${escapeXml(u.loc)}</loc>`]
      if (u.lastmod) parts.push(`    <lastmod>${escapeXml(u.lastmod)}</lastmod>`)
      parts.push(`    <changefreq>${escapeXml(u.changefreq)}</changefreq>`)
      parts.push(`    <priority>${u.priority.toFixed(1)}</priority>`)
      return `  <url>\n${parts.join('\n')}\n  </url>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`

  await writeFile(path.join(DIST, 'sitemap.xml'), xml, 'utf-8')
  console.log(`Generated sitemap.xml — ${urls.length} URLs`)
}

const isDirectRun = import.meta.url === pathToFileURL(process.argv[1]).href
if (isDirectRun) {
  generateSitemap().catch((err) => {
    console.error('Sitemap generation failed:', err)
    process.exit(1)
  })
}
