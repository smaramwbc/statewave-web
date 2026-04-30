/**
 * Chat Widget Edge Function
 * 
 * Handles both stateless and Statewave-backed chat modes.
 * - stateless: plain GPT call with no context
 * - statewave: fetches context from Fly.io, injects into prompt
 */

export const config = { runtime: 'edge' }

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? ''
const STATEWAVE_API_KEY = process.env.STATEWAVE_API_KEY ?? ''
const STATEWAVE_URL = 'https://statewave-api.fly.dev'

interface Message {
  role: string
  content: string
}

interface ContextBundle {
  subject_id: string
  task: string
  facts: Array<{ id: string; content: string; kind: string; confidence: number }>
  procedures: Array<{ id: string; content: string; kind: string; confidence: number }>
  assembled_context: string
  token_estimate: number
}

// System prompts
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

async function fetchStatewaveContext(subjectId: string, task: string): Promise<ContextBundle | null> {
  try {
    const resp = await fetch(`${STATEWAVE_URL}/v1/context`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': STATEWAVE_API_KEY,
      },
      body: JSON.stringify({
        subject_id: subjectId,
        task,
        max_tokens: 800,
      }),
    })

    if (!resp.ok) {
      console.warn('[widget-chat] Context fetch failed:', resp.status)
      return null
    }

    return await resp.json()
  } catch (err) {
    console.warn('[widget-chat] Context fetch error:', err)
    return null
  }
}

async function callOpenAI(messages: Message[], systemPrompt: string): Promise<string> {
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 200,
      temperature: 0.7,
    }),
  })

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`OpenAI error: ${err}`)
  }

  const data = await resp.json()
  return data.choices?.[0]?.message?.content ?? 'No response'
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return json({}, 200)
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  if (!OPENAI_API_KEY) {
    return json({ error: 'OPENAI_API_KEY not configured' }, 500)
  }

  let body: { messages: Message[]; subjectId: string; mode: 'stateless' | 'statewave' }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const { messages, subjectId, mode } = body

  if (!messages || !Array.isArray(messages) || !subjectId || !mode) {
    return json({ error: 'messages, subjectId, and mode required' }, 400)
  }

  try {
    if (mode === 'stateless') {
      const reply = await callOpenAI(messages, STATELESS_PROMPT)
      return json({ reply })
    }

    // Statewave mode: fetch context first
    const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content ?? ''
    const context = await fetchStatewaveContext(
      subjectId,
      `Respond helpfully to: "${lastUserMsg.substring(0, 100)}"`
    )

    let enrichedPrompt = STATEWAVE_PROMPT
    if (context) {
      const allMemories = [...(context.facts ?? []), ...(context.procedures ?? [])]
      if (allMemories.length > 0) {
        const memorySection = allMemories
          .map(m => `- [${m.kind}] ${m.content}`)
          .join('\n')
        enrichedPrompt += `\n\n## Memory Context (from Statewave):\n${memorySection}`
      }
    }

    const reply = await callOpenAI(messages, enrichedPrompt)
    return json({ reply, context })
  } catch (err) {
    console.error('[widget-chat] Error:', err)
    return json({ error: (err as Error).message }, 500)
  }
}
