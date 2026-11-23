import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { memo, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { ACCENT, FOCUS, useCycle, useTyped } from './shared'

/* The /guide page's two app mockups: the hero walkthrough (a recorded run of Guide inside a small CRM)
 * and the runtime still. Ported from #333. Both are screenshots of a light app, so they keep their own
 * fixed colours. */

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

export function HeroDemo() {
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
      <div>
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
      </div>
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

/** The runtime still with its three signals beneath it. It steps through them on its own while it is on
 *  screen, until the reader picks one. */
export function RuntimeShowcase() {
  const { ref, i, pick, auto } = useCycle(RUNTIME_POINTS.length, 4200)
  return (
    <div ref={ref}>
      <div role="img" aria-label={`Runtime mockup: ${RUNTIME_POINTS[i][0]}. ${RUNTIME_POINTS[i][1]}`}><RuntimeStill mode={i} /></div>
      <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-3">
        {RUNTIME_POINTS.map(([t, d, icon], n) => (
          <button key={t} type="button" aria-pressed={i === n} onClick={() => pick(n)} onMouseEnter={() => pick(n)}
            className={`h-full w-full cursor-pointer rounded-2xl border p-5 text-left transition-colors duration-200 ${FOCUS} ${i === n ? 'border-[rgba(160,180,255,.4)] bg-white/[.07]' : 'border-transparent hover:bg-white/[.04]'}`}>
            <span className={`inline-flex size-11 items-center justify-center rounded-xl border border-[rgba(160,180,255,.3)] transition-colors duration-200 ${i === n ? 'bg-[#2F5BF0]' : 'bg-[rgba(74,120,255,.35)]'}`}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="1.5" aria-hidden="true">{icon}</svg>
            </span>
            <span className="gd-point__t">{t}</span>
            <span className="mt-2 block text-base leading-[1.6] text-[#c9d0e2]">{d}</span>
            {/* Time to the next signal while it is advancing on its own. */}
            <span aria-hidden="true" className="mt-4 block h-0.5 overflow-hidden rounded-full bg-white/10">
              {i === n && (auto
                ? <motion.span key={`${i}-auto`} className="block h-full origin-left bg-[#8fb8ff]" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 4.2, ease: 'linear' }} />
                : <span className="block h-full w-full bg-[#8fb8ff]" />)}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
