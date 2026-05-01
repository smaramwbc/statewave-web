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
  buildSetCookie,
  compileMemories,
  fetchContext,
  fetchTimeline,
  isDemoPersona,
  json,
  newVisitorId,
  parseDemoVisitor,
  subjectFor,
  writeEpisode,
} from './_demo'

export const config = { runtime: 'edge' }

interface Message {
  role: string
  content: string
}

const STATELESS_PROMPT = `You are a helpful AI assistant. You have NO memory of any previous conversations with this user. Every conversation starts completely fresh.

Rules:
- You don't know the user's context, preferences, history, or past interactions
- If they refer to something from before, politely explain you don't have that context
- Keep responses concise (2-3 sentences max)
- Be helpful but acknowledge your limitations without persistent memory`

const STATEWAVE_PROMPT = `You are a helpful AI assistant with access to Statewave — a persistent memory system that remembers relevant context about this subject across all interactions.

Rules:
- Use the provided memory context to personalize your response
- Reference specific details from memory when relevant
- Never ask for information you already know from memory
- Keep responses concise (2-3 sentences max)
- Be proactive — anticipate needs based on context`

async function callOpenAI(messages: Message[], systemPrompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY ?? ''
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 200,
      temperature: 0.7,
    }),
  })
  if (!resp.ok) throw new Error(`OpenAI error: ${await resp.text()}`)
  const data = await resp.json()
  return data.choices?.[0]?.message?.content ?? 'No response'
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return json({}, { status: 200 })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, { status: 405 })
  if (!process.env.OPENAI_API_KEY) return json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 })

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
      const reply = await callOpenAI(messages, STATELESS_PROMPT)
      return json({ reply })
    }

    // Statewave mode — derive the subject from cookie + persona so each
    // persona has its own memory pool. Issue a cookie if the visitor doesn't
    // have one yet.
    const existing = parseDemoVisitor(req.headers.get('cookie'))
    let visitorUuid = existing
    let setCookie: string | null = null
    if (!visitorUuid) {
      visitorUuid = newVisitorId()
      setCookie = buildSetCookie(visitorUuid)
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

    const reply = await callOpenAI(messages, enrichedPrompt)

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
