import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowRight, GitCommitHorizontal, KeyRound, Play, Plug, Receipt, SquareTerminal } from 'lucide-react'
import { Divider, Eyebrow, H2, Icon, Ln } from '../components/home/ui'
import { usePrefersReducedMotion, useSeen } from '../components/home/hooks'
import { logo } from '../components/home/links'
import { AgentTerminal } from '../components/use-case/AgentTerminal'
import { CopyCmd, Terminal } from '../components/use-case/Terminal'
import type { TerminalTab } from '../components/use-case/Terminal'
import { PAGE_FAQS } from '../lib/page-faqs'
import { usePageSEO } from '../lib/seo'
import '../components/home/home-b.css'
import '../components/use-case/coding-agents.css'

/* /use-cases/coding-agents in the v8 style. It borrows from the home rather than the connector pages:
 * the hero, the pinned How it works stack (as layers of the repo's memory) and the pointer-drift
 * cards. Its own sections sit under .ca classes. Facts come from the statewave-connectors READMEs
 * and the published CLI: the client table and the instruction block are what `mcp init` writes.
 * The ADR and the PR review are the homepage's coding-agent example. Subjects use the dotted form
 * (repo:acme.widgets): the server and the MCP tools reject a '/' in a subject id. */

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

/* ── hero: a detail page's hero. Above the title, a small identity graphic: for use cases, the
 *    tools involved (connector pages use source → Statewave). Straight edge, no arc: the arc is the
 *    home's own, under its chat. ── */

const TOOLS = [
  { icon: 'claude', name: 'Claude Code' },
  { icon: 'cursor', name: 'Cursor' },
  { icon: 'githubcopilot', name: 'Copilot' },
  { icon: 'openai', name: 'Codex' },
]

function Hero() {
  return (
    <section className="sw-hero ca-hero" aria-label="Coding agents">
      <div className="sw-hero__beams" aria-hidden="true">
        {[[18, 24, 0.22], [34, 24, 0.12], [70, -22, 0.16], [86, -22, 0.1]].map(([l, r, o]) => (
          <i key={l} style={{ left: `${l}%`, transform: `rotate(${r}deg)`, ['--o' as string]: o }} />
        ))}
      </div>
      <div className="sw-hero__in">
        <nav className="ca-crumbs" aria-label="Breadcrumb">
          <Ln to="/use-cases">Use cases</Ln><span aria-hidden="true">/</span>
          <span aria-current="page">Coding agents</span>
        </nav>
        <ul className="ca-tools" aria-label="Works with">
          {TOOLS.map(t => (
            <li key={t.name}>
              <span className="ca-tools__box"><Icon name={t.icon} size={24} /></span>
              <span className="ca-tools__name">{t.name}</span>
            </li>
          ))}
        </ul>
        <h1 className="sw-hero__title ca-title">
          Stop re-explaining your repo<br /> <span className="sw-hero__grad">to your coding agent.</span>
        </h1>
        <p className="sw-hero__sub">
          Issues, reviews, ADRs and commits become a memory that Claude Code, Cursor, Copilot and Codex read over MCP.
        </p>
        <CopyCmd cmd={QUICKSTART} hero />
        <div className="sw-hero__ctas">
          <Ln to="#setup" className="sw-btn sw-btn--solid sw-hero__cta">
            Set it up
            <span aria-hidden="true" className="sw-hero__go">→</span>
          </Ln>
          {VIDEO_ID
            ? <Ln to="#demo" className="sw-btn sw-btn--ghost">Watch the demo</Ln>
            : <Ln to="#how" className="sw-btn sw-btn--ghost">How it works</Ln>}
        </div>
      </div>
    </section>
  )
}

/* ── how it works: the code shows what, memory knows why. An editor where each source adds its reason
 *    above the line it explains, in the order the memory is built, like a blame that shows the why
 *    instead of the author. Plays once when it scrolls into view, then holds still. Server HTML and
 *    reduced motion get the finished file. Not pinned: the home's How it works is. ── */

const WHY_STEPS = [
  { n: '01', t: 'Commits', ep: 'mcp seed --write', d: 'Recent commits and the README become the repo’s first memories.' },
  { n: '02', t: 'Issues & PRs', ep: 'sync github', d: 'Reviews and decisions from pull requests join the same subject.' },
  { n: '03', t: 'ADRs & docs', ep: 'sync markdown', d: 'Decision records sit next to the code they govern.' },
  { n: '04', t: 'Recall', ep: 'statewave_get_context', d: 'Before it edits, your agent asks, and gets the why with its source.' },
]

const kw = (s: string) => <span className="ca-k">{s}</span>
const str = (s: string) => <span className="ca-s">{s}</span>
const prop = (s: string) => <span className="ca-p">{s}</span>

/** The file in the editor. `why` is the step whose source explains the line. */
const CODE: Array<{ code: ReactNode; why?: { step: number; mark: ReactNode; ref: string; text: string } }> = [
  { code: <>{kw('import')} {'{ queue }'} {kw('from')} {str("'../queue'")}</> },
  { code: <>{kw('import')} {'{ exportRows }'} {kw('from')} {str("'./export'")}</> },
  { code: ' ' },
  {
    code: <>{kw('export const')} exportJob = queue.define({str("'export'")}, {'{'}</>,
    why: { step: 1, mark: <Icon name="github" size={14} />, ref: 'PR #212 review', text: 'named exports, tests in Vitest' },
  },
  {
    code: <>{'  '}{prop('lock')}: {str("'advisory'")},</>,
    why: { step: 2, mark: <Icon name="markdown" size={14} />, ref: 'ADR 007', text: 'Postgres advisory locks, not Redis' },
  },
  {
    code: <>{'  '}{prop('retry')}: {'{ '}{prop('backoff')}: {str("'exponential'")}{' }'},</>,
    why: { step: 0, mark: <GitCommitHorizontal size={14} aria-hidden="true" />, ref: 'a41c9e2', text: 'failed jobs retry with backoff' },
  },
  { code: <>{'  '}{prop('run')}: exportRows,</> },
  { code: '})' },
]

function Why() {
  const rm = usePrefersReducedMotion()
  const [ref, seen] = useSeen<HTMLDivElement>()
  const [shown, setShown] = useState(WHY_STEPS.length)

  // The server renders the finished file; on the client it resets, then plays once when seen.
  useEffect(() => {
    if (rm) return
    const id = setTimeout(() => setShown(0), 0)
    return () => clearTimeout(id)
  }, [rm])

  useEffect(() => {
    if (!seen || shown >= WHY_STEPS.length) return
    const id = setTimeout(() => setShown(shown + 1), shown === 0 ? 300 : 1000)
    return () => clearTimeout(id)
  }, [seen, shown])

  return (
    <section id="how" className="ca-section ca-why ca-anchor" aria-label="How it works" data-nav-tone="dark">
      <div className="ca-wrap">
        <div className="ca-head">
          <Eyebrow dark>How it works</Eyebrow>
          <H2 a="The code shows what." b="Memory knows why." />
          <p className="sw-lede">
            A coding agent can read every file and still not know why the job queue avoids Redis. Statewave keeps the
            history behind the code in one memory per repository, and hands your agent the why with its source.
          </p>
        </div>
        <div className="ca-why__grid">
          <ol className="ca-why__steps">
            {WHY_STEPS.map((s, i) => (
              <li key={s.n} data-on={i < shown || undefined}>
                <span className="sw-mono ca-why__n">{s.n}</span>
                <div>
                  <b className="ca-why__t">{s.t}</b>
                  <code className="sw-mono ca-why__ep">{s.ep}</code>
                  <p className="ca-why__d">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
          {/* the editor starts the sequence: on a phone it sits below the steps */}
          <div ref={ref} className="ca-editor">
            <div className="ca-editor__bar"><i /><i /><i /><span className="sw-mono">src/jobs/export-job.ts</span></div>
            <ol className="ca-editor__code">
              {CODE.map((l, i) => {
                const on = !!l.why && shown > l.why.step
                return (
                  <li key={i} data-why={on || undefined}>
                    {l.why && (
                      <div className="ca-lens" data-on={on || undefined}>
                        <div>
                          <span className="ca-lens__in">
                            <span className="ca-lens__mark">{l.why.mark}</span>
                            <b>{l.why.ref}</b><span>{l.why.text}</span>
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="ca-editor__line">
                      <span className="ca-editor__n">{i + 1}</span>
                      <code className="sw-mono">{l.code}</code>
                    </div>
                  </li>
                )
              })}
            </ol>
            <p className="ca-editor__recall" data-on={shown >= WHY_STEPS.length || undefined}>
              <b>●</b> statewave · get_context(<em>repo:acme.widgets</em>) <span>→ 3 memories, each with its source</span>
            </p>
          </div>
        </div>
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

/* ── the three packages: each card plays its own small scene once when the row scrolls into view,
 *    an event arriving, a file being picked up, a call being answered. Server HTML shows the end. ── */

const PACKAGES = [
  {
    slug: 'github', icon: 'github', role: 'Feeds it', name: 'GitHub connector',
    text: 'Issues, pull requests, comments, reviews and releases. A merged pull request gets its own episode, so “what landed last week?” has an answer.',
  },
  {
    slug: 'markdown', icon: 'markdown', role: 'Feeds it', name: 'Markdown & docs',
    text: 'ADRs, RFCs, decision docs and pages from the folder you point it at. It runs on your machine, needs no credentials and calls nothing but the ingest.',
  },
  {
    slug: 'mcp-server', icon: 'modelcontextprotocol', role: 'Reads it', name: 'MCP server',
    text: 'Gives Claude Code, Cursor, Copilot and Codex tools to read that memory and save new decisions to it. statewave_get_context is the one they call first.',
  },
]

const FEED = [
  ['github.issue.opened', '#42 · CI is flaky'],
  ['github.pr.review', 'PR #212 review · use Vitest'],
  ['github.pr.merged', 'PR #212 merged'],
]
const TREE: Array<[string, number, boolean?]> = [
  ['docs/', 0], ['adr/', 1], ['006-cache.md', 2], ['007-job-queue.md', 2, true], ['setup.md', 1],
]

function Scene({ slug }: { slug: string }) {
  if (slug === 'github') {
    return (
      <ol className="ca-scene ca-scene--feed">
        {FEED.map(([kind, text], i) => (
          <li key={kind} style={{ ['--d' as string]: i }}><code className="sw-mono">{kind}</code><span>{text}</span></li>
        ))}
      </ol>
    )
  }
  if (slug === 'markdown') {
    return (
      <ul className="ca-scene ca-scene--tree">
        {TREE.map(([name, depth, hit], i) => (
          <li key={name} data-hit={hit || undefined} style={{ ['--d' as string]: i, ['--depth' as string]: depth }}>
            <span className="sw-mono">{name}</span>{hit && <code className="sw-mono">docs.adr</code>}
          </li>
        ))}
      </ul>
    )
  }
  return (
    <div className="ca-scene ca-scene--call">
      <p style={{ ['--d' as string]: 0 }}><b>→</b> <span className="sw-mono">get_context(</span></p>
      <p className="ca-scene__arg" style={{ ['--d' as string]: 1 }}><span className="sw-mono">repo:acme.widgets,</span> “export job queue”)</p>
      <p className="ca-scene__back" style={{ ['--d' as string]: 3 }}><b>←</b> 3 memories · ADR 007 · a41c9e2 · PR #212</p>
    </div>
  )
}

function Packages() {
  const [ref, seen] = useSeen<HTMLDivElement>()
  return (
    <section className="ca-section ca-section--tint" aria-label="What you install">
      <div className="ca-wrap">
        <div className="ca-head">
          <Eyebrow>What you install</Eyebrow>
          <H2 a="Two connectors feed it." b="One MCP server reads it." />
          <p className="sw-lede">Each ships as its own npm package under Apache-2.0. Install only what you use.</p>
        </div>
        <div ref={ref} className="ca-pkgs" data-seen={seen || undefined}>
          {PACKAGES.map(p => (
            <Ln key={p.slug} to={`/connectors/${p.slug}`} className="ca-pkg">
              <span className="ca-pkg__stage"><Scene slug={p.slug} /></span>
              <span className="ca-pkg__head">
                <span className="ca-pkg__logo"><Icon name={p.icon} size={22} /></span>
                <span className="ca-pkg__role">{p.role}</span>
              </span>
              <b className="ca-pkg__name">{p.name}</b>
              <p>{p.text}</p>
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
    <section className="ca-section ca-section--tint" aria-label="What it writes">
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
    <section className="ca-section ca-section--tint" aria-label="Frequently asked questions">
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
        <AgentTerminal />
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
      <Divider />
      <Packages />
      <Divider />
      <Why />
      <Divider />
      <Setup />
      <Divider />
      <Demo />
      {VIDEO_ID && <Divider />}
      <Files />
      <Divider />
      <Trust />
      <Faq />
      <Close />
    </div>
  )
}
