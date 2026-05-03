// @vitest-environment node
/**
 * Tests for the per-visitor demo persistence flow.
 *
 * Covers:
 *  - first visit issues a fresh cookie + subject
 *  - returning visit restores the same subject and rehydrates chat
 *  - statewave-mode chat writes an episode + triggers compile
 *  - reset deletes the subject and reissues a fresh cookie
 *  - stateless mode is unaffected (no episode write, no cookie required)
 *  - over-cap visitors get a 429
 *  - over-length messages get a 400
 *
 * Vercel Edge handlers are plain Request → Response functions, so we just
 * import them and pass synthetic Requests with a stubbed global fetch.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DEMO_SUBJECT_PREFIX,
  buildSetCookie,
  parseDemoVisitor,
  subjectFor,
} from '../api/_demo'
import demoState from '../api/demo-state'
import demoReset from '../api/demo-reset'
import demoSeed from '../api/demo-seed'
import widgetChat from '../api/widget-chat'

const VALID_UUID = '11111111-2222-4333-8444-555555555555'

function cookieHeader(uuid: string): string {
  return `${'sw_demo_visitor'}=${uuid}`
}

function makeRequest(method: string, url: string, init: RequestInit = {}): Request {
  return new Request(url, { method, ...init })
}

function setEnv() {
  // Chat completions flow through the Statewave server's /v1/llm/complete
  // endpoint — no direct provider key in the website env.
  process.env.STATEWAVE_API_KEY = 'test-key'
  process.env.STATEWAVE_URL = 'https://statewave-api.test'
}

describe('parseDemoVisitor', () => {
  it('returns the cookie value when present and valid', () => {
    expect(parseDemoVisitor(cookieHeader(VALID_UUID))).toBe(VALID_UUID)
  })
  it('returns null for a malformed UUID', () => {
    expect(parseDemoVisitor(`sw_demo_visitor=not-a-uuid`)).toBeNull()
  })
  it('returns null for a missing cookie header', () => {
    expect(parseDemoVisitor(null)).toBeNull()
    expect(parseDemoVisitor('')).toBeNull()
  })
  it('parses correctly when other cookies are present', () => {
    const header = `theme=dark; sw_demo_visitor=${VALID_UUID}; lang=en`
    expect(parseDemoVisitor(header)).toBe(VALID_UUID)
  })
})

describe('subjectFor', () => {
  it('produces a stable subject id with the demo_web_ prefix', () => {
    const sid = subjectFor(VALID_UUID)
    expect(sid.startsWith(DEMO_SUBJECT_PREFIX)).toBe(true)
    // 32 hex chars after the prefix (UUID with dashes stripped)
    expect(sid).toBe(`${DEMO_SUBJECT_PREFIX}11111111222243338444555555555555`)
    expect(sid).toBe(subjectFor(VALID_UUID))
  })
  it('does not include hyphens in the visitor segment', () => {
    expect(subjectFor(VALID_UUID).split('__')[0]).not.toContain('-')
  })
  it('produces a distinct subject per persona, allowing dashes only in the persona suffix', () => {
    const a = subjectFor(VALID_UUID, 'support-agent')
    const b = subjectFor(VALID_UUID, 'coding-assistant')
    const bare = subjectFor(VALID_UUID)
    expect(a).not.toBe(b)
    expect(a).not.toBe(bare)
    expect(a).toMatch(/__support-agent$/)
    expect(b).toMatch(/__coding-assistant$/)
    // Hyphens are allowed inside the persona suffix (after the __ delimiter)
    // but not inside the visitor segment.
    expect(a.split('__')[0]).not.toContain('-')
  })
  it('falls back to the bare subject for empty / unknown persona inputs', () => {
    expect(subjectFor(VALID_UUID, '')).toBe(subjectFor(VALID_UUID))
    // strips disallowed chars; if nothing legal remains we fall back to bare
    expect(subjectFor(VALID_UUID, '!!!')).toBe(subjectFor(VALID_UUID))
  })
})

describe('buildSetCookie', () => {
  it('sets HttpOnly, SameSite=Lax, Path=/, and a Max-Age', () => {
    const c = buildSetCookie(VALID_UUID, false)
    expect(c).toContain(`sw_demo_visitor=${VALID_UUID}`)
    expect(c).toContain('HttpOnly')
    expect(c).toContain('SameSite=Lax')
    expect(c).toContain('Path=/')
    expect(c).toMatch(/Max-Age=\d+/)
  })
  it('adds Secure in production', () => {
    expect(buildSetCookie(VALID_UUID, true)).toContain('Secure')
    expect(buildSetCookie(VALID_UUID, false)).not.toContain('Secure')
  })
})

describe('GET /api/demo-state', () => {
  beforeEach(() => {
    setEnv()
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = typeof input === 'string' ? input : (input as Request).url
      // Returning visitor's timeline: one prior episode, one memory.
      if (url.includes('/v1/timeline')) {
        return new Response(JSON.stringify({
          episodes: [{
            id: 'ep-1',
            source: 'demo-web-chat',
            type: 'conversation',
            payload: { messages: [
              { role: 'user', content: 'Hi, my name is Alice' },
              { role: 'assistant', content: 'Hi Alice!' },
            ] },
            created_at: '2026-04-30T12:00:00Z',
          }],
          memories: [{ id: 'm-1', kind: 'profile_fact', content: 'Name is Alice', confidence: 0.8 }],
        }), { status: 200 })
      }
      throw new Error(`Unexpected fetch in demo-state test: ${url}`)
    })
  })
  afterEach(() => vi.restoreAllMocks())

  it('first visit: issues a Set-Cookie with a UUID and returns isNew=true with empty state', async () => {
    const resp = await demoState(makeRequest('GET', 'http://test/api/demo-state'))
    expect(resp.status).toBe(200)
    const setCookie = resp.headers.get('set-cookie')
    expect(setCookie).toBeTruthy()
    expect(setCookie).toMatch(/sw_demo_visitor=[0-9a-f-]{36}/)
    expect(setCookie).toContain('HttpOnly')
    const data = await resp.json()
    expect(data.isNew).toBe(true)
    expect(data.subjectId).toMatch(/^demo_web_[0-9a-f]{32}$/)
    expect(data.episodes).toEqual([])
    expect(data.memories).toEqual([])
    // Should NOT call the timeline endpoint for a brand-new visitor.
    expect((globalThis.fetch as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled()
  })

  it('returning visit: rehydrates chat from real episodes and shows compiled memories', async () => {
    const resp = await demoState(makeRequest('GET', 'http://test/api/demo-state', {
      headers: { cookie: cookieHeader(VALID_UUID) },
    }))
    expect(resp.status).toBe(200)
    expect(resp.headers.get('set-cookie')).toBeNull()
    const data = await resp.json()
    expect(data.isNew).toBe(false)
    expect(data.subjectId).toBe(subjectFor(VALID_UUID))
    expect(data.memories).toHaveLength(1)
    expect(data.memories[0].content).toBe('Name is Alice')
    // Two messages from one episode flatten into two chat turns
    expect(data.episodes).toHaveLength(2)
    expect(data.episodes[0]).toMatchObject({ role: 'user', content: 'Hi, my name is Alice' })
  })
})

describe('POST /api/widget-chat — statewave mode', () => {
  let calls: Array<{ url: string; init?: RequestInit }> = []

  beforeEach(() => {
    setEnv()
    calls = []
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = typeof input === 'string' ? input : (input as Request).url
      calls.push({ url, init: init as RequestInit })
      if (url.includes('/v1/timeline')) {
        return new Response(JSON.stringify({ episodes: [], memories: [] }), { status: 200 })
      }
      if (url.includes('/v1/context')) {
        return new Response(JSON.stringify({
          subject_id: 'demo_web_x', task: 't',
          facts: [], procedures: [], assembled_context: '', token_estimate: 0,
        }), { status: 200 })
      }
      if (url.includes('/v1/episodes')) {
        return new Response(JSON.stringify({ id: 'ep-new' }), { status: 201 })
      }
      if (url.includes('/v1/memories/compile')) {
        return new Response(JSON.stringify({ memories_created: 1, memories: [] }), { status: 200 })
      }
      if (url.includes('/v1/llm/complete')) {
        return new Response(JSON.stringify({ reply: 'hello back' }), { status: 200 })
      }
      throw new Error(`Unexpected fetch in widget-chat test: ${url}`)
    })
  })
  afterEach(() => vi.restoreAllMocks())

  it('writes a real episode and runs compile after a turn', async () => {
    const req = makeRequest('POST', 'http://test/api/widget-chat', {
      headers: { 'content-type': 'application/json', cookie: cookieHeader(VALID_UUID) },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'Hi, I am Alice' }], mode: 'statewave', persona: 'support-agent' }),
    })
    const resp = await widgetChat(req)
    expect(resp.status).toBe(200)
    const data = await resp.json()
    expect(data.reply).toBe('hello back')
    expect(data.subjectId).toBe(subjectFor(VALID_UUID, 'support-agent'))
    expect(data.persisted).toBe(true)

    const urls = calls.map((c) => c.url)
    expect(urls.some((u) => u.includes('/v1/timeline'))).toBe(true)
    expect(urls.some((u) => u.includes('/v1/context'))).toBe(true)
    expect(urls.some((u) => u.includes('/v1/episodes'))).toBe(true)
    expect(urls.some((u) => u.includes('/v1/memories/compile'))).toBe(true)

    // The episode payload mentions both the user message and the LLM reply
    const epCall = calls.find((c) => c.url.includes('/v1/episodes'))
    expect(epCall).toBeDefined()
    const epBody = JSON.parse(epCall!.init?.body as string)
    // The widget-chat handler builds the subject from cookie + body.persona
    // so each persona has its own memory pool.
    expect(epBody.subject_id).toBe(subjectFor(VALID_UUID, 'support-agent'))
    expect(epBody.source).toBe('demo-web-chat')
    expect(epBody.payload.messages).toEqual([
      { role: 'user', content: 'Hi, I am Alice' },
      { role: 'assistant', content: 'hello back' },
    ])
    expect(epBody.metadata.persona).toBe('support-agent')
  })

  it('issues a Set-Cookie if the visitor had none', async () => {
    const req = makeRequest('POST', 'http://test/api/widget-chat', {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }], mode: 'statewave' }),
    })
    const resp = await widgetChat(req)
    expect(resp.status).toBe(200)
    expect(resp.headers.get('set-cookie')).toMatch(/sw_demo_visitor=[0-9a-f-]{36}/)
  })

  it('rejects messages over the per-message cap', async () => {
    const req = makeRequest('POST', 'http://test/api/widget-chat', {
      headers: { 'content-type': 'application/json', cookie: cookieHeader(VALID_UUID) },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'a'.repeat(2000) }], mode: 'statewave' }),
    })
    const resp = await widgetChat(req)
    expect(resp.status).toBe(400)
  })
})

describe('POST /api/widget-chat — stateless mode', () => {
  beforeEach(() => {
    setEnv()
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = typeof input === 'string' ? input : (input as Request).url
      if (url.includes('/v1/llm/complete')) {
        return new Response(JSON.stringify({ reply: 'stateless reply' }), { status: 200 })
      }
      throw new Error(`stateless mode should not call ${url}`)
    })
  })
  afterEach(() => vi.restoreAllMocks())

  it('does not write episodes, compile, or fetch context', async () => {
    const req = makeRequest('POST', 'http://test/api/widget-chat', {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }], mode: 'stateless' }),
    })
    const resp = await widgetChat(req)
    expect(resp.status).toBe(200)
    const data = await resp.json()
    expect(data.reply).toBe('stateless reply')
    // Stateless never touches Statewave or sets cookies
    expect(resp.headers.get('set-cookie')).toBeNull()
  })
})

describe('POST /api/demo-seed', () => {
  let calls: Array<{ url: string; method: string; body?: string }> = []
  let visitorEpisodeCount = 0

  beforeEach(() => {
    setEnv()
    calls = []
    visitorEpisodeCount = 0
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = typeof input === 'string' ? input : (input as Request).url
      const method = (init as RequestInit | undefined)?.method ?? 'GET'
      calls.push({ url, method, body: (init as RequestInit | undefined)?.body as string | undefined })
      // First timeline call: visitor's subject (empty by default)
      // Second: source showcase subject (has episodes)
      if (url.includes('/v1/timeline')) {
        const params = new URL(url).searchParams.get('subject_id') ?? ''
        if (params.startsWith('demo_web_')) {
          // visitor subject — empty before seed, populated after writes
          return new Response(JSON.stringify({
            episodes: Array.from({ length: visitorEpisodeCount }, (_, i) => ({ id: `v-ep-${i}`, payload: { messages: [] }, created_at: '' })),
            memories: visitorEpisodeCount > 0 ? [{ id: 'm-1', kind: 'profile_fact', content: 'Seeded fact', confidence: 0.7 }] : [],
          }), { status: 200 })
        }
        if (params.startsWith('demo-')) {
          // Showcase episodes use mixed payload shapes — the seed must
          // preserve them verbatim so the compiler has structured content.
          return new Response(JSON.stringify({
            episodes: [
              { id: 'src-1', source: 'support-chat', type: 'ticket_opened', payload: { channel: 'email', content: 'Sarah from Globex reported login failure', priority: 'high' }, created_at: '2026-04-01' },
              { id: 'src-2', source: 'support-chat', type: 'agent_action',  payload: { action: 'escalate', content: 'Escalated to L2 — auth issue confirmed' }, created_at: '2026-04-02' },
              { id: 'src-3', source: 'support-chat', type: 'conversation', payload: { messages: [{ role: 'user', content: 'I prefer email' }, { role: 'assistant', content: 'Got it' }] }, created_at: '2026-04-03' },
            ],
            memories: [],
          }), { status: 200 })
        }
      }
      if (url.includes('/v1/episodes') && method === 'POST') {
        visitorEpisodeCount += 1
        return new Response(JSON.stringify({ id: `new-${visitorEpisodeCount}` }), { status: 201 })
      }
      if (url.includes('/v1/memories/compile')) {
        return new Response(JSON.stringify({ memories_created: 1 }), { status: 200 })
      }
      throw new Error(`Unexpected fetch in seed test: ${method} ${url}`)
    })
  })
  afterEach(() => vi.restoreAllMocks())

  it('rejects an unknown persona', async () => {
    const req = makeRequest('POST', 'http://test/api/demo-seed', {
      headers: { 'content-type': 'application/json', cookie: cookieHeader(VALID_UUID) },
      body: JSON.stringify({ persona: 'not-a-real-persona' }),
    })
    const resp = await demoSeed(req)
    expect(resp.status).toBe(400)
  })

  it('seeds an empty visitor by copying source episodes and running compile', async () => {
    const req = makeRequest('POST', 'http://test/api/demo-seed', {
      headers: { 'content-type': 'application/json', cookie: cookieHeader(VALID_UUID) },
      body: JSON.stringify({ persona: 'support-agent' }),
    })
    const resp = await demoSeed(req)
    expect(resp.status).toBe(200)
    const data = await resp.json()
    expect(data.seeded).toBe(true)
    expect(data.seedSource).toBe('demo-support-agent')
    expect(data.copied).toBe(3)
    expect(data.episodeCount).toBe(3)
    expect(data.memories).toHaveLength(1)

    // Verify the episode writes carry source provenance AND preserve original
    // payload + source + type so the compiler can extract memories.
    const episodeWrites = calls.filter((c) => c.url.includes('/v1/episodes') && c.method === 'POST')
    expect(episodeWrites).toHaveLength(3)
    const bodies = episodeWrites.map((c) => JSON.parse(c.body!))
    for (const body of bodies) {
      expect(body.subject_id).toBe(subjectFor(VALID_UUID, 'support-agent'))
      expect(body.metadata.seeded_from).toBe('demo-support-agent')
      expect(body.metadata.persona).toBe('support-agent')
      expect(body.metadata.original_episode_id).toMatch(/^src-/)
      expect(body.source).toBe('support-chat')
    }
    // Each preserves its original payload/type — not a stub
    const types = bodies.map((b) => b.type).sort()
    expect(types).toEqual(['agent_action', 'conversation', 'ticket_opened'])
    const ticket = bodies.find((b) => b.type === 'ticket_opened')!
    expect(ticket.payload).toEqual({ channel: 'email', content: 'Sarah from Globex reported login failure', priority: 'high' })

    // Compile is called once after seeding
    const compileCalls = calls.filter((c) => c.url.includes('/v1/memories/compile'))
    expect(compileCalls).toHaveLength(1)
  })

  it('does NOT reseed when the visitor already has episodes', async () => {
    visitorEpisodeCount = 5
    const req = makeRequest('POST', 'http://test/api/demo-seed', {
      headers: { 'content-type': 'application/json', cookie: cookieHeader(VALID_UUID) },
      body: JSON.stringify({ persona: 'support-agent' }),
    })
    const resp = await demoSeed(req)
    expect(resp.status).toBe(200)
    const data = await resp.json()
    expect(data.seeded).toBe(false)
    expect(data.reason).toBe('already-populated')
    expect(data.episodeCount).toBe(5)
    // No episode writes, no compile
    expect(calls.filter((c) => c.url.includes('/v1/episodes') && c.method === 'POST')).toHaveLength(0)
    expect(calls.filter((c) => c.url.includes('/v1/memories/compile'))).toHaveLength(0)
  })

  it('issues a Set-Cookie if the visitor had no cookie', async () => {
    const req = makeRequest('POST', 'http://test/api/demo-seed', {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ persona: 'support-agent' }),
    })
    const resp = await demoSeed(req)
    expect(resp.status).toBe(200)
    expect(resp.headers.get('set-cookie')).toMatch(/sw_demo_visitor=[0-9a-f-]{36}/)
  })
})

describe('POST /api/demo-reset', () => {
  let deletedSubjects: string[] = []

  beforeEach(() => {
    setEnv()
    deletedSubjects = []
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = typeof input === 'string' ? input : (input as Request).url
      const method = (init as RequestInit | undefined)?.method ?? 'GET'
      if (url.includes('/v1/subjects/') && method === 'DELETE') {
        const id = decodeURIComponent(url.split('/v1/subjects/')[1])
        deletedSubjects.push(id)
        return new Response(JSON.stringify({ subject_id: id }), { status: 200 })
      }
      throw new Error(`Unexpected fetch in reset test: ${url}`)
    })
  })
  afterEach(() => vi.restoreAllMocks())

  it('deletes every persona subject for the visitor + the legacy bare one and reissues a fresh cookie', async () => {
    const req = makeRequest('POST', 'http://test/api/demo-reset', {
      headers: { cookie: cookieHeader(VALID_UUID) },
    })
    const resp = await demoReset(req)
    expect(resp.status).toBe(200)
    // Bare subject (legacy) + one per visitor-memory persona (5) +
    // one per docs-shared persona's per-visitor memory subject (1) = 7 deletes.
    // The shared docs subject (statewave-support-docs) is intentionally NOT
    // included — reset wipes the visitor's slate, never the shared knowledge
    // pack.
    const expected = new Set([
      subjectFor(VALID_UUID),
      subjectFor(VALID_UUID, 'support-agent'),
      subjectFor(VALID_UUID, 'coding-assistant'),
      subjectFor(VALID_UUID, 'sales-copilot'),
      subjectFor(VALID_UUID, 'devops-agent'),
      subjectFor(VALID_UUID, 'research-assistant'),
      subjectFor(VALID_UUID, 'statewave-support'),
    ])
    expect(new Set(deletedSubjects)).toEqual(expected)

    const setCookie = resp.headers.get('set-cookie')
    expect(setCookie).toMatch(/sw_demo_visitor=[0-9a-f-]{36}/)
    const data = await resp.json()
    expect(data.reset).toBe(true)
    // New subject id is bare (no persona scope yet) and uses a different uuid
    expect(data.subjectId).toMatch(/^demo_web_[0-9a-f]{32}$/)
    expect(data.subjectId).not.toBe(subjectFor(VALID_UUID))
  })

  it('is idempotent: cookieless reset just issues a new cookie without calling delete', async () => {
    const req = makeRequest('POST', 'http://test/api/demo-reset')
    const resp = await demoReset(req)
    expect(resp.status).toBe(200)
    expect(deletedSubjects).toEqual([])
    expect(resp.headers.get('set-cookie')).toBeTruthy()
  })
})
