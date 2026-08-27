import { Link } from 'react-router'
import { Section } from '../components/Section'
import { Heading } from '../components/Heading'
import { FaqAccordion } from '../components/FaqAccordion'
import { usePageSEO } from '../lib/seo'
import { faqPageJsonLd } from '../lib/seo-meta'
import { FAQ_ENTRIES } from '../lib/faq'

/* Dedicated /faq page. FAQ_ENTRIES already renders on the homepage's FAQ
 * section — this page exists so there's one crawlable, linkable URL whose
 * entire raw HTML is Q&A content with FAQPage schema, for answer engines
 * and search results that want an FAQ page specifically rather than a
 * section of the homepage. */
export function FaqPage() {
  usePageSEO({ jsonLd: [faqPageJsonLd(FAQ_ENTRIES)] })

  return (
    <Section className="pt-28 sm:pt-32 md:pt-36">
      <div className="text-center mb-16">
        <div className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
          FREQUENTLY ASKED QUESTIONS
        </div>

        <Heading
          id="faq"
          className="font-heading text-4xl md:text-[52px] font-bold leading-[1.08] tracking-[-0.03em] text-theme-primary"
        >
          Questions about Statewave
        </Heading>

        <p className="mt-6 max-w-3xl mx-auto text-[20px] leading-[1.65] text-theme-secondary">
          Honest, technical answers about Statewave, AI agent memory, and how it fits
          with the rest of your stack.
        </p>
      </div>

      <FaqAccordion entries={FAQ_ENTRIES} />

      <div className="mt-14 text-center text-[15px] text-theme-secondary/75">
        More questions? Read the{' '}
        <a
          href="https://github.com/smaramwbc/statewave-docs"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-accent/80 transition-colors"
        >
          docs
        </a>
        , browse the{' '}
        <Link to="/use-cases" className="text-accent hover:text-accent/80 transition-colors">
          use cases
        </Link>
        , or open an{' '}
        <a
          href="https://github.com/smaramwbc/statewave/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-accent/80 transition-colors"
        >
          issue on GitHub
        </a>
        .
      </div>
    </Section>
  )
}
