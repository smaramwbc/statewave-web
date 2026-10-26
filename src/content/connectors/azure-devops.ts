import type { Connector } from './types'

/** packages/azure-devops/README.md (v0.1.0 preview). PR !100 in acme/platform/widgets is the
 *  README's example episode; the review around it is illustrative. */
export const azureDevops: Connector = {
  slug: 'azure-devops',
  name: 'Azure DevOps',
  logo: '/connectors/azure-devops.svg',
  group: 'Code',
  status: 'preview',
  modes: ['pull'],
  pkg: '@statewavedev/connectors-azure-devops',
  source: 'https://github.com/smaramwbc/statewave-connectors/tree/main/packages/azure-devops',

  hero: {
    a: 'Pull requests, votes and work items,',
    grad: 'filed under each repository.',
    sub: 'Pull requests, thread comments, reviewer votes and work items from Azure DevOps become one memory per repository, so your coding agent can see what was decided and who approved it.',
    cmd: 'statewave-connectors sync azure-devops --repo acme/platform/widgets --dry-run',
    from: 'dev.azure.com/acme/platform',
    to: 'repo:acme/platform/widgets',
  },

  story: {
    heading: ['One pull request,', 'vote by vote.'],
    lede: 'Pull request !100 added an MCP server to acme/platform/widgets. Follow it from review to an answer later on.',
    steps: [
      { title: 'Read the pull request', text: 'Each sync pulls pull requests, thread comments and reviewer votes from the repository, plus work items.' },
      { title: 'File it under the repository', text: 'Every event becomes an episode in repo:acme/platform/widgets, with organization, project and repository in the subject.' },
      { title: 'Answer with the review', text: 'When someone asks how the MCP server got in, your coding assistant recalls !100, its comments and the votes on it.' },
    ],
    source: {
      label: 'Pull request',
      id: '!100',
      title: 'Add MCP server',
      body: 'Implements the skeleton.',
      meta: [['Author', 'Linus T'], ['Project', 'acme/platform']],
      status: 'Completed',
      via: 'Pulled by statewave-connectors sync',
    },
    episode: {
      kind: 'azure.pr.merged',
      subject: 'repo:acme/platform/widgets',
      text: 'Linus T merged PR !100: Add MCP server. Implements the skeleton.',
      url: 'dev.azure.com/acme/platform/_git/widgets/pullrequest/100',
      lane: 'repo:acme/platform/widgets',
      laneNote: 'acme/platform/widgets · 88 episodes',
    },
    answer: {
      asker: 'Ines · Developer',
      ask: 'Who signed off on the MCP server, and were there concerns?',
      answer: 'Pull request !100 added it. Ana approved with suggestions and asked for a health check endpoint. Linus T added it in the same PR before it was completed.',
      sources: ['PR !100', 'comment · 10:20'],
      call: 'statewave_get_context("repo:acme/platform/widgets")',
    },
  },

  reads: {
    heading: ['Code review and work items,', 'in one memory.'],
    lede: 'Seven kinds of event. A reviewer vote maps to approved, approved with suggestions, waiting for author or rejected. A vote of 0 and system comments are skipped.',
    title: 'Pull request !100 · acme/platform/widgets',
    events: [
      { time: '09:30', who: 'Linus T', title: 'Pull request opened', text: 'Add MCP server. Implements the skeleton.', kind: 'azure.pr.opened' },
      { time: '10:20', who: 'Ana', title: 'Thread comment', text: 'Add a health check endpoint before this ships.', kind: 'azure.pr.comment' },
      { time: '15:00', title: 'Reviewer vote', text: 'Ana voted 5, approved with suggestions. Votes carry no time, so this uses the PR’s close date.', kind: 'azure.pr.review' },
      { time: '15:00', who: 'Linus T', title: 'Completed', text: 'Pull request completed and merged.', kind: 'azure.pr.merged' },
    ],
  },

  routing: {
    heading: ['Three parts to every subject,', 'one memory per repository.'],
    lede: 'Pick a repository to see where it goes. Azure DevOps keeps repositories inside projects, so the subject names the organization and project too.',
    pick: 'Example repository',
    options: [
      { label: 'widgets', detail: 'Organization acme · project platform', subject: 'repo:acme/platform/widgets', why: 'Pull requests, votes and work items for the repo share one memory.' },
      { label: 'billing', detail: 'Organization acme · project payments', subject: 'repo:acme/payments/billing', why: 'A repo in another project gets its own memory, even in the same organization.' },
    ],
    note: ['The connector needs all three parts, as in', '--repo acme/platform/widgets', 'and rejects a two-part spec.'],
  },

  setup: {
    steps: [
      { title: 'Create a Personal Access Token', text: 'Give it Code (Read) for pull requests, comments and reviews. Add Work Items (Read) for work items.' },
      { title: 'Set your credentials', text: 'Put the token in AZURE_DEVOPS_PAT. It’s sent over HTTP Basic auth with an empty username.' },
      { title: 'Preview with --dry-run', text: 'Pass --repo as organization/project/repository. The connector prints the episodes and sends nothing.' },
      { title: 'Ingest', text: 'Point STATEWAVE_URL at your instance and run the same command without --dry-run.' },
    ],
    env: [
      { name: 'AZURE_DEVOPS_PAT', when: 'Always', text: 'Personal Access Token with Code (Read), plus Work Items (Read) for work items' },
      { name: 'STATEWAVE_URL + STATEWAVE_API_KEY', when: 'To ingest', text: 'Your Statewave instance' },
    ],
    terminal: [
      {
        label: 'Dry-run',
        env: ['AZURE_DEVOPS_PAT=…'],
        cmd: 'statewave-connectors sync azure-devops --repo acme/platform/widgets --dry-run --json',
        outputLabel: 'Prints the episodes. Sends nothing.',
        output: `{
  "subject": "repo:acme/platform/widgets",
  "kind": "azure.pr.merged",
  "text": "Linus T merged PR !100: Add MCP server\\n\\nimplements the skeleton",
  "occurred_at": "2026-01-03T00:00:00.000Z",
  "source": {
    "type": "azure.pull_request",
    "id": "acme/platform/widgets#100",
    "url": "https://dev.azure.com/acme/platform/_git/widgets/pullrequest/100"
  },
  "metadata": {
    "pr_id": 100,
    "author": "Linus T",
    "status": "completed",
    "merged": true
  }
}`,
      },
      {
        label: 'Ingest',
        env: ['STATEWAVE_URL=http://localhost:8100', 'STATEWAVE_API_KEY=…'],
        cmd: 'statewave-connectors sync azure-devops --repo acme/platform/widgets',
        notes: [
          'Code (Read) covers pull requests, comments and reviews. Work items need Work Items (Read).',
          'Narrow a run with --since or --max-items.',
        ],
      },
      {
        label: 'Azure DevOps Server',
        env: ['AZURE_DEVOPS_PAT=…'],
        cmd: 'statewave-connectors sync azure-devops --base-url https://your-host/tfs --repo acme/platform/widgets --dry-run',
        notes: [
          '--base-url points the connector at an on-prem Azure DevOps Server.',
          'Without it, the connector uses https://dev.azure.com.',
        ],
      },
    ],
  },

  safety: [
    'It reads AZURE_DEVOPS_PAT and no other credentials.',
    'It only needs read scopes, Code (Read) and Work Items (Read).',
    'Nothing is sent during --dry-run.',
    'No telemetry. Sync state stays on your machine.',
  ],
  limits: [
    'Preview, v0.1.0. Not yet verified against a live organization. Only the bad-auth path is live-confirmed.',
    'Azure DevOps has no per-vote timestamp, so review episodes use the PR’s closedDate, falling back to creationDate.',
    'A vote of 0 (no response) produces no review episode.',
  ],

  close: {
    a: 'Every vote and work item,',
    grad: 'in your coding agent’s memory.',
    more: 'More code connectors',
    useCase: { label: 'Coding agent memory', href: '/use-cases' },
  },
  related: ['github', 'gitlab', 'bitbucket'],
}
