// @vitest-environment node
/**
 * Tests for the demo-cost guards on POST /api/widget-chat:
 *
 *   A. Per-persona prompt scope — demo personas get an off-topic guard so the
 *      public demo can't be used as a free general-purpose chatbot. Applied on
 *      both the statewave and stateless ("no memory") paths.
 *   C. Per-IP rate limit — caps how fast one IP can drive the endpoint.
 *   D. Global daily budget circuit breaker — hard ceiling on demo LLM calls;
 *      once spent, the handler stops calling the LLM and returns rest-mode.
 *
 * Both C and D must short-circuit BEFORE any upstream LLM call so a blocked
 * request (and the front-end's retry-on-429) costs nothing.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import widgetChat from '../server/handlers/widget-chat'
import { __resetDemoBudget } from '../server/demo-budget'

const ENV_BACKUP = { ...process.env }

interface FetchCall {
  url: string
  init?: RequestInit
}

function installFetchMock(): FetchCall[] {
  const calls: FetchCall[] = []
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = typeof input === 'string' ? input : (input as Request).url
    calls.push({ url, init: init as RequestInit })
    if (url.includes('/v1/timeline')) {
      return new Response(JSON.stringify({ episodes: [], memories: [] }), { status: 200 })
    }
    if (url.includes('/v1/context')) {
      const reqBody = init?.body ? JSON.parse(init.body as string) : {}
      return new Response(
        JSON.stringify({
          subject_id: reqBody.subject_id,
          task: 't',
          facts: [],
          procedures: [],
          assembled_context: '',
          token_estimate: 0,
        }),
        { status: 200 },
      )
    }
    if (url.includes('/v1/episodes')) {
      return new Response(JSON.stringify({ id: 'ep-new' }), { status: 201 })
    }
    if (url.includes('/v1/memories/compile')) {
      return new Response(JSON.stringify({ memories_created: 0, memories: [] }), { status: 200 })
    }
    if (url.includes('/v1/llm/complete')) {
      return new Response(JSON.stringify({ reply: 'mock reply' }), { status: 200 })
    }
    throw new Error(`Unexpected fetch in guards test: ${url}`)
  })
  return calls
}

function chatReq(
  body: Record<string, unknown>,
  headers: Record<string, string> = {},
): Request {
  return new Request('http://test/api/widget-chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

function systemMessageFromLLMCall(calls: FetchCall[]): string {
  const llmCall = calls.find((c) => c.url.includes('/v1/llm/complete'))
  if (!llmCall) throw new Error('No /v1/llm/complete call captured')
  const parsed = JSON.parse(llmCall.init?.body as string) as {
    messages: Array<{ role: string; content: string }>
  }
  const sys = parsed.messages.find((m) => m.role === 'system')
  if (!sys) throw new Error('No system message in /v1/llm/complete body')
  return sys.content
}

beforeEach(() => {
  process.env.STATEWAVE_API_KEY = 'test-key'
  process.env.STATEWAVE_URL = 'https://statewave-api.test'
  __resetDemoBudget()
})
afterEach(() => {
  process.env = { ...ENV_BACKUP }
  vi.restoreAllMocks()
})

describe('A. per-persona prompt scope', () => {
  let calls: FetchCall[]
  beforeEach(() => {
    calls = installFetchMock()
  })

  it('adds the off-topic guard for a demo persona on the statewave path', async () => {
    const resp = await widgetChat(
      chatReq({
        messages: [{ role: 'user', content: 'who is Ferdinand Porsche?' }],
        mode: 'statewave',
        persona: 'research-assistant',
      }),
    )
    expect(resp.status).toBe(200)
    const sys = systemMessageFromLLMCall(calls)
    expect(sys).toContain('## Demo scope (stay on-topic)')
    expect(sys).toContain('research-assistant')
    expect(sys).toContain('DO NOT answer it')
  })

  it('instructs the agent to accept personal facts (so the demo can set facts)', async () => {
    const resp = await widgetChat(
      chatReq({
        messages: [{ role: 'user', content: 'hi i like the color red' }],
        mode: 'statewave',
        persona: 'support-agent',
      }),
    )
    expect(resp.status).toBe(200)
    const sys = systemMessageFromLLMCall(calls)
    // The off-topic guard must carve out self-disclosed facts — refusing them
    // breaks the whole "watch memory build up" demo.
    expect(sys).toContain('NEVER refuse or deflect a personal fact')
    expect(sys).toContain('in-scope by definition')
  })

  it('adds the off-topic guard on the stateless baseline path too', async () => {
    const resp = await widgetChat(
      chatReq({
        messages: [{ role: 'user', content: 'who is Ferdinand Porsche?' }],
        mode: 'stateless',
        persona: 'coding-assistant',
      }),
    )
    expect(resp.status).toBe(200)
    const sys = systemMessageFromLLMCall(calls)
    expect(sys).toContain('## Demo scope (stay on-topic)')
    expect(sys).toContain('coding-assistant')
  })

  it('does not scope unknown / absent personas (eval + direct callers unaffected)', async () => {
    const resp = await widgetChat(
      chatReq({
        messages: [{ role: 'user', content: 'hello' }],
        mode: 'stateless',
      }),
    )
    expect(resp.status).toBe(200)
    const sys = systemMessageFromLLMCall(calls)
    expect(sys).not.toContain('## Demo scope')
  })
})

describe('C. per-IP rate limit', () => {
  beforeEach(() => {
    installFetchMock()
    process.env.WIDGET_CHAT_RATE_LIMIT_MAX = '2'
    process.env.WIDGET_CHAT_RATE_LIMIT_WINDOW_MS = '60000'
  })

  it('429s past the per-IP budget; Retry-After + CORS present; fresh IP unaffected', async () => {
    const ip = `203.0.113.${Math.floor(Math.random() * 254) + 1}`
    const make = () =>
      chatReq(
        { messages: [{ role: 'user', content: 'hi' }], mode: 'stateless', persona: 'support-agent' },
        { 'fly-client-ip': ip },
      )
    expect((await widgetChat(make())).status).toBe(200)
    expect((await widgetChat(make())).status).toBe(200)
    const blocked = await widgetChat(make())
    expect(blocked.status).toBe(429)
    expect(blocked.headers.get('Retry-After')).toBeTruthy()
    expect(blocked.headers.get('Access-Control-Allow-Origin')).toBe('*')
    const body = await blocked.json()
    expect(body.rateLimited).toBe(true)

    // A different IP is in its own bucket → not rate-limited.
    const fresh = await widgetChat(
      chatReq(
        { messages: [{ role: 'user', content: 'hi' }], mode: 'stateless', persona: 'support-agent' },
        { 'fly-client-ip': '198.51.100.7' },
      ),
    )
    expect(fresh.status).toBe(200)
  })

  it('does not call the upstream LLM when rate-limited', async () => {
    const calls = installFetchMock()
    const ip = `203.0.113.${Math.floor(Math.random() * 254) + 1}`
    const make = () =>
      chatReq(
        { messages: [{ role: 'user', content: 'hi' }], mode: 'stateless', persona: 'support-agent' },
        { 'fly-client-ip': ip },
      )
    await widgetChat(make())
    await widgetChat(make())
    const before = calls.filter((c) => c.url.includes('/v1/llm/complete')).length
    const blocked = await widgetChat(make())
    expect(blocked.status).toBe(429)
    const after = calls.filter((c) => c.url.includes('/v1/llm/complete')).length
    expect(after).toBe(before) // no new LLM call for the blocked request
  })
})

describe('D. global daily budget circuit breaker', () => {
  let calls: FetchCall[]
  beforeEach(() => {
    calls = installFetchMock()
    process.env.WIDGET_CHAT_DAILY_BUDGET = '2'
    // Keep the per-IP limiter out of the way so we isolate the budget.
    process.env.WIDGET_CHAT_RATE_LIMIT_MAX = '1000'
  })

  it('flips to rest-mode (429 + demoRestMode) once the daily budget is spent', async () => {
    const make = () =>
      chatReq(
        { messages: [{ role: 'user', content: 'hi' }], mode: 'stateless', persona: 'support-agent' },
        { 'fly-client-ip': '203.0.113.50' },
      )
    expect((await widgetChat(make())).status).toBe(200)
    expect((await widgetChat(make())).status).toBe(200)
    const blocked = await widgetChat(make())
    expect(blocked.status).toBe(429)
    const body = await blocked.json()
    expect(body.demoRestMode).toBe(true)
    expect(blocked.headers.get('Retry-After')).toBeTruthy()
  })

  it('does not call the upstream LLM once the budget is spent', async () => {
    const make = () =>
      chatReq(
        { messages: [{ role: 'user', content: 'hi' }], mode: 'stateless', persona: 'support-agent' },
        { 'fly-client-ip': '203.0.113.51' },
      )
    await widgetChat(make())
    await widgetChat(make())
    const before = calls.filter((c) => c.url.includes('/v1/llm/complete')).length
    await widgetChat(make())
    const after = calls.filter((c) => c.url.includes('/v1/llm/complete')).length
    expect(after).toBe(before)
  })
})
