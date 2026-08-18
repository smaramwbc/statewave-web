import { motion } from 'framer-motion'
import { Section } from '../components/Section'
import { Heading } from '../components/Heading'
import { Button } from '../components/Button'
import { CodeCopyButton } from '../components/CodeCopyButton'
import { usePageSEO } from '../lib/seo'
import { faqPageJsonLd } from '../lib/seo-meta'

/*
 * /vs/zep: the third sibling of /vs/mem0 and /vs/letta, using the same section order,
 * same components, same tokens. The argument here is about the *shape* of
 * what comes back: Zep hands the agent an opaque Context Block string built
 * from a knowledge-graph traversal; Statewave hands back a ranked bundle of
 * typed rows with per-memory metadata and provenance.
 *
 * One correction from the source Claude Design mock, verified against Zep's
 * current docs (help.getzep.com, github.com/getzep/zep, getzep.com/pricing)
 * on 2026-08-18: Zep discontinued its self-hosted Community Edition in 2025.
 * It is Cloud / BYOK / BYOC only now; there is no self-hosted product to
 * compare against Statewave's self-hosted-only model. The ops-comparison
 * row, the "reach for Zep when" callout, and one FAQ answer are written
 * against that corrected fact rather than the mock's "hosted Cloud plus
 * self-hosted Community" framing. The typed-memory kind-priority bars use
 * raw_episode=3 (not the mock's artifact_ref=4) to match ProductPage's
 * scoring model and /vs/letta's already-shipped figures.
 *
 * Mockups use the `--viz-*` tokens from src/index.css so their neutrals flip
 * with the light/dark theme, same convention as StatewaveVsMem0Page and
 * StatewaveVsLettaPage.
 */

const GITHUB_URL = 'https://github.com/smaramwbc/statewave'
const DOCS_URL = 'https://github.com/smaramwbc/statewave-docs'
const BENCHMARKS_REPO_URL = 'https://github.com/smaramwbc/statewave-memory-benchmarks'
const ZEP_CONCEPTS_URL = 'https://help.getzep.com/concepts'

function ZepBadge({ size = 22 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-md font-mono font-semibold text-theme-muted"
      style={{ width: size, height: size, background: 'var(--viz-card-3)', fontSize: size * 0.45 }}
    >
      z
    </span>
  )
}

function StatewaveBadge({ size = 22 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-md font-heading font-extrabold text-white"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-accent))',
        fontSize: size * 0.5,
      }}
    >
      S
    </span>
  )
}

/* ─── Hero ───────────────────────────────────────────────────────────────── */

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(820px 440px at 86% -6%, rgba(56,189,248,.06) 0%, rgba(56,189,248,0) 56%), radial-gradient(780px 440px at 2% 6%, rgba(122,92,255,.06) 0%, rgba(122,92,255,0) 54%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1200px] px-5 pt-24 pb-10 text-center sm:px-6 sm:pt-28 md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2.5 rounded-full border border-theme-border bg-surface-1 py-1.5 pl-1.5 pr-3.5 shadow-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/[0.14] px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="font-heading text-[11px] font-semibold text-accent">Memory runtime</span>
            </span>
            <span className="text-[12.5px] font-medium text-theme-secondary">
              Open-source &middot; Apache 2.0 &middot; self-hosted
            </span>
          </div>

          <h1 className="mx-auto mt-7 font-heading text-[clamp(1.75rem,4.2vw,2.9rem)] font-extrabold leading-[1.15] tracking-[-0.03em] text-theme-primary">
            <span className="block text-theme-muted">Zep returns a blob.</span>
            <span className="block">Statewave returns a receipt.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-[660px] text-[18px] leading-[1.6] text-theme-secondary">
            Zep models memory as a knowledge graph of entities and edges and returns retrieval as an
            optimized Context Block string. Statewave compiles typed, provenance-traced memories and
            returns a ranked bundle with explicit metadata per row: kind, confidence, validity, and
            the source episodes it came from.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button to="#compare" variant="primary" size="lg">
              See the comparison
              <ArrowIcon />
            </Button>
            <Button href={GITHUB_URL} variant="secondary" size="lg">
              <GitHubIcon />
              View on GitHub
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.6 }}
          className="mt-14"
        >
          <HeroCompareVisual />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8"
        >
          <HeroStatStrip />
        </motion.div>
      </div>
    </section>
  )
}

function ArrowIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.66.5 12.03c0 5.1 3.29 9.42 7.86 10.96.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.07 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.6.24 2.78.12 3.07.74.8 1.18 1.83 1.18 3.09 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.07.78 2.15 0 1.55-.01 2.8-.01 3.18 0 .31.2.67.8.56C20.21 21.44 23.5 17.13 23.5 12.03 23.5 5.66 18.35.5 12 .5Z" />
    </svg>
  )
}

/**
 * The page's central visual claim, right up top: the same call, two shapes.
 * Zep's card is a single opaque string; Statewave's is a list of typed rows
 * carrying their own confidence and provenance. Two panels instead of the
 * single bundle panel /vs/letta and /vs/mem0 use in the hero, because unlike
 * those pages the argument here *is* a shape comparison.
 */
function HeroCompareVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[820px]">
      <div
        className="pointer-events-none absolute inset-x-[8%] -top-6 bottom-6 rounded-[3rem] blur-[90px]"
        style={{ background: 'var(--viz-hero-glow-primary)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 grid gap-4 text-left sm:grid-cols-2">
        {/* zep: opaque block */}
        <div
          className="overflow-hidden rounded-2xl border"
          style={{ borderColor: 'var(--viz-border)', background: 'var(--viz-shell)', boxShadow: 'var(--viz-shell-shadow)' }}
        >
          <div
            className="flex items-center gap-2.5 border-b px-5 py-4"
            style={{ borderColor: 'var(--viz-border)', background: 'var(--viz-shell-header)' }}
          >
            <ZepBadge size={28} />
            <span className="font-heading text-sm font-bold" style={{ color: 'var(--viz-text-2)' }}>thread.get_user_context</span>
            <span className="ml-auto font-mono text-[10px]" style={{ color: 'var(--viz-amber)' }}>Context Block</span>
          </div>
          <div className="flex flex-col gap-2.5 p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.08em]" style={{ color: 'var(--viz-text-muted)' }}>
              optimized string
            </div>
            <div
              className="rounded-xl border px-3.5 py-3 text-[12.5px] leading-[1.7]"
              style={{ borderColor: 'var(--viz-border)', background: 'var(--viz-card)', color: 'var(--viz-text-muted)' }}
            >
              Alice runs dispatch automation at Northwind. She prefers email over calls. Recently
              moved offices. Works with Acme on the BluePeak account&hellip;
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--viz-amber)' }} />
              <span className="font-mono text-[10.5px]" style={{ color: 'var(--viz-text-muted)' }}>
                one blob &middot; no per-fact metadata
              </span>
            </div>
          </div>
        </div>

        {/* statewave: bundle */}
        <div
          className="overflow-hidden rounded-2xl border"
          style={{ borderColor: 'var(--viz-border-strong)', background: 'var(--viz-shell)', boxShadow: 'var(--viz-shell-shadow)' }}
        >
          <div
            className="flex items-center gap-2.5 border-b px-5 py-4"
            style={{ borderColor: 'var(--viz-border)', background: 'var(--viz-shell-header)' }}
          >
            <StatewaveBadge size={28} />
            <span className="font-heading text-sm font-bold" style={{ color: 'var(--viz-text)' }}>get_context</span>
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-accent/[0.16] px-2.5 py-1 text-[10px] font-semibold text-accent">
              600 budget
            </span>
          </div>
          <div className="flex flex-col gap-2.5 p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.08em]" style={{ color: 'var(--viz-text-muted)' }}>
              ranked bundle &middot; per-row metadata
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border border-accent/30 bg-accent/10 px-3.5 py-2.5">
              <span className="rounded-md bg-[var(--viz-card-3)] px-2 py-1 font-mono text-[9.5px] font-semibold text-accent">profile_fact</span>
              <span className="flex-1 text-[11.5px]" style={{ color: 'var(--viz-text)' }}>runs dispatch &middot; Northwind</span>
              <span className="font-mono text-[9.5px]" style={{ color: 'var(--viz-text-muted)' }}>[ep_4]</span>
            </div>
            <div
              className="flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5"
              style={{ borderColor: 'var(--viz-border)', background: 'var(--viz-card)' }}
            >
              <span className="rounded-md bg-[var(--viz-card-3)] px-2 py-1 font-mono text-[9.5px] font-semibold" style={{ color: 'var(--viz-text-2)' }}>profile_fact</span>
              <span className="flex-1 text-[11.5px]" style={{ color: 'var(--viz-text-2)' }}>prefers email &middot; conf 0.9</span>
              <span className="font-mono text-[9.5px]" style={{ color: 'var(--viz-text-muted)' }}>[ep_9]</span>
            </div>
            <div
              className="mt-0.5 flex items-center gap-2 rounded-xl border px-3 py-2.5"
              style={{ borderColor: 'var(--viz-border)', background: 'var(--viz-code-bg)' }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              <span className="font-mono text-[10px]" style={{ color: 'var(--viz-text-2)' }}>provenance &middot; fact_ids &rarr; episodes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function HeroStatStrip() {
  const stats = [
    { value: '4', label: 'typed memory kinds' },
    { value: String(SIGNALS.length), label: 'ranking signals, deterministic' },
    { value: LOCOMO.value, label: `LoCoMo, ${LOCOMO.n}` },
    { value: '1', label: 'store: Postgres, no graph DB' },
  ]

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-2xl border border-theme-border bg-surface-1/70 px-6 py-4 shadow-sm backdrop-blur-sm">
        {stats.map((stat, i) => (
          <div key={stat.label} className="flex items-center gap-x-8">
            {i > 0 && <span className="hidden h-5 w-px bg-theme-border sm:block" aria-hidden="true" />}
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-2xl font-extrabold tracking-[-0.02em] text-theme-primary">{stat.value}</span>
              <span className="text-[13px] text-theme-muted">{stat.label}</span>
            </div>
          </div>
        ))}
        <span className="hidden h-5 w-px bg-theme-border sm:block" aria-hidden="true" />
        <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="text-[12px] text-theme-secondary">Postgres-only, runs offline</span>
        </div>
      </div>
    </div>
  )
}

/* ─── The gap ────────────────────────────────────────────────────────────── */

const ZEP_METHODS = [
  { method: 'graph.search', note: 'nodes & edges, traverse yourself' },
  { method: 'get_user_context', note: '→ Context Block (opaque string)' },
]

/* Same four kinds and scores /vs/letta shows: ProductPage's scoring model
 * (profile_fact=10, procedure=8, episode_summary=5, raw_episode=3), unchanged
 * by which competitor this page argues against. The source Claude Design mock
 * used artifact_ref=4 for the fourth bar; that doesn't match the shipped
 * scoring model, so this page uses raw_episode=3 instead. */
const KIND_PRIORITY = [
  { kind: 'profile_fact', pct: 100, score: 10 },
  { kind: 'procedure', pct: 80, score: 8 },
  { kind: 'episode_summary', pct: 50, score: 5 },
  { kind: 'raw_episode', pct: 30, score: 3 },
]

function GapSection() {
  return (
    <Section id="gap" className="relative overflow-hidden bg-surface-1">
      <div aria-hidden="true" className="section-glow-full section-glow--soft" />

      <div className="relative">
        <Heading
          id="gap-heading"
          className="max-w-3xl font-heading text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-theme-primary md:text-[48px]"
        >
          A knowledge graph, or a typed-memory runtime
        </Heading>

        <p className="mt-6 max-w-2xl text-[17px] leading-[1.6] text-theme-secondary/90">
          Zep stores memory as a graph: nodes are entities, edges are facts with valid and invalid
          timestamps, and the graph updates dynamically as new data arrives. Retrieval traverses that
          graph and returns an optimized Context Block. Statewave records each event
          as an immutable episode, compiles those into typed memories with confidence and validity,
          and assembles a ranked bundle the same way on every call.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* zep side */}
          <div className="flex flex-col">
            <div className="flex flex-1 flex-col gap-5 rounded-[1.75rem] border border-theme-border bg-surface-2/40 p-7 shadow-sm sm:p-8">
              <div className="flex items-center gap-2.5">
                <ZepBadge />
                <span className="font-heading text-base font-bold text-theme-primary">Zep &middot; knowledge graph</span>
              </div>

              <div className="rounded-xl border p-2" style={{ borderColor: 'var(--viz-border)', background: 'var(--viz-card)' }}>
                <svg viewBox="0 0 300 150" className="block h-auto w-full" aria-hidden="true">
                  <line x1="72" y1="82" x2="212" y2="42" stroke="var(--viz-border-strong)" strokeWidth="1.5" />
                  <line x1="72" y1="82" x2="212" y2="118" stroke="var(--viz-border-strong)" strokeWidth="1.5" strokeDasharray="4 4" />
                  <line x1="212" y1="42" x2="212" y2="118" stroke="var(--viz-border-strong)" strokeWidth="1.5" />
                  <circle cx="72" cy="82" r="26" fill="var(--viz-card-3)" stroke="var(--color-accent)" strokeWidth="1.5" />
                  <text x="72" y="86" textAnchor="middle" className="font-mono" style={{ fontSize: 11, fill: 'var(--viz-text-2)' }}>Alice</text>
                  <circle cx="212" cy="42" r="24" fill="var(--viz-card-3)" stroke="var(--color-brand-500)" strokeWidth="1.5" />
                  <text x="212" y="46" textAnchor="middle" className="font-mono" style={{ fontSize: 10, fill: 'var(--viz-text-2)' }}>Acme</text>
                  <circle cx="212" cy="118" r="24" fill="var(--viz-card-3)" stroke="var(--viz-text-muted)" strokeWidth="1.5" />
                  <text x="212" y="122" textAnchor="middle" className="font-mono" style={{ fontSize: 9, fill: 'var(--viz-text-muted)' }}>BluePeak</text>
                  <text x="132" y="54" textAnchor="middle" className="font-mono" style={{ fontSize: 8.5, fill: 'var(--color-accent)' }}>works_at</text>
                  <text x="130" y="112" textAnchor="middle" className="font-mono" style={{ fontSize: 8.5, fill: 'var(--viz-text-muted)' }}>worked_at &#10005;</text>
                </svg>
              </div>

              <div className="flex flex-col gap-2.5">
                {ZEP_METHODS.map((row) => (
                  <div key={row.method} className="flex items-center gap-3 rounded-lg border border-theme-border bg-surface-1 px-3.5 py-3">
                    <span className="w-[132px] shrink-0 font-mono text-[12px] text-theme-secondary">{row.method}</span>
                    <span className="text-[12.5px] text-theme-muted">{row.note}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="font-heading text-lg font-bold text-theme-primary">Retrieval rides on the graph</p>
              <p className="mt-2 text-[14.5px] leading-[1.6] text-theme-muted">
                Traversal and a managed reranker compose a well-shaped Context Block. You get a blob,
                not per-fact metadata; temporal validity lives on the edges, and the graph updates
                dynamically as new data lands.
              </p>
            </div>
          </div>

          {/* statewave side */}
          <div className="flex flex-col">
            <div className="relative flex flex-1 flex-col gap-5 overflow-hidden rounded-[1.75rem] border border-accent/30 bg-surface-2/40 p-7 shadow-sm sm:p-8">
              <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-40 w-64 rounded-full bg-accent/[0.08] blur-3xl" />

              <div className="relative flex items-center gap-2.5">
                <StatewaveBadge />
                <span className="font-heading text-base font-bold text-theme-primary">Statewave &middot; Record &rarr; Compile &rarr; Context &rarr; Govern</span>
              </div>

              <div className="relative flex items-stretch gap-2">
                {[
                  { n: '01', label: 'Record', note: 'immutable episodes', active: false },
                  { n: '02', label: 'Compile', note: 'typed memories', active: false },
                  { n: '03', label: 'Context', note: 'ranked bundle', active: true },
                  { n: '04', label: 'Govern', note: 'policy + receipt', active: false },
                ].map((step) => (
                  <div
                    key={step.n}
                    className={`flex flex-1 flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center ${
                      step.active ? 'border-accent/40 bg-accent/[0.14]' : 'border-theme-border bg-surface-1'
                    }`}
                  >
                    <span className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-theme-muted">{step.n}</span>
                    <span className={`font-heading text-[13px] font-bold ${step.active ? 'text-accent' : 'text-theme-primary'}`}>{step.label}</span>
                    <span className={`text-[10.5px] ${step.active ? 'text-accent/85' : 'text-theme-muted'}`}>{step.note}</span>
                  </div>
                ))}
              </div>

              <div className="relative flex flex-col gap-2">
                <div className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-theme-muted">typed memory kinds &middot; ranking priority</div>
                {KIND_PRIORITY.map((row) => (
                  <div key={row.kind} className="flex items-center gap-2.5">
                    <span className="w-[104px] shrink-0 font-mono text-[11px] text-theme-secondary">{row.kind}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-[3px] bg-surface-1">
                      <div
                        className="h-full rounded-[3px]"
                        style={{ width: `${row.pct}%`, background: 'var(--series-statewave)' }}
                      />
                    </div>
                    <span className="w-5 text-right font-heading text-xs font-bold text-accent">{row.score}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="font-heading text-lg font-bold text-theme-primary">Assembly is deterministic and inspectable</p>
              <p className="mt-2 text-[14.5px] leading-[1.6] text-theme-secondary">
                Given the same subject, task, token budget, and point in time, the assembler returns
                the identical bundle every run. Five signals set the order: kind priority, recency,
                task relevance, temporal validity, and semantic similarity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ─── How order is decided ───────────────────────────────────────────────── */

/* Same signal ranges /vs/letta documents, from ProductPage's scoring model.
 * Semantic similarity is the hybrid retrieval stage that builds the
 * candidate set those scores are applied to, so it has a method rather than
 * a range. `SIGNALS.length` also feeds the hero stat strip. */
const SIGNALS = [
  { label: 'KIND PRIORITY', value: '3–10', note: 'typed profile facts outrank raw episodes' },
  { label: 'RECENCY', value: '0–5', note: 'linear by age, newest scores highest' },
  { label: 'TASK RELEVANCE', value: '0–8', note: 'lexical overlap with the task at hand' },
  { label: 'TEMPORAL VALIDITY', value: '−4…+3', note: 'valid facts gain +3, expired ones lose 4' },
  { label: 'SEMANTIC SIMILARITY', value: 'cosine', note: 'pgvector, with a text-search fallback' },
]

function SignalsStrip() {
  return (
    <Section className="pt-0">
      <div className="overflow-hidden rounded-[1.75rem] border border-theme-border bg-surface-1 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-theme-border bg-surface-2 px-7 py-5">
          <span className="font-heading text-base font-bold text-theme-primary">How order is decided</span>
          <span className="font-mono text-[12px] text-theme-muted">score = priority + recency + relevance + validity</span>
        </div>
        <div className="grid gap-px bg-theme-border sm:grid-cols-2 lg:grid-cols-5">
          {SIGNALS.map((s) => (
            <div key={s.label} className="bg-surface-1 p-7">
              <div className="mb-3 font-mono text-[11px] text-accent">{s.label}</div>
              <div className="font-heading text-[30px] font-extrabold tracking-[-0.03em] text-theme-primary">{s.value}</div>
              <div className="mt-1 text-[13px] leading-[1.5] text-theme-muted">{s.note}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ─── Full comparison table ──────────────────────────────────────────────── */

interface CompareRow {
  cap: string
  zp: string
  sw: string
}

const RETRIEVAL_ROWS: CompareRow[] = [
  { cap: 'What comes back', zp: 'An optimized Context Block: one string', sw: 'A ranked bundle of typed rows with per-memory metadata' },
  { cap: 'How context is selected', zp: 'Graph traversal plus a managed reranker', sw: 'Deterministic assembly, ranked to a token budget' },
  { cap: 'Custom domain modelling', zp: 'First-class entity and edge types (Pydantic-like)', sw: 'Free-form metadata JSONB; typing carried in your app' },
  { cap: 'Same query, same result', zp: 'Not advertised; traversal and reranker can drift', sw: 'Byte-identical bundle every run' },
  { cap: 'Token-bounded output', zp: 'Context Block size shaped by Zep', sw: 'Explicit max_tokens; bundle reports token_estimate' },
]

const GOVERNANCE_ROWS: CompareRow[] = [
  { cap: 'Inspectable retrieval', zp: 'Opaque string; no per-fact metadata in the response', sw: 'Explicit kind, confidence, valid_from/to per row' },
  { cap: 'Provenance', zp: 'Edge timestamps for lineage; node history in the graph', sw: 'source_episode_ids per memory; immutable episode chain' },
  { cap: 'Temporal validity', zp: 'Per relationship: edge valid_at / invalid_at', sw: 'Per memory: valid_from / valid_to windows' },
  { cap: 'Subject deletion (GDPR)', zp: 'Remove nodes and edges from the graph', sw: 'One call hard-deletes a subject’s episodes and memories' },
]

/* Deployment corrected against Zep's current docs: Community Edition
 * (self-hosted) was discontinued in 2025 (see file header note). */
const OPS_ROWS: CompareRow[] = [
  { cap: 'Memory model', zp: 'Knowledge graph: nodes plus edges (Graphiti-based)', sw: 'Typed memories (4 kinds) plus immutable episodes' },
  { cap: 'Storage', zp: 'Managed graph database under the hood; nothing to run', sw: 'Postgres and pgvector; no proprietary store' },
  { cap: 'Deployment', zp: 'Cloud, BYOK, or BYOC only; Community Edition discontinued 2025', sw: 'Self-hosted only' },
  { cap: 'Best for', zp: 'Graph-shaped reasoning and explicit entity modelling', sw: 'Eval-driven, inspectable retrieval on a single Postgres' },
]

function CompareGroup({ title, rows }: { title: string; rows: CompareRow[] }) {
  return (
    <>
      <div className="border-t border-theme-border bg-[var(--viz-code-bg)] px-6 py-3 font-mono text-[11px] tracking-[0.08em] text-theme-muted sm:px-7">
        {title}
      </div>

      <div className="hidden md:block">
        {rows.map((row) => (
          <div key={row.cap} className="grid grid-cols-[1.7fr_1.3fr_1.3fr] border-t border-theme-border">
            <div className="px-7 py-5 text-[15px] text-theme-primary">{row.cap}</div>
            <div className="border-l border-theme-border px-6 py-5 text-[14px] leading-[1.5] text-theme-muted">{row.zp}</div>
            <div className="border-l border-theme-border bg-accent/[0.05] px-6 py-5 text-[14px] leading-[1.5] text-theme-secondary">{row.sw}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t border-theme-border p-5 md:hidden">
        {rows.map((row) => (
          <div key={row.cap} className="rounded-2xl border border-theme-border bg-surface-1 p-4">
            <p className="mb-3 text-[14.5px] font-semibold text-theme-primary">{row.cap}</p>
            <dl className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <dt className="mt-0.5 shrink-0"><ZepBadge size={18} /></dt>
                <dd className="text-[13px] leading-[1.5] text-theme-muted">{row.zp}</dd>
              </div>
              <div className="flex items-start gap-2.5">
                <dt className="mt-0.5 shrink-0"><StatewaveBadge size={18} /></dt>
                <dd className="text-[13px] leading-[1.5] text-theme-secondary">{row.sw}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </>
  )
}

function ComparisonSection() {
  return (
    <Section id="compare">
      <div className="mx-auto max-w-2xl text-center">
        <Heading
          id="compare-heading"
          className="font-heading text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-theme-primary md:text-[48px]"
        >
          Where each capability lives
        </Heading>
        <p className="mt-4 text-[17px] leading-[1.6] text-theme-secondary/90">
          Both give agents durable memory. They diverge on the shape of what comes back: a graph
          traversal&apos;s Context Block, or a ranked bundle of typed rows, and on what you can
          inspect once it has.
        </p>
      </div>

      <div className="mt-12 overflow-hidden rounded-[1.75rem] border border-theme-border shadow-sm">
        <div className="hidden bg-surface-2 md:grid md:grid-cols-[1.7fr_1.3fr_1.3fr]">
          <div className="px-7 py-5 font-mono text-[11px] tracking-[0.08em] text-theme-muted">CAPABILITY</div>
          <div className="flex items-center gap-2 border-l border-theme-border px-6 py-5 font-heading text-[15px] font-bold text-theme-primary">
            <ZepBadge size={20} />
            Zep
          </div>
          <div className="flex items-center gap-2 border-l border-theme-border bg-accent/[0.07] px-6 py-5 font-heading text-[15px] font-bold text-theme-primary">
            <StatewaveBadge size={20} />
            Statewave
          </div>
        </div>

        <CompareGroup title="RETRIEVAL &amp; RANKING" rows={RETRIEVAL_ROWS} />
        <CompareGroup title="GOVERNANCE &amp; PROVENANCE" rows={GOVERNANCE_ROWS} />
        <CompareGroup title="OPERATIONS &amp; LICENSING" rows={OPS_ROWS} />
      </div>

      <p className="mx-auto mt-5 max-w-3xl text-[12.5px] leading-[1.6] text-theme-muted">
        Zep is a Graph RAG memory product built on Graphiti, its open-source temporal-graph engine:
        nodes are entities, edges are facts with valid/invalid timestamps, and the graph updates
        dynamically in response to new data. Zep discontinued its self-hosted Community Edition in
        2025. Cloud, BYOK, and Bring-Your-Own-Cloud are the only deployment options today.
        Rows reflect Zep&apos;s public docs as of August 2026.
      </p>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-theme-border bg-surface-1 p-7">
          <div className="mb-3 flex items-center gap-2.5">
            <ZepBadge />
            <span className="font-heading text-[17px] font-bold text-theme-primary">Reach for Zep when</span>
          </div>
          <p className="text-[14.5px] leading-[1.6] text-theme-muted">
            Your domain has entities and explicit relationships the agent should reason about:
            &quot;what connects Alice to BluePeak?&quot; is a graph question. You want temporal
            validity on relationships for free, prefer defining custom entity types, and are fine
            running entirely as a managed cloud or BYOC service. Zep has no self-hosted edition.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-accent/30 bg-surface-1 p-7">
          <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-32 w-52 rounded-full bg-accent/[0.09] blur-3xl" />
          <div className="relative mb-3 flex items-center gap-2.5">
            <StatewaveBadge />
            <span className="font-heading text-[17px] font-bold text-accent">Reach for Statewave when</span>
          </div>
          <p className="relative text-[14.5px] leading-[1.6] text-theme-secondary">
            Inspectable retrieval matters, determinism is part of the contract, and a single-Postgres,
            self-hosted footprint is operationally simpler than adopting a managed graph service. Most
            support, coding, and sales agents need &quot;what did this user say, what&apos;s their
            plan, what&apos;s open&quot;: typed-fact retrieval covers that and skips the graph tax.
          </p>
        </div>
      </div>
    </Section>
  )
}

/* ─── Worked example ─────────────────────────────────────────────────────── */

function CodePanel({
  badge,
  title,
  lines,
  calloutTone,
  callout,
}: {
  badge: React.ReactNode
  title: string
  lines: React.ReactNode[]
  calloutTone: 'muted' | 'accent'
  callout: React.ReactNode
}) {
  return (
    <div className={`overflow-hidden rounded-[1.75rem] border ${calloutTone === 'accent' ? 'border-accent/30' : 'border-theme-border'} bg-[var(--viz-code-bg)]`}>
      <div className="flex items-center gap-2.5 border-b border-theme-border/60 px-6 py-4">
        {badge}
        <span className="font-heading text-[15px] font-bold text-theme-primary">{title}</span>
      </div>
      <div className="p-6 font-mono text-[13px] leading-[1.95]" style={{ color: 'var(--viz-code-text)' }}>
        {lines.map((line, i) => <div key={i}>{line}</div>)}
      </div>
      <div
        className={`m-6 mt-0 rounded-xl p-4 text-[13.5px] leading-[1.55] ${
          calloutTone === 'accent'
            ? 'border border-accent/30 bg-accent/10 text-theme-secondary'
            : 'border border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-300'
        }`}
      >
        {callout}
      </div>
    </div>
  )
}

function WorkedExampleSection() {
  return (
    <Section id="example" className="bg-surface-1">
      <Heading
        id="example-heading"
        className="max-w-2xl font-heading text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-theme-primary md:text-[48px]"
      >
        &quot;Why did the agent say that?&quot;
      </Heading>

      <p className="mt-6 max-w-2xl text-[17px] leading-[1.6] text-theme-secondary/90">
        An agent resumes a returning customer and states a fact about them. Later, someone asks where
        that fact came from. The same history runs through each system: one returns a blob, the
        other a finite provenance chain.
      </p>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <CodePanel
          badge={<ZepBadge size={20} />}
          title="Zep &middot; Context Block"
          calloutTone="muted"
          lines={[
            <span key="1" style={{ color: 'var(--viz-code-muted)' }}># ask the graph for context</span>,
            <span key="2"><span style={{ color: 'var(--color-accent)' }}>&rsaquo;</span> zep.thread.get_user_context(<span style={{ color: 'var(--viz-code-text)' }}>&quot;alice-1&quot;</span>)</span>,
            <span key="3">&nbsp;&nbsp;&#8627; ctx.context <span style={{ color: 'var(--viz-code-muted)' }}># optimized string</span></span>,
            <div key="4" className="mt-3 flex flex-col gap-2">
              <div className="rounded-lg border border-theme-border bg-surface-2 px-3 py-2 text-[11.5px]" style={{ color: 'var(--viz-code-muted)' }}>
                &quot;Alice runs dispatch automation at Northwind. Works with Acme on BluePeak&hellip;&quot;
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-theme-border bg-surface-2 px-3 py-2 text-[11.5px]" style={{ color: 'var(--viz-code-muted)' }}>
                which message? which edge?
                <span className="ml-auto text-amber-500">not in the response</span>
              </div>
            </div>,
          ]}
          callout="You get a well-shaped string. The confidence of each fact, the message it came from, whether it's still valid: that lineage lives in the graph, not in what the agent was handed."
        />

        <CodePanel
          badge={<StatewaveBadge size={20} />}
          title="Statewave &middot; bundle + provenance"
          calloutTone="accent"
          lines={[
            <span key="1" style={{ color: 'var(--viz-code-muted)' }}># ranked rows with metadata</span>,
            <span key="2"><span style={{ color: 'var(--color-accent)' }}>&rsaquo;</span> sw.get_context(<span style={{ color: 'var(--color-accent)' }}>&quot;user-alice&quot;</span>,</span>,
            <span key="3">&nbsp;&nbsp;task=<span style={{ color: 'var(--color-accent)' }}>&quot;who is alice&quot;</span>, max_tokens=<span style={{ color: 'var(--color-brand-500)' }}>600</span>)</span>,
            <div key="4" className="mt-3 flex flex-col gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-[11.5px]" style={{ color: 'var(--viz-code-text)' }}>
                runs dispatch &middot; Northwind
                <span className="ml-auto text-brand-500">conf 0.92 &middot; [ep_4]</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-theme-border bg-surface-2 px-3 py-2 text-[11.5px]" style={{ color: 'var(--viz-code-muted)' }}>
                prefers email
                <span className="ml-auto text-theme-muted">valid &middot; [ep_9]</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-theme-border bg-surface-2 px-3 py-2 text-[11.5px]" style={{ color: 'var(--color-accent)' }}>
                provenance
                <span className="ml-auto text-theme-muted">fact_ids &rarr; episodes</span>
              </div>
            </div>,
          ]}
          callout={'Every row carries its kind, confidence, validity, and source_episode_ids. "Why did the agent say X" is a finite walk (fact_ids to memories to source episodes), not a forensic dig through the graph.'}
        />
      </div>
    </Section>
  )
}

/* ─── Every call leaves a receipt ────────────────────────────────────────── */

const MECHANISM_CARDS = [
  { icon: '{}', title: 'Policy engine', body: 'Content-hashed YAML or JSON bundles. Deny or redact by sensitivity label and caller identity; log_only audits a policy before you enforce it.' },
  { icon: '#', title: 'Sensitivity labels', body: 'Per-memory pii, financial, and secret tags in a GIN-indexed array, so policy filters run inside the query.' },
  { icon: '←', title: 'Full provenance', body: 'Every compiled memory keeps the source episode ids, confidence score, and validity window it was derived from.' },
  { icon: '⌫', title: 'Subject deletion', body: 'One GDPR-style call erases every episode, memory, and receipt for a subject. No orphaned rows.' },
]

function ReceiptCard() {
  const rows = [
    { label: 'profile_fact', meta: 'conf 0.92 · valid', src: '[ep_4, ep_9]', dim: false },
    { label: 'procedure', meta: 'conf 0.88 · valid', src: '[ep_2]', dim: false },
    { label: 'episode_summary', meta: 'superseded', src: 'dropped', dim: true },
  ]

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-accent/30 shadow-sm" style={{ background: 'var(--viz-shell)' }}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(380px 190px at 62% 0%, var(--viz-hero-glow-primary) 0%, transparent 72%)' }} />

      <div className="relative flex items-center gap-2.5 border-b px-6 py-4" style={{ borderColor: 'var(--viz-border)', background: 'var(--viz-shell-header)' }}>
        <span className="h-2 w-2 rounded-full bg-brand-500" />
        <span className="font-heading text-sm font-bold" style={{ color: 'var(--viz-text)' }}>state-assembly receipt</span>
        <span className="ml-auto font-mono text-[11px]" style={{ color: 'var(--viz-text-muted)' }}>immutable &middot; ULID-addressable</span>
      </div>

      <div className="relative flex flex-col gap-3 p-6 font-mono text-[12.5px]" style={{ color: 'var(--viz-text)' }}>
        <div className="flex justify-between gap-3"><span style={{ color: 'var(--viz-text-muted)' }}>receipt_id</span><span className="text-accent">01J9Z4RT8K&middot;&middot;&middot;</span></div>
        <div className="flex justify-between gap-3"><span style={{ color: 'var(--viz-text-muted)' }}>integrity_hash</span><span className="text-brand-500">sha256:a3f9c1e0&middot;&middot;&middot;</span></div>
        <div className="flex justify-between gap-3"><span style={{ color: 'var(--viz-text-muted)' }}>policy_bundle</span><span>bundle:7c21 <span className="text-accent">(enforce)</span></span></div>

        <div className="h-px" style={{ background: 'var(--viz-border)' }} />

        <div style={{ color: 'var(--viz-text-muted)' }}>included &middot; 3 facts, 2 episodes &middot; 1,180/1,500 tokens</div>

        {rows.map((row) => (
          <div
            key={row.label}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${row.dim ? 'border-dashed opacity-60' : ''}`}
            style={{ borderColor: 'var(--viz-border)', background: 'var(--viz-card)' }}
          >
            <span className={row.dim ? '' : 'text-theme-primary'} style={row.dim ? { color: 'var(--viz-text-muted)' } : undefined}>{row.label}</span>
            <span style={{ color: 'var(--viz-text-muted)' }}>{row.meta}</span>
            <span className="ml-auto text-[10.5px]" style={{ color: 'var(--viz-text-muted)' }}>{row.src}</span>
          </div>
        ))}

        <div className="mt-1 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="text-[11.5px] text-accent">1 memory redacted &middot; label:pii</span>
        </div>
      </div>
    </div>
  )
}

function GovernanceSection() {
  return (
    <Section id="governance" className="relative overflow-hidden">
      <div aria-hidden="true" className="section-glow-full" />

      <div className="relative mx-auto max-w-2xl text-center">
        <Heading
          id="governance-heading"
          className="font-heading text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-theme-primary md:text-[48px]"
        >
          Every call can leave a receipt
        </Heading>
        <p className="mt-4 text-[17px] leading-[1.6] text-theme-secondary/90">
          Zep tracks lineage as timestamps on graph edges and returns retrieval as an opaque Context
          Block. In Statewave assembly is governed on the read path and can emit an immutable receipt,
          with per-memory provenance back to the source episode, in the core, under Apache 2.0.
        </p>
      </div>

      <div className="relative mt-12 grid items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <ReceiptCard />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {MECHANISM_CARDS.map((card) => (
            <div key={card.title} className="rounded-2xl border border-theme-border bg-surface-1 p-6">
              <div className="mb-3.5 flex h-9 w-9 items-center justify-center rounded-lg bg-accent/[0.14] font-mono text-[13px] text-accent">
                {card.icon}
              </div>
              <div className="mb-1.5 font-heading text-[15.5px] font-bold text-theme-primary">{card.title}</div>
              <div className="text-[13px] leading-[1.55] text-theme-muted">{card.body}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ─── Benchmarks ─────────────────────────────────────────────────────────────
 * Unlike /vs/letta, Zep publishes no leaderboard comparable to LoCoMo /
 * LongMemEval, so there's no per-model distribution to plot here. The
 * contrast this section draws instead: Statewave's scores are fixed because
 * no model or reranker sits on its read path, while Zep's own docs describe
 * the graph updating dynamically and retrieval composing through a managed
 * reranker, a "same query, different day" property Zep doesn't dispute, just
 * doesn't put a number on. The three "same query" panels are explicitly
 * labeled illustrative, not measured, because Zep discloses no per-run
 * determinism figure to plot instead.
 */

const LOCOMO = { value: '0.905', fraction: 0.905, n: 'n=1,540', grade: 'robust figure' }
const LONGMEMEVAL = { value: '0.967', fraction: 0.967, n: 'n=30', grade: 'directional' }

function TerminalDots() {
  return (
    <div className="flex gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
      <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
      <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
    </div>
  )
}

/** Half-circle gauge for one fixed score. Flat series fill, not a gradient:
 * same reasoning as /vs/letta and the /benchmarks bars: a ramp implies a
 * range where there's a single fixed number. */
function ScoreGauge({
  value,
  fraction,
  label,
  sub,
}: {
  value: string
  fraction: number
  label: string
  sub: string
}) {
  const radius = 92
  const arc = Math.PI * radius

  return (
    <figure className="m-0 flex flex-col items-center">
      <svg
        viewBox="0 0 220 128"
        className="h-auto w-full max-w-[280px]"
        role="img"
        aria-label={`${label}: ${value} accuracy, ${sub}`}
      >
        <path
          d={`M20,112 A${radius},${radius} 0 0 1 200,112`}
          fill="none"
          stroke="var(--viz-track)"
          strokeWidth="17"
          strokeLinecap="round"
        />
        <path
          d={`M20,112 A${radius},${radius} 0 0 1 200,112`}
          fill="none"
          stroke="var(--series-statewave)"
          strokeWidth="17"
          strokeLinecap="round"
          strokeDasharray={`${arc * fraction} ${arc}`}
        />
        <text
          x="110"
          y="96"
          textAnchor="middle"
          className="font-heading"
          style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-1.5px', fill: 'var(--viz-text)' }}
        >
          {value}
        </text>
        <text
          x="110"
          y="118"
          textAnchor="middle"
          className="font-mono"
          style={{ fontSize: 11, letterSpacing: '.5px', fill: 'var(--viz-text-muted)' }}
        >
          accuracy
        </text>
      </svg>
      <figcaption className="mt-1 text-center">
        <div className="text-[16px] font-bold text-theme-primary">{label}</div>
        <div className="mt-0.5 font-mono text-[11px] text-theme-muted">{sub}</div>
      </figcaption>
    </figure>
  )
}

const SAME_QUERY_RUNS = [
  { label: 'SAME QUERY · RUN 1', weights: [2, 1, 1.4], note: 'facts A, B, C composed' },
  { label: 'SAME QUERY · RUN 2', weights: [1.4, 2, 1], note: 're-ranked, D swapped in' },
  { label: 'SAME QUERY · RUN 3', weights: [1, 1.6, 2], note: 'graph updated since' },
]

function BenchmarksSection() {
  return (
    <Section id="bench" className="bg-surface-1">
      <div className="mx-auto max-w-3xl text-center">
        <Heading
          id="bench-heading"
          className="font-heading text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-theme-primary md:text-[48px]"
        >
          The same query returns the same bundle
        </Heading>
        <p className="mt-4 text-[17px] leading-[1.6] text-theme-secondary/90">
          Statewave is evaluated on two long-horizon memory benchmarks, and the scores are fixed:
          no model and no reranker sit on the read path, so the same subject, task, and budget
          return the same bytes every run. Zep publishes no comparable number: graph
          traversal with a managed reranker composes the Context Block, and Zep&apos;s own docs
          describe the graph updating dynamically as new data arrives.
        </p>
      </div>

      {/* Statewave: fixed scores */}
      <div className="relative mt-12 overflow-hidden rounded-[1.75rem] border border-accent/30 bg-surface-2/40 p-7 shadow-sm sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-40 w-64 rounded-full bg-accent/[0.08] blur-3xl" />

        <div className="relative mb-7 flex flex-wrap items-center gap-2.5">
          <StatewaveBadge size={22} />
          <span className="font-heading text-[18px] font-bold text-theme-primary">Statewave: fixed benchmark scores</span>
          <span className="ml-auto rounded-full bg-accent/[0.14] px-2.5 py-1 font-mono text-[10.5px] tracking-[0.04em] text-accent">
            DETERMINISTIC READ PATH
          </span>
        </div>

        <div className="relative grid items-center gap-x-9 gap-y-8 sm:grid-cols-[1fr_1px_1fr]">
          <ScoreGauge
            value={LOCOMO.value}
            fraction={LOCOMO.fraction}
            label="LoCoMo"
            sub={`${LOCOMO.n} · ${LOCOMO.grade}`}
          />
          <div className="hidden h-[150px] w-px justify-self-center bg-theme-border sm:block" aria-hidden="true" />
          <ScoreGauge
            value={LONGMEMEVAL.value}
            fraction={LONGMEMEVAL.fraction}
            label="LongMemEval"
            sub={`${LONGMEMEVAL.n} · ${LONGMEMEVAL.grade}`}
          />
        </div>

        <div className="relative mt-7 grid gap-3.5 sm:grid-cols-2">
          <div className="rounded-xl border border-theme-border bg-surface-1 p-4">
            <div className="mb-2.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-accent">
              Hybrid retrieval lift &middot; v10
            </div>
            <div className="flex flex-wrap gap-2">
              {['LoCoMo +2.1', 'LongMemEval +16.0'].map((chip) => (
                <span key={chip} className="rounded-lg bg-accent/[0.12] px-2.5 py-1 font-mono text-[12px] text-theme-secondary">
                  {chip}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-theme-border bg-surface-1 p-4">
            <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-accent">
              Storage footprint
            </div>
            <div className="flex items-baseline gap-2 text-[13px] text-theme-secondary">
              <span className="font-heading text-[15px] font-extrabold text-accent">postgres + pgvector</span>
              <span className="text-theme-muted">&middot;</span>
              <span className="font-mono text-theme-muted">no graph DB</span>
            </div>
            <div className="mt-1 text-[11.5px] text-theme-muted">One store to operate, usually already in your stack.</div>
          </div>
        </div>
      </div>

      {/* Zep: managed, not deterministic */}
      <div className="mt-6 rounded-[1.75rem] border border-theme-border bg-surface-2/40 p-7 shadow-sm sm:p-8">
        <div className="mb-2 flex flex-wrap items-center gap-2.5">
          <ZepBadge size={22} />
          <span className="font-heading text-[18px] font-bold text-theme-primary">Zep: managed, not deterministic</span>
          <span
            className="ml-auto rounded-full px-2.5 py-1 font-mono text-[10.5px] tracking-[0.04em]"
            style={{ background: 'color-mix(in oklab, var(--viz-amber) 14%, transparent)', color: 'var(--viz-amber)' }}
          >
            VARIES WITH INDEX STATE
          </span>
        </div>
        <p className="mb-7 max-w-[660px] text-[13px] leading-[1.55] text-theme-muted">
          Zep doesn&apos;t advertise determinism: graph traversal and reranker behaviour are
          part of the managed retrieval, and the graph updates dynamically in response to new data.
          The same query can compose a different Context Block as index state shifts.{' '}
          <a href={ZEP_CONCEPTS_URL} target="_blank" rel="noopener noreferrer" className="text-accent hover:opacity-80">
            help.getzep.com/concepts
          </a>
        </p>

        <div className="grid gap-3.5 sm:grid-cols-3">
          {SAME_QUERY_RUNS.map((run) => (
            <div key={run.label} className="rounded-xl border border-theme-border bg-surface-1 p-4">
              <div className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.06em]" style={{ color: 'var(--viz-amber)' }}>{run.label}</div>
              <div className="mb-2.5 flex gap-1.5">
                {run.weights.map((w, i) => (
                  <span
                    key={i}
                    className="h-2 rounded"
                    style={{ flex: w, background: 'color-mix(in oklab, var(--viz-amber) 45%, transparent)' }}
                  />
                ))}
              </div>
              <div className="text-[11.5px] text-theme-muted">{run.note}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11.5px] leading-[1.5] text-theme-muted">
          Illustrative: Zep publishes no per-run determinism guarantee. Statewave&apos;s
          compile-time scoring and ranked-pack assembly return a byte-identical bundle for the same
          (subject, task, budget).
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-theme-border" style={{ background: 'var(--viz-code-bg)' }}>
        <div className="flex items-center gap-2.5 border-b border-theme-border/60 px-6 py-4">
          <TerminalDots />
          <span className="font-mono text-[12px]" style={{ color: 'var(--viz-code-muted)' }}>reproduce it yourself &middot; statewave-memory-benchmarks</span>
        </div>
        <div className="p-6 font-mono text-[12.5px] leading-[1.95]" style={{ color: 'var(--viz-code-muted)' }}>
          <div><span className="text-theme-muted">$</span> git clone {BENCHMARKS_REPO_URL}.git</div>
          <div><span className="text-theme-muted">$</span> cd statewave-memory-benchmarks &amp;&amp; pip install -r requirements.txt</div>
          <div><span className="text-theme-muted">$</span> python -m benchmarks.locomo.run --backend statewave \</div>
          <div>&nbsp;&nbsp;--answerer-model gpt-4o --judge-model gpt-4o</div>
          <div className="mt-1.5"># deterministic read path, same bundle on every run</div>
        </div>
      </div>
    </Section>
  )
}

/* ─── Moving from Zep to Statewave ───────────────────────────────────────── */

interface MigrationRow {
  zp: string
  sw: string
  note: string
  /** Effort to carry this call over, shown as a colored chip instead of more
   * prose: 'direct' is a near 1:1 call swap, 'rework' has no equivalent and
   * needs an application-level decision (see the graph.search row). */
  effort: 'direct' | 'rework'
}

/* Method names verified against help.getzep.com/concepts (2026-08-18):
 * thread.add_messages / thread.get_user_context / graph.search, and edge
 * valid_at / invalid_at for temporal validity. */
const MIGRATION_ROWS: MigrationRow[] = [
  { zp: 'thread.add_messages("alice-1", …)', sw: 'sw.add_episode("user-alice", …)', note: 'Messages land as immutable episodes; compilers extract typed memories.', effort: 'direct' },
  { zp: 'thread.get_user_context("alice-1")', sw: 'sw.get_context("user-alice", task="…", max_tokens=600)', note: 'Ranked, token-bounded bundle with per-memory metadata and an optional receipt.', effort: 'direct' },
  { zp: 'graph.search("…")', sw: 'query by subject_id + kind + metadata', note: 'No graph-traversal surface. Query typed memories, or keep a graph layer in your app.', effort: 'rework' },
  { zp: 'edge valid_at / invalid_at', sw: 'valid_from / valid_to on the memory', note: 'Temporal validity moves from the edge onto the memory itself.', effort: 'direct' },
]

const MIGRATION_EFFORT_LABEL: Record<MigrationRow['effort'], string> = {
  direct: 'direct swap',
  rework: 'needs rework',
}

const INSTALL_CMD = 'npx @statewavedev/statewave'

function MigrationSection() {
  return (
    <Section id="start">
      <div className="mx-auto max-w-2xl text-center">
        <Heading
          id="migration-heading"
          className="font-heading text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-theme-primary md:text-[48px]"
        >
          Moving from Zep to Statewave
        </Heading>
        <p className="mt-4 text-[17px] leading-[1.6] text-theme-secondary/90">
          The conceptual translation is straightforward, but the data shapes differ. Plan a
          parallel-run period: the cutover is typically read-then-write rather than a flag flip.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-4xl">
        <div className="mb-6 overflow-hidden rounded-[1.75rem] border border-theme-border" style={{ background: 'var(--viz-code-bg)' }}>
          <div className="flex items-center gap-2.5 border-b border-theme-border/60 px-6 py-4">
            <TerminalDots />
            <span className="font-mono text-[12px]" style={{ color: 'var(--viz-code-muted)' }}>one command &middot; connects any MCP client</span>
            <div className="ml-auto">
              <CodeCopyButton code={INSTALL_CMD} label="Copy install command" />
            </div>
          </div>
          <div className="p-6 font-mono text-[14px] leading-[1.9]" style={{ color: 'var(--viz-code-text)' }}>
            <div><span style={{ color: 'var(--viz-code-muted)' }}>$</span> npx <span className="text-accent">@statewavedev/statewave</span></div>
            <div className="text-[12.5px]" style={{ color: 'var(--viz-code-muted)' }}>&rarr; API + admin console + Postgres up via Docker &middot; healthy in under 2 min &middot; no account</div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-theme-border">
          <div className="grid grid-cols-[1fr_44px_1.2fr] bg-surface-2">
            <div className="px-6 py-3.5 font-mono text-[11px] tracking-[0.08em] text-theme-muted">ZEP</div>
            <div className="border-l border-theme-border" />
            <div className="border-l border-theme-border px-6 py-3.5 font-mono text-[11px] tracking-[0.08em] text-accent">STATEWAVE</div>
          </div>

          {MIGRATION_ROWS.map((row) => (
            <div key={row.zp} className="grid grid-cols-1 border-t border-theme-border sm:grid-cols-[1fr_44px_1.2fr]">
              <div className="px-6 py-5 font-mono text-[12.5px] leading-[1.7] text-theme-muted">{row.zp}</div>
              <div className="hidden items-center justify-center border-l border-theme-border font-mono text-sm text-brand-500 sm:flex">&rarr;</div>
              <div className="border-t border-theme-border bg-accent/[0.05] px-6 py-5 sm:border-l sm:border-t-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="font-mono text-[12.5px] leading-[1.7] text-theme-secondary">{row.sw}</div>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.05em]"
                    style={{
                      background:
                        row.effort === 'direct'
                          ? 'color-mix(in oklab, var(--series-statewave) 14%, transparent)'
                          : 'color-mix(in oklab, var(--viz-amber) 16%, transparent)',
                      color: row.effort === 'direct' ? 'var(--series-statewave)' : 'var(--viz-amber)',
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'currentColor' }} />
                    {MIGRATION_EFFORT_LABEL[row.effort]}
                  </span>
                </div>
                <div className="mt-2 text-[12.5px] leading-[1.5] text-theme-muted">{row.note}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 max-w-3xl text-[12.5px] leading-[1.6] text-theme-muted">
          Relational facts that explicitly link two entities (&quot;Alice works at Acme&quot;)
          don&apos;t survive directly: encode them in the subject&apos;s memory content, write
          to both subjects, or keep relationships in your own graph layer and use Statewave for
          episode and memory storage.
        </p>
      </div>
    </Section>
  )
}

/* ─── FAQ ────────────────────────────────────────────────────────────────── */

interface Faq {
  tag: string
  q: string
  a: string
}

const FAQS: Faq[] = [
  { tag: 'OVERVIEW', q: 'How is Statewave different from Zep?', a: 'Zep is a Graph RAG product: it models memory as a knowledge graph of entities and edges and returns retrieval as an optimized Context Block string. Statewave compiles raw episodes into typed memories with confidence and validity, ranks them with a fixed scoring model to a token budget, and returns a structured bundle: per-row kind, confidence, validity, and source episode ids, with no graph to traverse.' },
  { tag: 'CAPABILITY', q: 'Can I still do graph reasoning?', a: 'Not natively. Statewave has no graph-traversal surface, so "find everything Alice is connected to within two hops" isn’t its shape. If your domain needs entity-relationship reasoning, keep that in Zep or your own data layer, and use Statewave for episode and typed-memory storage.' },
  { tag: 'MIGRATION', q: 'What happens to relational facts like "Alice works at Acme"?', a: 'Facts about a single subject migrate cleanly. Relational facts that link two entities don’t survive directly. You encode the relationship in the subject’s memory content, write the memory to both subjects with cross-references, or keep the relationship in your application’s graph.' },
  { tag: 'DETERMINISM', q: 'What makes retrieval deterministic?', a: 'The bundle is compiled and assembled the same way every run: five ranking signals (kind priority, recency, task relevance, temporal validity, and semantic similarity) combined to a fixed token budget. The same subject, task, and point in time produce the same bytes. Graph traversal with a reranker can’t promise that, because index state and reranker variation introduce drift.' },
  { tag: 'STORAGE', q: 'Do I have to run a graph database?', a: 'No. Storage is Postgres plus pgvector and nothing else, usually already in your stack. There is no separate graph store to operate, back up, or scale.' },
  { tag: 'DEPLOYMENT', q: 'Does Zep offer a self-hosted option?', a: 'No. Zep discontinued its self-hosted Community Edition in 2025 and now concentrates its open-source work on Graphiti, the temporal-graph engine underneath; the memory API this page compares (thread.get_user_context, graph.search) is only available through Zep Cloud, BYOK, or Bring-Your-Own-Cloud. Statewave runs the whole stack, Postgres included, on your own infrastructure, with no cloud dependency and no usage credits to meter.' },
  { tag: 'INTEGRATIONS', q: 'Does it work with Claude, Cursor, or Codex?', a: 'Yes. One command (npx @statewavedev/statewave) boots the runtime, and its shipped MCP server connects any MCP-compatible client: Claude, Cursor, Copilot, and agent runtimes. Zep is cloud-only; Statewave runs entirely on your own infrastructure.' },
]

function FaqSection() {
  return (
    <Section id="faq" className="bg-surface-1">
      <div className="text-center">
        <Heading
          id="faq-heading"
          className="font-heading text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-theme-primary"
        >
          Frequently asked
        </Heading>
      </div>

      {/* Grid of tagged cards rather than one long stacked list: the topic tag
          carries real information (which theme the question sits under) and
          the two-column layout halves the scroll depth, per the site's
          "dense sections need visual treatment" rule. */}
      <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
        {FAQS.map((f, i) => (
          <div
            key={f.q}
            className={`rounded-2xl border border-theme-border bg-surface-1 p-6 sm:p-7 ${
              i === FAQS.length - 1 ? 'sm:col-span-2' : ''
            }`}
          >
            <span className="mb-3 inline-block rounded-full bg-accent/10 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.06em] text-accent">
              {f.tag}
            </span>
            <p className="mb-2 font-heading text-[16px] font-bold text-theme-primary">{f.q}</p>
            <p className="text-[14px] leading-[1.6] text-theme-muted">{f.a}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

/* ─── Closing CTA ────────────────────────────────────────────────────────── */

function CTASection() {
  return (
    <Section>
      <div className="cta-card relative overflow-hidden rounded-[2.5rem] border border-brand-500/25 bg-surface-1/55 px-6 py-20 text-center">
        <div className="cta-card-glow absolute inset-0" aria-hidden="true" />
        <div
          className="absolute inset-x-20 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/60 to-transparent"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto max-w-2xl">
          <Heading
            id="give-your-agent-context"
            className="font-heading text-4xl md:text-[56px] font-bold leading-[1.05] tracking-[-0.04em] text-theme-primary"
          >
            Give your agent context it can prove
          </Heading>

          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-[1.6] text-theme-secondary/85">
            Self-host the Apache 2.0 runtime, wire it to your MCP client, and every context call can
            return a receipt.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button href={GITHUB_URL} size="lg">
              Get started
              <ArrowIcon />
            </Button>
            <Button href={DOCS_URL} variant="secondary" size="lg">
              Read the docs
            </Button>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

const FAQ_JSONLD = [
  faqPageJsonLd(FAQS.map((f) => ({ question: f.q, answer: f.a }))),
]

export function StatewaveVsZepPage() {
  usePageSEO({ jsonLd: FAQ_JSONLD })

  return (
    <div className="bg-surface-0">
      <HeroSection />
      <GapSection />
      <SignalsStrip />
      <ComparisonSection />
      <WorkedExampleSection />
      <GovernanceSection />
      <BenchmarksSection />
      <MigrationSection />
      <FaqSection />
      <CTASection />
    </div>
  )
}
