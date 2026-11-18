import type { Connector } from './types'

/** packages/zendesk/README.md (v0.2.0). The Northwind ticket is illustrative,
 *  keyed to the homepage's example account. */
export const zendesk: Connector = {
  slug: 'zendesk',
  name: 'Zendesk',
  logo: 'zendesk',
  group: 'Support',
  status: 'stable',
  modes: ['pull', 'push'],
  pkg: '@statewavedev/connectors-zendesk',
  source: 'https://github.com/smaramwbc/statewave-connectors/tree/main/packages/zendesk',
  example: 'https://github.com/smaramwbc/statewave-connectors/tree/main/examples/zendesk-customer-memory',

  hero: {
    a: 'Every Zendesk ticket,',
    grad: 'remembered per customer.',
    sub: 'Tickets, replies and internal notes become one memory per customer, so your support agent starts every conversation knowing the history.',
    cmd: 'statewave-connectors sync zendesk --dry-run',
    from: 'acme.zendesk.com',
    to: 'customer:6001',
  },

  story: {
    heading: ['One ticket,', 'followed all the way.'],
    lede: 'A Northwind ticket, from the moment it arrives to the next time Northwind writes in.',
    steps: [
      { title: 'Read the ticket', text: 'The connector pulls tickets on a schedule, or receives them the moment they change through a signed webhook.' },
      { title: 'File it under the customer', text: 'Each event becomes an episode, filed under the account it belongs to. Every Northwind ticket lands in customer:6001.' },
      { title: 'Answer with the history', text: 'When Northwind writes in again, your agent recalls what fixed it last time and links back to the ticket it came from.' },
    ],
    source: {
      label: 'Ticket',
      id: '#4821',
      title: 'Cannot reset password',
      body: 'The reset email never arrives for this user.',
      meta: [['Requester', 'Dana Reyes'], ['Organization', 'Northwind']],
      status: 'Open',
      via: 'Arrived through the webhook',
    },
    episode: {
      kind: 'zendesk.ticket.created',
      subject: 'customer:6001',
      text: 'Cannot reset password. The reset email never arrives for this user.',
      url: 'acme.zendesk.com/agent/tickets/4821',
      lane: 'customer:6001',
      laneNote: 'Northwind · 15 episodes',
    },
    answer: {
      asker: 'Dana · Northwind',
      ask: 'The reset email is missing again.',
      answer: 'Last time this was Northwind’s mail filter holding our emails in quarantine. Could you check quarantine, or ask IT to allowlist acme.com?',
      sources: ['ticket #4821', 'internal note · 10:05'],
      call: 'statewave_get_context("customer:6001")',
    },
  },

  reads: {
    heading: ['Tickets by default.', 'Comments on request.'],
    lede: 'Replies and internal notes cost one extra API call per ticket, so they’re off until you add them. Notes are often where the fix lives.',
    toggle: { off: 'Tickets', on: 'Tickets + comments', offFlag: '--include tickets', onFlag: '--include tickets,comments' },
    title: 'Ticket #4821 · Northwind',
    events: [
      { time: '09:12', who: 'Dana Reyes', title: 'Ticket created', text: 'Cannot reset password. The reset email never arrives.', kind: 'zendesk.ticket.created' },
      { time: '09:40', who: 'Sam · Support', title: 'Public reply', text: 'Thanks Dana, we’re looking into it.', kind: 'zendesk.comment.posted', optIn: true },
      { time: '10:05', who: 'Sam · Support', title: 'Internal note', text: 'Northwind’s mail filter quarantines our reset emails. Ask them to allowlist acme.com.', kind: 'zendesk.comment.internal_note', optIn: true },
      { time: '11:30', who: 'Sam · Support', title: 'Ticket solved', text: 'Solved after Northwind’s IT released the email.', kind: 'zendesk.ticket.solved' },
    ],
  },

  routing: {
    heading: ['One memory per customer,', 'not per ticket.'],
    lede: 'Pick a ticket to see where it goes. “Show me Northwind’s history” is one lookup.',
    pick: 'Example ticket',
    options: [
      { label: 'Northwind', detail: 'B2B account · organization 6001', subject: 'customer:6001', why: 'The organization wins, so the whole account shares one memory.' },
      { label: 'A single user', detail: 'No organization · requester 88231', subject: 'customer:88231', why: 'B2C and single-tenant desks fall back to the requester.' },
      { label: 'Neither', detail: 'No organization or requester (rare)', subject: 'ticket:5120', why: 'Episodes still group together, under the ticket.' },
    ],
    note: ['Want every ticket in one place?', '--subject account:acme', 'pins a whole sync to one subject.'],
  },

  setup: {
    steps: [
      { title: 'Create an API token', text: 'Admin Center → Apps and integrations → APIs → Zendesk API. Turn on token access and add a token.' },
      { title: 'Set your credentials', text: 'Your subdomain, plus the agent email the token belongs to.' },
      { title: 'Preview with --dry-run', text: 'The connector reads and maps tickets, then prints the episodes. Nothing is sent.' },
      { title: 'Ingest', text: 'Point STATEWAVE_URL at your instance and run the same command without --dry-run.' },
      { title: 'Optional: go real time', text: 'Create a Zendesk webhook and set its signing secret on the receiver.' },
    ],
    env: [
      { name: 'ZENDESK_SUBDOMAIN', when: 'Always', text: 'acme for acme.zendesk.com' },
      { name: 'ZENDESK_EMAIL + ZENDESK_API_TOKEN', when: 'API token mode', text: 'The agent email and its API token' },
      { name: 'ZENDESK_OAUTH_TOKEN', when: 'OAuth mode', text: 'An access token you already have' },
      { name: 'ZENDESK_WEBHOOK_SIGNING_SECRET', when: 'Real time', text: 'From the webhook’s settings in Zendesk' },
      { name: 'STATEWAVE_URL + STATEWAVE_API_KEY', when: 'To ingest', text: 'Your Statewave instance' },
    ],
    terminal: [
      {
        label: 'Dry-run',
        env: ['ZENDESK_SUBDOMAIN=acme', 'ZENDESK_EMAIL=agent@acme.example', 'ZENDESK_API_TOKEN=…'],
        cmd: 'statewave-connectors sync zendesk --since 2026-01-01 --dry-run --json',
        outputLabel: 'Prints the episodes. Sends nothing.',
        output: `{
  "subject": "customer:6001",
  "kind": "zendesk.ticket.created",
  "text": "Cannot reset password\\n\\nThe reset email never arrives for this user.",
  "occurred_at": "2026-05-20T09:12:00.000Z",
  "source": {
    "type": "zendesk.ticket",
    "id": "ticket:4821",
    "url": "https://acme.zendesk.com/agent/tickets/4821"
  }
}`,
      },
      {
        label: 'Ingest',
        env: ['STATEWAVE_URL=http://localhost:8100', 'STATEWAVE_API_KEY=…'],
        cmd: 'statewave-connectors sync zendesk --include tickets,comments --since 2026-01-01',
        notes: [
          'Delta sync: start with --use-incremental, then pass --cursor on later runs. Needs admin API access.',
          'Narrow a run with --brands, --statuses or --max-items.',
        ],
      },
      {
        label: 'Real time',
        env: ['ZENDESK_WEBHOOK_SIGNING_SECRET=…', 'ZENDESK_SUBDOMAIN=acme', 'STATEWAVE_URL=http://localhost:8100'],
        cmd: 'statewave-connectors listen zendesk --port 3000',
        outputLabel: 'Point a Zendesk webhook at this address.',
        output: '→ http://0.0.0.0:3000/zendesk/events',
        notes: [
          'Verifies Zendesk’s HMAC-SHA256 signature first',
          'Drops retried deliveries',
          'Trigger-driven or event-driven webhooks',
          'Runs as a daemon, or on Vercel, Cloudflare or Express',
        ],
      },
      {
        label: 'OAuth',
        env: ['ZENDESK_SUBDOMAIN=acme', 'ZENDESK_OAUTH_TOKEN=…'],
        cmd: 'statewave-connectors sync zendesk --dry-run',
        notes: ['Bring an access token you already have. If both modes are set, OAuth wins.'],
      },
    ],
  },

  safety: [
    'Credentials are only sent to <subdomain>.zendesk.com.',
    'Replies and internal notes are opt-in.',
    '--dry-run shows every episode before anything is sent.',
    'Webhooks are signature-checked and deduplicated.',
  ],
  limits: [
    'Comments cost one extra API call per ticket.',
    'Delta sync through the incremental export needs admin API access.',
    'OAuth needs a token you already have. The connector doesn’t run the OAuth flow.',
    'Not yet: applied macros, side conversations, author details beyond the requester.',
  ],

  close: {
    a: 'Give your support agent',
    grad: 'a memory for every customer.',
    more: 'More support connectors',
    useCase: { label: 'Support agent use case', href: '/use-cases' },
  },
  related: ['intercom', 'freshdesk'],
}
