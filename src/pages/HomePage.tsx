import React from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Section } from '../components/Section'
import { Button } from '../components/Button'
import { Heading } from '../components/Heading'
import { Card } from '../components/Card'
import { CodeCopyButton } from '../components/CodeCopyButton'
import { HeroBackground } from '../components/HeroBackground'
import { usePageSEO } from '../lib/seo'
import {
  faqPageJsonLd,
  organizationJsonLd,
  softwareApplicationJsonLd,
  websiteJsonLd,
} from '../lib/seo-meta'
import { FAQ_ENTRIES } from '../lib/faq'
import { useChatWidget, useTrackDemoCta, DEMO_SUBJECTS } from '../lib/widget-context-api'
import { useRef, useState, useEffect, useCallback } from 'react'

export function HomePage() {
  // The home page is the canonical landing for Organization, WebSite, and
  // SoftwareApplication structured data — also baked into index.html for
  // crawlers that don't execute JS. The FAQPage JSON-LD is layered on top so
  // answer engines can consume the visible FAQ section directly.
  usePageSEO({
    jsonLd: [
      organizationJsonLd(),
      websiteJsonLd(),
      softwareApplicationJsonLd(),
      faqPageJsonLd(FAQ_ENTRIES),
    ],
    breadcrumb: false,
  })
  return (
    <>
      <HeroSection />
      <WhatSection />
      <WhyNotSection />
      <UseCasesSection />
      <ConnectorsTeaserSection />
      <SupportProofSection />
      <CapabilitiesSection />
      <ProofSection />
      <DeveloperSection />
      <FAQSection />
      <CTASection />
    </>
  )
}

function HeroSection() {
  const { openWidget, availablePersonas } = useChatWidget()
  const heroCtaRef = useRef<HTMLButtonElement>(null)
  useTrackDemoCta(heroCtaRef)

  // Persona menu attached to the "Try the Demo" split button. The main button
  // still launches the default persona in one click; the caret opens this so
  // visitors can pick which agent's memory they want to try first.
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false)
  // The split button lives inside the hero <section>, which is overflow-hidden
  // to clip the full-bleed particle canvas + bottom fade. An absolutely
  // positioned dropdown is a child of that section, so a tall menu gets cut
  // off at the section edge. We render the menu in a portal (escaping the
  // clip) and position it with `fixed` from the trigger's viewport rect.
  const personaMenuRef = useRef<HTMLDivElement>(null) // split-button trigger
  const personaMenuPanelRef = useRef<HTMLDivElement>(null) // portaled panel
  const [menuPos, setMenuPos] = useState<{
    left: number
    top?: number
    bottom?: number
    maxHeight: number
  } | null>(null)

  // Measure the trigger and compute a viewport-anchored position for the
  // portaled panel. Called from the open handler and from scroll/resize while
  // open — never directly inside an effect, so it never reflows during render.
  const placeMenu = useCallback(() => {
    const el = personaMenuRef.current
    if (!el) return
    const MENU_W = 288 // w-72
    const GAP = 8
    const r = el.getBoundingClientRect()
    const spaceBelow = window.innerHeight - r.bottom - GAP
    const spaceAbove = r.top - GAP
    // Prefer dropping down; flip up only when there's clearly more room
    // above. Either way the panel scrolls internally rather than ever
    // exceeding the viewport.
    const openUp = spaceBelow < 260 && spaceAbove > spaceBelow
    const left = Math.max(8, Math.min(r.left, window.innerWidth - MENU_W - 8))
    const maxHeight = Math.max(160, (openUp ? spaceAbove : spaceBelow) - 8)
    setMenuPos(
      openUp
        ? { left, bottom: window.innerHeight - r.top + GAP, maxHeight }
        : { left, top: r.bottom + GAP, maxHeight },
    )
  }, [])

  const togglePersonaMenu = useCallback(() => {
    setPersonaMenuOpen((open) => {
      const next = !open
      if (next) placeMenu()
      return next
    })
  }, [placeMenu])

  // While open: keep the panel glued to the trigger on scroll/resize and
  // close on outside click / Escape. No state is set synchronously here.
  useEffect(() => {
    if (!personaMenuOpen) return
    const onDocMouseDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (
        !personaMenuRef.current?.contains(t) &&
        !personaMenuPanelRef.current?.contains(t)
      ) {
        setPersonaMenuOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPersonaMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    document.addEventListener('keydown', onKey)
    // `true` (capture) so the menu follows even when a scrollable ancestor
    // — not just the window — moves under it.
    window.addEventListener('scroll', placeMenu, true)
    window.addEventListener('resize', placeMenu)
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', placeMenu, true)
      window.removeEventListener('resize', placeMenu)
    }
  }, [personaMenuOpen, placeMenu])

  // Same availability gating the in-widget picker uses: only offer personas
  // the backend actually has memory for; fall back to the full catalog while
  // the check is in flight (null) or if it returned empty.
  const heroPersonas = (() => {
    const filtered =
      availablePersonas && availablePersonas.length > 0
        ? DEMO_SUBJECTS.filter((s) => availablePersonas.includes(s.id))
        : DEMO_SUBJECTS
    return filtered.length > 0 ? filtered : DEMO_SUBJECTS
  })()
  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  }
  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }
  // The h1 is the LCP element on mobile; framer-motion's `initial="hidden"`
  // adds ~1s to render delay before paint. Skip the entrance animation on the
  // headline so it paints with the first frame, and keep the stagger fade-in
  // on the subordinate elements (badge, subhead, CTAs).

  return (
    <section className="relative min-h-[88vh] sm:min-h-[92vh] flex items-center overflow-hidden">
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

      <div className="relative z-10 w-full mx-auto max-w-7xl px-5 sm:px-6 pt-28 sm:pt-32 md:pt-36 pb-16 sm:pb-20 md:pb-24">
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
              Open source · Self-hosted · Apache 2.0
            </span>
          </motion.div>

          {/* Headline — clamps fluidly between 320px and desktop so the
              hero never overflows on small phones (the previous 3.25rem
              floor was wider than 320px after letter-spacing). */}
          <h1 className="mt-6 sm:mt-8 text-[clamp(2.25rem,8vw,4.5rem)] font-bold text-theme-primary tracking-[-0.025em] leading-[1.08] break-anywhere">
            Open-source memory runtime{' '}
            <span className="bg-gradient-to-r from-accent via-brand-400 to-brand-300 bg-clip-text text-transparent">
              for AI agents
            </span>
          </h1>

          {/* Subheadline — once the h1 paints instantly (no motion gate),
              Lighthouse promotes this paragraph to the LCP element on mobile
              because it's the largest remaining text block. Keeping it
              animated re-creates the same 1s+ render delay we just removed.
              Paint immediately; the badge + CTAs still stagger in below. */}
          <p className="mt-5 sm:mt-6 text-base sm:text-lg md:text-[1.2rem] text-theme-muted max-w-[38rem] leading-[1.65] sm:leading-[1.7]">
            Statewave compiles raw events into ranked, token-bounded context
            bundles with full provenance — so your AI stops forgetting across
            sessions. Self-hosted on Postgres, no vendor lock-in.
          </p>

          {/* CTAs — wrap cleanly on small phones; primary stays full-width
              up to 360px so it never collides with the secondary link. */}
          <motion.div variants={fadeUp} className="mt-8 sm:mt-10 flex flex-wrap items-center gap-3 sm:gap-4">
            <div
              ref={personaMenuRef}
              className="relative inline-flex rounded-lg shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-shadow duration-150"
            >
              {/* Main action — one-click launch of the default persona. */}
              <button
                ref={heroCtaRef}
                type="button"
                onClick={() => openWidget()}
                className="inline-flex min-h-11 items-center justify-center gap-2 pl-6 pr-5 py-3 rounded-l-lg bg-accent text-white text-sm font-medium hover:bg-accent-light transition-colors duration-150"
              >
                Try the Demo
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              {/* Caret — opens the persona menu. */}
              <button
                type="button"
                onClick={togglePersonaMenu}
                aria-haspopup="menu"
                aria-expanded={personaMenuOpen}
                aria-label="Choose a demo persona"
                className="inline-flex min-h-11 items-center justify-center px-2.5 rounded-r-lg bg-accent text-white hover:bg-accent-light border-l border-white/20 transition-colors duration-150"
              >
                <svg
                  className={`w-4 h-4 transition-transform duration-150 ${personaMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {personaMenuOpen && menuPos && createPortal(
                <div
                  ref={personaMenuPanelRef}
                  role="menu"
                  data-testid="hero-persona-menu"
                  className="fixed w-72 rounded-lg border border-theme-border bg-surface-1 shadow-xl z-[60] overflow-y-auto overscroll-contain"
                  style={{
                    left: menuPos.left,
                    top: menuPos.top,
                    bottom: menuPos.bottom,
                    maxHeight: menuPos.maxHeight,
                  }}
                >
                  <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-theme-muted border-b border-theme-border/60 sticky top-0 bg-surface-1">
                    Pick a persona to try
                  </div>
                  {heroPersonas.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        openWidget(s.id, s.label)
                        setPersonaMenuOpen(false)
                      }}
                      className="block w-full px-3 py-2.5 text-left hover:bg-accent/10 transition-colors"
                    >
                      <span className="block text-sm font-medium text-theme-primary">{s.label}</span>
                      <span className="block mt-0.5 text-xs text-theme-muted leading-snug">{s.blurb}</span>
                    </button>
                  ))}
                </div>,
                document.body,
              )}
            </div>
            <a
              href="https://github.com/smaramwbc/statewave-docs/blob/main/getting-started.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 px-6 py-3 rounded-lg bg-surface-2 text-theme-primary border border-theme-border text-sm font-medium hover:bg-surface-3 hover:border-theme-border transition-[background-color,border-color] duration-150"
            >
              Getting Started
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href="https://github.com/smaramwbc/statewave"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 px-4 sm:px-5 py-3 rounded-lg text-sm font-medium text-theme-secondary hover:text-theme-primary transition-colors duration-150"
            >
              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              View on GitHub
            </a>
          </motion.div>

          {/* Secondary affordance for visitors who came with a question rather
              than wanting the comparison demo. Opens the widget directly to the
              docs-grounded Statewave Support persona. */}
          <motion.div variants={fadeUp} className="mt-3 text-xs text-theme-muted">
            Have a question?{' '}
            <button
              type="button"
              onClick={() => openWidget('statewave-support', 'Statewave Support', 'support')}
              className="text-theme-secondary hover:text-accent underline-offset-4 hover:underline transition-colors font-medium"
            >
              Ask Statewave Support
            </button>{' '}
            <span className="text-theme-muted/80">— grounded in the official docs, with citations.</span>
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
      <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div className="min-w-0">
          <Heading id="memory-runtime" className="text-3xl md:text-4xl font-bold text-theme-primary tracking-tight">
            Memory runtime for AI agents
          </Heading>
          <p className="mt-6 text-theme-muted leading-relaxed">
            Most AI applications have no memory. Every conversation starts from scratch.
            Context is lost between sessions. Statewave treats memory as a runtime —
            a durable layer any AI system can build on.
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

        <div className="relative min-w-0">
          <div className="rounded-2xl border border-theme-border bg-surface-1 p-5 sm:p-6 font-mono text-sm overflow-hidden">
            <div className="flex items-center gap-2 mb-4 text-theme-muted text-xs">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="ml-2 truncate">context_bundle.json</span>
            </div>
            <pre className="text-theme-secondary overflow-x-auto -mx-1 px-1"><code>{`{
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
        <Heading id="why-existing-approaches-fail" className="text-3xl md:text-4xl font-bold text-theme-primary tracking-tight">
          Why existing approaches fail
        </Heading>
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
        <Heading id="stateful-workflows" className="text-3xl md:text-4xl font-bold text-theme-primary tracking-tight">
          Built for any stateful AI workflow
        </Heading>
        <p className="mt-4 text-theme-muted max-w-2xl mx-auto">
          Statewave is a runtime — not a vertical product. Any AI system that needs to
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

      <div className="mt-10 text-center">
        <Link
          to="/use-cases"
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-accent/25 bg-accent/[0.06] text-accent hover:bg-accent/10 hover:border-accent/40 transition-colors"
        >
          Browse the full map — 80+ ideas to build
          <svg
            className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </Section>
  )
}

function ConnectorsTeaserSection() {
  // Slim teaser — full detail lives at /connectors. Goal: surface "not just
  // live chats" without bloating the home page. Six pills + one CTA.
  // Each card deep-links to where you actually start: available connectors
  // jump straight to their doc; planned ones land on /connectors so visitors
  // can see scope and follow along.
  const DOCS = 'https://github.com/smaramwbc/statewave-docs/blob/main'
  const PACKAGES = 'https://github.com/smaramwbc/statewave-connectors/blob/main/packages'
  const sources: ReadonlyArray<{
    label: string
    shape: string
    status: 'available' | 'planned'
    href: string
    external?: boolean
  }> = [
    { label: 'GitHub', shape: 'Repo memory', status: 'available', href: `${DOCS}/connectors/github.md`, external: true },
    { label: 'Markdown / docs', shape: 'Decision memory', status: 'available', href: `${DOCS}/connectors/markdown.md`, external: true },
    { label: 'MCP', shape: 'Agent memory', status: 'available', href: `${DOCS}/connectors/mcp.md`, external: true },
    { label: 'Slack', shape: 'Team memory', status: 'available', href: `${PACKAGES}/slack/README.md`, external: true },
    { label: 'n8n · Zapier', shape: 'Workflow memory', status: 'available', href: `${PACKAGES}/n8n/README.md`, external: true },
    { label: 'Zendesk', shape: 'Customer memory', status: 'available', href: `${PACKAGES}/zendesk/README.md`, external: true },
  ]

  return (
    <Section>
      <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
        <div className="min-w-0">
          <Heading
            id="connectors"
            className="text-3xl md:text-4xl font-bold text-theme-primary tracking-tight"
          >
            Not just live chats — connect your tools
          </Heading>
          <p className="mt-5 text-theme-muted leading-relaxed">
            Connectors feed real-world events into Statewave as durable episodic memory. Agents
            recall projects, customers, communities, decisions, and workflows — by subject — without
            stuffing raw history into a prompt.
          </p>
          <p className="mt-3 text-sm text-theme-muted/85 leading-relaxed">
            Modular packages — install only what you need. The core stays clean; connectors are
            optional.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/connectors"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-accent/25 bg-accent/[0.06] text-accent hover:bg-accent/10 hover:border-accent/40 transition-colors"
            >
              Explore Statewave Connectors
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a
              href="https://github.com/smaramwbc/statewave-docs/blob/main/connectors/index.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-theme-secondary hover:text-accent transition-colors"
            >
              View connector docs
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5h5v5M19 5l-9 9M5 7v12h12" />
              </svg>
            </a>
          </div>
        </div>

        <div className="min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sources.map((s, i) => {
            const cardClass = 'rounded-xl border border-theme-border bg-surface-1 p-4 flex items-start justify-between gap-3 transition-colors hover:border-accent/30 focus-visible:border-accent/40 focus:outline-none h-full'
            const inner = (
              <>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-accent">
                    {s.shape}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-theme-primary truncate">{s.label}</p>
                </div>
                <span
                  className={`shrink-0 text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    s.status === 'available'
                      ? 'bg-emerald-500/10 text-emerald-300'
                      : 'bg-surface-2 text-theme-muted'
                  }`}
                >
                  {s.status === 'available' ? 'Available' : 'Coming soon'}
                </span>
              </>
            )
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
              >
                {s.external ? (
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cardClass}
                  >
                    {inner}
                  </a>
                ) : (
                  <Link to={s.href} className={cardClass}>
                    {inner}
                  </Link>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </Section>
  )
}

function SupportProofSection() {
  return (
    <Section className="bg-surface-1/50">
      <div className="text-center mb-16">
        <Heading id="support-agent-proof" className="text-3xl md:text-4xl font-bold text-theme-primary tracking-tight">
          Proven first in support-agent workflows
        </Heading>
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
    { label: 'State-assembly receipts', desc: 'Immutable, ULID-addressable audit record per call with byte-level integrity hash' },
    { label: 'Sensitivity labels & policy', desc: 'Per-memory capability tags + declarative YAML policy gates access by caller identity' },
    { label: 'Idempotent compilation', desc: 'Safe recompilation, no duplicates' },
    { label: 'Memory conflict resolution', desc: 'Auto-supersede older overlapping memories' },
    { label: 'Multi-tenant isolation', desc: 'App-layer query scoping per tenant' },
    { label: 'Per-tenant configuration', desc: 'Receipts emission, policy mode (log_only / enforce), caller-identity gate' },
    { label: 'Webhooks', desc: 'Persistent delivery with retry + dead-letter' },
    { label: 'Typed SDKs', desc: 'Python (sync + async) & TypeScript' },
    { label: 'OpenTelemetry', desc: 'Optional distributed tracing' },
    { label: 'Subject deletion', desc: 'GDPR-style erasure by subject' },
  ]

  return (
    <Section>
      <div className="text-center mb-16">
        <Heading id="core-capabilities" className="text-3xl md:text-4xl font-bold text-theme-primary tracking-tight">
          Core capabilities
        </Heading>
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
        <Heading id="proven-not-promised" className="text-3xl md:text-4xl font-bold text-theme-primary tracking-tight">
          Proven, not promised
        </Heading>
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
  // Docker leads — the quickest path to a running Statewave is `docker compose
  // up`. Python / TypeScript tabs are kept for visitors evaluating the SDK
  // story. Default tab is Docker so the panel mirrors the bullet ordering.
  const [tab, setTab] = React.useState<'docker' | 'python' | 'typescript'>('docker')

  // Each tab is broken into copy-able blocks so visitors can grab one command
  // at a time (pull, compose file, start, verify) without selecting text by
  // hand. `display` is what shows in the panel (with `$` prompts for shell
  // lines); `copy` is what's written to the clipboard (no prompt prefix).
  type Block = { label: string; display: string; copy: string }

  const dockerBlocks: Block[] = [
    {
      label: 'Pull image',
      display: '$ docker pull statewavedev/statewave',
      copy: 'docker pull statewavedev/statewave',
    },
    {
      label: 'docker-compose.yml — minimal, runs in 2 minutes',
      display: `services:
  db:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: statewave
      POSTGRES_PASSWORD: statewave
      POSTGRES_DB: statewave
  api:
    image: statewavedev/statewave:latest
    ports: ["8100:8100"]
    environment:
      STATEWAVE_DATABASE_URL: postgresql+asyncpg://statewave:statewave@db:5432/statewave
    depends_on: [db]`,
      copy: `services:
  db:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: statewave
      POSTGRES_PASSWORD: statewave
      POSTGRES_DB: statewave
  api:
    image: statewavedev/statewave:latest
    ports: ["8100:8100"]
    environment:
      STATEWAVE_DATABASE_URL: postgresql+asyncpg://statewave:statewave@db:5432/statewave
    depends_on: [db]
`,
    },
    {
      label: 'Start the stack',
      display: '$ docker compose up -d',
      copy: 'docker compose up -d',
    },
    {
      label: 'Verify it is running',
      display: `$ curl http://localhost:8100/healthz
# → {"status":"ok"}`,
      copy: 'curl http://localhost:8100/healthz',
    },
  ]

  const pythonBlocks: Block[] = [
    {
      label: 'Install',
      display: '$ pip install statewave',
      copy: 'pip install statewave',
    },
    {
      label: 'One call to get prompt-ready context',
      display: `from statewave import StatewaveClient

sw = StatewaveClient("http://localhost:8100")

ctx = sw.get_context(
    "agent-7",
    task="Continue code review"
)

print(ctx.assembled_context)
# → Ranked, token-bounded, provenance-traced`,
      copy: `from statewave import StatewaveClient

sw = StatewaveClient("http://localhost:8100")

ctx = sw.get_context(
    "agent-7",
    task="Continue code review"
)

print(ctx.assembled_context)
`,
    },
  ]

  const tsBlocks: Block[] = [
    {
      label: 'Install',
      display: '$ npm install @statewavedev/sdk',
      copy: 'npm install @statewavedev/sdk',
    },
    {
      label: 'One call to get prompt-ready context',
      display: `import { StatewaveClient } from "@statewavedev/sdk";

const sw = new StatewaveClient("http://localhost:8100");

const ctx = await sw.getContext(
  "agent-7",
  { task: "Continue code review" }
);

console.log(ctx.assembledContext);
// → Ranked, token-bounded, provenance-traced`,
      copy: `import { StatewaveClient } from "@statewavedev/sdk";

const sw = new StatewaveClient("http://localhost:8100");

const ctx = await sw.getContext(
  "agent-7",
  { task: "Continue code review" }
);

console.log(ctx.assembledContext);
`,
    },
  ]

  const blocks = tab === 'docker' ? dockerBlocks : tab === 'python' ? pythonBlocks : tsBlocks

  return (
    <Section>
      <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div className="min-w-0">
          <Heading id="self-hosted" className="text-3xl md:text-4xl font-bold text-theme-primary tracking-tight">
            Self-hosted. Framework-neutral.
          </Heading>
          <p className="mt-6 text-theme-muted leading-relaxed">
            Run Statewave alongside any AI application. The storage layer is Postgres-only and runs in
            your infrastructure — no Statewave-managed cloud sees your episodes or memories.
          </p>
          <p className="mt-3 text-xs text-theme-muted/80 leading-relaxed">
            What leaves your network depends on the compiler and embedding you configure. The default
            heuristic compiler is fully local; choosing the LLM compiler or a hosted embedding model
            sends content to that provider. <Link to="/product#privacy" className="text-accent hover:underline">See the data-flow breakdown →</Link>
          </p>
          {/* Bullets prioritize "how easy is it to run Statewave?" — Docker
              Hub and Compose come first, then the runtime properties, then
              integrations and SDKs. Each links to the most relevant doc /
              registry / repo, opened in a new tab so the visitor doesn't
              lose their place on the homepage. */}
          <ul className="mt-8 space-y-3">
            {(() => {
              const DOCS = 'https://github.com/smaramwbc/statewave-docs/blob/main'
              type Bullet = { node: React.ReactNode }
              const items: Bullet[] = [
                {
                  node: (
                    <a href="https://hub.docker.com/r/statewavedev/statewave" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                      Pre-built image on Docker Hub — multi-arch, signed
                    </a>
                  ),
                },
                {
                  node: (
                    <a href={`${DOCS}/getting-started.md`} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                      One-command quickstart — running in 2 minutes
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
                    <a href={`${DOCS}/architecture/overview.md#middleware-stack`} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                      Structured logging + OpenTelemetry
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

        <div className="min-w-0 rounded-2xl border border-theme-border bg-surface-1 p-5 sm:p-6 font-mono text-sm overflow-hidden">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 text-theme-muted text-xs">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div role="tablist" aria-label="Quickstart" className="flex gap-1 rounded-lg bg-surface-2 p-0.5">
              <button
                role="tab"
                type="button"
                aria-selected={tab === 'docker'}
                onClick={() => setTab('docker')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  tab === 'docker'
                    ? 'bg-surface-0 text-theme-primary shadow-sm'
                    : 'text-theme-muted hover:text-theme-secondary'
                }`}
              >
                Docker
              </button>
              <button
                role="tab"
                type="button"
                aria-selected={tab === 'python'}
                onClick={() => setTab('python')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  tab === 'python'
                    ? 'bg-surface-0 text-theme-primary shadow-sm'
                    : 'text-theme-muted hover:text-theme-secondary'
                }`}
              >
                Python SDK
              </button>
              <button
                role="tab"
                type="button"
                aria-selected={tab === 'typescript'}
                onClick={() => setTab('typescript')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  tab === 'typescript'
                    ? 'bg-surface-0 text-theme-primary shadow-sm'
                    : 'text-theme-muted hover:text-theme-secondary'
                }`}
              >
                TypeScript SDK
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {blocks.map((block) => (
              <div key={block.label} className="rounded-lg border border-theme-border/60 bg-surface-2/40">
                <div className="flex items-center justify-between gap-3 px-3 pt-2 pb-1">
                  <p className="text-[10.5px] font-medium uppercase tracking-wider text-theme-muted/85">
                    {block.label}
                  </p>
                  <CodeCopyButton code={block.copy} label={`Copy: ${block.label}`} />
                </div>
                <pre className="text-theme-secondary overflow-x-auto px-3 pb-3 text-[12.5px] leading-relaxed"><code>{block.display}</code></pre>
              </div>
            ))}
            {tab === 'docker' && (
              <p className="pt-1 text-right text-xs text-theme-muted">
                Building from source?{' '}
                <a
                  href="https://github.com/smaramwbc/statewave"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  See GitHub →
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </Section>
  )
}

function FAQSection() {
  return (
    <Section className="bg-surface-1/50">
      <div className="text-center mb-14">
        <Heading
          id="faq"
          className="text-3xl md:text-4xl font-bold text-theme-primary tracking-tight"
        >
          Frequently asked questions
        </Heading>
        <p className="mt-4 text-theme-muted max-w-2xl mx-auto">
          Honest, technical answers about Statewave, AI agent memory,
          and how it fits with the rest of your stack.
        </p>
      </div>

      {/* Semantic structure: each Q&A is a <details> so it's collapsible by
          keyboard and assistive tech, with the question as a real <h3> inside
          <summary> (valid per HTML spec — summary accepts one heading) and
          the answer as a paragraph in the disclosure body. The visible HTML
          is the same content the FAQPage JSON-LD emits, so search and
          answer engines see one source of truth. */}
      <div className="mx-auto max-w-3xl divide-y divide-theme-border rounded-2xl border border-theme-border bg-surface-1">
        {FAQ_ENTRIES.map((entry, i) => (
          <details
            key={entry.question}
            className="group p-6 [&_summary::-webkit-details-marker]:hidden"
            // First item open by default so the section reads as content,
            // not a wall of collapsed accordions, on first paint.
            {...(i === 0 ? { open: true } : {})}
          >
            <summary className="flex cursor-pointer items-start justify-between gap-4 text-left">
              <h3 className="text-base md:text-lg font-semibold text-theme-primary leading-snug">
                {entry.question}
              </h3>
              <svg
                className="mt-1 h-5 w-5 shrink-0 text-theme-muted transition-transform duration-200 group-open:rotate-180"
                aria-hidden
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </summary>
            <p className="mt-3 text-sm md:text-[15px] text-theme-muted leading-[1.7]">
              {entry.answer}
            </p>
            {entry.links && entry.links.length > 0 && (
              <FaqLinks links={entry.links} />
            )}
          </details>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-theme-muted">
        More questions? Read the{' '}
        <a
          href="https://github.com/smaramwbc/statewave-docs"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          docs
        </a>
        , browse the{' '}
        <Link to="/use-cases" className="text-accent hover:underline">
          use cases
        </Link>
        , or open an{' '}
        <a
          href="https://github.com/smaramwbc/statewave/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          issue on GitHub
        </a>
        .
      </p>
    </Section>
  )
}

/* FAQ follow-up links.
 *
 * Internal targets — anything starting with "/" or "#" — render as same-tab
 * navigation (React Router for routes, plain anchor for in-page hashes) so the
 * visitor stays on the site. Everything else (GitHub docs, mailto, etc.) opens
 * in a new tab with rel="noopener noreferrer". */
type FaqLink = { label: string; href: string }

function FaqLinks({ links }: { links: ReadonlyArray<FaqLink> }) {
  return (
    <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
      {links.map((link) => (
        <li key={link.href}>
          <FaqLinkAnchor link={link} />
        </li>
      ))}
    </ul>
  )
}

function FaqLinkAnchor({ link }: { link: FaqLink }) {
  const { label, href } = link
  const className =
    'inline-flex items-center gap-1 font-medium text-accent hover:text-accent-light hover:underline underline-offset-4 transition-colors'

  if (href.startsWith('/')) {
    return (
      <Link to={href} className={className}>
        {label}
        <ArrowRightIcon />
      </Link>
    )
  }
  if (href.startsWith('#')) {
    return (
      <a href={href} className={className}>
        {label}
        <ArrowRightIcon />
      </a>
    )
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {label}
      <ExternalIcon />
    </a>
  )
}

function ArrowRightIcon() {
  return (
    <svg
      className="w-3 h-3"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7l5 5m0 0l-5 5m5-5H6"
      />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg
      className="w-3 h-3"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14 5h5v5M19 5l-9 9M5 7v12h12"
      />
    </svg>
  )
}

function CTASection() {
  const { openWidget } = useChatWidget()
  const ctaDemoRef = useRef<HTMLElement>(null)
  useTrackDemoCta(ctaDemoRef)
  return (
    <Section>
      <div className="text-center">
        <Heading id="give-ai-memory" className="text-3xl md:text-5xl font-bold text-theme-primary tracking-tight">
          Give your AI system memory
        </Heading>
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
