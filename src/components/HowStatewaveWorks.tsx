import { type ReactNode } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { Link } from 'react-router-dom'
import { SectionAnchorCopyButton } from './Heading'

/* ─── HowStatewaveWorks ──────────────────────────────────────────────────────
 * An animated walk-through of the Statewave runtime: the five steps that turn
 * a user question into a memory-aware LLM answer, plus the four background
 * jobs that compile memory in the first place.
 *
 * Two variants:
 *   - "full"    — five steps + behind-the-scenes pipeline. Used on
 *                 /developers where the technical depth lands.
 *   - "compact" — three steps (User → Statewave → LLM) with a link to the
 *                 full diagram. Used on /why so the manifesto narrative isn't
 *                 buried under engineering detail.
 *
 * Animation: cards stagger in left-to-right when scrolled into view, the
 * connector line beneath them draws together with the cascade, and the
 * behind-the-scenes row fades in last. Honors prefers-reduced-motion by
 * showing the final state immediately with no transitions.
 */

type FlowVariant = 'full' | 'compact'

interface Props {
  variant?: FlowVariant
  /** Section heading id — used for in-page anchors / nav. */
  id?: string
  /** Hide the eyebrow / title / subtitle. Use when the host page already
   *  carries an equivalent hero (e.g. /product whose H1 is "How Statewave
   *  works") and a second title would feel redundant. */
  showHeader?: boolean
}

export function HowStatewaveWorks({
  variant = 'full',
  id = 'how-it-works',
  showHeader = true,
}: Props) {
  const reduced = useReducedMotion() ?? false
  const isFull = variant === 'full'

  const steps = isFull ? FULL_STEPS : COMPACT_STEPS
  // Grid columns scale to the step count; smaller breakpoints stack so each
  // card has room to breathe rather than being crushed into a phone-width row.
  const gridCols = isFull
    ? 'md:grid-cols-2 lg:grid-cols-5'
    : 'md:grid-cols-3'

  return (
    <div id={id} className="relative scroll-mt-24">
      {/* Soft accent halo behind the flow — same recipe as the manifesto hero,
          dialed down so it reads as warmth rather than a glow. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 bottom-1/3 pointer-events-none -z-10"
        style={{
          background:
            'radial-gradient(70% 60% at 50% 30%, rgba(99,102,241,0.07), transparent 70%)',
        }}
      />

      {showHeader && <FlowHeader variant={variant} reduced={reduced} id={id} />}

      <div className={`relative ${showHeader ? 'mt-12' : ''}`}>
        {/* Connector line behind the cards (lg+ only). The cards are grid items
            so the line sits behind them at row centerline; on smaller screens
            the cards stack vertically and the line would be misleading. */}
        {steps.length > 1 && <ConnectorLine reduced={reduced} />}

        <motion.ol
          role="list"
          className={`relative grid grid-cols-1 ${gridCols} gap-4 lg:gap-3`}
          variants={listContainer}
          initial={reduced ? 'show' : 'hidden'}
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {steps.map((step, i) => (
            <FlowCard
              key={step.key}
              step={step}
              index={i}
              total={steps.length}
            />
          ))}
        </motion.ol>
      </div>

      {isFull ? (
        <BehindTheScenes reduced={reduced} />
      ) : (
        <CompactFooter />
      )}
    </div>
  )
}

/* ─── Animation variants ─────────────────────────────────────────────────────
 * Stagger the cards left-to-right with a tight rhythm. The easing is the
 * Penner expo-out cubic-bezier — quick start, soft landing, premium feel.
 */
const listContainer: Variants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.11, delayChildren: 0.05 },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

const childVariants: Variants = {
  hidden: { opacity: 0, x: -4 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, delay: 0.15 } },
}

/* ─── Header / replay control ────────────────────────────────────────────── */

function FlowHeader({ variant, reduced, id }: { variant: FlowVariant; reduced: boolean; id: string }) {
  const eyebrow = variant === 'full' ? 'Open source · Self-hosted · Apache 2.0' : 'How it works'
  const headline =
    variant === 'full'
      ? 'How Statewave Works'
      : 'From question to memory-aware answer'
  const sub =
    variant === 'full'
      ? 'Durable memory for AI agents: episodes → memories → ranked context.'
      : 'Statewave assembles a token-bounded, ranked context bundle so every reply is grounded in the subject\'s real history.'

  return (
    <div className="text-center">
      <motion.p
        initial={reduced ? false : { opacity: 0, y: 6 }}
        whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent"
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        initial={reduced ? false : { opacity: 0, y: 8 }}
        whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, delay: 0.05 }}
        className="group mt-4 text-3xl md:text-4xl font-bold tracking-tight text-theme-primary"
      >
        {headline.split(/(Statewave Works|memory-aware answer)/).map((part, i) =>
          part === 'Statewave Works' || part === 'memory-aware answer' ? (
            <span
              key={i}
              className="bg-gradient-to-r from-accent via-brand-400 to-brand-300 bg-clip-text text-transparent"
            >
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
        <SectionAnchorCopyButton id={id} />
      </motion.h2>
      <motion.p
        initial={reduced ? false : { opacity: 0, y: 6 }}
        whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, delay: 0.1 }}
        className="mt-4 text-base md:text-lg text-theme-muted max-w-2xl mx-auto"
      >
        {sub}
      </motion.p>
    </div>
  )
}

/* ─── Connector line ─────────────────────────────────────────────────────── */

function ConnectorLine({ reduced }: { reduced: boolean }) {
  // Sits behind the cards and traces the flow on lg+. We use a CSS-only
  // gradient (no SVG) because the line is purely decorative and a draw-on-view
  // animation works just as well via scaleX.
  return (
    <motion.div
      aria-hidden
      className="hidden lg:block absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px origin-left z-0 pointer-events-none"
      style={{
        // Slightly punchier opacity so the connector reads on both light (cream
        // surface) and dark themes — at 0.35 it disappeared on light.
        background:
          'linear-gradient(to right, transparent 0%, rgba(99,102,241,0.5) 12%, rgba(99,102,241,0.75) 50%, rgba(99,102,241,0.5) 88%, transparent 100%)',
      }}
      initial={reduced ? false : { scaleX: 0, opacity: 0 }}
      whileInView={reduced ? undefined : { scaleX: 1, opacity: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
    />
  )
}

/* ─── Flow card ──────────────────────────────────────────────────────────── */

interface Step {
  key: string
  number: number
  title: string
  body: ReactNode
  /** Optional emphasis — adds an accent ring + slight scale. Used for the
   *  middle "ContextAssembler" step in the full variant. */
  emphasized?: boolean
}

function FlowCard({ step, index, total }: { step: Step; index: number; total: number }) {
  const isLast = index === total - 1
  return (
    <motion.li
      variants={cardVariants}
      className={[
        'relative rounded-2xl border bg-surface-1/95 backdrop-blur-sm',
        'p-5 lg:p-4 xl:p-5',
        'flex flex-col',
        step.emphasized
          ? 'border-accent/30 shadow-[0_0_0_1px_rgba(99,102,241,0.12),0_8px_32px_-12px_rgba(99,102,241,0.25)]'
          : 'border-theme-border',
      ].join(' ')}
    >
      {/* Step number pill — small, top-left, accent-tinted. */}
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-accent/10 text-accent text-xs font-semibold tabular-nums ring-1 ring-accent/20">
          {step.number}
        </span>
        {!isLast && (
          <ChevronRight
            className="hidden lg:block w-4 h-4 text-accent/40"
            aria-hidden
          />
        )}
      </div>
      <h3 className="text-sm md:text-[15px] font-semibold text-theme-primary leading-snug">
        {step.title}
      </h3>
      <div className="mt-3 flex-1 text-sm text-theme-secondary leading-relaxed">
        {step.body}
      </div>
    </motion.li>
  )
}

/* ─── Step bodies (composed from small primitives) ───────────────────────── */

function ChatBubble({
  children,
  tone = 'neutral',
  attribution,
}: {
  children: ReactNode
  tone?: 'neutral' | 'accent'
  attribution?: string
}) {
  // Tail color must match the bubble's bg + border explicitly. `border-inherit`
  // / `bg-inherit` don't reliably propagate the parent's resolved color in
  // every browser, so the tail came out invisible — set them directly.
  const toneClass =
    tone === 'accent'
      ? 'bg-accent/10 border-accent/20 text-theme-primary'
      : 'bg-surface-2 border-theme-border text-theme-secondary'
  const tailClass =
    tone === 'accent'
      ? 'bg-accent/10 border-accent/20'
      : 'bg-surface-2 border-theme-border'
  return (
    <figure className="space-y-2">
      <blockquote
        className={`relative rounded-xl border px-3.5 py-3 text-[13px] leading-relaxed ${toneClass}`}
      >
        <span
          className={`absolute -left-1 top-3 w-2 h-2 rotate-45 border-b border-l ${tailClass}`}
          aria-hidden
        />
        <p className="italic">"{children}"</p>
      </blockquote>
      {attribution && (
        <figcaption className="text-[11px] uppercase tracking-wider text-theme-muted">
          {attribution}
        </figcaption>
      )}
    </figure>
  )
}

function CodeRow({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="font-mono text-[12px] flex gap-2">
      <span className="text-theme-muted">{k}</span>
      <span className="text-theme-muted">=</span>
      <span className={accent ? 'text-accent' : 'text-brand-300'}>{v}</span>
    </div>
  )
}

function SubItem({
  icon,
  title,
  bullets,
}: {
  icon: ReactNode
  title: string
  bullets: string[]
}) {
  return (
    <motion.div variants={childVariants} className="flex gap-3">
      <div className="shrink-0 mt-0.5 h-7 w-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center ring-1 ring-accent/15">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-theme-primary">{title}</p>
        <ul className="mt-1 text-[12px] text-theme-muted leading-relaxed space-y-0.5">
          {bullets.map((b) => (
            <li key={b}>• {b}</li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

function BundleRow({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <motion.div
      variants={childVariants}
      className="flex items-center gap-2.5 text-[13px] text-theme-secondary"
    >
      <span className="h-6 w-6 rounded-md bg-accent/10 text-accent flex items-center justify-center ring-1 ring-accent/15">
        {icon}
      </span>
      <span>{label}</span>
    </motion.div>
  )
}

/* ─── Step content ───────────────────────────────────────────────────────── */

const FULL_STEPS: Step[] = [
  {
    key: 'ask',
    number: 1,
    title: 'User asks a question',
    body: (
      <div className="space-y-3">
        <ChatBubble>
          Following up on the billing issue{' '}
          <em className="not-italic font-medium text-theme-primary">from last week</em> — any update?
        </ChatBubble>
        <p className="text-[12px] text-theme-muted">New query to the app / LLM</p>
      </div>
    ),
  },
  {
    key: 'request',
    number: 2,
    title: 'App asks Statewave for context',
    body: (
      <div className="space-y-3">
        <p className="text-[12px] text-theme-muted">Send subject + task</p>
        <div className="rounded-lg border border-theme-border bg-surface-2 p-3 space-y-1">
          <CodeRow k="subject_id" v="customer_123" />
          <CodeRow k="task" v="answer billing question" accent />
        </div>
        <p className="text-[12px] text-theme-muted flex items-center gap-2">
          <CloudIcon className="w-3.5 h-3.5" />
          Context request
        </p>
      </div>
    ),
  },
  {
    key: 'find',
    number: 3,
    title: 'Statewave finds the right context',
    emphasized: true,
    body: (
      <div className="space-y-3">
        <SubItem
          icon={<SearchIcon className="w-3.5 h-3.5" />}
          title="Search memories"
          bullets={['profile facts', 'preferences', 'procedures', 'past decisions']}
        />
        <SubItem
          icon={<ClockIcon className="w-3.5 h-3.5" />}
          title="Pull relevant episodes"
          bullets={['recent interactions', 'support events', 'raw conversation history']}
        />
        <SubItem
          icon={<FilterIcon className="w-3.5 h-3.5" />}
          title="Rank & filter"
          bullets={[
            'semantic similarity',
            'recency · kind priority',
            'temporal validity · token budget',
          ]}
        />
        <p className="mt-2 pt-2 border-t border-theme-border/70 text-[11px] text-accent/90 leading-relaxed">
          ContextAssembler builds a ranked context bundle
        </p>
      </div>
    ),
  },
  {
    key: 'return',
    number: 4,
    title: 'Return context to the LLM',
    body: (
      <div className="space-y-2.5">
        <BundleRow icon={<UserIcon className="w-3.5 h-3.5" />} label="Facts" />
        <BundleRow icon={<MessageIcon className="w-3.5 h-3.5" />} label="Relevant episodes" />
        <BundleRow icon={<DocIcon className="w-3.5 h-3.5" />} label="Procedures" />
        <BundleRow icon={<ShieldIcon className="w-3.5 h-3.5" />} label="Provenance" />
        <BundleRow icon={<LayersIcon className="w-3.5 h-3.5" />} label="Assembled context" />
        <p className="pt-1 text-[11px] text-theme-muted flex items-center gap-1.5">
          <BoxIcon className="w-3.5 h-3.5 text-accent" />
          Token-bounded context bundle
        </p>
      </div>
    ),
  },
  {
    key: 'answer',
    number: 5,
    title: 'LLM answers with memory',
    body: (
      <div className="space-y-3">
        <p className="flex items-start gap-2 text-[12px] text-theme-muted leading-relaxed">
          <SparkleIcon className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
          <span>Response is personalized, grounded, and aware of prior history.</span>
        </p>
        <ChatBubble tone="accent">
          Yes — the refund posted Friday and your account is active again. Anything else
          you'd like me to check?
        </ChatBubble>
      </div>
    ),
  },
]

const COMPACT_STEPS: Step[] = [
  {
    key: 'ask',
    number: 1,
    title: 'A returning user asks',
    body: (
      <div className="space-y-2">
        <ChatBubble>
          Following up on the billing issue from last week — any update?
        </ChatBubble>
        <p className="text-[12px] text-theme-muted">
          The question implicitly references a prior episode the agent has no built-in way to recall.
        </p>
      </div>
    ),
  },
  {
    key: 'find',
    number: 2,
    title: 'Statewave assembles context',
    emphasized: true,
    body: (
      <div className="space-y-2.5">
        <SubItem
          icon={<SearchIcon className="w-3.5 h-3.5" />}
          title="Search memories"
          bullets={['preferences · procedures', 'past decisions']}
        />
        <SubItem
          icon={<ClockIcon className="w-3.5 h-3.5" />}
          title="Pull relevant episodes"
          bullets={['recent interactions', 'support events']}
        />
        <SubItem
          icon={<FilterIcon className="w-3.5 h-3.5" />}
          title="Rank & filter"
          bullets={['ranked, deterministic, token-bounded']}
        />
      </div>
    ),
  },
  {
    key: 'answer',
    number: 3,
    title: 'The LLM answers with memory',
    body: (
      <div className="space-y-3">
        <p className="flex items-start gap-2 text-[12px] text-theme-muted leading-relaxed">
          <SparkleIcon className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
          <span>Personalized, grounded, and aware of prior history.</span>
        </p>
        <ChatBubble tone="accent">
          Yes — the refund posted Friday and your account is active again.
        </ChatBubble>
      </div>
    ),
  },
]

/* ─── Behind the scenes (full variant) ───────────────────────────────────── */

function BehindTheScenes({ reduced }: { reduced: boolean }) {
  const stages = [
    {
      letter: 'A',
      title: 'Record episodes',
      desc: 'Append-only raw events from chats, actions, tickets, or workflows.',
    },
    {
      letter: 'B',
      title: 'Compile memories',
      desc: 'Heuristic or LLM compilers extract typed memories.',
    },
    {
      letter: 'C',
      title: 'Store with provenance + embeddings',
      desc: 'Each memory links back to its source episodes.',
    },
    {
      letter: 'D',
      title: 'Persist in Postgres + pgvector',
      desc: 'Durable memory runtime — your infrastructure.',
    },
  ]

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 12 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mt-10 rounded-2xl border border-dashed border-theme-border bg-surface-1/40 p-5 md:p-6"
    >
      <p className="text-center text-[11px] uppercase tracking-[0.22em] text-theme-muted">
        Behind the scenes — how memory is created
      </p>
      <ol className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-2">
        {stages.map((s, i) => (
          <motion.li
            key={s.letter}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: 0.7 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-xl border border-theme-border bg-surface-1 p-4"
          >
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-accent/15 text-accent text-[11px] font-bold ring-1 ring-accent/25">
                {s.letter}
              </span>
              <h4 className="text-[13px] font-semibold text-theme-primary leading-tight">
                {s.title}
              </h4>
            </div>
            <p className="mt-2 text-[12px] text-theme-muted leading-relaxed">
              {s.desc}
            </p>
            {i < stages.length - 1 && (
              <ChevronRight
                className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent/40"
                aria-hidden
              />
            )}
          </motion.li>
        ))}
      </ol>
      <p className="mt-5 text-center text-[12px] text-theme-muted">
        Core loop:{' '}
        <span className="text-theme-secondary">Record</span>
        {' → '}
        <span className="text-theme-secondary">Compile</span>
        {' → '}
        <span className="text-theme-secondary">Context</span>
        {' → '}
        <span className="text-theme-secondary">Govern</span>
      </p>
    </motion.div>
  )
}

/* ─── Compact footer (compact variant) ───────────────────────────────────── */

function CompactFooter() {
  return (
    <div className="mt-10 flex justify-center">
      <Link
        to="/product#how-it-works"
        className="group inline-flex items-center gap-2 text-sm text-theme-muted hover:text-accent transition-colors"
      >
        <span className="tracking-wide">See the full architecture</span>
        <span className="transition-transform group-hover:translate-x-0.5" aria-hidden>
          →
        </span>
      </Link>
    </div>
  )
}

/* ─── Inline icons ───────────────────────────────────────────────────────────
 * Heroicons-style stroke icons. Inlined so we don't pull a dep just for this
 * surface. All sized via className from the caller.
 */

interface IconProps {
  className?: string
}

function ChevronRight({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="9 6 15 12 9 18" />
    </svg>
  )
}

function CloudIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17.5 19a4.5 4.5 0 1 0-1.4-8.78A6 6 0 0 0 4 12.5a4.5 4.5 0 0 0 .5 8.5h13Z" />
    </svg>
  )
}

function SearchIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <line x1="20" y1="20" x2="16.5" y2="16.5" />
    </svg>
  )
}

function ClockIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </svg>
  )
}

function FilterIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="3 4 21 4 14 13 14 20 10 20 10 13 3 4" />
    </svg>
  )
}

function UserIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  )
}

function MessageIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 5h16v11H8l-4 4V5Z" />
    </svg>
  )
}

function DocIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 3h8l4 4v14H7V3Z" />
      <polyline points="14 3 14 8 19 8" />
      <line x1="9" y1="13" x2="17" y2="13" />
      <line x1="9" y1="17" x2="14" y2="17" />
    </svg>
  )
}

function ShieldIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}

function LayersIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="12 3 21 8 12 13 3 8 12 3" />
      <polyline points="3 13 12 18 21 13" />
      <polyline points="3 18 12 23 21 18" />
    </svg>
  )
}

function BoxIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 7l9-4 9 4v10l-9 4-9-4V7Z" />
      <polyline points="3 7 12 11 21 7" />
      <line x1="12" y1="11" x2="12" y2="21" />
    </svg>
  )
}

function SparkleIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.5l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Zm7 11l1 2.5 2.5 1-2.5 1L19 20l-1-2.5-2.5-1 2.5-1L19 13.5Z" />
    </svg>
  )
}
