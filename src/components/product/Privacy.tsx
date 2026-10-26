import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Bot, Cloud, Cpu, Database, DollarSign, Eye, FileCode, KeyRound, List, Lock, Search, Sparkles, Split, Tag, User } from 'lucide-react'
import { Head, Pill, Seg, SnapDots, Tile } from './ui'
import type { Tone } from './ui'

const GOVERNANCE = 'https://github.com/smaramwbc/statewave-docs/blob/main/sensitivity-labels.md'

function Box({ icon, title, body, tone, children, className = '', id }: { icon: ReactNode; title: string; body: string; tone?: 'dark'; children: ReactNode; className?: string; id?: string }) {
  return (
    <article id={id} className={`pd-box${tone ? ' pd-box--dark' : ''} ${className}`}>
      <Tile size={44} tone={tone ? 'inv' : 'tint'}>{icon}</Tile>
      <h3>{title}</h3>
      <p>{body}</p>
      {children}
    </article>
  )
}

function Layer({ icon, name, sub, out }: { icon: ReactNode; name: string; sub: string; out?: boolean }) {
  return (
    <div className={`pd-layer${out ? ' pd-layer--out' : ''}`}>
      <Tile tone="card" size={34}>{icon}</Tile>
      <div><b>{name}</b><span>{sub}</span></div>
    </div>
  )
}

function Switches() {
  const [on, setOn] = useState([true, true, false, false])
  const items = [
    [<Cpu size={16} />, 'Heuristic compiler'],
    [<Sparkles size={16} />, 'Self-hosted embeddings'],
    [<Cloud size={16} />, 'External LLM provider'],
    [<Search size={16} />, 'Text-only retrieval fallback'],
  ] as const
  return (
    <div className="pd-switches">
      {items.map(([icon, label], i) => (
        <div key={label} className="pd-switch">
          <span aria-hidden="true">{icon}</span>
          <span className="pd-grow">{label}</span>
          <button type="button" role="switch" aria-checked={on[i]} aria-label={label} onClick={() => setOn(on.map((v, j) => (j === i ? !v : v)))} />
        </div>
      ))}
    </div>
  )
}

/** Line tints follow the design: rule heads blue, their scopes muted, the mode green. */
const POLICY = [
  ['version: 1', ''], ['rules:', ''],
  ['  - id: deny-secrets-for-research-agent', 'k'], ['    when:', ''],
  ['      memory_has_any_label: [secret]', 'm'], ['      caller_type: research-agent', 'm'],
  ['    action: deny', 'g'],
  ['  - id: redact-pii', 'k'], ['    when:', ''],
  ['      memory_has_any_label: [pii]', 'm'],
  ['    action: redact', 'g'],
] as const

const MODES = [{ id: 'log', text: 'Log-only' }, { id: 'enforce', text: 'Enforce' }] as const

function PolicyMode() {
  const [m, setM] = useState<'log' | 'enforce'>('log')
  const e = m === 'enforce'
  const rows: [string, string, Tone, string][] = [
    ['Admin API token', 'research-agent', e ? 'bad' : 'warn', e ? 'Denied' : 'Would deny'],
    ['Billing contact email', 'support-agent', e ? 'accent' : 'warn', e ? 'Redacted' : 'Would redact'],
    ['Plan renews on the 14th', 'support-agent', 'ok', 'Allowed'],
  ]
  return (
    <>
      <Seg label="Policy mode" options={MODES} value={m} onChange={setM} />
      <ul className="pd-list">
        {rows.map(([name, who, tone, verdict]) => (
          <li key={name}><Tile size={32}><Bot size={15} /></Tile><div><b>{name}</b><span>{who}</span></div><Pill tone={tone}>{verdict}</Pill></li>
        ))}
      </ul>
    </>
  )
}

export function Privacy() {
  const bento = useRef<HTMLDivElement>(null)
  return (
    <section id="privacy" className="pd-sec pd-sec--card" aria-label="Privacy and data flow">
      <div className="sw-wrap">
        <Head
          title="Your data stays in your network by default"
          lede="Everything lives in your Postgres, with no telemetry path back to us. Policies decide what each caller sees."
          more={{ to: GOVERNANCE, label: 'How Statewave governs memory' }}
        />
        <div ref={bento} className="pd-bento">
          <Box className="pd-bento__wide" icon={<Split size={22} />} title="What can leave, layer by layer" body="Storage, retrieval and the default compiler run on your infrastructure. Data only leaves if you plug in an outside model.">
            <div className="pd-flow">
              <div className="pd-infra">
                <div className="pd-row"><b className="pd-accent pd-grow">Your infrastructure</b><Pill tone="ok">Nothing leaves</Pill></div>
                <Layer icon={<Database size={17} />} name="Postgres + pgvector" sub="Storage" />
                <Layer icon={<List size={17} />} name="Retrieval and ranking" sub="Local and deterministic" />
                <Layer icon={<Cpu size={17} />} name="Heuristic compiler" sub="The default" />
              </div>
              <div className="pd-out">
                <div className="pd-out__item pd-out__item--leaves"><span className="pd-out__lbl">Episode batches →</span><Layer out icon={<Cloud size={17} />} name="LLM compiler" sub="Optional, via LiteLLM" /></div>
                <div className="pd-out__item pd-out__item--leaves"><span className="pd-out__lbl">Text to embed →</span><Layer out icon={<Sparkles size={17} />} name="Embeddings" sub="Optional. Self-host to keep local" /></div>
                <div className="pd-out__item"><span className="pd-muted">Governed by your agent</span><Layer icon={<Bot size={17} />} name="Your agent’s LLM" sub="Wherever you host it" /></div>
              </div>
            </div>
          </Box>
          <Box tone="dark" icon={<Lock size={22} />} title="Fully local mode" body="The heuristic compiler plus a self-hosted embedding model, or text-only retrieval, means no Statewave-driven traffic leaves your network.">
            <Switches />
          </Box>
          <Box icon={<Tag size={22} />} title="Sensitivity labels" body="pii, financial and secret. Suggested at compile time, promoted by an operator." id="audit-governance">
            <ul className="pd-list">
              {([[<User size={15} />, 'Billing contact email', 'Suggested at compile time', 'pii'], [<DollarSign size={15} />, 'Annual contract value', 'Promoted by an operator', 'financial'], [<KeyRound size={15} />, 'Admin API token', 'Promoted by an operator', 'secret']] as const).map(([icon, name, sub, label]) => (
                <li key={label}><Tile size={32}>{icon}</Tile><div><b>{name}</b><span>{sub}</span></div><Pill tone="accent">{label}</Pill></li>
              ))}
            </ul>
          </Box>
          <Box icon={<FileCode size={22} />} title="Declarative policies" body="YAML or JSON rules that deny or redact by label and caller type.">
            <pre className="pd-policy"><code>{POLICY.map(([l, c], i) => <span key={i} className={c && `pd-policy--${c}`}>{l}{'\n'}</span>)}</code></pre>
          </Box>
          <Box icon={<Eye size={22} />} title="Log-only, then enforce" body="Audit what a policy would do before you switch it on.">
            <PolicyMode />
          </Box>
        </div>
        <SnapDots of={bento} />
      </div>
    </section>
  )
}
