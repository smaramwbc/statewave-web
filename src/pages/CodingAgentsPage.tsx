import { useEffect, useRef, useState } from 'react'
import { ArrowRight, GitCommitHorizontal, KeyRound, Play, Plug, Receipt, SquareTerminal } from 'lucide-react'
import { Eyebrow, H2, Icon, Ln } from '../components/home/ui'
import { useSeen } from '../components/home/hooks'
import { logo } from '../components/home/links'
import { CopyCmd, Terminal } from '../components/use-case/Terminal'
import type { TerminalTab } from '../components/use-case/Terminal'
import { PAGE_FAQS } from '../lib/page-faqs'
import { usePageSEO } from '../lib/seo'
import '../components/home/home-b.css'
import '../components/use-case/coding-agents.css'

/* /use-cases/coding-agents in the v8 style. Its sections follow the connector pages' layout, under
 * their own .ca classes, so the two read as one family. Facts come from the statewave-connectors
 * READMEs and the published CLI: the client table and the instruction block are what `mcp init`
 * writes. The ADR and the PR review are the homepage's coding-agent example. Subjects use the
 * dotted form (repo:acme.widgets): the server and the MCP tools reject a '/' in a subject id. */

const SUBJECT = 'repo:acme.widgets'
const QUICKSTART = 'npx @statewavedev/connectors-cli quickstart'
const DOCS = 'https://github.com/smaramwbc/statewave-docs/blob/main'
const EXAMPLE = 'https://github.com/smaramwbc/statewave-connectors/tree/main/examples/repo-memory-quickstart'

/** "Give Claude Code a Memory with MCP" (STATEWAVE_VIDEOS_TO_PUBLISH.md, B5). Paste its YouTube URL
 *  here once it's uploaded; until then the video section and the hero link to it stay hidden. */
const VIDEO_URL = ''
const VIDEO_TITLE = 'Give Claude Code a Memory with MCP'

/** The 11-character id from a youtube.com/watch?v=, youtu.be/, /embed/ or /shorts/ URL. */
function youtubeId(url: string): string | null {
  return url.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{11})/)?.[1] ?? null
}
const VIDEO_ID = youtubeId(VIDEO_URL)

/** Lets a subject wrap after its prefix (repo:) on a narrow card instead of mid-word. */
const breakable = (subject: string) => subject.split(/(?<=:)/).flatMap((part, i) => (i ? [<wbr key={i} />, part] : [part]))

/* ── hero: repo → Statewave → agent ── */

function Tile({ name, label, mark }: { name: string; label: string; mark: string }) {
  return (
    <div className="ca-tile">
      <span className="ca-tile__box"><img src={mark} alt="" width={40} height={40} /></span>
      <span className="ca-tile__name">{name}</span>
      <code className="sw-mono ca-tile__label">{breakable(label)}</code>
    </div>
  )
}

const Wire = () => <span className="ca-wire"><i /><i /><i /></span>

function Hero() {
  return (
    <section className="sw-hero ca-hero" aria-label="Coding agents">
      <div className="sw-hero__beams" aria-hidden="true">
        {[[14, 24, 0.18], [30, 24, 0.1], [74, -22, 0.14], [90, -22, 0.08]].map(([l, r, o]) => (
          <i key={l} style={{ left: `${l}%`, transform: `rotate(${r}deg)`, ['--o' as string]: o }} />
        ))}
      </div>
      <div className="sw-hero__in">
        <nav className="ca-crumbs" aria-label="Breadcrumb">
          <Ln to="/use-cases">Use cases</Ln><span aria-hidden="true">/</span>
          <span aria-current="page">Coding agents</span>
        </nav>
        <div className="ca-link" aria-hidden="true">
          <Tile name="Your repo" label="issues · PRs · ADRs" mark={logo('github')} />
          <Wire />
          <Tile name="Statewave" label={SUBJECT} mark="/brand/icon.svg" />
          <Wire />
          <Tile name="Your agent" label="over MCP" mark={logo('modelcontextprotocol')} />
        </div>
        <h1 className="sw-hero__title ca-title">
          Stop re-explaining your repo<br /> <span className="sw-hero__grad">to your coding agent.</span>
        </h1>
        <p className="sw-hero__sub">
          Statewave keeps one memory per repository, built from its issues, pull requests, reviews, ADRs and commits.
          Claude Code, Cursor, Copilot and Codex read it over MCP, with a source for every answer.
        </p>
        <ul className="ca-badges" aria-label="Setup facts">
          <li className="is-ok">One command</li>
          <li>Runs on your machine</li>
          <li>Apache-2.0</li>
        </ul>
        <CopyCmd cmd={QUICKSTART} hero />
        <div className="sw-hero__ctas">
          <Ln to="#setup" className="sw-btn sw-btn--solid sw-hero__cta">
            Set it up
            <span aria-hidden="true" className="sw-hero__go">→</span>
          </Ln>
          {VIDEO_ID
            ? <Ln to="#demo" className="sw-btn sw-btn--ghost">Watch the demo</Ln>
            : <Ln to="/connectors/mcp-server" className="sw-btn sw-btn--ghost">The MCP server</Ln>}
        </div>
      </div>
    </section>
  )
}

/* ── story: what the team wrote down, kept per repo, recalled in the editor ── */

function SourceCard() {
  return (
    <div className="ca-card ca-src">
      <div className="ca-card__bar"><span>Written down by the team</span></div>
      <ul>
        <li>
          <span className="ca-src__mark"><Icon name="markdown" size={16} /></span>
          <div>
            <b className="sw-mono">docs/adr/007.md</b>
            <p>Job queue runs on Postgres advisory locks, not Redis.</p>
            <code className="sw-mono">docs.adr</code>
          </div>
        </li>
        <li>
          <span className="ca-src__mark"><Icon name="github" size={16} /></span>
          <div>
            <b>PR #212 review</b>
            <p>Stick to pnpm workspaces, Vitest and named exports.</p>
            <code className="sw-mono">github.pr.review</code>
          </div>
        </li>
        <li>
          <span className="ca-src__mark"><GitCommitHorizontal size={16} aria-hidden="true" /></span>
          <div>
            <b>Recent commits</b>
            <p>What changed lately, and the message that says why.</p>
            <code className="sw-mono">git.commit</code>
          </div>
        </li>
      </ul>
    </div>
  )
}

function MemoryCard() {
  return (
    <div className="ca-card ca-episode">
      <span className="ca-kind sw-mono">compiled memory</span>
      <div className="ca-episode__subject">
        <span>subject</span>
        <code className="sw-mono">{breakable(SUBJECT)}</code>
      </div>
      <ol className="ca-mem">
        <li><p>Job queue uses Postgres advisory locks, not Redis.</p><code className="sw-mono">← docs/adr/007.md</code></li>
        <li><p>pnpm workspaces, Vitest, named exports.</p><code className="sw-mono">← PR #212 review</code></li>
      </ol>
      <div className="ca-episode__lane">
        <i className="ca-pulse" />
        <code className="sw-mono">3 sources</code>
        <span>each memory keeps its source</span>
      </div>
    </div>
  )
}

function AnswerCard() {
  return (
    <div className="ca-card ca-chat">
      <div className="ca-chat__q">
        <span>You · Claude Code</span>
        <p>Where should the new export job run?</p>
      </div>
      <div className="ca-chat__a">
        <p>On the existing job queue. It runs on Postgres advisory locks, not Redis (ADR 007). Write its tests in Vitest, as the PR #212 review asked.</p>
        <div className="ca-chat__src">
          <span>Sources</span>
          <em className="sw-mono">docs/adr/007.md</em>
          <em className="sw-mono">PR #212 review</em>
        </div>
      </div>
      <code className="ca-chat__call sw-mono">statewave_get_context("{SUBJECT}")</code>
    </div>
  )
}

const STORY = [
  { title: 'Your team already wrote it down', text: 'Why the queue avoids Redis is in an ADR. How tests get written is in a review thread. The code shows neither.', Card: SourceCard },
  { title: 'Statewave keeps it per repository', text: 'The GitHub and Markdown connectors file each item under the repo’s subject, where it compiles into memories that keep their source.', Card: MemoryCard },
  { title: 'Your agent checks before it answers', text: 'Claude Code calls statewave_get_context over MCP, gets a compact, ranked bundle for the repo, and answers with the sources.', Card: AnswerCard },
]

function Story() {
  const [ref, seen] = useSeen<HTMLOListElement>()
  return (
    <section className="ca-section ca-story" aria-label="How it works">
      <div className="ca-wrap">
        <div className="ca-head">
          <Eyebrow>How it works</Eyebrow>
          <H2 a="The code shows what." b="Memory knows why." />
          <p className="sw-lede">
            A coding agent can read every file and still not know why the job queue avoids Redis. Statewave gives it the
            history behind the code, one memory per repository.
          </p>
        </div>
        <ol ref={ref} className="ca-story__row" data-seen={seen || undefined}>
          {STORY.map(({ title, text, Card }, i) => (
            <li key={title} style={{ ['--i' as string]: i }}>
              <div className="ca-story__text">
                <span className="ca-story__n sw-mono">0{i + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
              <div className="ca-panel-wrap">
                <div className="ca-panel"><Card /></div>
                {i < 2 && <i className="ca-hop" aria-hidden="true" />}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ── demo video (hidden until VIDEO_URL is set): a still that loads the player on click ── */

function Demo() {
  const [playing, setPlaying] = useState(false)
  if (!VIDEO_ID) return null
  return (
    <section id="demo" className="ca-demo ca-anchor" aria-label="Demo video" data-nav-tone="dark">
      <div className="ca-wrap">
        <div className="ca-head ca-head--center">
          <Eyebrow dark>Watch</Eyebrow>
          <h2 className="ca-demo__title">{VIDEO_TITLE}</h2>
          <p className="ca-demo__lede">
            One command writes the MCP config and the instruction that makes Claude use it. Then a brand new session,
            which has never seen the conversation, is asked what was decided, and the decision comes back.
          </p>
        </div>
        <div className="ca-video">
          {playing ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
              title={VIDEO_TITLE}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button type="button" onClick={() => setPlaying(true)} aria-label={`Play the video: ${VIDEO_TITLE}`}>
              <img src={`https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`} alt="" loading="lazy" />
              <span className="ca-video__play"><Play size={28} aria-hidden="true" /></span>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

/* ── the three packages ── */

const PACKAGES = [
  {
    slug: 'github', icon: 'github', role: 'Feeds it', name: 'GitHub connector',
    text: 'Issues, pull requests, comments, reviews and releases. A merged pull request gets its own episode, so “what landed last week?” has an answer.',
    kinds: ['github.pr.merged', 'github.pr.review', 'github.issue.opened'],
  },
  {
    slug: 'markdown', icon: 'markdown', role: 'Feeds it', name: 'Markdown & docs',
    text: 'ADRs, RFCs, decision docs and pages from the folder you point it at. It runs on your machine, needs no credentials and calls nothing but the ingest.',
    kinds: ['docs.adr', 'docs.rfc', 'docs.decision', 'docs.page'],
  },
  {
    slug: 'mcp-server', icon: 'modelcontextprotocol', role: 'Reads it', name: 'MCP server',
    text: 'Gives Claude Code, Cursor, Copilot and Codex tools to read that memory and save new decisions to it. statewave_get_context is the one they call first.',
    kinds: ['statewave_get_context', 'statewave_search_memories', 'statewave_ingest_episode'],
  },
]

function Packages() {
  const [ref, seen] = useSeen<HTMLDivElement>()
  return (
    <section className="ca-section ca-section--white" aria-label="What you install">
      <div className="ca-wrap">
        <div className="ca-head">
          <Eyebrow>What you install</Eyebrow>
          <H2 a="Two connectors feed it." b="One MCP server reads it." />
          <p className="sw-lede">Each ships as its own npm package under Apache-2.0. Install only what you use.</p>
        </div>
        <div ref={ref} className="ca-pkgs" data-seen={seen || undefined}>
          {PACKAGES.map((p, i) => (
            <Ln key={p.slug} to={`/connectors/${p.slug}`} className="ca-pkg" style={{ ['--i' as string]: i }}>
              <span className="ca-pkg__logo"><Icon name={p.icon} size={26} /></span>
              <span className="ca-pkg__role">{p.role}</span>
              <b className="ca-pkg__name">{p.name}</b>
              <p>{p.text}</p>
              <span className="ca-pkg__kinds">{p.kinds.map(k => <code key={k} className="sw-mono">{k}</code>)}</span>
              <span className="ca-pkg__more">See the {p.name} page <ArrowRight size={16} aria-hidden="true" /></span>
            </Ln>
          ))}
        </div>
        <p className="ca-note">
          The quickstart also seeds the repo’s recent commits and README, so the first question has an answer before you
          sync anything.
        </p>
      </div>
    </section>
  )
}

/* ── setup ── */

const STEPS = [
  { title: 'It starts a server, or reuses yours', text: 'If a Statewave server is already healthy on your machine, the quickstart uses it. If not, it starts one with Docker Compose, admin dashboard included.' },
  { title: 'It wires your assistants', text: 'Pick from the clients it finds: Claude Code, Claude Desktop, Cursor, VS Code with Copilot and Codex. Each gets its MCP config and the memory instructions.' },
  { title: 'It seeds the repo', text: 'Recent commits and the README become episodes under the repo’s subject, and the subject compiles. It checks they landed before it reports success.' },
  { title: 'You add the history', text: 'Sync GitHub and your docs folder into the same subject. Dry-run first: episodes are printed, not sent.' },
]

const ENV = [
  { name: 'STATEWAVE_URL', when: 'Syncs', text: 'Your Statewave instance. The CLI won’t ingest without it. The quickstart’s server is http://localhost:8100.' },
  { name: 'STATEWAVE_API_KEY', when: 'Optional', text: 'Only if your instance enforces auth. Read from the environment, never written to a config file.' },
  { name: 'GITHUB_TOKEN', when: 'GitHub', text: 'Optional for public repos, but the unauthenticated rate limit is small. Only the GitHub connector reads it.' },
]

const TABS: TerminalTab[] = [
  {
    label: 'Quickstart',
    env: [],
    cmd: QUICKSTART,
    notes: [
      'Safe to re-run: existing servers and configs are reused',
      'No Node? The bootstrap script installs it first, and asks before it does',
      'Stop the stack later with quickstart --down',
    ],
  },
  {
    label: 'By hand',
    env: ['STATEWAVE_URL=http://localhost:8100'],
    cmd: 'statewave-connectors mcp init claude --write && statewave-connectors mcp seed --write',
    notes: [
      'mcp init writes .mcp.json and a block in CLAUDE.md',
      'mcp seed reads only local git history and the README, so it needs no GitHub token',
      'Without --write, both print what they would do and change nothing',
    ],
  },
  {
    label: 'GitHub',
    env: ['STATEWAVE_URL=http://localhost:8100', 'GITHUB_TOKEN=ghp_…'],
    cmd: `statewave-connectors sync github --repo acme/widgets --subject ${SUBJECT} --dry-run`,
    outputLabel: 'Printed, not sent. Drop --dry-run to ingest.',
    output: `{
  "subject": "${SUBJECT}",
  "kind": "github.issue.opened",
  "text": "ada opened issue #42: CI is flaky…",
  "source": {
    "type": "github.issue",
    "url": "https://github.com/acme/widgets/issues/42"
  }
}`,
  },
  {
    label: 'Docs',
    env: ['STATEWAVE_URL=http://localhost:8100'],
    cmd: `statewave-connectors sync markdown --path ./docs --subject ${SUBJECT} --dry-run`,
    outputLabel: 'Printed, not sent. Drop --dry-run to ingest.',
    output: `{
  "subject": "${SUBJECT}",
  "kind": "docs.adr",
  "text": "Job queue on Postgres advisory locks…",
  "source": {
    "type": "markdown",
    "id": "docs/adr/007.md"
  }
}`,
  },
]

function Setup() {
  return (
    <section id="setup" className="ca-section ca-anchor" aria-label="Set up">
      <div className="ca-wrap">
        <div className="ca-head">
          <Eyebrow>Set up</Eyebrow>
          <H2 a="One command." b="Then ask about your repo." />
        </div>
        <div className="ca-setup">
          <div>
            <ol className="ca-steps">
              {STEPS.map((s, i) => (
                <li key={s.title}>
                  <span className="sw-mono">{i + 1}</span>
                  <div><b>{s.title}</b><p>{s.text}</p></div>
                </li>
              ))}
            </ol>
            <details className="ca-env">
              <summary>Environment variables <span>{ENV.length}</span></summary>
              <dl>
                {ENV.map(e => (
                  <div key={e.name}><dt className="sw-mono">{e.name}</dt><dd><em>{e.when}</em>{e.text}</dd></div>
                ))}
              </dl>
            </details>
          </div>
          <Terminal tabs={TABS} />
        </div>
      </div>
    </section>
  )
}

/* ── what mcp init writes, per client ── */

const BLOCK = `<!-- statewave:begin (managed by \`statewave-connectors mcp init\`) -->
**Statewave memory** — MCP server \`statewave\`, subject \`${SUBJECT}\`.
Before answering questions about this project, call \`statewave_get_context\` (that subject, \`query\` = the ask) and ground your answer in it.
When the user states a durable fact or decision, call \`statewave_ingest_episode\` then \`statewave_compile_subject\` (same subject). Never invent Statewave results.
<!-- statewave:end -->`

const ARGS = '["-y", "@statewavedev/mcp-server"]'
const ENTRY_ENV = '{ "STATEWAVE_URL": "http://localhost:8100" }'

const jsonConfig = (key: string, stdio?: boolean) => `{
  "${key}": {
    "statewave": {${stdio ? '\n      "type": "stdio",' : ''}
      "command": "npx",
      "args": ${ARGS},
      "env": ${ENTRY_ENV}
    }
  }
}`

const tomlConfig = `[mcp_servers.statewave]
command = "npx"
args = ${ARGS}
env = { STATEWAVE_URL = "http://localhost:8100" }`

const CLIENTS = [
  { id: 'claude', name: 'Claude Code', icon: 'claude', config: '.mcp.json', body: jsonConfig('mcpServers'), instructions: 'CLAUDE.md', note: 'Restart Claude Code to load the server. CLAUDE.md loads every session.' },
  { id: 'cursor', name: 'Cursor', icon: 'cursor', config: '.cursor/mcp.json', body: jsonConfig('mcpServers'), instructions: 'AGENTS.md', note: 'Switch the server on in Settings → MCP. Agent mode reads AGENTS.md.' },
  { id: 'vscode', name: 'VS Code with Copilot', icon: 'githubcopilot', config: '.vscode/mcp.json', body: jsonConfig('servers', true), instructions: '.github/copilot-instructions.md', note: 'Reload the window. Copilot reads the instructions in Agent mode.' },
  { id: 'codex', name: 'Codex CLI', icon: 'openai', config: '~/.codex/config.toml', body: tomlConfig, instructions: 'AGENTS.md', note: 'The config is per user; AGENTS.md stays with the repo.' },
  { id: 'claude-desktop', name: 'Claude Desktop', icon: 'claude', config: 'claude_desktop_config.json', body: jsonConfig('mcpServers'), instructions: null, note: 'A chat app has no instructions file: paste the block into Settings → Custom Instructions.' },
]

function Files() {
  const [i, setI] = useState(0)
  const c = CLIENTS[i]
  return (
    <section className="ca-section ca-section--white" aria-label="What it writes">
      <div className="ca-wrap">
        <div className="ca-head">
          <Eyebrow>What it writes</Eyebrow>
          <H2 a="It reads before it answers." b="And saves what you decide." />
          <p className="sw-lede">
            For each assistant, <code className="sw-mono">mcp init</code> writes the Statewave MCP server into its config
            and adds a short instruction block. The block is what gets the tools used: check memory before answering, save
            the decisions you state. Re-running replaces the block instead of adding another.
          </p>
        </div>
        <div className="ca-files">
          <div className="ca-clients" role="radiogroup" aria-label="Assistant">
            {CLIENTS.map((x, k) => (
              <button key={x.id} type="button" role="radio" aria-checked={k === i} onClick={() => setI(k)}>
                <span className="ca-clients__logo"><Icon name={x.icon} size={18} /></span>
                <b>{x.name}</b>
                <span>{x.config}</span>
              </button>
            ))}
          </div>
          <div className="ca-file-pair" key={c.id}>
            <div className="ca-file">
              <div className="ca-file__bar"><span>MCP config</span><code className="sw-mono">{c.config}</code></div>
              <pre>{c.body}</pre>
            </div>
            <div className="ca-file">
              <div className="ca-file__bar">
                <span>Instructions</span>
                <code className="sw-mono">{c.instructions ?? 'Custom Instructions'}</code>
              </div>
              <pre>{BLOCK}</pre>
            </div>
            <p className="ca-file-pair__note">{c.note}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── trust ── */

const SAFE = [
  { icon: <SquareTerminal size={18} />, text: 'Every sync has --dry-run, and the CLI won’t ingest until STATEWAVE_URL is set.' },
  { icon: <KeyRound size={18} />, text: 'API keys stay in your environment. mcp init never writes them into a config file.' },
  { icon: <Plug size={18} />, text: 'Over stdio, each assistant starts its own server process. Nothing listens on a port.' },
  { icon: <Receipt size={18} />, text: 'A receipt can record what went into each context bundle. Label policies only log until you turn on enforce mode.' },
]

const LIMITS = [
  'The GitHub and Markdown connectors and the MCP server are previews.',
  'A GitHub sync is a pull: run it again to pick up new activity. Re-runs are safe, since every episode has a stable idempotency key.',
  'The quickstart needs Docker, unless you point it at a running server with --statewave-url.',
  'The MCP server reads and writes memory but doesn’t fetch from GitHub. The connectors do that.',
]

function Trust() {
  return (
    <section className="ca-section" aria-label="Safety and limits">
      <div className="ca-wrap">
        <div className="ca-head">
          <Eyebrow>Safe by default</Eyebrow>
          <H2 a="Local by default." b="You choose what goes in." />
        </div>
        <ul className="ca-safe">
          {SAFE.map(s => <li key={s.text}><span aria-hidden="true">{s.icon}</span>{s.text}</li>)}
        </ul>
        <div className="ca-limits">
          <b>Good to know</b>
          <ul>{LIMITS.map(l => <li key={l}>{l}</li>)}</ul>
        </div>
      </div>
    </section>
  )
}

/* ── faq and close ── */

/** The same entries usePageSEO emits as FAQPage JSON-LD, so the visible questions and the
 *  structured data can't drift. */
const FAQ = PAGE_FAQS['/use-cases/coding-agents'] ?? []

function Faq() {
  return (
    <section className="ca-section ca-section--white" aria-label="Frequently asked questions">
      <div className="ca-wrap">
        <div className="ca-head ca-head--center">
          <Eyebrow>FAQ</Eyebrow>
          <H2 a="Questions about coding agent memory" />
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
  return (
    <section className="ca-close" aria-label="Get started" data-nav-tone="dark">
      <div className="ca-wrap ca-close__in">
        <span className="ca-close__logo"><img src="/brand/icon.svg" alt="" width={36} height={36} /></span>
        <h2 className="ca-close__title">Give your coding agent<br /><span className="sw-hero__grad">the memory of the repo.</span></h2>
        <CopyCmd cmd={QUICKSTART} />
        <div className="ca-close__more">
          <span>Built from</span>
          {PACKAGES.map(p => (
            <Ln key={p.slug} to={`/connectors/${p.slug}`} className="ca-pill"><img src={logo(p.icon)} alt="" width={16} height={16} />{p.name}</Ln>
          ))}
          <Ln to="/connectors" className="ca-pill">All 18 <ArrowRight size={14} aria-hidden="true" /></Ln>
        </div>
        <div className="ca-close__links">
          <Ln to={EXAMPLE}>Repo memory example →</Ln>
          <Ln to={`${DOCS}/connectors/mcp.md`}>MCP server docs →</Ln>
          <Ln to="/use-cases">All use cases →</Ln>
        </div>
      </div>
    </section>
  )
}

export function CodingAgentsPage() {
  // Title, description and canonical come from the /use-cases/coding-agents entry in lib/seo-meta.
  usePageSEO()
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    root.current?.setAttribute('data-armed', '')
    if (new URLSearchParams(window.location.search).has('capture')) root.current?.setAttribute('data-capture', '')
  }, [])
  return (
    <div ref={root} className="sw-home ca">
      <Hero />
      <Story />
      <Demo />
      <Packages />
      <Setup />
      <Files />
      <Trust />
      <Faq />
      <Close />
    </div>
  )
}
