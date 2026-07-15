import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Section } from '../components/Section'
import { Heading } from '../components/Heading'
import { HowStatewaveWorks } from '../components/HowStatewaveWorks'
import { ReturnLink } from '../components/ReturnLink'
import { LanguagePicker } from '../components/LanguagePicker'
import {
  ENGLISH_COPY,
  detectInitialLang,
  languageFor,
  loadManifesto,
  persistLang,
  type LangCode,
  type ManifestoCopy,
} from '../lib/manifesto-i18n'
import { usePageSEO } from '../lib/seo'

export function WhyPage() {
  usePageSEO()
  return (
    <>
      <ManifestoHero />

      {/* Infrastructure gap */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-[0.46fr_0.54fr] xl:gap-16">
          <div className="max-w-2xl">
            <div className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
              THE PROBLEM
            </div>

            <Heading
              id="infrastructure-gap"
              className="font-heading text-3xl font-bold tracking-[-0.02em] text-theme-primary md:text-4xl"
            >
              The infrastructure gap
            </Heading>

            <p className="mt-6 text-[17px] leading-relaxed text-theme-secondary">
              AI support agents forget. Every session starts from zero. Returning
              customers re-explain who they are, what plan they're on, what they
              asked last time. Agents make the same mistakes they made before.
              This isn't a capability gap in the LLM — it's an infrastructure
              gap. Most AI applications have no memory layer.
            </p>
          </div>

          {/* SVG placeholder */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="flex aspect-[4/3] w-full max-w-[620px] items-center justify-center rounded-3xl border border-dashed border-brand-500/20 bg-surface-1/50">
              <span className="text-sm text-theme-muted">
                Infrastructure gap SVG
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* How it works */}
      <Section className="bg-surface-1/40">
        <HowStatewaveWorks variant="compact" id="how-it-works" />
      </Section>

      {/* Alternatives comparison */}
      <Section className="bg-surface-1/50">
        <div className="max-w-3xl">
          <div className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            COMPARISON
          </div>

          <Heading
            id="vs-alternatives"
            className="font-heading text-3xl font-bold tracking-[-0.02em] text-theme-primary md:text-4xl"
          >
            Statewave vs alternatives
          </Heading>
        </div>

        {/* On phones a 4-column comparison table is unreadable: either the
          content gets clipped (the "Statewave" column was being cut off)
          or columns shrink to a single character per line. We render the
          same data two ways:
            - md+: the proper table for scannable side-by-side comparison
            - <md: a stack of per-property cards with a 3-column "verdict
              grid" inside each card. No horizontal scrolling required. */}
        {(() => {
          const rows: Array<[string, string, string, string]> = [
            ['Deterministic', '✗', '✗', '✓'],
            ['Token-bounded', '✗', 'Truncation', '✓ Ranked packing'],
            ['Provenance', '✗', '✗', '✓ Episode-level'],
            ['Structured extraction', '✗', '✗', '✓ Typed memories'],
            ['Temporal reasoning', '✗', '✗', '✓ Validity windows'],
            ['Confidence scoring', '✗', '✗', '✓'],
            ['Idempotent', 'N/A', 'N/A', '✓'],
            ['Subject lifecycle', '✗', '✗', '✓ Full CRUD + delete'],
            ['Cost at scale', 'Linear growth', 'Index bloat', 'Bounded by budget'],
          ]

          return (
            <div className="mt-12">
              {/* Mobile: stacked cards. Each comparison sits on a single
                row (label left, verdict right) so the eye can scan the
                three verdicts straight down without re-finding labels.
                Long verdicts ("Ranked packing", "Episode-level") wrap
                inside the value column rather than pushing the label. */}
              <div className="space-y-4 md:hidden">
                {rows.map(([prop, ps, rag, sw], i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-brand-500/15 bg-surface-1 p-5"
                  >
                    <p className="mb-4 text-base font-semibold text-theme-primary">
                      {prop}
                    </p>

                    <dl className="space-y-3">
                      {[
                        {
                          label: 'Prompt stuffing',
                          value: ps,
                          accent: false,
                        },
                        {
                          label: 'Naive RAG',
                          value: rag,
                          accent: false,
                        },
                        {
                          label: 'Statewave',
                          value: sw,
                          accent: true,
                        },
                      ].map(({ label, value, accent }) => (
                        <div
                          key={label}
                          className="flex items-start gap-4"
                        >
                          <dt
                            className={`w-28 shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] ${accent
                                ? 'text-brand-400'
                                : 'text-theme-muted'
                              }`}
                          >
                            {label}
                          </dt>

                          <dd
                            className={`text-sm leading-relaxed break-anywhere ${accent
                                ? 'font-medium text-brand-400'
                                : 'text-theme-secondary'
                              }`}
                          >
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>

              {/* md+: original table. Wrapped so any future overflow scrolls
                horizontally inside the card rather than the whole page. */}
              <div className="hidden overflow-hidden rounded-2xl border border-brand-500/15 bg-surface-1 md:block">
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed">
                    <thead className="bg-surface-2/40">
                      <tr className="border-b border-theme-border">
                        <th className="w-[25%] px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-theme-muted">
                          Property
                        </th>

                        <th className="w-[25%] px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-theme-muted">
                          Prompt stuffing
                        </th>

                        <th className="w-[22%] px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-theme-muted">
                          Naive RAG
                        </th>

                        <th className="w-[28%] px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-brand-400">
                          Statewave
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {rows.map(([prop, ps, rag, sw], i) => (
                        <tr
                          key={i}
                          className="border-b border-theme-border/70 transition-colors last:border-0 hover:bg-surface-2/20"
                        >
                          <td className="px-5 py-4 text-sm font-semibold text-theme-primary">
                            {prop}
                          </td>

                          <td className="px-5 py-4 text-sm text-theme-muted">
                            {ps}
                          </td>

                          <td className="px-5 py-4 text-sm text-theme-muted">
                            {rag}
                          </td>

                          <td className="px-5 py-4 text-sm font-medium text-brand-400">
                            {sw}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        })()}
      </Section>

      {/* Technical properties */}
      <Section>
        <div className="max-w-3xl">
          <div className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            TECHNICAL FOUNDATION
          </div>

          <Heading
            id="technical-properties"
            className="font-heading text-3xl font-bold tracking-[-0.02em] text-theme-primary md:text-4xl"
          >
            Key technical properties
          </Heading>
        </div>

        <div className="mt-12 grid items-center gap-12 lg:grid-cols-[0.38fr_0.62fr] xl:gap-16">
          {/* SVG placeholder */}
          <div className="relative flex justify-center lg:justify-start">
            <div className="flex aspect-square w-full max-w-[470px] items-center justify-center rounded-3xl border border-dashed border-brand-500/20 bg-surface-1/50">
              <span className="text-sm text-theme-muted">
                Technical properties SVG
              </span>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {[
              {
                title: 'Deterministic',
                desc:
                  'Same subject + task + budget → same context bundle. No non-determinism from vector-only retrieval.',
              },
              {
                title: 'Token-bounded',
                desc:
                  'Context assembly respects a configurable token budget. Items are packed by ranked score, not truncated arbitrarily.',
              },
              {
                title: 'Provenance-traced',
                desc:
                  'Every memory traces to its source episode IDs. Every context bundle reports which facts and episodes were included.',
              },
              {
                title: 'Idempotent',
                desc:
                  'Recompiling the same subject produces no duplicate memories. Safe to run on schedule or on-demand.',
              },
              {
                title: 'Subject-centric',
                desc:
                  'Everything organized around subjects. Full lifecycle: ingest → compile → retrieve → inspect → delete.',
              },
              {
                title: 'Self-hosted storage',
                desc:
                  'Postgres-only. Episodes and compiled memories stay in your infrastructure. Whether prompt content leaves depends on your compiler and embedding choice — heuristic mode is fully local.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-brand-500/15 bg-surface-1 p-6"
              >
                <h3 className="text-base font-semibold text-theme-primary">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-theme-secondary">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Audience fit */}
      <Section className="bg-surface-1/50">
        <div className="max-w-3xl">
          <div className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            WHO IT IS FOR
          </div>

          <Heading
            id="who-this-is-for"
            className="font-heading text-3xl font-bold tracking-[-0.02em] text-theme-primary md:text-4xl"
          >
            Who this is for
          </Heading>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-emerald-400/20 bg-surface-1 p-7 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-semibold text-theme-primary">
                Good fit
              </h3>
            </div>

            <ul className="space-y-4 text-sm leading-relaxed text-theme-secondary">
              {[
                'Teams building AI support agents with returning customers',
                'Engineering leads who want measurable context quality',
                'Teams that need provenance — "why did the agent say X?"',
                'Self-hosted storage requirements — episodes and memories stay on your infrastructure (heuristic compiler keeps everything local; LLM compiler or hosted embeddings will send content to the chosen provider)',
                'Small capable teams using AI coding tools',
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3"
                >
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>

                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-theme-border bg-surface-1 p-7 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-theme-border bg-surface-2 text-theme-muted">
                <span aria-hidden>—</span>
              </div>

              <h3 className="text-xl font-semibold text-theme-primary">
                Not yet a fit
              </h3>
            </div>

            <ul className="space-y-4 text-sm leading-relaxed text-theme-muted">
              {[
                'Need a hosted SaaS (Statewave is self-hosted infrastructure)',
                'Just need a vector database (use pgvector/Pinecone directly)',
                'Building chatbots with no multi-session requirement',
                'Need verified high-throughput scale today (multi-replica API is supported, but not load-tested beyond 10k subjects; single Postgres, no cross-region clustering)',
                'Looking for a complete agent framework',
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3"
                >
                  <span className="mt-0.5 shrink-0">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </>
  )
}

/* ─── Manifesto hero ────────────────────────────────────────────────────────
 * The /why page used to open with a dry "A technical comparison for teams…"
 * subhead. The page is literally called Why — so it should answer with the
 * actual why first. Heart, then proof. The technical comparison sections
 * below now read as evidence rather than the main act.
 *
 * Layout: standard page top spacing (pt-32) for nav clearance, narrow
 * centered column for manifesto-style readability, subtle accent halo
 * behind the words, sign-off rule at the bottom that pairs with the
 * technical sections that follow.
 */
function ManifestoHero() {
  // Detect synchronously so the first render already knows the right language.
  // Previously we deferred this to a useEffect, which made non-English visitors
  // see English text for one paint before the right chunk arrived. The site is
  // SPA-only (no SSR), so there's no hydration-mismatch risk from sync init.
  const [lang, setLang] = useState<LangCode>(() => detectInitialLang())
  const [copy, setCopy] = useState<ManifestoCopy>(ENGLISH_COPY)
  // Track which language the current `copy` actually represents. Used to
  // tell whether we're still on the eager English fallback (skeleton time)
  // or already showing real content for the user's language.
  const [copyLang, setCopyLang] = useState<LangCode>('en')

  useEffect(() => {
    let cancelled = false
    loadManifesto(lang).then((next) => {
      if (!cancelled) {
        setCopy(next)
        setCopyLang(lang)
      }
    })
    return () => {
      cancelled = true
    }
  }, [lang])

  const handleLang = (code: LangCode) => {
    setLang(code)
    persistLang(code)
  }

  const langInfo = languageFor(lang)
  const dir = langInfo.dir ?? 'ltr'

  // Skeleton appears only when we have not yet loaded the user's actual
  // language and the eager English fallback would otherwise show. Once any
  // non-English copy is loaded, subsequent language switches keep the prior
  // content visible during the transition (kinder than flashing to a
  // skeleton mid-session).
  const showSkeleton = copyLang === 'en' && lang !== 'en'

  return (
    <section className="relative pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 md:pb-32 overflow-hidden">
      {/* Soft accent halo — barely there, just a warmth behind the words. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(55% 55% at 50% 30%, rgba(99,102,241,0.08), transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-3xl px-5 sm:px-6">
        {/* The header row stays LTR regardless of the manifesto language —
            it carries product chrome (back-link, picker), not localized
            content. */}
        <div className="flex items-start justify-between gap-4">
          <ReturnLink />
          <div className="ml-auto">
            <LanguagePicker value={lang} onChange={handleLang} />
          </div>
        </div>

        {/* Eyebrow / headline / body / closer cross-fade together on language
            switch. We avoid `variants` on the inner children because mixing
            inline `initial`/`animate` on the keyed parent with variant-based
            children breaks variant inheritance — children can get stuck at
            their `hidden` variant after the first switch and render invisibly.
            The keyed parent's single fade is enough; staggering each child on
            every locale change would feel busy anyway. */}
        <AnimatePresence mode="wait">
          {showSkeleton ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              dir={dir}
              aria-hidden
            >
              <ManifestoSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key={lang}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              dir={dir}
              lang={lang}
            >
              <p className="section-eyebrow text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
                {copy.eyebrow}
              </p>

              <h1 className="mt-5 break-anywhere font-heading text-[clamp(2.25rem,5.5vw,4rem)] font-bold leading-[1.08] tracking-[-0.03em] text-theme-primary sm:mt-6">
                {copy.headline}
              </h1>

              <div className="mt-8 space-y-5 text-base leading-[1.7] text-theme-secondary sm:space-y-6 sm:text-[1.075rem] md:mt-10 md:text-lg md:leading-[1.75]">
                {copy.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              <p className="mt-8 break-anywhere text-xl font-semibold leading-snug tracking-[-0.015em] text-theme-primary sm:mt-10 sm:text-2xl md:text-[1.875rem]">
                {copy.closerLead}{' '}
                <span className="text-gradient-brand">
                  {copy.closerHighlight}
                </span>
              </p>

              <div className="mt-12 flex items-center gap-4">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-theme-border to-transparent" />
                <span className="text-xs text-theme-muted tracking-wide">
                  {copy.signoff}
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-theme-border to-transparent" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The "scroll for the technical case" hint stays mounted across
            locale changes — only its label translates. While the skeleton
            is up the label is intentionally blank to avoid flashing English
            below the placeholder. */}
        <div className="mt-16 flex justify-center">
          <a
            href="#infrastructure-gap"
            className="group inline-flex items-center gap-2 text-xs text-theme-muted transition-colors hover:text-brand-400"
            dir={dir}
            lang={lang}
          >
            <span className="tracking-wide uppercase">
              {showSkeleton ? '' : copy.technicalCta}
            </span>
            <svg
              className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}

/* ─── Manifesto skeleton ─────────────────────────────────────────────────────
 * Shown only on first paint when the user's detected language isn't English
 * yet — the eager English copy would otherwise flash before the right locale
 * chunk arrives. Layout mirrors the real manifesto's vertical rhythm so the
 * swap doesn't shift content below.
 *
 * Tailwind's `animate-pulse` fades opacity 1 → 0.5 → 1 on a 2s loop. Subtle
 * enough to feel premium, obvious enough to communicate "loading" without a
 * spinner.
 */
function ManifestoSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Eyebrow */}
      <div className="h-3 w-28 rounded-full bg-surface-2" />

      {/* Headline — two stacked lines, sized to match real h1 line-height */}
      <div className="mt-6 space-y-3">
        <div className="h-8 md:h-11 w-[88%] rounded-md bg-surface-2" />
        <div className="h-8 md:h-11 w-[64%] rounded-md bg-surface-2" />
      </div>

      {/* Body paragraphs — three blocks of varying line counts to echo the
          natural rhythm of the real copy. */}
      <div className="mt-10 space-y-6">
        <SkeletonParagraph widths={[100, 96, 70]} />
        <SkeletonParagraph widths={[98, 100, 88, 52]} />
        <SkeletonParagraph widths={[100, 95, 92, 78]} />
      </div>

      {/* Closer */}
      <div className="mt-10">
        <div className="h-7 md:h-8 w-[58%] rounded-md bg-surface-2" />
      </div>

      {/* Signoff rule */}
      <div className="mt-12 flex items-center gap-4">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-theme-border to-transparent" />
        <div className="h-3 w-32 rounded bg-surface-2" />
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-theme-border to-transparent" />
      </div>
    </div>
  )
}

function SkeletonParagraph({ widths }: { widths: number[] }) {
  return (
    <div className="space-y-2.5">
      {widths.map((w, i) => (
        <div
          key={i}
          className="h-4 rounded bg-surface-2"
          style={{ width: `${w}%` }}
        />
      ))}
    </div>
  )
}
