import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowRight, KeyRound, Play, Plug, Receipt, SquareTerminal } from 'lucide-react'
import { Eyebrow, H2, Icon, Ln } from '../components/home/ui'
import { usePrefersReducedMotion } from '../components/home/hooks'
import { logo } from '../components/home/links'
import { CopyCmd, Terminal } from '../components/use-case/Terminal'
import type { TerminalTab } from '../components/use-case/Terminal'
import { PAGE_FAQS } from '../lib/page-faqs'
import { usePageSEO } from '../lib/seo'
import '../components/home/home-b.css'
import '../components/home/home-c.css'
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

/* ── hero: the home's hero, without the connector pages' tiles and curve ── */

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
        <h1 className="sw-hero__title ca-title">
          Stop re-explaining your repo<br /> <span className="sw-hero__grad">to your coding agent.</span>
        </h1>
        <p className="sw-hero__sub">
          Statewave keeps one memory per repository, built from its issues, pull requests, reviews, ADRs and commits.
          Claude Code, Cursor, Copilot and Codex read it over MCP, with a source for every answer.
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

/* ── how it works: the repo's memory as a stack of layers, in the home's How it works pattern.
 *    The sw-how / sw-hw-* styles are the home's own (home.css, home-b.css, home-c.css). ── */

const LAYER_STEPS = [
  { n: '01', t: 'Commits', ep: 'mcp seed --write', d: 'The quickstart turns recent commits and the README into the repo’s first memories.' },
  { n: '02', t: 'Issues & PRs', ep: 'sync github', d: 'Issues, pull requests, reviews and releases join the same subject.' },
  { n: '03', t: 'ADRs & docs', ep: 'sync markdown', d: 'Decision records and docs go on top, read on your machine.' },
  { n: '04', t: 'Recall', ep: 'statewave_get_context', d: 'Claude Code asks before it answers, and the answer traces back to the ADR and the review it came from.' },
] as const
const ARIA = [
  `Layer stack for ${SUBJECT}: the commits layer is active`,
  `Layer stack for ${SUBJECT}: the GitHub layer is active, with the PR #212 review and issue #42`,
  `Layer stack for ${SUBJECT}: the docs layer is active, with ADR 007 and the setup guide`,
  'Recall: get_context reads every layer, and lines trace the answer to ADR 007 and the PR #212 review',
]

/** Appends the `is-on` state class that home-b.css keys off. */
const k = (c: string, on: boolean) => (on ? `${c} is-on` : c)

/** One isometric slab at depth `y`, with its tile grid: the same geometry as the home's stack. */
function Slab({ y, on, onPick, label, children }: { y: number; on: boolean; onPick: () => void; label: string; children: ReactNode }) {
  return (
    <g onClick={onPick} role="button" aria-label={label} className={k('sw-hw-layer', on)}>
      <g className="sw-hw-faces">
        <polygon points={`150,${y} 150,${y + 12} 400,${y + 112} 400,${y + 100}`} className="sw-hw-face sw-hw-face--l" />
        <polygon points={`400,${y + 100} 400,${y + 112} 650,${y + 12} 650,${y}`} className="sw-hw-face sw-hw-face--r" />
        <polygon points={`400,${y - 100} 650,${y} 400,${y + 100} 150,${y}`} className="sw-hw-face sw-hw-face--top" />
      </g>
      <g transform={`matrix(1 -0.4 1 0.4 150 ${y})`}>
        <path d="M62.5 0V250M125 0V250M187.5 0V250M0 62.5H250M0 125H250M0 187.5H250" className="sw-hw-grid" />
        {children}
      </g>
    </g>
  )
}

/** A tile on a slab: an optional source mark, then one line of text. */
function Item({ y, w = 200, icon, text, on }: { y: number; w?: number; icon?: string; text: string; on: boolean }) {
  return (
    <>
      <rect x={25} y={y} width={w} height={36} rx={8} className={k('sw-hw-tile', on)} />
      {icon && (
        <foreignObject x={37} y={y + 11} width={14} height={14}>
          <span className={k('sw-hw-mask', on)} style={{ ['--m' as string]: `url(${logo(icon)})` }} />
        </foreignObject>
      )}
      <text x={icon ? 59 : 39} y={y + 23} fontSize={14} className={k('sw-hw-mono sw-hw-txt', on)}>{text}</text>
    </>
  )
}

function RepoStack({ step, pick }: { step: number; pick: (i: number) => void }) {
  const all = step === 3
  const C = step === 0 || all, G = step === 1 || all, D = step === 2 || all
  // ADR 007 and the PR #212 review sit at the same spot on their slabs, so one vertical trace reaches
  // both; -8 because every slab is lifted while it is on.
  const trace = (y1: number, y2: number, d: number) => (
    <>
      <line x1={353} y1={y1} x2={353} y2={y2} className={k('sw-hw-trace', all)} style={{ transitionDelay: `${d}ms` }} />
      <circle cx={353} cy={y2} r={2.5} className={k('sw-hw-trace', all)} style={{ transitionDelay: `${d}ms` }} />
    </>
  )
  return (
    <svg viewBox="0 20 720 620" width="100%" role="img" aria-label={ARIA[step]} className="sw-hw-svg">
      <Slab y={520} on={C} onPick={() => pick(0)} label="Show step 01">
        <Item y={60} text="a41c9e2 · retry jobs" on={C} />
        <Item y={110} text="README.md" on={C} />
        <Item y={160} w={170} text="7f02b1d · exports" on={C} />
      </Slab>
      <Slab y={350} on={G} onPick={() => pick(1)} label="Show step 02">
        <Item y={60} icon="github" text="PR #212 review" on={G} />
        <Item y={110} icon="github" text="#42 · CI is flaky" on={G} />
      </Slab>
      <Slab y={180} on={D} onPick={() => pick(2)} label="Show step 03">
        <Item y={60} icon="markdown" text="ADR 007 · job queue" on={D} />
        <Item y={110} icon="markdown" text="docs/setup.md" on={D} />
      </Slab>

      <g>{trace(56, 153.2, 200)}{trace(153.2, 323.2, 360)}</g>
      <g onClick={() => pick(3)} className={k('sw-hw-receipt', all)}>
        <rect x={291} y={30} width={124} height={26} rx={6} />
        <text x={303} y={47} fontSize={12} className="sw-hw-mono sw-hw-white">get_context ✓</text>
      </g>

      {([[520, 'COMMITS', C], [350, 'GITHUB', G], [180, 'DOCS', D]] as const).map(([y, name, on]) => (
        <g key={name}>
          <line x1={140} y1={y} x2={150} y2={y} className={k('sw-hw-tick', on)} />
          <text x={134} y={y + 4} textAnchor="end" className={k('sw-hw-mono sw-hw-name', on)}>{name}</text>
        </g>
      ))}
      {/* one subject holds all three */}
      <g>
        <line x1={676} y1={180} x2={676} y2={520} className="sw-hw-tick" />
        {[180, 350, 520].map(y => <line key={y} x1={662} y1={y} x2={676} y2={y} className="sw-hw-tick" />)}
        <text transform="translate(692 350) rotate(90)" textAnchor="middle" className="sw-hw-mono sw-hw-name is-on">{SUBJECT}</text>
      </g>
    </svg>
  )
}

function Layers() {
  const [step, setStep] = useState(0)
  const [pinned, setPinned] = useState(false)
  const pin = useRef<HTMLDivElement>(null)

  // From 1000px wide the section pins and scroll position picks the step, as on the home.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1000px)')
    const sync = () => setPinned(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!pinned) return
    const onScroll = () => {
      const el = pin.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const total = r.height - window.innerHeight
      if (total <= 0) return
      const p = Math.min(0.999, Math.max(0, -r.top / total)) * LAYER_STEPS.length
      el.style.setProperty('--p', p.toFixed(3))
      setStep(Math.floor(p))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pinned])

  const pick = useCallback((i: number) => {
    const el = pin.current
    if (el && pinned) {
      const r = el.getBoundingClientRect()
      const total = r.height - window.innerHeight
      window.scrollTo({ top: window.scrollY + r.top + (total * (i + 0.5)) / LAYER_STEPS.length, behavior: 'smooth' })
    } else setStep(i)
  }, [pinned])

  return (
    <section id="how" className="sw-section sw-how-sec ca-anchor" aria-label="How it works">
      <div className="sw-dark-panel">
        <div aria-hidden="true" className="sw-how__glow" />
        <div className="sw-how__in">
          <Eyebrow dark>How it works</Eyebrow>
          <H2 a="The code shows what." b="Memory knows why." />
          <p className="sw-lede">
            A coding agent can read every file and still not know why the job queue avoids Redis. Statewave stacks the
            history behind the code into one memory per repository.
          </p>

          <div ref={pin} className={`sw-how${pinned ? ' sw-how--pinned' : ''}`}>
            <div className="sw-how__grid">
              <div className="sw-how__list">
                {LAYER_STEPS.map((s, i) => {
                  const on = step === i
                  return (
                    <button key={s.n} type="button" className={k('sw-how__row', on)} style={{ ['--i' as string]: i }} aria-pressed={on} onClick={() => pick(i)}>
                      <span className={k('sw-mono sw-how__n', on)}>{s.n}</span>
                      <span className="sw-how__body">
                        <span className={k('sw-how__t', on)}>{s.t}</span>
                        <span className="sw-mono sw-how__ep">{s.ep}</span>
                        <span className="sw-how__dwrap"><span className="sw-how__d">{s.d}</span></span>
                      </span>
                      <span aria-hidden="true" className="sw-how__bar" />
                    </button>
                  )
                })}
              </div>
              <div className="sw-how__visual">
                <RepoStack step={step} pick={pick} />
              </div>
            </div>
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

/* ── the three packages: a dithered backdrop and a sample card drift against each other under the
 *    pointer, as on the home's use-case cards. Each card shows a different slab of the same art. ── */

const ART = '/images/home/v8/illus/coding-planes.png'

const PACKAGES = [
  {
    slug: 'github', icon: 'github', role: 'Feeds it', name: 'GitHub connector', art: '50% 92%',
    text: 'Issues, pull requests, comments, reviews and releases. A merged pull request gets its own episode, so “what landed last week?” has an answer.',
    sample: { kind: 'github.pr.review', title: 'PR #212 review', text: 'Stick to pnpm workspaces, Vitest and named exports.' },
  },
  {
    slug: 'markdown', icon: 'markdown', role: 'Feeds it', name: 'Markdown & docs', art: '50% 58%',
    text: 'ADRs, RFCs, decision docs and pages from the folder you point it at. It runs on your machine, needs no credentials and calls nothing but the ingest.',
    sample: { kind: 'docs.adr', title: 'docs/adr/007.md', text: 'Job queue runs on Postgres advisory locks, not Redis.' },
  },
  {
    slug: 'mcp-server', icon: 'modelcontextprotocol', role: 'Reads it', name: 'MCP server', art: '50% 26%',
    text: 'Gives Claude Code, Cursor, Copilot and Codex tools to read that memory and save new decisions to it. statewave_get_context is the one they call first.',
    sample: { kind: 'statewave_get_context', title: SUBJECT, text: 'A ranked bundle, every memory with its source.' },
  },
]

/** Eases --mx/--my toward the pointer's offset from the element's centre (-1…1), in rAF so it never
 *  snaps. Off under reduced motion. The same motion as the home's use-case cards. */
function useDrift<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const rm = usePrefersReducedMotion()
  useEffect(() => {
    const el = ref.current
    if (!el || rm) return
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0
    const frame = () => {
      x += (tx - x) * 0.08; y += (ty - y) * 0.08
      el.style.setProperty('--mx', x.toFixed(3)); el.style.setProperty('--my', y.toFixed(3))
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.002 ? requestAnimationFrame(frame) : 0
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame) }
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2
      kick()
    }
    const leave = () => { tx = 0; ty = 0; kick() }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); cancelAnimationFrame(raf) }
  }, [rm])
  return ref
}

function Package({ p }: { p: (typeof PACKAGES)[number] }) {
  const vis = useDrift<HTMLSpanElement>()
  return (
    <Ln to={`/connectors/${p.slug}`} className="ca-pkg">
      <span ref={vis} className="ca-vis">
        <span aria-hidden="true" className="ca-vis__bg" style={{ backgroundImage: `url(${ART})`, backgroundPosition: p.art }} />
        <span className="ca-vis__card">
          <code className="sw-mono ca-vis__kind">{p.sample.kind}</code>
          <b className="sw-mono">{p.sample.title}</b>
          <span>{p.sample.text}</span>
        </span>
      </span>
      <span className="ca-pkg__head">
        <span className="ca-pkg__logo"><Icon name={p.icon} size={22} /></span>
        <span className="ca-pkg__role">{p.role}</span>
      </span>
      <b className="ca-pkg__name">{p.name}</b>
      <p>{p.text}</p>
      <span className="ca-pkg__more">See the {p.name} page <ArrowRight size={16} aria-hidden="true" /></span>
    </Ln>
  )
}

function Packages() {
  return (
    <section className="ca-section ca-section--tint" aria-label="What you install">
      <div className="ca-wrap">
        <div className="ca-head">
          <Eyebrow>What you install</Eyebrow>
          <H2 a="Two connectors feed it." b="One MCP server reads it." />
          <p className="sw-lede">Each ships as its own npm package under Apache-2.0. Install only what you use.</p>
        </div>
        <div className="ca-pkgs">
          {PACKAGES.map(p => <Package key={p.slug} p={p} />)}
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
      <Packages />
      <Layers />
      <Setup />
      <Demo />
      <Files />
      <Trust />
      <Faq />
      <Close />
    </div>
  )
}
