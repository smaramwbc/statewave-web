import { Link } from 'react-router'
import { Section } from '../components/Section'
import { Heading } from '../components/Heading'
import { Button } from '../components/Button'
import { PageFaq } from '../components/PageFaq'
import { usePageSEO } from '../lib/seo'

interface ComparisonCard {
  name: string
  href: string
  subtitle: string
  description: string
}

interface MatrixRow {
  name: string
  retrieval: string
  deployment: string
  statewave?: boolean
}

/* Retrieval and deployment facts are pulled from each product's own
 * comparison table on its /vs/<x> page (the "How context is selected" and
 * "License"/"Deployment" rows) so this matrix can't drift from what those
 * pages already say, plus the Supermemory local-build cap sourced from its
 * v0.0.7 release notes (see the Supermemory alternatives blog post). */
const MATRIX: ReadonlyArray<MatrixRow> = [
  {
    name: 'Mem0',
    retrieval: 'Top-k embedding-nearest as the candidate pool, then re-scored',
    deployment: 'Apache 2.0 core, paid platform',
  },
  {
    name: 'Letta',
    retrieval: 'The agent reads and edits its own context tree with tool calls',
    deployment: 'Apache 2.0, with managed Letta Cloud',
  },
  {
    name: 'Zep',
    retrieval: 'Graph traversal plus a managed reranker',
    deployment: 'Cloud, BYOK, or BYOC — self-hosted Community Edition discontinued 2025',
  },
  {
    name: 'Supermemory',
    retrieval: 'Hybrid vector + keyword search with a context-aware reranker',
    deployment: 'Self-hostable binary (10k-doc local cap) or a managed hosted platform',
  },
  {
    name: 'Statewave',
    retrieval: 'Deterministic assembly, ranked to a token budget',
    deployment: 'Apache 2.0 throughout, runs fully offline',
    statewave: true,
  },
]

const COMPARISONS: ReadonlyArray<ComparisonCard> = [
  {
    name: 'Mem0',
    href: '/vs/mem0',
    subtitle: 'Deterministic Context vs. Ranked Retrieval',
    description:
      'Mem0 ranks memories by relevance for an id you pass. Statewave compiles episodes into typed memories with a fixed scoring model, policy on the read path, and an integrity-hashed receipt.',
  },
  {
    name: 'Letta',
    href: '/vs/letta',
    subtitle: 'Runtime-Managed vs. Agent-Managed Memory',
    description:
      'In Letta the agent edits its own memory blocks with tool calls. Statewave assembles a deterministic, token-bounded bundle mechanically, with no model in the loop.',
  },
  {
    name: 'Zep',
    href: '/vs/zep',
    subtitle: 'Inspectable Bundle vs. Opaque Context Block',
    description:
      'Zep models memory as a knowledge graph and returns an opaque Context Block string. Statewave returns typed, provenance-traced memories with per-row confidence and validity.',
  },
  {
    name: 'Supermemory',
    href: '/vs/supermemory',
    subtitle: 'Deterministic Bundle vs. Reranked Search',
    description:
      'Supermemory does hybrid vector-plus-keyword search with context-aware reranking. Statewave assembles a deterministic bundle with per-row provenance and an integrity-hashed receipt.',
  },
]

export function AlternativesPage() {
  usePageSEO()

  return (
    <>
      <section className="pt-24 pb-14 sm:pt-28 sm:pb-16 md:pt-36">
        <div className="mx-auto max-w-4xl px-5 sm:px-6">
          <p className="section-eyebrow mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            Comparisons
          </p>

          <h1 className="font-heading text-4xl font-bold leading-[0.98] tracking-[-0.03em] text-theme-primary sm:text-5xl md:text-[56px]">
            Statewave <span className="text-gradient-brand">vs.</span> Mem0, Letta, Zep & Supermemory
          </h1>

          <p className="mt-7 max-w-2xl text-[17px] leading-[1.7] text-theme-secondary/90 sm:text-[19px]">
            How Statewave's deterministic, token-bounded context assembly
            compares to the other memory systems teams evaluate alongside it.
          </p>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-theme-muted">
            Same question, four times: does the system compile a fixed
            answer ahead of time, or search and re-rank one at call time?
            The matrix below is the short version; each card links to the
            full breakdown.
          </p>
        </div>
      </section>

      <Section className="!pt-0">
        <div className="mx-auto max-w-5xl overflow-x-auto rounded-2xl border border-theme-border">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-theme-border bg-surface-1/60">
                <th className="px-5 py-3 font-semibold text-theme-primary">Product</th>
                <th className="px-5 py-3 font-semibold text-theme-primary">How context is selected</th>
                <th className="px-5 py-3 font-semibold text-theme-primary">Deployment</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-theme-border">
              {MATRIX.map((row) => (
                <tr
                  key={row.name}
                  className={row.statewave ? 'bg-surface-2/60' : 'bg-surface-1/25'}
                >
                  <td className={`px-5 py-4 align-top font-medium ${row.statewave ? 'text-brand-400' : 'text-theme-primary'}`}>
                    {row.name}
                  </td>
                  <td className="px-5 py-4 align-top text-theme-secondary">{row.retrieval}</td>
                  <td className="px-5 py-4 align-top text-theme-secondary">{row.deployment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section className="!pt-0">
        <div className="grid gap-4 sm:grid-cols-2">
          {COMPARISONS.map((card) => (
            <Link
              key={card.name}
              to={card.href}
              className="group flex flex-col rounded-2xl border border-theme-border bg-surface-1/45 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-theme-border-hover hover:bg-surface-1/55"
            >
              <h2 className="text-xl font-semibold text-theme-primary">
                Statewave vs {card.name}
              </h2>

              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-400">
                {card.subtitle}
              </p>

              <p className="mt-4 text-sm leading-relaxed text-theme-muted">
                {card.description}
              </p>

              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-400">
                Read the comparison

                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <PageFaq route="/alternatives" />

      <Section>
        <div className="cta-card relative overflow-hidden rounded-[2.5rem] border border-brand-500/25 bg-surface-1/55 px-6 py-16 text-center sm:py-20">
          <div className="cta-card-glow absolute inset-0" aria-hidden="true" />

          <div
            className="absolute inset-x-20 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/60 to-transparent"
            aria-hidden="true"
          />

          <div className="relative z-10 mx-auto max-w-2xl">
            <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
              Open benchmark
            </p>

            <Heading
              id="not-listed"
              className="font-heading text-3xl font-bold tracking-[-0.02em] text-theme-primary sm:text-4xl"
            >
              Comparing something else?
            </Heading>

            <p className="mt-5 text-[17px] leading-[1.7] text-theme-secondary/85">
              Statewave is open source and self-hosted, so you can benchmark
              it against any memory system yourself using the public,
              reproducible benchmark suite.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button to="/benchmarks" size="lg">
                View benchmark methodology
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
