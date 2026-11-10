/** Content for one /connectors/:slug page. One template renders every connector from this shape.
 *
 * Facts (kinds, subjects, flags, env vars, limits) come from the connector's README in
 * statewave-connectors. The story (the ticket, thread or PR the page follows) is illustrative,
 * and should stay plausible for that connector. */

export type Group = 'Code' | 'Team & communication' | 'Support' | 'Knowledge' | 'Workflow' | 'MCP' | 'Databases'

/** A two-line heading: the second line renders dimmed. */
export type Heading = [string, string]

export interface Connector {
  slug: string
  name: string
  /** File name in /images/home/v8/logos (without .svg), or null for a letter tile. */
  logo: string | null
  /** Icon used when there is no logo. Defaults to the name's first letter. */
  glyph?: 'database'
  group: Group
  status: 'stable' | 'preview'
  /** pull = `statewave-connectors sync`, push = a real-time receiver. Empty for the MCP server. */
  modes: Array<'pull' | 'push'>
  pkg: string
  source: string
  example?: string

  hero: {
    a: string
    grad: string
    sub: string
    cmd: string
    /** Label under the connector tile, e.g. acme.zendesk.com */
    from: string
    /** Label under the Statewave tile: the subject the episodes land in. */
    to: string
  }

  /** Section 2: one item followed through three moments. */
  story: {
    heading: Heading
    lede: string
    steps: [Step, Step, Step]
    source: {
      label: string
      id: string
      title: string
      body: string
      meta: Array<[string, string]>
      status?: string
      via: string
    }
    episode: { kind: string; subject: string; text: string; url: string; lane: string; laneNote: string }
    answer: { asker: string; ask: string; answer: string; sources: string[]; call: string }
  }

  /** Section 3: what the connector reads, on one example timeline. */
  reads: {
    eyebrow?: string
    heading: Heading
    lede: string
    /** Only when some events are opt-in: a switch between the default and everything. */
    toggle?: { off: string; on: string; offFlag: string; onFlag: string }
    title: string
    /** Counter label, singular and plural. Defaults to episode / episodes. */
    unit?: [string, string]
    events: Array<{ time: string; who?: string; title: string; text: string; kind: string; optIn?: boolean }>
  }

  /** Section 4: where memory goes. One to three examples. */
  routing: {
    heading: Heading
    lede: string
    pick: string
    options: Array<{ label: string; detail: string; subject: string; why: string }>
    /** Rendered as: before <code>code</code> after */
    note?: [string, string, string]
  }

  setup: {
    /** Defaults to: Preview first. / Nothing is sent until you say so. */
    heading?: Heading
    steps: Array<{ title: string; text: string }>
    env: Array<{ name: string; when: string; text: string }>
    terminal: Array<{ label: string; env: string[]; cmd: string; output?: string; outputLabel?: string; notes?: string[] }>
  }

  /** Up to four short statements, each about what the connector won't do. */
  safety: string[]
  /** Defaults to: It reads what you allow. / Nothing else. */
  safetyHeading?: Heading
  limits: string[]

  close: { a: string; grad: string; more: string; useCase?: { label: string; href: string } }
  related: string[]
}

export interface Step { title: string; text: string }
