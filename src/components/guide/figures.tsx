import { AnimatePresence, LayoutGroup, motion, useReducedMotion, type Variants } from 'framer-motion'
import { useState, type ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'
import { useCopy } from '../home/hooks'
import { CARD, DASHED, FOCUS, INNER, LIFT, MONO_LABEL, STILL, TILE, useCycle } from './shared'

/* The /guide page's illustrations, ported from #333: the two rules, the evidence chain, the verifier
 * funnel, the memory figure, the architecture stack and the quick start. */

const CLAIMS = [
  { claim: 'Create a client from the Clients page', q: 'How do I create a client?', a: 'Use + New Client on the Clients page.', ok: true },
  { claim: 'Export clients to CSV', q: 'Can I export clients to CSV?', a: "I don't know that yet.", ok: false },
]

export function ClaimsCard() {
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

export function MemoryCard() {
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

export function EvidenceEditor() {
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

/* Source: docs/provider-reality-check-round-2.md, "Yield" and "defect" tables. */
const ROUNDS: [string, string, string][] = [
  ['Factual claims proposed', '382', '120'],
  ['Factual claims verified', '77 (20%)', '114 (95%)'],
  ['Wrong-feature claims accepted', '2', '0'],
  ['Restraint on refusal-band candidates', '0/30', '30/30'],
  ['Workflow targets recovered', '7/39 (18%)', '27/39 (69%)'],
  ['Stability of generated answers across repeated runs', '0.68', '0.86'],
]

/* The memory figure plays once on entry: writes land, collapse into the
 * durable episodes, then the one read path lights up. The numbers are the
 * README's measured figures and never animate; only the marks do. */
const MF_TICKS: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.018 } } }
const MF_TICK: Variants = { hidden: { opacity: 0.08 }, show: { opacity: 0.4, transition: { duration: 0.2 } } }
const MF_EPS: Variants = { hidden: {}, show: { transition: { delayChildren: 1, staggerChildren: 0.12 } } }
const MF_EP: Variants = { hidden: { opacity: 0, scaleX: 0.2 }, show: { opacity: 1, scaleX: 1, transition: { duration: 0.35, ease: [0.22, 0.61, 0.36, 1] } } }
const MF_PATH: Variants = { hidden: {}, show: { transition: { delayChildren: 1.8, staggerChildren: 0.22 } } }
const MF_HOP: Variants = { hidden: { opacity: 0.25 }, show: { opacity: 1, transition: { duration: 0.3 } } }

export function MemoryFigure() {
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

/* ─── Verifier: the funnel and the round-on-round table ─── */

/** Bars share one scale (382 = 100%), so the three read as a funnel. The numbers are printed, never
 *  derived from the bars. */
function Stat({ label, n, pct, caption, hot = false }: { label: string; n: string; pct: number; caption: string; hot?: boolean }) {
  const reduced = useReducedMotion() ?? false
  return (
    <div className={`rounded-[16px] p-7 ${hot ? 'bg-[#2F5BF0] text-white' : 'border border-[var(--viz-border)] bg-[var(--viz-card)]'}`}>
      <p className={`font-mono text-[11px] font-semibold tracking-[0.14em] ${hot ? 'text-white/85' : 'text-theme-muted'}`}>{label}</p>
      <p className={`gd-num mt-3 ${hot ? '' : 'text-theme-primary'}`}>{n}</p>
      <div className={`mt-6 h-1.5 rounded-full ${hot ? 'bg-white/20' : 'bg-[var(--viz-track)]'}`}>
        <motion.div className={`h-full origin-left rounded-full ${hot ? 'bg-white' : 'bg-theme-muted'}`}
          initial={reduced ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 0.61, 0.36, 1] }} style={{ width: `${pct}%` }} />
      </div>
      <p className={`mt-3.5 text-sm ${hot ? 'text-white/90' : 'text-theme-secondary'}`}>{caption}</p>
    </div>
  )
}

export function VerifierFigures() {
  return (
    <>
      <div className="gd-rise mt-14 grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-5">
        <Stat label="FREE-FORM" n="382" pct={100} caption="proposed · 20% verified" />
        <Stat label="CLAIM MENU" n="120" pct={31} caption="offered from the claim menu" />
        <Stat label="95% VERIFIED" n="114" pct={30} caption="verified · reaches the Product Model" hot />
      </div>
      <div className="gd-rise mt-5 overflow-x-auto rounded-[16px] border border-[var(--viz-border)] bg-[var(--viz-card)]">
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
      </div>
    </>
  )
}

/* ─── Architecture: the layer stack beside the package table ─── */

export function ArchitectureFigure() {
  // Hovering (or focusing) a layer lights its packages in the table, and a package row lights the layer
  // it lives in.
  const [hot, setHot] = useState<string[]>([])
  const is = (pkgs: string[]) => pkgs.some((p) => hot.includes(p))
  const hover = (pkgs: string[]) => ({
    onMouseEnter: () => setHot(pkgs), onMouseLeave: () => setHot([]),
    onFocus: () => setHot(pkgs), onBlur: () => setHot([]),
    tabIndex: pkgs.length ? 0 : undefined,
  })
  const layer = (name: string, right: ReactNode, cls: string, pkgs: string[] = []) => (
    <div {...hover(pkgs)} className={`flex flex-1 items-center justify-between gap-3 rounded-[12px] px-4 py-3.5 text-sm transition-shadow duration-200 ${FOCUS} ${cls} ${is(pkgs) ? 'shadow-[0_0_0_2px_#2F5BF0]' : ''}`}>
      <span className="font-medium text-theme-primary">{name}</span>{right}
    </div>
  )
  const pkg = (s: string) => <span className="font-mono text-[12.5px] text-[var(--viz-indigo)]">{s}</span>
  const runtime = ['guide-core', 'guide-runtime', 'guide-actions']
  return (
    <div className="mt-14 grid grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] items-stretch gap-5">
      <div className={`gd-rise flex flex-col p-7 ${CARD}`}>
        <div aria-label="Layer stack from source to DOM" className="flex flex-1 flex-col">
          <p className={`${MONO_LABEL} mb-5 flex justify-between`}><span>LAYER STACK</span><span>source → DOM</span></p>
          <div className="grid flex-1 grid-cols-[minmax(0,1fr)_40px] gap-2">
            <div className="flex flex-col gap-2">
              {layer('Source', <span className="text-theme-muted">your React + Node repo</span>, 'border border-dashed border-[var(--viz-border-strong)]')}
              {layer('Graph', pkg('guide-indexer'), 'bg-[var(--viz-card-2)]', ['guide-indexer'])}
              {layer('Product Model', pkg('guide-semantic'), 'bg-[var(--viz-card-2)]', ['guide-semantic'])}
              <div className="flex flex-[1.6] flex-col justify-center rounded-[12px] bg-[#2F5BF0] px-4 py-3.5 text-sm text-white">
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
            <div {...hover(['guide-shared'])} className={`flex items-center justify-center rounded-[12px] bg-[var(--viz-fill)] transition-shadow duration-200 ${FOCUS} ${is(['guide-shared']) ? 'shadow-[0_0_0_2px_#2F5BF0]' : ''}`}>
              <span className="rotate-180 whitespace-nowrap font-mono text-[11.5px] text-[var(--viz-indigo)] [writing-mode:vertical-rl]">guide-shared · types &amp; schemas</span>
            </div>
          </div>
        </div>
      </div>
      <div className={`gd-rise flex flex-col justify-between overflow-hidden ${CARD}`}>
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
      </div>
    </div>
  )
}

/* ─── Quick start ─── */

export function QuickStartTerminal() {
  const [done, copy] = useCopy(QUICK_START_TEXT)
  return (
    <div className="gd-term">
      <div className="gd-term__bar">
        <i /><i /><i />
        <span>Terminal</span>
        <button type="button" className="gd-term__copy" onClick={copy} aria-label="Copy the quick start commands">
          {done ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
          <span aria-live="polite">{done ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="gd-term__body">
        {QUICK_START.map(([c, note], i) => (
          <div key={c}>
            <span className="gd-term__n">{i + 1}</span>  <span className="gd-term__p">$</span> {c}
            {note && <span className="gd-term__note">{' '.repeat(Math.max(1, 22 - c.length))}{note}</span>}
          </div>
        ))}
      </pre>
    </div>
  )
}

export function DemoCards() {
  return (
    <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-5">
      {DEMO_CARDS.map(([art, text], i) => (
        <div key={i} className={`gd-rise flex flex-col overflow-hidden rounded-[16px] border border-[var(--viz-border)] bg-[var(--viz-card)] ${LIFT}`}>
          <div className="m-2 flex min-h-[120px] flex-col justify-center gap-2 rounded-[10px] bg-[var(--viz-card-2)] p-[22px]">{art}</div>
          <div className="flex gap-3.5 px-6 pb-6 pt-3.5">
            <span className="shrink-0 pt-0.5 font-mono text-xs text-[var(--viz-indigo)]">0{i + 1}</span>
            <p className="text-[15px] leading-[1.6] text-theme-secondary text-pretty">{text}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
