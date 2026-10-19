import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, Copy } from 'lucide-react'
import { Divider, Eyebrow, H2, Ln } from '../components/home/ui'
import { useCopy, useSeen } from '../components/home/hooks'
import { logo } from '../components/home/links'
import { CONNECTORS, GROUPS } from '../content/connectors'
import type { Connector, Group } from '../content/connectors/types'
import { PAGE_FAQS } from '../lib/page-faqs'
import { usePageSEO } from '../lib/seo'
import '../components/home/home-b.css'
import '../components/connector/connectors-index.css'

/* /connectors in the v8 style. Keeps the two things that worked on the old page: the
 * colour icon grid that pulses into view, and the "One contract, many sources" layout of six
 * featured cards over compact ones. Every card now links to the connector's own page. */

const REPO = 'https://github.com/smaramwbc/statewave-connectors'

/** Colour logos drawn for dark tiles (from /public/connectors), in the old page's order. */
const DARK_LOGOS: Array<[string, string]> = [
  ['mcp-server', '/connectors/Model_Context_Protocol_logo.svg'],
  ['github', '/connectors/GitHub_Invertocat_Black_Clearspace.svg'],
  ['gitlab', '/connectors/gitlab.svg'],
  ['bitbucket', '/connectors/bitbucket.svg'],
  ['gitea', '/connectors/gitea.svg'],
  ['azure-devops', '/connectors/azure-devops.svg'],
  ['slack', '/connectors/Slack_icon_2019.svg'],
  ['discord', '/connectors/discord.svg'],
  ['n8n', '/connectors/n8n_pink+white_logo.svg'],
  ['zapier', '/connectors/zapier.svg'],
  ['zendesk', '/connectors/zendesk-1.svg'],
  ['intercom', '/connectors/intercom.svg'],
  ['freshdesk', '/connectors/freshdesk.svg'],
  ['markdown', '/connectors/markdown-svgrepo-com.svg'],
  ['notion', '/connectors/notion.svg'],
  ['gmail', '/connectors/gmail.svg'],
  ['jira', '/connectors/jira.svg'],
  ['database', '/connectors/database.svg'],
]
/** These two files are black line art; they need flipping on a dark tile. */
const INVERT_ON_DARK = new Set(['intercom', 'database'])

/** The kind of memory each connector builds, and one line for its card. */
const CARD: Record<string, { shape: string; line: string }> = {
  'mcp-server': { shape: 'Agent access', line: 'Gives Claude Code, Cursor, Copilot and Codex your memory, with sources.' },
  github: { shape: 'Repo memory', line: 'Issues, pull requests, reviews and releases, one memory per repository.' },
  gitlab: { shape: 'Repo memory', line: 'Issues, merge requests, approvals and releases, nested groups included.' },
  bitbucket: { shape: 'Repo memory', line: 'Bitbucket Cloud pull requests, issues and comments.' },
  gitea: { shape: 'Repo memory', line: 'Self-hosted Gitea or Forgejo: issues, PRs, reviews and releases.' },
  'azure-devops': { shape: 'Repo memory', line: 'Pull requests, reviewer votes and work items.' },
  slack: { shape: 'Team memory', line: 'Channels and threads, by sync or in real time. DMs are opt-in.' },
  discord: { shape: 'Community memory', line: 'Channels and threads from your community server.' },
  gmail: { shape: 'Relationship memory', line: 'The threads your query picks, one memory per contact.' },
  zendesk: { shape: 'Customer memory', line: 'Tickets, replies and internal notes, one memory per customer.' },
  intercom: { shape: 'Customer memory', line: 'Conversations, replies and admin notes, per customer.' },
  freshdesk: { shape: 'Customer memory', line: 'Tickets, replies and private notes, per customer.' },
  markdown: { shape: 'Decision memory', line: 'Docs, ADRs and RFCs from your repo, read on your machine.' },
  notion: { shape: 'Decision memory', line: 'Pages and comments, filed under the project they govern.' },
  jira: { shape: 'Project memory', line: 'Issues, comments and status changes, one memory per project.' },
  n8n: { shape: 'Workflow memory', line: 'Workflow runs, failures and the nodes that errored.' },
  zapier: { shape: 'Workflow memory', line: 'Send an episode from the last step of any zap.' },
  database: { shape: 'Records memory', line: 'Selected rows from Postgres, MySQL, MariaDB or SQL Server. Read-only.' },
}

const FEATURED = ['mcp-server', 'github', 'slack', 'markdown', 'n8n', 'zendesk']

function Mark({ c, size }: { c: Connector; size: number }) {
  if (!c.logo) return <b className="cxi-letter">{c.name.slice(0, 1)}</b>
  return <img src={c.logo.startsWith('/') ? c.logo : logo(c.logo)} alt="" width={size} height={size} />
}

/* ── hero: the colour grid pulses tile by tile when it comes into view, and again every few seconds ── */

function IconGrid() {
  const ref = useRef<HTMLDivElement>(null)
  const [beat, setBeat] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    let timer: ReturnType<typeof setInterval> | undefined
    const io = new IntersectionObserver(([e]) => {
      clearInterval(timer)
      if (!e.isIntersecting) return
      setBeat(b => b + 1)
      timer = setInterval(() => setBeat(b => b + 1), 7000)
    }, { threshold: 0.35 })
    io.observe(el)
    return () => { io.disconnect(); clearInterval(timer) }
  }, [])
  return (
    <div ref={ref} className="cxi-grid-wrap">
    <div className="cxi-grid" key={beat} data-beat={beat || undefined}>
      {DARK_LOGOS.map(([slug, src], i) => {
        const c = CONNECTORS[slug]
        return (
          <Ln key={slug} to={`/connectors/${slug}`} className="cxi-tile" style={{ ['--i' as string]: i }} ariaLabel={c?.name ?? slug}>
            <img src={src} alt="" className={INVERT_ON_DARK.has(slug) ? 'is-invert' : undefined} />
          </Ln>
        )
      })}
    </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="cxi-hero" aria-label="Connectors" data-nav-tone="dark">
      <div className="sw-hero__beams" aria-hidden="true">
        {[[12, 24, 0.16], [28, 24, 0.09], [72, -22, 0.12], [88, -22, 0.08]].map(([l, r, o]) => (
          <i key={l} style={{ left: `${l}%`, transform: `rotate(${r}deg)`, ['--o' as string]: o }} />
        ))}
      </div>
      <div className="cxi-hero__in">
        <div className="cxi-hero__copy">
          <span className="cxi-badge"><i />Not just live chats</span>
          <h1 className="cxi-hero__title">Connect your tools.<br /><span className="sw-hero__grad">Give your agents memory.</span></h1>
          <p className="cxi-hero__sub">
            Feed GitHub, Slack, support tickets, docs, email and workflow runs into Statewave as lasting memory.
            Your agents recall projects, customers and decisions, not just the last few chat turns.
          </p>
          <div className="cxi-hero__ctas">
            <Ln to="#all" className="sw-btn sw-btn--solid sw-hero__cta">
              Browse all 18<span aria-hidden="true" className="sw-hero__go">→</span>
            </Ln>
            <Ln to="#quickstart" className="sw-btn sw-btn--ghost">Quick start</Ln>
          </div>
          <p className="cxi-hero__note">Modular packages: install only what you need. Every connector is published on npm under Apache-2.0.</p>
        </div>
        <IconGrid />
      </div>
    </section>
  )
}

/* ── one contract, many sources ── */

function Featured({ c, i }: { c: Connector; i: number }) {
  return (
    <Ln to={`/connectors/${c.slug}`} className="sw-card cxi-feature" style={{ ['--i' as string]: i }}>
      <span className="cxi-feature__logo"><Mark c={c} size={30} /></span>
      <span className="cxi-shape">{CARD[c.slug].shape}</span>
      <b className="cxi-feature__name">{c.name}</b>
      <p>{c.hero.sub}</p>
      <span className="cxi-feature__more">See the {c.name} page <ArrowRight size={16} aria-hidden="true" /></span>
      {c.status === 'preview' && <span className="cxi-pill">Preview</span>}
    </Ln>
  )
}

function Compact({ c }: { c: Connector }) {
  return (
    <Ln to={`/connectors/${c.slug}`} className="cxi-item">
      <span className="cxi-item__logo"><Mark c={c} size={24} /></span>
      <span className="cxi-item__text">
        <b>{c.name}{c.status === 'preview' && <em className="cxi-pill">Preview</em>}</b>
        <span>{CARD[c.slug].line}</span>
      </span>
      <ArrowRight size={16} aria-hidden="true" className="cxi-item__go" />
    </Ln>
  )
}

const SUBJECTS = ['repo:', 'team:', 'community:', 'customer:', 'relationship:', 'project:', 'workflow:']

function Contract() {
  const [ref, seen] = useSeen<HTMLDivElement>()
  const [filter, setFilter] = useState<Group | 'All'>('All')
  const groups = GROUPS.filter(g => filter === 'All' || g.group === filter)
  return (
    <section className="sw-section" aria-label="All connectors">
      <div className="sw-wrap">
        <div className="cxi-head">
          <Eyebrow>Connectors and integrations</Eyebrow>
          <H2 a="One contract," b="many sources." />
          <p className="sw-lede">
            Every connector turns its tool’s events into the same episode shape, filed under a subject. Agents ask for
            memory by subject, without caring which tool it came from.
          </p>
          <div className="cxi-subjects" aria-label="Subject prefixes">
            {SUBJECTS.map(s => <code key={s} className="sw-mono">{s}</code>)}
          </div>
        </div>

        <div ref={ref} className="cxi-features" data-seen={seen || undefined}>
          {FEATURED.map((s, i) => CONNECTORS[s] && <Featured key={s} c={CONNECTORS[s]} i={i} />)}
        </div>

        <div id="all" className="cxi-all">
          <div className="cxi-all__bar">
            <h3 className="cxi-all__title">All 18 connectors</h3>
            <div className="cxi-filters" role="group" aria-label="Filter by type">
              {(['All', ...GROUPS.map(g => g.group)] as const).map(g => (
                <button key={g} type="button" aria-pressed={filter === g} onClick={() => setFilter(g)}>{g}</button>
              ))}
            </div>
          </div>
          {groups.map(g => (
            <div key={g.group} className="cxi-group">
              <span className="cxi-group__label">{g.group}<i>{g.slugs.length}</i></span>
              <div className="cxi-items">
                {g.slugs.map(s => CONNECTORS[s] && <Compact key={s} c={CONNECTORS[s]} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── modular by design ── */

const INSTALL = [
  '# Pick what you need. Every package is independent.',
  'npm install @statewavedev/connectors-github',
  'npm install @statewavedev/connectors-slack',
  'npm install @statewavedev/connectors-zendesk',
  'npm install @statewavedev/connectors-jira',
  'npm install @statewavedev/connectors-database',
  'npm install @statewavedev/mcp-server',
]

const FEATURES = [
  'Each connector reads only its own credentials.',
  'Dry-run first: preview the mapped episodes before anything is sent.',
  'Best-effort redaction of emails, phone numbers and API keys, when you opt in.',
  'Stable idempotency keys, so re-running a sync never stores anything twice.',
]

function Modular() {
  const [ref, seen] = useSeen<HTMLDivElement>()
  return (
    <section className="sw-section sw-section--tint" aria-label="Modular by design">
      <div className="sw-wrap cxi-split">
        <div>
          <Eyebrow>Modular architecture</Eyebrow>
          <H2 a="Modular by design." b="Install only what you run." />
          <p className="sw-lede">
            Each connector ships as its own package. GitHub doesn’t pull in Slack, Notion or Gmail, and credentials stay
            scoped to the connector that uses them. Not running Node? The runner container runs the same connectors from a
            small config file.
          </p>
          <ul className="cxi-features-list">
            {FEATURES.map(f => <li key={f}><span><Check size={14} aria-hidden="true" /></span>{f}</li>)}
          </ul>
        </div>
        <div ref={ref} className="cxi-term" data-seen={seen || undefined}>
          <div className="cxi-term__bar"><i /><i /><i /><span>install, pick what you need</span></div>
          <pre>
            {INSTALL.map((l, i) => (
              <span key={l} className={l.startsWith('#') ? 'is-comment' : undefined} style={{ ['--i' as string]: i }}>
                {!l.startsWith('#') && <b>$ </b>}{l}{'\n'}
              </span>
            ))}
            <span className="cxi-term__caret" style={{ ['--i' as string]: INSTALL.length }}><b>$ </b><i /></span>
          </pre>
          <p className="cxi-term__note">
            <code className="sw-mono">@statewavedev/connectors</code> re-exports every connector, for the rare case you want them all.
            You don’t need it.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ── quick start ── */

const STEPS = [
  { title: 'Try repo memory', slug: 'github', cmd: 'statewave-connectors sync github \\\n  --repo smaramwbc/statewave \\\n  --subject repo:smaramwbc/statewave \\\n  --dry-run' },
  { title: 'Add your docs and ADRs', slug: 'markdown', cmd: 'statewave-connectors sync markdown \\\n  --path ./docs \\\n  --subject repo:smaramwbc/statewave \\\n  --dry-run' },
  { title: 'Give your assistant the memory', slug: 'mcp-server', cmd: 'statewave-connectors mcp start' },
]

function Step({ s, i }: { s: (typeof STEPS)[number]; i: number }) {
  const [done, copy] = useCopy(s.cmd.replace(/\\\n\s+/g, ''))
  const c = CONNECTORS[s.slug]
  return (
    <article className="sw-card cxi-step">
      <div className="cxi-step__head">
        <span className="sw-mono">0{i + 1}</span>
        <b>{s.title}</b>
        {c && <Ln to={`/connectors/${s.slug}`} className="cxi-step__link">{c.name} page →</Ln>}
      </div>
      <div className="cxi-step__code">
        <button type="button" onClick={copy} aria-label={done ? 'Copied' : 'Copy command'}>
          {done ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
        </button>
        <pre><code>{s.cmd}</code></pre>
      </div>
    </article>
  )
}

function QuickStart() {
  return (
    <section id="quickstart" className="sw-section cxi-anchor" aria-label="Quick start">
      <div className="sw-wrap">
        <div className="cxi-head">
          <Eyebrow>Quick start</Eyebrow>
          <H2 a="Dry-run first," b="ingest when it looks right." />
          <p className="sw-lede">
            Every connector supports --dry-run: episodes are printed, not sent. The CLI won’t ingest until STATEWAVE_URL is set.
          </p>
        </div>
        <div className="cxi-steps">{STEPS.map((s, i) => <Step key={s.slug} s={s} i={i} />)}</div>
      </div>
    </section>
  )
}

/* ── faq and close ── */

/** The /connectors entries in lib/page-faqs, the same data usePageSEO emits as FAQPage JSON-LD,
 *  so the visible questions and the structured data can't drift. */
const FAQ = PAGE_FAQS['/connectors'] ?? []

function Faq() {
  return (
    <section className="sw-section sw-section--tint" aria-label="Frequently asked questions">
      <div className="sw-wrap">
        <div className="cxi-head cxi-head--center">
          <Eyebrow>FAQ</Eyebrow>
          <H2 a="Questions about connectors" />
        </div>
        <div className="sw-faq">
          {FAQ.map((e, i) => (
            <details key={e.question} {...(i === 0 ? { open: true } : {})}>
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

function Close() {
  const cmd = 'npx @statewavedev/connectors-cli quickstart'
  const [done, copy] = useCopy(cmd)
  return (
    <section className="cxi-close" aria-label="Get started" data-nav-tone="dark">
      <div className="sw-wrap cxi-close__in">
        <h2 className="cxi-close__title">Don’t see your tool?<br /><span className="sw-hero__grad">Send episodes from anywhere.</span></h2>
        <p>Route other tools through Zapier or n8n, or post episodes to the API from your own code.</p>
        <div className="sw-hero__cmd cxi-close__cmd">
          <span aria-hidden="true" className="sw-hero__prompt">$</span>
          <code className="sw-mono">{cmd}</code>
          <button type="button" className="sw-hero__copy" onClick={copy} aria-label={done ? 'Copied' : 'Copy command'}>
            {done ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
          </button>
        </div>
        <div className="cxi-close__links">
          <Ln to="/connectors/zapier">Zapier helper →</Ln>
          <Ln to="/connectors/n8n">n8n connector →</Ln>
          <Ln to={REPO}>Connectors on GitHub →</Ln>
        </div>
      </div>
    </section>
  )
}

export function ConnectorsIndexPage() {
  usePageSEO()
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    root.current?.setAttribute('data-armed', '')
    if (new URLSearchParams(window.location.search).has('capture')) root.current?.setAttribute('data-capture', '')
  }, [])
  return (
    <div ref={root} className="sw-home cxi">
      <Hero />
      <Contract />
      <Divider />
      <Modular />
      <QuickStart />
      <Faq />
      <Close />
    </div>
  )
}
