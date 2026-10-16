import { useEffect, useState } from 'react'
import { ArrowLeftRight, FileText, Headset, MessageSquare, ShieldCheck, ShieldOff } from 'lucide-react'
import { Eyebrow, H2, Ln } from './ui'
import { usePrefersReducedMotion, useSeen } from './hooks'
import './home-c.css'

/** "Same customer, two agents": the toggle flips between a memoryless agent
 *  and one backed by Statewave. It flips itself once, when first seen. */
export function Problem() {
  const [ref, seen] = useSeen<HTMLDivElement>()
  const rm = usePrefersReducedMotion()
  const [choice, setChoice] = useState<boolean | null>(null)
  const [auto, setAuto] = useState(false)

  useEffect(() => {
    if (!seen || rm) return
    const t = setTimeout(() => setAuto(true), 1600)
    return () => clearTimeout(t)
  }, [seen, rm])

  // Flips to "With Statewave" by itself once seen, unless the visitor picked a side.
  const on = choice ?? ((seen && rm) || auto)
  const pick = (v: boolean) => () => setChoice(v)

  return (
    <section className="sw-section sw-section--problem" aria-labelledby="problem">
      <div className="sw-wrap">
        <div className="sw-p-head">
          <Eyebrow>The problem</Eyebrow>
          <H2 id="problem" a="AI agents forget." b="Every session starts from zero." />
          <p className="sw-lede">
            Without a memory runtime, an AI agent starts every session from zero, and when it gets an answer wrong,
            nobody can say what it was told.
          </p>
        </div>

        <div ref={ref} className="sw-cmp">
          <div className="sw-p-wrap">
            <div className="sw-seg">
              <div role="group" aria-label="Agent" className="sw-seg__tabs">
                <button type="button" aria-pressed={!on} onClick={pick(false)}>Without memory</button>
                <button type="button" aria-pressed={on} onClick={pick(true)}>With Statewave</button>
              </div>
              <Ln to="/demo" className="sw-btn sw-btn--outline sw-seg__cta">
                Try both agents live →
              </Ln>
            </div>

            <div className="sw-pc" data-on={on || undefined}>
              <div className="sw-pc__head">
                <span className="sw-pc__avatar"><img src="/brand/icon.svg" alt="" width={22} height={22} /></span>
                <span className="sw-pc__title">
                  <b>Support agent</b>
                  <i>account:northwind · session 3 · 30 Sep</i>
                </span>
                <span className="sw-pc__status" data-ok={on || undefined}>
                  {on ? <ShieldCheck size={15} aria-hidden="true" /> : <ShieldOff size={15} aria-hidden="true" />}
                  {on ? 'Receipt signed' : 'No receipt'}
                </span>
              </div>

              <div className="sw-pc__grid">
                <div className="sw-pc__mem">
                  <div className="sw-pc__label">What the agent remembers</div>
                  <ol className="sw-pc__tl">
                    <li className="sw-pc__ev">
                      <span className="sw-pc__ico"><MessageSquare size={16} aria-hidden="true" /></span>
                      <span className="sw-pc__evb">
                        <span className="sw-pc__evh"><b>Session 1</b><i>2 Sep · chat</i></span>
                        <span className="sw-pc__evt">{on ? '“We moved our renewal to the 14th.”' : 'Nothing recalled'}</span>
                      </span>
                    </li>
                    <li className="sw-pc__ev">
                      <span className="sw-pc__ico"><Headset size={16} aria-hidden="true" /></span>
                      <span className="sw-pc__evb">
                        <span className="sw-pc__evh"><b>Session 2</b><i>9 Sep · Zendesk</i></span>
                        <span className="sw-pc__evt">{on ? 'Duplicate INV-2291 refunded' : 'Nothing recalled'}</span>
                      </span>
                    </li>
                  </ol>
                  <div aria-hidden="true" className="sw-pc__diff">
                    <ArrowLeftRight size={14} />
                    <span>renewal date</span>
                    <s>1st</s><span>→</span><strong>14th</strong>
                    <em>Superseded</em>
                  </div>
                </div>

                <div className="sw-pc__chat">
                  <div className="sw-pc__row sw-pc__row--user">
                    <div className="sw-pc__bubble sw-pc__bubble--user">When does our plan renew, and can you resend the May invoice?</div>
                    <span className="sw-pc__who">N</span>
                  </div>
                  <div className="sw-pc__row">
                    <span className="sw-pc__who sw-pc__who--bot"><img src="/brand/icon.svg" alt="" width={16} height={16} /></span>
                    <div>
                      <div className="sw-pc__bubble">
                        <span>Your plan renews on the </span>
                        <span className="sw-pcard__val">{on ? '14th' : '1st'}</span>
                        <span key={String(on)} className="sw-pcard__fade">
                          {on ? ", and I've resent the May invoice. The duplicate charge was refunded on 9 Sep." : '. Could you explain the issue with the May invoice again?'}
                        </span>
                      </div>
                      <div className="sw-pc__src" data-on={on || undefined}>
                        <span className="sw-pc__srcl">Sources</span>
                        <span className="sw-pc__chip"><FileText size={13} aria-hidden="true" />ep 7c1e04a2 · 2 Sep</span>
                        <span className="sw-pc__chip"><FileText size={13} aria-hidden="true" />ep e2a6c35b · 9 Sep</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <dl className="sw-pc__stats">
                <div><dt>Prior sessions recalled</dt><dd>{on ? 2 : 0}</dd></div>
                <div><dt>Stale facts superseded</dt><dd>{on ? 1 : 0}</dd></div>
                <div><dt>Receipt</dt><dd>{on ? 'Signed' : 'None'}</dd></div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
