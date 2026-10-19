import type { Connector } from './types'

/** packages/database/README.md (v0.2.0). The support_tickets rows come from the README's
 *  example; the customer:6001 routing ties them to the homepage's Northwind account. */
export const database: Connector = {
  slug: 'database',
  name: 'Databases',
  logo: '/connectors/database.svg',
  group: 'Databases',
  status: 'preview',
  modes: ['pull'],
  pkg: '@statewavedev/connectors-database',
  source: 'https://github.com/smaramwbc/statewave-connectors/tree/main/packages/database',

  hero: {
    a: 'Rows from your database,',
    grad: 'recalled by your agents.',
    sub: 'Bring selected rows from Postgres, MySQL, MariaDB or SQL Server into memory. Read-only, allowlisted and capped on every run.',
    cmd: 'statewave-connectors sync database --dialect postgres --table support_tickets --columns id,subject,status --id-column id --max-rows 500 --dry-run',
    from: 'postgres · read-only',
    to: 'database:support_tickets',
  },

  story: {
    heading: ['One row,', 'followed all the way.'],
    lede: 'A support ticket row in your own database, from a read-only SELECT to the agent’s answer.',
    steps: [
      { title: 'Select only what you allow', text: 'A read-only login, one allowlisted table and the columns you name. Every run is capped by --max-rows.' },
      { title: 'Map each row to an episode', text: 'Each row becomes a database.row episode. Use one subject for the table, or one per customer with --subject-column.' },
      { title: 'Answer with the record', text: 'Your agent recalls the row’s fields as memory, next to the tickets and chats about the same customer.' },
    ],
    source: {
      label: 'Row',
      id: 'support_tickets#4821',
      title: 'Cannot reset password',
      body: 'status: open · updated 20 May, 09:12',
      meta: [['Table', 'support_tickets'], ['Dialect', 'postgres']],
      status: 'open',
      via: 'Read with a read-only SELECT',
    },
    episode: {
      kind: 'database.row',
      subject: 'database:support_tickets',
      text: 'support_tickets row 4821. subject: Cannot reset password. status: open',
      url: 'support_tickets#4821',
      lane: 'database:support_tickets',
      laneNote: 'support_tickets · 312 episodes',
    },
    answer: {
      asker: 'Sam · Support',
      ask: 'Is Northwind’s password reset ticket still open?',
      answer: 'Yes. Row 4821 in support_tickets is still open. It was last updated on 20 May at 09:12.',
      sources: ['support_tickets#4821'],
      call: 'statewave_get_context("database:support_tickets")',
    },
  },

  reads: {
    heading: ['Rows by default.', 'Schema when you ask.'],
    lede: 'Rows mode reads the columns you list. Schema mode reads table definitions for an allowlist of tables, and never reads data.',
    toggle: { off: 'Rows', on: 'Rows + a schema run', offFlag: '--table support_tickets --columns id,subject,status,updated_at', onFlag: 'and a second run: --mode schema --tables support_tickets' },
    title: 'support_tickets · postgres',
    events: [
      { time: '#4821', title: 'Row', text: 'subject: Cannot reset password. status: open', kind: 'database.row' },
      { time: '#4822', title: 'Row', text: 'subject: Invoice in the wrong currency. status: pending', kind: 'database.row' },
      { time: '#4830', title: 'Row', text: 'subject: Export stuck at 90%. status: solved', kind: 'database.row' },
      { time: 'schema', title: 'Table schema', text: 'Columns, primary key and indexes. Metadata only, no rows.', kind: 'database.schema', optIn: true },
    ],
  },

  routing: {
    heading: ['One subject per table,', 'or one per customer.'],
    lede: 'Pick a setup to see where the rows go.',
    pick: 'Example setup',
    options: [
      { label: 'Fixed subject', detail: '--subject database:support_tickets', subject: 'database:support_tickets', why: 'Every row of the table lands in one memory.' },
      { label: 'One per customer', detail: '--subject-column customer_id --subject-prefix customer', subject: 'customer:6001', why: 'Each row joins its customer’s memory, next to their tickets and chats.' },
      { label: 'Schema mode', detail: '--mode schema --tables support_tickets', subject: 'database:schema', why: 'Table definitions for agents that help with database design and migrations.' },
    ],
    note: ['No subject set? Rows go to', 'database:<table-or-query>', 'by default.'],
  },

  setup: {
    steps: [
      { title: 'Create a read-only login', text: 'Use a least-privilege, read-only user. On SQL Server this is required, because it has no read-only session flag.' },
      { title: 'Install the driver', text: 'pg for Postgres, mysql2 for MySQL and MariaDB, mssql for SQL Server.' },
      { title: 'Set the connection URL', text: 'Put it in STATEWAVE_DATABASE_SOURCE_URL. Never put a password in committed config.' },
      { title: 'Preview with --dry-run', text: 'The connector connects read-only, runs the SELECT and prints the episodes. Nothing is sent.' },
      { title: 'Ingest', text: 'Point STATEWAVE_URL at your instance and run the same command without --dry-run.' },
    ],
    env: [
      { name: 'STATEWAVE_DATABASE_SOURCE_URL', when: 'Always', text: 'Connection URL for a read-only login' },
      { name: 'STATEWAVE_URL + STATEWAVE_API_KEY', when: 'To ingest', text: 'Your Statewave instance' },
    ],
    terminal: [
      {
        label: 'Dry-run',
        env: ['STATEWAVE_DATABASE_SOURCE_URL=postgres://reader@localhost:5432/app'],
        cmd: 'statewave-connectors sync database --dialect postgres --table support_tickets --columns id,subject,status,updated_at --id-column id --updated-at-column updated_at --max-rows 500 --subject database:support_tickets --dry-run --json',
        outputLabel: 'Prints the episodes. Sends nothing.',
        output: `{
  "subject": "database:support_tickets",
  "kind": "database.row",
  "text": "support_tickets row 4821\\nsubject: Cannot reset password\\nstatus: open",
  "occurred_at": "2026-05-20T09:12:00.000Z",
  "source": { "type": "database.postgres", "id": "support_tickets#4821" },
  "metadata": {
    "dialect": "postgres",
    "source": "support_tickets",
    "row_id": "4821",
    "updated_at": "2026-05-20T09:12:00.000Z",
    "fields": { "subject": "Cannot reset password", "status": "open" },
    "related_subjects": ["row:4821"]
  },
  "idempotency_key": "…"
}`,
      },
      {
        label: 'Query',
        env: ['STATEWAVE_DATABASE_SOURCE_URL=mysql://reader@localhost:3306/app'],
        cmd: 'statewave-connectors sync database --dialect mysql --query "SELECT id, subject, status, updated_at FROM support_tickets" --id-column id --updated-at-column updated_at --max-rows 500 --dry-run',
        notes: [
          'One read-only SELECT that you write',
          'INSERT, UPDATE, DELETE, DDL and SELECT … INTO are rejected',
          'Same flags for MariaDB and SQL Server, with a different --dialect',
        ],
      },
      {
        label: 'Schema',
        env: [],
        cmd: 'statewave-connectors sync database --dialect postgres --mode schema --tables support_tickets,public.users --dry-run',
        notes: [
          'Reads columns, the primary key and indexes',
          'Never runs SELECT … FROM your tables',
          'Default subject database:schema. Re-runs update the same memory',
        ],
      },
      {
        label: 'Ingest',
        env: ['STATEWAVE_URL=http://localhost:8100', 'STATEWAVE_API_KEY=…'],
        cmd: 'statewave-connectors sync database --dialect postgres --table support_tickets --columns id,subject,status,updated_at --id-column id --updated-at-column updated_at --max-rows 500 --subject database:support_tickets',
      },
    ],
  },

  safety: [
    'Read-only. Mutation queries are rejected, and Postgres, MySQL and MariaDB sessions are set read-only.',
    'Allowlisted tables and columns only. No schema-wide dump, no blind scan.',
    'In rows mode every run is capped: --max-rows is required.',
    'Secrets come from environment variables. Binary columns are dropped.',
  ],
  limits: [
    'Preview. Rows mode is verified live on all four dialects; schema mode on Postgres, MySQL and SQL Server.',
    'SQL Server has no read-only session flag, so use a least-privilege read-only login.',
    'It reads your data into memory. It isn’t a storage backend: Statewave itself runs on Postgres with pgvector.',
    'No change-data-capture.',
  ],

  close: {
    a: 'Give your agents',
    grad: 'the records behind the conversation.',
    more: 'Pairs well with',
    useCase: { label: 'Support agent use case', href: '/use-cases' },
  },
  related: ['zendesk', 'jira', 'n8n'],
}
