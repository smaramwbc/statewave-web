import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Eyebrow, H2, Ln } from './ui'
import { useSeen, useTween } from './hooks'
import './home-a.css'

const ILLUS = '/images/home/v8/illus/'

/** The dithered backdrop and the card float against each other as the pointer moves
 *  across the panel. Eased in rAF through --mx/--my so it never snaps. */
function Vis({ img, children, mod = '' }: { img: string; children: ReactNode; mod?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0
    const frame = () => {
      x += (tx - x) * 0.08; y += (ty - y) * 0.08
      el.style.setProperty('--mx', x.toFixed(3)); el.style.setProperty('--my', y.toFixed(3))
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.002 ? requestAnimationFrame(frame) : 0
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame) }
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2
      kick()
    }
    const leave = () => { tx = 0; ty = 0; kick() }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); cancelAnimationFrame(raf) }
  }, [])
  return (
    <div ref={ref} className={`sw-vis${mod}`}>
      <span aria-hidden="true" className="sw-vis__bg" style={{ backgroundImage: `url(${ILLUS}${img})` }} />
      {children}
    </div>
  )
}

/** Four use-case cards. The support card's health gauge counts up once seen. */
export function UseCases() {
  const [ref, seen] = useSeen<HTMLDivElement>()
  const health = Math.round(useTween(55, 1500, seen, 200))
  const done = health >= 55

  return (
    <section id="solutions" className="sw-section sw-section--tint" aria-label="Use cases">
      <div className="sw-wrap">
        <div className="sw-uc-head">
          <div>
            <Eyebrow>Use cases</Eyebrow>
            <H2 a="AI agent memory" b="for the agents you ship." />
            <p className="sw-lede">
              Statewave provides AI agent memory for support desks, coding assistants, multi-agent systems and
              personal assistants, each keyed to the subject it serves.
            </p>
          </div>
          <Ln to="/use-cases" className="sw-more sw-more--nw">All use cases →</Ln>
        </div>

        <div ref={ref} className="sw-bento">
          <article className="sw-card sw-support">
            <h3 className="sw-h3">Support agents</h3>
            <p className="sw-copy sw-copy--520">
              Your agent picks up each customer where the last session left off, with open issues, prior fixes and SLA
              status in one bundle.
            </p>
            <Ln to="/use-cases" className="sw-more">Support agent workflow →</Ln>
            <Vis img="support-rings.png" mod=" sw-vis--p24">
              <div className="sw-vis__card sw-vis__card--380">
                <div className="sw-vrow">
                  <span className="sw-vtext sw-vtext--b">Handoff pack · account:northwind</span>
                  <span className={`sw-chip ${done ? 'sw-chip--ok' : 'sw-chip--run'}`}>{done ? '✓ Assembled' : 'Assembling'}</span>
                </div>
                <div className="sw-gauge">
                  <svg width="76" height="44" viewBox="0 0 100 56" aria-hidden="true">
                    <path d="M10 50 A40 40 0 0 1 90 50" className="sw-gauge__track" />
                    <path d="M10 50 A40 40 0 0 1 90 50" className="sw-gauge__fill" style={{ strokeDashoffset: 125.7 * (1 - health / 100) }} />
                  </svg>
                  <div>
                    <div className="sw-gauge__num">{health}<span> / 100</span></div>
                    <div className="sw-gauge__note">Health · watch</div>
                  </div>
                </div>
                <div className="sw-vgrid sw-vgrid--10">
                  <div><div className="sw-vcap">Open issue</div><div className="sw-vtext--mt2">Resend the May invoice</div></div>
                  <div>
                    <div className="sw-vcap">Prior fixes</div>
                    <div className="sw-vtext--mt2">Duplicate INV-2291 refunded · 9 Sep</div>
                    <div>Renewal moved to the 14th · 2 Sep</div>
                  </div>
                </div>
                <div className="sw-chips">
                  <span className="sw-chip sw-chip--ok sw-chip--24">✓ First response 2m 25s</span>
                  <span className="sw-chip sw-chip--warn sw-chip--24">1 resolution breach</span>
                </div>
              </div>
            </Vis>
          </article>

          <article className="sw-card sw-wide sw-split">
            <div className="sw-text">
              <h3 className="sw-h3">Coding agents</h3>
              <p className="sw-copy">Your assistant recalls architecture decisions and team conventions across sessions.</p>
              <Ln to="/use-cases" className="sw-more">Coding agent memory →</Ln>
            </div>
            <Vis img="coding-planes.png">
              <div className="sw-vis__card sw-vis__card--320">
                <div className="sw-vcode">
                  <i />statewave_get_context
                </div>
                <div className="sw-vgrid sw-vgrid--8">
                  <div><div className="sw-vtext">Job queue uses Postgres advisory locks, not Redis.</div><div className="sw-vmono sw-vmono--3">← docs/adr/007.md</div></div>
                  <div><div className="sw-vtext">pnpm workspaces, Vitest, named exports.</div><div className="sw-vmono sw-vmono--3">← PR #212 review</div></div>
                </div>
              </div>
            </Vis>
          </article>

          <article className="sw-card sw-multi">
            <h3 className="sw-h3">Multi-agent systems</h3>
            <p className="sw-copy">Agents share one memory per subject, and policies decide what each caller sees.</p>
            <Ln to="/use-cases/multi-agent-memory" className="sw-more">Read the policy docs →</Ln>
            <Vis img="multi-spheres.png" mod=" sw-vis--end">
              <div className="sw-vis__card sw-vis__card--full">
                <div className="sw-vmono sw-vmono--3">account:northwind · as research-agent</div>
                <div className="sw-vrow sw-vrow--wrap sw-vrow--mt10">
                  <span className="sw-vtext">Contact: <span className="sw-redact">█████ ████████</span></span>
                  <span className="sw-chip sw-chip--warn sw-chip--22">pii · redacted</span>
                </div>
              </div>
            </Vis>
          </article>

          <article className="sw-card sw-pa">
            <h3 className="sw-h3">Personal assistants</h3>
            <p className="sw-copy">Preferences and profile facts carry across sessions, and validity windows let stale facts expire.</p>
            <Ln to="/use-cases/personal-assistant-memory" className="sw-more">See the domain model →</Ln>
            <Vis img="pa-timeline.png">
              <div className="sw-vis__card sw-vis__card--300">
                <div className="sw-vmono sw-vmono--3">user:mira · profile_fact</div>
                <div className="sw-vrow sw-vrow--mt10">
                  <span className="sw-vtext sw-vtext--b">Home airport: OAK</span>
                  <span className="sw-chip sw-chip--ok sw-chip--22">active</span>
                </div>
                <div className="sw-vrow sw-vrow--mt6">
                  <span className="sw-old">SFO</span>
                  <span className="sw-chip sw-chip--idle sw-chip--22 sw-chip--sup">superseded</span>
                </div>
                <div className="sw-valid">
                  <span>valid 2025-04 → open</span>
                  <span />
                </div>
              </div>
            </Vis>
          </article>
        </div>
      </div>
    </section>
  )
}
