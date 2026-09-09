import { Section } from './Section'
import { Heading } from './Heading'
import { FaqAccordion } from './FaqAccordion'
import { PAGE_FAQS, PAGE_FAQS_REVIEWED } from '../lib/page-faqs'
import type { RouteKey } from '../lib/seo-meta'

/* Per-page Q&A section. Renders nothing for a route with no entries in
 * lib/page-faqs, so adding a page's questions is a one-line data change.
 *
 * Markup is the shared FaqAccordion — question as an <h3> with its answer
 * immediately after in DOM order, which is what an answer engine pairs into
 * a citation (see tests/faq-answer-adjacency.test.tsx). The matching
 * FAQPage JSON-LD is emitted by usePageSEO from the same data, so the
 * visible text and the structured data can't drift.
 */
export function PageFaq({ route }: { route: RouteKey }) {
  const entries = PAGE_FAQS[route]
  if (!entries || entries.length === 0) return null

  return (
    <Section id="page-faq" className="bg-surface-1/40">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 max-w-2xl">
          <p className="section-eyebrow mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            FAQ
          </p>
          <Heading
            id="page-faq-heading"
            className="font-heading text-3xl font-bold tracking-[-0.02em] text-theme-primary md:text-4xl"
          >
            Frequently asked questions
          </Heading>
        </div>

        <FaqAccordion entries={entries} />

        {/* Dated, so a reader (or an answer engine quoting one of these)
            can see how current the answer is. Constant, not the build
            date — see PAGE_FAQS_REVIEWED. */}
        <p className="mt-6 text-xs text-theme-muted">
          Answers last checked against the Statewave docs and repositories on{' '}
          <time dateTime={PAGE_FAQS_REVIEWED}>{PAGE_FAQS_REVIEWED}</time>.
        </p>
      </div>
    </Section>
  )
}
