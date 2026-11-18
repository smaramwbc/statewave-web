import type { Connector } from './types'

/** packages/gitea/README.md (v0.1.0 preview). Issue #42 in acme/widgets is the README's
 *  example episode; PR #43, the fix the page follows, is illustrative. */
export const gitea: Connector = {
  slug: 'gitea',
  name: 'Gitea & Forgejo',
  logo: 'gitea',
  group: 'Code',
  status: 'preview',
  modes: ['pull'],
  pkg: '@statewavedev/connectors-gitea',
  source: 'https://github.com/smaramwbc/statewave-connectors/tree/main/packages/gitea',

  hero: {
    a: 'Your own Gitea or Forgejo,',
    grad: 'turned into repository memory.',
    sub: 'Point the connector at your instance. Issues, pull requests, reviews and releases become one memory per repository that your coding agent can recall.',
    cmd: 'statewave-connectors sync gitea --host https://gitea.example.com --repo acme/widgets --dry-run',
    from: 'gitea.example.com/acme/widgets',
    to: 'repo:acme/widgets',
  },

  story: {
    heading: ['One pull request,', 'from your forge to your agent.'],
    lede: 'PR #43 pinned the macOS runner image in acme/widgets after CI turned flaky. Follow it from your Gitea instance to an answer weeks later.',
    steps: [
      { title: 'Read the pull request', text: 'Each sync reads your instance’s REST API for issues, pull requests, comments, reviews and releases.' },
      { title: 'File it under the repository', text: 'Every event becomes an episode in repo:acme/widgets. The PR sits next to issue #42, the bug it fixed.' },
      { title: 'Answer with the reason', text: 'When someone wants to bump the runner image, your coding assistant recalls PR #43 and why the pin is there.' },
    ],
    source: {
      label: 'Pull request',
      id: '#43',
      title: 'Pin the macOS runner image',
      body: 'Fixes #42. The cache step hangs on the newer image.',
      meta: [['Author', 'grace'], ['Instance', 'gitea.example.com']],
      status: 'Merged',
      via: 'Pulled by statewave-connectors sync',
    },
    episode: {
      kind: 'gitea.pr.merged',
      subject: 'repo:acme/widgets',
      text: 'grace merged PR #43: Pin the macOS runner image. Fixes #42.',
      url: 'gitea.example.com/acme/widgets/pulls/43',
      lane: 'repo:acme/widgets',
      laneNote: 'acme/widgets · 52 episodes',
    },
    answer: {
      asker: 'Ola · Developer',
      ask: 'Can I bump the macOS runner image in CI?',
      answer: 'Careful. PR #43 pinned it because the cache step hung on the newer image and made CI flaky, as tracked in issue #42. The plan was to unpin once the cache step is fixed upstream.',
      sources: ['PR #43', 'issue #42'],
      call: 'statewave_get_context("repo:acme/widgets")',
    },
  },

  reads: {
    heading: ['Reviews count.', 'Review requests don’t.'],
    lede: 'Nine kinds of event, from the first issue to the release. Reviews become episodes. A plain request for review is skipped.',
    title: 'Pull request #43 · acme/widgets',
    events: [
      { time: '13:05', who: 'grace', title: 'Pull request opened', text: 'Pin the macOS runner image. Fixes #42.', kind: 'gitea.pr.opened' },
      { time: '13:40', who: 'ada', title: 'Review', text: 'Approved. Add a line in the workflow saying why it’s pinned.', kind: 'gitea.pr.review' },
      { time: '13:52', who: 'grace', title: 'Comment', text: 'Added. Unpin once the cache step is fixed upstream.', kind: 'gitea.pr.comment' },
      { time: '14:10', who: 'grace', title: 'Merged', text: 'Merged into main.', kind: 'gitea.pr.merged' },
    ],
  },

  routing: {
    heading: ['One memory per repository,', 'on Gitea or Forgejo.'],
    lede: 'Pick a repository to see where it goes. Forgejo speaks the same API as Gitea, so the rule is the same.',
    pick: 'Example repository',
    options: [
      { label: 'acme/widgets', detail: 'Gitea · gitea.example.com', subject: 'repo:acme/widgets', why: 'Every issue, PR and release in the repo shares one memory, keyed by owner and name.' },
      { label: 'acme/runner-images', detail: 'Forgejo · codeberg.org', subject: 'repo:acme/runner-images', why: 'Forgejo exposes the same REST API, so the connector works unchanged.' },
    ],
    note: ['Gitea is self-hosted, so tell the connector where with', '--host', 'or GITEA_URL.'],
  },

  setup: {
    steps: [
      { title: 'Point it at your instance', text: 'Pass --host https://gitea.example.com or set GITEA_URL. Gitea is self-hosted, so this is required.' },
      { title: 'Add a token', text: 'Set GITEA_TOKEN. Public repos work without one, but unauthenticated reads hit lower rate limits.' },
      { title: 'Preview with --dry-run', text: 'The connector reads the repo and maps each event, then prints the episodes. Nothing is sent.' },
      { title: 'Ingest', text: 'Point STATEWAVE_URL at your instance and run the same command without --dry-run.' },
    ],
    env: [
      { name: 'GITEA_URL', when: 'Unless --host', text: 'Your Gitea or Forgejo instance, e.g. https://gitea.example.com' },
      { name: 'GITEA_TOKEN', when: 'Recommended', text: 'Optional for public repos. Without it, reads hit lower rate limits.' },
      { name: 'STATEWAVE_URL + STATEWAVE_API_KEY', when: 'To ingest', text: 'Your Statewave instance' },
    ],
    terminal: [
      {
        label: 'Dry-run',
        env: ['GITEA_TOKEN=…'],
        cmd: 'statewave-connectors sync gitea --host https://gitea.example.com --repo acme/widgets --dry-run --json',
        outputLabel: 'Prints the episodes. Sends nothing.',
        output: `{
  "subject": "repo:acme/widgets",
  "kind": "gitea.issue.opened",
  "text": "ada opened issue #42: CI is flaky\\n\\nhappens on macos runners",
  "occurred_at": "2026-05-20T09:12:00.000Z",
  "source": {
    "type": "gitea.issue",
    "id": "acme/widgets#42",
    "url": "https://gitea.example.com/acme/widgets/issues/42"
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
        cmd: 'statewave-connectors sync gitea --host https://gitea.example.com --repo acme/widgets',
        notes: [
          'Set GITEA_URL once instead of passing --host on every run.',
          'Narrow a run with --since or --max-items.',
        ],
      },
      {
        label: 'Forgejo',
        env: ['GITEA_TOKEN=…'],
        cmd: 'statewave-connectors sync gitea --host https://codeberg.org --repo acme/runner-images --dry-run',
        notes: [
          'Forgejo exposes the same REST API (/api/v1), so the Gitea connector works unchanged.',
          'Smoke-tested live against Codeberg, which runs Forgejo, on 2026-05-30.',
        ],
      },
    ],
  },

  safety: [
    'It reads GITEA_URL and GITEA_TOKEN and no other credentials.',
    'Nothing is sent during --dry-run.',
    'It refuses to ingest until STATEWAVE_URL is set.',
    'No telemetry. Sync state stays on your machine.',
  ],
  limits: [
    'Preview, v0.1.0. Smoke-tested live against Codeberg (Forgejo 15.0.0) on 2026-05-30.',
    'The instance URL is required. Pass --host or set GITEA_URL.',
    'Without a token, reads hit lower rate limits.',
  ],

  close: {
    a: 'Your forge, your server,',
    grad: 'your coding agent’s memory.',
    more: 'More code connectors',
    useCase: { label: 'Coding agent memory', href: '/use-cases' },
  },
  related: ['github', 'gitlab', 'bitbucket'],
}
