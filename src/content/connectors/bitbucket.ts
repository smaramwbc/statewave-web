import type { Connector } from './types'

/** packages/bitbucket/README.md (v0.1.0 preview). myworkspace/myrepo is the README's example
 *  repository; PR #12 and its review are illustrative. */
export const bitbucket: Connector = {
  slug: 'bitbucket',
  name: 'Bitbucket',
  logo: 'bitbucket',
  group: 'Code',
  status: 'preview',
  modes: ['pull'],
  pkg: '@statewavedev/connectors-bitbucket',
  source: 'https://github.com/smaramwbc/statewave-connectors/tree/main/packages/bitbucket',

  hero: {
    a: 'Bitbucket pull requests,',
    grad: 'kept as repository memory.',
    sub: 'Pull requests, comments and issues from Bitbucket Cloud become one memory per repository, so your coding agent can recall what a review decided.',
    cmd: 'statewave-connectors sync bitbucket --repo myworkspace/myrepo --dry-run',
    from: 'bitbucket.org/myworkspace/myrepo',
    to: 'repo:myworkspace/myrepo',
  },

  story: {
    heading: ['One pull request,', 'from review to answer.'],
    lede: 'PR #12 added upload retries to myworkspace/myrepo, and its review settled how many. Follow it to the question it answers later.',
    steps: [
      { title: 'Read the pull request', text: 'Each sync pulls pull requests, comments and issues from the repository on Bitbucket Cloud.' },
      { title: 'File it under the repository', text: 'Every event becomes an episode in repo:myworkspace/myrepo, next to the issues from the same repo.' },
      { title: 'Answer with the review', text: 'When someone hits the retry limit, your coding assistant recalls PR #12 and why the limit is three.' },
    ],
    source: {
      label: 'Pull request',
      id: '#12',
      title: 'fix: retry uploads on 503',
      body: 'The storage API returns 503 under load. Retry with backoff.',
      meta: [['Author', 'linus'], ['Branch', 'fix/upload-retry → main']],
      status: 'Merged',
      via: 'Pulled by statewave-connectors sync',
    },
    episode: {
      kind: 'bitbucket.pr.merged',
      subject: 'repo:myworkspace/myrepo',
      text: 'linus merged PR #12: fix: retry uploads on 503. The storage API returns 503 under load.',
      url: 'bitbucket.org/myworkspace/myrepo/pull-requests/12',
      lane: 'repo:myworkspace/myrepo',
      laneNote: 'myworkspace/myrepo · 74 episodes',
    },
    answer: {
      asker: 'Tom · Developer',
      ask: 'Uploads gave up after three tries during the outage. Is that on purpose?',
      answer: 'Yes. In the review of PR #12, Mei asked to cap retries at three so a real outage fails fast. linus kept the cap and added backoff between tries.',
      sources: ['PR #12', 'comment · 11:30'],
      call: 'statewave_get_context("repo:myworkspace/myrepo")',
    },
  },

  reads: {
    heading: ['Pull requests and issues,', 'comments included.'],
    lede: 'Seven kinds of event from pull requests and the issue tracker. A declined or superseded PR is filed as closed. A merged one is filed as merged.',
    title: 'Pull request #12 · myworkspace/myrepo',
    events: [
      { time: '10:02', who: 'linus', title: 'Pull request opened', text: 'fix: retry uploads on 503. The storage API returns 503 under load.', kind: 'bitbucket.pr.opened' },
      { time: '11:30', who: 'mei', title: 'Comment', text: 'Cap the retries at three so a real outage fails fast.', kind: 'bitbucket.pr.comment' },
      { time: '12:10', who: 'linus', title: 'Comment', text: 'Done. Three tries, with backoff in between.', kind: 'bitbucket.pr.comment' },
      { time: '14:45', who: 'linus', title: 'Merged', text: 'Merged fix/upload-retry into main.', kind: 'bitbucket.pr.merged' },
    ],
  },

  routing: {
    heading: ['One memory per repository,', 'named by its workspace.'],
    lede: 'Pick a repository to see where it goes. The subject is the workspace and the repository name.',
    pick: 'Example repository',
    options: [
      { label: 'myworkspace/myrepo', detail: 'Pull requests and issues', subject: 'repo:myworkspace/myrepo', why: 'Every PR, comment and issue in the repo shares one memory.' },
      { label: 'myworkspace/infra', detail: 'Another repo in the workspace', subject: 'repo:myworkspace/infra', why: 'Each repository keeps its own memory, even in the same workspace.' },
    ],
    note: ['Prefer your own naming?', '--subject', 'sets the subject for a whole sync.'],
  },

  setup: {
    steps: [
      { title: 'Create an access token', text: 'Set BITBUCKET_TOKEN. It’s sent as a Bearer token. App passwords aren’t supported yet.' },
      { title: 'Pick a repository', text: 'Pass it as workspace/repo, for example --repo myworkspace/myrepo.' },
      { title: 'Preview with --dry-run', text: 'The connector reads the repo and maps each event, then prints the episodes. Nothing is sent.' },
      { title: 'Ingest', text: 'Point STATEWAVE_URL at your instance and run the same command without --dry-run.' },
    ],
    env: [
      { name: 'BITBUCKET_TOKEN', when: 'Recommended', text: 'An access token, sent as Bearer. Optional for public repos.' },
      { name: 'STATEWAVE_URL + STATEWAVE_API_KEY', when: 'To ingest', text: 'Your Statewave instance' },
    ],
    terminal: [
      {
        label: 'Dry-run',
        env: ['BITBUCKET_TOKEN=…'],
        cmd: 'statewave-connectors sync bitbucket --repo myworkspace/myrepo --dry-run --json',
        outputLabel: 'Prints the episodes. Sends nothing.',
        output: `{
  "subject": "repo:myworkspace/myrepo",
  "kind": "bitbucket.pr.merged",
  "text": "linus merged PR #7: feat: thing\\n\\ndo stuff",
  "occurred_at": "2026-02-03T00:00:00.000Z",
  "source": {
    "type": "bitbucket.pull_request",
    "id": "myworkspace/myrepo#7",
    "url": "https://bitbucket.org/myworkspace/myrepo/pull-requests/7"
  },
  "metadata": {
    "pr_id": 7,
    "author": "linus",
    "state": "closed",
    "merged": true,
    "source_branch": "feat/thing",
    "destination_branch": "main"
  }
}`,
      },
      {
        label: 'Ingest',
        env: ['STATEWAVE_URL=http://localhost:8100', 'STATEWAVE_API_KEY=…'],
        cmd: 'statewave-connectors sync bitbucket --repo myworkspace/myrepo',
        notes: [
          'Narrow a run with --since or --max-items. --since is sent to Bitbucket as a BBQL query.',
          'Without a token, Bitbucket’s per-IP rate limit is small.',
        ],
      },
    ],
  },

  safety: [
    'It reads BITBUCKET_TOKEN and no other credentials.',
    'Nothing is sent during --dry-run.',
    'It refuses to ingest until STATEWAVE_URL is set.',
    'No telemetry. Sync state stays on your machine.',
  ],
  limits: [
    'Preview, v0.1.0. Built for Bitbucket Cloud.',
    'App passwords aren’t supported yet. Use an access token.',
    'Smoke-tested live against bitbucket.org on 2026-05-30. The full end-to-end run was capped by the unauthenticated rate limit.',
  ],

  close: {
    a: 'Pull requests your team merged,',
    grad: 'recalled before the next one.',
    more: 'More code connectors',
    useCase: { label: 'Coding agent memory', href: '/use-cases' },
  },
  related: ['github', 'gitlab', 'azure-devops'],
}
