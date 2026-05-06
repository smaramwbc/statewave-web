/**
 * GET /api/demo-state
 *
 * Returns the visitor's Statewave-backed demo state. Issues a first-party
 * HttpOnly cookie on first visit. The visitor's chat history is restored
 * from real episodes on the server, not from browser storage.
 */

import {
  buildSetCookie,
  fetchTimeline,
  isKnownPersona,
  json,
  newVisitorId,
  parseDemoVisitor,
  subjectFor,
} from '../statewave-client.js'


interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return json({}, { status: 200 })
  if (req.method !== 'GET') return json({ error: 'Method not allowed' }, { status: 405 })

  // Every recognised persona — visitor-memory and docs-shared alike — gets
  // its own per-visitor subject. The docs-shared persona's grounding pool
  // (the shared docs pack) is read by the chat handler, not surfaced here:
  // the inspector reflects what THIS visitor's memory looks like, not the
  // contents of the shared knowledge base.
  const personaParam = new URL(req.url).searchParams.get('persona')
  const persona = isKnownPersona(personaParam) ? personaParam : null

  const existing = parseDemoVisitor(req.headers.get('cookie'))
  let visitorUuid: string
  let setCookie: string | null = null
  if (existing) {
    visitorUuid = existing
  } else {
    visitorUuid = newVisitorId()
    setCookie = buildSetCookie(visitorUuid)
  }

  const subjectId = subjectFor(visitorUuid, persona)

  // For brand-new visitors there is nothing to fetch — return empty state
  // immediately so the very first visit is fast.
  if (!existing) {
    return json(
      {
        subjectId,
        persona,
        isNew: true,
        episodes: [] as ChatTurn[],
        memories: [],
        episodeCount: 0,
      },
      { setCookie },
    )
  }

  const { episodes, memories } = await fetchTimeline(subjectId)

  // Rehydrate the chat column from real conversation turns only — episodes
  // written by /api/widget-chat with source=demo-web-chat. Seeded showcase
  // episodes have other sources (support-chat, etc.) and various payload
  // shapes; their value is in the compiled memories shown in the inspector,
  // not as fake chat bubbles.
  const chatTurns: ChatTurn[] = []
  for (const ep of episodes.slice(-30)) {
    if (ep.source !== 'demo-web-chat') continue
    const ts = ep.created_at ? Date.parse(ep.created_at) : Date.now()
    const payload = ep.payload as { messages?: Array<{ role: string; content: string }> } | undefined
    const msgs = payload?.messages
    if (!Array.isArray(msgs)) continue
    for (const m of msgs) {
      if (m.role !== 'user' && m.role !== 'assistant') continue
      chatTurns.push({ role: m.role, content: m.content, timestamp: ts })
    }
  }

  return json(
    {
      subjectId,
      persona,
      isNew: false,
      episodes: chatTurns,
      memories: memories.map((m) => ({
        id: m.id,
        content: m.content || m.summary || '',
        kind: m.kind ?? 'fact',
        confidence: m.confidence ?? 0.8,
      })).filter((m) => m.content),
      episodeCount: episodes.length,
    },
    { setCookie },
  )
}
