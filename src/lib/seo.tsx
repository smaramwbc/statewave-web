/* SEO React hook.
 *
 * The site is a single-page Vite + React app (no SSR), so every page-level
 * head mutation happens here on route change. The static index.html carries
 * a baseline SoftwareApplication / Organization / WebSite JSON-LD for
 * crawlers that don't execute JavaScript; this hook layers per-page metadata
 * + JSON-LD on top by managing scripts marked with `data-seo="managed"` so
 * they can be cleanly replaced on navigation without duplicating the static
 * fallback.
 *
 * Pure data and JSON-LD builders live in ./seo-meta. Re-exported here for
 * call-site convenience — most pages can import everything from `lib/seo`.
 */

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  DEFAULT_LANG,
  DEFAULT_LOCALE,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_ROBOTS,
  SITE_NAME,
  canonicalUrl,
  defaultBreadcrumb,
  routeMeta,
  type JsonLd,
} from './seo-meta'

export interface UsePageSEOOptions {
  /** Override the page title (rendered as-is — already includes Statewave when desired). */
  title?: string
  /** Override the meta description. */
  description?: string
  /** Override the canonical pathname (defaults to current location). */
  path?: string
  /** Override the Open Graph image URL. */
  ogImage?: string
  /** Override OG image alt text. */
  ogImageAlt?: string
  /** Override the robots directive. */
  robots?: string
  /** Per-page JSON-LD nodes layered on top of the static baseline. */
  jsonLd?: readonly JsonLd[]
  /** Set false to skip the auto-generated breadcrumb (default true). */
  breadcrumb?: boolean
  /** Override the Open Graph type. Defaults to the per-route value in
   *  PAGE_META, then 'website'. Use 'article' for blog posts and other
   *  long-form content so social-card scrapers / answer engines treat
   *  the page as editorial rather than as a landing page. */
  ogType?: 'website' | 'article'
}

const MANAGED_LD_ATTR = 'data-seo'
const MANAGED_LD_VALUE = 'managed'

export function usePageSEO(options: UsePageSEOOptions = {}) {
  const location = useLocation()
  const pathname = options.path ?? location.pathname

  // Stable JSON-LD signature so the effect doesn't reflow on every render.
  // The eslint exhaustive-deps rule can't see through the JSON.stringify
  // memoization, so we depend on the signature instead of the array
  // identity. Real reactivity comes from the signature changing when any
  // node's content changes.
  const ldSignature = JSON.stringify(options.jsonLd ?? [])

  useEffect(() => {
    const meta = routeMeta(pathname)
    const pageTitle = options.title ?? meta.title
    const pageDescription = options.description ?? meta.description
    const url = canonicalUrl(pathname)
    const ogImage = options.ogImage ?? DEFAULT_OG_IMAGE
    const ogImageAlt = options.ogImageAlt ?? DEFAULT_OG_IMAGE_ALT
    const robots = options.robots ?? meta.robots ?? DEFAULT_ROBOTS

    document.title = pageTitle
    document.documentElement.lang = DEFAULT_LANG

    setMeta('description', pageDescription)
    setMeta('robots', robots)
    setLink('canonical', url)

    setMeta('og:title', pageTitle, 'property')
    setMeta('og:description', pageDescription, 'property')
    setMeta('og:url', url, 'property')
    setMeta('og:image', ogImage, 'property')
    setMeta('og:image:alt', ogImageAlt, 'property')
    setMeta('og:image:width', '1200', 'property')
    setMeta('og:image:height', '630', 'property')
    setMeta('og:type', options.ogType ?? meta.ogType ?? 'website', 'property')
    setMeta('og:site_name', SITE_NAME, 'property')
    setMeta('og:locale', DEFAULT_LOCALE, 'property')

    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', pageTitle)
    setMeta('twitter:description', pageDescription)
    setMeta('twitter:image', ogImage)
    setMeta('twitter:image:alt', ogImageAlt)

    // Replace all SPA-managed JSON-LD with the page's set. The static
    // SoftwareApplication / Organization / WebSite blocks in index.html have
    // no data-seo attribute and are intentionally left untouched.
    document
      .querySelectorAll(
        `script[type="application/ld+json"][${MANAGED_LD_ATTR}="${MANAGED_LD_VALUE}"]`,
      )
      .forEach((el) => el.remove())

    const nodes: JsonLd[] = []
    if (options.breadcrumb !== false) {
      const crumb = defaultBreadcrumb(pathname)
      if (crumb) nodes.push(crumb)
    }
    if (options.jsonLd) nodes.push(...options.jsonLd)

    for (const node of nodes) injectJsonLd(node)
    // The signature line below intentionally captures `options.jsonLd`'s
    // contents without making the array identity itself a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pathname,
    options.title,
    options.description,
    options.ogImage,
    options.ogImageAlt,
    options.robots,
    options.breadcrumb,
    ldSignature,
  ])
}

/* ─── DOM helpers ────────────────────────────────────────────────────────── */

function setMeta(
  name: string,
  content: string,
  attr: 'name' | 'property' = 'name',
) {
  let el = document.head.querySelector(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector(
    `link[rel="${rel}"]`,
  ) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

function injectJsonLd(data: JsonLd) {
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.setAttribute(MANAGED_LD_ATTR, MANAGED_LD_VALUE)
  // JSON.stringify is XSS-safe inside <script type="application/ld+json">
  // because the browser parses it as data, not script. The one character to
  // guard against is "</" which can prematurely close the tag — escape just
  // that. (We never emit any `<` other than as part of "</".)
  script.textContent = JSON.stringify(data).replace(/</g, '\\u003c')
  document.head.appendChild(script)
}
