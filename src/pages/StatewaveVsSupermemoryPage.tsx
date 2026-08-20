import { motion } from 'framer-motion'
import { Section } from '../components/Section'
import { Heading } from '../components/Heading'
import { Button } from '../components/Button'
import { CodeCopyButton } from '../components/CodeCopyButton'
import { usePageSEO } from '../lib/seo'
import { faqPageJsonLd } from '../lib/seo-meta'

/*
 * /vs/supermemory: the fourth sibling of /vs/mem0, /vs/letta, and /vs/zep,
 * using the same section order, same components, same tokens. The argument
 * here is about the *shape* of what comes back: Supermemory runs hybrid
 * vector-plus-keyword search with a context-aware reranker and hands back
 * scored passages, tuned for recall and sub-300ms latency at scale.
 * Statewave compiles typed, provenance-traced memories and assembles a
 * ranked bundle the same way on every call.
 *
 * Two corrections from the source Claude Design mock:
 *
 *   - The typed-memory kind-priority bars use raw_episode=3 (not the mock's
 *     artifact_ref=4), to match ProductPage's scoring model and the figures
 *     already shipped on /vs/letta and /vs/zep.
 *   - The ranking-signals strip uses the site's real additive scoring model
 *     (score = priority + recency + relevance + validity, similarity builds
 *     the candidate set) rather than the mock's own "rank = priority x
 *     recency x relevance x validity x similarity" formula, which doesn't
 *     match /vs/mem0, /vs/letta, or /vs/zep. The "BEAM +1.8" chip is dropped
 *     from the hybrid-retrieval-lift panel for the same reason it's absent
 *     from /vs/letta and /vs/zep: /benchmarks claims no BEAM number.
 *
 * Supermemory's own figures (LoCoMo P@1 59.7% / Recall@10 83.5%, LongMemEval
 * Recall@15 95% with ~720 tokens added, sub-300ms retrieval at 100B+
 * tokens/mo, and the MemScore quality/latency/cost triple) were checked
 * against supermemory.ai and github.com/supermemoryai on 2026-08-19 and hold
 * up; unlike /vs/zep there was no stale deployment claim to correct here,
 * Supermemory does still ship a self-hostable binary alongside its managed
 * platform.
 *
 * Mockups use the `--viz-*` tokens from src/index.css so their neutrals flip
 * with the light/dark theme, same convention as the other three vs pages.
 */

const GITHUB_URL = 'https://github.com/smaramwbc/statewave'
const DOCS_URL = 'https://github.com/smaramwbc/statewave-docs'
const BENCHMARKS_REPO_URL = 'https://github.com/smaramwbc/statewave-memory-benchmarks'
const SUPERMEMORY_RESEARCH_URL = 'https://supermemory.ai/research/longmembench/'

function SupermemoryBadge({ size = 22 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-md font-mono font-semibold text-theme-muted"
      style={{ width: size, height: size, background: 'var(--viz-card-3)', fontSize: size * 0.4 }}
    >
      sm
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
            <span className="block text-theme-muted">Supermemory returns scored hits.</span>
            <span className="block">Statewave returns a traceable bundle.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-[620px] text-[18px] leading-[1.6] text-theme-secondary">
            Supermemory runs hybrid vector-plus-keyword search with a context-aware reranker,
            tuned for recall and sub-300ms latency. Statewave compiles typed, provenance-traced
            memories and assembles a ranked, token-bounded bundle the same way on every call.
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
 * Supermemory's card is scored passages ranked by similarity; Statewave's is
 * a list of typed rows carrying their own confidence and provenance. Two
 * panels instead of the single bundle panel /vs/letta uses in the hero,
 * because the argument here, like /vs/zep, is a shape comparison.
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
        {/* supermemory: scored hits */}
        <div
          className="overflow-hidden rounded-2xl border"
          style={{ borderColor: 'var(--viz-border)', background: 'var(--viz-shell)', boxShadow: 'var(--viz-shell-shadow)' }}
        >
          <div
            className="flex items-center gap-2.5 border-b px-5 py-4"
            style={{ borderColor: 'var(--viz-border)', background: 'var(--viz-shell-header)' }}
          >
            <SupermemoryBadge size={28} />
            <span className="font-heading text-sm font-bold" style={{ color: 'var(--viz-text-2)' }}>POST /v4/search</span>
            <span className="ml-auto font-mono text-[10px]" style={{ color: 'var(--viz-amber)' }}>&lt;300ms</span>
          </div>
          <div className="flex flex-col gap-2.5 p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.08em]" style={{ color: 'var(--viz-text-muted)' }}>
              reranked hits &middot; by relevance score
            </div>
            <div
              className="flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5"
              style={{ borderColor: 'var(--viz-border)', background: 'var(--viz-card)' }}
            >
              <span className="flex-1 text-[11.5px]" style={{ color: 'var(--viz-text-2)' }}>&quot;runs dispatch at Northwind&hellip;&quot;</span>
              <span className="font-mono text-[9.5px]" style={{ color: 'var(--viz-amber)' }}>0.83</span>
            </div>
            <div
              className="flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5"
              style={{ borderColor: 'var(--viz-border)', background: 'var(--viz-card)' }}
            >
              <span className="flex-1 text-[11.5px]" style={{ color: 'var(--viz-text-2)' }}>&quot;prefers email over calls&hellip;&quot;</span>
              <span className="font-mono text-[9.5px]" style={{ color: 'var(--viz-amber)' }}>0.71</span>
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--viz-amber)' }} />
              <span className="font-mono text-[10.5px]" style={{ color: 'var(--viz-text-muted)' }}>
                score is a similarity rank, not a fact type
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
    { value: '0', label: 'API keys to run' },
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

const SUPERMEMORY_PIPELINE = [
  { stage: 'vector', note: 'pgvector' },
  { stage: 'keyword', note: 'BM25' },
  { stage: 'rerank', note: 'context-aware' },
]

/* Same four kinds and scores /vs/letta and /vs/zep show: ProductPage's
 * scoring model (profile_fact=10, procedure=8, episode_summary=5,
 * raw_episode=3), unchanged by which competitor this page argues against.
 * The source Claude Design mock used artifact_ref=4 for the fourth bar;
 * that doesn't match the shipped scoring model, so this page uses
 * raw_episode=3 instead. */
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
          Reranked for recall, or assembled for proof
        </Heading>

        <p className="mt-6 max-w-2xl text-[17px] leading-[1.6] text-theme-secondary/90">
          Supermemory ingests documents and chats, extracts memories into a graph with user
          profiles, and answers search with hybrid vector-plus-keyword retrieval and a
          context-aware reranker, optimized to surface the most relevant hits fast. Statewave
          records each event as an immutable episode, compiles those into typed memories with
          confidence and validity, and assembles a ranked bundle the same way on every call.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* supermemory side */}
          <div className="flex flex-col">
            <div className="flex flex-1 flex-col gap-5 rounded-[1.75rem] border border-theme-border bg-surface-2/40 p-7 shadow-sm sm:p-8">
              <div className="flex items-center gap-2.5">
                <SupermemoryBadge />
                <span className="font-heading text-base font-bold text-theme-primary">Supermemory &middot; hybrid search</span>
              </div>

              <div className="rounded-xl border p-3.5" style={{ borderColor: 'var(--viz-border)', background: 'var(--viz-card)' }}>
                <div className="flex items-stretch gap-2">
                  {SUPERMEMORY_PIPELINE.map((step, i) => (
                    <div key={step.stage} className="flex flex-1 items-center gap-2">
                      <div
                        className="flex-1 rounded-lg px-2.5 py-2.5 text-center"
                        style={{
                          background: step.stage === 'rerank' ? 'color-mix(in oklab, var(--viz-amber) 14%, transparent)' : 'var(--viz-card-3)',
                          border: step.stage === 'rerank' ? '1px solid color-mix(in oklab, var(--viz-amber) 30%, transparent)' : undefined,
                        }}
                      >
                        <div
                          className="font-mono text-[9px] uppercase tracking-[0.05em]"
                          style={{ color: step.stage === 'rerank' ? 'var(--viz-amber)' : 'var(--viz-text-muted)' }}
                        >
                          {step.stage}
                        </div>
                        <div className="mt-0.5 text-[11px]" style={{ color: 'var(--viz-text-2)' }}>{step.note}</div>
                      </div>
                      {i < SUPERMEMORY_PIPELINE.length - 1 && (
                        <span className="font-mono text-[13px]" style={{ color: 'var(--viz-amber)' }}>{i === 0 ? '+' : '→'}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div
                  className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5"
                  style={{ borderColor: 'var(--viz-border)', background: 'var(--viz-card)' }}
                >
                  <span className="font-mono text-[11px]" style={{ color: 'var(--viz-text-2)' }}>POST /v4/search</span>
                  <span className="flex-1 text-[12px]" style={{ color: 'var(--viz-text-muted)' }}>&rarr; ranked hits by score</span>
                </div>
                <div
                  className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5"
                  style={{ borderColor: 'var(--viz-border)', background: 'var(--viz-card)' }}
                >
                  <span className="font-mono text-[11px]" style={{ color: 'var(--viz-text-2)' }}>GET /v4/profile</span>
                  <span className="flex-1 text-[12px]" style={{ color: 'var(--viz-text-muted)' }}>extracted user profile</span>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <p className="font-heading text-lg font-bold text-theme-primary">Retrieval rides on a reranker</p>
              <p className="mt-2 text-[14.5px] leading-[1.6] text-theme-muted">
                Hybrid search plus a context-aware reranker surface the most relevant hits, fast,
                at sub-300ms at scale. You get scored passages and an extracted profile; the score
                is a similarity rank, and ordering can shift as the index and reranker evolve.
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
                Given the same subject, task, token budget, and point in time, the assembler
                returns the identical bundle every run. Five signals set the order: kind priority,
                recency, task relevance, temporal validity, and semantic similarity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ─── How order is decided ───────────────────────────────────────────────── */

/* Same additive model /vs/mem0, /vs/letta, and /vs/zep document. The source
 * mock drew its own multiplicative formula ("rank = priority x recency x
 * relevance x validity x similarity"); that doesn't match the shipped
 * scoring model, so this page keeps the real one. */
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
  sm: string
  sw: string
}

const RETRIEVAL_ROWS: CompareRow[] = [
  { cap: 'What comes back', sm: 'Scored search hits, passages ranked by relevance', sw: 'A ranked bundle of typed rows with per-memory metadata' },
  { cap: 'How context is selected', sm: 'Hybrid vector + keyword search with a context-aware reranker', sw: 'Deterministic assembly, ranked to a token budget' },
  { cap: 'Same query, same result', sm: 'Reranked; ordering can shift as index state evolves', sw: 'Byte-identical bundle every run' },
  { cap: 'Retrieval latency', sm: 'Tuned for speed, sub-300ms at scale (vendor figure)', sw: 'Single Postgres query; not independently latency-benchmarked here' },
]

const GOVERNANCE_ROWS: CompareRow[] = [
  { cap: 'Inspectable retrieval', sm: 'Passages with similarity scores; profile extracted separately', sw: 'Explicit kind, confidence, valid_from/to per row' },
  { cap: 'Provenance', sm: 'Results trace to source documents', sw: 'source_episode_ids per memory; immutable episode chain' },
  { cap: 'Read-path policy / receipts', sm: 'Not a core primitive of the public API', sw: 'Policy engine + optional immutable, hash-chained receipt per call' },
  { cap: 'Subject deletion (GDPR)', sm: 'Delete documents and memories via the API', sw: 'One call hard-deletes a subject’s episodes and memories' },
]

const OPS_ROWS: CompareRow[] = [
  { cap: 'Memory model', sm: 'Graph engine plus extracted user profiles', sw: 'Typed memories (4 kinds) plus immutable episodes' },
  { cap: 'Storage', sm: 'Self-host binary (embedded engine), or Postgres + pgvector; hosted platform on Cloudflare edge', sw: 'Postgres and pgvector, no proprietary store' },
  { cap: 'Deployment', sm: 'Self-hostable binary and a managed hosted platform with connectors and MCP', sw: 'Self-hosted only' },
  { cap: 'Best for', sm: 'Fast, high-recall retrieval over large mixed corpora', sw: 'Eval-driven, inspectable, deterministic retrieval with governance' },
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
            <div className="border-l border-theme-border px-6 py-5 text-[14px] leading-[1.5] text-theme-muted">{row.sm}</div>
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
                <dt className="mt-0.5 shrink-0"><SupermemoryBadge size={18} /></dt>
                <dd className="text-[13px] leading-[1.5] text-theme-muted">{row.sm}</dd>
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
          Both give agents durable memory, both self-host on Postgres, and both are open-source.
          They diverge on the shape of what comes back, scored search hits from a reranker or a
          deterministic bundle of typed rows, and on what you can inspect and govern once it has.
        </p>
      </div>

      <div className="mt-12 overflow-hidden rounded-[1.75rem] border border-theme-border shadow-sm">
        <div className="hidden bg-surface-2 md:grid md:grid-cols-[1.7fr_1.3fr_1.3fr]">
          <div className="px-7 py-5 font-mono text-[11px] tracking-[0.08em] text-theme-muted">CAPABILITY</div>
          <div className="flex items-center gap-2 border-l border-theme-border px-6 py-5 font-heading text-[15px] font-bold text-theme-primary">
            <SupermemoryBadge size={20} />
            Supermemory
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
        Supermemory is an open-source memory and context engine with a self-hostable binary and a
        managed hosted platform; retrieval is hybrid vector-plus-keyword search with context-aware
        reranking. Rows reflect each product&apos;s public docs as of August 2026; verify
        self-hosted vs. hosted-platform feature parity before procurement.
      </p>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-theme-border bg-surface-1 p-7">
          <div className="mb-3 flex items-center gap-2.5">
            <SupermemoryBadge />
            <span className="font-heading text-[17px] font-bold text-theme-primary">Reach for Supermemory when</span>
          </div>
          <p className="text-[14.5px] leading-[1.6] text-theme-muted">
            Latency and recall over large, mixed corpora are the priority, chats, documents, and
            app events ingested and searched under 300ms. You want a managed platform with
            connectors and MCP out of the box, an extracted user profile and memory graph, and
            you&apos;re comfortable with reranked results rather than a fixed, byte-identical
            ordering.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-accent/30 bg-surface-1 p-7">
          <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-32 w-52 rounded-full bg-accent/[0.09] blur-3xl" />
          <div className="relative mb-3 flex items-center gap-2.5">
            <StatewaveBadge />
            <span className="font-heading text-[17px] font-bold text-accent">Reach for Statewave when</span>
          </div>
          <p className="relative text-[14.5px] leading-[1.6] text-theme-secondary">
            Determinism is part of the contract, retrieval must be inspectable row by row, and
            every context call needs provenance back to its source episodes, with an optional
            immutable receipt and read-path policy enforcement. Eval-driven teams that grade
            end-to-end answer accuracy, not just retrieval recall, live here.
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
        An agent resumes a returning customer and states a fact about them. Later, someone asks
        where that fact came from. The same history runs through each system: one returns scored
        passages, the other a finite provenance chain plus a receipt.
      </p>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <CodePanel
          badge={<SupermemoryBadge size={20} />}
          title="Supermemory &middot; scored hits"
          calloutTone="muted"
          lines={[
            <span key="1" style={{ color: 'var(--viz-code-muted)' }}># search the memory store</span>,
            <span key="2"><span style={{ color: 'var(--color-accent)' }}>&rsaquo;</span> sm.search(<span style={{ color: 'var(--viz-code-text)' }}>&quot;who is alice&quot;</span>)</span>,
            <span key="3">&nbsp;&nbsp;<span style={{ color: 'var(--viz-code-muted)' }}>&#8627;</span> results[] <span style={{ color: 'var(--viz-code-muted)' }}># passages + scores</span></span>,
            <div key="4" className="mt-3 flex flex-col gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-theme-border bg-surface-2 px-3 py-2 text-[11.5px]" style={{ color: 'var(--viz-code-muted)' }}>
                &quot;runs dispatch at Northwind&hellip;&quot;
                <span className="ml-auto text-amber-500">0.83</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-theme-border bg-surface-2 px-3 py-2 text-[11.5px]" style={{ color: 'var(--viz-code-muted)' }}>
                which run? which policy?
                <span className="ml-auto text-amber-500">not in the response</span>
              </div>
            </div>,
          ]}
          callout="You get relevant passages and a similarity score. Which source document each came from is traceable, but confidence, validity, and whether a governance policy touched the result aren't part of the answer the agent was handed."
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
                <span className="ml-auto">valid &middot; [ep_9]</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-theme-border bg-surface-2 px-3 py-2 text-[11.5px]" style={{ color: 'var(--color-accent)' }}>
                provenance
                <span className="ml-auto text-theme-muted">fact_ids &rarr; episodes</span>
              </div>
            </div>,
          ]}
          callout="Every row carries its kind, confidence, validity, and source_episode_ids. Why did the agent say X is a finite walk, fact_ids to memories to source episodes, and the same call can emit an immutable receipt of what was included and why."
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
          Supermemory extracts memories into a graph with user profiles and returns scored search
          results. In Statewave assembly is governed on the read path and can emit an immutable
          receipt, with per-memory provenance back to the source episode, in the core, under
          Apache 2.0.
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
 * Unlike /vs/zep (no comparable number at all) and /vs/letta (a per-model
 * leaderboard distribution), Supermemory publishes headline retrieval and
 * latency figures of its own, checked against supermemory.ai and
 * github.com/supermemoryai on 2026-08-19: LoCoMo P@1 59.7% / Recall@10
 * 83.5%, LongMemEval Recall@15 95% with ~720 mean tokens added (99.4%
 * context reduction), sub-300ms retrieval at 100B+ tokens/mo, and a
 * MemScore quality/latency/cost triple by design, not one number. Those are
 * retrieval metrics, not the end-to-end QA-accuracy metric Statewave
 * reports, so the section keeps the "read apart" callout the source mock
 * used rather than stacking the two into a single winner bar.
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
 * same reasoning as /vs/letta, /vs/zep, and the /benchmarks bars: a ramp
 * implies a range where there's a single fixed number. */
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

const SUPERMEMORY_STATS = [
  { label: 'LoCoMo &middot; retrieval', big: '59.7%', bigLabel: 'P@1', small: '83.5%', smallLabel: 'Recall@10' },
  { label: 'LongMemEval &middot; recall', big: '95%', bigLabel: 'Recall@15', note: '~720 tokens added · 99.4% context reduction' },
  { label: 'retrieval latency', big: '<300ms', note: 'consistently · across 100B+ tokens/mo' },
  { label: 'MemScore', chips: ['quality', 'latency', 'cost'], note: 'a triple, by design, not one number' },
]

function BenchmarksSection() {
  return (
    <Section id="bench" className="bg-surface-1">
      <div className="mx-auto max-w-3xl text-center">
        <Heading
          id="bench-heading"
          className="font-heading text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-theme-primary md:text-[48px]"
        >
          Two teams, two scoreboards
        </Heading>
        <p className="mt-4 text-[17px] leading-[1.6] text-theme-secondary/90">
          Both projects publish benchmarks, but they measure different things. Statewave reports
          end-to-end answer accuracy on long-horizon QA. Supermemory reports retrieval precision
          and recall plus latency. Those aren&apos;t the same number, so we show each side&apos;s
          published figures with the exact metric labeled, and don&apos;t stack them into a single
          winner bar.
        </p>
      </div>

      <div className="mt-8 flex items-start gap-3.5 rounded-2xl border p-5" style={{ borderColor: 'color-mix(in oklab, var(--viz-amber) 28%, transparent)', background: 'color-mix(in oklab, var(--viz-amber) 6%, transparent)' }}>
        <span
          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-heading text-[13px] font-extrabold"
          style={{ background: 'color-mix(in oklab, var(--viz-amber) 16%, transparent)', color: 'var(--viz-amber)' }}
        >
          !
        </span>
        <p className="text-[13.5px] leading-[1.6]" style={{ color: 'var(--viz-text-2)' }}>
          <span className="font-bold" style={{ color: 'var(--viz-amber)' }}>Read these apart, not against each other.</span>{' '}
          A retrieval metric, Precision@1 or Recall@k, measures whether the right passage was
          fetched. An end-to-end QA-accuracy metric measures whether the agent&apos;s final answer
          was correct, and depends on the answerer model and the judge. Different metrics,
          different answerer models, different sample sizes. A direct &quot;0.905 vs 59.7%&quot;
          comparison would be meaningless.
        </p>
      </div>

      {/* Statewave: fixed scores */}
      <div className="relative mt-8 overflow-hidden rounded-[1.75rem] border border-accent/30 bg-surface-2/40 p-7 shadow-sm sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-40 w-64 rounded-full bg-accent/[0.08] blur-3xl" />

        <div className="relative mb-7 flex flex-wrap items-center gap-2.5">
          <StatewaveBadge size={22} />
          <span className="font-heading text-[18px] font-bold text-theme-primary">Statewave &middot; end-to-end QA accuracy</span>
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

        <div className="relative mt-7 rounded-xl border border-theme-border bg-surface-1 p-4">
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

        <p className="relative mt-4 text-[11px] leading-[1.5] text-theme-muted">
          Source: smaramwbc/statewave-memory-benchmarks README &middot; server/api/memories.py.
        </p>
      </div>

      {/* Supermemory: retrieval + latency */}
      <div className="mt-6 rounded-[1.75rem] border border-theme-border bg-surface-2/40 p-7 shadow-sm sm:p-8">
        <div className="mb-2 flex flex-wrap items-center gap-2.5">
          <SupermemoryBadge size={22} />
          <span className="font-heading text-[18px] font-bold text-theme-primary">Supermemory &middot; retrieval + latency</span>
          <span
            className="ml-auto rounded-full px-2.5 py-1 font-mono text-[10.5px] tracking-[0.04em]"
            style={{ background: 'color-mix(in oklab, var(--viz-amber) 14%, transparent)', color: 'var(--viz-amber)' }}
          >
            RETRIEVAL METRIC
          </span>
        </div>

        <p className="mb-7 max-w-[660px] text-[13px] leading-[1.55] text-theme-muted">
          Retrieval precision, recall, and speed, as published by Supermemory. Hybrid search plus
          a context-aware reranker; ordering can shift with index state.{' '}
          <a href={SUPERMEMORY_RESEARCH_URL} target="_blank" rel="noopener noreferrer" className="text-accent hover:opacity-80">
            supermemory.ai/research/longmembench
          </a>
        </p>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {SUPERMEMORY_STATS.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-theme-border bg-surface-1 p-4">
              <div
                className="mb-2.5 font-mono text-[9.5px] uppercase tracking-[0.06em]"
                style={{ color: 'var(--viz-text-muted)' }}
                dangerouslySetInnerHTML={{ __html: stat.label }}
              />
              {stat.chips ? (
                <div className="mb-1.5 flex flex-wrap gap-1.5">
                  {stat.chips.map((chip, i) => (
                    <span
                      key={chip}
                      className="rounded-md px-2 py-1 font-mono text-[10.5px]"
                      style={{
                        background: i === 0 ? 'color-mix(in oklab, var(--viz-amber) 14%, transparent)' : 'var(--viz-card-3)',
                        color: i === 0 ? 'var(--viz-amber)' : 'var(--viz-text-2)',
                      }}
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading text-[26px] font-extrabold tracking-[-0.02em]" style={{ color: 'var(--viz-amber)' }}>{stat.big}</span>
                  {stat.bigLabel && <span className="text-[11px] text-theme-muted">{stat.bigLabel}</span>}
                </div>
              )}
              {stat.small && (
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-heading text-[16px] font-bold text-theme-secondary">{stat.small}</span>
                  <span className="text-[11px] text-theme-muted">{stat.smallLabel}</span>
                </div>
              )}
              {stat.note && <div className="mt-1.5 text-[11px] leading-[1.4] text-theme-muted">{stat.note}</div>}
            </div>
          ))}
        </div>

        <p className="mt-4 text-[11px] leading-[1.5] text-theme-muted">
          Source: supermemory.ai and github.com/supermemoryai/supermemory, checked 2026-08-19.
          Figures are Supermemory&apos;s own; conditions differ from Statewave&apos;s harness.
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

/* ─── Moving from Supermemory to Statewave ───────────────────────────────── */

interface MigrationRow {
  sm: string
  sw: string
  note: string
  effort: 'direct' | 'rework'
}

const MIGRATION_ROWS: MigrationRow[] = [
  { sm: 'POST /v3/documents { content }', sw: 'sw.add_episode("user-alice", …)', note: 'Documents and chats land as immutable episodes; compilers extract typed memories.', effort: 'direct' },
  { sm: 'POST /v4/search { q }', sw: 'sw.get_context("user-alice", task="…", max_tokens=600)', note: 'Ranked, token-bounded bundle with per-memory metadata and an optional receipt, not raw scored hits.', effort: 'direct' },
  { sm: 'GET /v4/profile', sw: 'profile_fact memories in the bundle', note: 'The extracted profile becomes typed profile_fact rows with confidence and validity.', effort: 'direct' },
  { sm: 'spaces', sw: 'subject_id scoping', note: 'Per-space isolation maps onto Statewave subjects.', effort: 'direct' },
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
          Moving from Supermemory to Statewave
        </Heading>
        <p className="mt-4 text-[17px] leading-[1.6] text-theme-secondary/90">
          The conceptual translation is straightforward: documents become episodes, search becomes
          context. Plan a parallel-run period; the cutover is typically read-then-write rather
          than a flag flip.
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
            <div className="px-6 py-3.5 font-mono text-[11px] tracking-[0.08em] text-theme-muted">SUPERMEMORY</div>
            <div className="border-l border-theme-border" />
            <div className="border-l border-theme-border px-6 py-3.5 font-mono text-[11px] tracking-[0.08em] text-accent">STATEWAVE</div>
          </div>

          {MIGRATION_ROWS.map((row) => (
            <div key={row.sm} className="grid grid-cols-1 border-t border-theme-border sm:grid-cols-[1fr_44px_1.2fr]">
              <div className="px-6 py-5 font-mono text-[12.5px] leading-[1.7] text-theme-muted">{row.sm}</div>
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
          Supermemory&apos;s extracted user profile maps onto Statewave&apos;s profile_fact
          memories; free-form documents land as episodes and are compiled into typed memories. If
          you rely on Supermemory&apos;s memory-graph visualization or sub-300ms hosted latency,
          benchmark Statewave on your own corpus before committing.
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
  { tag: 'OVERVIEW', q: 'How is Statewave different from Supermemory?', a: 'Supermemory is a fast memory and context engine: it ingests documents and chats, extracts memories into a graph with user profiles, and answers search with hybrid vector-plus-keyword retrieval and a context-aware reranker, optimized for recall and sub-300ms latency. Statewave compiles raw episodes into typed memories with confidence and validity, ranks them with a fixed scoring model to a token budget, and returns a deterministic bundle, per-row kind, confidence, validity, and source episode ids, with read-path governance and optional receipts.' },
  { tag: 'BENCHMARKS', q: 'Can I compare Statewave’s 0.905 against Supermemory’s 59.7%?', a: 'No, they measure different things. Statewave’s 0.905 is end-to-end QA answer accuracy (LLM-judged) on LoCoMo; Supermemory’s 59.7% is Precision@1, a retrieval metric measuring whether the top passage was the right one. Different metrics, different answerer models, different sample sizes. Read each product’s numbers on its own terms and, ideally, benchmark both on your own workload.' },
  { tag: 'DEPLOYMENT', q: 'Isn’t Supermemory also open-source and self-hostable?', a: 'Yes. Supermemory ships a self-hostable binary and a managed hosted platform, and it uses Postgres with pgvector like Statewave. So self-hosted and single store aren’t the dividing lines here. The real differences are on the read path: deterministic, inspectable, provenance-traced assembly with governance and receipts (Statewave) versus fast, recall-tuned reranked search with an extracted profile and memory graph (Supermemory).' },
  { tag: 'PERFORMANCE', q: 'Which one is faster?', a: 'Supermemory is explicitly engineered for speed and publishes sub-300ms retrieval at scale. Statewave doesn’t headline a latency number; its read path is a single Postgres query and is designed around determinism and inspectability rather than raw throughput. If latency over very large corpora is your binding constraint, benchmark both on your data.' },
  { tag: 'DETERMINISM', q: 'What makes Statewave retrieval deterministic?', a: 'The bundle is compiled and assembled the same way every run: five ranking signals, kind priority, recency, task relevance, temporal validity, and semantic similarity, combined to a fixed token budget. The same subject, task, and point in time produce the same bytes. A context-aware reranker over a live index can’t promise that, because index state and reranker variation introduce drift.' },
  { tag: 'INTEGRATIONS', q: 'Does it work with Claude, Cursor, or Codex?', a: 'Yes. One command (npx @statewavedev/statewave) boots the runtime, and its shipped MCP server connects any MCP-compatible client: Claude, Cursor, Copilot, and agent runtimes. Supermemory’s hosted platform also ships MCP and connectors; Statewave is self-hosted, so you operate Postgres and a container.' },
  { tag: 'STORAGE', q: 'Can I run it fully offline?', a: 'Yes. Statewave’s storage is Postgres plus pgvector and nothing else, self-hosted with no cloud dependency; the heuristic compiler keeps everything on your network unless you configure an LLM compiler or hosted embeddings. Supermemory’s local binary also runs standalone, but its managed platform and hosted reranker are Cloudflare-edge services, so matching sub-300ms latency at scale means using the hosted tier.' },
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
            Self-host the Apache 2.0 runtime, wire it to your MCP client, and every context call
            can return a receipt.
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

export function StatewaveVsSupermemoryPage() {
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
