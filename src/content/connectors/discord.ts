import type { Connector } from './types'

/** packages/discord/README.md (v0.1.0). The CI flake thread is illustrative, built on the
 *  README's example episode (community:987654321, ada). */
export const discord: Connector = {
  slug: 'discord',
  name: 'Discord',
  logo: 'discord',
  group: 'Team & communication',
  status: 'stable',
  modes: ['pull'],
  pkg: '@statewavedev/connectors-discord',
  source: 'https://github.com/smaramwbc/statewave-connectors/tree/main/packages/discord',
  example: 'https://github.com/smaramwbc/statewave-connectors/tree/main/examples/discord-community-memory',

  hero: {
    a: 'Every Discord thread,',
    grad: 'remembered by the community.',
    sub: 'Messages and thread replies from the channels you pick become one memory per server, so your bot can answer the questions your community already solved.',
    cmd: 'statewave-connectors sync discord --guild 987654321 --channels general --dry-run',
    from: 'server 987654321',
    to: 'community:987654321',
  },

  story: {
    heading: ['One question,', 'answered for the next person too.'],
    lede: 'Ada asks about a flaky macOS build, and the community works it out in a thread. Here’s how that thread helps whoever hits it next.',
    steps: [
      { title: 'Read the thread', text: 'The connector pages back through the channels you list and picks up each message and thread reply.' },
      { title: 'File it under the server', text: 'Each message becomes an episode in the server’s memory. Everything from Acme’s server lands in community:987654321.' },
      { title: 'Answer the next person', text: 'A month later someone hits the same flake. Your bot recalls the fix and links to the thread.' },
    ],
    source: {
      label: 'Message',
      id: '#general',
      title: 'ada',
      body: 'anyone seen the macos CI flake?',
      meta: [['Server', 'Acme community'], ['Channel', '#general']],
      status: '3 replies',
      via: 'Pulled by statewave-connectors sync',
    },
    episode: {
      kind: 'discord.message.posted',
      subject: 'community:987654321',
      text: 'ada: anyone seen the macos CI flake?',
      url: 'discord.com/channels/987654321/111222/333444',
      lane: 'community:987654321',
      laneNote: 'Acme community · 1,240 episodes',
    },
    answer: {
      asker: 'Sam · new member',
      ask: 'macOS CI keeps failing at random. Is this a known issue?',
      answer: 'Yes, it came up in May. The failures started after a runner image update, and pinning the previous macOS image fixed them.',
      sources: ['#general · 09:12', 'thread reply · 09:47'],
      call: 'statewave_get_context("community:987654321")',
    },
  },

  reads: {
    heading: ['Messages and thread replies,', 'from the channels you name.'],
    lede: 'Each message becomes one episode. The connector pages back through each channel’s history until it reaches --since or --max-items.',
    title: 'CI flake thread · #general',
    events: [
      { time: '09:12', who: 'ada', title: 'Message in #general', text: 'anyone seen the macos CI flake?', kind: 'discord.message.posted' },
      { time: '09:20', who: 'grace', title: 'Thread reply', text: 'Same here. It started after the runner image update.', kind: 'discord.thread.replied' },
      { time: '09:47', who: 'lin', title: 'Thread reply', text: 'Pinning the previous macOS image fixed it for us.', kind: 'discord.thread.replied' },
      { time: '10:03', who: 'ada', title: 'Thread reply', text: 'Confirmed, green again. Thanks!', kind: 'discord.thread.replied' },
    ],
  },

  routing: {
    heading: ['One memory per server.', 'Every channel feeds it.'],
    lede: 'Episodes are filed under the server’s id, so a question asked in #help can be answered from a thread in #general.',
    pick: 'Example server',
    options: [
      { label: 'Acme community', detail: 'Server 987654321 · #general, #help', subject: 'community:987654321', why: 'Every channel you list on this server shares one memory.' },
      { label: 'Another server', detail: 'Server 1100000000000000000', subject: 'community:1100000000000000000', why: 'Each server keeps its own memory. --guild takes one server per sync.' },
    ],
    note: ['Prefer your own key?', '--subject community:acme', 'replaces the default community:<guild_id>.'],
  },

  setup: {
    steps: [
      { title: 'Create a bot', text: 'Add an application and a bot in the Discord developer portal. Turn on Message Content Intent so it can read message text.' },
      { title: 'Invite it to your server', text: 'Generate an invite with the bot scope and View Channels, Read Message History and Read Public Threads. Add Read Private Threads if you need them.' },
      { title: 'Set your token', text: 'Export the bot token as DISCORD_BOT_TOKEN. For the server id, turn on Developer Mode and right-click the server icon.' },
      { title: 'Preview with --dry-run', text: 'Name the server and its channels. The connector maps each message, then prints the episodes. Nothing is sent.' },
      { title: 'Ingest', text: 'Point STATEWAVE_URL at your instance and run the same command without --dry-run.' },
    ],
    env: [
      { name: 'DISCORD_BOT_TOKEN', when: 'Always', text: 'The bot token from the Bot tab' },
      { name: 'STATEWAVE_URL + STATEWAVE_API_KEY', when: 'To ingest', text: 'Your Statewave instance' },
    ],
    terminal: [
      {
        label: 'Dry-run',
        env: ['DISCORD_BOT_TOKEN=…'],
        cmd: 'statewave-connectors sync discord --guild 987654321 --channels general --dry-run --json',
        outputLabel: 'Prints the episodes. Sends nothing.',
        output: `{
  "subject": "community:987654321",
  "kind": "discord.message.posted",
  "text": "ada: anyone seen the macos CI flake?",
  "occurred_at": "2026-05-20T09:12:00.000Z",
  "source": {
    "type": "discord.message",
    "id": "111222:333444",
    "url": "https://discord.com/channels/987654321/111222/333444"
  },
  "metadata": {
    "author_id": "555666",
    "author_label": "ada",
    "parent_id": null
  }
}`,
      },
      {
        label: 'Ingest',
        env: ['STATEWAVE_URL=http://localhost:8100', 'STATEWAVE_API_KEY=…'],
        cmd: 'statewave-connectors sync discord --guild 987654321 --channels general,help --since 2026-01-01',
        notes: [
          '--channels takes ids or names. The bot must already be in the server.',
          'Cap a run with --max-items. Paging stops once it’s reached.',
        ],
      },
    ],
  },

  safety: [
    'Bot token only. The connector refuses user tokens, which break Discord’s terms.',
    'The token is only sent to discord.com/api/v10.',
    'It reads only the channels you name with --channels.',
    'Direct messages are out of scope.',
  ],
  limits: [
    'Pull only. Real-time ingestion through the Gateway is on the roadmap.',
    'The bot needs Message Content Intent to read message text.',
    'Not yet: forum channels, reactions and pinned messages.',
  ],

  close: {
    a: 'Give your community bot',
    grad: 'a memory of every answer.',
    more: 'More team connectors',
    useCase: { label: 'Support agent use case', href: '/use-cases' },
  },
  related: ['slack', 'gmail'],
}
