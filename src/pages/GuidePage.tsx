import { AnimatePresence, LayoutGroup, motion, useInView, useReducedMotion, type Variants } from 'framer-motion'
import { memo, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Heading } from '../components/Heading'
import { CodeCopyButton } from '../components/CodeCopyButton'
import { PageFaq } from '../components/PageFaq'
import { usePageSEO } from '../lib/seo'

/* Landing page for Statewave Guide, the open-source in-app guidance framework.
 * Imported from the Claude Design project "Guide Page v2".
 *
 * Every figure on this page is checked against the statewave-guide README and
 * docs/provider-reality-check-round-2.md, not the mock. The mock said 1,612
 * unit tests (README: 1500+) and "runs fully offline" (README doesn't claim it).
 *
 * The four navy panels are fixed-colour in both themes. The light bands use
 * the --viz-* tokens so they flip with the theme. The app mockups are
 * screenshots of a light app and stay light in both themes. */

const REPO = 'https://github.com/smaramwbc/statewave-guide'
const ACCENT = '#2F5BF0'

const NAVY = 'relative isolate mx-auto max-w-[1760px] overflow-hidden rounded-[32px] bg-[#0A1233]'
/* Hover lift follows the /about and /benchmarks card recipe. */
const LIFT = 'transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-[var(--viz-border-strong)] hover:shadow-[0_18px_50px_rgba(47,91,240,0.12)]'
const CARD = `rounded-[28px] border border-[var(--viz-border)] bg-[var(--viz-card)] sw-card ${LIFT}`
const INNER = 'rounded-[20px] bg-[var(--viz-card-2)]'
const TILE = 'rounded-[14px] border border-[var(--viz-border)] bg-[var(--viz-card)]'
const DASHED = 'rounded-[14px] border border-dashed border-[var(--viz-border-strong)]'
const MONO_LABEL = 'font-mono text-[11px] font-semibold tracking-[0.14em] text-theme-muted'
const H2 = 'font-heading text-[clamp(2.25rem,4.8vw,4.25rem)] font-medium leading-[1.02] tracking-[-0.035em] text-balance'
const EYEBROW = 'mb-[18px] text-[15px] font-medium'
const GRAD_TEXT = 'bg-[linear-gradient(90deg,#00C6FF,#4A8CFF,#8B6CFF)] bg-clip-text text-transparent'

/* Site motion dialect (same cadence as /benchmarks). */
const STAGGER: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } } }
const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 0.61, 0.36, 1] } },
}
const STILL: Variants = { hidden: {}, show: {} }

function Stagger({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <motion.div variants={STAGGER} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} className={className}>
      {children}
    </motion.div>
  )
}

function Rise({ className = '', children }: { className?: string; children: ReactNode }) {
  const reduced = useReducedMotion() ?? false
  return <motion.div variants={reduced ? STILL : FADE_UP} className={className}>{children}</motion.div>
}

function Ext({ href, className = '', children }: { href: string; className?: string; children: ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
}

/* ─── Mock app pieces (shared by the hero demo and the runtime still) ─────── */

type Status = 'Active' | 'Paused' | 'Lead' | 'New'
const STATUS: Record<Status, [string, string, string]> = {
  Active: ['rgba(34,160,107,.1)', '#1F7A52', '#22A06B'],
  Paused: ['#EEF0F4', '#5B6170', '#A0A6B4'],
  Lead: ['rgba(47,91,240,.08)', '#2F4FC4', '#5B7BFF'],
  New: ['rgba(47,91,240,.08)', '#2F4FC4', ACCENT],
}
interface Row { i: string; name: string; meta: string; deal: string; when: string; status: Status; g: [string, string]; bg?: string; sel?: boolean }
const ROWS: Row[] = [
  { i: 'AL', name: 'Acme Logistics', meta: 'Freight · Berlin', deal: '€48,200', when: '2h ago', status: 'Active', g: ['#6366F1', '#A78BFA'] },
  { i: 'NS', name: 'Northwind Studio', meta: 'Design · Lisbon', deal: '€12,900', when: 'Yesterday', status: 'Active', g: ['#0EA5E9', '#67E8F9'] },
  { i: 'HP', name: 'Harbor & Pine', meta: 'Retail · Oslo', deal: '€7,450', when: '3d ago', status: 'Paused', g: ['#F97316', '#FDA4AF'] },
  { i: 'BC', name: 'Brightline Co.', meta: 'SaaS · Austin', deal: '€21,000', when: '5d ago', status: 'Lead', g: ['#10B981', '#BEF264'] },
  { i: 'ML', name: 'Meridian Labs', meta: 'Biotech · Basel', deal: '€66,300', when: '1w ago', status: 'Active', g: ['#475569', '#94A3B8'] },
]

/* Columns drop as the TABLE narrows (container query), since its width
 * depends on the demo layout, not the viewport: company + status always,
 * deal from 24rem, last activity from 32rem. */
/* The row the walkthrough creates: tinted while it is new, then plain. */
const NEW_ROW: Row = { i: 'FA', name: 'Fjord Analytics', meta: 'Data · Bergen', deal: '—', when: 'Just now', status: 'New', g: [ACCENT, '#22D3EE'] }
const NEW_ROW_HOT: Row = { ...NEW_ROW, bg: '#F3F6FF' }

const ROW_GRID = 'grid grid-cols-[minmax(0,1fr)_84px] gap-3 @sm:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_84px] @lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_84px]'
const COL_DEAL = 'hidden @sm:block'
const COL_WHEN = 'hidden @lg:block'
const RING = 'pointer-events-none absolute -inset-1 rounded-[11px] shadow-[0_0_0_1.5px_#2F5BF0,0_0_0_5px_rgba(47,91,240,.14)] transition-[opacity,transform] duration-300'
const TIP = 'pointer-events-none absolute z-[9] w-max max-w-[230px] rounded-[10px] bg-[#111318] px-3 py-2.5 text-white shadow-[0_12px_32px_rgba(17,19,24,.28)] transition-[opacity,transform] duration-200'
const BTN = 'relative inline-flex h-[30px] shrink-0 items-center whitespace-nowrap rounded-lg px-3 text-[12.5px] transition-transform duration-150'

const ClientRow = memo(function ClientRow({ r }: { r: Row }) {
  const [sBg, sFg, sDot] = STATUS[r.status]
  return (
    <div className={`${ROW_GRID} items-center border-b border-[#EEF0F4] px-3.5 py-2.5 text-[13px] transition-colors duration-500`} data-rt={r.sel ? 2 : undefined} style={{ background: r.bg ?? '#fff', boxShadow: r.sel ? 'inset 0 0 0 1.5px #2F5BF0' : undefined }}>
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-semibold text-white" style={{ background: `linear-gradient(135deg,${r.g[0]},${r.g[1]})` }}>{r.i}</span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-medium text-[#111318]">{r.name}</span>
          <span className="truncate text-[11.5px] text-[#80869A]">{r.meta}</span>
        </span>
      </span>
      <span className={`${COL_DEAL} whitespace-nowrap text-right tabular-nums text-[#111318]`}>{r.deal}</span>
      <span className={`${COL_WHEN} truncate text-xs text-[#80869A]`}>{r.when}</span>
      <span className="whitespace-nowrap">
        <span className="inline-flex h-5 items-center gap-1.5 rounded-full px-2 text-[11px] font-medium" style={{ background: sBg, color: sFg }}>
          <span className="size-1.5 rounded-full" style={{ background: sDot }} />{r.status}
        </span>
      </span>
    </div>
  )
})

const NAV_ICONS = {
  Dashboard: <path d="M2.5 2.5h4v4h-4zM9.5 2.5h4v4h-4zM2.5 9.5h4v4h-4zM9.5 9.5h4v4h-4z" />,
  Clients: <><circle cx="6" cy="5.5" r="2.5" /><path d="M1.8 13.5c.6-2.4 2.3-3.6 4.2-3.6s3.6 1.2 4.2 3.6M10.5 3.2a2.4 2.4 0 0 1 0 4.6M12.3 9.9c1 .5 1.7 1.6 2 3.6" /></>,
  Invoices: <><path d="M4 1.8h5.5L12.5 5v9.2H4z" /><path d="M9.5 1.8V5h3M6.3 8.2h3.8M6.3 10.8h3.8" /></>,
  Settings: <><path d="M2.5 4.5h6M11.5 4.5h2M2.5 11.5h2M7.5 11.5h6" /><circle cx="10" cy="4.5" r="1.5" /><circle cx="6" cy="11.5" r="1.5" /></>,
}

const MockSidebar = memo(function MockSidebar() {
  return (
    <aside className="hidden w-[164px] flex-col gap-0.5 border-r border-[#E6E8EE] bg-[#F4F6F9] px-2.5 py-3 text-[13px] min-[1400px]:flex">
      <div className="flex items-center gap-2 px-2 pb-3.5 pt-1">
        <span className="inline-flex size-[22px] items-center justify-center rounded-md bg-[linear-gradient(135deg,#3A3F4B,#6B7282)] text-[10px] font-semibold text-white">N</span>
        <span className="font-semibold text-[#111318]">Northstar</span>
      </div>
      {(Object.keys(NAV_ICONS) as (keyof typeof NAV_ICONS)[]).map((k) => (
        <span key={k} className={`relative flex items-center gap-2 rounded-[7px] px-2.5 py-1.5 ${k === 'Clients' ? 'bg-[rgba(47,91,240,.07)] font-medium text-[#111318]' : 'text-[#5B6170]'}`}>
          {k === 'Clients' && <span className="absolute inset-y-[7px] left-0 w-0.5 rounded bg-[#2F5BF0]" />}
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{NAV_ICONS[k]}</svg>
          {k}
        </span>
      ))}
    </aside>
  )
})

function BrowserChrome({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-[#FAFBFC] text-[#111318] shadow-[0_0_0_1px_rgba(255,255,255,.14),0_40px_100px_rgba(0,0,40,.45)]">
      <div className="flex h-[30px] items-center gap-3 border-b border-[#E6E8EE] bg-[#F4F6F9] px-3">
        <div className="flex gap-[5px]">{[0, 1, 2].map((i) => <span key={i} className="size-2 rounded-full bg-[#DADDE4]" />)}</div>
        <span className="mx-auto max-w-[240px] flex-1 truncate rounded-full bg-white px-2.5 py-0.5 text-center text-[10.5px] text-[#A0A6B4] shadow-[inset_0_0_0_1px_#E6E8EE]">demo-crm.local/clients</span>
        <span className="w-[31px]" />
      </div>
      {children}
    </div>
  )
}

const GuideHeader = memo(function GuideHeader() {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-[#E6E8EE] px-3.5 py-[11px]">
      <span className="flex items-center gap-2 text-[13px] font-semibold">
        <span className="inline-flex size-5 rounded-md bg-[linear-gradient(135deg,#00C6FF,#4A8CFF_50%,#7A5CFF)]" />Guide
      </span>
      <span className="inline-flex h-5 items-center gap-1.5 rounded-full bg-white px-2 text-[11px] text-[#5B6170] shadow-[inset_0_0_0_1px_#E6E8EE]">
        <span className="size-1.5 rounded-full bg-[#22A06B]" />Memory · local
      </span>
    </div>
  )
})

function SendIcon() {
  return <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" /></svg>
}

function CursorSvg() {
  return <svg width="18" height="20" viewBox="0 0 18 20" fill="none" aria-hidden="true"><path d="M2 1.5v15.2l4.1-3.7 2.6 5.8 2.7-1.2-2.6-5.7 5.6-.3L2 1.5Z" fill="#111318" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" /></svg>
}

function Tip({ label, count, text, pos }: { label: string; count: string; text: string; pos: string }) {
  return (
    <>
      <span className="relative flex items-center justify-between gap-4 font-mono text-[10.5px] text-[#9AA0AE]">
        <span>{label}</span><span className="rounded-full bg-white/10 px-1.5 text-white">{count}</span>
      </span>
      <span className="relative mt-1 block text-[13px] leading-snug">{text}</span>
      <span className={`absolute size-[9px] rotate-45 rounded-[1px] bg-[#111318] ${pos}`} />
    </>
  )
}

const EVIDENCE = (
  <div className="flex flex-col gap-1 px-[11px] pb-2.5 font-mono text-[10.5px] text-[#5B6170]">
    <span className="truncate">src/pages/Clients.tsx:12</span>
    <span className="truncate">POST /api/clients</span>
    <span className="flex items-center gap-1.5 text-[#1F8A5B]"><span className="size-1.5 rounded-full bg-[#22A06B]" />verified</span>
  </div>
)

/* ─── Hero demo ──────────────────────────────────────────────────────────── */

const STEPS = [
  { label: 'Ask', d: 3000 }, { label: 'Resolve', d: 2400 }, { label: 'Answer', d: 2200 },
  { label: 'Step 1', d: 2400 }, { label: 'Step 2', d: 3000 }, { label: 'Step 3', d: 2200 }, { label: 'Remembered', d: 3400 },
]
const SEGMENTS: [string, number, number][] = [['Ask', 0, 2], ['Walk through', 3, 5], ['Done', 6, 6]]
const Q = 'How do I create a client?'
const NAME = 'Fjord Analytics'
const INSPECTOR: [string, string][][] = [
  [['EVIDENCE', 'waiting for a question'], ['RUNTIME', 'screen /clients · 5 rows visible'], ['MEMORY', 'walkthrough clients.create · not seen']],
  [['EVIDENCE', 'Clients.tsx:12 · data-guide="clients.create"'], ['RUNTIME', 'control visible · "+ New Client"'], ['MEMORY', 'walkthrough clients.create · not seen']],
  [['EVIDENCE', 'clients.create → openCreateClient()'], ['RUNTIME', 'control visible · "+ New Client"'], ['MEMORY', 'no prior walkthrough · offer steps']],
  [['EVIDENCE', 'invokes openCreateClient() · opens'], ['RUNTIME', 'highlight → [data-guide=clients.create]'], ['MEMORY', 'walkthrough started']],
  [['EVIDENCE', 'opens NewClientDialog'], ['RUNTIME', "visible now · field showing 'Client name'"], ['MEMORY', 'no text stored · counters only']],
  [['EVIDENCE', 'submitClient() → POST /api/clients'], ['RUNTIME', "visible now · button showing 'Save client'"], ['MEMORY', 'walkthrough step 3 of 3']],
  [['EVIDENCE', 'calls_api POST /api/clients'], ['RUNTIME', 'row "Fjord Analytics" · contextual, not kept'], ['MEMORY', 'walkthrough completed ×1 · 1 durable record']],
]
const TRACE: [string, string][] = [['intent', 'clients.create'], ['evidence', 'Clients.tsx:12 · invokes'], ['verifier', 'claim accepted']]
const W_LABELS = ['Open New Client', 'Name the client', 'Save']

function cursorTarget(step: number, el: number) {
  if (step <= 1) return 'input'
  if (step === 2) return el > 700 ? 'step' : 'input'
  return ['new', 'name', 'save'][step - 3] ?? null
}

function HeroDemo() {
  const reduced = useReducedMotion() ?? false
  const [t, setT] = useState({ step: 0, el: 0 })
  const [paused, setPaused] = useState(false)
  const [evOpen, setEvOpen] = useState(true)
  const [inspOpen, setInspOpen] = useState(false)
  const [cur, setCur] = useState({ x: 0, y: 0, op: 0 })
  const stage = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  // Only tick while the demo is on screen.
  const inView = useInView(box, { amount: 0.25 })

  /* The demo plays for everyone, with a pause button. Under reduced motion it
   * still steps (typing, tooltips, panels) but drops the sliding and scaling:
   * the cursor jumps instead of travelling. */
  const playing = !paused && inView
  const { step, el } = t
  const go = (step: number) => setT({ step, el: paused ? 800 : 0 })

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setT(({ step, el }) => (el + 100 >= STEPS[step].d ? { step: (step + 1) % STEPS.length, el: 0 } : { step, el: el + 100 }))
    }, 100)
    return () => clearInterval(id)
  }, [playing])

  /* The cursor is measured when its target changes, again once the dialog's
   * 300ms entrance settles, and on resize. Measuring on every 100ms tick forced
   * a layout per tick and was most of the demo's frame cost. */
  const target = cursorTarget(step, el)
  useLayoutEffect(() => {
    const measure = () => {
      const s = stage.current
      const t = target && s?.querySelector(`[data-target="${target}"]`)
      if (!s || !t) { setCur((c) => (c.op === 0 ? c : { ...c, op: 0 })); return }
      const a = s.getBoundingClientRect(), r = t.getBoundingClientRect()
      const x = Math.round(r.left - a.left + r.width * (target === 'input' ? 0.8 : 0.62))
      const y = Math.round(r.top - a.top + r.height * 0.62)
      setCur((c) => (Math.abs(c.x - x) > 1 || Math.abs(c.y - y) > 1 || c.op !== 1 ? { x, y, op: 1 } : c))
    }
    measure()
    const settle = setTimeout(measure, 350)
    window.addEventListener('resize', measure)
    return () => { clearTimeout(settle); window.removeEventListener('resize', measure) }
  }, [target])

  const on = (b: boolean) => (b ? 1 : 0)
  const ringIn = (st: number, from: number) => step === st && el > from
  const typing = step === 0
  const qChars = typing ? Math.min(Q.length, Math.max(0, Math.floor((el - 300) / 90))) : 0
  const nameChars = step === 4 ? Math.min(NAME.length, Math.max(0, Math.floor((el - 700) / 90))) : step > 4 ? NAME.length : 0
  const traceN = step === 1 ? Math.min(3, Math.floor(el / 650)) : step > 1 ? 3 : 0
  const stepsDone = step <= 3 ? 0 : step - 3
  const stepHot = step >= 3 || (step === 2 && el > 1400)
  const dialog = step === 4 || step === 5
  const sendHot = typing && qChars === Q.length

  const rows = step === 6 ? [el < 1800 ? NEW_ROW_HOT : NEW_ROW, ...ROWS.slice(0, -1)] : ROWS
  const inspector = INSPECTOR[step]

  const togglePlay = () => setPaused((p) => !p)
  const playingLabel = !paused

  return (
    <div ref={box} className="relative mx-auto mt-[clamp(48px,5vw,72px)] max-w-[1260px]">
      <Rise>
        <div role="group" aria-label="Recorded walkthrough: Guide answers where to create a client, then steps through it">
          <BrowserChrome>
            <div ref={stage} className="relative">
              <div className="grid min-h-[470px] grid-cols-1 min-[700px]:grid-cols-[minmax(0,1fr)_minmax(250px,290px)] min-[1400px]:grid-cols-[auto_minmax(0,1fr)_minmax(250px,290px)]">
                <MockSidebar />
                {/* App column */}
                <div className="relative flex min-w-0 flex-col px-5 py-[18px]">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-[11.5px] text-[#80869A]">Workspace / Clients</p>
                      <p className="mt-0.5 flex items-center gap-2 text-base font-semibold tracking-[-0.01em]">
                        Clients<span className="inline-flex h-[18px] items-center rounded-full bg-[#EEF0F4] px-1.5 text-[11px] font-medium text-[#5B6170]">{step === 6 ? 49 : 48}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="hidden h-[30px] w-[150px] items-center gap-2 rounded-lg bg-white px-2.5 text-xs text-[#A0A6B4] shadow-[inset_0_0_0_1px_#E6E8EE] min-[900px]:inline-flex">
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3 3" strokeLinecap="round" /></svg>Search clients
                      </span>
                      <span data-target="new" className="relative inline-flex">
                        <span className={RING} style={{ opacity: on(ringIn(3, 400)), transform: `scale(${ringIn(3, 400) ? 1 : 1.12})` }} />
                        <button type="button" onClick={() => go(4)} className={`${BTN} cursor-pointer bg-[#2F5BF0] font-medium text-white hover:bg-[#2448D6]`} style={{ transform: `scale(${step === 3 && el > 1900 ? 0.95 : 1})` }}>+ New Client</button>
                        <span className={`${TIP} right-0 top-[calc(100%+12px)]`} style={{ opacity: on(ringIn(3, 650)), transform: `translateY(${ringIn(3, 650) ? 0 : 6}px)` }}>
                          <Tip label="clients.create" count="1 of 3" text="Open the create dialog." pos="right-[22px] -top-1" />
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="mt-3.5 inline-flex self-start rounded-lg bg-[#EEF0F4] p-0.5 text-xs">
                    <span className="rounded-md bg-white px-[11px] py-1 font-medium shadow-[0_1px_2px_rgba(17,19,24,.08)]">All</span>
                    <span className="px-[11px] py-1 text-[#5B6170]">Active</span>
                    <span className="px-[11px] py-1 text-[#5B6170]">Leads</span>
                  </div>
                  <div className="@container relative mt-3 flex flex-1 flex-col overflow-hidden rounded-[10px] bg-white shadow-[0_0_0_1px_#E6E8EE]">
                    <div className={`${ROW_GRID} whitespace-nowrap border-b border-[#E6E8EE] px-3.5 py-[9px] text-[10.5px] font-medium uppercase tracking-[0.06em] text-[#80869A]`}>
                      <span>Company</span><span className={`${COL_DEAL} text-right`}>Deal</span><span className={`${COL_WHEN} truncate`}>Last activity</span><span>Status</span>
                    </div>
                    {rows.map((r) => <ClientRow key={r.i} r={r} />)}
                    <div className="mt-auto flex items-center justify-between px-3.5 py-[9px] text-[11.5px] text-[#80869A]">
                      <span>Showing 5 of {step === 6 ? 49 : 48}</span>
                    </div>
                    <div className="pointer-events-none absolute inset-0 bg-[rgba(250,251,252,.62)] transition-opacity duration-300" style={{ opacity: on(ringIn(3, 400)) }} />
                  </div>
                  {/* New client dialog */}
                  <div aria-hidden={!dialog} className="pointer-events-none absolute inset-0 z-[8] flex items-center justify-center bg-[rgba(17,19,24,.16)] p-4 transition-opacity duration-300" style={{ opacity: on(dialog) }}>
                    <div className="w-[min(100%,330px)] rounded-xl bg-white shadow-[0_0_0_1px_rgba(17,19,24,.06),0_24px_60px_rgba(17,19,24,.18)] transition-transform duration-300" style={{ transform: `translateY(${dialog ? 0 : 10}px)` }}>
                      <div className="flex items-center justify-between border-b border-[#EEF0F4] px-[18px] py-3.5">
                        <span className="text-[15px] font-semibold">New client</span>
                        <span className="font-mono text-[10.5px] text-[#80869A]">NewClientDialog</span>
                      </div>
                      <div className="flex flex-col gap-3 px-[18px] py-4">
                        <div className="flex flex-col gap-1.5 text-xs font-medium text-[#5B6170]">
                          Client name
                          <span data-target="name" className="relative flex h-[34px] items-center rounded-lg bg-white px-[11px] text-[13px] font-normal text-[#111318]" style={{ boxShadow: `inset 0 0 0 1px ${step === 4 ? ACCENT : '#E6E8EE'}` }}>
                            <span className={RING} style={{ opacity: on(ringIn(4, 400)), transform: `scale(${ringIn(4, 400) ? 1 : 1.12})` }} />
                            {NAME.slice(0, nameChars)}
                            <span className="ml-px h-[15px] w-[1.5px] bg-[#2F5BF0]" style={{ opacity: on(step === 4) }} />
                            <span className={`${TIP} left-0 top-[calc(100%+12px)]`} style={{ opacity: on(step === 4 && el > 600 && el < 2700), transform: `translateY(${step === 4 && el > 600 ? 0 : 6}px)` }}>
                              <Tip label="visible now" count="2 of 3" text="Use the field showing 'Client name'." pos="left-5 -top-1" />
                            </span>
                          </span>
                        </div>
                        <div className="flex flex-col gap-1.5 text-xs font-medium text-[#5B6170]">
                          City
                          <span className="flex h-[34px] items-center rounded-lg bg-white px-[11px] text-[13px] font-normal text-[#111318] shadow-[inset_0_0_0_1px_#E6E8EE]">{step >= 4 ? 'Bergen' : ''}</span>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 rounded-b-xl border-t border-[#EEF0F4] bg-[#FAFBFC] px-[18px] py-3">
                        <span className={`${BTN} bg-white shadow-[inset_0_0_0_1px_#E6E8EE]`}>Cancel</span>
                        <span data-target="save" className="relative inline-flex">
                          <span className={RING} style={{ opacity: on(ringIn(5, 400)), transform: `scale(${ringIn(5, 400) ? 1 : 1.12})` }} />
                          <button type="button" tabIndex={dialog ? 0 : -1} onClick={() => go(6)} className={`${BTN} ${dialog ? 'pointer-events-auto' : ''} cursor-pointer bg-[#2F5BF0] font-medium text-white hover:bg-[#2448D6]`} style={{ transform: `scale(${step === 5 && el > 1700 ? 0.95 : 1})` }}>Save client</button>
                          <span className={`${TIP} bottom-[calc(100%+12px)] right-0`} style={{ opacity: on(ringIn(5, 600)), transform: `translateY(${ringIn(5, 600) ? 0 : 6}px)` }}>
                            <Tip label="submitClient()" count="3 of 3" text="Save calls POST /api/clients." pos="right-[22px] -bottom-1" />
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Guide panel */}
                <div className="flex min-w-0 flex-col border-l border-[#E6E8EE] bg-[#F4F6F9]">
                  <GuideHeader />
                  <div className="flex flex-1 flex-col gap-2.5 overflow-hidden p-3.5">
                    {step >= 1 && <span className="max-w-[88%] self-end rounded-2xl bg-[#111318] px-[13px] py-[7px] text-[13px] text-white">{Q}</span>}
                    {step === 1 && (
                      <div className="flex flex-col gap-1.5 p-0.5">
                        {TRACE.map(([k, v], i) => (
                          <div key={k} className="flex items-center gap-2 font-mono text-[10.5px] text-[#80869A] transition-opacity duration-300" style={{ opacity: i < traceN ? 1 : 0.35 }}>
                            <span className="size-1.5 shrink-0 rounded-full" style={{ background: i < traceN ? '#22A06B' : '#D5D9E2' }} />
                            <span className="w-14 shrink-0">{k}</span><span className="truncate text-[#5B6170]">{v}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {(step === 2 || step === 3) && (
                      <div className="max-w-[96%] rounded-[10px] bg-white px-3 py-[11px] text-[13px] leading-normal shadow-[0_0_0_1px_#E6E8EE,0_2px_6px_rgba(17,19,24,.05)]">
                        Use <b className="font-semibold">+ New Client</b> at the top of the Clients list.
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex h-6 items-center rounded-md bg-white px-[9px] text-[11.5px] font-medium shadow-[inset_0_0_0_1px_#E6E8EE]">Show me</span>
                          <button type="button" onClick={() => go(3)} data-target="step" className="inline-flex h-6 cursor-pointer items-center rounded-md px-[9px] text-[11.5px] font-medium transition-[transform,background-color,color] duration-200"
                            style={{ background: stepHot ? ACCENT : '#fff', color: stepHot ? '#fff' : '#111318', boxShadow: `inset 0 0 0 1px ${stepHot ? ACCENT : '#E6E8EE'}`, transform: `scale(${step === 2 && el > 1400 && el < 1700 ? 0.94 : 1})` }}>
                            Step through
                          </button>
                          <span className="ml-auto font-mono text-[10.5px] text-[#80869A]">clients.create</span>
                        </div>
                      </div>
                    )}
                    {step >= 3 && (
                      <div className="rounded-[10px] bg-white p-3 shadow-[0_0_0_1px_#E6E8EE,0_4px_14px_rgba(17,19,24,.06)]">
                        <div className="flex items-center justify-between"><span className="text-[12.5px] font-semibold">Walkthrough</span><span className="text-[11px] tabular-nums text-[#80869A]">{stepsDone} of 3</span></div>
                        <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-[#EEF0F4]"><div className="h-full origin-left bg-[#2F5BF0] transition-transform duration-500 ease-out" style={{ transform: `scaleX(${stepsDone / 3})` }} /></div>
                        <div className="mt-[11px] flex flex-col gap-2">
                          {W_LABELS.map((label, i) => {
                            const done = i < stepsDone, active = i === step - 3 && step < 6
                            return (
                              <div key={label} className="flex items-center gap-2 text-[12.5px] transition-colors duration-300" style={{ fontWeight: active ? 500 : 400, color: done ? '#5B6170' : active ? '#111318' : '#80869A' }}>
                                <span className="inline-flex size-[18px] shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-[background-color,box-shadow] duration-300"
                                  style={{ background: done ? '#111318' : '#fff', color: done ? '#fff' : active ? ACCENT : '#80869A', boxShadow: done ? 'none' : active ? 'inset 0 0 0 1.5px #2F5BF0,0 0 0 3px rgba(47,91,240,.14)' : 'inset 0 0 0 1px #D5D9E2' }}>
                                  {done ? '✓' : i + 1}
                                </span>
                                {label}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    {step === 6 && (
                      <div className="flex items-start gap-2.5 rounded-[10px] bg-white px-3 py-[11px] shadow-[0_0_0_1px_#E6E8EE]">
                        <span className="inline-flex size-[26px] shrink-0 items-center justify-center rounded-[7px] bg-[#F4F6F9] text-[#5B6170]">
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden="true"><path d="M8 2 14 5 8 8 2 5Z" /><path d="M2 8l6 3 6-3M2 11l6 3 6-3" /></svg>
                        </span>
                        <span className="flex flex-col gap-0.5">
                          <span className="text-[13px] leading-snug"><b className="font-semibold">Done.</b> Next time you ask, I'll skip the walkthrough.</span>
                          <span className="font-mono text-[10.5px] text-[#80869A]">memory · completed ×1</span>
                        </span>
                      </div>
                    )}
                    {step >= 2 && (
                      <div className="mt-auto rounded-[10px] bg-white shadow-[0_0_0_1px_#E6E8EE]">
                        <button type="button" onClick={() => setEvOpen((o) => !o)} aria-expanded={evOpen} className="flex w-full cursor-pointer items-center justify-between px-[11px] py-2 text-[11.5px] font-semibold text-[#5B6170]">
                          Evidence<span className="font-normal text-[#80869A]">{evOpen ? '▾' : '▸'}</span>
                        </button>
                        {evOpen && EVIDENCE}
                      </div>
                    )}
                  </div>
                  <div className="px-3.5 pb-3.5 pt-2.5">
                    <div data-target="input" className="flex h-9 items-center gap-2 rounded-[10px] bg-white pl-3 pr-1 text-[13px] transition-shadow duration-200" style={{ boxShadow: `inset 0 0 0 1px ${typing ? 'rgba(47,91,240,.55)' : '#E6E8EE'}` }}>
                      <span className="min-w-0 flex-1 overflow-hidden whitespace-nowrap" style={{ color: typing && qChars ? '#111318' : '#A0A6B4' }}>
                        {typing && qChars ? Q.slice(0, qChars) : 'Ask about this app…'}
                        <span className="ml-px inline-block h-3.5 w-[1.5px] bg-[#2F5BF0] align-middle" style={{ opacity: on(typing) }} />
                      </span>
                      <span className="inline-flex size-7 items-center justify-center rounded-lg transition-colors duration-200" style={{ background: sendHot ? ACCENT : '#EEF0F4', color: sendHot ? '#fff' : '#B4B9C5' }}><SendIcon /></span>
                    </div>
                  </div>
                </div>
              </div>
              <span aria-hidden="true" className={`pointer-events-none absolute left-0 top-0 z-20 will-change-transform ${reduced ? 'transition-opacity' : 'transition-[transform,opacity] duration-[450ms] ease-[cubic-bezier(.3,.7,.2,1)]'}`} style={{ transform: `translate(${cur.x}px,${cur.y}px)`, opacity: cur.op }}>
                <CursorSvg />
              </span>
            </div>
            {/* Inspector */}
            <div className="border-t border-[#E6E8EE] bg-[#F4F6F9]">
              <div className="flex items-center gap-3 px-3.5 py-2">
                <span className="shrink-0 font-mono text-[10px] tracking-[0.1em] text-[#80869A]">INSPECTOR</span>
                <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[11px] text-[#1F8A5B]"><span className="size-1.5 rounded-full bg-[#22A06B]" />verified</span>
                <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-[#5B6170]">{inspector[0][1]}</span>
                <button type="button" onClick={() => setInspOpen((o) => !o)} aria-expanded={inspOpen} className="shrink-0 cursor-pointer px-1 py-0.5 text-[11.5px] text-[#5B6170] hover:text-[#111318]">{inspOpen ? 'Hide' : 'Details ▾'}</button>
              </div>
              {inspOpen && (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] border-t border-[#E6E8EE]">
                  {inspector.map(([k, v]) => (
                    <div key={k} className="min-w-0 px-3.5 py-2.5">
                      <p className="font-mono text-[10px] tracking-[0.1em] text-[#80869A]">{k}</p>
                      <p className="mt-1 truncate font-mono text-[11px] leading-normal text-[#111318]">{v}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </BrowserChrome>
        </div>
      </Rise>
      {/* Scrubber */}
      <div className="mt-4 flex items-center gap-3.5">
        <button type="button" onClick={togglePlay} aria-label={playingLabel ? 'Pause demo' : 'Play demo'}
          className="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-[10px] text-white shadow-[inset_0_0_0_1px_rgba(200,212,255,.25)] hover:bg-white/10">
          {playingLabel ? '❚❚' : '▶'}
        </button>
        <div className="flex min-w-0 flex-1 gap-2">
          {SEGMENTS.map(([label, a, b]) => {
            const total = STEPS.slice(a, b + 1).reduce((s, x) => s + x.d, 0)
            const into = step < a ? 0 : step > b ? total : STEPS.slice(a, step).reduce((s, x) => s + x.d, 0) + el
            const curSeg = step >= a && step <= b
            return (
              <button key={label} type="button" onClick={() => go(a)} className="min-w-0 flex-1 cursor-pointer pt-1.5 text-left">
                <span className="block h-0.5 overflow-hidden rounded-full bg-[rgba(200,212,255,.18)]">
                  <span className="block h-full origin-left transition-[transform,background-color] duration-100 ease-linear" style={{ transform: `scaleX(${into / total})`, background: curSeg ? '#5B7BFF' : 'rgba(255,255,255,.55)' }} />
                </span>
                <span className="mt-2 block truncate text-xs font-medium" style={{ color: curSeg ? '#fff' : 'rgba(200,212,255,.6)' }}>{label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ─── Sections ───────────────────────────────────────────────────────────── */

function PillCta({ href, children, light = false, external = false }: { href: string; children: ReactNode; light?: boolean; external?: boolean }) {
  const cls = `inline-flex h-14 items-center gap-3 rounded-full pl-6 pr-2 text-base font-semibold transition-colors ${light ? 'bg-white text-[#0A1233] hover:bg-[#E8EDFF]' : 'bg-[#2F5BF0] text-white hover:bg-[#2448D6]'}`
  const arrow = <span className={`inline-flex size-10 items-center justify-center rounded-full ${light ? 'bg-[#2F5BF0] text-white' : 'bg-white text-[#2F5BF0]'}`}>{external ? '→' : '↓'}</span>
  return external ? <Ext href={href} className={cls}>{children}{arrow}</Ext> : <a href={href} className={cls}>{children}{arrow}</a>
}

function HeroSection() {
  return (
    <section className="px-4 pt-1">
      <div className={`${NAVY} px-[clamp(16px,4vw,48px)] pb-[clamp(24px,4vw,48px)] pt-[clamp(40px,5vw,60px)]`}>
        {/* One wash, under the demo. The only glow on the page. */}
        <div aria-hidden="true" className="absolute left-1/2 top-[clamp(380px,40vw,470px)] -z-10 h-[760px] w-[min(1300px,120%)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(74,120,255,.5),rgba(74,120,255,.16)_55%,transparent)]" />
        <Stagger>
          <Rise className="mx-auto max-w-[820px] text-center">
            <p className="mb-[18px] font-mono text-[11.5px] tracking-[0.14em] text-[#9DB3FF]">STATEWAVE GUIDE · OPEN SOURCE</p>
            <Heading id="statewave-guide" level={1} className="font-heading text-[clamp(2.75rem,6vw,5.5rem)] font-medium leading-none tracking-[-0.045em] text-white">
              Your app<br /><span className={GRAD_TEXT}>explains itself.</span>
            </Heading>
            <p className="mx-auto mt-6 max-w-[620px] text-[19px] leading-[1.55] text-[rgba(222,229,255,.85)] text-balance">
              Ask where something is, and Guide points at the real control, backed by evidence from your source code.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <PillCta href="#quick-start" light>Run the demo locally</PillCta>
              <a href="#code-aware" className="text-[14.5px] font-medium text-white underline decoration-white/35 underline-offset-[5px] hover:decoration-white">Read how it works →</a>
            </div>
          </Rise>
          <HeroDemo />
        </Stagger>
      </div>
    </section>
  )
}

/**
 * Steps an illustration through `count` states while it is on screen. The
 * first click or hover hands control to the reader and the auto-advance stops
 * for good. The states crossfade rather than slide, so this runs under reduced
 * motion too; `auto` says whether it is still advancing on its own.
 */
function useCycle(count: number, ms: number) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.4 })
  const [i, setI] = useState(0)
  const [touched, setTouched] = useState(false)
  const auto = inView && !touched
  useEffect(() => {
    if (!auto) return
    const id = setInterval(() => setI((n) => (n + 1) % count), ms)
    return () => clearInterval(id)
  }, [auto, count, ms])
  const pick = (n: number) => { setTouched(true); setI(n) }
  return { ref, i, pick, auto }
}

/** Types `text` out once per `key` change. Instant under reduced motion. */
function useTyped(text: string, key: unknown, cps = 28) {
  const reduced = useReducedMotion() ?? false
  const [n, setN] = useState(0)
  useEffect(() => {
    if (reduced) return
    const id = setInterval(() => setN((c) => (c >= text.length ? c : c + 1)), 1000 / cps)
    return () => { clearInterval(id); setN(0) }
  }, [text, key, cps, reduced])
  return reduced ? text : text.slice(0, n)
}

/** Focus ring shared by the interactive illustration controls. */
const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F5BF0]'

const CLAIMS = [
  { claim: 'Create a client from the Clients page', q: 'How do I create a client?', a: 'Use + New Client on the Clients page.', ok: true },
  { claim: 'Export clients to CSV', q: 'Can I export clients to CSV?', a: "I don't know that yet.", ok: false },
]

function ClaimsCard() {
  const { ref, i, pick } = useCycle(2, 2800)
  const c = CLAIMS[i]
  return (
    <div ref={ref} className={`m-2.5 flex flex-1 flex-col gap-2.5 p-7 ${INNER}`}>
      <p className={`${MONO_LABEL} mb-1`}>CLAIMS</p>
      {CLAIMS.map((x, n) => (
        <button key={x.claim} type="button" aria-pressed={i === n} onClick={() => pick(n)} onMouseEnter={() => pick(n)}
          className={`flex cursor-pointer items-center justify-between gap-3 px-4 py-3.5 text-left transition-[box-shadow,opacity] duration-200 ${FOCUS} ${x.ok ? TILE : DASHED} ${i === n ? 'shadow-[0_0_0_2px_#2F5BF0]' : 'opacity-70 hover:opacity-100'}`}>
          <span className={`text-sm ${x.ok ? 'font-medium text-theme-primary' : 'text-theme-muted line-through'}`}>{x.claim}</span>
          {x.ok
            ? <span className="shrink-0 rounded-full bg-[#2F5BF0] px-2.5 py-1 font-mono text-[11px] font-medium text-white">evidence ✓</span>
            : <span className="shrink-0 rounded-full border border-[var(--viz-border)] px-2.5 py-1 font-mono text-[11px] text-theme-muted">no evidence</span>}
        </button>
      ))}
      <p className={`${MONO_LABEL} mb-1 mt-3.5`}>WHAT THE USER SEES</p>
      <div aria-live="polite" className="min-h-[104px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="flex flex-col gap-2">
            <span className="self-end rounded-[14px_14px_4px_14px] bg-theme-primary px-3.5 py-2 text-sm text-[var(--theme-surface-0)]">{c.q}</span>
            <span className={`self-start rounded-[14px_14px_14px_4px] px-3.5 py-2.5 text-sm ${c.ok ? 'bg-[#2F5BF0] text-white' : 'border border-[var(--viz-border)] bg-[var(--viz-card)] text-theme-secondary'}`}>{c.a}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

const MEMORY_TILES = [['WALKTHROUGH', 'completed ×1'], ['PREFERENCE', 'compact view'], ['USED OFTEN', 'Invoices']]

function MemoryCard() {
  const { ref, i, pick } = useCycle(2, 2600)
  const on = i === 1
  // Memory reorders what exists. It never adds the struck-out control.
  const order = on ? ['Invoices', 'Clients', '+ New Client'] : ['Clients', 'Invoices', '+ New Client']
  return (
    <div ref={ref} className={`m-2.5 flex flex-1 flex-col gap-5 p-7 ${INNER}`}>
      <button type="button" role="switch" aria-checked={on} onClick={() => pick(on ? 0 : 1)}
        className={`inline-flex cursor-pointer items-center gap-2.5 self-start rounded-full border border-[var(--viz-border)] bg-[var(--viz-card)] py-1 pl-1 pr-3 font-mono text-[11px] text-theme-secondary ${FOCUS}`}>
        <span className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${on ? 'bg-[#2F5BF0]' : 'bg-[var(--viz-track)]'}`}>
          <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-[left] duration-200 ${on ? 'left-[18px]' : 'left-0.5'}`} />
        </span>
        memory {on ? 'on' : 'off'}
      </button>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,170px),1fr))] content-start gap-5">
        <div className={`flex flex-col gap-2.5 transition-opacity duration-300 ${on ? '' : 'opacity-40'}`}>
          <p className={`${MONO_LABEL} mb-1`}>MEMORY</p>
          {MEMORY_TILES.map(([k, v]) => (
            <div key={k} className={`px-4 py-2.5 ${TILE}`}>
              <p className="font-mono text-[10px] tracking-[0.12em] text-theme-muted">{k}</p>
              <p className="mt-1 text-sm font-medium text-theme-primary">{v}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2.5">
          <p className={`${MONO_LABEL} mb-1`}>THE PRODUCT, TODAY</p>
          <LayoutGroup>
            {order.map((item) => {
              const up = on && item === 'Invoices'
              return (
                <motion.div layout key={item} transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  className={`flex items-center justify-between gap-2 rounded-[14px] border bg-[var(--viz-card)] px-4 py-3.5 text-sm font-medium text-theme-primary ${up ? 'border-[#2F5BF0]' : 'border-[var(--viz-border)]'}`}>
                  {item}
                  {up && <span className="shrink-0 rounded-full bg-[#2F5BF0] px-2.5 py-1 font-mono text-[11px] font-medium text-white">↑ moved up</span>}
                </motion.div>
              )
            })}
          </LayoutGroup>
          <div className={`px-4 py-3.5 text-sm text-theme-muted line-through ${DASHED}`}>+ Bulk import</div>
        </div>
      </div>
    </div>
  )
}

function TwoRulesSection() {
  return (
    <section className="px-5 py-[clamp(80px,11vw,140px)] sm:px-7">
      <Stagger className="mx-auto max-w-[1400px]">
        <Rise className="mx-auto max-w-[44rem] text-center">
          <p className={`${EYEBROW} text-[var(--viz-indigo)]`}>The two rules</p>
          <Heading id="the-two-rules" className={`${H2} text-theme-primary`}>Unknown is better than wrong.</Heading>
        </Rise>
        <div className="mt-16 grid grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] gap-5">
          <Rise className={`flex flex-col overflow-hidden ${CARD}`}>
            <ClaimsCard />
            <div className="px-8 pb-8 pt-5">
              <h3 className="mb-2.5 text-[1.7rem] font-medium tracking-[-0.02em] text-theme-primary">Unknown is better than wrong.</h3>
              <p className="text-[17px] leading-[1.65] text-theme-secondary text-pretty">A fact reaches the user only with source-level evidence behind it. No evidence, no sentence. The system refuses rather than guesses.</p>
            </div>
          </Rise>
          <Rise className={`flex flex-col overflow-hidden ${CARD}`}>
            <MemoryCard />
            <div className="px-8 pb-8 pt-5">
              <h3 className="mb-2.5 text-[1.7rem] font-medium tracking-[-0.02em] text-theme-primary">Memory remembers experience, not truth.</h3>
              <p className="text-[17px] leading-[1.65] text-theme-secondary text-pretty">What you did shapes how things are presented. It can never add a button, an answer, or a permission the product doesn't have right now.</p>
            </div>
          </Rise>
        </div>
      </Stagger>
    </section>
  )
}

/* The evidence chain is walkable: each node points at the file and line that
 * proves its outgoing edge, and the editor follows. All three files are
 * illustrative, and the panel says so. */
const K = ({ children }: { children: ReactNode }) => <span className="text-[#8FA6FF]">{children}</span>
const T = ({ children }: { children: ReactNode }) => <span className="text-[#7FD4FF]">{children}</span>
const Str = ({ children }: { children: ReactNode }) => <span className="text-[#B8C6FF]">{children}</span>

const FILES: Record<string, ReactNode[]> = {
  'Clients.tsx': [
    <><K>export function</K> ClientsPage() {'{'}</>,
    <>  <K>const</K> {'{ openCreateClient }'} = useClients();</>,
    <>  <K>return</K> (</>,
    <>    &lt;<T>Page</T> title=<Str>"Clients"</Str>&gt;</>,
    <>      &lt;<T>Button</T> onClick={'{openCreateClient}'}&gt;</>,
    <>        + New Client</>,
    <>      &lt;/<T>Button</T>&gt;</>,
    <>    &lt;/<T>Page</T>&gt;</>,
  ],
  'NewClientDialog.tsx': [
    <><K>export function</K> NewClientDialog() {'{'}</>,
    <>  <K>const</K> submitClient = (v: NewClient) =&gt;</>,
    <>    clientService.create(v);</>,
    <>  <K>return</K> &lt;<T>Form</T> onSubmit={'{submitClient}'}&gt;…&lt;/<T>Form</T>&gt;;</>,
    <>{'}'}</>,
  ],
  'api.ts': [
    <><K>export const</K> clientService = {'{'}</>,
    <>  create(input: NewClient) {'{'}</>,
    <>    <K>return</K> http.post(<Str>'/api/clients'</Str>, input);</>,
    <>  {'}'},</>,
    <>{'}'};</>,
  ],
}

/** Chain nodes in order; `edge` is the relationship to the next node, shown
 *  as the badge on the proving line. */
const CHAIN: { node: string; file: string; line: number; edge: string; side: 'FRONTEND' | 'BACKEND'; tone?: 'accent' | 'white' }[] = [
  { node: 'clients.create', file: 'Clients.tsx', line: 5, edge: 'invokes', side: 'FRONTEND', tone: 'accent' },
  { node: 'openCreateClient()', file: 'Clients.tsx', line: 2, edge: 'opens', side: 'FRONTEND' },
  { node: 'NewClientDialog', file: 'NewClientDialog.tsx', line: 1, edge: 'invokes', side: 'FRONTEND' },
  { node: 'submitClient()', file: 'NewClientDialog.tsx', line: 3, edge: 'invokes', side: 'FRONTEND' },
  { node: 'clientService.create()', file: 'api.ts', line: 3, edge: 'calls_api', side: 'BACKEND' },
  { node: 'POST /api/clients', file: 'api.ts', line: 3, edge: 'endpoint', side: 'BACKEND', tone: 'white' },
]

function EvidenceEditor() {
  const { ref, i, pick } = useCycle(CHAIN.length, 1700)
  const cur = CHAIN[i]
  const lines = FILES[cur.file]
  const chip = (n: number) => {
    const c = CHAIN[n], active = n === i, passed = n < i
    const tone = c.tone === 'white' ? 'bg-white font-semibold text-[#0A1233]' : c.tone === 'accent' ? 'bg-[#2F5BF0] text-white' : 'bg-white/[.08] text-[#E3E9FF]'
    return (
      <button key={c.node} type="button" aria-pressed={active} onClick={() => pick(n)} onMouseEnter={() => pick(n)}
        className={`cursor-pointer rounded-lg px-2.5 py-[5px] transition-[box-shadow,opacity] duration-200 ${FOCUS} ${tone} ${active ? 'shadow-[0_0_0_2px_#9DB3FF]' : passed ? '' : 'opacity-55 hover:opacity-100'}`}>
        {c.node}
      </button>
    )
  }
  const edge = (n: number) => (
    <span key={`e${n}`} className={`transition-colors duration-200 ${n < i ? 'text-[#9DB3FF]' : 'text-[rgba(200,212,255,.45)]'}`}>{CHAIN[n].edge} →</span>
  )
  return (
    <div ref={ref} className="overflow-hidden rounded-[22px] border border-[rgba(160,180,255,.18)] bg-[#07103F] shadow-[0_40px_100px_rgba(0,0,20,.5)]">
      <div className="flex h-12 items-center gap-4 border-b border-[rgba(160,180,255,.14)] bg-[#060C36] px-4">
        <div className="hidden gap-1.5 sm:flex">{[0, 1, 2].map((n) => <span key={n} className="size-2.5 rounded-full bg-[rgba(200,212,255,.22)]" />)}</div>
        <div className="flex min-w-0 gap-1 overflow-x-auto font-mono text-[13px]">
          {Object.keys(FILES).map((f) => (
            <button key={f} type="button" onClick={() => pick(CHAIN.findIndex((c) => c.file === f))}
              className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 transition-colors ${FOCUS} ${f === cur.file ? 'bg-white/[.07] text-white' : 'text-[rgba(200,212,255,.6)] hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-[276px] overflow-x-auto py-5 font-mono text-[15px] leading-[1.9] text-[#C9D4FF]">
        {lines.map((line, n) => n + 1 === cur.line ? (
          <div key={`${cur.file}${n}`} className="flex items-center justify-between gap-3 whitespace-pre bg-[rgba(74,120,255,.35)] px-5 text-white shadow-[inset_3px_0_0_#6E8CFF]">
            <span className="flex"><span className="w-7 shrink-0">{n + 1}</span><span>{line}</span></span>
            <span className="shrink-0 rounded-md bg-white px-2 py-px text-[11px] font-semibold text-[#0A1233]">{cur.edge}</span>
          </div>
        ) : (
          <div key={`${cur.file}${n}`} className="flex whitespace-pre px-5"><span className="w-7 shrink-0 text-[rgba(200,212,255,.35)]">{n + 1}</span><span>{line}</span></div>
        ))}
      </div>
      <div className="flex flex-col gap-3.5 border-t border-[rgba(160,180,255,.14)] bg-[#060C36] p-5">
        <div className="flex justify-between gap-3 font-mono text-[11px] font-semibold tracking-[0.14em] text-[rgba(200,212,255,.7)]">
          <span>EVIDENCE CHAIN</span><span className="font-normal tracking-[0.04em]">{cur.file}:{cur.line}</span>
        </div>
        {(['FRONTEND', 'BACKEND'] as const).map((side) => (
          <div key={side} className="flex flex-wrap items-center gap-2 font-mono text-[13px]">
            <span className="w-full text-[10px] tracking-[0.12em] text-[rgba(200,212,255,.55)] sm:w-[76px]">{side}</span>
            {side === 'BACKEND' && edge(3)}
            {CHAIN.flatMap((c, n) => c.side !== side ? [] : n < CHAIN.length - 1 && CHAIN[n + 1].side === side ? [chip(n), edge(n)] : [chip(n)])}
          </div>
        ))}
        <p className="mt-0.5 text-[13px] leading-normal text-[rgba(200,212,255,.6)]">Illustrative example; pick a node to see the line that proves it. Symbols and edge labels are not taken from a real index.</p>
      </div>
    </div>
  )
}

function CodeAwareSection() {
  return (
    <section className="px-4">
      <div className={NAVY}>
        <Stagger className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-center gap-[clamp(40px,5vw,72px)] px-[clamp(24px,5vw,72px)] py-[clamp(48px,7vw,96px)]">
          <Rise>
            <p className={`${EYEBROW} text-[#9DB3FF]`}>How it's different</p>
            <Heading id="code-aware" className="scroll-mt-32 font-heading text-[clamp(2.25rem,3.9vw,3.5rem)] font-medium leading-[1.04] tracking-[-0.035em] text-balance text-white">The DOM is scenery. The source graph is <span className="text-[#9DB3FF]">the product.</span></Heading>
            <p className="mt-6 max-w-[36rem] text-[18px] leading-[1.65] text-[rgba(222,229,255,.82)] text-pretty">
              A product tour knows a button exists at a position. Guide's indexer reconstructs what pressing it does, with file-and-line evidence for every edge, by statically analyzing your React + Node source with ts-morph. If a relationship can't be proven from code, it's omitted rather than guessed.
            </p>
            <ul className="mt-8 flex flex-col border-t border-[rgba(160,180,255,.16)]">
              {[
                'Deterministic: two runs over unchanged source produce byte-identical output. The graph is byte-identical; the answers built on top of it are not.',
                'Frontend and backend join on the API endpoint identity, not name-matching.',
                'Typed relationship kinds (invokes, opens, calls_api, requires_permission, …), each carrying file + line + symbol evidence.',
              ].map((t, n) => (
                <li key={n} className="flex gap-4 border-b border-[rgba(160,180,255,.16)] py-[18px] text-base leading-[1.6] text-[rgba(222,229,255,.85)]">
                  <span className="shrink-0 pt-[3px] font-mono text-xs text-[#9DB3FF]">0{n + 1}</span>{t}
                </li>
              ))}
            </ul>
          </Rise>
          <Rise><EvidenceEditor /></Rise>
        </Stagger>
      </div>
    </section>
  )
}

/* Source: docs/provider-reality-check-round-2.md, "Yield" and "defect" tables. */
const ROUNDS: [string, string, string][] = [
  ['Factual claims proposed', '382', '120'],
  ['Factual claims verified', '77 (20%)', '114 (95%)'],
  ['Wrong-feature claims accepted', '2', '0'],
  ['Restraint on refusal-band candidates', '0/30', '30/30'],
  ['Workflow targets recovered', '7/39 (18%)', '27/39 (69%)'],
  ['Stability of generated answers across repeated runs', '0.68', '0.86'],
]

function VerifierSection() {
  const reduced = useReducedMotion() ?? false
  const stat = (label: string, n: string, pct: number, caption: string, hot = false) => (
    <div className={`rounded-3xl p-7 ${hot ? 'bg-[#2F5BF0] text-white' : 'border border-[var(--viz-border)] bg-[var(--viz-card)]'}`}>
      <p className={`font-mono text-[11px] font-semibold tracking-[0.14em] ${hot ? 'text-white/85' : 'text-theme-muted'}`}>{label}</p>
      <p className={`mt-3 text-[clamp(3.5rem,7vw,5.5rem)] font-medium leading-none tracking-[-0.05em] ${hot ? '' : 'text-theme-primary'}`}>{n}</p>
      <div className={`mt-6 h-1.5 rounded-full ${hot ? 'bg-white/20' : 'bg-[var(--viz-track)]'}`}>
        {/* The bar grows in; the number above it is printed, never derived from it. */}
        <motion.div className={`h-full origin-left rounded-full ${hot ? 'bg-white' : 'bg-theme-muted'}`}
          initial={reduced ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 0.61, 0.36, 1] }} style={{ width: `${pct}%` }} />
      </div>
      <p className={`mt-3.5 text-sm ${hot ? 'text-white/90' : 'text-theme-secondary'}`}>{caption}</p>
    </div>
  )
  return (
    <section className="px-5 py-[clamp(80px,11vw,140px)] sm:px-7">
      <Stagger className="mx-auto max-w-[1400px]">
        <Rise className="max-w-[48rem]">
          <p className={`${EYEBROW} text-[var(--viz-indigo)]`}>Safety</p>
          <Heading id="verified-not-guessed" className={`${H2} text-theme-primary`}>A model chooses what to say. It can't choose what's true.</Heading>
          <p className="mt-6 text-[18px] leading-[1.65] text-theme-secondary text-pretty">
            The application graph enumerates the claims that are provably true before a model sees anything. The model only selects from that menu and phrases it, or declines. A verifier then re-checks the selected claim before it reaches the Product Model.
          </p>
        </Rise>
        {/* Bars are proposals on one scale (382 = 100%), so the three read as a funnel. */}
        <Rise className="mt-14 grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-5">
          {stat('FREE-FORM', '382', 100, 'proposed · 20% verified')}
          {stat('CLAIM MENU', '120', 31, 'offered from the claim menu')}
          {stat('95% VERIFIED', '114', 30, 'verified · reaches the Product Model', true)}
        </Rise>
        <Rise className="mt-5 overflow-x-auto rounded-3xl border border-[var(--viz-border)] bg-[var(--viz-card)]">
          <table className="w-full min-w-[480px] border-collapse text-[15px]">
            <thead>
              <tr className="font-mono text-[11px] tracking-[0.14em]">
                <th scope="col" className="border-b border-[var(--viz-border)] px-7 py-[18px] text-left font-semibold text-theme-muted">MEASURE</th>
                <th scope="col" className="border-b border-[var(--viz-border)] px-7 py-[18px] text-right font-semibold text-theme-muted">FREE-FORM</th>
                <th scope="col" className="border-b border-[var(--viz-border)] px-7 py-[18px] text-right font-semibold text-[var(--viz-indigo)]">CLAIM MENU</th>
              </tr>
            </thead>
            <tbody>
              {ROUNDS.map(([m, a, b]) => (
                <tr key={m}>
                  <td className="border-b border-[var(--viz-border)] px-7 py-4 text-theme-primary">{m}</td>
                  <td className="border-b border-[var(--viz-border)] px-7 py-4 text-right font-mono text-sm text-theme-muted">{a}</td>
                  <td className="border-b border-[var(--viz-border)] px-7 py-4 text-right font-mono text-sm font-semibold text-[var(--viz-indigo)]">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Rise>
        <p className="mt-5 max-w-[48rem] text-sm leading-[1.7] text-theme-muted">
          Measured against one model (claude-opus-5) on one synthetic fixture, and an independent LLM-based usefulness review still scored the output below its own bar. Harness and method:{' '}
          <Ext href={`${REPO}/tree/main/benchmarks/provider-reality-check`} className="text-[var(--viz-indigo)] underline underline-offset-4">benchmarks/provider-reality-check</Ext>.
        </p>
      </Stagger>
    </section>
  )
}

/* One mockup, three runtime signals. Each mode spotlights a different thing
 * the guide borrows from the live screen; the README's own example quote
 * ('Search clients') is the visible-language one. */
const RUNTIME_MODES = [
  {
    q: 'how do I create a client?',
    a: <>Use <b className="font-semibold">+ New Client</b> at the top of this list.</>,
    tag: 'clients.create',
    ev: ['src/pages/Clients.tsx:12', 'POST /api/clients'],
    status: 'verified',
  },
  {
    q: 'how do I find a client?',
    a: <>Use the field showing <b className="font-semibold">'Search clients'</b>.</>,
    tag: 'visible now',
    ev: ["painted text · 'Search clients'", 'quoted while visible'],
    status: 'observed now',
  },
  {
    q: "what's this one?",
    a: <>That's the row you selected: <b className="font-semibold">Harbor &amp; Pine</b>.</>,
    tag: 'runtime instance',
    ev: ['row 3 · this screen', 'contextual · never persisted'],
    status: 'observed now',
  },
]

function RuntimeStill({ mode }: { mode: number }) {
  const m = RUNTIME_MODES[mode]
  const on = (n: number) => mode === n && typed
  const lit = (n: number) => ({ opacity: on(n) ? 1 : 0, transform: `translateY(${on(n) ? 0 : 6}px)` })
  const ring = (n: number) => ({ opacity: on(n) ? 1 : 0, transform: `scale(${on(n) ? 1 : 1.12})` })
  const rows = ROWS.slice(0, 4).map((r) => (r.i === 'HP' && mode === 2 ? { ...r, bg: '#F3F6FF', sel: true } : r))
  const q = useTyped(m.q, mode)
  const typed = q.length === m.q.length
  const reduced = useReducedMotion() ?? false

  // One cursor that travels to whatever the current mode spotlights.
  const stage = useRef<HTMLDivElement>(null)
  const [cur, setCur] = useState<{ x: number; y: number } | null>(null)
  useLayoutEffect(() => {
    const measure = () => {
      const s = stage.current, t = s?.querySelector(`[data-rt="${mode}"]`)
      if (!s || !t) return
      const a = s.getBoundingClientRect(), r = t.getBoundingClientRect()
      setCur({ x: Math.round(r.left - a.left + r.width * (mode === 2 ? 0.3 : 0.7)), y: Math.round(r.top - a.top + r.height * 0.6) })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [mode])

  return (
    <BrowserChrome>
      <div ref={stage} className="relative grid min-h-[470px] grid-cols-1 min-[700px]:grid-cols-[minmax(0,1fr)_minmax(250px,290px)] min-[1400px]:grid-cols-[auto_minmax(0,1fr)_minmax(250px,290px)]">
        <MockSidebar />
        <div className="relative flex min-w-0 flex-col px-5 py-[18px]">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11.5px] text-[#80869A]">Workspace / Clients</p>
              <p className="mt-0.5 flex items-center gap-2 text-base font-semibold">Clients<span className="inline-flex h-[18px] items-center rounded-full bg-[#EEF0F4] px-1.5 text-[11px] font-medium text-[#5B6170]">48</span></p>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative inline-flex">
                <span className={RING} style={ring(1)} />
                <span data-rt="1" className="inline-flex h-[30px] w-[124px] items-center gap-2 rounded-lg bg-white px-2.5 text-xs text-[#A0A6B4] shadow-[inset_0_0_0_1px_#E6E8EE] sm:w-[150px]">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3 3" strokeLinecap="round" /></svg>Search clients
                </span>
                <span className={`${TIP} left-0 top-[calc(100%+12px)]`} style={lit(1)}>
                  <Tip label="visible now" count="quoted" text="Use the field showing 'Search clients'." pos="left-5 -top-1" />
                </span>
              </span>
              <span className="relative inline-flex">
                <span className={RING} style={ring(0)} />
                <span data-rt="0" className={`${BTN} bg-[#2F5BF0] font-medium text-white`}>+ New Client</span>
                <span className={`${TIP} right-0 top-[calc(100%+12px)]`} style={lit(0)}>
                  <Tip label="clients.create" count="1 of 3" text="This creates a new client." pos="right-[22px] -top-1" />
                </span>
              </span>
            </div>
          </div>
          <div className="@container relative mt-[60px] flex flex-1 flex-col overflow-hidden rounded-[10px] bg-white shadow-[0_0_0_1px_#E6E8EE]">
            <div className={`${ROW_GRID} whitespace-nowrap border-b border-[#E6E8EE] px-3.5 py-[9px] text-[10.5px] font-medium uppercase tracking-[0.06em] text-[#80869A]`}>
              <span>Company</span><span className={`${COL_DEAL} text-right`}>Deal</span><span className={`${COL_WHEN} truncate`}>Last activity</span><span>Status</span>
            </div>
            {rows.map((r) => <ClientRow key={r.i} r={r} />)}
            <div className="mt-auto px-3.5 py-[9px] text-[11.5px] text-[#80869A]">Showing 4 of 48</div>
            <div className="pointer-events-none absolute inset-0 bg-[rgba(250,251,252,.62)] transition-opacity duration-300" style={{ opacity: mode === 2 ? 0 : 1 }} />
          </div>
        </div>
        <div className="flex min-w-0 flex-col border-l border-[#E6E8EE] bg-[#F4F6F9]">
          <GuideHeader />
          <div className="flex flex-1 flex-col gap-2.5 p-3.5" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={mode} initial={{ opacity: 0, y: reduced ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="flex flex-1 flex-col gap-2.5">
                <span className="max-w-[88%] self-end rounded-2xl bg-[#111318] px-[13px] py-[7px] text-[13px] text-white">
                  {q}{!typed && <span className="ml-px inline-block h-3 w-[1.5px] animate-pulse bg-white align-middle" />}
                </span>
                <motion.div initial={false} animate={{ opacity: typed ? 1 : 0, y: typed || reduced ? 0 : 6 }} transition={{ duration: 0.3 }} className="flex flex-1 flex-col gap-2.5">
                <div className="max-w-[96%] rounded-[10px] bg-white px-3 py-[11px] text-[13px] leading-normal shadow-[0_0_0_1px_#E6E8EE]">
                  {m.a}
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <span className="inline-flex h-6 items-center rounded-md bg-white px-[9px] text-[11.5px] font-medium shadow-[inset_0_0_0_1px_#E6E8EE]">Show me</span>
                    <span className="ml-auto font-mono text-[10.5px] text-[#80869A]">{m.tag}</span>
                  </div>
                </div>
                <div className="mt-auto rounded-[10px] bg-white shadow-[0_0_0_1px_#E6E8EE]">
                  <div className="flex items-center justify-between px-[11px] py-2 text-[11.5px] font-semibold text-[#5B6170]">Evidence<span className="font-normal text-[#80869A]">▾</span></div>
                  <div className="flex flex-col gap-1 px-[11px] pb-2.5 font-mono text-[10.5px] text-[#5B6170]">
                    {m.ev.map((e) => <span key={e} className="truncate">{e}</span>)}
                    <span className="flex items-center gap-1.5 text-[#1F8A5B]"><span className="size-1.5 rounded-full bg-[#22A06B]" />{m.status}</span>
                  </div>
                </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="px-3.5 pb-3.5 pt-2.5">
            <div className="flex h-9 items-center gap-2 rounded-[10px] bg-white pl-3 pr-1 text-[13px] shadow-[inset_0_0_0_1px_#E6E8EE]">
              <span className="flex-1 text-[#A0A6B4]">Ask about this app…</span>
              <span className="inline-flex size-7 items-center justify-center rounded-lg bg-[#EEF0F4] text-[#B4B9C5]"><SendIcon /></span>
            </div>
          </div>
        </div>
        {cur && (
          <span aria-hidden="true" className={`pointer-events-none absolute left-0 top-0 z-20 will-change-transform ${reduced ? '' : 'transition-transform duration-700 ease-[cubic-bezier(.3,.7,.2,1)]'}`} style={{ transform: `translate(${cur.x}px,${cur.y}px)` }}>
            <CursorSvg />
          </span>
        )}
      </div>
    </BrowserChrome>
  )
}

const RUNTIME_POINTS: [string, string, ReactNode][] = [
  ['Runtime context', 'What exists on this screen right now.', <><rect x="2.5" y="3.5" width="15" height="13" rx="2.5" /><path d="M2.5 7.5h15" /></>],
  ['Visible language', 'Quoted only while those words are actually painted.', <path d="M4 5h12M4 10h8M4 15h10" strokeLinecap="round" />],
  ['Runtime instances', "Contextual identity, like 'the row you selected'. Never persisted.", <><rect x="2.5" y="7" width="15" height="6" rx="2" /><path d="M5 4h10M5 16h10" strokeLinecap="round" strokeDasharray="2 2.5" /></>],
]

function RuntimeSection() {
  const { ref, i, pick, auto } = useCycle(RUNTIME_POINTS.length, 4200)
  return (
    <section className="px-4">
      <Stagger className={`${NAVY} px-[clamp(20px,5vw,72px)] py-[clamp(56px,8vw,112px)]`}>
        <Rise className="mx-auto max-w-[44rem] text-center">
          <p className={`${EYEBROW} text-[#9DB3FF]`}>At runtime</p>
          <Heading id="runtime-context" className={`${H2} text-white`}>What's on screen right now, borrowed, never kept.</Heading>
        </Rise>
        <div ref={ref}>
          <Rise className="mx-auto mt-14 max-w-[1200px]">
            <div role="img" aria-label={`Runtime mockup: ${RUNTIME_POINTS[i][0]}. ${RUNTIME_POINTS[i][1]}`}><RuntimeStill mode={i} /></div>
          </Rise>
          <div className="mx-auto mt-10 grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-3">
            {RUNTIME_POINTS.map(([t, d, icon], n) => (
              <Rise key={t}>
                <button type="button" aria-pressed={i === n} onClick={() => pick(n)} onMouseEnter={() => pick(n)}
                  className={`h-full w-full cursor-pointer rounded-2xl border p-5 text-left transition-colors duration-200 ${FOCUS} ${i === n ? 'border-[rgba(160,180,255,.4)] bg-white/[.07]' : 'border-transparent hover:bg-white/[.04]'}`}>
                  <span className={`inline-flex size-11 items-center justify-center rounded-xl border border-[rgba(160,180,255,.3)] transition-colors duration-200 ${i === n ? 'bg-[#2F5BF0]' : 'bg-[rgba(74,120,255,.35)]'}`}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.5" aria-hidden="true">{icon}</svg>
                  </span>
                  <span className="mt-[18px] block text-xl font-medium text-white">{t}</span>
                  <span className="mt-2 block text-base leading-[1.6] text-[rgba(222,229,255,.78)]">{d}</span>
                  {/* Time to the next signal while it is advancing on its own. */}
                  <span aria-hidden="true" className="mt-4 block h-0.5 overflow-hidden rounded-full bg-white/10">
                    {i === n && (auto
                      ? <motion.span key={`${i}-auto`} className="block h-full origin-left bg-[#9DB3FF]" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 4.2, ease: 'linear' }} />
                      : <span className="block h-full w-full bg-[#9DB3FF]" />)}
                  </span>
                </button>
              </Rise>
            ))}
          </div>
        </div>
      </Stagger>
    </section>
  )
}

/* The memory figure plays once on entry: writes land, collapse into the
 * durable episodes, then the one read path lights up. The numbers are the
 * README's measured figures and never animate; only the marks do. */
const MF_TICKS: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.018 } } }
const MF_TICK: Variants = { hidden: { opacity: 0.08 }, show: { opacity: 0.4, transition: { duration: 0.2 } } }
const MF_EPS: Variants = { hidden: {}, show: { transition: { delayChildren: 1, staggerChildren: 0.12 } } }
const MF_EP: Variants = { hidden: { opacity: 0, scaleX: 0.2 }, show: { opacity: 1, scaleX: 1, transition: { duration: 0.35, ease: [0.22, 0.61, 0.36, 1] } } }
const MF_PATH: Variants = { hidden: {}, show: { transition: { delayChildren: 1.8, staggerChildren: 0.22 } } }
const MF_HOP: Variants = { hidden: { opacity: 0.25 }, show: { opacity: 1, transition: { duration: 0.3 } } }

function MemoryFigure() {
  const reduced = useReducedMotion() ?? false
  const [run, setRun] = useState(0)
  const big = 'text-[40px] font-medium tracking-[-0.04em]'
  const v = (x: Variants) => (reduced ? STILL : x)
  return (
    <motion.div key={run} initial={reduced ? false : 'hidden'} whileInView="show" viewport={{ once: true, amount: 0.4 }} className="flex flex-col gap-2">
      <div className={`p-6 ${INNER}`}>
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[11px] text-theme-muted">01</span><span className={`${big} text-theme-primary`}>504</span><span className="text-[15px] text-theme-secondary">writes</span>
          <button type="button" onClick={() => setRun((r) => r + 1)} className={`ml-auto cursor-pointer rounded-full border border-[var(--viz-border)] px-2.5 py-0.5 font-mono text-[11px] text-theme-muted transition-colors hover:text-theme-primary ${FOCUS}`}>
            ↻ replay
          </button>
        </div>
        <motion.div variants={v(MF_TICKS)} aria-hidden="true" className="mt-3.5 grid grid-cols-[repeat(24,1fr)] gap-1">
          {Array.from({ length: 48 }, (_, n) => <motion.span key={n} variants={v(MF_TICK)} className="h-2.5 rounded-[2px] bg-theme-muted opacity-40" />)}
        </motion.div>
        <div className="mt-4 flex flex-wrap gap-1.5 font-mono text-xs">
          <span className="rounded-full border border-[var(--viz-border)] bg-[var(--viz-card)] px-2.5 py-1 text-theme-primary">counters</span>
          <span className="rounded-full border border-[var(--viz-border)] bg-[var(--viz-card)] px-2.5 py-1 text-theme-primary">choices</span>
          <span className="rounded-full border border-dashed border-[var(--viz-border-strong)] px-2.5 py-1 text-theme-muted line-through">free text</span>
        </div>
      </div>
      <div className={`p-6 ${INNER}`}>
        <div className="flex items-baseline gap-3"><span className="font-mono text-[11px] text-theme-muted">02</span><span className={`${big} text-theme-primary`}>5</span><span className="text-[15px] text-theme-secondary">durable episodes</span></div>
        <motion.div variants={v(MF_EPS)} aria-hidden="true" className="mt-3.5 grid grid-cols-5 gap-1.5">
          {[0, 1, 2, 3, 4].map((n) => <motion.span key={n} variants={v(MF_EP)} className="h-[26px] origin-left rounded-lg bg-[#2F5BF0]" />)}
        </motion.div>
        <p className="mt-3 text-sm text-theme-secondary">Repeats collapse into one record.</p>
      </div>
      <div className="rounded-[20px] bg-[#0A1233] p-6 text-white">
        <div className="flex items-baseline gap-3"><span className="font-mono text-[11px] text-[#9DB3FF]">03</span><span className={big}>2</span><span className="text-[15px] text-[rgba(222,229,255,.82)]">events read</span></div>
        <motion.div variants={v(MF_PATH)} className="mt-3.5 flex flex-wrap items-center gap-2 font-mono text-[13px]">
          <motion.span variants={v(MF_HOP)} className="rounded-lg bg-white/10 px-2.5 py-[5px]">page</motion.span>
          <motion.span variants={v(MF_HOP)} className="text-[#9DB3FF]">→</motion.span>
          <motion.span variants={v(MF_HOP)} className="rounded-lg bg-white/10 px-2.5 py-[5px]">your backend</motion.span>
          <motion.span variants={v(MF_HOP)} className="text-[#9DB3FF]">→</motion.span>
          <motion.span variants={v(MF_HOP)} className="rounded-lg bg-[#2F5BF0] px-2.5 py-[5px]">Statewave</motion.span>
        </motion.div>
      </div>
    </motion.div>
  )
}

function MemorySection() {
  return (
    <section className="px-5 py-[clamp(80px,11vw,140px)] sm:px-7">
      <Stagger className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-center gap-[clamp(40px,6vw,80px)]">
          <Rise>
            <p className={`${EYEBROW} text-[var(--viz-indigo)]`}>Memory</p>
            <Heading id="memory" className={`${H2} text-theme-primary`}>Remembers the person. Never rewrites the product.</Heading>
            <p className="mt-6 max-w-[34rem] text-[18px] leading-[1.65] text-theme-secondary text-pretty">
              Guide's memory is a closed vocabulary of six event kinds: counters and choices, never text. A walkthrough finished a thousand times is one durable record. A preference changed four times is one active value.
            </p>
          </Rise>
          {/* Measured against a real Statewave server (README, "Memory"). */}
          <Rise className={`p-2.5 ${CARD}`}><MemoryFigure /></Rise>
        </div>
        <p className="mt-14 max-w-[48rem] text-[15px] leading-[1.7] text-theme-muted">
          The optional durable-memory adapter,{' '}
          <code className="rounded-md bg-[var(--viz-fill)] px-1.5 py-0.5 font-mono text-[13px] text-theme-primary">@statewavedev/guide-statewave</code>, is server-side only; the credential never reaches the browser: page → your backend →{' '}
          <Link to="/product" className="text-[var(--viz-indigo)] underline underline-offset-4">Statewave</Link>.
        </p>
      </Stagger>
    </section>
  )
}

/* README "Architecture" table, verbatim meanings. Version from packages/indexer/package.json. */
const PACKAGES: [string, string][] = [
  ['@statewavedev/guide-indexer', 'Source → evidence-backed application graph (build-time CLI)'],
  ['@statewavedev/guide-semantic', 'Graph → verified Product Model + guidance (build-time CLI)'],
  ['@statewavedev/guide-core', 'The query engine, contracts, memory model; framework-free'],
  ['@statewavedev/guide-runtime', 'Runtime evidence: DOM, visibility, behaviour, redaction'],
  ['@statewavedev/guide-react', 'The panel, hooks, element registry, theming'],
  ['@statewavedev/guide-statewave', 'The durable memory adapter (server-side, holds the SDK)'],
  ['@statewavedev/guide-actions', 'The semantic action vocabulary and risk policy'],
  ['@statewavedev/guide-shared', 'Shared types'],
]

function ArchitectureSection() {
  // Hovering (or focusing) a layer lights its packages in the table, and a
  // package row lights the layer it lives in.
  const [hot, setHot] = useState<string[]>([])
  const is = (pkgs: string[]) => pkgs.some((p) => hot.includes(p))
  const hover = (pkgs: string[]) => ({
    onMouseEnter: () => setHot(pkgs), onMouseLeave: () => setHot([]),
    onFocus: () => setHot(pkgs), onBlur: () => setHot([]),
    tabIndex: pkgs.length ? 0 : undefined,
  })
  const layer = (name: string, right: ReactNode, cls: string, pkgs: string[] = []) => (
    <div {...hover(pkgs)} className={`flex flex-1 items-center justify-between gap-3 rounded-[14px] px-4 py-3.5 text-sm transition-shadow duration-200 ${FOCUS} ${cls} ${is(pkgs) ? 'shadow-[0_0_0_2px_#2F5BF0]' : ''}`}>
      <span className="font-medium text-theme-primary">{name}</span>{right}
    </div>
  )
  const pkg = (s: string) => <span className="font-mono text-[12.5px] text-[var(--viz-indigo)]">{s}</span>
  const runtime = ['guide-core', 'guide-runtime', 'guide-actions']
  return (
    <section className="px-5 pb-[clamp(80px,11vw,140px)] sm:px-7">
      <Stagger className="mx-auto max-w-[1400px] border-t border-[var(--viz-border)] pt-[clamp(64px,8vw,100px)]">
        <Rise className="max-w-[48rem]">
          <p className={`${EYEBROW} text-[var(--viz-indigo)]`}>Architecture</p>
          <Heading id="architecture" className={`${H2} text-theme-primary`}>Eight packages. A strict boundary between each.</Heading>
          <p className="mt-6 text-[18px] leading-[1.65] text-theme-secondary">Point at a layer to see which package owns it, or at a package to see where it sits.</p>
        </Rise>
        <div className="mt-14 grid grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] items-stretch gap-5">
          <Rise className={`flex flex-col p-7 ${CARD}`}>
            <div aria-label="Layer stack from source to DOM" className="flex flex-1 flex-col">
              <p className={`${MONO_LABEL} mb-5 flex justify-between`}><span>LAYER STACK</span><span>source → DOM</span></p>
              <div className="grid flex-1 grid-cols-[minmax(0,1fr)_40px] gap-2">
                <div className="flex flex-col gap-2">
                  {layer('Source', <span className="text-theme-muted">your React + Node repo</span>, 'border border-dashed border-[var(--viz-border-strong)]')}
                  {layer('Graph', pkg('guide-indexer'), 'bg-[var(--viz-card-2)]', ['guide-indexer'])}
                  {layer('Product Model', pkg('guide-semantic'), 'bg-[var(--viz-card-2)]', ['guide-semantic'])}
                  <div className="flex flex-[1.6] flex-col justify-center rounded-[14px] bg-[#2F5BF0] px-4 py-3.5 text-sm text-white">
                    <div {...hover(runtime)} className={`-m-1 flex flex-wrap justify-between gap-3 rounded-lg p-1 transition-shadow duration-200 ${FOCUS} ${is(runtime) ? 'shadow-[0_0_0_2px_#fff]' : ''}`}>
                      <span className="font-medium">Runtime</span>
                      <span className="flex flex-wrap gap-1.5 font-mono text-xs">{runtime.map((p) => <span key={p} className={`rounded-md px-2 py-0.5 transition-colors ${hot.includes(p) ? 'bg-white text-[#2F5BF0]' : 'bg-white/15'}`}>{p}</span>)}</span>
                    </div>
                    <div {...hover(['guide-statewave'])} className={`mt-2.5 flex justify-between gap-3 rounded-b-lg border-t border-dashed border-white/35 pt-2.5 font-mono text-xs transition-shadow duration-200 ${FOCUS} ${is(['guide-statewave']) ? 'shadow-[0_0_0_2px_#fff]' : ''}`}>
                      <span>guide-statewave</span><span className="opacity-85">server-side only</span>
                    </div>
                  </div>
                  {layer('React Bindings', pkg('guide-react'), 'bg-[var(--viz-card-2)]', ['guide-react'])}
                  {layer('DOM', <span className="text-theme-muted">your running app</span>, 'border border-dashed border-[var(--viz-border-strong)]')}
                </div>
                <div {...hover(['guide-shared'])} className={`flex items-center justify-center rounded-[14px] bg-[var(--viz-fill)] transition-shadow duration-200 ${FOCUS} ${is(['guide-shared']) ? 'shadow-[0_0_0_2px_#2F5BF0]' : ''}`}>
                  <span className="rotate-180 whitespace-nowrap font-mono text-[11.5px] text-[var(--viz-indigo)] [writing-mode:vertical-rl]">guide-shared · types &amp; schemas</span>
                </div>
              </div>
            </div>
          </Rise>
          <Rise className={`flex flex-col justify-between overflow-hidden ${CARD}`}>
            <div className={`grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-4 border-b border-[var(--viz-border)] px-7 py-[18px] ${MONO_LABEL}`}><span>WORKSPACE PACKAGE · 0.0.1</span><span>WHAT IT IS</span></div>
            {PACKAGES.map(([n, d]) => {
              const short = n.replace('@statewavedev/', '')
              return (
                <div key={n} {...hover([short])} className={`grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-4 border-b border-[var(--viz-border)] px-7 py-3.5 transition-colors duration-200 ${FOCUS} ${hot.includes(short) ? 'bg-[var(--viz-fill)]' : ''}`}>
                  <p className={`font-mono text-[12.5px] [overflow-wrap:anywhere] ${hot.includes(short) ? 'text-[var(--viz-indigo)]' : 'text-theme-primary'}`}>{n}</p>
                  <p className="text-sm leading-normal text-theme-secondary">{d}</p>
                </div>
              )
            })}
            <p className="px-7 py-[18px] text-sm text-theme-muted">These are workspace packages inside the repository, not published modules. None is on npm yet; the install path is cloning the repo.</p>
          </Rise>
        </div>
      </Stagger>
    </section>
  )
}

/* README "Quick start", with the clone URL filled in. */
const QUICK_START: [string, string][] = [
  ['git clone https://github.com/smaramwbc/statewave-guide', ''],
  ['cd statewave-guide', ''],
  ['pnpm install', '# Node >= 20, pnpm 9+'],
  ['pnpm build', ''],
  ['pnpm test', '# 1500+ unit tests'],
  ['pnpm demo', '# the interactive demo host (a small CRM), local memory'],
]
const QUICK_START_TEXT = QUICK_START.map(([c]) => c).join('\n')

const DEMO_CARDS: [ReactNode, string][] = [
  [
    <div className={`flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-theme-primary ${TILE}`}><span className="size-2 rounded-full bg-[#2F5BF0]" />demo-crm · Guide panel mounted</div>,
    'The demo is a fixture CRM with the guide panel mounted.',
  ],
  [
    <>
      <span className="self-end rounded-[12px_12px_4px_12px] bg-theme-primary px-3 py-2 text-[13px] text-[var(--theme-surface-0)]">how do I create a client?</span>
      <span className="inline-flex items-center gap-2.5 self-start">
        <span className="rounded-lg bg-[#2F5BF0] px-[11px] py-1.5 text-[12.5px] font-semibold text-white">Show me</span>
        <span className="rounded-[9px] border-2 border-[#2F5BF0] px-2.5 py-[5px] text-[12.5px] font-semibold text-theme-primary">+ New Client</span>
      </span>
    </>,
    "Ask it 'how do I create a client?', press Show me and it points at the real control.",
  ],
  [
    <>
      <span className="self-end rounded-[12px_12px_4px_12px] bg-theme-primary px-3 py-2 text-[13px] text-[var(--theme-surface-0)]">can I export clients to CSV?</span>
      <span className={`inline-flex flex-wrap items-center gap-2 self-start rounded-[12px_12px_12px_4px] px-3 py-2 text-[13px] text-theme-secondary ${TILE}`}>
        I don't know that yet.<span className="whitespace-nowrap rounded-full border border-[var(--viz-border)] px-2 py-0.5 font-mono text-[10px] text-theme-muted">no evidence</span>
      </span>
    </>,
    'Ask it something the product can\'t do, and watch it refuse instead of improvise.',
  ],
]

function QuickStartSection() {
  return (
    <section className="px-5 pb-[clamp(80px,11vw,140px)] sm:px-7">
      <Stagger className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-center gap-[clamp(40px,6vw,72px)]">
          <Rise>
            <p className={`${EYEBROW} text-[var(--viz-indigo)]`}>Quick start</p>
            <Heading id="quick-start" className={`${H2} scroll-mt-32 text-theme-primary`}>Ten minutes. No AI keys. No Statewave account.</Heading>
            <ul className="mt-8 flex flex-wrap gap-2">
              {['Node >= 20', 'pnpm 9+', 'no AI keys', 'no Statewave server'].map((t) => (
                <li key={t} className="inline-flex items-center gap-2 rounded-full border border-[var(--viz-border)] bg-[var(--viz-card)] px-3.5 py-2 text-sm text-theme-primary">
                  <span className="text-[var(--viz-indigo)]">✓</span>{t}
                </li>
              ))}
            </ul>
            <div className="mt-8"><PillCta href={REPO} external>View on GitHub</PillCta></div>
          </Rise>
          <Rise className="overflow-hidden rounded-[22px] bg-[#0A1233] shadow-[0_30px_80px_rgba(10,18,51,.28)]">
            <div className="flex h-[46px] items-center justify-between border-b border-[rgba(160,180,255,.14)] px-4">
              <div className="flex items-center gap-3.5">
                <div className="flex gap-1.5">{[0, 1, 2].map((i) => <span key={i} className="size-2.5 rounded-full bg-[rgba(200,212,255,.22)]" />)}</div>
                <span className="font-mono text-xs text-[rgba(200,212,255,.7)]">Bash</span>
              </div>
              <CodeCopyButton code={QUICK_START_TEXT} label="Copy the quick start commands" />
            </div>
            <div className="overflow-x-auto px-[22px] pb-[26px] pt-[22px] font-mono text-[13px] leading-loose text-[#E3E9FF]">
              {QUICK_START.map(([c, note], i) => (
                <div key={c} className="whitespace-pre">
                  <span className="text-[rgba(200,212,255,.35)]">{i + 1}</span>  <span className="text-[#8FA6FF]">$</span> {c}
                  {note && <span className="text-[rgba(200,212,255,.5)]">{' '.repeat(Math.max(1, 22 - c.length))}{note}</span>}
                </div>
              ))}
            </div>
          </Rise>
        </div>
        <Rise><p className={`${MONO_LABEL} mb-5 mt-[72px]`}>WHAT THE DEMO DOES</p></Rise>
        <Rise className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-5">
          {DEMO_CARDS.map(([art, text], i) => (
            <div key={i} className={`flex flex-col overflow-hidden rounded-3xl border border-[var(--viz-border)] bg-[var(--viz-card)] ${LIFT}`}>
              <div className="m-2 flex min-h-[120px] flex-col justify-center gap-2 rounded-[18px] bg-[var(--viz-card-2)] p-[22px]">{art}</div>
              <div className="flex gap-3.5 px-6 pb-6 pt-3.5">
                <span className="shrink-0 pt-0.5 font-mono text-xs text-[var(--viz-indigo)]">0{i + 1}</span>
                <p className="text-[15px] leading-[1.6] text-theme-secondary text-pretty">{text}</p>
              </div>
            </div>
          ))}
        </Rise>
      </Stagger>
    </section>
  )
}

/* The design's stacked-layer outline behind the CTA, paths copied from the source SVG. */
const CTA_LAYERS: [string, number][] = [
  ['M1120 214.8Q1142.4 202 1164.8 214.8L1296 288.40000000000003Q1318.4 301.2 1296 314L1164.8 387.6Q1142.4 400.40000000000003 1120 387.6L988.8 314Q966.4 301.2 988.8 288.40000000000003Z', 0.3],
  ['M1120 179.60000000000002Q1142.4 166.8 1164.8 179.60000000000002L1296 253.20000000000002Q1318.4 266 1296 278.8L1164.8 352.40000000000003Q1142.4 365.20000000000005 1120 352.40000000000003L988.8 278.8Q966.4 266 988.8 253.20000000000002Z', 0.3],
  ['M1120 144.4Q1142.4 131.6 1164.8 144.4L1296 218Q1318.4 230.8 1296 243.6L1164.8 317.20000000000005Q1142.4 330 1120 317.20000000000005L988.8 243.6Q966.4 230.8 988.8 218Z', 0.3],
  ['M1120 109.19999999999999Q1142.4 96.39999999999998 1164.8 109.19999999999999L1296 182.79999999999998Q1318.4 195.6 1296 208.39999999999998L1164.8 282Q1142.4 294.8 1120 282L988.8 208.39999999999998Q966.4 195.6 988.8 182.79999999999998Z', 0.3],
  ['M1120 74Q1142.4 61.19999999999999 1164.8 74L1296 147.6Q1318.4 160.4 1296 173.2L1164.8 246.8Q1142.4 259.6 1120 246.8L988.8 173.2Q966.4 160.4 988.8 147.6Z', 0.3],
  ['M1320 68Q1334 60 1348 68L1430 114Q1444 122 1430 130L1348 176Q1334 184 1320 176L1238 130Q1224 122 1238 114Z', 0.18],
  ['M1320 46Q1334 38 1348 46L1430 92Q1444 100 1430 108L1348 154Q1334 162 1320 154L1238 108Q1224 100 1238 92Z', 0.18],
  ['M1320 24Q1334 16 1348 24L1430 70Q1444 78 1430 86L1348 132Q1334 140 1320 132L1238 86Q1224 78 1238 70Z', 0.18],
  ['M1320 2Q1334 -6 1348 2L1430 48Q1444 56 1430 64L1348 110Q1334 118 1320 110L1238 64Q1224 56 1238 48Z', 0.18],
  ['M1320 -20Q1334 -28 1348 -20L1430 26Q1444 34 1430 42L1348 88Q1334 96 1320 88L1238 42Q1224 34 1238 26Z', 0.18],
]

function CtaSection() {
  return (
    <section className="px-4 pb-16 pt-12">
      <div className={`${NAVY} flex min-h-[480px] items-center`}>
        <div aria-hidden="true" className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_75%_140%_at_85%_50%,rgba(74,120,255,.62)_0%,rgba(74,120,255,.46)_14%,rgba(74,120,255,.3)_28%,rgba(74,120,255,.17)_42%,rgba(74,120,255,.08)_57%,rgba(74,120,255,.03)_72%,rgba(74,120,255,0)_100%)]" />
        <svg aria-hidden="true" viewBox="0 0 1400 420" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 -z-10 size-full">
          {CTA_LAYERS.map(([d, o]) => <path key={d} d={d} fill="none" stroke={`rgba(150,170,255,${o})`} strokeWidth="1.2" />)}
        </svg>
        <Stagger className="relative max-w-[52rem] px-[clamp(24px,5vw,72px)] py-[clamp(48px,7vw,96px)]">
          <Rise>
            <p className={`${EYEBROW} text-[#9DB3FF]`}>Build it into your app</p>
            <Heading id="build-it" className="font-heading text-[clamp(2.75rem,6.4vw,6rem)] font-medium leading-none tracking-[-0.04em] text-white text-balance">
              Let your app <span className={GRAD_TEXT}>explain itself.</span>
            </Heading>
            <div className="mt-9 flex flex-wrap gap-3">
              <PillCta href={REPO} light external>View on GitHub</PillCta>
              <Link to="/product" className="inline-flex h-14 items-center rounded-full border border-[rgba(200,212,255,.3)] px-6 text-base font-medium text-white transition-colors hover:bg-white/10">
                Explore Statewave's memory runtime
              </Link>
            </div>
          </Rise>
        </Stagger>
      </div>
    </section>
  )
}

export function GuidePage() {
  // Breadcrumb + FAQPage JSON-LD come from usePageSEO via PAGE_FAQS.
  usePageSEO()
  return (
    <div className="bg-surface-0 pt-20">
      <HeroSection />
      <TwoRulesSection />
      <CodeAwareSection />
      <VerifierSection />
      <RuntimeSection />
      <MemorySection />
      <ArchitectureSection />
      <QuickStartSection />
      <PageFaq route="/guide" />
      <CtaSection />
    </div>
  )
}
