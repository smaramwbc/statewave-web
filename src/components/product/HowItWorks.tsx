import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Cpu, Database, EyeOff, FileCode, History, Layers, RotateCcw, ShieldCheck } from 'lucide-react'
import { usePrefersReducedMotion } from '../home/hooks'
import { Brand, Head, Pill, Seg, Tile } from './ui'

const DWELL = 7000
const IMG = '/images/product/v8'

function Record() {
  const rows = [
    { logo: 'slack', text: '“We moved our renewal to the 14th.”', date: '2 Sep' },
    { logo: 'zendesk', text: 'Duplicate charge on INV-2291 refunded', date: '9 Sep' },
    { logo: 'gmail', text: 'Please send invoices to billing@', date: '14 Aug' },
    { logo: 'github', text: 'Billing webhook retry fixed', date: '30 Sep', fresh: true },
  ] as const
  return (
    <div className="pd-rec">
      <div className="pd-rec__srcs" aria-hidden="true">
        {rows.map((r) => <span key={r.logo} className="pd-rec__src"><Brand name={r.logo} size={26} /></span>)}
      </div>
      <img src={`${IMG}/how-connectors.svg`} alt="" className="pd-rec__wires" width={103} height={284} />
      <div className="pd-card pd-rec__card">
        <div className="pd-row">
          <Tile size={28}><History size={14} /></Tile>
          <b>account:northwind</b>
          <Pill tone="ok">● Recording</Pill>
        </div>
        {rows.map((r) => (
          <div key={r.logo} className={`pd-rec__ep${'fresh' in r ? ' is-new' : ''}`}>
            <Tile tone="card"><Brand name={r.logo} size={16} /></Tile>
            <div><b>{r.text}</b><span>{r.date}</span></div>
            {'fresh' in r && <Pill tone="accent">New</Pill>}
          </div>
        ))}
      </div>
    </div>
  )
}

const COMPILERS = [
  { id: 'heuristic', text: 'Heuristic (default)' },
  { id: 'llm', text: 'LLM compiler' },
] as const

function Compile() {
  const [c, setC] = useState<'heuristic' | 'llm'>('heuristic')
  const llm = c === 'llm'
  return (
    <>
      <div className="pd-cmp">
        <div className="pd-card pd-cmp__card">
          <span className="pd-cmp__k"><Brand name="slack" size={14} />Slack episode</span>
          <b>“We moved our renewal to the 14th.”</b>
        </div>
        <div className="pd-cmp__mid">
          <span className="pd-cmp__chip"><Cpu size={14} />Compiler</span>
          <span aria-hidden="true" className="pd-accent">→</span>
        </div>
        <div className="pd-card pd-cmp__card pd-cmp__card--out">
          <span className="pd-cmp__k pd-accent"><Layers size={14} />Profile fact · 0.94</span>
          <b>Plan renews on the 14th</b>
          <Pill tone="warn">Supersedes “the 1st”</Pill>
        </div>
      </div>
      <div className="pd-card pd-panel">
        <div className="pd-row">
          <Seg label="Compiler" options={COMPILERS} value={c} onChange={setC} />
          <Pill tone={llm ? 'warn' : 'ok'}>{llm ? 'Your key' : 'Local'}</Pill>
        </div>
        <dl className="pd-kv">
          <div><dt>Runs</dt><dd>{llm ? 'Your provider, through LiteLLM' : 'Fully offline, on your Statewave host'}</dd></div>
          <div><dt>Leaves your network</dt><dd className={llm ? 'pd-warn' : 'pd-ok'}>{llm ? 'Episode batches go to that provider' : 'Nothing'}</dd></div>
        </dl>
      </div>
    </>
  )
}

/** Bar widths are each item's share of the 464px track in the design, i.e. tokens spent. */
const BUDGETS = {
  500: { used: '500 / 500 tokens', left: 'Summary · 14.7', parts: [36, 64] },
  1000: { used: '910 / 1,000 tokens', left: 'Episode · 11.1', parts: [18, 32, 41] },
  2000: { used: '1,284 / 2,000 tokens', left: 'Onboarding notes · 5.3', parts: [9, 16, 20, 18] },
} as const
const KINDS = ['Fact', 'Procedure', 'Summary', 'Episode'] as const
const BUDGET_OPTS = [{ id: '500', text: '500' }, { id: '1000', text: '1,000' }, { id: '2000', text: '2,000' }] as const

function TokenBudget() {
  const [b, setB] = useState<'500' | '1000' | '2000'>('2000')
  const cfg = BUDGETS[b]
  return (
    <div className="pd-card pd-panel">
      <div className="pd-row">
        <b>Token budget</b>
        <Seg label="Token budget" options={BUDGET_OPTS} value={b} onChange={setB} />
      </div>
      <div className="pd-track" role="img" aria-label={`${cfg.used}: ${KINDS.slice(0, cfg.parts.length).join(', ')}`}>
        {cfg.parts.map((w, i) => (
          <span key={KINDS[i]} className={`pd-track__seg pd-k${i}`} style={{ width: `${w}%` }}>{w > 12 ? KINDS[i] : ''}</span>
        ))}
      </div>
      <div className="pd-row">
        <b className="pd-medium">{cfg.used}</b>
        <span className="pd-chip-muted">Didn’t fit: {cfg.left}</span>
      </div>
    </div>
  )
}

function Retrieve() {
  const parts = [['Kind', 10, '10'], ['Recency', 5, '5'], ['Relevance', 3.4, '3.4'], ['Validity', 3, '+3']] as const
  return (
    <>
      <div className="pd-card pd-panel">
        <div className="pd-row">
          <Tile><Layers size={15} /></Tile>
          <b className="pd-medium pd-grow">Plan renews on the 14th</b>
          <span className="pd-score">21.4</span>
        </div>
        <div className="pd-scorebar" aria-hidden="true">
          {parts.map(([k, v], i) => <i key={k} className={`pd-k${i}`} style={{ flexGrow: v }} />)}
        </div>
        <ul className="pd-legend">
          {parts.map(([k, , t], i) => <li key={k}><i className={`pd-k${i}`} />{k} {t}</li>)}
        </ul>
      </div>
      <TokenBudget />
    </>
  )
}

function Govern() {
  const rows = [
    [<Database size={15} />, 'Subject', 'account:northwind'],
    [<Layers size={15} />, 'Selected', '2 memories · 2 episodes'],
    [<FileCode size={15} />, 'Policy', 'support-standard'],
    [<EyeOff size={15} />, 'Redacted', 'Billing email (pii)'],
  ] as const
  return (
    <div className="pd-gov">
      <div className="pd-card pd-gov__card">
        <div className="pd-gov__head">
          <Tile tone="ok" size={34}><ShieldCheck size={17} /></Tile>
          <div><b>Receipt signed</b><code>01J9ZK4T7M3QX8R2V6N0B5HCWD</code></div>
        </div>
        {rows.map(([icon, k, v]) => (
          <div key={k} className="pd-gov__row"><span className="pd-muted">{icon}</span><span className="pd-muted">{k}</span><b>{v}</b></div>
        ))}
      </div>
      <div className="pd-gov__acts">
        <span className="pd-gov__replay"><RotateCcw size={14} />Replay bundle</span>
        <span className="pd-gov__ok">✓ Hash matches</span>
      </div>
    </div>
  )
}

const STEPS: { t: string; title: string; body: string; ep: string; chips: string[]; bg: string; visual: ReactNode }[] = [
  {
    t: 'Record', title: 'Record every event, untouched', ep: 'POST /v1/episodes',
    body: 'Chats, tickets, tool calls and decisions land as immutable, content-hashed episodes under a subject. Nothing is ever overwritten.',
    chips: ['Immutable', 'Content-hashed', 'One timeline per subject'], bg: 'how-record.png', visual: <Record />,
  },
  {
    t: 'Compile', title: 'Compile locally, or with your own model', ep: 'POST /v1/memories/compile',
    body: 'A compiler turns episodes into typed memories with confidence, a validity window and a link back to the source. Newer facts supersede older ones.',
    chips: ['Typed facts', 'Confidence scored', 'Validity windows'], bg: 'how-compile.png', visual: <Compile />,
  },
  {
    t: 'Retrieve', title: 'Rank and pack to your token budget', ep: 'POST /v1/context',
    body: 'Each candidate gets a readable score from kind, recency, relevance and validity, then goes into the budget whole, highest score first.',
    chips: ['Ranked by kind', 'Recency, relevance', 'Token-bounded'], bg: 'how-retrieve.png', visual: <Retrieve />,
  },
  {
    t: 'Govern', title: 'Sign exactly what the agent was given', ep: 'emit_receipt: true',
    body: 'Any context call can return a signed, replayable receipt. Labels and policies decide what each caller sees.',
    chips: ['Signed receipt', 'Replayable', 'Policy aware'], bg: 'stage.png', visual: <Govern />,
  },
]

/** Steps advance on their own while the section is on screen; any click hands control to the reader. */
export function HowItWorks() {
  const [step, setStep] = useState(0)
  const [auto, setAuto] = useState(true)
  const [onscreen, setOnscreen] = useState(false)
  const rm = usePrefersReducedMotion()
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setOnscreen(e.isIntersecting), { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const running = auto && onscreen && !rm
  useEffect(() => {
    if (!running) return
    const t = setTimeout(() => setStep((s) => (s + 1) % STEPS.length), DWELL)
    return () => clearTimeout(t)
  }, [running, step])

  const s = STEPS[step]
  return (
    <section ref={ref} id="how-it-works" className="pd-sec pd-sec--card" aria-label="How it works">
      <div className="sw-wrap">
        <Head title="Four steps from event to answer" lede="One deterministic loop, from the raw event to the signed bundle your agent receives." />
        <div className="pd-walk">
          <div className="pd-steps" role="group" aria-label="Steps">
            {STEPS.map((x, i) => (
              <button key={x.t} type="button" aria-pressed={i === step} onClick={() => { setStep(i); setAuto(false) }}>
                <span className="pd-steps__n">0{i + 1}</span>{x.t}
                {i === step && <i key={step} aria-hidden="true" data-run={running || undefined} style={{ animationDuration: `${DWELL}ms` }} />}
              </button>
            ))}
          </div>
          {/* every step's copy ships in the server HTML; only the active one is shown */}
          {STEPS.map((x, i) => (
            <div key={x.t} className="pd-walk__copy" hidden={i !== step}>
              <h3>{x.title}</h3>
              <p>{x.body}</p>
              <code className="pd-ep">{x.ep}</code>
              <ul className="pd-chips">{x.chips.map((c) => <li key={c}>{c}</li>)}</ul>
            </div>
          ))}
          <div className="pd-visual" style={{ ['--bg' as string]: `url(${IMG}/${s.bg})` }}>
            <div key={step} className="pd-visual__in">{s.visual}</div>
          </div>
        </div>
      </div>
    </section>
  )
}
