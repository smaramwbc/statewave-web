import type { Connector } from './types'

/** Follows the published @statewavedev/mcp-server 0.4.8 package (CLI help, tool registry,
 *  HTTP transport). Its README still describes v0.1.0. The ADR and PR in the story are the
 *  homepage's coding-agent example. */
export const mcpServer: Connector = {
  slug: 'mcp-server',
  name: 'MCP server',
  logo: 'modelcontextprotocol',
  group: 'MCP',
  status: 'preview',
  modes: [],
  pkg: '@statewavedev/mcp-server',
  source: 'https://github.com/smaramwbc/statewave-connectors/tree/main/packages/mcp-server',
  example: 'https://github.com/smaramwbc/statewave-connectors/tree/main/examples/copilot-mcp-memory',

  hero: {
    a: 'Your coding assistant,',
    grad: 'with a memory it can cite.',
    sub: 'One MCP server gives Claude Code, Cursor, Copilot and Codex your team’s decisions and history, with a source for every answer.',
    cmd: 'npx @statewavedev/connectors-cli quickstart',
    from: 'stdio · HTTP',
    to: 'repo:acme/widgets',
  },

  story: {
    heading: ['One question,', 'answered from memory.'],
    lede: 'A developer asks Claude Code about the job queue. The answer comes from the team’s own decisions.',
    steps: [
      { title: 'The assistant asks for context', text: 'Before it answers, the assistant calls statewave_get_context with the subject for this repo.' },
      { title: 'Statewave recalls the right memory', text: 'It returns a compact, ranked bundle for that subject, and every memory keeps the source it came from.' },
      { title: 'The answer cites its source', text: 'The assistant answers with the team’s decision and links back to the ADR and the review it came from.' },
    ],
    source: {
      label: 'MCP call',
      id: 'tools/call',
      title: 'statewave_get_context',
      body: 'subject: repo:acme/widgets · query: how do background jobs run?',
      meta: [['Client', 'Claude Code'], ['Transport', 'stdio']],
      via: 'Sent by Claude Code over stdio',
    },
    episode: {
      kind: 'docs.adr',
      subject: 'repo:acme/widgets',
      text: 'Job queue uses Postgres advisory locks, not Redis.',
      url: 'docs/adr/007.md',
      lane: 'repo:acme/widgets',
      laneNote: 'acme/widgets · 128 episodes',
    },
    answer: {
      asker: 'You · Claude Code',
      ask: 'Should the new export job use Redis for queueing?',
      answer: 'No. The job queue runs on Postgres advisory locks, per ADR 007. Add the export job to the existing queue.',
      sources: ['docs/adr/007.md', 'PR #212 review'],
      call: 'statewave_get_context("repo:acme/widgets")',
    },
  },

  reads: {
    eyebrow: 'What it exposes',
    heading: ['Six tools.', 'One memory behind them.'],
    lede: 'Four tools read. Two write: one saves an episode, the other compiles a subject so new episodes become recallable.',
    title: 'statewave-mcp-server',
    unit: ['tool', 'tools'],
    events: [
      { time: 'read', title: 'Get context', text: 'Compact, ranked context for a subject. The default tool to use inside a prompt.', kind: 'statewave_get_context' },
      { time: 'read', title: 'Search memories', text: 'Free-text search over compiled memories within a subject.', kind: 'statewave_search_memories' },
      { time: 'read', title: 'Get timeline', text: 'A subject’s episodes in order, filterable by kinds, since and until.', kind: 'statewave_get_timeline' },
      { time: 'read', title: 'List subjects', text: 'The subjects this instance knows, with episode and memory counts. Helps a chat client pick the right one.', kind: 'statewave_list_subjects' },
      { time: 'write', title: 'Ingest episode', text: 'Save one normalized episode, deduplicated on its idempotency key.', kind: 'statewave_ingest_episode' },
      { time: 'write', title: 'Compile subject', text: 'Compile a subject so newly ingested episodes become recallable.', kind: 'statewave_compile_subject' },
    ],
  },

  routing: {
    heading: ['Every call names a subject,', 'so answers stay scoped.'],
    lede: 'Pick a client to see which memory it reads.',
    pick: 'Example client',
    options: [
      { label: 'Claude Code in acme/widgets', detail: 'Local, over stdio', subject: 'repo:acme/widgets', why: 'A coding assistant reads the repo’s memory: decisions, conventions and recent changes.' },
      { label: 'A support agent', detail: 'Hosted, over HTTP', subject: 'customer:6001', why: 'A support agent reads one customer’s history, fed by Zendesk or Intercom.' },
      { label: 'A team agent in Slack', detail: 'Hosted, over HTTP', subject: 'team:T0ACME', why: 'A team agent reads what the Slack connector stored for the workspace.' },
    ],
    note: ['Chat clients with no repo open can call', 'statewave_list_subjects', 'to find the right subject first.'],
  },

  setup: {
    heading: ['Wire it once.', 'Every assistant shares the memory.'],
    steps: [
      { title: 'Have a Statewave server', text: 'The MCP server talks to an existing Statewave instance. The quickstart can start one for you with Docker.' },
      { title: 'Wire your assistant', text: 'The quickstart configures Claude Code, Claude Desktop, Cursor, VS Code / Copilot and Codex.' },
      { title: 'Check the tools', text: '--list-tools prints the tool surface as JSON and exits.' },
      { title: 'Optional: go remote', text: 'Start it with --http for Claude.ai custom connectors, ChatGPT or hosted agents. Set a token first.' },
    ],
    env: [
      { name: 'STATEWAVE_URL', when: 'Always', text: 'Your Statewave instance' },
      { name: 'STATEWAVE_API_KEY', when: 'Optional', text: 'If your instance requires one' },
      { name: 'STATEWAVE_TENANT_ID', when: 'Optional', text: 'The tenant to read and write' },
      { name: 'STATEWAVE_MCP_AUTH_TOKEN', when: 'HTTP', text: 'Bearer token every HTTP request must send' },
    ],
    terminal: [
      {
        label: 'Quickstart',
        env: [],
        cmd: 'npx @statewavedev/connectors-cli quickstart',
        notes: [
          'Starts a local Statewave server with Docker, or reuses yours',
          'Configures Claude Code, Claude Desktop, Cursor, VS Code / Copilot and Codex',
          'Safe to re-run: existing servers and configs are reused',
        ],
      },
      {
        label: 'Tools',
        env: ['STATEWAVE_URL=http://localhost:8100'],
        cmd: 'statewave-mcp-server --list-tools',
        outputLabel: 'Prints the tool surface and exits.',
        output: `{
  "server": "statewave-mcp-server",
  "statewave_url": "http://localhost:8100",
  "tools": [
    { "name": "statewave_ingest_episode", … },
    { "name": "statewave_search_memories", … },
    { "name": "statewave_get_context", … },
    { "name": "statewave_get_timeline", … },
    { "name": "statewave_compile_subject", … },
    { "name": "statewave_list_subjects", … }
  ]
}`,
      },
      {
        label: 'Local (stdio)',
        env: ['STATEWAVE_URL=http://localhost:8100', 'STATEWAVE_API_KEY=…'],
        cmd: 'statewave-mcp-server',
        notes: [
          'For Claude Code, Claude Desktop, Cursor and Codex on this machine',
          'Also available as statewave-connectors mcp start',
        ],
      },
      {
        label: 'Remote (HTTP)',
        env: ['STATEWAVE_URL=http://localhost:8100', 'STATEWAVE_MCP_AUTH_TOKEN=…'],
        cmd: 'statewave-mcp-server --http --port 8200',
        notes: [
          'Serves POST /mcp on 127.0.0.1:8200 by default',
          'Every request must send the bearer token',
          'Stateless: each request is handled on its own',
          'Use --host 0.0.0.0 only behind TLS and a token',
        ],
      },
    ],
  },

  safetyHeading: ['Local by default.', 'Locked down when remote.'],
  safety: [
    'Binds to 127.0.0.1 unless you choose otherwise.',
    'Checks the Origin header to block DNS rebinding from browsers.',
    'Requires a bearer token on HTTP when you set one.',
    'Vendor-neutral: no IDE, model provider or hosted dependency.',
  ],
  limits: [
    'It reads and writes memory, but doesn’t pull from your tools. Connectors do that.',
    'HTTP is request and response only, with no streaming. GET on the endpoint returns 405.',
    'It needs a running Statewave instance.',
  ],

  close: {
    a: 'Give your coding assistant',
    grad: 'a memory it can cite.',
    more: 'Feed it from',
    useCase: { label: 'Coding agent memory', href: '/use-cases' },
  },
  related: ['github', 'markdown', 'slack'],
}
