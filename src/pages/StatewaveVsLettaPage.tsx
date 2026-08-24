import { useState } from 'react'
import { motion } from 'framer-motion'
import { Section } from '../components/Section'
import { Heading } from '../components/Heading'
import { Button } from '../components/Button'
import { CodeCopyButton } from '../components/CodeCopyButton'
import { usePageSEO } from '../lib/seo'
import { faqPageJsonLd } from '../lib/seo-meta'

/*
 * /vs/letta: the sibling of /vs/mem0, and deliberately its twin: same section
 * order, same components, same tokens. Only the competitor and the argument
 * change: Mem0 ranks by similarity, Letta hands memory to the model itself.
 *
 * Rewritten 2026-08-24: letta-ai/letta is now a landing page (the V1 server
 * this page originally described was archived 2026-08-16, source preserved
 * on the `archive` branch). Current Letta is letta-ai/letta-code
 * (`npm install -g @letta-ai/letta-code`); memory is MemFS, a git-backed
 * filesystem tracking all context including memory blocks, not the old
 * core/recall/archival tier model. The five memory tools that detach once
 * MemFS is enabled are `memory`, `memory_apply_patch`, `memory_insert`,
 * `memory_replace`, and `memory_rethink` (letta-ai/letta-code
 * src/tools/toolset.ts:57-62); `archival_memory_insert`,
 * `archival_memory_search`, and `core_memory_replace` no longer exist in the
 * repo. The central argument survives the rewrite unchanged: Letta still
 * hands memory to the model, and MemFS makes that more literal than the tier
 * model did.
 *
 * Mockups use the `--viz-*` tokens from src/index.css so their neutrals flip
 * with the light/dark theme, same convention as StatewaveVsMem0Page.
 */

const GITHUB_URL = 'https://github.com/smaramwbc/statewave'
const DOCS_URL = 'https://github.com/smaramwbc/statewave-docs'
const BENCHMARKS_REPO_URL = 'https://github.com/smaramwbc/statewave-memory-benchmarks'
/* docs.letta.com/leaderboard 308-redirects here; link the destination so the
 * citation doesn't depend on a redirect staying in place. */
const LETTA_LEADERBOARD_URL = 'https://leaderboard.letta.com/'

function LettaBadge({ size = 22 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-md font-mono font-semibold text-theme-muted"
      style={{ width: size, height: size, background: 'var(--viz-card-3)', fontSize: size * 0.45 }}
    >
      la
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

          <h1 className="mx-auto mt-7 font-heading text-[clamp(1.9rem,4.6vw,3.6rem)] font-extrabold leading-[1.1] tracking-[-0.04em] text-theme-primary">
            <span className="block text-theme-muted">Letta lets the model manage memory</span>
            <span className="block">Statewave manages memory for the model</span>
          </h1>

          <p className="mx-auto mt-6 max-w-[600px] text-[18px] leading-[1.6] text-theme-secondary">
            Letta hands memory to the model and lets it decide. Statewave
            assembles a deterministic, token-bounded context bundle and
            returns an integrity-hashed receipt of what the agent saw.
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
            <span className="font-mono text-[10px] text-brand-500">rank 1</span>
          </div>

          <div
            className="flex items-center gap-3 rounded-xl border px-3.5 py-2.5"
            style={{ borderColor: 'var(--viz-border)', background: 'var(--viz-card)' }}
          >
            <span className="rounded-md bg-[var(--viz-card-3)] px-2 py-1 font-mono text-[10px] font-semibold" style={{ color: 'var(--viz-text-2)' }}>procedure</span>
            <span className="flex-1 text-[12px]" style={{ color: 'var(--viz-text-2)' }}>refund flow for orders &lt; 30d</span>
            <span className="font-mono text-[10px]" style={{ color: 'var(--viz-text-muted)' }}>rank 2</span>
          </div>

          <div
            className="flex items-center gap-3 rounded-xl border border-dashed px-3.5 py-2.5 opacity-60"
            style={{ borderColor: 'var(--viz-border)', background: 'var(--viz-card)' }}
          >
            <span className="rounded-md bg-[var(--viz-card-3)] px-2 py-1 font-mono text-[10px] font-semibold" style={{ color: 'var(--viz-text-muted)' }}>episode</span>
            <span className="flex-1 text-[12px] line-through" style={{ color: 'var(--viz-text-muted)' }}>old address on file</span>
            <span className="font-mono text-[10px]" style={{ color: 'var(--viz-text-muted)' }}>expired &middot; dropped</span>
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
    { value: LOCOMO.value, label: `LoCoMo, ${LOCOMO.n}` },
    { value: String(SIGNALS.length), label: 'ranking signals, deterministic' },
    { value: LONGMEMEVAL.value, label: `LongMemEval, ${LONGMEMEVAL.n}` },
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

const LETTA_MEMFS = [
  { tier: 'context', note: 'everything the agent sees, one git-tracked tree' },
  { tier: 'blocks', note: 'memory files inside that tree, model-edited' },
  { tier: 'history', note: 'every edit is a commit, diffable and revertable' },
]

function GapSection() {
  return (
    <Section id="gap" className="relative overflow-hidden bg-surface-1">
      {/* --soft: this section's Statewave panel carries its own saturated
          chart series color below, so the ambient wash stays behind the
          data instead of washing over it (see .section-glow--soft). */}
      <div aria-hidden="true" className="section-glow-full section-glow--soft" />

      <div className="relative">
        <Heading
          id="gap-heading"
          className="max-w-3xl font-heading text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-theme-primary md:text-[48px]"
        >
          The model manages memory, or a runtime does
        </Heading>

        <p className="mt-6 max-w-2xl text-[17px] leading-[1.6] text-theme-secondary/90">
          Letta gives the agent tools to edit its own memory blocks, tracked
          as commits in a git-backed context tree (MemFS): memory is the
          model&apos;s job, decided turn by turn and paid for in tokens.
          Statewave ingests each event as an immutable episode, compiles it
          into typed memories, and assembles a ranked bundle the same way
          every call, with no model in the loop.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* letta side */}
          <div className="flex flex-col">
            <div className="flex flex-1 flex-col gap-5 rounded-[1.75rem] border border-theme-border bg-surface-2/40 p-7 shadow-sm sm:p-8">
              <div className="flex items-center gap-2.5">
                <LettaBadge />
                <span className="font-heading text-base font-bold text-theme-primary">Letta &middot; MemFS, agent-managed</span>
              </div>

              <div className="flex flex-col gap-2.5">
                {LETTA_MEMFS.map((row) => (
                  <div
                    key={row.tier}
                    className="flex items-center gap-3 rounded-lg border border-theme-border bg-surface-1 px-3.5 py-3"
                  >
                    <span className="w-[62px] shrink-0 font-mono text-[12px] text-theme-secondary">{row.tier}</span>
                    <span className="text-[12.5px] text-theme-muted">{row.note}</span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-[repeating-linear-gradient(90deg,var(--theme-border)_0_5px,transparent_5px_10px)]" />

              <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-theme-border bg-surface-1 px-4 py-3.5">
                <span className="font-mono text-[12px] text-theme-muted">agent tool call &rarr;</span>
                <span className="text-[13px] text-theme-secondary">the model decides what to read and write</span>
              </div>
            </div>

            <div className="mt-5">
              <p className="font-heading text-lg font-bold text-theme-primary">Retrieval rides on the model</p>
              <p className="mt-2 text-[14.5px] leading-[1.6] text-theme-muted">
                There&apos;s no ranking or expiry step: the agent reads and
                edits its own context tree directly, and whatever it last
                wrote is what it sees next time. Every operation spends
                inference tokens, and an unwritten fact is gone.
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
                Given the same subject, task, token budget, and point in time,
                the assembler returns the identical bundle every run. Four
                signals set the order: kind priority, recency, task relevance,
                and temporal validity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ─── How order is decided ───────────────────────────────────────────────── */

/* The four scored signals carry their real additive ranges (the same model
 * /vs/mem0 documents). The scorer picks one relevance term, word overlap or
 * cosine similarity, never both, so similarity isn't a separate signal, it's
 * the alternate path task relevance can take. `SIGNALS.length` also feeds
 * the hero stat strip, so the count on this page can only ever be the number
 * of signals actually shown. */
const SIGNALS = [
  { label: 'KIND PRIORITY', value: '3–10', note: 'typed profile facts outrank raw episodes' },
  { label: 'RECENCY', value: '0–5', note: 'linear by age, newest scores highest' },
  { label: 'TASK RELEVANCE', value: '0–8', note: 'word overlap (0-5) or cosine similarity (0-8)' },
  { label: 'TEMPORAL VALIDITY', value: '−4…+3', note: 'valid facts gain +3, expired ones lose 4' },
]

function SignalsStrip() {
  return (
    <Section className="pt-0">
      <div className="overflow-hidden rounded-[1.75rem] border border-theme-border bg-surface-1 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-theme-border bg-surface-2 px-7 py-5">
          <span className="font-heading text-base font-bold text-theme-primary">How order is decided</span>
          <span className="font-mono text-[12px] text-theme-muted">score = priority + recency + relevance + validity</span>
        </div>
        {/* Cell dividers are the 1px grid gap showing the border color through,
            not per-cell border classes. With four cells reflowing 1 → 2 → 4
            across breakpoints, the conditional-class version has to know which
            cell is last in a row at each width, and silently drops the row
            divider at `sm`. The gap draws every interior edge and no exterior
            one, at every column count, for free. */}
        <div className="grid gap-px bg-theme-border sm:grid-cols-2 lg:grid-cols-4">
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
  letta: string
  sw: string
}

const RETRIEVAL_ROWS: CompareRow[] = [
  { cap: 'How context is selected', letta: 'The agent reads and edits its own context tree with tool calls', sw: 'Deterministic assembly, ranked to a token budget' },
  { cap: 'What ranks results', letta: 'The model’s judgment, turn by turn', sw: 'Kind priority, recency, relevance, validity' },
  { cap: 'Cost of retrieval', letta: 'Inference tokens on every memory operation', sw: 'Mechanical; no LLM on the read path' },
  { cap: 'Same query, same result', letta: 'Varies with the model and its tool choices', sw: 'Byte-identical bundle every run' },
]

const GOVERNANCE_ROWS: CompareRow[] = [
  { cap: 'Proof of what the agent saw', letta: 'None; reconstruct it from message logs', sw: 'Immutable, ULID-addressable receipt with an integrity hash' },
  { cap: 'Policy on the read path', letta: 'Implement it in your app or tools', sw: 'Declarative bundles: deny or redact by label and caller' },
  { cap: 'Reliability of capture', letta: 'If the model does not save it, it is gone', sw: 'Every event recorded as an immutable episode' },
  { cap: 'Subject deletion (GDPR)', letta: 'Remove or rewrite files in the context tree directly', sw: 'One call clears episodes, memories, and receipts' },
]

const OPS_ROWS: CompareRow[] = [
  { cap: 'Scope', letta: 'A full stateful-agent platform: you adopt the runtime', sw: 'A memory layer that drops into your existing stack' },
  { cap: 'Storage', letta: 'Self-hosted App Server (Docker Compose, Railway, or Fly.io); memory lives in git-tracked MemFS, no separate archival store', sw: 'Postgres and pgvector, nothing else to run' },
  { cap: 'Interface', letta: 'CLI (letta-code), desktop app, chat.letta.com, Slack/Telegram/Discord', sw: 'REST, Python and TypeScript SDKs, MCP server, connectors' },
  { cap: 'License', letta: 'Apache 2.0, with managed Letta Cloud', sw: 'Apache 2.0 throughout, runs fully offline' },
]

function CompareGroup({ title, rows }: { title: string; rows: CompareRow[] }) {
  return (
    <>
      <div className="border-t border-theme-border bg-[var(--viz-code-bg)] px-6 py-3 font-mono text-[11px] tracking-[0.08em] text-theme-muted sm:px-7">
        {title}
      </div>

      {/* Desktop: table. Mobile: stacked cards (see block below), for the
          same rationale as WhyPage's comparison table: a 3-column grid on a
          phone either clips the Statewave column or shrinks everything
          to unreadable widths. */}
      <div className="hidden md:block">
        {rows.map((row) => (
          <div key={row.cap} className="grid grid-cols-[1.7fr_1.3fr_1.3fr] border-t border-theme-border">
            <div className="px-7 py-5 text-[15px] text-theme-primary">{row.cap}</div>
            <div className="border-l border-theme-border px-6 py-5 text-[14px] leading-[1.5] text-theme-muted">{row.letta}</div>
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
                <dt className="mt-0.5 shrink-0"><LettaBadge size={18} /></dt>
                <dd className="text-[13px] leading-[1.5] text-theme-muted">{row.letta}</dd>
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
          Both give agents memory. They diverge on who does the work (the
          model, or the runtime) and on what you can prove once it has.
        </p>
      </div>

      <div className="mt-12 overflow-hidden rounded-[1.75rem] border border-theme-border shadow-sm">
        <div className="hidden bg-surface-2 md:grid md:grid-cols-[1.7fr_1.3fr_1.3fr]">
          <div className="px-7 py-5 font-mono text-[11px] tracking-[0.08em] text-theme-muted">CAPABILITY</div>
          <div className="flex items-center gap-2 border-l border-theme-border px-6 py-5 font-heading text-[15px] font-bold text-theme-primary">
            <LettaBadge size={20} />
            Letta
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
        Letta (formerly MemGPT) manages memory through the agent&apos;s own
        tool calls against a git-tracked context tree (MemFS), so retrieval
        depends on the model driving it. Rows reflect each product&apos;s
        public docs and source as of August 2026.
      </p>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-theme-border bg-surface-1 p-7">
          <div className="mb-3 flex items-center gap-2.5">
            <LettaBadge />
            <span className="font-heading text-[17px] font-bold text-theme-primary">Reach for Letta when</span>
          </div>
          <p className="text-[14.5px] leading-[1.6] text-theme-muted">
            You&apos;re building agent-first, want the model to manage its own
            context, and value adaptive, self-editing memory over
            reproducibility or an audit trail.
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
            deterministic context, source provenance, policy on the read
            path, and an auditable receipt for every decision.
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
          badge={<LettaBadge size={20} />}
          title="Letta · agent reads its own context tree"
          calloutTone="muted"
          lines={[
            <span key="1" style={{ color: 'var(--viz-code-muted)' }}># the agent's memory is its working tree</span>,
            <span key="2"><span style={{ color: 'var(--color-accent)' }}>&rsaquo;</span> agent.send_message(<span style={{ color: 'var(--viz-code-text)' }}>&quot;where do I ship it&quot;</span>)</span>,
            <span key="3">&nbsp;&nbsp;&#8627; cat context/cust_5521.md</span>,
            <span key="4" className="mt-3 block" style={{ color: 'var(--viz-code-muted)' }}># returns whatever's currently in the file</span>,
            <div key="5" className="mt-2 flex flex-col gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-theme-border bg-surface-2 px-3 py-2 text-[11.5px]" style={{ color: 'var(--viz-code-muted)' }}>
                old address &middot; Elm St
                <span className="ml-auto text-amber-500">stale, still stored</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-theme-border bg-surface-2 px-3 py-2 text-[11.5px]" style={{ color: 'var(--viz-code-muted)' }}>
                card 4242 4242 &middot;&middot;&middot;&middot;
                <span className="ml-auto text-amber-500">pii, no policy gate</span>
              </div>
            </div>,
          ]}
          callout="There's no ranking or expiry step: whatever the model last wrote to the file is what it reads next time, stale entries and all. Redaction and retention stay the agent's job."
        />

        <CodePanel
          badge={<StatewaveBadge size={20} />}
          title="Statewave · assemble + govern"
          calloutTone="accent"
          lines={[
            <span key="1" style={{ color: 'var(--viz-code-muted)' }}># assemble a ranked, bounded bundle</span>,
            <span key="2"><span style={{ color: 'var(--color-accent)' }}>&rsaquo;</span> get_context(subject=<span style={{ color: 'var(--color-accent)' }}>&quot;cust_5521&quot;</span>,</span>,
            <span key="3">&nbsp;&nbsp;task=<span style={{ color: 'var(--color-accent)' }}>&quot;where do I ship it&quot;</span>, max_tokens=<span style={{ color: 'var(--color-brand-500)' }}>1500</span>)</span>,
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
          callout="The runtime decides: the superseded address scores out, the card is redacted by its policy label, and the receipt stores an integrity hash of what was delivered."
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
          Letta leaves auditability to your application and its message logs.
          Statewave governs assembly on the read path and emits an immutable
          receipt, all in the Apache 2.0 core.
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
 * The argument of this section is a contrast between two *shapes* of evidence:
 * Statewave has a fixed number because no model sits on its read path, and
 * Letta's published leaderboard is a spread because the model it runs is the
 * thing being scored. So Statewave is drawn as two gauges (one value each) and
 * Letta as a distribution (fifteen values on one axis). The geometry makes the
 * point before the copy does.
 */

const LOCOMO = { value: '0.905', fraction: 0.905, n: 'n=1,540', grade: 'robust figure' }
const LONGMEMEVAL = { value: '0.967', fraction: 0.967, n: 'n=30', grade: 'directional' }

/* Letta's own leaderboard, Context-Bench Filesystem Suite, read from
 * leaderboard.letta.com on 2026-08-12. Every figure this panel prints (the
 * range, the spread, the cost ratio, the named extremes) is derived from this
 * table, so refreshing the leaderboard means editing one array. */
interface BenchModel {
  model: string
  /** Context-Bench score, percent. */
  score: number
  /** Cost of the full run, USD. */
  cost: number
}

const CONTEXT_BENCH: readonly BenchModel[] = [
  { model: 'openai/gpt-5.2-codex-xhigh', score: 93, cost: 44.46 },
  { model: 'openai/gpt-5.4-xhigh', score: 89, cost: 43.52 },
  { model: 'anthropic/claude-sonnet-4-6', score: 88, cost: 116.09 },
  { model: 'openai/gpt-5.2-xhigh', score: 87, cost: 76.72 },
  { model: 'openai/gpt-5.3-codex-xhigh', score: 85, cost: 40.83 },
  { model: 'anthropic/claude-opus-4-6', score: 84, cost: 268.44 },
  { model: 'google/gemini-3-flash', score: 82, cost: 37.8 },
  { model: 'google/gemini-3.1', score: 79, cost: 97.68 },
  { model: 'openai/gpt-5-mini-high', score: 67, cost: 35.93 },
  { model: 'anthropic/claude-opus-4-5-20251101', score: 63, cost: 567.66 },
  { model: 'moonshotai/kimi-k2.5', score: 57, cost: 27.36 },
  { model: 'anthropic/claude-sonnet-4-5-20250929', score: 48, cost: 405.01 },
  { model: 'anthropic/claude-haiku-4-5', score: 43, cost: 117.55 },
  { model: 'z-ai/glm-5', score: 39, cost: 85.87 },
  { model: 'minimax/minimax-m2.5', score: 37, cost: 50.28 },
] as const

const best = CONTEXT_BENCH.reduce((a, b) => (b.score > a.score ? b : a))
const worst = CONTEXT_BENCH.reduce((a, b) => (b.score < a.score ? b : a))
const cheapest = CONTEXT_BENCH.reduce((a, b) => (b.cost < a.cost ? b : a))
const dearest = CONTEXT_BENCH.reduce((a, b) => (b.cost > a.cost ? b : a))
const scoreSpread = best.score - worst.score
const costRatio = Math.round(dearest.cost / cheapest.cost)

/* Axis for the strip. Padded off the extremes so the end dots aren't clipped
 * by the track, and labeled, because a distribution drawn on an unstated axis
 * is just a decorative row of circles. */
const AXIS = { min: 30, max: 100 }
const axisPct = (score: number) => ((score - AXIS.min) / (AXIS.max - AXIS.min)) * 100

/**
 * A half-circle gauge for one fixed score.
 *
 * Flat series fill, not the gradient the mock drew: a left-to-right ramp puts
 * the first half of the arc in a color nothing else on the site uses for
 * Statewave, which is the same reason the /benchmarks bars are flat.
 */
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

/**
 * Letta's leaderboard as a distribution: one dot per model on a shared score
 * axis, extremes direct-labeled, the rest reachable on hover/focus.
 *
 * Drawn as a strip rather than the mock's two-ended band because the claim is
 * about how far apart the results sit, and fifteen dots show that where a
 * gradient bar only asserts it.
 */
function LettaSpread() {
  const [active, setActive] = useState<BenchModel | null>(null)

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-theme-muted">
          Context-Bench · filesystem suite · {CONTEXT_BENCH.length} models
        </span>
        {/* The hover readout is parked in the header so revealing a model can
            never reflow the strip underneath the pointer. */}
        <span className="min-h-[18px] font-mono text-[11.5px] text-theme-secondary" aria-live="polite">
          {active ? `${active.model} · ${active.score}% · $${active.cost.toFixed(2)}` : ''}
        </span>
      </div>

      <div className="relative mt-5 h-9">
        <div
          className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-[3px]"
          style={{ background: 'var(--viz-track)' }}
        />
        {CONTEXT_BENCH.map((m) => {
          const isEdge = m === best || m === worst
          return (
            <button
              key={m.model}
              type="button"
              onMouseEnter={() => setActive(m)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(m)}
              onBlur={() => setActive(null)}
              aria-label={`${m.model}: ${m.score} percent, $${m.cost.toFixed(2)}`}
              className="absolute top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:ring-2 focus-visible:ring-accent focus:outline-none"
              style={{ left: `${axisPct(m.score)}%` }}
            >
              {/* 2px surface ring so overlapping dots stay countable. */}
              <span
                className="pointer-events-none absolute left-1/2 top-1/2 block h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-150"
                style={{
                  background: isEdge ? 'var(--viz-text-2)' : 'var(--viz-text-muted)',
                  boxShadow: '0 0 0 2px var(--theme-surface-1)',
                  transform:
                    active === m
                      ? 'translate(-50%, -50%) scale(1.35)'
                      : 'translate(-50%, -50%)',
                }}
              />
            </button>
          )
        })}
      </div>

      <div className="relative mt-1 h-4">
        <span className="absolute left-0 font-mono text-[10.5px] text-theme-muted">{AXIS.min}%</span>
        <span className="absolute right-0 font-mono text-[10.5px] text-theme-muted">{AXIS.max}%</span>
      </div>

      <div className="mt-4 flex flex-wrap justify-between gap-4">
        <div>
          <div className="font-heading text-[17px] font-extrabold text-theme-primary">{worst.score}%</div>
          <div className="font-mono text-[10.5px] text-theme-muted">{worst.model} · lowest</div>
        </div>
        <div className="text-right">
          <div className="font-heading text-[17px] font-extrabold text-theme-primary">{best.score}%</div>
          <div className="font-mono text-[10.5px] text-theme-muted">{best.model} · best</div>
        </div>
      </div>
    </div>
  )
}

function BenchmarksSection() {
  return (
    <Section id="bench" className="bg-surface-1">
      <div className="mx-auto max-w-3xl text-center">
        <Heading
          id="bench-heading"
          className="font-heading text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-theme-primary md:text-[48px]"
        >
          The benchmarks Statewave has tested
        </Heading>
        <p className="mt-4 text-[17px] leading-[1.6] text-theme-secondary/90">
          Statewave&apos;s scores are fixed: no model sits on the read path,
          so the same subject and budget return the same answer every run.
          Letta has published a LoCoMo figure of its own (74.0%, GPT-4o mini,
          above Mem0&apos;s 68.5%), but not one produced under the same
          conditions as this harness. What it does publish continuously is a
          leaderboard that scores the driving <em>LLM</em>, and the same
          runtime swings {scoreSpread} points and {costRatio}&times; in cost
          by model.
        </p>
      </div>

      {/* Statewave: fixed scores */}
      <div className="relative mt-12 overflow-hidden rounded-[1.75rem] border border-accent/30 bg-surface-2/40 p-7 shadow-sm sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-40 w-64 rounded-full bg-accent/[0.08] blur-3xl" />

        <div className="relative mb-7 flex flex-wrap items-center gap-2.5">
          <StatewaveBadge size={22} />
          <span className="font-heading text-[18px] font-bold text-theme-primary">Statewave: fixed benchmark scores</span>
          <span className="ml-auto rounded-full bg-accent/[0.14] px-2.5 py-1 font-mono text-[10.5px] tracking-[0.04em] text-accent">
            MODEL-INDEPENDENT
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
      </div>

      {/* Letta: a range, not a number */}
      <div className="mt-6 rounded-[1.75rem] border border-theme-border bg-surface-2/40 p-7 shadow-sm sm:p-8">
        <div className="mb-2 flex flex-wrap items-center gap-2.5">
          <LettaBadge size={22} />
          <span className="font-heading text-[18px] font-bold text-theme-primary">Letta: a range, not a number</span>
          {/* Amber is the site's caution token, not a series hue. It flags how
              much weight to put on the panel, and it ships with this label so
              the meaning never rests on the color. */}
          <span
            className="ml-auto rounded-full px-2.5 py-1 font-mono text-[10.5px] tracking-[0.04em]"
            style={{ background: 'color-mix(in oklab, var(--viz-amber) 14%, transparent)', color: 'var(--viz-amber)' }}
          >
            VARIES BY MODEL
          </span>
        </div>

        <p className="mb-7 max-w-[640px] text-[13px] leading-[1.55] text-theme-muted">
          Letta&apos;s leaderboard runs the identical runtime across{' '}
          {CONTEXT_BENCH.length} LLMs. The score is the model&apos;s, not the
          memory&apos;s: pick a different model and it moves.{' '}
          <a href={LETTA_LEADERBOARD_URL} target="_blank" rel="noopener noreferrer" className="text-accent hover:opacity-80">
            leaderboard.letta.com
          </a>
        </p>

        <LettaSpread />

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1 rounded-xl border border-theme-border bg-surface-1 p-4">
            <div className="font-heading text-[22px] font-extrabold tracking-[-0.02em] text-theme-primary">{scoreSpread} pts</div>
            <div className="mt-0.5 text-[11.5px] text-theme-muted">score spread across {CONTEXT_BENCH.length} models</div>
          </div>
          <div className="flex-1 rounded-xl border border-theme-border bg-surface-1 p-4">
            <div className="font-heading text-[22px] font-extrabold tracking-[-0.02em] text-theme-primary">{costRatio}&times;</div>
            <div className="mt-0.5 text-[11.5px] text-theme-muted">
              cost spread, ${cheapest.cost.toFixed(2)} &rarr; ${dearest.cost.toFixed(2)}
            </div>
          </div>
        </div>

        <p className="mt-4 text-[12px] leading-[1.6] text-theme-muted">
          Context-Bench measures an agent&apos;s context engineering, not a
          memory layer in isolation, so it is not comparable to the LoCoMo and
          LongMemEval figures above. It is shown instead to make the opposite
          point: the number moves with the model.{' '}
          {LETTA_LEADERBOARD_URL.replace('https://', '').replace(/\/$/, '')},
          last updated 13 March 2026.
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

/* ─── Adding Statewave to a Letta stack ──────────────────────────────────── */

interface MigrationRow {
  letta: string
  sw: string
  note: string
}

/* Tool names verified against letta-ai/letta-code src/tools/toolset.ts:57-62
 * (2026-08-24): memory, memory_apply_patch, memory_insert, memory_replace,
 * memory_rethink. All five detach once MemFS is enabled; there is no
 * dedicated search tool, the agent reads its context tree like any other
 * file. */
const MIGRATION_ROWS: MigrationRow[] = [
  { letta: 'memory_insert("context/cust_5521.md", "…")', sw: 'create_episode(subject="cust_5521", event="…")', note: 'Ingested as an immutable episode; compilers extract typed memories.' },
  { letta: 'cat context/cust_5521.md', sw: 'get_context(subject="cust_5521", task="…", max_tokens=600)', note: 'MemFS has no search or ranking step, only whatever the file currently holds; Statewave returns a ranked, token-bounded bundle plus an optional receipt.' },
  { letta: 'memory_replace("context/cust_5521.md", "…")', sw: 'create_episode(subject="cust_5521", event="…")', note: 'Facts are compiled from episodes, not hand-edited files.' },
  { letta: 'git rm context/cust_5521.md', sw: 'delete_subject("cust_5521")', note: 'Removes every episode, memory, and receipt for the subject in one call.' },
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
          Add Statewave to your Letta stack
        </Heading>
        <p className="mt-4 text-[17px] leading-[1.6] text-theme-secondary/90">
          Letta is the whole agent runtime; Statewave is only the memory layer.
          Keep your agent loop and point its memory calls at Statewave: each
          write lands as an immutable episode.
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
            <div className="px-6 py-3.5 font-mono text-[11px] tracking-[0.08em] text-theme-muted">LETTA</div>
            <div className="border-l border-theme-border" />
            <div className="border-l border-theme-border px-6 py-3.5 font-mono text-[11px] tracking-[0.08em] text-accent">STATEWAVE</div>
          </div>

          {MIGRATION_ROWS.map((row) => (
            <div key={row.letta} className="grid grid-cols-1 border-t border-theme-border sm:grid-cols-[1fr_44px_1.2fr]">
              <div className="px-6 py-5 font-mono text-[12.5px] leading-[1.7] text-theme-muted">{row.letta}</div>
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

/* ─── FAQ ────────────────────────────────────────────────────────────────── */

const FAQS = [
  { q: 'How is Statewave different from Letta?', a: 'In Letta the agent manages its own memory: it edits memory blocks in a git-tracked context tree (MemFS) with tool calls, so retrieval is the model’s job and costs tokens every turn. Statewave compiles episodes into typed memories, ranks them to a token budget, applies policy on the read path, and returns an integrity-hashed receipt, with no model in the loop.' },
  { q: 'Do I have to replace my agent framework?', a: 'No. Letta is a whole agent runtime; Statewave is only the memory layer. Keep your existing agent or framework and point its memory reads and writes at Statewave over REST, the SDKs, or MCP.' },
  { q: 'What makes retrieval deterministic?', a: 'A fixed scoring model applied to a hybrid lexical and vector candidate set: kind priority (3–10), recency (0–5), task relevance (0–8), and temporal validity (−4 to +3). The same subject, task, budget, and point in time produce the same bundle every time.' },
  { q: 'What is a state-assembly receipt?', a: 'An immutable, ULID-addressable record of one context call. It carries a byte-level integrity hash of what was delivered and references the policy bundle hash, so ‘what did the agent see, under which policy’ is answerable forever.' },
  { q: 'Does it work with Claude, Cursor, or Codex?', a: 'Yes. One command (npx @statewavedev/statewave) boots the runtime, and its shipped MCP server connects any MCP-compatible client: Claude, Cursor, Copilot, and agent runtimes.' },
  { q: 'Can I run it fully offline?', a: 'Yes. Storage is Postgres-only and self-hosted. The heuristic compiler keeps everything on your network; nothing leaves unless you configure an LLM compiler or hosted embeddings.' },
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
            Self-host the Apache 2.0 runtime, wire it to your MCP client, and
            every context call can return a receipt.
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

export function StatewaveVsLettaPage() {
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
