/**
 * GET /api/demo-state
 *
 * Returns the visitor's Statewave-backed demo state. Issues a first-party
 * HttpOnly cookie on first visit. The visitor's chat history is restored
 * from real episodes on the server, not from browser storage.
 */

import {
  DOCS_SUBJECT_ID,
  buildSetCookie,
  fetchTimeline,
  isDemoPersona,
  isDocsSharedPersona,
  json,
  newVisitorId,
  parseDemoVisitor,
  subjectFor,
} from './_demo'

export const config = { runtime: 'edge' }

interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return json({}, { status: 200 })
  if (req.method !== 'GET') return json({ error: 'Method not allowed' }, { status: 405 })

  // Visitor-memory personas resolve to per-visitor subjects. Docs-shared
  // personas resolve to a fixed shared subject (the official docs pack).
  // Without a persona we return the bare visitor subject (legacy callers).
  const personaParam = new URL(req.url).searchParams.get('persona')
  const visitorPersona = isDemoPersona(personaParam) ? personaParam : null
  const docsPersona = isDocsSharedPersona(personaParam) ? personaParam : null

  const existing = parseDemoVisitor(req.headers.get('cookie'))
  let visitorUuid: string
  let setCookie: string | null = null
  if (existing) {
    visitorUuid = existing
  } else {
    visitorUuid = newVisitorId()
    setCookie = buildSetCookie(visitorUuid)
  }

  // Docs-shared persona: read counts/memories from the shared docs subject so
  // the inspector shows real grounded knowledge. Don't rehydrate "chat history"
  // from docs episodes — those are doc sections, not visitor turns.
  if (docsPersona) {
    const { memories } = await fetchTimeline(DOCS_SUBJECT_ID)
    return json(
      {
        subjectId: DOCS_SUBJECT_ID,
        persona: docsPersona,
        isNew: false,
        // No visitor-driven chat for the docs persona — start each session fresh.
        episodes: [] as ChatTurn[],
        // Surface the top docs-derived memories so the inspector reflects what
        // the LLM actually has access to. Capped to keep payload small.
        memories: memories
          .slice(0, 12)
          .map((m) => ({
            id: m.id,
            content: m.content || m.summary || '',
            kind: m.kind ?? 'fact',
            confidence: m.confidence ?? 0.8,
          }))
          .filter((m) => m.content),
        // Visitor-driven episode count is always 0 for this persona — the docs
        // are not a per-visitor pool. Keeping the field at 0 prevents the
        // inspector from claiming "178 episodes for your session".
        episodeCount: 0,
      },
      { setCookie },
    )
  }

  const persona = visitorPersona
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
