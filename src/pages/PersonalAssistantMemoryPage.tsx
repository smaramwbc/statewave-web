import React from "react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Button } from "../components/Button";
import { UseCaseSwitcher } from "../components/UseCaseSwitcher";
import { usePageSEO } from "../lib/seo";
import { breadcrumbJsonLd } from "../lib/seo-meta";

const PAGE_RAIL_CLASS =
  "mx-auto max-w-[1488px] px-5 sm:px-10 md:px-16 xl:px-[94px]"
  + " border-b xl:border-l xl:border-r"
  + " border-theme-border";

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
    <section className="relative bg-surface-1 overflow-hidden">
      <div className="mx-auto max-w-[1488px] px-5 sm:px-10 md:px-16 xl:px-[94px] xl:border-l xl:border-r border-theme-border relative pt-[105px] pb-10 text-center xl:pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Breadcrumb: "Use Cases / [Personal Assistant ⌄]" */}
          <div className="mb-8">
            <UseCaseSwitcher currentSlug="personal-assistant-memory" />
          </div>

          {/* Heading: Fustat, gradient on second line */}
          <h1
            style={{
              fontFamily: "Fustat, Inter, sans-serif",
              fontSize: "clamp(2.5rem, 6vw, 82px)",
              fontWeight: 500,
              lineHeight: "102%",
              letterSpacing: "-0.055em",
            }}
            className="text-theme-primary"
          >
            One Assistant. Every
            <br />
            <span
              style={{
                background:
                  "linear-gradient(90deg, #4F46E5 0%, #60A5FA 50%, #93C5FD 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Session Remembered
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-base text-theme-muted max-w-sm mx-auto leading-relaxed">
            Agents work better when they actually know who they're helping,
            every session, every time.
          </p>

          <div className="mt-8">
            <Button
              href="https://github.com/smaramwbc/statewave-personal-assistant"
              variant="primary"
              size="lg"
            >
              Get Started Free
            </Button>
          </div>
        </motion.div>

        {/* Hero visual: assistant chat + memory-state panel */}
        <div className="mt-12">
          <HeroChatVisual />
        </div>
      </div>
    </section>
  );
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
      className="rounded-[4px] px-1.5 py-0.5 font-mono text-[9px]"
      style={{
        color: "var(--viz-indigo)",
        background: "rgba(129,140,248,0.1)",
        border: "1px solid rgba(129,140,248,0.25)",
      }}
    >
      {label}
    </span>
  );
}

function MemoryUsedBadge({ note }: { note: string }) {
  return (
    <div className="mt-2 flex items-center gap-2">
      <span
        className="rounded-[4px] px-1.5 py-0.5 font-mono text-[9px]"
        style={{
          color: "var(--viz-green)",
          background: "rgba(16,185,129,0.08)",
          border: "1px solid rgba(16,185,129,0.2)",
        }}
      >
        memory used
      </span>
      <span className="font-mono text-[9px]" style={{ color: "var(--viz-text-muted)" }}>
        {note}
      </span>
    </div>
  );
}

function HeroChatVisual() {
  return (
    <div
      className="mx-auto w-full overflow-hidden rounded-t-2xl text-left"
      style={{
        maxWidth: 1120,
        background: "var(--viz-shell)",
        border: "1px solid var(--viz-border-strong)",
        borderBottom: "none",
      }}
    >
      {/* Window title bar */}
      <div
        className="flex items-center justify-between px-4 sm:px-5"
        style={{
          height: 44,
          borderBottom: "1px solid var(--viz-border)",
          background: "var(--viz-shell-header)",
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="flex items-center gap-1.5 font-mono text-[11px]"
            style={{ color: "var(--viz-text-3)" }}
          >
            <span style={{ color: "var(--viz-green)", fontSize: 8 }}>●</span>
            statewave
            <span style={{ color: "var(--viz-text-muted)" }}>on</span>
          </span>
          <span
            className="hidden sm:inline-flex items-center gap-1.5 rounded-[5px] px-2 py-1 font-mono text-[11px] text-white"
            style={{
              background: "#2d47c9",
              border: "1px solid rgba(255,255,255,0.14)",
            }}
          >
            ▸ dev_alice
            <span className="text-white/60">switch user</span>
          </span>
        </div>
        <span className="font-mono text-[11px]" style={{ color: "var(--viz-text-muted)" }}>
          token budget: 800
        </span>
      </div>

      {/* Body: chat + memory panel */}
      <div className="grid md:grid-cols-[1.45fr_1fr]">
        {/* Chat column */}
        <div
          className="flex flex-col p-4 sm:p-6"
          style={{ borderRight: "1px solid var(--viz-border)" }}
        >
          <p
            className="mb-4 font-mono text-[10px] uppercase tracking-[0.14em]"
            style={{ color: "var(--viz-text-muted)" }}
          >
            Chat
          </p>

          {/* Assistant / user turns */}
          <div className="flex-1 space-y-3 text-[13px] leading-relaxed">
            <div
              className="max-w-[75%] rounded-[8px] px-3.5 py-2.5"
              style={{
                background: "var(--viz-fill)",
                border: "1px solid var(--viz-border)",
                color: "var(--viz-text-2)",
              }}
            >
              Hey, picking back up. Where did we leave off?
            </div>

            <div className="flex justify-end">
              <div
                className="max-w-[75%] rounded-[8px] px-3.5 py-2.5 text-white"
                style={{ background: "#2e52d7" }}
              >
                What was the bug I was debugging last session?
              </div>
            </div>

            <div
              className="max-w-[85%] rounded-[8px] px-3.5 py-2.5"
              style={{
                background: "var(--viz-fill)",
                border: "1px solid var(--viz-border)",
                color: "var(--viz-text-2)",
              }}
            >
              You were hitting 429s on batch embedding jobs, an undocumented
              per-IP burst limit (~500 req/10s). Did the tenacity backoff fix
              land?
              <MemoryUsedBadge note="ep_0012 · 761 tok" />
            </div>
          </div>

          {/* Suggestion chips */}
          <div className="mt-6 flex flex-wrap gap-2">
            {["What was I building?", "Any open issues?"].map((s) => (
              <span
                key={s}
                className="rounded-full px-3 py-1.5 text-[11px]"
                style={{
                  border: "1px solid var(--viz-border-strong)",
                  color: "var(--viz-text-3)",
                }}
              >
                {s}
              </span>
            ))}
          </div>

          {/* Input row */}
          <div
            className="mt-3 flex items-center justify-between gap-3 rounded-[8px] px-3.5 py-2.5"
            style={{
              background: "var(--viz-fill)",
              border: "1px solid var(--viz-border)",
            }}
          >
            <span className="text-[12px]" style={{ color: "var(--viz-text-muted)" }}>
              Type a message…
            </span>
            <span
              className="rounded-[6px] px-3.5 py-1.5 text-[11px] font-medium text-white"
              style={{ background: "#2e52d7" }}
            >
              Send
            </span>
          </div>
        </div>

        {/* Memory state column */}
        <div
          className="flex flex-col p-4 sm:p-6"
          style={{ background: "var(--viz-shell-side)" }}
        >
          <div className="mb-4 flex items-center justify-between">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.14em]"
              style={{ color: "var(--viz-text-muted)" }}
            >
              Memory state
            </p>
            <span className="font-mono text-[10px]" style={{ color: "var(--viz-text-muted)" }}>
              /v1/context
            </span>
          </div>

          <div className="flex-1 space-y-2.5">
            {HERO_MEMORY_FACTS.map((f) => (
              <div
                key={f.type + f.text}
                className="rounded-[7px] px-3 py-2.5"
                style={{
                  background: "var(--viz-fill)",
                  border: "1px solid var(--viz-border)",
                }}
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <TypeBadge label={f.type} />
                  <span className="font-mono text-[9px]" style={{ color: "var(--viz-text-muted)" }}>
                    {f.score}
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: "var(--viz-text-2)" }}>
                  {f.text}
                </p>
              </div>
            ))}
          </div>

          {/* Footer badge */}
          <div
            className="mt-4 flex items-center gap-2 rounded-[6px] px-3 py-2"
            style={{
              background: "rgba(16,185,129,0.07)",
              border: "1px solid rgba(16,185,129,0.18)",
            }}
          >
            <span style={{ color: "var(--viz-green)", fontSize: 9 }}>✓</span>
            <span className="font-mono text-[11px]" style={{ color: "var(--viz-green)" }}>
              4 memories compiled · 761 tokens
            </span>
          </div>
        </div>
      </div>
    </div>
  );
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
    <GridSection innerClassName="relative py-20 sm:py-24 xl:py-28">
      <div className="flex justify-center mb-8 xl:mb-10">
        <span className="px-4 py-2 text-sm font-medium text-theme-primary border border-theme-border rounded-[8px]">
          Problems
        </span>
      </div>

      <h2
        className="text-center text-theme-primary mb-14 xl:mb-16"
        style={{
          fontFamily: "Fustat, Inter, sans-serif",
          fontSize: "clamp(2.25rem, 4vw, 3.75rem)",
          fontWeight: 400,
          letterSpacing: "-0.02em",
          lineHeight: 1.05,
        }}
      >
        The Cost Of Stateless Chat Apps
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-7">
        {COST_ITEMS.map((item) => (
          <div
            key={item.title}
            className="flex flex-col justify-between p-8 sm:p-10 xl:p-12 border border-theme-border rounded-[10px]"
            style={{ minHeight: "clamp(260px, 22vw, 420px)" }}
          >
            <div>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="mb-6 text-theme-muted">
                <circle cx="14" cy="14" r="13" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5" />
                <path
                  d="M9.5 9.5L18.5 18.5M18.5 9.5L9.5 18.5"
                  stroke="currentColor"
                  strokeOpacity="0.6"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <h4
                className="text-[17px] font-semibold leading-snug text-theme-primary xl:text-[19px]"
                style={{ fontFamily: "Fustat, Inter, sans-serif" }}
              >
                {item.title}
              </h4>
            </div>
            <p className="mt-10 text-[14px] leading-relaxed text-theme-muted sm:text-[15px] xl:text-[16px]">
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </GridSection>
  );
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
          className={`rounded-[6px] p-3 ${
            s.current ? "shadow-[0_10px_28px_rgba(0,0,0,0.26)]" : ""
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
    <GridSection innerClassName="py-20 sm:py-24">
      <div className="mx-auto mb-10 max-w-xl text-center sm:mb-14">
        <span className="inline-flex rounded-[6px] border border-theme-border px-4 py-2 text-sm font-medium text-theme-muted">
          Features
        </span>
        <h2
          className="mt-5 leading-[1.05] tracking-[-0.03em] text-theme-primary"
          style={{
            fontFamily: "Fustat, Inter, sans-serif",
            fontSize: "clamp(2.25rem, 4vw, 3.75rem)",
            fontWeight: 400,
          }}
        >
          The Memory
          <br />
          Does The Merging
        </h2>
      </div>
      <div className="mx-auto grid max-w-[1100px] gap-5 sm:grid-cols-2">
        {MEMORY_CARDS_DATA.map((card) => (
          <div
            key={card.title}
            className="overflow-hidden rounded-[10px] border border-theme-border"
          >
            <VisualPanel className="flex min-h-[300px] sm:min-h-[380px] md:min-h-[440px] items-center justify-center px-4 sm:px-8 py-10">
              <card.Visual />
            </VisualPanel>
            <div className="px-7 py-7 sm:px-8 bg-surface-0">
              <h3 className="mb-3 text-[20px] font-semibold leading-tight text-theme-primary">
                {card.title}
              </h3>
              <p className="max-w-[400px] text-[15px] leading-relaxed text-theme-muted">
                {card.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </GridSection>
  );
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
    <GridSection innerClassName="py-28 sm:py-36">
      <div className="mx-auto mb-14 max-w-3xl text-center sm:mb-20">
        <span className="inline-flex rounded-[6px] border border-theme-border px-4 py-2 text-sm font-medium text-theme-muted">
          Reference Builds
        </span>
        <h2
          className="mt-5 leading-[1.05] tracking-[-0.03em] text-theme-primary"
          style={{
            fontFamily: "Fustat, Inter, sans-serif",
            fontSize: "clamp(2rem, 3.5vw, 3.25rem)",
            fontWeight: 500,
          }}
        >
          Three quickstart examples. One live comparison.
        </h2>
      </div>
      <div className="mx-auto max-w-[1100px] space-y-5">
        {QUICKSTART_ROWS_DATA.map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-[12px] border border-theme-border md:grid md:min-h-[400px] md:grid-cols-[1fr_1.1fr]"
          >
            <div className="flex flex-col justify-center border-b border-theme-border p-8 md:border-b-0 md:border-r md:p-14 bg-surface-0">
              <h3 className="max-w-[340px] text-[20px] sm:text-[22px] font-semibold leading-[1.12] tracking-[-0.02em] text-theme-primary sm:text-[26px]">
                {row.label}
              </h3>
              <p className="mt-5 max-w-[380px] text-[15px] leading-relaxed text-theme-muted">
                {row.body}
              </p>
              <div className="mt-6 flex gap-2">
                {row.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-[6px] border border-theme-border px-2.5 py-1 text-[12px] text-theme-muted"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <VisualPanel className="flex min-h-[280px] sm:min-h-[320px] items-center justify-center px-4 sm:px-8 py-10 md:min-h-0 md:px-12">
              <row.Visual />
            </VisualPanel>
          </motion.div>
        ))}
      </div>
    </GridSection>
  );
}

/* ─── Only the highest-confidence facts reach the prompt ─────────────────── */

function TokenComparisonCard() {
  const label: React.CSSProperties = { fontSize: 12, color: "var(--viz-text-3)" };
  const chip: React.CSSProperties = {
    fontSize: 11,
    color: "var(--viz-text-muted)",
    border: "1px solid var(--viz-border)",
    borderRadius: 4,
    padding: "2px 7px",
  };
  const track: React.CSSProperties = {
    background: "var(--viz-track)",
    borderRadius: 6,
    height: 12,
    overflow: "hidden",
    marginBottom: 8,
  };
  const note: React.CSSProperties = { fontSize: 11, color: "var(--viz-text-muted)" };
  return (
    <div
      style={{
        background: "var(--viz-card)",
        border: "1px solid var(--viz-border-strong)",
        borderRadius: 14,
        padding: "28px",
        width: "100%",
        maxWidth: 480,
        position: "relative",
      }}
    >
      {/* Top: raw conversation history */}
      <div
        style={{
          borderBottom: "1px solid var(--viz-border)",
          paddingBottom: 28,
          marginBottom: 28,
        }}
      >
        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--viz-text)", marginBottom: 16 }}>
          Raw conversation history
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={label}>tokens to LLM</span>
          <span style={chip}>~2,800 / session</span>
        </div>
        <div style={track}>
          <div style={{ background: "#ef4444", borderRadius: 6, height: "100%", width: "88%" }} />
        </div>
        <p style={note}>6 sessions of raw history. No ranking signal.</p>
      </div>

      {/* Bottom: Statewave context bundle */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <svg width="13" height="12" viewBox="0 0 13 12" fill="none">
            <circle cx="6.5" cy="6" r="5" stroke="#818cf8" strokeWidth="1.5" />
            <circle cx="6.5" cy="6" r="2" fill="#818cf8" />
          </svg>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--viz-text)" }}>
            Statewave context bundle
          </p>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={label}>Token Used (Avg)</span>
          <span style={chip}>761 / session</span>
        </div>
        <div style={track}>
          <div style={{ background: "#818cf8", borderRadius: 6, height: "100%", width: "27%" }} />
        </div>
        <p style={{ ...note, marginBottom: 16 }}>
          Only the highest-confidence facts, in budget.
        </p>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.18)",
            borderRadius: 5,
            padding: "5px 10px",
          }}
        >
          <span style={{ color: "var(--viz-green)", fontSize: 8 }}>●</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: "var(--viz-green)" }}>
            Memory Connected
          </span>
        </div>
      </div>
    </div>
  );
}

function ConfidenceSection() {
  return (
    <GridSection innerClassName="py-28 sm:py-36">
      <div className="grid md:grid-cols-2 gap-10 md:gap-16 xl:gap-24 items-center">
        <div>
          <h2
            className="text-theme-primary tracking-tight mb-5"
            style={{
              fontFamily: "Fustat, Inter, sans-serif",
              fontSize: "clamp(1.75rem, 3.5vw, 3rem)",
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
            }}
          >
            Only the highest-confidence
            <br />
            facts reach the prompt
          </h2>
          <p className="text-[16px] text-theme-muted leading-relaxed mb-5">
            get_context ranks every compiled memory and returns only what fits
            the demo&apos;s STATEWAVE_MAX_TOKENS (800 by default) as one
            ready-to-inject string.
          </p>
          <ul className="space-y-3 text-[15px] text-theme-muted mb-8">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-theme-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4" />
              </svg>
              STATEWAVE_MAX_TOKENS enforced on every call, never exceeded
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-theme-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4" />
              </svg>
              Confidence-ranked: profile facts before throwaway remarks
            </li>
          </ul>
          <Button
            href="https://github.com/smaramwbc/statewave-personal-assistant"
            variant="primary"
            size="lg"
          >
            See the 5-Minute Path
          </Button>
        </div>
        <div className="flex justify-center md:justify-end">
          <VisualPanel
            className="w-full flex items-center justify-center rounded-[10px] border border-theme-border px-4 sm:px-8 py-10"
            style={{ maxWidth: "min(560px, 100%)" }}
          >
            <TokenComparisonCard />
          </VisualPanel>
        </div>
      </div>
    </GridSection>
  );
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
        background: "var(--viz-card)",
        border: "1px solid var(--viz-border-strong)",
        borderRadius: 12,
        overflow: "hidden",
        width: "100%",
      }}
    >
      {/* Tab bar */}
      <div
        style={{
          borderBottom: "1px solid var(--viz-border)",
          display: "flex",
        }}
      >
        {(["py", "curl"] as const).map((t) => {
          const label = t === "py" ? "Python" : "cURL";
          const active = activeTab === t;
          return (
            <div
              key={t}
              style={{
                padding: "10px 16px",
                ...MONO,
                color: active ? "var(--viz-text)" : "var(--viz-text-muted)",
                borderBottom: active ? "2px solid #818cf8" : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              {label}
            </div>
          );
        })}
      </div>
      {/* Code body */}
      <div style={{ padding: "18px 18px 20px", ...MONO }}>{children}</div>
    </div>
  );
}

function CodeCardsStack() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        width: "100%",
        maxWidth: "min(420px, 100%)",
      }}
    >
      {/* Python card */}
      <SingleCodeCard activeTab="py">
        <p style={{ margin: 0 }}>
          <span style={{ color: "var(--viz-code-keyword)" }}>from</span>
          <span style={{ color: "var(--viz-code-muted)" }}> </span>
          <span style={{ color: "var(--viz-code-text)" }}>statewave_integration</span>
          <span style={{ color: "var(--viz-code-muted)" }}> </span>
          <span style={{ color: "var(--viz-code-keyword)" }}>import</span>
          <span style={{ color: "var(--viz-code-muted)" }}> (</span>
        </p>
        <p style={{ margin: 0 }}>
          <span style={{ color: "var(--viz-code-muted)" }}>{"  "}</span>
          <span style={{ color: "var(--viz-code-text)" }}>_get_context, _record_episode</span>
        </p>
        <p style={{ margin: 0 }}>
          <span style={{ color: "var(--viz-code-muted)" }}>)</span>
        </p>
      </SingleCodeCard>

      {/* cURL card */}
      <SingleCodeCard activeTab="curl">
        <p style={{ margin: 0 }}>
          <span style={{ color: "var(--viz-code-text)" }}>curl localhost:8000/api/v1\</span>
        </p>
        <p style={{ margin: 0 }}>
          <span style={{ color: "var(--viz-code-muted)" }}>{"  "}</span>
          <span style={{ color: "var(--viz-code-text)" }}>/memory/dev_alice</span>
        </p>
      </SingleCodeCard>
    </div>
  );
}

function ThreeEndpointsSection() {
  return (
    <GridSection innerClassName="py-28 sm:py-36">
      <div className="grid md:grid-cols-2 gap-10 md:gap-16 xl:gap-24 items-center">
        <div className="flex justify-center md:justify-start">
          <VisualPanel
            className="w-full flex items-center justify-center rounded-[10px] border border-theme-border px-4 sm:px-8 py-10"
            style={{ maxWidth: "min(560px, 100%)" }}
          >
            <CodeCardsStack />
          </VisualPanel>
        </div>
        <div>
          <h2
            className="text-theme-primary tracking-tight mb-5"
            style={{
              fontFamily: "Fustat, Inter, sans-serif",
              fontSize: "clamp(2rem, 3.5vw, 3rem)",
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
            }}
          >
            Three endpoints.
            <br />
            That's the whole API.
          </h2>
          <p className="text-[16px] text-theme-muted leading-relaxed mb-6">
            Two calls wrap your LLM call: get_context before, record_episode
            after. Drop the client into any FastAPI app in minutes.
          </p>
          <ul className="space-y-2.5 mb-8">
            {ENDPOINT_FEATURES.map((f) => (
              <li
                key={f.label}
                className="flex items-center gap-2.5 text-sm text-theme-muted"
              >
                <svg
                  className="w-4 h-4 text-theme-muted shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4"
                  />
                </svg>
                {f.label}
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
      className="text-theme-muted shrink-0"
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
  );
}

function FeatureGridSection() {
  return (
    <GridSection
      innerClassName="relative"
      className=""
    >
      <div
        style={{
          paddingTop: "clamp(60px, 8vw, 100px)",
          paddingBottom: "clamp(60px, 8vw, 100px)",
        }}
      >
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-flex rounded-[6px] px-3.5 py-1.5 text-[13px] font-medium text-theme-secondary border border-theme-border">
            Why Statewave
          </span>
          <h2
            className="mt-4 text-theme-primary tracking-tight"
            style={{
              fontFamily: "Fustat, Inter, sans-serif",
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Purpose-Built Memory Layer for AI Agents
          </h2>
        </div>

        {/* 3-col grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURE_GRID.map((f) => (
            <div
              key={f.title}
              className="rounded-[10px] border border-theme-border bg-surface-0 p-5"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <CircleCheck />
                <h3
                  className="text-[15px] font-semibold text-theme-primary leading-snug"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {f.title}
                </h3>
              </div>
              <p className="text-[13px] leading-relaxed text-theme-muted">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </GridSection>
  );
}

/* ─── CTA footer ─────────────────────────────────────────────────────────── */

function CTASection() {
  return (
    <section className="relative bg-surface-1">
      <div
        className="mx-auto max-w-[1488px] px-5 sm:px-10 md:px-16 xl:px-[94px] xl:border-l xl:border-r border-theme-border"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: "clamp(72px, 8vw, 120px)",
          paddingBottom: "clamp(80px, 9vw, 140px)",
        }}
      >
        <div className="text-center" style={{ maxWidth: 900 }}>
          <h2
            className="text-theme-primary"
            style={{
              fontFamily: "Fustat, Inter, sans-serif",
              fontSize: "clamp(1.75rem, 5vw, 4.75rem)",
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            <span className="block" style={{ whiteSpace: "nowrap" }}>
              Give your assistant
            </span>
            <span
              className="block"
              style={{
                whiteSpace: "nowrap",
                background: "linear-gradient(90deg, #4f46e5 0%, #60a5fa 50%, #93c5fd 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              a memory
            </span>
          </h2>

          <p
            className="text-theme-muted mt-5"
            style={{
              fontSize: 15,
              lineHeight: 1.5,
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
            }}
          >
            Instant memory for LLMs for better, cheaper, personal.
          </p>

          <div className="mt-14 flex flex-wrap justify-center gap-3">
            <Button
              href="https://github.com/smaramwbc/statewave-docs/blob/main/getting-started.md"
              variant="primary"
              size="lg"
            >
              Get Started
            </Button>
            <Button to="/pricing" variant="secondary" size="lg">
              Pricing
            </Button>
          </div>
        </div>
      </div>
    </section>
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
    <div className="bg-surface-1 font-fustat-headings">
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
