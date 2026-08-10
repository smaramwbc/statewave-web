import { motion } from 'framer-motion'
import { Fragment, useState } from 'react'
import { Section } from '../components/Section'
import { Heading } from '../components/Heading'
import { Button } from '../components/Button'
import { CodeCopyButton } from '../components/CodeCopyButton'
import { UseCaseSwitcher } from '../components/UseCaseSwitcher'
import { usePageSEO } from '../lib/seo'
import { breadcrumbJsonLd } from '../lib/seo-meta'

const REPO_URL = 'https://github.com/smaramwbc/statewave-grounded-shop-assistant'

/* Mockups below use the `--viz-*` tokens (src/index.css) so their neutrals
 * flip with the light/dark theme while the grounded/gap accents stay
 * branded in both, same convention as PersonalAssistantMemoryPage. */

/* ─── Hero ───────────────────────────────────────────────────────────────── */

function HeroSection() {
  return (
    <section className="relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(52rem 36rem at 50% 22%, rgba(99,102,241,.11), transparent 72%)',
        }}
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-45"
        style={{
          backgroundImage:
            'radial-gradient(var(--theme-hero-dot) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          maskImage:
            'radial-gradient(ellipse 70% 58% at 50% 30%, #000 24%, transparent 78%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 58% at 50% 30%, #000 24%, transparent 78%)',
        }}
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, transparent 76%, var(--theme-surface-1) 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-[1488px] px-5 pt-28 pb-10 text-center sm:px-6 sm:pt-32 md:px-16 md:pt-36 xl:px-[94px] xl:pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-[1420px]"
        >
          <div className="mb-8">
            <UseCaseSwitcher currentSlug="grounded-shop-assistant" />
          </div>

          <h1 className="mx-auto max-w-[1180px] font-heading text-[clamp(3.2rem,6.8vw,6.5rem)] font-bold leading-[0.94] tracking-[-0.06em] text-theme-primary">
            Grounded Answers,
            <br />
            Not <span className="text-gradient-brand">Guesses</span>
          </h1>

          <p className="mx-auto mt-8 max-w-[46rem] text-[18px] leading-[1.6] text-theme-secondary/90 sm:text-[20px]">
            Every answer traces to retrieved evidence and is cited back to its
            source. When the assistant can&apos;t find grounded evidence, it says
            so instead of guessing, and files the gap for the content
            team to resolve.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.5 }}
            className="mt-8 flex flex-wrap justify-center gap-3"
          >
            <Button href={REPO_URL} variant="primary" size="lg">
              View on GitHub

              <svg
                className="h-4 w-4"
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
            </Button>

            <Button to="#how" variant="secondary" size="lg">
              See how it works
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.6 }}
          className="mt-12"
        >
          <HeroChatVisual />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.5 }}
          className="mt-8"
        >
          <ProofStrip />
        </motion.div>
      </div>
    </section>
  )
}

function HeroChatVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[760px]">
      <div
        className="pointer-events-none absolute inset-x-[14%] -top-6 bottom-6 rounded-[3rem] blur-[90px]"
        style={{ background: 'var(--viz-hero-glow-primary)' }}
        aria-hidden="true"
      />

      <div
        className="relative z-10 w-full overflow-hidden rounded-2xl border text-left"
        style={{
          borderColor: 'var(--viz-border-strong)',
          background: 'var(--viz-shell)',
          boxShadow: 'var(--viz-shell-shadow)',
        }}
      >
        <div
          className="flex items-center gap-3 border-b px-5 py-4"
          style={{ borderColor: 'var(--viz-border)', background: 'var(--viz-shell-header)' }}
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg font-heading text-sm font-extrabold text-white"
            style={{ background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-accent))' }}
          >
            G
          </span>

          <div className="leading-tight">
            <p className="font-heading text-sm font-bold" style={{ color: 'var(--viz-text)' }}>
              GreenHaven Assistant
            </p>
            <p className="text-[11px]" style={{ color: 'var(--viz-text-muted)' }}>
              Product advisor
            </p>
          </div>

          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-[10.5px] font-semibold text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            grounded
          </span>
        </div>

        <div className="flex flex-col gap-3.5 p-5">
          <div className="flex justify-end">
            <div className="max-w-[78%] rounded-2xl rounded-tr-md bg-gradient-to-r from-brand-500 to-accent px-4 py-2.5 text-[13.5px] leading-relaxed text-white">
              Do you have anything for full shade?
            </div>
          </div>

          <div className="max-w-[88%]">
            <div
              className="rounded-2xl rounded-tl-md px-4 py-3 text-[13.5px] leading-relaxed"
              style={{ background: 'var(--viz-fill)', border: '1px solid var(--viz-border)', color: 'var(--viz-text)' }}
            >
              Yes. The <b>Hosta &apos;Blue Mouse Ears&apos;</b> is rated for full to
              partial shade and stays compact, which suits shaded borders and
              containers.
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-accent/25 bg-accent/[0.08] px-2.5 py-1 text-[11px]" style={{ color: 'var(--viz-text-2)' }}>
                <span className="font-mono text-[10.5px] font-semibold text-accent">PLT-001</span>
                Hosta &apos;Blue Mouse Ears&apos;
              </span>
              <span
                className="inline-flex items-center rounded-lg px-2.5 py-1 font-mono text-[10.5px]"
                style={{ background: 'var(--viz-track)', color: 'var(--viz-text-muted)' }}
              >
                shop:products
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-0.5 text-[11px]" style={{ color: 'var(--viz-text-muted)' }}>
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            4 evidence retrieved &middot; 1 citation validated
          </div>
        </div>
      </div>
    </div>
  )
}

function ProofStrip() {
  const stats = [
    { value: '25', label: 'unit tests' },
    { value: '42', label: 'eval assertions' },
    { value: '18/20/22', label: 'Node CI matrix' },
    { value: '0', label: 'API keys to run' },
  ]

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-2xl border border-theme-border bg-surface-1/70 px-6 py-4 shadow-sm backdrop-blur-sm">
        {stats.map((stat, i) => (
          <div key={stat.label} className="flex items-center gap-x-8">
            {i > 0 && <span className="hidden h-5 w-px bg-theme-border sm:block" aria-hidden="true" />}
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-2xl font-extrabold tracking-[-0.02em] text-theme-primary">
                {stat.value}
              </span>
              <span className="text-[13px] text-theme-muted">{stat.label}</span>
            </div>
          </div>
        ))}

        <span className="hidden h-5 w-px bg-theme-border sm:block" aria-hidden="true" />

        <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="text-[12px] text-theme-secondary">
            completion mode{' '}
            <span className="font-mono font-medium text-accent">offline-rule-based</span>
          </span>
        </div>
      </div>

      <p className="mt-3 px-2 text-[11.5px] text-theme-muted">
        Real suite from the repo:{' '}
        <span className="font-mono text-theme-secondary">node --test</span> across
        chat-core, statewave-core, and server, green on every Node version in CI.
      </p>
    </div>
  )
}

/* ─── Two outcomes, both leave a trace ───────────────────────────────────── */

function TwoOutcomesSection() {
  return (
    <Section id="why" className="relative overflow-hidden bg-surface-1">
      <div aria-hidden="true" className="section-glow-full" />

      <div className="relative">
        <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
          Why Statewave
        </p>

        <Heading
          id="two-outcomes"
          className="max-w-3xl font-heading text-4xl font-bold leading-[0.98] tracking-[-0.03em] text-theme-primary md:text-[56px]"
        >
          Two Outcomes, Both{' '}
          <span className="text-gradient-brand">Leave a Trace</span>
        </Heading>

        <p className="mt-6 max-w-2xl text-[18px] leading-[1.65] text-theme-secondary/85">
          Grounding is enforced by the runtime, not the prompt. Either an
          answer survives citation validation, or the question becomes a
          coverage gap the Ops Assistant can resolve.
        </p>

        <div className="mt-14 grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
          <div className="rounded-[2rem] border border-accent/25 bg-surface-2/40 overflow-hidden">
            <div className="flex items-center gap-3 border-b border-theme-border/70 px-6 py-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-accent">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <h3 className="font-heading text-lg font-bold text-theme-primary">
                Grounded and cited
              </h3>
            </div>

            <div className="space-y-4 p-6">
              <p className="text-[15px] leading-relaxed text-theme-secondary">
                The model answers from retrieved evidence, and at least one
                citation ID survives validation.
              </p>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-lg bg-accent/10 px-2.5 py-1 font-mono text-[11.5px] font-semibold text-accent">
                  grounded: true
                </span>
                <span className="rounded-lg bg-surface-3 px-2.5 py-1 font-mono text-[11.5px] text-theme-secondary">
                  evidenceCount: 4
                </span>
              </div>

              <div className="rounded-xl border border-theme-border bg-surface-2/60 p-3.5 text-[12.5px] leading-relaxed text-theme-secondary">
                Answer returns with citation chips. Turn appended to{' '}
                <span className="font-mono text-theme-primary">shop:conversations</span>.
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 lg:flex-col lg:gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/35 bg-surface-1 text-accent shadow-sm">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h5M20 20v-5h-5M4 9a8 8 0 0114-5.3M20 15a8 8 0 01-14 5.3" />
              </svg>
            </div>
            <span className="text-[10.5px] font-medium uppercase tracking-[0.1em] text-theme-muted">
              closed loop
            </span>
          </div>

          <div className="rounded-[2rem] border border-amber-500/30 bg-surface-2/40 overflow-hidden">
            <div className="flex items-center gap-3 border-b border-theme-border/70 px-6 py-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 text-sm font-bold">
                !
              </span>
              <h3 className="font-heading text-lg font-bold text-theme-primary">
                Ungrounded &rarr; coverage gap
              </h3>
            </div>

            <div className="space-y-4 p-6">
              <p className="text-[15px] leading-relaxed text-theme-secondary">
                No evidence, or no citation survives. The assistant says it
                doesn&apos;t know, and the route files a gap.
              </p>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-lg bg-amber-500/10 px-2.5 py-1 font-mono text-[11.5px] font-semibold text-amber-500">
                  ops:coverage-gaps
                </span>
                <span className="rounded-lg bg-surface-3 px-2.5 py-1 font-mono text-[11.5px] text-theme-secondary">
                  status: open
                </span>
              </div>

              <div className="rounded-xl border border-theme-border bg-surface-2/60 p-3.5 text-[12.5px] leading-relaxed text-theme-secondary">
                A new Episode is appended. The Ops Assistant reads it as
                evidence and resolves it under the same{' '}
                <span className="font-mono text-theme-primary">sourceId</span>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ─── Built so every claim is checkable ──────────────────────────────────── */

function QADemoVisual() {
  return (
    <div className="w-full space-y-2.5 rounded-2xl border border-theme-border bg-surface-2/60 p-4">
      <div className="flex items-start gap-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-500 text-[11px] font-bold text-white">
          Q
        </span>
        <p className="pt-0.5 text-[12.5px] leading-relaxed text-theme-primary">
          Are your terracotta pots frost-proof?
        </p>
      </div>
      <div className="flex items-start gap-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-500/10 text-[11px] font-bold text-brand-400">
          A
        </span>
        <p className="pt-0.5 text-[12.5px] leading-relaxed text-theme-secondary">
          I don&apos;t have grounded information on frost tolerance for that item.
        </p>
      </div>
      <div className="flex items-center gap-2 pt-1 font-mono text-[10.5px] text-theme-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-theme-muted" />
        grounded: false &middot; no guess emitted
      </div>
    </div>
  )
}

function CitationDemoVisual() {
  const rows = [
    { id: 'S1', target: 'PLT-001', kept: true },
    { id: 'S2', target: 'FAQ-014', kept: true },
    { id: 'S9', target: 'unknown', kept: false },
  ]

  return (
    <div className="w-full space-y-2 rounded-2xl border border-theme-border bg-surface-2/60 p-4">
      {rows.map((row) => (
        <div key={row.id} className={`flex items-center gap-2.5 font-mono text-[11.5px] ${row.kept ? '' : 'opacity-55 line-through'}`}>
          <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${row.kept ? 'bg-accent/10 text-accent' : 'bg-surface-3 text-theme-muted'}`}>
            {row.kept ? '✓' : '×'}
          </span>
          <span className={row.kept ? 'font-semibold text-accent' : 'font-semibold text-theme-muted'}>{row.id}</span>
          <span className="text-theme-muted">&rarr; {row.target}</span>
          <span className={`ml-auto text-[10px] ${row.kept ? 'text-accent' : 'text-theme-muted'}`}>
            {row.kept ? 'kept' : 'dropped'}
          </span>
        </div>
      ))}
    </div>
  )
}

function GapDemoVisual() {
  return (
    <div className="w-full space-y-2 rounded-2xl border border-amber-500/25 bg-surface-2/60 p-3.5">
      <div className="flex items-center gap-2">
        <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-500">OPEN</span>
        <span className="font-mono text-[10.5px] text-theme-muted">ops:coverage-gaps</span>
      </div>
      <p className="text-[12.5px] leading-relaxed text-theme-primary">
        &quot;Which planters suit a rooftop weight limit?&quot;
      </p>
      <div className="flex items-center gap-2 font-mono text-[10.5px] text-theme-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
        sourceId: GAP-2381
      </div>
    </div>
  )
}

function AppendOnlyVisual() {
  const episodes = [
    { label: 'Episode v1', tag: 'PLT-001', current: false },
    { label: 'Episode v2', tag: 'PLT-001', current: false },
    { label: 'Episode v3', tag: 'current', current: true },
  ]

  return (
    <div className="w-full rounded-2xl border border-theme-border bg-surface-2/60 p-4">
      <div className="relative space-y-3.5 pl-1">
        <div className="absolute bottom-2 left-[7px] top-2 w-px bg-theme-border" aria-hidden="true" />
        {episodes.map((ep) => (
          <div key={ep.label} className="relative flex items-center gap-3 pl-6">
            <span
              className={`absolute left-0 h-[9px] w-[9px] rounded-full ${ep.current ? 'bg-accent shadow-[0_0_0_3px_rgba(99,102,241,0.15)]' : 'bg-theme-muted'}`}
            />
            <span className={`font-mono text-[11px] ${ep.current ? 'font-semibold text-accent' : 'text-theme-muted'}`}>
              {ep.label}
            </span>
            <span className={`ml-auto font-mono text-[10px] ${ep.current ? 'text-accent' : 'text-theme-muted'}`}>
              {ep.tag}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const WHY_CARDS = [
  {
    title: 'Grounded answers only',
    body: "The model answers strictly from retrieved evidence, and is told to say it doesn't know rather than fill the gap with a guess.",
    Visual: QADemoVisual,
  },
  {
    title: 'Every claim is citable',
    body: 'Citation IDs from the model are validated against the evidence actually retrieved. Unknown IDs are dropped and flagged as a warning.',
    Visual: CitationDemoVisual,
  },
  {
    title: 'Content gaps are an object',
    body: 'An ungrounded question writes a Coverage gap Episode. The Ops Assistant reads gaps beside the catalog and FAQs, so the content team fixes them from the same UI.',
    Visual: GapDemoVisual,
  },
  {
    title: 'Append-only memory',
    body: 'Nothing is mutated in place. Updating a product or resolving a gap appends a new Episode with the same sourceId, so facts supersede instead of editing history.',
    Visual: AppendOnlyVisual,
  },
]

function WhyGridSection() {
  return (
    <Section>
      <div className="mb-12 flex flex-wrap items-end justify-between gap-4 md:mb-16">
        <Heading
          id="checkable-claims"
          className="max-w-xl font-heading text-4xl font-bold leading-[0.98] tracking-[-0.03em] text-theme-primary md:text-[48px]"
        >
          Built So Every{' '}
          <span className="text-gradient-brand">Claim Is Checkable</span>
        </Heading>

        <a href="#developers" className="text-sm font-semibold text-accent hover:text-accent-light">
          Jump to the API &rarr;
        </a>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {WHY_CARDS.map((card, index) => {
          const Visual = card.Visual
          return (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-[2rem] border border-theme-border bg-surface-2/35 p-7 transition duration-300 hover:-translate-y-1 hover:border-accent/25 hover:bg-surface-2/55 sm:p-8"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-accent/[0.07] blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />

              <h3 className="relative font-heading text-xl font-bold leading-tight tracking-[-0.01em] text-theme-primary">
                {card.title}
              </h3>

              <p className="relative mt-2.5 text-[14.5px] leading-7 text-theme-secondary">
                {card.body}
              </p>

              <div className="relative mt-5">
                <Visual />
              </div>
            </motion.article>
          )
        })}
      </div>
    </Section>
  )
}

/* ─── One pipeline, Episode to citation ──────────────────────────────────── */

const PIPELINE_CHIPS = [
  { label: 'Episode' },
  { label: 'compileSubject' },
  { label: 'getContext' },
  { label: 'grounded completion', active: true },
  { label: 'resolveCitations' },
]

function PipelineChips() {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {PIPELINE_CHIPS.map((chip, i) => (
        <Fragment key={chip.label}>
          {i > 0 && (
            <span className="text-theme-muted" aria-hidden="true">
              &rarr;
            </span>
          )}
          <span
            className={`rounded-lg border px-3.5 py-2 font-mono text-[12.5px] font-medium ${
              chip.active
                ? 'border-accent bg-accent text-white shadow-[0_10px_24px_-12px_rgba(99,102,241,0.5)]'
                : 'border-theme-border bg-surface-1 text-theme-primary'
            }`}
          >
            {chip.label}
          </span>
        </Fragment>
      ))}
    </div>
  )
}

interface FlowItem {
  title: string
  body: string
  accent?: boolean
  strong?: boolean
  code?: boolean
}

function ArchitectureFlow() {
  const columns: { heading: string; items: FlowItem[] }[] = [
    {
      heading: 'Source content',
      items: [
        { title: 'catalog.json', body: 'Product data' },
        { title: 'service-content.json', body: 'FAQs and care guides' },
      ],
    },
    {
      heading: 'Ingestion',
      items: [{ title: 'ingest job', body: 'Dedups by content hash, appends Episodes', accent: true }],
    },
    {
      heading: 'StatewaveStore',
      items: [{ title: 'Episodes → compileSubject', body: 'Newest Episode per sourceId, persisted to db.json', strong: true }],
    },
    {
      heading: 'Subjects → Assistants',
      items: [
        { title: 'Shopper Assistant', body: 'POST /api/chat' },
        { title: 'Ops Assistant', body: 'POST /api/ops/chat' },
        { title: 'completionFn', body: 'LiteLLM · OpenRouter · offline', code: true },
      ],
    },
  ]

  return (
    <div className="rounded-[1.75rem] border border-theme-border bg-surface-1 p-6 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-stretch gap-3">
        {columns.map((col, i) => (
          <Fragment key={col.heading}>
            {i > 0 && (
              <div className="hidden items-center text-theme-muted md:flex">
                &rarr;
              </div>
            )}
            <div className="flex min-w-[160px] flex-1 flex-col gap-2.5">
              <p className="text-center text-[11px] font-semibold text-theme-muted">{col.heading}</p>
              {col.items.map((item) => (
                <div
                  key={item.title}
                  className={`rounded-xl border p-3.5 ${
                    item.code
                      ? 'border-theme-border-hover bg-[#0a1120]'
                      : item.strong
                        ? 'border-accent/35 bg-surface-3'
                        : item.accent
                          ? 'border-accent/40 bg-accent/[0.06]'
                          : 'border-theme-border bg-surface-2'
                  }`}
                >
                  <p className={`font-mono text-[12.5px] font-semibold ${item.code ? 'text-brand-300' : 'text-theme-primary'}`}>
                    {item.title}
                  </p>
                  <p className={`mt-1 text-[11px] ${item.code ? 'text-theme-muted/80' : 'text-theme-muted'}`}>
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </Fragment>
        ))}
      </div>

      <div className="mt-5 flex items-start gap-3.5 rounded-2xl border border-theme-border bg-gradient-to-r from-accent/[0.06] to-brand-500/[0.06] p-5">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-accent/40 text-accent">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h5M20 20v-5h-5M4 9a8 8 0 0114-5.3M20 15a8 8 0 01-14 5.3" />
          </svg>
        </span>
        <p className="text-[13.5px] leading-relaxed text-theme-secondary">
          <b className="text-theme-primary">The closed loop.</b> A question the
          shopper assistant can&apos;t ground becomes an{' '}
          <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 font-mono text-[12px] text-amber-500">
            ops:coverage-gaps
          </span>{' '}
          Episode the Ops Assistant reads as evidence. Resolving it appends
          another Episode with the same{' '}
          <span className="rounded-md bg-accent/10 px-1.5 py-0.5 font-mono text-[12px] text-accent">
            sourceId
          </span>
          , superseding the gap instead of editing history.
        </p>
      </div>
    </div>
  )
}

const TURN_STEPS = [
  { n: 1, label: 'Shopper → Widget', detail: '"Do you have anything for full shade?"', mono: false },
  { n: 2, label: 'Widget → Route', detail: 'POST /api/chat  { sessionId, message }', mono: true },
  { n: 3, label: 'Route → Store', detail: 'getContext(readSubjects, query) → evidence + IDs', mono: true },
  { n: 4, label: 'Route → completionFn', detail: 'system + evidence + history → { answer, grounded, citationIds }', mono: true, code: true },
  { n: 5, label: 'Route → Store', detail: "Drops IDs not in evidence, runs resolveCitations(), appends the turn", mono: false },
]

function TurnSequence() {
  return (
    <div className="mt-5 rounded-[1.75rem] border border-theme-border bg-surface-1 shadow-sm">
      <div className="border-b border-theme-border px-6 py-4">
        <span className="font-heading text-[15px] font-bold text-theme-primary">One chat turn, end to end</span>{' '}
        <span className="text-[12.5px] text-theme-muted">&nbsp; &quot;Do you have anything for full shade?&quot;</span>
      </div>

      <div className="flex flex-col gap-2.5 p-6">
        {TURN_STEPS.map((step) => (
          <div key={step.n} className="grid grid-cols-1 gap-2 sm:grid-cols-[180px_1fr] sm:gap-4">
            <div className="flex items-center gap-2.5 text-[12.5px] font-semibold text-theme-muted">
              <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-surface-3 text-[11px] font-semibold text-theme-secondary">
                {step.n}
              </span>
              {step.label}
            </div>
            <div
              className={`rounded-xl px-3.5 py-2.5 text-[12.5px] ${
                step.code
                  ? 'bg-[#0a1120] font-mono text-brand-200'
                  : `border border-theme-border bg-surface-2/70 ${step.mono ? 'font-mono text-theme-secondary' : 'text-theme-primary'}`
              }`}
            >
              {step.detail}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ArchitectureSection() {
  return (
    <Section id="how" className="relative overflow-hidden bg-surface-1">
      <div aria-hidden="true" className="section-glow-full" />

      <div className="relative">
        <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
          How It Works
        </p>

        <Heading
          id="one-pipeline"
          className="max-w-3xl font-heading text-4xl font-bold leading-[0.98] tracking-[-0.03em] text-theme-primary md:text-[48px]"
        >
          One Pipeline,{' '}
          <span className="text-gradient-brand">Episode to Citation</span>
        </Heading>

        <p className="mt-6 max-w-2xl text-[17px] leading-[1.6] text-theme-secondary/85">
          Source content flows through ingestion into an append-only store,
          compiles into Subjects, and is read by both assistants over the
          same completion path.
        </p>

        <div className="mt-10 overflow-x-auto pb-2">
          <PipelineChips />
        </div>

        <div className="mt-6">
          <ArchitectureFlow />
        </div>

        <TurnSequence />
      </div>
    </Section>
  )
}

/* ─── The content team works the gaps ────────────────────────────────────── */

const OPS_BULLETS = [
  { color: 'bg-amber-500', text: 'Open gaps carry the unanswered question verbatim' },
  { color: 'bg-accent', text: 'Resolved gaps supersede, never overwrite' },
  { color: 'bg-brand-500', text: <>Read over <span className="font-mono text-theme-primary">GET /api/ops/gaps</span></> },
]

const OPS_GAPS = [
  { status: 'OPEN', id: 'GAP-2381', meta: '2 shoppers', text: 'Which planters are safe for a rooftop with a weight limit?' },
  { status: 'OPEN', id: 'GAP-2379', meta: '1 shopper', text: 'Do you ship bare-root roses in winter?' },
  { status: 'RESOLVED', id: 'GAP-2361', meta: '+ Episode', text: "What's your return window on live plants?" },
]

function OpsConsoleMockup() {
  const tabs = ['Overview', 'Subjects', 'Coverage gaps', 'Conversations', 'Catalog']

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -inset-6 rounded-[3rem] blur-[80px]"
        style={{ background: 'var(--viz-hero-glow-primary)' }}
        aria-hidden="true"
      />

      <div
        className="relative z-10 overflow-hidden rounded-2xl border"
        style={{ borderColor: 'var(--viz-border-strong)', background: 'var(--viz-shell)', boxShadow: 'var(--viz-shell-shadow)' }}
      >
        <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: 'var(--viz-border)', background: 'var(--viz-shell-header)' }}>
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          </div>
          <span className="text-[12px]" style={{ color: 'var(--viz-text-muted)' }}>
            Statewave Ops &middot; Coverage gaps
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-semibold text-amber-400">
            3 open
          </span>
        </div>

        <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[132px_1fr]">
          <div className="flex flex-col gap-1 border-r p-3" style={{ borderColor: 'var(--viz-border)', background: 'var(--viz-shell-side)' }}>
            {tabs.map((tab) => (
              <div
                key={tab}
                className={`rounded-lg px-2.5 py-2 text-[12px] ${tab === 'Coverage gaps' ? 'font-semibold' : ''}`}
                style={{
                  color: tab === 'Coverage gaps' ? 'var(--viz-text)' : 'var(--viz-text-muted)',
                  background: tab === 'Coverage gaps' ? 'var(--viz-card-3)' : 'transparent',
                }}
              >
                {tab}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2.5 p-3.5">
            {OPS_GAPS.map((gap) => (
              <div
                key={gap.id}
                className={`rounded-xl border p-3.5 ${gap.status === 'OPEN' ? 'border-amber-500/30' : 'border-accent/30 opacity-80'}`}
                style={{ background: 'var(--viz-card)' }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${gap.status === 'OPEN' ? 'bg-amber-500/15 text-amber-400' : 'bg-accent/15 text-accent'}`}
                  >
                    {gap.status}
                  </span>
                  <span className="font-mono text-[11px]" style={{ color: 'var(--viz-text-muted)' }}>{gap.id}</span>
                  <span className={`ml-auto text-[11px] ${gap.status === 'OPEN' ? '' : 'font-mono text-accent'}`} style={gap.status === 'OPEN' ? { color: 'var(--viz-text-muted)' } : undefined}>
                    {gap.meta}
                  </span>
                </div>
                <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: 'var(--viz-text)' }}>
                  &quot;{gap.text}&quot;
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function OpsConsoleSection() {
  return (
    <Section>
      <div className="grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            Ops Console
          </p>

          <Heading
            id="content-team"
            className="max-w-md font-heading text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-theme-primary md:text-[44px]"
          >
            The Content Team{' '}
            <span className="text-gradient-brand">Works the Gaps</span>
          </Heading>

          <p className="mt-6 max-w-md text-[16px] leading-[1.65] text-theme-secondary/85">
            Every ungrounded question shows up in the Ops console as an open
            coverage gap, with the shopper&apos;s exact wording. Resolving one
            appends an Episode under the same sourceId, so the next shopper
            gets a grounded answer.
          </p>

          <ul className="mt-7 space-y-3.5">
            {OPS_BULLETS.map((bullet, i) => (
              <li key={i} className="flex items-center gap-3 text-[14.5px] text-theme-secondary">
                <span className={`h-2 w-2 rounded-sm ${bullet.color}`} />
                {bullet.text}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <OpsConsoleMockup />
        </motion.div>
      </div>
    </Section>
  )
}

/* ─── Subjects table ──────────────────────────────────────────────────────── */

const SUBJECTS = [
  { subject: 'shop:products', writtenBy: <>ingestion job (<span className="font-mono text-[12px]">catalog.json</span>)</>, readBy: 'shopper + ops assistants', tone: 'accent' },
  { subject: 'faq:service', writtenBy: <>ingestion job (<span className="font-mono text-[12px]">service-content.json</span>)</>, readBy: 'shopper + ops assistants', tone: 'accent' },
  { subject: 'content:guides', writtenBy: <>ingestion job (<span className="font-mono text-[12px]">service-content.json</span>, guide docs)</>, readBy: 'shopper assistant', tone: 'accent' },
  { subject: 'ops:coverage-gaps', writtenBy: 'shopper route, on an ungrounded answer', readBy: <>ops assistant, <span className="font-mono text-[12px]">/api/ops/gaps</span></>, tone: 'amber' },
  { subject: 'shop:conversations', writtenBy: 'shopper route, every turn', readBy: 'audit trail', tone: 'neutral' },
  { subject: 'ops:conversations', writtenBy: 'ops route, every turn', readBy: 'audit trail', tone: 'neutral' },
]

function SubjectsSection() {
  return (
    <Section className="bg-surface-1">
      <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
        Data Model
      </p>

      <Heading
        id="subjects"
        className="font-heading text-4xl font-bold leading-[0.98] tracking-[-0.03em] text-theme-primary md:text-[44px]"
      >
        Subjects
      </Heading>

      <p className="mt-4 max-w-2xl text-[16px] leading-[1.6] text-theme-secondary/85">
        The compiled read models both assistants query. Each is written by
        exactly one path and read where it makes sense.
      </p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-theme-border shadow-sm">
        <table className="w-full min-w-[600px] border-collapse text-[13.5px]">
          <thead>
            <tr className="bg-surface-2">
              <th className="border-b border-theme-border px-5 py-3.5 text-left text-[12px] font-semibold text-theme-muted">Subject</th>
              <th className="border-b border-theme-border px-5 py-3.5 text-left text-[12px] font-semibold text-theme-muted">Written by</th>
              <th className="border-b border-theme-border px-5 py-3.5 text-left text-[12px] font-semibold text-theme-muted">Read by</th>
            </tr>
          </thead>
          <tbody>
            {SUBJECTS.map((row, i) => (
              <tr key={row.subject} className={i < SUBJECTS.length - 1 ? 'border-b border-theme-border' : ''}>
                <td className="px-5 py-3.5">
                  <span className={`font-mono text-[12.5px] font-medium ${row.tone === 'amber' ? 'text-amber-500' : row.tone === 'accent' ? 'text-accent' : 'text-theme-primary'}`}>
                    {row.subject}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-theme-secondary">{row.writtenBy}</td>
                <td className="px-5 py-3.5 text-theme-secondary">{row.readBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

/* ─── A chat turn on the wire ─────────────────────────────────────────────── */

const REQUEST_JSON = `{
  "sessionId": "optional, generated if omitted",
  "message": "Do you have anything for full shade?",
  "readSubjects": ["optional override of the default subjects"],
  "retrievalConfig": { "globalMaxTokens": 2000 }
}`

const RESPONSE_JSON = `{
  "answer": "...",
  "grounded": true,
  "citations": [
    { "evidenceId": "S1", "subject": "shop:products",
      "sourceId": "PLT-001", "label": "Hosta 'Blue Mouse Ears'" }
  ],
  "warnings": [],
  "evidenceCount": 4
}`

function ApiCodeBlock({ label, tag, code }: { label: string; tag: string; code: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-theme-border bg-[#0a1120] shadow-lg">
      <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-3.5">
        <span className="rounded-md bg-accent/20 px-2 py-0.5 font-mono text-[11px] font-semibold text-brand-300">
          {tag}
        </span>
        <span className="font-mono text-[12px] text-theme-muted/90">{label}</span>
        <div className="ml-auto">
          <CodeCopyButton code={code} label={`Copy ${label} example`} iconOnly />
        </div>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-[1.85] text-theme-muted/90">{code}</pre>
    </div>
  )
}

const API_ENDPOINTS = [
  { method: 'POST', path: '/api/chat', desc: 'Shopper-facing grounded chat turn' },
  { method: 'POST', path: '/api/ops/chat', desc: 'Ops chat turn, reads coverage gaps too' },
  { method: 'GET', path: '/api/ops/gaps', desc: 'Open and resolved coverage gaps' },
  { method: 'POST', path: '/api/ops/gaps/:sourceId/resolve', desc: 'Marks a coverage gap resolved' },
  { method: 'GET', path: '/healthz', desc: 'Liveness; reports the active completion mode' },
]

function ApiSection() {
  return (
    <Section id="developers">
      <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
        Developer API
      </p>

      <Heading
        id="chat-turn-wire"
        className="font-heading text-4xl font-bold leading-[0.98] tracking-[-0.03em] text-theme-primary md:text-[44px]"
      >
        A Chat Turn on the Wire
      </Heading>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <ApiCodeBlock label="/api/chat &middot; request" tag="POST" code={REQUEST_JSON} />
        <ApiCodeBlock label="application/json &middot; response" tag="200" code={RESPONSE_JSON} />
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-theme-border border-l-[3px] border-l-accent bg-surface-2 p-4">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[11px] text-accent">
          i
        </span>
        <p className="text-[13.5px] leading-relaxed text-theme-secondary">
          <span className="font-mono text-theme-primary">grounded</span> is
          only <span className="font-mono text-accent">true</span> when the
          model both claims groundedness and at least one citation survives
          validation against the retrieved evidence.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {API_ENDPOINTS.map((ep) => (
          <div
            key={ep.path}
            className="flex items-center gap-3 rounded-xl border border-theme-border bg-surface-1 p-4 shadow-sm transition-colors hover:border-theme-border-hover"
          >
            <span
              className={`rounded-md px-2 py-1 font-mono text-[11px] font-semibold ${
                ep.method === 'GET' ? 'bg-brand-500/10 text-brand-400' : 'bg-accent/10 text-accent'
              }`}
            >
              {ep.method}
            </span>
            <div className="min-w-0">
              <p className="truncate font-mono text-[12.5px] text-theme-primary">{ep.path}</p>
              <p className="mt-0.5 text-[12px] text-theme-muted">{ep.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

/* ─── Run the whole loop in two commands ─────────────────────────────────── */

type OS = 'macos' | 'linux' | 'windows'

const OS_META: Record<OS, { title: string; note: string; prompt: string; label: string }> = {
  macos: { title: 'greenhaven zsh', note: '# Requires Node.js 18+', prompt: '$', label: 'macOS' },
  linux: { title: 'greenhaven bash', note: '# Requires Node.js 18+', prompt: '$', label: 'Linux' },
  windows: { title: 'greenhaven powershell', note: '# Requires Node.js 18+ (PowerShell)', prompt: 'PS>', label: 'Windows' },
}

function RunItTerminal() {
  const [os, setOs] = useState<OS>('macos')
  const meta = OS_META[os]

  return (
    <div className="overflow-hidden rounded-2xl border border-theme-border bg-[#0a1120] shadow-lg">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-0 h-11">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
        </div>
        <span className="ml-1 font-mono text-[11.5px] text-theme-muted/80">{meta.title}</span>
        <div className="ml-auto flex gap-1">
          {(Object.keys(OS_META) as OS[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setOs(key)}
              className={`rounded-md px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors ${
                os === key ? 'bg-white/10 text-theme-primary' : 'text-theme-muted/70 hover:text-theme-muted'
              }`}
            >
              {OS_META[key].label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 font-mono text-[13px] leading-[1.95] text-theme-muted/90">
        <div className="mb-2 text-[11.5px] text-theme-muted/60">{meta.note}</div>
        <div><span className="text-brand-300">{meta.prompt}</span> npm install</div>
        <div><span className="text-brand-300">{meta.prompt}</span> npm run dev</div>
        <div className="h-2.5" />
        <div><span className="text-theme-muted/50">&rarr;</span> Storefront &nbsp;&nbsp;<span className="text-emerald-400">http://localhost:4000/</span></div>
        <div><span className="text-theme-muted/50">&rarr;</span> Ops console&nbsp; <span className="text-emerald-400">http://localhost:4000/ops.html</span></div>
        <div><span className="text-theme-muted/50">&rarr;</span> completion&nbsp;&nbsp; offline-rule-based <span className="text-brand-300">(no API key)</span></div>
      </div>
    </div>
  )
}

function RunItSection() {
  return (
    <Section id="run">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-theme-border bg-surface-1 shadow-lg">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 130% at 8% 0%, rgba(99,102,241,.06), transparent 56%), radial-gradient(52% 130% at 98% 100%, rgba(2,132,199,.05), transparent 58%)',
          }}
          aria-hidden="true"
        />

        <div className="relative grid gap-9 p-8 sm:p-10 md:grid-cols-2 md:items-center lg:p-14">
          <div>
            <h2 className="max-w-sm font-heading text-4xl font-bold leading-[1.03] tracking-[-0.03em] text-theme-primary md:text-[44px]">
              Run the Whole Loop in Two Commands
            </h2>

            <p className="mt-4 max-w-md text-[16px] leading-[1.6] text-theme-secondary/85">
              Boots with a deterministic offline responder, so grounding,
              citations, and the coverage-gap loop all work with zero setup.
              Point it at any OpenAI-compatible gateway for real generated
              answers.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button href={REPO_URL} variant="primary" size="lg">
                View on GitHub
              </Button>

              <Button href={`${REPO_URL}#readme`} variant="secondary" size="lg">
                Getting started docs
              </Button>
            </div>
          </div>

          <RunItTerminal />
        </div>
      </div>
    </Section>
  )
}

/* ─── Closing CTA ─────────────────────────────────────────────────────────── */

function CTASection() {
  return (
    <Section>
      <div className="cta-card relative overflow-hidden rounded-[2.5rem] border border-brand-500/25 bg-surface-1/55 px-6 py-20 text-center">
        <div className="cta-card-glow absolute inset-0" aria-hidden="true" />
        <div
          className="absolute inset-x-20 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/60 to-transparent"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            START BUILDING
          </div>

          <Heading
            id="ground-your-assistant"
            className="font-heading text-4xl md:text-[64px] font-bold leading-[1.02] tracking-[-0.04em] text-theme-primary"
          >
            Ground your shopping{' '}
            <span className="text-gradient-brand">assistant</span>
          </Heading>

          <p className="mx-auto mt-6 max-w-2xl text-[20px] leading-[1.65] text-theme-secondary/85">
            Every answer traced to evidence, every gap filed automatically.
            Clone the repo and see the whole loop run offline in minutes.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button href={REPO_URL} size="lg">
              View on GitHub

              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>

            <Button to="/use-cases" variant="secondary" size="lg">
              Explore use cases
            </Button>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export function GroundedShopAssistantPage() {
  usePageSEO({
    breadcrumb: false,
    jsonLd: [
      breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Use Cases', path: '/use-cases' },
        { name: 'Grounded Shop Assistant', path: '/use-cases/grounded-shop-assistant' },
      ]),
    ],
  })

  return (
    <div className="bg-surface-0">
      <HeroSection />
      <TwoOutcomesSection />
      <WhyGridSection />
      <ArchitectureSection />
      <OpsConsoleSection />
      <SubjectsSection />
      <ApiSection />
      <RunItSection />
      <CTASection />
    </div>
  )
}
