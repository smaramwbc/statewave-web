import type { Connector } from './types'

/** packages/github/README.md (v0.1.0 preview). Issue #42 in acme/widgets is the README's
 *  example episode; the comments and the fix around it are illustrative. */
export const github: Connector = {
  slug: 'github',
  name: 'GitHub',
  logo: 'github',
  group: 'Code',
  status: 'preview',
  modes: ['pull'],
  pkg: '@statewavedev/connectors-github',
  source: 'https://github.com/smaramwbc/statewave-connectors/tree/main/packages/github',
  example: 'https://github.com/smaramwbc/statewave-connectors/tree/main/examples/github-repo-memory',

  hero: {
    a: 'Every issue and pull request,',
    grad: 'remembered per repository.',
    sub: 'Issues, pull requests, reviews and releases become one memory per repository, so your coding agent knows the bugs and decisions behind the code.',
    cmd: 'statewave-connectors sync github --repo acme/widgets --dry-run',
    from: 'github.com/acme/widgets',
    to: 'repo:acme/widgets',
  },

  story: {
    heading: ['One issue,', 'from bug report to answer.'],
    lede: 'A flaky CI issue in acme/widgets, from the day it’s filed to the next time the build breaks the same way.',
    steps: [
      { title: 'Read the issue', text: 'Each sync pulls the repo’s issues, pull requests, comments, reviews and releases from GitHub.' },
      { title: 'File it under the repo', text: 'Every event becomes an episode in repo:acme/widgets. The issue, its comments and the fix share one memory.' },
      { title: 'Answer with the history', text: 'When CI fails on macOS again, your coding assistant recalls issue #42 and what fixed it, with a link back to GitHub.' },
    ],
    source: {
      label: 'Issue',
      id: '#42',
      title: 'CI is flaky',
      body: 'Happens on macOS runners.',
      meta: [['Author', 'ada'], ['Labels', 'bug, ci']],
      status: 'Open',
      via: 'Pulled by statewave-connectors sync',
    },
    episode: {
      kind: 'github.issue.opened',
      subject: 'repo:acme/widgets',
      text: 'ada opened issue #42: CI is flaky. Happens on macOS runners.',
      url: 'github.com/acme/widgets/issues/42',
      lane: 'repo:acme/widgets',
      laneNote: 'acme/widgets · 128 episodes',
    },
    answer: {
      asker: 'Priya · Developer',
      ask: 'The macOS build is failing at random again. Have we seen this before?',
      answer: 'Yes. Issue #42 tracked flaky builds on the macOS runners. They ran out of disk mid-build, and a cache cleanup step fixed it. Check that the step is still in the workflow.',
      sources: ['issue #42', 'comment · 10:30'],
      call: 'statewave_get_context("repo:acme/widgets")',
    },
  },

  reads: {
    heading: ['Issues, pull requests,', 'reviews and releases.'],
    lede: 'Nine kinds of event, from the first bug report to the release that ships the fix. Comments and reviews often hold the reasoning, so they become episodes too.',
    title: 'Issue #42 · acme/widgets',
    events: [
      { time: '09:12', who: 'ada', title: 'Issue opened', text: 'CI is flaky. Happens on macOS runners.', kind: 'github.issue.opened' },
      { time: '10:30', who: 'grace', title: 'Comment', text: 'The macOS runners run out of disk during the build. Clearing the cache first fixes it.', kind: 'github.issue.comment' },
      { time: '11:05', who: 'ada', title: 'Comment', text: 'Confirmed. Ten green runs in a row with the cleanup step.', kind: 'github.issue.comment' },
      { time: '11:20', who: 'grace', title: 'Issue closed', text: 'Closed once the cleanup step was merged.', kind: 'github.issue.closed' },
    ],
  },

  routing: {
    heading: ['One memory per repository,', 'shared by every issue and PR.'],
    lede: 'Pick a repository to see where it goes. An issue, the PR that fixed it and the release that shipped it end up side by side.',
    pick: 'Example repository',
    options: [
      { label: 'acme/widgets', detail: 'Issues, PRs, reviews, releases', subject: 'repo:acme/widgets', why: 'Every event in the repo shares one memory, keyed by owner and name.' },
      { label: 'acme/billing', detail: 'A second repo in the same org', subject: 'repo:acme/billing', why: 'Each repository keeps its own memory, so agents don’t mix up two codebases.' },
      { label: 'smaramwbc/statewave', detail: 'A public repo, no token', subject: 'repo:smaramwbc/statewave', why: 'Public repos sync without a token, within GitHub’s small unauthenticated rate limit.' },
    ],
    note: ['Pass', '--subject', 'to file a whole sync under a subject you choose.'],
  },

  setup: {
    steps: [
      { title: 'Add a token', text: 'Set GITHUB_TOKEN. Public repos work without one, but the unauthenticated rate limit is small.' },
      { title: 'Pick a repository', text: 'Pass it as owner/name, for example --repo acme/widgets.' },
      { title: 'Preview with --dry-run', text: 'The connector reads the repo and maps each event, then prints the episodes. Nothing is sent.' },
      { title: 'Ingest', text: 'Point STATEWAVE_URL at your instance and run the same command without --dry-run.' },
    ],
    env: [
      { name: 'GITHUB_TOKEN', when: 'Recommended', text: 'Optional for public repos. Without it the rate limit is small.' },
      { name: 'STATEWAVE_URL + STATEWAVE_API_KEY', when: 'To ingest', text: 'Your Statewave instance' },
    ],
    terminal: [
      {
        label: 'Dry-run',
        env: ['GITHUB_TOKEN=…'],
        cmd: 'statewave-connectors sync github --repo acme/widgets --dry-run --json',
        outputLabel: 'Prints the episodes. Sends nothing.',
        output: `{
  "subject": "repo:acme/widgets",
  "kind": "github.issue.opened",
  "text": "ada opened issue #42: CI is flaky\\n\\nhappens on macos runners",
  "occurred_at": "2026-05-20T09:12:00.000Z",
  "source": {
    "type": "github.issue",
    "id": "acme/widgets#42",
    "url": "https://github.com/acme/widgets/issues/42"
  },
  "metadata": {
    "issue_number": 42,
    "author": "ada",
    "labels": ["bug", "ci"],
    "state": "open"
  }
}`,
      },
      {
        label: 'Ingest',
        env: ['STATEWAVE_URL=http://localhost:8100', 'STATEWAVE_API_KEY=…'],
        cmd: 'statewave-connectors sync github --repo acme/widgets',
        notes: [
          'Narrow a run with --since or --max-items.',
          'Pass --subject to file the repo under a subject you choose.',
          'Keep GITHUB_TOKEN set, even for public repos. It’s strongly recommended.',
        ],
      },
    ],
  },

  safety: [
    'It reads GITHUB_TOKEN and no other credentials.',
    'Nothing is sent during --dry-run.',
    'It refuses to ingest until STATEWAVE_URL is set.',
    'No telemetry. Sync state stays on your machine.',
  ],
  limits: [
    'Preview, v0.1.0.',
    'Pull only. New activity arrives on the next sync, with no webhook receiver.',
    'Without GITHUB_TOKEN, GitHub’s small unauthenticated rate limit applies.',
  ],

  close: {
    a: 'Every issue your team closed,',
    grad: 'there when the bug comes back.',
    more: 'More code connectors',
    useCase: { label: 'Coding agent memory', href: '/use-cases' },
  },
  related: ['gitlab', 'bitbucket', 'gitea'],
}
