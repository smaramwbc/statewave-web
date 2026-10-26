import { Bot, CodeXml, FileText, Layers, List, Package, RefreshCw, ShieldCheck, SquareCheck } from 'lucide-react'
import { Ln } from '../home/ui'
import { DOCS, DOCS_REPO } from '../home/links'
import { PROOF_FIGURES } from '../../lib/proof-stats'
import { Brand, Tile } from './ui'

const STATS = [
  { n: '3', label: 'API calls', icon: <CodeXml size={15} /> },
  { n: '0', label: 'Telemetry paths to Statewave', icon: <ShieldCheck size={15} /> },
  { n: '1', label: 'Container', icon: <Package size={15} /> },
  { n: PROOF_FIGURES.supportCriteria, label: 'Support eval criteria', icon: <SquareCheck size={15} /> },
]

const BUNDLE = [
  { icon: <Layers size={15} />, text: 'Plan renews on the 14th', score: '21.4', top: true },
  { icon: <List size={15} />, text: 'Resend invoices from the billing portal', score: '18.2' },
  { icon: <FileText size={15} />, text: 'Duplicate INV-2291 refunded on 9 Sep', score: '14.7' },
]

/** The agent session the hero argues for: a reply backed by ranked, sourced facts. Illustrative data. */
function Stage() {
  return (
    <div className="pd-stage" role="img" aria-label="Example agent session: a support agent answers a renewal question using three ranked facts from Statewave, 1,284 of 2,000 tokens, with a signed receipt.">
      <div className="pd-session" aria-hidden="true">
        <div className="pd-session__top">
          <Tile tone="navy" size={28}><Bot size={15} /></Tile>
          <div>
            <b className="pd-session__name">support-agent<i /></b>
            <span className="pd-muted">account:northwind</span>
          </div>
        </div>
        <div className="pd-session__chat">
          <div className="pd-bubble pd-bubble--user">
            <span>Dana · 30 Sep</span>
            <p>When does our plan renew, and can you resend the May invoice?</p>
          </div>
          <div className="pd-reply">
            <Tile size={28}><Bot size={15} /></Tile>
            <div className="pd-bubble pd-bubble--agent">
              <p>Your plan renews on the 14th, and I’ve resent the May invoice to billing@northwind.io.</p>
              <div className="pd-srcs">
                <span className="pd-src"><Brand name="slack" size={12} />Renewal moved · 2 Sep</span>
                <span className="pd-src"><Brand name="zendesk" size={12} />INV-2291 · 9 Sep</span>
              </div>
            </div>
          </div>
        </div>
        <div className="pd-ctx">
          <div className="pd-ctx__head">
            <Package size={15} className="pd-accent" />
            <b>Context from Statewave</b>
            <span className="pd-muted">1,284 / 2,000 tokens</span>
          </div>
          {BUNDLE.map((r) => (
            <div key={r.text} className={`pd-ctx__row${r.top ? ' is-top' : ''}`}>
              <span className="pd-muted">{r.icon}</span>
              <span className="pd-ellipsis">{r.text}</span>
              <b className="pd-accent">{r.score}</b>
            </div>
          ))}
          <div className="pd-ctx__foot">
            <ShieldCheck size={15} className="pd-ok" />
            <span className="pd-ok">Receipt signed</span>
            <code className="pd-muted">01J9ZK4T7M3QX8R2</code>
            <span className="pd-accent pd-ctx__replay"><RefreshCw size={13} />Replay</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section className="pd-hero" aria-labelledby="pd-hero-title">
      <div className="sw-hero__beams" aria-hidden="true">
        {[[40, -24, 0.16], [56, -24, 0.1], [48, -22, 0.12], [64, -22, 0.08]].map(([l, r, o]) => (
          <i key={l} style={{ left: `${l}%`, transform: `rotate(${r}deg)`, ['--o' as string]: o }} />
        ))}
      </div>
      <div aria-hidden="true" className="pd-hero__glow" />
      <div aria-hidden="true" className="pd-hero__arc" />

      <div className="sw-wrap pd-hero__in">
        <div className="pd-hero__copy">
          <h1 id="pd-hero-title" className="pd-hero__title">
            How AI agent memory works, <span className="sw-hero__grad">from event to receipt</span>
          </h1>
          <p className="pd-hero__sub">
            Your app sends Statewave what happened. Statewave compiles typed facts about each customer and hands your
            agent a ranked, token&#8209;bounded bundle, with every fact traced to its source.
          </p>
          <div className="pd-hero__ctas">
            <Ln to={DOCS} className="sw-btn sw-btn--solid sw-hero__cta">
              Get started
              <span aria-hidden="true" className="sw-hero__go">→</span>
            </Ln>
            <Ln to={DOCS_REPO} className="sw-btn sw-btn--ghost pd-btn">Read the docs</Ln>
          </div>
          <dl className="pd-stats">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt>{s.label}</dt>
                <dd><Tile tone="inv">{s.icon}</Tile>{s.n}</dd>
              </div>
            ))}
          </dl>
        </div>
        <Stage />
      </div>
    </section>
  )
}
