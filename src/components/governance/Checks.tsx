import type { ReactNode } from 'react'
import { AlignLeft, Bot, Check as Tick, FileCode, FileText, Layers, ReceiptText, ShieldCheck, Tag, ToggleLeft, UserCheck } from 'lucide-react'
import { Tile } from '../product/ui'
import { useFold } from '../home/hooks'
import { FoldTitle, GHead, type Fold } from './ui'

function Check({ n, q, icon, title, body, result, wide, open, onToggle, children }: Fold & { n: string; q: string; icon: ReactNode; title: string; body: string; result: string; wide?: boolean; children: ReactNode }) {
  const panel = `gv-check-${n}`
  return (
    <article className={`gv-card gv-check${wide ? ' gv-check--wide' : ''}`} data-fold={open === undefined ? undefined : open ? 'open' : 'shut'}>
      <div className="gv-check__copy">
        <div className="gv-check__top"><Tile size={36}>{icon}</Tile><span>{n} · {q}</span></div>
        <h3><FoldTitle panel={panel} open={open} onToggle={onToggle}>{title}</FoldTitle></h3>
        <p>{body}</p>
        <span className="gv-check__result"><Tick size={13} aria-hidden="true" />{result}</span>
      </div>
      <div id={panel} className="gv-well" aria-hidden="true" hidden={open === false}>{children}</div>
    </article>
  )
}

const Pill = ({ inv, children }: { inv?: boolean; children: ReactNode }) => <span className={`gv-pill${inv ? ' gv-pill--inv' : ''}`}>{children}</span>

const OUTCOME = [
  ['Plan renews on the 14th', 'Delivered', ''],
  ['Billing contact email', 'Removed before scoring', 'is-out'],
  ['Admin API token', '[REDACTED by policy]', 'is-red'],
  ['Renewal discussed on 2 Sep', 'Delivered', ''],
] as const

export function Checks() {
  const fold = useFold()
  return (
    <section id="checks" className="pd-sec pd-sec--card" aria-labelledby="gv-checks">
      <div className="sw-wrap">
        <GHead id="gv-checks" a="Follow one call" b="through all five checks"
          lede="marketing_tool asks Statewave about account:northwind and four memories match. Here is what happens before any of them reach the agent." />
        <div className="gv-flow" aria-hidden="true">
          <span className="gv-flow__end"><Tile tone="navy" size={26}><Bot size={14} /></Tile><b>Context call</b><span>marketing_tool asks about account:northwind</span></span>
          <i />
          <span className="gv-flow__end"><Tile tone="navy" size={26}><Layers size={14} /></Tile><b>Context bundle</b><span>3 memories, 1 of them redacted</span></span>
        </div>
        <div className="gv-checks">
          <Check {...fold(0)} n="01" q="Who is asking?" icon={<UserCheck size={17} />} title="Identity" result="marketing_tool, identified" body="Every call names its caller with caller_id and caller_type. When a tenant requires identity, a call missing either one gets a 401.">
            <div className="gv-float gv-id">
              <div className="gv-row"><Tile tone="card" size={28}><Bot size={15} /></Tile><div className="gv-stack"><b>marketing_tool</b><span className="gv-muted">Calling tool</span></div></div>
              <dl className="gv-mini">
                <div><dt>caller_id</dt><dd>campaigns-bot</dd></div>
                <div><dt>caller_type</dt><dd>marketing_tool</dd></div>
              </dl>
            </div>
            <div className="gv-float gv-float--up gv-id__no">
              <div className="gv-row"><Pill inv>401</Pill><b>No caller id</b></div>
              <span className="gv-muted">Identity is required</span>
            </div>
          </Check>
          <Check {...fold(1)} n="02" q="What is sensitive?" icon={<Tag size={17} />} title="Labels" result="2 of the 4 memories are labelled" body="Memories carry sensitivity labels such as pii.email or secret. A detector’s suggestion counts only once an operator promotes it.">
            <div className="gv-stagger">
              {[['Billing contact email', 'pii.email'], ['Admin API token', 'secret'], ['Plan renews on the 14th', 'none'], ['Renewal discussed on 2 Sep', 'none']].map(([t, l]) => (
                <div key={t} className="gv-float gv-row"><b className="pd-grow">{t}</b><Pill inv={l !== 'none'}>{l}</Pill></div>
              ))}
            </div>
          </Check>
          <Check {...fold(2)} n="03" q="What is allowed?" icon={<FileCode size={17} />} title="Policy" result="1 memory denied, 1 redacted" body="Your rules run top to bottom against each memory and the first match wins: deny it or redact it.">
            <div className="gv-rules">
              <div className="gv-float gv-float--up gv-row"><Tile tone="card" size={28}><AlignLeft size={15} /></Tile><div className="gv-stack pd-grow"><b>deny-pii-for-marketing-tools</b><span className="gv-muted">First match wins</span></div><Pill inv>match</Pill></div>
              <div className="gv-rule gv-row" style={{ opacity: 0.75 }}><span className="pd-grow">redact-secrets-for-non-admin</span><Pill>skipped</Pill></div>
              <div className="gv-rule gv-row" style={{ opacity: 0.5 }}><span className="pd-grow">No rule matched</span><Pill>allow</Pill></div>
            </div>
          </Check>
          <Check wide {...fold(3)} n="04" q="Is it switched on?" icon={<ToggleLeft size={17} />} title="Mode" result="enforce, so the rules apply" body="In log_only the rules are only written to the receipt and every memory still goes out. This tenant is on enforce.">
            <div className="gv-modes">
              <div className="gv-switch"><span>log_only</span><span className="is-on">enforce</span></div>
              {[['Denied', 'Billing contact email'], ['Redacted', 'Admin API token']].map(([t, m]) => (
                <div key={t} className="gv-float gv-tally">
                  <div className="gv-row"><span className="pd-grow">{t}</span><Pill inv>1</Pill></div>
                  <div className="gv-tally__item"><b>{m}</b></div>
                </div>
              ))}
            </div>
          </Check>
          <Check wide {...fold(4)} n="05" q="Can you prove it?" icon={<ReceiptText size={17} />} title="Receipt" result="receipt 01J9ZM2D… saved" body="Ask for a receipt and Statewave saves the exact context delivered, hashed, signed when a key is configured, and replayable later.">
            <div className="gv-seal">
              <div className="gv-float gv-seal__card">
                <div className="gv-row"><Tile tone="card" size={28}><FileText size={15} /></Tile><div className="gv-stack"><b>Receipt</b><span className="gv-muted">Signed</span></div></div>
                <dl className="gv-mini gv-mini--stack">
                  <div><dt>receipt_id</dt><dd>01J9ZM2D…</dd></div>
                  <div><dt>context_hash</dt><dd>9f4c…</dd></div>
                </dl>
                <div className="gv-row gv-seal__sig"><ShieldCheck size={15} />HMAC-SHA256</div>
              </div>
              <div className="gv-seal__mark"><span><ShieldCheck size={30} /></span>Verified</div>
            </div>
          </Check>
        </div>
        <div className="gv-card gv-outcome">
          <b className="gv-outcome__title">What the agent gets</b>
          <ul>
            {OUTCOME.map(([m, r, cls]) => <li key={m} className={cls}><span>{m}</span><b>{r}</b></li>)}
          </ul>
        </div>
      </div>
    </section>
  )
}
