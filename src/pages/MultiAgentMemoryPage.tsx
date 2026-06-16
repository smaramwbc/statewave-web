import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Section } from '../components/Section'
import { Heading } from '../components/Heading'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { CodeCopyButton } from '../components/CodeCopyButton'
import { UseCaseSwitcher } from '../components/UseCaseSwitcher'
import { usePageSEO } from '../lib/seo'
import { breadcrumbJsonLd } from '../lib/seo-meta'

/* ─── Small shared bits ──────────────────────────────────────────────────── */

function EyebrowPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-lg border border-theme-border bg-surface-2 px-3.5 py-1.5 text-[13px] font-medium text-theme-secondary">
      {children}
    </span>
  )
}

function CircleCheck() {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-accent"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
    >
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6.5 10.5L8.5 12.5L13.5 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CircleX() {
  return (
    <svg className="h-7 w-7 text-theme-muted" viewBox="0 0 28 28" fill="none" aria-hidden>
      <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9.5 9.5L18.5 18.5M18.5 9.5L9.5 18.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* ─── Hero ───────────────────────────────────────────────────────────────── */

function HeroSection() {
  return (
    <section className="pt-28 pb-4 sm:pt-32 md:pt-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mb-8 flex justify-center">
            <UseCaseSwitcher currentSlug="multi-agent-memory" />
          </div>

          <h1 className="mx-auto max-w-3xl text-[clamp(2.25rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.03em] text-theme-primary break-anywhere">
            Three Agents
            <br />
            One{' '}
            <span className="bg-gradient-to-r from-accent via-brand-400 to-brand-300 bg-clip-text text-transparent">
              Shared Memory
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-md text-base text-theme-muted leading-relaxed">
            Agents work better when they actually know who they're helping,
            every session, every time.
          </p>

          <div className="mt-8 flex justify-center">
            <Button
              href="https://github.com/smaramwbc/statewave-multi-agent-memory"
              variant="white"
              size="lg"
            >
              Get Started Free
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-12"
        >
          <img
            src="/hero-multi-agent-memory.png"
            alt="Multi-agent memory demo"
            className="w-full rounded-2xl border border-theme-border"
          />
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Cost of stateless agents ───────────────────────────────────────────── */

const COST_ITEMS = [
  {
    title: 'Every Session Starts Cold',
    body: "Each agent starts from its own prompt context. What one agent decided is invisible to others unless explicitly passed as a message — and message passing breaks when agents run in parallel.",
  },
  {
    title: 'No Follow-Through on Tasks',
    body: 'Agents run in isolation. If a Planner deprecates a module, the Coder never sees it and rebuilds from scratch. Conflict detection happens after both agents have already finished their work.',
  },
  {
    title: 'Token Budgets Overflow',
    body: "Passing each agent's full output to the next as a prompt input fills context windows fast. A research agent running for 10 minutes produces more text than most models can receive.",
  },
]

function CostSection() {
  return (
    <Section>
      <div className="mb-10 flex justify-center">
        <EyebrowPill>Problems</EyebrowPill>
      </div>
      <Heading
        id="cost-of-stateless"
        className="mb-12 w-full justify-center text-center text-3xl md:text-4xl font-bold tracking-tight text-theme-primary"
      >
        The Cost Of Stateless AI Agents
      </Heading>
      <div className="grid gap-5 sm:grid-cols-3">
        {COST_ITEMS.map((item) => (
          <div
            key={item.title}
            className="flex flex-col rounded-2xl border border-theme-border bg-surface-1 p-6 md:p-8"
          >
            <div className="mb-6">
              <CircleX />
            </div>
            <h3 className="text-lg font-semibold leading-snug text-theme-primary">
              {item.title}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-theme-muted">
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </Section>
  )
}

/* ─── The memory does the merging ────────────────────────────────────────── */

/* Simplified diagrams: clean labelled cards / badges on theme tokens, instead
 * of the original pixel-tuned inline-hex visuals. */

function EpisodeVisual() {
  return (
    <div className="w-full max-w-xs space-y-3 text-xs">
      <div className="rounded-xl border border-accent/40 bg-accent/[0.06] p-3">
        <span className="inline-flex rounded-md border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
          Current Session
        </span>
        <p className="mt-2 font-medium text-theme-primary">Session 2 · Jan 15, 10:05 AM</p>
        <p className="mt-2 rounded-md bg-surface-2 px-2.5 py-2 leading-relaxed text-theme-secondary">
          Last time you mentioned preferring Python and an open auth-token model — pick up where you left off?
        </p>
        <p className="mt-2 text-right text-theme-muted">Yes please. Thanks for remembering!</p>
      </div>
      <div className="rounded-xl border border-theme-border bg-surface-2 p-3">
        <span className="inline-flex rounded-md border border-theme-border bg-surface-3 px-2 py-0.5 text-[10px] font-medium text-theme-muted">
          Previous Session
        </span>
        <p className="mt-2 font-medium text-theme-primary">Session 1 · Jan 4, 9:30 AM</p>
        <p className="mt-2 rounded-md bg-surface-3 px-2.5 py-2 leading-relaxed text-theme-muted">
          I only work in Python — and there's this auth-token recall I'm trying to fix.
        </p>
        <div className="mt-2 flex gap-1.5">
          {['Python', 'Auth-token: open'].map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-theme-border bg-surface-3 px-2 py-0.5 text-[10px] text-theme-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function EndpointVisual() {
  const steps = [
    {
      label: 'step 1',
      title: 'POST /v1/episodes',
      body: 'Raw, content-hashed events from Bloomberg, TechCrunch, Earnings.',
    },
    {
      label: 'step 2',
      title: 'POST /v1/memories/compile',
      body: 'Episodes become typed memories with confidence and provenance. No GPU. No vector DB.',
      active: true,
    },
    {
      label: 'step 3',
      title: 'POST /v1/context',
      body: 'Ranked, token-bounded bundle. Active memories only.',
    },
  ]
  return (
    <div className="w-full max-w-sm space-y-3 text-xs">
      {steps.map((step) => (
        <div key={step.label}>
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-theme-muted">
            {step.label}
          </p>
          <div
            className={`rounded-xl border p-3 ${
              step.active
                ? 'border-accent/40 bg-accent/[0.06]'
                : 'border-theme-border bg-surface-2'
            }`}
          >
            <p className={`font-mono font-semibold ${step.active ? 'text-accent' : 'text-theme-primary'}`}>
              {step.title}
            </p>
            <p className="mt-1 leading-relaxed text-theme-muted">{step.body}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function AgentMergeVisual() {
  return (
    <div className="w-full max-w-sm text-xs">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="rounded-xl border border-theme-border bg-surface-2 px-3 py-2.5 text-center">
          <p className="font-semibold text-theme-primary">Bloomberg</p>
          <p className="mt-1 font-mono text-theme-muted">3.5% (stale)</p>
        </div>
        <span className="text-theme-muted">+</span>
        <div className="rounded-xl border border-theme-border bg-surface-2 px-3 py-2.5 text-center">
          <p className="font-semibold text-theme-primary">TechCrunch</p>
          <p className="mt-1 font-mono text-emerald-500">2.9% (fresh)</p>
        </div>
      </div>
      <div className="my-3 flex justify-center text-theme-muted">↓</div>
      <div className="rounded-xl border border-accent/40 bg-accent/[0.06] px-3 py-2.5 text-center">
        <p className="font-semibold text-accent">supersede · auto</p>
        <p className="mt-1 font-mono text-[10px] text-theme-secondary">
          jaccard 0.78 ≥ 0.6 threshold
        </p>
      </div>
      <p className="mt-4 font-mono text-[10px] leading-relaxed text-theme-muted">
        mem_01 (Bloomberg) overlaps mem_02 (TechCrunch) compiler marks mem_01{' '}
        <span className="text-amber-500">SUPERSEDED</span> provenance + p_03, p_06
      </p>
    </div>
  )
}

function ContextVisual() {
  return (
    <div className="w-full max-w-sm text-xs">
      <div className="rounded-xl border border-theme-border bg-surface-2 px-3 py-2 text-theme-secondary">
        ⌕&nbsp;&nbsp;What is Stripe's current processing fee?
      </div>
      <div className="mt-2 rounded-xl border border-theme-border bg-surface-2 px-3 py-2">
        <div className="flex items-start justify-between gap-3">
          <p className="text-theme-muted line-through">Bloomberg · 3.5% +35c</p>
          <span className="text-[9px] font-medium uppercase text-amber-500">SUPERSEDED</span>
        </div>
        <p className="mt-1 text-theme-muted">never returned by /v1/context</p>
      </div>
      <div className="mt-2 rounded-xl border border-theme-border bg-surface-2 px-3 py-2">
        <div className="flex items-start justify-between gap-3">
          <p className="text-theme-primary">TechCrunch · 2.9% + 30c</p>
          <span className="text-[9px] font-medium uppercase text-emerald-500">ACTIVE</span>
        </div>
        <p className="mt-1 text-theme-muted">corroborated by Earnings (p_07)</p>
      </div>
      <div className="mt-2 rounded-xl border border-accent/40 bg-accent/[0.06] px-3 py-2.5">
        <div className="flex justify-between gap-3">
          <p className="font-semibold text-theme-primary">synthesis answer</p>
          <p className="font-mono text-theme-muted">1.2k tok</p>
        </div>
        <p className="mt-1 text-theme-secondary">
          "Stripe charges 2.9% + 30c per transaction."
        </p>
      </div>
    </div>
  )
}

const MEMORY_CARDS = [
  {
    title: 'Every finding is an episode',
    body: 'Agents append raw events to one shared subject. Episodes are content-hashed and immutable. The full provenance trail lives in the log.',
    Visual: EpisodeVisual,
  },
  {
    title: 'Ingest. Compile. Use.',
    body: 'Three endpoints handle the loop. Compile is idempotent. Run it again and again on the same subject. Same query, same bytes.',
    Visual: EndpointVisual,
  },
  {
    title: 'Works Across Multiple Agents',
    body: 'Any agent in a pipeline reads and writes the same shared memory, with zero reruns on resume.',
    Visual: AgentMergeVisual,
  },
  {
    title: 'Personalizes at Scale',
    body: "Adapts responses to the individual's stack, history, and goals, not just the question asked.",
    Visual: ContextVisual,
  },
]

function MemoryMergingSection() {
  return (
    <Section>
      <div className="mx-auto mb-12 max-w-xl text-center">
        <div className="flex justify-center">
          <EyebrowPill>Features</EyebrowPill>
        </div>
        <Heading
          id="memory-does-the-merging"
          className="mt-5 w-full justify-center text-center text-3xl md:text-4xl font-bold tracking-tight text-theme-primary"
        >
          The Memory Does The Merging
        </Heading>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {MEMORY_CARDS.map((card) => (
          <div
            key={card.title}
            className="flex flex-col overflow-hidden rounded-2xl border border-theme-border bg-surface-1"
          >
            {/* Visual grows to fill so the footers below line up across the
                row (grid stretches the cards to equal height). */}
            <div className="flex flex-1 min-h-[300px] items-center justify-center border-b border-theme-border bg-surface-2 px-6 py-10">
              <card.Visual />
            </div>
            {/* Fixed footer height (sm+) so every card's title/body block is
                the same height and the dividers align. */}
            <div className="p-6 sm:min-h-[9.5rem]">
              <h3 className="mb-2 text-lg font-semibold text-theme-primary">{card.title}</h3>
              <p className="text-sm leading-relaxed text-theme-muted">{card.body}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

/* ─── Shared memory layer for multi-agent pipelines ──────────────────────── */

function SharedTimelineVisual() {
  const agents = [
    { name: 'Bloomberg Agent', body: 'Reads market data, extracts price signals → POST /v1/episodes' },
    { name: 'TechCrunch Agent', body: 'Reads news feed, extracts headlines → POST /v1/episodes' },
    { name: 'Earnings Agent', body: 'Reads financials, extracts EPS/revenue → POST /v1/episodes' },
  ]
  return (
    <div className="w-full max-w-sm space-y-3 text-xs">
      {agents.map((a, i) => (
        <div key={a.name}>
          <div className="overflow-hidden rounded-xl border border-theme-border">
            <div className="bg-accent px-3 py-2">
              <p className="text-[13px] font-semibold text-white">{a.name}</p>
            </div>
            <div className="bg-surface-2 px-3 py-2.5">
              <p className="leading-relaxed text-theme-muted">{a.body}</p>
            </div>
          </div>
          {i < agents.length - 1 && (
            <div className="flex justify-center py-1 text-theme-muted">↓</div>
          )}
        </div>
      ))}
    </div>
  )
}

function ActiveContextVisual() {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-xl border border-theme-border font-mono text-xs">
      <div className="bg-surface-2 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider text-accent">ACTIVE CONTEXT</span>
          <span className="text-[10px] text-theme-muted">8 FACTS · ~905 TOK</span>
        </div>
        <p className="mb-3 text-[13px] font-semibold text-theme-primary">market-intel · /v1/context</p>
        <p className="mb-1.5 text-[10px] tracking-wider text-theme-muted">USER</p>
        <div className="mb-3 flex justify-end">
          <div className="rounded-md bg-accent px-3 py-1.5 text-white">
            What is Stripe's current pricing?
          </div>
        </div>
        <p className="mb-1.5 text-[10px] tracking-wider text-theme-muted">SYNTHESIS</p>
        <div className="rounded-md bg-surface-3 px-3 py-2 leading-relaxed text-theme-secondary">
          Stripe charges <span className="font-bold text-theme-primary">2.9% + 30¢</span> per
          transaction. Cited TechCrunch &amp; Earnings.
        </div>
      </div>
      <div className="border-t border-theme-border bg-surface-3 p-4">
        <div className="mb-1.5 flex items-center justify-between text-[10px] tracking-wider text-theme-muted">
          <span>SUPERSEDED · NEVER RETURNED</span>
          <span>RETIRED BY COMPILER</span>
        </div>
        <p className="mb-2 text-theme-muted line-through">Bloomberg — Stripe · 3.5% + 35¢</p>
        <div className="flex items-center gap-2">
          <span className="rounded border border-amber-500/35 bg-amber-500/10 px-1.5 py-0.5 text-amber-500">
            superseded
          </span>
          <span className="rounded border border-theme-border bg-surface-2 px-1.5 py-0.5 text-theme-muted">
            jaccard 0.78
          </span>
        </div>
      </div>
    </div>
  )
}

function ResumeRunVisual() {
  const events = [
    {
      time: 'T+0s',
      label: 'Pipeline started',
      body: 'Three agents launch concurrently against subject market-intel.',
    },
    {
      time: 'T+9s',
      label: 'Earnings killed (^C)',
      body: 'Bloomberg + TechCrunch findings already compiled into memory. Cached.',
      highlight: true,
    },
    {
      time: 'T+11s',
      label: 'Earnings resumed',
      body: 'Reads cached context from /v1/timeline. Zero reruns on upstream agents.',
    },
  ]
  return (
    <div className="w-full max-w-sm space-y-3 text-xs">
      {events.map((e) => (
        <div key={e.time} className="flex items-start gap-3">
          <span className="w-12 shrink-0 pt-2.5 font-mono text-[11px] text-theme-muted">
            {e.time}
          </span>
          <div
            className={`flex-1 rounded-xl border p-3 ${
              e.highlight
                ? 'border-accent/40 bg-accent/[0.06]'
                : 'border-theme-border bg-surface-2'
            }`}
          >
            <p className={`text-sm font-semibold ${e.highlight ? 'text-accent' : 'text-theme-primary'}`}>
              {e.label}
            </p>
            <p className="mt-1 leading-relaxed text-theme-muted">{e.body}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

const PIPELINE_ROWS = [
  {
    label: 'Three agents. One memory. Conflicts resolved automatically.',
    body: 'The Planner, Coder, and Reviewer all write to and read from the same Statewave subject. A decision written by any agent is immediately available to every other agent before they act — without any explicit message passing.',
    Visual: SharedTimelineVisual,
  },
  {
    label: 'Answers from active memory only.',
    body: 'Context bundles are ranked and token-bounded. Each agent receives only the memories most relevant to its task — not the full episode log. High-signal facts surface first; low-signal filler is dropped.',
    Visual: ActiveContextVisual,
  },
  {
    label: "Kill any agent mid-run. The pipeline doesn't restart.",
    body: "Each agent's work is durably persisted as episodes the moment it's written. If the Writer is killed mid-run, the Researcher and Critic do not re-run — the Writer picks up from the last compiled context and completes its work.",
    Visual: ResumeRunVisual,
  },
]

function PipelineSection() {
  return (
    <Section>
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <div className="flex justify-center">
          <EyebrowPill>Reference Builds</EyebrowPill>
        </div>
        <Heading
          id="shared-memory-layer"
          className="mt-5 w-full justify-center text-center text-3xl md:text-4xl font-bold tracking-tight text-theme-primary"
        >
          A shared memory layer for multi-agent pipelines
        </Heading>
      </div>
      <div className="space-y-5">
        {PIPELINE_ROWS.map((row) => (
          <motion.div
            key={row.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-2xl border border-theme-border bg-surface-1 md:grid md:grid-cols-2 md:items-stretch"
          >
            <div className="flex flex-col justify-center border-b border-theme-border p-8 md:border-b-0 md:border-r md:p-12">
              <h3 className="max-w-sm text-xl font-semibold leading-snug tracking-tight text-theme-primary sm:text-2xl">
                {row.label}
              </h3>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-theme-muted">
                {row.body}
              </p>
            </div>
            <div className="flex items-center justify-center bg-surface-2 p-8 md:p-12">
              <row.Visual />
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}

/* ─── The wrong fact never reaches the LLM ───────────────────────────────── */

function ContextBundleCard() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-theme-border bg-surface-1 p-6">
      {/* Paste-everything prompt */}
      <div className="border-b border-theme-border pb-6">
        <p className="mb-4 text-sm font-semibold text-theme-primary">Paste-everything prompt</p>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs text-theme-secondary">tokens to LLM</span>
          <span className="rounded-md border border-theme-border px-2 py-0.5 text-[11px] text-theme-muted">
            4000/session
          </span>
        </div>
        <div className="mb-2 h-3 overflow-hidden rounded-md bg-surface-3">
          <div className="h-full rounded-md bg-red-500" style={{ width: '88%' }} />
        </div>
        <p className="text-[11px] text-theme-muted">
          Both Stripe rates included. LLM guesses which is fresh.
        </p>
      </div>

      {/* Statewave context bundle */}
      <div className="pt-6">
        <div className="mb-4 flex items-center gap-2">
          <svg className="h-3.5 w-3.5 text-accent" viewBox="0 0 13 12" fill="none" aria-hidden>
            <circle cx="6.5" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="6.5" cy="6" r="2" fill="currentColor" />
          </svg>
          <p className="text-sm font-semibold text-theme-primary">Statewave context bundle</p>
        </div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs text-theme-secondary">Token Used (Avg)</span>
          <span className="rounded-md border border-theme-border px-2 py-0.5 text-[11px] text-theme-muted">
            800/session
          </span>
        </div>
        <div className="mb-2 h-3 overflow-hidden rounded-md bg-surface-3">
          <div className="h-full rounded-md bg-accent" style={{ width: '22%' }} />
        </div>
        <p className="mb-4 text-[11px] text-theme-muted">
          Only active memories. Bloomberg's stale rate never makes it in.
        </p>
        <span className="inline-flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Memory Connected
        </span>
      </div>
    </div>
  )
}

const WRONG_FACT_BULLETS = [
  'Only active memories returned by /v1/context',
  'Token ceiling enforced before recall',
  'No GPU. No vector database. No merge logic.',
]

function WrongFactSection() {
  return (
    <Section>
      <div className="grid items-center gap-12 md:grid-cols-2 lg:gap-16">
        <div>
          <Heading
            id="wrong-fact"
            className="mb-5 text-3xl md:text-4xl font-bold tracking-tight text-theme-primary"
          >
            The wrong fact never reaches the LLM
          </Heading>
          <p className="mb-5 text-base leading-relaxed text-theme-muted">
            Statewave's compiler retires stale memories before they hit the
            prompt. Tokens drop. Only facts that still hold reach the LLM.
          </p>
          <ul className="mb-8 space-y-3">
            {WRONG_FACT_BULLETS.map((b) => (
              <li key={b} className="flex items-center gap-2.5 text-sm text-theme-muted">
                <CircleCheck />
                {b}
              </li>
            ))}
          </ul>
          <Button
            href="https://github.com/smaramwbc/statewave-docs/blob/main/getting-started.md"
            variant="primary"
            size="lg"
          >
            Get Started
          </Button>
        </div>
        <div className="flex justify-center md:justify-end">
          <div className="flex w-full max-w-lg items-center justify-center rounded-2xl border border-theme-border bg-surface-2 px-6 py-10">
            <ContextBundleCard />
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ─── Three endpoints / code section ─────────────────────────────────────── */

const ENDPOINT_FEATURES = [
  'Sub-150ms latency for real-time experiences',
  'SOC-2 and HIPAA compliant with secure storage',
  'Compatible with various tools.',
]

const JS_SNIPPET = `import StateClient from '@statewave/sdk';
const client = new StateClient({ apiKey:
  'your-api-key' });`

const PY_SNIPPET = `import os
from statewave import StateClient

os.environ["STATEWAVE_API_KEY"] = "your-api-key"

client = StateClient()`

function CodeBlock({ label, code }: { label: string; code: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-theme-border bg-surface-1 shadow-xl shadow-black/10">
      <div className="flex items-center justify-between border-b border-theme-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500/70" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
          <span className="h-3 w-3 rounded-full bg-green-500/70" />
          <span className="ml-3 font-mono text-xs text-theme-muted">{label}</span>
        </div>
        <CodeCopyButton code={code} label={`Copy ${label} snippet`} />
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-relaxed text-theme-secondary">
        {code}
      </pre>
    </div>
  )
}

function ThreeEndpointsSection() {
  return (
    <Section>
      <div className="grid items-center gap-12 md:grid-cols-2 lg:gap-16">
        <div className="order-2 space-y-4 md:order-1">
          <CodeBlock label="JavaScript" code={JS_SNIPPET} />
          <CodeBlock label="Python" code={PY_SNIPPET} />
        </div>
        <div className="order-1 md:order-2">
          <Heading
            id="three-endpoints"
            className="mb-5 text-3xl md:text-4xl font-bold tracking-tight text-theme-primary"
          >
            Three endpoints. That's the core loop
          </Heading>
          <p className="mb-6 text-base leading-relaxed text-theme-muted">
            Statewave works with your current stack, drop it in and start
            shipping persistent agents.
          </p>
          <ul className="mb-8 space-y-2.5">
            {ENDPOINT_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-theme-muted">
                <CircleCheck />
                {f}
              </li>
            ))}
          </ul>
          <Button
            href="https://github.com/smaramwbc/statewave-docs/blob/main/getting-started.md"
            variant="primary"
            size="lg"
          >
            Integrate Statewave
          </Button>
        </div>
      </div>
    </Section>
  )
}

/* ─── Purpose-built feature grid ─────────────────────────────────────────── */

const FEATURE_GRID = [
  {
    title: 'Typed, Ranked Memory',
    description:
      'Every memory has a type, confidence score, and provenance. Conflicts are auto-resolved; superseded memories are never surfaced again.',
  },
  {
    title: 'Multi-User by Default',
    description:
      'Subjects isolate memory per tenant, user, or run. One Statewave instance scales to thousands of concurrent agents with zero cross-contamination.',
  },
  {
    title: 'Token Budget Control',
    description:
      'Set max_tokens on every context call. The ranked bundle always fits — highest-signal memories first, filler dropped before the LLM sees it.',
  },
  {
    title: 'Durable Across Sessions',
    description:
      'Episodes are immutable and append-only. Restart the pipeline, resume mid-run, or replay a failed agent — the shared state is always intact.',
  },
  {
    title: 'Full Audit Trail',
    description:
      'Every episode is timestamped and can carry a caller_id. The complete decision chain is reconstructable via GET /v1/timeline for any run.',
  },
  {
    title: 'Sub-50ms Recall',
    description:
      'Compiled memories are pre-ranked and stored for instant retrieval. Context assembly is a single read — not a vector search at inference time.',
  },
]

function FeatureGridSection() {
  return (
    <Section>
      <div className="mb-12 text-center">
        <div className="flex justify-center">
          <EyebrowPill>Why Statewave</EyebrowPill>
        </div>
        <Heading
          id="purpose-built"
          className="mt-4 w-full justify-center text-center text-3xl md:text-4xl font-bold tracking-tight text-theme-primary"
        >
          Purpose-Built Memory Layer for AI Agents
        </Heading>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURE_GRID.map((f) => (
          <Card
            key={f.title}
            icon={<CircleCheck />}
            title={f.title}
            description={f.description}
          />
        ))}
      </div>
    </Section>
  )
}

/* ─── CTA footer ─────────────────────────────────────────────────────────── */

function CTASection() {
  return (
    <Section className="bg-surface-1/50">
      <div className="text-center">
        <Heading
          id="give-your-ai-memory"
          className="w-full justify-center text-center text-3xl md:text-5xl font-bold text-theme-primary tracking-tight"
        >
          Give your AI system memory
        </Heading>
        <p className="mx-auto mt-6 max-w-xl text-lg text-theme-muted leading-relaxed">
          Persistent memory for LLMs — sharper context, leaner prompts, personal to each subject.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button
            href="https://github.com/smaramwbc/statewave-docs/blob/main/getting-started.md"
            size="lg"
          >
            Get Started
          </Button>
          <Button to="/use-cases" variant="secondary" size="lg">
            Explore use cases
          </Button>
        </div>
      </div>
    </Section>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export function MultiAgentMemoryPage() {
  usePageSEO({
    breadcrumb: false,
    jsonLd: [
      breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Use Cases', path: '/use-cases' },
        { name: 'Multi-Agent Memory', path: '/use-cases/multi-agent-memory' },
      ]),
    ],
  })
  return (
    <div className="bg-surface-0">
      <HeroSection />
      <CostSection />
      <MemoryMergingSection />
      <PipelineSection />
      <WrongFactSection />
      <ThreeEndpointsSection />
      <FeatureGridSection />
      <CTASection />
    </div>
  )
}
