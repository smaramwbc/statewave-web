import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { ArrowRight, ArrowRightLeft, CodeXml, HeartPulse, Lightbulb, MessageCircle, Network, Repeat2, ShoppingBag, UserCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Divider, Eyebrow, H2, Ln } from '../components/home/ui'
import { useSeen } from '../components/home/hooks'
import { EXAMPLES, GITHUB } from '../components/home/links'
import { Beams, DemoButton, UseCaseClose, UseCaseFaq } from '../components/use-case/parts'
// a plain lookup, not a hook: renamed so the hooks lint rule doesn't read it as one
import { useCaseDetailPage as detailPage } from '../lib/use-case-pages'
import { usePageSEO } from '../lib/seo'
import '../components/home/home-b.css'
import '../components/use-case/use-case.css'
import '../components/use-case/hub.css'

/* /use-cases in the v8 style: every use case with a demo you can run today, each leading to its own page,
 * then the loop they share and the ideas nobody has built yet. A card links to its detail page when one is
 * registered in lib/use-case-pages, and to its demo on GitHub until then. */

const ORG = 'https://github.com/smaramwbc'

interface Case {
  slug: string
  Icon: LucideIcon
  title: string
  text: string
  demo: { name: string; href: string }
  also?: { label: string; to: string }
}

const CASES: Case[] = [
  {
    slug: 'coding-agents', Icon: CodeXml, title: 'Coding agents',
    text: 'Your coding agent remembers the repo between sessions: the stack, the conventions and why each decision was made, so you stop re-explaining the codebase.',
    demo: { name: 'coding-agent-python', href: `${EXAMPLES}/tree/main/coding-agent-python` },
  },
  {
    slug: 'multi-agent-memory', Icon: Network, title: 'Multi-agent systems',
    text: 'Agents running in parallel read and write one shared memory. Conflicting facts are settled before they reach a prompt, and a crashed agent picks up where it stopped.',
    demo: { name: 'statewave-multi-agent-memory', href: `${ORG}/statewave-multi-agent-memory` },
    also: { label: 'Shared context walkthrough', to: '/use-cases/multi-agent-shared-context' },
  },
  {
    slug: 'personal-assistant-memory', Icon: MessageCircle, title: 'Personal assistants',
    text: 'A chat assistant that remembers each user across sessions, with typed, ranked facts instead of a replayed chat history.',
    demo: { name: 'statewave-personal-assistant', href: `${ORG}/statewave-personal-assistant` },
  },
  {
    slug: 'grounded-shop-assistant', Icon: ShoppingBag, title: 'Shop assistants',
    text: 'Answers only from the catalog, with every citation checked. A question it can’t ground becomes a coverage gap for the content team.',
    demo: { name: 'statewave-grounded-shop-assistant', href: `${ORG}/statewave-grounded-shop-assistant` },
  },
]

const SUPPORT_POINTS: { Icon: LucideIcon; text: string }[] = [
  { Icon: UserCheck, text: 'Returning customers, recognised' },
  { Icon: Repeat2, text: 'Repeat issues surface the last fix' },
  { Icon: ArrowRightLeft, text: 'Escalations arrive with a brief' },
  { Icon: HeartPulse, text: 'Health scores and SLA tracking' },
]

/* ── hero ── */

function Hero() {
  const support = detailPage('support-agents')
  const jump = [
    { label: 'Support agents', to: support?.path ?? '#cases' },
    // a use case without its own page yet jumps to its card below
    ...CASES.map(c => ({ label: c.title, to: detailPage(c.slug)?.path ?? `#${c.slug}` })),
  ]
  return (
    <section className="sw-hero uh-hero" aria-labelledby="uh-title">
      <Beams />
      <div className="sw-hero__in">
        <Eyebrow dark>Use cases</Eyebrow>
        <h1 id="uh-title" className="sw-hero__title">
          What teams build<br /> <span className="sw-hero__grad">with Statewave.</span>
        </h1>
        <p className="sw-hero__sub">
          Five use cases, each with a demo you can run today. Underneath, every one of them is the same loop.
        </p>
        <nav className="uh-jump" aria-label="Use cases">
          {jump.map((j, i) => <Ln key={j.label} to={j.to} style={{ '--i': i } as CSSProperties}>{j.label}</Ln>)}
        </nav>
      </div>
    </section>
  )
}

/* ── the use cases: support first, as the one with the most behind it ── */

function Cases() {
  const [ref, seen] = useSeen<HTMLUListElement>()
  const support = detailPage('support-agents')
  return (
    <section id="cases" className="uc-section" aria-labelledby="uh-cases">
      <div className="uc-wrap">
        <div className="uc-head">
          <Eyebrow>What you can build</Eyebrow>
          <H2 id="uh-cases" a="Five use cases." b="Each one runs today." />
          <p className="sw-lede">
            Every card has a demo on GitHub you can clone and run against your own Statewave server.
          </p>
        </div>

        <article className="uh-feature">
          <div className="uh-feature__text">
            <p className="uh-badge">Most complete today</p>
            <h3>Support agents</h3>
            <p>
              The workflow with the most behind it. Customers are recognised across sessions, a problem that comes back
              brings its last fix with it, and every account has a health score and SLA tracking.
            </p>
            <ul className="uh-points">
              {SUPPORT_POINTS.map(({ Icon, text }) => (
                <li key={text}><span aria-hidden="true"><Icon size={16} /></span>{text}</li>
              ))}
            </ul>
            <p className="uh-demo">Demo <Ln to={`${EXAMPLES}/tree/main/support-agent-python`}>support-agent-python</Ln></p>
            <Ln to={support?.path ?? `${EXAMPLES}/tree/main/support-agent-python`} className="sw-btn uh-feature__go">
              See support agents <ArrowRight size={16} aria-hidden="true" />
            </Ln>
          </div>
          <div className="uh-feature__stage" aria-hidden="true">
            <div className="uh-ticket">
              <p className="uh-ticket__who"><b>Maya Hassan</b><span>Northwind Logistics</span></p>
              <p className="uh-ticket__text">p95 on routing-fleet went from 280ms to 1.4s. Can you triage before we page?</p>
            </div>
            <ul className="uh-recall">
              <li><b>Ticket #4937</b><span>Same symptom, fixed by a per-region split</span></li>
              <li><b>Triage note</b><span>High-sev Northwind tickets page EU on-call</span></li>
              <li><b>Account</b><span>Team plan, EU-Paris, renewal Sep 15</span></li>
            </ul>
          </div>
        </article>

        <ul ref={ref} className="uh-cases" {...(seen ? { 'data-seen': '' } : {})}>
          {CASES.map((c, i) => {
            const page = detailPage(c.slug)
            return (
              <li key={c.slug} style={{ '--i': i } as CSSProperties}>
                <article id={c.slug} className="uh-case">
                  <span className="uh-case__icon" aria-hidden="true"><c.Icon size={20} /></span>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                  <p className="uh-demo">Demo <Ln to={c.demo.href}>{c.demo.name}</Ln></p>
                  <div className="uh-case__links">
                    <Ln to={page?.path ?? c.demo.href} className="uh-case__go">
                      {page ? `See ${c.title.toLowerCase()}` : 'See the demo'} <ArrowRight size={16} aria-hidden="true" />
                    </Ln>
                    {c.also && <Ln to={c.also.to} className="uh-case__also">{c.also.label}</Ln>}
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/* ── the loop under all of them ── */

const LOOP = [
  { n: '01', t: 'Your history', d: 'Tickets, repos, docs, chats and events you already have.' },
  { n: '02', t: 'Episodes', d: 'Each one recorded once, append-only, under a subject.' },
  { n: '03', t: 'Compiled memory', d: 'Typed facts, each traced to the episodes it came from.' },
  { n: '04', t: 'Context bundle', d: 'Ranked for the task and packed to a token budget.' },
]

const SOURCES = [
  { name: 'Zendesk', src: '/images/home/v8/logos/zendesk.svg' },
  { name: 'Intercom', src: '/connectors/intercom.svg' },
  { name: 'Freshdesk', src: '/connectors/freshdesk.svg' },
  { name: 'GitHub', src: '/images/home/v8/logos/github.svg' },
  { name: 'Slack', src: '/connectors/Slack_icon_2019.svg' },
  { name: 'Notion', src: '/connectors/notion.svg' },
  { name: 'Gmail', src: '/connectors/gmail.svg' },
  { name: 'Jira', src: '/connectors/jira.svg' },
]

function Loop() {
  return (
    <section className="uc-section uc-section--tint" aria-labelledby="uh-loop">
      <div className="uc-wrap">
        <div className="uc-head">
          <Eyebrow>Under every use case</Eyebrow>
          <H2 id="uh-loop" a="One loop." b="A different subject each time." />
          <p className="sw-lede">
            A support agent keeps one subject per customer, a coding agent one per repository, a pipeline one per run. The
            calls are the same: record what happened, compile it, and read back what the next step needs.
          </p>
        </div>
        <ol className="uh-loop">
          {LOOP.map(s => (
            <li key={s.n}>
              <span className="sw-mono">{s.n}</span>
              <b>{s.t}</b>
              <p>{s.d}</p>
            </li>
          ))}
        </ol>
        <div className="uh-sources">
          <div>
            <b>Start from the history you already have</b>
            <p>Connectors backfill it as episodes, so the agent’s first conversation isn’t its first day.</p>
          </div>
          <ul aria-label="Some of the connectors">
            {SOURCES.map(s => (
              <li key={s.name} title={s.name}><img src={s.src} alt={s.name} width={24} height={24} /></li>
            ))}
          </ul>
          <Ln to="/connectors" className="uh-sources__go">All connectors <ArrowRight size={16} aria-hidden="true" /></Ln>
        </div>
      </div>
    </section>
  )
}

/* ── ideas: patterns people ask about that nobody has built on Statewave yet ── */

const IDEAS = [
  { title: 'Agent-to-agent memory exchange', text: 'Two agents trade typed memories with their provenance, instead of passing prose back and forth.' },
  { title: 'Federated memory across companies', text: 'Each side keeps its own storage, and only the facts both agree on are shared.' },
  { title: 'Memory packs for an industry', text: 'Ready-made memory schemas and compiler settings for legal, healthcare or finance teams.' },
  { title: 'Memory people own', text: 'A personal memory that follows someone across apps, which they can read, export and delete.' },
  { title: 'Voice support that remembers', text: 'A caller who rings back gets an agent that knows the last call, not just the last ticket.' },
  { title: 'Copilots that learn from corrections', text: 'Each correction compiles into a preference, so the copilot gets a little better every week.' },
]

function Ideas() {
  const [ref, seen] = useSeen<HTMLUListElement>()
  return (
    <section className="uc-section" aria-labelledby="uh-ideas">
      <div className="uc-wrap">
        <div className="uc-head uc-head--center">
          <Eyebrow>Ideas</Eyebrow>
          <H2 id="uh-ideas" a="Ideas we haven’t built." b="Yours could be next." />
          <p className="sw-lede">
            These aren’t on the roadmap. They’re patterns people ask about that the same primitives could support. If
            you’re building one, we’d like to hear how it goes.
          </p>
        </div>
        <ul ref={ref} className="uh-ideas" {...(seen ? { 'data-seen': '' } : {})}>
          {IDEAS.map((idea, i) => (
            <li key={idea.title} style={{ '--i': i } as CSSProperties}>
              <span aria-hidden="true"><Lightbulb size={18} /></span>
              <h3>{idea.title}</h3>
              <p>{idea.text}</p>
            </li>
          ))}
        </ul>
        <p className="uh-ideas__cta">
          <Ln to={`${GITHUB}/discussions`}>Share yours in GitHub Discussions →</Ln>
        </p>
      </div>
    </section>
  )
}

export function UseCasesPage() {
  usePageSEO()
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => { root.current?.setAttribute('data-armed', '') }, [])
  return (
    <div ref={root} className="sw-home uc uh">
      <Hero />
      <Divider />
      <Cases />
      <Divider />
      <Loop />
      <Divider />
      <Ideas />
      <UseCaseFaq route="/use-cases" title="Questions about use cases" />
      <UseCaseClose title="Start with one subject." grad="Wrap two calls around your agent.">
        <div className="sw-hero__ctas">
          <Ln to="/developers" className="sw-btn sw-btn--solid sw-hero__cta">
            Start building
            <span aria-hidden="true" className="sw-hero__go">→</span>
          </Ln>
          <DemoButton className="sw-btn sw-btn--ghost">Try the live demo</DemoButton>
        </div>
      </UseCaseClose>
    </div>
  )
}
