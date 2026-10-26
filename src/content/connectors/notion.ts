import type { Connector } from './types'

/** packages/notion/README.md (v0.1.2). The auth decision page is illustrative, built on the
 *  README's example episode and its recommended per-sync subject (repo:acme/platform). */
export const notion: Connector = {
  slug: 'notion',
  name: 'Notion',
  logo: 'notion',
  group: 'Knowledge',
  status: 'stable',
  modes: ['pull'],
  pkg: '@statewavedev/connectors-notion',
  source: 'https://github.com/smaramwbc/statewave-connectors/tree/main/packages/notion',

  hero: {
    a: 'Every Notion decision,',
    grad: 'filed where it applies.',
    sub: 'Pages shared with your integration become decision memory. Add their content and comments, and file them under the repo, project or team they govern.',
    cmd: 'statewave-connectors sync notion --subject repo:acme/platform --dry-run',
    from: 'Acme workspace',
    to: 'repo:acme/platform',
  },

  story: {
    heading: ['One design decision,', 'kept next to the code.'],
    lede: 'The platform team settles how services should authenticate. Here’s that page, from Notion to the agent that needs it.',
    steps: [
      { title: 'Read the page', text: 'The connector pulls every page shared with your integration. Add content and comments to read the body and the discussion.' },
      { title: 'File it where it applies', text: 'You set the subject for each sync. This team files its decisions under repo:acme/platform, next to the code they govern.' },
      { title: 'Answer with the decision', text: 'When someone starts a new service, the agent checks the auth decision first and links back to the page.' },
    ],
    source: {
      label: 'Page',
      id: '1a2b3c4d',
      title: 'Auth design decision',
      body: 'We will standardize on OAuth2 for all services.',
      meta: [['Database', 'Decisions'], ['Connection', 'Statewave decision memory']],
      status: 'Decided',
      via: 'Pulled by statewave-connectors sync',
    },
    episode: {
      kind: 'notion.page.created',
      subject: 'repo:acme/platform',
      text: 'Auth design decision. We will standardize on OAuth2 for all services.',
      url: 'notion.so/1a2b3c4d',
      lane: 'repo:acme/platform',
      laneNote: 'acme/platform · 52 episodes',
    },
    answer: {
      asker: 'Lin · billing service',
      ask: 'How should the new billing service authenticate?',
      answer: 'With OAuth2. The platform team made it the standard for all services, and service tokens come from the shared auth server.',
      sources: ['Auth design decision', 'comment · May 19'],
      call: 'statewave_get_context("repo:acme/platform")',
    },
  },

  reads: {
    heading: ['Every shared page.', 'Bodies and comments if you ask.'],
    lede: 'Each page becomes one episode. Content adds the page body to it, and comments arrive as episodes of their own. Each costs one extra API call per page.',
    toggle: { off: 'Pages', on: 'Pages + content + comments', offFlag: '--include pages', onFlag: '--include pages,content,comments' },
    title: 'Auth design decision · Decisions',
    events: [
      { time: 'May 18', who: 'Priya', title: 'Page created', text: 'Auth design decision. We will standardize on OAuth2 for all services.', kind: 'notion.page.created' },
      { time: 'May 19', who: 'Lin', title: 'Comment', text: 'Do internal jobs need this too?', kind: 'notion.comment.posted', optIn: true },
      { time: 'May 19', who: 'Priya', title: 'Reply', text: 'Yes. Service tokens come from the shared auth server.', kind: 'notion.comment.posted', optIn: true },
      { time: 'May 22', who: 'Priya', title: 'Page edited', text: 'Added a migration plan for the two legacy services.', kind: 'notion.page.updated' },
    ],
  },

  routing: {
    heading: ['One bucket by default.', 'Better with a subject per sync.'],
    lede: 'Notion pages don’t carry a customer or team the connector can read. Pick the unit your agents will ask about, and run a sync for each.',
    pick: 'Example sync',
    options: [
      { label: 'No --subject', detail: 'Every page the integration can see', subject: 'workspace:notion', why: 'Everything shares one memory. Fine when you want a single pool of decision docs.' },
      { label: 'Platform decisions', detail: '--subject repo:acme/platform', subject: 'repo:acme/platform', why: 'Decisions that govern a repo sit next to its ADRs from the Markdown connector.' },
      { label: 'Onboarding project', detail: '--subject project:onboarding-2026', subject: 'project:onboarding-2026', why: 'Project decisions stay with the project.' },
    ],
    note: ['Only want one database?', '--databases <id>', 'scopes the pull to it instead of the whole workspace.'],
  },

  setup: {
    steps: [
      { title: 'Create an integration', text: 'At notion.so/my-integrations, add a new integration with read access. Copy its token.' },
      { title: 'Share pages with it', text: 'On each page or database, open Connections and add the integration. It only sees what you share, and sharing a database shares every row.' },
      { title: 'Preview with --dry-run', text: 'The connector reads and maps the pages, then prints the episodes. Nothing is sent.' },
      { title: 'Ingest', text: 'Point STATEWAVE_URL at your instance, set --subject, and run the same command without --dry-run.' },
    ],
    env: [
      { name: 'NOTION_API_TOKEN', when: 'Always', text: 'An internal integration token, or an OAuth access token you already have' },
      { name: 'STATEWAVE_URL + STATEWAVE_API_KEY', when: 'To ingest', text: 'Your Statewave instance' },
    ],
    terminal: [
      {
        label: 'Dry-run',
        env: ['NOTION_API_TOKEN=secret_…'],
        cmd: 'statewave-connectors sync notion --dry-run --json',
        outputLabel: 'Prints the episodes. Sends nothing.',
        output: `{
  "subject": "workspace:notion",
  "kind": "notion.page.created",
  "text": "Auth design decision\\n\\nWe will standardize on OAuth2 for all services.",
  "occurred_at": "2026-05-18T00:00:00.000Z",
  "source": {
    "type": "notion.page.create",
    "id": "page:1a2b3c4d",
    "url": "https://www.notion.so/1a2b3c4d"
  }
}`,
      },
      {
        label: 'Ingest',
        env: ['STATEWAVE_URL=http://localhost:8100', 'STATEWAVE_API_KEY=…'],
        cmd: 'statewave-connectors sync notion --include pages,content,comments --subject repo:acme/platform --since 2026-01-01',
        notes: [
          'content and comments each cost one extra API call per page, plus paging on long pages.',
          '--since skips pages last edited before that date.',
          'Cap a run with --max-items.',
        ],
      },
      {
        label: 'Databases',
        env: ['NOTION_API_TOKEN=secret_…'],
        cmd: 'statewave-connectors sync notion --databases 5e6f7a8b --subject repo:acme/platform --dry-run',
        notes: [
          'Queries only the databases you list, instead of searching the whole workspace.',
          'Server-side property filters aren’t supported yet.',
        ],
      },
    ],
  },

  safety: [
    'It only sees pages and databases you share with the integration.',
    'The token is only sent to api.notion.com.',
    'Page content and comments are opt-in.',
    '--dry-run shows every episode before anything is sent.',
  ],
  limits: [
    'Callouts, embeds, tables, columns, child databases and synced blocks are dropped from page bodies.',
    'Only the title property is read. Other database columns are dropped for now.',
    'Pull only. Notion’s outbound webhooks are still in private beta.',
    'Comments are page-level. Inline comments on blocks aren’t read yet.',
  ],

  close: {
    a: 'Give your agents',
    grad: 'the decisions your team wrote down.',
    more: 'More knowledge connectors',
    useCase: { label: 'Coding agent memory', href: '/use-cases' },
  },
  related: ['markdown', 'jira'],
}
