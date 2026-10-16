import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Eyebrow, H2 } from './ui'
import { logo } from './links'
import './home-b.css'

const STEPS = [
  { n: '01', t: 'Record', ep: 'POST /v1/episodes', d: 'Every event lands as an immutable, append-only episode.' },
  { n: '02', t: 'Compile', ep: 'POST /v1/memories/compile', d: 'Episodes become typed memories with confidence and a validity window.' },
  { n: '03', t: 'Retrieve', ep: 'POST /v1/context', d: 'A ranked bundle that fits your token budget.' },
  { n: '04', t: 'Trace', ep: 'emit_receipt: true', d: 'The same call can return a signed, replayable receipt.' },
] as const
const ARIA = [
  'Isometric stack: episodes layer active',
  'Isometric stack: memories layer active; renewal 1st superseded by 14th',
  'Isometric stack: bundle layer active, four ranked items, 1,284 of 2,000 tokens',
  'Trace: a receipt tag on the bundle with lines from each ranked item down to its source episode',
]

/** Appends the `is-on` state class that home-b.css keys off. */
const k = (c: string, on: boolean) => (on ? `${c} is-on` : c)

/** One isometric slab: three faces at depth `y`, its tile grid inside. */
function Layer({ y, on, onPick, label, children }: { y: number; on: boolean; onPick: () => void; label: string; children: ReactNode }) {
  return (
    <g onClick={onPick} role="button" aria-label={label} className={k('sw-hw-layer', on)}>
      <g className="sw-hw-faces">
        <polygon points={`150,${y} 150,${y + 12} 400,${y + 112} 400,${y + 100}`} className="sw-hw-face sw-hw-face--l" />
        <polygon points={`400,${y + 100} 400,${y + 112} 650,${y + 12} 650,${y}`} className="sw-hw-face sw-hw-face--r" />
        <polygon points={`400,${y - 100} 650,${y} 400,${y + 100} 150,${y}`} className="sw-hw-face sw-hw-face--top" />
      </g>
      <g transform={`matrix(1 -0.4 1 0.4 150 ${y})`}>
        <path d="M62.5 0V250M125 0V250M187.5 0V250M0 62.5H250M0 125H250M0 187.5H250" className="sw-hw-grid" />
        {children}
      </g>
    </g>
  )
}

function Stack({ step, pick }: { step: number; pick: (i: number) => void }) {
  const E = step === 0, M = step === 1, U = step >= 2
  const chat = (x: number, y: number, on: boolean) => (
    <path transform={`translate(${x} ${y})`} d="M2.5 2h9a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H7L4.5 13.5V11h-2a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" className={k('sw-hw-chat', on)} />
  )
  const mono = (x: number, y: number, s: string, cls: string, size = 13) => <text x={x} y={y} fontSize={size} className={`sw-hw-mono ${cls}`}>{s}</text>
  const pv = step === 3
  const trace = (x: number, y1: number, y2: number, d: number) => (
    <>
      <line x1={x} y1={y1} x2={x} y2={y2} className={k('sw-hw-trace', pv)} style={{ transitionDelay: `${d}ms` }} />
      <circle cx={x} cy={y2} r={2.5} className={k('sw-hw-trace', pv)} style={{ transitionDelay: `${d}ms` }} />
    </>
  )
  return (
    <svg viewBox="0 70 720 570" width="100%" role="img" aria-label={ARIA[step]} className="sw-hw-svg">
      <Layer y={520} on={E} onPick={() => pick(0)} label="Show step 01">
        <rect x={25} y={60} width={100} height={36} rx={8} className={k('sw-hw-tile', E)} />
        {chat(37, 71, E)}{mono(58, 83, '2 Sep', k('sw-hw-txt', E))}
        <rect x={135} y={60} width={100} height={36} rx={8} className={k('sw-hw-tile', E)} />
        <foreignObject x={147} y={71} width={14} height={14}>
          <span className={k('sw-hw-mask', E)} style={{ ['--m' as string]: `url(${logo('zendesk')})` }} />
        </foreignObject>
        {mono(168, 83, '9 Sep', k('sw-hw-txt', E))}
        <rect x={25} y={120} width={100} height={36} rx={8} className={k('sw-hw-tile', E)} />
        {chat(37, 131, E)}{mono(59, 143, 'earlier', k('sw-hw-txt', E))}
      </Layer>

      <g>{trace(303, 148.4, 521.2, 300)}{trace(413, 128.4, 477.2, 380)}{trace(303, 196.4, 521.2, 460)}{trace(413, 176.4, 477.2, 540)}</g>

      <Layer y={350} on={M} onPick={() => pick(1)} label="Show step 02">
        <rect x={25} y={50} width={200} height={36} rx={8} className={k('sw-hw-tile', M)} />
        <text x={39} y={73} fontSize={14} className={k('sw-hw-txt', M)}>renewal · 14th</text>
        <rect x={25} y={100} width={200} height={36} rx={8} className={k('sw-hw-tile', M)} />
        <text x={39} y={123} fontSize={14} className={k('sw-hw-txt', M)}>INV-2291 · refunded</text>
        <g className="sw-hw-ghost">
          <rect x={25} y={150} width={150} height={36} rx={8} className={k('sw-hw-tile', M)} />
          <text x={39} y={173} fontSize={14}>renewal · 1st</text>
          <line x1={39} y1={168.5} x2={122} y2={168.5} className="sw-hw-strike" />
        </g>
      </Layer>

      <Layer y={180} on={U} onPick={() => pick(2)} label="Show step 03">
        {[[1, 40, 180], [2, 70, 150], [3, 100, 120], [4, 130, 90]].map(([n, y, w]) => (
          <g key={n}>
            {mono(22, y + 11, String(n), k('sw-hw-txt', U), 11)}
            <rect x={40} y={y} width={w} height={14} rx={4} className={k('sw-hw-rank', U)} />
          </g>
        ))}
        <rect x={40} y={176} width={180} height={4} rx={2} className="sw-hw-track" />
        <rect x={40} y={176} width={115.6} height={4} rx={2} className={k('sw-hw-used', U)} />
        {mono(40, 198, '1,284 / 2,000', k('sw-hw-txt', U), 12)}
        <g onClick={() => pick(3)} className={k('sw-hw-receipt', step === 3)}>
          <rect x={140} y={216} width={92} height={24} rx={6} />
          {mono(150, 232, 'receipt ✓', 'sw-hw-white', 12)}
        </g>
      </Layer>

      {[[520, 'EPISODES', E], [350, 'MEMORIES', M], [180, 'BUNDLE', U]].map(([y, name, on]) => (
        <g key={name as string}>
          <line x1={140} y1={y as number} x2={150} y2={y as number} className={k('sw-hw-tick', on as boolean)} />
          <text x={134} y={(y as number) + 4} textAnchor="end" className={k('sw-hw-mono sw-hw-name', on as boolean)}>{name as string}</text>
        </g>
      ))}
    </svg>
  )
}

export function HowItWorks() {
  const [step, setStep] = useState(0)
  const [pinned, setPinned] = useState(false)
  const pin = useRef<HTMLDivElement>(null)

  // Past 1000px the section pins and scroll position picks the step.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1000px)')
    const sync = () => setPinned(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!pinned) return
    const onScroll = () => {
      const el = pin.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const total = r.height - window.innerHeight
      if (total <= 0) return
      const p = Math.min(0.999, Math.max(0, -r.top / total)) * 4
      el.style.setProperty('--p', p.toFixed(3))
      setStep(Math.floor(p))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pinned])

  const pick = useCallback((i: number) => {
    const el = pin.current
    if (el && pinned) {
      const r = el.getBoundingClientRect()
      const total = r.height - window.innerHeight
      window.scrollTo({ top: window.scrollY + r.top + (total * (i + 0.5)) / 4, behavior: 'smooth' })
    } else setStep(i)
  }, [pinned])

  return (
    <section id="how" className="sw-section sw-how-sec" aria-label="How it works">
      <div className="sw-dark-panel">
        <div aria-hidden="true" className="sw-how__glow" />
        <div className="sw-how__in">
          <Eyebrow dark>How it works</Eyebrow>
          <H2 one a="Three calls." b="One receipt." />
          <p className="sw-lede">
            Statewave is a memory runtime with three API calls: record episodes, compile them into typed memories, and
            retrieve a token-bounded context bundle with an optional signed receipt.
          </p>

          <div ref={pin} className={`sw-how${pinned ? ' sw-how--pinned' : ''}`}>
            <div className="sw-how__grid">
              <div className="sw-how__list">
                {STEPS.map((s, i) => {
                  const on = step === i
                  return (
                    <button key={s.n} type="button" className={k('sw-how__row', on)} style={{ ['--i' as string]: i }} aria-pressed={on} onClick={() => pick(i)}>
                      <span className={k('sw-mono sw-how__n', on)}>{s.n}</span>
                      <span className="sw-how__body">
                        <span className={k('sw-how__t', on)}>{s.t}</span>
                        <span className="sw-mono sw-how__ep">{s.ep}</span>
                        <span className="sw-how__dwrap"><span className="sw-how__d">{s.d}</span></span>
                      </span>
                      <span aria-hidden="true" className="sw-how__bar" />
                    </button>
                  )
                })}
              </div>

              <div className="sw-how__visual">
                <Stack step={step} pick={pick} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
