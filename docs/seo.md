# SEO Architecture

This site is a single-page Vite + React + TypeScript app with no SSR. All
per-route metadata, structured data, and crawlability artefacts live in the
files documented below.

## Layout

| File | Role |
|---|---|
| [`index.html`](../index.html) | Static baseline — title, meta, OG/Twitter, canonical, and JSON-LD for `Organization`, `WebSite`, `SoftwareApplication`. Served as-is to crawlers that don't execute JavaScript. |
| [`src/lib/seo-meta.ts`](../src/lib/seo-meta.ts) | Pure data + JSON-LD builders. `PUBLIC_ROUTES`, `PAGE_META`, `routeMeta`, `canonicalUrl`, plus typed builders for `Organization`, `WebSite`, `SoftwareApplication`, `BreadcrumbList`, `FAQPage`. |
| [`src/lib/seo.tsx`](../src/lib/seo.tsx) | The `usePageSEO` React hook. Updates `document.title`, meta tags, canonical, OG/Twitter, and the per-page JSON-LD bundle on route change. |
| [`src/lib/faq.ts`](../src/lib/faq.ts) | The FAQ entries rendered by the homepage **and** emitted as `FAQPage` JSON-LD. Single source of truth so visible content and structured data never drift. |
| [`public/robots.txt`](../public/robots.txt) | Allows the public site, disallows `/api/`, points to the sitemap. |
| [`public/sitemap.xml`](../public/sitemap.xml) | One entry per `PUBLIC_ROUTES` URL. Verified by `tests/seo-static.test.ts`. |
| [`public/llms.txt`](../public/llms.txt) | AI-crawler / answer-engine summary in the [llms.txt](https://llmstxt.org/) format. Lists positioning, core concepts, public pages, docs, install commands, and integrations. |
| [`public/og-image.png`](../public/og-image.png) | Default OG/Twitter card (1200×630). Source SVG: [`og-image.svg`](../public/og-image.svg). |

## How head mutation works

1. `index.html` ships with home-page metadata + the three site-level JSON-LD
   blocks. These have **no** `data-seo` attribute and are never touched by
   the SPA.
2. On route change, `usePageSEO` runs in a `useEffect`:
   - Sets `<title>`, `lang`, description, robots, canonical, all OG and
     Twitter tags from `PAGE_META[route]`.
   - Removes every existing `<script[type="application/ld+json"][data-seo="managed"]>`.
   - Injects the page's JSON-LD bundle (auto-generated `BreadcrumbList` for
     non-home routes plus any nodes the page passed via `jsonLd`), each
     marked `data-seo="managed"` so the next navigation can clean them up.
3. Crawlers that execute JS see the same metadata and JSON-LD as humans;
   crawlers that don't execute JS still get the `index.html` baseline.

## Adding a new public page

1. **Pick a route** and add it to `RouteKey` and `PUBLIC_ROUTES` in
   [`seo-meta.ts`](../src/lib/seo-meta.ts).
2. **Add a `PAGE_META` entry** with `title`, `description`,
   `breadcrumbLabel`, `ogType`, `priority`, `changefreq`. Keep titles
   ≤ 75 characters and descriptions between 80 and 320 characters — the
   tests in [`seo.test.tsx`](../tests/seo.test.tsx) enforce this.
3. **Append a URL block to [`public/sitemap.xml`](../public/sitemap.xml)**.
   The static parity test verifies sitemap ↔ `PUBLIC_ROUTES` equality.
4. **Add the route to the React Router config in
   [`src/App.tsx`](../src/App.tsx)** and write the page component.
5. **Call `usePageSEO()`** at the top of the page component. With no args,
   the hook reads `PAGE_META`, sets all metadata, and emits a default
   `Home → Page` `BreadcrumbList`. Pass `jsonLd: [...]` to layer extra
   structured data (e.g. an `Article`, additional `FAQPage`).
6. **Update [`public/llms.txt`](../public/llms.txt)** if the new page is
   important enough to surface to AI crawlers — typically yes.
7. **Run `npm run test`** — the SEO tests will fail loudly if any of the
   above is missing.

### Example — page-specific JSON-LD

```tsx
import { usePageSEO } from '../lib/seo'
import { faqPageJsonLd } from '../lib/seo-meta'
import { FAQ_ENTRIES } from '../lib/faq'

export function HomePage() {
  usePageSEO({
    jsonLd: [faqPageJsonLd(FAQ_ENTRIES)],
    breadcrumb: false, // home doesn't need a breadcrumb
  })
  // ...
}
```

### Example — non-indexable page

```tsx
usePageSEO({
  title: 'Internal — Statewave',
  description: 'Internal-only page, not for indexing.',
  robots: 'noindex, follow',
  breadcrumb: false,
})
```

## Canonical URL configuration

`BASE_URL` in [`seo-meta.ts`](../src/lib/seo-meta.ts) is the production
origin (`https://statewave.ai`). It's a constant — there is no
production / staging / preview switching today, because preview deploys
shouldn't be indexed and the SPA doesn't read environment variables for
SEO. If a staging origin ever needs its own canonical, add a
`VITE_PUBLIC_BASE_URL` env var, fall back to the constant when unset, and
update the tests.

## Per-page checklist (before merging marketing copy changes)

- [ ] Unique `title` and `description` in `PAGE_META`.
- [ ] One H1 per page; H2/H3 hierarchy walks the document outline.
- [ ] Internal links use React Router `<Link>`; external links carry
      `target="_blank" rel="noopener noreferrer"`.
- [ ] Images have `alt` text (or are `aria-hidden` if purely decorative).
- [ ] No claim that the docs / repo wouldn't back up — Statewave doesn't
      ship marketing benchmarks, fake logos, or aspirational integrations.
- [ ] If the page has a FAQ-style section, mirror it into the `FAQPage`
      JSON-LD via `faqPageJsonLd(...)`.
- [ ] `npm run typecheck && npm run lint && npm run test && npm run build`
      all pass.

## Crawler debugging

- **Google Rich Results Test** — paste any `https://statewave.ai/*` URL
  into <https://search.google.com/test/rich-results> to confirm the
  rendered JSON-LD validates.
- **Twitter Card validator** — <https://cards-dev.twitter.com/validator>
  (X has retired the public form, but the metadata is still respected).
- **OpenGraph debugger** — <https://www.opengraph.xyz/>.
- **llms.txt preview** — fetch <https://statewave.ai/llms.txt> directly;
  it should render as Markdown.
- **Sitemap** — <https://statewave.ai/sitemap.xml> must list every
  indexable route.
