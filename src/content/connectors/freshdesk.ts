import type { Connector } from './types'

/** packages/freshdesk/README.md (v0.2.0). The Northwind ticket is illustrative,
 *  keyed to the homepage's example account. */
export const freshdesk: Connector = {
  slug: 'freshdesk',
  name: 'Freshdesk',
  logo: '/connectors/freshdesk.svg',
  group: 'Support',
  status: 'stable',
  modes: ['pull', 'push'],
  pkg: '@statewavedev/connectors-freshdesk',
  source: 'https://github.com/smaramwbc/statewave-connectors/tree/main/packages/freshdesk',

  hero: {
    a: 'Every Freshdesk ticket,',
    grad: 'on the company’s record.',
    sub: 'Tickets, public replies and private notes become one memory per company, so your agent knows a customer’s past tickets before it answers.',
    cmd: 'statewave-connectors sync freshdesk --dry-run',
    from: 'acme.freshdesk.com',
    to: 'customer:6001',
  },

  story: {
    heading: ['One ticket,', 'from inbox to answer.'],
    lede: 'A Northwind billing ticket, from the first email to the next time Northwind writes in.',
    steps: [
      { title: 'Read the ticket', text: 'A sync asks Freshdesk for tickets updated since a date you choose. An Automation rule can also push each change to the receiver as it happens.' },
      { title: 'File it under the company', text: 'Each event becomes an episode under the ticket’s company. Every Northwind ticket lands in customer:6001.' },
      { title: 'Answer from the history', text: 'When Northwind reports the same problem, your agent knows what fixed it and links back to the ticket.' },
    ],
    source: {
      label: 'Ticket',
      id: '#7310',
      title: 'Invoices go to our old billing email',
      body: 'We changed our billing contact in March, but invoices still go to the old address.',
      meta: [['Requester', 'Tom Becker'], ['Company', 'Northwind']],
      status: 'Open',
      via: 'Arrived through the webhook',
    },
    episode: {
      kind: 'freshdesk.ticket.created',
      subject: 'customer:6001',
      text: 'Invoices go to our old billing email. We changed our billing contact in March, but invoices still go to the old address.',
      url: 'acme.freshdesk.com/a/tickets/7310',
      lane: 'customer:6001',
      laneNote: 'Northwind · 18 episodes',
    },
    answer: {
      asker: 'Tom · Northwind',
      ask: 'Invoices are going to the old address again.',
      answer: 'Last time, the new address was saved on a user instead of the Northwind company record. Update it on the company under Settings → Billing and the next invoice follows.',
      sources: ['ticket #7310', 'private note · 14:20'],
      call: 'statewave_get_context("customer:6001")',
    },
  },

  reads: {
    heading: ['Tickets first.', 'Conversations if you add them.'],
    lede: 'Freshdesk calls the replies and notes on a ticket conversations. Fetching them takes one extra API call per ticket, so they’re off until you add them. Private notes keep their own kind.',
    toggle: { off: 'Tickets', on: 'Tickets + conversations', offFlag: '--include tickets', onFlag: '--include tickets,conversations' },
    title: 'Ticket #7310 · Northwind',
    events: [
      { time: '13:05', who: 'Tom Becker', title: 'Ticket created', text: 'Invoices still go to our old billing email.', kind: 'freshdesk.ticket.created' },
      { time: '13:40', who: 'Ines · Billing', title: 'Public reply', text: 'Thanks Tom. Which address should invoices go to?', kind: 'freshdesk.conversation.posted', optIn: true },
      { time: '14:20', who: 'Ines · Billing', title: 'Private note', text: 'The new address was saved on Tom’s user. Moved it to the Northwind company record.', kind: 'freshdesk.conversation.internal_note', optIn: true },
      { time: '15:10', who: 'Ines · Billing', title: 'Ticket resolved', text: 'Resolved after a test invoice reached the new address.', kind: 'freshdesk.ticket.resolved' },
    ],
  },

  routing: {
    heading: ['Filed by company,', 'then by requester.'],
    lede: 'Pick a ticket to see where it goes. The company comes first, so everyone at Northwind shares one history.',
    pick: 'Example ticket',
    options: [
      { label: 'Northwind', detail: 'B2B account · company 6001', subject: 'customer:6001', why: 'The company wins, so every Northwind requester shares one memory.' },
      { label: 'A single requester', detail: 'No company · requester 90412', subject: 'customer:90412', why: 'B2C and single-tenant helpdesks fall back to the requester.' },
      { label: 'Neither', detail: 'No company or requester (rare)', subject: 'ticket:7488', why: 'Episodes still group together, under the ticket.' },
    ],
    note: ['Want every ticket under one subject?', '--subject account:acme', 'pins a whole sync to it.'],
  },

  setup: {
    steps: [
      { title: 'Copy your API key', text: 'Click your avatar → Profile settings. Your API Key is in the right-hand column.' },
      { title: 'Set your credentials', text: 'Your subdomain and the API key. The connector sends the key the way Freshdesk expects, with X as the password.' },
      { title: 'Preview with --dry-run', text: 'Tickets are read and mapped, and the episodes printed. Nothing reaches Statewave.' },
      { title: 'Ingest', text: 'Point STATEWAVE_URL at your instance and drop --dry-run.' },
      { title: 'Optional: go real time', text: 'In an Automation rule, add a Trigger Webhook action with your secret in the X-Statewave-Token header.' },
    ],
    env: [
      { name: 'FRESHDESK_SUBDOMAIN', when: 'Always', text: 'acme for acme.freshdesk.com' },
      { name: 'FRESHDESK_API_KEY', when: 'To sync', text: 'From your profile settings in Freshdesk' },
      { name: 'FRESHDESK_WEBHOOK_SECRET', when: 'Real time', text: 'Any random string. The same value goes in the X-Statewave-Token header.' },
      { name: 'STATEWAVE_URL + STATEWAVE_API_KEY', when: 'To ingest', text: 'Your Statewave instance' },
    ],
    terminal: [
      {
        label: 'Dry-run',
        env: ['FRESHDESK_SUBDOMAIN=acme', 'FRESHDESK_API_KEY=…'],
        cmd: 'statewave-connectors sync freshdesk --since 2026-01-01 --dry-run --json',
        outputLabel: 'Prints the episodes. Sends nothing.',
        output: `{
  "subject": "customer:6001",
  "kind": "freshdesk.ticket.created",
  "text": "Cannot reset password\\n\\nThe reset email never arrives.",
  "occurred_at": "2026-05-20T09:12:00.000Z",
  "source": {
    "type": "freshdesk.ticket",
    "id": "ticket:4821",
    "url": "https://acme.freshdesk.com/a/tickets/4821"
  }
}`,
      },
      {
        label: 'Ingest',
        env: ['STATEWAVE_URL=http://localhost:8100', 'STATEWAVE_API_KEY=…'],
        cmd: 'statewave-connectors sync freshdesk --include tickets,conversations --since 2026-01-01',
        notes: [
          '--since runs on Freshdesk’s side through updated_since, so only changed tickets come back.',
          'Status arrives as a name like pending or waiting_on_customer, with the raw code kept beside it.',
          'Cap a run with --max-items.',
        ],
      },
      {
        label: 'Real time',
        env: ['FRESHDESK_WEBHOOK_SECRET=…', 'FRESHDESK_SUBDOMAIN=acme', 'STATEWAVE_URL=http://localhost:8100'],
        cmd: 'statewave-connectors listen freshdesk --port 3000',
        outputLabel: 'Use this as the Callback URL in an Automation rule.',
        output: '→ http://0.0.0.0:3000/freshdesk/events',
        notes: [
          'Checks the X-Statewave-Token header first',
          'Drops retried deliveries',
          'One Automation rule per event, like ticket created or comment added',
          'Runs as a daemon, or on Vercel, Cloudflare or Express',
        ],
      },
    ],
  },

  safety: [
    'The API key is only sent to <subdomain>.freshdesk.com.',
    'Replies and private notes are opt-in.',
    '--dry-run shows every episode before anything is sent.',
    'Webhooks need the shared secret and are deduplicated.',
  ],
  limits: [
    'Conversations cost one extra API call per ticket.',
    'API key only. OAuth is left out on purpose, since Freshdesk’s OAuth is built for end-user apps.',
    'Webhooks are set up per Automation rule, with a JSON template you paste in.',
    'Not yet: knowledge base articles, time entries, survey responses.',
  ],

  close: {
    a: 'Answer with what',
    grad: 'Freshdesk already knows.',
    more: 'More support connectors',
    useCase: { label: 'Support agent use case', href: '/use-cases' },
  },
  related: ['zendesk', 'intercom'],
}
