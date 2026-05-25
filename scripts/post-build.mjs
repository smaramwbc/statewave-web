/*
 * Post-build orchestrator. Runs after `vite build` and
 * `vite build --ssr`, in order:
 *
 *   1. Multi-route prerender (writes per-route HTML into dist/)
 *   2. Sitemap generator    (writes dist/sitemap.xml)
 *   3. RSS feed generator   (writes dist/blog/rss.xml)
 *   4. Cleanup              (deletes dist-ssr/)
 *
 * Each step imports the SSR bundle once (via runPrerender / generateSitemap
 * / generateRss); the bundle is kept alive until all three have run, then
 * deleted. This avoids the cost of compiling SSR multiple times for the
 * three different "I need to know which blog posts exist" callers.
 */

import { rm } from 'node:fs/promises'
import path from 'node:path'
import { runPrerender } from './prerender.mjs'
import { generateSitemap } from './generate-sitemap.mjs'
import { generateRss } from './generate-rss.mjs'

const SSR_DIST = path.resolve('dist-ssr')

async function main() {
  const { routes } = await runPrerender()
  await generateSitemap()
  await generateRss()
  await rm(SSR_DIST, { recursive: true, force: true })
  console.log(`Post-build complete — ${routes.length} routes prerendered, sitemap + RSS regenerated.`)
}

main().catch((err) => {
  console.error('Post-build failed:', err)
  process.exit(1)
})
