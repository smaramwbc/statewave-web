/**
 * POST /api/demo-seed
 *
 * Copies episodes from a showcase subject (e.g. `demo-support-agent`) into the
 * current visitor's subject and runs compile, so the visitor lands in the demo
 * with rich, interactable memory instead of an empty subject.
 *
 * Policy:
 *  - Only seeds when the visitor's subject is empty. Re-clicking a different
 *    persona later does NOT overwrite — the user must reset first. This keeps
 *    a single coherent memory pool per visitor.
 *  - Caps copied episodes to keep within the per-visitor episode budget.
 *  - Each copied episode carries metadata pointing back to its source so the
 *    provenance story stays honest.
 */

import {
  buildSetCookie,
  compileMemories,
  fetchTimeline,
  json,
  newVisitorId,
  parseDemoVisitor,
  subjectFor,
  writeEpisode,
} from './_demo'

export const config = { runtime: 'edge' }

const SEED_EPISODE_LIMIT = 24

const SEED_SOURCES: Record<string, string> = {
  'support-agent': 'demo-support-agent',
  'coding-assistant': 'demo-coding-assistant',
  'sales-copilot': 'demo-sales-copilot',
  'devops-agent': 'demo-devops-agent',
  'research-assistant': 'demo-research-assistant',
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return json({}, { status: 200 })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, { status: 405 })

  let body: { persona?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const persona = (body.persona ?? '').trim()
  const sourceSubject = SEED_SOURCES[persona]
  if (!sourceSubject) {
    return json(
      { error: `Unknown persona "${persona}". Expected one of: ${Object.keys(SEED_SOURCES).join(', ')}` },
      { status: 400 },
    )
  }

  const existing = parseDemoVisitor(req.headers.get('cookie'))
  let visitorUuid = existing
  let setCookie: string | null = null
  if (!visitorUuid) {
    visitorUuid = newVisitorId()
    setCookie = buildSetCookie(visitorUuid)
  }
  const visitorSubject = subjectFor(visitorUuid)

  // Don't reseed if the visitor already has chat / memory. Reset is the
  // explicit way to start over.
  const before = await fetchTimeline(visitorSubject)
  if (before.episodes.length > 0) {
    return json(
      {
        subjectId: visitorSubject,
        seeded: false,
        reason: 'already-populated',
        episodeCount: before.episodes.length,
      },
      { setCookie },
    )
  }

  const source = await fetchTimeline(sourceSubject)
  const sourceEpisodes = source.episodes.slice(0, SEED_EPISODE_LIMIT)
  if (sourceEpisodes.length === 0) {
    return json(
      { subjectId: visitorSubject, seeded: false, reason: 'no-source-episodes' },
      { setCookie },
    )
  }

  // Episodes are independent and idempotent appends — write them in parallel.
  // Crucially we preserve the original payload shape, source, and type so the
  // server's compiler sees what the showcase saw and can extract memories.
  // Showcase shapes include {channel,content,priority}, {action,content},
  // {messages:[...]} — passing them verbatim is what makes compile productive.
  const writes = await Promise.all(
    sourceEpisodes.map((ep) =>
      writeEpisode(
        visitorSubject,
        ep.payload ?? {},
        { seeded_from: sourceSubject, original_episode_id: ep.id, persona },
        ep.source ?? 'demo-web-seed',
        ep.type ?? 'seeded',
      ),
    ),
  )
  const copied = writes.filter(Boolean).length
  if (copied > 0) await compileMemories(visitorSubject)

  const after = await fetchTimeline(visitorSubject)
  return json(
    {
      subjectId: visitorSubject,
      seeded: true,
      seedSource: sourceSubject,
      persona,
      copied,
      episodeCount: after.episodes.length,
      memories: after.memories
        .map((m) => ({
          id: m.id,
          content: m.content || m.summary || '',
          kind: m.kind ?? 'fact',
          confidence: m.confidence ?? 0.8,
        }))
        .filter((m) => m.content),
    },
    { setCookie },
  )
}
