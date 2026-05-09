import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Section } from '../components/Section'
import { Button } from '../components/Button'
import { Heading } from '../components/Heading'
import { usePageSEO } from '../lib/seo'

const DOCS = 'https://github.com/smaramwbc/statewave-docs/blob/main'
const CONNECTORS_REPO = 'https://github.com/smaramwbc/statewave-connectors'

interface ConnectorCard {
  source: string
  shape: string
  description: string
  status: 'available' | 'planned'
  href?: string
}

const CONNECTORS: ReadonlyArray<ConnectorCard> = [
  {
    source: 'MCP server',
    shape: 'Agent memory',
    description:
      'Expose Statewave to Copilot, Claude, Cursor, and any MCP-compatible client. Vendor-neutral by design.',
    status: 'available',
    href: `${DOCS}/connectors/mcp.md`,
  },
  {
    source: 'GitHub',
    shape: 'Repo memory',
    description:
      'Issues, pull requests, comments, reviews, and releases — turned into episodes under repo:owner/name.',
    status: 'available',
    href: `${DOCS}/connectors/github.md`,
  },
  {
    source: 'Markdown / docs',
    shape: 'Decision memory',
    description:
      'Local docs, ADRs, RFCs, and architecture notes. Ideal for grounding agents in your team’s actual reasoning.',
    status: 'available',
    href: `${DOCS}/connectors/markdown.md`,
  },
  {
    source: 'Slack',
    shape: 'Team memory',
    description:
      'Channel and thread history under team:<team_id>. Pull-mode against the Slack Web API; required --channels allowlist; bot-token auth.',
    status: 'available',
    href: 'https://github.com/smaramwbc/statewave-connectors/blob/main/packages/slack/README.md',
  },
  {
    source: 'n8n',
    shape: 'Workflow memory',
    description:
      'Workflow executions, failures, and per-node errors via the n8n REST API. Maps to n8n.workflow.executed, n8n.workflow.failed, n8n.node.errored.',
    status: 'available',
    href: 'https://github.com/smaramwbc/statewave-connectors/blob/main/packages/n8n/README.md',
  },
  {
    source: 'Zapier',
    shape: 'Workflow memory (push)',
    description:
      'Push-mode helper — formatZapToEpisode() for "Webhooks by Zapier → POST" payloads. Zapier doesn’t expose a public zap-history API, so this is the right shape, not a sync connector.',
    status: 'available',
    href: 'https://github.com/smaramwbc/statewave-connectors/blob/main/packages/zapier/README.md',
  },
  {
    source: 'Discord',
    shape: 'Community memory',
    description:
      'Servers, channels, and forum posts — community and team support history a stateless RAG can’t see.',
    status: 'available',
    href: 'https://github.com/smaramwbc/statewave-connectors/blob/main/packages/discord/README.md',
  },
  {
    source: 'Zendesk',
    shape: 'Customer memory',
    description:
      'Tickets, public replies, and internal notes scoped per customer (organization or requester) — agents recall what’s broken, what’s already been tried, and what’s still open. API token + OAuth bearer auth supported.',
    status: 'available',
    href: 'https://github.com/smaramwbc/statewave-connectors/blob/main/packages/zendesk/README.md',
  },
  {
    source: 'Intercom / Freshdesk',
    shape: 'Customer memory',
    description:
      'Same shape as Zendesk — tickets, conversations, and notes scoped per account. Planned next in the support-tools class.',
    status: 'planned',
  },
  {
    source: 'Notion',
    shape: 'Decision memory',
    description:
      'Decision docs and architecture pages, scoped to the repo or workspace they govern.',
    status: 'planned',
  },
  {
    source: 'Gmail / email',
    shape: 'Relationship memory',
    description:
      'Thread-level relationship memory, scoped by label or query — never “ingest the whole inbox”.',
    status: 'planned',
  },
]

export function ConnectorsPage() {
  usePageSEO()
  return (
    <>
      <ConnectorsHero />
      <ConnectorsGrid />
      <PackageModelSection />
      <QuickExamplesSection />
      <CTASection />
    </>
  )
}

function ConnectorsHero() {
  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
  }
  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
  }

  return (
    <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="max-w-3xl"
        >
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-accent/20 bg-accent/[0.04] text-accent text-[11px] font-medium tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-accent/80" />
              Not just live chats
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-6 sm:mt-8 text-[clamp(2rem,7vw,4rem)] font-bold text-theme-primary tracking-[-0.025em] leading-[1.08] break-anywhere"
          >
            Connect your tools.{' '}
            <span className="bg-gradient-to-r from-accent via-brand-400 to-brand-300 bg-clip-text text-transparent">
              Give your agents memory.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-5 sm:mt-6 text-base sm:text-lg md:text-[1.2rem] text-theme-muted max-w-[40rem] leading-[1.65] sm:leading-[1.7]"
          >
            Feed GitHub, Slack, Discord, docs, support tickets, email, and workflow events into
            Statewave as durable episodic memory — so your agents recall projects, customers,
            communities, and decisions, not just the last few chat turns.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-8 sm:mt-10 flex flex-wrap items-center gap-3 sm:gap-4"
          >
            <Button href={`${DOCS}/connectors/index.md`} size="lg">
              View connector docs
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
            <Button href={CONNECTORS_REPO} variant="secondary" size="lg">
              Explore Statewave Connectors
            </Button>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-4 text-xs text-theme-muted/85">
            Modular packages — install only what you need. Phase-1 packages
            (core, CLI, MCP server, GitHub, Markdown) are landing in the open;
            npm publication is a follow-up.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

function ConnectorsGrid() {
  return (
    <Section>
      <div className="mb-10 sm:mb-12">
        <Heading
          id="connectors-by-source"
          className="text-3xl md:text-4xl font-bold text-theme-primary tracking-tight"
        >
          One contract, many sources
        </Heading>
        <p className="mt-4 text-theme-muted max-w-2xl leading-relaxed">
          Every connector normalizes its source events into the same Statewave episode shape — so
          agents query memory by subject (<code className="font-mono text-[0.85em] text-theme-secondary">repo:</code>,{' '}
          <code className="font-mono text-[0.85em] text-theme-secondary">customer:</code>,{' '}
          <code className="font-mono text-[0.85em] text-theme-secondary">community:</code>,{' '}
          <code className="font-mono text-[0.85em] text-theme-secondary">contact:</code>) without caring which
          tool the data came from.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CONNECTORS.map((c, i) => (
          <ConnectorCardItem key={c.source} card={c} index={i} />
        ))}
      </div>
    </Section>
  )
}

function ConnectorCardItem({ card, index }: { card: ConnectorCard; index: number }) {
  const isPlanned = card.status === 'planned'
  const cardClass = `relative flex h-full flex-col rounded-2xl border bg-surface-1 p-6 transition-colors ${
    isPlanned
      ? 'border-theme-border/70'
      : 'border-theme-border hover:border-accent/30'
  }`
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-accent">{card.shape}</p>
          <h3 className="mt-1 text-lg font-semibold text-theme-primary">{card.source}</h3>
        </div>
        <span
          className={`shrink-0 text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${
            isPlanned
              ? 'bg-surface-2 text-theme-muted'
              : 'bg-accent/10 text-accent'
          }`}
        >
          {isPlanned ? 'Coming soon' : 'Available'}
        </span>
      </div>
      <p className="mt-3 text-sm text-theme-muted leading-relaxed">{card.description}</p>
      {card.href && (
        <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-accent">
          Read the docs
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </span>
      )}
    </>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
    >
      {card.href ? (
        <a
          href={card.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cardClass}
        >
          {inner}
        </a>
      ) : (
        <div className={cardClass}>{inner}</div>
      )}
    </motion.div>
  )
}

function PackageModelSection() {
  return (
    <Section className="bg-surface-1/50">
      <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
        <div className="min-w-0">
          <Heading
            id="modular-by-design"
            className="text-3xl md:text-4xl font-bold text-theme-primary tracking-tight"
          >
            Modular by design
          </Heading>
          <p className="mt-6 text-theme-muted leading-relaxed">
            Connectors live in their own monorepo and ship as separate packages. Install only what
            you need — using GitHub doesn’t pull in Slack, Notion, or Gmail dependencies, and
            credentials are scoped per connector.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-theme-secondary">
            {[
              'Per-connector credentials — no “all-or-nothing” token bag',
              'Dry-run-first by default — preview mapped episodes before any ingestion',
              'Built-in best-effort redaction for emails, phone numbers, and common API keys',
              'Stable idempotency keys — re-running a sync deduplicates instead of double-storing',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <svg
                  className="mt-0.5 w-4 h-4 text-accent shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-theme-muted/85 leading-relaxed">
            The convenience meta-package <code className="font-mono text-theme-secondary">@statewavedev/connectors</code>{' '}
            re-exports the official connectors for the rare case where you want them all at once. It is
            not required for normal usage.
          </p>
        </div>

        <div className="min-w-0 rounded-2xl border border-theme-border bg-surface-1 p-5 sm:p-6 font-mono text-sm overflow-hidden">
          <div className="flex items-center gap-2 mb-4 text-theme-muted text-xs">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
            <span className="ml-2 truncate">install — pick what you need</span>
          </div>
          <pre className="text-theme-secondary overflow-x-auto -mx-1 px-1"><code>{`# Pick what you need — every package is independent
npm install @statewavedev/connectors-github
npm install @statewavedev/connectors-markdown
npm install @statewavedev/connectors-slack
npm install @statewavedev/connectors-n8n
npm install @statewavedev/connectors-zapier
npm install @statewavedev/mcp-server`}</code></pre>
          <p className="mt-4 text-[11px] text-theme-muted/85 leading-relaxed">
            Track the rollout in the{' '}
            <a
              href={`${DOCS}/connectors/roadmap.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              connectors roadmap
            </a>
            . Source lives in the{' '}
            <a
              href={CONNECTORS_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              monorepo
            </a>
            .
          </p>
        </div>
      </div>
    </Section>
  )
}

function QuickExamplesSection() {
  const examples = [
    {
      label: 'Try GitHub repo memory',
      command: `statewave-connectors sync github \\
  --repo smaramwbc/statewave \\
  --subject repo:smaramwbc/statewave \\
  --dry-run`,
      docHref: `${DOCS}/connectors/github.md`,
    },
    {
      label: 'Sync local docs and ADRs',
      command: `statewave-connectors sync markdown \\
  --path ./docs \\
  --subject repo:smaramwbc/statewave \\
  --dry-run`,
      docHref: `${DOCS}/connectors/markdown.md`,
    },
    {
      label: 'Start the MCP server',
      command: `statewave-connectors mcp start`,
      docHref: `${DOCS}/connectors/mcp.md`,
    },
  ]

  return (
    <Section>
      <div className="mb-10 sm:mb-12">
        <Heading
          id="quick-examples"
          className="text-3xl md:text-4xl font-bold text-theme-primary tracking-tight"
        >
          Dry-run first, ingest second
        </Heading>
        <p className="mt-4 text-theme-muted max-w-2xl leading-relaxed">
          Every connector supports <code className="font-mono text-[0.85em] text-theme-secondary">--dry-run</code> —
          mapped episodes are printed without being sent anywhere. The CLI refuses to ingest unless{' '}
          <code className="font-mono text-[0.85em] text-theme-secondary">STATEWAVE_URL</code> is set.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {examples.map((ex, i) => (
          <motion.div
            key={ex.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="rounded-2xl border border-theme-border bg-surface-1 p-5 sm:p-6 flex flex-col"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-theme-primary">{ex.label}</p>
              <a
                href={ex.docHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-accent hover:underline"
              >
                Docs
              </a>
            </div>
            <pre className="mt-4 flex-1 text-[12.5px] font-mono text-theme-secondary bg-surface-2/50 rounded-lg p-3 overflow-x-auto whitespace-pre"><code>{ex.command}</code></pre>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}

function CTASection() {
  return (
    <Section className="bg-surface-1/50">
      <div className="text-center">
        <Heading
          id="start-with-connectors"
          className="text-3xl md:text-5xl font-bold text-theme-primary tracking-tight"
        >
          Start with one connector. Add more when you’re ready.
        </Heading>
        <p className="mt-6 text-lg text-theme-muted max-w-xl mx-auto">
          The core stays clean — connectors are optional, modular, and never required to use Statewave.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button href={`${DOCS}/connectors/index.md`} size="lg">
            View connector docs
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Button>
          <Button href={CONNECTORS_REPO} variant="secondary" size="lg">
            Explore Statewave Connectors
          </Button>
          <Button to="/use-cases" variant="secondary" size="lg">
            See use-case patterns
          </Button>
        </div>
        <p className="mt-6 text-xs text-theme-muted">
          Building your own?{' '}
          <a
            href={`${DOCS}/connectors/index.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Read the connector contract
          </a>
          {' '}— one interface, one episode shape, dry-run-first by default. Or browse the{' '}
          <Link to="/developers" className="text-accent hover:underline">
            developer hub
          </Link>
          .
        </p>
      </div>
    </Section>
  )
}
