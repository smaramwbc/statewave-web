import type { ReactNode } from 'react'
import {
  ArrowDown, Brain, CalendarClock, Check, Clock, Database, FileCode, FileText, Ghost, GitMerge, Globe, Layers,
  Lock, Minus, ReceiptText, RotateCcw, ShieldCheck, Tag, ToggleLeft, Trash2, TriangleAlert, UserCheck,
} from 'lucide-react'
import { logo } from '../home/links'
import { Tile } from '../product/ui'
import { useFold } from '../home/hooks'
import { FoldTitle, GHead, type Fold } from './ui'

const Pill = ({ inv, children }: { inv?: boolean; children: ReactNode }) => <span className={`gv-pill${inv ? ' gv-pill--inv' : ''}`}>{children}</span>

// [key, value, legend marker, legend text]
const JSON_LINES: [string, string, number?][] = [
  ['{', ''],
  ['  "receipt_id":', ' "01J9ZK4T7M3QX8R2",', 1],
  ['  "tenant_id":', ' "tenant_01",'],
  ['  "selected_entries":', ' [ … 4 ],', 2],
  ['  "policy":', ' {'],
  ['    "policy_bundle_hash":', ' "a1b2c3…",', 3],
  ['    "filters_applied":', ' [ … 3 ]'],
  ['  },', ''],
  ['  "output":', ' { "context_hash": "sha256:9f4c…" },', 4],
  ['  "receipt_signature":', ' "7be1…",', 5],
  ['  "policy_snapshot":', ' { "bundle_yaml": "version: 1\\n…" }', 6],
  ['}', ''],
]
const LEGEND = [
  ['receipt_id', 'ULID, addressable and chainable'],
  ['selected_entries', 'Memories and episodes with rank and score'],
  ['policy_bundle_hash', 'Content hash of the policy in force'],
  ['context_hash', 'SHA-256 of the bytes delivered to the agent'],
  ['receipt_signature', 'HMAC-SHA256 over the canonical body, when a key is set'],
  ['policy_snapshot', 'Policy YAML embedded for replay'],
]
const FAILURES = [
  [<Clock size={16} />, 'Stale fact selected'],
  [<Layers size={16} />, 'Superseded memory influenced ranking'],
  [<Ghost size={16} />, 'Tombstoned memory resurrected'],
  [<GitMerge size={16} />, 'Conflicting entries merged without a flag'],
  [<CalendarClock size={16} />, 'As-of query fell back to latest state'],
  [<TriangleAlert size={16} />, 'Delivered bytes don’t match the hash'],
] as const

export function Receipts() {
  return (
    <section id="receipts" className="pd-sec pd-sec--card" aria-labelledby="gv-receipts">
      <div className="sw-wrap">
        <div className="pd-navy gv-dark">
          <div aria-hidden="true" className="gv-dark__glow" />
          <GHead dark id="gv-receipts" a="Every call can leave a signed" b="receipt you can replay"
            lede="Ask for a receipt on a context call and Statewave stores an append-only record addressed by ULID. It records what was selected, which policy applied and a SHA-256 hash of the exact bytes the agent received." />
          <div className="gv-viewer">
            <div className="gv-viewer__bar">
              <ReceiptText size={16} /><b className="pd-grow gv-medium">receipt.json</b>
              <span className="gv-pill gv-pill--dark"><ShieldCheck size={12} />Signature verified</span>
            </div>
            <div className="gv-viewer__body">
              <pre className="gv-json">
                {JSON_LINES.map(([k, v, n], i) => (
                  <span key={i}><i aria-hidden="true">{n && <b className="gv-marker">{n}</b>}</i><code>{k}<em>{v}</em></code></span>
                ))}
              </pre>
              <ol className="gv-legend">
                {LEGEND.map(([k, d], i) => (
                  <li key={k}><b className="gv-marker" aria-hidden="true">{i + 1}</b><div className="gv-stack"><code>{k}</code><span>{d}</span></div></li>
                ))}
              </ol>
            </div>
          </div>
          <div className="gv-grid gv-grid--receipts">
            <div className="gv-viewer gv-dark-card">
              <div className="gv-row gv-mini-card__head"><Tile tone="inv" size={32}><TriangleAlert size={15} /></Tile><b>Six failures a receipt exposes</b></div>
              <ul className="gv-fails">
                {FAILURES.map(([icon, t]) => <li key={t}><span className="gv-fails__icon">{icon}</span><b>{t}</b></li>)}
              </ul>
            </div>
            <div className="gv-viewer gv-dark-card">
              <div className="gv-row gv-mini-card__head"><Tile tone="inv" size={32}><RotateCcw size={15} /></Tile><b className="pd-grow">Replay a past call</b><span className="gv-pill gv-pill--dark gv-mono">POST /v1/receipts/{'{id}'}/replay</span></div>
              <div className="gv-replay">
                <div className="gv-replay__in">
                  <div><b>Policy snapshot</b><span>Stored on the receipt</span></div>
                  <div><b>Memories</b><span>As they are today</span></div>
                </div>
                <ArrowDown size={14} aria-hidden="true" />
                <div className="gv-replay__out"><b>Structural diff</b><span>A structural diff, not a byte-for-byte replay</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TCard({ icon, title, body, open, onToggle, children }: Fold & { icon: ReactNode; title: string; body: string; children: ReactNode }) {
  const panel = `gv-t-${title.split(' ')[0].toLowerCase()}`
  return (
    <article className="gv-card gv-tcard" data-fold={open === undefined ? undefined : open ? 'open' : 'shut'}>
      <div className="gv-row gv-mini-card__head"><Tile size={36}>{icon}</Tile><h3 className="pd-grow"><FoldTitle panel={panel} open={open} onToggle={onToggle}>{title}</FoldTitle></h3></div>
      <p>{body}</p>
      <div id={panel} className="gv-well gv-well--flow" aria-hidden="true" hidden={open === false}>{children}</div>
    </article>
  )
}

const LogoTile = ({ src }: { src: string }) => <span className="gv-logo"><img src={src} alt="" width={18} height={18} loading="lazy" /></span>

export function Identity() {
  const fold = useFold()
  return (
    <section id="identity" className="pd-sec pd-sec--panel" aria-labelledby="gv-identity">
      <div className="sw-wrap">
        <GHead id="gv-identity" a="Identity, tenants and erasure" b="handled on every call"
          lede="Governance depends on knowing who is calling, keeping tenants apart and being able to delete what you hold." />
        <div className="gv-grid gv-grid--3">
          <TCard {...fold(0)} icon={<UserCheck size={17} />} title="Caller identity" body="Pass caller_id and caller_type on context and handoff calls. When a tenant requires identity, a call missing either one returns 401.">
            <div className="gv-float gv-row"><LogoTile src={logo('claude')} /><div className="gv-stack pd-grow"><b>support_agent</b><span className="gv-muted">caller_id: support_agent</span></div><Pill>200</Pill></div>
            <div className="gv-float gv-float--dash gv-indent gv-row"><div className="gv-stack pd-grow"><b>No caller_id</b><span className="gv-muted gv-mono">require_caller_identity: true</span></div><Pill inv>401</Pill></div>
          </TCard>
          <TCard {...fold(1)} icon={<Layers size={17} />} title="Tenant isolation" body="Queries are scoped to the X-Tenant-ID header in the application layer, so one instance serves many tenants. Receipts carry the tenant_id.">
            <div className="gv-tenants">
              {['tenant_01', 'tenant_02'].map((t) => <div key={t} className="gv-float"><b>{t}</b><i /><i /><i /></div>)}
              <span className="gv-tenants__lock"><Lock size={18} /></span>
            </div>
            <Pill>tenant_id stamped on every receipt</Pill>
          </TCard>
          <TCard {...fold(2)} icon={<Database size={17} />} title="Runs in your Postgres" body="Self-hosted by default. Statewave runs next to your agent and keeps what it stores in your own Postgres.">
            <div className="gv-stair">
              <div className="gv-float gv-row"><LogoTile src={logo('claude')} /><div className="gv-stack"><b>Your agent</b><span className="gv-muted">SDK or REST</span></div></div>
              <div className="gv-float gv-float--accent gv-row"><LogoTile src="/favicon.svg" /><div className="gv-stack"><b>Statewave</b><span className="gv-muted">self-hosted</span></div></div>
              <div className="gv-float gv-row"><LogoTile src={logo('postgresql')} /><div className="gv-stack"><b>PostgreSQL</b><span className="gv-muted">your database</span></div></div>
            </div>
          </TCard>
        </div>
        <div className="gv-grid gv-grid--2">
          <TCard {...fold(3)} icon={<Globe size={17} />} title="Residency and retention" body="STATEWAVE_REGION is enforced in the application layer and, in multi-region mode, stamped on receipts. receipt_retention_days sets when old receipts are tombstoned, and 0 keeps them forever.">
            <div className="gv-pair">
              <div className="gv-float">
                <div className="gv-row"><Tile tone="card" size={28}><Globe size={15} /></Tile><div className="gv-stack"><b>STATEWAVE_REGION</b><span className="gv-muted">Enforced in the application layer</span></div></div>
                {['tenant_01', 'tenant_02'].map((t) => <div key={t} className="gv-region gv-row"><b className="pd-grow gv-medium">{t}</b><Pill>region</Pill></div>)}
                <span className="gv-muted">stamped on receipts</span>
              </div>
              <div className="gv-float">
                <div className="gv-row"><Tile tone="card" size={28}><Clock size={15} /></Tile><div className="gv-stack"><b>receipt_retention_days</b><span className="gv-muted">retention window</span></div></div>
                <div className="gv-ret">
                  <span className="gv-ret__l">tombstoned</span><span className="gv-ret__r">kept</span>
                  {Array.from({ length: 10 }, (_, i) => <i key={i} className={i > 3 ? 'is-on' : undefined} />)}
                </div>
                <span className="gv-muted">older receipts are tombstoned</span>
                <span>0 keeps receipts forever</span>
              </div>
            </div>
          </TCard>
          <TCard {...fold(4)} icon={<Trash2 size={17} />} title="Subject erasure" body="Deleting a subject removes its episodes, memories and derived records in one call. Receipts are append-only and leave through the retention window.">
            <div className="gv-float gv-erase">
              <div className="gv-row"><Tile tone="card" size={28}><Trash2 size={15} /></Tile><div className="gv-stack pd-grow"><b>Delete subject account:northwind</b><span className="gv-muted">DELETE /v1/subjects/{'{id}'}</span></div><Pill inv>one call</Pill></div>
              {[[<FileText size={15} />, 'Episodes', 'removed'], [<Brain size={15} />, 'Memories', 'removed'], [<ReceiptText size={15} />, 'Receipts', 'retention']].map(([icon, t, s]) => (
                <div key={t as string} className={`gv-erase__row gv-row${s === 'retention' ? ' is-kept' : ''}`}>{icon}<span>{t}</span><i /><Pill>{s}</Pill></div>
              ))}
            </div>
          </TCard>
        </div>
      </div>
    </section>
  )
}

const SCOPE: { icon: ReactNode; area: string; yes: string[]; no: string[] }[] = [
  { icon: <Tag size={17} />, area: 'Labels', yes: ['Operator-supplied sensitivity labels', 'Opt-in auto-label suggestions with operator promotion'], no: ['Recording who promoted a label'] },
  { icon: <FileCode size={17} />, area: 'Policy', yes: ['Deny and redact rules, first match wins'], no: ['Visual policy editor in the admin app', 'Regex predicates', 'Explicit allow rules'] },
  { icon: <ToggleLeft size={17} />, area: 'Mode', yes: ['log_only by default, enforce per tenant'], no: [] },
  { icon: <ReceiptText size={17} />, area: 'Receipts', yes: ['Receipts with SHA-256 hash and HMAC signing', 'Replay with the original policy on current memories', 'Tenant-controlled receipt retention'], no: ['KMS-backed or asymmetric receipt signing', 'Byte-for-byte historical replay', 'Cross-tenant receipt aggregation'] },
]

export function Scope() {
  const count = (k: 'yes' | 'no') => SCOPE.reduce((n, r) => n + r[k].length, 0)
  return (
    <section id="scope" className="pd-sec pd-sec--card" aria-labelledby="gv-scope">
      <div className="sw-wrap">
        <GHead id="gv-scope" a="What governance covers today" b="and what is not built yet" lede="See where each check stops before you plan a rollout." />
        <div className="gv-card gv-scope" role="table" aria-label="Governance coverage">
          <div className="gv-scope__row gv-scope__head" role="row">
            <span role="columnheader" className="gv-muted">Check</span>
            <span role="columnheader"><b>Covered today</b><Pill inv>{count('yes')} items</Pill></span>
            <span role="columnheader"><b>Not built yet</b><Pill>{count('no')} items</Pill></span>
          </div>
          {SCOPE.map((r) => (
            <div key={r.area} className="gv-scope__row" role="row">
              <span role="rowheader" className="gv-row"><Tile size={36}>{r.icon}</Tile><b>{r.area}</b></span>
              <ul role="cell" aria-label="Covered today">
                {r.yes.map((t) => <li key={t}><span className="gv-mark is-on"><Check size={11} /></span>{t}</li>)}
              </ul>
              <ul role="cell" aria-label="Not built yet" className="gv-scope__no">
                {r.no.length ? r.no.map((t) => <li key={t}><span className="gv-mark"><Minus size={11} /></span>{t}</li>) : <li className="gv-none">None listed</li>}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

