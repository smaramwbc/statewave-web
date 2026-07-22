import { motion } from 'framer-motion'
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
    source: 'GitLab',
    shape: 'Repo memory',
    description:
      'GitLab project activity — issues, merge requests, and comments — from SaaS or self-managed, under repo:group/project.',
    status: 'available',
    href: `${CONNECTORS_REPO}/blob/main/packages/gitlab/README.md`,
  },
  {
    source: 'Bitbucket',
    shape: 'Repo memory',
    description:
      'Bitbucket Cloud repository activity — pull requests and comments — under repo:workspace/repo.',
    status: 'available',
    href: `${CONNECTORS_REPO}/blob/main/packages/bitbucket/README.md`,
  },
  {
    source: 'Gitea / Forgejo',
    shape: 'Repo memory',
    description:
      'Self-hosted Gitea or Forgejo repository activity — issues, pull requests, and comments — under repo:owner/repo.',
    status: 'available',
    href: `${CONNECTORS_REPO}/blob/main/packages/gitea/README.md`,
  },
  {
    source: 'Azure DevOps',
    shape: 'Repo memory',
    description:
      'Pull requests, comments, reviews, and work items from Azure DevOps — under repo:organization/project/repository.',
    status: 'available',
    href: `${CONNECTORS_REPO}/blob/main/packages/azure-devops/README.md`,
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
      'Channel + thread history (pull) plus an Events-API webhook (messages, reactions, pins). Optional DMs (dm:<user>) and group DMs / mpim (mpim:<channel>) — both opt-in. Bot-token auth; required --channels allowlist (or --include-dms / --include-mpim).',
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
    source: 'Intercom',
    shape: 'Customer memory',
    description:
      'Conversations, public replies, and admin internal notes scoped per customer (primary company or contact). US/EU/AU regions; bearer auth (personal access token or OAuth).',
    status: 'available',
    href: 'https://github.com/smaramwbc/statewave-connectors/blob/main/packages/intercom/README.md',
  },
  {
    source: 'Freshdesk',
    shape: 'Customer memory',
    description:
      'Tickets, public replies, and private agent notes scoped per customer (company or requester). API key auth; numeric statuses normalized to typed strings.',
    status: 'available',
    href: 'https://github.com/smaramwbc/statewave-connectors/blob/main/packages/freshdesk/README.md',
  },
  {
    source: 'Notion',
    shape: 'Decision memory',
    description:
      'Pages, optional body content, and (v0.1.1) page-level discussion comments — scoped to whichever organizational unit you care about (repo, project, team, or the default workspace:notion). Bearer auth; pinned to Notion-Version 2022-06-28.',
    status: 'available',
    href: 'https://github.com/smaramwbc/statewave-connectors/blob/main/packages/notion/README.md',
  },
  {
    source: 'Gmail',
    shape: 'Relationship memory',
    description:
      'Messages matching a required Gmail search query, scoped per counterparty (relationship:<email>). OAuth 2.0 refresh-token auth; gmail.readonly scope; never "ingest the whole inbox".',
    status: 'available',
    href: 'https://github.com/smaramwbc/statewave-connectors/blob/main/packages/gmail/README.md',
  },
  {
    source: 'Jira',
    shape: 'Project memory',
    description:
      'Jira Cloud issues and (opt-in) comments scoped per project (project:<KEY>). Cloud REST v3, API-token auth, pull-mode; project allowlist; users by display name, never email. Preview.',
    status: 'available',
    href: 'https://github.com/smaramwbc/statewave-connectors/blob/main/packages/jira/README.md',
  },
  {
    source: 'Database',
    shape: 'Records memory',
    description:
      'Selected rows from PostgreSQL, MySQL, MariaDB, or MSSQL — read-only, allowlisted table or SELECT, chosen columns, capped rows. A source connector into Statewave memory, not a Statewave storage backend. Preview.',
    status: 'available',
    href: 'https://github.com/smaramwbc/statewave-connectors/blob/main/packages/database/README.md',
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
    <section className="pt-24 pb-14 sm:pt-28 sm:pb-16 md:pt-38">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="max-w-4xl"
        >
          <motion.div variants={fadeUp}>
            <span className="hero-badge inline-flex items-center gap-2 rounded-full border border-brand-500/35 bg-brand-500/[0.06] px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-400">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              Not just live chats
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-8 font-heading text-[clamp(2.8rem,5.6vw,4.7rem)] font-bold leading-[0.96] tracking-[-0.045em] text-theme-primary"
          >
            <span className="block">Connect your tools.</span>
            <span className="block max-w-[52rem] text-gradient-brand">
              Give your agents memory.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-7 max-w-[44rem] text-[17px] leading-[1.7] text-theme-secondary/90 sm:text-[19px] md:text-[20px]"
          >
            Feed GitHub, Slack, Discord, docs, support tickets, email, and workflow events into
            Statewave as durable episodic memory — so your agents recall projects, customers,
            communities, and decisions, not just the last few chat turns.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4"
          >
            <Button href={`${DOCS}/connectors/index.md`} size="lg">
              View connector docs
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Button>

            <Button href={CONNECTORS_REPO} variant="secondary" size="lg">
              Explore Statewave Connectors
            </Button>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-[38rem] text-sm leading-[1.55] text-theme-muted/80"
          >
            Modular packages — install only what you need. The full connector
            lineup — including the new Jira and database source connectors — is
            published on npm.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

function ConnectorsGrid() {
  const featuredSources = [
    'MCP server',
    'GitHub',
    'Slack',
    'Markdown / docs',
    'n8n',
    'Zendesk',
  ]

  const featured = CONNECTORS.filter((connector) =>
    featuredSources.includes(connector.source)
  )

  const remaining = CONNECTORS.filter(
    (connector) => !featuredSources.includes(connector.source)
  )

  return (
    <Section>
      <div className="mb-10 max-w-3xl sm:mb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">
          Connectors & integrations
        </p>

        <Heading
          id="connectors-by-source"
          className="mt-4 text-3xl font-bold tracking-tight text-theme-primary md:text-4xl"
        >
          One contract, many sources
        </Heading>

        <p className="mt-4 max-w-2xl leading-relaxed text-theme-muted">
          Every connector normalizes its source events into the same Statewave episode shape — so
          agents query memory by subject (
          <code className="font-mono text-[0.85em] text-theme-secondary">repo:</code>,{' '}
          <code className="font-mono text-[0.85em] text-theme-secondary">customer:</code>,{' '}
          <code className="font-mono text-[0.85em] text-theme-secondary">community:</code>,{' '}
          <code className="font-mono text-[0.85em] text-theme-secondary">contact:</code>) without caring which
          tool the data came from.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((connector, index) => (
          <ConnectorCardItem
            key={connector.source}
            card={connector}
            index={index}
            compact={false}
          />
        ))}
      </div>

      <div className="mt-16">


        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {remaining.map((connector, index) => (
            <ConnectorCardItem
              key={connector.source}
              card={connector}
              index={index}
              compact
            />
          ))}
        </div>
      </div>
    </Section>
  )
}

const CONNECTOR_ICONS: Record<string, string> = {
  'MCP server': '/connectors/Model_Context_Protocol_logo.svg',

  GitHub: '/connectors/GitHub_Invertocat_Black_Clearspace.svg',
  GitLab: '/connectors/gitlab.svg',
  Bitbucket: '/connectors/bitbucket.svg',
  'Gitea / Forgejo': '/connectors/gitea.svg',
  'Azure DevOps': '/connectors/azure-devops.svg',

  Slack: '/connectors/Slack_icon_2019.svg',
  Discord: '/connectors/discord.svg',

  n8n: '/connectors/n8n_pink+white_logo.svg',
  Zapier: '/connectors/zapier.svg',

  Zendesk: '/connectors/zendesk-1.svg',
  Intercom: '/connectors/intercom.svg',
  Freshdesk: '/connectors/freshdesk.svg',

  'Markdown / docs': '/connectors/markdown-svgrepo-com.svg',
  Notion: '/connectors/notion.svg',

  Gmail: '/connectors/gmail.svg',
  Jira: '/connectors/jira.svg',
  Database: '/connectors/database.svg',
}

const WHITE_CONNECTOR_LOGOS = new Set([
  '/connectors/Model_Context_Protocol_logo.svg',
  '/connectors/GitHub_Invertocat_Black_Clearspace.svg',
  '/connectors/markdown-svgrepo-com.svg',
  '/connectors/zendesk-1.svg',
])

const BLACK_CONNECTOR_LOGOS = new Set([
  '/connectors/intercom.svg',
  '/connectors/database.svg',
])

const getConnectorLogoClass = (icon: string) => {
  if (WHITE_CONNECTOR_LOGOS.has(icon)) {
    return 'connector-logo-white'
  }

  if (BLACK_CONNECTOR_LOGOS.has(icon)) {
    return 'connector-logo-black'
  }

  return ''
}


function ConnectorCardItem({
  card,
  index,
  compact = false,
}: {
  card: ConnectorCard
  index: number
  compact?: boolean
}) {
  const isPlanned = card.status === 'planned'
  const icon = CONNECTOR_ICONS[card.source]

  if (compact) {
    const compactClass = `
  flex min-h-[82px] items-center justify-between gap-4 rounded-xl
  border border-theme-border bg-surface-1/35 px-5 py-4 transition-all duration-200
  ${isPlanned
        ? ''
        : 'hover:border-theme-border-hover hover:bg-surface-1/45'
      }
`

    const compactContent = (
      <>
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center">
            {icon && (
              <img
                src={icon}
                alt=""
                className={`h-7 w-7 object-contain ${getConnectorLogoClass(icon)}`}
                aria-hidden="true"
              />
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate font-medium text-theme-primary">
              {card.source}
            </p>

            <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-theme-muted">
              {card.shape}
            </p>
          </div>
        </div>

        <div className="flex items-start">


          {card.href && (
            <svg
              className="h-4 w-4 text-brand-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          )}
        </div>
      </>
    )

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.025, duration: 0.35 }}
      >
        {card.href ? (
          <a
            href={card.href}
            target="_blank"
            rel="noopener noreferrer"
            className={compactClass}
          >
            {compactContent}
          </a>
        ) : (
          <div className={compactClass}>{compactContent}</div>
        )}
      </motion.div>
    )
  }

  const featuredClass = `
  group relative flex min-h-[250px] h-full flex-col rounded-2xl
  border border-theme-border bg-surface-1/45 p-6 transition-all duration-200
  ${isPlanned
      ? ''
      : 'hover:-translate-y-1 hover:border-theme-border-hover hover:bg-surface-1/55'
    }
`

  const featuredContent = (
    <>
      <div className="flex items-start">
        <div className="flex h-12 w-12 items-center justify-center">
          {icon && (
            <img
              src={icon}
              alt=""
              className={`h-8 w-8 object-contain ${getConnectorLogoClass(icon)}`}
              aria-hidden="true"
            />
          )}
        </div>


      </div>

      <div className="mt-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-400">
          {card.shape}
        </p>

        <h3 className="mt-2 text-xl font-semibold text-theme-primary">
          {card.source}
        </h3>

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-theme-muted">
          {card.description}
        </p>
      </div>

      {card.href && (
        <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium text-brand-400">
          Read the docs

          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
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
      className="h-full"
    >
      {card.href ? (
        <a
          href={card.href}
          target="_blank"
          rel="noopener noreferrer"
          className={featuredClass}
        >
          {featuredContent}
        </a>
      ) : (
        <div className={featuredClass}>{featuredContent}</div>
      )}
    </motion.div>
  )
}

function PackageModelSection() {
  const installLines = [
    '# Pick what you need — every package is independent',
    'npm install @statewavedev/connectors-github',
    'npm install @statewavedev/connectors-jira',
    'npm install @statewavedev/connectors-database',
    'npm install @statewavedev/connectors-markdown',
    'npm install @statewavedev/connectors-slack',
    'npm install @statewavedev/connectors-n8n',
    'npm install @statewavedev/connectors-zapier',
    'npm install @statewavedev/mcp-server',
  ]

  const features = [
    'Per-connector credentials — no “all-or-nothing” token bag',
    'Dry-run-first by default — preview mapped episodes before any ingestion',
    'Built-in best-effort redaction for emails, phone numbers, and common API keys',
    'Stable idempotency keys — re-running a sync deduplicates instead of double-storing',
  ]

  return (
    <Section className="bg-surface-1">
      <div className="grid items-start gap-12 md:grid-cols-2 md:gap-16 lg:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="min-w-0"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">
            Modular architecture
          </p>

          <Heading
            id="modular-by-design"
            className="mt-4 max-w-xl text-3xl font-bold tracking-tight text-theme-primary md:text-4xl"
          >
            Modular by design
          </Heading>

          <p className="mt-5 max-w-xl leading-relaxed text-theme-muted">
            Connectors live in their own monorepo and ship as separate packages. Install only what
            you need — using GitHub doesn’t pull in Slack, Notion, or Gmail dependencies, and
            credentials are scoped per connector.
          </p>

          <ul className="mt-7 space-y-4 text-sm text-theme-secondary">
            {features.map((item, index) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.12 + index * 0.07,
                  duration: 0.35,
                  ease: 'easeOut',
                }}
                className="flex items-start gap-3"
              >
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-brand-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>

                <span className="leading-relaxed">{item}</span>
              </motion.li>
            ))}
          </ul>

          <p className="mt-7 max-w-xl text-xs leading-relaxed text-theme-muted/85">
            The convenience meta-package{' '}
            <code className="font-mono text-theme-secondary">
              @statewavedev/connectors
            </code>{' '}
            re-exports the official connectors for the rare case where you want them all at once. It
            is not required for normal usage.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="sw-card min-h-[390px] min-w-0 overflow-hidden rounded-2xl border border-theme-border bg-surface-1/70 p-5 font-mono text-sm sm:p-6"
        >
          <div className="mb-5 flex items-center gap-2 border-b border-theme-border pb-4 text-xs text-theme-muted">
            <div className="h-3 w-3 rounded-full bg-red-500/70" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
            <div className="h-3 w-3 rounded-full bg-green-500/70" />

            <span className="ml-2 truncate">
              install — pick what you need
            </span>
          </div>

          <div className="-mx-1 overflow-x-auto px-1 text-theme-secondary">
            {installLines.map((line, index) => (
              <motion.div
                key={line}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.18 + index * 0.075,
                  duration: 0.3,
                  ease: 'easeOut',
                }}
                className={`whitespace-pre leading-[1.55] ${index === 0 ? 'mb-1 text-theme-muted' : ''
                  }`}
              >
                {line}

                {index === installLines.length - 1 && (
                  <motion.span
                    aria-hidden="true"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="ml-1 inline-block h-[1.05em] w-[2px] translate-y-[2px] bg-brand-400"
                  />
                )}
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1, duration: 0.4 }}
            className="mt-10 md:mt-24 border-t border-theme-border pt-4 text-[11px] leading-relaxed text-theme-muted/85"
          >
            Track the rollout in the{' '}
            <a
              href={`${DOCS}/connectors/roadmap.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:underline"
            >
              connectors roadmap
            </a>
            . Source lives in the{' '}
            <a
              href={CONNECTORS_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:underline"
            >
              monorepo
            </a>
            .
          </motion.p>
        </motion.div>
      </div>
    </Section>
  )
}

function QuickExamplesSection() {
  const examples = [
    {
      step: '01',
      label: 'Try GitHub repo memory',
      command: `statewave-connectors sync github \\
  --repo smaramwbc/statewave \\
  --subject repo:smaramwbc/statewave \\
  --dry-run`,
      docHref: `${DOCS}/connectors/github.md`,
    },
    {
      step: '02',
      label: 'Sync local docs and ADRs',
      command: `statewave-connectors sync markdown \\
  --path ./docs \\
  --subject repo:smaramwbc/statewave \\
  --dry-run`,
      docHref: `${DOCS}/connectors/markdown.md`,
    },
    {
      step: '03',
      label: 'Start the MCP server',
      command: `statewave-connectors mcp start`,
      docHref: `${DOCS}/connectors/mcp.md`,
    },
  ]

  return (
    <Section>
      <div className="mb-12 max-w-3xl sm:mb-14">
        <p className="section-eyebrow text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">
          Quick start
        </p>

        <Heading
          id="quick-examples"
          className="mt-4 font-heading text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-theme-primary md:text-5xl"
        >
          Dry-run first,{' '}
          <span className="text-gradient-brand">ingest second</span>
        </Heading>

        <p className="mt-6 max-w-2xl text-[17px] leading-[1.7] text-theme-secondary/85">
          Every connector supports{' '}
          <code className="font-mono text-[0.85em] text-theme-primary">
            --dry-run
          </code>{' '}
          — mapped episodes are printed without being sent anywhere. The CLI
          refuses to ingest unless{' '}
          <code className="font-mono text-[0.85em] text-theme-primary">
            STATEWAVE_URL
          </code>{' '}
          is set.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {examples.map((example, index) => (
          <motion.article
            key={example.label}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              delay: index * 0.08,
              duration: 0.45,
              ease: 'easeOut',
            }}
            className="group relative flex min-h-[280px] flex-col overflow-hidden rounded-2xl border border-theme-border bg-surface-1/55 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-400/45 hover:bg-surface-1/70 sm:p-6"
          >
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(74,140,255,0.10),transparent_45%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              aria-hidden="true"
            />

            <div
              className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/45 to-transparent"
              aria-hidden="true"
            />

            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] font-semibold tracking-[0.14em] text-brand-400">
                  {example.step}
                </span>

                <span className="h-px w-6 bg-theme-border" />

                <p className="text-sm font-semibold text-theme-primary">
                  {example.label}
                </p>
              </div>

              <a
                href={example.docHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-brand-400 transition hover:text-brand-300"
              >
                Docs

                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </a>
            </div>

            <div className="relative z-10 mt-6 flex flex-1 flex-col overflow-hidden rounded-xl border border-theme-border bg-surface-2/45">
              <div className="flex items-center gap-1.5 border-b border-theme-border px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-red-500/65" />
                <span className="h-2 w-2 rounded-full bg-yellow-500/65" />
                <span className="h-2 w-2 rounded-full bg-green-500/65" />

                <span className="ml-2 font-mono text-[10px] text-theme-muted">
                  terminal
                </span>
              </div>

              <pre className="flex-1 overflow-x-auto p-4 font-mono text-[12.5px] leading-[1.65] text-theme-secondary">
                <code>{example.command}</code>
              </pre>
            </div>
          </motion.article>
        ))}
      </div>
    </Section>
  )
}

function CTASection() {
  return (
    <Section>
      <div className="cta-card relative overflow-hidden rounded-[2.5rem] border border-brand-500/25 bg-surface-1/55 px-6 py-20 text-center">
        <div
          className="cta-card-glow absolute inset-0"
          aria-hidden="true"
        />

        <div
          className="absolute inset-x-20 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/60 to-transparent"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            CONNECTORS
          </div>

          <Heading
            id="start-with-connectors"
            className="font-heading text-4xl md:text-[64px] font-bold leading-[1.02] tracking-[-0.04em] text-theme-primary"
          >
            Start with one connector.
            <br />
            Add more when you're{' '}
            <span className="text-gradient-brand">ready</span>
          </Heading>

          <p className="mx-auto mt-6 max-w-2xl text-[20px] leading-[1.65] text-theme-secondary/85">
            The core stays clean. Connectors are optional, modular, independently
            versioned, and never required to use Statewave.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button href={`${DOCS}/connectors/index.md`} size="lg">
              View connector docs
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Button>

            <Button
              href={CONNECTORS_REPO}
              variant="secondary"
              size="lg"
            >
              Explore Connectors
            </Button>

            <Button
              to="/developers"
              variant="secondary"
              size="lg"
            >
              Developer Hub
            </Button>
          </div>

          <p className="mx-auto mt-8 max-w-3xl text-sm leading-relaxed text-theme-muted">
            Building your own connector?{' '}
            <a
              href={`${DOCS}/connectors/index.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:underline"
            >
              Read the connector contract
            </a>{' '}
            to understand the shared interface, episode model and dry-run workflow.
          </p>
        </div>
      </div>
    </Section>
  )
}