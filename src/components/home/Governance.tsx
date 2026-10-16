import { useEffect, useRef, useState } from 'react'
import { Eyebrow, H2, Ln } from './ui'
import { usePrefersReducedMotion } from './hooks'
import './home-c.css'

const IMG = '/images/home/v8/admin/'
const ITEMS = [
  { t: 'Labels and policies', path: 'subjects', d: 'Memories carry sensitivity labels such as pii, financial and secret. Heuristic detectors suggest labels at compile time and an operator promotes them. YAML policies deny or redact per caller and tenant, with log_only mode before you enforce.' },
  { t: 'Receipts and replay', path: 'receipts', d: "Any context call can emit an immutable, ULID-addressed receipt: content-hashed, HMAC-signed, with the policy snapshot embedded. Replay re-runs that retrieval against today's memories under the original policy." },
  { t: 'Isolation and erasure', path: 'subjects?tenant=default', d: 'Queries are scoped per tenant via X-Tenant-ID, with per-tenant config and region pinning. DELETE /v1/subjects/{id} removes every episode, memory and receipt for a subject in one call, or in bulk from the admin console.' },
]
// The official 1919px-wide screenshots are shown across the full width, cropped to
// FRAME_H tall, so text stays sharp. Callouts are given in source-image percentages.
const FRAME_H = 640
const IMG_H = 1440 * (928 / 1919) // source height at the 1440-wide reference
const SHOTS = [
  { src: 'subjects-all.png', alt: 'Statewave admin: Subjects list across all tenants' },
  { src: 'receipts-scope.png', alt: 'Statewave admin: Receipts page asking to pick a subject or tenant scope', callout: { left: 55.4, top: 46, text: 'Receipts load per subject or tenant. No cross-fleet listing' } },
  { src: 'subjects-default.png', alt: 'Statewave admin: Subjects list filtered to tenant default', callout: { left: 46, top: 13, text: 'Scoped per tenant' } },
]
const PERIOD = 5000

/** Three governance controls. From 1000px wide the section pins and scroll position picks the
 *  control; otherwise they rotate on a 5s timer until the visitor picks one. */
export function Governance() {
  const rm = usePrefersReducedMotion()
  const [spot, setSpot] = useState(0)
  const [auto, setAuto] = useState(true)
  const bar = useRef<HTMLElement | null>(null)
  const [pinned, setPinned] = useState(false)
  const pin = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1000px)')
    const sync = () => setPinned(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!pinned) return
    let last = -1
    const onScroll = () => {
      const el = pin.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const total = r.height - window.innerHeight
      if (total <= 0) return
      const p = Math.min(0.999, Math.max(0, -r.top / total)) * ITEMS.length
      const i = Math.floor(p)
      if (bar.current) bar.current.style.height = `${(p - i) * 100}%`
      if (i !== last) { last = i; setSpot(i) }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pinned])

  const pick = (i: number) => {
    const el = pin.current
    if (el && pinned) {
      const r = el.getBoundingClientRect()
      const total = r.height - window.innerHeight
      window.scrollTo({ top: window.scrollY + r.top + (total * (i + 0.5)) / ITEMS.length, behavior: 'smooth' })
    } else { setAuto(false); setSpot(i) }
  }

  useEffect(() => {
    if (pinned || !auto || rm) return
    let raf = 0
    let start = performance.now()
    const frame = (now: number) => {
      const p = Math.min(1, (now - start) / PERIOD)
      if (bar.current) bar.current.style.height = `${p * 100}%`
      if (p >= 1) { start = now; setSpot((s) => (s + 1) % ITEMS.length) }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [auto, rm, pinned])

  return (
    <section id="governance" className="sw-section" aria-label="Governance">
      <div className="sw-wrap">
        <div className="sw-gov__head">
          <Eyebrow>Governance</Eyebrow>
          <H2 a="Memory you can govern." b="Not just retrieve." />
          <p className="sw-lede">
            Statewave ships the controls a memory layer needs before it touches production data: sensitivity labels,
            declarative policies, signed receipts, provenance, tenant isolation and subject-level erasure.
          </p>
        </div>

        <div ref={pin} className={`sw-gov-pin${pinned ? ' sw-gov-pin--on' : ''}`}>
        <div className="sw-gov">
          <div className="sw-gov__col">
            <div role="group" aria-label="Governance controls" className="sw-gov__tabs">
              {ITEMS.map((it, i) => {
                const on = spot === i
                return (
                  <button key={it.t} type="button" className="sw-gov__item" aria-pressed={on} onClick={() => pick(i)}>
                    {on && (
                      <span aria-hidden="true" className="sw-gov__bar" data-manual={(!pinned && (!auto || rm)) || undefined}>
                        <i ref={(el) => { bar.current = el }} />
                      </span>
                    )}
                    <span className="sw-gov__row">
                      <span className="sw-gov__t">{it.t}</span>
                      <span className="sw-mono sw-gov__n">0{i + 1}</span>
                    </span>
                    {on && <span className="sw-gov__d">{it.d}</span>}
                  </button>
                )
              })}
            </div>
            <Ln to="/product#audit-governance" className="sw-more">How Statewave governs memory →</Ln>
          </div>

          <p className="sw-gov__desc">{ITEMS[spot].d}</p>

          <div className="sw-gov__stage">
            <div aria-hidden="true" className="sw-gov__glow" />
            <figure className="sw-gov__fig">
              <div className="sw-gov__chrome">
                {[0, 1, 2].map((d) => <span key={d} className="sw-gov__dot" />)}
                <span className="sw-mono sw-ellipsis sw-gov__url">
                  statewave-admin / {ITEMS[spot].path}
                </span>
                <span className="sw-gov__sp" />
              </div>
              <div className="sw-shot">
                {SHOTS.map((s, i) => (
                  <div key={s.src} className="sw-gov__slide" data-on={spot === i || undefined}>
                    <img src={IMG + s.src} alt={s.alt} loading="lazy" decoding="async" />
                    {s.callout && (
                      <div className="sw-callout" style={{ left: `${s.callout.left}%`, top: `${((s.callout.top * IMG_H) / FRAME_H).toFixed(2)}%` }}>
                        <i /><span>{s.callout.text}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </figure>
          </div>
        </div>
        </div>
      </div>
    </section>
  )
}
