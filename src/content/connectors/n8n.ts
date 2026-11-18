import type { Connector } from './types'

/** packages/n8n/README.md (v0.1.0). Workflow 42 "Daily ETL" and execution 1001 come from
 *  the README; the failed run 1002 and its node are illustrative. */
export const n8n: Connector = {
  slug: 'n8n',
  name: 'n8n',
  logo: 'n8n',
  group: 'Workflow',
  status: 'stable',
  modes: ['pull'],
  pkg: '@statewavedev/connectors-n8n',
  source: 'https://github.com/smaramwbc/statewave-connectors/tree/main/packages/n8n',

  hero: {
    a: 'Every n8n execution,',
    grad: 'filed under its workflow.',
    sub: 'Runs, failures and the nodes that broke become memory for each workflow, so an agent can say what failed last night and whether it happened before.',
    cmd: 'statewave-connectors sync n8n --workflows 42 --instance-url https://n8n.example.com --dry-run',
    from: 'n8n.example.com',
    to: 'workflow:42',
  },

  story: {
    heading: ['One workflow,', 'run after run.'],
    lede: 'Daily ETL, workflow 42, from a failed night run to the morning someone asks why the numbers are missing.',
    steps: [
      { title: 'Read the executions', text: 'A sync reads executions for the workflows you name from n8n’s REST API, with each run’s node data included.' },
      { title: 'File it under the workflow', text: 'Runs, failures and node errors become episodes under workflow:42. A failed run adds one episode per broken node.' },
      { title: 'Answer from the history', text: 'When the dashboard comes up empty, your agent can say which run failed, at which node, and whether it happened before.' },
    ],
    source: {
      label: 'Execution',
      id: '1002',
      title: 'Daily ETL',
      body: 'Stopped at the Load to warehouse node. The database refused the connection.',
      meta: [['Workflow', '42'], ['Mode', 'trigger']],
      status: 'Error',
      via: 'Pulled by statewave-connectors sync',
    },
    episode: {
      kind: 'n8n.node.errored',
      subject: 'workflow:42',
      text: 'Node “Load to warehouse” errored in execution 1002 of Daily ETL. Connection refused.',
      url: 'n8n.example.com/workflow/42/executions/1002',
      lane: 'workflow:42',
      laneNote: 'Daily ETL · 31 episodes',
    },
    answer: {
      asker: 'Mia · Data team',
      ask: 'Why is yesterday’s data missing from the dashboard?',
      answer: 'Last night’s Daily ETL run, execution 1002, failed at the Load to warehouse node because the database refused the connection. The run before it finished fine, so start with the warehouse.',
      sources: ['execution 1002', 'node · Load to warehouse'],
      call: 'statewave_get_context("workflow:42")',
    },
  },

  reads: {
    heading: ['Every run,', 'and the node that broke.'],
    lede: 'Each execution becomes one episode. A failed run also gets one episode per errored node, taken from run data the connector already has. Both are on by default.',
    title: 'Workflow 42 · Daily ETL',
    events: [
      { time: 'May 20', title: 'Run succeeded', text: 'Workflow “Daily ETL” execution 1001 finished: success', kind: 'n8n.workflow.executed' },
      { time: 'May 21', title: 'Run failed', text: 'Execution 1002 stopped with an error.', kind: 'n8n.workflow.failed' },
      { time: 'May 21', title: 'Node errored', text: 'Load to warehouse: connection refused.', kind: 'n8n.node.errored' },
      { time: 'May 22', title: 'Run succeeded', text: 'Execution 1003 finished: success', kind: 'n8n.workflow.executed' },
    ],
  },

  routing: {
    heading: ['One memory per workflow,', 'across every run.'],
    lede: 'Pick a workflow to see where its runs go. Pass workflows by id or by name.',
    pick: 'Example workflow',
    options: [
      { label: 'Daily ETL', detail: 'Passed by id · 42', subject: 'workflow:42', why: 'Every run of workflow 42 shares one memory.' },
      { label: 'Invoice sync', detail: 'Passed by name · id 57', subject: 'workflow:57', why: 'The subject uses the workflow id, however you passed it.' },
    ],
    note: ['Want several workflows in one memory?', '--subject team:data', 'pins a whole sync to one subject.'],
  },

  setup: {
    steps: [
      { title: 'Create an API key', text: 'In n8n, go to Settings → API → Create new API key.' },
      { title: 'Point at your instance', text: 'Set N8N_INSTANCE_URL, or pass --instance-url.' },
      { title: 'Pick the workflows', text: '--workflows takes ids or names. You need at least one, so a first run never walks every execution.' },
      { title: 'Preview with --dry-run', text: 'Executions are read and mapped, and the episodes printed. Nothing is sent.' },
      { title: 'Ingest', text: 'Set STATEWAVE_URL and run the same command without --dry-run.' },
    ],
    env: [
      { name: 'N8N_API_KEY', when: 'Always', text: 'From Settings → API in n8n' },
      { name: 'N8N_INSTANCE_URL', when: 'Unless you pass --instance-url', text: 'Your n8n address, like https://n8n.example.com' },
      { name: 'STATEWAVE_URL + STATEWAVE_API_KEY', when: 'To ingest', text: 'Your Statewave instance' },
    ],
    terminal: [
      {
        label: 'Dry-run',
        env: ['N8N_API_KEY=…'],
        cmd: `statewave-connectors sync n8n \\
  --workflows 42 \\
  --instance-url https://n8n.example.com \\
  --dry-run --json`,
        outputLabel: 'Prints the episodes. Sends nothing.',
        output: `{
  "subject": "workflow:42",
  "kind": "n8n.workflow.executed",
  "text": "Workflow \\"Daily ETL\\" execution 1001 finished: success",
  "occurred_at": "2026-05-20T02:00:00.000Z",
  "source": {
    "type": "n8n.execution",
    "id": "42:1001",
    "url": "https://n8n.example.com/workflow/42/executions/1001"
  },
  "metadata": {
    "execution_id": "1001",
    "execution_mode": "trigger",
    "execution_status": "success",
    "finished": true
  }
}`,
      },
      {
        label: 'Ingest',
        env: ['STATEWAVE_URL=http://localhost:8100', 'STATEWAVE_API_KEY=…'],
        cmd: `statewave-connectors sync n8n \\
  --workflows 42 \\
  --instance-url https://n8n.example.com \\
  --since 2026-01-01`,
        notes: [
          '--workflows is required. Pass ids from the n8n URL, or names.',
          'Add --exclude executions to ingest failures only.',
          'Node errors come from the execution’s run data, with no extra request.',
          'Cap a run with --max-items.',
        ],
      },
    ],
  },

  safety: [
    'The API key is only sent to your own n8n instance, as X-N8N-API-KEY.',
    'It only reads executions. Nothing in n8n changes.',
    '--workflows is required, so a first run never walks every execution.',
    '--dry-run shows every episode before anything is sent.',
  ],
  limits: [
    'Pull only. Live ingestion through n8n’s webhook node is planned.',
    'Node input and output snippets aren’t captured yet.',
    'One connector covering several n8n instances doesn’t correlate them yet.',
  ],

  close: {
    a: 'Know what your workflows did',
    grad: 'without opening n8n.',
    more: 'More workflow connectors',
    useCase: { label: 'Multi-agent memory', href: '/use-cases' },
  },
  related: ['zapier', 'jira'],
}
