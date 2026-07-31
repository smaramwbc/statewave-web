import { motion } from 'framer-motion'
import { useCallback, useState } from 'react'
import { Section } from '../components/Section'
import { Heading } from '../components/Heading'
import { Button } from '../components/Button'
import { CodeCopyButton } from '../components/CodeCopyButton'
import { UseCaseSwitcher } from '../components/UseCaseSwitcher'
import { usePageSEO } from '../lib/seo'
import { breadcrumbJsonLd } from '../lib/seo-meta'

/* ─── Hero ───────────────────────────────────────────────────────────────── */

function HeroSection() {
  const [replayKey, setReplayKey] = useState(0)

  const replay = useCallback(() => {
    setReplayKey((k) => k + 1)
  }, [])

  return (
    <section className="relative">
      <div
        className="absolute inset-0 pointer-events-none"

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
            <UseCaseSwitcher currentSlug="multi-agent-memory" />
          </div>

          <h1 className="mx-auto max-w-[1180px] font-heading text-[clamp(3.2rem,6.8vw,6.5rem)] font-bold leading-[0.94] tracking-[-0.06em] text-theme-primary">
            Three Agents.
            <br />
            One{' '}
            <span className="text-gradient-brand">
              Shared Memory
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-[46rem] text-[18px] leading-[1.6] text-theme-secondary/90 sm:text-[20px]">
            Agents work better when they actually know who they&apos;re helping,
            every session, every time.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.5 }}
            className="mt-8 flex justify-center"
          >
            <Button
              href="https://github.com/smaramwbc/statewave-multi-agent-memory"
              variant="primary"
              size="lg"
            >
              Get Started Free

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
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.6 }}
          className="mt-12 flex justify-center"
          onViewportEnter={replay}
          viewport={{ amount: 0.35 }}
        >
          <img
            key={`multi-agent-dark-${replayKey}`}
            src={`/images/use-cases/multi-agent-memory/statewave-multi-agent-memory-hero-dark.svg?r=${replayKey}`}
            alt="Multi-agent memory diagram"
            className="theme-dark w-full h-auto"
          />

          <img
            key={`multi-agent-light-${replayKey}`}
            src={`/images/use-cases/multi-agent-memory/statewave-multi-agent-memory-hero-light.svg?r=${replayKey}`}
            alt=""
            aria-hidden="true"
            className="theme-light w-full h-auto"
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
    <Section className="relative overflow-hidden bg-surface-1">
      <div
        aria-hidden="true"
        className="section-glow-full"
      />

      <div className="relative">
        <div className="text-center">
          <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            Problems
          </p>

          <Heading
            id="cost-of-stateless"
            className="mx-auto max-w-4xl font-heading text-4xl font-bold leading-[0.98] tracking-[-0.03em] text-theme-primary md:text-[56px]"
          >
            The Cost of{' '}
            <span className="text-gradient-brand">
              Stateless AI
            </span>
          </Heading>

          <p className="mx-auto mt-6 max-w-2xl text-[20px] leading-[1.65] text-theme-secondary/85">
            Without persistent shared memory, every agent starts from scratch,
            duplicates work and loses valuable context between conversations.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {COST_ITEMS.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.55,
                delay: index * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative flex min-h-[280px] flex-col overflow-hidden rounded-[2rem] border border-theme-border bg-surface-2/35 p-7 transition duration-300 hover:-translate-y-1 hover:border-danger/25 hover:bg-surface-2/55 sm:p-8"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-10 top-0 h-28 rounded-full bg-danger/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />

              <div className="relative mb-7 text-danger">
                <svg
                  className="h-8 w-8"
                  viewBox="0 0 28 28"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="14"
                    cy="14"
                    r="12"
                    stroke="currentColor"
                    strokeOpacity="0.5"
                    strokeWidth="1.5"
                  />

                  <path
                    d="M9.5 9.5L18.5 18.5M18.5 9.5L9.5 18.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <h3 className="relative font-heading text-2xl font-semibold leading-tight tracking-[-0.02em] text-theme-primary">
                {item.title}
              </h3>

              <p className="relative mt-auto pt-8 text-[15px] leading-7 text-theme-secondary">
                {item.body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ─── The memory does the merging ────────────────────────────────────────── */

/* Simplified diagrams: clean labelled cards / badges on theme tokens, instead
 * of the original pixel-tuned inline-hex visuals. */

function EpisodeVisual() {
  return (
    <div className="relative w-full max-w-sm text-xs">
      <div className="absolute left-5 top-10 h-[calc(100%-5rem)] w-px bg-gradient-to-b from-accent/50 via-theme-border to-transparent" />

      <div className="relative pl-10">
        <span className="absolute left-[14px] top-5 h-3 w-3 rounded-full border-2 border-accent bg-surface-1 shadow-[0_0_0_5px_rgba(99,102,241,0.08)]" />

        <div className="rounded-2xl border border-accent/25 bg-accent/[0.055] p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
              Current session
            </span>

            <span className="font-mono text-[10px] text-theme-muted">
              Jan 15 · 10:05
            </span>
          </div>

          <p className="mt-4 leading-relaxed text-theme-secondary">
            Last time you mentioned preferring Python and an open auth-token
            model. Pick up where you left off?
          </p>

          <div className="mt-3 flex justify-end">
            <p className="max-w-[80%] rounded-xl bg-accent px-3 py-2 text-right leading-relaxed text-white">
              Yes please. Thanks for remembering!
            </p>
          </div>
        </div>
      </div>

      <div className="relative mt-4 pl-10">
        <span className="absolute left-[15px] top-5 h-2.5 w-2.5 rounded-full border border-theme-border bg-surface-3" />

        <div className="rounded-2xl border border-theme-border/80 bg-surface-2/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-theme-muted">
              Previous session
            </span>

            <span className="font-mono text-[10px] text-theme-muted">
              Jan 4 · 09:30
            </span>
          </div>

          <p className="mt-4 leading-relaxed text-theme-muted">
            I only work in Python, and there&apos;s this auth-token recall
            I&apos;m trying to fix.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {['Python', 'Auth-token: open'].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-theme-border bg-surface-3/70 px-2.5 py-1 font-mono text-[10px] text-theme-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function EndpointVisual() {
  const steps = [
    {
      number: '01',
      title: 'POST /v1/episodes',
      body: 'Append raw, content-hashed events.',
    },
    {
      number: '02',
      title: 'POST /v1/memories/compile',
      body: 'Turn episodes into typed memories with confidence and provenance.',
      active: true,
    },
    {
      number: '03',
      title: 'POST /v1/context',
      body: 'Return a ranked, token-bounded context bundle.',
    },
  ]

  return (
    <div className="relative w-full max-w-sm">
      <div className="absolute bottom-7 left-[17px] top-7 w-px bg-gradient-to-b from-theme-border via-accent/40 to-theme-border" />

      <div className="space-y-4">
        {steps.map((step) => (
          <div
            key={step.number}
            className="relative grid grid-cols-[36px_1fr] items-start gap-3"
          >
            <div
              className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border font-mono text-[10px] font-semibold ${step.active
                ? 'border-accent/40 bg-accent text-white shadow-[0_0_0_6px_rgba(99,102,241,0.08)]'
                : 'border-theme-border bg-surface-2 text-theme-muted'
                }`}
            >
              {step.number}
            </div>

            <div
              className={`rounded-2xl border p-4 transition-colors ${step.active
                ? 'border-accent/30 bg-accent/[0.055]'
                : 'border-theme-border/80 bg-surface-2/55'
                }`}
            >
              <p
                className={`font-mono text-[11px] font-semibold ${step.active ? 'text-accent' : 'text-theme-primary'
                  }`}
              >
                {step.title}
              </p>

              <p className="mt-2 text-xs leading-relaxed text-theme-muted">
                {step.body}
              </p>

              {step.active && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {['idempotent', 'no GPU', 'no vector DB'].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-accent/20 bg-accent/[0.06] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.08em] text-accent"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AgentMergeVisual() {
  return (
    <div className="w-full max-w-sm text-xs">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-theme-border/80 bg-surface-2/60 p-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-theme-muted" />
            <p className="font-semibold text-theme-primary">Bloomberg</p>
          </div>

          <p className="mt-4 font-mono text-lg font-semibold text-theme-muted line-through">
            3.5%
          </p>

          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-theme-muted">
            stale memory
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.045] p-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <p className="font-semibold text-theme-primary">TechCrunch</p>
          </div>

          <p className="mt-4 font-mono text-lg font-semibold text-emerald-500">
            2.9%
          </p>

          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-emerald-500/80">
            fresh memory
          </p>
        </div>
      </div>

      <div className="relative my-5 flex items-center justify-center">
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-theme-border to-transparent" />

        <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-accent/30 bg-surface-1 text-sm text-accent shadow-sm">
          ↓
        </span>
      </div>

      <div className="rounded-2xl border border-accent/30 bg-accent/[0.055] p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[11px] font-semibold text-accent">
            supersede · auto
          </p>

          <span className="rounded-full border border-accent/20 bg-accent/[0.07] px-2 py-1 font-mono text-[9px] text-accent">
            0.78 ≥ 0.60
          </span>
        </div>

        <div className="mt-4 space-y-2 font-mono text-[10px] leading-relaxed text-theme-muted">
          <p>
            mem_01{' '}
            <span className="text-theme-secondary">overlaps</span> mem_02
          </p>

          <p>
            mem_01{' '}
            <span className="font-semibold text-amber-500">SUPERSEDED</span>
          </p>

          <p>
            provenance{' '}
            <span className="text-theme-secondary">+ p_03, p_06</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function ContextVisual() {
  return (
    <div className="w-full max-w-sm text-xs">
      <div className="flex items-center gap-3 rounded-2xl border border-theme-border/80 bg-surface-2/60 px-4 py-3">
        <svg
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-theme-muted"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>

        <p className="text-theme-secondary">
          What is Stripe&apos;s current processing fee?
        </p>
      </div>

      <div className="mt-4 space-y-2">
        <div className="rounded-2xl border border-theme-border/70 bg-surface-2/40 px-4 py-3 opacity-65">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-theme-muted line-through">
                Bloomberg · 3.5% + 35c
              </p>

              <p className="mt-1 text-[10px] text-theme-muted">
                Excluded from context
              </p>
            </div>

            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-amber-500">
              Superseded
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.035] px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-theme-primary">
                TechCrunch · 2.9% + 30c
              </p>

              <p className="mt-1 text-[10px] text-theme-muted">
                Corroborated by Earnings · p_07
              </p>
            </div>

            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-emerald-500">
              Active
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-accent/30 bg-accent/[0.055] p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-accent">
            Synthesis
          </p>

          <p className="font-mono text-[10px] text-theme-muted">1.2k tok</p>
        </div>

        <p className="mt-3 text-sm font-medium leading-relaxed text-theme-primary">
          Stripe charges 2.9% + 30c per transaction.
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
    title: 'Works across multiple agents',
    body: 'Any agent in a pipeline reads and writes the same shared memory, with zero reruns on resume.',
    Visual: AgentMergeVisual,
  },
  {
    title: 'Personalizes at scale',
    body: "Adapts responses to the individual's stack, history, and goals, not just the question asked.",
    Visual: ContextVisual,
  },
]

function MemoryMergingSection() {
  return (
    <Section className="bg-surface-1">
      <div className="mx-auto mb-14 max-w-3xl text-center md:mb-16">
        <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
          Features
        </p>

        <Heading
          id="memory-does-the-merging"
          className="w-full justify-center text-center font-heading text-4xl font-bold leading-[0.98] tracking-[-0.03em] text-theme-primary md:text-[56px]"
        >
          The Memory Does the{' '}
          <span className="text-gradient-brand">
            Merging
          </span>
        </Heading>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {MEMORY_CARDS.map((card, index) => {
          const Visual = card.Visual

          return (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.55,
                delay: index * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative flex min-h-[560px] flex-col overflow-hidden rounded-[2rem] border border-theme-border bg-surface-2/35 transition duration-300 hover:-translate-y-1 hover:border-accent/25 hover:bg-surface-2/55"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-12 top-0 h-32 rounded-full bg-accent/[0.07] blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />

              <div className="relative flex min-h-[340px] flex-1 items-center justify-center px-6 py-10 sm:px-8">
                <Visual />
              </div>

              <div className="relative mt-auto border-t border-theme-border/70 px-7 py-7 sm:min-h-[180px] sm:px-8 sm:py-8">
                <h3 className="font-heading text-2xl font-semibold leading-tight tracking-[-0.02em] text-theme-primary">
                  {card.title}
                </h3>

                <p className="mt-3 text-[15px] leading-7 text-theme-secondary">
                  {card.body}
                </p>
              </div>
            </motion.article>
          )
        })}
      </div>
    </Section>
  )
}
/* ─── Shared memory layer for multi-agent pipelines ──────────────────────── */

function SharedTimelineVisual() {
  const agents = [
    {
      number: '01',
      name: 'Bloomberg Agent',
      body: 'Reads market data and extracts price signals.',
      endpoint: 'POST /v1/episodes',
    },
    {
      number: '02',
      name: 'TechCrunch Agent',
      body: 'Reads the news feed and extracts fresh headlines.',
      endpoint: 'POST /v1/episodes',
    },
    {
      number: '03',
      name: 'Earnings Agent',
      body: 'Reads financials and extracts EPS and revenue.',
      endpoint: 'POST /v1/episodes',
    },
  ]

  return (
    <div className="relative w-full max-w-sm">
      <div className="absolute bottom-8 left-[18px] top-8 w-px bg-gradient-to-b from-accent/50 via-theme-border to-transparent" />

      <div className="space-y-4">
        {agents.map((agent, index) => (
          <div
            key={agent.name}
            className="relative grid grid-cols-[38px_1fr] items-start gap-3"
          >
            <div className="relative z-10 flex h-[38px] w-[38px] items-center justify-center rounded-full border border-accent/30 bg-surface-1 font-mono text-[10px] font-semibold text-accent shadow-[0_0_0_6px_rgba(99,102,241,0.06)]">
              {agent.number}
            </div>

            <div
              className={`rounded-2xl border p-4 transition duration-300 ${index === 1
                ? 'border-accent/30 bg-accent/[0.055]'
                : 'border-theme-border/80 bg-surface-2/55'
                }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-heading text-sm font-semibold text-theme-primary">
                  {agent.name}
                </p>

                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.08)]" />
              </div>

              <p className="mt-2 text-xs leading-relaxed text-theme-muted">
                {agent.body}
              </p>

              <div className="mt-3 inline-flex rounded-full border border-theme-border bg-surface-3/70 px-2.5 py-1 font-mono text-[9px] text-theme-secondary">
                {agent.endpoint}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-center">
        <div className="rounded-full border border-accent/30 bg-accent/[0.06] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-accent">
          shared subject · market-intel
        </div>
      </div>
    </div>
  )
}

function ActiveContextVisual() {
  return (
    <div className="w-full max-w-sm">
      <div className="overflow-hidden rounded-2xl border border-theme-border/80 bg-surface-2/55">
        <div className="border-b border-theme-border/70 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.08)]" />

              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-accent">
                Active context
              </span>
            </div>

            <span className="font-mono text-[9px] text-theme-muted">
              8 facts · ~905 tok
            </span>
          </div>

          <p className="mt-3 font-mono text-[11px] font-semibold text-theme-primary">
            market-intel · /v1/context
          </p>
        </div>

        <div className="p-4">
          <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-theme-muted">
            User
          </p>

          <div className="mt-2 flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-accent px-3.5 py-2.5 text-xs leading-relaxed text-white">
              What is Stripe&apos;s current pricing?
            </div>
          </div>

          <p className="mt-5 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-theme-muted">
            Synthesis
          </p>

          <div className="mt-2 rounded-2xl rounded-tl-md border border-accent/20 bg-accent/[0.045] px-3.5 py-3 text-xs leading-relaxed text-theme-secondary">
            Stripe charges{' '}
            <span className="font-semibold text-theme-primary">
              2.9% + 30¢
            </span>{' '}
            per transaction.
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {['TechCrunch', 'Earnings', 'p_07'].map((source) => (
              <span
                key={source}
                className="rounded-full border border-theme-border bg-surface-3/70 px-2.5 py-1 font-mono text-[9px] text-theme-muted"
              >
                {source}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-theme-border/70 bg-surface-2/35 p-4 opacity-70">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-theme-muted">
              Never returned
            </p>

            <p className="mt-2 text-xs text-theme-muted line-through">
              Bloomberg · Stripe · 3.5% + 35¢
            </p>
          </div>

          <span className="rounded-full border border-amber-500/25 bg-amber-500/[0.07] px-2 py-1 font-mono text-[9px] font-semibold uppercase text-amber-500">
            Superseded
          </span>
        </div>

        <p className="mt-3 font-mono text-[9px] text-theme-muted">
          retired by compiler · jaccard 0.78
        </p>
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
      label: 'Earnings killed',
      body: 'Bloomberg and TechCrunch findings are already compiled and cached.',
      highlight: true,
      status: '^C',
    },
    {
      time: 'T+11s',
      label: 'Earnings resumed',
      body: 'Reads cached context from /v1/timeline. Upstream agents do not rerun.',
      status: 'resume',
    },
  ]

  return (
    <div className="relative w-full max-w-sm">
      <div className="absolute bottom-7 left-[29px] top-7 w-px bg-gradient-to-b from-theme-border via-accent/45 to-theme-border" />

      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.time}
            className="relative grid grid-cols-[60px_1fr] items-start gap-3"
          >
            <div
              className={`relative z-10 flex h-9 items-center justify-center rounded-full border font-mono text-[10px] font-semibold ${event.highlight
                ? 'border-accent/35 bg-accent text-white shadow-[0_0_0_6px_rgba(99,102,241,0.08)]'
                : 'border-theme-border bg-surface-2 text-theme-muted'
                }`}
            >
              {event.time}
            </div>

            <div
              className={`rounded-2xl border p-4 ${event.highlight
                ? 'border-accent/30 bg-accent/[0.055]'
                : 'border-theme-border/80 bg-surface-2/55'
                }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p
                  className={`font-heading text-sm font-semibold ${event.highlight
                    ? 'text-accent'
                    : 'text-theme-primary'
                    }`}
                >
                  {event.label}
                </p>

                {event.status && (
                  <span
                    className={`rounded-full border px-2 py-1 font-mono text-[9px] ${event.highlight
                      ? 'border-accent/20 bg-accent/[0.08] text-accent'
                      : 'border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-500'
                      }`}
                  >
                    {event.status}
                  </span>
                )}
              </div>

              <p className="mt-2 text-xs leading-relaxed text-theme-muted">
                {event.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.045] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-500">
            Pipeline recovered
          </p>

          <span className="font-mono text-[10px] text-theme-muted">
            0 reruns
          </span>
        </div>
      </div>
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
      <div className="mx-auto mb-14 max-w-3xl text-center md:mb-16">
        <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
          Reference Builds
        </p>

        <Heading
          id="shared-memory-layer"
          className="w-full justify-center text-center font-heading text-4xl font-bold leading-[0.98] tracking-[-0.03em] text-theme-primary md:text-[56px]"
        >
          A Shared Memory Layer for{' '}
          <span className="text-gradient-brand">
            Multi-Agent Pipelines
          </span>
        </Heading>
      </div>

      <div className="space-y-5">
        {PIPELINE_ROWS.map((row, index) => {
          const Visual = row.Visual

          return (
            <motion.article
              key={row.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.55,
                delay: index * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative overflow-hidden rounded-[2rem] border border-theme-border bg-surface-2/35 transition duration-300 hover:-translate-y-1 hover:border-accent/25 hover:bg-surface-2/55 md:grid md:min-h-[430px] md:grid-cols-2 md:items-stretch"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-16 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-accent/[0.06] blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />

              <div className="relative flex flex-col justify-center border-b border-theme-border/70 px-7 py-9 md:border-b-0 md:border-r md:px-10 md:py-12 lg:px-12">
                <span className="mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-accent/20 bg-accent/[0.06] font-mono text-[11px] font-semibold text-accent">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <h3 className="max-w-md font-heading text-2xl font-semibold leading-[1.08] tracking-[-0.025em] text-theme-primary sm:text-3xl">
                  {row.label}
                </h3>

                <p className="mt-5 max-w-lg text-[15px] leading-7 text-theme-secondary">
                  {row.body}
                </p>
              </div>

              <div className="relative flex min-h-[360px] items-center justify-center px-7 py-10 md:min-h-0 md:px-10 md:py-12">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-12 top-1/2 h-40 -translate-y-1/2 rounded-full bg-accent/[0.055] blur-3xl"
                />

                <div className="relative w-full">
                  <Visual />
                </div>
              </div>
            </motion.article>
          )
        })}
      </div>
    </Section>
  )
}

/* ─── The wrong fact never reaches the LLM ───────────────────────────────── */

function ContextBundleCard() {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-theme-border bg-surface-2/35">
      <div className="border-b border-theme-border/70 p-6 sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-danger/30 text-danger">
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6.5 6.5L13.5 13.5M13.5 6.5L6.5 13.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <p className="font-heading text-sm font-semibold text-theme-primary">
              Paste-everything prompt
            </p>
          </div>

          <span className="rounded-full border border-danger/20 bg-danger/[0.06] px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-danger">
            Unfiltered
          </span>
        </div>

        <div className="mb-2 flex items-center justify-between gap-4">
          <span className="text-xs text-theme-secondary">Tokens to LLM</span>

          <span className="rounded-full border border-theme-border bg-surface-3/70 px-2.5 py-1 font-mono text-[10px] text-theme-muted">
            4,000 / session
          </span>
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-surface-3">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: '88%' }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-danger/70 to-danger"
          />
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-theme-muted">
          Both Stripe rates are included. The LLM has to guess which one is
          current.
        </p>
      </div>

      <div className="relative p-6 sm:p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-0 h-24 rounded-full bg-accent/[0.08] blur-3xl"
        />

        <div className="relative">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-accent/30 text-accent">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="10"
                    cy="10"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <circle cx="10" cy="10" r="2.5" fill="currentColor" />
                </svg>
              </div>

              <p className="font-heading text-sm font-semibold text-theme-primary">
                Statewave context bundle
              </p>
            </div>

            <span className="rounded-full border border-accent/20 bg-accent/[0.06] px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-accent">
              Compiled
            </span>
          </div>

          <div className="mb-2 flex items-center justify-between gap-4">
            <span className="text-xs text-theme-secondary">
              Tokens used · average
            </span>

            <span className="rounded-full border border-theme-border bg-surface-3/70 px-2.5 py-1 font-mono text-[10px] text-theme-muted">
              800 / session
            </span>
          </div>

          <div className="h-2.5 overflow-hidden rounded-full bg-surface-3">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '22%' }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{
                duration: 0.8,
                delay: 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="h-full rounded-full bg-gradient-to-r from-accent/60 to-accent"
            />
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-theme-muted">
            Only active memories are included. Bloomberg&apos;s stale rate
            never reaches the prompt.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-3 py-1.5 text-[10px] font-semibold text-emerald-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.08)]" />
            Memory connected
          </div>
        </div>
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
    <Section className="relative overflow-hidden bg-surface-1">
      <div
        aria-hidden="true"
        className="section-glow-full"
      />

      <div className="relative grid items-center gap-14 md:grid-cols-2 lg:gap-20">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            Active Memory
          </p>

          <Heading
            id="wrong-fact"
            className="max-w-xl font-heading text-4xl font-bold leading-[0.98] tracking-[-0.03em] text-theme-primary md:text-[56px]"
          >
            The Wrong Fact Never Reaches the{' '}
            <span className="text-gradient-brand">LLM</span>
          </Heading>

          <p className="mt-6 max-w-xl text-[20px] leading-[1.65] text-theme-secondary/85">
            Statewave&apos;s compiler retires stale memories before they reach
            the prompt. Token usage drops, and only facts that still hold are
            sent to the model.
          </p>

          <ul className="mt-8 space-y-4">
            {WRONG_FACT_BULLETS.map((bullet) => (
              <li
                key={bullet}
                className="flex items-start gap-3 text-[15px] leading-7 text-theme-secondary"
              >
                <svg
                  className="mt-1 h-5 w-5 shrink-0 text-accent"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="10"
                    cy="10"
                    r="8"
                    stroke="currentColor"
                    strokeOpacity="0.45"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M6.5 10.2L8.8 12.5L13.8 7.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <span>{bullet}</span>
              </li>
            ))}
          </ul>

          <div className="mt-9">
            <Button
              href="https://github.com/smaramwbc/statewave-docs/blob/main/getting-started.md"
              variant="primary"
              size="lg"
            >
              Get Started
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{
            duration: 0.55,
            delay: 0.08,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="flex justify-center md:justify-end"
        >
          <div className="group relative flex w-full max-w-xl items-center justify-center overflow-hidden rounded-[2rem] border border-theme-border bg-surface-2/35 px-6 py-10 transition duration-300 hover:border-accent/25 sm:px-9 sm:py-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-12 top-1/2 h-56 -translate-y-1/2 rounded-full bg-accent/[0.075] blur-3xl transition-opacity duration-500 group-hover:opacity-100"
            />

            <div className="relative w-full">
              <ContextBundleCard />
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  )
}

/* ─── Three endpoints / code section ─────────────────────────────────────── */

const ENDPOINT_FEATURES = [
  'Sub-150ms latency for real-time experiences',
  'SOC-2 and HIPAA compliant with secure storage',
  'Compatible with every AI framework and tool.',
]

const JS_SNIPPET = `import StateClient from '@statewave/sdk';

const client = new StateClient({
  apiKey: 'your-api-key'
});`

const PY_SNIPPET = `import os
from statewave import StateClient

os.environ["STATEWAVE_API_KEY"] = "your-api-key"

client = StateClient()`

function CodeBlock({ label, code }: { label: string; code: string }) {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-theme-border bg-surface-2/35 transition duration-300 hover:border-accent/25">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-10 top-0 h-24 rounded-full bg-accent/[0.06] blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      <div className="relative flex items-center justify-between border-b border-theme-border/70 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />

          <span className="ml-3 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-theme-muted">
            {label}
          </span>
        </div>

        <CodeCopyButton
          code={code}
          label={`Copy ${label} snippet`}
        />
      </div>

      <pre className="relative overflow-x-auto p-5 font-mono text-[13px] leading-7 text-theme-secondary">
        {code}
      </pre>
    </div>
  )
}

function ThreeEndpointsSection() {
  return (
    <Section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="section-glow-full"
      />

      <div className="relative grid items-center gap-14 md:grid-cols-2 lg:gap-20">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="order-2 space-y-5 md:order-1"
        >
          <CodeBlock
            label="JavaScript"
            code={JS_SNIPPET}
          />

          <CodeBlock
            label="Python"
            code={PY_SNIPPET}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{
            duration: 0.55,
            delay: 0.08,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="order-1 md:order-2"
        >
          <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            Developer API
          </p>

          <Heading
            id="three-endpoints"
            className="max-w-xl font-heading text-4xl font-bold leading-[0.98] tracking-[-0.03em] text-theme-primary md:text-[56px]"
          >
            Three Endpoints.{' '}
            <span className="text-gradient-brand">
              That's the Core Loop.
            </span>
          </Heading>

          <p className="mt-6 max-w-xl text-[20px] leading-[1.65] text-theme-secondary/85">
            Statewave drops into your existing stack with almost no integration
            work. Connect your agents, persist memory and start shipping in
            minutes.
          </p>

          <ul className="mt-8 space-y-4">
            {ENDPOINT_FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 text-[15px] leading-7 text-theme-secondary"
              >
                <svg
                  className="mt-1 h-5 w-5 shrink-0 text-accent"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="10"
                    cy="10"
                    r="8"
                    stroke="currentColor"
                    strokeOpacity="0.45"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M6.5 10.2L8.8 12.5L13.8 7.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-9">
            <Button
              href="https://github.com/smaramwbc/statewave-docs/blob/main/getting-started.md"
              variant="primary"
              size="lg"
            >
              Integrate Statewave
            </Button>
          </div>
        </motion.div>
      </div>
    </Section>
  )
}

/* ─── Purpose-built feature grid ─────────────────────────────────────────── */

const FEATURE_GRID = [
  {
    title: 'Typed, Ranked Memory',
    description:
      'Every memory has a type, confidence score and provenance. Conflicts are resolved automatically, and superseded memories never surface again.',
  },
  {
    title: 'Multi-User by Default',
    description:
      'Subjects isolate memory per tenant, user or run. One Statewave instance scales to thousands of concurrent agents with zero cross-contamination.',
  },
  {
    title: 'Token Budget Control',
    description:
      'Set max_tokens on every context call. The ranked bundle always fits within budget, with the highest-signal memories first.',
  },
  {
    title: 'Durable Across Sessions',
    description:
      'Episodes are immutable and append-only. Restart pipelines, resume mid-run or replay failed agents without losing shared state.',
  },
  {
    title: 'Full Audit Trail',
    description:
      'Every episode is timestamped and can include a caller_id. Reconstruct any execution through GET /v1/timeline.',
  },
  {
    title: 'Sub-50ms Recall',
    description:
      'Compiled memories are pre-ranked for instant retrieval. Context assembly is a single read, not a vector search.',
  },
]

function FeatureGridSection() {
  return (
    <Section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="section-glow-full"
      />

      <div className="relative">
        <div className="mx-auto mb-14 max-w-3xl text-center md:mb-16">
          <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            Why Statewave
          </p>

          <Heading
            id="purpose-built"
            className="font-heading text-4xl font-bold leading-[0.98] tracking-[-0.03em] text-theme-primary md:text-[56px]"
          >
            Purpose-Built{' '}
            <span className="text-gradient-brand">
              Memory Layer
            </span>{' '}
            for AI Agents
          </Heading>

          <p className="mx-auto mt-6 max-w-2xl text-[20px] leading-[1.65] text-theme-secondary/85">
            Built specifically for long-running AI systems where persistent,
            shared memory is part of the architecture—not an afterthought.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {FEATURE_GRID.map((feature, index) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.5,
                delay: index * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative flex min-h-[280px] flex-col overflow-hidden rounded-[2rem] border border-theme-border bg-surface-2/35 p-7 transition duration-300 hover:-translate-y-1 hover:border-accent/25 hover:bg-surface-2/55 sm:p-8"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-10 top-0 h-28 rounded-full bg-accent/[0.07] blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />

              <div className="relative mb-6 text-accent">
                <svg
                  className="h-8 w-8"
                  viewBox="0 0 28 28"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="14"
                    cy="14"
                    r="12"
                    stroke="currentColor"
                    strokeOpacity="0.45"
                    strokeWidth="1.5"
                  />

                  <path
                    d="M10 14.2L12.7 16.8L18 11.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h3 className="relative font-heading text-[22px] font-semibold leading-[1.15] tracking-[-0.02em] text-theme-primary">
                {feature.title}
              </h3>

              <p className="relative mt-auto pt-8 text-[15px] leading-7 text-theme-secondary">
                {feature.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ─── CTA footer ─────────────────────────────────────────────────────────── */

function CTASection() {
  return (
    <Section>
      <div className="cta-card relative overflow-hidden rounded-[2.5rem] border border-brand-500/25 bg-surface-1/55 px-6 py-20 text-center">
        <div
          className="cta-card-glow absolute inset-0"
          aria-hidden="true"
        />

        <div
          className="absolute inset-x-20 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/60 to-transparent"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            START BUILDING
          </div>

          <Heading
            id="give-your-ai-memory"
            className="font-heading text-4xl md:text-[64px] font-bold leading-[1.02] tracking-[-0.04em] text-theme-primary"
          >
            Give your AI system{" "}
            <span className="text-gradient-brand">
              memory
            </span>
          </Heading>

          <p className="mx-auto mt-6 max-w-2xl text-[20px] leading-[1.65] text-theme-secondary/85">
            Persistent memory for LLMs with sharper context, leaner prompts,
            and conversations that stay personal to every subject.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button
              href="https://github.com/smaramwbc/statewave-docs/blob/main/getting-started.md"
              size="lg"
            >
              Get Started

              <svg
                className="w-4 h-4"
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

            <Button
              to="/use-cases"
              variant="secondary"
              size="lg"
            >
              Explore use cases
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
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
