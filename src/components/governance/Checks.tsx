import type { ReactNode } from 'react'
import { AlignLeft, Bot, FileCode, FileText, Layers, ReceiptText, ShieldCheck, Tag, ToggleLeft, UserCheck } from 'lucide-react'
import { Tile } from '../product/ui'
import { useFold } from '../home/hooks'
import { FoldTitle, GHead, type Fold } from './ui'

function Check({ n, icon, title, body, wide, open, onToggle, children }: Fold & { n: string; icon: ReactNode; title: string; body: string; wide?: boolean; children: ReactNode }) {
  const panel = `gv-check-${n}`
  return (
    <article className={`gv-card gv-check${wide ? ' gv-check--wide' : ''}`} data-fold={open === undefined ? undefined : open ? 'open' : 'shut'}>
      <div className="gv-check__copy">
        <div className="gv-check__top"><Tile size={36}>{icon}</Tile><span>{n}</span></div>
        <h3><FoldTitle panel={panel} open={open} onToggle={onToggle}>{title}</FoldTitle></h3>
        <p>{body}</p>
      </div>
      <div id={panel} className="gv-well" aria-hidden="true" hidden={open === false}>{children}</div>
    </article>
  )
}

const Pill = ({ inv, children }: { inv?: boolean; children: ReactNode }) => <span className={`gv-pill${inv ? ' gv-pill--inv' : ''}`}>{children}</span>

export function Checks() {
  const fold = useFold()
  return (
    <section id="checks" className="pd-sec pd-sec--card" aria-labelledby="gv-checks">
      <div className="sw-wrap">
        <GHead id="gv-checks" a="Five checks run" b="on every context call"
          lede="Each check reads a field you control. Together they decide what reaches the agent and leave a record of why." />
        <div className="gv-flow" aria-hidden="true">
          <span className="gv-flow__end"><Tile tone="navy" size={26}><Bot size={14} /></Tile><b>Context call</b><span>support_agent asks about account:northwind</span></span>
          <i />
          <span className="gv-flow__end"><Tile tone="navy" size={26}><Layers size={14} /></Tile><b>Context bundle</b><span>ranked memories, filtered by policy</span></span>
        </div>
        <div className="gv-checks">
          <Check {...fold(0)} n="01" icon={<UserCheck size={17} />} title="Identity" body="Calls carry caller_id and caller_type. When a tenant requires identity, a call missing either one returns 401.">
            <div className="gv-float gv-id">
              <div className="gv-row"><Tile tone="card" size={28}><Bot size={15} /></Tile><div className="gv-stack"><b>support_agent</b><span className="gv-muted">Calling agent</span></div></div>
              <dl className="gv-mini">
                <div><dt>caller_id</dt><dd>support_agent</dd></div>
                <div><dt>caller_type</dt><dd>agent</dd></div>
              </dl>
            </div>
            <div className="gv-float gv-float--up gv-id__no">
              <div className="gv-row"><Pill inv>401</Pill><b>No caller id</b></div>
              <span className="gv-muted">Identity is required</span>
            </div>
          </Check>
          <Check {...fold(1)} n="02" icon={<Tag size={17} />} title="Labels" body="Only sensitivity labels an operator has promoted count toward policy.">
            <div className="gv-stagger">
              {[['Billing contact email', 'pii'], ['Admin API token', 'secret'], ['Plan renews on the 14th', 'none']].map(([t, l]) => (
                <div key={t} className="gv-float gv-row"><b className="pd-grow">{t}</b><Pill inv={l !== 'none'}>{l}</Pill></div>
              ))}
            </div>
          </Check>
          <Check {...fold(2)} n="03" icon={<FileCode size={17} />} title="Policy" body="Rules in the bundle run top to bottom and the first match wins.">
            <div className="gv-rules">
              <div className="gv-float gv-float--up gv-row"><Tile tone="card" size={28}><AlignLeft size={15} /></Tile><div className="gv-stack pd-grow"><b>deny-pii-for-marketing-tools</b><span className="gv-muted">First match wins</span></div><Pill inv>match</Pill></div>
              <div className="gv-rule gv-row" style={{ opacity: 0.75 }}><span className="pd-grow">redact-secrets-for-non-admin</span><Pill>skipped</Pill></div>
              <div className="gv-rule gv-row" style={{ opacity: 0.5 }}><span className="pd-grow">No rule matched</span><Pill>allow</Pill></div>
            </div>
          </Check>
          <Check wide {...fold(3)} n="04" icon={<ToggleLeft size={17} />} title="Mode" body="log_only records what would fire before anything is enforced.">
            <div className="gv-modes">
              <div className="gv-switch"><span className="is-on">log_only</span><span>enforce</span></div>
              {[['deny', 2], ['redact', 1]].map(([t, c]) => (
                <div key={t} className="gv-float gv-tally">
                  <div className="gv-row"><span className="pd-grow">Would {t}</span><Pill>{c}</Pill></div>
                  {Array.from({ length: +c }, (_, i) => <div key={i} className="gv-bar"><i /><b style={{ width: i ? '45%' : '65%' }} /></div>)}
                </div>
              ))}
            </div>
          </Check>
          <Check wide {...fold(4)} n="05" icon={<ReceiptText size={17} />} title="Receipt" body="The exact context delivered is hashed, signed when a key is configured, and replayable later.">
            <div className="gv-seal">
              <div className="gv-float gv-seal__card">
                <div className="gv-row"><Tile tone="card" size={28}><FileText size={15} /></Tile><div className="gv-stack"><b>Receipt</b><span className="gv-muted">Signed</span></div></div>
                <dl className="gv-mini gv-mini--stack">
                  <div><dt>receipt_id</dt><dd>01J9ZK4T…</dd></div>
                  <div><dt>context_hash</dt><dd>sha256:9f4c…</dd></div>
                </dl>
                <div className="gv-row gv-seal__sig"><ShieldCheck size={15} />HMAC-SHA256</div>
              </div>
              <div className="gv-seal__mark"><span><ShieldCheck size={30} /></span>Verified</div>
            </div>
          </Check>
        </div>
      </div>
    </section>
  )
}
