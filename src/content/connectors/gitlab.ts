import type { Connector } from './types'

/** packages/gitlab/README.md (v0.1.0 preview). Merge request !100 in acme/widgets is the
 *  README's example episode; the review around it is illustrative. */
export const gitlab: Connector = {
  slug: 'gitlab',
  name: 'GitLab',
  logo: 'gitlab',
  group: 'Code',
  status: 'preview',
  modes: ['pull'],
  pkg: '@statewavedev/connectors-gitlab',
  source: 'https://github.com/smaramwbc/statewave-connectors/tree/main/packages/gitlab',

  hero: {
    a: 'Every merge request and issue,',
    grad: 'remembered per project.',
    sub: 'Issues, merge requests, comments, approvals and releases from GitLab become one memory per project, so your coding agent can recall why a change was made and who signed off.',
    cmd: 'statewave-connectors sync gitlab --repo acme/widgets --dry-run',
    from: 'gitlab.com/acme/widgets',
    to: 'repo:acme/widgets',
  },

  story: {
    heading: ['One merge request,', 'reviewed once, recalled later.'],
    lede: 'Merge request !100 added an MCP server to acme/widgets. Follow it from GitLab to an answer weeks later.',
    steps: [
      { title: 'Read the merge request', text: 'Each sync pulls the project’s issues, merge requests, human comments, approvals and releases from GitLab.' },
      { title: 'File it under the project', text: 'Every event becomes an episode in repo:acme/widgets, next to the issues and releases from the same project.' },
      { title: 'Answer with the review', text: 'When someone asks how the MCP server came to be, your coding assistant recalls !100 and the review around it.' },
    ],
    source: {
      label: 'Merge request',
      id: '!100',
      title: 'Add MCP server',
      body: 'Implements the skeleton.',
      meta: [['Author', 'linus'], ['Target', 'main']],
      status: 'Merged',
      via: 'Pulled by statewave-connectors sync',
    },
    episode: {
      kind: 'gitlab.mr.merged',
      subject: 'repo:acme/widgets',
      text: 'linus merged merge request !100: Add MCP server. Implements the skeleton.',
      url: 'gitlab.com/acme/widgets/-/merge_requests/100',
      lane: 'repo:acme/widgets',
      laneNote: 'acme/widgets · 96 episodes',
    },
    answer: {
      asker: 'Jonas · Developer',
      ask: 'Why does the MCP server keep all its tools in one file?',
      answer: 'That came out of the review on merge request !100. Margit asked for a single tool list so it’s easy to audit, and linus kept it that way before it merged into main.',
      sources: ['merge request !100', 'comment · 08:15'],
      call: 'statewave_get_context("repo:acme/widgets")',
    },
  },

  reads: {
    heading: ['What people wrote,', 'without the system noise.'],
    lede: 'GitLab adds a system note for every label edit and state change. The connector skips them, so only human comments become episodes, next to issues, merge requests, approvals and releases.',
    title: 'Merge request !100 · acme/widgets',
    events: [
      { time: '07:40', who: 'linus', title: 'Merge request opened', text: 'Add MCP server. Implements the skeleton.', kind: 'gitlab.mr.opened' },
      { time: '08:15', who: 'margit', title: 'Comment', text: 'Keep the tool list in one file so it’s easy to audit.', kind: 'gitlab.mr.comment' },
      { time: '09:12', title: 'Approval', text: 'margit approved. GitLab keeps no approval time, so this uses the merge request’s last update.', kind: 'gitlab.mr.approval' },
      { time: '09:12', who: 'linus', title: 'Merged', text: 'Merged into main.', kind: 'gitlab.mr.merged' },
    ],
  },

  routing: {
    heading: ['One memory per project,', 'however deep the group.'],
    lede: 'Pick a project to see where it goes. The subject is the project’s full path, nested groups included.',
    pick: 'Example project',
    options: [
      { label: 'acme/widgets', detail: 'Group acme · project widgets', subject: 'repo:acme/widgets', why: 'Every issue, merge request and release in the project shares one memory.' },
      { label: 'acme/platform/api', detail: 'Nested group acme/platform', subject: 'repo:acme/platform/api', why: 'The last segment is the project. Everything before it is the namespace.' },
    ],
    note: ['For nested groups, pass the full path with', '--repo acme/platform/api', 'and the subject follows it.'],
  },

  setup: {
    steps: [
      { title: 'Add a token', text: 'Set GITLAB_TOKEN. Public projects work without one, but GitLab only serves comments to authenticated requests.' },
      { title: 'Pick a project', text: 'Pass its full path with --repo. Use --host to name the GitLab instance, such as https://gitlab.com.' },
      { title: 'Preview with --dry-run', text: 'The connector reads the project and maps each event, then prints the episodes. Nothing is sent.' },
      { title: 'Ingest', text: 'Point STATEWAVE_URL at your instance and run the same command without --dry-run.' },
    ],
    env: [
      { name: 'GITLAB_TOKEN', when: 'Recommended', text: 'Sent as the PRIVATE-TOKEN header. Needed to read comments.' },
      { name: 'STATEWAVE_URL + STATEWAVE_API_KEY', when: 'To ingest', text: 'Your Statewave instance' },
    ],
    terminal: [
      {
        label: 'Dry-run',
        env: ['GITLAB_TOKEN=…'],
        cmd: 'statewave-connectors sync gitlab --repo acme/widgets --dry-run --json',
        outputLabel: 'Prints the episodes. Sends nothing.',
        output: `{
  "subject": "repo:acme/widgets",
  "kind": "gitlab.mr.merged",
  "text": "linus merged merge request !100: Add MCP server\\n\\nimplements the skeleton",
  "occurred_at": "2026-05-20T09:12:00.000Z",
  "source": {
    "type": "gitlab.merge_request",
    "id": "acme/widgets!100",
    "url": "https://gitlab.com/acme/widgets/-/merge_requests/100"
  },
  "metadata": {
    "mr_iid": 100,
    "author": "linus",
    "labels": [],
    "state": "merged",
    "merged": true,
    "target_branch": "main"
  }
}`,
      },
      {
        label: 'Ingest',
        env: ['STATEWAVE_URL=http://localhost:8100', 'STATEWAVE_API_KEY=…'],
        cmd: 'statewave-connectors sync gitlab --repo acme/widgets',
        notes: [
          'Without GITLAB_TOKEN the sync skips comments and keeps going, even on public projects.',
          'Narrow a run with --since or --max-items.',
        ],
      },
    ],
  },

  safety: [
    'It reads GITLAB_TOKEN and no other credentials.',
    'System notes are skipped. Only human comments become episodes.',
    'Nothing is sent during --dry-run.',
    'No telemetry. Sync state stays on your machine.',
  ],
  limits: [
    'Preview, v0.1.0. Smoke-tested live against gitlab.com on 2026-05-30 for issues, merge requests, approvals and releases.',
    'The GitLab API has no per-approval timestamp, so approval episodes use the merge request’s updated_at.',
    'Without a token, comments are skipped, even on public projects.',
  ],

  close: {
    a: 'Every review your team wrote,',
    grad: 'on hand for your coding agent.',
    more: 'More code connectors',
    useCase: { label: 'Coding agent memory', href: '/use-cases' },
  },
  related: ['github', 'gitea', 'bitbucket'],
}
