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
 * neutrals flip with the light/dark theme; blue accents and status colors
 * stay branded in both. */

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
          {/* Breadcrumb: "Use Cases / [Shared Context ⌄]" */}
          <div className="mb-8">
            <UseCaseSwitcher currentSlug="multi-agent-shared-context" />
          </div>

          {/* Heading: gradient on second line */}
          <h1
            style={{
              fontSize: "clamp(2.5rem, 6vw, 82px)",
              fontWeight: 500,
              lineHeight: "102%",
              letterSpacing: "-0.055em",
            }}
            className="text-theme-primary"
          >
            Multiple Agents. One
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
              Source Of Truth
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-base text-theme-muted max-w-sm mx-auto leading-relaxed">
            Agents work better when they actually know who they're helping,
            every session, every time.
          </p>

          <div className="mt-8">
            <Button
              href="https://github.com/smaramwbc/statewave-multi-agent-shared-context"
              variant="primary"
              size="lg"
            >
              Get Started Free
            </Button>
          </div>
        </motion.div>

        {/* Hero visual: agent log + shared context panel */}
        <div className="mt-12">
          <HeroRunVisual />
        </div>
      </div>
    </section>
  );
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

function AgentTag({ label, color }: { label: string; color: string }) {
  return (
    <p
      className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em]"
      style={{ color }}
    >
      {label}
    </p>
  );
}

function HeroRunVisual() {
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
            status: ok
          </span>
          <span
            className="hidden sm:inline-flex items-center gap-1.5 rounded-[5px] px-2 py-1 font-mono text-[11px] text-white"
            style={{
              background: "#2d47c9",
              border: "1px solid rgba(255,255,255,0.14)",
            }}
          >
            ▸ sw-run-8841
            <span className="text-white/60">switch mode</span>
          </span>
        </div>
        <span className="font-mono text-[11px]" style={{ color: "var(--viz-text-muted)" }}>
          --mode statewave
        </span>
      </div>

      {/* Body: agent log + shared context */}
      <div className="grid md:grid-cols-[1.45fr_1fr]">
        {/* Agent log column */}
        <div
          className="flex flex-col p-4 sm:p-6"
          style={{ borderRight: "1px solid var(--viz-border)" }}
        >
          <p
            className="mb-4 font-mono text-[10px] uppercase tracking-[0.14em]"
            style={{ color: "var(--viz-text-muted)" }}
          >
            Agent log
          </p>

          <div className="flex-1 space-y-3 text-[13px] leading-relaxed">
            <div
              className="max-w-[75%] rounded-[8px] px-3.5 py-2.5"
              style={{
                background: "var(--viz-fill)",
                border: "1px solid var(--viz-border)",
                color: "var(--viz-text-2)",
              }}
            >
              <AgentTag label="Planner" color="var(--viz-indigo)" />
              Deprecating legacy-session-token, replaced by JWT.
            </div>

            <div
              className="max-w-[90%] rounded-[8px] px-3.5 py-2.5"
              style={{
                background: "var(--viz-fill)",
                border: "1px solid var(--viz-border)",
                color: "var(--viz-text-2)",
              }}
            >
              <AgentTag label="Coder" color="var(--viz-amber)" />
              Reading shared context before starting implementation… Skipping
              legacy-session-token (deprecated). Building jwt-auth instead.
              <div className="mt-2 flex items-center gap-2">
                <span
                  className="rounded-[4px] px-1.5 py-0.5 font-mono text-[9px]"
                  style={{
                    color: "var(--viz-green)",
                    background: "rgba(16,185,129,0.08)",
                    border: "1px solid rgba(16,185,129,0.2)",
                  }}
                >
                  context used
                </span>
                <span className="font-mono text-[9px]" style={{ color: "var(--viz-text-muted)" }}>
                  2 memories
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <div
                className="max-w-[85%] rounded-[8px] px-3.5 py-2.5 text-white"
                style={{
                  background: "#166534",
                  border: "1px solid rgba(52,211,153,0.35)",
                }}
              >
                <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/70">
                  Reviewer
                </p>
                No conflicts found. The Coder read the Planner's deprecation
                before acting.
              </div>
            </div>
          </div>

          {/* Input row */}
          <div
            className="mt-6 flex items-center justify-between gap-3 rounded-[8px] px-3.5 py-2.5"
            style={{
              background: "var(--viz-fill)",
              border: "1px solid var(--viz-border)",
            }}
          >
            <span className="font-mono text-[12px]" style={{ color: "var(--viz-text-muted)" }}>
              $ python main.py --mode statewave
            </span>
            <span
              className="rounded-[6px] px-3.5 py-1.5 text-[11px] font-medium text-white"
              style={{ background: "#2e52d7" }}
            >
              Run
            </span>
          </div>
        </div>

        {/* Shared context column */}
        <div
          className="flex flex-col p-4 sm:p-6"
          style={{ background: "var(--viz-shell-side)" }}
        >
          <div className="mb-4 flex items-center justify-between">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.14em]"
              style={{ color: "var(--viz-text-muted)" }}
            >
              Shared context
            </p>
            <span className="font-mono text-[10px]" style={{ color: "var(--viz-text-muted)" }}>
              subject: sw-run-8841
            </span>
          </div>

          <div className="flex-1 space-y-2.5">
            {HERO_SHARED_MEMORIES.map((m) => (
              <div
                key={m.type}
                className="rounded-[7px] px-3 py-2.5"
                style={{
                  background: "var(--viz-fill)",
                  border: "1px solid var(--viz-border)",
                }}
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span
                    className="rounded-[4px] px-1.5 py-0.5 font-mono text-[9px]"
                    style={{
                      color: "var(--viz-indigo)",
                      background: "rgba(129,140,248,0.1)",
                      border: "1px solid rgba(129,140,248,0.25)",
                    }}
                  >
                    {m.type}
                  </span>
                  <span className="font-mono text-[9px]" style={{ color: "var(--viz-text-muted)" }}>
                    {m.score}
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: "var(--viz-text-2)" }}>
                  {m.text}
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
            <span style={{ color: "var(--viz-green)", fontSize: 9 }}>●</span>
            <span className="font-mono text-[11px]" style={{ color: "var(--viz-green)" }}>
              Conflict avoided: read before write
            </span>
          </div>
        </div>
      </div>
    </div>
  );
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
    <GridSection innerClassName="relative py-20 sm:py-24 xl:py-28">
      <div className="flex justify-center mb-8 xl:mb-10">
        <span className="px-4 py-2 text-sm font-medium text-theme-primary border border-theme-border rounded-[8px]">
          Problems
        </span>
      </div>

      <h2
        className="text-center text-theme-primary mb-14 xl:mb-16"
        style={{
          fontSize: "clamp(2.25rem, 4vw, 3.75rem)",
          fontWeight: 400,
          letterSpacing: "-0.02em",
          lineHeight: 1.05,
        }}
      >
        The Cost of Message-Passing Only
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
  return (
    <div className="mx-auto w-full max-w-[400px] space-y-3 text-[11px]">
      <div
        className="rounded-[6px] p-3 shadow-[0_10px_28px_rgba(0,0,0,0.26)]"
        style={{ border: "1px solid #3d65ff", background: "#213a9f" }}
      >
        <div className="mb-2 inline-flex rounded-[3px] border border-white/15 bg-[#2e52d7] px-1.5 py-0.5 text-[8px] text-white/80">
          Planner · T+0.0s
        </div>
        <p className="mb-1 font-mono text-[12px] font-medium text-white/90">
          architectural_decision
        </p>
        <p className="mb-1 font-mono text-[8px] uppercase tracking-[0.1em] text-white/45">
          Content
        </p>
        <p className="text-white/75">
          Deprecation: legacy-session-token, replaced by JWT.
        </p>
      </div>
      {[
        {
          who: "Coder · T+4m0s",
          what: "implementation_note · Built: jwt-auth, rbac, login, logout",
        },
        {
          who: "Reviewer · T+4m45s",
          what: "review_finding · STATUS: CLEAN",
        },
      ].map((row) => (
        <div
          key={row.who}
          className="rounded-[6px] p-3"
          style={{
            border: "1px solid var(--viz-border)",
            background: "var(--viz-card-3)",
          }}
        >
          <p className="mb-1 text-[12px] font-medium" style={{ color: "var(--viz-text-2)" }}>
            {row.who}
          </p>
          <p style={{ color: "var(--viz-text-3)" }}>{row.what}</p>
        </div>
      ))}
    </div>
  );
}

/* Visual 2: three numbered call rows */
function ReadBeforeWriteVisual() {
  const steps = [
    {
      n: "1",
      title: "create_episode()",
      body: "Planner records its decision",
      active: false,
    },
    {
      n: "2",
      title: "compile_memories_wait()",
      body: "Decision becomes readable by anyone",
      active: true,
    },
    {
      n: "3",
      title: "get_context()",
      body: "Coder reads it, before writing any code",
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
    <div className="mx-auto w-full max-w-full sm:max-w-[420px] text-[12px]">
      <div className="mb-3 flex flex-wrap gap-2">
        {["LangGraph", "Claude Agent SDK", "CrewAI"].map((t) => (
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
          <span style={{ color: "var(--viz-indigo)" }}>bundle</span>
          <span style={{ color: "var(--viz-code-muted)" }}> = </span>
          <span style={{ color: "var(--viz-code-text)" }}>shared.before_acting(caller_id, task)</span>
        </p>
        <p style={{ margin: 0 }}>
          <span style={{ color: "var(--viz-indigo)" }}>result</span>
          <span style={{ color: "var(--viz-code-muted)" }}> = </span>
          <span style={{ color: "var(--viz-code-text)" }}>agent.run(task, context=bundle)</span>
        </p>
        <p style={{ margin: 0 }}>
          <span style={{ color: "var(--viz-code-text)" }}>shared.decide(caller_id, result.decision)</span>
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <GreenBadge label="SharedContext unchanged" />
        <span
          className="rounded-[4px] px-2 py-1 font-mono text-[10px]"
          style={{
            border: "1px solid var(--viz-border-strong)",
            color: "var(--viz-text-3)",
          }}
        >
          only the harness changes
        </span>
      </div>
    </div>
  );
}

/* Visual 4: one subject, three roles */
function SubjectVisual() {
  return (
    <div className="mx-auto w-full max-w-full sm:max-w-[420px] text-[12px]">
      <p className="mb-3 font-mono text-[11px]" style={{ color: "var(--viz-text-2)" }}>
        subject_id = "sw-run-8841"
      </p>
      <div className="mb-3 flex gap-1.5">
        {["planner", "coder", "reviewer"].map((r) => (
          <span
            key={r}
            className="rounded-[4px] px-2 py-0.5 font-mono text-[10px]"
            style={{
              color: "var(--viz-indigo)",
              background: "rgba(129,140,248,0.1)",
              border: "1px solid rgba(129,140,248,0.25)",
            }}
          >
            {r}
          </span>
        ))}
      </div>
      <p className="mb-3 font-mono text-[10px]" style={{ color: "var(--viz-text-muted)" }}>
        caller_id attributes every read + write
      </p>
      <div className="rounded-[6px] border border-[#4b69ff] bg-[#2a3fa8] px-4 py-3 leading-relaxed text-white/90">
        All three roles read and write the same subject. "Did someone already
        decide this?" is a lookup, not a guess.
      </div>
    </div>
  );
}

function FeatureCardsSection() {
  return (
    <GridSection innerClassName="py-20 sm:py-24">
      <div className="mx-auto mb-10 max-w-xl text-center sm:mb-14">
        <span className="inline-flex rounded-[6px] border border-theme-border px-4 py-2 text-sm font-medium text-theme-muted">
          Features
        </span>
        <h2
          className="mt-5 leading-[1.05] tracking-[-0.03em] text-theme-primary"
          style={{
            fontSize: "clamp(2.25rem, 4vw, 3.75rem)",
            fontWeight: 400,
          }}
        >
          One subject. Every
          <br />
          agent reads it.
        </h2>
      </div>
      <div className="mx-auto grid max-w-[1100px] gap-5 sm:grid-cols-2">
        {FEATURE_CARDS_DATA.map((card) => (
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

/* ─── One repo. Three ways to see the collision prevented. ───────────────── */

const REFERENCE_ROWS_DATA = [
  {
    label: "The collision, before Statewave.",
    body: "python main.py --mode naive runs the same task with message-passing only. The Coder never sees the Planner's deprecation and rebuilds the dead module from scratch.",
    tags: ["Python", "LiteLLM"],
    Visual: NaiveRunVisual,
  },
  {
    label: "No collision, after Statewave.",
    body: "python main.py --mode statewave runs the identical task on a shared subject. The Coder reads the deprecation before writing any code and skips the dead module entirely.",
    tags: ["Python", "Statewave SDK"],
    Visual: StatewaveRunVisual,
  },
  {
    label: "The full audit trail, on demand.",
    body: "timeline_inspector.py --run <id> prints the chronological chain for any run: what each agent knew when it acted, what it wrote, and the final memory state.",
    tags: ["Python", "Rich"],
    Visual: TimelineVisual,
  },
];

function LogRow({
  agent,
  agentColor,
  text,
}: {
  agent: string;
  agentColor: string;
  text: string;
}) {
  return (
    <div
      className="rounded-[6px] px-3 py-2 font-mono text-[11px] leading-relaxed"
      style={{
        border: "1px solid var(--viz-border)",
        background: "var(--viz-card-2)",
      }}
    >
      <span style={{ color: agentColor }}>[{agent}]</span>{" "}
      <span style={{ color: "var(--viz-text-3)" }}>{text}</span>
    </div>
  );
}

/* Visual 1: naive run log ending in red collision */
function NaiveRunVisual() {
  return (
    <div className="mx-auto w-full max-w-[440px] space-y-2 text-[11px]">
      <LogRow
        agent="Planner"
        agentColor="var(--viz-indigo)"
        text="DEPRECATING → legacy-session-token, replaced by JWT"
      />
      <LogRow
        agent="Coder"
        agentColor="var(--viz-amber)"
        text="No shared context available. Working from task description only"
      />
      <LogRow
        agent="Coder"
        agentColor="var(--viz-amber)"
        text="→ legacy-session-token module · → jwt-auth module"
      />
      <div
        className="rounded-[6px] px-3 py-2.5 font-mono text-[11px] leading-relaxed text-white"
        style={{ background: "#7f1d1d", border: "1px solid rgba(239,68,68,0.5)" }}
      >
        [Reviewer] COLLISION DETECTED. Both agents already completed. Wasted
        compute cannot be recovered.
      </div>
    </div>
  );
}

/* Visual 2: statewave run log ending in green avoidance */
function StatewaveRunVisual() {
  return (
    <div className="mx-auto w-full max-w-[440px] space-y-2 text-[11px]">
      <LogRow
        agent="Planner"
        agentColor="var(--viz-indigo)"
        text="DEPRECATING → legacy-session-token, replaced by JWT"
      />
      <LogRow
        agent="Planner"
        agentColor="var(--viz-indigo)"
        text="Compiling episodes → decisions available to all agents now…"
      />
      <LogRow
        agent="Coder"
        agentColor="var(--viz-amber)"
        text="[architectural_decision] (0.92) Deprecation: legacy-session-token"
      />
      <LogRow
        agent="Coder"
        agentColor="var(--viz-amber)"
        text="Skipping legacy-session-token (deprecated by Planner: use JWT)"
      />
      <div
        className="rounded-[6px] px-3 py-2.5 font-mono text-[11px] leading-relaxed text-white"
        style={{ background: "#166534", border: "1px solid rgba(52,211,153,0.4)" }}
      >
        [Reviewer] CONFLICT AVOIDED. The Coder read the Planner's deprecation
        before acting.
      </div>
    </div>
  );
}

/* Visual 3: timeline inspector table */
function TimelineVisual() {
  const rows = [
    {
      time: "14:01:00Z",
      rel: "T+0.0s",
      agent: "Planner",
      color: "var(--viz-indigo)",
      event: "architectural_decision · Deprecation: legacy-session-token…",
    },
    {
      time: "14:01:12Z",
      rel: "T+12.1s",
      agent: "Planner",
      color: "var(--viz-indigo)",
      event: "compile · Memory compilation triggered",
    },
    {
      time: "14:01:15Z",
      rel: "T+15.3s",
      agent: "Coder",
      color: "var(--viz-amber)",
      event: "context_retrieval · Retrieved 2 memories (incl. deprecation)",
    },
    {
      time: "14:05:00Z",
      rel: "T+4m0s",
      agent: "Coder",
      color: "var(--viz-amber)",
      event: "implementation_note · Built: jwt-auth, rbac, login, logout",
    },
    {
      time: "14:05:45Z",
      rel: "T+4m45s",
      agent: "Reviewer",
      color: "var(--viz-green)",
      event: "review_finding · STATUS: CLEAN",
    },
  ];
  return (
    <div className="mx-auto w-full max-w-[460px] text-[10px]">
      <div
        className="mb-2 grid grid-cols-[64px_52px_56px_1fr] gap-2 px-3 font-mono uppercase tracking-[0.1em]"
        style={{ color: "var(--viz-text-muted)" }}
      >
        <span>Time</span>
        <span>Rel</span>
        <span>Agent</span>
        <span>Event</span>
      </div>
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div
            key={r.time}
            className="grid grid-cols-[64px_52px_56px_1fr] items-center gap-2 rounded-[5px] px-3 py-2 font-mono"
            style={{
              border: "1px solid var(--viz-border)",
              background: "var(--viz-card-2)",
            }}
          >
            <span style={{ color: "var(--viz-text-muted)" }}>{r.time}</span>
            <span style={{ color: "var(--viz-text-muted)" }}>{r.rel}</span>
            <span style={{ color: r.color }}>{r.agent}</span>
            <span style={{ color: "var(--viz-text-3)" }}>{r.event}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReferenceBuildsSection() {
  return (
    <GridSection innerClassName="py-28 sm:py-36">
      <div className="mx-auto mb-14 max-w-3xl text-center sm:mb-20">
        <span className="inline-flex rounded-[6px] border border-theme-border px-4 py-2 text-sm font-medium text-theme-muted">
          Reference Builds
        </span>
        <h2
          className="mt-5 leading-[1.05] tracking-[-0.03em] text-theme-primary"
          style={{
            fontSize: "clamp(2rem, 3.5vw, 3.25rem)",
            fontWeight: 500,
          }}
        >
          One repo. Three ways to see the collision prevented.
        </h2>
      </div>
      <div className="mx-auto max-w-[1100px] space-y-5">
        {REFERENCE_ROWS_DATA.map((row, i) => (
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

/* ─── Prevented, not just detected ───────────────────────────────────────── */

function PipelineComparisonCard() {
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
      {/* Top: naive pipeline */}
      <div
        style={{
          borderBottom: "1px solid var(--viz-border)",
          paddingBottom: 28,
          marginBottom: 28,
        }}
      >
        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--viz-text)", marginBottom: 16 }}>
          Naive pipeline (message-passing)
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={label}>Coder's context before acting</span>
          <span style={chip}>task string only</span>
        </div>
        <div style={track}>
          <div style={{ background: "#ef4444", borderRadius: 6, height: "100%", width: "9%" }} />
        </div>
        <p style={note}>Reviewer flags the conflict after both agents finish.</p>
      </div>

      {/* Bottom: statewave pipeline */}
      <div>
        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--viz-text)", marginBottom: 16 }}>
          Statewave pipeline (shared subject)
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={label}>Coder's context before acting</span>
          <span style={chip}>2 ranked memories</span>
        </div>
        <div style={track}>
          <div style={{ background: "#818cf8", borderRadius: 6, height: "100%", width: "92%" }} />
        </div>
        <p style={{ ...note, marginBottom: 16 }}>
          Deprecation is known before the first line of code.
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
            Conflict Avoided
          </span>
        </div>
      </div>
    </div>
  );
}

function PreventedSection() {
  return (
    <GridSection innerClassName="py-28 sm:py-36">
      <div className="grid md:grid-cols-2 gap-10 md:gap-16 xl:gap-24 items-center">
        <div>
          <h2
            className="text-theme-primary tracking-tight mb-5"
            style={{
              fontSize: "clamp(1.75rem, 3.5vw, 3rem)",
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
            }}
          >
            Prevented, not just detected
          </h2>
          <p className="text-[16px] text-theme-muted leading-relaxed mb-5">
            The naive pipeline reviews after both agents finish. The Statewave
            pipeline reads before the Coder decides what to build at all.
          </p>
          <ul className="space-y-3 text-[15px] text-theme-muted mb-8">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-theme-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4" />
              </svg>
              Every write compiled before the next agent's read
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-theme-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4" />
              </svg>
              Runs on Postgres, no extra coordination infra
            </li>
          </ul>
          <Button
            href="https://github.com/smaramwbc/statewave-multi-agent-shared-context"
            variant="primary"
            size="lg"
          >
            See the Before/After
          </Button>
        </div>
        <div className="flex justify-center md:justify-end">
          <VisualPanel
            className="w-full flex items-center justify-center rounded-[10px] border border-theme-border px-4 sm:px-8 py-10"
            style={{ maxWidth: "min(560px, 100%)" }}
          >
            <PipelineComparisonCard />
          </VisualPanel>
        </div>
      </div>
    </GridSection>
  );
}

/* ─── Two calls. That's the whole primitive. ─────────────────────────────── */

const PRIMITIVE_FEATURES = [
  { label: "Same two calls in CrewAI, Claude Agent SDK, or a bare loop" },
  { label: "LiteLLM-backed: swap providers freely" },
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
  activeTab: "py" | "cli";
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
        {(["py", "cli"] as const).map((t) => {
          const label = t === "py" ? "Python" : "CLI";
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
          <span style={{ color: "var(--viz-code-text)" }}>statewave_agents.context</span>
          <span style={{ color: "var(--viz-code-muted)" }}> </span>
          <span style={{ color: "var(--viz-code-keyword)" }}>import</span>
          <span style={{ color: "var(--viz-code-muted)" }}> (</span>
        </p>
        <p style={{ margin: 0 }}>
          <span style={{ color: "var(--viz-code-muted)" }}>{"  "}</span>
          <span style={{ color: "var(--viz-indigo)" }}>SharedContext</span>
        </p>
        <p style={{ margin: 0 }}>
          <span style={{ color: "var(--viz-code-muted)" }}>)</span>
        </p>
      </SingleCodeCard>

      {/* CLI card */}
      <SingleCodeCard activeTab="cli">
        <p style={{ margin: 0 }}>
          <span style={{ color: "var(--viz-code-text)" }}>python timeline_inspector.py \</span>
        </p>
        <p style={{ margin: 0 }}>
          <span style={{ color: "var(--viz-code-muted)" }}>{"  "}</span>
          <span style={{ color: "var(--viz-code-text)" }}>--run sw-abc12345</span>
        </p>
      </SingleCodeCard>
    </div>
  );
}

function TwoCallsSection() {
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
              fontSize: "clamp(2rem, 3.5vw, 3rem)",
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
            }}
          >
            Two calls. That's
            <br />
            the whole primitive.
          </h2>
          <p className="text-[16px] text-theme-muted leading-relaxed mb-6">
            before_acting() before any agent decides, decide() after it
            produces output. Wrap them around any framework's agent loop in
            minutes.
          </p>
          <ul className="space-y-2.5 mb-8">
            {PRIMITIVE_FEATURES.map((f) => (
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
    title: "Typed, Ranked Memory",
    body: "Every fact is classified and scored: profile_fact, episode_summary, procedure, so agents always surface the right context.",
  },
  {
    title: "Multi-User by Default",
    body: "Memories are scoped per user and per agent. Run thousands of isolated, personalized sessions in parallel.",
  },
  {
    title: "Token Budget Control",
    body: "Set a hard token ceiling. Statewave surfaces only the highest-signal memories within budget, never exceeds it.",
  },
  {
    title: "Durable Across Sessions",
    body: "Memory persists between restarts and redeployments. Works from the very first message on day one.",
  },
  {
    title: "Full Audit Trail",
    body: "Every cited fact traces back to its source episode. Know exactly what your agent knew and when it learned it.",
  },
  {
    title: "Sub-150ms Recall",
    body: "Memory retrieval fast enough for real-time conversations. No perceptible latency added to your agent responses.",
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
    <GridSection innerClassName="relative">
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
              fontSize: "clamp(1.75rem, 5vw, 4.75rem)",
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            <span className="block" style={{ whiteSpace: "nowrap" }}>
              Give every agent
            </span>
            <span className="block" style={{ whiteSpace: "nowrap" }}>
              the{" "}
              <span
                style={{
                  background:
                    "linear-gradient(90deg, #4f46e5 0%, #60a5fa 50%, #93c5fd 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                same truth
              </span>
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
