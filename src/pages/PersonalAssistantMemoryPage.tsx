import React from "react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Button } from "../components/Button";
import { UseCaseSwitcher } from "../components/UseCaseSwitcher";
import { usePageSEO } from "../lib/seo";
import { breadcrumbJsonLd } from "../lib/seo-meta";

const PAGE_RAIL_CLASS =
  "mx-auto max-w-[1488px] px-5 sm:px-10 md:px-16 xl:px-[94px]";

/* All product mockups below use the `--viz-*` tokens (src/index.css) so their
 * neutrals flip with the light/dark theme; blue chat bubbles and status
 * accents stay branded in both. */

function GridSection({
  children,
  className = "",
  innerClassName = "",
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <section className={`relative bg-surface-1 ${className}`}>
      <div className={`${PAGE_RAIL_CLASS} ${innerClassName}`}>{children}</div>
    </section>
  );
}

function VisualPanel({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={className} style={{ background: "var(--viz-panel)", ...style }}>
      {children}
    </div>
  );
}

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
            <UseCaseSwitcher currentSlug="personal-assistant-memory" />
          </div>

          <h1 className="mx-auto max-w-[1180px] font-heading text-[clamp(3.2rem,6.8vw,6.5rem)] font-bold leading-[0.94] tracking-[-0.06em] text-theme-primary">
            One Assistant. Every
            <br />
            <span className="text-gradient-brand">
              Session
            </span>{' '}
            Remembered
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
              href="https://github.com/smaramwbc/statewave-personal-assistant"
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
          className="mt-12"
        >
          <HeroChatVisual />
        </motion.div>
      </div>
    </section>
  )
}

/* Hero chat window: left = conversation, right = MEMORY STATE panel */

const HERO_MEMORY_FACTS = [
  {
    type: "profile_fact",
    text: "RAG code assistant. Python only.",
    score: "score 1.00",
  },
  {
    type: "procedure",
    text: "429 workaround: tenacity backoff",
    score: "score 0.94",
  },
  {
    type: "episode_summary",
    text: "Session covered streaming + function calling setup",
    score: "score 0.87",
  },
  {
    type: "artifact_ref",
    text: "chunking_strategy.py · v2 draft",
    score: "score 0.71",
  },
];

function TypeBadge({ label }: { label: string }) {
  return (
    <span
      className="rounded-[4px] border border-brand-500/30 bg-brand-500/[0.08] px-1.5 py-0.5 font-mono text-[9px] text-brand-300"
    >
      {label}
    </span>
  )
}

function MemoryUsedBadge({ note }: { note: string }) {
  return (
    <div className="mt-2 flex items-center gap-2">
      <span className="rounded-[4px] border border-success/25 bg-success/[0.07] px-1.5 py-0.5 font-mono text-[9px] text-success">
        memory used
      </span>

      <span className="font-mono text-[9px] text-theme-muted">
        {note}
      </span>
    </div>
  )
}

function HeroChatVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[1120px]">
        <div
        className="pointer-events-none absolute inset-x-[10%] -top-6 bottom-6 rounded-[3rem] blur-[90px]"
        style={{
          background: 'var(--viz-hero-glow-primary)',
        }}
        aria-hidden="true"
      />


      <div
        className="pointer-events-none absolute inset-x-[30%] -top-8 h-28 rounded-full blur-[70px]"
        style={{
          background: 'var(--viz-hero-glow-secondary)',
        }}
        aria-hidden="true"
      />

       <div
        className="relative z-10 w-full overflow-hidden rounded-t-2xl border border-brand-500/25 bg-[var(--viz-shell)] text-left"
        style={{
          borderBottom: 'none',
          boxShadow: 'var(--viz-shell-shadow)',
        }}
      >
        {/* Window title bar */}
        <div
          className="flex items-center justify-between border-b border-theme-border px-4 sm:px-5"
          style={{
            height: 44,
            background: 'var(--viz-shell-header)',
          }}
        >
          <div className="flex items-center gap-3">
            <span
              className="flex items-center gap-1.5 font-mono text-[11px]"
              style={{ color: 'var(--viz-text-3)' }}
            >
              <span className="text-success text-[8px]">●</span>
              statewave
              <span style={{ color: 'var(--viz-text-muted)' }}>on</span>
            </span>

            <span className="hidden items-center gap-1.5 rounded-[5px] border border-brand-400/35 bg-brand-500/80 px-2 py-1 font-mono text-[11px] text-white shadow-[0_6px_20px_rgba(74,140,255,.18)] sm:inline-flex">
              ▸ dev_alice
              <span className="text-white/65">switch user</span>
            </span>
          </div>

          <span
            className="font-mono text-[11px]"
            style={{ color: 'var(--viz-text-muted)' }}
          >
            token budget: 800
          </span>
        </div>

        {/* Body: chat + memory panel */}
        <div className="grid md:grid-cols-[1.45fr_1fr]">
          {/* Chat column */}
          <div
            className="flex flex-col p-4 sm:p-6"
            style={{ borderRight: '1px solid var(--viz-border)' }}
          >
            <p
              className="mb-4 font-mono text-[10px] uppercase tracking-[0.14em]"
              style={{ color: 'var(--viz-text-muted)' }}
            >
              Chat
            </p>

            <div className="flex-1 space-y-3 text-[13px] leading-relaxed">
              <div
                className="max-w-[75%] rounded-[8px] px-3.5 py-2.5"
                style={{
                  background: 'var(--viz-fill)',
                  border: '1px solid var(--viz-border)',
                  color: 'var(--viz-text-2)',
                }}
              >
                Hey, picking back up. Where did we leave off?
              </div>

              <div className="flex justify-end">
                <div className="max-w-[75%] rounded-[8px] bg-gradient-to-r from-brand-500 to-accent px-3.5 py-2.5 text-white shadow-[0_8px_24px_rgba(74,140,255,.16)]">
                  What was the bug I was debugging last session?
                </div>
              </div>

              <div
                className="max-w-[85%] rounded-[8px] px-3.5 py-2.5"
                style={{
                  background: 'var(--viz-fill)',
                  border: '1px solid var(--viz-border)',
                  color: 'var(--viz-text-2)',
                }}
              >
                You were hitting 429s on batch embedding jobs, an undocumented
                per-IP burst limit (~500 req/10s). Did the tenacity backoff fix
                land?

                <MemoryUsedBadge note="ep_0012 · 761 tok" />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {['What was I building?', 'Any open issues?'].map((suggestion) => (
                <span
                  key={suggestion}
                  className="rounded-full border border-theme-border px-3 py-1.5 text-[11px] text-theme-secondary transition-colors hover:border-brand-500/35 hover:text-theme-primary"
                >
                  {suggestion}
                </span>
              ))}
            </div>

            <div
              className="mt-3 flex items-center justify-between gap-3 rounded-[8px] px-3.5 py-2.5"
              style={{
                background: 'var(--viz-fill)',
                border: '1px solid var(--viz-border)',
              }}
            >
              <span
                className="text-[12px]"
                style={{ color: 'var(--viz-text-muted)' }}
              >
                Type a message…
              </span>

              <span className="rounded-[6px] bg-brand-500 px-3.5 py-1.5 text-[11px] font-medium text-white">
                Send
              </span>
            </div>
          </div>

          {/* Memory state column */}
          <div
            className="flex flex-col p-4 sm:p-6"
            style={{ background: 'var(--viz-shell-side)' }}
          >
            <div className="mb-4 flex items-center justify-between">
              <p
                className="font-mono text-[10px] uppercase tracking-[0.14em]"
                style={{ color: 'var(--viz-text-muted)' }}
              >
                Memory state
              </p>

              <span
                className="font-mono text-[10px]"
                style={{ color: 'var(--viz-text-muted)' }}
              >
                /v1/context
              </span>
            </div>

            <div className="flex-1 space-y-2.5">
              {HERO_MEMORY_FACTS.map((fact) => (
                <div
                  key={fact.type + fact.text}
                  className="rounded-[7px] border border-theme-border px-3 py-2.5 transition-colors hover:border-brand-500/25"
                  style={{
                    background: 'var(--viz-fill)',
                  }}
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <TypeBadge label={fact.type} />

                    <span
                      className="font-mono text-[9px]"
                      style={{ color: 'var(--viz-text-muted)' }}
                    >
                      {fact.score}
                    </span>
                  </div>

                  <p
                    className="text-[12px] leading-relaxed"
                    style={{ color: 'var(--viz-text-2)' }}
                  >
                    {fact.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-[6px] border border-success/25 bg-success/[0.07] px-3 py-2">
              <span className="text-[9px] text-success">✓</span>

              <span className="font-mono text-[11px] text-success">
                4 memories compiled · 761 tokens
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── The Cost Of Stateless Chat Apps ────────────────────────────────────── */

const COST_ITEMS = [
  {
    title: "Every Session Starts Cold",
    body: "Users repeat their background, preferences, and history every time, even when the conversation is clearly ongoing.",
  },
  {
    title: "Context Runs Out Fast",
    body: "After 8–10 turns the context window is full. Earlier facts are silently dropped to make room for recent ones.",
  },
  {
    title: "No Ranking Signal",
    body: "Stuffing raw history into every prompt means a throwaway comment gets the same weight as a critical bug report.",
  },
];

function CostSection() {
  return (
    <GridSection innerClassName="relative py-20 sm:py-24 xl:py-28 bg-surface-1">
      <div className="mx-auto max-w-[600px] text-center">
        <div className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
          Problems
        </div>

        <h2 className="font-heading text-4xl md:text-[56px] font-bold leading-[0.98] tracking-[-0.03em] text-theme-primary">
          The cost of stateless{' '}
          <span className="text-gradient-brand">chat apps</span>
        </h2>

        <p className="mt-6 text-[20px] leading-[1.65] text-theme-secondary/85">
          Without durable memory, every session starts from scratch and every
          prompt carries more history than it needs.
        </p>
      </div>

      <div className="mt-14 grid gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
        {COST_ITEMS.map((item, index) => (
          <motion.article
            key={item.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: index * 0.08, duration: 0.45 }}
            className="sw-card group flex min-h-[280px] flex-col rounded-2xl border border-theme-border bg-surface-2/35 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-danger/25 sm:p-8"
          >
            <div>
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

            <p className="mt-auto pt-8 text-[15px] leading-[1.7] text-theme-muted">
              {item.body}
            </p>
          </motion.article>
        ))}
      </div>
    </GridSection>
  )
}

/* ─── The Memory Does The Merging ────────────────────────────────────────── */

const MEMORY_CARDS_DATA = [
  {
    title: "Every finding is an episode",
    body: "Every turn is recorded as an episode: one user message, one reply. Episodes are appended, never merged, so the full history stays in the log.",
    Visual: EpisodeVisual,
  },
  {
    title: "Ingest. Compile. Use.",
    body: "Three endpoints handle the whole loop. Compile is idempotent. Run it again and again on the same subject, same query, same bytes back.",
    Visual: EndpointVisual,
  },
  {
    title: "Portable Across Frameworks",
    body: "The same two calls work with OpenAI, Claude, or CrewAI. Swap the model layer freely; the memory layer never changes.",
    Visual: FrameworkVisual,
  },
  {
    title: "Personalizes at Scale",
    body: "Every subject_id compiles its own memory. dev_alice and dev_bob never see each other's context, automatically.",
    Visual: SupersedeVisual,
  },
];

/* Visual 1: stacked session episodes, current session highlighted */
function EpisodeVisual() {
  const sessions = [
    {
      current: true,
      time: "Session 7 · Jul 8, 4:12 PM",
      text: "Let's try streaming instead of polling for the dashboard updates.",
    },
    {
      current: false,
      time: "Session 3 · Jun 4, 9:50 AM",
      text: "Poll every 5s for now, it's fine.",
    },
    {
      current: false,
      time: "Session 1 · May 22, 8:03 AM",
      text: "Kicking off the RAG code assistant project.",
    },
  ];
  return (
    <div className="mx-auto w-full max-w-[380px] space-y-3 text-[11px]">
      {sessions.map((s) => (
        <div
          key={s.time}
          className={`rounded-[6px] p-3 ${s.current ? "shadow-[0_10px_28px_rgba(0,0,0,0.26)]" : ""
            }`}
          style={
            s.current
              ? { border: "1px solid #3d65ff", background: "#213a9f" }
              : {
                border: "1px solid var(--viz-border)",
                background: "var(--viz-card-3)",
              }
          }
        >
          {s.current && (
            <div className="mb-2 inline-flex rounded-[3px] border border-white/15 bg-[#2e52d7] px-1.5 py-0.5 text-[7px] text-white/80">
              Current Session
            </div>
          )}
          <p
            className="mb-1 text-[12px] font-medium"
            style={{ color: s.current ? "rgba(255,255,255,0.9)" : "var(--viz-text-2)" }}
          >
            {s.time}
          </p>
          <p style={{ color: s.current ? "rgba(255,255,255,0.75)" : "var(--viz-text-3)" }}>
            <span
              className="mr-1.5 font-mono text-[9px] uppercase tracking-[0.08em]"
              style={{
                color: s.current ? "rgba(255,255,255,0.5)" : "var(--viz-text-muted)",
              }}
            >
              User ·
            </span>
            {s.text}
          </p>
        </div>
      ))}
      <p
        className="flex items-center gap-1.5 pt-1 font-mono text-[10px]"
        style={{ color: "var(--viz-text-muted)" }}
      >
        <span style={{ color: "var(--viz-green)", fontSize: 7 }}>●</span>
        3 episodes · content-hashed · immutable
      </p>
    </div>
  );
}

/* Visual 2: three numbered endpoint rows */
function EndpointVisual() {
  const steps = [
    {
      n: "1",
      title: "POST /v1/episodes",
      body: "Record one user turn + assistant reply",
      active: false,
    },
    {
      n: "2",
      title: "POST /v1/memories/compile",
      body: "Idempotent. Same subject in, same bytes out.",
      active: true,
    },
    {
      n: "3",
      title: "POST /v1/context",
      body: "Ranked, budget-bound context bundle",
      active: false,
    },
  ];
  return (
    <div className="mx-auto w-full max-w-full sm:max-w-[400px] space-y-3 text-[12px]">
      {steps.map((step) => (
        <div key={step.n} className="grid grid-cols-[24px_1fr] items-center gap-3">
          <span
            className="text-right font-mono text-[11px]"
            style={{ color: "var(--viz-text-muted)" }}
          >
            {step.n}
          </span>
          <div
            className="rounded-[6px] p-3"
            style={
              step.active
                ? { border: "1px solid #4b69ff", background: "#1d43b7" }
                : {
                  border: "1px solid var(--viz-border)",
                  background: "var(--viz-card-2)",
                }
            }
          >
            <p
              className="font-mono text-[12px] font-semibold"
              style={{ color: step.active ? "#fff" : "var(--viz-text)" }}
            >
              {step.title}
            </p>
            <p
              className="mt-1 leading-relaxed"
              style={{
                color: step.active ? "rgba(255,255,255,0.75)" : "var(--viz-text-3)",
              }}
            >
              {step.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* Visual 3: framework tabs + code block */
function FrameworkVisual() {
  return (
    <div className="mx-auto w-full max-w-full sm:max-w-[400px] text-[12px]">
      <div className="mb-3 flex gap-2">
        {["OpenAI", "Claude", "CrewAI"].map((t) => (
          <span
            key={t}
            className="rounded-[6px] px-3 py-1.5 font-mono text-[11px]"
            style={
              t === "CrewAI"
                ? { background: "#4f46e5", color: "#fff" }
                : {
                  border: "1px solid var(--viz-border-strong)",
                  color: "var(--viz-text-3)",
                }
            }
          >
            {t}
          </span>
        ))}
      </div>
      <div
        className="rounded-[8px] p-4 font-mono text-[11px] leading-[1.9]"
        style={{
          background: "var(--viz-code-bg)",
          border: "1px solid var(--viz-border)",
        }}
      >
        <p style={{ margin: 0 }}>
          <span style={{ color: "var(--viz-indigo)" }}>context</span>
          <span style={{ color: "var(--viz-code-muted)" }}> = </span>
          <span style={{ color: "var(--viz-code-keyword)" }}>await</span>
          <span style={{ color: "var(--viz-code-text)" }}> _get_context(uid, msg)</span>
        </p>
        <p style={{ margin: 0 }}>
          <span style={{ color: "var(--viz-indigo)" }}>system</span>
          <span style={{ color: "var(--viz-code-muted)" }}> = </span>
          <span style={{ color: "var(--viz-code-text)" }}>base + </span>
          <span style={{ color: "var(--viz-code-string)" }}>f"\n{"{context}"}"</span>
        </p>
        <p style={{ margin: 0 }}>
          <span style={{ color: "var(--viz-indigo)" }}>assistant</span>
          <span style={{ color: "var(--viz-code-muted)" }}> = </span>
          <span style={{ color: "var(--viz-code-text)" }}>Agent(backstory=system)</span>
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <GreenBadge label="memory layer unchanged" />
        <span
          className="rounded-[4px] px-2 py-1 font-mono text-[10px]"
          style={{
            border: "1px solid var(--viz-border-strong)",
            color: "var(--viz-text-3)",
          }}
        >
          only the model call changes
        </span>
      </div>
    </div>
  );
}

/* Visual 4: superseded fact resolved to the active one */
function SupersedeVisual() {
  return (
    <div className="mx-auto w-full max-w-full sm:max-w-[420px] text-[12px]">
      <p className="mb-3" style={{ color: "var(--viz-text-2)" }}>
        What update approach am I using for the dashboard?
      </p>
      <div className="mb-2 flex gap-1.5">
        <span
          className="rounded-[4px] px-2 py-0.5 font-mono text-[10px]"
          style={{
            color: "var(--viz-amber)",
            border: "1px solid rgba(217,164,65,0.4)",
            background: "rgba(217,164,65,0.08)",
          }}
        >
          superseded
        </span>
        <span
          className="rounded-[4px] px-2 py-0.5 font-mono text-[10px]"
          style={{
            border: "1px solid var(--viz-border-strong)",
            background: "var(--viz-fill)",
            color: "var(--viz-text-3)",
          }}
        >
          jaccard 0.81
        </span>
      </div>
      <p
        className="mb-3 font-mono text-[11px] line-through"
        style={{ color: "var(--viz-text-muted)" }}
      >
        Session 3: poll every 5s
      </p>
      <div className="rounded-[6px] border border-[#4b69ff] bg-[#2a3fa8] px-4 py-3 leading-relaxed text-white/90">
        You switched to streaming with exponential backoff in session 7.
        That's the active approach now.
      </div>
    </div>
  );
}

function MemoryMergingSection() {
return (
  <GridSection
     innerClassName="py-20 sm:py-24 xl:py-28  bg-surface-1"
  >
    <div className="mx-auto mb-12 max-w-[620px] text-center sm:mb-16">
      <div className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
        Features
      </div>

      <h2 className="font-heading text-4xl font-bold leading-[0.98] tracking-[-0.03em] text-theme-primary md:text-[56px]">
        The memory{' '}
        <span className="text-gradient-brand">does the merging</span>
      </h2>

      <p className="mx-auto mt-6 max-w-[760px] text-[20px] leading-[1.65] text-theme-secondary/85">
        Statewave keeps every episode intact, compiles what matters, and returns
        the right memory without losing the history behind it.
      </p>
    </div>

    <div className="mx-auto grid max-w-[1100px] gap-5 sm:grid-cols-2">
      {MEMORY_CARDS_DATA.map((card) => (
        <article
          key={card.title}
          className="sw-card group overflow-hidden rounded-2xl border border-theme-border bg-surface-1 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/25"
        >
          <VisualPanel className="flex min-h-[300px] items-center justify-center px-4 py-10 sm:min-h-[380px] sm:px-8 md:min-h-[440px]">
            <card.Visual />
          </VisualPanel>

          <div className="bg-surface-1 px-7 py-7 sm:px-8 sm:py-8">
            <h3 className="font-heading text-[20px] font-semibold leading-tight text-theme-primary">
              {card.title}
            </h3>

            <p className="mt-3 max-w-[400px] text-[15px] leading-[1.7] text-theme-muted">
              {card.body}
            </p>
          </div>
        </article>
      ))}
    </div>
  </GridSection>
)
}

/* ─── Three quickstart examples ──────────────────────────────────────────── */

const QUICKSTART_ROWS_DATA = [
  {
    label: "The two-call pattern, nothing else.",
    body: "minimal-quickstart is a single Python file: no framework, no UI. Just get_context before the model call and create_episode after it, the fastest way to see the integration surface.",
    tags: ["Python", "No framework"],
    Visual: TwoCallVisual,
  },
  {
    label: "A chat panel and a memory panel, side by side.",
    body: "chat-react-standalone pairs a React frontend with the same two-call pattern. Every compiled fact appears grouped by kind, scored, and sourced to its episode, refreshed after every reply.",
    tags: ["React", "FastAPI"],
    Visual: ChatMemoryVisual,
  },
  {
    label: "Memory wired into an agent framework.",
    body: "support-agent shows the same two calls injected into a CrewAI-style support bot. Context goes into the agent's backstory at construction time, and the episode is recorded from the final output.",
    tags: ["CrewAI", "Python"],
    Visual: AgentFrameworkVisual,
  },
];

function CodeBlock({ lines }: { lines: ReactNode[] }) {
  return (
    <div
      className="w-full rounded-[8px] p-4 font-mono text-[11px] leading-[1.9]"
      style={{
        background: "var(--viz-code-bg)",
        border: "1px solid var(--viz-border)",
      }}
    >
      {lines.map((l, i) => (
        <p key={i} style={{ margin: 0 }}>
          {l}
        </p>
      ))}
    </div>
  );
}

function GreenBadge({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-[4px] px-2 py-1 font-mono text-[10px]"
      style={{
        color: "var(--viz-green)",
        background: "rgba(16,185,129,0.08)",
        border: "1px solid rgba(16,185,129,0.2)",
      }}
    >
      <span style={{ fontSize: 7 }}>●</span> {label}
    </span>
  );
}

/* Visual 1: three-line integration code */
function TwoCallVisual() {
  return (
    <div className="mx-auto w-full" style={{ maxWidth: "min(440px, 100%)" }}>
      <CodeBlock
        lines={[
          <>
            <span style={{ color: "var(--viz-indigo)" }}>context</span>
            <span style={{ color: "var(--viz-code-muted)" }}> = </span>
            <span style={{ color: "var(--viz-code-keyword)" }}>await</span>
            <span style={{ color: "var(--viz-code-text)" }}> get_context(user_id, message)</span>
          </>,
          <>
            <span style={{ color: "var(--viz-indigo)" }}>reply</span>
            <span style={{ color: "var(--viz-code-muted)" }}> = </span>
            <span style={{ color: "var(--viz-code-text)" }}>call_llm(context, message)</span>
          </>,
          <>
            <span style={{ color: "var(--viz-code-keyword)" }}>await</span>
            <span style={{ color: "var(--viz-code-text)" }}> create_episode(user_id, message, reply)</span>
          </>,
        ]}
      />
      <div className="mt-3">
        <GreenBadge label="three lines, one file" />
      </div>
    </div>
  );
}

/* Visual 2: mini chat + memory columns */
function ChatMemoryVisual() {
  const facts = [
    { type: "profile_fact 1.00", text: "RAG code assistant" },
    { type: "procedure 0.94", text: "tenacity backoff fix" },
    { type: "episode_summary 0.87", text: "streaming + fn calling" },
    { type: "artifact_ref 0.71", text: "chunking_strategy.py" },
  ];
  const bubbleStyle: React.CSSProperties = {
    background: "var(--viz-fill)",
    border: "1px solid var(--viz-border)",
    color: "var(--viz-text-3)",
  };
  return (
    <div
      className="mx-auto grid w-full grid-cols-[1.2fr_1fr] gap-4 text-[10px]"
      style={{ maxWidth: "min(460px, 100%)" }}
    >
      {/* Chat column */}
      <div className="min-w-0">
        <p
          className="mb-2 font-mono text-[9px] uppercase tracking-[0.14em]"
          style={{ color: "var(--viz-text-muted)" }}
        >
          Chat
        </p>
        <div className="space-y-2">
          <div className="rounded-[6px] px-2.5 py-2" style={bubbleStyle}>
            Hey, picking back up. Where'd we leave off?
          </div>
          <div className="flex justify-end">
            <div className="rounded-[6px] px-2.5 py-2 text-white" style={{ background: "#2e52d7" }}>
              What was the bug I was debugging?
            </div>
          </div>
          <div className="rounded-[6px] px-2.5 py-2" style={bubbleStyle}>
            429s on batch embeds: undocumented burst limit. Did the tenacity
            backoff land?
            <div className="mt-1.5 flex items-center gap-1.5">
              <span
                className="rounded-[3px] px-1 py-0.5 font-mono text-[8px]"
                style={{
                  color: "var(--viz-green)",
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.2)",
                }}
              >
                memory used
              </span>
              <span className="font-mono text-[8px]" style={{ color: "var(--viz-text-muted)" }}>
                ep_0012
              </span>
            </div>
          </div>
          <div
            className="flex items-center justify-between gap-2 rounded-[6px] px-2.5 py-1.5"
            style={{
              background: "var(--viz-fill)",
              border: "1px solid var(--viz-border)",
            }}
          >
            <span style={{ color: "var(--viz-text-muted)" }}>Type a message…</span>
            <span
              className="rounded-[4px] px-2 py-1 text-[9px] font-medium text-white"
              style={{ background: "#4f46e5" }}
            >
              Send
            </span>
          </div>
        </div>
      </div>
      {/* Memory column */}
      <div className="min-w-0">
        <p
          className="mb-2 font-mono text-[9px] uppercase tracking-[0.14em]"
          style={{ color: "var(--viz-text-muted)" }}
        >
          Memory
        </p>
        <div className="space-y-2">
          {facts.map((f) => (
            <div
              key={f.type}
              className="rounded-[6px] px-2.5 py-2"
              style={{
                background: "var(--viz-fill)",
                border: "1px solid var(--viz-border)",
              }}
            >
              <p className="font-mono text-[9px]" style={{ color: "var(--viz-indigo)" }}>
                {f.type}
              </p>
              <p className="mt-0.5" style={{ color: "var(--viz-text-3)" }}>
                {f.text}
              </p>
            </div>
          ))}
          <GreenBadge label="refreshed after every reply" />
        </div>
      </div>
    </div>
  );
}

/* Visual 3: CrewAI wiring code */
function AgentFrameworkVisual() {
  return (
    <div className="mx-auto w-full" style={{ maxWidth: "min(460px, 100%)" }}>
      <CodeBlock
        lines={[
          <>
            <span style={{ color: "var(--viz-indigo)" }}>context</span>
            <span style={{ color: "var(--viz-code-muted)" }}> = </span>
            <span style={{ color: "var(--viz-code-keyword)" }}>await</span>
            <span style={{ color: "var(--viz-code-text)" }}> get_context(user_id, message)</span>
          </>,
          <>
            <span style={{ color: "var(--viz-indigo)" }}>backstory</span>
            <span style={{ color: "var(--viz-code-muted)" }}> = </span>
            <span style={{ color: "var(--viz-code-text)" }}>base + </span>
            <span style={{ color: "var(--viz-code-string)" }}>f"\n{"{context}"}"</span>
          </>,
          <>
            <span style={{ color: "var(--viz-indigo)" }}>agent</span>
            <span style={{ color: "var(--viz-code-muted)" }}> = </span>
            <span style={{ color: "var(--viz-code-text)" }}>Agent(role=</span>
            <span style={{ color: "var(--viz-code-string)" }}>"Support"</span>
            <span style={{ color: "var(--viz-code-text)" }}>, backstory=backstory)</span>
          </>,
          <>
            <span style={{ color: "var(--viz-indigo)" }}>result</span>
            <span style={{ color: "var(--viz-code-muted)" }}> = </span>
            <span style={{ color: "var(--viz-code-text)" }}>Crew(agents=[agent], tasks=[task]).kickoff()</span>
          </>,
          <>
            <span style={{ color: "var(--viz-code-keyword)" }}>await</span>
            <span style={{ color: "var(--viz-code-text)" }}> create_episode(user_id, message, str(result))</span>
          </>,
        ]}
      />
      <div className="mt-3">
        <GreenBadge label="memory layer unchanged" />
      </div>
    </div>
  );
}

function QuickstartSection() {
  return (
    <GridSection
      className="bg-surface-1"
      innerClassName="py-20 sm:py-24 xl:py-28"
    >
      <div className="mx-auto mb-14 max-w-[760px] text-center sm:mb-16">
        <div className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
          Reference builds
        </div>

        <h2 className="font-heading text-4xl font-bold leading-[0.98] tracking-[-0.03em] text-theme-primary md:text-[56px]">
          Three quickstart examples.{' '}
          <span className="text-gradient-brand">
            One live comparison.
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-[680px] text-[20px] leading-[1.65] text-theme-secondary/85">
          Start with the smallest possible integration, add a visible memory
          panel, or wire the same pattern into an agent framework.
        </p>
      </div>

      <div className="mx-auto max-w-[1100px] space-y-5">
        {QUICKSTART_ROWS_DATA.map((row, index) => (
          <motion.article
            key={row.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{
              delay: index * 0.08,
              duration: 0.5,
            }}
            className="sw-card group overflow-hidden rounded-2xl border border-theme-border bg-surface-0 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/25 md:grid md:min-h-[400px] md:grid-cols-[1fr_1.1fr]"
          >
            <div className="flex flex-col justify-center border-b border-theme-border bg-surface-0 p-8 md:border-b-0 md:border-r md:p-14">
              <h3 className="max-w-[360px] font-heading text-[22px] font-semibold leading-[1.12] tracking-[-0.02em] text-theme-primary sm:text-[26px]">
                {row.label}
              </h3>

              <p className="mt-5 max-w-[400px] text-[15px] leading-[1.7] text-theme-muted">
                {row.body}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {row.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-theme-border bg-surface-1/60 px-3 py-1 text-[12px] font-medium text-theme-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <VisualPanel className="flex min-h-[280px] items-center justify-center px-4 py-10 sm:min-h-[320px] sm:px-8 md:min-h-0 md:px-12">
              <row.Visual />
            </VisualPanel>
          </motion.article>
        ))}
      </div>
    </GridSection>
  )
}

/* ─── Only the highest-confidence facts reach the prompt ─────────────────── */

function TokenComparisonCard() {
  const label: React.CSSProperties = {
    fontSize: 12,
    color: "var(--viz-text-3)",
  };

  const chip: React.CSSProperties = {
    fontSize: 11,
    color: "var(--viz-text-muted)",
    border: "1px solid var(--viz-border)",
    borderRadius: 6,
    padding: "3px 8px",
  };

  const track: React.CSSProperties = {
    height: 10,
    marginBottom: 8,
    overflow: "hidden",
    borderRadius: 999,
    background: "var(--viz-track)",
  };

  const note: React.CSSProperties = {
    fontSize: 11,
    lineHeight: 1.6,
    color: "var(--viz-text-muted)",
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 480,
        padding: 32,
        border: "1px solid var(--viz-border-strong)",
        borderRadius: 18,
        background: "var(--viz-shell)",
      }}
    >
      {/* Raw conversation history */}
      <div
        style={{
          marginBottom: 28,
          paddingBottom: 28,
          borderBottom: "1px solid var(--viz-border)",
        }}
      >
        <p
          style={{
            marginBottom: 16,
            fontSize: 16,
            fontWeight: 700,
            color: "var(--viz-text)",
          }}
        >
          Raw conversation history
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 7,
          }}
        >
          <span style={label}>Tokens to LLM</span>
          <span style={chip}>~2,800 / session</span>
        </div>

        <div style={track}>
          <div
            style={{
              width: "88%",
              height: "100%",
              borderRadius: 999,
              background: "#ef4444",
            }}
          />
        </div>

        <p style={note}>
          6 sessions of raw history. No ranking signal.
        </p>
      </div>

      {/* Statewave context bundle */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            marginBottom: 16,
          }}
        >
          <svg
            width="13"
            height="12"
            viewBox="0 0 13 12"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="6.5"
              cy="6"
              r="5"
              stroke="#818cf8"
              strokeWidth="1.5"
            />
            <circle cx="6.5" cy="6" r="2" fill="#818cf8" />
          </svg>

          <p
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--viz-text)",
            }}
          >
            Statewave context bundle
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 7,
          }}
        >
          <span style={label}>Tokens used, average</span>
          <span style={chip}>761 / session</span>
        </div>

        <div style={track}>
          <div
            style={{
              width: "27%",
              height: "100%",
              borderRadius: 999,
              background: "#818cf8",
            }}
          />
        </div>

        <p
          style={{
            ...note,
            marginBottom: 18,
          }}
        >
          Only the highest-confidence facts, within budget.
        </p>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "6px 11px",
            border: "1px solid rgba(16,185,129,0.18)",
            borderRadius: 6,
            background: "rgba(16,185,129,0.08)",
          }}
        >
          <span
            style={{
              fontSize: 8,
              color: "var(--viz-green)",
            }}
          >
            ●
          </span>

          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--viz-green)",
            }}
          >
            Context compiled
          </span>
        </div>
      </div>
    </div>
  );
}

function ConfidenceSection() {
  return (
    <GridSection
      innerClassName="py-20 sm:py-24 xl:py-28 Context retrieval"
    >
      <div className="grid items-center gap-14 md:grid-cols-2 xl:gap-20">
        <div>
          <div className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            Context retrieval
          </div>

          <h2 className="font-heading text-4xl md:text-[56px] font-bold leading-[0.98] tracking-[-0.03em] text-theme-primary">
            Only the highest-confidence{' '}
            <span className="text-gradient-brand">
              facts reach the prompt
            </span>
          </h2>

          <p className="mt-6 text-[20px] leading-[1.65] text-theme-secondary/85">
            <code>get_context()</code> ranks compiled memories and returns only
            what fits the configured token budget, ready to inject into your
            agent.
          </p>

          <div className="mt-8 space-y-3">
            {[
              "STATEWAVE_MAX_TOKENS enforced on every call",
              "Confidence-ranked memories before throwaway conversation",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-4"
              >
                <span className="mt-2 h-px w-3 shrink-0 bg-accent" />

                <span className="text-sm leading-6 text-theme-primary">
                  {item}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Button
              href="https://github.com/smaramwbc/statewave-personal-assistant"
              size="lg"
            >
              See the 5-Minute Path
            </Button>
          </div>
        </div>

        <div className="flex justify-center md:justify-end">
          <VisualPanel
            className="flex w-full items-center justify-center px-4 py-10 sm:px-8"
            style={{ maxWidth: "min(560px,100%)" }}
          >
            <TokenComparisonCard />
          </VisualPanel>
        </div>
      </div>
    </GridSection>
  )
}

/* ─── Three endpoints. That's the whole API. ─────────────────────────────── */

const ENDPOINT_FEATURES = [
  { label: "Same two calls in FastAPI, Flask, or a bare script" },
  { label: "OpenAI-compatible: swap the model, keep the memory" },
];

const MONO: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', 'Fira Mono', 'Courier New', monospace",
  fontSize: 12,
  lineHeight: "1.8",
};

function SingleCodeCard({
  activeTab,
  children,
}: {
  activeTab: "py" | "curl";
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        width: "100%",
        overflow: "hidden",
        borderRadius: 18,
        background: "var(--viz-shell)",
        border: "1px solid var(--viz-border-strong)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "0 10px",
          borderBottom: "1px solid var(--viz-border)",
          background: "var(--viz-shell-header)",
        }}
      >
        {(["py", "curl"] as const).map((tab) => {
          const active = activeTab === tab;

          return (
            <div
              key={tab}
              style={{
                ...MONO,
                padding: "12px 14px",
                fontSize: 12,
                fontWeight: 600,
                color: active
                  ? "var(--viz-text)"
                  : "var(--viz-text-muted)",
                borderBottom: active
                  ? "2px solid #818cf8"
                  : "2px solid transparent",
                transition: "all .2s ease",
              }}
            >
              {tab === "py" ? "Python" : "cURL"}
            </div>
          );
        })}
      </div>

      <div
        style={{
          ...MONO,
          padding: "22px 22px 24px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function CodeCardsStack() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "min(440px, 100%)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <SingleCodeCard activeTab="py">
        <p style={{ margin: 0 }}>
          <span style={{ color: "var(--viz-code-keyword)" }}>from</span>
          <span style={{ color: "var(--viz-code-muted)" }}> </span>
          <span style={{ color: "var(--viz-code-text)" }}>
            statewave_integration
          </span>
          <span style={{ color: "var(--viz-code-muted)" }}> </span>
          <span style={{ color: "var(--viz-code-keyword)" }}>import</span>
          <span style={{ color: "var(--viz-code-muted)" }}> (</span>
        </p>

        <p style={{ margin: "4px 0 0" }}>
          <span style={{ color: "var(--viz-code-muted)" }}>{"  "}</span>
          <span style={{ color: "var(--viz-code-text)" }}>
            _get_context, _record_episode
          </span>
        </p>

        <p style={{ margin: "4px 0 0" }}>
          <span style={{ color: "var(--viz-code-muted)" }}>)</span>
        </p>
      </SingleCodeCard>

      <SingleCodeCard activeTab="curl">
        <p style={{ margin: 0 }}>
          <span style={{ color: "var(--viz-code-keyword)" }}>curl</span>
          <span style={{ color: "var(--viz-code-muted)" }}> </span>
          <span style={{ color: "var(--viz-code-text)" }}>
            localhost:8000/api/v1\
          </span>
        </p>

        <p style={{ margin: "4px 0 0" }}>
          <span style={{ color: "var(--viz-code-muted)" }}>{"  "}</span>
          <span style={{ color: "var(--viz-code-text)" }}>
            /memory/dev_alice
          </span>
        </p>
      </SingleCodeCard>
    </div>
  );
}

function ThreeEndpointsSection() {
  return (
    <GridSection
      className="bg-surface-1"
      innerClassName="py-20 sm:py-24 xl:py-28"
    >
      <div className="grid items-center gap-14 md:grid-cols-2 xl:gap-20">
        <div className="flex justify-center md:justify-start">
          <VisualPanel
            className="flex w-full items-center justify-center px-4 py-10 sm:px-8"
            style={{ maxWidth: "min(560px, 100%)" }}
          >
            <CodeCardsStack />
          </VisualPanel>
        </div>

        <div>
          <div className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            Developer API
          </div>

          <h2 className="font-heading text-4xl font-bold leading-[0.98] tracking-[-0.03em] text-theme-primary md:text-[56px]">
            Three endpoints.{" "}
            <span className="text-gradient-brand">
              That's the whole API.
            </span>
          </h2>

          <p className="mt-6 text-[20px] leading-[1.65] text-theme-secondary/85">
            Wrap your LLM with two calls—retrieve context before inference and
            record the episode afterwards. The client drops into any FastAPI app
            in minutes.
          </p>

          <div className="mt-8 space-y-3">
            {ENDPOINT_FEATURES.map((feature) => (
              <div
                key={feature.label}
                className="flex items-start gap-4"
              >
                <span className="mt-2 h-px w-3 shrink-0 bg-accent" />

                <span className="text-sm leading-6 text-theme-primary">
                  {feature.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Button
              href="https://github.com/smaramwbc/statewave-docs/blob/main/getting-started.md"
              size="lg"
            >
              Integrate Statewave
            </Button>
          </div>
        </div>
      </div>
    </GridSection>
  );
}
/* ─── Purpose-built feature grid ─────────────────────────────────────────── */

const FEATURE_GRID = [
  {
    title: "Self-Hosted, No Cloud Account",
    body: "Runs on your own Postgres with pgvector. No SaaS plan, no sign-up, no vendor API key.",
  },
  {
    title: "Multi-User by Default",
    body: "Memories are scoped per subject_id. Any string becomes a user, created on first episode write.",
  },
  {
    title: "Token Budget Control",
    body: "Set STATEWAVE_DEFAULT_MAX_CONTEXT_TOKENS and Statewave always fits within it, highest-confidence facts first.",
  },
  {
    title: "Durable Across Sessions",
    body: "Episodes are appended, not merged. Compiled memory survives restarts and redeploys.",
  },
  {
    title: "Full Audit Trail",
    body: "Every context call produces an HMAC-signed receipt tracing facts back to their source episode.",
  },
  {
    title: "Fails Open, Never Blocks",
    body: "If Statewave is down, context comes back empty and the episode write fires and forgets. Chat never errors.",
  },
];

function CircleCheck() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 text-brand-500"
      aria-hidden="true"
    >
      <circle
        cx="10"
        cy="10"
        r="9"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6.5 10.5L8.5 12.5L13.5 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FeatureGridSection() {
  return (
    <GridSection
      innerClassName="py-20 sm:py-24 xl:py-28"
    >
      <div className="mx-auto mb-12 max-w-[720px] text-center sm:mb-16">
        <div className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
          Why Statewave
        </div>

        <h2 className="font-heading text-4xl font-bold leading-[0.98] tracking-[-0.03em] text-theme-primary md:text-[56px]">
          Purpose-built memory{" "}
          <span className="text-gradient-brand">for AI agents</span>
        </h2>

        <p className="mx-auto mt-6 max-w-[640px] text-[20px] leading-[1.65] text-theme-secondary/85">
          A focused memory layer designed for production agents, with durable
          context, predictable token usage, and infrastructure you control.
        </p>
      </div>

      <div className="mx-auto grid max-w-[1100px] gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURE_GRID.map((feature) => (
          <article
            key={feature.title}
            className="sw-card rounded-2xl border border-theme-border bg-surface-1/50 p-6 sm:p-7"
          >
            <div className="flex items-start gap-3">
              <CircleCheck />

              <div>
                <h3 className="font-heading text-[17px] font-semibold leading-[1.25] tracking-[-0.01em] text-theme-primary">
                  {feature.title}
                </h3>

                <p className="mt-3 text-[14px] leading-[1.7] text-theme-muted">
                  {feature.body}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </GridSection>
  );
}

/* ─── CTA footer ─────────────────────────────────────────────────────────── */

function CTASection() {
  return (
    <GridSection
      className="bg-surface-1"
      innerClassName="py-20 sm:py-24 xl:py-28"
    >
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

          <h2 className="font-heading text-4xl font-bold leading-[1.02] tracking-[-0.04em] text-theme-primary md:text-[64px]">
            Give your assistant{" "}
            <span className="text-gradient-brand">memory</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-[20px] leading-[1.65] text-theme-secondary/85">
            Start building with Statewave in about 5 minutes. Self-hosted,
            open source, and ready for production.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button
              href="https://github.com/smaramwbc/statewave-docs/blob/main/getting-started.md"
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
  );
}
/* ─── Page ───────────────────────────────────────────────────────────────── */

export function PersonalAssistantMemoryPage() {
  usePageSEO({
    breadcrumb: false,
    jsonLd: [
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Use Cases", path: "/use-cases" },
        {
          name: "Personal Assistant",
          path: "/use-cases/personal-assistant-memory",
        },
      ]),
    ],
  });
  return (
    <div className="bg-surface-1">
      <div>
        <HeroSection />
        <CostSection />
        <MemoryMergingSection />
        <QuickstartSection />
        <ConfidenceSection />
        <ThreeEndpointsSection />
        <FeatureGridSection />
        <CTASection />
      </div>
    </div>
  );
}
