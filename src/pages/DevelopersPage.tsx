import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Section } from '../components/Section'
import { Heading } from '../components/Heading'
import { CodeCopyButton } from '../components/CodeCopyButton'
import { usePageSEO } from '../lib/seo'
import { howToJsonLd } from '../lib/seo-meta'
import { useChatWidget, useTrackDemoCta } from '../lib/widget-context-api'

export function DevelopersPage() {
  // The install/quickstart HowTo lives here, where the actual steps are
  // shown — not statically in index.html, where it would ride along on every
  // route. Google retired HowTo rich results, but answer engines still read it.
  usePageSEO({ jsonLd: [howToJsonLd()] })
  const { openWidget } = useChatWidget()
  const liveDemoRef = useRef<HTMLButtonElement>(null)
  useTrackDemoCta(liveDemoRef)
  return (
    <>
      <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-[clamp(1.875rem,6vw,3rem)] font-bold text-theme-primary tracking-tight break-anywhere">
              Start building
            </h1>
            <p className="mt-5 sm:mt-6 text-base sm:text-lg text-theme-muted max-w-2xl leading-[1.65] sm:leading-[1.7]">
              Everything you need to integrate Statewave into your AI application.
              Running locally in under 2 minutes.
            </p>
          </motion.div>
        </div>
      </section>

      <QuickstartLead />

      <Section>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Getting Started',
              desc: 'Clone, run, ingest your first episode in about 5 minutes.',
              href: 'https://github.com/smaramwbc/statewave-docs/blob/main/getting-started.md',
              tag: 'Guide',
            },
            {
              title: 'API v1 Contract',
              desc: 'Full endpoint reference with examples, scoring model, and webhook specs.',
              href: 'https://github.com/smaramwbc/statewave-docs/blob/main/api/v1-contract.md',
              tag: 'Reference',
            },
            {
              title: 'Python SDK',
              desc: 'Sync + async clients, Pydantic models, retry with backoff. pip install statewave.',
              href: 'https://github.com/smaramwbc/statewave-py',
              tag: 'SDK',
            },
            {
              title: 'TypeScript SDK',
              desc: 'Fetch-based client with full type definitions. npm install @statewavedev/sdk.',
              href: 'https://github.com/smaramwbc/statewave-ts',
              tag: 'SDK',
            },
            {
              title: 'Examples',
              desc: 'Quickstart, support agent, coding agent, LLM loop, eval suite, benchmarks.',
              href: 'https://github.com/smaramwbc/statewave-examples',
              tag: 'Examples',
            },
            {
              title: 'Use Cases',
              desc: 'A categorized map of what you can build — support, coding, workspace, account, voice, multi-agent, plus connector patterns and frontier ideas.',
              to: '/use-cases',
              tag: 'Inspiration',
            },
            {
              title: 'Live Demo',
              desc: 'Two identical agents — one with memory, one without. See the difference in 10 seconds.',
              onClick: () => openWidget(),
              tag: 'Demo',
            },
            {
              title: 'Architecture Overview',
              desc: 'System design, component architecture, middleware stack, compilation pipeline.',
              href: 'https://github.com/smaramwbc/statewave-docs/blob/main/architecture/overview.md',
              tag: 'Docs',
            },
            {
              title: 'Deployment Guide',
              desc: 'Docker Compose, Fly.io, Railway. Production configuration and health checks.',
              href: 'https://github.com/smaramwbc/statewave-docs/blob/main/deployment/guide.md',
              tag: 'Ops',
            },
            {
              title: 'GitHub Repository',
              desc: 'Source code, issues, discussions. Apache-2.0 licensed.',
              href: 'https://github.com/smaramwbc/statewave',
              tag: 'Source',
            },
          ].map((item, i) => {
            const cardClass = 'block w-full text-left p-6 rounded-2xl border border-theme-border bg-surface-1 hover:border-accent/20 transition-colors group'
            const motionProps = {
              initial: { opacity: 0, y: 20 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true },
              transition: { delay: i * 0.05 },
              whileHover: { y: -4 },
            } as const
            const inner = (
              <>
                <span className="text-[10px] font-medium uppercase tracking-wider text-accent">{item.tag}</span>
                <h3 className="text-base font-semibold text-theme-primary mt-2 mb-2 group-hover:text-accent transition-colors">{item.title}</h3>
                <p className="text-sm text-theme-muted leading-relaxed">{item.desc}</p>
              </>
            )
            if ('onClick' in item && item.onClick) {
              return (
                <motion.button
                  key={i}
                  ref={liveDemoRef}
                  type="button"
                  onClick={item.onClick}
                  {...motionProps}
                  className={cardClass}
                >
                  {inner}
                </motion.button>
              )
            }
            if ('to' in item && item.to) {
              return (
                <motion.div key={i} {...motionProps}>
                  <Link to={item.to} className={cardClass}>
                    {inner}
                  </Link>
                </motion.div>
              )
            }
            return (
              <motion.a
                key={i}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                {...motionProps}
                className={cardClass}
              >
                {inner}
              </motion.a>
            )
          })}
        </div>
      </Section>
    </>
  )
}

/* One-command quickstart — the fastest path to a running, MCP-wired Statewave.
 *
 * Mirrors statewave-connectors quickstart: boots api + admin + db via Docker
 * Compose, auto-detects/configures the visitor's MCP clients, optional LLM key,
 * seeds the repo. Content (one-liner, ports 8100/8080, default LiteLLM model,
 * detected clients, teardown) must stay accurate to
 * statewave-connectors/packages/cli/src/commands/quickstart.ts.
 *
 * /install → statewave-connectors/scripts/bootstrap.sh  (macOS / Linux)
 * /install.ps1 → statewave-connectors/scripts/bootstrap.ps1  (Windows)
 * Both are Vercel redirects — no Node.js required on the visitor's machine. */
const INSTALL_NPX  = 'npx @statewavedev/statewave'
const INSTALL_UNIX = 'curl -fsSL https://www.statewave.ai/install | sh'
const INSTALL_WIN  = 'powershell -Command "irm https://www.statewave.ai/install.ps1 | iex"'

type QsTab = 'node' | 'unix' | 'windows'
const QS_TABS: { id: QsTab; label: string; cmd: string; prompt: string }[] = [
  { id: 'node',    label: 'Node',          cmd: INSTALL_NPX,  prompt: '$' },
  { id: 'unix',    label: 'macOS / Linux', cmd: INSTALL_UNIX, prompt: '$' },
  { id: 'windows', label: 'Windows',       cmd: INSTALL_WIN,  prompt: '>' },
]

function QuickstartCommand() {
  const [tab, setTab] = useState<QsTab>(() =>
    typeof navigator !== 'undefined' && /Win/i.test(navigator.userAgent) ? 'windows' : 'node'
  )
  const active = QS_TABS.find((t) => t.id === tab)!
  return (
    <div>
      <div className="flex gap-1 mb-2">
        {QS_TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={[
              'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
              tab === id
                ? 'bg-accent/10 text-accent'
                : 'text-theme-muted hover:text-theme-secondary',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-theme-border bg-surface-2 px-4 py-3 font-mono text-sm sm:text-base">
        <span className="select-none text-accent">{active.prompt}</span>
        <code className="flex-1 overflow-x-auto whitespace-nowrap text-theme-primary">
          {active.cmd}
        </code>
        <CodeCopyButton code={active.cmd} label="Copy install command" />
      </div>
    </div>
  )
}

/* Faithful, condensed render of the real CLI output. Theme-aware: structure
 * uses surface/border/text tokens that flip with [data-theme], and the
 * semantic accents (emerald-600 success, brand-500 links) are chosen to read
 * on both the light and dark surface-1 panel. The window dots stay their
 * literal traffic-light colors (at reduced opacity) in both themes, matching
 * the existing Quick-install terminal. */
function QuickstartTerminal() {
  return (
    <div className="overflow-hidden rounded-2xl border border-theme-border bg-surface-1 shadow-xl shadow-black/10">
      <div className="flex items-center gap-2 border-b border-theme-border px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-500/70" />
        <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
        <span className="h-3 w-3 rounded-full bg-green-500/70" />
        <span className="ml-3 font-mono text-xs text-theme-muted">statewave quickstart</span>
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-relaxed text-theme-secondary">
        <span className="text-theme-muted">Which MCP clients should I set up?</span>
        {'\n'}  1. Claude Code              <span className="text-emerald-600">✓ detected</span>
        {'\n'}  2. Claude Desktop           <span className="text-emerald-600">✓ detected</span>
        {'\n'}  3. Cursor                   <span className="text-emerald-600">✓ detected</span>
        {'\n'}  4. VS Code (GitHub Copilot) <span className="text-emerald-600">✓ detected</span>
        {'\n'}  5. Codex CLI                <span className="text-emerald-600">✓ detected</span>
        {'\n'}  <span className="text-theme-muted">Enter = detected, 'a' = all, 'n' = none:</span> <span className="text-brand-500">a</span>
        {'\n\n'}<span className="text-theme-muted">Optional — an LLM API key sharpens the memory:</span>
        {'\n'}  Paste an LLM API key, or press Enter to skip:
        {'\n\n'}Starting Statewave (api + admin + db) via docker compose…
        {'\n'} <span className="text-emerald-600">✔</span> Container statewave-quickstart-db-1     <span className="text-emerald-600">Healthy</span>
        {'\n'} <span className="text-emerald-600">✔</span> Container statewave-quickstart-api-1    <span className="text-emerald-600">Started</span>
        {'\n'} <span className="text-emerald-600">✔</span> Container statewave-quickstart-admin-1  <span className="text-emerald-600">Started</span>
        {'\n'}<span className="text-emerald-600">✓</span> Server healthy at <span className="text-brand-500">http://localhost:8100</span>.
        {'\n\n'}<span className="text-emerald-600">✓</span> Configured Claude Code <span className="text-theme-muted">(server id: statewave)</span>
        {'\n'}<span className="text-emerald-600">✓</span> Configured Cursor · VS Code (Copilot) · Codex CLI
        {'\n\n'}Seeding repo:your-project from this repo…
        {'\n'}<span className="text-emerald-600">✓</span> ingested 139/139 episodes — compiled: <span className="text-emerald-600">yes</span>
        {'\n\n'}<span className="text-theme-muted">Admin console: </span><span className="text-brand-500">http://localhost:8080</span>
      </pre>
    </div>
  )
}

function QuickstartLead() {
  return (
    <Section className="!pt-0">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div>
          <span className="block text-[10px] font-medium uppercase tracking-wider text-accent">Fastest start</span>
          <Heading id="one-command" className="mt-2 text-2xl md:text-3xl font-bold text-theme-primary tracking-tight">
            Zero to memory in one command
          </Heading>
          <p className="mt-4 text-theme-muted leading-relaxed">
            One line boots a local Statewave, wires it into your MCP clients, and
            seeds your repo — self-hosted, offline, no account.
          </p>
          <div className="mt-6">
            <QuickstartCommand />
          </div>
          <p className="mt-5 text-xs text-theme-muted">
            Tear it down with{' '}
            <span className="font-mono text-theme-secondary">npx @statewavedev/statewave --down</span>.
          </p>
          <div className="mt-6">
            <p className="text-[11px] uppercase tracking-wider font-medium text-theme-muted mb-2.5">Configures automatically</p>
            <div className="flex flex-wrap gap-2">
              {['Claude Code', 'Claude Desktop', 'Cursor', 'VS Code Copilot', 'Codex CLI'].map((client) => (
                <span
                  key={client}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-theme-border/60 text-theme-secondary bg-surface-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/70 flex-shrink-0" />
                  {client}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:pl-4">
          <QuickstartTerminal />
        </div>
      </div>
    </Section>
  )
}
