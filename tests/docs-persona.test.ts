// @vitest-environment node
/**
 * Tests for the Statewave Support persona — hybrid model:
 *   * docs grounding comes from the shared `statewave-support-docs` subject
 *     (built upstream by bootstrap_docs_pack.py)
 *   * visitor memory lives in a per-visitor subject
 *     `demo_web_<uuid>__statewave-support`
 *
 * Covers the contracts:
 *   * widget-chat fetches BOTH docs context (DOCS_SUBJECT_ID) and visitor
 *     context (per-visitor subject) and merges them into the system prompt
 *   * widget-chat writes the chat turn ONLY to the visitor subject — the
 *     shared docs pack stays read-only
 *   * widget-chat compiles ONLY the visitor subject
 *   * citations still resolve against DOCS_SUBJECT_ID (visitor memory is
 *     never cited as a source)
 *   * demo-state with persona=statewave-support returns the visitor's own
 *     subject and surfaces the visitor's memories — not the docs pack
 *   * demo-seed accepts the persona as a no-op (no copy, no rejection)
 *   * demo-reset wipes the visitor's per-visitor statewave-support subject
 *     and never targets the shared docs subject
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DOCS_SHARED_PERSONAS,
  DOCS_SUBJECT_ID,
  isDocsSharedPersona,
  isKnownPersona,
  subjectFor,
  subjectForPersona,
} from '../server/statewave-client'
import demoState from '../server/handlers/demo-state'
import demoSeed from '../server/handlers/demo-seed'
import demoReset from '../server/handlers/demo-reset'
import widgetChat from '../server/handlers/widget-chat'

const VALID_UUID = '11111111-2222-4333-8444-555555555555'

function cookieHeader(uuid: string): string {
  return `sw_demo_visitor=${uuid}`
}

function makeRequest(method: string, url: string, init: RequestInit = {}): Request {
  return new Request(url, { method, ...init })
}

function setEnv() {
  // Chat completions flow through the Statewave server's /v1/llm/complete
  // — no direct provider key needed in the website env.
  process.env.STATEWAVE_API_KEY = 'test-key'
  process.env.STATEWAVE_URL = 'https://statewave-api.test'
}

describe('docs-shared persona registry', () => {
  it('recognises statewave-support as docs-shared', () => {
    expect(isDocsSharedPersona('statewave-support')).toBe(true)
    expect(isDocsSharedPersona('support-agent')).toBe(false)
    expect(isDocsSharedPersona(null)).toBe(false)
    expect(DOCS_SHARED_PERSONAS).toContain('statewave-support')
  })
  it('isKnownPersona accepts both kinds', () => {
    expect(isKnownPersona('statewave-support')).toBe(true)
    expect(isKnownPersona('support-agent')).toBe(true)
    expect(isKnownPersona('not-a-persona')).toBe(false)
  })
  it('subjectForPersona resolves docs-shared to the fixed shared subject', () => {
    expect(subjectForPersona(VALID_UUID, 'statewave-support')).toBe(DOCS_SUBJECT_ID)
    // Two different visitors get the SAME docs subject — that's the point.
    expect(subjectForPersona('99999999-2222-4333-8444-555555555555', 'statewave-support')).toBe(
      DOCS_SUBJECT_ID,
    )
  })
  it('subjectForPersona still scopes visitor-memory personas per-visitor', () => {
    expect(subjectForPersona(VALID_UUID, 'support-agent')).toBe(
      subjectFor(VALID_UUID, 'support-agent'),
    )
    expect(subjectForPersona(VALID_UUID, 'support-agent')).not.toBe(DOCS_SUBJECT_ID)
  })
})

describe('POST /api/widget-chat — statewave-support persona (hybrid)', () => {
  const visitorSubject = subjectFor(VALID_UUID, 'statewave-support')
  let calls: Array<{ url: string; init?: RequestInit }> = []

  beforeEach(() => {
    setEnv()
    calls = []
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = typeof input === 'string' ? input : (input as Request).url
      calls.push({ url, init: init as RequestInit })
      if (url.includes('/v1/timeline')) {
        // Per-visitor episode-cap pre-check on the visitor subject — empty
        // for a fresh visitor.
        return new Response(JSON.stringify({ episodes: [], memories: [] }), { status: 200 })
      }
      if (url.includes('/v1/context')) {
        // Two context fetches happen on this path (docs + visitor). Disambiguate
        // by the request body's subject_id so each gets a representative shape.
        const body = init?.body ? JSON.parse(init.body as string) : {}
        if (body.subject_id === DOCS_SUBJECT_ID) {
          return new Response(
            JSON.stringify({
              subject_id: DOCS_SUBJECT_ID,
              task: 't',
              facts: [
                {
                  id: 'm-1',
                  kind: 'episode_summary',
                  content:
                    'Statewave uses PostgreSQL with pgvector for both relational and vector storage (architecture/overview.md).',
                  confidence: 0.9,
                },
              ],
              procedures: [],
              assembled_context: '',
              token_estimate: 0,
            }),
            { status: 200 },
          )
        }
        // Visitor-subject context: a returning visitor whose prior questions
        // hinted at multi-tenant interest. Lets the model personalise.
        return new Response(
          JSON.stringify({
            subject_id: body.subject_id,
            task: 't',
            facts: [
              {
                id: 'mv-1',
                kind: 'profile_fact',
                content: 'Visitor previously asked about multi-tenant deployments.',
                confidence: 0.8,
              },
            ],
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
        return new Response(
          JSON.stringify({ memories_created: 1, memories: [] }),
          { status: 200 },
        )
      }
      if (url.includes('/v1/llm/complete')) {
        return new Response(
          JSON.stringify({ reply: 'Statewave uses PostgreSQL + pgvector.' }),
          { status: 200 },
        )
      }
      throw new Error(`Unexpected fetch in docs persona test: ${url}`)
    })
  })
  afterEach(() => vi.restoreAllMocks())

  it('returns the per-visitor subject, persists the turn, and compiles only the visitor subject', async () => {
    const req = makeRequest('POST', 'http://test/api/widget-chat', {
      headers: { 'content-type': 'application/json', cookie: cookieHeader(VALID_UUID) },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'What database does Statewave use?' }],
        mode: 'statewave',
        persona: 'statewave-support',
      }),
    })
    const resp = await widgetChat(req)
    expect(resp.status).toBe(200)
    const data = await resp.json()
    // Hybrid model: the response surfaces the VISITOR subject (where memory
    // accrues), not the shared docs subject.
    expect(data.subjectId).toBe(visitorSubject)
    expect(data.persisted).toBe(true)
    expect(data.reply).toBe('Statewave uses PostgreSQL + pgvector.')
  })

  it('fetches context from BOTH the docs subject and the visitor subject', async () => {
    const req = makeRequest('POST', 'http://test/api/widget-chat', {
      headers: { 'content-type': 'application/json', cookie: cookieHeader(VALID_UUID) },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'How do I deploy?' }],
        mode: 'statewave',
        persona: 'statewave-support',
      }),
    })
    await widgetChat(req)
    const ctxCalls = calls.filter((c) => c.url.includes('/v1/context'))
    const ctxSubjects = ctxCalls.map((c) => JSON.parse(c.init?.body as string).subject_id)
    expect(ctxSubjects).toContain(DOCS_SUBJECT_ID)
    expect(ctxSubjects).toContain(visitorSubject)
  })

  it('writes the chat turn ONLY to the visitor subject — never the docs subject', async () => {
    const req = makeRequest('POST', 'http://test/api/widget-chat', {
      headers: { 'content-type': 'application/json', cookie: cookieHeader(VALID_UUID) },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'How do I deploy?' }],
        mode: 'statewave',
        persona: 'statewave-support',
      }),
    })
    await widgetChat(req)
    const writeCalls = calls.filter((c) => c.url.includes('/v1/episodes') && (c.init?.method ?? 'GET').toUpperCase() === 'POST')
    expect(writeCalls).toHaveLength(1)
    const writeBody = JSON.parse(writeCalls[0].init?.body as string)
    expect(writeBody.subject_id).toBe(visitorSubject)
    expect(writeBody.subject_id).not.toBe(DOCS_SUBJECT_ID)
  })

  it('compiles ONLY the visitor subject — never the docs subject', async () => {
    const req = makeRequest('POST', 'http://test/api/widget-chat', {
      headers: { 'content-type': 'application/json', cookie: cookieHeader(VALID_UUID) },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'How do I deploy?' }],
        mode: 'statewave',
        persona: 'statewave-support',
      }),
    })
    await widgetChat(req)
    const compileCalls = calls.filter((c) => c.url.includes('/v1/memories/compile'))
    expect(compileCalls).toHaveLength(1)
    const compileBody = JSON.parse(compileCalls[0].init?.body as string)
    expect(compileBody.subject_id).toBe(visitorSubject)
    expect(compileBody.subject_id).not.toBe(DOCS_SUBJECT_ID)
  })

  it('injects both docs and visitor memories into the system prompt under labeled headers', async () => {
    const req = makeRequest('POST', 'http://test/api/widget-chat', {
      headers: { 'content-type': 'application/json', cookie: cookieHeader(VALID_UUID) },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'How do I deploy?' }],
        mode: 'statewave',
        persona: 'statewave-support',
      }),
    })
    await widgetChat(req)
    const llmCall = calls.find((c) => c.url.includes('/v1/llm/complete'))
    expect(llmCall).toBeDefined()
    const body = JSON.parse(llmCall!.init?.body as string)
    const systemMsg = body.messages.find((m: { role: string }) => m.role === 'system')!.content as string
    expect(systemMsg).toContain('Statewave Support assistant')
    // Docs grounding header + content present.
    expect(systemMsg).toContain('Statewave docs (retrieved facts)')
    expect(systemMsg).toContain('PostgreSQL with pgvector')
    // Visitor-personalisation header + content present.
    expect(systemMsg).toContain('About this visitor')
    expect(systemMsg).toContain('multi-tenant')
  })
})

describe('GET /api/demo-state — statewave-support persona (hybrid)', () => {
  const visitorSubject = subjectFor(VALID_UUID, 'statewave-support')

  beforeEach(() => {
    setEnv()
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = typeof input === 'string' ? input : (input as Request).url
      if (url.includes('/v1/timeline')) {
        const u = new URL(url)
        // The visitor's per-visitor statewave-support subject — what the
        // hybrid model surfaces in the inspector. The shared docs pack is
        // intentionally NOT read here; it's the chat handler's grounding
        // pool, not the visitor's own memory.
        if (u.searchParams.get('subject_id') === visitorSubject) {
          return new Response(
            JSON.stringify({
              episodes: [
                {
                  id: 'ep-1',
                  source: 'demo-web-chat',
                  type: 'conversation',
                  payload: {
                    messages: [
                      { role: 'user', content: 'Does Statewave support multi-tenant?' },
                      { role: 'assistant', content: 'Yes — see deployment/multi-tenant.md.' },
                    ],
                  },
                  created_at: '2026-05-01T00:00:00Z',
                },
              ],
              memories: [
                {
                  id: 'mv-1',
                  kind: 'profile_fact',
                  content: 'Visitor is exploring multi-tenant deployment options.',
                  confidence: 0.85,
                },
              ],
            }),
            { status: 200 },
          )
        }
        // Any other timeline lookup (e.g. the shared docs subject) means
        // demo-state is leaking the docs pack as visitor memory — fail loudly.
        throw new Error(
          `demo-state must not read from any subject other than the visitor subject; got ${u.searchParams.get('subject_id')}`,
        )
      }
      throw new Error(`Unexpected fetch in demo-state docs test: ${url}`)
    })
  })
  afterEach(() => vi.restoreAllMocks())

  it('returns the per-visitor subject and surfaces the visitor\'s OWN memories — not the docs pack', async () => {
    const resp = await demoState(
      makeRequest('GET', 'http://test/api/demo-state?persona=statewave-support', {
        headers: { cookie: cookieHeader(VALID_UUID) },
      }),
    )
    expect(resp.status).toBe(200)
    const data = await resp.json()
    expect(data.subjectId).toBe(visitorSubject)
    expect(data.subjectId).not.toBe(DOCS_SUBJECT_ID)
    expect(data.persona).toBe('statewave-support')
    // Visitor's chat history is rehydrated like any other persona.
    expect(data.episodes).toHaveLength(2)
    expect(data.episodes[0].role).toBe('user')
    expect(data.episodes[0].content).toContain('multi-tenant')
    expect(data.episodeCount).toBe(1)
    // The visitor's compiled memories are surfaced — what STATEWAVE remembers
    // about THEM, not what the docs pack contains.
    expect(data.memories).toHaveLength(1)
    expect(data.memories[0].content).toContain('multi-tenant')
  })

  it('issues a fresh cookie and returns empty visitor state for first-time visitors', async () => {
    const resp = await demoState(
      makeRequest('GET', 'http://test/api/demo-state?persona=statewave-support'),
    )
    expect(resp.status).toBe(200)
    const setCookie = resp.headers.get('set-cookie')
    expect(setCookie).toMatch(/sw_demo_visitor=[0-9a-f-]{36}/)
    const data = await resp.json()
    // First-time visitors get the per-visitor subject id (with the new uuid)
    // but no memories yet — they fill as the visitor chats.
    expect(data.subjectId).toMatch(/^demo_web_[0-9a-f]{32}__statewave-support$/)
    expect(data.subjectId).not.toBe(DOCS_SUBJECT_ID)
    expect(data.episodeCount).toBe(0)
    expect(data.memories).toEqual([])
  })
})

describe('POST /api/demo-seed — statewave-support persona (no-op)', () => {
  beforeEach(() => {
    setEnv()
    // The hybrid model has no doc-pack copy step, so demo-seed should not
    // call Statewave at all for this persona. Any fetch is a regression
    // (docs pack copy or accidental write).
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = typeof input === 'string' ? input : (input as Request).url
      throw new Error(`demo-seed must not fetch for the no-seed persona: ${url}`)
    })
  })
  afterEach(() => vi.restoreAllMocks())

  it('accepts statewave-support as a no-op and never touches Statewave', async () => {
    const resp = await demoSeed(
      makeRequest('POST', 'http://test/api/demo-seed', {
        headers: { 'content-type': 'application/json', cookie: cookieHeader(VALID_UUID) },
        body: JSON.stringify({ persona: 'statewave-support' }),
      }),
    )
    expect(resp.status).toBe(200)
    const data = await resp.json()
    expect(data.seeded).toBe(false)
    expect(data.reason).toBe('no-seed-needed')
    expect(data.persona).toBe('statewave-support')
    // The returned subject is the visitor's per-visitor statewave-support
    // subject — that's where memory will accrue as they chat.
    expect(data.subjectId).toBe(subjectFor(VALID_UUID, 'statewave-support'))
    expect(globalThis.fetch as ReturnType<typeof vi.fn>).not.toHaveBeenCalled()
  })

  it('issues a fresh cookie when no visitor cookie is present', async () => {
    const resp = await demoSeed(
      makeRequest('POST', 'http://test/api/demo-seed', {
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ persona: 'statewave-support' }),
      }),
    )
    expect(resp.status).toBe(200)
    const setCookie = resp.headers.get('set-cookie')
    expect(setCookie).toMatch(/sw_demo_visitor=[0-9a-f-]{36}/)
    const data = await resp.json()
    expect(data.reason).toBe('no-seed-needed')
    expect(data.subjectId).toMatch(/^demo_web_[0-9a-f]{32}__statewave-support$/)
  })
})

describe('POST /api/demo-reset — never deletes the docs subject', () => {
  let deletedSubjects: string[] = []

  beforeEach(() => {
    setEnv()
    deletedSubjects = []
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = typeof input === 'string' ? input : (input as Request).url
      const method = (init?.method ?? (input as Request).method ?? 'GET').toUpperCase()
      if (method === 'DELETE' && url.includes('/v1/subjects/')) {
        const sid = decodeURIComponent(url.split('/v1/subjects/')[1])
        deletedSubjects.push(sid)
        return new Response('{}', { status: 200 })
      }
      throw new Error(`Unexpected fetch in demo-reset test: ${method} ${url}`)
    })
  })
  afterEach(() => vi.restoreAllMocks())

  it('deletes visitor-memory subjects (incl. per-visitor statewave-support) but never the shared docs subject', async () => {
    const resp = await demoReset(
      makeRequest('POST', 'http://test/api/demo-reset', {
        headers: { cookie: cookieHeader(VALID_UUID) },
      }),
    )
    expect(resp.status).toBe(200)
    expect(deletedSubjects.length).toBeGreaterThan(0)
    expect(deletedSubjects).not.toContain(DOCS_SUBJECT_ID)
    // The per-visitor statewave-support subject MUST be in the wipe — that's
    // where the visitor's accrued docs-persona memory lives.
    expect(deletedSubjects).toContain(subjectFor(VALID_UUID, 'statewave-support'))
    // Sanity: every deleted subject is a per-visitor subject.
    for (const sid of deletedSubjects) {
      expect(sid.startsWith('demo_web_')).toBe(true)
    }
  })
})
