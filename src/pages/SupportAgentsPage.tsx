import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Divider, Eyebrow, H2, Ln } from '../components/home/ui'
import { usePrefersReducedMotion, useSeen } from '../components/home/hooks'
import { EXAMPLES } from '../components/home/links'
import { Beams, CodeTabs, Crumbs, DemoButton, Tools, UseCaseClose, UseCaseFaq } from '../components/use-case/parts'
import type { CodeTab } from '../components/use-case/parts'
import { usePageSEO } from '../lib/seo'
import '../components/home/home-b.css'
import '../components/use-case/use-case.css'

/* /use-cases/support-agents in the v8 style, on the shared use case template (components/use-case).
 * Facts come from the statewave README and API v1 contract (context, resolutions, handoff, health, SLA),
 * the statewave-py README (method names), the support examples in statewave-examples and the
 * statewave-connectors README (Zendesk, Intercom, Freshdesk). The Northwind story is the live demo's
 * own support persona (tests/fixtures/demo-pack-text.json), so the page and the demo tell the same one:
 * #4937 broke on a 60k-memory subject, and #5012 came back with the same symptom. */

const SUBJECT = 'customer:northwind'
const EXAMPLE = `${EXAMPLES}/tree/main/support-agent-python`
const API = 'https://github.com/smaramwbc/statewave-docs/blob/main/api/v1-contract.md'

/** The live demo on the support agent persona: Northwind's history, seeded into the visitor's own subject. */
function TryDemo() {
  return (
    <DemoButton persona="support-agent" label="Support Agent" className="sw-btn sw-btn--solid sw-hero__cta">
      Try the live demo
      <span aria-hidden="true" className="sw-hero__go">→</span>
    </DemoButton>
  )
}

/* ── hero ── */

const HELPDESKS = [
  { name: 'Zendesk', src: '/images/home/v8/logos/zendesk.svg' },
  { name: 'Intercom', src: '/connectors/intercom.svg' },
  { name: 'Freshdesk', src: '/connectors/freshdesk.svg' },
]

function Hero() {
  return (
    <section className="sw-hero uc-hero" aria-label="Support agents">
      <Beams />
      <div className="sw-hero__in">
        <Crumbs current="Support agents" />
        <Tools label="Imports from" tools={HELPDESKS} />
        <h1 className="sw-hero__title uc-title">
          Support agents that remember<br /> <span className="sw-hero__grad">every customer.</span>
        </h1>
        <p className="sw-hero__sub">
          Past tickets, the plan they’re on and what fixed it last time come back on every conversation, ranked, with a
          source, inside the token budget you set.
        </p>
        <div className="sw-hero__ctas">
          <TryDemo />
          <Ln to="#how" className="sw-btn sw-btn--ghost">How it works</Ln>
        </div>
        <p className="uc-hero__note">The demo holds Northwind Logistics’ support history. Ask it why their logins broke in April.</p>
      </div>
    </section>
  )
}

/* ── how it works: a ticket arrives and the console fills in from memory, one step at a time. Plays once
 *    when it scrolls into view, then holds still. Server HTML and reduced motion get the finished state. ── */

const STEPS = [
  { n: '01', t: 'Tickets become episodes', ep: 'sync zendesk', d: 'Tickets, replies and internal notes land under the customer’s subject, from a backfill or a webhook.' },
  { n: '02', t: 'Episodes compile', ep: 'POST /v1/memories/compile', d: 'They become typed memories: who the customer is, what they run, what broke and what fixed it.' },
  { n: '03', t: 'Context before the reply', ep: 'POST /v1/context', d: 'The agent gets the memories that matter for this message, ranked and packed to your token budget.' },
  { n: '04', t: 'An answer that starts informed', ep: 'with sources', d: 'The reply builds on the last fix, and every fact points back to the ticket it came from.' },
]

const MEMORIES = [
  { src: 'Ticket #4937', when: 'Apr 22', text: 'Same symptom: /v1/context timeouts on a 60k-memory subject. Fixed by splitting it per region.' },
  { src: 'Triage note', when: 'after #4937', text: 'Check the per-subject memory count first. High-severity Northwind tickets page EU on-call directly.' },
  { src: 'Account', when: 'Team plan', text: 'Maya Hassan, Director of Dispatch Automation. EU-Paris, renewal on Sep 15.' },
]

function How() {
  const rm = usePrefersReducedMotion()
  const [ref, seen] = useSeen<HTMLDivElement>()
  const [shown, setShown] = useState(STEPS.length)

  // The server renders the finished console; on the client it resets, then plays once when seen.
  useEffect(() => {
    if (rm) return
    const id = setTimeout(() => setShown(0), 0)
    return () => clearTimeout(id)
  }, [rm])

  useEffect(() => {
    if (!seen || shown >= STEPS.length) return
    const id = setTimeout(() => setShown(shown + 1), shown === 0 ? 300 : 1100)
    return () => clearTimeout(id)
  }, [seen, shown])

  return (
    <section id="how" className="uc-section uc-section--navy" aria-label="How it works" data-nav-tone="dark">
      <div className="uc-wrap">
        <div className="uc-head">
          <Eyebrow dark>How it works</Eyebrow>
          <H2 a="A ticket arrives." b="The history is already there." />
          <p className="sw-lede">
            Each customer gets one subject. Everything your team learned about them goes in, and before your agent replies
            it reads back what matters for this message, with the ticket each fact came from.
          </p>
        </div>
        <div className="uc-how__grid">
          <ol className="uc-how__steps">
            {STEPS.map((s, i) => (
              <li key={s.n} data-on={i < shown || undefined}>
                <span className="sw-mono uc-how__n">{s.n}</span>
                <div>
                  <b className="uc-how__t">{s.t}</b>
                  <code className="sw-mono uc-how__ep">{s.ep}</code>
                  <p className="uc-how__d">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
          <div ref={ref} className="uc-console">
            <div className="uc-console__bar">
              <i /><i /><i /><span>Northwind Logistics</span><em className="sw-mono">{SUBJECT}</em>
            </div>
            <div className="uc-console__body">
              <div className="uc-msg">
                <span className="uc-msg__avatar" aria-hidden="true">MH</span>
                <div>
                  <p className="uc-msg__who"><b>Maya Hassan</b><span>Northwind Logistics</span><em>#5012 · high</em></p>
                  <p className="uc-msg__text">
                    p95 on the routing-fleet subject went from 280ms to 1.4s over the last six hours. Can you triage before
                    we page?
                  </p>
                </div>
              </div>
              <div>
                <p className="uc-mems__label">From memory</p>
                <ul className="uc-mems">
                  {MEMORIES.map((m, i) => (
                    <li key={m.src} className="uc-mem" data-on={i < shown || undefined}>
                      <div>
                        <div className="uc-mem__in">
                          <p className="uc-mem__src"><b>{m.src}</b><span>{m.when}</span></p>
                          <p>{m.text}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="uc-reply" data-on={shown >= STEPS.length || undefined}>
                <p className="uc-reply__label">Agent’s reply</p>
                <p>
                  This looks like #4937 again. routing-fleet is at 58k memories, close to the 60k mark that caused it,
                  so splitting it per region now should bring p95 back before it crosses. I’ve marked it high-sev for EU
                  on-call.
                </p>
                <p className="uc-cites"><span>Sources</span><em>#4937</em><em>Triage note</em><em>Account</em></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── built for support: what Statewave tracks beyond the context bundle ── */

function Scene({ id }: { id: string }) {
  if (id === 'context') {
    return (
      <div className="uc-scene uc-scene--bundle">
        <p className="uc-scene__h" style={{ ['--d' as string]: 0 }}>## Task</p>
        <p style={{ ['--d' as string]: 0 }}>Triage a latency report</p>
        <p className="uc-scene__h" style={{ ['--d' as string]: 1 }}>## About this user</p>
        <p style={{ ['--d' as string]: 2 }}>- Maya Hassan, Northwind Logistics</p>
        <p style={{ ['--d' as string]: 3 }}>- Team plan, EU-Paris</p>
        <p style={{ ['--d' as string]: 4 }}>- #4937: fixed by a per-region split</p>
      </div>
    )
  }
  if (id === 'repeat') {
    return (
      <div className="uc-scene uc-scene--tickets">
        <p className="uc-ticket" style={{ ['--d' as string]: 0 }}><b>#4937</b><span>Per-region split</span><em>resolved</em></p>
        <p className="uc-ticket" data-open="" style={{ ['--d' as string]: 1 }}><b>#5012</b><span>Same symptom</span><em>open</em></p>
        <p className="uc-scene__link" style={{ ['--d' as string]: 2 }}><ArrowRight size={14} aria-hidden="true" />Prior fix ranked first</p>
      </div>
    )
  }
  if (id === 'handoff') {
    return (
      <div className="uc-scene uc-scene--brief">
        <p style={{ ['--d' as string]: 0 }}># Handoff Brief — {SUBJECT}</p>
        <p style={{ ['--d' as string]: 1 }}><b>Active issue</b> p95 at 1.4s</p>
        <p style={{ ['--d' as string]: 2 }}><b>Tried</b> memory count: 58k</p>
        <p style={{ ['--d' as string]: 3 }}><b>History</b> #4937, per-region split</p>
      </div>
    )
  }
  return (
    <div className="uc-scene uc-scene--health">
      <p className="uc-health__top" style={{ ['--d' as string]: 0 }}>
        <span className="uc-health__score">55</span><span className="uc-health__state">watch</span>
      </p>
      <p className="uc-health__scale" style={{ ['--d' as string]: 1 }} aria-hidden="true"><i /></p>
      <ul className="uc-health__factors" style={{ ['--d' as string]: 2 }}>
        <li><b>−15</b><span>1 open session</span></li>
        <li><b>−10</b><span>1 session over the 24h resolution SLA</span></li>
      </ul>
    </div>
  )
}

const FEATURES = [
  {
    id: 'context', name: 'Returning customers', ep: 'POST /v1/context',
    text: 'Name, company, plan, preferences and past issues come back ranked and inside max_tokens. Each fact traces back to the episode it came from.',
  },
  {
    id: 'repeat', name: 'Repeat issues', ep: 'POST /v1/resolutions',
    text: 'Mark each session open, resolved or unresolved. When a problem comes back, the earlier fix ranks first, so nobody solves the same ticket twice.',
  },
  {
    id: 'handoff', name: 'Handoff packs', ep: 'POST /v1/handoff',
    text: 'On escalation or a shift change, one call returns the active issue, the steps already tried, key facts and past resolutions, with a markdown brief for whoever picks it up.',
  },
  {
    id: 'health', name: 'Health and SLA', ep: 'GET /v1/subjects/{id}/health',
    text: 'A 0–100 health score with the factors behind it, plus first-response and resolution times with breach flags. A webhook fires when an account’s health drops.',
  },
]

function Features() {
  const [ref, seen] = useSeen<HTMLDivElement>()
  return (
    <section className="uc-section uc-section--tint" aria-label="Built for support">
      <div className="uc-wrap">
        <div className="uc-head">
          <Eyebrow>Built for support</Eyebrow>
          <H2 a="More than a chat log." b="Memory built around tickets." />
          <p className="sw-lede">
            Besides remembering every conversation, Statewave keeps what a support team keeps: which issues are open, what fixed
            them, how each account is doing and whether you met your SLA.
          </p>
        </div>
        <div ref={ref} className="uc-feats" {...(seen ? { 'data-seen': '' } : {})}>
          {FEATURES.map(f => (
            <article key={f.id} className="uc-feat">
              <div className="uc-feat__stage" aria-hidden="true"><Scene id={f.id} /></div>
              <code className="sw-mono uc-feat__ep">{f.ep}</code>
              <h3>{f.name}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── on the wire: the same flow in the Python SDK ── */

const WIRE: CodeTab[] = [
  {
    label: 'Every reply',
    file: 'support_agent.py',
    code: `from statewave import StatewaveClient

sw = StatewaveClient("http://localhost:8100")
subject = "${SUBJECT}"

# Before the model answers: the history that matters for this message
ctx = sw.get_context(subject, task=message, max_tokens=800)
reply = answer(message, context=ctx.assembled_context)  # your model call

# After: the exchange joins the customer's history
sw.create_episode(
    subject_id=subject,
    source="support-chat",
    type="conversation",
    payload={"messages": [
        {"role": "user", "content": message},
        {"role": "assistant", "content": reply},
    ]},
    session_id="ticket-5012",
)`,
  },
  {
    label: 'Escalation',
    file: 'escalate.py',
    code: `# Close out the last incident, so its fix ranks when the symptom returns
sw.create_resolution(
    subject, "ticket-4937",
    status="resolved",
    resolution_summary="Split the fleet subject per region",
)

# Hand the open ticket to EU on-call with a brief
handoff = sw.create_handoff(subject, "ticket-5012", reason="escalation to EU on-call")
print(handoff.handoff_notes)`,
    outputLabel: 'The pack, trimmed',
    output: `{
  "active_issue": "p95 on routing-fleet rose from 280ms to 1.4s",
  "attempted_steps": ["Checked per-subject memory count: 58k"],
  "key_facts": ["Team plan", "EU-Paris", "Renewal 2026-09-15"],
  "resolution_history": [
    { "session_id": "ticket-4937", "status": "resolved",
      "summary": "Split the fleet subject per region" }
  ],
  "handoff_notes": "# Handoff Brief — ${SUBJECT}\\n…",
  "provenance": { "fact_ids": […], "episode_ids": […] }
}`,
  },
  {
    label: 'Health & SLA',
    file: 'account_health.py',
    code: `health = sw.get_health(subject)
print(f"{health.score}/100, {health.state}")
for f in health.factors:
    print(f"  {f.signal}: {f.impact:+d} ({f.detail})")

# Thresholds default to a 5 min first response and a 24 h resolution
sla = sw.get_sla(subject, first_response_threshold_minutes=60)
print(sla.first_response_breach_count, "first-response breaches")`,
  },
]

const WIRE_STEPS = [
  { title: 'Read before the reply', text: <><code>get_context</code> returns the customer’s memories ranked for this message and packed to <code>max_tokens</code>, ready for the system prompt.</> },
  { title: 'Write after it', text: <><code>create_episode</code> adds the exchange to the customer’s history. Compiling turns it into memories for the next conversation.</> },
  { title: 'Track the outcome', text: <><code>create_resolution</code> marks a session resolved, and that fix is what surfaces when the problem comes back.</> },
  { title: 'Hand it over', text: <><code>create_handoff</code> builds the brief for escalations and shift changes, with the IDs of everything it used.</> },
]

function Wire() {
  return (
    <section className="uc-section" aria-label="On the wire">
      <div className="uc-wrap">
        <div className="uc-head">
          <Eyebrow>On the wire</Eyebrow>
          <H2 a="Two calls per reply." b="One more when it escalates." />
          <p className="sw-lede">
            The Python SDK wraps every endpoint, with helpers for resolutions, handoffs, health and SLA. Bring your own
            model: Statewave hands it text, not a model-specific format.
          </p>
        </div>
        <div className="uc-wire">
          <ol className="uc-steps">
            {WIRE_STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="sw-mono">{i + 1}</span>
                <div><b>{s.title}</b><p>{s.text}</p></div>
              </li>
            ))}
          </ol>
          <CodeTabs label="Support agent code" tabs={WIRE} />
        </div>
      </div>
    </section>
  )
}

/* ── sources: the helpdesks it imports from ── */

const SOURCES = [
  {
    name: 'Zendesk', src: '/images/home/v8/logos/zendesk.svg',
    text: 'Tickets and comments, filtered by brand and status. Incremental export means a re-run only fetches what changed.',
    subject: 'customer:<org_or_requester_id>', live: 'Webhooks signed with HMAC-SHA256',
  },
  {
    name: 'Intercom', src: '/connectors/intercom.svg',
    text: 'Conversations, replies and admin notes, filtered by tag or team, in the US, EU and AU regions.',
    subject: 'customer:<company_or_contact_id>', live: 'Webhooks verified with X-Hub-Signature',
  },
  {
    name: 'Freshdesk', src: '/connectors/freshdesk.svg',
    text: 'Tickets, public replies and private notes, with a server-side filter for what changed since your last sync.',
    subject: 'customer:<company_or_requester_id>', live: 'Webhooks with a shared-secret header',
  },
]

function Sources() {
  return (
    <section className="uc-section uc-section--tint" aria-label="Import your helpdesk">
      <div className="uc-wrap">
        <div className="uc-head">
          <Eyebrow>Bring the history</Eyebrow>
          <H2 a="Your helpdesk feeds it." b="From the first ticket on." />
          <p className="sw-lede">
            Backfill past tickets once, then a webhook keeps each customer’s memory current. Every ticket lands under the
            customer it belongs to, so the agent starts its first conversation already informed.
          </p>
        </div>
        <ul className="uc-sources">
          {SOURCES.map(s => (
            <li key={s.name} className="uc-source">
              <span className="uc-source__logo"><img src={s.src} alt="" width={26} height={26} /></span>
              <h3>{s.name}</h3>
              <p>{s.text}</p>
              <dl>
                <div><dt>Subject</dt><dd className="sw-mono">{s.subject}</dd></div>
                <div><dt>Live updates</dt><dd>{s.live}</dd></div>
              </dl>
            </li>
          ))}
        </ul>
        <div className="uc-sources__foot">
          <code className="sw-mono uc-sources__cmd"><span>$</span>statewave-connectors sync zendesk --dry-run</code>
          <div className="uc-links">
            <Ln to="https://github.com/smaramwbc/statewave-connectors/tree/main/examples/zendesk-customer-memory">Zendesk customer memory example →</Ln>
            <Ln to="/connectors">All connectors →</Ln>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── run it ── */

const RUN: CodeTab[] = [
  {
    label: 'Example',
    file: 'Terminal',
    code: `git clone https://github.com/smaramwbc/statewave-examples
cd statewave-examples
docker compose up -d

pip install statewave
python support-agent-python/support_agent.py`,
  },
  {
    label: 'With a model',
    file: 'Terminal',
    code: `pip install statewave litellm
export LLM_MODEL=gpt-4o-mini OPENAI_API_KEY=sk-…
# or LLM_MODEL=ollama/llama3, no key needed

python support-agent-llm/support_agent_llm.py`,
    outputLabel: 'Expected output, trimmed',
    output: `── Stateless Agent (no memory) ──
I'd be happy to help you add a team member! Could you please
tell me your account details and what plan you're on…

── Statewave Agent (full context) ──
Hi Alice! Since Globex is on the Enterprise plan, you can add
team members directly from Settings → Team…`,
  },
  {
    label: 'Evals',
    file: 'Terminal',
    code: `pip install statewave httpx pytest
python -m pytest eval-support-agent/ -q`,
  },
]

const RUN_STEPS = [
  { title: 'Start Statewave', text: <>From a clone of <code>statewave-examples</code>, Docker Compose starts the server on <code>localhost:8100</code>.</> },
  { title: 'Run the support agent', text: 'It seeds a returning customer’s past sessions, compiles them, prints the ranked context with its sources and builds a handoff pack. Python, or TypeScript with npx tsx.' },
  { title: 'Put a model in the loop', text: 'The LLM example asks a stateless agent and a Statewave agent the same question, on any model LiteLLM supports.' },
  { title: 'Run the evals', text: '56 assertions against your own server, covering the context bundle, the handoff pack and the health endpoint.' },
]

const LIMITS = [
  <>The support agent example has no model in the loop, so it runs without an API key. <code>support-agent-llm</code> adds one.</>,
  'The support benchmarks check recall, provenance and the handoff workflow on a fixed scenario. They don’t measure answer quality or production latency.',
  'SLA thresholds default to 5 minutes for a first response and 24 hours for resolution. Pass your own on each call.',
  'A connector sync is a pull you run again for new tickets. For live updates, run its webhook receiver.',
]

function Run() {
  return (
    <section id="run" className="uc-section" aria-label="Run it">
      <div className="uc-wrap">
        <div className="uc-head">
          <Eyebrow>Run it</Eyebrow>
          <H2 a="Run it on your machine." b="Then watch it remember." />
        </div>
        <div className="uc-wire">
          <ol className="uc-steps">
            {RUN_STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="sw-mono">{i + 1}</span>
                <div><b>{s.title}</b><p>{s.text}</p></div>
              </li>
            ))}
          </ol>
          <CodeTabs label="Commands" tabs={RUN} />
        </div>
        <div className="uc-limits">
          <b>Good to know</b>
          <ul>{LIMITS.map((l, i) => <li key={i}>{l}</li>)}</ul>
        </div>
      </div>
    </section>
  )
}

function Close() {
  return (
    <UseCaseClose title="Give your support agent" grad="every customer’s history.">
      <div className="sw-hero__ctas">
        <TryDemo />
        <Ln to={EXAMPLE} className="sw-btn sw-btn--ghost">Run the example</Ln>
      </div>
      <div className="uc-close__links">
        <Ln to={API}>API v1 contract →</Ln>
        <Ln to="/blog/repeat-issue-detection-customer-support-automation">Repeat-issue detection →</Ln>
        <Ln to="/blog/persistent-memory-for-ai-support-agents">Persistent memory for support agents →</Ln>
        <Ln to="/use-cases">All use cases →</Ln>
      </div>
    </UseCaseClose>
  )
}

export function SupportAgentsPage() {
  // Title, description and canonical come from the /use-cases/support-agents entry in lib/seo-meta.
  usePageSEO()
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => { root.current?.setAttribute('data-armed', '') }, [])
  return (
    <div ref={root} className="sw-home uc">
      <Hero />
      <Divider />
      <Features />
      <Divider />
      <How />
      <Divider />
      <Wire />
      <Divider />
      <Sources />
      <Divider />
      <Run />
      <UseCaseFaq route="/use-cases/support-agents" title="Questions about support agent memory" />
      <Close />
    </div>
  )
}
