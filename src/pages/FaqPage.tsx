import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { ArrowRight, ArrowUpRight, BookOpen, MessageCircleQuestion, MessagesSquare } from 'lucide-react'
import { Divider, Eyebrow, H2, Ln } from '../components/home/ui'
import { useSeen } from '../components/home/hooks'
import { DOCS_REPO, GITHUB } from '../components/home/links'
import { FAQ_ENTRIES } from '../lib/faq'
import type { FaqEntry, RouteKey } from '../lib/seo-meta'
import { PAGE_FAQS } from '../lib/page-faqs'
import { usePageSEO } from '../lib/seo'
import { useChatWidget } from '../lib/widget-context-api'
import '../components/home/home-b.css'
import '../components/faq/faq.css'

/* /faq in the v8 style. One crawlable, linkable URL whose raw HTML is the full FAQ_ENTRIES Q&A, with
 * the FAQPage schema from routeJsonLd. The homepage shows the first five of the same entries.
 * An interior page: the hero ends on a straight edge and the home's cross divider, not the arc. */

const BEAMS = [[18, 24, 0.22], [34, 24, 0.12], [70, -22, 0.16], [86, -22, 0.1]]

/** Grouped by question text. Anything not listed here still renders, under "More questions",
 *  so a new FAQ entry can never drop off the page. */
const TOPICS = [
  { id: 'basics', title: 'The basics', questions: [
    'What is Statewave?',
    'What is AI memory infrastructure?',
  ] },
  { id: 'how-it-works', title: 'How it works', questions: [
    'How does Statewave give AI agents persistent memory?',
    'How is Statewave different from a vector database?',
    "What's the difference between episodic and semantic memory in Statewave?",
  ] },
  { id: 'running-it', title: 'Running it', questions: [
    'Can Statewave be self-hosted?',
    'Is Statewave open source? What about commercial use?',
    'What does Statewave run on?',
  ] },
  { id: 'integrations', title: 'Integrations', questions: [
    'Which LLM providers and frameworks does Statewave work with?',
    'Can I use Statewave with Copilot, MCP servers, or LangChain-style agents?',
  ] },
]

type Group = { id: string; title: string; entries: readonly FaqEntry[] }

const listed = new Set(TOPICS.flatMap(t => t.questions))
const rest = FAQ_ENTRIES.filter(e => !listed.has(e.question))
const GROUPS: Group[] = [
  ...TOPICS.map(t => ({ id: t.id, title: t.title, entries: FAQ_ENTRIES.filter(e => t.questions.includes(e.question)) })),
  ...(rest.length ? [{ id: 'more', title: 'More questions', entries: rest }] : []),
].filter(g => g.entries.length > 0)

/** Pages that answer their own questions. The count and the first question come from PAGE_FAQS. */
const DEEPER: { to: RouteKey; label: string }[] = [
  { to: '/product', label: 'How it works' },
  { to: '/why', label: 'Why Statewave' },
  { to: '/developers', label: 'Developers' },
  { to: '/connectors', label: 'Connectors' },
  { to: '/openrouter', label: 'OpenRouter proxy' },
  { to: '/vs', label: 'Comparisons' },
]

const plural = (n: number) => `${n} question${n === 1 ? '' : 's'}`

function Hero() {
  return (
    <section className="sw-hero fq-hero" aria-label="Frequently asked questions">
      <div className="sw-hero__beams" aria-hidden="true">
        {BEAMS.map(([l, r, o]) => (
          <i key={l} style={{ left: `${l}%`, transform: `rotate(${r}deg)`, ['--o' as string]: o }} />
        ))}
      </div>
      <div className="sw-hero__in">
        <Eyebrow dark>FAQ</Eyebrow>
        <h1 className="sw-hero__title">
          Questions about <span className="sw-hero__grad">Statewave</span>
        </h1>
        <p className="sw-hero__sub">
          Honest, technical answers about Statewave, AI agent memory, and how it fits with the rest
          of your stack.
        </p>
        <nav className="fq-jump" aria-label="Topics">
          {GROUPS.map((g, i) => <a key={g.id} href={`#${g.id}`} style={{ '--i': i } as CSSProperties}>{g.title}</a>)}
        </nav>
      </div>
    </section>
  )
}

/** The rows rise in with the home FAQ's own scroll-driven animation (.sw-faq details). */
function Topic({ group, first }: { group: Group; first: boolean }) {
  return (
    <section id={group.id} className="fq-topic" aria-labelledby={`${group.id}-h`}>
      <div className="fq-topic__head">
        <h2 id={`${group.id}-h`}>{group.title}</h2>
        <span className="sw-mono">{plural(group.entries.length)}</span>
      </div>
      <div className="sw-faq fq-list">
        {group.entries.map((e, i) => (
          <details key={e.question} {...(first && i === 0 ? { open: true } : {})}>
            <summary><span aria-hidden="true" className="sw-plus">+</span><h3>{e.question}</h3></summary>
            <div>
              <p>{e.answer}</p>
              {e.links && e.links.length > 0 && (
                <ul>{e.links.map(l => <li key={l.href}><Ln to={l.href}>{l.label}</Ln></li>)}</ul>
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}

function Questions() {
  return (
    <section className="fq-section" aria-label="Questions by topic">
      <div className="fq-wrap">
        {GROUPS.map((g, i) => <Topic key={g.id} group={g} first={i === 0} />)}
      </div>
    </section>
  )
}

function Deeper() {
  const [ref, seen] = useSeen<HTMLUListElement>()
  const pages = DEEPER.map(p => ({ ...p, faq: PAGE_FAQS[p.to] ?? [] })).filter(p => p.faq.length > 0)
  if (pages.length === 0) return null
  return (
    <section className="fq-section fq-section--tint" aria-labelledby="fq-deeper">
      <div className="fq-wrap">
        <div className="fq-head fq-head--center">
          <Eyebrow>Go deeper</Eyebrow>
          <H2 id="fq-deeper" a="More answers," b="on the pages they’re about." />
          <p className="sw-lede">
            Each of these pages has its own FAQ, with questions that go further into the subject.
          </p>
        </div>
        <ul ref={ref} className="fq-cards" {...(seen ? { 'data-seen': '' } : {})}>
          {pages.map((p, i) => (
            <li key={p.to} style={{ '--i': i } as CSSProperties}>
              <Ln to={p.to} className="fq-card">
                <h3>{p.label}</h3>
                <p>“{p.faq[0].question}”</p>
                <span className="fq-card__more">
                  {plural(p.faq.length)} <ArrowRight size={16} aria-hidden="true" />
                </span>
              </Ln>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function StillAsking() {
  const { openWidget } = useChatWidget()
  const [ref, seen] = useSeen<HTMLUListElement>()
  return (
    <section className="fq-section" aria-labelledby="fq-ask">
      <div className="fq-wrap">
        <div className="fq-head fq-head--center">
          <Eyebrow>Still asking</Eyebrow>
          <H2 id="fq-ask" a="Didn’t find your question?" />
          <p className="sw-lede">
            Ask the assistant, read the docs it answers from, or ask in public on GitHub.
          </p>
        </div>
        <ul ref={ref} className="fq-ways" {...(seen ? { 'data-seen': '' } : {})}>
          <li style={{ '--i': 0 } as CSSProperties}>
            <button type="button" className="fq-way" onClick={() => openWidget('statewave-support', 'Statewave Support', 'support')}>
              <span className="fq-way__icon"><MessageCircleQuestion size={22} aria-hidden="true" /></span>
              <span className="fq-way__title">Ask the assistant</span>
              <span className="fq-way__text">Answers grounded in the Statewave docs, citing the pages it used.</span>
              <span className="fq-way__go">Open the chat <ArrowRight size={16} aria-hidden="true" /></span>
            </button>
          </li>
          <li style={{ '--i': 1 } as CSSProperties}>
            <Ln to={DOCS_REPO} className="fq-way">
              <span className="fq-way__icon"><BookOpen size={22} aria-hidden="true" /></span>
              <span className="fq-way__title">Read the docs</span>
              <span className="fq-way__text">Getting started, the architecture, ranking and the API contract, on GitHub.</span>
              <span className="fq-way__go">statewave-docs <ArrowUpRight size={16} aria-hidden="true" /></span>
            </Ln>
          </li>
          <li style={{ '--i': 2 } as CSSProperties}>
            <Ln to={`${GITHUB}/discussions`} className="fq-way">
              <span className="fq-way__icon"><MessagesSquare size={22} aria-hidden="true" /></span>
              <span className="fq-way__title">Ask on GitHub</span>
              <span className="fq-way__text">Post in Discussions, where the answer stays public for the next person.</span>
              <span className="fq-way__go">GitHub Discussions <ArrowUpRight size={16} aria-hidden="true" /></span>
            </Ln>
          </li>
        </ul>
        <p className="fq-bug">
          Found a bug? <Ln to={`${GITHUB}/issues`}>Open an issue on GitHub</Ln>.
        </p>
      </div>
    </section>
  )
}

export function FaqPage() {
  // Title, description, canonical and the FAQPage schema come from the /faq route entry.
  usePageSEO()
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => { root.current?.setAttribute('data-armed', '') }, [])
  return (
    <div ref={root} className="sw-home fq">
      <Hero />
      <Divider />
      <Questions />
      <Deeper />
      <StillAsking />
    </div>
  )
}
