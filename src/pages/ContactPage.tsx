import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { ArrowUpRight, Bug, Building2, Check, Copy, Lightbulb, MessagesSquare, Newspaper, ShieldAlert } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Divider, Eyebrow, H2, Icon, Ln } from '../components/home/ui'
import { useCopy, useSeen } from '../components/home/hooks'
import { GITHUB } from '../components/home/links'
import { PAGE_FAQS } from '../lib/page-faqs'
import { REPOS } from '../lib/seo-meta'
import { usePageSEO } from '../lib/seo'
import { useChatWidget } from '../lib/widget-context-api'
import '../components/home/home-b.css'
import '../components/contact/contact.css'

/* /contact in the v8 style: one page that sends each kind of request to the right place. Every
 * address and link is one the site already publishes (About, Impressum, the press kit, the footer)
 * or that SUPPORT.md and SECURITY.md name; the issue forms are the statewave repo's own templates.
 * The site has no contact form, phone line or promised response time, so the page shows none.
 * An interior page: the hero ends on a straight edge and the home's cross divider, not the arc. */

const SECURITY = 'security@statewave.ai'
const LICENSING = 'licensing@statewave.ai'
const PRESS = 'press@statewave.ai'

type Action = { label: string; to: string }

type ContactRoute = {
  id: string
  icon: LucideIcon
  /** Hero tile label. */
  short: string
  /** Where the request ends up. */
  via: string
  title: string
  text: string
  /** The main way in: a link, an address, or both (press: the kit first, then the address). */
  go?: Action
  email?: string
  more: Action[]
  /** Opens the site's Ask Support chat beside the links. */
  ask?: boolean
}

const OPEN: ContactRoute[] = [
  {
    id: 'bugs',
    icon: Bug,
    short: 'Bug report',
    via: 'GitHub Issues',
    title: 'Report a bug',
    text: 'Search the open issues first. The bug report form asks for the affected component, the steps to reproduce, what you expected and your environment, plus any logs or a minimal code sample.',
    go: { label: 'Open a bug report', to: `${GITHUB}/issues/new?template=bug_report.yml` },
    more: [{ label: 'Browse open issues', to: `${GITHUB}/issues` }],
  },
  {
    id: 'features',
    icon: Lightbulb,
    short: 'Feature request',
    via: 'GitHub Issues',
    title: 'Request a feature',
    text: 'Check the roadmap and the existing requests, then open a feature request. The form starts with the problem you are solving, so lead with your use case.',
    go: { label: 'Open a feature request', to: `${GITHUB}/issues/new?template=feature_request.yml` },
    more: [{ label: 'Read the roadmap', to: 'https://github.com/smaramwbc/statewave-docs/blob/main/roadmap.md' }],
  },
  {
    id: 'questions',
    icon: MessagesSquare,
    short: 'Question',
    via: 'GitHub Discussions',
    title: 'Ask a question',
    text: 'How do I…? Does it support…? Ask in Discussions, where the answer stays public and searchable for the next person. For a quick answer from the docs, ask the support agent on this page.',
    go: { label: 'Start a discussion', to: `${GITHUB}/discussions` },
    more: [{ label: 'Read the FAQ', to: '/faq' }],
    ask: true,
  },
]

const PRIVATE: ContactRoute[] = [
  {
    id: 'security',
    icon: ShieldAlert,
    short: 'Security report',
    via: 'Email',
    title: 'Report a vulnerability',
    text: 'Never in a public issue or discussion. Include a description, the steps to reproduce, the affected repository and version, and the potential impact.',
    email: SECURITY,
    more: [{ label: 'Security policy', to: `${GITHUB}/security/policy` }],
  },
  {
    id: 'enterprise',
    icon: Building2,
    short: 'Enterprise & licensing',
    via: 'Email',
    title: 'Enterprise support and licensing',
    text: 'Statewave is Apache-2.0, so commercial use needs no contract. Write here for the optional services: an SLA, indemnity, procurement, managed hosting or an architecture review.',
    email: LICENSING,
    more: [{ label: 'Licensing overview', to: 'https://github.com/smaramwbc/statewave/blob/main/LICENSING.md' }],
  },
  {
    id: 'press',
    icon: Newspaper,
    short: 'Press',
    via: 'Press kit',
    title: 'Press and media',
    text: 'Logos, screenshots, boilerplate and fast facts are in the press kit. Questions it doesn’t answer go to the press address.',
    go: { label: 'Open the press kit', to: '/press' },
    email: PRESS,
    more: [],
  },
]

/** Each repository takes its own issues (SUPPORT.md's table, plus the connectors and the proxy). */
const REPO_LIST = [
  { name: 'Server and API', url: REPOS.core },
  { name: 'Python SDK', url: REPOS.py },
  { name: 'TypeScript SDK', url: REPOS.ts },
  { name: 'Connectors', url: 'https://github.com/smaramwbc/statewave-connectors' },
  { name: 'OpenRouter proxy', url: REPOS.openrouter },
  { name: 'Admin dashboard', url: REPOS.admin },
  { name: 'Docs', url: REPOS.docs },
  { name: 'Examples', url: REPOS.examples },
  { name: 'This website', url: REPOS.web },
]

const i = (n: number) => ({ ['--i' as string]: n }) as CSSProperties

/* ── hero: every route as a small tile, the identity graphic. A tile jumps to its card. ── */

function Hero() {
  return (
    <section className="sw-hero ct-hero" aria-label="Contact">
      <div className="sw-hero__beams" aria-hidden="true">
        {[[18, 24, 0.22], [34, 24, 0.12], [70, -22, 0.16], [86, -22, 0.1]].map(([l, r, o]) => (
          <i key={l} style={{ left: `${l}%`, transform: `rotate(${r}deg)`, ['--o' as string]: o }} />
        ))}
      </div>
      <div className="sw-hero__in">
        <Eyebrow dark>Contact</Eyebrow>
        <h1 className="sw-hero__title ct-title">
          Every way to reach<br /> <span className="sw-hero__grad">the Statewave team.</span>
        </h1>
        <p className="sw-hero__sub">
          Statewave is built in the open, so bugs, ideas and questions go to GitHub. Security reports, commercial
          questions and press each have their own address.
        </p>
        <ul className="ct-tiles" aria-label="Pick what you need">
          {[...OPEN, ...PRIVATE].map((r, n) => (
            <li key={r.id} style={i(n)}>
              <a href={`#${r.id}`}>
                <span className="ct-tiles__box"><r.icon size={22} aria-hidden="true" /></span>
                <span className="ct-tiles__label">
                  <span className="ct-tiles__name">{r.short}</span>
                  <span className="ct-tiles__via">{r.via}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ── one route ── */

function Email({ address }: { address: string }) {
  const [done, copy] = useCopy(address)
  return (
    <div className="ct-mail">
      <Ln to={`mailto:${address}`} className="ct-mail__addr">{address}</Ln>
      <button type="button" className="ct-mail__copy" onClick={copy} aria-label={`Copy ${address}`}>
        {done ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
      </button>
      <span className="ct-sr" aria-live="polite">{done ? 'Copied' : ''}</span>
    </div>
  )
}

function Card({ r, n }: { r: ContactRoute; n: number }) {
  const { openWidget } = useChatWidget()
  return (
    <article id={r.id} className="ct-route" style={i(n)}>
      <div className="ct-route__head">
        <span className="ct-route__icon"><r.icon size={20} aria-hidden="true" /></span>
        <span className="ct-route__via">{r.via}</span>
      </div>
      <h3 className="ct-route__title">{r.title}</h3>
      <p className="ct-route__text">{r.text}</p>
      <div className="ct-route__foot">
        {r.go && (
          <Ln to={r.go.to} className="ct-go">
            {r.go.label}
            {!r.go.to.startsWith('/') && <ArrowUpRight size={16} aria-hidden="true" />}
          </Ln>
        )}
        {r.email && <Email address={r.email} />}
        {(r.more.length > 0 || r.ask) && (
          <div className="ct-route__more">
            {r.more.map(m => <Ln key={m.to} to={m.to} className="sw-more">{m.label}</Ln>)}
            {r.ask && (
              <button type="button" className="sw-more ct-ask" onClick={() => openWidget('statewave-support', 'Statewave Support', 'support')}>
                Ask Support
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

function Routes({ routes }: { routes: ContactRoute[] }) {
  // The cards rise in one after another once the row scrolls into view (CSS: .ct-routes[data-seen]).
  const [ref, seen] = useSeen<HTMLDivElement>()
  return (
    <div ref={ref} className="ct-routes" data-seen={seen || undefined}>
      {routes.map((r, n) => <Card key={r.id} r={r} n={n} />)}
    </div>
  )
}

/* ── in the open: GitHub ── */

function Open() {
  const [ref, seen] = useSeen<HTMLDivElement>()
  return (
    <section className="ct-section" aria-labelledby="ct-open">
      <div className="ct-wrap">
        <div className="ct-head">
          <Eyebrow>On GitHub</Eyebrow>
          <H2 id="ct-open" a="Bugs, ideas and questions" b="go where the code lives." />
          <p className="sw-lede">
            Issues and discussions are public, so the answer you get also helps the next person with the same problem.
          </p>
        </div>
        <Routes routes={OPEN} />
        <div ref={ref} className="ct-repos" data-seen={seen || undefined}>
          <p>
            <b>Know which package it’s in?</b> Each repository takes its own issues. Not sure? Open it in the main
            statewave repository and it gets routed from there.
          </p>
          <ul aria-label="Issues by repository">
            {REPO_LIST.map((r, n) => (
              <li key={r.url} style={i(n)}>
                <Ln to={`${r.url}/issues`} className="ct-repo">
                  <Icon name="github" size={14} />
                  <span>{r.name}</span>
                  <code className="sw-mono">{r.url.replace('https://github.com/smaramwbc/', '')}</code>
                </Ln>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ── in private: email ── */

function Private() {
  return (
    <section className="ct-section ct-section--tint" aria-labelledby="ct-private">
      <div className="ct-wrap">
        <div className="ct-head">
          <Eyebrow>By email</Eyebrow>
          <H2 id="ct-private" a="Security, licensing and press" b="each have their own address." />
          <p className="sw-lede">
            Write to these directly. A vulnerability report belongs here, never on the public tracker.
          </p>
        </div>
        <Routes routes={PRIVATE} />
        <p className="ct-legal">
          The company behind Statewave and its legal details are on the <Ln to="/impressum">Impressum</Ln>. How
          email sent to these addresses is kept is in the <Ln to="/privacy">privacy policy</Ln>.
        </p>
      </div>
    </section>
  )
}

/* ── faq ── */

/** The same entries usePageSEO emits as FAQPage JSON-LD, so the visible questions and the
 *  structured data can't drift. */
const FAQ = PAGE_FAQS['/contact'] ?? []

function Faq() {
  return (
    <section className="ct-section" aria-label="Frequently asked questions">
      <div className="ct-wrap">
        <div className="ct-head ct-head--center">
          <Eyebrow>FAQ</Eyebrow>
          <H2 a="Questions about getting in touch" />
        </div>
        <div className="sw-faq">
          {FAQ.map((e, n) => (
            <details key={e.question} {...(n === 0 ? { open: true } : {})}>
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
      </div>
    </section>
  )
}

export function ContactPage() {
  // Title, description and canonical come from the /contact entry in lib/seo-meta.
  usePageSEO()
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => { root.current?.setAttribute('data-armed', '') }, [])
  return (
    <div ref={root} className="sw-home ct">
      <Hero />
      <Divider />
      <Open />
      <Private />
      <Faq />
    </div>
  )
}
