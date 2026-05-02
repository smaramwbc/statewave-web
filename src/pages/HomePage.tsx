import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Section } from '../components/Section'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { HeroBackground } from '../components/HeroBackground'
import { usePageSEO } from '../lib/seo'
import { useChatWidget, useTrackDemoCta } from '../lib/widget-context'
import { useRef } from 'react'

export function HomePage() {
  usePageSEO()
  return (
    <>
      <HeroSection />
      <WhatSection />
      <WhyNotSection />
      <UseCasesSection />
      <SupportProofSection />
      <CapabilitiesSection />
      <ProofSection />
      <DeveloperSection />
      <CTASection />
    </>
  )
}

function HeroSection() {
  const { openWidget } = useChatWidget()
  const heroCtaRef = useRef<HTMLButtonElement>(null)
  useTrackDemoCta(heroCtaRef)
  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  }
  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      <HeroBackground />

      {/* Bottom-edge fade — only mask the final ~35% so the section blends
          into the page below without killing the lower particles' colors. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, transparent 65%, var(--theme-surface-0) 100%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-36 pb-24">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="max-w-3xl"
        >
          {/* Badge */}
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-accent/20 bg-accent/[0.04] text-accent text-[11px] font-medium tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-accent/80" />
              Proven in production AI workflows
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="mt-8 text-[3.25rem] md:text-[4.5rem] font-bold text-theme-primary tracking-[-0.025em] leading-[1.05]"
          >
            Trusted context runtime{' '}
            <span className="bg-gradient-to-r from-accent via-brand-400 to-brand-300 bg-clip-text text-transparent">
              for AI systems
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeUp}
            className="mt-6 text-lg md:text-[1.2rem] text-theme-muted max-w-[38rem] leading-[1.7]"
          >
            Durable memory infrastructure for AI agents — structured episodes,
            compiled knowledge, ranked retrieval, and token-efficient context assembly.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
            <button
              ref={heroCtaRef}
              type="button"
              onClick={() => openWidget()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-light transition-all duration-150 shadow-lg shadow-accent/20 hover:shadow-accent/30 hover:-translate-y-px"
            >
              Try the Demo
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <a
              href="https://github.com/smaramwbc/statewave"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium text-theme-secondary hover:text-theme-primary transition-colors duration-150"
            >
              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              View on GitHub
            </a>
          </motion.div>

          {/* Honesty stripe — the demo isn't a mock. Every episode, memory,
              and ranked context bundle the demo shows comes from a real
              running Statewave server. */}
          <motion.div variants={fadeUp} className="mt-5 flex items-center gap-2.5">
            <span
              aria-hidden
              className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.7)] flex-shrink-0"
            />
            <p className="text-xs text-theme-muted">
              <span className="font-semibold text-theme-secondary">Real Statewave instance · live data.</span>{' '}
              <span className="text-theme-muted/80">No mocks — every episode, memory, and ranking is computed live.</span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function WhatSection() {
  return (
    <Section>
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-theme-primary tracking-tight">
            Memory infrastructure for AI agents
          </h2>
          <p className="mt-6 text-theme-muted leading-relaxed">
            Most AI applications have no memory. Every conversation starts from scratch.
            Context is lost between sessions. Statewave treats memory as infrastructure —
            a runtime layer that any AI system can build on.
          </p>
          <div className="mt-8 space-y-4">
            {[
              'Ingest raw events as immutable episodes',
              'Compile typed memories with confidence scores',
              'Retrieve ranked, token-bounded context bundles',
              'Trace every memory to its source with provenance',
              'Organize everything around subjects — users, accounts, agents, repos',
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                <span className="text-sm text-theme-secondary">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="rounded-2xl border border-theme-border bg-surface-1 p-6 font-mono text-sm">
            <div className="flex items-center gap-2 mb-4 text-theme-muted text-xs">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="ml-2">context_bundle.json</span>
            </div>
            <pre className="text-theme-secondary overflow-x-auto"><code>{`{
  "subject_id": "agent-7",
  "task": "Continue code review",
  "facts": [
    "Prefers functional patterns",
    "Project uses TypeScript + Postgres"
  ],
  "token_estimate": 284,
  "provenance": {
    "fact_ids": ["mem-1", "mem-3"],
    "episode_ids": ["ep-12", "ep-19"]
  }
}`}</code></pre>
          </div>
        </div>
      </div>
    </Section>
  )
}

function WhyNotSection() {
  const approaches = [
    {
      title: 'Prompt stuffing',
      problems: ['Blows token budgets', 'No ranking or priority', 'Cost scales linearly with lifetime', 'No provenance'],
    },
    {
      title: 'Naive RAG',
      problems: ['Non-deterministic retrieval', 'No structured extraction', 'No temporal reasoning', 'No confidence scores'],
    },
    {
      title: 'Raw history replay',
      problems: ['Irrelevant noise', 'No memory compilation', 'Arbitrary truncation', 'No subject lifecycle'],
    },
  ]

  return (
    <Section className="bg-surface-1/50">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-theme-primary tracking-tight">
          Why existing approaches fail
        </h2>
        <p className="mt-4 text-theme-muted max-w-2xl mx-auto">
          Bolting on a vector database or dumping chat logs into a prompt creates fragile,
          unstructured context that degrades as it scales.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {approaches.map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl border border-red-500/10 bg-red-500/[0.02]"
          >
            <h3 className="text-base font-semibold text-theme-primary mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {a.title}
            </h3>
            <ul className="space-y-2">
              {a.problems.map((p, j) => (
                <li key={j} className="text-sm text-theme-muted flex items-start gap-2">
                  <span className="text-red-400/60 mt-0.5">—</span>
                  {p}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}

function UseCasesSection() {
  const useCases = [
    {
      title: 'Support agents',
      status: 'Deeply optimized',
      description: 'Session-aware context, resolution tracking, handoff packs, health scoring, SLA monitoring, repeat-issue detection. The first and most proven workflow.',
      badge: 'Primary wedge',
    },
    {
      title: 'Coding agents',
      status: 'Proven',
      description: 'Accumulate project knowledge across sessions — tech stack, architecture decisions, preferences. Your agent builds understanding over time.',
      badge: 'Supported',
    },
    {
      title: 'Internal copilots',
      status: 'Supported',
      description: 'Give internal tools persistent memory of user workflows, past decisions, and organizational context. Every interaction builds on the last.',
      badge: 'Supported',
    },
    {
      title: 'Long-lived agent systems',
      status: 'Supported',
      description: 'Any AI system that operates over time, across sessions, with subjects that have persistent identity. Statewave is the memory layer.',
      badge: 'Supported',
    },
  ]

  return (
    <Section>
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-theme-primary tracking-tight">
          Built for any stateful AI workflow
        </h2>
        <p className="mt-4 text-theme-muted max-w-2xl mx-auto">
          Statewave is infrastructure — not a vertical product. Any AI system that needs to
          remember across sessions can build on it.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {useCases.map((uc, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`p-6 rounded-2xl border bg-surface-1 ${
              i === 0 ? 'border-accent/20 ring-1 ring-accent/10' : 'border-theme-border'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-theme-primary">{uc.title}</h3>
              <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${
                i === 0 ? 'bg-accent/10 text-accent' : 'bg-surface-2 text-theme-muted'
              }`}>
                {uc.badge}
              </span>
            </div>
            <p className="text-sm text-theme-muted leading-relaxed">{uc.description}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}

function SupportProofSection() {
  return (
    <Section className="bg-surface-1/50">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-theme-primary tracking-tight">
          Proven first in support-agent workflows
        </h2>
        <p className="mt-4 text-theme-muted max-w-2xl mx-auto">
          Support agents are the first workflow where Statewave is deeply optimized and
          rigorously evaluated — the clearest proof that structured memory outperforms naive approaches.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card
          title="Session-aware context"
          description="Active sessions boosted, resolved issues deprioritized. Context is ranked by what matters right now."
        />
        <Card
          title="Handoff context packs"
          description="Compact escalation briefs with health, SLA, and issue context — ready for human or AI handoff."
        />
        <Card
          title="Health scoring"
          description="Deterministic 0–100 health scores with explainable factors. Proactive webhook alerts on degradation."
        />
        <Card
          title="Resolution tracking"
          description="Track issue state per session. Surface resolution history when recurring patterns are detected."
        />
        <Card
          title="SLA tracking"
          description="First-response time, resolution time, breach detection. Integrated into health scoring and handoff."
        />
        <Card
          title="Repeat-issue detection"
          description="Automatically surface prior resolutions when recurring problems appear. Stop solving the same issue twice."
        />
      </div>
    </Section>
  )
}

function CapabilitiesSection() {
  const capabilities = [
    { label: 'Append-only episodes', desc: 'Immutable raw truth' },
    { label: 'Pluggable compilers', desc: 'Heuristic or LLM (100+ providers via LiteLLM)' },
    { label: 'Semantic search', desc: 'pgvector cosine similarity + text fallback' },
    { label: 'Token-bounded context', desc: 'Configurable budget, ranked packing' },
    { label: 'Provenance tracing', desc: 'Every memory → source episodes' },
    { label: 'Idempotent compilation', desc: 'Safe recompilation, no duplicates' },
    { label: 'Memory conflict resolution', desc: 'Auto-supersede older overlapping memories' },
    { label: 'Multi-tenant isolation', desc: 'App-layer query scoping per tenant' },
    { label: 'Webhooks', desc: 'Persistent delivery with retry + dead-letter' },
    { label: 'Typed SDKs', desc: 'Python (sync + async) & TypeScript' },
    { label: 'OpenTelemetry', desc: 'Optional distributed tracing' },
    { label: 'Subject deletion', desc: 'GDPR-style erasure by subject' },
  ]

  return (
    <Section>
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-theme-primary tracking-tight">
          Core capabilities
        </h2>
        <p className="mt-4 text-theme-muted max-w-2xl mx-auto">
          Production-ready primitives for any AI system that needs persistent, structured memory.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {capabilities.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.03 }}
            className="p-4 rounded-xl border border-theme-border bg-surface-2/50 hover:border-accent/20 transition-colors"
          >
            <p className="text-sm font-medium text-theme-primary">{c.label}</p>
            <p className="text-xs text-theme-muted mt-1">{c.desc}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}

function ProofSection() {
  const stats = [
    { value: '232', label: 'Unit tests' },
    { value: '54', label: 'Eval assertions' },
    { value: '9/9', label: 'Support workflow score' },
    { value: '2/9', label: 'Naive approach score' },
  ]

  return (
    <Section className="bg-surface-1/50">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-theme-primary tracking-tight">
          Proven, not promised
        </h2>
        <p className="mt-4 text-theme-muted max-w-2xl mx-auto">
          Every claim is backed by automated evals and benchmarks that run in CI.
          Statewave scores 9/9 on support workflow criteria where naive approaches score 2/9.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center p-6 rounded-2xl border border-theme-border bg-surface-1"
          >
            <p className="text-3xl md:text-4xl font-bold text-theme-primary">{s.value}</p>
            <p className="text-sm text-theme-muted mt-2">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-theme-border bg-surface-1 p-8">
        <h3 className="text-lg font-semibold text-theme-primary mb-4">What the evals prove</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-theme-muted">
          {[
            'Identity facts persist across sessions',
            'Relevant preferences surface for matching tasks',
            'Token budgets are always respected',
            'Provenance traces facts to source episodes',
            'Compilation is idempotent — no duplicates',
            'Session-aware ranking boosts active sessions',
            'Repeat-issue detection surfaces prior fixes',
            'Health scoring is deterministic and explainable',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <svg className="w-4 h-4 text-green-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

function DeveloperSection() {
  const [tab, setTab] = React.useState<'python' | 'typescript'>('python')

  const pythonCode = `$ pip install statewave-py

from statewave import StatewaveClient

sw = StatewaveClient("http://localhost:8100")

# One call to get prompt-ready context
ctx = sw.get_context(
    "agent-7",
    task="Continue code review"
)

print(ctx.assembled_context)
# → Ranked, token-bounded, provenance-traced`

  const tsCode = `$ npm install statewave-ts

import { StatewaveClient } from "statewave-ts";

const sw = new StatewaveClient("http://localhost:8100");

// One call to get prompt-ready context
const ctx = await sw.getContext(
  "agent-7",
  { task: "Continue code review" }
);

console.log(ctx.assembledContext);
// → Ranked, token-bounded, provenance-traced`

  return (
    <Section>
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-theme-primary tracking-tight">
            Self-hosted. Framework-neutral.
          </h2>
          <p className="mt-6 text-theme-muted leading-relaxed">
            Run Statewave alongside any AI application. The storage layer is Postgres-only and runs in
            your infrastructure — no Statewave-managed cloud sees your episodes or memories.
          </p>
          <p className="mt-3 text-xs text-theme-muted/80 leading-relaxed">
            What leaves your network depends on the compiler and embedding you configure. The default
            heuristic compiler is fully local; choosing the LLM compiler or a hosted embedding model
            sends content to that provider. <Link to="/product#privacy" className="text-accent hover:underline">See the data-flow breakdown →</Link>
          </p>
          {/* Each bullet links to the most relevant doc / repo. The SDK row
              splits into two inline links so Python and TypeScript each go
              to their own GitHub repo. External links open in a new tab so
              the visitor doesn't lose their place on the homepage. */}
          <ul className="mt-8 space-y-3">
            {(() => {
              const DOCS = 'https://github.com/smaramwbc/statewave-docs/blob/main'
              type Bullet = { node: React.ReactNode }
              const items: Bullet[] = [
                {
                  node: (
                    <a href={`${DOCS}/deployment/guide.md`} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                      Docker Compose — running in 2 minutes
                    </a>
                  ),
                },
                {
                  node: (
                    <a href={`${DOCS}/architecture/compiler-modes.md`} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                      No vendor lock-in — heuristic compiler works without any LLM
                    </a>
                  ),
                },
                {
                  node: (
                    <a href={`${DOCS}/architecture/compiler-modes.md#when-to-choose-llm`} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                      LiteLLM integration — 100+ LLM providers supported
                    </a>
                  ),
                },
                {
                  node: (
                    <a href={`${DOCS}/api/v1-contract.md`} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                      REST API + OpenAPI docs
                    </a>
                  ),
                },
                {
                  node: (
                    <>
                      <a href="https://github.com/smaramwbc/statewave-py" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors underline-offset-2 decoration-dotted decoration-theme-border">
                        Python
                      </a>
                      <span className="text-theme-muted/70">&nbsp;&amp;&nbsp;</span>
                      <a href="https://github.com/smaramwbc/statewave-ts" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors underline-offset-2 decoration-dotted decoration-theme-border">
                        TypeScript
                      </a>
                      <span>&nbsp;SDKs</span>
                    </>
                  ),
                },
                {
                  node: (
                    <a href={`${DOCS}/architecture/overview.md#middleware-stack`} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                      Structured logging + OpenTelemetry
                    </a>
                  ),
                },
              ]
              return items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-theme-secondary">
                  <svg className="w-4 h-4 text-accent mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{item.node}</span>
                </li>
              ))
            })()}
          </ul>
        </div>

        <div className="rounded-2xl border border-theme-border bg-surface-1 p-6 font-mono text-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-theme-muted text-xs">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex gap-1 rounded-lg bg-surface-2 p-0.5">
              <button
                onClick={() => setTab('python')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  tab === 'python'
                    ? 'bg-surface-0 text-theme-primary shadow-sm'
                    : 'text-theme-muted hover:text-theme-secondary'
                }`}
              >
                Python
              </button>
              <button
                onClick={() => setTab('typescript')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  tab === 'typescript'
                    ? 'bg-surface-0 text-theme-primary shadow-sm'
                    : 'text-theme-muted hover:text-theme-secondary'
                }`}
              >
                TypeScript
              </button>
            </div>
          </div>
          <pre className="text-theme-secondary overflow-x-auto"><code>{tab === 'python' ? pythonCode : tsCode}</code></pre>
        </div>
      </div>
    </Section>
  )
}

function CTASection() {
  const { openWidget } = useChatWidget()
  const ctaDemoRef = useRef<HTMLElement>(null)
  useTrackDemoCta(ctaDemoRef)
  return (
    <Section className="bg-surface-1/50">
      <div className="text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-theme-primary tracking-tight">
          Give your AI system memory
        </h2>
        <p className="mt-6 text-lg text-theme-muted max-w-xl mx-auto">
          Start building with Statewave in under 10 minutes.
          Self-hosted, open source, and proven.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button href="https://github.com/smaramwbc/statewave-docs/blob/main/getting-started.md" size="lg">
            Get Started
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Button>
          <Button ref={ctaDemoRef} onClick={() => openWidget()} variant="secondary" size="lg">
            Try Live Demo
          </Button>
          <Button href="https://github.com/smaramwbc/statewave" variant="secondary" size="lg">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </Button>
        </div>
      </div>
    </Section>
  )
}
