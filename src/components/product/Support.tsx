import type { ReactNode } from 'react'
import { CircleAlert, Clock, FileText, Gauge, ListChecks, Repeat, User } from 'lucide-react'
import { Head, Pill, Tile } from './ui'

function Feature({ icon, title, body, children, className = '' }: { icon: ReactNode; title: string; body: string; children: ReactNode; className?: string }) {
  return (
    <article className={`pd-feat ${className}`}>
      <div className="pd-feat__t"><Tile size={36}>{icon}</Tile><h3>{title}</h3></div>
      <p>{body}</p>
      {children}
    </article>
  )
}

function Block({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="pd-hp__block">
      <span className="pd-hp__label">{icon}{label}</span>
      {children}
    </div>
  )
}

/** Half-ring gauge; the arc length is the score. */
function Ring({ score }: { score: number }) {
  const arc = 'M8 70a62 62 0 0 1 124 0'
  return (
    <svg width="140" height="76" viewBox="0 0 140 76" role="img" aria-label={`Health ${score} of 100`} className="pd-ring">
      <path d={arc} pathLength={100} className="pd-ring__track" />
      <path d={arc} pathLength={100} strokeDasharray={`${score} 100`} className="pd-ring__fill" />
      <text x="70" y="66" textAnchor="middle">{score}</text>
    </svg>
  )
}

/** Factor bars scale 5% per point, so −14 / −12 / +8 read in proportion. */
const FACTORS = [['Open issues', -14], ['SLA breach', -12], ['Response time', 8]] as const
/** Both SLA bars share one scale with the target tick at 77%: 5m and 24h. */
const SLA = [['First response', 37, '2m 25s · target 5m'], ['Resolution', 83, '26h · target 24h']] as const

export function Support() {
  return (
    <section id="support" className="pd-sec pd-sec--panel" aria-label="Support agents">
      <div className="sw-wrap">
        <Head
          title="Built for support agents first"
          lede="Support is where Statewave is most tuned and most tested, with eight eval criteria you can run against your own stack."
          more={{ to: '/use-cases#strongest', label: 'Support agent workflow' }}
        />
        <div className="pd-support">
          <Feature className="pd-handoff" icon={<FileText size={18} />} title="Handoff packs" body="The brief a human needs when an agent escalates, assembled in one call.">
            <div className="pd-hp">
              <div className="pd-row">
                <Tile tone="navy"><FileText size={15} /></Tile>
                <b>Handoff pack</b><span className="pd-muted pd-grow">account:northwind</span>
                <Pill tone="ok">✓ Assembled</Pill>
              </div>
              <div className="pd-hp__grid">
                <div className="pd-hp__col">
                  <Block icon={<User size={14} />} label="Customer summary"><p>Northwind, annual plan. Renews on the 14th and prefers email for invoices.</p></Block>
                  <Block icon={<CircleAlert size={14} />} label="Active issue"><b>Wants the May invoice resent</b></Block>
                  <Block icon={<ListChecks size={14} />} label="Attempted steps">
                    <span className="pd-hp__done"><i>✓</i>Checked the billing portal</span>
                    <span className="pd-hp__done"><i>✓</i>Resent the invoice to the billing contact</span>
                  </Block>
                  <Block icon={<CircleAlert size={14} />} label="Suggested next step"><b>Confirm the invoice reached billing, then close the ticket</b></Block>
                </div>
                <div className="pd-hp__col pd-hp__col--side">
                  <Block icon={<Gauge size={14} />} label="Health">
                    <Ring score={55} />
                    <span className="pd-row pd-row--start"><span className="pd-muted pd-small">/ 100</span><Pill tone="warn">Watch</Pill></span>
                  </Block>
                  <Block icon={<Clock size={14} />} label="SLA">
                    <Pill tone="ok">✓ First response 2m 25s</Pill>
                    <Pill tone="warn">1 resolution breach</Pill>
                  </Block>
                  <Block icon={<Repeat size={14} />} label="Prior fixes">
                    <p className="pd-small">Duplicate INV-2291 refunded · 9 Sep</p>
                    <p className="pd-small">Renewal moved to the 14th · 2 Sep</p>
                  </Block>
                </div>
              </div>
            </div>
          </Feature>

          <div className="pd-support__side">
            <Feature icon={<Gauge size={18} />} title="Health scoring" body="Deterministic 0–100 with explainable factors.">
              <div className="pd-well pd-health">
                <ul className="pd-bars">
                  {FACTORS.map(([k, v]) => (
                    <li key={k}><span>{k}</span><i><b className={v > 0 ? 'is-up' : ''} style={{ width: `${Math.abs(v) * 5}%` }} /></i><em>{v > 0 ? `+${v}` : `−${-v}`}</em></li>
                  ))}
                </ul>
                <div className="pd-health__score"><b>55</b><span>/ 100 · Watch</span></div>
              </div>
            </Feature>
            <Feature icon={<Clock size={18} />} title="SLA tracking" body="First response, resolution and breaches.">
              <ul className="pd-well pd-bars pd-bars--sla">
                {SLA.map(([k, w, v]) => (
                  <li key={k}><span>{k}</span><i><b className={w > 77 ? '' : 'is-up'} style={{ width: `${w}%` }} /><u /></i><em>{v}</em></li>
                ))}
              </ul>
            </Feature>
            <Feature icon={<Repeat size={18} />} title="Repeat-issue detection" body="Surfaces the prior fix when a problem comes back.">
              <div className="pd-well pd-repeat">
                <span><i className="is-new" />May invoice not received<em>New</em></span>
                <span><i />Duplicate INV-2291 refunded · 9 Sep<em className="is-seen">Seen before</em></span>
              </div>
            </Feature>
          </div>
        </div>
      </div>
    </section>
  )
}
