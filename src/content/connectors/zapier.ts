import type { Connector } from './types'

/** packages/zapier/README.md (v0.1.0). A push-mode helper with no sync and no dry-run.
 *  Zap 12345 "Daily Slack digest" comes from the README; the week of runs is illustrative. */
export const zapier: Connector = {
  slug: 'zapier',
  name: 'Zapier',
  logo: 'zapier',
  group: 'Workflow',
  status: 'stable',
  modes: ['push'],
  pkg: '@statewavedev/connectors-zapier',
  source: 'https://github.com/smaramwbc/statewave-connectors/tree/main/packages/zapier',

  hero: {
    a: 'Zap runs,',
    grad: 'straight into memory.',
    sub: 'Add a Webhooks by Zapier step to the end of a zap, and each run becomes an episode under the subject you choose.',
    cmd: 'npm install @statewavedev/connectors-zapier @statewavedev/connectors-core',
    from: 'Webhooks by Zapier',
    to: 'workflow:zap:12345',
  },

  story: {
    heading: ['One zap,', 'from run to answer.'],
    lede: 'Zap 12345 posts a daily Slack digest. Here’s one run, from the zap to the day someone asks about it.',
    steps: [
      { title: 'Post the run', text: 'A Webhooks by Zapier → POST step at the end of the zap sends each run, straight to Statewave or through your own server.' },
      { title: 'File it under your subject', text: 'The subject is part of the body you write. This zap uses workflow:zap:12345.' },
      { title: 'Answer from the history', text: 'When someone asks whether the digest went out, your agent checks the runs and links to the zap.' },
    ],
    source: {
      label: 'Zap',
      id: '12345',
      title: 'Daily Slack digest',
      body: 'Runs every morning and posts a digest to Slack. Its last step posts the run to Statewave.',
      meta: [['Last step', 'Webhooks by Zapier → POST'], ['Payload', 'JSON']],
      status: 'On',
      via: 'Posted by a Webhooks by Zapier step',
    },
    episode: {
      kind: 'zapier.zap.executed',
      subject: 'workflow:zap:12345',
      text: 'Daily Slack digest ran successfully',
      url: 'zapier.com/app/zaps/12345',
      lane: 'workflow:zap:12345',
      laneNote: 'Daily Slack digest · 30 episodes',
    },
    answer: {
      asker: 'Kai · Ops',
      ask: 'Did the Slack digest go out today?',
      answer: 'Yes. Today’s run finished successfully, and the only failed run this week was Wednesday’s.',
      sources: ['zap 12345 · Thu', 'zap 12345 · Wed'],
      call: 'statewave_get_context("workflow:zap:12345")',
    },
  },

  reads: {
    eyebrow: 'What it records',
    heading: ['One episode per run,', 'success or failure.'],
    lede: 'Each run you post becomes one episode. With the helper, a status of success becomes zapier.zap.executed and anything else becomes zapier.zap.failed, with the original status kept in metadata.',
    title: 'Zap 12345 · Daily Slack digest',
    events: [
      { time: 'Mon', title: 'Run succeeded', text: 'Daily Slack digest ran successfully', kind: 'zapier.zap.executed' },
      { time: 'Tue', title: 'Run succeeded', text: 'Daily Slack digest ran successfully', kind: 'zapier.zap.executed' },
      { time: 'Wed', title: 'Run failed', text: 'Posted with status error. The original status is kept in metadata.zap_status.', kind: 'zapier.zap.failed' },
      { time: 'Thu', title: 'Run succeeded', text: 'Daily Slack digest ran successfully', kind: 'zapier.zap.executed' },
    ],
  },

  routing: {
    heading: ['You pick the subject.', 'It goes in the payload.'],
    lede: 'There’s no default subject. You know whether a zap is about a customer, a workflow or a team, so you set it in the body.',
    pick: 'Example zap',
    options: [
      { label: 'Daily Slack digest', detail: 'Internal automation · zap 12345', subject: 'workflow:zap:12345', why: 'Every run of this zap shares one memory, so “did it run?” is one lookup.' },
      { label: 'New Stripe charge → notify', detail: 'Runs for one customer', subject: 'customer:acme', why: 'Put the customer in the subject and each run joins that customer’s history.' },
    ],
    note: ['With the helper,', 'formatZapToEpisode()', 'can also override the subject and source URL in its second argument.'],
  },

  setup: {
    heading: ['Two ways to send.', 'Pick the one that fits your zap.'],
    steps: [
      { title: 'Add a POST step', text: 'At the end of your zap, add Webhooks by Zapier → POST with payload type JSON.' },
      { title: 'Direct: send it to Statewave', text: 'Use your instance’s /v1/episodes/batch as the URL, with Content-Type and X-API-Key headers.' },
      { title: 'Write the episode', text: 'Paste the JSON body and fill in Zap variables like {{zap_meta__id}} for the run.' },
      { title: 'Or: use the helper', text: 'Send the zap to your own server instead and build the episode with formatZapToEpisode(). Add validation, auth, redaction or batching before you forward it.' },
    ],
    env: [
      { name: 'STATEWAVE_URL + STATEWAVE_API_KEY', when: 'Helper', text: 'Read by your own handler when it forwards to Statewave' },
    ],
    terminal: [
      {
        label: 'Direct (no code)',
        env: [],
        cmd: 'POST https://your-statewave-instance/v1/episodes/batch',
        outputLabel: 'Webhooks by Zapier → POST, with this JSON body',
        output: `{
  "episodes": [
    {
      "subject": "workflow:zap:12345",
      "kind": "zapier.zap.executed",
      "text": "Daily Slack digest ran successfully",
      "occurred_at": "{{zap_meta__timestamp}}",
      "source": {
        "type": "zapier.zap_run",
        "id": "12345:{{zap_meta__id}}",
        "url": "https://zapier.com/app/zaps/12345"
      },
      "metadata": {
        "zap_id": "12345",
        "zap_name": "Daily Slack digest",
        "run_id": "{{zap_meta__id}}"
      },
      "idempotency_key": "zapier:12345:{{zap_meta__id}}:zap.executed"
    }
  ]
}`,
        notes: [
          'Content-Type: application/json',
          'X-API-Key: <your Statewave API key>',
        ],
      },
      {
        label: 'Helper',
        env: [],
        cmd: 'npm install @statewavedev/connectors-zapier @statewavedev/connectors-core',
        notes: [
          'formatZapToEpisode() builds the idempotency key from zap_id and run_id.',
          'A status of success becomes zapier.zap.executed. Anything else becomes zapier.zap.failed.',
          'The original status is kept in metadata.zap_status.',
          'A second argument overrides the subject and source URL.',
        ],
      },
    ],
  },

  safetyHeading: ['It sends what you map.', 'Nothing else.'],
  safety: [
    'It never reads Zap History. A zap sends only what you put in its body.',
    'No subject is guessed. You set it on every run.',
    'With the helper, you can check auth and redact on your own server before forwarding.',
    'formatZapToEpisode() is pure. It builds the episode and sends nothing.',
  ],
  limits: [
    'Zapier has no public API for run history, so there’s no pull mode, no sync and no --dry-run.',
    'The direct path sends one episode per zap run.',
    'A Send Episode to Statewave action in the Zapier directory is planned for a later release.',
  ],

  close: {
    a: 'One POST at the end of a zap,',
    grad: 'and every run is remembered.',
    more: 'More workflow connectors',
    useCase: { label: 'Multi-agent memory', href: '/use-cases' },
  },
  related: ['n8n', 'jira'],
}
