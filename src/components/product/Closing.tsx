import { useState } from 'react'
import { Cloud, Cpu, Database, Package, Server, SquareTerminal } from 'lucide-react'
import { formatCompactCount, useGithubStars } from '../../lib/credibility-stats'
import { PAGE_FAQS } from '../../lib/page-faqs'
import { Code, CopyBtn } from '../home/code'
import { DOCS, GITHUB } from '../home/links'
import { H2, Icon, Ln } from '../home/ui'
import { Head, Pill, Seg, Tile } from './ui'

const SAMPLES = {
  Python: `from statewave import StatewaveClient

with StatewaveClient("http://localhost:8100") as sw:
    sw.create_episode(
        subject_id="account:northwind",
        source="chat", type="conversation",
        payload={"messages": [{"role": "user", "content": "We moved our renewal to the 14th."}]},
    )
    sw.compile_memories("account:northwind")

    bundle = sw.get_context(
        subject_id="account:northwind",
        task="When does our plan renew?",
        max_tokens=2000, emit_receipt=True,
    )
    print(bundle.receipt_id)
    # 01J9ZK4T7M3QX8R2V6N0B5HCWD`,
  TypeScript: `import { StatewaveClient } from "@statewavedev/sdk";

const sw = new StatewaveClient("http://localhost:8100");

await sw.createEpisode({
  subjectId: "account:northwind", source: "chat",
  type: "conversation", payload: { messages: [{ role: "user", content: "We moved our renewal to the 14th." }] },
});
await sw.compileMemories("account:northwind");

const bundle = await sw.getContext({
  subjectId: "account:northwind",
  task: "When does our plan renew?",
  maxTokens: 2000, emitReceipt: true,
});
console.log(bundle.receiptId);`,
  curl: `curl -X POST localhost:8100/v1/episodes \\
  -H "Content-Type: application/json" \\
  -d '{"subject_id": "account:northwind", "source": "chat",
       "type": "conversation", "payload": {"messages": [{"role": "user", "content": "We moved our renewal to the 14th."}]}}'

curl -X POST localhost:8100/v1/memories/compile \\
  -H "Content-Type: application/json" \\
  -d '{"subject_id": "account:northwind"}'

curl -X POST localhost:8100/v1/context \\
  -H "Content-Type: application/json" \\
  -d '{"subject_id": "account:northwind",
       "task": "When does our plan renew?",
       "max_tokens": 2000, "emit_receipt": true}'
# returns the ranked bundle and its receipt_id`,
} as const
type Lang = keyof typeof SAMPLES
const LANGS = (Object.keys(SAMPLES) as Lang[]).map((id) => ({ id, text: id }))

const INSTALLS = [
  ['npx @statewavedev/statewave', 'CLI'],
  ['pip install statewave', 'Python'],
  ['npm install @statewavedev/sdk', 'TypeScript'],
  ['docker compose up -d', 'Docker'],
] as const

const REQS = [
  [<Database size={16} />, 'Database', 'PostgreSQL 15+ with pgvector 0.4.2+'],
  [<Cpu size={16} />, 'Runtime', 'Python 3.11+, CPU-only, no GPU'],
  [<Package size={16} />, 'Image', 'linux/amd64 and arm64'],
  [<Cloud size={16} />, 'Deploy', 'Docker Compose, Helm, Fly.io or Railway'],
] as const

export function RunIt() {
  const [lang, setLang] = useState<Lang>('Python')
  return (
    <section id="run-it" className="pd-sec pd-sec--card" aria-label="Run it">
      <div className="sw-wrap">
        <div className="pd-navy">
          <Head
            dark
            title="Runs on Postgres, works with any LLM"
            lede="One container plus Postgres with pgvector. Compilation goes through LiteLLM, so OpenAI, Anthropic, Bedrock, Vertex, Mistral or a local model via Ollama all work."
            more={{ to: DOCS, label: 'Read the quickstart' }}
          />
          <div className="pd-run">
            <div className="pd-sample">
              <div className="pd-sample__bar">
                <Seg dark label="Language" options={LANGS} value={lang} onChange={setLang} />
                <CopyBtn text={SAMPLES[lang]} className="pd-copy pd-copy--bare" label={`Copy ${lang} sample`} />
              </div>
              <pre className="pd-sample__code"><code><Code text={SAMPLES[lang]} /></code></pre>
              <div className="pd-sample__res">
                <span>Response</span>
                <code>receipt_id: 01J9ZK4T7M3QX8R2V6N0B5HCWD</code>
                <span>3 memories · 1 episode · 1,284 / 2,000 tokens · signed</span>
              </div>
            </div>
            <div className="pd-run__side">
              <div className="pd-ibox">
                <div className="pd-ibox__t"><Tile tone="inv" size={36}><SquareTerminal size={18} /></Tile><h3>Install</h3></div>
                {INSTALLS.map(([cmd, kind]) => (
                  <div key={cmd} className="pd-cmd">
                    <span aria-hidden="true">$</span><code className="pd-grow">{cmd}</code><em>{kind}</em><CopyBtn text={cmd} className="pd-copy pd-copy--bare" label={`Copy ${cmd}`} />
                  </div>
                ))}
              </div>
              <div className="pd-ibox">
                <div className="pd-ibox__t"><Tile tone="inv" size={36}><Server size={18} /></Tile><h3>Requirements</h3></div>
                <dl className="pd-reqs">
                  {REQS.map(([icon, k, v]) => <div key={k}><dt><span aria-hidden="true">{icon}</span>{k}</dt><dd>{v}</dd></div>)}
                </dl>
                <span className="pd-small pd-muted">Also included</span>
                <ul className="pd-tags">{['OpenTelemetry', 'Webhooks', 'Multi-tenant', 'Apache-2.0'].map((t) => <li key={t}>{t}</li>)}</ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Same entries as the FAQPage JSON-LD for /product (routeJsonLd reads PAGE_FAQS), so they can't drift. */
export function ProductFaq() {
  const entries = PAGE_FAQS['/product'] ?? []
  return (
    <section id="faq" className="pd-sec pd-sec--panel" aria-label="Frequently asked questions">
      <div className="sw-wrap">
        <div className="pd-faq__head"><H2 a="FAQ" /></div>
        <div className="sw-faq pd-faq">
          {entries.map((e, i) => (
            <details key={e.question} {...(i === 0 ? { open: true } : {})}>
              <summary>
                <span aria-hidden="true" className="sw-plus">+</span>
                <h3>{e.question}</h3>
              </summary>
              <div>
                <p>{e.answer}</p>
                {e.links && e.links.length > 0 && (
                  <ul>{e.links.map((l) => <li key={l.href}><Ln to={l.href}>{l.label}</Ln></li>)}</ul>
                )}
              </div>
            </details>
          ))}
        </div>
        <div className="sw-faq__more"><Ln to="/faq" className="sw-btn sw-btn--outline pd-btn">All questions →</Ln></div>
      </div>
    </section>
  )
}

const CMDS = [
  { id: 'npx', text: 'npx', cmd: 'npx @statewavedev/statewave' },
  { id: 'pip', text: 'pip', cmd: 'pip install statewave' },
  { id: 'docker', text: 'docker compose', cmd: 'docker compose up -d' },
] as const

const RECEIPT = [
  ['Subject', 'account:northwind'],
  ['Selected', '3 memories · 1 episode'],
  ['Budget', '1,284 / 2,000 tokens'],
  ['Policy', 'support-standard'],
] as const

export function ProductCta() {
  const [tab, setTab] = useState<(typeof CMDS)[number]['id']>('npx')
  const cmd = CMDS.find((c) => c.id === tab)!.cmd
  const stars = formatCompactCount(useGithubStars())
  return (
    <section id="cta" className="pd-sec pd-sec--card" aria-label="Get started">
      <div className="sw-wrap">
        <div className="pd-navy pd-cta">
          <img src="/images/product/v8/cta-glow.svg" alt="" aria-hidden="true" className="pd-cta__glow" />
          <div className="pd-cta__copy">
            <H2 a="Run it on your own data" />
            <p>Inspect every bundle your agent receives. Start with one command on your own infrastructure, with storage and retrieval in your own Postgres.</p>
            <div className="pd-hero__ctas">
              <Ln to={DOCS} className="sw-btn sw-btn--solid pd-btn">Read the docs</Ln>
              <Ln to={GITHUB} className="sw-btn sw-btn--ghost pd-btn"><Icon name="github" size={16} />Star on GitHub{stars ? ` · ${stars}` : ''}</Ln>
            </div>
            <Ln to="mailto:licensing@statewave.ai" className="pd-cta__mail">Need an SLA or an architecture review? Talk to us →</Ln>
          </div>
          <div className="pd-cta__side">
            <Seg dark label="Install method" options={CMDS} value={tab} onChange={setTab} />
            <div className="pd-cta__cmd">
              <span aria-hidden="true">$</span><code className="pd-grow">{cmd}</code><CopyBtn text={cmd} className="pd-copy" label={`Copy ${cmd}`} />
            </div>
            <div className="pd-card pd-receipt">
              <div className="pd-row"><b>Receipt</b><code className="pd-muted pd-grow">01J9ZK4T7M3QX8R2…</code><Pill tone="ok">✓ Signed</Pill></div>
              <dl>{RECEIPT.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
