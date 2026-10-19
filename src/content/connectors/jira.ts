import type { Connector } from './types'

/** packages/jira/README.md (preview). ENG-128 is the README's own example; the comment
 *  and the follow-up question are illustrative. */
export const jira: Connector = {
  slug: 'jira',
  name: 'Jira',
  logo: 'jira',
  group: 'Workflow',
  status: 'preview',
  modes: ['pull', 'push'],
  pkg: '@statewavedev/connectors-jira',
  source: 'https://github.com/smaramwbc/statewave-connectors/tree/main/packages/jira',

  hero: {
    a: 'Your Jira history,',
    grad: 'one lookup per project.',
    sub: 'Issues, comments and status changes land under their project, so an agent can tell you what broke, who fixed it and when.',
    cmd: 'statewave-connectors sync jira --host https://myorg.atlassian.net --projects ENG --dry-run',
    from: 'myorg.atlassian.net',
    to: 'project:ENG',
  },

  story: {
    heading: ['One bug,', 'from report to answer.'],
    lede: 'ENG-128, a Safari login bug, from the day it’s filed to the day someone asks about it again.',
    steps: [
      { title: 'Read the issue', text: 'A sync pulls issues from the projects you name. On Jira Cloud, an admin webhook can push each change as it happens.' },
      { title: 'File it under the project', text: 'Each issue becomes an episode under project:ENG, with the issue and its assignee as related subjects.' },
      { title: 'Answer from the history', text: 'When the redirect loop comes back, your agent knows who fixed it and how, and links straight to the issue.' },
    ],
    source: {
      label: 'Issue',
      id: 'ENG-128',
      title: 'Login fails on Safari',
      body: 'Users on Safari 17 hit a redirect loop after SSO.',
      meta: [['Type', 'Bug'], ['Priority', 'High'], ['Assignee', 'Ada L']],
      status: 'Done',
      via: 'Arrived through the webhook',
    },
    episode: {
      kind: 'jira.issue.resolved',
      subject: 'project:ENG',
      text: 'Ada L resolved issue ENG-128: Login fails on Safari. Users on Safari 17 hit a redirect loop after SSO.',
      url: 'myorg.atlassian.net/browse/ENG-128',
      lane: 'project:ENG',
      laneNote: 'ENG · 64 episodes',
    },
    answer: {
      asker: 'Kim · Support',
      ask: 'Customers say Safari login loops after SSO. Is this known?',
      answer: 'Yes, that was ENG-128. Safari 17 dropped the SSO cookie because it lacked SameSite=None. Ada L fixed it and the issue was resolved on May 20. If it’s back, check whether a recent deploy lost that cookie setting.',
      sources: ['ENG-128', 'comment · Ada L · 12:40'],
      call: 'statewave_get_context("project:ENG")',
    },
  },

  reads: {
    heading: ['Issues by default.', 'The full trail on request.'],
    lede: 'Comments and status changes are opt-in. Transitions come from the changelog on the same issue search, so they cost no extra calls.',
    toggle: { off: 'Issues', on: 'Issues + comments + transitions', offFlag: '--include issues', onFlag: '--include issues,comments,transitions' },
    title: 'ENG-128 · Login fails on Safari',
    events: [
      { time: '09:14', who: 'Bob R', title: 'Issue created', text: 'Users on Safari 17 hit a redirect loop after SSO.', kind: 'jira.issue.created' },
      { time: '09:50', who: 'Ada L', title: 'Status changed', text: 'To Do → In Progress', kind: 'jira.issue.transition', optIn: true },
      { time: '12:40', who: 'Ada L', title: 'Comment', text: 'Safari drops the SSO cookie. It’s missing SameSite=None.', kind: 'jira.comment.created', optIn: true },
      { time: '14:03', who: 'Ada L', title: 'Status changed', text: 'In Progress → Done', kind: 'jira.issue.transition', optIn: true },
      { time: '14:03', who: 'Ada L', title: 'Issue resolved', text: 'Ada L resolved issue ENG-128.', kind: 'jira.issue.resolved' },
    ],
  },

  routing: {
    heading: ['One memory per project,', 'linked to each issue.'],
    lede: 'Pick an issue to see where it lands. In pull mode, only projects on your allowlist are read.',
    pick: 'Example issue',
    options: [
      { label: 'ENG-128', detail: 'Bug · assigned to Ada L', subject: 'project:ENG', why: 'Filed under its project. The episode also lists issue:ENG-128 and assignee:Ada L as related subjects.' },
      { label: 'PLATFORM-311', detail: 'Story in Sprint 24', subject: 'project:PLATFORM', why: 'Each project you allow gets its own memory. With --sprint-field set, sprint:Sprint 24 is added as a related subject.' },
      { label: 'OPS-57', detail: 'On Jira Data Center', subject: 'project:OPS', why: 'Server and Data Center use the same project subjects as Cloud.' },
    ],
    note: ['Want one subject for everything?', '--subject team:platform', 'pins every episode to it.'],
  },

  setup: {
    steps: [
      { title: 'Create an API token', text: 'Create one at id.atlassian.com under Security → API tokens. It pairs with your Atlassian email.' },
      { title: 'Name your projects', text: 'Pass the project keys to read with --projects. Pull mode won’t run without it.' },
      { title: 'Preview with --dry-run', text: 'Issues are read and mapped, and the episodes printed. Nothing is sent.' },
      { title: 'Ingest', text: 'Set STATEWAVE_URL and run it again without --dry-run.' },
      { title: 'Optional: go real time', text: 'Jira Cloud only. Register an admin webhook with a secret, and give the receiver the same secret.' },
    ],
    env: [
      { name: 'JIRA_EMAIL + JIRA_API_TOKEN', when: 'Jira Cloud', text: 'Your Atlassian email and API token' },
      { name: 'JIRA_BASE_URL', when: 'Server / DC, real time', text: 'Your Jira address, used by --deployment server and by the receiver' },
      { name: 'JIRA_PAT', when: 'Server / DC', text: 'A Data Center personal access token' },
      { name: 'JIRA_WEBHOOK_SECRET', when: 'Real time', text: 'The secret you set on the Jira admin webhook' },
      { name: 'STATEWAVE_URL + STATEWAVE_API_KEY', when: 'To ingest', text: 'Your Statewave instance. The key only if it requires one.' },
    ],
    terminal: [
      {
        label: 'Dry-run',
        env: ['JIRA_EMAIL=you@example.com', 'JIRA_API_TOKEN=…'],
        cmd: `statewave-connectors sync jira \\
  --host https://myorg.atlassian.net \\
  --projects ENG,PLATFORM \\
  --dry-run --json`,
        outputLabel: 'Prints the episodes. Sends nothing.',
        output: `{
  "subject": "project:ENG",
  "kind": "jira.issue.resolved",
  "text": "Ada L resolved issue ENG-128: Login fails on Safari\\n\\nUsers on Safari 17 hit a redirect loop after SSO.",
  "occurred_at": "2026-05-20T14:03:00.000Z",
  "source": {
    "type": "jira.issue",
    "id": "ENG-128",
    "url": "https://myorg.atlassian.net/browse/ENG-128"
  },
  "metadata": {
    "issue_key": "ENG-128",
    "project_key": "ENG",
    "status": "Done",
    "status_category": "done",
    "issue_type": "Bug",
    "priority": "High",
    "labels": ["auth", "safari"],
    "assignee": "Ada L",
    "reporter": "Bob R",
    "related_subjects": ["issue:ENG-128", "assignee:Ada L"]
  },
  "idempotency_key": "…"
}`,
      },
      {
        label: 'Ingest',
        env: ['STATEWAVE_URL=http://localhost:8100', 'STATEWAVE_API_KEY=…'],
        cmd: `statewave-connectors sync jira \\
  --host https://myorg.atlassian.net \\
  --projects ENG \\
  --include issues,comments,transitions \\
  --since 2026-01-01`,
        notes: [
          '--projects is required. Only the projects you list are read.',
          'Add --sprint-field customfield_10020 to tag each issue with its sprint. Find your field id with GET /rest/api/3/field.',
          'Scrub free text first with --redact-email, --redact-phone and --redact-secrets.',
        ],
      },
      {
        label: 'Real time',
        env: ['JIRA_WEBHOOK_SECRET=…', 'JIRA_BASE_URL=https://myorg.atlassian.net', 'STATEWAVE_URL=http://localhost:8100'],
        cmd: 'statewave-connectors listen jira --port 3000 --projects ENG,PLATFORM',
        outputLabel: 'Register a Jira admin webhook at this address.',
        output: '→ http://0.0.0.0:3000/jira/events',
        notes: [
          'Checks the HMAC-SHA256 X-Hub-Signature before parsing anything',
          'Drops Jira’s retried deliveries',
          'A status change also emits a transition episode',
          'Jira Cloud only. Server and Data Center use sync.',
        ],
      },
      {
        label: 'Server / DC',
        env: ['JIRA_BASE_URL=https://jira.your-company.com', 'JIRA_PAT=…'],
        cmd: `statewave-connectors sync jira \\
  --deployment server \\
  --projects ENG,OPS \\
  --dry-run`,
        notes: [
          'Uses REST v2 and plain-text bodies. Subjects and kinds match Cloud.',
          'A username and password over Basic auth work too.',
          'Implemented and unit-tested, but not yet validated against a live Server or Data Center instance.',
          'The webhook receiver is Cloud-only, so poll with sync.',
        ],
      },
    ],
  },

  safety: [
    'Read-only. It never writes to Jira.',
    'No email addresses. People are recorded by display name, username or account id.',
    'Pull mode only reads the projects on your allowlist. Give the receiver --projects too.',
    'Webhooks are rejected unless the HMAC-SHA256 signature matches.',
  ],
  limits: [
    'Server and Data Center support is implemented and unit-tested, but not yet validated against a live instance. Cloud is tested end to end.',
    'The webhook receiver is Cloud-only. Server and Data Center use sync.',
    'Deleted issues and comments produce no episode.',
    'Sprint context reads the sprint already on each issue. It doesn’t crawl boards, and the legacy string format isn’t parsed.',
  ],

  close: {
    a: 'Give your agents',
    grad: 'the history behind every issue.',
    more: 'More workflow connectors',
    useCase: { label: 'Multi-agent memory', href: '/use-cases' },
  },
  related: ['github', 'n8n'],
}
