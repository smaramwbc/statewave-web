import {
  defaultBreadcrumb,
  faqPageJsonLd,
  howToJsonLd,
  productJsonLd,
  softwareApplicationJsonLd,
  blogIndexJsonLd,
  openrouterProxyJsonLd,
  type JsonLd,
  type RouteKey,
} from './seo-meta'
import { FAQ_ENTRIES } from './faq'
import { PAGE_FAQS } from './page-faqs'
import type { BlogPostSummary } from './seo-meta'

/**
 * The single source of truth for which JSON-LD a static route emits.
 *
 * This exists because the schema pipeline runs twice: `usePageSEO` injects on
 * the client from a `useEffect`, and `scripts/prerender.mjs` writes the same
 * nodes into the static HTML at build time, because a `useEffect` never fires
 * during SSR and crawlers that don't execute JS would otherwise see nothing.
 *
 * Those two used to be separate lists, and they drifted: `/openrouter` passed
 * SoftwareApplication through `usePageSEO({ jsonLd })` and `/blog` passed Blog,
 * but neither was in the prerenderer's hardcoded route switch, so both were
 * invisible to any crawler that doesn't run JS — the page's primary entity,
 * silently absent from the served HTML.
 *
 * Adding a route's schema here fixes it in both places at once. Do not add a
 * route-static node by passing `jsonLd` to `usePageSEO`: that reaches the
 * client only. `jsonLd` is for genuinely per-instance schema (a blog post's
 * BlogPosting), which the prerenderer builds separately from the post itself.
 */
export function routeJsonLd(
  pathname: string,
  /** Only /blog needs these. Passed in rather than imported so this module
   *  stays out of the blog chunk, which every route would otherwise pull. */
  blogPosts?: readonly BlogPostSummary[],
): JsonLd[] {
  // The homepage is the site's entity home: it carries the app and product
  // nodes plus the full FAQ, and deliberately has no breadcrumb.
  if (pathname === '/') {
    return [softwareApplicationJsonLd(), productJsonLd(), faqPageJsonLd(FAQ_ENTRIES)]
  }

  const nodes: JsonLd[] = []

  // Route-specific primary entities.
  if (pathname === '/faq') nodes.push(faqPageJsonLd(FAQ_ENTRIES))
  if (pathname === '/product') nodes.push(productJsonLd())
  if (pathname === '/developers') nodes.push(howToJsonLd())
  if (pathname === '/openrouter') nodes.push(openrouterProxyJsonLd())
  if (pathname === '/blog' && blogPosts?.length) nodes.push(blogIndexJsonLd(blogPosts))

  // Pages carrying a <PageFaq> get its FAQPage node from the same data the
  // section renders, so the visible Q&A and the structured data can't drift.
  const pageFaq = PAGE_FAQS[pathname as RouteKey]
  if (pageFaq?.length) nodes.push(faqPageJsonLd(pageFaq))

  const crumb = defaultBreadcrumb(pathname)
  if (crumb) nodes.push(crumb)

  return nodes
}
