import React, { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Section } from '../components/Section'
import { Button } from '../components/Button'
import { Heading } from '../components/Heading'
import { Card } from '../components/Card'
import { ClientOnly } from '../components/ClientOnly'
import { CodeCopyButton } from '../components/CodeCopyButton'
import {
  UserRound,
  Code,
  MessageSquareMore,
  Clock3,
} from 'lucide-react'

// HeroBackground is a ~1100-line canvas component that is suppressed on
// viewports ≤ 639px (see useIsHeroCanvasSuppressed inside the component).
// We lazy-load it AND gate the mount on the same media query at this level,
// so mobile visitors never download the chunk at all — shrinking the entry
// bundle on the slowest connections, which is exactly where the LCP h1 was
// stalling. On desktop the canvas appears a few hundred ms after first
// paint; it's a background, so the brief delay is invisible.
const HeroBackground = lazy(() =>
  import('../components/HeroBackground').then((m) => ({ default: m.HeroBackground })),
)
import { usePageSEO } from '../lib/seo'
import { faqPageJsonLd, softwareApplicationJsonLd } from '../lib/seo-meta'
import { FAQ_ENTRIES } from '../lib/faq'
import { PROOF_STATS } from '../lib/proof-stats'
import { useChatWidget, useTrackDemoCta } from '../lib/widget-context-api'
import { useRef, useState, useEffect } from 'react'

export function HomePage() {
  // Organization and WebSite are the only site-wide entities baked into
  // index.html (static, on every route) — so they're not re-emitted here.
  // SoftwareApplication and FAQPage belong specifically to the homepage, not
  // to /blog or /about, so they're emitted here on the `/` route only rather
  // than statically. The FAQPage uses the full FAQ_ENTRIES list, matching the
  // visible FAQ section so answer engines can consume it directly.
  usePageSEO({
    jsonLd: [softwareApplicationJsonLd(), faqPageJsonLd(FAQ_ENTRIES)],
    breadcrumb: false,
  })
  // Only the HeroSection is prerendered into dist/index.html — everything
  // else lives behind ClientOnly so the SSR payload stays small (the
  // browser parses less DOM before first paint). Hydration is clean
  // because server and the first client render both emit null for the
  // wrapped subtree; an effect on mount expands it.
  return (
    <>
      <HeroSection />
      <ClientOnly>
        <WhatSection />
        <WhyNotSection />
        <UseCasesSection />
        <AIClientsSection />
        <GovernanceSection />
        <ConnectorsTeaserSection />
        <SupportProofSection />
        <CapabilitiesSection />
        <ProofSection />
        <DeveloperSection />
        <FAQSection />
        <CTASection />
      </ClientOnly>
    </>
  )
}

function HeroSection() {
  const { openWidget } = useChatWidget()
  const heroCtaRef = useRef<HTMLButtonElement>(null)
  useTrackDemoCta(heroCtaRef)
  const contentZoneRef = useRef<HTMLDivElement>(null)

  // Mirror the matchMedia check inside HeroBackground so we decide whether to
  // even mount the lazy chunk. Two-pass pattern: the initial state must be
  // `false` on both SSR and the first client render so React's hydration
  // sees the same tree shape on both sides — otherwise the
  // `{showHeroCanvas && <HeroBackground />}` branch differs and triggers
  // React error #418 (hydration mismatch at the conditional subtree). After
  // hydration, the effect below flips the flag on desktop and the canvas
  // mounts via a normal post-mount re-render. Brief desktop flash of "no
  // background" is invisible because HeroBackground is decorative and the
  // hero content paints from the prerendered HTML regardless.
  const [showHeroCanvas, setShowHeroCanvas] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 639px)')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowHeroCanvas(!mq.matches)
    const handler = (e: MediaQueryListEvent) => setShowHeroCanvas(!e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

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
      {showHeroCanvas && (
        <Suspense fallback={null}>
          <HeroBackground contentZoneRef={contentZoneRef} />
        </Suspense>
      )}

      {/* Depth layers — add visual weight so the centered content doesn't
          float on flat (especially near-white light-theme) space. Both are
          decorative + behind the content, and fade out toward the edges. */}
      {/* 1. Soft accent glow behind the headline. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(42rem 28rem at 50% 32%, rgba(99, 102, 241, 0.10), transparent 70%)',
        }}
      />
      {/* 2. Masked dot-grid texture (denser in the centre, fades at edges). */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(var(--theme-hero-dot) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage:
            'radial-gradient(ellipse 65% 55% at 50% 38%, #000 38%, transparent 78%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 65% 55% at 50% 38%, #000 38%, transparent 78%)',
        }}
      />

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
          ref={contentZoneRef}
          variants={stagger}
          initial="hidden"
          animate="show"
          onMouseMove={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="max-w-3xl mx-auto text-center"
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
            AI memory built{' '}
            <span className="bg-gradient-to-r from-accent via-brand-400 to-brand-300 bg-clip-text text-transparent">
              for production
            </span>
          </h1>

          {/* Subheadline — once the h1 paints instantly (no motion gate),
              Lighthouse promotes this paragraph to the LCP element on mobile
              because it's the largest remaining text block. Keeping it
              animated re-creates the same 1s+ render delay we just removed.
              Paint immediately; the badge + CTAs still stagger in below. */}
          <p className="mt-5 sm:mt-6 text-base sm:text-lg md:text-[1.2rem] text-theme-muted max-w-[38rem] mx-auto leading-[1.65] sm:leading-[1.7]">
            Policies, sensitivity labels, and tamper-evident audit receipts —
            not just retrieval. Every memory traces to its source. Governance
            built in from day one.
          </p>

          {/* Credibility chips — proof numbers above the fold so visitors
              see them without scrolling to ProofSection. */}
          <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {PROOF_STATS.map((s) => {
              // Purposeful colour, not rainbow: the 8/8 win reads positive,
              // the 2/8 naive baseline reads negative (that's the comparison),
              // the raw counts stay neutral.
              const tone = /naive/i.test(s.label)
                ? 'naive'
                : /support workflow/i.test(s.label)
                  ? 'win'
                  : 'neutral'
              // Tint only the chip (background + border); keep the text at the
              // normal primary/muted colours so it stays readable.
              const chip = {
                neutral: 'border-theme-border bg-surface-2',
                win: 'border-emerald-500/30 bg-emerald-500/10',
                naive: 'border-red-500/25 bg-red-500/[0.08]',
              }[tone]
              return (
                <span
                  key={s.label}
                  className={`inline-flex items-baseline gap-1.5 rounded-full border px-3 py-1 ${chip}`}
                >
                  <span className="text-sm font-semibold text-theme-primary">{s.value}</span>
                  <span className="text-xs text-theme-muted">{s.label}</span>
                </span>
              )
            })}
          </motion.div>

          {/* Install command — primary CTA. */}
          <motion.div variants={fadeUp} className="mt-7 sm:mt-9">
            <HeroInstallCommand centered />
            <p className="mx-auto mt-3 max-w-[34rem] text-sm text-theme-muted leading-relaxed">
              One command boots Statewave locally — API, admin console, and
              Postgres — and wires it into your MCP clients. No account, runs
              offline.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              ref={heroCtaRef}
              type="button"
              onClick={() => openWidget('support-agent', 'Support Agent')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium shadow-lg shadow-accent/20 hover:bg-accent-light hover:shadow-accent/30 transition-[background-color,box-shadow] duration-150"
            >
              Try the agent demo
              <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <a
              href="https://github.com/smaramwbc/statewave"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface-2 text-theme-primary border border-theme-border text-sm font-medium hover:bg-surface-3 hover:border-theme-border transition-[background-color,border-color] duration-150"
            >
              <svg className="w-[15px] h-[15px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              View on GitHub
            </a>
          </motion.div>

        </motion.div>
      </div>
    </section>
  )
}

const INSTALL_NPX = 'npx @statewavedev/statewave'
const INSTALL_UNIX = 'curl -fsSL https://www.statewave.ai/install | sh'
const INSTALL_WIN = 'powershell -Command "irm https://www.statewave.ai/install.ps1 | iex"'

type InstallTab = 'node' | 'unix' | 'windows'

const INSTALL_TABS: { id: InstallTab; label: string; cmd: string; prompt: string }[] = [
  { id: 'node', label: 'Node', cmd: INSTALL_NPX, prompt: '$' },
  { id: 'unix', label: 'macOS / Linux', cmd: INSTALL_UNIX, prompt: '$' },
  { id: 'windows', label: 'Windows', cmd: INSTALL_WIN, prompt: '>' },
]

function HeroInstallCommand({ centered = false }: { centered?: boolean }) {
  const [tab, setTab] = useState<InstallTab>(() =>
    typeof navigator !== 'undefined' && /Win/i.test(navigator.userAgent) ? 'windows' : 'node'
  )
  const active = INSTALL_TABS.find((t) => t.id === tab)!
  return (
    <div>
      {/* Tab strip — the command pill is inline-flex, so it centers under a
          text-center parent on its own; the flex rows need justify-center. */}
      <div className={`flex gap-1 mb-1.5 ${centered ? 'justify-center' : ''}`}>
        {INSTALL_TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={[
              'px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors',
              tab === id
                ? 'bg-accent/10 text-accent'
                : 'text-theme-muted hover:text-theme-secondary',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Command pill */}
      <div className="inline-flex items-center gap-2 rounded-lg border border-theme-border/70 bg-surface-2/70 backdrop-blur-sm px-3.5 py-2 font-mono text-xs sm:text-sm max-w-full">
        <span className="select-none text-accent/70 shrink-0">{active.prompt}</span>
        <code className="overflow-x-auto whitespace-nowrap text-theme-secondary">{active.cmd}</code>
        <CodeCopyButton code={active.cmd} label="Copy install command" />
      </div>

      {/* Docs link — "no account / offline" already covered by the context
          line above, so no trust chips here. */}
      <div className={`mt-2 text-[11px] text-theme-muted ${centered ? 'text-center' : ''}`}>
        <Link to="/developers" className="hover:text-accent transition-colors underline-offset-2 hover:underline">
          Full guide →
        </Link>
      </div>
    </div>
  )
}

function WhatSection() {
  return (
    <Section>
      <div className="grid lg:grid-cols-[0.38fr_0.62fr] gap-12 xl:gap-20 items-center">
        <div className="min-w-0">
          <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            THE STATEWAVE APPROACH
          </div>

          <Heading
            id="memory-runtime"
            className="font-heading text-4xl md:text-[49px] font-bold leading-[1.06] tracking-[-0.03em] text-theme-primary"
          >
            Memory runtime for <span className="text-gradient-brand">AI agents</span>
          </Heading>

          <p className="mt-6 max-w-[600px] text-[20px] leading-[1.65] text-theme-primary">
            Most AI applications have no memory. Every conversation starts from scratch.
            Context is lost between sessions. Statewave treats memory as a runtime —
            a durable layer any AI system can build on.
          </p>

          <div className="mt-8 space-y-3">
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
                className="flex items-center gap-4"
              >
                <span className="h-px w-4 shrink-0 bg-accent/70" />
                <span className="text-sm text-theme-primary leading-7">
                  {item}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative lg:-mr-32 xl:-mr-48 2xl:-mr-64">
          <div
            className="absolute inset-0 rounded-3xl bg-accent/20 blur-[80px] scale-95"
            aria-hidden="true"
          />

          <div className="diagram-card relative z-10 overflow-hidden rounded-3xl border border-theme-border">
            <img
              src="/memory-runtime-flow.svg"
              alt="Memory runtime flow"
              className="block w-full h-auto"
            />
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
        <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
          WHY EXISTING APPROACHES FAIL
        </div>

        <Heading
          id="why-existing-approaches-fail"
          className="font-heading text-4xl md:text-[52px] font-bold leading-[1.06] tracking-[-0.03em] text-theme-primary"
        >
          Most <span className="text-gradient-brand">AI memory</span> systems fall short
        </Heading>

        <p className="mt-6 text-[18px] leading-relaxed text-theme-secondary max-w-3xl mx-auto">
          Bolting on a vector database or dumping chat logs into a prompt creates fragile,
          unstructured context that degrades as it scales.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {approaches.map((a, i) => {
          const icons = [
            '/icons/icon-prompt-stuffing.svg',
            '/icons/icon-naive-rag.svg',
            '/icons/icon-raw-history.svg',
          ]

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-[2rem] border border-brand-500/25 bg-surface-1/45 p-10 shadow-[0_24px_80px_rgba(0,0,0,.16)]"
            >
              <div className="flex items-start gap-8">
                <img
                  src={icons[i]}
                  alt=""
                  aria-hidden="true"
                  className="h-14 w-14 shrink-0"
                />

                <div className="min-w-0">
                  <h3 className="font-heading text-[28px] font-bold leading-tight text-theme-primary mb-6">
                    {a.title}
                  </h3>

                  <ul className="space-y-3">
                    {a.problems.map((p, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-4 text-[16px] text-theme-secondary"
                      >
                        <span className="mt-[0.8em] h-px w-3 shrink-0 bg-red-500/80" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-10 rounded-[2rem] border border-brand-500/25 bg-surface-1/45 p-8 shadow-[0_24px_80px_rgba(0,0,0,.16)]">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
          <img
            src="/icons/icon-statewave-layers.svg"
            alt=""
            aria-hidden="true"
            className="h-20 w-20 shrink-0"
          />

          <p className="max-w-[340px] text-[20px] leading-relaxed text-theme-secondary">
            Statewave builds{' '}
            <span className="text-cyan-400">durable</span>,{' '}
            <span className="text-brand-400">ranked</span>, and{' '}
            <span className="text-gradient-brand">structured</span> memory.
          </p>
        </div>
      </div>
    </Section>
  )
}

function UseCasesSection() {
  const useCases = [
    {
      title: 'Support agents',
      description:
        'Session-aware context, resolution tracking, handoff packs, health scoring, SLA monitoring, repeat-issue detection. The first and most proven workflow.',
      badge: 'Primary wedge',
      Icon: UserRound,
      iconClass: 'border-accent/35 text-accent',
    },
    {
      title: 'Coding agents',
      description:
        'Accumulate project knowledge across sessions — tech stack, architecture decisions, preferences. Your agent builds understanding over time.',
      badge: 'Supported',
      Icon: Code,
      iconClass: 'border-brand-500/35 text-brand-500',
    },
    {
      title: 'Internal copilots',
      description:
        'Give internal tools persistent memory of user workflows, past decisions, and organizational context. Every interaction builds on the last.',
      badge: 'Supported',
      Icon: MessageSquareMore,
      iconClass: 'border-brand-500/35 text-brand-500',
    },
    {
      title: 'Long-lived agent systems',
      description:
        'Any AI system that operates over time, across sessions, with subjects that have persistent identity. Statewave is the memory layer.',
      badge: 'Supported',
      Icon: Clock3,
      iconClass: 'border-[#C68CFF]/45 text-[#D8CCFF]',
    },

  ]

  return (
    <Section>
      <div className="text-center mb-16">
        <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
          BUILT FOR ANY STATEFUL AI WORKFLOW
        </div>

        <Heading
          id="stateful-workflows"
          className="font-heading text-4xl md:text-[52px] font-bold leading-[1.06] tracking-[-0.03em] text-theme-primary"
        >
          Stateful memory for every kind of{' '}
          <span className="text-gradient-brand">AI agent</span>
        </Heading>

        <p className="mt-6 text-[18px] leading-relaxed text-theme-secondary max-w-3xl mx-auto">
          Statewave is a runtime — not a vertical product. Any AI system that needs
          to remember across sessions can build on it.
        </p>
      </div>

      <div className="grid lg:grid-cols-[0.38fr_0.62fr] gap-12 xl:gap-20 items-center">
        <div className="relative lg:-ml-24 xl:-ml-40">
          <div
            className="absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(122,92,255,0.45)_0%,rgba(122,92,255,0.22)_28%,rgba(122,92,255,0.08)_55%,transparent_75%)] blur-2xl"
            aria-hidden="true"
          />

          <img
            src="/stateful-workflows-map.svg"
            alt="Statewave workflow map"
            className="relative z-10 block w-full h-auto"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {useCases.map((uc, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-[2rem] border border-brand-500/25 bg-surface-1/45 p-8 shadow-[0_24px_80px_rgba(0,0,0,.16)]"
            >
              <div className="flex items-start gap-5 mb-6">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border ${uc.iconClass}`}
                >
                  <uc.Icon
                    className="h-6 w-6"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="font-heading text-[22px] font-bold leading-tight text-theme-primary">
                    {uc.title}
                  </h3>

                  <span
                    className={`mt-2 inline-flex text-[11px] font-semibold uppercase tracking-[0.14em] ${i === 0 ? 'text-accent' : 'text-theme-muted'
                      }`}
                  >
                    {uc.badge}
                  </span>
                </div>
              </div>

              <p className="text-[15px] leading-7 text-theme-secondary">
                {uc.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-10 flex justify-end lg:w-[62%] lg:ml-auto">
        <Link
          to="/use-cases"
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border border-accent/25 bg-accent/[0.06] text-accent hover:bg-accent/10 hover:border-accent/40 transition-colors"
        >
          Browse the full map — 80+ ideas to build
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </Section>
  )
}

function AIClientsSection() {
  const connectors = [
    {
      name: 'GitHub',
      type: 'Repo memory',
      logo: '/connectors/GitHub_Invertocat_Black_Clearspace.svg',
    },
    {
      name: 'Slack',
      type: 'Team memory',
      logo: '/connectors/Slack_icon_2019.svg',
    },
    {
      name: 'Zapier',
      type: 'Workflow memory',
      logo: '/connectors/zapier.svg',
    },
    {
      name: 'n8n',
      type: 'Workflow memory',
      logo: '/connectors/n8n_pink+white_logo.svg',
    },
    {
      name: 'Zendesk',
      type: 'Customer memory',
      logo: '/connectors/zendesk-1.svg',
    },
    {
      name: 'MCP',
      type: 'Agent memory',
      logo: '/connectors/Model_Context_Protocol_logo.svg',
    },
    {
      name: 'Markdown',
      type: 'Decision memory',
      logo: '/connectors/markdown-svgrepo-com.svg',
    },
    {
      name: 'Docs',
      type: 'Decision memory',
      logo: '/connectors/Docs-icon.svg',
    },
  ]

  return (
    <Section>
      <div className="grid lg:grid-cols-[0.46fr_0.54fr] gap-12 xl:gap-20 items-center">
        <div>
          <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            CONNECTORS & INTEGRATIONS
          </div>

          <Heading
            id="ai-clients"
            className="font-heading text-4xl md:text-[52px] font-bold leading-[1.08] tracking-[-0.03em] text-theme-primary"
          >
            Not just live chats — <br />
            <span className="text-gradient-brand">connect your tools</span>
          </Heading>

          <p className="mt-6 max-w-[680px] text-[20px] leading-[1.65] text-theme-secondary">
            Connectors feed real-world events into Statewave as durable episodic memory.
            Agents recall projects, customers, communities, decisions, and workflows —
            by subject — without stuffing raw history into a prompt.
          </p>

          <p className="mt-6 text-[15px] leading-7 text-theme-secondary">
            Modular packages — install only what you need. The core stays clean;
            connectors are optional.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/connectors"
              className="inline-flex items-center rounded-full border border-brand-500/35 bg-brand-500/10 px-6 py-3 text-sm font-medium text-brand-300 hover:bg-brand-500/16 hover:border-brand-500/50 transition-colors"
            >
              Explore Statewave Connectors
            </Link>

            <Link
              to="/developers"
              className="inline-flex items-center rounded-full border border-theme-primary/40 bg-transparent px-6 py-3 text-sm font-medium text-theme-primary hover:bg-surface-1/30 hover:border-theme-primary/35 transition-colors"
            >
              View connector docs
            </Link>
          </div>
        </div>

        <div className="relative">
          <div
            className="absolute inset-0 rounded-full bg-accent/20 blur-[100px] scale-90"
            aria-hidden="true"
          />

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-5">
            {connectors.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-brand-500/25 bg-surface-1/45 p-6 shadow-[0_24px_80px_rgba(0,0,0,.16)]"
              >
                <img
                  src={item.logo}
                  alt=""
                  aria-hidden="true"
                  className={`mb-7 object-contain ${item.name === 'n8n' ? 'h-9 w-12' : 'h-9 w-9'
                    }`}
                />

                <h3 className="font-heading text-[20px] font-bold leading-tight text-theme-primary">
                  {item.name}
                </h3>

                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-500">
                  {item.type}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}

function GovernanceSection() {
  const workflowSteps = [
    {
      number: '01',
      title: 'Session-aware context',
      desc: 'Active sessions boosted, resolved issues deprioritized. Context is ranked by what matters right now.',
      color: 'text-cyan-400 border-cyan-400 bg-cyan-400',
    },
    {
      number: '02',
      title: 'Handoff context packs',
      desc: 'Compact escalation briefs with health, SLA, and issue context — ready for human or AI handoff.',
      color: 'text-brand-500 border-brand-500 bg-brand-500',
    },
    {
      number: '03',
      title: 'Health scoring',
      desc: 'Deterministic 0–100 health scores with explainable factors. Proactive webhook alerts on degradation.',
      color: 'text-cyan-400 border-cyan-400 bg-cyan-400',
    },
    {
      number: '04',
      title: 'Resolution tracking',
      desc: 'Track issue state per session. Surface resolution history when recurring patterns are detected.',
      color: 'text-accent border-accent bg-accent',
    },
    {
      number: '05',
      title: 'SLA tracking',
      desc: 'First-response time, resolution time, breach detection. Integrated into health scoring and handoff.',
      color: 'text-brand-500 border-brand-500 bg-brand-500',
    },
    {
      number: '06',
      title: 'Repeat-issue detection',
      desc: 'Automatically surface prior resolutions when recurring problems appear. Stop solving the same issue twice.',
      color: 'text-cyan-400 border-cyan-400 bg-cyan-400',
    },
  ]

  return (
    <Section>
      <div className="text-center mb-16">
        <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
          SUPPORT AGENT WORKFLOW
        </div>

        <Heading
          id="production-governance"
          className="font-heading text-4xl md:text-[52px] font-bold leading-[1.06] tracking-[-0.03em] text-theme-primary"
        >
          Proven first in{' '}
          <span className="text-gradient-brand">support-agent</span> workflows
        </Heading>

        <p className="mt-6 text-[18px] leading-relaxed text-theme-secondary max-w-3xl mx-auto">
          Support agents are the first workflow where Statewave is deeply optimized and
          rigorously evaluated — the clearest proof that structured memory outperforms
          naive approaches.
        </p>
      </div>

      <div className="mx-auto max-w-[1040px] rounded-[2rem] border border-brand-500/25 bg-surface-1/45 p-10 md:p-14 shadow-[0_24px_80px_rgba(0,0,0,.16)]">
        <div className="grid lg:grid-cols-[0.42fr_0.58fr] gap-12 xl:gap-16 items-center">
          <div className="relative flex min-h-[420px] items-center justify-center">
            <div
              className="absolute h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgba(122,92,255,0.32)_0%,rgba(122,92,255,0.16)_35%,transparent_72%)] blur-2xl"
              aria-hidden="true"
            />

            <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-2 border-cyan-400/80 shadow-[0_0_80px_rgba(122,92,255,.28)]">
              <div className="absolute inset-0 rounded-full border-2 border-brand-500/60 [clip-path:inset(0_0_0_50%)]" />

              <img
                src="/icons/icon-memory-governance.svg"
                alt=""
                aria-hidden="true"
                className="relative z-10 h-20 w-20 object-contain"
              />
            </div>
          </div>

          <div className="relative">
            <div
              className="absolute left-[18px] top-4 bottom-4 w-px bg-gradient-to-b from-cyan-400 via-brand-500 to-cyan-400"
              aria-hidden="true"
            />

            <div className="space-y-10">
              {workflowSteps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="relative grid grid-cols-[38px_40px_1fr] gap-5"
                >
                  <div
                    className={`relative z-10 mt-1 h-9 w-9 rounded-full border-2 ${step.color.split(' ')[1]} bg-surface-1 flex items-center justify-center`}
                  >
                    <span
                      className={`h-5 w-5 rounded-full ${step.color.split(' ')[2]}`}
                    />
                  </div>

                  <div className={`pt-1.5 text-sm font-medium ${step.color.split(' ')[0]}`}>
                    {step.number}
                  </div>

                  <div>
                    <h3 className="font-heading text-[22px] font-bold leading-tight text-theme-primary">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-7 text-theme-secondary">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

function ConnectorsTeaserSection() {
  const DOCS = 'https://github.com/smaramwbc/statewave-docs/blob/main'
  const PACKAGES = 'https://github.com/smaramwbc/statewave-connectors/blob/main/packages'

  const connectors = [
    {
      name: 'GitHub',
      type: 'Repo memory',
      logo: '/connectors/GitHub_Invertocat_Black_Clearspace.svg',
      href: `${DOCS}/connectors/github.md`,
    },
    {
      name: 'Slack',
      type: 'Team memory',
      logo: '/connectors/Slack_icon_2019.svg',
      href: `${PACKAGES}/slack/README.md`,
    },
    {
      name: 'Zapier',
      type: 'Workflow memory',
      logo: '/connectors/zapier.svg',
      href: `${PACKAGES}/zapier/README.md`,
    },
    {
      name: 'n8n',
      type: 'Workflow memory',
      logo: '/connectors/n8n_pink+white_logo.svg',
      href: `${PACKAGES}/n8n/README.md`,
    },
    {
      name: 'Zendesk',
      type: 'Customer memory',
      logo: '/connectors/zendesk-1.svg',
      href: `${PACKAGES}/zendesk/README.md`,
    },
    {
      name: 'MCP',
      type: 'Agent memory',
      logo: '/connectors/Model_Context_Protocol_logo.svg',
      href: `${DOCS}/connectors/mcp.md`,
    },
    {
      name: 'Markdown',
      type: 'Decision memory',
      logo: '/connectors/markdown-svgrepo-com.svg',
      href: `${DOCS}/connectors/markdown.md`,
    },
    {
      name: 'Docs',
      type: 'Decision memory',
      logo: '/connectors/Docs-icon.svg',
      href: `${DOCS}/connectors/markdown.md`,
    },
  ]

  return (
    <Section>
      <div className="grid lg:grid-cols-[0.46fr_0.54fr] gap-12 xl:gap-20 items-center">
        <div>
          <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            CONNECTORS & INTEGRATIONS
          </div>

          <Heading
            id="ai-clients"
            className="font-heading text-4xl md:text-[52px] font-bold leading-[1.08] tracking-[-0.03em] text-theme-primary"
          >
            Not just live chats — <br />
            <span className="text-gradient-brand">connect your tools</span>
          </Heading>

          <p className="mt-6 max-w-[680px] text-[20px] leading-[1.65] text-theme-secondary">
            Connectors feed real-world events into Statewave as durable episodic memory.
            Agents recall projects, customers, communities, decisions, and workflows —
            by subject — without stuffing raw history into a prompt.
          </p>

          <p className="mt-6 text-[15px] leading-7 text-theme-secondary">
            Modular packages — install only what you need. The core stays clean;
            connectors are optional.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/connectors"
              className="inline-flex items-center rounded-full border border-brand-500/35 bg-brand-500/10 px-6 py-3 text-sm font-medium text-brand-300 hover:bg-brand-500/16 hover:border-brand-500/50 transition-colors"
            >
              Explore Statewave Connectors
            </Link>

            <Link
              to="/developers"
              className="inline-flex items-center rounded-full border border-theme-primary/40 bg-transparent px-6 py-3 text-sm font-medium text-theme-primary hover:bg-surface-1/30 hover:border-theme-primary/35 transition-colors"
            >
              View connector docs
            </Link>
          </div>
        </div>

        <div className="relative">
          <div
            className="absolute inset-0 rounded-full bg-accent/20 blur-[100px] scale-90"
            aria-hidden="true"
          />

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-5">
            {connectors.map((item, i) => (
              <motion.a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="block rounded-2xl border border-brand-500/25 bg-surface-1/45 p-6 shadow-[0_24px_80px_rgba(0,0,0,.16)] hover:border-brand-500/45 hover:bg-surface-1/60 transition-colors"
              >
                <img
                  src={item.logo}
                  alt=""
                  aria-hidden="true"
                  className={`mb-7 object-contain ${item.name === 'n8n' ? 'h-9 w-12' : 'h-9 w-9'
                    }`}
                />

                <h3 className="font-heading text-[20px] font-bold leading-tight text-theme-primary">
                  {item.name}
                </h3>

                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-500">
                  {item.type}
                </p>
              </motion.a>
            ))}
          </div>
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
          Composable memory primitives for any AI system that needs persistent, structured memory.
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
  const stats = PROOF_STATS

  return (
    <Section className="bg-surface-1/50">
      <div className="text-center mb-16">
        <Heading id="proven-not-promised" className="text-3xl md:text-4xl font-bold text-theme-primary tracking-tight">
          Proven, not promised
        </Heading>
        <p className="mt-4 text-theme-muted max-w-2xl mx-auto">
          Every claim is backed by automated evals and benchmarks that run in CI.
          Statewave scores 8/8 on support workflow criteria where naive approaches score 2/8.
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
  // npx leads — the fastest path for a new visitor. Docker is kept for
  // visitors who want to control the compose setup directly.
  const [tab, setTab] = React.useState<'npx' | 'docker' | 'python' | 'typescript'>('npx')

  type Block = { label: string; display: string; copy: string }

  const npxBlocks: Block[] = [
    {
      label: 'One command — installs, wires MCP clients, seeds repos',
      display: '$ npx @statewavedev/statewave',
      copy: 'npx @statewavedev/statewave',
    },
    {
      label: 'Verify the server is up',
      display: `$ curl http://localhost:8100/healthz
# → {"status":"ok"}`,
      copy: 'curl http://localhost:8100/healthz',
    },
    {
      label: 'Tear down when done',
      display: '$ npx @statewavedev/statewave --down',
      copy: 'npx @statewavedev/statewave --down',
    },
  ]

  const dockerBlocks: Block[] = [
    {
      label: 'Clone the repo',
      display: '$ git clone https://github.com/smaramwbc/statewave && cd statewave',
      copy: 'git clone https://github.com/smaramwbc/statewave && cd statewave',
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

  const blocks =
    tab === 'npx' ? npxBlocks :
      tab === 'docker' ? dockerBlocks :
        tab === 'python' ? pythonBlocks : tsBlocks

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
              {(
                [
                  { id: 'npx', label: 'npx' },
                  { id: 'docker', label: 'Docker' },
                  { id: 'python', label: 'Python SDK' },
                  { id: 'typescript', label: 'TypeScript SDK' },
                ] as const
              ).map(({ id, label }) => (
                <button
                  key={id}
                  role="tab"
                  type="button"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === id
                    ? 'bg-surface-0 text-theme-primary shadow-sm'
                    : 'text-theme-muted hover:text-theme-secondary'
                    }`}
                >
                  {label}
                </button>
              ))}
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
            {(tab === 'npx' || tab === 'docker') && (
              <p className="pt-1 text-right text-xs text-theme-muted">
                Runs in demo mode by default — add an LLM key for semantic search.{' '}
                <a
                  href="https://github.com/smaramwbc/statewave#run-the-server"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Docs →
                </a>
                <span className="text-theme-muted/60"> · </span>
                <a
                  href="https://github.com/smaramwbc/statewave"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Source →
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
          Start building with Statewave in about 5 minutes.
          Self-hosted, open source, and proven.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button href="https://github.com/smaramwbc/statewave-docs/blob/main/getting-started.md" size="lg">
            Get Started
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Button>
          <Button ref={ctaDemoRef} onClick={() => openWidget('support-agent', 'Support Agent')} variant="secondary" size="lg">
            Try Live Demo
          </Button>
          <Button href="https://github.com/smaramwbc/statewave" variant="secondary" size="lg">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </Button>
        </div>
      </div>
    </Section>
  )
}
