import { motion } from 'framer-motion'
import { Section } from '../components/Section'
import { Heading } from '../components/Heading'
import { Button } from '../components/Button'
import { CodeCopyButton } from '../components/CodeCopyButton'
import { usePageSEO } from '../lib/seo'

const GITHUB_URL = 'https://github.com/smaramwbc/statewave'
const BENCHMARKS_REPO_URL = 'https://github.com/smaramwbc/statewave-memory-benchmarks'

/* Mockups below use the `--viz-*` tokens from src/index.css so their
 * neutrals flip with the light/dark theme, same convention as
 * PersonalAssistantMemoryPage / MultiAgentSharedContextPage. */

function Mem0Badge({ size = 22 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-md font-mono font-semibold text-theme-muted"
      style={{ width: size, height: size, background: 'var(--viz-card-3)', fontSize: size * 0.45 }}
    >
      m0
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

          <h1 className="mx-auto mt-7 font-heading text-[clamp(2.6rem,6vw,4.6rem)] font-extrabold leading-[1.04] tracking-[-0.045em] text-theme-primary">
            <span className="block text-theme-muted">Mem0 recalls what&apos;s similar</span>
            <span className="block">Statewave decides what&apos;s delivered</span>
          </h1>

          <p className="mx-auto mt-6 max-w-[600px] text-[18px] leading-[1.6] text-theme-secondary">
            Mem0 ranks by relevance and hands you the result. Statewave assembles
            a deterministic, token-bounded context bundle and returns an
            integrity-hashed receipt of exactly what the agent saw.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button to="#bench" variant="primary" size="lg">
              See the benchmark
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
          <HeroBundleVisual />
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

function HeroBundleVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[680px]">
      <div
        className="pointer-events-none absolute inset-x-[10%] -top-6 bottom-6 rounded-[3rem] blur-[90px]"
        style={{ background: 'var(--viz-hero-glow-primary)' }}
        aria-hidden="true"
      />

      <div
        className="relative z-10 w-full overflow-hidden rounded-2xl border text-left"
        style={{ borderColor: 'var(--viz-border-strong)', background: 'var(--viz-shell)', boxShadow: 'var(--viz-shell-shadow)' }}
      >
        <div
          className="flex items-center gap-3 border-b px-5 py-4"
          style={{ borderColor: 'var(--viz-border)', background: 'var(--viz-shell-header)' }}
        >
          <StatewaveBadge size={30} />
          <div className="leading-tight">
            <p className="font-heading text-sm font-bold" style={{ color: 'var(--viz-text)' }}>ContextAssembler</p>
            <p className="text-[11px]" style={{ color: 'var(--viz-text-muted)' }}>deterministic &middot; token-bounded</p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-accent/[0.16] px-2.5 py-1 text-[10.5px] font-semibold text-accent">
            budget 1,180/1,500
          </span>
        </div>

        <div className="flex flex-col gap-2.5 p-5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--viz-text-muted)' }}>
            ranked context bundle
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/10 px-3.5 py-2.5">
            <span className="rounded-md bg-[var(--viz-card-3)] px-2 py-1 font-mono text-[10px] font-semibold text-accent">profile_fact</span>
            <span className="flex-1 text-[12px]" style={{ color: 'var(--viz-text)' }}>prefers succulents, low-water</span>
            <span className="font-mono text-[10px] text-brand-500">score 18.2</span>
          </div>

          <div
            className="flex items-center gap-3 rounded-xl border px-3.5 py-2.5"
            style={{ borderColor: 'var(--viz-border)', background: 'var(--viz-card)' }}
          >
            <span className="rounded-md bg-[var(--viz-card-3)] px-2 py-1 font-mono text-[10px] font-semibold" style={{ color: 'var(--viz-text-2)' }}>procedure</span>
            <span className="flex-1 text-[12px]" style={{ color: 'var(--viz-text-2)' }}>refund flow for orders &lt; 30d</span>
            <span className="font-mono text-[10px]" style={{ color: 'var(--viz-text-muted)' }}>score 15.6</span>
          </div>

          <div
            className="flex items-center gap-3 rounded-xl border border-dashed px-3.5 py-2.5 opacity-60"
            style={{ borderColor: 'var(--viz-border)', background: 'var(--viz-card)' }}
          >
            <span className="rounded-md bg-[var(--viz-card-3)] px-2 py-1 font-mono text-[10px] font-semibold" style={{ color: 'var(--viz-text-muted)' }}>episode</span>
            <span className="flex-1 text-[12px] line-through" style={{ color: 'var(--viz-text-muted)' }}>old address on file</span>
            <span className="font-mono text-[10px]" style={{ color: 'var(--viz-text-muted)' }}>&minus;4 expired &middot; dropped</span>
          </div>

          <div
            className="mt-1 flex items-center gap-2 rounded-xl border px-3 py-2.5"
            style={{ borderColor: 'var(--viz-border)', background: 'var(--viz-code-bg)' }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            <span className="font-mono text-[10.5px]" style={{ color: 'var(--viz-text-muted)' }}>receipt</span>
            <span className="font-mono text-[10.5px]" style={{ color: 'var(--viz-text-2)' }}>01J9Z4&middot;&middot;&middot; &middot; sha256:a3f9c1 &middot; bundle:7c21 (enforce)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function HeroStatStrip() {
  const stats = [
    { value: '0.905', label: 'LoCoMo, n=1,540' },
    { value: '4', label: 'ranking signals, deterministic' },
    { value: '708', label: 'unit tests · 56 evals' },
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

/* ─── The gap ─────────────────────────────────────────────────────────────── */

function GapSection() {
  return (
    <Section id="gap" className="relative overflow-hidden bg-surface-1">
      {/* --soft: this section's Statewave panel carries its own saturated
          chart series color below, so the ambient wash stays behind the
          data instead of washing over it — see .section-glow--soft. */}
      <div aria-hidden="true" className="section-glow-full section-glow--soft" />

      <div className="relative">
        <Heading
          id="gap-heading"
          className="max-w-3xl font-heading text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-theme-primary md:text-[48px]"
        >
          Ranked by similarity, or assembled by policy
        </Heading>

        <p className="mt-6 max-w-2xl text-[17px] leading-[1.6] text-theme-secondary/90">
          Mem0 partitions memory by an id you pass, then ranks what it finds by a
          blend of vector similarity, keyword overlap and entity matches.
          Statewave ingests each event as an immutable episode, compiles those
          into typed memories with confidence and validity, and assembles a
          ranked bundle the same way on every call.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* mem0 side */}
          <div className="flex flex-col">
            <div className="flex flex-1 flex-col gap-5 rounded-[1.75rem] border border-theme-border bg-surface-2/40 p-7 shadow-sm sm:p-8">
              <div className="flex items-center gap-2.5">
                <Mem0Badge />
                <span className="font-heading text-base font-bold text-theme-primary">Mem0 &middot; flat identity filters</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {['user_id', 'agent_id', 'run_id', 'app_id'].map((id) => (
                  <span
                    key={id}
                    className="rounded-lg border border-theme-border bg-surface-1 px-3 py-2.5 text-center font-mono text-[12.5px] text-theme-muted"
                  >
                    {id}
                  </span>
                ))}
              </div>

              <div className="h-px bg-[repeating-linear-gradient(90deg,var(--theme-border)_0_5px,transparent_5px_10px)]" />

              <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-theme-border bg-surface-1 px-4 py-3.5">
                <span className="font-mono text-[12px] text-theme-muted">vector search &rarr;</span>
                <span className="text-[13px] text-theme-secondary">candidate pool, re-scored before return</span>
              </div>
            </div>

            <div className="mt-5">
              <p className="font-heading text-lg font-bold text-theme-primary">Retrieval is non-deterministic</p>
              <p className="mt-2 text-[14.5px] leading-[1.6] text-theme-muted">
                The caller picks an id and the store ranks by relevance. Expiry
                exists but is opt-in with no default, and there is no kind
                priority and no recency decay &mdash; so an address the customer
                changed months ago, with no expiry set, can still rank above the
                current one.
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
                {[
                  { kind: 'profile_fact', pct: 100, score: 10 },
                  { kind: 'procedure', pct: 80, score: 8 },
                  { kind: 'episode_summary', pct: 50, score: 5 },
                  { kind: 'raw_episode', pct: 30, score: 3 },
                ].map((row) => (
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
                Given the same subject, task, and token budget, the assembler
                returns the identical bundle every run. Four additive signals
                set the order: kind priority (3&ndash;10), recency (0&ndash;5),
                task relevance (0&ndash;8), and temporal validity (&minus;4 to +3).
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ─── How order is decided ───────────────────────────────────────────────── */

const SIGNALS = [
  { label: 'KIND PRIORITY', range: '3–10', note: 'typed profile facts outrank raw episodes' },
  { label: 'RECENCY', range: '0–5', note: 'linear by age, newest scores highest' },
  { label: 'TASK RELEVANCE', range: '0–8', note: 'lexical overlap plus cosine similarity' },
  { label: 'TEMPORAL VALIDITY', range: '−4…+3', note: 'valid facts gain +3, expired ones lose 4' },
]

function SignalsStrip() {
  return (
    <Section className="pt-0">
      <div className="overflow-hidden rounded-[1.75rem] border border-theme-border bg-surface-1 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-theme-border bg-surface-2 px-7 py-5">
          <span className="font-heading text-base font-bold text-theme-primary">How order is decided</span>
          <span className="font-mono text-[12px] text-theme-muted">score = priority + recency + relevance + validity</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4">
          {SIGNALS.map((s, i) => (
            <div
              key={s.label}
              className={`p-7 ${i < SIGNALS.length - 1 ? 'border-b sm:border-b-0 sm:border-r' : ''} ${i === 1 ? 'sm:border-r-0 lg:border-r' : ''} border-theme-border`}
            >
              <div className="mb-3 font-mono text-[11px] text-accent">{s.label}</div>
              <div className="font-heading text-[30px] font-extrabold tracking-[-0.03em] text-theme-primary">{s.range}</div>
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
  m0: string
  sw: string
}

const RETRIEVAL_ROWS: CompareRow[] = [
  { cap: 'How context is selected', m0: 'Top-k embedding-nearest as the candidate pool, then re-scored', sw: 'Deterministic assembly, additively scored to a token budget' },
  { cap: 'Ranking signals', m0: 'Vector similarity fused with keyword and entity boosts; optional reranker', sw: 'Kind priority, recency, task relevance, temporal validity' },
  { cap: 'Stale / expired facts', m0: 'Optional expiry, off by default; no confidence score or decay', sw: 'Penalised −4 and dropped before assembly' },
  { cap: 'Same query, same result', m0: 'Varies with the index', sw: 'Byte-identical bundle every run' },
]

const GOVERNANCE_ROWS: CompareRow[] = [
  { cap: 'Proof of what the agent saw', m0: 'None', sw: 'Immutable, ULID-addressable receipt with an integrity hash' },
  { cap: 'Policy on the read path', m0: 'Implement it in your app', sw: 'Declarative bundles: deny or redact by label and caller' },
  { cap: 'Provenance to source', m0: 'Session ids automatic; links to source documents by hand', sw: 'Source episode ids, confidence, and validity per memory' },
  { cap: 'Subject deletion (GDPR)', m0: 'One call per subject; change history is retained', sw: 'One call clears episodes, memories, and receipts' },
]

const OPS_ROWS: CompareRow[] = [
  { cap: 'Storage', m0: 'Pluggable vector stores', sw: 'Postgres and pgvector, nothing else to run' },
  { cap: 'Graph / relationship memory', m0: 'Built-in entity linking; graph is a ranking signal, not traversable', sw: 'Typed memories with provenance, no graph tier' },
  { cap: 'Interface', m0: 'Python and TypeScript SDKs, REST, CLI, hosted MCP server', sw: 'REST, Python and TypeScript SDKs, MCP server, connectors' },
  { cap: 'License', m0: 'Apache 2.0 core, paid platform', sw: 'Apache 2.0 throughout, runs fully offline' },
]

function CompareGroup({ title, rows }: { title: string; rows: CompareRow[] }) {
  return (
    <>
      <div className="border-t border-theme-border bg-[var(--viz-code-bg)] px-6 py-3 font-mono text-[11px] tracking-[0.08em] text-theme-muted sm:px-7">
        {title}
      </div>

      {/* Desktop: table. Mobile: stacked cards (see block below) — same
          rationale as WhyPage's comparison table: a 3-column grid on a
          phone either clips the Statewave column or shrinks everything
          to unreadable widths. */}
      <div className="hidden md:block">
        {rows.map((row) => (
          <div key={row.cap} className="grid grid-cols-[1.7fr_1.3fr_1.3fr] border-t border-theme-border">
            <div className="px-7 py-5 text-[15px] text-theme-primary">{row.cap}</div>
            <div className="border-l border-theme-border px-6 py-5 text-[14px] leading-[1.5] text-theme-muted">{row.m0}</div>
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
                <dt className="mt-0.5 shrink-0"><Mem0Badge size={18} /></dt>
                <dd className="text-[13px] leading-[1.5] text-theme-muted">{row.m0}</dd>
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
          Both are memory layers for agents. They diverge on what the runtime
          enforces and what you have to build or pay for.
        </p>
      </div>

      <div className="mt-12 overflow-hidden rounded-[1.75rem] border border-theme-border shadow-sm">
        <div className="grid grid-cols-[1.7fr_1.3fr_1.3fr] bg-surface-2">
          <div className="px-7 py-5 font-mono text-[11px] tracking-[0.08em] text-theme-muted">CAPABILITY</div>
          <div className="flex items-center gap-2 border-l border-theme-border px-6 py-5 font-heading text-[15px] font-bold text-theme-primary">
            <Mem0Badge size={20} />
            Mem0
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
        Mem0 replaced external graph databases with built-in entity linking in
        its v3 release (April 2026); the graph now feeds relevance scoring
        rather than being a store you query. Rows reflect each product&apos;s
        public docs as of August 2026.
      </p>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-theme-border bg-surface-1 p-7">
          <div className="mb-3 flex items-center gap-2.5">
            <Mem0Badge />
            <span className="font-heading text-[17px] font-bold text-theme-primary">Reach for Mem0 when</span>
          </div>
          <p className="text-[14.5px] leading-[1.6] text-theme-muted">
            You are giving a single assistant persistent memory, want a mature
            SDK with broad framework integrations, and one identity scope
            &mdash; user, agent, run, or app &mdash; describes how your data
            partitions.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-accent/30 bg-surface-1 p-7">
          <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-32 w-52 rounded-full bg-accent/[0.09] blur-3xl" />
          <div className="relative mb-3 flex items-center gap-2.5">
            <StatewaveBadge />
            <span className="font-heading text-[17px] font-bold text-accent">Reach for Statewave when</span>
          </div>
          <p className="relative text-[14.5px] leading-[1.6] text-theme-secondary">
            Agents run in production across many sessions and you need
            deterministic context, provenance back to source episodes, policy
            enforced on the read path, and an auditable receipt for every
            decision.
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
        One returning customer, two runtimes
      </Heading>

      <p className="mt-6 max-w-2xl text-[17px] leading-[1.6] text-theme-secondary/90">
        A support agent resumes a customer thread three weeks later. In
        between, the customer moved house and pasted a card number into an
        earlier message. The same episode history runs through each system.
      </p>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <CodePanel
          badge={<Mem0Badge size={20} />}
          title="Mem0 · search by id"
          calloutTone="muted"
          lines={[
            <span key="1" style={{ color: 'var(--viz-code-muted)' }}># retrieve context for the reply</span>,
            <span key="2"><span style={{ color: 'var(--color-accent)' }}>&rsaquo;</span> client.search(<span style={{ color: 'var(--viz-code-text)' }}>&quot;where do I ship it&quot;</span>,</span>,
            <span key="3">&nbsp;&nbsp;user_id=<span style={{ color: 'var(--viz-code-text)' }}>&quot;cust_5521&quot;</span>)</span>,
            <span key="4" className="mt-3 block" style={{ color: 'var(--viz-code-muted)' }}># ranked by relevance</span>,
            <div key="5" className="mt-2 flex flex-col gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-theme-border bg-surface-2 px-3 py-2 text-[11.5px]" style={{ color: 'var(--viz-code-muted)' }}>
                old address &middot; Elm St
                <span className="ml-auto text-amber-500">stale, no expiry set</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-theme-border bg-surface-2 px-3 py-2 text-[11.5px]" style={{ color: 'var(--viz-code-muted)' }}>
                card 4242 4242 &middot;&middot;&middot;&middot;
                <span className="ml-auto text-amber-500">pii, no policy gate</span>
              </div>
            </div>,
          ]}
          callout="Expiry, redaction and any policy on the read path are left to the application to build and keep correct."
        />

        <CodePanel
          badge={<StatewaveBadge size={20} />}
          title="Statewave · assemble + govern"
          calloutTone="accent"
          lines={[
            <span key="1" style={{ color: 'var(--viz-code-muted)' }}># assemble a ranked, bounded bundle</span>,
            <span key="2"><span style={{ color: 'var(--color-accent)' }}>&rsaquo;</span> assemble(subject=<span style={{ color: 'var(--color-accent)' }}>&quot;cust_5521&quot;</span>,</span>,
            <span key="3">&nbsp;&nbsp;task=<span style={{ color: 'var(--color-accent)' }}>&quot;where do I ship it&quot;</span>, budget=<span style={{ color: 'var(--color-brand-500)' }}>1500</span>)</span>,
            <div key="4" className="mt-3 flex flex-col gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-[11.5px]" style={{ color: 'var(--viz-code-text)' }}>
                new address &middot; Oak Ave
                <span className="ml-auto text-brand-500">valid +3 &middot; ranked #1</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-dashed border-theme-border bg-surface-2 px-3 py-2 text-[11.5px] opacity-60" style={{ color: 'var(--viz-code-muted)' }}>
                <span className="line-through">old address &middot; Elm St</span>
                <span className="ml-auto">&minus;4 expired &middot; dropped</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-theme-border bg-surface-2 px-3 py-2 text-[11.5px]" style={{ color: 'var(--viz-code-muted)' }}>
                card &#9679;&#9679;&#9679;&#9679; &#9679;&#9679;&#9679;&#9679; &middot;&middot;&middot;&middot;
                <span className="ml-auto text-accent">label:pii &middot; redacted</span>
              </div>
            </div>,
          ]}
          callout="The runtime decides: the superseded address scores out, the card is redacted by its policy label, and the receipt stores an integrity hash of exactly what was delivered."
        />
      </div>
    </Section>
  )
}

/* ─── Every call leaves a receipt ────────────────────────────────────────── */

const MECHANISM_CARDS = [
  { icon: '{}', title: 'Policy engine', body: 'Content-hashed YAML or JSON bundles. Deny or redact by sensitivity label and caller identity; log_only records each decision so you can audit a policy before enforcing it.' },
  { icon: '#', title: 'Sensitivity labels', body: 'Per-memory pii, financial, and secret tags in a GIN-indexed array, so policy filters run inside the query rather than after it.' },
  { icon: '←', title: 'Full provenance', body: 'Every compiled memory keeps the source episode ids, confidence score, and validity window it was derived from.' },
  { icon: '⌫', title: 'Subject deletion', body: 'One GDPR-style call erases every episode, memory, and receipt for a subject, leaving no orphaned rows behind.' },
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
          Every call leaves a receipt
        </Heading>
        <p className="mt-4 text-[17px] leading-[1.6] text-theme-secondary/90">
          Mem0 leaves auditability to your application. In Statewave every
          assembly is governed and recorded in the core, on the read path,
          under Apache 2.0.
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

/* ─── Benchmarks ──────────────────────────────────────────────────────────── */

/* Flat categorical fills, not a rank gradient — each hue names one system
 * (see --series-* in index.css), and length alone carries the score. */
const LOCOMO_SERIES: Record<'sw' | 'm0-cloud' | 'm0-oss', string> = {
  sw: '--series-statewave',
  'm0-cloud': '--series-mem0-cloud',
  'm0-oss': '--series-mem0-oss',
}

function LoCoMoBar({ label, value, pct, tone }: { label: React.ReactNode; value: string; pct: number; tone: 'sw' | 'm0-cloud' | 'm0-oss' }) {
  const seriesColor = `var(${LOCOMO_SERIES[tone]})`
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="flex items-center gap-2 text-[14px] font-semibold text-theme-primary">{label}</span>
        <span className="font-heading text-xl font-extrabold tracking-[-0.02em]" style={{ color: seriesColor }}>{value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-[3px] bg-surface-2">
        <div className="h-full rounded-[3px]" style={{ width: `${pct}%`, background: seriesColor }} />
      </div>
    </div>
  )
}

function BenchmarksSection() {
  return (
    <Section id="bench" className="bg-surface-1">
      <div className="mx-auto max-w-2xl text-center">
        <Heading
          id="bench-heading"
          className="font-heading text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-theme-primary md:text-[48px]"
        >
          A fair, in-harness win
        </Heading>
        <p className="mt-4 text-[17px] leading-[1.6] text-theme-secondary/90">
          Measured on Mem0&apos;s own harness, same models, judge unchanged. A
          narrow, reproducible win beats an inflated one.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-[1.75rem] border border-theme-border bg-surface-2/40 p-7 shadow-sm sm:p-8">
          <div className="mb-6 flex items-baseline justify-between">
            <span className="font-heading text-[17px] font-bold text-theme-primary">LoCoMo &middot; LLM-judge</span>
            <span className="font-mono text-[12px] text-theme-muted">n=1,540</span>
          </div>

          <div className="flex flex-col gap-5">
            <LoCoMoBar label={<><StatewaveBadge size={16} />Statewave</>} value="0.905" pct={90.5} tone="sw" />
            <LoCoMoBar label={<><Mem0Badge size={16} />mem0 cloud</>} value="0.899" pct={89.9} tone="m0-cloud" />
            <LoCoMoBar label={<><Mem0Badge size={16} />mem0 OSS</>} value="0.866" pct={86.6} tone="m0-oss" />
          </div>

          <div className="mt-6 rounded-xl border border-theme-border bg-surface-1 p-4 text-[12.5px] leading-[1.5] text-theme-muted">
            Note &middot; mem0 OSS caps retrieval at &le;20 memories/query by
            library default; Statewave and cloud honor the top-200 request.
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-[1.75rem] border border-theme-border bg-surface-2/40 p-7">
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="font-heading text-[15px] font-bold text-theme-primary">LongMemEval</span>
              <span className="font-mono text-[11px] text-theme-muted">n=30 &middot; directional</span>
            </div>
            <div className="mt-3 flex items-baseline gap-3.5">
              <div>
                <div className="font-heading text-[32px] font-extrabold tracking-[-0.02em] text-accent">0.933</div>
                <div className="mt-0.5 text-[12px] text-theme-muted">mem0 cloud</div>
              </div>
              <span className="font-mono text-theme-border">&middot;</span>
              <div>
                <div className="font-heading text-[32px] font-extrabold tracking-[-0.02em] text-theme-primary">0.833</div>
                <div className="mt-0.5 text-[12px] text-theme-muted">mem0 OSS</div>
              </div>
            </div>
            <p className="mt-3 text-[12.5px] leading-[1.5] text-theme-muted">
              Statewave leads both. Treat n=30 as directional; LoCoMo at
              n=1,540 is the robust figure.
            </p>
          </div>

          <div className="relative flex-1 overflow-hidden rounded-[1.75rem] border border-accent/30 bg-surface-2/40 p-7">
            <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-32 w-52 rounded-full bg-accent/[0.09] blur-3xl" />
            <div className="relative flex items-baseline gap-2.5">
              <span className="font-heading text-[36px] font-extrabold tracking-[-0.03em] text-accent">8/8</span>
              <span className="text-[14px] text-theme-primary">support eval vs <span className="text-theme-muted">2/8 naive</span></span>
            </div>
            <p className="relative mt-3 text-[12.5px] leading-[1.5] text-theme-muted">
              Facts persist across sessions, token budgets hold, provenance
              traces to source episodes, and compilation stays idempotent.
            </p>
          </div>
        </div>
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
          <div className="mt-1.5"># same gpt-4.1 extraction, judge &amp; scoring code untouched from upstream</div>
        </div>
      </div>
    </Section>
  )
}

function TerminalDots() {
  return (
    <div className="flex gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
      <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
      <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
    </div>
  )
}

/* ─── Moving over from Mem0 ───────────────────────────────────────────────── */

interface MigrationRow {
  m0: string
  sw: string
  note: string
}

const MIGRATION_ROWS: MigrationRow[] = [
  { m0: 'client.add("…", user_id="cust_5521")', sw: 'record(subject="cust_5521", event="…")', note: 'Ingested as an immutable episode; compilers extract typed memories.' },
  { m0: 'client.search("…", user_id="cust_5521")', sw: 'assemble(subject="cust_5521", task="…", budget=1500)', note: 'Ranked, token-bounded bundle plus a receipt of what was delivered.' },
  { m0: 'client.get_all(user_id="cust_5521")', sw: 'memories(subject="cust_5521", kind="profile_fact")', note: 'Browse by kind, subject, or validity; provenance attached.' },
  { m0: 'client.delete_all(user_id="cust_5521")', sw: 'delete_subject("cust_5521")', note: 'Removes every episode, memory, and receipt in one call — receipts included.' },
]

const INSTALL_CMD = 'npx @statewavedev/statewave'

function MigrationSection() {
  return (
    <Section id="start">
      <div className="mx-auto max-w-2xl text-center">
        <Heading
          id="migration-heading"
          className="font-heading text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-theme-primary md:text-[48px]"
        >
          Moving over from Mem0
        </Heading>
        <p className="mt-4 text-[17px] leading-[1.6] text-theme-secondary/90">
          One command boots the whole runtime. Every Mem0 call has a direct
          counterpart, and each write lands as an immutable episode.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-4xl">
        <div className="mb-6 overflow-hidden rounded-[1.75rem] border border-theme-border" style={{ background: 'var(--viz-code-bg)' }}>
          <div className="flex items-center gap-2.5 border-b border-theme-border/60 px-6 py-4">
            <TerminalDots />
            <span className="font-mono text-[12px]" style={{ color: 'var(--viz-code-muted)' }}>one command &middot; auto-wires Claude Code, Cursor, Codex</span>
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
            <div className="px-6 py-3.5 font-mono text-[11px] tracking-[0.08em] text-theme-muted">MEM0 SDK</div>
            <div className="border-l border-theme-border" />
            <div className="border-l border-theme-border px-6 py-3.5 font-mono text-[11px] tracking-[0.08em] text-accent">STATEWAVE</div>
          </div>

          {MIGRATION_ROWS.map((row) => (
            <div key={row.m0} className="grid grid-cols-1 border-t border-theme-border sm:grid-cols-[1fr_44px_1.2fr]">
              <div className="px-6 py-5 font-mono text-[12.5px] leading-[1.7] text-theme-muted">{row.m0}</div>
              <div className="hidden items-center justify-center border-l border-theme-border font-mono text-sm text-brand-500 sm:flex">&rarr;</div>
              <div className="border-t border-theme-border bg-accent/[0.05] px-6 py-5 sm:border-l sm:border-t-0">
                <div className="font-mono text-[12.5px] leading-[1.7] text-theme-secondary">{row.sw}</div>
                <div className="mt-2 text-[12.5px] leading-[1.5] text-theme-muted">{row.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ─── FAQ ─────────────────────────────────────────────────────────────────── */

const FAQS = [
  { q: 'How is Statewave different from Mem0?', a: 'Mem0 ranks memories by relevance for an id you pass. Statewave compiles raw episodes into typed memories, ranks them with a fixed scoring model to a token budget, applies policy on the read path, and returns an integrity-hashed receipt of exactly what was delivered.' },
  { q: 'What makes retrieval deterministic?', a: 'A fixed scoring model: kind priority (3–10), recency (0–5), task relevance (0–8), and temporal validity (−4 to +3). The same subject, task, and budget produce the same bundle every time.' },
  { q: 'What is a state-assembly receipt?', a: 'An immutable, ULID-addressable record of one context call. It carries a byte-level integrity hash of what was delivered and references the policy bundle hash, so ‘what did the agent see, under which policy’ is answerable forever.' },
  { q: 'Does it work with Claude, Cursor, or Codex?', a: 'Yes. One command (npx @statewavedev/statewave) boots the runtime and auto-wires Claude Code, Claude Desktop, Cursor, VS Code Copilot, and Codex CLI. Any MCP-compatible client connects too.' },
  { q: 'Can I run it fully offline?', a: 'Yes. Storage is Postgres-only and self-hosted. The heuristic compiler keeps everything on your network; nothing leaves unless you configure an LLM compiler or hosted embeddings.' },
]

function FaqSection() {
  return (
    <Section id="faq" className="bg-surface-1">
      <Heading
        id="faq-heading"
        className="text-center font-heading text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-theme-primary"
      >
        Frequently asked
      </Heading>

      <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-[1.75rem] border border-theme-border">
        {FAQS.map((f, i) => (
          <div key={f.q} className={`p-7 sm:p-8 ${i > 0 ? 'border-t border-theme-border' : ''}`}>
            <p className="mb-2.5 font-heading text-[16.5px] font-bold text-theme-primary">{f.q}</p>
            <p className="text-[14.5px] leading-[1.6] text-theme-muted">{f.a}</p>
          </div>
        ))}
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

        <div className="relative z-10 mx-auto max-w-2xl">
          <Heading
            id="give-your-agent-context"
            className="font-heading text-4xl md:text-[56px] font-bold leading-[1.05] tracking-[-0.04em] text-theme-primary"
          >
            Give your agent context it can prove
          </Heading>

          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-[1.6] text-theme-secondary/85">
            Self-host the Apache 2.0 runtime, wire it to your MCP client, and
            every context call comes back with a receipt.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button href={GITHUB_URL} size="lg">
              Get started
              <ArrowIcon />
            </Button>
            <Button href="https://github.com/smaramwbc/statewave-docs" variant="secondary" size="lg">
              Read the docs
            </Button>
          </div>

          <p className="mx-auto mt-10 max-w-xl text-[12px] leading-[1.6] text-theme-muted">
            &quot;mem0&quot; is a trademark of its respective owner. References
            to mem0 on this page are nominative, for benchmark-comparison
            purposes only, and do not imply any affiliation with or
            endorsement by mem0ai.
          </p>
        </div>
      </div>
    </Section>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export function StatewaveVsMem0Page() {
  usePageSEO()

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
