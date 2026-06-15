/* Single source of truth for use-case DETAIL pages — the deep-dive marketing
 * pages that live at /use-cases/<slug> (distinct from the cards on the
 * /use-cases index). Add an entry here when a new detail page ships; it drives
 * the in-page breadcrumb switcher (components/UseCaseSwitcher) and is the
 * canonical list the index card's `pageHref` should match.
 *
 * Routes (src/App.tsx) and SEO metadata (src/lib/seo-meta.ts) still need their
 * own entries per page — keep the `path` here in sync with those. */

export interface UseCaseDetailPage {
  slug: string
  /** Short label shown in the breadcrumb switcher dropdown. */
  label: string
  path: string
}

export const USE_CASE_DETAIL_PAGES: readonly UseCaseDetailPage[] = [
  {
    slug: 'multi-agent-memory',
    label: 'Multi-Agent Memory',
    path: '/use-cases/multi-agent-memory',
  },
] as const

export function useCaseDetailPage(
  slug: string,
): UseCaseDetailPage | undefined {
  return USE_CASE_DETAIL_PAGES.find((p) => p.slug === slug)
}
