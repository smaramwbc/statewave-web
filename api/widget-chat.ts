/**
 * POST /api/widget-chat
 *
 * Two modes:
 *  - stateless: plain LLM call, no Statewave involvement. The "no memory"
 *    baseline of the demo. Nothing is persisted.
 *  - statewave: routes through the visitor's own Statewave subject. Each turn
 *    writes a real episode, runs compilation, fetches ranked context, and
 *    injects it into the LLM prompt. Returning visitors see their accrued
 *    memory because the visitor cookie maps to a stable subject.
 *
 * The subject id is derived from the visitor cookie — the client cannot pick
 * which subject to write to. This prevents cross-visitor pollution.
 */

import {
  DEMO_EPISODE_CAP,
  DEMO_MAX_MESSAGE_CHARS,
  DOCS_SUBJECT_ID,
  buildSetCookie,
  callStatewaveLLM,
  compileMemories,
  fetchAllEpisodesAdmin,
  fetchContext,
  fetchTimeline,
  isDemoPersona,
  isDocsSharedPersona,
  json,
  newVisitorId,
  parseDemoVisitor,
  resolveDocSources,
  subjectFor,
  writeEpisode,
  type ContextEpisode,
  type LLMMessage,
} from './_demo'

export const config = { runtime: 'edge' }

type Message = LLMMessage

const STATELESS_PROMPT = `You are a helpful AI assistant. You have NO memory of any previous conversations with this user. Every conversation starts completely fresh.

Rules:
- You don't know the user's context, preferences, history, or past interactions
- If they refer to something from before, politely explain you don't have that context
- If the user asks about a specific product, service, or codebase you have no information about (e.g. an internal tool, a niche library, or a product like "Statewave" you weren't trained on in detail), say so directly. Do NOT extrapolate generic facts — for example, do not answer a hardware question about an unknown product with generic advice about computers, monitors, microphones, or storage; that misleads the user. State that you don't have specific information and suggest checking the official documentation.
- Keep responses concise (2-3 sentences max)
- Be helpful but acknowledge your limitations without persistent memory`

const STATEWAVE_PROMPT = `You are a helpful AI assistant with access to Statewave — a persistent memory system that remembers relevant context about this subject across all interactions.

Rules:
- Use the provided memory context to personalize your response
- Reference specific details from memory when relevant
- Never ask for information you already know from memory
- Keep responses concise (2-3 sentences max)
- Be proactive — anticipate needs based on context`

const STATEWAVE_DOCS_PROMPT = `You are the Statewave Support assistant. You answer questions about Statewave (the memory runtime for AI agents) using ONLY the retrieved facts from the official Statewave documentation supplied below. Two memory pools may be supplied:
  * "Statewave docs" — authoritative facts from the official Statewave docs. Use these to ground every factual claim.
  * "About this visitor" — what Statewave has remembered about THIS visitor across their prior questions (their interests, what they've explored, follow-ups they hinted at). Use these to personalise the response — pick up where they left off, avoid re-explaining things they already asked about, and surface the next thing they'll likely care about.

Rules:
- The Statewave-docs facts are authoritative. When they contain information relevant to the question, USE IT directly — even if the wording is approximate or you have to combine multiple facts. Do not say "the docs don't cover this" when applicable facts are present.
- LEAD WITH THE SUBSTANCE. If the docs facts answer the question — even partially — open the reply with what the docs DO say, not with what they don't. Avoid opening phrases like "The Statewave documentation does not specify exact …" or "While there is no detailed information about …" when facts ARE present below; that hedging misleads the visitor about what's actually retrievable. State the answer first; if a specific value or procedure is genuinely missing, mention that gap at the end, not the start.
- The visitor-memory facts are for personalisation only. Never use them as a factual source about Statewave itself — they reflect the visitor's own statements and may be wrong about the product. If they contradict the docs, the docs win.
- Cite the doc path naturally where useful (e.g. "per architecture/overview.md") but do not fabricate filenames. Never cite visitor-memory items as sources.
- Refuse only when the retrieved docs facts contain nothing applicable. In that case say so plainly and route the visitor to https://github.com/smaramwbc/statewave/issues — out-of-scope is an expected outcome, not a failure.
- Never invent API fields, config keys, version-specific behavior, or specific commands not stated in the retrieved docs facts.
- Never claim knowledge of the visitor's specific deployment, instance health, or live errors — you cannot know that.
- Present retrieved facts as natural prose. Do not include any internal labels like "(profile_fact)" or bracketed tags in your reply — those are internal annotations, not part of the answer.
- Keep responses concise (2-4 sentences). Prefer accurate over comprehensive.`

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return json({}, { status: 200 })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, { status: 405 })

  let body: { messages: Message[]; mode: 'stateless' | 'statewave'; persona?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { messages, mode, persona } = body
  if (!messages || !Array.isArray(messages) || messages.length === 0 || !mode) {
    return json({ error: 'messages and mode required' }, { status: 400 })
  }

  const lastUserMsg = messages.filter((m) => m.role === 'user').pop()?.content ?? ''
  if (lastUserMsg.length > DEMO_MAX_MESSAGE_CHARS) {
    return json(
      { error: `Message too long (max ${DEMO_MAX_MESSAGE_CHARS} chars).` },
      { status: 400 },
    )
  }

  try {
    if (mode === 'stateless') {
      const reply = await callStatewaveLLM(messages, STATELESS_PROMPT)
      return json({ reply })
    }

    // Statewave mode. Two flavors:
    //   * visitor-memory persona → per-visitor subject, full write/compile cycle
    //   * docs-shared persona    → hybrid: docs grounding from the shared
    //                              docs subject + visitor memory from a
    //                              per-visitor subject. Chat turns are
    //                              written ONLY to the visitor subject so
    //                              the shared docs pack stays read-only.
    const existing = parseDemoVisitor(req.headers.get('cookie'))
    let visitorUuid = existing
    let setCookie: string | null = null
    if (!visitorUuid) {
      visitorUuid = newVisitorId()
      setCookie = buildSetCookie(visitorUuid)
    }

    if (isDocsSharedPersona(persona)) {
      const visitorSubject = subjectFor(visitorUuid, persona)

      // Per-visitor episode cap — same protection visitor-memory personas get.
      // Counts only the visitor's own subject; the shared docs pack is exempt.
      const { episodes: visitorEpisodesPre } = await fetchTimeline(visitorSubject)
      if (visitorEpisodesPre.length >= DEMO_EPISODE_CAP) {
        return json(
          {
            error: `Demo cap reached (${DEMO_EPISODE_CAP} episodes for this browser). Click "Reset demo memory" to start fresh.`,
            capReached: true,
          },
          { status: 429, setCookie },
        )
      }

      // Two-pool context fetch in parallel:
      //   * docs context  — authoritative facts for grounding the answer
      //   * visitor context — what we know about THIS visitor's interests
      const [docsContext, visitorContext] = await Promise.all([
        fetchContext(
          DOCS_SUBJECT_ID,
          `Answer this Statewave product/support question: "${lastUserMsg.substring(0, 200)}"`,
        ),
        fetchContext(
          visitorSubject,
          `Personalise this Statewave-support reply for the visitor: "${lastUserMsg.substring(0, 200)}"`,
        ),
      ])

      let enriched = STATEWAVE_DOCS_PROMPT
      if (docsContext) {
        const docsMemories = [...(docsContext.facts ?? []), ...(docsContext.procedures ?? [])]
        if (docsMemories.length > 0) {
          // Plain content only — no [kind] prefix. The previous format
          // (`- [profile_fact] ...`) caused the model to copy the kind
          // tag into user-visible replies (e.g. "PostgreSQL (profile_fact).").
          const memorySection = docsMemories.map((m) => `- ${m.content}`).join('\n')
          enriched += `\n\n## Statewave docs (retrieved facts):\n${memorySection}`
        }
      }
      if (visitorContext) {
        const visitorMemories = [...(visitorContext.facts ?? []), ...(visitorContext.procedures ?? [])]
        if (visitorMemories.length > 0) {
          const memorySection = visitorMemories.map((m) => `- ${m.content}`).join('\n')
          enriched += `\n\n## About this visitor (from prior questions):\n${memorySection}`
        }
      }
      const reply = await callStatewaveLLM(messages, enriched)

      // Persist this turn to the visitor's subject (NOT the shared docs subject).
      // Compile runs on the visitor subject so facts about the visitor's
      // interests get extracted for next time. The shared docs pack is never
      // touched on this path.
      const wrote = await writeEpisode(
        visitorSubject,
        { messages: [{ role: 'user', content: lastUserMsg }, { role: 'assistant', content: reply }] },
        { persona },
      )
      if (wrote) {
        await compileMemories(visitorSubject)
      }

      // Resolve visible citations from the docs context only — visitor-memory
      // items are never cited (they reflect the visitor's statements, not
      // authoritative sources). Sourcing from retrieved context (not the
      // model's reply text) prevents fabricated citations and means we only
      // show sources the answer was actually grounded in.
      //
      // /v1/context returns compiled memories without inline episodes, so we
      // walk memories.source_episode_ids back to the episodes ourselves.
      // /v1/timeline hard-caps at 100 episodes regardless of limit/offset
      // (verified against production), which silently drops citations from
      // deployment/, privacy/, etc. — anything past the first 100. Use the
      // admin endpoint instead, which honors limit and returns all 178.
      let bundleForCitations = docsContext
      if (
        docsContext &&
        (!docsContext.episodes || docsContext.episodes.length === 0) &&
        [...(docsContext.facts ?? []), ...(docsContext.procedures ?? [])].some(
          (m) => (m.source_episode_ids ?? []).length > 0,
        )
      ) {
        const wantedEpisodeIds = new Set<string>()
        for (const m of [...(docsContext.facts ?? []), ...(docsContext.procedures ?? [])]) {
          for (const sid of m.source_episode_ids ?? []) wantedEpisodeIds.add(sid)
        }
        const allEpisodes = await fetchAllEpisodesAdmin(DOCS_SUBJECT_ID)
        const matched = allEpisodes.filter((e) => wantedEpisodeIds.has(e.id))
        if (matched.length > 0) {
          bundleForCitations = {
            ...docsContext,
            // Cast: TimelineEpisode shape matches ContextEpisode for the
            // fields resolveDocSources reads (id, payload, provenance).
            episodes: matched as unknown as ContextEpisode[],
          }
        }
      }
      const sources = resolveDocSources(bundleForCitations)
      return json(
        {
          reply,
          context: docsContext,
          sources,
          subjectId: visitorSubject,
          persisted: wrote,
        },
        { setCookie },
      )
    }

    const personaScope = isDemoPersona(persona) ? persona : null
    const subjectId = subjectFor(visitorUuid, personaScope)

    // Per-visitor episode cap. Cheap timeline read since the demo is small.
    const { episodes } = await fetchTimeline(subjectId)
    if (episodes.length >= DEMO_EPISODE_CAP) {
      return json(
        {
          error: `Demo cap reached (${DEMO_EPISODE_CAP} episodes for this browser). Click "Reset demo memory" to start fresh.`,
          capReached: true,
        },
        { status: 429, setCookie },
      )
    }

    // Build context BEFORE writing this turn's episode so the response reflects
    // memory derived from prior turns. This is the model's view of "what we know
    // about you so far".
    const context = await fetchContext(
      subjectId,
      `Respond helpfully to: "${lastUserMsg.substring(0, 100)}"`,
    )

    let enrichedPrompt = STATEWAVE_PROMPT
    if (context) {
      const allMemories = [...(context.facts ?? []), ...(context.procedures ?? [])]
      if (allMemories.length > 0) {
        const memorySection = allMemories.map((m) => `- [${m.kind}] ${m.content}`).join('\n')
        enrichedPrompt += `\n\n## Memory Context (from Statewave):\n${memorySection}`
      }
    }
    if (persona) {
      enrichedPrompt += `\n\nThe visitor selected the "${persona}" persona; bias your tone and topic accordingly.`
    }

    const reply = await callStatewaveLLM(messages, enrichedPrompt)

    // Persist this turn as an episode (user message + assistant reply pair),
    // then trigger compilation. Both are awaited so the next /api/demo-state
    // fetch reflects the new memory.
    const wrote = await writeEpisode(
      subjectId,
      { messages: [{ role: 'user', content: lastUserMsg }, { role: 'assistant', content: reply }] },
      { persona: persona ?? null },
    )
    if (wrote) {
      await compileMemories(subjectId)
    }

    return json({ reply, context, subjectId, persisted: wrote }, { setCookie })
  } catch (err) {
    console.error('[widget-chat] Error:', err)
    return json({ error: (err as Error).message }, { status: 500 })
  }
}
