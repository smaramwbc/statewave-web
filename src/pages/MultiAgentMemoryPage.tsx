import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Button } from "../components/Button";

const PAGE_RAIL_CLASS =
  "mx-auto max-w-[1488px] px-5 sm:px-10 md:px-16 xl:px-[94px]"
  + " border-b xl:border-l xl:border-r"
  + " [border-color:rgba(230,230,230,0.36)]";

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

/* ─── Hero ───────────────────────────────────────────────────────────────── */

function HeroSection() {
  return (
    <section className="relative bg-surface-1 overflow-hidden">
      {/* Inner content — pt clears navbar (64px) + Figma top padding (41px). No border-b so no grid line appears between hero and CostSection. */}
      <div
        className="mx-auto max-w-[1488px] px-5 sm:px-10 md:px-16 xl:px-[94px] xl:border-l xl:border-r [border-color:rgba(230,230,230,0.36)] relative pt-[105px] pb-10 text-center xl:pb-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Breadcrumb — Figma design: "Use Cases / [Multi Agent Memory ↓]" */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Link
              to="/use-cases"
              className="text-[14px] transition-colors"
              style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Inter, sans-serif" }}
            >
              Use Cases
            </Link>
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>/</span>
            {/* Pill dropdown — bg rgba(255,255,255,0.07), border rgba(255,255,255,0.13) */}
            <div
              className="inline-flex items-center gap-1.5 rounded-[8px]"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.13)",
                padding: "4px 10px 4px 12px",
              }}
            >
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#fff",
                  whiteSpace: "nowrap",
                }}
              >
                Multi Agent Memory
              </span>
              {/* Chevron down */}
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path
                  d="M2.5 4L5.5 7L8.5 4"
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Heading — Fustat 82px/600, letter-spacing -4.51px, lh 83.64px */}
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
            Three Agents
            <br />
            One{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg, #4F46E5 0%, #60A5FA 50%, #93C5FD 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Shared Memory
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-base text-theme-muted max-w-sm mx-auto leading-relaxed">
            Agents work better when they actually know who they're helping,
            every session, every time.
          </p>

          <div className="mt-8">
            <a
              href="https://github.com/smaramwbc/statewave-multi-agent-memory"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                width: "182.16px",
                height: "50px",
                padding: "15px 30.336px 16px 32px",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "8px",
                background: "#FFF",
                fontFamily: "Fustat, Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                color: "#0a0a0f",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Get Started Free
            </a>
          </div>
        </motion.div>

        {/* Hero image */}
        <div className="mt-12">
          <img
            src="/hero-multi-agent-memory.png"
            alt="Multi-agent memory demo"
            className="w-full rounded-t-2xl"
            style={{
              border: "1px solid rgba(230,230,230,0.36)",
              borderBottom: "none",
            }}
          />
        </div>
      </div>
    </section>
  );
}

/* ─── Cost of Stateless Agents ───────────────────────────────────────────── */

const COST_ITEMS = [
  {
    title: "Every Session Starts Cold",
    body: "Each agent starts from its own prompt context. What one agent decided is invisible to others unless explicitly passed as a message — and message passing breaks when agents run in parallel.",
  },
  {
    title: "No Follow-Through on Tasks",
    body: "Agents run in isolation. If a Planner deprecates a module, the Coder never sees it and rebuilds from scratch. Conflict detection happens after both agents have already finished their work.",
  },
  {
    title: "Token Budgets Overflow",
    body: "Passing each agent's full output to the next as a prompt input fills context windows fast. A research agent running for 10 minutes produces more text than most models can receive.",
  },
];

function CostSection() {
  return (
    <GridSection innerClassName="relative py-20 sm:py-24 xl:py-28">
      {/* "Problems" pill */}
      <div className="flex justify-center mb-8 xl:mb-10">
        <span
          className="px-4 py-2 text-sm font-medium text-theme-primary"
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
          }}
        >
          Problems
        </span>
      </div>

      {/* Section heading */}
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
        The Cost Of Stateless AI Agents
      </h2>

      {/* 3-column card grid */}
      <div className="grid gap-4 sm:grid-cols-3 xl:gap-7">
        {COST_ITEMS.map((item) => (
          <div
            key={item.title}
            className="flex flex-col justify-between p-8 sm:p-10 xl:p-12"
            style={{
              border: "1px solid rgb(39,39,42)",
              borderRadius: "10px",
              background: "transparent",
              minHeight: "clamp(300px, 22vw, 420px)",
            }}
          >
            {/* Top: circle-X icon + title */}
            <div>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="mb-6">
                <circle cx="14" cy="14" r="13" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
                <path
                  d="M9.5 9.5L18.5 18.5M18.5 9.5L9.5 18.5"
                  stroke="rgba(255,255,255,0.55)"
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
            {/* Bottom: muted body text */}
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
    body: "Agents append raw events to one shared subject. Episodes are content-hashed and immutable. The full provenance trail lives in the log.",
    Visual: EpisodeVisual,
  },
  {
    title: "Ingest. Compile. Use.",
    body: "Three endpoints handle the loop. Compile is idempotent. Run it again and again on the same subject. Same query, same bytes.",
    Visual: EndpointVisual,
  },
  {
    title: "Works Across Multiple Agents",
    body: "Any agent in a pipeline reads and writes the same shared memory, with zero reruns on resume.",
    Visual: AgentMergeVisual,
  },
  {
    title: "Personalizes at Scale",
    body: "Adapts responses to the individual's stack, history, and goals, not just the question asked.",
    Visual: ContextVisual,
  },
];

function EpisodeVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[318px] text-[11px] text-white/70">
      <SessionBlock
        tone="blue"
        label="Current Session"
        time="Session 2 · Jan 15, 10:05 AM"
        agent="Last time you mentioned preferring Python and an open auth-token model — pick up where you left off?"
        user="Yes please. Thanks for remembering!"
      />
      <div className="h-4" />
      <SessionBlock
        tone="gray"
        label="Previous Session"
        time="Session 1 · Jan 4, 9:30 AM"
        agent="I only work in Python — and there’s this auth-token recall I’m trying to fix."
        tags={["Python", "Auth-token: open"]}
      />
    </div>
  );
}

function SessionBlock({
  tone,
  label,
  time,
  agent,
  user,
  tags,
}: {
  tone: "blue" | "gray";
  label: string;
  time: string;
  agent: string;
  user?: string;
  tags?: string[];
}) {
  const isBlue = tone === "blue";
  return (
    <div
      className={`rounded-[5px] border p-2.5 shadow-[0_10px_28px_rgba(0,0,0,0.26)] ${
        isBlue
          ? "border-[#3d65ff] bg-[#213a9f]"
          : "border-white/10 bg-[#2d2d31]"
      }`}
    >
      <div
        className={`mb-2 inline-flex rounded-[3px] border px-1.5 py-0.5 text-[7px] ${
          isBlue
            ? "border-white/15 bg-[#2e52d7] text-white/80"
            : "border-white/10 bg-white/5 text-white/60"
        }`}
      >
        {label}
      </div>
      <p className="mb-2 text-[12px] font-medium text-white/90">{time}</p>
      <p
        className={`rounded-[4px] px-2 py-1.5 leading-relaxed ${
          isBlue
            ? "bg-[#2847b5] text-white/75"
            : "bg-white/[0.035] text-white/55"
        }`}
      >
        {agent}
      </p>
      {user ? (
        <p className="mt-2 text-right text-white/70">{user}</p>
      ) : (
        <div className="mt-2 flex gap-1.5">
          {tags?.map((tag) => (
            <span
              key={tag}
              className="rounded-[3px] border border-white/10 bg-white/[0.035] px-1.5 py-0.5 text-[7px] text-white/55"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function EndpointVisual() {
  const steps = [
    {
      label: "step 1",
      title: "POST /v1/episodes",
      body: "Raw, content-hashed events from Bloomberg, TechCrunch, Earnings.",
    },
    {
      label: "step 2",
      title: "POST /v1/memories/compile",
      body: "Episodes become typed memories with confidence and provenance. No GPU. No vector DB.",
      active: true,
    },
    {
      label: "step 3",
      title: "POST /v1/context",
      body: "Ranked, token-bounded bundle. Active memories only.",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-100 space-y-3 text-[13px]">
      {steps.map((step) => (
        <div
          key={step.label}
          className="grid grid-cols-[58px_1fr] items-center gap-3"
        >
          <div className="flex items-center justify-end gap-1.5 text-[11px] text-white/35">
            <span className="h-2 w-2 rounded-full border border-white/25" />
            {step.label}
          </div>
          <div
            className={`rounded-[6px] border p-3 ${
              step.active
                ? "border-[#4b69ff] bg-[#1d43b7]"
                : "border-white/[0.08] bg-[#18181b]"
            }`}
          >
            <p className="font-semibold text-white">{step.title}</p>
            <p className="mt-1 leading-relaxed text-white/55">{step.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function AgentMergeVisual() {
  return (
    <div className="mx-auto w-full max-w-95 text-[12px]">
      <div className="mb-3 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2">
        <AgentPill title="Bloomberg" value="3.5% (stale)" />
        <span className="text-white/25">+</span>
        <AgentPill title="TechCrunch" value="2.9% (fresh)" active />
        <span className="text-white/25">→</span>
        <AgentPill title="supersede" value="auto" blue />
      </div>
      <div className="rounded-[5px] border border-[#4b69ff] bg-[#203eaa] px-3 py-2 text-center font-mono text-[10px] text-white">
        ○ jaccard 0.78 ≥ 0.6 threshold
      </div>
      <p className="mt-4 font-mono text-[10px] leading-relaxed text-white/35">
        mem_01 (Bloomberg) overlaps mem_02 (TechCrunch) compiler marks mem_01{" "}
        <span className="text-[#f2d16b]">SUPERSEDED</span> provenance + p_03,
        p_06
      </p>
    </div>
  );
}

function AgentPill({
  title,
  value,
  active = false,
  blue = false,
}: {
  title: string;
  value: string;
  active?: boolean;
  blue?: boolean;
}) {
  return (
    <div
      className={`min-h-[58px] rounded-[6px] border px-3 py-2 text-center ${
        blue ? "border-[#4b69ff] bg-[#213a9f]" : "border-[#33342e] bg-[#20211e]"
      }`}
    >
      <p className="font-semibold text-white">{title}</p>
      <p
        className={`mt-1 font-mono ${active ? "text-[#10e3b3]" : "text-white/55"}`}
      >
        {value}
      </p>
    </div>
  );
}

function ContextVisual() {
  return (
    <div className="mx-auto w-full max-w-[420px] text-[12px]">
      <div className="mb-3 rounded-[5px] border border-white/10 bg-white/[0.035] px-3 py-2 text-white/70">
        ⌕ &nbsp; What is Stripe's current processing fee?
      </div>
      <MemoryRow
        title="Bloomberg · 3.5% +35c"
        note="never returned by /v1/context"
        badge="SUPERSEDED"
      />
      <MemoryRow
        title="TechCrunch · 2.9% + 30c"
        note="corroborated by Earnings (p_07)"
        badge="ACTIVE"
        active
      />
      <div className="mt-1.5 rounded-[5px] border border-[#4b69ff] bg-[#203eaa] px-3 py-2.5">
        <div className="flex justify-between gap-3">
          <p className="font-semibold text-white">synthesis answer</p>
          <p className="font-mono text-white/55">1.2k tok</p>
        </div>
        <p className="mt-1 text-white/65">
          "Stripe charges 2.9% + 30c per transaction."
        </p>
      </div>
    </div>
  );
}

function MemoryRow({
  title,
  note,
  badge,
  active = false,
}: {
  title: string;
  note: string;
  badge: string;
  active?: boolean;
}) {
  return (
    <div className="mb-1.5 rounded-[5px] border border-white/10 bg-[#28282c] px-3 py-2">
      <div className="flex items-start justify-between gap-3">
        <p
          className={`${active ? "text-white" : "text-white/45 line-through"}`}
        >
          {title}
        </p>
        <span
          className={`text-[7px] ${active ? "text-[#10e3b3]" : "text-[#f2d16b]"}`}
        >
          {badge}
        </span>
      </div>
      <p className="mt-1 text-white/35">{note}</p>
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
            <div className="flex min-h-[380px] items-center justify-center px-8 py-10 sm:min-h-[440px]" style={{ background: "#212025" }}>
              <card.Visual />
            </div>
            <div className="px-7 py-7 sm:px-8" style={{ background: "#18181b" }}>
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

/* ─── Shared memory layer rows ───────────────────────────────────────────── */

const PIPELINE_ROWS_DATA = [
  {
    label: "Three agents. One memory. Conflicts resolved automatically.",
    body: "The Planner, Coder, and Reviewer all write to and read from the same Statewave subject. A decision written by any agent is immediately available to every other agent before they act — without any explicit message passing.",
    Visual: SharedTimelineVisual,
  },
  {
    label: "Answers from active memory only.",
    body: "Context bundles are ranked and token-bounded. Each agent receives only the memories most relevant to its task — not the full episode log. High-signal facts surface first; low-signal filler is dropped.",
    Visual: ActiveContextVisual,
  },
  {
    label: "Kill any agent mid-run. The pipeline doesn't restart.",
    body: "Each agent's work is durably persisted as episodes the moment it's written. If the Writer is killed mid-run, the Researcher and Critic do not re-run — the Writer picks up from the last compiled context and completes its work.",
    Visual: ResumeRunVisual,
  },
];

/* Visual 1: Three agent boxes cascading diagonally with curved dashed connectors */
function SharedTimelineVisual() {
  const agents = [
    {
      name: "Bloomberg Agent",
      lines: [
        "Reads market data,",
        "extracts price signals",
        "→ POST/v1/episodes",
      ],
      top: 0,
      left: 0,
    },
    {
      name: "TechCrunch Agent",
      lines: ["Reads news feed,", "extracts headlines", "POST/v1/episodes"],
      top: 88,
      left: 80,
    },
    {
      name: "Earnings Agent",
      lines: [
        "Reads financials,",
        "extracts EPS/revenue",
        "→ POST/v1/episodes",
      ],
      top: 176,
      left: 160,
    },
  ];
  return (
    <div
      className="relative mx-auto w-full select-none"
      style={{ height: 310, maxWidth: 400 }}
    >
      {/* SVG curved dashed connectors between boxes */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width="400"
        height="310"
        style={{ zIndex: 1 }}
      >
        {/* Box 1 bottom-right → Box 2 top-left */}
        <path
          d="M 190,44 C 220,44 240,88 240,88"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        {/* Box 2 bottom-right → Box 3 top-left */}
        <path
          d="M 270,132 C 300,132 320,176 320,176"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      </svg>
      {agents.map((a, i) => (
        <div
          key={a.name}
          className="absolute overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          style={{
            top: a.top,
            left: a.left,
            width: 190,
            borderRadius: 6,
            zIndex: 4 - i,
          }}
        >
          {/* Blue header */}
          <div style={{ background: "#3b5bdb", padding: "7px 12px" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
              {a.name}
            </p>
          </div>
          {/* Dark body */}
          <div
            style={{
              background: "#1c1d26",
              border: "1px solid #3b5bdb",
              borderTop: "none",
              padding: "8px 12px 10px",
            }}
          >
            {a.lines.map((l) => (
              <p
                key={l}
                style={{
                  fontSize: 12,
                  lineHeight: 1.65,
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {l}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* Visual 2: Active context panel — blue body, dark superseded footer */
function ActiveContextVisual() {
  return (
    <div
      className="mx-auto w-full overflow-hidden font-mono"
      style={{
        maxWidth: 380,
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {/* Blue main panel */}
      <div style={{ background: "#1e3a8a", padding: "14px 16px 16px" }}>
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "#93c5fd",
            }}
          >
            ACTIVE CONTEXT
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
            8 FACTS · ~905 TOK
          </span>
        </div>

        {/* Subject */}
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#fff",
            marginBottom: 12,
          }}
        >
          market-intel · /v1/context
        </p>

        {/* USER label + query bubble */}
        <p
          style={{
            fontSize: 11,
            letterSpacing: "0.08em",
            color: "rgba(255,255,255,0.45)",
            marginBottom: 6,
          }}
        >
          USER
        </p>
        <div className="flex justify-end mb-3">
          <div
            style={{
              background: "#2563eb",
              borderRadius: 5,
              padding: "6px 12px",
              fontSize: 12,
              color: "#fff",
            }}
          >
            What is Stripe's current pricing?
          </div>
        </div>

        {/* SYNTHESIS label + answer */}
        <p
          style={{
            fontSize: 11,
            letterSpacing: "0.08em",
            color: "rgba(255,255,255,0.45)",
            marginBottom: 6,
          }}
        >
          SYNTHESIS
        </p>
        <div
          style={{
            background: "rgba(255,255,255,0.07)",
            borderRadius: 5,
            padding: "8px 12px",
            fontSize: 12,
            lineHeight: 1.55,
            color: "rgba(255,255,255,0.85)",
          }}
        >
          Stripe charges{" "}
          <span style={{ fontWeight: 700, color: "#fff" }}>2.9% + 30¢</span> per
          transaction. Cited TechCrunch &amp; Earnings.
        </div>
      </div>

      {/* SUPERSEDED footer — darker */}
      <div
        style={{
          background: "#162d6e",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          padding: "10px 16px 12px",
        }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span
            style={{
              fontSize: 10,
              letterSpacing: "0.06em",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            SUPERSEDED · NEVER RETURNED
          </span>
          <span
            style={{
              fontSize: 10,
              letterSpacing: "0.06em",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            RETIRED BY COMPILER
          </span>
        </div>
        <p
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.25)",
            textDecoration: "line-through",
            marginBottom: 8,
          }}
        >
          Bloomberg — Stripe · 3.5% + 35¢
        </p>
        <div className="flex items-center gap-2">
          <span
            style={{
              fontSize: 11,
              color: "#f2d16b",
              border: "1px solid rgba(242,209,107,0.35)",
              background: "rgba(242,209,107,0.08)",
              borderRadius: 4,
              padding: "2px 7px",
            }}
          >
            superseded
          </span>
          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              borderRadius: 4,
              padding: "2px 7px",
            }}
          >
            jaccard 0.78
          </span>
        </div>
      </div>
    </div>
  );
}

/* Visual 3: Pipeline timeline — ○ T+Xs left col, T+9s blue card */
function ResumeRunVisual() {
  const events = [
    {
      time: "T+0s",
      label: "Pipeline started",
      body: "Three agents launch concurrently against subject market-intel.",
      highlight: false,
    },
    {
      time: "T+9s",
      label: "Earnings killed (^C)",
      body: "Bloomberg + TechCrunch findings already compiled into memory. Cached.",
      highlight: true,
    },
    {
      time: "T+11s",
      label: "Earnings resumed",
      body: "Reads cached context from /v1/timeline. Zero reruns on upstream agents.",
      highlight: false,
    },
  ];
  return (
    <div className="mx-auto w-full" style={{ maxWidth: 420 }}>
      <div className="space-y-3">
        {events.map((e) => (
          <div key={e.time} className="flex items-start gap-4">
            {/* Left: circle + time stacked */}
            <div
              className="shrink-0 flex flex-col items-center gap-1 pt-1"
              style={{ width: 44 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle
                  cx="8"
                  cy="8"
                  r="7"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="1"
                />
              </svg>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "rgba(255,255,255,0.35)",
                  whiteSpace: "nowrap",
                }}
              >
                {e.time}
              </span>
            </div>
            {/* Right: card */}
            <div
              className="flex-1"
              style={{
                borderRadius: 6,
                padding: "12px 16px",
                background: e.highlight ? "#2a3fa8" : "#18191f",
                border: e.highlight
                  ? "1px solid #3b5bdb"
                  : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#fff",
                  marginBottom: 4,
                }}
              >
                {e.label}
              </p>
              <p
                style={{
                  fontSize: 12,
                  lineHeight: 1.55,
                  color: e.highlight
                    ? "rgba(255,255,255,0.8)"
                    : "rgba(255,255,255,0.45)",
                }}
              >
                {e.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PipelineSection() {
  return (
    <GridSection innerClassName="py-28 sm:py-36">
      <div className="mx-auto mb-14 max-w-2xl text-center sm:mb-20">
        <span className="inline-flex rounded-[6px] border border-theme-border px-4 py-2 text-sm font-medium text-theme-muted">
          Reference Builds
        </span>
        <h2
          className="mt-5 leading-[1.05] tracking-[-0.03em] text-theme-primary"
          style={{
            fontFamily: "Fustat, Inter, sans-serif",
            fontSize: "clamp(2.25rem, 4vw, 3.75rem)",
            fontWeight: 500,
          }}
        >
          A shared memory layer for
          <br />
          multi-agent pipelines
        </h2>
      </div>
      <div className="mx-auto max-w-[1100px] space-y-5">
        {PIPELINE_ROWS_DATA.map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-[12px] border border-theme-border md:grid md:min-h-[400px] md:grid-cols-[1fr_1.1fr]"
          >
            <div className="flex flex-col justify-center border-b border-theme-border p-10 md:border-b-0 md:border-r md:p-14" style={{ background: "#18181b" }}>
              <h3 className="max-w-[340px] text-[22px] font-semibold leading-[1.12] tracking-[-0.02em] text-theme-primary sm:text-[26px]">
                {row.label}
              </h3>
              <p className="mt-5 max-w-[360px] text-[15px] leading-relaxed text-theme-muted">
                {row.body}
              </p>
            </div>
            <div className="flex min-h-[320px] items-center justify-center px-8 py-10 md:min-h-0 md:px-12" style={{ background: "#212025" }}>
              <row.Visual />
            </div>
          </motion.div>
        ))}
      </div>
    </GridSection>
  );
}


/* ─── Wrong fact never reaches the LLM ──────────────────────────────────── */

function ContextBundleCard() {
  return (
    <div
      style={{
        background: "#141414",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 14,
        padding: "28px",
        width: "100%",
        maxWidth: 480,
        position: "relative",
      }}
    >
      {/* Top section — Paste-everything prompt */}
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          paddingBottom: 28,
          marginBottom: 28,
        }}
      >
        <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 16 }}>
          Paste-everything prompt
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>tokens to LLM</span>
          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.36)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 4,
              padding: "2px 7px",
            }}
          >
            4000/session
          </span>
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: 6,
            height: 12,
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              background: "#ef4444",
              borderRadius: 6,
              height: "100%",
              width: "88%",
            }}
          />
        </div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.36)" }}>
          Both Stripe rates included. LLM guesses which is fresh.
        </p>
      </div>

      {/* Bottom section — Statewave context bundle */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          {/* Small statewave icon */}
          <svg width="13" height="12" viewBox="0 0 13 12" fill="none">
            <circle cx="6.5" cy="6" r="5" stroke="#818cf8" strokeWidth="1.5" />
            <circle cx="6.5" cy="6" r="2" fill="#818cf8" />
          </svg>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Statewave context bundle</p>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Token Used (Avg)</span>
          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.36)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 4,
              padding: "2px 7px",
            }}
          >
            800/session
          </span>
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: 6,
            height: 12,
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              background: "#818cf8",
              borderRadius: 6,
              height: "100%",
              width: "22%",
            }}
          />
        </div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.36)", marginBottom: 16 }}>
          Only active memories. Bloomberg's stale rate never makes it in.
        </p>
        {/* Memory Connected badge */}
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
          <span style={{ color: "#34d399", fontSize: 8 }}>●</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: "#34d399" }}>Memory Connected</span>
        </div>
      </div>
    </div>
  );
}

function WrongFactSection() {
  return (
    <GridSection innerClassName="py-28 sm:py-36">
      <div className="grid md:grid-cols-2 gap-16 xl:gap-24 items-center">
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
            The wrong fact never
            <br />
            reaches the LLM
          </h2>
          <p className="text-[16px] text-theme-muted leading-relaxed mb-5">
            Statewave's compiler retires stale memories before they hit the
            prompt. Tokens drop. Accuracy goes up.
          </p>
          <ul className="space-y-3 text-[15px] text-theme-muted mb-8">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-theme-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4" />
              </svg>
              Only active memories returned by /v1/context
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-theme-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4" />
              </svg>
              Token ceiling enforced before recall
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-theme-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4" />
              </svg>
              No GPU. No vector database. No merge logic.
            </li>
          </ul>
          <Button
            href="https://github.com/smaramwbc/statewave-docs/blob/main/getting-started.md"
            variant="white"
            size="lg"
          >
            Get Started
          </Button>
        </div>
        <div className="flex justify-center md:justify-end">
          <div
            className="w-full flex items-center justify-center rounded-[10px] border border-theme-border px-8 py-10"
            style={{ background: "#212025", maxWidth: 560 }}
          >
            <ContextBundleCard />
          </div>
        </div>
      </div>
    </GridSection>
  );
}

/* ─── Three endpoints ────────────────────────────────────────────────────── */

const ENDPOINT_FEATURES = [
  { label: "Sub-150ms latency for real-time experiences" },
  { label: "SOC-2 and HIPAA compliant with secure storage" },
  { label: "Compatible with various tools." },
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
  activeTab: "js" | "py";
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#141414",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 12,
        overflow: "hidden",
        width: "100%",
      }}
    >
      {/* Tab bar */}
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
        }}
      >
        {(["js", "py"] as const).map((t) => {
          const label = t === "js" ? "JavaScript" : "Python";
          const active = activeTab === t;
          return (
            <div
              key={t}
              style={{
                padding: "10px 16px",
                ...MONO,
                color: active ? "#fff" : "rgba(255,255,255,0.36)",
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
        maxWidth: 420,
      }}
    >
      {/* JS card — JavaScript tab active */}
      <SingleCodeCard activeTab="js">
        <p style={{ margin: 0 }}>
          <span style={{ color: "#818cf8" }}>import</span>
          <span style={{ color: "#8b949e" }}> </span>
          <span style={{ color: "#e2e8f0" }}>StateClient</span>
          <span style={{ color: "#8b949e" }}> </span>
          <span style={{ color: "#818cf8" }}>from</span>
          <span style={{ color: "#8b949e" }}> </span>
          <span style={{ color: "#f9a8d4" }}>'@statewave/sdk'</span>
          <span style={{ color: "#8b949e" }}>;</span>
        </p>
        <p style={{ margin: 0 }}>
          <span style={{ color: "#818cf8" }}>const</span>
          <span style={{ color: "#8b949e" }}> </span>
          <span style={{ color: "#e2e8f0" }}>client</span>
          <span style={{ color: "#8b949e" }}> = </span>
          <span style={{ color: "#818cf8" }}>new</span>
          <span style={{ color: "#8b949e" }}> </span>
          <span style={{ color: "#e2e8f0" }}>StateClient</span>
          <span style={{ color: "#8b949e" }}>{"({ "}</span>
          <span style={{ color: "#fbbf24" }}>apiKey</span>
          <span style={{ color: "#8b949e" }}>:</span>
        </p>
        <p style={{ margin: 0 }}>
          <span style={{ color: "#8b949e" }}>{"  "}</span>
          <span style={{ color: "#f9a8d4" }}>'your-api-key'</span>
          <span style={{ color: "#8b949e" }}>{" });"}</span>
        </p>
      </SingleCodeCard>

      {/* Python card — Python tab active */}
      <SingleCodeCard activeTab="py">
        <p style={{ margin: 0 }}>
          <span style={{ color: "#818cf8" }}>import</span>
          <span style={{ color: "#8b949e" }}> </span>
          <span style={{ color: "#e2e8f0" }}>os</span>
        </p>
        <p style={{ margin: 0 }}>
          <span style={{ color: "#818cf8" }}>from</span>
          <span style={{ color: "#8b949e" }}> </span>
          <span style={{ color: "#e2e8f0" }}>statewave</span>
          <span style={{ color: "#8b949e" }}> </span>
          <span style={{ color: "#818cf8" }}>import</span>
          <span style={{ color: "#8b949e" }}> </span>
          <span style={{ color: "#e2e8f0" }}>StateClient</span>
        </p>
        <p style={{ margin: 0 }}>&nbsp;</p>
        <p style={{ margin: 0 }}>
          <span style={{ color: "#e2e8f0" }}>os</span>
          <span style={{ color: "#8b949e" }}>.</span>
          <span style={{ color: "#fbbf24" }}>environ</span>
          <span style={{ color: "#8b949e" }}>[</span>
          <span style={{ color: "#f9a8d4" }}>"STATEWAVE_API_KEY"</span>
          <span style={{ color: "#8b949e" }}>]{" = "}</span>
          <span style={{ color: "#f9a8d4" }}>"your-api-key"</span>
        </p>
        <p style={{ margin: 0 }}>&nbsp;</p>
        <p style={{ margin: 0 }}>
          <span style={{ color: "#e2e8f0" }}>client</span>
          <span style={{ color: "#8b949e" }}>{" = "}</span>
          <span style={{ color: "#818cf8" }}>StateClient</span>
          <span style={{ color: "#8b949e" }}>()</span>
        </p>
      </SingleCodeCard>
    </div>
  );
}

function ThreeEndpointsSection() {
  return (
    <GridSection innerClassName="py-28 sm:py-36">
      <div className="grid md:grid-cols-2 gap-16 xl:gap-24 items-center">
        <div className="flex justify-center md:justify-start">
          <div
            className="w-full flex items-center justify-center rounded-[10px] border border-theme-border px-8 py-10"
            style={{ background: "#212025", maxWidth: 560 }}
          >
            <CodeCardsStack />
          </div>
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
            Three endpoints
            <br />
            That's the whole API
          </h2>
          <p className="text-[16px] text-theme-muted leading-relaxed mb-6">
            Statewave works with your current stack, drop it in and start
            shipping persistent agents.
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
            variant="white"
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
    body: "Every memory has a type, confidence score, and provenance. Conflicts are auto-resolved; superseded memories are never surfaced again.",
  },
  {
    title: "Multi-User by Default",
    body: "Subjects isolate memory per tenant, user, or run. One Statewave instance scales to thousands of concurrent agents with zero cross-contamination.",
  },
  {
    title: "Token Budget Control",
    body: "Set max_tokens on every context call. The ranked bundle always fits — highest-signal memories first, filler dropped before the LLM sees it.",
  },
  {
    title: "Durable Across Sessions",
    body: "Episodes are immutable and append-only. Restart the pipeline, resume mid-run, or replay a failed agent — the shared state is always intact.",
  },
  {
    title: "Full Audit Trail",
    body: "Every episode carries caller_id and a timestamp. The complete decision chain is reconstructable via GET /v1/timeline for any run.",
  },
  {
    title: "Sub-50ms Recall",
    body: "Compiled memories are pre-ranked and stored for instant retrieval. Context assembly is a single read — not a vector search at inference time.",
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
      style={{ flexShrink: 0 }}
    >
      <circle cx="10" cy="10" r="9" stroke="#111827" strokeWidth="1.5" />
      <path
        d="M6.5 10.5L8.5 12.5L13.5 7.5"
        stroke="#111827"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FeatureGridSection() {
  return (
    <section className="relative bg-white">
      <div
        className="mx-auto max-w-[1488px]"
        style={{ padding: "100px clamp(20px, 8vw, 160px)" }}
      >
        {/* Header */}
        <div className="text-center mb-14">
          <span
            className="inline-flex rounded-[6px] px-3.5 py-1.5 text-[13px] font-medium"
            style={{ border: "1px solid rgba(0,0,0,0.12)", color: "#374151" }}
          >
            Why Statewave
          </span>
          <h2
            className="mt-4 text-[#111827] tracking-tight"
            style={{
              fontFamily: "Fustat, Inter, sans-serif",
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Purpose-Built Memory Layer
            <br />
            for AI Agents
          </h2>
        </div>

        {/* 3-col grid — padding: 22px 15.67px 24.5px 16px per Figma */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURE_GRID.map((f) => (
            <div
              key={f.title}
              style={{
                border: "1px solid rgba(0,0,0,0.08)",
                background: "#F5F5F5",
                borderRadius: 10,
                padding: "22px 16px 24px 16px",
              }}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <CircleCheck />
                <h3
                  className="text-[15px] font-semibold text-[#111827] leading-snug"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {f.title}
                </h3>
              </div>
              <p className="text-[13px] leading-relaxed" style={{ color: "#6b7280" }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA footer ─────────────────────────────────────────────────────────── */

function CTASection() {
  return (
    <section className="relative bg-surface-1">
      <div
        className="mx-auto max-w-[1488px] px-5 sm:px-10 md:px-16 xl:px-[94px]"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: "clamp(72px, 8vw, 120px)",
          paddingBottom: "clamp(80px, 9vw, 140px)",
        }}
      >
        <div className="text-center" style={{ maxWidth: 720 }}>
          <h2
            style={{
              fontFamily: "Fustat, Inter, sans-serif",
              fontSize: "clamp(2rem, 6vw, 5.5rem)",
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            <span style={{ color: "#fff", display: "block" }}>Give your AI</span>
            <span
              style={{
                display: "block",
                whiteSpace: "nowrap",
                background: "linear-gradient(90deg, #4f46e5 0%, #60a5fa 50%, #93c5fd 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              system memory
            </span>
          </h2>

          <p
            style={{
              marginTop: 20,
              fontSize: 15,
              lineHeight: 1.5,
              color: "rgba(157,163,175,0.7)",
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
            }}
          >
            Instant memory for LLMs for better, cheaper, personal.
          </p>

          <div
            style={{
              marginTop: 36,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <Button
              href="https://github.com/smaramwbc/statewave-docs/blob/main/getting-started.md"
              variant="white"
              size="lg"
            >
              Get Started
            </Button>
            <Button to="/pricing" variant="dark" size="lg">
              Pricing
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export function MultiAgentMemoryPage() {
  return (
    <div className="bg-surface-1 font-fustat-headings">
      {/*
        The relative wrapper is the content div itself — so absolute children
        span its full height. Two 1px divs for left/right grid lines.
        Positioned at calc(50% - 600px): 144px inside 1488px centered container.
        Only at xl (≥1280px) where there's room outside the content rail.
      */}
      <div>
        <HeroSection />
        <CostSection />
        <MemoryMergingSection />
        <PipelineSection />
        <WrongFactSection />
        <ThreeEndpointsSection />
        <FeatureGridSection />
        <CTASection />
      </div>
    </div>
  );
}
