import React from "react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Button } from "../components/Button";
import { UseCaseSwitcher } from "../components/UseCaseSwitcher";
import { usePageSEO } from "../lib/seo";
import { breadcrumbJsonLd } from "../lib/seo-meta";
import {
  Brain,
  Users,
  WalletCards,
  Database,
  History,
  Zap,
} from "lucide-react";

const PAGE_RAIL_CLASS =
  'mx-auto max-w-[1488px] px-5 sm:px-10 md:px-16 xl:px-[94px]' +
  ' border-b xl:border-l xl:border-r' +
  ' border-theme-border'

/*
 * All product mockups below use the `--viz-*` tokens from src/index.css.
 * Neutral colors adapt to the active theme, while brand and status colors
 * remain consistent in light and dark mode.
 */

function GridSection({
  children,
  className = '',
  innerClassName = '',
}: {
  children: ReactNode
  className?: string
  innerClassName?: string
}) {
  return (
    <section className={`relative bg-surface-1 ${className}`}>
      <div className={`${PAGE_RAIL_CLASS} ${innerClassName}`}>
        {children}
      </div>
    </section>
  )
}

function VisualPanel({
  children,
  className = '',
  style,
}: {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--viz-panel)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function GreenBadge({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 font-mono text-[10px] font-medium"
      style={{
        color: 'var(--viz-green)',
        background: 'rgba(16, 185, 129, 0.07)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          background: 'var(--viz-green)',
          boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.08)',
        }}
      />

      {label}
    </span>
  )
}

/* ─── Hero ───────────────────────────────────────────────────────────────── */

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-surface-1">
      <div
        aria-hidden="true"
        className="section-glow pointer-events-none absolute left-1/2 top-0 h-80 w-[52rem] -translate-x-1/2 rounded-full bg-accent/[0.08] blur-3xl"
      />

      <div className="relative mx-auto max-w-[1488px] border-theme-border px-5 pt-24 pb-10 text-center sm:px-10 md:px-16 md:pt-28 xl:border-l xl:border-r xl:px-[94px] xl:pt-32 xl:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-10">
            <UseCaseSwitcher currentSlug="multi-agent-shared-context" />
          </div>

          <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            Multi-Agent Shared Context
          </p>

          <h1 className="font-heading text-[clamp(3.2rem,6.8vw,6.5rem)] font-bold leading-[0.94] tracking-[-0.06em] text-theme-primary">
            Multiple Agents.
            <br />
            <span className="text-gradient-brand">
              One Source of Truth.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-[20px] leading-[1.65] text-theme-secondary/85">
            Give every agent access to the same durable context. Decisions,
            discoveries and updates become instantly available across your
            entire workflow—without prompt sharing or duplicated work.
          </p>

          <div className="mt-10">
            <Button
              href="https://github.com/smaramwbc/statewave-multi-agent-shared-context"
              variant="primary"
              size="lg"
            >
              Get Started Free
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.15,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-16"
        >
          <HeroRunVisual />
        </motion.div>
      </div>
    </section>
  )
}
const HERO_SHARED_MEMORIES = [
  {
    type: "architectural_decision",
    text: "Deprecation: legacy-session-token",
    score: "score 0.92",
  },
  {
    type: "implementation_note",
    text: "Built: jwt-auth, rbac, login, logout",
    score: "score 0.85",
  },
  {
    type: "review_finding",
    text: "STATUS: CLEAN",
    score: "score 0.79",
  },
];

function AgentTag({
  label,
  color,
  background,
  border,
}: {
  label: string
  color: string
  background: string
  border: string
}) {
  return (
    <span
      className="mb-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.1em]"
      style={{
        color,
        background,
        border: `1px solid ${border}`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          background: color,
          boxShadow: `0 0 0 3px ${background}`,
        }}
      />

      {label}
    </span>
  )
}

function HeroRunVisual() {
  return (
    <div
      className="mx-auto w-full overflow-hidden rounded-t-[2rem] text-left"
      style={{
        maxWidth: 1120,
        background: 'var(--viz-shell)',
        border: '1px solid var(--viz-border-strong)',
        borderBottom: 'none',
        boxShadow: '0 28px 80px rgba(0,0,0,0.16)',
      }}
    >
      <div
        className="flex h-12 items-center justify-between px-4 sm:px-5"
        style={{
          borderBottom: '1px solid var(--viz-border)',
          background: 'var(--viz-shell-header)',
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="flex items-center gap-2 font-mono text-[11px]"
            style={{ color: 'var(--viz-text-3)' }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: 'var(--viz-green)',
                boxShadow: '0 0 0 4px rgba(16,185,129,0.08)',
              }}
            />

            status: ok
          </span>

          <span
            className="hidden items-center gap-2 rounded-full px-2.5 py-1 font-mono text-[10px] text-white sm:inline-flex"
            style={{
              background:
                'linear-gradient(90deg, rgba(79,70,229,0.95), rgba(37,99,235,0.95))',
              border: '1px solid rgba(255,255,255,0.14)',
            }}
          >
            <span>▸ sw-run-8841</span>
            <span className="text-white/60">switch mode</span>
          </span>
        </div>

        <span
          className="font-mono text-[10px]"
          style={{ color: 'var(--viz-text-muted)' }}
        >
          --mode statewave
        </span>
      </div>

      <div className="grid md:grid-cols-[1.45fr_1fr]">
        <div
          className="flex flex-col p-4 sm:p-6"
          style={{ borderRight: '1px solid var(--viz-border)' }}
        >
          <p
            className="mb-5 font-mono text-[10px] uppercase tracking-[0.14em]"
            style={{ color: 'var(--viz-text-muted)' }}
          >
            Agent log
          </p>

          <div className="flex-1 space-y-3.5 text-[13px] leading-relaxed">
            <div
              className="max-w-[78%] rounded-2xl rounded-tl-md px-4 py-3"
              style={{
                background:
                  'linear-gradient(135deg, rgba(99,102,241,0.1), var(--viz-fill))',
                border: '1px solid rgba(129,140,248,0.24)',
                color: 'var(--viz-text-2)',
              }}
            >
              <AgentTag
                label="Planner"
                color="var(--viz-indigo)"
                background="rgba(129,140,248,0.1)"
                border="rgba(129,140,248,0.25)"
              />

              <p>
                Deprecating legacy-session-token, replaced by JWT.
              </p>
            </div>

            <div
              className="max-w-[92%] rounded-2xl rounded-tl-md px-4 py-3"
              style={{
                background:
                  'linear-gradient(135deg, rgba(245,158,11,0.08), var(--viz-fill))',
                border: '1px solid rgba(245,158,11,0.22)',
                color: 'var(--viz-text-2)',
              }}
            >
              <AgentTag
                label="Coder"
                color="var(--viz-amber)"
                background="rgba(245,158,11,0.08)"
                border="rgba(245,158,11,0.24)"
              />

              <p>
                Reading shared context before starting implementation…
                Skipping legacy-session-token because it is deprecated.
                Building jwt-auth instead.
              </p>

              <div className="mt-3 flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-1 font-mono text-[9px]"
                  style={{
                    color: 'var(--viz-green)',
                    background: 'rgba(16,185,129,0.08)',
                    border: '1px solid rgba(16,185,129,0.2)',
                  }}
                >
                  context used
                </span>

                <span
                  className="font-mono text-[9px]"
                  style={{ color: 'var(--viz-text-muted)' }}
                >
                  2 memories
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <div
                className="max-w-[86%] rounded-2xl rounded-tr-md px-4 py-3"
                style={{
                  color: 'var(--viz-text-2)',
                  background:
                    'linear-gradient(135deg, rgba(16,185,129,0.12), var(--viz-fill))',
                  border: '1px solid rgba(16,185,129,0.28)',
                }}
              >
                <AgentTag
                  label="Reviewer"
                  color="var(--viz-green)"
                  background="rgba(16,185,129,0.08)"
                  border="rgba(16,185,129,0.22)"
                />

                <p>
                  No conflicts found. The Coder read the Planner&apos;s
                  deprecation before acting.
                </p>
              </div>
            </div>
          </div>

          <div
            className="mt-6 flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5"
            style={{
              background: 'var(--viz-fill)',
              border: '1px solid var(--viz-border)',
            }}
          >
            <span
              className="truncate font-mono text-[11px]"
              style={{ color: 'var(--viz-text-muted)' }}
            >
              $ python main.py --mode statewave
            </span>

            <span
              className="shrink-0 rounded-lg px-4 py-1.5 text-[11px] font-medium text-white"
              style={{
                background:
                  'linear-gradient(90deg, #4F46E5 0%, #2563EB 100%)',
                boxShadow: '0 8px 24px rgba(79,70,229,0.22)',
              }}
            >
              Run
            </span>
          </div>
        </div>

        <div
          className="flex flex-col p-4 sm:p-6"
          style={{ background: 'var(--viz-shell-side)' }}
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.14em]"
              style={{ color: 'var(--viz-text-muted)' }}
            >
              Shared context
            </p>

            <span
              className="font-mono text-[9px]"
              style={{ color: 'var(--viz-text-muted)' }}
            >
              subject: sw-run-8841
            </span>
          </div>

          <div className="flex-1 space-y-2.5">
            {HERO_SHARED_MEMORIES.map((memory, index) => (
              <div
                key={`${memory.type}-${index}`}
                className="rounded-xl px-3.5 py-3"
                style={{
                  background:
                    index === 0
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.08), var(--viz-fill))'
                      : 'var(--viz-fill)',
                  border:
                    index === 0
                      ? '1px solid rgba(129,140,248,0.22)'
                      : '1px solid var(--viz-border)',
                }}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span
                    className="rounded-full px-2 py-1 font-mono text-[9px]"
                    style={{
                      color: 'var(--viz-indigo)',
                      background: 'rgba(129,140,248,0.1)',
                      border: '1px solid rgba(129,140,248,0.25)',
                    }}
                  >
                    {memory.type}
                  </span>

                  <span
                    className="font-mono text-[9px]"
                    style={{ color: 'var(--viz-text-muted)' }}
                  >
                    {memory.score}
                  </span>
                </div>

                <p
                  className="text-[12px] leading-relaxed"
                  style={{ color: 'var(--viz-text-2)' }}
                >
                  {memory.text}
                </p>
              </div>
            ))}
          </div>

          <div
            className="mt-4 flex items-center gap-2.5 rounded-xl px-3 py-2.5"
            style={{
              background:
                'linear-gradient(90deg, rgba(16,185,129,0.09), rgba(16,185,129,0.04))',
              border: '1px solid rgba(16,185,129,0.2)',
            }}
          >
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{
                background: 'var(--viz-green)',
                boxShadow: '0 0 0 4px rgba(16,185,129,0.08)',
              }}
            />

            <span
              className="font-mono text-[10px]"
              style={{ color: 'var(--viz-green)' }}
            >
              Conflict avoided: read before write
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── The Cost of Message-Passing Only ───────────────────────────────────── */

const COST_ITEMS = [
  {
    title: "No Turn Order in Parallel",
    body: "Message-passing tutorials assume agents take turns. Parallel agents don't wait for a message that hasn't been sent yet.",
  },
  {
    title: "Conflicts Caught Too Late",
    body: "The Reviewer catches the conflict only after both agents have finished. The wasted compute can't be recovered.",
  },
  {
    title: "\"Did Someone Decide This?\" Is a Guess",
    body: "Without a shared authoritative layer, every agent is reconstructing state from whatever messages happened to reach it.",
  },
];

function CostSection() {
  return (
    <GridSection innerClassName="relative overflow-hidden bg-surface-1 py-20 sm:py-24 xl:py-28">
      <div
        aria-hidden="true"
        className="section-glow pointer-events-none absolute left-1/2 top-0 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-danger/[0.08] blur-3xl"
      />

      <div className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            Problems
          </p>

          <h2 className="font-heading text-4xl font-bold leading-[0.98] tracking-[-0.03em] text-theme-primary md:text-[56px]">
            The Cost of{' '}
            <span className="text-gradient-brand">
              Message-Passing Only
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-[20px] leading-[1.65] text-theme-secondary/85">
            Without shared context, agents repeat work, lose decisions and rely
            on fragile handoffs to stay aligned.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
          {COST_ITEMS.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                delay: index * 0.08,
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="sw-card group relative flex min-h-[280px] flex-col overflow-hidden rounded-2xl border border-theme-border bg-surface-2/35 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-danger/25 hover:bg-surface-2/55 sm:p-8"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-10 top-0 h-28 rounded-full bg-danger/[0.08] blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />

              <div className="relative">
                <div className="mb-6 text-danger">
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

                <h3 className="font-heading text-[19px] font-semibold leading-snug text-theme-primary">
                  {item.title}
                </h3>
              </div>

              <p className="relative mt-auto pt-8 text-[15px] leading-[1.7] text-theme-muted">
                {item.body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </GridSection>
  )
}

/* ─── One subject. Every agent reads it. ─────────────────────────────────── */

const FEATURE_CARDS_DATA = [
  {
    title: "Every decision is an episode",
    body: "create_episode() records one raw fact per agent action. Cheap, append-only, no interpretation yet.",
    Visual: EpisodeTimelineVisual,
  },
  {
    title: "Read before write, always",
    body: "The Coder's context read happens before it decides what to build, not after. That ordering is what prevents the collision instead of just detecting it.",
    Visual: ReadBeforeWriteVisual,
  },
  {
    title: "Portable Across Frameworks",
    body: "SharedContext isn't tied to this repo's agents. Wrap the same before_acting()/decide() pair around any CrewAI tool or Claude Agent SDK loop.",
    Visual: FrameworkVisual,
  },
  {
    title: "Same Subject, Every Role",
    body: "One run, one subject_id. Every agent in the fleet reads and writes that same shared context, automatically.",
    Visual: SubjectVisual,
  },
];

/* Visual 1: episode timeline, planner decision highlighted */
function EpisodeTimelineVisual() {
  const secondaryEpisodes = [
    {
      agent: 'Coder',
      time: 'T+4m 0s',
      type: 'implementation_note',
      text: 'Built jwt-auth, RBAC, login and logout.',
      color: 'var(--viz-amber)',
      background: 'rgba(245,158,11,0.08)',
      border: 'rgba(245,158,11,0.22)',
    },
    {
      agent: 'Reviewer',
      time: 'T+4m 45s',
      type: 'review_finding',
      text: 'STATUS: CLEAN',
      color: 'var(--viz-green)',
      background: 'rgba(16,185,129,0.08)',
      border: 'rgba(16,185,129,0.22)',
    },
  ]

  return (
    <div className="mx-auto w-full max-w-[400px]">
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute bottom-7 left-[17px] top-7 w-px"
          style={{
            background:
              'linear-gradient(to bottom, rgba(99,102,241,0.55), var(--viz-border), transparent)',
          }}
        />

        <div className="space-y-4">
          <div className="relative grid grid-cols-[36px_1fr] items-start gap-3">
            <div
              className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full font-mono text-[10px] font-semibold"
              style={{
                color: 'var(--viz-indigo)',
                background: 'var(--viz-shell)',
                border: '1px solid rgba(129,140,248,0.35)',
                boxShadow: '0 0 0 6px rgba(99,102,241,0.06)',
              }}
            >
              01
            </div>

            <div
              className="rounded-2xl p-4"
              style={{
                background:
                  'linear-gradient(135deg, rgba(79,70,229,0.24), rgba(37,99,235,0.12))',
                border: '1px solid rgba(99,102,241,0.45)',
              }}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span
                  className="rounded-full px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.08em]"
                  style={{
                    color: '#fff',
                    background: 'rgba(79,70,229,0.88)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  Planner
                </span>

                <span
                  className="font-mono text-[9px]"
                  style={{ color: 'var(--viz-text-muted)' }}
                >
                  T+0.0s
                </span>
              </div>

              <p
                className="font-mono text-[12px] font-semibold"
                style={{ color: 'var(--viz-text)' }}
              >
                architectural_decision
              </p>

              <p
                className="mt-2 font-mono text-[9px] uppercase tracking-[0.1em]"
                style={{ color: 'var(--viz-text-muted)' }}
              >
                Content
              </p>

              <p
                className="mt-1 text-[12px] leading-relaxed"
                style={{ color: 'var(--viz-text-2)' }}
              >
                Deprecate legacy-session-token and replace it with JWT.
              </p>
            </div>
          </div>

          {secondaryEpisodes.map((episode, index) => (
            <div
              key={episode.agent}
              className="relative grid grid-cols-[36px_1fr] items-start gap-3"
            >
              <div
                className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full font-mono text-[10px] font-semibold"
                style={{
                  color: episode.color,
                  background: 'var(--viz-shell)',
                  border: `1px solid ${episode.border}`,
                }}
              >
                {String(index + 2).padStart(2, '0')}
              </div>

              <div
                className="rounded-2xl p-4"
                style={{
                  background: episode.background,
                  border: `1px solid ${episode.border}`,
                }}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span
                    className="rounded-full px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.08em]"
                    style={{
                      color: episode.color,
                      background: episode.background,
                      border: `1px solid ${episode.border}`,
                    }}
                  >
                    {episode.agent}
                  </span>

                  <span
                    className="font-mono text-[9px]"
                    style={{ color: 'var(--viz-text-muted)' }}
                  >
                    {episode.time}
                  </span>
                </div>

                <p
                  className="font-mono text-[11px] font-semibold"
                  style={{ color: 'var(--viz-text)' }}
                >
                  {episode.type}
                </p>

                <p
                  className="mt-1 text-[11px] leading-relaxed"
                  style={{ color: 'var(--viz-text-3)' }}
                >
                  {episode.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="mt-4 flex items-center justify-between rounded-xl px-3 py-2.5"
        style={{
          background: 'rgba(16,185,129,0.07)',
          border: '1px solid rgba(16,185,129,0.18)',
        }}
      >
        <span
          className="font-mono text-[10px]"
          style={{ color: 'var(--viz-green)' }}
        >
          3 episodes persisted
        </span>

        <span
          className="font-mono text-[9px]"
          style={{ color: 'var(--viz-text-muted)' }}
        >
          append-only
        </span>
      </div>
    </div>
  )
}

/* Visual 2: three numbered call rows */
function ReadBeforeWriteVisual() {
  const steps = [
    {
      number: '01',
      title: 'create_episode()',
      body: 'Planner records its architectural decision.',
      color: 'var(--viz-indigo)',
      background: 'rgba(99,102,241,0.08)',
      border: 'rgba(129,140,248,0.22)',
    },
    {
      number: '02',
      title: 'compile_memories_wait()',
      body: 'The decision becomes active and readable by every agent.',
      color: '#fff',
      background:
        'linear-gradient(135deg, rgba(79,70,229,0.92), rgba(37,99,235,0.88))',
      border: 'rgba(129,140,248,0.55)',
      active: true,
    },
    {
      number: '03',
      title: 'get_context()',
      body: 'Coder reads the decision before writing any code.',
      color: 'var(--viz-green)',
      background: 'rgba(16,185,129,0.08)',
      border: 'rgba(16,185,129,0.22)',
    },
  ]

  return (
    <div className="mx-auto w-full max-w-[400px]">
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute bottom-8 left-[17px] top-8 w-px"
          style={{
            background:
              'linear-gradient(to bottom, var(--viz-border), rgba(99,102,241,0.5), var(--viz-border))',
          }}
        />

        <div className="space-y-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative grid grid-cols-[36px_1fr] items-start gap-3"
            >
              <div
                className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full font-mono text-[10px] font-semibold"
                style={{
                  color: step.active ? '#fff' : step.color,
                  background: step.active ? '#4f46e5' : 'var(--viz-shell)',
                  border: `1px solid ${step.border}`,
                  boxShadow: step.active
                    ? '0 0 0 6px rgba(99,102,241,0.08)'
                    : undefined,
                }}
              >
                {step.number}
              </div>

              <div
                className="rounded-2xl p-4"
                style={{
                  background: step.background,
                  border: `1px solid ${step.border}`,
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <p
                    className="font-mono text-[12px] font-semibold"
                    style={{
                      color: step.active ? '#fff' : 'var(--viz-text)',
                    }}
                  >
                    {step.title}
                  </p>

                  {step.active && (
                    <span className="rounded-full border border-white/15 bg-white/10 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.08em] text-white/80">
                      compile
                    </span>
                  )}
                </div>

                <p
                  className="mt-2 text-[11px] leading-relaxed"
                  style={{
                    color: step.active
                      ? 'rgba(255,255,255,0.76)'
                      : 'var(--viz-text-3)',
                  }}
                >
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="mt-4 flex items-center gap-2.5 rounded-xl px-3 py-2.5"
        style={{
          background: 'rgba(16,185,129,0.07)',
          border: '1px solid rgba(16,185,129,0.18)',
        }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background: 'var(--viz-green)',
            boxShadow: '0 0 0 4px rgba(16,185,129,0.08)',
          }}
        />

        <span
          className="font-mono text-[10px]"
          style={{ color: 'var(--viz-green)' }}
        >
          collision prevented before execution
        </span>
      </div>
    </div>
  )
}

/* Visual 3: framework tabs + code block */
function FrameworkVisual() {
  const frameworks = ['LangGraph', 'Claude Agent SDK', 'CrewAI']

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div className="mb-4 flex flex-wrap gap-2">
        {frameworks.map((framework) => {
          const active = framework === 'CrewAI'

          return (
            <span
              key={framework}
              className="rounded-full px-3 py-1.5 font-mono text-[10px] font-medium"
              style={
                active
                  ? {
                    color: '#fff',
                    background:
                      'linear-gradient(90deg, #4F46E5 0%, #2563EB 100%)',
                    border: '1px solid rgba(129,140,248,0.45)',
                  }
                  : {
                    color: 'var(--viz-text-3)',
                    background: 'var(--viz-fill)',
                    border: '1px solid var(--viz-border-strong)',
                  }
              }
            >
              {framework}
            </span>
          )
        })}
      </div>

      <div
        className="overflow-hidden rounded-2xl"
        style={{
          background: 'var(--viz-code-bg)',
          border: '1px solid var(--viz-border)',
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{
            borderBottom: '1px solid var(--viz-border)',
            background: 'var(--viz-shell-header)',
          }}
        >
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
          </div>

          <span
            className="font-mono text-[9px]"
            style={{ color: 'var(--viz-text-muted)' }}
          >
            agent.py
          </span>
        </div>

        <div className="overflow-x-auto p-4 font-mono text-[11px] leading-[1.9]">
          <p>
            <span style={{ color: 'var(--viz-indigo)' }}>bundle</span>
            <span style={{ color: 'var(--viz-code-muted)' }}> = </span>
            <span style={{ color: 'var(--viz-code-text)' }}>
              shared.before_acting(
            </span>
          </p>
          <p className="pl-5">
            <span style={{ color: 'var(--viz-code-text)' }}>
              caller_id, task
            </span>
          </p>
          <p>
            <span style={{ color: 'var(--viz-code-text)' }}>)</span>
          </p>

          <p className="mt-2">
            <span style={{ color: 'var(--viz-indigo)' }}>result</span>
            <span style={{ color: 'var(--viz-code-muted)' }}> = </span>
            <span style={{ color: 'var(--viz-code-text)' }}>
              agent.run(task, context=bundle)
            </span>
          </p>

          <p className="mt-2">
            <span style={{ color: 'var(--viz-code-text)' }}>
              shared.decide(caller_id, result.decision)
            </span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <GreenBadge label="SharedContext unchanged" />

        <span
          className="rounded-full px-2.5 py-1 font-mono text-[9px]"
          style={{
            color: 'var(--viz-text-3)',
            background: 'var(--viz-fill)',
            border: '1px solid var(--viz-border-strong)',
          }}
        >
          only the harness changes
        </span>
      </div>
    </div>
  )
}

/* Visual 4: one subject, three roles */
function SubjectVisual() {
  const roles = [
    {
      name: 'planner',
      color: 'var(--viz-indigo)',
      background: 'rgba(129,140,248,0.1)',
      border: 'rgba(129,140,248,0.25)',
    },
    {
      name: 'coder',
      color: 'var(--viz-amber)',
      background: 'rgba(245,158,11,0.08)',
      border: 'rgba(245,158,11,0.22)',
    },
    {
      name: 'reviewer',
      color: 'var(--viz-green)',
      background: 'rgba(16,185,129,0.08)',
      border: 'rgba(16,185,129,0.22)',
    },
  ]

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div
        className="rounded-2xl p-4"
        style={{
          background: 'var(--viz-fill)',
          border: '1px solid var(--viz-border)',
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <span
            className="font-mono text-[9px] uppercase tracking-[0.1em]"
            style={{ color: 'var(--viz-text-muted)' }}
          >
            Shared subject
          </span>

          <GreenBadge label="active" />
        </div>

        <p
          className="mt-3 font-mono text-[12px] font-semibold"
          style={{ color: 'var(--viz-text)' }}
        >
          subject_id = &quot;sw-run-8841&quot;
        </p>
      </div>

      <div className="relative my-4">
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-0 h-6 w-px -translate-x-1/2"
          style={{ background: 'var(--viz-border-strong)' }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 pt-6">
        {roles.map((role) => (
          <div
            key={role.name}
            className="rounded-2xl p-3 text-center"
            style={{
              background: role.background,
              border: `1px solid ${role.border}`,
            }}
          >
            <div
              className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full font-mono text-[10px] font-semibold uppercase"
              style={{
                color: role.color,
                background: 'var(--viz-shell)',
                border: `1px solid ${role.border}`,
              }}
            >
              {role.name.charAt(0)}
            </div>

            <p
              className="font-mono text-[9px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: role.color }}
            >
              {role.name}
            </p>
          </div>
        ))}
      </div>

      <p
        className="mt-4 text-center font-mono text-[9px]"
        style={{ color: 'var(--viz-text-muted)' }}
      >
        caller_id attributes every read and write
      </p>

      <div
        className="mt-4 rounded-2xl px-4 py-3"
        style={{
          background:
            'linear-gradient(135deg, rgba(79,70,229,0.18), rgba(37,99,235,0.08))',
          border: '1px solid rgba(99,102,241,0.35)',
        }}
      >
        <p
          className="text-[11px] leading-relaxed"
          style={{ color: 'var(--viz-text-2)' }}
        >
          All three roles read and write the same subject. “Did someone already
          decide this?” becomes a lookup, not a guess.
        </p>
      </div>
    </div>
  )
}

function FeatureCardsSection() {
  return (
    <GridSection innerClassName="relative overflow-hidden py-20 sm:py-24 xl:py-28">
      <div
        aria-hidden="true"
        className="section-glow pointer-events-none absolute left-1/2 top-0 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-accent/[0.08] blur-3xl"
      />

      <div className="relative">
        <div className="mx-auto mb-14 max-w-3xl text-center sm:mb-16">
          <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            Features
          </p>

          <h2 className="font-heading text-4xl font-bold leading-[0.98] tracking-[-0.03em] text-theme-primary md:text-[56px]">
            One Subject.{' '}
            <span className="text-gradient-brand">
              Every Agent Reads It.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-[20px] leading-[1.65] text-theme-secondary/85">
            Every role operates from the same durable context while preserving
            its own actions, decisions and provenance.
          </p>
        </div>

        <div className="mx-auto grid max-w-[1100px] gap-5 sm:grid-cols-2">
          {FEATURE_CARDS_DATA.map((card, index) => {
            const Visual = card.Visual

            return (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.07,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative overflow-hidden rounded-[2rem] border border-theme-border bg-surface-2/35 transition duration-300 hover:-translate-y-1 hover:border-accent/25 hover:bg-surface-2/55"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-10 top-0 h-32 rounded-full bg-accent/[0.07] blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />

                <VisualPanel className="relative flex min-h-[320px] items-center justify-center px-5 py-10 sm:min-h-[380px] sm:px-8 md:min-h-[420px]">
                  <Visual />
                </VisualPanel>

                <div className="relative border-t border-theme-border/70 bg-surface-1/70 px-7 py-8 sm:px-8">
                  <h3 className="font-heading text-[22px] font-semibold leading-[1.15] tracking-[-0.02em] text-theme-primary">
                    {card.title}
                  </h3>

                  <p className="mt-4 max-w-[430px] text-[15px] leading-7 text-theme-secondary">
                    {card.body}
                  </p>
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </GridSection>
  )
}
/* ─── One repo. Three ways to see the collision prevented. ───────────────── */

const REFERENCE_ROWS_DATA = [
  {
    label: 'The Collision, Before Statewave',
    body: "python main.py --mode naive runs the same task with message-passing only. The Coder never sees the Planner's deprecation and rebuilds the dead module from scratch.",
    tags: ['Python', 'LiteLLM'],
    Visual: NaiveRunVisual,
  },
  {
    label: 'No Collision, After Statewave',
    body: 'python main.py --mode statewave runs the identical task on a shared subject. The Coder reads the deprecation before writing any code and skips the dead module entirely.',
    tags: ['Python', 'Statewave SDK'],
    Visual: StatewaveRunVisual,
  },
  {
    label: 'The Full Audit Trail, on Demand',
    body: 'timeline_inspector.py --run <id> prints the chronological chain for any run: what each agent knew when it acted, what it wrote and the final memory state.',
    tags: ['Python', 'Rich'],
    Visual: TimelineVisual,
  },
]

function LogRow({
  agent,
  agentColor,
  text,
  status,
}: {
  agent: string
  agentColor: string
  text: string
  status?: 'error' | 'success' | 'neutral'
}) {
  const statusStyles = {
    error: {
      background: 'rgba(239,68,68,0.06)',
      border: 'rgba(239,68,68,0.18)',
    },
    success: {
      background: 'rgba(16,185,129,0.06)',
      border: 'rgba(16,185,129,0.18)',
    },
    neutral: {
      background: 'var(--viz-card-2)',
      border: 'var(--viz-border)',
    },
  }

  const currentStatus = statusStyles[status ?? 'neutral']

  return (
    <div
      className="group flex items-start gap-3 rounded-xl px-3.5 py-3 font-mono text-[11px] leading-relaxed transition-colors duration-200"
      style={{
        background: currentStatus.background,
        border: `1px solid ${currentStatus.border}`,
      }}
    >
      <span
        className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full"
        style={{
          background: agentColor,
          boxShadow: `0 0 0 4px color-mix(in srgb, ${agentColor} 10%, transparent)`,
        }}
      />

      <div className="min-w-0">
        <span
          className="mr-2 inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em]"
          style={{
            color: agentColor,
            background: `color-mix(in srgb, ${agentColor} 8%, transparent)`,
            border: `1px solid color-mix(in srgb, ${agentColor} 22%, transparent)`,
          }}
        >
          {agent}
        </span>

        <span style={{ color: 'var(--viz-text-3)' }}>
          {text}
        </span>
      </div>
    </div>
  )
}
/* Visual 1: naive run log ending in red collision */
function NaiveRunVisual() {
  return (
    <div className="mx-auto w-full max-w-[440px]">
      <div
        className="overflow-hidden rounded-2xl"
        style={{
          background: "var(--viz-shell)",
          border: "1px solid var(--viz-border)",
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{
            background: "var(--viz-shell-header)",
            borderBottom: "1px solid var(--viz-border)",
          }}
        >
          <span
            className="font-mono text-[10px] uppercase tracking-[0.08em]"
            style={{ color: "var(--viz-text-muted)" }}
          >
            python main.py --mode naive
          </span>

          <span
            className="rounded-full px-2 py-1 font-mono text-[9px]"
            style={{
              color: "#f87171",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            message passing
          </span>
        </div>

        <div className="space-y-3 p-4">
          <LogRow
            agent="Planner"
            agentColor="var(--viz-indigo)"
            text="Deprecates legacy-session-token and replaces it with JWT."
          />

          <LogRow
            agent="Coder"
            agentColor="var(--viz-amber)"
            text="No shared context found. Building from task description only."
          />

          <LogRow
            agent="Coder"
            agentColor="var(--viz-amber)"
            text="Implements legacy-session-token and jwt-auth simultaneously."
            status="error"
          />

          <div
            className="rounded-xl p-4"
            style={{
              background:
                "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(127,29,29,0.28))",
              border: "1px solid rgba(239,68,68,0.22)",
            }}
          >
            <div className="mb-2 flex items-center gap-2">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full"
                style={{
                  background: "rgba(239,68,68,0.15)",
                  color: "#f87171",
                }}
              >
                ✕
              </span>

              <span
                className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em]"
                style={{ color: "#fca5a5" }}
              >
                Collision detected
              </span>
            </div>

            <p
              className="text-[11px] leading-relaxed"
              style={{ color: "rgba(255,255,255,0.82)" }}
            >
              Reviewer detects duplicated work only after both agents have
              finished. Compute has already been wasted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Visual 2: statewave run log ending in green avoidance */
function StatewaveRunVisual() {
  return (
    <div className="mx-auto w-full max-w-[440px]">
      <div
        className="overflow-hidden rounded-2xl"
        style={{
          background: "var(--viz-shell)",
          border: "1px solid var(--viz-border)",
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{
            background: "var(--viz-shell-header)",
            borderBottom: "1px solid var(--viz-border)",
          }}
        >
          <span
            className="font-mono text-[10px] uppercase tracking-[0.08em]"
            style={{ color: "var(--viz-text-muted)" }}
          >
            python main.py --mode statewave
          </span>

          <span
            className="rounded-full px-2 py-1 font-mono text-[9px]"
            style={{
              color: "var(--viz-green)",
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            shared context
          </span>
        </div>

        <div className="space-y-3 p-4">
          <LogRow
            agent="Planner"
            agentColor="var(--viz-indigo)"
            text="Deprecates legacy-session-token and replaces it with JWT."
          />

          <LogRow
            agent="Planner"
            agentColor="var(--viz-indigo)"
            text="Compiles the episode so the decision is immediately readable."
          />

          <LogRow
            agent="Coder"
            agentColor="var(--viz-amber)"
            text="Reads architectural_decision with 0.92 relevance before acting."
            status="success"
          />

          <LogRow
            agent="Coder"
            agentColor="var(--viz-amber)"
            text="Skips legacy-session-token and builds jwt-auth instead."
            status="success"
          />

          <div
            className="rounded-xl p-4"
            style={{
              background:
                "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,78,59,0.24))",
              border: "1px solid rgba(16,185,129,0.24)",
            }}
          >
            <div className="mb-2 flex items-center gap-2">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full"
                style={{
                  color: "var(--viz-green)",
                  background: "rgba(16,185,129,0.14)",
                }}
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3.5 8.25L6.5 11.25L12.5 4.75"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>

              <span
                className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em]"
                style={{ color: "var(--viz-green)" }}
              >
                Conflict avoided
              </span>
            </div>

            <p
              className="text-[11px] leading-relaxed"
              style={{ color: "var(--viz-text-2)" }}
            >
              The Coder read the Planner&apos;s deprecation before acting, so
              the obsolete module was never rebuilt.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* Visual 3: timeline inspector table */
function TimelineVisual() {
  const rows = [
    {
      time: "14:01:00Z",
      rel: "T+0.0s",
      agent: "Planner",
      color: "var(--viz-indigo)",
      event: "Architectural decision → Deprecate legacy-session-token",
    },
    {
      time: "14:01:12Z",
      rel: "T+12.1s",
      agent: "Planner",
      color: "var(--viz-indigo)",
      event: "Episodes compiled into shared memories",
    },
    {
      time: "14:01:15Z",
      rel: "T+15.3s",
      agent: "Coder",
      color: "var(--viz-amber)",
      event: "Retrieved 2 memories before implementation",
    },
    {
      time: "14:05:00Z",
      rel: "T+4m0s",
      agent: "Coder",
      color: "var(--viz-amber)",
      event: "Built jwt-auth, RBAC, login and logout",
    },
    {
      time: "14:05:45Z",
      rel: "T+4m45s",
      agent: "Reviewer",
      color: "var(--viz-green)",
      event: "Review completed · STATUS: CLEAN",
    },
  ]

  return (
    <div className="mx-auto w-full max-w-[470px]">
      <div
        className="overflow-hidden rounded-2xl"
        style={{
          background: "var(--viz-shell)",
          border: "1px solid var(--viz-border)",
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{
            background: "var(--viz-shell-header)",
            borderBottom: "1px solid var(--viz-border)",
          }}
        >
          <span
            className="font-mono text-[10px] uppercase tracking-[0.08em]"
            style={{ color: "var(--viz-text-muted)" }}
          >
            timeline_inspector.py
          </span>

          <GreenBadge label="audit trail" />
        </div>

        <div className="px-4 py-3">
          <div
            className="mb-2 grid grid-cols-[74px_56px_70px_1fr] gap-3 px-3 font-mono text-[9px] uppercase tracking-[0.08em]"
            style={{ color: "var(--viz-text-muted)" }}
          >
            <span>Time</span>
            <span>Rel</span>
            <span>Agent</span>
            <span>Event</span>
          </div>

          <div className="space-y-2">
            {rows.map((row, index) => (
              <div
                key={row.time}
                className="grid grid-cols-[74px_56px_70px_1fr] items-center gap-3 rounded-xl px-3 py-3 transition-colors"
                style={{
                  background:
                    index === 0
                      ? "rgba(79,70,229,0.08)"
                      : "var(--viz-card-2)",
                  border:
                    index === 0
                      ? "1px solid rgba(99,102,241,0.25)"
                      : "1px solid var(--viz-border)",
                }}
              >
                <span
                  className="font-mono text-[10px]"
                  style={{ color: "var(--viz-text-muted)" }}
                >
                  {row.time}
                </span>

                <span
                  className="font-mono text-[10px]"
                  style={{ color: "var(--viz-text-muted)" }}
                >
                  {row.rel}
                </span>

                <span
                  className="inline-flex w-fit rounded-full px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.08em]"
                  style={{
                    color: row.color,
                    background: `color-mix(in srgb, ${row.color} 8%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${row.color} 22%, transparent)`,
                  }}
                >
                  {row.agent}
                </span>

                <span
                  className="text-[11px] leading-relaxed"
                  style={{ color: "var(--viz-text-3)" }}
                >
                  {row.event}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ReferenceBuildsSection() {
  return (
    <GridSection innerClassName="relative overflow-hidden py-20 sm:py-24 xl:py-28">
      <div
        aria-hidden="true"
        className="section-glow pointer-events-none absolute left-1/2 top-0 h-72 w-[46rem] -translate-x-1/2 rounded-full bg-accent/[0.08] blur-3xl"
      />

      <div className="relative">
        <div className="mx-auto mb-14 max-w-3xl text-center sm:mb-16">
          <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            Reference Builds
          </p>

          <h2 className="font-heading text-4xl font-bold leading-[0.98] tracking-[-0.03em] text-theme-primary md:text-[56px]">
            One Repository.
            <br />
            <span className="text-gradient-brand">
              Three Ways To See It.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-[20px] leading-[1.65] text-theme-secondary/85">
            Compare the same workflow before and after Statewave, then inspect
            the complete execution history behind every decision.
          </p>
        </div>

        <div className="mx-auto max-w-[1120px] space-y-6">
          {REFERENCE_ROWS_DATA.map((row, index) => {
            const Visual = row.Visual

            return (
              <motion.article
                key={row.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group overflow-hidden rounded-[2rem] border border-theme-border bg-surface-2/35 transition-all duration-300 hover:-translate-y-1 hover:border-accent/25 hover:bg-surface-2/55 md:grid md:grid-cols-[420px_1fr]"
              >
                <div className="relative flex flex-col justify-center border-b border-theme-border/70 bg-surface-1/70 p-8 md:border-b-0 md:border-r md:p-10">
                  <div className="mb-5 flex flex-wrap gap-2">
                    {row.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-theme-border bg-surface-2 px-3 py-1 text-[11px] font-medium text-theme-secondary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="font-heading text-[30px] font-semibold leading-[1.08] tracking-[-0.03em] text-theme-primary">
                    {row.label}
                  </h3>

                  <p className="mt-5 text-[15px] leading-7 text-theme-secondary">
                    {row.body}
                  </p>
                </div>

                <VisualPanel className="relative flex min-h-[320px] items-center justify-center px-5 py-10 sm:px-8 md:min-h-[380px] md:px-10">
                  <Visual />
                </VisualPanel>
              </motion.article>
            )
          })}
        </div>
      </div>
    </GridSection>
  )
}

/* ─── Prevented, not just detected ───────────────────────────────────────── */

function PipelineComparisonCard() {
  const pipelines = [
    {
      title: "Naive pipeline",
      subtitle: "Message-passing only",
      value: "task string only",
      width: "9%",
      color: "#ef4444",
      note: "The Reviewer detects the conflict only after both agents finish.",
      status: "Collision detected",
      statusColor: "#f87171",
      statusBackground: "rgba(239,68,68,0.08)",
      statusBorder: "rgba(239,68,68,0.2)",
    },
    {
      title: "Statewave pipeline",
      subtitle: "Shared subject",
      value: "2 ranked memories",
      width: "92%",
      color: "var(--viz-indigo)",
      note: "The deprecation is known before the first line of code is written.",
      status: "Conflict avoided",
      statusColor: "var(--viz-green)",
      statusBackground: "rgba(16,185,129,0.08)",
      statusBorder: "rgba(16,185,129,0.2)",
    },
  ]

  return (
    <div
      className="w-full max-w-[480px] overflow-hidden rounded-[2rem]"
      style={{
        background: "var(--viz-card)",
        border: "1px solid var(--viz-border-strong)",
        boxShadow: "0 24px 70px rgba(0,0,0,0.14)",
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-4 sm:px-6"
        style={{
          background: "var(--viz-shell-header)",
          borderBottom: "1px solid var(--viz-border)",
        }}
      >
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.12em]"
            style={{ color: "var(--viz-text-muted)" }}
          >
            Pipeline comparison
          </p>

          <p
            className="mt-1 text-[13px] font-medium"
            style={{ color: "var(--viz-text-2)" }}
          >
            Context available before execution
          </p>
        </div>

        <span
          className="rounded-full px-2.5 py-1 font-mono text-[9px]"
          style={{
            color: "var(--viz-text-muted)",
            background: "var(--viz-fill)",
            border: "1px solid var(--viz-border)",
          }}
        >
          same task
        </span>
      </div>

      <div className="divide-y divide-theme-border/70 p-5 sm:p-6">
        {pipelines.map((pipeline) => (
          <div
            key={pipeline.title}
            className="py-6 first:pt-0 last:pb-0"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p
                  className="text-[15px] font-semibold"
                  style={{ color: "var(--viz-text)" }}
                >
                  {pipeline.title}
                </p>

                <p
                  className="mt-1 font-mono text-[10px]"
                  style={{ color: "var(--viz-text-muted)" }}
                >
                  {pipeline.subtitle}
                </p>
              </div>

              <span
                className="shrink-0 rounded-full px-2.5 py-1 font-mono text-[9px]"
                style={{
                  color: pipeline.statusColor,
                  background: pipeline.statusBackground,
                  border: `1px solid ${pipeline.statusBorder}`,
                }}
              >
                {pipeline.status}
              </span>
            </div>

            <div className="mb-2 flex items-center justify-between gap-3">
              <span
                className="text-[12px]"
                style={{ color: "var(--viz-text-3)" }}
              >
                Coder&apos;s context before acting
              </span>

              <span
                className="rounded-full px-2.5 py-1 font-mono text-[9px]"
                style={{
                  color: "var(--viz-text-muted)",
                  background: "var(--viz-fill)",
                  border: "1px solid var(--viz-border)",
                }}
              >
                {pipeline.value}
              </span>
            </div>

            <div
              className="h-3 overflow-hidden rounded-full"
              style={{ background: "var(--viz-track)" }}
            >
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: pipeline.width }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="h-full rounded-full"
                style={{
                  background: pipeline.color,
                  boxShadow: `0 0 18px color-mix(in srgb, ${pipeline.color} 28%, transparent)`,
                }}
              />
            </div>

            <p
              className="mt-3 text-[11px] leading-relaxed"
              style={{ color: "var(--viz-text-muted)" }}
            >
              {pipeline.note}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function PreventedSection() {
  const benefits = [
    "Every write is compiled before the next agent reads.",
    "Runs on Postgres with no extra coordination infrastructure.",
  ]

  return (
    <GridSection innerClassName="relative overflow-hidden py-20 sm:py-24 xl:py-28">
      <div
        aria-hidden="true"
        className="section-glow pointer-events-none absolute right-0 top-1/2 h-80 w-[38rem] -translate-y-1/2 rounded-full bg-accent/[0.08] blur-3xl"
      />

      <div className="relative grid items-center gap-14 md:grid-cols-2 md:gap-16 xl:gap-24">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            Prevention
          </p>

          <h2 className="font-heading text-4xl font-bold leading-[0.98] tracking-[-0.03em] text-theme-primary md:text-[56px]">
            Prevented,
            <br />
            <span className="text-gradient-brand">
              Not Just Detected.
            </span>
          </h2>

          <p className="mt-6 max-w-xl text-[20px] leading-[1.65] text-theme-secondary/85">
            Traditional pipelines review conflicts after the work is done.
            Statewave gives the Coder the right context before it decides what
            to build.
          </p>

          <ul className="mt-8 space-y-4">
            {benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-3 text-[15px] leading-7 text-theme-secondary"
              >
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-500">
                  <svg
                    className="h-3 w-3"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3.5 8.25L6.5 11.25L12.5 4.75"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <Button
              href="https://github.com/smaramwbc/statewave-multi-agent-shared-context"
              variant="primary"
              size="lg"
            >
              See the Before/After
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{
            duration: 0.55,
            delay: 0.08,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="flex justify-center md:justify-end"
        >
          <VisualPanel
            className="relative flex w-full items-center justify-center rounded-[2rem] border border-theme-border px-4 py-8 sm:px-8 sm:py-10"
            style={{ maxWidth: "min(580px, 100%)" }}
          >
            <PipelineComparisonCard />
          </VisualPanel>
        </motion.div>
      </div>
    </GridSection>
  )
}

/* ─── Two calls. That's the whole primitive. ─────────────────────────────── */

const PRIMITIVE_FEATURES = [
  {
    label: "Same two calls in CrewAI, Claude Agent SDK or a custom agent loop.",
  },
  {
    label: "LiteLLM-backed, so providers can be swapped without changing your workflow.",
  },
]

const MONO: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', 'Fira Mono', 'Courier New', monospace",
  fontSize: 12,
  lineHeight: "1.8",
}

function SingleCodeCard({
  activeTab,
  children,
}: {
  activeTab: "py" | "cli"
  children: React.ReactNode
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: "var(--viz-card)",
        border: "1px solid var(--viz-border-strong)",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          background: "var(--viz-shell-header)",
          borderBottom: "1px solid var(--viz-border)",
        }}
      >
        <div className="flex gap-2">
          {(["py", "cli"] as const).map((tab) => {
            const active = tab === activeTab

            return (
              <span
                key={tab}
                className="rounded-full px-3 py-1 font-mono text-[10px] transition-colors"
                style={
                  active
                    ? {
                      color: "#fff",
                      background:
                        "linear-gradient(90deg,#4F46E5,#2563EB)",
                    }
                    : {
                      color: "var(--viz-text-muted)",
                      background: "var(--viz-fill)",
                      border: "1px solid var(--viz-border)",
                    }
                }
              >
                {tab === "py" ? "Python" : "CLI"}
              </span>
            )
          })}
        </div>
      </div>

      <div
        className="overflow-x-auto p-5 font-mono text-[11px]"
        style={MONO}
      >
        {children}
      </div>
    </div>
  )
}

function CodeCardsStack() {
  return (
    <div className="flex w-full max-w-[430px] flex-col gap-4">
      <SingleCodeCard activeTab="py">
        <p style={{ margin: 0 }}>
          <span style={{ color: "var(--viz-code-keyword)" }}>from</span>{" "}
          <span style={{ color: "var(--viz-code-text)" }}>
            statewave_agents.context
          </span>{" "}
          <span style={{ color: "var(--viz-code-keyword)" }}>import</span>
        </p>

        <p style={{ margin: 0 }}>
          <span style={{ color: "var(--viz-indigo)" }}>
            SharedContext
          </span>
        </p>

        <p style={{ marginTop: 16 }}>
          <span style={{ color: "var(--viz-indigo)" }}>bundle</span>
          <span style={{ color: "var(--viz-code-muted)" }}> = </span>
          <span style={{ color: "var(--viz-code-text)" }}>
            shared.before_acting(...)
          </span>
        </p>

        <p style={{ margin: 0 }}>
          <span style={{ color: "var(--viz-code-text)" }}>
            result = agent.run(...)
          </span>
        </p>

        <p style={{ margin: 0 }}>
          <span style={{ color: "var(--viz-code-text)" }}>
            shared.decide(...)
          </span>
        </p>
      </SingleCodeCard>

      <SingleCodeCard activeTab="cli">
        <p style={{ margin: 0 }}>
          <span style={{ color: "var(--viz-code-text)" }}>
            python timeline_inspector.py \
          </span>
        </p>

        <p style={{ margin: 0 }}>
          <span style={{ color: "var(--viz-code-text)" }}>
            --run sw-abc12345
          </span>
        </p>

        <p style={{ marginTop: 14 }}>
          <span style={{ color: "var(--viz-green)" }}>
            ✓ chronological replay generated
          </span>
        </p>
      </SingleCodeCard>
    </div>
  )
}

function TwoCallsSection() {
  return (
    <GridSection innerClassName="relative overflow-hidden py-20 sm:py-24 xl:py-28">
      <div
        aria-hidden="true"
        className="section-glow pointer-events-none absolute left-0 top-1/2 h-80 w-[38rem] -translate-y-1/2 rounded-full bg-accent/[0.08] blur-3xl"
      />

      <div className="relative grid items-center gap-14 md:grid-cols-2 md:gap-16 xl:gap-24">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="flex justify-center md:justify-start"
        >
          <VisualPanel
            className="flex w-full items-center justify-center rounded-[2rem] border border-theme-border px-5 py-8 sm:px-8 sm:py-10"
            style={{ maxWidth: "min(580px,100%)" }}
          >
            <CodeCardsStack />
          </VisualPanel>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.55,
            delay: 0.08,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            Integration
          </p>

          <h2 className="font-heading text-4xl font-bold leading-[0.98] tracking-[-0.03em] text-theme-primary md:text-[56px]">
            Two Calls.
            <br />
            <span className="text-gradient-brand">
              That's The Primitive.
            </span>
          </h2>

          <p className="mt-6 max-w-xl text-[20px] leading-[1.65] text-theme-secondary/85">
            Call <code>before_acting()</code> before an agent decides,
            and <code>decide()</code> after it produces output. Wrap
            those two calls around any existing agent loop in minutes.
          </p>

          <ul className="mt-8 space-y-4">
            {PRIMITIVE_FEATURES.map((feature) => (
              <li
                key={feature.label}
                className="flex items-start gap-3 text-[15px] leading-7 text-theme-secondary"
              >
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-500">
                  <svg
                    className="h-3 w-3"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M3.5 8.25L6.5 11.25L12.5 4.75"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <span>{feature.label}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10">
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
    </GridSection>
  )
}

/* ─── Purpose-built feature grid ─────────────────────────────────────────── */

const FEATURE_GRID = [
  {
    title: "Typed, Ranked Memory",
    body: "Every fact is classified and scored, so agents surface the most relevant context instead of searching through raw history.",
    icon: Brain,
  },
  {
    title: "Multi-User by Default",
    body: "Memories stay isolated by user and agent, making personalized sessions safe to run at scale.",
    icon: Users,
  },
  {
    title: "Token Budget Control",
    body: "Set a hard ceiling and Statewave fills it with the highest-signal memories without exceeding the limit.",
    icon: WalletCards,
  },
  {
    title: "Durable Across Sessions",
    body: "Memory survives restarts and redeployments, so agents continue with context from the first message onward.",
    icon: Database,
  },
  {
    title: "Full Audit Trail",
    body: "Every recalled fact links back to its source episode, showing exactly what an agent knew and when.",
    icon: History,
  },
  {
    title: "Sub-150ms Recall",
    body: "Retrieval stays fast enough for real-time conversations without adding noticeable delay to agent responses.",
    icon: Zap,
  },
];

function FeatureGridSection() {
  return (
    <GridSection innerClassName="relative overflow-hidden py-20 sm:py-24 xl:py-28">
      <div
        aria-hidden="true"
        className="section-glow pointer-events-none absolute left-1/2 top-0 h-72 w-[46rem] -translate-x-1/2 rounded-full bg-accent/[0.08] blur-3xl"
      />

      <div className="relative">
        <div className="mx-auto mb-14 max-w-3xl text-center sm:mb-16">
          <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            Why Statewave
          </p>

          <h2 className="font-heading text-4xl font-bold leading-[0.98] tracking-[-0.03em] text-theme-primary md:text-[56px]">
            Memory Built
            <br />
            <span className="text-gradient-brand">For Real Agents.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-[20px] leading-[1.65] text-theme-secondary/85">
            Everything agents need to remember, retrieve and explain, without
            turning raw conversation history into your architecture.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_GRID.map((feature, index) => {
            const Icon = feature.icon

            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative overflow-hidden rounded-[2rem] border border-theme-border bg-surface-2/35 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-accent/25 hover:bg-surface-2/55 sm:p-8"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-accent/[0.06] opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
                />

                <div className="relative">
                  <Icon
                    className="h-7 w-7 text-accent transition-transform duration-300 group-hover:scale-110"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />

                  <h3 className="mt-6 font-heading text-[22px] font-semibold leading-[1.1] tracking-[-0.025em] text-theme-primary">
                    {feature.title}
                  </h3>

                  <p className="mt-4 text-[15px] leading-7 text-theme-secondary">
                    {feature.body}
                  </p>
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </GridSection>
  )
}

/* ─── CTA footer ─────────────────────────────────────────────────────────── */

function CTASection() {
  return (
    <GridSection innerClassName="py-20 sm:py-24 xl:py-28">
      <div className="cta-card relative overflow-hidden rounded-[2.5rem] border border-brand-500/25 bg-surface-1/55 px-6 py-20 text-center sm:px-10 sm:py-24">
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

          <h2 className="font-heading text-4xl font-bold leading-[1.02] tracking-[-0.04em] text-theme-primary md:text-[64px]">
            Give every agent
            <br />
            <span className="text-gradient-brand">the same truth</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-[20px] leading-[1.65] text-theme-secondary/85">
            Shared memory that keeps every agent aligned before work begins,
            preventing duplicated decisions and conflicting implementations.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button
              href="https://github.com/smaramwbc/statewave-docs/blob/main/getting-started.md"
              variant="primary"
              size="lg"
            >
              Get Started

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

            <Button to="/pricing" variant="secondary" size="lg">
              Pricing
            </Button>
          </div>
        </div>
      </div>
    </GridSection>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export function MultiAgentSharedContextPage() {
  usePageSEO({
    breadcrumb: false,
    jsonLd: [
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Use Cases", path: "/use-cases" },
        {
          name: "Shared Context",
          path: "/use-cases/multi-agent-shared-context",
        },
      ]),
    ],
  });
  return (
    <div className="bg-surface-1 font-fustat-headings">
      <div>
        <HeroSection />
        <CostSection />
        <FeatureCardsSection />
        <ReferenceBuildsSection />
        <PreventedSection />
        <TwoCallsSection />
        <FeatureGridSection />
        <CTASection />
      </div>
    </div>
  );
}
