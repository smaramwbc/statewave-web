import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Section } from '../components/Section'
import { Button } from '../components/Button'
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

      <QuickInstallSection />
    </>
  )
}

/* One-command quickstart — the fastest path to a running, MCP-wired Statewave.
 *
 * Mirrors statewave-connectors quickstart: boots api + admin + db via Docker
 * Compose, auto-detects/configures the visitor's MCP clients, optional LLM key,
 * seeds the repo. Content (one-liner, ports 8100/8080, default LiteLLM model,
 * detected clients, teardown) must stay accurate to
 * statewave-connectors/packages/cli/src/commands/quickstart.ts. */
const QUICKSTART_ONE_LINER = 'npx @statewavedev/connectors-cli quickstart'

function QuickstartCommand() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-theme-border bg-surface-2 px-4 py-3 font-mono text-sm sm:text-base">
      <span className="select-none text-accent">$</span>
      <code className="flex-1 overflow-x-auto whitespace-nowrap text-theme-primary">
        {QUICKSTART_ONE_LINER}
      </code>
      <CodeCopyButton code={QUICKSTART_ONE_LINER} label="Copy the quickstart command" />
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
        <span className="ml-3 font-mono text-xs text-theme-muted">statewave-connectors quickstart</span>
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
            <p className="mt-2 font-mono text-xs text-theme-muted">
              Already installed? Just{' '}
              <span className="text-theme-secondary">statewave-connectors quickstart</span>
            </p>
          </div>
          <p className="mt-5 text-xs text-theme-muted">
            Tear it down with{' '}
            <span className="font-mono text-theme-secondary">statewave-connectors quickstart --down</span>.
            Manual Docker &amp; SDK paths are below.
          </p>
        </div>
        <div className="lg:pl-4">
          <QuickstartTerminal />
        </div>
      </div>
    </Section>
  )
}

function QuickInstallSection() {
  // Mirrors the homepage developer panel: Docker leads (fastest path to a
  // running Statewave), Python + TypeScript SDK tabs follow for SDK-first
  // visitors. Each tab is broken into copy-able blocks so a visitor can
  // grab one command at a time without selecting text by hand.
  const [tab, setTab] = useState<'docker' | 'python' | 'typescript'>('docker')

  type Block = { label: string; display: string; copy: string }

  const dockerBlocks: Block[] = [
    {
      label: 'Clone the repo',
      display: '$ git clone https://github.com/smaramwbc/statewave && cd statewave',
      copy: 'git clone https://github.com/smaramwbc/statewave && cd statewave',
    },
    {
      label: 'Start the stack',
      display: '$ docker compose up -d',
      copy: 'docker compose up -d',
    },
    {
      label: 'Verify it is running',
      display: `$ curl http://localhost:8100/healthz
# → {"status":"ok"}`,
      copy: 'curl http://localhost:8100/healthz',
    },
  ]

  const pythonBlocks: Block[] = [
    {
      label: 'Install',
      display: '$ pip install statewave',
      copy: 'pip install statewave',
    },
    {
      label: 'One call to get prompt-ready context',
      display: `from statewave import StatewaveClient

sw = StatewaveClient("http://localhost:8100")

ctx = sw.get_context(
    "agent-7",
    task="Continue code review"
)

print(ctx.assembled_context)
# → Ranked, token-bounded, provenance-traced`,
      copy: `from statewave import StatewaveClient

sw = StatewaveClient("http://localhost:8100")

ctx = sw.get_context(
    "agent-7",
    task="Continue code review"
)

print(ctx.assembled_context)
`,
    },
  ]

  const tsBlocks: Block[] = [
    {
      label: 'Install',
      display: '$ npm install @statewavedev/sdk',
      copy: 'npm install @statewavedev/sdk',
    },
    {
      label: 'One call to get prompt-ready context',
      display: `import { StatewaveClient } from "@statewavedev/sdk";

const sw = new StatewaveClient("http://localhost:8100");

const ctx = await sw.getContext(
  "agent-7",
  { task: "Continue code review" }
);

console.log(ctx.assembledContext);
// → Ranked, token-bounded, provenance-traced`,
      copy: `import { StatewaveClient } from "@statewavedev/sdk";

const sw = new StatewaveClient("http://localhost:8100");

const ctx = await sw.getContext(
  "agent-7",
  { task: "Continue code review" }
);

console.log(ctx.assembledContext);
`,
    },
  ]

  const blocks = tab === 'docker' ? dockerBlocks : tab === 'python' ? pythonBlocks : tsBlocks

  return (
    <Section className="bg-surface-1/50">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <Heading id="quick-install" className="text-2xl md:text-3xl font-bold text-theme-primary tracking-tight">
          Quick install
        </Heading>
        <p className="mt-4 text-theme-muted">
          Three paths to a running Statewave: Docker for the fastest local stack, or pull the SDK
          straight into your Python / TypeScript app.
        </p>
      </div>

      <div className="max-w-3xl mx-auto rounded-2xl border border-theme-border bg-surface-1 p-5 sm:p-6 font-mono text-sm overflow-hidden">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-theme-muted text-xs">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <div role="tablist" aria-label="Quickstart" className="flex gap-1 rounded-lg bg-surface-2 p-0.5">
            <button
              role="tab"
              type="button"
              aria-selected={tab === 'docker'}
              onClick={() => setTab('docker')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                tab === 'docker'
                  ? 'bg-surface-0 text-theme-primary shadow-sm'
                  : 'text-theme-muted hover:text-theme-secondary'
              }`}
            >
              Docker
            </button>
            <button
              role="tab"
              type="button"
              aria-selected={tab === 'python'}
              onClick={() => setTab('python')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                tab === 'python'
                  ? 'bg-surface-0 text-theme-primary shadow-sm'
                  : 'text-theme-muted hover:text-theme-secondary'
              }`}
            >
              Python SDK
            </button>
            <button
              role="tab"
              type="button"
              aria-selected={tab === 'typescript'}
              onClick={() => setTab('typescript')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                tab === 'typescript'
                  ? 'bg-surface-0 text-theme-primary shadow-sm'
                  : 'text-theme-muted hover:text-theme-secondary'
              }`}
            >
              TypeScript SDK
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {blocks.map((block) => (
            <div key={block.label} className="rounded-lg border border-theme-border/60 bg-surface-2/40">
              <div className="flex items-center justify-between gap-3 px-3 pt-2 pb-1">
                <p className="text-[10.5px] font-medium uppercase tracking-wider text-theme-muted/85">
                  {block.label}
                </p>
                <CodeCopyButton code={block.copy} label={`Copy: ${block.label}`} />
              </div>
              <pre className="text-theme-secondary overflow-x-auto px-3 pb-3 text-[12.5px] leading-relaxed"><code>{block.display}</code></pre>
            </div>
          ))}
          {tab === 'docker' && (
            <p className="pt-1 text-right text-xs text-theme-muted">
              Boots in demo mode — add an LLM key for semantic search.{' '}
              <a
                href="https://github.com/smaramwbc/statewave#run-the-server"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Docs →
              </a>
              <span className="text-theme-muted/60"> · </span>
              <a
                href="https://github.com/smaramwbc/statewave"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Source →
              </a>
            </p>
          )}
        </div>
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-4">
        <Button href="https://github.com/smaramwbc/statewave-docs/blob/main/getting-started.md" size="lg">
          Read the Guide
        </Button>
        <Button href="https://hub.docker.com/r/statewavedev/statewave" variant="secondary" size="lg">
          View on Docker Hub
        </Button>
        <Button href="https://github.com/smaramwbc/statewave" variant="secondary" size="lg">
          View Source
        </Button>
      </div>
    </Section>
  )
}
