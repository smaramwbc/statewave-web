import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type Transition,
  type Variants,
} from 'framer-motion'
import { Section } from '../components/Section'
import { Heading } from '../components/Heading'
import { Button } from '../components/Button'
import { CodeCopyButton } from '../components/CodeCopyButton'
import { usePageSEO } from '../lib/seo'

/*
 * /benchmarks: head-to-head LoCoMo + LongMemEval results against mem0,
 * run on mem0's own eval harness (statewave-memory-benchmarks, a fork of
 * mem0ai/memory-benchmarks). Same repo and claims already cited on
 * /about, /press, and /whitepaper; this page is the detailed writeup.
 *
 * gpt-4o is used as a shared answerer + judge across all three backends so
 * the memory layer is the only variable, not a reproduction of mem0's
 * published gpt-5 + Qwen figures.
 */

const REPO_URL = 'https://github.com/smaramwbc/statewave-memory-benchmarks'

/* ─── Data ──────────────────────────────────────────────────────────────────
 * Every number rendered on this page derives from SYSTEMS. Deltas, bar
 * lengths, and prose figures are computed, never retyped, so correcting a
 * score here corrects it everywhere.
 */

type SeriesKey = 'statewave' | 'mem0-cloud' | 'mem0-oss'
type Metric = 'locomo' | 'lme'

interface SystemScore {
  key: SeriesKey
  name: string
  /** Licensing/hosting category, shown in the chart legend. */
  tag: string
  locomo: number
  lme: number
}

const SYSTEMS: readonly SystemScore[] = [
  { key: 'statewave', name: 'Statewave', tag: 'OSS · self-hosted', locomo: 0.905, lme: 0.967 },
  { key: 'mem0-cloud', name: 'mem0 cloud', tag: 'paid · closed', locomo: 0.899, lme: 0.933 },
  { key: 'mem0-oss', name: 'mem0 OSS', tag: 'OSS · self-hosted', locomo: 0.866, lme: 0.833 },
] as const

const [STATEWAVE, MEM0_CLOUD, MEM0_OSS] = SYSTEMS

/* Categorical series colors. One hue per system (identity, never rank), held
 * in CSS vars so light/dark each get their own validated step. See the
 * `--series-*` block in index.css for the palette contract. */
const SERIES_COLOR: Record<SeriesKey, string> = {
  statewave: 'var(--series-statewave)',
  'mem0-cloud': 'var(--series-mem0-cloud)',
  'mem0-oss': 'var(--series-mem0-oss)',
}

/* `grade` is the old "robust signal" / "directional only" prose promoted to a
 * colored badge: how much weight a reader should put on the panel is a signal,
 * so it's carried by a token instead of a line of mono text that wrapped. */

/* Bars are flat and unglowed, on purpose. They used to be a left-to-right ramp
 * of the series hue with a halo on the leader; that put the first half of every
 * bar in a color its own legend swatch never shows, and left the panel with
 * three separate bloom layers competing with the numbers. Emphasis is carried
 * by the rank chip, type weight, and the leader datum line instead — none of
 * which cost the reader any accuracy. */

const METRICS: Record<Metric, {
  label: string
  n: string
  grade: string
  tone: 'success' | 'amber'
}> = {
  locomo: { label: 'LoCoMo', n: 'n = 1,540', grade: 'Robust signal', tone: 'success' },
  lme: { label: 'LongMemEval', n: 'n = 30', grade: 'Directional', tone: 'amber' },
}

const GRADE_TONE: Record<'success' | 'amber', string> = {
  success:
    'border-[color:var(--color-success)]/30 bg-[color:var(--color-success)]/10 text-success',
  amber:
    'border-[color:var(--viz-amber)]/35 bg-[color:var(--viz-amber)]/10 text-[color:var(--viz-amber)]',
}

const fmt = (n: number) => n.toFixed(3)
const delta = (a: number, b: number) => `+${(a - b).toFixed(3)}`

/* Axis scale. The zoomed 0.80–1.00 view is the default because at full
 * scale three scores within 0.07 of each other are visually identical, but
 * a zoomed axis is also the classic way to inflate a small lead, so the
 * reader can flip to the honest 0–1.00 view and judge for themselves. */
type Scale = 'zoom' | 'full'

const AXIS: Record<Scale, { min: number; max: number; ticks: number[]; label: string }> = {
  zoom: { min: 0.8, max: 1.0, ticks: [0.8, 0.9, 1.0], label: '0.80–1.00' },
  full: { min: 0, max: 1.0, ticks: [0, 0.25, 0.5, 0.75, 1.0], label: '0–1.00' },
}

const axisPct = (v: number, scale: Scale) => {
  const { min, max } = AXIS[scale]
  return ((v - min) / (max - min)) * 100
}

/* Chart motion vocabulary. Two transitions, and which one runs says what
 * happened: REVEAL is the once-per-page entrance, RESPONSE is what a bar does
 * when the reader flips the axis. Replaying the entrance on every axis flip —
 * stagger delays and all — was the thing that made the toggle feel broken. */
const BAR_REVEAL: Transition = { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
const BAR_RESPONSE: Transition = { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
const ROW_STAGGER = 0.08
/* Beats measured from the start of the panel's reveal, so the sequence reads
 * ranking → datum → margins rather than everything arriving at once. */
const DATUM_AT = 0.8
const CONNECTOR_AT = 0.95
const DELTA_LABEL_AT = 1.2

/* ─── Content ───────────────────────────────────────────────────────────── */

/* Each fix names the backend it helps by SeriesKey rather than by a typed-out
 * label, so the card carries the same hue and the same name the chart already
 * uses for that system instead of a second, hand-maintained vocabulary. */
const FIXES: readonly { helps: SeriesKey; title: string; body: string }[] = [
  {
    helps: 'mem0-cloud',
    title: 'Cloud v3 add URL',
    body: 'Without it cloud ingested nothing. This fix is what lets it score at all.',
  },
  {
    helps: 'mem0-oss',
    title: 'OSS v2 search-filter',
    body: 'Corrected so queries return the intended memories, not an over-filtered subset.',
  },
  {
    helps: 'mem0-oss',
    title: 'OSS date grounding',
    body: 'Grounds the session date back into message content so time-anchored questions resolve.',
  },
]

const systemName = (key: SeriesKey) => SYSTEMS.find((s) => s.key === key)?.name ?? key

const CLAIMS = [
  `Beats its open-source peer on both: LoCoMo ${delta(STATEWAVE.locomo, MEM0_OSS.locomo)}, LongMemEval ${delta(STATEWAVE.lme, MEM0_OSS.lme)}.`,
  `Edges the paid cloud tier too, ${fmt(STATEWAVE.locomo)} vs ${fmt(MEM0_CLOUD.locomo)}, while staying free and self-hosted.`,
  'Holds against mem0’s best config; our client fixes are applied to their backends, not withheld.',
  'Reproduces from one public, Apache-2.0 code path with mem0’s judge unchanged.',
]

const NON_CLAIMS = [
  'Not a reproduction of mem0’s published gpt-5 + Qwen figures.',
  'No category-level or per-type breakdowns beyond the aggregate scores.',
  'No long-context BEAM score. The harness runs, but no number is claimed.',
  'LongMemEval (n=30) is directional, not a significance test.',
]

/* The governance bridge is a comparison, so it is stored as one. Icons were
 * dropped with the card grid: a shield beside "Access policies" carried no
 * information the title didn't already carry. */
const GOVERNANCE_ROWS = [
  {
    title: 'Access policies',
    body: 'Scope what each agent and tenant can read or write, enforced at retrieval time.',
  },
  {
    title: 'Sensitivity labels',
    body: 'Tag memories by sensitivity and keep classified content out of the wrong context.',
  },
  {
    title: 'Tamper-evident audit',
    body: 'Every write and read leaves a verifiable receipt you can replay after the fact.',
  },
  {
    title: 'Provenance',
    body: 'Trace any retrieved memory back to the exact source turn it came from.',
  },
]

/* Retrieval half of the same table. Scores read from SYSTEMS so this can
 * never drift from the scoreboard above; mem0 cloud is the paid tier, i.e.
 * their strongest showing, which is the fair column to sit beside. */
const RETRIEVAL_ROWS = [
  {
    title: 'LoCoMo',
    body: 'Aggregate score on mem0’s own harness, gpt-4o answerer and judge.',
    mem0: fmt(MEM0_CLOUD.locomo),
    statewave: fmt(STATEWAVE.locomo),
  },
  {
    title: 'LongMemEval',
    body: 'Same harness, same judge, 30-question matched subset.',
    mem0: fmt(MEM0_CLOUD.lme),
    statewave: fmt(STATEWAVE.lme),
  },
]

const FAQS = [
  {
    q: 'Why gpt-4o and not gpt-5?',
    a: "mem0's headline figures use gpt-5 + Qwen. We standardized on gpt-4o as a shared answerer and judge across all three backends so the only variable is the memory layer. A cleaner comparison, not a reproduction of their numbers.",
  },
  {
    q: "Isn't n=30 too small on LongMemEval?",
    a: "Yes, treat it as directional. It's a matched 30-question subset with wide error bars. LoCoMo at n=1,540 is the robust signal, and Statewave leads both.",
  },
  {
    q: 'Did you tune Statewave and handicap mem0?',
    a: "The opposite. Three client fixes we shipped raise mem0's own scores; without the cloud v3 add-URL fix, cloud ingested nothing. We beat their best config, not a strawman.",
  },
  {
    q: 'Why run on mem0’s harness instead of your own?',
    a: "So the framing isn't ours to bend. The judge and scoring code are unchanged from upstream; only the memory backend swaps. You can diff the fork against upstream line by line.",
  },
  {
    q: "It's one run. Can I trust it?",
    a: "Don't take our word for it. The harness is Apache-2.0 and copy-pasteable: clone it and re-run every number yourself. LoCoMo's margin is stable across runs.",
  },
  {
    q: 'What is Statewave, exactly?',
    a: 'An open-source memory runtime for AI agents: the layer that ingests, stores, and retrieves what an agent needs to remember. These benchmarks measure that retrieval quality head-to-head.',
  },
]

const NAV_SECTIONS = [
  { id: 'results', label: 'Scoreboard' },
  { id: 'methodology', label: 'Methodology' },
  { id: 'run', label: 'Run it' },
  { id: 'scope', label: 'Scope' },
  { id: 'governance', label: 'Governance' },
  { id: 'faq', label: 'FAQ' },
]

/* ─── Shared motion ─────────────────────────────────────────────────────────
 * Same cadence as the homepage hero stagger (staggerChildren 0.12) so the
 * page's motion reads as part of the site rather than its own dialect.
 */
const STAGGER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
}
const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 0.61, 0.36, 1] } },
}

/** Card grid that staggers its children in on first scroll into view. */
function StaggerGrid({ className, children }: { className: string; children: ReactNode }) {
  return (
    <motion.div
      variants={STAGGER}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Panel card with the site's standard hover-lift treatment (same recipe as
 * the /about principle cards). Padding is deliberately not set here; callers
 * pass their own, since two utilities of equal specificity would otherwise
 * resolve by stylesheet order rather than by class-attribute order.
 */
function LiftCard({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <motion.div
      variants={FADE_UP}
      className={`overflow-hidden rounded-2xl border border-theme-border shadow-sm transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-brand-500/45 hover:shadow-[0_22px_70px_rgba(0,0,0,0.16)] ${className}`}
    >
      {children}
    </motion.div>
  )
}

export function BenchmarksPage() {
  // Title, description, og:type and the breadcrumb all come from the route
  // table in lib/seo-meta.ts. Passing literals here instead left /benchmarks
  // out of PUBLIC_ROUTES, which is what generates sitemap.xml — the page read
  // as correct while being absent from the sitemap entirely.
  usePageSEO()

  return (
    <>
      <Hero />
      <SectionNav />
      <Scoreboard />
      <Methodology />
      <RunIt />
      <Scope />
      <GovernanceBridge />
      <Faq />
      <ClosingCta />
    </>
  )
}

/* ─── Hero ──────────────────────────────────────────────────────────────────
 * Ambient treatment mirrors the homepage hero: a radial brand glow, a masked
 * dot-grid, and a fade into surface-0 at the bottom. All three layers read
 * from theme vars, so light mode needs no separate handling.
 */

function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-14 text-center sm:pt-32 sm:pb-16 md:pt-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(46rem 30rem at 50% 22%, rgba(99,102,241,.13), transparent 70%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          backgroundImage: 'radial-gradient(var(--theme-hero-dot) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          maskImage: 'radial-gradient(ellipse 68% 60% at 50% 32%, #000 26%, transparent 76%)',
          WebkitMaskImage: 'radial-gradient(ellipse 68% 60% at 50% 32%, #000 26%, transparent 76%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, transparent 74%, var(--theme-surface-0) 100%)',
        }}
      />

      <div className="relative mx-auto max-w-4xl px-5 sm:px-6">
        <span className="hero-badge inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-brand-500/35 bg-brand-500/[0.06] px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-400">
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-success)]" />
          {/* The badge is uppercase site-wide, but uppercasing `mem0` renders
              MEM0 — at 11px with 0.18em tracking the zero reads as a letter O,
              so the whole claim lands as "memo's own harness". The brand token
              opts out of the transform; the rest of the badge keeps the
              site pattern. */}
          Open source · Apache-2.0 · <span className="normal-case">mem0&apos;s</span> own harness
        </span>

        {/* The non-breaking space keeps the article bound to its noun. At
            `max-w-[16ch]` the balancer broke this as "Statewave tops a /
            memory benchmark", stranding "a" at the end of the first line. */}
        <h1 className="mx-auto mt-7 max-w-[19ch] font-heading text-[clamp(2.5rem,5.6vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.02em] text-theme-primary text-balance">
          Statewave tops a&nbsp;memory benchmark{' '}
          <span className="text-gradient-brand">we didn&apos;t write.</span>
        </h1>

        {/* Deliberately smaller than the site's usual hero subhead: the h1 is
            already three lines, and at 18px this paragraph competed with it
            instead of supporting it. */}
        <p className="mx-auto mt-5 max-w-[52ch] text-[15px] leading-[1.65] text-theme-secondary/90 sm:text-base">
          An open-source, self-hosted memory runtime for AI agents. It clears mem0 OSS on
          both LoCoMo and LongMemEval, run on mem0&apos;s own harness at{' '}
          <span className="font-semibold text-theme-primary">gpt-4o</span>, same eval loop,
          their judge unchanged, and edges the paid mem0 cloud tier too.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button to="#results" size="lg">
            See the scoreboard ↓
          </Button>
          <Button href={REPO_URL} variant="secondary" size="lg">
            <GitHubIcon className="h-4 w-4" />
            View the harness
          </Button>
        </div>

        <HeroLeaderboard />

        <p className="mt-6 font-mono text-xs text-theme-muted">
          Not a reproduction of mem0&apos;s published gpt-5 + Qwen figures.
        </p>
      </div>
    </section>
  )
}

/** Compact "who leads" summary: the headline result before the full chart. */
function HeroLeaderboard() {
  return (
    <motion.div
      variants={STAGGER}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      className="mx-auto mt-12 grid max-w-3xl gap-3 sm:grid-cols-3"
    >
      {SYSTEMS.map((s) => {
        const lead = s.key === 'statewave'
        return (
          <motion.div
            key={s.key}
            variants={FADE_UP}
            className={`rounded-2xl border p-4 text-left transition-colors ${
              lead
                ? 'border-accent/45 bg-accent/[0.06]'
                : 'border-theme-border bg-surface-1/70'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 flex-none rounded-[3px]"
                style={{ background: SERIES_COLOR[s.key] }}
              />
              <span
                className={`text-[13px] ${lead ? 'font-bold text-theme-primary' : 'font-semibold text-theme-secondary'}`}
              >
                {s.name}
              </span>
            </div>
            {/* Label left, figure right. Leading with the numbers put the two
                metric labels at different x-positions in every card, because
                the LoCoMo figure is set larger than the LongMemEval one — so
                nothing lined up either within a card or across the three.
                Anchoring the figures to the right edge aligns both columns
                and lets the scores be read down the row. */}
            <div className="mt-3.5 space-y-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-[11px] text-theme-muted">LoCoMo</span>
                <span className="font-mono text-[22px] font-bold tabular-nums leading-none tracking-[-0.02em] text-theme-primary">
                  {fmt(s.locomo)}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-[11px] text-theme-muted">LongMemEval</span>
                <span className="font-mono text-[15px] tabular-nums leading-none text-theme-secondary">
                  {fmt(s.lme)}
                </span>
              </div>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

/* ─── Sticky section nav ────────────────────────────────────────────────────
 * The page is long and every section is anchored; this is the wayfinding.
 * Scroll-spy uses one IntersectionObserver over the section elements rather
 * than a scroll listener, so it costs nothing per frame.
 */

function SectionNav() {
  const [active, setActive] = useState<string>(NAV_SECTIONS[0].id)

  useEffect(() => {
    const els = NAV_SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    )
    if (els.length === 0) return

    const io = new IntersectionObserver(
      (entries) => {
        // Pick the entry nearest the top of the viewport among those visible;
        // "last one that crossed" alone flickers when two sections overlap.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <nav
      aria-label="Benchmark sections"
      // Parks directly under the fixed 60px navbar. That bar also carries
      // `pt-safe`, so the offset has to include the same inset or this row
      // tucks underneath it on notched devices in standalone mode.
      style={{ top: 'calc(60px + env(safe-area-inset-top))' }}
      className="sticky z-30 border-y border-theme-border bg-surface-0/85 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl gap-1.5 overflow-x-auto px-5 py-2.5 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NAV_SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            aria-current={active === s.id ? 'true' : undefined}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
              active === s.id
                ? 'bg-accent/12 text-accent'
                : 'text-theme-muted hover:bg-surface-2/60 hover:text-theme-primary'
            }`}
          >
            {s.label}
          </a>
        ))}
      </div>
    </nav>
  )
}

/* ─── Scoreboard ────────────────────────────────────────────────────────── */

function Scoreboard() {
  const [scale, setScale] = useState<Scale>('zoom')
  // Which series the reader has isolated, if any. Null = all shown equally.
  const [focus, setFocus] = useState<SeriesKey | null>(null)

  return (
    <Section id="results" className="scroll-mt-32">
      <div className="relative">
        {/* Softened: this section is the one place on the site carrying three
            saturated series hues, and at full strength the ambient wash sat on
            top of them as haze. */}
        <div className="section-glow section-glow--soft" aria-hidden="true" />

        <div className="relative">
          <div className="mb-6 max-w-2xl">
            <p className="section-eyebrow mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
              The scoreboard
            </p>
            <Heading
              id="scoreboard"
              className="font-heading text-3xl font-bold tracking-[-0.02em] text-theme-primary md:text-4xl"
            >
              Three systems, one eval loop
            </Heading>
            <p className="mt-3.5 text-[15px] leading-relaxed text-theme-secondary text-pretty">
              The margins are small on purpose: a fair fight, not an inflated one.
            </p>
          </div>

          {/* Chart toolbar. Legend and axis switch were two loose rows of small
              text floating above the panels; bound into one bar they read as
              controls belonging to the chart. */}
          <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2.5 rounded-2xl border border-theme-border bg-surface-1/60 px-3.5 py-2.5">
            <Legend focus={focus} onFocus={setFocus} />
            <ScaleToggle scale={scale} onChange={setScale} />
          </div>
          <p className="mt-2 px-1 font-mono text-[10.5px] text-theme-muted">
            Click a system to isolate it · switch the axis for full scale
          </p>

          {/* Hero and support, not twins. The two panels used to sit in an even
              50/50 split, which told the eye they carried equal weight — the
              one thing this page's own copy says they don't. LoCoMo at n=1,540
              is the robust signal, so it takes the full width and the long
              bars; LongMemEval at n=30 is explicitly directional and sits in
              the row below, next to the fine print it belongs with. */}
          <div className="mt-4">
            <ScorePanel metric="locomo" scale={scale} focus={focus} />
          </div>

          <div className="mt-5 grid items-stretch gap-5 lg:grid-cols-2">
            <ScorePanel metric="lme" scale={scale} focus={focus} />
            <Caveats />
          </div>
        </div>
      </div>
    </Section>
  )
}

/**
 * Series legend: identity is never carried by color alone, and each entry
 * doubles as an isolate toggle: pressing one dims the other two across both
 * panels so a single system can be read against the axis on its own.
 */
function Legend({
  focus,
  onFocus,
}: {
  focus: SeriesKey | null
  onFocus: (key: SeriesKey | null) => void
}) {
  return (
    <ul aria-label="Chart series" className="flex flex-wrap items-center gap-2">
      {SYSTEMS.map((s) => {
        const isolated = focus === s.key
        const dimmed = focus !== null && !isolated
        return (
          <li key={s.key}>
            <button
              type="button"
              aria-pressed={isolated}
              onClick={() => onFocus(isolated ? null : s.key)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-accent focus:outline-none ${
                isolated
                  ? 'border-accent/45 bg-accent/8'
                  : 'border-transparent hover:border-theme-border hover:bg-surface-2/50'
              } ${dimmed ? 'opacity-45' : ''}`}
            >
              <span
                aria-hidden="true"
                // No halo: the swatch has to be the same flat hue as the bar it
                // stands for, or the key stops matching the chart.
                className="h-2.5 w-2.5 flex-none rounded-[3px]"
                style={{ background: SERIES_COLOR[s.key] }}
              />
              <span className="text-[13px] font-medium text-theme-secondary">{s.name}</span>
              {/* Lowercase, untracked: the licensing note is a footnote to the
                  name, not a second label competing with it. */}
              <span className="hidden font-mono text-[10px] text-theme-muted/80 sm:inline">
                {s.tag}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * Axis-scale switch. A zoomed axis is the standard way to make a small lead
 * look big, so rather than only disclosing the zoom in prose we let the
 * reader collapse it back to 0–1.00 and watch the bars converge.
 */
function ScaleToggle({ scale, onChange }: { scale: Scale; onChange: (s: Scale) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-wide text-theme-muted">Axis</span>
      <div
        role="radiogroup"
        aria-label="Chart axis scale"
        className="inline-flex rounded-full border border-theme-border bg-surface-1 p-0.5"
      >
        {(['zoom', 'full'] as const).map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={scale === s}
            onClick={() => onChange(s)}
            className={`rounded-full px-3 py-1 font-mono text-[11px] transition-colors focus-visible:ring-2 focus-visible:ring-accent focus:outline-none ${
              scale === s
                ? 'bg-accent/12 text-accent'
                : 'text-theme-muted hover:text-theme-secondary'
            }`}
          >
            {AXIS[s].label}
          </button>
        ))}
      </div>
    </div>
  )
}

const CAVEATS = [
  {
    title: 'Shared stack',
    body: 'gpt-4.1 extraction · text-embedding-3-small · gpt-4o answer + judge.',
  },
  {
    title: 'Single run',
    body: 'One run, not an average. LoCoMo (n=1,540) is the robust read.',
  },
  {
    title: 'n=30 on LME',
    body: 'A 30-question matched set with wide error bars. Directional only.',
  },
  {
    title: 'Asymmetry',
    body: "mem0 cloud's extractor/embedder isn't configurable, a product-inherent asymmetry.",
  },
]

/**
 * Fine print, kept in full but given less voice than the chart: each label is
 * demoted to a muted dot-and-caps line so the set reads as an apparatus note
 * rather than four more paragraphs competing with the panels.
 *
 * It stacks vertically now instead of running four-across under the charts.
 * As a full-width strip it was the last thing on the section and read as a
 * conclusion; beside the directional panel it reads as what it is — the
 * conditions both runs were made under.
 */
function Caveats() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-theme-border bg-surface-1 shadow-sm">
      <p className="border-b border-theme-border px-5 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-theme-muted">
        Conditions of the run
      </p>
      <div className="flex flex-1 flex-col">
        {CAVEATS.map((c, i) => (
          <div
            key={c.title}
            className={`flex-1 px-5 py-3.5 ${i > 0 ? 'border-t border-theme-border' : ''}`}
          >
            <p className="mb-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-theme-muted">
              <span aria-hidden="true" className="h-1 w-1 flex-none rounded-full bg-accent" />
              {c.title}
            </p>
            <p className="text-[12.5px] leading-relaxed text-theme-secondary text-pretty">
              {c.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * One benchmark = one panel of three bars on a shared zoomed axis.
 *
 * Bars and counters are driven by a single `onViewportEnter` on the panel so
 * they resolve together; independent per-element observers made the numbers
 * and their bars finish at visibly different times.
 */
function ScorePanel({
  metric,
  scale,
  focus,
}: {
  metric: Metric
  scale: Scale
  focus: SeriesKey | null
}) {
  const reduced = useReducedMotion() ?? false
  const [shown, setShown] = useState(false)
  const meta = METRICS[metric]
  const headline = delta(STATEWAVE[metric], MEM0_OSS[metric])
  const ticks = AXIS[scale].ticks
  // Every non-leader row draws its gap back to this position, so the panel
  // owns it rather than each row recomputing it.
  const leaderPct = axisPct(STATEWAVE[metric], scale)

  return (
    <motion.div
      onViewportEnter={() => setShown(true)}
      viewport={{ once: true, margin: '-60px' }}
      className="relative overflow-hidden rounded-2xl border border-theme-border bg-surface-1 p-6 shadow-sm sm:p-7"
    >
      {/* One decorative layer, not three: a hairline in the leader's hue across
          the top, held at 55% so the bars stay the brightest thing in the
          panel. The blurred bloom that used to sit behind the headline delta is
          gone — stacked against the section wash it was reading as haze. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, color-mix(in oklab, ${SERIES_COLOR.statewave} 55%, transparent), transparent)`,
        }}
      />

      <div className="relative mb-7 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-heading text-xl font-bold tracking-[-0.02em] text-theme-primary">
            {meta.label}
          </h3>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full border border-theme-border bg-surface-2/70 px-2 py-0.5 font-mono text-[10px] tabular-nums text-theme-secondary">
              {meta.n}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide ${GRADE_TONE[meta.tone]}`}
            >
              {meta.grade}
            </span>
          </div>
        </div>
        {/* The panel's focal point. The old second line here also carried the
            cloud delta, which wrapped into the title; that number is now drawn
            on the cloud row itself as the gap back to Statewave. */}
        <div className="shrink-0 text-right">
          <p className="font-mono text-[clamp(1.75rem,4.5vw,2.25rem)] font-bold leading-none tracking-[-0.04em] tabular-nums text-success">
            {headline}
          </p>
          <p className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.16em] text-theme-muted">
            vs mem0 OSS
          </p>
        </div>
      </div>

      {/* Plot area. Gridlines sit behind the bars at the labeled axis ticks so
          the current zoom is legible rather than implied. */}
      <div className="relative">
        {/* Same pr-14 gutter the bars reserve, so gridlines land on the track
            rather than on the delta-label column. Keyed by scale: the two axes
            have different tick counts, so there is nothing to tween between —
            the set is crossfaded while the bars glide to their new lengths. */}
        <motion.div
          key={scale}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 pr-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reduced ? { duration: 0 } : { duration: 0.35 }}
        >
          <div className="relative h-full">
            {ticks.map((t) => (
              <span
                key={t}
                className="absolute top-0 bottom-0 w-px bg-theme-border"
                style={{ left: `${axisPct(t, scale)}%` }}
              />
            ))}
          </div>
        </motion.div>

        <div className="relative flex flex-col gap-3.5">
          {SYSTEMS.map((s, i) => (
            <ScoreRow
              key={s.key}
              system={s}
              metric={metric}
              rank={i + 1}
              shown={shown}
              reduced={reduced}
              delay={i * ROW_STAGGER}
              scale={scale}
              leaderPct={leaderPct}
              dimmed={focus !== null && focus !== s.key}
            />
          ))}
        </div>

        {/* The leader's score as a datum line across all three rows, drawn
            top-down once the bars have landed. It replaces the three separate
            end-ticks the delta connectors each used to draw: they sat at one x
            and were therefore one line, and as one line every gap below it is
            measured against a single edge. Painted after the rows so it caps
            the leader's bar instead of hiding behind it. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 pr-14">
          <div className="relative h-full">
            <motion.span
              className="absolute top-0 bottom-0 w-px origin-top transition-[left] duration-500 ease-out"
              style={{
                left: `${leaderPct}%`,
                background: `color-mix(in oklab, ${SERIES_COLOR.statewave} 60%, transparent)`,
              }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: shown ? 1 : 0 }}
              transition={
                reduced ? { duration: 0 } : { ...BAR_RESPONSE, delay: DATUM_AT }
              }
            />
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-theme-border pt-3 pr-14">
        <motion.div
          key={scale}
          className="relative h-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reduced ? { duration: 0 } : { duration: 0.35 }}
        >
          {ticks.map((t, i) => (
            <span
              key={t}
              className="absolute top-0 font-mono text-[10.5px] text-theme-muted"
              style={{
                left: `${axisPct(t, scale)}%`,
                // First tick hugs the axis origin, last one hangs off the end;
                // both would clip if centred like the interior ticks.
                transform:
                  i === 0
                    ? 'none'
                    : i === ticks.length - 1
                      ? 'translateX(-100%)'
                      : 'translateX(-50%)',
              }}
            >
              {t.toFixed(2)}
            </span>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

/**
 * One system's row: name + score on a label line, bar on the line below.
 *
 * The score sits right-aligned in a shared column rather than riding the end
 * of its own bar. Bar-end labels staircased across three x-positions, so the
 * three figures a reader most wants to compare could not be read as a column.
 *
 * The lead over Statewave is drawn, not written: a dashed span from this bar's
 * end to the leader's end, which *is* the delta at the current axis scale. It
 * replaces a `SW +0.039` label that floated in dead space far from the bar it
 * described, and it collapses honestly when the axis flips to full scale.
 */
function ScoreRow({
  system,
  metric,
  rank,
  shown,
  reduced,
  delay,
  scale,
  leaderPct,
  dimmed,
}: {
  system: SystemScore
  metric: Metric
  rank: number
  shown: boolean
  reduced: boolean
  delay: number
  scale: Scale
  leaderPct: number
  dimmed: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const value = system[metric]
  const isLeader = system.key === 'statewave'
  const swDelta = isLeader ? null : delta(STATEWAVE[metric], value)
  const color = SERIES_COLOR[system.key]
  const target = axisPct(value, scale) / 100

  /* One motion value per row drives both the bar's scaleX and the connector's
   * left edge, so the connector stays welded to the bar tip through the reveal
   * and through an axis flip. scaleX rather than width keeps all six bars on
   * the compositor instead of relaying out the panel every frame.
   *
   * The score itself is deliberately *not* on this value. It used to count up
   * on its own rAF loop, finishing visibly out of step with its bar; the
   * obvious repair — derive the digits from the bar tip's position on the axis
   * — is worse. An axis flip re-renders with the new axis bounds immediately
   * while the bar is still travelling, so the digits read out scores that were
   * never measured (0.905 rendering as 0.981 mid-flip), and they stick there
   * for as long as the tab is backgrounded and rAF is paused. On this page the
   * figure is the claim and the bar is the illustration: the illustration
   * animates, the claim holds still and stays true in every frame. */
  const grow = useMotionValue(0)
  const revealed = useRef(false)

  useEffect(() => {
    if (reduced) {
      grow.set(target)
      return
    }
    if (!shown) return
    const entering = !revealed.current
    revealed.current = true
    const controls = animate(grow, target, entering ? { ...BAR_REVEAL, delay } : BAR_RESPONSE)
    return () => controls.stop()
  }, [grow, shown, reduced, target, delay])

  const barEnd = useTransform(grow, (g) => `${g * 100}%`)

  return (
    <div
      // Hit target spans the whole row, not just the bar.
      className={`group relative -mx-2 rounded-lg px-2 py-1.5 transition-[background-color,opacity] duration-300 hover:bg-theme-border/25 ${
        dimmed ? 'opacity-30' : 'opacity-100'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={0}
      role="img"
      aria-label={`${system.name}, ${METRICS[metric].label} score ${fmt(value)}${
        swDelta ? `, Statewave leads by ${swDelta}` : ''
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="inline-flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className={`flex h-5 w-5 flex-none items-center justify-center rounded-md font-mono text-[11px] font-bold ${
              isLeader ? '' : 'bg-theme-border/40 text-theme-muted'
            }`}
            style={
              isLeader
                ? {
                    background: `color-mix(in oklab, ${color} 22%, transparent)`,
                    color,
                    boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${color} 45%, transparent)`,
                  }
                : undefined
            }
          >
            {rank}
          </span>
          <span
            className={`truncate text-sm ${
              isLeader ? 'font-bold text-theme-primary' : 'font-semibold text-theme-secondary'
            }`}
          >
            {system.name}
          </span>
        </span>
        <span
          className={`flex-none font-mono text-[17px] leading-none tracking-[-0.02em] tabular-nums ${
            isLeader ? 'font-bold text-theme-primary' : 'font-semibold text-theme-secondary'
          }`}
        >
          {fmt(value)}
        </span>
      </div>

      {/* Bar track + fill.
          `pr-14` reserves a gutter for the delta label at the end of the gap
          connector, so the track can never grow long enough to push it out of
          the panel. Without it every bar overflows on the full 0–1.00 scale,
          where all three sit past 83%. */}
      <div className="relative h-6 pr-14">
        <div className="relative h-full">
          <div className="absolute inset-0 rounded-[3px] bg-theme-border/40" />
          {/* Flat series hue, squared off to 3px. A 6px pill on a 24px bar read
              as a UI control; at 3px it reads as a measurement. */}
          <motion.div
            className="absolute inset-y-0 left-0 w-full origin-left rounded-[3px] transition-[filter] duration-200 group-hover:brightness-110"
            style={{ background: color, scaleX: grow }}
          />

          {/* The gap, drawn: this bar's tip to the datum line at the leader's
              score, labeled where it meets that line. `left` rides the same
              motion value as the bar, so the connector is pinned to the tip
              through the reveal and through an axis flip; only its far end is
              fixed, because the far end *is* the datum. The dashed rule wipes
              in from that end, back toward this bar — the direction the margin
              is actually read in. */}
          {swDelta && (
            <motion.span
              aria-hidden="true"
              className="absolute inset-y-0 transition-[right] duration-500 ease-out"
              style={{ left: barEnd, right: `${100 - leaderPct}%` }}
            >
              <motion.span
                className="absolute inset-x-0 top-1/2 origin-right border-t border-dashed"
                style={{ borderColor: color, opacity: 0.55 }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: shown ? 1 : 0 }}
                transition={
                  reduced ? { duration: 0 } : { ...BAR_RESPONSE, delay: CONNECTOR_AT + delay }
                }
              />
              <motion.span
                className="absolute top-1/2 left-full ml-2 -translate-y-1/2 whitespace-nowrap font-mono text-[11px] font-semibold tabular-nums text-success"
                initial={{ opacity: 0 }}
                animate={{ opacity: shown ? 1 : 0 }}
                transition={
                  reduced ? { duration: 0 } : { duration: 0.35, delay: DELTA_LABEL_AT + delay }
                }
              >
                {swDelta}
              </motion.span>
            </motion.span>
          )}
        </div>
      </div>

      {hovered && (
        <div
          role="tooltip"
          className="absolute bottom-full left-2 z-20 mb-1 w-max max-w-[15rem] rounded-lg border border-theme-border bg-surface-0 px-3 py-2 shadow-lg"
        >
          <p className="text-[12px] font-semibold text-theme-primary">{system.name}</p>
          <p className="mt-0.5 font-mono text-[11px] text-theme-secondary">
            {METRICS[metric].label} {fmt(value)} · {METRICS[metric].n}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-theme-muted">
            {swDelta ? `Statewave leads by ${swDelta}` : 'Leads this benchmark'}
          </p>
        </div>
      )}
    </div>
  )
}

/* ─── Methodology ───────────────────────────────────────────────────────── */

function Methodology() {
  return (
    <Section id="methodology" className="scroll-mt-32 bg-surface-1">
      <div className="max-w-2xl">
        <p className="section-eyebrow mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
          Methodology
        </p>
        <Heading
          id="methodology-heading"
          className="font-heading text-3xl font-bold tracking-[-0.02em] text-theme-primary md:text-4xl"
        >
          One loop, one swap
        </Heading>
        <p className="mt-4 text-base text-theme-secondary text-pretty">
          A fork of mem0&apos;s harness, not a rewrite. Every run travels the same path; only the
          memory backend changes.
        </p>
      </div>

      <Pipeline />

      <div className="mt-14 max-w-2xl">
        <Heading
          id="methodology-fixes"
          level={3}
          className="font-heading text-2xl font-bold tracking-[-0.02em] text-theme-primary"
        >
          Three fixes, all in mem0&apos;s favor
        </Heading>
        <p className="mt-3 text-base text-theme-secondary text-pretty">
          Bugs in mem0&apos;s own client code. Every one of them{' '}
          <span className="text-theme-primary">raises the mem0 backends&apos; scores</span>, and
          every one is applied in the fork rather than withheld — so the scoreboard above runs
          against their best config, not a strawman.
        </p>
      </div>

      <StaggerGrid className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FIXES.map((f) => (
          <LiftCard key={f.title} className="flex flex-col bg-surface-0 p-5">
            <h4 className="text-base font-bold text-theme-primary">{f.title}</h4>
            <p className="mt-1.5 text-[13px] leading-relaxed text-theme-secondary">{f.body}</p>
            {/* Which backend the fix helps, carried by the chart's hue for that
                system instead of a badge — two of the three fixes target the
                same backend, so a repeated pill led every card with its least
                distinguishing line. */}
            <p className="mt-auto flex items-center gap-2 pt-4 font-mono text-[11px] text-theme-muted">
              <span
                aria-hidden="true"
                className="h-2 w-2 flex-none rounded-[2px]"
                style={{ background: SERIES_COLOR[f.helps] }}
              />
              applied to {systemName(f.helps)}
            </p>
          </LiftCard>
        ))}
      </StaggerGrid>

      {/* Both links leave for the repo, so neither takes the gradient — the
          page's primary action is the "Run it" section directly below. */}
      <div className="mt-10 flex flex-wrap items-center gap-3.5">
        <Button
          href={`${REPO_URL}/compare/main...smaramwbc:statewave-memory-benchmarks:main`}
          variant="secondary"
        >
          Diff the fork against upstream →
        </Button>
        <Button href={`${REPO_URL}/blob/main/NOTICE`} variant="secondary">
          Read the full NOTICE
        </Button>
      </div>
    </Section>
  )
}

/* Answer and judge are one node because they are one model: gpt-4o scores its
 * own answers across all three backends, which is a methodology fact worth
 * showing rather than two identical boxes at the tail of the diagram. */
const PIPELINE_STEPS = [
  { label: 'Dataset', value: 'LoCoMo · LME' },
  { label: 'Stage 1', value: 'Ingest' },
  { label: 'swap', value: '' },
  { label: 'Stage 2', value: 'Search', hint: 'top-200' },
  { label: 'Stage 3', value: 'Answer + judge', hint: 'gpt-4o' },
]

/**
 * The eval loop, drawn. Steps resolve left-to-right on scroll so the diagram
 * reads as a flow rather than a row of boxes.
 *
 * Border style carries the section's whole claim: dashed nodes are identical
 * in all three runs, the one solid accent node is what gets swapped. That was
 * previously only stated in the mono footnotes underneath, which left the
 * diagram illustrating the argument instead of making it.
 */
function Pipeline() {
  const step: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 0.61, 0.36, 1] } },
  }

  return (
    <motion.div
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.11 } } }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      className="mt-8 rounded-2xl border border-theme-border bg-surface-0 p-6 shadow-sm sm:p-7"
    >
      <div className="flex flex-col items-stretch gap-2 md:flex-row md:flex-wrap md:items-center md:justify-center">
        {PIPELINE_STEPS.map((s, i) => (
          <Fragment key={s.label}>
            {i > 0 && (
              <motion.div
                variants={step}
                aria-hidden="true"
                className={`flex items-center justify-center ${
                  s.label === 'swap' || PIPELINE_STEPS[i - 1]?.label === 'swap'
                    ? 'text-accent'
                    : 'text-theme-muted'
                }`}
              >
                {/* Stacked, a column of arrow glyphs is louder than the nodes it
                    joins; a hairline reads as the same connector at a whisper. */}
                <span className="h-4 w-px bg-current opacity-50 md:hidden" />
                <span className="hidden text-lg md:inline">→</span>
              </motion.div>
            )}

            {s.label === 'swap' ? (
              <motion.div
                key="swap"
                variants={step}
                className="flex-1 rounded-xl border-[1.5px] border-accent bg-accent/[0.08] p-3.5 text-center md:max-w-[250px]"
              >
                {/* No pulse ring here. The border weight, the fill and the badge
                    already say this is the node that matters; a loop animating
                    on top of the section's own claim is decoration asking to be
                    mistaken for meaning. */}
                <span className="mb-2 inline-block rounded-full border border-accent bg-accent/10 px-2.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-wide text-accent">
                  Only this swaps
                </span>
                <div className="flex flex-col gap-1.5">
                  {SYSTEMS.map((sys) => (
                    <span
                      key={sys.key}
                      className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-[12.5px] ${
                        sys.key === 'statewave'
                          ? 'border-accent bg-accent/10 font-bold text-theme-primary'
                          : 'border-theme-border bg-theme-border/10 font-semibold text-theme-secondary'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="h-2 w-2 flex-none rounded-[2px]"
                        style={{ background: SERIES_COLOR[sys.key] }}
                      />
                      {sys.name}
                    </span>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* min-h keeps the four shared stages the same height as each
                 other while leaving them visibly shorter than the swap node.
                 Stretching every box to the tallest one, as before, spent the
                 diagram's emphasis on padding. */
              <motion.div
                key={s.label}
                variants={step}
                className="flex min-h-[104px] flex-1 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-theme-muted/40 bg-surface-1 p-4 text-center md:max-w-[190px]"
              >
                <span className="font-mono text-[10px] uppercase tracking-wide text-theme-muted">
                  {s.label}
                </span>
                <span className="text-sm font-semibold text-theme-primary">{s.value}</span>
                {s.hint && (
                  <span className="font-mono text-[10.5px] text-theme-secondary">{s.hint}</span>
                )}
              </motion.div>
            )}
          </Fragment>
        ))}
      </div>

      {/* Legend for the border treatment above. Without it the dashes are
          decoration; with it they are the argument. */}
      <motion.div
        variants={step}
        className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] text-theme-muted"
      >
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-3 w-6 flex-none rounded border border-dashed border-theme-muted/40 bg-surface-1"
          />
          identical in all three runs
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-3 w-6 flex-none rounded border-[1.5px] border-accent bg-accent/[0.08]"
          />
          the only stage that changes
        </span>
      </motion.div>

      {/* Solid rule, not dashed: dashes now mean "unchanged from upstream" a
          few pixels above, and a divider borrowing that stroke would read as
          part of the legend. */}
      <motion.div
        variants={step}
        className="mt-4 grid gap-x-6 gap-y-2 border-t border-theme-border pt-4 font-mono text-xs text-theme-secondary sm:grid-cols-3"
      >
        <span>
          <span className="text-accent">&rsaquo;</span> Statewave adds{' '}
          <code className="text-theme-primary">statewave_client.py</code> + a{' '}
          <code className="text-theme-primary">--backend statewave</code> dispatch
        </span>
        <span>
          <span className="text-accent">&rsaquo;</span> gpt-4.1 extraction shared by Statewave &amp;
          mem0 OSS
        </span>
        <span>
          <span className="text-accent">&rsaquo;</span> judge &amp; scoring code untouched from
          upstream
        </span>
      </motion.div>
    </motion.div>
  )
}

/* ─── Run it ────────────────────────────────────────────────────────────── */

const INSTALL_SNIPPET = `git clone ${REPO_URL}.git
cd statewave-memory-benchmarks
pip install -r requirements.txt
export OPENAI_API_KEY=sk-...   # answerer + judge`

/* `note` is the retrieval caveat that used to sit as one line of mono text
 * under both panels, where it was noise on the Statewave tab and easy to miss
 * on the tab it actually qualifies. Per backend, it renders with the command
 * it applies to. */
const BACKEND_SNIPPETS: readonly {
  label: string
  series: SeriesKey
  code: string
  note: string
}[] = [
  {
    label: 'Statewave',
    series: 'statewave',
    code: `export STATEWAVE_URL=https://your-instance
export STATEWAVE_API_KEY=sw-...
python -m benchmarks.locomo.run \\
  --backend statewave \\
  --answerer-model gpt-4o \\
  --judge-model gpt-4o`,
    note: 'Honors the harness top-200 retrieval request.',
  },
  {
    label: 'mem0 cloud',
    series: 'mem0-cloud',
    code: `export MEM0_API_KEY=m0-...
python -m benchmarks.locomo.run \\
  --backend cloud \\
  --mem0-api-key "$MEM0_API_KEY" \\
  --answerer-model gpt-4o \\
  --judge-model gpt-4o`,
    note: 'Honors the harness top-200 retrieval request.',
  },
  {
    label: 'mem0 OSS',
    series: 'mem0-oss',
    code: `docker compose up -d   # Mem0 + Qdrant
python -m benchmarks.locomo.run \\
  --backend oss \\
  --mem0-host http://localhost:8888 \\
  --answerer-model gpt-4o \\
  --judge-model gpt-4o`,
    note: 'Caps retrieval at ≤20 memories/query by library default, where Statewave and cloud honor the top-200 request.',
  },
]

/**
 * Three steps on a numbered rail, capped at `max-w-3xl`.
 *
 * The panels used to run the full `max-w-7xl` measure while the longest shell
 * line is ~62 characters, so every block was a slab with text in its left
 * third. Narrowing them also pulls the copy control back next to the code it
 * copies, which is the whole point of the section.
 *
 * `active` lives here rather than inside the tablist because step 3 answers
 * "did it work?" for whichever backend step 2 is showing.
 */
function RunIt() {
  const [active, setActive] = useState<SeriesKey>('statewave')
  const current = BACKEND_SNIPPETS.find((b) => b.series === active) ?? BACKEND_SNIPPETS[0]

  return (
    <Section id="run" className="scroll-mt-32">
      <div className="mx-auto max-w-3xl">
        <div className="max-w-2xl">
          <p className="section-eyebrow mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            Reproduce it
          </p>
          <Heading
            id="run-it"
            className="font-heading text-3xl font-bold tracking-[-0.02em] text-theme-primary md:text-4xl"
          >
            Reproduce every number here
          </Heading>
          <p className="mt-4 text-base text-theme-secondary text-pretty">
            Copy-pasteable, straight from the harness README. LoCoMo shown; for LongMemEval swap in{' '}
            <code className="text-theme-primary">benchmarks.longmemeval.run</code> with{' '}
            <code className="text-theme-primary">--per-type 5</code>.
          </p>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-accent focus:outline-none"
          >
            Browse the harness on GitHub
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        <ol className="mt-10 list-none">
          <Step n={1} title="Clone &amp; install">
            <Terminal title="bash" code={INSTALL_SNIPPET} />
          </Step>

          <Step n={2} title="Run the harness">
            <BackendTerminal active={active} setActive={setActive} current={current} />
          </Step>

          <Step n={3} title="Check your numbers" last>
            <ExpectedResult series={current.series} />
          </Step>
        </ol>
      </div>
    </Section>
  )
}

/**
 * One step: number badge on a rail, title, content.
 *
 * The step number used to live as 11.5px mono inside the terminal's window
 * chrome — the structure of the section was its least visible element. The
 * rail carries the sequence so the chrome can go back to saying `bash`.
 */
function Step({
  n,
  title,
  children,
  last = false,
}: {
  n: number
  title: string
  children: ReactNode
  last?: boolean
}) {
  return (
    <li className="relative pl-10 sm:pl-12">
      {!last && (
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-[13px] top-8 w-px"
          style={{ background: 'var(--viz-border-strong)' }}
        />
      )}
      <span
        className="absolute left-0 top-0 flex h-[27px] w-[27px] items-center justify-center rounded-full border font-mono text-[12px] tabular-nums"
        style={{
          background: 'var(--viz-card)',
          borderColor: 'var(--viz-border-strong)',
          color: 'var(--viz-text-2)',
        }}
      >
        {n}
      </span>
      <h3 className="text-[15px] font-semibold leading-[27px] text-theme-primary">{title}</h3>
      <div className={last ? 'mt-3' : 'mt-3 pb-10'}>{children}</div>
    </li>
  )
}

/**
 * Step 2: the three backend invocations, tabbed rather than tiled.
 *
 * Side by side these were three cramped columns of wrapped shell text. Only
 * one is ever relevant to a given reader (you run the backend you have), so
 * a tablist gives each command the full width and makes the section
 * something you use rather than read.
 *
 * The tabs render *inside* the panel's window chrome. Floating above it they
 * sat on `--theme-surface-2`, a lighter fill than the `--viz-code-bg` panel
 * they controlled, so the selected tab detached from its own content instead
 * of belonging to it.
 */
function BackendTerminal({
  active,
  setActive,
  current,
}: {
  active: SeriesKey
  setActive: (s: SeriesKey) => void
  current: (typeof BACKEND_SNIPPETS)[number]
}) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Roving focus: ←/→ move between tabs, per the WAI-ARIA tabs pattern.
  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const dir = e.key === 'ArrowRight' ? 1 : -1
    const next = (index + dir + BACKEND_SNIPPETS.length) % BACKEND_SNIPPETS.length
    setActive(BACKEND_SNIPPETS[next].series)
    tabRefs.current[next]?.focus()
  }

  const tabs = (
    <div role="tablist" aria-label="Benchmark backend" className="flex min-w-0 flex-wrap gap-1">
      {BACKEND_SNIPPETS.map((b, i) => {
        const selected = b.series === active
        return (
          <button
            key={b.series}
            ref={(el) => {
              tabRefs.current[i] = el
            }}
            role="tab"
            type="button"
            id={`backend-tab-${b.series}`}
            aria-selected={selected}
            aria-controls={`backend-panel-${b.series}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => setActive(b.series)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12.5px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent focus:outline-none"
            style={{
              background: selected ? 'var(--viz-fill)' : 'transparent',
              color: selected ? 'var(--viz-text)' : 'var(--viz-text-3)',
            }}
          >
            <span
              aria-hidden="true"
              className="h-2 w-2 flex-none rounded-xs"
              style={{ background: SERIES_COLOR[b.series], opacity: selected ? 1 : 0.4 }}
            />
            {b.label}
          </button>
        )
      })}
    </div>
  )

  return (
    <div
      role="tabpanel"
      id={`backend-panel-${current.series}`}
      aria-labelledby={`backend-tab-${current.series}`}
    >
      <Terminal
        title={`bash · ${current.label}`}
        code={current.code}
        accent={SERIES_COLOR[current.series]}
        tabs={tabs}
      />
      <p className="mt-2.5 pl-1 text-[12.5px] leading-relaxed text-theme-muted">
        <span style={{ color: SERIES_COLOR[current.series] }}>&rsaquo;</span> {current.label}{' '}
        {current.note}
      </p>
    </div>
  )
}

/**
 * Step 3: what a correct run lands on.
 *
 * The section promised "reproduce every number" but stopped at launching the
 * harness, so a reader had no way to tell a matching run from a broken one.
 * Figures come from SYSTEMS like everywhere else on the page, and the bars sit
 * on the same zoomed axis as the scoreboard so the two read as one measurement.
 *
 * Nothing here animates: these are the figures the page's credibility rests
 * on, and a width transition on a tab switch would redraw the claim.
 */
function ExpectedResult({ series }: { series: SeriesKey }) {
  const system = SYSTEMS.find((s) => s.key === series) ?? STATEWAVE
  const color = SERIES_COLOR[series]

  return (
    <div
      className="rounded-2xl border px-5 py-4"
      style={{ background: 'var(--viz-card)', borderColor: 'var(--viz-border-strong)' }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="font-mono text-[11.5px]" style={{ color: 'var(--viz-text-3)' }}>
          Published result · {system.name}
        </p>
        <p className="font-mono text-[11px]" style={{ color: 'var(--viz-text-3)' }}>
          axis {AXIS.zoom.label}
        </p>
      </div>

      <dl className="mt-4 space-y-3.5">
        {(Object.keys(METRICS) as Metric[]).map((m) => (
          <div key={m}>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-sm font-medium text-theme-primary">
                {METRICS[m].label}
                <span className="ml-2 font-mono text-[11px] text-theme-muted">{METRICS[m].n}</span>
              </dt>
              <dd className="font-mono text-sm tabular-nums text-theme-primary">
                {fmt(system[m])}
              </dd>
            </div>
            <div
              className="mt-1.5 h-1.5 w-full overflow-hidden rounded-xs"
              style={{ background: 'var(--viz-track)' }}
            >
              <div
                className="h-full rounded-xs"
                style={{ width: `${axisPct(system[m], 'zoom')}%`, background: color }}
              />
            </div>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-[13px] leading-relaxed text-theme-secondary text-pretty">
        The same figures charted on{' '}
        <a
          href="#scoreboard"
          className="text-accent transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-accent focus:outline-none"
        >
          the scoreboard
        </a>
        . Answerer and judge are both gpt-4o, so a rerun can land slightly either side of these.
      </p>
    </div>
  )
}

/**
 * Terminal-style snippet panel.
 *
 * Surface is `--viz-code-bg` (a deep navy in the same family as the page)
 * rather than `--theme-code-bg` (a near-black); the latter read as a flat
 * black slab dropped onto the navy page. Window chrome, a colored prompt,
 * and dimmed comments make it read as a shell session.
 *
 * The copied text is always the raw `code` string: the prompt glyph and the
 * highlighting are presentation only and never reach the clipboard.
 *
 * Border weight is uniform across steps. Step 2 used to carry a full-saturation
 * series stroke while step 1 sat on a 10%-alpha hairline, which read as step 1
 * being the optional one — it is the prerequisite. Series identity now rides
 * the header rule and the selected tab's swatch instead of the panel outline.
 */
function Terminal({
  title,
  code,
  accent,
  tabs,
}: {
  title: string
  code: string
  accent?: string
  tabs?: ReactNode
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl border shadow-sm"
      style={{ background: 'var(--viz-code-bg)', borderColor: 'var(--viz-border-strong)' }}
    >
      <div
        className="flex items-center justify-between gap-3 border-b px-4 py-2.5"
        style={{ borderColor: accent ?? 'var(--viz-border)' }}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span aria-hidden="true" className="flex flex-none items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
          </span>
          {tabs ?? (
            <span
              className="truncate font-mono text-[11.5px]"
              style={{ color: 'var(--viz-text-3)' }}
            >
              {title}
            </span>
          )}
        </span>
        <CodeCopyButton code={code} label={`Copy the ${title} commands`} />
      </div>

      <pre
        className="m-0 overflow-x-auto whitespace-pre px-5 py-4 font-mono text-[12.5px] leading-[1.85]"
        style={{ color: 'var(--viz-code-text)' }}
      >
        {code.split('\n').map((line, i) => (
          <ShellLine key={i} line={line} />
        ))}
      </pre>
    </div>
  )
}

/**
 * One rendered shell line: prompt, command body, trailing comment.
 *
 * Continuation lines (the wrapped half of a `\`-broken command) are indented
 * in the source and get no prompt, so a multi-line invocation reads as one
 * command rather than several.
 */
function ShellLine({ line }: { line: string }) {
  const isContinuation = line.startsWith(' ')
  const hash = line.indexOf('#')
  const body = hash === -1 ? line : line.slice(0, hash)
  const comment = hash === -1 ? null : line.slice(hash)

  return (
    <div>
      {!isContinuation ? (
        <span className="select-none text-accent">$ </span>
      ) : (
        <span className="select-none" aria-hidden="true">
          {'  '}
        </span>
      )}
      <span>{body}</span>
      {comment && <span style={{ color: 'var(--viz-code-muted)' }}>{comment}</span>}
    </div>
  )
}

/* ─── Scope ─────────────────────────────────────────────────────────────── */

function Scope() {
  return (
    <Section id="scope" className="scroll-mt-32 bg-surface-1">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <p className="section-eyebrow mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            Scope
          </p>
          <Heading
            id="scope-heading"
            className="font-heading text-3xl font-bold tracking-[-0.02em] text-theme-primary md:text-4xl"
          >
            What we claim, and what we don&apos;t
          </Heading>
          <p className="mt-4 text-base text-theme-secondary text-pretty">
            An honest benchmark is worth as much for where it stops as for what it shows.
          </p>
        </div>

        <StaggerGrid className="mt-8 grid gap-4 md:grid-cols-2">
          <ScopeList heading="What we claim" tone="success" items={CLAIMS} />
          <ScopeList heading="What we don't claim" tone="muted" items={NON_CLAIMS} />
        </StaggerGrid>
      </div>
    </Section>
  )
}

function ScopeList({
  heading,
  tone,
  items,
}: {
  heading: string
  tone: 'success' | 'muted'
  items: readonly string[]
}) {
  const good = tone === 'success'
  return (
    <LiftCard className="bg-surface-0">
      <div
        className={`flex items-center gap-2 border-b px-6 py-3.5 ${
          good
            ? 'border-[color:var(--color-success)]/25 bg-[color:var(--color-success)]/[0.05]'
            : 'border-theme-border bg-theme-border/20'
        }`}
      >
        <span
          className={`font-mono text-xs font-semibold uppercase tracking-wide ${
            good ? 'text-success' : 'text-theme-muted'
          }`}
        >
          {heading}
        </span>
      </div>
      <ul className="px-6 py-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 py-3">
            <span
              aria-hidden="true"
              className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full text-[11px] font-bold ${
                good
                  ? 'bg-[color:var(--color-success)]/12 text-success'
                  : 'bg-theme-border/50 text-theme-muted'
              }`}
            >
              {good ? '✓' : '–'}
            </span>
            <p className="text-[14px] leading-relaxed text-theme-secondary text-pretty">{item}</p>
          </li>
        ))}
      </ul>
    </LiftCard>
  )
}

/* ─── Governance bridge ─────────────────────────────────────────────────── */

/**
 * The section makes a comparison, so it is drawn as one.
 *
 * Four icon cards stated the contrast in prose and then showed a feature list
 * that never mentioned mem0 again — the headline's claim was carried entirely
 * by the headline. As a matrix the argument is the shape of the table: the
 * retrieval band is a near-tie, the governance band is empty down one side.
 * That also retires the trailing "governance is where Statewave pulls ahead"
 * line, which restated the intro paragraph 60 words after it.
 */
function GovernanceBridge() {
  return (
    <Section id="governance" className="scroll-mt-32">
      <div className="max-w-2xl">
        <p className="section-eyebrow mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
          Beyond retrieval
        </p>
        <Heading
          id="governance-heading"
          className="font-heading text-3xl font-bold tracking-[-0.02em] text-theme-primary md:text-4xl"
        >
          {/* The heading face sets `0` with no slash or dot, so at 36px "mem0"
              reads as "memO" and the sentence lands as a memo. The brand token
              takes the mono face, whose zero is unambiguous. */}
          What <span className="font-mono">mem0</span> doesn&apos;t do
        </Heading>
        <p className="mt-4 text-base text-theme-secondary text-pretty">
          Retrieval is table stakes, and the benchmark above settles it. Statewave&apos;s real
          difference is governance: the controls a memory layer needs before it touches
          production data.
        </p>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-theme-border">
        <table className="w-full min-w-[38rem] border-collapse text-left">
          <caption className="sr-only">
            Statewave compared with mem0 cloud: benchmark retrieval scores, then governance
            capabilities.
          </caption>
          <thead>
            <tr className="bg-surface-1">
              <th
                scope="col"
                className="px-5 py-3.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-theme-muted"
              >
                Capability
              </th>
              <MatrixColumnHead series="mem0-cloud" name="mem0 cloud" />
              <MatrixColumnHead series="statewave" name="Statewave" lead />
            </tr>
          </thead>
          <tbody>
            <MatrixGroupRow label="Retrieval" note="what the benchmark measures" />
            {RETRIEVAL_ROWS.map((r) => (
              <MatrixRow key={r.title} title={r.title} body={r.body}>
                <ScoreCell value={r.mem0} />
                <ScoreCell value={r.statewave} lead />
              </MatrixRow>
            ))}

            <MatrixGroupRow label="Governance" note="what it doesn't" />
            {GOVERNANCE_ROWS.map((r) => (
              <MatrixRow key={r.title} title={r.title} body={r.body}>
                <MarkCell present={false} />
                <MarkCell present />
              </MatrixRow>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        <Button to="/product#audit-governance">See how Statewave governs memory →</Button>
        <p className="font-mono text-[11px] text-theme-muted">
          mem0 cloud is the paid tier — their strongest showing on the retrieval rows.
        </p>
      </div>
    </Section>
  )
}

/** Series-colored column header. Swatch matches the scoreboard legend exactly. */
function MatrixColumnHead({
  series,
  name,
  lead = false,
}: {
  series: SeriesKey
  name: string
  lead?: boolean
}) {
  return (
    <th
      scope="col"
      className={`w-[9rem] px-5 py-3.5 text-center ${lead ? 'bg-accent/[0.05]' : ''}`}
    >
      <span className="inline-flex items-center gap-2">
        <span
          aria-hidden="true"
          className="h-2.5 w-2.5 flex-none rounded-[3px]"
          style={{ background: SERIES_COLOR[series] }}
        />
        <span
          className={`text-[13px] ${lead ? 'font-bold text-theme-primary' : 'font-semibold text-theme-secondary'}`}
        >
          {name}
        </span>
      </span>
    </th>
  )
}

/** Band divider naming what the rows beneath it are, and why they're there. */
function MatrixGroupRow({ label, note }: { label: string; note: string }) {
  return (
    <tr>
      <th
        scope="colgroup"
        colSpan={3}
        className="border-y border-theme-border bg-surface-1/60 px-5 py-2.5 text-left"
      >
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
          {label}
        </span>
        <span className="ml-2.5 font-mono text-[10px] text-theme-muted">{note}</span>
      </th>
    </tr>
  )
}

function MatrixRow({
  title,
  body,
  children,
}: {
  title: string
  body: string
  children: ReactNode
}) {
  return (
    <tr className="border-t border-theme-border/50 transition-colors hover:bg-theme-border/15">
      <th scope="row" className="px-5 py-4 text-left font-normal">
        <span className="block text-[14px] font-semibold text-theme-primary">{title}</span>
        <span className="mt-1 block max-w-[46ch] text-[12.5px] leading-relaxed text-theme-secondary text-pretty">
          {body}
        </span>
      </th>
      {children}
    </tr>
  )
}

function ScoreCell({ value, lead = false }: { value: string; lead?: boolean }) {
  return (
    <td className={`px-5 py-4 text-center ${lead ? 'bg-accent/[0.05]' : ''}`}>
      <span
        className={`font-mono text-[15px] tabular-nums ${
          lead ? 'font-bold text-theme-primary' : 'font-semibold text-theme-secondary'
        }`}
      >
        {value}
      </span>
    </td>
  )
}

/**
 * Present / not-offered mark. The glyph is decorative and duplicated as
 * visually-hidden text, so the row's meaning never rests on a symbol alone.
 */
function MarkCell({ present }: { present: boolean }) {
  return (
    <td className={`px-5 py-4 text-center ${present ? 'bg-accent/[0.05]' : ''}`}>
      <span aria-hidden="true" className={present ? 'text-[15px] text-success' : 'text-[15px] text-theme-muted/60'}>
        {present ? '✓' : '—'}
      </span>
      <span className="sr-only">{present ? 'Included' : 'Not offered'}</span>
    </td>
  )
}

/* ─── FAQ ───────────────────────────────────────────────────────────────── */

/* Native <details> disclosure, the same pattern as the homepage FAQ, so the
 * section is keyboard- and AT-navigable for free and the collapsed answers
 * stay in the DOM for crawlers. First item open so the section reads as
 * content on first paint rather than a stack of closed bars. */
function Faq() {
  return (
    <Section id="faq" className="scroll-mt-32 bg-surface-1">
      <div className="mx-auto max-w-4xl">
        <div className="max-w-2xl">
          <p className="section-eyebrow mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            FAQ
          </p>
          <Heading
            id="faq-heading"
            className="font-heading text-3xl font-bold tracking-[-0.02em] text-theme-primary md:text-4xl"
          >
            Questions you&apos;re right to ask
          </Heading>
          <p className="mt-4 text-base text-theme-secondary text-pretty">
            No spin. The awkward questions, answered directly.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {FAQS.map((f, i) => (
            <details
              key={f.q}
              {...(i === 0 ? { open: true } : {})}
              className="group rounded-2xl border border-theme-border bg-surface-0 transition-colors hover:border-brand-500/35"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-4 [&::-webkit-details-marker]:hidden">
                <h3 className="text-[16.5px] font-semibold leading-snug text-theme-primary text-pretty">
                  {f.q}
                </h3>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-theme-border bg-surface-1 transition-transform duration-200 group-open:rotate-180 group-hover:border-brand-500/40">
                  <svg
                    className="h-4 w-4 text-theme-secondary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="px-6 pb-6">
                <div className="mb-4 h-px bg-theme-border" />
                <p className="text-[15px] leading-relaxed text-theme-secondary">{f.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ─── Closing CTA ───────────────────────────────────────────────────────── */

function ClosingCta() {
  return (
    <Section>
      <div className="relative">
        <div className="section-glow" aria-hidden="true" />
        <div className="relative overflow-hidden rounded-3xl border border-theme-border bg-surface-1 px-8 py-14 text-center shadow-sm sm:px-10">
          <p className="font-mono text-xs font-semibold uppercase tracking-wide text-accent">
            Don&apos;t take our word for it
          </p>
          <h2 className="mx-auto mt-3.5 max-w-[20ch] font-heading text-3xl font-bold tracking-[-0.02em] text-theme-primary md:text-4xl">
            Fork the harness and re-run every number yourself
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-theme-secondary text-pretty">
            Apache-2.0, one code path, mem0&apos;s own judge unchanged. Clone it, diff it against
            upstream, reproduce every result.
          </p>
          <div className="mx-auto mt-8 flex flex-wrap justify-center gap-3">
            <Button href={REPO_URL} size="lg">
              <GitHubIcon className="h-4 w-4" />
              Fork it on GitHub
            </Button>
            <Button to="/" variant="secondary" size="lg">
              Explore Statewave →
            </Button>
          </div>
        </div>
      </div>
    </Section>
  )
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}
