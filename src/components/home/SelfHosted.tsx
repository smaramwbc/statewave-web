import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'
import { Eyebrow, H2, Icon, Ln } from './ui'
import { useCopy } from './hooks'
import { DOCS, DOCS_REPO, EXAMPLES, GITHUB } from './links'
import './home-a.css'

const CODE = [
  { lang: 'Python', icon: 'python', size: 14, text: `from statewave import StatewaveClient

with StatewaveClient("http://localhost:8100") as sw:
    sw.create_episode(
        subject_id="account:northwind",
        source="chat",
        type="conversation",
        payload={"messages": [
            {"role": "user", "content": "We moved our renewal to the 14th."},
        ]},
    )
    sw.compile_memories("account:northwind")

    bundle = sw.get_context(
        subject_id="account:northwind",
        task="When does our plan renew?",
        max_tokens=2000,
        emit_receipt=True,
    )
    print(bundle.assembled_context)
    print(bundle.receipt_id)` },
  { lang: 'TypeScript', icon: 'typescript', size: 13, text: `import { StatewaveClient } from "@statewavedev/sdk";

const sw = new StatewaveClient("http://localhost:8100");

await sw.createEpisode({
  subjectId: "account:northwind",
  source: "chat",
  type: "conversation",
  payload: { messages: [{ role: "user", content: "We moved our renewal to the 14th." }] },
});
await sw.compileMemories("account:northwind");

const bundle = await sw.getContext({
  subjectId: "account:northwind",
  task: "When does our plan renew?",
  maxTokens: 2000,
  emitReceipt: true,
});
console.log(bundle);` },
  { lang: 'curl', icon: 'curl', size: 15, text: `curl -X POST http://localhost:8100/v1/episodes \\
  -H "Content-Type: application/json" \\
  -d '{"subject_id": "account:northwind", "source": "chat", "type": "conversation", "payload": {"messages": [{"role": "user", "content": "We moved our renewal to the 14th."}]}}'

curl -X POST http://localhost:8100/v1/memories/compile \\
  -H "Content-Type: application/json" \\
  -d '{"subject_id": "account:northwind"}'

curl -X POST http://localhost:8100/v1/context \\
  -H "Content-Type: application/json" \\
  -d '{"subject_id": "account:northwind", "task": "When does our plan renew?", "max_tokens": 2000, "emit_receipt": true}'` },
] as const

const INSTALLS = [
  { cmd: 'npx @statewavedev/statewave', icon: 'npm', w: 22 },
  { cmd: 'curl -fsSL https://www.statewave.ai/install | sh', icon: 'curl', w: 16 },
  { cmd: 'docker compose up -d', icon: 'docker', w: 20 },
] as const

/** Tiny highlighter: comments, strings, keywords, flags, numbers, calls. */
const TOKEN = /(#[^\n]*|\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\]|\\.)*')|\b(from|import|with|as|const|await|new|True|true|curl)\b|(-[XHd])(?=\s)|\b(\d+)\b|([A-Za-z_]\w*)(?=\()/g
function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  for (const m of code.matchAll(TOKEN)) {
    const at = m.index ?? 0
    if (at > last) out.push(code.slice(last, at))
    const cls = m[1] ? 'c' : m[2] ? 's' : m[3] ? 'k' : m[4] || m[5] ? 'n' : 'f'
    out.push(<span key={at} className={`sw-tk--${cls}`}>{m[0]}</span>)
    last = at + m[0].length
  }
  if (last < code.length) out.push(code.slice(last))
  return out
}

function CopyBtn({ text, className, label = 'Copy command' }: { text: string; className?: string; label?: string }) {
  const [done, copy] = useCopy(text)
  return <button type="button" className={className} aria-label={done ? 'Copied' : label} title={done ? 'Copied' : 'Copy'} onClick={copy}>{done ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}</button>
}

function Resource({ icon, title, body, children }: { icon: ReactNode; title: string; body: string; children?: ReactNode }) {
  return (
    <div className="sw-card sw-res">
      <span className="sw-res__icon">{icon}</span>
      <div className="sw-res__title">{title}</div>
      <p>{body}</p>
      {children}
    </div>
  )
}
const svg = (d: string) => (
  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" className="sw-res__svg"><path d={d} /></svg>
)

export function SelfHosted() {
  const [tab, setTab] = useState(0)
  const tokens = useMemo(() => highlight(CODE[tab].text), [tab])
  const [copied, copy] = useCopy(CODE[tab].text)

  return (
    <section id="run" className="sw-section sw-section--tint" aria-label="Self-hosted">
      <div className="sw-wrap">
        <Eyebrow>Self-hosted</Eyebrow>
        <H2 a="Self-hosted on Postgres." b="Runs next to your agent." />
        <p className="sw-lede">
          Statewave sits between your agent and your Postgres, with no telemetry path back to us. What leaves your
          network depends on the compiler you choose; the default one is fully local.{' '}
          <Ln to="/product#privacy" className="sw-lede__link">See the data flow →</Ln>
        </p>

        <div className="sw-run-grid">
          <div className="sw-boundary">
            <span className="sw-mono sw-boundary__tag">
              Your infrastructure
            </span>
            <div className="sw-boundary__col">
              <div className="sw-node">
                <span className="sw-node__icons"><Icon name="python" size={16} /><Icon name="typescript" size={15} /></span>
                <span className="sw-node__grow">Your agent</span>
                <span className="sw-node__sub">SDK or REST</span>
              </div>
              <span aria-hidden="true" className="sw-wire sw-wire--down" />
              <div className="sw-node sw-node--hot">
                <img src="/brand/icon.svg" alt="" width={26} height={26} className="sw-node__img" />
                <span className="sw-node__grow">Statewave</span>
                <span className="sw-mono sw-node__port"><Icon name="docker" w={18} h={14} />:8100</span>
              </div>
              <span aria-hidden="true" className="sw-wire sw-wire--up" />
              <div className="sw-node">
                <span className="sw-node__icon"><Icon name="postgresql" size={18} /></span>
                <span className="sw-node__grow">PostgreSQL</span>
                <span className="sw-node__sub sw-node__sub--nw">+ pgvector</span>
              </div>
            </div>
            <div className="sw-boundary__llm">
              <div>
                <span><Icon name="openai" size={14} />Your LLM provider</span>
                <span>your key, optional: the default compiler runs fully local</span>
              </div>
            </div>
          </div>

          <div className="sw-code">
            <div className="sw-code__tabs">
              <div role="group" aria-label="Language" className="sw-code__langs">
                {CODE.map((c, i) => (
                  <button key={c.lang} type="button" className="sw-code__tab" aria-pressed={tab === i} onClick={() => setTab(i)}>
                    <Icon name={c.icon} size={c.size} />{c.lang}
                  </button>
                ))}
              </div>
              <button type="button" className="sw-copy-btn" aria-label={copied ? 'Copied' : 'Copy code'} title={copied ? 'Copied' : 'Copy'} onClick={copy}>{copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}</button>
            </div>
            <pre><code>{tokens}</code></pre>
          </div>
        </div>

        <div className="sw-install-grid">
          {INSTALLS.map((i) => (
            <div key={i.cmd} className="sw-install">
              <span aria-hidden="true" className="sw-icon" style={{ width: i.w, ['--m' as string]: `url(/images/home/v8/logos/${i.icon}.svg)` }} />
              <code>{i.cmd}</code>
              <CopyBtn text={i.cmd} className="sw-copy-btn" />
            </div>
          ))}
        </div>
        <div className="sw-mono sw-reqs">
          {['PostgreSQL 14+ with pgvector ≥ 0.4.2', 'Python 3.11+', 'CPU-only, no GPU', 'Docker image linux/amd64 + arm64', 'Docker Compose, Helm, Fly.io or Railway'].map((t, i) => (
            <span key={t}>{i > 0 && <span aria-hidden="true" className="sw-reqs__dot">·</span>}{t}</span>
          ))}
        </div>

        <h3 className="sw-h3 sw-h3--res">Everything to build with Statewave</h3>
        <div className="sw-res-grid">
          <Resource icon={svg('M6 4l10 6-10 6z')} title="Getting started" body="Clone, run and ingest your first episode in about five minutes.">
            <Ln to={DOCS} className="sw-res__link">Read the quickstart →</Ln>
          </Resource>
          <Resource icon={svg('M7 3H6a2 2 0 0 0-2 2v3l-2 2 2 2v3a2 2 0 0 0 2 2h1M13 3h1a2 2 0 0 1 2 2v3l2 2-2 2v3a2 2 0 0 1-2 2h-1')} title="API v1 contract" body="Every endpoint, the scoring model and webhook specs.">
            <Ln to={DOCS_REPO} className="sw-res__link">API reference →</Ln>
          </Resource>
          <Resource icon={<Icon name="python" size={20} />} title="Python SDK" body="Sync and async clients, Pydantic models, retry with backoff.">
            <div className="sw-res__cmd"><code>pip install statewave</code><CopyBtn text="pip install statewave" label="Copy pip install statewave" /></div>
          </Resource>
          <Resource icon={<Icon name="typescript" size={18} />} title="TypeScript SDK" body="Fetch-based client with full type definitions.">
            <div className="sw-res__cmd"><code>npm install @statewavedev/sdk</code><CopyBtn text="npm install @statewavedev/sdk" label="Copy npm install @statewavedev/sdk" /></div>
          </Resource>
          <Resource icon={<Icon name="github" size={20} />} title="Examples" body="Support agent, coding agent, LLM loop, eval suite, plus LangChain, CrewAI and AutoGen quickstarts.">
            <Ln to={EXAMPLES} className="sw-res__link">statewave-examples →</Ln>
          </Resource>
          <Resource icon={svg('M2.5 3.5h15v13h-15zM2.5 7.5h15M7 7.5v9')} title="Admin console" body="Operator console for subjects, memories, labels and receipts. Ships with the quickstart." />
          <Resource icon={svg('M5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM15 13a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 5h5a3 3 0 0 1 0 6H8a3 3 0 0 0 0 6h5')} title="OpenRouter proxy" body="Give OpenRouter calls persistent memory: change the base URL, add one header.">
            <Ln to={DOCS_REPO} className="sw-res__link">OpenRouter proxy →</Ln>
          </Resource>
          <Resource icon={svg('M4 5h12M4 10h12M4 15h8')} title="Changelog" body="Release notes for the server, SDKs and connectors.">
            <Ln to={`${GITHUB}/releases`} className="sw-res__link">Read the changelog →</Ln>
          </Resource>
        </div>
      </div>
    </section>
  )
}
