import type { Connector } from './types'

/** packages/intercom/README.md (v0.2.0). The Northwind conversation is illustrative,
 *  keyed to the homepage's example account. */
export const intercom: Connector = {
  slug: 'intercom',
  name: 'Intercom',
  logo: 'intercom',
  group: 'Support',
  status: 'stable',
  modes: ['pull', 'push'],
  pkg: '@statewavedev/connectors-intercom',
  source: 'https://github.com/smaramwbc/statewave-connectors/tree/main/packages/intercom',

  hero: {
    a: 'Every Intercom conversation,',
    grad: 'remembered by account.',
    sub: 'Conversations, replies and admin notes land in one memory per company, so your agent knows what this customer asked before and what fixed it.',
    cmd: 'statewave-connectors sync intercom --dry-run',
    from: 'app.intercom.com',
    to: 'customer:6001',
  },

  story: {
    heading: ['One conversation,', 'from hello to the next time.'],
    lede: 'A Northwind chat about a cut-off export, from the first message to the next time anyone at Northwind asks.',
    steps: [
      { title: 'Read the conversation', text: 'A sync pulls conversations from the API. With the receiver running, Intercom’s webhook sends each one as it changes.' },
      { title: 'File it under the account', text: 'The contact’s primary company decides the subject. Every Northwind conversation lands in customer:6001.' },
      { title: 'Answer from the history', text: 'When someone else at Northwind hits the same limit, your agent already knows the fix and links back to the conversation.' },
    ],
    source: {
      label: 'Conversation',
      id: '55214',
      title: 'Export stops at 10,000 rows',
      body: 'Our CSV export of orders stops at 10,000 rows. We need the whole year.',
      meta: [['Contact', 'Priya Shah'], ['Company', 'Northwind']],
      status: 'Open',
      via: 'Arrived through the webhook',
    },
    episode: {
      kind: 'intercom.conversation.created',
      subject: 'customer:6001',
      text: 'Export stops at 10,000 rows. Our CSV export of orders stops at 10,000 rows. We need the whole year.',
      url: 'app.intercom.com/a/inbox/k8h2xq1v/inbox/conversation/55214',
      lane: 'customer:6001',
      laneNote: 'Northwind · 22 episodes',
    },
    answer: {
      asker: 'Marco · Northwind',
      ask: 'Our order export cuts off at 10,000 rows.',
      answer: 'Someone on your team hit this before. Direct downloads stop at 10,000 rows. Run it as a scheduled export from Reports and the full file arrives by email.',
      sources: ['conversation 55214', 'admin note · 10:15'],
      call: 'statewave_get_context("customer:6001")',
    },
  },

  reads: {
    heading: ['Conversations by default.', 'Parts when you ask.'],
    lede: 'Replies and admin notes live in each conversation’s parts. Reading them costs one extra API call per conversation, so they’re off until you add parts. System parts like assignments and snoozes are always dropped.',
    toggle: { off: 'Conversations', on: 'Conversations + replies and notes', offFlag: '--include conversations', onFlag: '--include conversations,parts' },
    title: 'Conversation 55214 · Northwind',
    events: [
      { time: '10:02', who: 'Priya Shah', title: 'Conversation opened', text: 'Our CSV export of orders stops at 10,000 rows.', kind: 'intercom.conversation.created' },
      { time: '10:09', who: 'Leo · Support', title: 'Reply', text: 'Thanks Priya. Is that the Orders export under Reports?', kind: 'intercom.conversation.replied', optIn: true },
      { time: '10:15', who: 'Leo · Support', title: 'Admin note', text: 'Direct downloads stop at 10,000 rows. Larger exports run as a scheduled export and arrive by email.', kind: 'intercom.conversation.note_added', optIn: true },
      { time: '10:31', who: 'Priya Shah', title: 'Reply', text: 'The scheduled export came through. Thanks!', kind: 'intercom.conversation.replied', optIn: true },
      { time: '10:40', who: 'Leo · Support', title: 'Conversation closed', text: 'Closed once the full export arrived.', kind: 'intercom.conversation.closed' },
    ],
  },

  routing: {
    heading: ['One memory per account,', 'whoever opens the chat.'],
    lede: 'Pick a conversation to see where it goes. Anyone at Northwind can start a chat, and it all lands in the same memory.',
    pick: 'Example conversation',
    options: [
      { label: 'Northwind', detail: 'Contact with a company · 6001', subject: 'customer:6001', why: 'The primary company wins, so everyone at Northwind shares one memory.' },
      { label: 'A single user', detail: 'No company · contact 6650a1f3', subject: 'customer:6650a1f3', why: 'B2C and single-tenant workspaces fall back to the contact.' },
      { label: 'No contact', detail: 'App-only automation (rare)', subject: 'conversation:55301', why: 'Episodes still group together, under the conversation.' },
    ],
    note: ['Need one subject for a whole sync?', '--subject account:acme', 'overrides the routing for every conversation.'],
  },

  setup: {
    steps: [
      { title: 'Get an access token', text: 'Settings → Workspace settings → Developers → Your apps → New app → Authentication → Personal access token. An OAuth token from a public app works too.' },
      { title: 'Pick your region', text: 'US is the default. EU and AU workspaces set INTERCOM_REGION or pass --region.' },
      { title: 'Preview with --dry-run', text: 'The connector reads conversations, maps them and prints the episodes. Nothing is sent to Statewave.' },
      { title: 'Ingest', text: 'Set STATEWAVE_URL and run the same command without --dry-run.' },
      { title: 'Optional: go real time', text: 'In the Developer Hub, add a webhook to your app for the five conversation topics. The receiver checks every delivery against the app’s client secret.' },
    ],
    env: [
      { name: 'INTERCOM_ACCESS_TOKEN', when: 'Always', text: 'A personal access token or an OAuth access token' },
      { name: 'INTERCOM_REGION', when: 'EU or AU workspace', text: 'us, eu or au. Defaults to us.' },
      { name: 'INTERCOM_CLIENT_SECRET', when: 'Real time', text: 'Your app’s client secret. Intercom signs webhooks with it.' },
      { name: 'INTERCOM_APP_ID', when: 'Real time', text: 'Workspace id, for a link on each episode. On sync, pass --app-id.' },
      { name: 'STATEWAVE_URL + STATEWAVE_API_KEY', when: 'To ingest', text: 'Your Statewave instance' },
    ],
    terminal: [
      {
        label: 'Dry-run',
        env: ['INTERCOM_ACCESS_TOKEN=…'],
        cmd: 'statewave-connectors sync intercom --since 2026-01-01 --dry-run --json',
        outputLabel: 'Prints the episodes. Sends nothing.',
        output: `{
  "subject": "customer:6001",
  "kind": "intercom.conversation.created",
  "text": "Cannot reset password\\n\\nThe reset email never arrives.",
  "occurred_at": "2026-05-20T09:12:00.000Z",
  "source": {
    "type": "intercom.conversation",
    "id": "conversation:55001",
    "url": "https://app.intercom.com/a/apps/_/conversations/55001"
  }
}`,
      },
      {
        label: 'Ingest',
        env: ['STATEWAVE_URL=http://localhost:8100', 'STATEWAVE_API_KEY=…'],
        cmd: 'statewave-connectors sync intercom --include conversations,parts --since 2026-01-01',
        notes: [
          'Keep only some conversations with --tags (case-sensitive) or --teams.',
          'For EU or AU workspaces, add --region eu or --region au.',
          'Add --app-id to put an Intercom link on each episode.',
        ],
      },
      {
        label: 'Real time',
        env: ['INTERCOM_CLIENT_SECRET=…', 'INTERCOM_APP_ID=…', 'STATEWAVE_URL=http://localhost:8100'],
        cmd: 'statewave-connectors listen intercom --port 3000',
        outputLabel: 'Point your Intercom app’s webhook at this address.',
        output: '→ http://0.0.0.0:3000/intercom/events',
        notes: [
          'Checks Intercom’s HMAC-SHA1 X-Hub-Signature first',
          'Drops retried deliveries',
          'Acks topics it doesn’t map, so extra subscriptions don’t fail',
          'Runs as a daemon, or on Vercel, Cloudflare or Express',
        ],
      },
    ],
  },

  safety: [
    'The token is only sent to api.<region>.intercom.io.',
    'Replies and admin notes are opt-in.',
    'System parts like assignments and snoozes are dropped.',
    'Webhooks are signature-checked and deduplicated.',
  ],
  limits: [
    'Replies and notes cost one extra API call per conversation.',
    'Inbox permalinks need --app-id, because Intercom’s API doesn’t return them.',
    'The --since filter runs on your side, so each pull still walks the conversation list.',
    'Not yet: articles, outbound messages, author details beyond the primary contact.',
  ],

  close: {
    a: 'Start every Intercom chat',
    grad: 'knowing the account.',
    more: 'More support connectors',
    useCase: { label: 'Support agent use case', href: '/use-cases' },
  },
  related: ['zendesk', 'freshdesk'],
}
