import { useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowDown, Ban, Check, Eye, File, FileCode, Minus, Scan, ScanLine, Tag, UserCheck } from 'lucide-react'
import { H2 } from '../home/ui'
import { Seg, Tile } from '../product/ui'
import { useFold } from '../home/hooks'
import { FoldTitle, GHead, Step, type Fold } from './ui'

const Pill = ({ inv, mono, children }: { inv?: boolean; mono?: boolean; children: ReactNode }) =>
  <span className={`gv-pill${inv ? ' gv-pill--inv' : ''}${mono ? ' gv-mono' : ''}`}>{children}</span>

function MiniCard({ id, icon, title, open, onToggle, children }: Fold & { id: string; icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="gv-card gv-mini-card" data-fold={open === undefined ? undefined : open ? 'open' : 'shut'}>
      <div className="gv-row gv-mini-card__head"><Tile size={32}>{icon}</Tile><b className="pd-grow"><FoldTitle panel={id} open={open} onToggle={onToggle}>{title}</FoldTitle></b></div>
      <div id={id} className="gv-mini-card__body" hidden={open === false}>{children}</div>
    </div>
  )
}

function Pointer({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <li className="gv-pointer">
      <Tile size={36}>{icon}</Tile>
      <div><b>{title}</b><p>{body}</p></div>
    </li>
  )
}

const STAGES = [
  { t: 'Compiled', d: 'Default-allow until labelled', pill: 'no label', meta: 'sensitivity_labels: []' },
  { t: 'Suggested', d: 'Detector match, advisory only', pill: 'suggested: pii.email', meta: 'suggested_labels' },
  { t: 'Promoted', d: 'An operator promotes it, recorded on the memory', pill: 'pii.email', meta: 'POST …/promote-labels', on: true },
  { t: 'Read by policy', d: 'Matched by deny-pii-for-marketing-tools', pill: 'deny', meta: 'policy.filters_applied', on: true, last: true },
]

export function Labels() {
  return (
    <section id="labels" className="pd-sec pd-sec--panel" aria-labelledby="gv-labels">
      <div className="sw-wrap">
        <div className="gv-split">
          <div className="gv-split__copy">
            <Step n={2} q="What is sensitive?" />
            <H2 id="gv-labels" a="Labels get promoted" b="before policy reads them" />
            <p className="pd-lede">Labels are tags on each memory. Detectors can suggest them at compile time, and a suggestion does nothing until an operator promotes it.</p>
            <ul className="gv-pointers">
              <Pointer icon={<ScanLine size={17} />} title="Detectors suggest at compile time" body="When turned on, they flag emails, phone numbers, card numbers that pass a Luhn check and secret tokens" />
              <Pointer icon={<Eye size={17} />} title="Suggestions stay advisory" body="The policy evaluator ignores a suggested label until it is promoted" />
              <Pointer icon={<UserCheck size={17} />} title="Operators promote them" body="Each promotion is recorded on the memory it applies to" />
            </ul>
          </div>
          <div className="gv-bento">
            <div className="gv-card gv-panel">
              <div className="gv-panel__head">
                <Tile size={34}><File size={16} /></Tile>
                <div className="gv-stack pd-grow"><b>Billing contact email</b><span className="gv-muted">Memory on account:northwind</span></div>
                <Pill>4 stages</Pill>
              </div>
              <ol className="gv-timeline">
                {STAGES.map((s) => (
                  <li key={s.t} className={s.on ? 'is-on' : undefined}>
                    <span className="gv-timeline__rail" aria-hidden="true"><i /></span>
                    <div className={`gv-stage${s.last ? ' gv-stage--active' : ''}`}>
                      <div className="gv-stack pd-grow"><b>{s.t}</b><span>{s.d}</span></div>
                      <div className="gv-stage__meta"><Pill inv={s.on}>{s.pill}</Pill><code>{s.meta}</code></div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

type L = [string, string?]
const YAML: { l: L; hit?: boolean; note?: string }[] = [
  { l: ['version:', ' 1'] },
  { l: ['rules:'] },
  { l: ['  - id:', ' deny-pii-for-marketing-tools'], hit: true, note: 'Billing contact email · deny' },
  { l: ['    when:'], hit: true },
  { l: ['      memory_has_any_label:', ' [pii, pii.email]'], hit: true },
  { l: ['      caller_type:', ' marketing_tool'], hit: true },
  { l: ['    action:', ' deny'], hit: true },
  { l: [''] },
  { l: ['  - id:', ' redact-secrets-for-non-admin'] },
  { l: ['    when:'] },
  { l: ['      memory_has_any_label:', ' [secret]'] },
  { l: ['      caller_type_not_in:', ' [admin, security]'] },
  { l: ['    action:', ' redact'] },
]

const GATES = [
  { k: 'caller_type_in', pass: ['admin', 'security'] },
  { k: 'caller_type_not_in', pass: ['marketing_tool'] },
]

export function PolicySection() {
  const fold = useFold()
  return (
    <section id="policy" className="pd-sec pd-sec--card" aria-labelledby="gv-policy">
      <div className="sw-wrap">
        <GHead id="gv-policy" step={<Step n={3} q="What is allowed?" />} a="Policy is a YAML bundle" b="where the first match wins"
          lede="A bundle is a content-hashed list of rules. Each rule has an id, a when block and an action, and a memory that matches no rule is allowed." />
        <div className="gv-grid gv-grid--policy">
          <div className="gv-card gv-editor">
            <div className="gv-panel__head gv-panel__head--sm">
              <FileCode size={16} className="gv-muted" /><b className="pd-grow gv-medium">policy-bundle.yaml</b>
              <Pill>content-hashed</Pill><Pill inv>version 1</Pill>
            </div>
            <pre className="gv-code">
              {YAML.map((r, i) => (
                <span key={i} className={r.hit ? 'is-hit' : undefined}>
                  <i aria-hidden="true">{i + 1}</i>
                  <code>{r.l[0]}{r.l[1] && <em>{r.l[1]}</em>}</code>
                  {r.note && <Pill inv>{r.note}</Pill>}
                </span>
              ))}
            </pre>
          </div>
          <div className="gv-card gv-eval">
            <b className="gv-eval__title">How a bundle evaluates</b>
            <ul className="gv-pointers gv-pointers--sm">
              <Pointer icon={<ArrowDown size={17} />} title="Rules run top to bottom" body="The first rule that matches decides the action" />
              <Pointer icon={<Scan size={17} />} title="One when block is an AND" body="Every predicate inside it must hold" />
              <Pointer icon={<Check size={17} />} title="No match means allow" body="A memory outside every rule is delivered" />
            </ul>
            <div className="gv-trace">
              <div className="gv-row"><b className="pd-grow">Trace · Admin API token</b><code className="gv-muted">caller: marketing_tool</code></div>
              <div className="gv-trace__row"><span className="pd-grow">1&nbsp;&nbsp;deny-pii-for-marketing-tools</span><span>no match</span></div>
              <div className="gv-trace__row is-hit"><span className="pd-grow">2&nbsp;&nbsp;redact-secrets-for-non-admin</span><Pill inv>redact</Pill></div>
            </div>
          </div>
        </div>
        <div className="gv-grid gv-grid--3">
          <MiniCard {...fold(0)} id="gv-pred-label" icon={<Tag size={15} />} title="Label predicates">
            <div className="gv-venns" aria-hidden="true">
              <figure>
                <svg viewBox="0 0 150 104" width="150" height="104"><circle cx="43" cy="53" r="42" /><circle cx="103" cy="53" r="42" /><path className="gv-venn__hit" d="M73 23.4a42 42 0 0 1 0 59.2a42 42 0 0 1 0-59.2z" /><text x="12" y="57">Memory</text><text x="93" y="57">Rule list</text></svg>
                <code>memory_has_any_label</code><figcaption>Labels overlap the list</figcaption>
              </figure>
              <figure>
                <svg viewBox="0 0 150 104" width="150" height="104"><circle cx="72" cy="52" r="49" /><circle className="gv-venn__hit" cx="74" cy="60" r="21" /><text x="52" y="24">Memory</text><text x="62" y="64" className="gv-venn__ink">Rule</text></svg>
                <code>memory_has_all_labels</code><figcaption>Every label is present</figcaption>
              </figure>
            </div>
            <p className="gv-foot">Predicates inside one when block combine with AND</p>
          </MiniCard>
          <MiniCard {...fold(1)} id="gv-pred-caller" icon={<UserCheck size={15} />} title="Caller predicates">
            <div className="gv-gates">
              {GATES.map((g) => (
                <div key={g.k} className="gv-gate">
                  <code>{g.k}<span>[admin, security]</span></code>
                  <ul>
                    {['admin', 'security', 'marketing_tool'].map((c) => {
                      const ok = g.pass.includes(c)
                      return <li key={c} className={ok ? 'is-on' : undefined}><span className="gv-mark">{ok ? <Check size={11} /> : <Minus size={11} />}</span>{c}</li>
                    })}
                  </ul>
                </div>
              ))}
            </div>
            <p className="gv-foot">caller_type and caller_id match exactly</p>
          </MiniCard>
          <MiniCard {...fold(2)} id="gv-actions" icon={<Ban size={15} />} title="Two actions">
            <div className="gv-action">
              <div className="gv-row"><b className="pd-grow">Billing contact email</b><Pill inv mono>deny</Pill></div>
              <span>Excluded from selected_entries</span>
            </div>
            <div className="gv-action">
              <div className="gv-row"><b className="pd-grow">Admin API token</b><Pill inv mono>redact</Pill></div>
              <code>[REDACTED by policy]</code>
            </div>
          </MiniCard>
        </div>
      </div>
    </section>
  )
}

const MODES = [{ id: 'log_only', text: 'log_only' }, { id: 'enforce', text: 'enforce' }] as const
const CALL = [
  { m: 'Plan renews on the 14th', l: 'none' },
  { m: 'Billing contact email', l: 'pii.email', act: 'deny' },
  { m: 'Admin API token', l: 'secret', act: 'redact' },
  { m: 'Renewal discussed on 2 Sep', l: 'none' },
]
const STEPS = [
  ['Upload the bundle', 'POST /admin/policy/bundles'],
  ['Activate it', 'POST /admin/policy/activate'],
  ['Read the receipts', 'policy.filters_applied'],
  ['Switch to enforce', 'policy_mode: enforce'],
]

export function Rollout() {
  const [mode, setMode] = useState<(typeof MODES)[number]['id']>('enforce')
  const enforce = mode === 'enforce'
  return (
    <section id="rollout" className="pd-sec pd-sec--panel" aria-labelledby="gv-rollout">
      <div className="sw-wrap">
        <div className="gv-split gv-split--rev">
          <div className="gv-bento">
            <div className="gv-card gv-panel">
              <div className="gv-panel__head">
                <div className="gv-stack pd-grow"><b>Same call, two modes</b><span className="gv-muted">marketing_tool asks about account:northwind</span></div>
                <Seg label="Policy mode" options={MODES} value={mode} onChange={setMode} />
              </div>
              <div className="gv-table-wrap">
                <table className="gv-table" data-mode={mode}>
                  <thead><tr><th>Memory</th><th>Label</th><th className="gv-mono">log_only</th><th className="gv-mono">enforce</th></tr></thead>
                  <tbody>
                    {CALL.map((r) => (
                      <tr key={r.m}>
                        <td><b className="gv-medium">{r.m}</b></td>
                        <td><Pill inv={r.l !== 'none'}>{r.l}</Pill></td>
                        <td><span className="gv-row">Delivered{r.act && <Pill>would {r.act}</Pill>}</span></td>
                        <td>{r.act === 'deny' ? <Pill inv>Removed before scoring</Pill> : r.act === 'redact' ? <code className="gv-ink">[REDACTED by policy]</code> : 'Delivered'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="gv-notes">
                <div className={enforce ? undefined : 'is-on'}><b>In log_only</b><p>All four memories reach the agent, and the receipt lists what enforcement would have done</p></div>
                <div className={enforce ? 'is-on' : undefined}><b>In enforce</b><p>Denied memories are removed before scoring, so they never enter ranking</p></div>
              </div>
            </div>
          </div>
          <div className="gv-split__copy">
            <Step n={4} q="Is it switched on?" />
            <H2 id="gv-rollout" a="Ship in log_only first" b="then enforce per tenant" />
            <p className="pd-lede">log_only writes what each rule would do to the receipt but changes no answer. Read those receipts, then switch policy_mode to enforce when the results look right.</p>
            <ol className="gv-card gv-steps">
              {STEPS.map(([t, c], i) => (
                <li key={t}><span className="gv-steps__n">{i + 1}</span><b className="pd-grow">{t}</b><code>{c}</code></li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
