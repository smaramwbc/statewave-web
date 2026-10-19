import type { Connector } from './types'

/** packages/slack/README.md (v0.4.0). The release thread is illustrative, built on the
 *  README's example episode (team:T0ACME, #general, ada). */
export const slack: Connector = {
  slug: 'slack',
  name: 'Slack',
  logo: 'slack',
  group: 'Team & communication',
  status: 'stable',
  modes: ['pull', 'push'],
  pkg: '@statewavedev/connectors-slack',
  source: 'https://github.com/smaramwbc/statewave-connectors/tree/main/packages/slack',
  example: 'https://github.com/smaramwbc/statewave-connectors/tree/main/examples/slack-support-memory',

  hero: {
    a: 'Every Slack thread,',
    grad: 'remembered by the team.',
    sub: 'Messages and thread replies from the channels you pick become one memory for the workspace, so your agents know what the team already worked out.',
    cmd: 'statewave-connectors sync slack --channels general --dry-run',
    from: 'acme.slack.com',
    to: 'team:T0ACME',
  },

  story: {
    heading: ['One release thread,', 'ready for the next release.'],
    lede: 'Ada posts in #general that v1.0 is out, and the team adds what they learned in the thread. Here’s that thread on its way to the next deploy.',
    steps: [
      { title: 'Read the thread', text: 'Each sync walks the channels you list, or the Events API webhook delivers each message as it’s posted.' },
      { title: 'File it under the team', text: 'Each message and reply becomes an episode in the workspace’s memory. Everything from Acme’s channels lands in team:T0ACME.' },
      { title: 'Answer with what the team knows', text: 'Before the next release, your agent recalls what went wrong last time and links back to the thread.' },
    ],
    source: {
      label: 'Message',
      id: '#general',
      title: 'ada',
      body: 'deploy is green — shipping v1.0',
      meta: [['Channel', '#general'], ['Workspace', 'Acme']],
      status: '2 replies',
      via: 'Arrived through the Events API webhook',
    },
    episode: {
      kind: 'slack.message.posted',
      subject: 'team:T0ACME',
      text: 'ada: deploy is green — shipping v1.0',
      url: 'C123ABC:1716196320.000100',
      lane: 'team:T0ACME',
      laneNote: 'Acme team · 214 episodes',
    },
    answer: {
      asker: 'Lin · Acme',
      ask: 'Shipping v1.1 this afternoon. Anything to watch for?',
      answer: 'When v1.0 shipped, the cache took ten minutes to warm after the deploy. Grace suggested running warm-cache before you switch traffic.',
      sources: ['#general · 09:12', 'thread reply · 09:31'],
      call: 'statewave_get_context("team:T0ACME")',
    },
  },

  reads: {
    heading: ['Channels and threads by default.', 'DMs only if you ask.'],
    lede: 'Pull mode reads top-level messages and thread replies from the channels you list. DMs and group DMs stay off until you add a flag, and each one gets a subject of its own.',
    toggle: { off: 'Channels', on: 'Channels + DMs', offFlag: '--channels general', onFlag: '--channels general --include-dms --include-mpim' },
    title: 'v1.0 release day · Acme',
    events: [
      { time: '09:12', who: 'ada', title: 'Message in #general', text: 'deploy is green — shipping v1.0', kind: 'slack.message.posted' },
      { time: '09:31', who: 'grace', title: 'Thread reply', text: 'Cache took ten minutes to warm after the deploy. Run warm-cache before switching traffic next time.', kind: 'slack.thread.replied' },
      { time: '09:40', who: 'ada', title: 'Thread reply', text: 'Adding it to the release checklist.', kind: 'slack.thread.replied' },
      { time: '10:05', who: 'ada', title: 'DM to the bot', text: 'Remind me to rotate the deploy key on Friday.', kind: 'slack.dm.message.posted', optIn: true },
      { time: '10:20', who: 'grace', title: 'Group DM', text: 'Moving the v1.0 retro to Thursday.', kind: 'slack.mpim.message.posted', optIn: true },
    ],
  },

  routing: {
    heading: ['Every channel,', 'one memory for the team.'],
    lede: 'Pick a conversation to see where it goes. Channels share the workspace’s memory, and private conversations each get their own.',
    pick: 'Example conversation',
    options: [
      { label: '#general', detail: 'Channel C123ABC · workspace T0ACME', subject: 'team:T0ACME', why: 'Messages and threads from every channel you list share one memory for the workspace.' },
      { label: 'DM with ada', detail: 'Direct message · user U0ADA', subject: 'dm:U0ADA', why: 'Each DM is filed under the other person, so it never mixes with channel memory.' },
      { label: 'Group DM', detail: 'ada, grace and lin · G0RETRO', subject: 'mpim:G0RETRO', why: 'A group DM has no single other person, so it’s keyed by its channel id.' },
    ],
    note: ['Prefer your own name for the team?', '--subject team:acme', 'replaces the default team:<team_id>.'],
  },

  setup: {
    steps: [
      { title: 'Give the bot read scopes', text: 'Add channels:history and channels:read to your Slack app’s bot. For private channels, add the matching groups: scopes and invite the bot.' },
      { title: 'Set your token', text: 'Export the bot token, the one starting with xoxb-, as SLACK_BOT_TOKEN.' },
      { title: 'Preview with --dry-run', text: 'List the channels to read. The connector maps messages and threads, then prints the episodes. Nothing is sent.' },
      { title: 'Ingest', text: 'Point STATEWAVE_URL at your instance and run the same command without --dry-run.' },
      { title: 'Optional: go real time', text: 'Run the receiver, expose it, and paste its URL into Event Subscriptions. Subscribe to message.channels, plus message.groups for private channels.' },
    ],
    env: [
      { name: 'SLACK_BOT_TOKEN', when: 'Always', text: 'A bot token (xoxb-…)' },
      { name: 'SLACK_SIGNING_SECRET', when: 'Real time', text: 'Slack app → Basic Information → Signing Secret' },
      { name: 'STATEWAVE_URL + STATEWAVE_API_KEY', when: 'To ingest', text: 'Your Statewave instance. The key only if it enforces auth.' },
    ],
    terminal: [
      {
        label: 'Dry-run',
        env: ['SLACK_BOT_TOKEN=xoxb-…'],
        cmd: 'statewave-connectors sync slack --channels general --subject team:T0ACME --dry-run --json',
        outputLabel: 'Prints the episodes. Sends nothing.',
        output: `{
  "subject": "team:T0ACME",
  "kind": "slack.message.posted",
  "text": "ada: deploy is green — shipping v1.0",
  "occurred_at": "2026-05-20T09:12:00.000Z",
  "source": {
    "type": "slack.message",
    "id": "C123ABC:1716196320.000100"
  },
  "metadata": {
    "author_id": "U0ADA",
    "channel": "C123ABC"
  }
}`,
      },
      {
        label: 'Ingest',
        env: ['STATEWAVE_URL=http://localhost:8100', 'STATEWAVE_API_KEY=…'],
        cmd: 'statewave-connectors sync slack --channels general,support --since 2026-01-01',
        notes: [
          '--channels takes ids or names. Invite the bot to private channels first.',
          'Top-level messages only? Add --exclude thread_replies.',
          'Cap a run with --max-items.',
        ],
      },
      {
        label: 'Real time',
        env: ['SLACK_SIGNING_SECRET=…', 'STATEWAVE_URL=http://localhost:8100', 'STATEWAVE_API_KEY=…'],
        cmd: 'statewave-connectors listen slack --channels C01ABCDEF,C02XYZ123 --port 3000',
        outputLabel: 'Paste the public URL into Event Subscriptions.',
        output: '→ http://0.0.0.0:3000/slack/events',
        notes: [
          'Verifies Slack’s HMAC signature first',
          'Drops Slack’s retries by event_id',
          'Answers the url_verification challenge for you',
          'Runs as a daemon, or on Vercel, Cloudflare or Express',
        ],
      },
      {
        label: 'DMs',
        env: ['SLACK_BOT_TOKEN=xoxb-…'],
        cmd: 'statewave-connectors sync slack --channels general,support --include-dms --include-mpim --dry-run',
        notes: [
          'DMs need im:read and im:history. Group DMs need mpim:read and mpim:history.',
          'Each DM lands in dm:<other_user_id>, each group DM in mpim:<channel_id>.',
          'The bot only sees DMs it’s part of.',
        ],
      },
    ],
  },

  safety: [
    'The bot token is only sent to slack.com/api.',
    '--channels is required unless you pass --include-dms, so a first run never pulls a whole workspace.',
    'DMs and group DMs are opt-in. The bot only sees DMs it’s part of, never DMs between two people.',
    'Webhooks are signature-checked, and Slack’s retries are dropped.',
  ],
  limits: [
    'Reactions and pins only arrive through the real-time receiver.',
    '--resolve-users turns mentions into names, at the cost of extra API calls per author.',
    'The default retry cache is per process. Plug in a shared one, like Redis, when you run several replicas.',
    'Not yet: Socket Mode and channel summaries.',
  ],

  close: {
    a: 'Give your agents',
    grad: 'what the team already knows.',
    more: 'More team connectors',
    useCase: { label: 'Multi-agent memory', href: '/use-cases' },
  },
  related: ['discord', 'gmail'],
}
