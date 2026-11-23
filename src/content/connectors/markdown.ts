import type { Connector } from './types'

/** packages/markdown/README.md (v0.1.0 preview). The required subject is checked against
 *  the published package (sync throws "markdown sync requires a subject"). The ADR set is
 *  illustrative, built on the README's example episode (repo:acme/widgets, ADR 0007). */
export const markdown: Connector = {
  slug: 'markdown',
  name: 'Markdown & docs',
  logo: 'markdown',
  group: 'Knowledge',
  status: 'preview',
  modes: ['pull'],
  pkg: '@statewavedev/connectors-markdown',
  source: 'https://github.com/smaramwbc/statewave-connectors/tree/main/packages/markdown',
  example: 'https://github.com/smaramwbc/statewave-connectors/tree/main/examples/docs-decision-memory',

  hero: {
    a: 'Your ADRs and docs,',
    grad: 'remembered by the repo.',
    sub: 'Markdown files become decision memory, sorted into ADRs, RFCs, decisions and pages. It runs on your machine and needs no credentials.',
    cmd: 'statewave-connectors sync markdown --path ./docs --subject repo:acme/widgets --dry-run',
    from: './docs',
    to: 'repo:acme/widgets',
  },

  story: {
    heading: ['One ADR,', 'from the repo to the agent.'],
    lede: 'ADR 0007 records why Acme chose Redis for caching. Here’s how it reaches a coding agent months later.',
    steps: [
      { title: 'Read the file', text: 'The connector walks ./docs for .md and .mdx files. It takes the title from the frontmatter, or from the first heading.' },
      { title: 'File it under the repo', text: 'The path sets the kind, so a file under adr/ becomes docs.adr. Every doc lands in the subject you pass, here repo:acme/widgets.' },
      { title: 'Answer with the decision', text: 'When someone wants to change the cache, the coding agent reads the ADR first and cites it.' },
    ],
    source: {
      label: 'ADR',
      id: '0007',
      title: 'Use Redis for caching',
      body: 'We will use Redis as the cache layer for session data.',
      meta: [['Path', 'docs/adr/0007-caching.md'], ['Repo', 'acme/widgets']],
      status: 'Accepted',
      via: 'Read from ./docs on disk',
    },
    episode: {
      kind: 'docs.adr',
      subject: 'repo:acme/widgets',
      text: 'Use Redis for caching. We will use Redis as the cache layer for session data.',
      url: 'file:///repo/docs/adr/0007-caching.md',
      lane: 'repo:acme/widgets',
      laneNote: 'acme/widgets · 86 episodes',
    },
    answer: {
      asker: 'Ada · acme/widgets',
      ask: 'Can we drop Redis and keep sessions in memory?',
      answer: 'ADR 0007 made Redis the cache layer for session data. Dropping it would reverse that decision, so it’s worth writing a new ADR first.',
      sources: ['docs/adr/0007-caching.md'],
      call: 'statewave_get_context("repo:acme/widgets")',
    },
  },

  reads: {
    heading: ['The path picks the kind.', 'You don’t tag anything.'],
    lede: 'Every .md and .mdx file under the folder becomes one episode. The connector sorts each one by the folder it sits in and the name it has.',
    title: 'docs/ · acme/widgets',
    events: [
      { time: 'adr/', title: '0007-caching.md', text: 'Use Redis for caching', kind: 'docs.adr' },
      { time: 'rfcs/', title: 'RFC-0012-rate-limits.md', text: 'Rate limits per API key', kind: 'docs.rfc' },
      { time: 'notes/', title: 'queue-decision.md', text: 'Why we chose SQS for background jobs', kind: 'docs.decision' },
      { time: 'guides/', title: 'local-setup.md', text: 'Run the stack on your laptop', kind: 'docs.page' },
    ],
  },

  routing: {
    heading: ['You choose the subject.', 'There’s no default.'],
    lede: 'Docs don’t say who they belong to, so every sync needs --subject. Without one, the sync stops with an error.',
    pick: 'Example folder',
    options: [
      { label: 'Repo docs', detail: '--path ./docs in acme/widgets', subject: 'repo:acme/widgets', why: 'Use it for decisions that govern one repository. Notion pages can join them under the same subject.' },
      { label: 'Team handbook', detail: '--path ./handbook', subject: 'team:platform-eng', why: 'Any stable string works. Use the unit your agents will ask about.' },
    ],
    note: ['Several repos? Run one sync per folder with', '--subject repo:<owner>/<repo>', 'for each.'],
  },

  setup: {
    steps: [
      { title: 'Pick a folder', text: 'Point --path at your docs. The connector walks it for .md and .mdx files.' },
      { title: 'Pick a subject', text: 'Pass --subject, usually repo:<owner>/<repo>. The sync won’t run without one.' },
      { title: 'Preview with --dry-run', text: 'The connector reads and sorts each file, then prints the episodes. Nothing is sent.' },
      { title: 'Ingest', text: 'Point STATEWAVE_URL at your instance and run the same command without --dry-run.' },
    ],
    env: [
      { name: 'STATEWAVE_URL + STATEWAVE_API_KEY', when: 'To ingest', text: 'Your Statewave instance. The connector needs nothing else.' },
    ],
    terminal: [
      {
        label: 'Dry-run',
        env: [],
        cmd: 'statewave-connectors sync markdown --path ./docs --subject repo:acme/widgets --dry-run --json',
        outputLabel: 'Prints the episodes. Sends nothing.',
        output: `{
  "subject": "repo:acme/widgets",
  "kind": "docs.adr",
  "text": "Use Redis for caching\\n\\nWe will use Redis as the cache layer for session data.",
  "occurred_at": "2026-05-18T00:00:00.000Z",
  "source": {
    "type": "markdown",
    "id": "docs/adr/0007-caching.md",
    "url": "file:///repo/docs/adr/0007-caching.md"
  },
  "metadata": {
    "path": "docs/adr/0007-caching.md",
    "title": "Use Redis for caching",
    "size": 1834
  }
}`,
      },
      {
        label: 'Ingest',
        env: ['STATEWAVE_URL=http://localhost:8100', 'STATEWAVE_API_KEY=…'],
        cmd: 'statewave-connectors sync markdown --path ./docs --subject repo:acme/widgets',
        notes: [
          'Keys come from each file’s path and content hash, so only changed files make new episodes.',
          'YAML frontmatter is read when present. The first H1 is the fallback title.',
        ],
      },
    ],
  },

  safety: [
    'It reads files on your disk and needs no credentials.',
    'No network calls beyond the optional ingest into Statewave.',
    'Every sync needs --subject, so docs only land where you put them.',
    '--dry-run shows every episode before anything is sent.',
  ],
  limits: [
    'Kinds come from paths and filenames. The connector doesn’t read the content to decide.',
    'Only .md and .mdx files are read.',
  ],

  close: {
    a: 'Give your coding agent',
    grad: 'the decisions behind the code.',
    more: 'More knowledge connectors',
    useCase: { label: 'Coding agent memory', href: '/use-cases' },
  },
  related: ['notion', 'github'],
}
