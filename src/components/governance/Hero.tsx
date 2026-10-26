import { CodeXml, RotateCcw, Search, ShieldCheck } from 'lucide-react'
import { Ln } from '../home/ui'
import { DOCS } from '../home/links'
import { GOV_DOCS } from './links'

// Illustrative receipts list, matching the Figma admin mock.
const ROWS = [
  ['01J9ZK4T7M3QX8R2', 'account:northwind', 'support_agent', 3, '12s ago'],
  ['01J9ZK3P1D8WQ5N7', 'account:helios', 'support_agent', 0, '41s ago'],
  ['01J9ZK2R6H4TB9E3', 'account:northwind', 'marketing_tool', 1, '2m ago'],
  ['01J9ZK1A9C2VM6K8', 'account:orbit', 'admin', 0, '5m ago'],
  ['01J9ZJZX5F7LP3Q1', 'account:helios', 'support_agent', 2, '9m ago'],
  ['01J9ZJYB3N8RD4W6', 'account:kestrel', 'security', 0, '14m ago'],
  ['01J9ZJX4W2KC7H5A', 'account:orbit', 'support_agent', 0, '21m ago'],
  ['01J9ZJW8Q6TN3B9X', 'account:kestrel', 'marketing_tool', 1, '28m ago'],
  ['01J9ZJV1M5RF8D2C', 'account:helios', 'admin', 0, '33m ago'],
] as const

const META = [
  ['Subject', 'account:northwind'],
  ['Caller', 'support_agent'],
  ['Policy bundle', 'sha256:a1b2c3…'],
  ['Mode', 'log_only'],
] as const

const DECISIONS = [
  { text: 'Billing contact email', label: 'pii', verdict: 'redact' },
  { text: 'Annual contract value', label: 'financial', verdict: 'deny', strong: true },
  { text: 'Admin API token', label: 'secret', verdict: 'deny', strong: true },
]

function Admin() {
  return (
    <div className="gv-admin" role="img" aria-label="Example Statewave admin screen: a list of context-call receipts in log_only mode, with one receipt open listing the memories a policy rule would redact or deny once enforced.">
      <div aria-hidden="true">
        <div className="gv-admin__bar">
          <span className="gv-admin__dot" />
          <b>Statewave admin</b><i>/</i><span>support-agent</span><i>/</i><b className="gv-medium">Receipts</b>
          <span className="gv-admin__search"><Search size={13} />Search by subject or receipt_id</span>
          <span className="gv-chip gv-mono">policy_mode: log_only</span>
          <span className="gv-chip">Last 24 hours</span>
        </div>
        <div className="gv-admin__body">
          <table className="gv-admin__table">
            <thead><tr><th>Receipt</th><th>Subject</th><th>Caller</th><th>Decisions</th><th>Time</th></tr></thead>
            <tbody>
              {ROWS.map(([id, subj, caller, n, t], i) => (
                <tr key={id} className={i === 0 ? 'is-on' : undefined}>
                  <td className="gv-mono gv-ink">{id}</td>
                  <td className="gv-mono">{subj}</td>
                  <td className="gv-mono">{caller}</td>
                  <td>{n ? <span className={`gv-pill${n === 3 ? ' gv-pill--inv' : ''}`}>{n} {n === 1 ? 'filter' : 'filters'} applied</span> : <span className="gv-muted">No filters applied</span>}</td>
                  <td className="gv-muted">{t}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="gv-admin__side">
            <div>
              <span className="gv-muted gv-small">Receipt</span>
              <code className="gv-admin__id">01J9ZK4T7M3QX8R2</code>
              <span className="gv-row gv-small gv-medium"><ShieldCheck size={13} />Signed with HMAC-SHA256</span>
            </div>
            <dl className="gv-kv">{META.map(([k, v]) => <div key={k}><dt>{k}</dt><dd className="gv-mono">{v}</dd></div>)}</dl>
            <b className="gv-small-h">Policy filters <span className="gv-muted gv-medium">· log_only, not enforced</span></b>
            <ul className="gv-decisions">
              {DECISIONS.map((d) => (
                <li key={d.text}>
                  <span>{d.text}</span>
                  {d.label && <span className="gv-tag">{d.label}</span>}
                  <span className={`gv-pill${d.strong ? ' gv-pill--inv' : ''}`}>{d.verdict}</span>
                </li>
              ))}
            </ul>
            <div className="gv-row">
              <span className="gv-btn-sm"><RotateCcw size={13} />Replay this call</span>
              <span className="gv-btn-sm"><CodeXml size={13} />View JSON</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section className="gv-hero" aria-labelledby="gv-hero-title">
      <div className="sw-hero__beams" aria-hidden="true">
        {[[36, 22, 0.14], [42, 24, 0.1], [58, -24, 0.1], [64, -22, 0.14]].map(([l, r, o]) => (
          <i key={l} style={{ left: `${l}%`, transform: `rotate(${r}deg)`, ['--o' as string]: o }} />
        ))}
      </div>
      <div aria-hidden="true" className="pd-hero__glow" />
      <div aria-hidden="true" className="pd-hero__arc" />
      <div className="sw-wrap gv-hero__in">
        <h1 id="gv-hero-title" className="gv-hero__title">
          Audit every memory <span className="sw-hero__grad">your agent uses</span>
        </h1>
        <p className="gv-hero__sub">
          Sensitivity labels, declarative policies and signed receipts sit in the retrieval path, so every context call
          can be checked, replayed and explained.
        </p>
        <div className="pd-hero__ctas gv-center">
          <Ln to={GOV_DOCS} className="sw-btn sw-btn--solid sw-hero__cta">
            Read the governance docs
            <span aria-hidden="true" className="sw-hero__go">→</span>
          </Ln>
          <Ln to={DOCS} className="sw-btn sw-btn--ghost pd-btn">Get started</Ln>
        </div>
        <Admin />
      </div>
    </section>
  )
}
