/* eslint-disable react-refresh/only-export-components --
 * This file is the SSR entrypoint, not a HMR-targeted React module.
 * Re-exporting BLOG_POSTS / route-table constants alongside the render
 * function is intentional — it gives the build-time scripts a single
 * compiled bundle to import from. Fast-refresh doesn't apply.
 */
import { renderToReadableStream } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { ThemeProvider } from './lib/theme'
import { ChatWidgetProvider } from './lib/widget-context'
import App from './App'

// Re-exported so post-build scripts (prerender / sitemap / RSS) can
// enumerate blog posts from the same compiled MDX modules the client
// uses — single source of truth, no duplicate front-matter parsing.
export { BLOG_POSTS, blogPostUrl } from './lib/blog'
export type { BlogPostFrontmatter, BlogPost } from './lib/blog'
export { PUBLIC_ROUTES, PAGE_META, BASE_URL, canonicalUrl } from './lib/seo-meta'

/* Render the SPA tree for a single URL into an HTML string. Used by the
 * post-build pipeline to bake each route's static markup into dist/ so
 * the browser can paint before the JS bundle finishes downloading.
 *
 * Uses the web-stream API (`renderToReadableStream`) rather than the
 * Node-only `renderToPipeableStream` — both work in Node 18+, the
 * web-stream variant doesn't need Node-specific types in the client
 * tsconfig. We await `allReady` so every Suspense boundary in the tree
 * (most notably App.tsx's <Suspense fallback={null}> wrapping every
 * lazy-loaded route) resolves before we collect the HTML. The whole
 * point of prerender is that the visitor sees real markup on first
 * paint, not a fallback shell.
 */
export async function render(url: string): Promise<string> {
  const stream = await renderToReadableStream(
    <StaticRouter location={url}>
      <ThemeProvider>
        <ChatWidgetProvider>
          <App />
        </ChatWidgetProvider>
      </ThemeProvider>
    </StaticRouter>,
    {
      onError(error) {
        // Logged but not fatal — Suspense recovery paths can fire onError
        // multiple times during a render. The promise rejects only on a
        // shell error, which surfaces as a rejection from
        // renderToReadableStream itself.
        console.error(`[SSR ${url}] error:`, error)
      },
    },
  )
  await stream.allReady
  return await new Response(stream).text()
}
