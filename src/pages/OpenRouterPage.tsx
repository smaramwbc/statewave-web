import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router'
import {
  Send,
  Search,
  Waypoints,
  MessageSquareMore,
  Clock3,
  ShieldCheck,
  ShieldAlert,
  Radio,
  KeyRound,
  CircleCheck,
  TriangleAlert,
  Layers,
  Server,
  ServerCrash,
  Check,
  Minus,
  type LucideIcon,
} from 'lucide-react'
import { Heading } from '../components/Heading'
import { Button } from '../components/Button'
import { CodeCopyButton } from '../components/CodeCopyButton'
import { PageFaq } from '../components/PageFaq'
import { Section } from '../components/Section'
import { usePageSEO } from '../lib/seo'
import { OPENROUTER_PROXY_VERSION as VERSION } from '../lib/seo-meta'

/* Landing page for statewave-openrouter, the OpenAI-compatible proxy that
 * gives OpenRouter calls persistent memory.
 *
 * The mockups and diagrams use the `--viz-*` tokens (src/index.css) so their
 * neutrals flip with the light/dark theme while the accent purple/blue stays
 * branded in both — same convention as GroundedShopAssistantPage.
 */

const REPO_URL = 'https://github.com/smaramwbc/statewave-openrouter'

/* sw-card carries the resting elevation. The hover lift follows the /about and
 * /benchmarks LiftCard recipe, but the shadow is accent-tinted rather than
 * black: sw-card's `rgba(0,0,0,.16)` is invisible against the dark surface, so
 * in dark mode the lift had no depth cue at all. focus-within mirrors hover so
 * a card reached by keyboard gets the same affordance as one under a pointer. */
const CARD =
  'sw-card rounded-2xl border border-brand-500/20 bg-surface-1/45 ' +
  'transition-[border-color,transform,box-shadow] duration-300 ' +
  'hover:-translate-y-0.5 hover:border-brand-500/45 ' +
  'hover:shadow-[0_18px_50px_rgba(122,92,255,0.14)] ' +
  'focus-within:-translate-y-0.5 focus-within:border-brand-500/45 ' +
  'focus-within:shadow-[0_18px_50px_rgba(122,92,255,0.14)]'

/* Secondary notes — the caveats and edge cases that follow a diagram or a
 * code panel — sit as open columns under a hairline rather than in CARD.
 * Every block in a section was boxed, so a diagram, a code panel and a row
 * of notes stacked into one wall of borders with ~20px between them. The
 * primary artefacts keep their box; the notes that comment on them don't
 * need one, and the section gets the air the boxes were taking. */
const NOTE = 'min-w-0 border-t border-brand-500/25 pt-5'

/* ─── Page shell ─────────────────────────────────────────────────────────────
 * The page is one argument, not nine equal chapters, so the section shells
 * are not interchangeable. `tier` drives padding and heading size together,
 * which is what makes the rhythm legible while scrolling rather than only
 * when reading; `surface` alternates the ground so consecutive sections read
 * as separate slabs.
 *
 * Depth here is structural — container, rhythm, hairline, elevation — rather
 * than stacked radial glows. The source design layers two or three washes per
 * section; at real viewport sizes that reads as haze over the content instead
 * of hierarchy, and it buries the one wash that earns its place (the hero).
 */
type Tier = 'lead' | 'body'

/* A lead band announces itself with extra space ABOVE; every band closes with
 * the same space below. Padding between two sections adds rather than
 * collapses, so giving lead bands a bigger bottom too made the boundary gaps
 * land on four different values (192/240/272/288px at desktop). Matching the
 * bottoms collapses that to two — 192px between bands, 224px before a lead
 * one — which reads as intentional rhythm instead of drift. */
const BAND_PAD: Record<Tier, string> = {
  lead: 'pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24',
  body: 'py-16 sm:py-20 lg:py-24',
}

/* A 62 / 48 / 36px scale down from the h1. Body sections were 30px, which is
 * barely above large body text and left five of the eight sections reading
 * flat; it also put them BELOW the shared PageFaq heading (text-3xl md:text-4xl
 * = 36px) sitting directly underneath, so a section title looked subordinate to
 * the FAQ. Body now matches that 36px and lead clears it.
 *
 * Leading is per tier rather than inherited: the 1.5 default puts a 72px gap
 * between the two lines of a 48px heading, which reads as two unrelated
 * sentences. Headlines tighten as they grow. */
const HEAD_SIZE: Record<Tier, string> = {
  lead: 'text-[clamp(1.85rem,4.8vw,3rem)] leading-[1.1]',
  body: 'text-[clamp(1.6rem,3.2vw,2.25rem)] leading-[1.15]',
}

/* Same cadence as /benchmarks and the homepage hero, so the page's motion
 * reads as part of the site rather than its own dialect. */
const STAGGER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
}
const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 0.61, 0.36, 1] } },
}
const STILL: Variants = { hidden: {}, show: {} }

/** One child step of a Band's stagger. */
function Rise({
  className = '',
  style,
  children,
}: {
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  const reduced = useReducedMotion() ?? false
  return (
    <motion.div variants={reduced ? STILL : FADE_UP} className={className} style={style}>
      {children}
    </motion.div>
  )
}

/**
 * A full-bleed section slab. Replaces the shared <Section> on this page:
 * Section fades its whole subtree as one 40px block, which on a nine-section
 * page is the same blunt move nine times. This orchestrates its children
 * instead, so headline, prose and figure arrive in order.
 */
function Band({
  id,
  tier = 'body',
  surface = false,
  className = '',
  children,
}: {
  id: string
  tier?: Tier
  /** Raise onto the alternate ground, with hairlines top and bottom. */
  surface?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <motion.section
      id={id}
      variants={STAGGER}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      className={`relative scroll-mt-32 ${BAND_PAD[tier]} ${className}`}
      /* A surface band fades in and out of the page ground rather than sitting
         behind two hairlines. `border-y` reads as a hard rule in dark mode,
         where --theme-border is a violet-tinted line rather than a faint grey
         one, and nine of them turned the page into stacked boxes. Interpolating
         to surface-0 explicitly (not `transparent`, which fades through black)
         keeps the seam invisible in both themes. This is what the source design
         specified; the borders were my shortcut. */
      style={
        surface
          ? ({
            background:
              'linear-gradient(180deg, var(--theme-surface-0) 0%, var(--theme-surface-1) 7%, var(--theme-surface-1) 93%, var(--theme-surface-0) 100%)',
            // Scroll-shadow cover colour for any .sw-scroll-x inside this band.
            '--sw-scroll-bg': 'var(--theme-surface-1)',
          } as CSSProperties)
          : undefined
      }
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6">{children}</div>
    </motion.section>
  )
}

/** Heading + optional lede, sized by the band's tier. No eyebrow label — the
 *  heading text itself carries the section's subject (see [[no-eyebrows]]
 *  note above BAND_PAD), so hierarchy comes from scale and the lede, not a
 *  small-caps tag repeated at the top of every section. */
function BandHead({
  id,
  tier = 'body',
  children,
  lede,
}: {
  id: string
  tier?: Tier
  children: ReactNode
  lede?: ReactNode
}) {
  // Both caps are in `ch`, which resolves against each element's OWN font-size:
  // 22ch on the heading is a headline measure at any tier, 62ch on the lede is
  // a prose measure at 16px. One shared cap on the wrapper would size both
  // against the wrapper's 16px and squeeze a 2.75rem lead heading into ~500px.
  return (
    <Rise>
      <Heading
        id={id}
        className={`max-w-[22ch] font-heading ${HEAD_SIZE[tier]} font-semibold tracking-[-0.02em] text-theme-primary`}
      >
        {children}
      </Heading>
      {lede && <p className="mt-4 max-w-[62ch] text-theme-secondary">{lede}</p>}
    </Rise>
  )
}

/* ─── Small shared pieces ────────────────────────────────────────────────── */

function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`section-eyebrow font-mono text-xs uppercase tracking-[0.14em] text-theme-muted ${className}`}>
      {children}
    </p>
  )
}

/** Inline link into the rest of the site. The page used to link nowhere at
 *  all — one self-anchor in the whole body — which left it a cul-de-sac for
 *  readers and a dead end for crawlers. Targets are chosen where the prose
 *  already raises the concept, not bolted on. */
function L({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="text-accent underline decoration-accent/35 underline-offset-2 transition-colors hover:decoration-accent"
    >
      {children}
    </Link>
  )
}

/** Inline code inside prose. `--viz-indigo` so it stays legible on both the
 *  light card and the dark surface, unlike a fixed violet. */
function C({ children }: { children: ReactNode }) {
  return (
    <code
      className="rounded px-1.5 py-0.5 font-mono text-[0.88em]"
      style={{ color: 'var(--viz-indigo)', background: 'var(--viz-fill)' }}
    >
      {children}
    </code>
  )
}

/** Circular flat-stroke icon badge — the site's own icon-card dialect
 *  (see HomePage.tsx's feature cards), reused here so every diagram node and
 *  icon row speaks the same visual language instead of a new one. No
 *  gradient, no glow: a plain accent- or amber-tinted ring. */
function IconBadge({
  icon: Icon,
  tone = 'accent',
  size = 'md',
}: {
  icon: LucideIcon
  tone?: 'accent' | 'amber' | 'neutral'
  size?: 'sm' | 'md'
}) {
  const box = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'
  const iconBox = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
  const color =
    tone === 'amber'
      ? { color: 'var(--viz-amber)', borderColor: 'rgba(245,158,11,0.35)' }
      : tone === 'neutral'
        ? { color: 'var(--viz-text-3)', borderColor: 'var(--viz-border-strong)' }
        : { color: 'var(--color-accent)', borderColor: 'rgba(122,92,255,0.35)' }
  return (
    <span
      className={`flex ${box} shrink-0 items-center justify-center rounded-full border`}
      style={color}
    >
      <Icon className={iconBox} strokeWidth={1.8} aria-hidden="true" />
    </span>
  )
}

/** Icon-led list row. Replaces the old gradient-dot `Bullet`: a real icon
 *  says what kind of fact this is (kept vs. changed vs. failed) before the
 *  reader parses the sentence, which is the point — less reliance on prose
 *  alone to carry meaning. */
function IconRow({
  icon: Icon,
  tone = 'accent',
  children,
}: {
  icon: LucideIcon
  tone?: 'accent' | 'muted'
  children: ReactNode
}) {
  return (
    <li className="flex items-start gap-2.5 text-[14px] leading-[1.55] text-theme-secondary">
      <Icon
        className="mt-[3px] h-4 w-4 shrink-0"
        strokeWidth={2}
        aria-hidden="true"
        style={{ color: tone === 'muted' ? 'var(--viz-text-3)' : 'var(--color-accent)' }}
      />
      <span>{children}</span>
    </li>
  )
}

/** One node in a linear (non-branching) card diagram: icon badge, small
 *  mono eyebrow, short title. Used by the Request Flow and Subject Timeline
 *  diagrams so a "flowchart" renders as real DOM cards, not SVG text. */
function NodeCard({
  icon,
  tone = 'accent',
  eyebrow,
  title,
  dashed = false,
  stacked = false,
  className = '',
}: {
  icon: LucideIcon
  tone?: 'accent' | 'amber'
  eyebrow: string
  title: string
  dashed?: boolean
  /** Icon above the text, and text that wraps instead of truncating — for
   *  cards that share a row's width equally rather than sizing to content. */
  stacked?: boolean
  className?: string
}) {
  const clip = stacked ? '' : 'truncate'
  return (
    <div
      className={`flex rounded-xl ${
        stacked
          ? 'min-w-0 flex-col items-start gap-3 p-4'
          : 'min-w-[190px] shrink-0 items-center gap-3 p-3.5'
      } ${className}`}
      style={{
        background: 'var(--viz-card)',
        border: `1px ${dashed ? 'dashed' : 'solid'} ${
          tone === 'amber' ? 'rgba(245,158,11,0.4)' : 'var(--viz-border)'
        }`,
      }}
    >
      <IconBadge icon={icon} tone={tone} size="sm" />
      <div className="min-w-0">
        <div
          className={`${clip} font-mono text-[10px] uppercase tracking-[0.1em]`}
          style={{ color: 'var(--viz-text-3)' }}
        >
          {eyebrow}
        </div>
        <div className={`${clip} mt-0.5 text-[13.5px] font-medium text-theme-primary`}>
          {title}
        </div>
      </div>
    </div>
  )
}

/** Thin connector between two NodeCards in a row. `dashed` marks a branch
 *  that leaves the main path (e.g. an async write), matching the dashed
 *  treatment the SVG diagrams already use for the same idea. */
function NodeConnector({ dashed = false }: { dashed?: boolean }) {
  return (
    <div aria-hidden="true" className="flex w-6 shrink-0 items-center justify-center sm:w-9">
      <div
        className="h-px w-full"
        style={
          dashed
            ? {
              backgroundImage:
                'linear-gradient(to right, var(--viz-indigo) 50%, transparent 50%)',
              backgroundSize: '6px 1px',
              opacity: 0.7,
            }
            : { background: 'var(--viz-text-3)', opacity: 0.5 }
        }
      />
    </div>
  )
}

/** A small mark for the gap between two Bands, so it reads as an intentional
 *  seam rather than empty space with an unexplained darker patch where the
 *  surface fade sits. Deliberately not used between every section — see the
 *  note above `BAND_PAD`. */
function SectionDivider() {
  return (
    <div aria-hidden="true" className="flex justify-center">
      <div
        className="h-px w-40"
        style={{
          background:
            'linear-gradient(to right, transparent, var(--viz-border-strong), transparent)',
        }}
      />
    </div>
  )
}

/** Percent position/size within a diagram's SVG viewBox, for matching an
 *  absolutely positioned GateNode to a connector path drawn in that space. */
function diagramPct(value: number, total: number): string {
  return `${(value / total) * 100}%`
}

/** A node in a *branching* card diagram (Trust Gate, Fails-Open): absolutely
 *  positioned over a connector-only SVG layer at percentages matching the
 *  SVG's own coordinate space, so the existing bezier fork/merge math keeps
 *  driving the layout while the node itself renders as a real HTML card
 *  with an icon. `active` mirrors the old opacity-dim treatment for a
 *  branch that isn't the one currently traced/selected; the interactive
 *  props (onMouseEnter etc.) are spread onto the card so hover/keyboard
 *  trace behavior carries over unchanged from the SVG version. */
function GateNode({
  icon,
  tone = 'accent',
  title,
  sub,
  active = true,
  dashed = false,
  style,
  interactive,
}: {
  /** Omit on a tight/"boring" shared node (e.g. a fork's entry or exit) —
   *  the icon+padding overhead doesn't leave room for its label otherwise. */
  icon?: LucideIcon
  tone?: 'accent' | 'amber' | 'neutral'
  title: string
  sub?: string
  active?: boolean
  dashed?: boolean
  style: CSSProperties
  interactive?: Record<string, unknown>
}) {
  const accentColor =
    tone === 'amber' ? 'var(--viz-amber)' : tone === 'neutral' ? 'var(--viz-text-3)' : 'var(--color-accent)'
  return (
    <div
      {...interactive}
      className={`absolute flex items-center gap-2.5 overflow-hidden rounded-xl px-3 transition-opacity duration-300 ${
        icon ? '' : 'justify-center text-center'
      } ${interactive ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70' : ''}`}
      style={{
        ...style,
        opacity: active ? 1 : 0.5,
        background: active && tone !== 'neutral' ? 'var(--viz-card-2)' : 'var(--viz-card)',
        border: `1px ${dashed ? 'dashed' : 'solid'} ${active && tone !== 'neutral' ? accentColor : 'var(--viz-border)'}`,
      }}
    >
      {icon && <IconBadge icon={icon} tone={tone} size="sm" />}
      <div className="min-w-0">
        <div
          className="text-[12.5px] font-medium leading-[1.25]"
          style={{ color: active && tone !== 'neutral' ? accentColor : 'var(--viz-text)' }}
        >
          {title}
        </div>
        {sub && (
          <div
            className="mt-0.5 font-mono text-[10px] leading-[1.3]"
            style={{ color: 'var(--viz-text-3)' }}
          >
            {sub}
          </div>
        )}
      </div>
    </div>
  )
}

/* Syntax spans for the code panels. */
const kw = { color: 'var(--viz-code-keyword)' }
const str = { color: 'var(--viz-code-string)' }
const attr = { color: 'var(--viz-code-attr)' }
const dim = { color: 'var(--viz-code-muted)' }
const txt = { color: 'var(--viz-code-text)' }

function CodePanel({
  label,
  code,
  children,
  className = '',
  headerExtra,
  flush = false,
}: {
  label: string
  /** Plain-text source handed to the copy button. */
  code: string
  /** Syntax-highlighted rendering of the same source. */
  children: ReactNode
  className?: string
  headerExtra?: ReactNode
  /** Lines carry their own horizontal padding (highlighted panels). */
  flush?: boolean
}) {
  return (
    <div
      className={`min-w-0 overflow-hidden rounded-2xl ${className}`}
      style={{
        background: 'var(--viz-code-bg)',
        border: '1px solid var(--viz-border)',
      }}
    >
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5"
        style={{
          borderBottom: '1px solid var(--viz-border)',
          background: 'var(--viz-shell-header)',
        }}
      >
        <span className="font-mono text-xs" style={{ color: 'var(--viz-text-3)' }}>
          {label}
        </span>
        <div className="flex items-center gap-3">
          {headerExtra}
          <CodeCopyButton code={code} label={`Copy the ${label} snippet`} />
        </div>
      </div>
      <pre
        className={`overflow-x-auto font-mono text-[13px] leading-[1.85] ${flush ? 'py-4' : 'px-4 py-4'
          }`}
        style={txt}
      >
        {children}
      </pre>
    </div>
  )
}

function DataTable({
  headers,
  rows,
  minWidth,
}: {
  headers: readonly string[]
  rows: readonly (readonly ReactNode[])[]
  minWidth: number
}) {
  return (
    <div className={`overflow-hidden ${CARD}`}>
      <div className="sw-scroll-x overflow-x-auto">
        <table
          className="w-full border-collapse text-sm"
          style={{ minWidth: `${minWidth}px` }}
        >
          <thead>
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-[18px] py-3.5 text-left font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-theme-muted"
                  style={{ borderBottom: '1px solid var(--viz-border)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr
                key={r}
                className="transition-colors duration-200 hover:bg-[var(--viz-fill)]"
              >
                {row.map((cell, c) => (
                  <td
                    key={c}
                    className={`px-[18px] py-4 align-top ${c === 0
                      ? 'whitespace-nowrap font-mono text-[13px]'
                      : 'text-theme-secondary'
                      }`}
                    style={{
                      borderBottom:
                        r === rows.length - 1 ? undefined : '1px solid var(--viz-border)',
                      color: c === 0 ? 'var(--viz-indigo)' : undefined,
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* The hero card: one real call, answered twice.
 *
 * It is framed as a request inspector rather than a chat window, because the
 * buyer is an engineer deciding whether to route production traffic through a
 * proxy. The header carries the actual endpoint, status and wall clock; the
 * memory-enabled branch carries the bundle that produced its answer.
 *
 * The example is a returning support customer, which is the workflow Statewave
 * is actually bought for. An earlier pass asked what coffee the user drinks:
 * accurate to the mechanism, but it read as a toy demo rather than something an
 * organisation runs.
 */
const HERO_PROMPT = 'Has this customer hit this before?'

const HERO_ANSWERS = [
  {
    key: 'bare',
    label: 'no subject header',
    meta: null,
    answer: 'I have no previous context for this customer.',
  },
  {
    key: 'memory',
    label: 'X-Statewave-Subject: acct:8841',
    meta: '3 episodes · 412 tokens',
    answer:
      'Twice in the last 30 days, both SSO timeouts following the 14:00 deploy.',
  },
] as const

function ConsoleMock() {
  const reduced = useReducedMotion() ?? false

  return (
    <figure className="m-0 min-w-0">
      <div
        className="overflow-hidden rounded-2xl"
        style={{
          background: 'var(--viz-shell)',
          border: '1px solid var(--viz-border)',
          boxShadow: 'var(--viz-shell-shadow)',
        }}
      >
        {/* request line, the way an engineer reads one */}
        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-5 py-3"
          style={{
            borderBottom: '1px solid var(--viz-border)',
            background: 'var(--viz-shell-header)',
          }}
        >
          <span
            className="rounded px-1.5 py-0.5 font-mono text-[10px] tracking-[0.06em]"
            style={{
              color: 'var(--color-accent-light)',
              background: 'rgba(74,140,255,0.14)',
              border: '1px solid rgba(74,140,255,0.30)',
            }}
          >
            POST
          </span>
          <span className="min-w-0 truncate font-mono text-[11.5px]" style={{ color: 'var(--viz-code-text)' }}>
            /v1/chat/completions
          </span>
          <span
            className="ml-auto flex items-center gap-1.5 font-mono text-[10.5px]"
            style={{ color: 'var(--viz-green)' }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--viz-green)' }} />
            200
            <span style={{ color: 'var(--viz-text-3)' }}>1.2s</span>
          </span>
        </div>

        {/* the prompt, stated once */}
        <div className="px-5 pt-5 pb-4">
          <div
            className="font-mono text-[10px] uppercase tracking-[0.12em]"
            style={{ color: 'var(--viz-text-3)' }}
          >
            prompt
          </div>
          <p className="mt-2 text-[clamp(1rem,1.2vw,1.125rem)] leading-[1.45] text-theme-primary">
            {HERO_PROMPT}
          </p>
        </div>

        {/* the same call, with and without the header */}
        <div className="flex flex-col">
          {HERO_ANSWERS.map((a, i) => {
            const on = a.key === 'memory'
            return (
              <motion.div
                key={a.key}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.15 + i * 0.18, ease: [0.22, 0.61, 0.36, 1] }}
                className="px-5 py-4"
                style={{
                  borderTop: '1px solid var(--viz-border)',
                  background: on ? 'rgba(122,92,255,0.06)' : 'transparent',
                }}
              >
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={
                      on
                        ? { background: 'var(--color-accent)' }
                        : { border: '1px solid var(--viz-text-3)' }
                    }
                  />
                  <span
                    className="min-w-0 truncate font-mono text-[11px]"
                    style={{ color: on ? 'var(--color-accent)' : 'var(--viz-text-3)' }}
                  >
                    {a.label}
                  </span>
                  {a.meta && (
                    <span
                      className="ml-auto shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px]"
                      style={{
                        color: 'var(--viz-indigo)',
                        background: 'rgba(122,92,255,0.12)',
                        border: '1px solid rgba(122,92,255,0.28)',
                      }}
                    >
                      {a.meta}
                    </span>
                  )}
                </div>
                <p
                  className="mt-2.5 text-[14.5px] leading-[1.55]"
                  style={{
                    color: on ? 'var(--viz-text)' : 'var(--viz-text-3)',
                    fontWeight: on ? 500 : 400,
                  }}
                >
                  {a.answer}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
      <figcaption className="mt-3.5 text-[13.5px] leading-[1.55] text-theme-muted">
        One header, same model, same call.
      </figcaption>
    </figure>
  )
}

/* ─── Hero ───────────────────────────────────────────────────────────────── */

/* A restrained request-path strip under the console mock — brief was "your
 * app, Statewave, memory, OpenRouter" as thin lines and small nodes, not
 * another full diagram. Decorative: the hero copy already states this
 * mechanism in words, so screen readers skip it rather than hearing it
 * twice. Gives the hero's right column real additional mass instead of
 * empty space below the card. */
const HERO_FLOW = [
  { icon: Send, label: 'Your app' },
  { icon: Waypoints, label: 'Statewave' },
  { icon: Layers, label: 'Memory' },
  { icon: MessageSquareMore, label: 'OpenRouter' },
] as const

function HeroFlowStrip() {
  return (
    <div
      aria-hidden="true"
      className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-2 rounded-xl px-4 py-3"
      style={{ border: '1px solid var(--viz-border)', background: 'var(--viz-card)' }}
    >
      {HERO_FLOW.map((step, i) => (
        <span key={step.label} className="flex items-center gap-2.5">
          {i > 0 && <span style={{ color: 'var(--viz-text-3)' }}>→</span>}
          <span
            className="flex items-center gap-1.5 font-mono text-[11.5px]"
            style={{ color: 'var(--viz-text-3)' }}
          >
            <step.icon className="h-3.5 w-3.5" style={{ color: 'var(--color-accent)' }} strokeWidth={2} />
            {step.label}
          </span>
        </span>
      ))}
    </div>
  )
}

function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          backgroundImage: 'radial-gradient(var(--theme-hero-dot) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(52rem 36rem at 50% 32%, rgba(99,102,241,0.11), transparent 72%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, transparent 72%, var(--theme-surface-0) 100%)',
        }}
      />

      <div className="relative z-[2] mx-auto max-w-7xl px-5 pt-28 pb-6 sm:px-6 sm:pt-32 md:pt-36">
        <div className="grid items-center gap-11 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="min-w-0"
          >
            <h1 className="max-w-[22ch] font-heading text-[clamp(2.1rem,6.2vw,3.9rem)] font-semibold leading-[1.07] tracking-[-0.025em] text-theme-primary">
              Your model forgets everything
              <span className="block text-gradient-brand">One header fixes it</span>
            </h1>

            <p className="mt-6 max-w-[62ch] text-[clamp(1.05rem,2.2vw,1.25rem)] leading-[1.55] text-theme-secondary">
              A drop-in, OpenAI-compatible HTTP proxy that gives OpenRouter calls
              persistent memory. Point your existing client at it, add one header,
              and every request arrives with the context of the ones before it.
            </p>

            <div className="relative mt-9 flex flex-wrap gap-3">
              <Button to="/openrouter#start" size="lg">
                <span>Get started</span>
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Button>
              <Button href={REPO_URL} variant="secondary" size="lg">
                View on GitHub
              </Button>
            </div>

            {/* One compact metadata row, not pills stacked on top of a second
                row saying half the same things (Python version, Apache-2.0
                used to appear twice). */}
            <div
              className="mt-8 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 pt-5 font-mono text-xs uppercase tracking-[0.12em] text-theme-muted"
              style={{ borderTop: '1px solid var(--viz-border)' }}
            >
              {[
                '40 unit tests',
                'Python 3.11–3.13',
                '3 memory-aware endpoints',
                'Apache 2.0',
                `v${VERSION}`,
              ].map((item, i) => (
                <span key={item} className="flex items-center gap-2.5">
                  {i > 0 && (
                    <span aria-hidden="true" style={{ color: 'var(--viz-text-3)' }}>
                      ·
                    </span>
                  )}
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="min-w-0"
          >
            <ConsoleMock />
            <HeroFlowStrip />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ─── Why ────────────────────────────────────────────────────────────────── *
 * The page went straight from the hero into eight sections of "how it
 * works" — no scannable "why should I care" first. Each card previews a
 * section further down the page (diff, flow/subjects, fails-open) rather
 * than restating it, so this is an overview, not duplicated content. */
const BENEFITS = [
  {
    icon: Waypoints,
    title: 'One header, zero rewrite',
    body: 'Change the base URL, add one header. Everything else in your integration stays exactly as it is.',
  },
  {
    icon: Layers,
    title: 'Context that survives the call',
    body: 'Every request arrives with the memory of the ones before it, not just the current turn.',
  },
  {
    icon: ShieldCheck,
    title: 'Fails open, not closed',
    body: 'If Statewave is unreachable, the call still goes through — just without memory for that turn.',
  },
  {
    icon: Server,
    title: 'Self-hosted, Apache 2.0',
    body: 'Runs next to your own infrastructure. No managed service, no vendor lock-in.',
  },
] as const

function BenefitsSection() {
  return (
    <Band id="why">
      <BandHead id="why-heading">Why route through Statewave</BandHead>

      <Rise className="mt-8 grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
        {BENEFITS.map((b) => (
          <div key={b.title} className={`${CARD} min-w-0 p-6`}>
            <IconBadge icon={b.icon} />
            <div className="mt-4 text-[15px] font-semibold text-theme-primary">{b.title}</div>
            <p className="mt-2 text-sm leading-[1.6] text-theme-secondary">{b.body}</p>
          </div>
        ))}
      </Rise>
    </Band>
  )
}

/* ─── The diff ───────────────────────────────────────────────────────────── */

const BEFORE_PY = `client = OpenAI(api_key="sk-or-...")

client.chat.completions.create(
    model="openai/gpt-4o",
    messages=[{"role": "user", "content": "What coffee do I like?"}],
)`

const AFTER_PY = `client = OpenAI(base_url="http://localhost:8080/v1", api_key="sk-or-...")

client.chat.completions.create(
    model="openai/gpt-4o",
    messages=[{"role": "user", "content": "What coffee do I like?"}],
    extra_headers={"X-Statewave-Subject": "user:42"},
)`

/* The page's central claim is that two lines change and nothing else does.
 * Two code panels side by side asserted that and made the reader diff them by
 * eye; one panel that switches in place lets them watch it happen, which is
 * the same argument with the work removed. Every line is rendered in both
 * states, so a line that does not move visibly does not move — that is the
 * point being made. */
type DiffLine =
  | { kind: 'same'; render: () => ReactNode }
  | { kind: 'changed'; before: () => ReactNode; after: () => ReactNode }
  | { kind: 'added'; after: () => ReactNode }

const DIFF_LINES: DiffLine[] = [
  {
    kind: 'changed',
    before: () => (
      <>
        <span style={txt}>client</span> = <span style={kw}>OpenAI</span>(
        <span style={attr}>api_key</span>=<span style={str}>&quot;sk-or-...&quot;</span>)
      </>
    ),
    after: () => (
      <>
        <span style={txt}>client</span> = <span style={kw}>OpenAI</span>(
        <span style={attr}>base_url</span>=
        <span style={str}>&quot;http://localhost:8080/v1&quot;</span>,{' '}
        <span style={attr}>api_key</span>=<span style={str}>&quot;sk-or-...&quot;</span>)
      </>
    ),
  },
  { kind: 'same', render: () => <>{' '}</> },
  {
    kind: 'same',
    render: () => (
      <>
        <span style={txt}>client</span>.chat.completions.<span style={kw}>create</span>(
      </>
    ),
  },
  {
    kind: 'same',
    render: () => (
      <>
        {'    '}
        <span style={attr}>model</span>=<span style={str}>&quot;openai/gpt-4o&quot;</span>,
      </>
    ),
  },
  {
    kind: 'same',
    render: () => (
      <>
        {'    '}
        <span style={attr}>messages</span>=[{'{'}
        <span style={str}>&quot;role&quot;</span>: <span style={str}>&quot;user&quot;</span>,{' '}
        <span style={str}>&quot;content&quot;</span>:{' '}
        <span style={str}>&quot;What coffee do I like?&quot;</span>
        {'}'}],
      </>
    ),
  },
  {
    kind: 'added',
    after: () => (
      <>
        {'    '}
        <span style={attr}>extra_headers</span>={'{'}
        <span style={str}>&quot;X-Statewave-Subject&quot;</span>:{' '}
        <span style={str}>&quot;user:42&quot;</span>
        {'}'},
      </>
    ),
  },
  { kind: 'same', render: () => <>)</> },
]

function DiffSection() {
  // Defaults to `after`: a landing page should show the payoff without
  // requiring a click, and the highlighted lines make the change legible
  // standing still. The toggle is for checking what it replaced.
  const [showAfter, setShowAfter] = useState(true)
  const reduced = useReducedMotion() ?? false

  const toggle = (value: boolean, label: string) => (
    <button
      key={label}
      type="button"
      onClick={() => setShowAfter(value)}
      aria-pressed={showAfter === value}
      className="rounded-full px-3.5 py-1.5 font-mono text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
      style={
        showAfter === value
          ? {
            color: 'var(--viz-text)',
            background: 'rgba(122,92,255,0.18)',
            border: '1px solid rgba(122,92,255,0.45)',
          }
          : {
            color: 'var(--viz-text-3)',
            background: 'transparent',
            border: '1px solid var(--viz-border)',
          }
      }
    >
      {label}
    </button>
  )

  return (
    <Band id="diff" tier="lead" className="!pt-14 sm:!pt-16 lg:!pt-20">
      <BandHead
        id="the-diff"
        tier="lead"
        lede="Two lines. Everything else in your integration stays exactly as it is. No subject header means plain pass-through, so memory is opt-in per request rather than a global mode."
      >
        A base URL and <span className="text-gradient-brand">one header</span>
      </BandHead>

      <Rise className="mt-9 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div
          className="min-w-0 overflow-hidden rounded-2xl"
          style={{
            background: 'var(--viz-code-bg)',
            border: '1px solid var(--viz-border)',
          }}
        >
          <div
            className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5"
            style={{
              background: 'var(--viz-shell-header)',
              borderBottom: '1px solid var(--viz-border)',
            }}
          >
            <div className="flex items-center gap-2">
              {toggle(false, 'before')}
              {toggle(true, 'after')}
            </div>
            <div className="flex items-center gap-3">
              <span
                className="font-mono text-[11px]"
                style={{ color: showAfter ? 'var(--color-accent)' : 'var(--viz-text-3)' }}
              >
                {showAfter ? '2 lines changed' : 'your code today'}
              </span>
              <CodeCopyButton
                code={showAfter ? AFTER_PY : BEFORE_PY}
                label={`Copy the ${showAfter ? 'after' : 'before'} snippet`}
              />
            </div>
          </div>

          <pre className="overflow-x-auto py-4 font-mono text-[13px] leading-[1.85]" style={txt}>
            {DIFF_LINES.map((line, i) => {
              // An added line has no `before` form, so it collapses out
              // entirely rather than leaving a blank gap behind.
              if (line.kind === 'added' && !showAfter) return null
              const marked = line.kind !== 'same' && showAfter
              const content =
                line.kind === 'same'
                  ? line.render()
                  : line.kind === 'added'
                    ? line.after()
                    : showAfter
                      ? line.after()
                      : line.before()
              return (
                <motion.span
                  key={i}
                  layout={reduced ? false : 'position'}
                  transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
                  className={`block ${marked ? 'pl-[13px] pr-4' : 'px-4'}`}
                  style={
                    marked
                      ? {
                        borderLeft: '3px solid var(--color-accent)',
                        background: 'rgba(122,92,255,0.12)',
                      }
                      : undefined
                  }
                >
                  <motion.span
                    // Keyed on the state so the text itself crossfades when a
                    // changed line swaps content, instead of snapping.
                    key={`${i}-${showAfter}`}
                    initial={reduced ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.22 }}
                    className="block"
                  >
                    {content}
                  </motion.span>
                </motion.span>
              )
            })}
          </pre>
        </div>

        <div className={`${CARD} min-w-0 p-6`}>
          <Eyebrow>What just happened</Eyebrow>
          <ul className="mt-4 flex list-none flex-col gap-3.5 p-0">
            <IconRow icon={Layers}>
              A <L to="/product">memory bundle</L> for <C>user:42</C> was injected as a
              system message.
            </IconRow>
            <IconRow icon={Waypoints}>The call went to OpenRouter unchanged otherwise.</IconRow>
            <IconRow icon={Clock3}>
              The turn was written back as an episode after the response was sent.
            </IconRow>
          </ul>

          {/* The path itself, before and after — the bullets above say what
              happened on one call; this says what changed structurally. */}
          <div
            className="mt-5 flex flex-col gap-2.5 pt-5"
            style={{ borderTop: '1px solid var(--viz-border)' }}
          >
            <div
              className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px]"
              style={{ color: 'var(--viz-text-3)' }}
            >
              <span className="uppercase tracking-[0.08em] opacity-70">before</span>
              <span>OpenAI Client</span>
              <span>→</span>
              <span>OpenRouter</span>
            </div>
            <div
              className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px]"
              style={{ color: 'var(--color-accent)' }}
            >
              <span className="uppercase tracking-[0.08em] opacity-70">after</span>
              <span>OpenAI Client</span>
              <span>→</span>
              <span>Statewave Proxy</span>
              <span>→</span>
              <span>OpenRouter</span>
            </div>
          </div>
        </div>
      </Rise>
    </Band>
  )
}

/* ─── Request flow ───────────────────────────────────────────────────────── */

const FLOW_STEPS = [
  { n: '01', title: 'Client calls the proxy' },
  { n: '02', title: 'Context fetched' },
  { n: '03', title: 'Forwarded to OpenRouter' },
  { n: '04', title: 'Reply relayed back' },
] as const

const FLOW_ICONS: Record<string, LucideIcon> = {
  '01': Send,
  '02': Search,
  '03': Waypoints,
  '04': MessageSquareMore,
}

/* A row of real cards connected by a line, not an SVG diagram: the steps are
 * one path, so a connected row says that four equal boxes cannot, and a DOM
 * card with an icon reads at a glance where SVG text does not. Same
 * icon-badge dialect as HomePage's feature cards. The episode-write card
 * sits last in the same row, dashed, joined by a dashed connector — the
 * same "branches off the main path" idea the old SVG fork drew, without
 * needing a second axis to lay it out on. */
/* From lg the four steps share the full content width and the episode write
 * drops below step 04 on a dashed branch. As a fifth card in the same row the
 * figure was ~1500px of min-content: in a 1280px container it scrolled, cut
 * the last card mid-word and showed the scrollbar as a bar under the caption.
 * Below lg the original scrolling row stays. */
const FLOW_GRID = 'lg:grid-cols-[1fr_40px_1fr_40px_1fr_40px_1fr]'

/* Played once when the row scrolls into view: 01→04 light up in order, and
 * only then does the dashed branch draw down to the episode write — the
 * "written after" in the heading, shown rather than stated. Reduced motion
 * gets the finished state. */
/** Whether `ref` is at least `amount` visible, via a native observer. */
function useSeen<T extends Element>(amount: number, once = false) {
  const ref = useRef<T>(null)
  // No observer (old browser, test env): show the finished state.
  const [seen, setSeen] = useState(() => typeof IntersectionObserver === 'undefined')
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => {
        const hit = entry.intersectionRatio >= amount
        if (once) {
          if (!hit) return
          setSeen(true)
          io.disconnect()
        } else setSeen(hit)
      },
      { threshold: [0, amount] },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [amount, once])
  return [ref, seen] as const
}

const FLOW_STEP_MS = 420
const FLOW_BRANCH = FLOW_STEPS.length // step index at which the write appears
const FLOW_FADE =
  'transition-[opacity,transform] duration-[400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] motion-reduce:transition-none'

function useFlowSequence() {
  const [ref, inView] = useSeen<HTMLDivElement>(0.6, true)
  const reduced = useReducedMotion() ?? false
  const [lit, setLit] = useState(-1)

  useEffect(() => {
    if (!inView || reduced) return
    const timers = Array.from({ length: FLOW_BRANCH + 1 }, (_, i) =>
      window.setTimeout(() => setLit(i), 250 + i * FLOW_STEP_MS),
    )
    return () => timers.forEach(window.clearTimeout)
  }, [inView, reduced])

  return { ref, lit: reduced ? FLOW_BRANCH : lit }
}

function RequestFlowDiagram() {
  const { ref, lit } = useFlowSequence()
  const on = (i: number) => lit >= i

  return (
    <figure className="m-0 min-w-0">
      <div ref={ref} className={`hidden lg:grid ${FLOW_GRID}`}>
        {FLOW_STEPS.map((step, i) => (
          <Fragment key={step.n}>
            {i > 0 && (
              <div className={`flex ${FLOW_FADE}`} style={{ opacity: on(i) ? 1 : 0.25 }}>
                <NodeConnector />
              </div>
            )}
            <div
              className={`relative flex min-w-0 rounded-xl ${FLOW_FADE}`}
              style={{
                opacity: on(i) ? 1 : 0.4,
                transform: lit === i ? 'translateY(-3px)' : 'none',
              }}
            >
              <NodeCard
                stacked
                icon={FLOW_ICONS[step.n]}
                eyebrow={step.n}
                title={step.title}
                className="w-full"
              />
              {/* The step being walked gets the accent ring; it hands on as the next one lights. */}
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 rounded-xl ${FLOW_FADE}`}
                style={{
                  opacity: lit === i ? 1 : 0,
                  boxShadow: '0 0 0 1px var(--color-accent), 0 8px 28px -10px var(--color-accent)',
                }}
              />
            </div>
          </Fragment>
        ))}
      </div>
      <div className={`hidden lg:grid ${FLOW_GRID}`}>
        {/* The caption fills the space left of the branch; the figcaption
            below carries it for assistive tech and for the scrolling row. */}
        <p
          aria-hidden="true"
          className="col-span-5 self-end pb-4 text-[13.5px] text-theme-muted"
        >
          One path through the proxy. The write happens after the reply, not before it.
        </p>
        <div className="col-start-7 flex flex-col items-center">
          <div
            aria-hidden="true"
            className={`h-8 w-px origin-top ${FLOW_FADE}`}
            style={{
              transform: `scaleY(${on(FLOW_BRANCH) ? 1 : 0})`,
              backgroundImage: 'linear-gradient(to bottom, var(--viz-indigo) 50%, transparent 50%)',
              backgroundSize: '1px 6px',
              opacity: 0.7,
            }}
          />
          <div
            className={`w-full ${FLOW_FADE} delay-200`}
            style={{
              opacity: on(FLOW_BRANCH) ? 1 : 0,
              transform: on(FLOW_BRANCH) ? 'none' : 'translateY(-8px)',
            }}
          >
            <NodeCard
              stacked
              dashed
              icon={Clock3}
              eyebrow="async · off the critical path"
              title="Episode written back"
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="sw-scroll-x min-w-0 overflow-x-auto lg:hidden">
        <div className="flex min-w-max items-center pb-1">
          {FLOW_STEPS.map((step, i) => (
            <div key={step.n} className="flex items-center">
              <NodeCard icon={FLOW_ICONS[step.n]} eyebrow={step.n} title={step.title} />
              <NodeConnector dashed={i === FLOW_STEPS.length - 1} />
            </div>
          ))}
          <NodeCard
            icon={Clock3}
            eyebrow="async · off the critical path"
            title="Episode written back"
            dashed
            className="min-w-[230px]"
          />
        </div>
      </div>
      <figcaption className="mt-5 text-[13.5px] text-theme-muted lg:sr-only">
        One path through the proxy. The write happens after the reply, not before it.
      </figcaption>
    </figure>
  )
}

const FLOW_NOTES = [
  {
    title: 'No added latency.',
    body: 'The episode write is fire-and-forget. It happens after the reply is already on its way to the client.',
  },
  {
    title: 'Streaming is not a special case.',
    body: 'SSE chunks relay byte-for-byte as they arrive. The reply is reassembled line by line, so a long stream costs the reply text, not a second copy of the body. The episode is written when the stream closes.',
  },
  {
    title: 'Empty replies write nothing.',
    body: "A turn with no answer in it is noise in the subject's memory, not history.",
  },
] as const

function FlowSection() {
  return (
    <Band id="flow" tier="lead" surface>
      <BandHead id="request-flow" tier="lead">
        Memory in, completion out, episode written after
      </BandHead>

      <Rise className="mt-10">
        <RequestFlowDiagram />
      </Rise>

      <Rise className="mt-9 grid gap-[18px] md:grid-cols-2">
        <div className={`${CARD} min-w-0 p-[22px]`}>
          <Eyebrow>What the proxy touches</Eyebrow>
          <ul className="mt-3.5 flex list-none flex-col gap-3 p-0">
            <IconRow icon={Check}>Adds the memory bundle, reads the reply text back out.</IconRow>
            <IconRow icon={Check}>
              Strips Statewave headers and the <C>statewave_subject</C> body field
              before the call goes upstream.
            </IconRow>
            <IconRow icon={Check}>
              Leaves model, temperature, tools and every other parameter untouched.
            </IconRow>
          </ul>
        </div>
        <div className={`${CARD} min-w-0 p-[22px]`}>
          <Eyebrow>What it leaves alone</Eyebrow>
          <ul className="mt-3.5 flex list-none flex-col gap-3 p-0">
            <IconRow icon={Minus} tone="muted">
              No subject header: a plain pass-through, byte for byte.
            </IconRow>
            <IconRow icon={Minus} tone="muted">
              Non-completion paths such as <C>/v1/models</C> forward as-is.
            </IconRow>
            <IconRow icon={Minus} tone="muted">
              Your OpenRouter key stays yours; the proxy forwards it, never replaces it.
            </IconRow>
          </ul>
        </div>
      </Rise>

      <Rise className="mt-16 grid gap-x-10 gap-y-10 md:grid-cols-3">
        {FLOW_NOTES.map((note) => (
          <div key={note.title} className={NOTE}>
            <div className="text-[15px] font-semibold text-theme-primary">{note.title}</div>
            <p className="mt-2.5 text-sm leading-[1.6] text-theme-secondary">{note.body}</p>
          </div>
        ))}
      </Rise>
    </Band>
  )
}

/* ─── Endpoints ──────────────────────────────────────────────────────────── */

/** Decorative glyphs — the endpoint name and the "bundle goes" cell next to
 *  each one already carry the meaning, so they stay out of the a11y tree. */
function ChatGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" className="flex-none">
      <rect
        x="2.5"
        y="3"
        width="19"
        height="5"
        rx="1.5"
        fill="rgba(122,92,255,0.16)"
        stroke="var(--color-accent)"
      />
      <rect x="2.5" y="10.5" width="19" height="4.5" rx="1.5" fill="none" stroke="var(--viz-text-3)" />
      <rect x="2.5" y="17" width="19" height="4.5" rx="1.5" fill="none" stroke="var(--viz-text-3)" />
    </svg>
  )
}

function CompletionsGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" className="flex-none">
      <rect
        x="2.5"
        y="4"
        width="8"
        height="3.5"
        rx="1.5"
        fill="rgba(122,92,255,0.16)"
        stroke="var(--color-accent)"
      />
      <line x1="2.5" y1="12" x2="21.5" y2="12" stroke="var(--viz-text-3)" />
      <line x1="2.5" y1="16" x2="21.5" y2="16" stroke="var(--viz-text-3)" />
      <line x1="2.5" y1="20" x2="15" y2="20" stroke="var(--viz-text-3)" />
    </svg>
  )
}

function ResponsesGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" className="flex-none">
      <rect
        x="2.5"
        y="3"
        width="19"
        height="6"
        rx="1.5"
        fill="rgba(122,92,255,0.16)"
        stroke="var(--color-accent)"
      />
      <rect x="2.5" y="11.5" width="19" height="10" rx="1.5" fill="none" stroke="var(--viz-text-3)" />
    </svg>
  )
}

function EndpointsSection() {
  return (
    <Band id="endpoints">
      <BandHead id="endpoints-heading">Where the bundle goes, per endpoint</BandHead>

      <Rise className="mt-8">
        <DataTable
          minWidth={640}
          headers={['Endpoint', 'Bundle goes', 'Reply read from']}
          rows={[
            [
              <span className="flex items-center gap-2.5">
                <ChatGlyph />
                <span>POST /v1/chat/completions</span>
              </span>,
              <>
                a <C>system</C> message, first in <C>messages</C>
              </>,
              <span className="font-mono text-[13px] whitespace-nowrap">
                choices[].message.content
              </span>,
            ],
            [
              <span className="flex items-center gap-2.5">
                <CompletionsGlyph />
                <span>POST /v1/completions</span>
              </span>,
              <>
                ahead of <C>prompt</C>
              </>,
              <span className="font-mono text-[13px] whitespace-nowrap">choices[].text</span>,
            ],
            [
              <span className="flex items-center gap-2.5">
                <ResponsesGlyph />
                <span>POST /v1/responses</span>
              </span>,
              <>
                ahead of <C>instructions</C>; <C>input</C> untouched
              </>,
              <span className="font-mono text-[13px] whitespace-nowrap">
                output[].content[].text
              </span>,
            ],
          ]}
        />
      </Rise>

      <Rise>
        <p className="mt-[18px] max-w-[70ch] text-sm text-theme-muted">
          Every other path (<C>/v1/models</C>, <C>/v1/credits</C>, the rest) is proxied
          straight through, so this is a drop-in base URL replacement.
        </p>
      </Rise>
    </Band>
  )
}

/* ─── Subjects and sessions ──────────────────────────────────────────────── */

const SUBJECT_CURL = `curl http://localhost:8080/v1/chat/completions \\
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \\
  -H "X-Statewave-Subject: user:42" \\
  -H "X-Statewave-Session: sess_abc" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"openai/gpt-4o","messages":[{"role":"user","content":"What coffee do I like?"}]}'`

/* Real turn cards connected by a line, not SVG text on a rail — same move as
 * RequestFlowDiagram. The compiled-bundle card below is the merge point for
 * all three turns, so it stays full-width rather than trying to draw three
 * converging lines into it. */
function SubjectTimeline() {
  const turns = [
    { label: 'turn 1', text: 'oat lattes', session: null },
    { label: 'turn 2', text: 'no sugar', session: 'sess_abc' },
    { label: 'turn 3', text: 'decaf after 4pm', session: 'sess_abc' },
  ] as const

  return (
    <figure
      className="sw-scroll-x m-0 min-w-0 max-w-[680px] overflow-x-auto"
      aria-label="Turns accumulating under one subject"
    >
      <div className="mb-3 font-mono text-xs" style={{ color: 'var(--viz-indigo)' }}>
        subject: user:42
      </div>
      <div className="flex min-w-max items-center">
        {turns.map((t, i) => (
          <div key={t.label} className="flex items-center">
            <div
              className="flex min-w-[176px] flex-col gap-2.5 rounded-xl p-3.5"
              style={{
                background: 'var(--viz-card)',
                border: `1px solid ${t.session ? 'rgba(74,140,255,0.34)' : 'var(--viz-border)'}`,
              }}
            >
              <div className="flex items-center gap-2">
                <IconBadge icon={MessageSquareMore} size="sm" />
                <span className="font-mono text-[11px]" style={{ color: 'var(--viz-text-3)' }}>
                  {t.label}
                </span>
              </div>
              <div className="text-[13px] text-theme-primary">{t.text}</div>
              <div
                className="font-mono text-[10px]"
                style={{ color: t.session ? 'var(--viz-indigo)' : 'var(--viz-text-3)' }}
              >
                {t.session ? `session: ${t.session}` : 'no session'}
              </div>
            </div>
            {i < turns.length - 1 && <NodeConnector />}
          </div>
        ))}
      </div>
      <div
        className="mt-4 flex min-w-max items-center gap-3 rounded-xl p-3.5"
        style={{ background: 'rgba(122,92,255,0.08)', border: '1px solid rgba(122,92,255,0.30)' }}
      >
        <IconBadge icon={Layers} />
        <span className="font-mono text-[12.5px]" style={{ color: 'var(--viz-indigo)' }}>
          compiled memory bundle for user:42
        </span>
      </div>
      <figcaption className="mt-3.5 text-[13.5px] text-theme-muted">
        A session scopes a run of turns inside a subject; the subject keeps the memory.
      </figcaption>
    </figure>
  )
}

/* Four reference facts. They were four separate cards stacked in a narrow
 * column beside the heading, which left 245px of dead space under a two-line
 * heading and gave each card a different height for no reason. A term/definition
 * grid is what this content actually is. */
const SUBJECT_FACTS: { term: string; body: () => ReactNode }[] = [
  {
    term: 'subject',
    body: () => (
      <>
        Who the memory belongs to: <C>user:42</C>, <C>team:acme</C>. This is the unit
        memory accumulates against.
      </>
    ),
  },
  {
    term: 'session',
    body: () => <>Optional. Scopes a run of turns inside a subject.</>,
  },
  {
    term: 'set via',
    body: () => (
      <>
        The <C>X-Statewave-Subject</C> header, or a <C>statewave_subject</C> body field
        for clients that cannot set headers. The header wins, and body fields are
        stripped before the request reaches OpenRouter.
      </>
    ),
  },
  {
    term: 'id format',
    body: () => (
      <>
        1–256 characters of letters, digits, underscore, dot, dash or colon. Anything
        else is rejected with <C>400</C> before any upstream call.
      </>
    ),
  },
]

function SubjectsSection() {
  return (
    <Band id="subjects" surface>
      <BandHead
        id="subjects-heading"
        lede={
          <>
            A subject is the <L to="/product">unit of memory</L>. A session narrows it
            to one run of turns.
          </>
        }
      >
        Who the memory belongs to
      </BandHead>

      {/* The diagram is the explanation, so it leads. Capped to the SVG's own
          width so the caption sits under the graphic rather than 276px to its
          left, which is what a full-width figure around a centred SVG gave. */}
      {/* From lg the definitions sit beside the diagram: a 680px figure
          centred over a full-width code panel left wide empty margins and no
          shared left edge with the heading. Side by side, both columns start
          on the heading's axis and end at similar heights. */}
      <Rise className="mt-10 grid gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,680px)_minmax(0,1fr)] lg:items-start">
        <SubjectTimeline />
        <dl className="m-0 grid min-w-0 gap-x-10 gap-y-7 border-t border-brand-500/25 pt-7 md:grid-cols-2 lg:grid-cols-1 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
          {SUBJECT_FACTS.map((f) => (
            <div key={f.term} className="min-w-0">
              <dt
                className="font-mono text-[11px] uppercase tracking-[0.1em]"
                style={{ color: 'var(--viz-indigo)' }}
              >
                {f.term}
              </dt>
              <dd className="m-0 mt-1.5 text-[14.5px] leading-[1.6] text-theme-secondary">
                {f.body()}
              </dd>
            </div>
          ))}
        </dl>
      </Rise>

      <Rise className="mt-14">
        <CodePanel label="subject and session, over plain HTTP" code={SUBJECT_CURL}>
          <span style={kw}>curl</span> http://localhost:8080/v1/chat/completions \{'\n'}
          {'  '}-H <span style={str}>&quot;Authorization: Bearer $OPENROUTER_API_KEY&quot;</span> \
          {'\n'}
          {'  '}-H <span style={str}>&quot;X-Statewave-Subject: user:42&quot;</span> \{'\n'}
          {'  '}-H <span style={str}>&quot;X-Statewave-Session: sess_abc&quot;</span> \{'\n'}
          {'  '}-H <span style={str}>&quot;Content-Type: application/json&quot;</span> \{'\n'}
          {'  '}-d{' '}
          <span style={str}>
            {
              '\'{"model":"openai/gpt-4o","messages":[{"role":"user","content":"What coffee do I like?"}]}\''
            }
          </span>
        </CodePanel>
      </Rise>

    </Band>
  )
}

/* ─── Auth ───────────────────────────────────────────────────────────────── */

/* The three outcomes the gate can produce, keyed to the three config cards
 * below it. Selecting a card holds that branch at full strength and drops the
 * other two back, so the diagram answers "what do I get if I set this?"
 * rather than showing all three states at once and leaving the reader to
 * work out which one is theirs. */
type TrustMode = 'none' | 'header' | 'jwt'

const TRUST_MODES: readonly {
  key: TrustMode
  chip: string
  chipTint: string
  title: string
  mono: boolean
  body: ReactNode
}[] = [
  {
    key: 'none',
    chip: 'safe default',
    chipTint: 'rgba(74,140,255,',
    title: 'Nothing set',
    mono: false,
    body: (
      <>
        A request carrying a subject gets <C>400 statewave_untrusted_subject</C>.
        This is the safe default, not a mode.
      </>
    ),
  },
  {
    key: 'header',
    chip: 'trusted network',
    chipTint: 'rgba(122,92,255,',
    title: 'STATEWAVE_TRUST_CLIENT_SUBJECT=1',
    mono: true,
    body: (
      <>
        The header is trusted as sent. For a laptop, a private network, or behind a
        gateway that already authenticates.
      </>
    ),
  },
  {
    key: 'jwt',
    chip: 'public clients',
    chipTint: 'rgba(122,92,255,',
    title: 'PROXY_JWT_SECRET',
    mono: true,
    body: (
      <>
        Every route but <C>/health</C> needs a signed token; the subject is the
        token&apos;s <C>sub</C> claim. Tokens must carry <C>exp</C>. For anything
        reachable by clients you do not control.
      </>
    ),
  },
]

/* Outcome nodes, laid out on one grid so the three branches are comparable at
 * a glance: same width, same height, even vertical pitch. The earlier version
 * sized every node differently and fanned straight diagonals out of a small
 * box, which read as a whiteboard sketch rather than a diagram. */
const GATE_OUTCOMES: {
  key: TrustMode
  y: number
  title: string
  sub: string
  accent: string
  /** Dashed outline marks the branch that refuses the request. */
  dashed?: boolean
}[] = [
  { key: 'none', y: 6, title: '400 rejected', sub: 'nothing configured', accent: 'var(--viz-amber)', dashed: true },
  { key: 'header', y: 100, title: 'header as sent', sub: 'trusted network', accent: 'var(--color-accent-light)' },
  { key: 'jwt', y: 194, title: 'sub claim', sub: 'signed token', accent: 'var(--color-accent)' },
]

const AUTH_VIEW = { w: 492, h: 256 }
const authPct = (v: number, dim: 'w' | 'h') => diagramPct(v, AUTH_VIEW[dim])

const GATE_ICONS: Record<TrustMode, LucideIcon> = {
  none: ShieldAlert,
  header: Radio,
  jwt: KeyRound,
}

/* Connector paths stay SVG (the existing bezier fork math is reused as-is);
 * every node is now a real HTML card layered on top at matching percentage
 * coordinates, so the diagram renders crisp DOM text and an icon instead of
 * 10-13px SVG labels. */
function TrustGateDiagram({ mode }: { mode: TrustMode }) {
  return (
    <figure className="m-0 min-w-0">
      <div className="relative w-full" style={{ aspectRatio: `${AUTH_VIEW.w} / ${AUTH_VIEW.h}` }}>
        <svg
          viewBox={`0 0 ${AUTH_VIEW.w} ${AUTH_VIEW.h}`}
          role="img"
          aria-labelledby="authTitle authDesc"
          className="absolute inset-0 block h-full w-full"
        >
          <title id="authTitle">How the proxy decides whether to trust a subject</title>
          <desc id="authDesc">
            A request naming a subject reaches the trust gate. With nothing configured it
            is rejected with 400. With the trust flag set the header is taken as sent.
            With a JWT secret set the subject is taken from the token&apos;s sub claim.
          </desc>
          <line x1="122" y1="128" x2="154" y2="128" stroke="var(--viz-text-3)" strokeWidth="1.5" />
          {GATE_OUTCOMES.map((o) => {
            const cy = o.y + 29
            const active = mode === o.key
            // Cubic out of the gate's right edge into the node's left edge, so
            // every branch leaves and lands horizontally instead of cutting a
            // diagonal across the frame.
            const d = `M248 128 C278 128 278 ${cy} 306 ${cy}`
            return (
              <path
                key={o.key}
                d={d}
                fill="none"
                stroke={active ? o.accent : 'var(--viz-text-3)'}
                strokeWidth={active ? 2 : 1.3}
                strokeLinecap="round"
                className="transition-[stroke,stroke-width] duration-300"
              />
            )
          })}
        </svg>

        <GateNode
          icon={Send}
          tone="neutral"
          title="request"
          sub="names a subject"
          style={{
            left: authPct(0, 'w'),
            top: authPct(102, 'h'),
            width: authPct(122, 'w'),
            height: authPct(52, 'h'),
          }}
        />
        <GateNode
          icon={ShieldCheck}
          title="trust gate"
          style={{
            left: authPct(154, 'w'),
            top: authPct(98, 'h'),
            width: authPct(94, 'w'),
            height: authPct(60, 'h'),
          }}
        />
        {GATE_OUTCOMES.map((o) => (
          <GateNode
            key={o.key}
            icon={GATE_ICONS[o.key]}
            tone={o.key === 'none' ? 'amber' : 'accent'}
            title={o.title}
            sub={o.sub}
            active={mode === o.key}
            dashed={o.dashed}
            style={{
              left: authPct(306, 'w'),
              top: authPct(o.y, 'h'),
              width: authPct(186, 'w'),
              height: authPct(58, 'h'),
            }}
          />
        ))}
      </div>
      <figcaption className="mt-4 text-[13.5px] text-theme-muted">
        One gate, three outcomes. Pick a setting below to follow its branch.
      </figcaption>
    </figure>
  )
}

function AuthSection() {
  const [mode, setMode] = useState<TrustMode>('none')
  // Hover previews a branch without committing to it; the click still pins.
  // Without this the diagram only ever moved on click, so nothing invited the
  // reader to try it — the cards looked like three static panels.
  const [preview, setPreview] = useState<TrustMode | null>(null)
  const shown = preview ?? mode

  return (
    <Band id="auth">
      <BandHead id="auth-heading">One decision to get right before you deploy</BandHead>

      <Rise className="mt-7 grid items-center gap-9 md:grid-cols-2">
        <div className="min-w-0">
          {/* The rule is a positioned span, not `border-image`. A gradient
              border-image ignores border-radius and paints a hard, square bar
              detached from the text — which is exactly how it looked. */}
          <blockquote className="relative m-0 pl-6 text-[clamp(1.15rem,2.4vw,1.45rem)] font-medium leading-[1.45] tracking-[-0.01em] text-theme-primary">
            <span
              aria-hidden="true"
              className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full"
              style={{
                background:
                  'linear-gradient(180deg, var(--color-accent), var(--color-accent-light))',
              }}
            />
            Whoever can name a subject can read and write that subject&apos;s memory.
          </blockquote>
          <p className="mt-5 max-w-[54ch] text-[15px] leading-[1.7] text-theme-secondary">
            So the proxy will not take a subject id on faith. Until you tell it which
            clients are trustworthy, a request that names one is refused outright
            rather than quietly reading somebody else&apos;s memory.
          </p>
        </div>
        <TrustGateDiagram mode={shown} />
      </Rise>

      <Rise className="mt-9 grid gap-[18px] md:grid-cols-3">
        {TRUST_MODES.map((m) => {
          const active = mode === m.key
          return (
            <button
              key={m.key}
              type="button"
              aria-pressed={active}
              onClick={() => setMode(m.key)}
              onMouseEnter={() => setPreview(m.key)}
              onMouseLeave={() => setPreview(null)}
              onFocus={() => setPreview(m.key)}
              onBlur={() => setPreview(null)}
              className={`${CARD} min-w-0 cursor-pointer p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 ${
                active ? '!border-brand-500/55' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <IconBadge icon={GATE_ICONS[m.key]} tone={m.key === 'none' ? 'amber' : 'accent'} size="sm" />
                <span
                  className="inline-flex rounded-full px-2.5 py-1 font-mono text-[11px]"
                  style={{
                    color: 'var(--viz-indigo)',
                    background: m.chipTint + (active ? '0.18)' : '0.08)'),
                    border: '1px solid ' + m.chipTint + '0.18)',
                  }}
                >
                  {m.chip}
                </span>
              </div>
              <div
                className={`mt-3.5 font-semibold text-theme-primary ${
                  m.mono ? 'overflow-x-auto font-mono text-sm' : 'text-base'
                }`}
              >
                {m.title}
              </div>
              <p className="mt-2.5 text-sm leading-[1.6] text-theme-secondary">{m.body}</p>
            </button>
          )
        })}
      </Rise>
    </Band>
  )
}

/* ─── Fails open ─────────────────────────────────────────────────────────── */

/* A fork and a merge, not two parallel rows.
 *
 * The claim is that exactly one step differs and everything around it is
 * identical, so `request`, `completion` and `200 OK` are drawn once and shared.
 * The previous version repeated all three per row, which made the two paths
 * look like two different systems and buried the one node that actually
 * changes. Hovering a branch traces it and drops the other back.
 */
const FO_BRANCHES = [
  {
    key: 'healthy' as const,
    y: 14,
    label: 'STATEWAVE HEALTHY',
    title: 'context ok',
    sub: 'bundle assembled',
    reply: 'with memory',
    stroke: 'var(--color-accent)',
  },
  {
    key: 'failed' as const,
    y: 132,
    label: 'STATEWAVE UNREACHABLE',
    title: 'context failed',
    sub: 'logged, not raised',
    reply: 'no memory',
    stroke: 'var(--viz-amber)',
    dashed: true,
  },
]

const FO_VIEW = { w: 680, h: 208 }
const foPct = (v: number, dim: 'w' | 'h') => diagramPct(v, FO_VIEW[dim])
const FO_ICONS: Record<'healthy' | 'failed', LucideIcon> = {
  healthy: CircleCheck,
  failed: TriangleAlert,
}

/* Same hybrid pattern as TrustGateDiagram: SVG carries only the fork/merge
 * connector paths, every node is an HTML card. The hover/keyboard trace
 * moves from the old SVG <g> onto the card itself via `interactive`. */
/* The trace used to need a hover, which touch never gives and most readers
 * never try. In view, it now walks the healthy branch, then the failed one —
 * both end at 200 OK — twice, and settles. Any hover or focus hands control
 * to the reader for good. Reduced motion keeps the static figure. */
const FO_AUTO: ('healthy' | 'failed' | null)[] = ['healthy', 'failed', null, 'healthy', 'failed', null]
const FO_AUTO_MS = 1500

function useAutoTrace(active: boolean) {
  const [ref, inView] = useSeen<HTMLDivElement>(0.6)
  const reduced = useReducedMotion() ?? false
  const [step, setStep] = useState(-1)

  useEffect(() => {
    if (!inView || reduced || !active || step >= FO_AUTO.length - 1) return
    const t = window.setTimeout(() => setStep((s) => s + 1), step < 0 ? 600 : FO_AUTO_MS)
    return () => window.clearTimeout(t)
  }, [inView, reduced, active, step])

  return { ref, auto: active && step >= 0 ? FO_AUTO[step] : null }
}

function FailsOpenDiagram() {
  const [userTrace, setUserTrace] = useState<'healthy' | 'failed' | null>(null)
  const [touched, setTouched] = useState(false)
  const { ref, auto } = useAutoTrace(!touched)
  const trace = touched ? userTrace : auto
  const setTrace = (t: 'healthy' | 'failed' | null) => {
    setTouched(true)
    setUserTrace(t)
  }

  return (
    <figure className="sw-scroll-x m-0 mx-auto min-w-0 max-w-[680px] overflow-x-auto">
      <div
        ref={ref}
        className="relative min-w-[540px] max-w-[680px]"
        style={{ aspectRatio: `${FO_VIEW.w} / ${FO_VIEW.h}` }}
      >
        <svg
          viewBox={`0 0 ${FO_VIEW.w} ${FO_VIEW.h}`}
          role="img"
          aria-labelledby="foTitle foDesc"
          className="absolute inset-0 block h-full w-full"
        >
          <title id="foTitle">Fails-open comparison</title>
          <desc id="foDesc">
            One request forks at the context step. When Statewave is healthy the bundle
            is assembled; when it is unreachable the failure is logged rather than
            raised. Both paths rejoin and return 200 OK, and only the memory in the
            reply differs.
          </desc>
          <line x1="550" y1="104" x2="568" y2="104" stroke="var(--viz-text-3)" strokeWidth="1.5" />
          {FO_BRANCHES.map((b) => {
            const cy = b.y + 27
            const active = trace === b.key
            return (
              <g key={b.key}>
                {/* fork out, then merge back: both curves leave and arrive
                    horizontally so the join reads as a rejoin, not a collision */}
                <path
                  d={`M110 104 C148 104 148 ${cy} 186 ${cy}`}
                  fill="none"
                  stroke={active ? b.stroke : 'var(--viz-text-3)'}
                  strokeWidth={active ? 2 : 1.4}
                  strokeLinecap="round"
                  className="transition-[stroke,stroke-width] duration-300"
                />
                <path
                  d={`M356 ${cy} C394 ${cy} 394 104 432 104`}
                  fill="none"
                  stroke={active ? b.stroke : 'var(--viz-text-3)'}
                  strokeWidth={active ? 2 : 1.4}
                  strokeLinecap="round"
                  className="transition-[stroke,stroke-width] duration-300"
                />
              </g>
            )
          })}
        </svg>

        <GateNode
          tone="neutral"
          title="request"
          style={{
            left: foPct(0, 'w'),
            top: foPct(77, 'h'),
            width: foPct(110, 'w'),
            height: foPct(54, 'h'),
          }}
        />

        {FO_BRANCHES.map((b) => {
          const active = trace === b.key
          return (
            <GateNode
              key={b.key}
              icon={FO_ICONS[b.key]}
              tone={b.key === 'failed' ? 'amber' : 'accent'}
              title={b.title}
              sub={b.sub}
              active={trace === null || active}
              dashed={b.dashed}
              style={{
                left: foPct(186, 'w'),
                top: foPct(b.y, 'h'),
                width: foPct(170, 'w'),
                height: foPct(54, 'h'),
              }}
              interactive={{
                tabIndex: 0,
                role: 'button',
                'aria-label': `Trace the ${b.label.toLowerCase()} path — reply ${b.reply}`,
                'aria-pressed': active,
                onMouseEnter: () => setTrace(b.key),
                onMouseLeave: () => setTrace(null),
                onFocus: () => setTrace(b.key),
                onBlur: () => setTrace(null),
              }}
            />
          )
        })}

        <GateNode
          tone="neutral"
          title="completion"
          style={{
            left: foPct(432, 'w'),
            top: foPct(77, 'h'),
            width: foPct(118, 'w'),
            height: foPct(54, 'h'),
          }}
        />
        <GateNode
          title="200 OK"
          style={{
            left: foPct(568, 'w'),
            top: foPct(77, 'h'),
            width: foPct(112, 'w'),
            height: foPct(54, 'h'),
          }}
        />
      </div>
      <figcaption className="mt-4 text-[13.5px] text-theme-muted">
        One step differs. Hover a branch to trace it — both reply 200 OK, only the
        memory in the reply changes.
      </figcaption>
    </figure>
  )
}

const FAILURE_CARDS = [
  {
    icon: ServerCrash,
    eyebrow: 'Context read fails',
    title: 'The call still goes out',
    body: 'No bundle is injected, the error is logged, and the completion is forwarded as though no subject had been supplied. The client sees a normal reply with no memory in it.',
  },
  {
    icon: Clock3,
    eyebrow: 'Episode write fails',
    title: 'The client never notices',
    body: 'The write happens after the reply has been sent, so a failure there cannot affect the response. That turn is missing from the subject’s history and the next one carries on from what is stored.',
  },
  {
    icon: TriangleAlert,
    eyebrow: 'OpenRouter fails',
    title: 'The upstream error reaches you',
    body: 'Upstream status codes and error bodies are relayed rather than rewritten, so your existing error handling keeps working. Nothing is written to memory for a turn that produced no answer.',
  },
] as const

function FailsOpenSection() {
  return (
    <Band id="failsopen" surface>
      {/* From xl the diagram sits beside the heading: under a 62ch lede it was
          centred in the band, off the heading's axis, with the right half of
          the band empty above it. The shutdown note stays under the figure
          it footnotes. */}
      <div className="grid gap-x-12 xl:grid-cols-[minmax(0,1fr)_680px] xl:items-start">
        <div>
          <BandHead
            id="fails-open-heading"
            lede={
              <>
                If context assembly or the episode write fails, whether the server is
                down, the key is wrong, or the call times out, it is logged and the
                completion still goes through, just without memory for that turn. A
                Statewave outage degrades your app&apos;s{' '}
                <L to="/benchmarks">memory quality</L>. It does not take it down.
              </>
            }
          >
            An enhancement, never a hard dependency
          </BandHead>
        </div>
        <div>
          <Rise className="mt-9 xl:mt-0">
            <FailsOpenDiagram />
          </Rise>

          {/* Held to the diagram's column: as a full-width card it was the widest
              box in the section, for a one-line footnote to the figure above. */}
          <Rise className="mx-auto mt-8 max-w-[680px] xl:mx-0">
            <p className="border-l-2 border-brand-500/40 pl-4 text-[14.5px] leading-[1.6] text-theme-secondary">
              On shutdown, in-flight episode writes are drained before the HTTP client
              closes, since that is the only place a turn exists before Statewave has it.
            </p>
          </Rise>
        </div>
      </div>

      <Rise className="mt-16 grid gap-x-10 gap-y-10 md:grid-cols-3">
        {FAILURE_CARDS.map((card) => (
          <div key={card.eyebrow} className={NOTE}>
            <IconBadge icon={card.icon} size="sm" />
            <Eyebrow className="mt-3">{card.eyebrow}</Eyebrow>
            <div className="mt-1.5 text-[15px] font-semibold text-theme-primary">{card.title}</div>
            <p className="mt-2.5 text-sm leading-[1.6] text-theme-secondary">{card.body}</p>
          </div>
        ))}
      </Rise>
    </Band>
  )
}

/* ─── Configuration ──────────────────────────────────────────────────────── */

function ConfigSection() {
  return (
    <Band id="config">
      <BandHead
        id="config-heading"
        lede="Everything is read from the environment, so the same image runs on a laptop and behind a gateway with no code change. The first two are required for memory to work at all; the last two decide who is allowed to name a subject."
      >
        Four settings decide how it behaves
      </BandHead>

      <Rise className="mt-8">
        <DataTable
          minWidth={620}
          headers={['Variable', 'What it does', 'When']}
          rows={[
            [
              'OPENROUTER_API_KEY',
              'The key used for upstream calls when the client does not send its own.',
              <span className="whitespace-nowrap text-theme-muted">Always</span>,
            ],
            [
              'STATEWAVE_URL',
              'Where the memory runtime lives. Without it, requests are proxied with no memory.',
              <span className="whitespace-nowrap text-theme-muted">Always</span>,
            ],
            [
              'STATEWAVE_TRUST_CLIENT_SUBJECT',
              'Takes the subject header at face value.',
              <span className="text-theme-muted">
                Local, private network, or behind an authenticating gateway
              </span>,
            ],
            [
              'PROXY_JWT_SECRET',
              <>
                Requires a signed token on every route but <C>/health</C>, and takes
                the subject from its <C>sub</C> claim.
              </>,
              <span className="text-theme-muted">
                Anything reachable by clients you do not control
              </span>,
            ],
          ]}
        />
      </Rise>

      <Rise>
        <p className="mt-[18px] max-w-[72ch] text-sm leading-[1.65] text-theme-muted">
          The shipped <C>.env.example</C> lists the remaining optional settings with
          their defaults. Note that the process does not read <C>.env</C> on its own,
          so pass <C>--env-file .env</C> when you start it.
        </p>
      </Rise>
    </Band>
  )
}

/* ─── Quick start ────────────────────────────────────────────────────────── */

const PIP_CMD = `pip install statewave-openrouter
cp .env.example .env     # set OPENROUTER_API_KEY and STATEWAVE_URL
uvicorn statewave_openrouter:app --port 8080 --env-file .env`

const DOCKER_CMD = `docker run --rm -p 8080:8080 --env-file .env \\
  ghcr.io/smaramwbc/statewave-openrouter:${VERSION}`

const VERIFY_CMD = `curl http://localhost:8080/health
# {"status":"ok"}`

const CLIENT_TS = `const client = new OpenAI({
  baseURL: "http://localhost:8080/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

await client.chat.completions.create(
  { model: "openai/gpt-4o", messages },
  { headers: { "X-Statewave-Subject": "user:42" } },
);`

function QuickStartSection() {
  const [tab, setTab] = useState<'pip' | 'docker'>('pip')
  const isPip = tab === 'pip'

  const tabButton = (value: 'pip' | 'docker', label: string) => (
    <button
      key={value}
      type="button"
      onClick={() => setTab(value)}
      aria-pressed={tab === value}
      className="rounded-full px-3.5 py-1.5 font-mono text-xs transition-colors"
      style={
        tab === value
          ? {
            color: 'var(--viz-text)',
            background: 'rgba(122,92,255,0.18)',
            border: '1px solid rgba(122,92,255,0.45)',
          }
          : {
            color: 'var(--viz-text-3)',
            background: 'transparent',
            border: '1px solid var(--viz-border)',
          }
      }
    >
      {label}
    </button>
  )

  return (
    <Band id="start" tier="lead" surface>
      <BandHead id="quick-start-heading" tier="lead">
        Running in three commands
      </BandHead>

      <Rise
        className="mt-8 min-w-0 overflow-hidden rounded-2xl"
        style={{ background: 'var(--viz-code-bg)', border: '1px solid var(--viz-border)' }}
      >
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5"
          style={{
            background: 'var(--viz-shell-header)',
            borderBottom: '1px solid var(--viz-border)',
          }}
        >
          <div className="flex gap-2">
            {tabButton('pip', 'pip')}
            {tabButton('docker', 'Docker')}
          </div>
          <div className="flex items-center gap-3.5">
            <a
              href={`${REPO_URL}#quick-start`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent hover:underline"
            >
              Full guide
            </a>
            <CodeCopyButton
              code={isPip ? PIP_CMD : DOCKER_CMD}
              label={`Copy the ${isPip ? 'pip' : 'Docker'} quick start commands`}
            />
          </div>
        </div>
        <pre
          className="overflow-x-auto px-4 py-5 font-mono text-[13px] leading-[1.9]"
          style={txt}
        >
          {isPip ? (
            <>
              <span style={kw}>pip</span> install statewave-openrouter{'\n'}
              <span style={kw}>cp</span> .env.example .env{'     '}
              <span style={dim}># set OPENROUTER_API_KEY and STATEWAVE_URL</span>
              {'\n'}
              <span style={kw}>uvicorn</span> statewave_openrouter:app --port{' '}
              <span style={str}>8080</span> --env-file .env
            </>
          ) : (
            <>
              <span style={kw}>docker</span> run --rm -p <span style={str}>8080:8080</span>{' '}
              --env-file .env \{'\n'}
              {'  '}ghcr.io/smaramwbc/statewave-openrouter:{VERSION}
            </>
          )}
        </pre>
      </Rise>

      <Rise className="mt-[18px]">
        <CodePanel label="verify" code={VERIFY_CMD}>
          <span style={kw}>curl</span> http://localhost:8080/health{'\n'}
          <span style={dim}>{'# {"status":"ok"}'}</span>
        </CodePanel>
      </Rise>

      <Rise className="mt-[18px] grid gap-[18px] lg:grid-cols-2">
        <CodePanel label="client.ts" code={CLIENT_TS}>
          <span style={attr}>const</span> <span style={txt}>client</span> ={' '}
          <span style={attr}>new</span> <span style={kw}>OpenAI</span>({'{'}
          {'\n  '}
          <span style={attr}>baseURL</span>:{' '}
          <span style={str}>&quot;http://localhost:8080/v1&quot;</span>,{'\n  '}
          <span style={attr}>apiKey</span>: process.env.
          <span style={txt}>OPENROUTER_API_KEY</span>,{'\n'}
          {'}'});{'\n\n'}
          <span style={attr}>await</span> <span style={txt}>client</span>
          .chat.completions.<span style={kw}>create</span>({'\n  '}
          {'{ '}
          <span style={attr}>model</span>: <span style={str}>&quot;openai/gpt-4o&quot;</span>,{' '}
          <span style={attr}>messages</span> {'}'},{'\n  '}
          {'{ '}
          <span style={attr}>headers</span>: {'{ '}
          <span style={str}>&quot;X-Statewave-Subject&quot;</span>:{' '}
          <span style={str}>&quot;user:42&quot;</span> {'} }'},{'\n'});
        </CodePanel>

        <div className={`${CARD} min-w-0 p-6`}>
          <Eyebrow>Before you put it in front of users</Eyebrow>
          <ul className="mt-4 flex list-none flex-col gap-3.5 p-0">
            <IconRow icon={ShieldCheck}>
              Decide how subjects are trusted: a trusted header on a private network,
              signed tokens for anything public.
            </IconRow>
            <IconRow icon={KeyRound}>
              Pick subject ids stable for the user&apos;s lifetime, not per install or
              device.
            </IconRow>
            <IconRow icon={Search}>
              Point your health check at <C>/health</C>; context and episode failures
              never surface as a request error.
            </IconRow>
            <IconRow icon={Waypoints} tone="muted">
              Talking to Statewave directly? The{' '}
              <L to="/developers">Python and TypeScript SDKs</L> cover that path.
            </IconRow>
          </ul>
        </div>
      </Rise>
    </Band>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

/* ─── Closing CTA ────────────────────────────────────────────────────────── *
 * Same `cta-card`/`cta-card-glow` closing pattern as HomePage and the /vs/*
 * pages (src/index.css), so the page ends the way the rest of the site does
 * rather than inventing its own send-off. Buttons mirror the hero's exact
 * pair (same targets, same arrow-on-hover affordance) so the page opens and
 * closes on the same action. */
function CTASection() {
  return (
    <Section>
      <div className="cta-card relative overflow-hidden rounded-[2.5rem] border border-brand-500/25 bg-surface-1/55 px-6 py-20 text-center">
        <div className="cta-card-glow absolute inset-0" aria-hidden="true" />
        <div
          className="absolute inset-x-20 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/60 to-transparent"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto max-w-2xl">
          <Heading
            id="give-openrouter-memory"
            className="font-heading text-4xl md:text-[56px] font-bold leading-[1.05] tracking-[-0.04em] text-theme-primary"
          >
            Give OpenRouter calls <span className="text-gradient-brand">persistent memory</span>
          </Heading>

          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-[1.6] text-theme-secondary/85">
            Self-host the Apache 2.0 proxy, point your existing client at it, and
            every call ships with the context of the ones before it.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button to="/openrouter#start" size="lg">
              <span>Get started</span>
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Button>
            <Button href={REPO_URL} variant="secondary" size="lg">
              View on GitHub
            </Button>
          </div>
        </div>
      </div>
    </Section>
  )
}

export function OpenRouterPage() {
  // JSON-LD for this route lives in lib/page-schema.ts so the prerenderer
  // emits it too; passing it here would reach the client only.
  usePageSEO()

  return (
    <div className="bg-surface-0">
      <HeroSection />
      <BenefitsSection />
      <SectionDivider />
      <DiffSection />
      <SectionDivider />
      <FlowSection />
      <EndpointsSection />
      <SubjectsSection />
      <AuthSection />
      <FailsOpenSection />
      <ConfigSection />
      <QuickStartSection />
      <PageFaq route="/openrouter" />
      <CTASection />
    </div>
  )
}
