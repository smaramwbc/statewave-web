/**
 * POST /api/demo-seed
 *
 * Imports a bundled starter pack (e.g. `demo-support-agent`) into the current
 * visitor's subject so the visitor lands in the demo with rich, interactable
 * memory instead of an empty subject.
 *
 * Policy:
 *  - Only seeds when the visitor's subject is empty. Re-clicking a different
 *    persona later does NOT overwrite — the user must reset first. This keeps
 *    a single coherent memory pool per visitor.
 *  - Each persona is mapped to its bundled starter pack, which already
 *    contains compiled memories with provenance back to the source episodes.
 *    The import path remaps `source_episode_ids` to the freshly-minted episode
 *    UUIDs so provenance survives end-to-end.
 *  - Original episode `created_at` timestamps are preserved by the import
 *    path, so the visitor sees the showcase story arc unfolding across
 *    realistic dates (months apart) instead of every episode looking like it
 *    happened the moment they clicked.
 *
 * Why a starter-pack import (and not the previous write-episodes-then-compile):
 *   The canonical demo subjects already ship with compiled memories baked into
 *   the pack files. Re-running `/v1/memories/compile` under the LLM compiler
 *   for every visitor regenerated the same memories from scratch — ~25–45s of
 *   wasted LLM time per click. Importing the pack is a single admin call that
 *   copies episodes + memories with id remapping in well under 2s, and yields
 *   memory the visitor can inspect on the very first turn.
 */

import {
  buildSetCookie,
  fetchTimeline,
  importStarterPack,
  isDocsSharedPersona,
  json,
  newVisitorId,
  parseDemoVisitor,
  subjectFor,
} from '../statewave-client.js'

/**
 * Personas the seed endpoint accepts but treats as no-op.
 *
 * The docs-shared persona (`statewave-support`) has no curated showcase
 * subject to copy from — its grounding comes from the shared docs pack at
 * answer time, not from a visitor-side episode copy. The visitor's memory
 * subject naturally fills as they chat, so seeding is unnecessary. We
 * accept the request and return success so the client's seed-on-first-open
 * flow stays generic across persona kinds.
 */
function isNoSeedPersona(persona: string): boolean {
  return isDocsSharedPersona(persona)
}


/**
 * Persona id → starter pack id. The pack id is also the canonical demo
 * subject id used by the homepage hero — keeping them aligned means the
 * showcase content stays in one place (`statewave/server/starter_packs/`).
 */
const SEED_PACKS: Record<string, string> = {
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
    body = (await req.json()) as { persona?: string }
  } catch {
    return json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const persona = (body.persona ?? '').trim()

  const existing = parseDemoVisitor(req.headers.get('cookie'))
  let visitorUuid = existing
  let setCookie: string | null = null
  if (!visitorUuid) {
    visitorUuid = newVisitorId()
    setCookie = buildSetCookie(visitorUuid)
  }

  if (isNoSeedPersona(persona)) {
    // Issue the cookie so the visitor identity is established, but don't
    // copy any episodes — there's nothing to seed for this persona.
    return json(
      {
        subjectId: subjectFor(visitorUuid, persona),
        seeded: false,
        reason: 'no-seed-needed',
        persona,
      },
      { setCookie },
    )
  }

  const packId = SEED_PACKS[persona]
  if (!packId) {
    return json(
      { error: `Unknown persona "${persona}". Expected one of: ${Object.keys(SEED_PACKS).join(', ')}` },
      { status: 400 },
    )
  }

  // Seed into the persona-scoped subject — that way switching personas later
  // loads its own memory pool, just like clicking the matching particle.
  const visitorSubject = subjectFor(visitorUuid, persona)

  // Don't reseed if the visitor already has chat / memory. Reset is the
  // explicit way to start over. This pre-check also short-circuits the
  // import call's `conflict_strategy: 'cancel'` 409 with a friendlier
  // response shape.
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

  const result = await importStarterPack(packId, visitorSubject)
  if (!result) {
    return json(
      { subjectId: visitorSubject, seeded: false, reason: 'import-failed', persona, packId },
      { setCookie, status: 502 },
    )
  }

  // Refresh once after import so the response carries the timeline view the
  // client will render — same shape the previous seed flow returned, so the
  // caller's parsing path doesn't need to change.
  const after = await fetchTimeline(visitorSubject)
  return json(
    {
      subjectId: visitorSubject,
      seeded: true,
      seedSource: packId,
      persona,
      copied: result.imported_episodes,
      compiledMemories: result.imported_memories,
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
