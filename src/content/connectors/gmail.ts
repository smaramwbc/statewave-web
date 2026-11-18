import type { Connector } from './types'

/** packages/gmail/README.md (v0.3.0). The renewal exchange is illustrative, built on the
 *  README's example episode (relationship:jordan@acme.com). */
export const gmail: Connector = {
  slug: 'gmail',
  name: 'Gmail',
  logo: 'gmail',
  group: 'Team & communication',
  status: 'stable',
  modes: ['pull', 'push'],
  pkg: '@statewavedev/connectors-gmail',
  source: 'https://github.com/smaramwbc/statewave-connectors/tree/main/packages/gmail',

  hero: {
    a: 'The email threads you pick,',
    grad: 'remembered per contact.',
    sub: 'Messages that match your Gmail search become one memory per relationship, so your agent knows where things stand with each person.',
    cmd: "statewave-connectors sync gmail --query 'label:inbox' --dry-run",
    from: 'label:inbox',
    to: 'relationship:jordan@acme.com',
  },

  story: {
    heading: ['One renewal email,', 'there before the next call.'],
    lede: 'Jordan at Acme replies about the contract renewal. Here’s that email, from your inbox to the next time you talk.',
    steps: [
      { title: 'Read the email', text: 'The connector pulls the messages your Gmail search matches, or receives new mail in real time through Pub/Sub push.' },
      { title: 'File it under the contact', text: 'Received mail is filed under the sender, sent mail under the first recipient. Everything with Jordan lands in relationship:jordan@acme.com.' },
      { title: 'Answer with the history', text: 'Before your next call, your agent recalls where the renewal stands and links to the emails it came from.' },
    ],
    source: {
      label: 'Email',
      id: '18fabc123',
      title: 'Re: contract renewal',
      body: 'Happy to extend for another year.',
      meta: [['From', 'jordan@acme.com'], ['Label', 'INBOX']],
      status: 'Received',
      via: 'Arrived through Gmail’s Pub/Sub push',
    },
    episode: {
      kind: 'gmail.message.received',
      subject: 'relationship:jordan@acme.com',
      text: 'Re: contract renewal. Happy to extend for another year.',
      url: 'mail.google.com/mail/u/0/#all/18fabc123',
      lane: 'relationship:jordan@acme.com',
      laneNote: 'Jordan at Acme · 38 episodes',
    },
    answer: {
      asker: 'You · account lead',
      ask: 'Where are we on Acme’s renewal?',
      answer: 'Jordan agreed on May 20 to extend for another year. Their legal team has the order form, and Jordan expects it back next week.',
      sources: ['received · May 20', 'received · May 28'],
      call: 'statewave_get_context("relationship:jordan@acme.com")',
    },
  },

  reads: {
    heading: ['Mail in and mail out.', 'Only what your search finds.'],
    lede: 'Each message your query matches becomes one episode, received or sent. The connector takes the plain-text part, or strips the HTML when that’s all there is.',
    title: 'Contract renewal · Jordan at Acme',
    events: [
      { time: 'May 14', who: 'You', title: 'Sent', text: 'Contract renewal. Our current term ends in June. Shall we talk about another year?', kind: 'gmail.message.sent' },
      { time: 'May 20', who: 'Jordan', title: 'Received', text: 'Re: contract renewal. Happy to extend for another year.', kind: 'gmail.message.received' },
      { time: 'May 21', who: 'You', title: 'Sent', text: 'Great news. The updated order form is ready for signature.', kind: 'gmail.message.sent' },
      { time: 'May 28', who: 'Jordan', title: 'Received', text: 'Legal has the order form. Expect it back next week.', kind: 'gmail.message.received' },
    ],
  },

  routing: {
    heading: ['One memory per contact,', 'whichever way the mail went.'],
    lede: 'Pick a message to see where it goes. Mail from Jordan and mail you send to Jordan end up in the same place.',
    pick: 'Example message',
    options: [
      { label: 'From Jordan', detail: 'Received · Jordan <jordan@acme.com>', subject: 'relationship:jordan@acme.com', why: 'Received mail goes to the sender. The display name is dropped and the address lowercased.' },
      { label: 'To Maya and Jordan', detail: 'Sent · To: maya@acme.com, jordan@acme.com', subject: 'relationship:maya@acme.com', why: 'Sent mail goes to the first To recipient.' },
      { label: 'No sender or recipient', detail: 'System-only mail (rare)', subject: 'thread:18fa77c2', why: 'It falls back to its thread id, so it still groups with the thread.' },
    ],
    note: ['Want the whole account in one place?', '--subject account:acme', 'pins a sync to one subject.'],
  },

  setup: {
    steps: [
      { title: 'Create an OAuth client', text: 'In Google Cloud Console, create an OAuth client ID for a desktop app and enable the Gmail API.' },
      { title: 'Get a refresh token', text: 'Run the one-time consent flow with the gmail.readonly scope. The OAuth 2.0 Playground is the quickest way.' },
      { title: 'Preview with --dry-run', text: 'Write a Gmail search for the mail you want. The connector maps each message, then prints the episodes. Nothing is sent.' },
      { title: 'Ingest', text: 'Point STATEWAVE_URL at your instance and run the same command without --dry-run.' },
      { title: 'Optional: go real time', text: 'Create a Pub/Sub topic and push subscription for the receiver, then register a Gmail watch. Run a pull first, since the receiver only picks up changes from then on.' },
    ],
    env: [
      { name: 'GMAIL_CLIENT_ID + GMAIL_CLIENT_SECRET', when: 'Always', text: 'From your Google Cloud OAuth client' },
      { name: 'GMAIL_REFRESH_TOKEN', when: 'Always', text: 'From the one-time consent flow' },
      { name: 'GMAIL_PUBSUB_TOKEN', when: 'Real time', text: 'A random secret you also put in the Pub/Sub push URL' },
      { name: 'GMAIL_QUERY', when: 'Real time, optional', text: 'Filters what the receiver ingests, like --query' },
      { name: 'STATEWAVE_URL + STATEWAVE_API_KEY', when: 'To ingest', text: 'Your Statewave instance' },
    ],
    terminal: [
      {
        label: 'Dry-run',
        env: ['GMAIL_CLIENT_ID=…', 'GMAIL_CLIENT_SECRET=…', 'GMAIL_REFRESH_TOKEN=…'],
        cmd: "statewave-connectors sync gmail --query 'label:inbox' --dry-run --json",
        outputLabel: 'Prints the episodes. Sends nothing.',
        output: `{
  "subject": "relationship:jordan@acme.com",
  "kind": "gmail.message.received",
  "text": "Re: contract renewal\\n\\nHappy to extend for another year.",
  "occurred_at": "2026-05-20T09:12:00.000Z",
  "source": {
    "type": "gmail.message.received",
    "id": "message:18fabc123",
    "url": "https://mail.google.com/mail/u/0/#all/18fabc123"
  }
}`,
      },
      {
        label: 'Ingest',
        env: ['STATEWAVE_URL=http://localhost:8100', 'STATEWAVE_API_KEY=…'],
        cmd: "statewave-connectors sync gmail --query 'label:inbox newer_than:30d'",
        notes: [
          'Delta sync: pass the last run’s cursor with --cursor. Gmail keeps history for about 7 days.',
          'Filter by label id with --label-ids, for example INBOX,IMPORTANT.',
          'Cap a run with --max-items.',
        ],
      },
      {
        label: 'Real time',
        env: ['GMAIL_PUBSUB_TOKEN=…', 'GMAIL_CLIENT_ID=…', 'GMAIL_CLIENT_SECRET=…', 'GMAIL_REFRESH_TOKEN=…', "GMAIL_QUERY='label:inbox'", 'STATEWAVE_URL=http://localhost:8100'],
        cmd: 'statewave-connectors listen gmail --port 3000',
        outputLabel: 'Point a Pub/Sub push subscription at this address.',
        output: '→ http://0.0.0.0:3000/gmail/events',
        notes: [
          'Checks a path token, a Google-signed OIDC token, or both',
          'Drops repeated Pub/Sub deliveries',
          'Fetches the changed messages through the History API',
          'Uses the same OAuth credentials as the pull',
        ],
      },
      {
        label: 'One contact',
        env: ['GMAIL_CLIENT_ID=…', 'GMAIL_CLIENT_SECRET=…', 'GMAIL_REFRESH_TOKEN=…'],
        cmd: "statewave-connectors sync gmail --query 'from:jordan@acme.com after:2026/01/01' --max-items 50 --dry-run",
        notes: [
          'The query uses Gmail’s own search syntax, so from:, label: and after: work as they do in Gmail.',
          'Mail from Jordan lands in relationship:jordan@acme.com.',
        ],
      },
    ],
  },

  safety: [
    '--query is required. There’s no whole-mailbox default.',
    'It only asks for the read-only gmail.readonly scope.',
    'Credentials only go to oauth2.googleapis.com and gmail.googleapis.com.',
    'Push deliveries must pass a path token, an OIDC check, or both.',
  ],
  limits: [
    'Bodies are cut at 8,000 characters, so one long email can’t take over the context.',
    'The Gmail watch expires after 7 days. For now, renew it with your own cron.',
    'Each message is its own episode. Threads are linked through metadata.thread_id.',
    'Not yet: service-account auth across a Workspace domain, and attachments.',
  ],

  close: {
    a: 'Give your agent',
    grad: 'a memory for every relationship.',
    more: 'More team connectors',
    useCase: { label: 'Support agent use case', href: '/use-cases' },
  },
  related: ['slack', 'discord'],
}
