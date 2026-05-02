// @vitest-environment node
/**
 * Tests for the Statewave Support persona — the docs-grounded, read-only
 * persona that reads from the shared `statewave-support-docs` subject.
 *
 * Covers the contract that prevents the persona from corrupting or leaking
 * the canonical docs pack:
 *   * widget-chat routes to DOCS_SUBJECT_ID (not a per-visitor subject)
 *   * widget-chat does NOT write episodes or compile against the docs subject
 *   * widget-chat injects docs memories from the shared subject into the prompt
 *   * demo-state with persona=statewave-support exposes docs memories but
 *     reports episodeCount=0 (no visitor-driven turns) and no chat history
 *   * demo-seed refuses the persona — the pack is built upstream, not seeded
 *   * demo-reset still works for visitor-memory subjects and never targets
 *     the docs subject
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DOCS_SHARED_PERSONAS,
  DOCS_SUBJECT_ID,
  isDocsSharedPersona,
  isKnownPersona,
  subjectFor,
  subjectForPersona,
} from '../api/_demo'
import demoState from '../api/demo-state'
import demoSeed from '../api/demo-seed'
import demoReset from '../api/demo-reset'
import widgetChat from '../api/widget-chat'

const VALID_UUID = '11111111-2222-4333-8444-555555555555'

function cookieHeader(uuid: string): string {
  return `sw_demo_visitor=${uuid}`
}

function makeRequest(method: string, url: string, init: RequestInit = {}): Request {
  return new Request(url, { method, ...init })
}

function setEnv() {
  process.env.OPENAI_API_KEY = 'test-key'
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

describe('POST /api/widget-chat — statewave-support persona', () => {
  let calls: Array<{ url: string; init?: RequestInit }> = []

  beforeEach(() => {
    setEnv()
    calls = []
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = typeof input === 'string' ? input : (input as Request).url
      calls.push({ url, init: init as RequestInit })
      if (url.includes('/v1/context')) {
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
      if (url.includes('api.openai.com')) {
        return new Response(
          JSON.stringify({
            choices: [{ message: { content: 'Statewave uses PostgreSQL + pgvector.' } }],
          }),
          { status: 200 },
        )
      }
      throw new Error(`Unexpected fetch in docs persona test: ${url}`)
    })
  })
  afterEach(() => vi.restoreAllMocks())

  it('routes to the shared docs subject and never writes/compiles', async () => {
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
    expect(data.subjectId).toBe(DOCS_SUBJECT_ID)
    expect(data.persisted).toBe(false)
    expect(data.reply).toBe('Statewave uses PostgreSQL + pgvector.')

    const urls = calls.map((c) => c.url)
    // Read context from the docs subject — yes.
    expect(urls.some((u) => u.includes('/v1/context'))).toBe(true)
    // But never write an episode, run compile, or fetch a timeline against
    // the visitor or the docs subject. That's the read-only contract.
    expect(urls.some((u) => u.includes('/v1/episodes'))).toBe(false)
    expect(urls.some((u) => u.includes('/v1/memories/compile'))).toBe(false)
    expect(urls.some((u) => u.includes('/v1/timeline'))).toBe(false)
    // The /v1/context call targets the docs subject specifically.
    const ctxCall = calls.find((c) => c.url.includes('/v1/context'))
    const ctxBody = JSON.parse(ctxCall!.init?.body as string)
    expect(ctxBody.subject_id).toBe(DOCS_SUBJECT_ID)
  })

  it('injects docs memories into the system prompt with a docs-grounding header', async () => {
    const req = makeRequest('POST', 'http://test/api/widget-chat', {
      headers: { 'content-type': 'application/json', cookie: cookieHeader(VALID_UUID) },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'How do I deploy?' }],
        mode: 'statewave',
        persona: 'statewave-support',
      }),
    })
    await widgetChat(req)
    const llmCall = calls.find((c) => c.url.includes('api.openai.com'))
    expect(llmCall).toBeDefined()
    const body = JSON.parse(llmCall!.init?.body as string)
    const systemMsg = body.messages.find((m: { role: string }) => m.role === 'system')!.content as string
    // The docs-grounding header tells the model the context is from official docs.
    expect(systemMsg).toContain('Statewave Support assistant')
    expect(systemMsg).toContain('official Statewave docs')
    // The compiled docs memory was injected verbatim.
    expect(systemMsg).toContain('PostgreSQL with pgvector')
  })
})

describe('GET /api/demo-state — statewave-support persona', () => {
  beforeEach(() => {
    setEnv()
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = typeof input === 'string' ? input : (input as Request).url
      if (url.includes('/v1/timeline')) {
        const u = new URL(url)
        // The docs subject's timeline contains the curated doc-section
        // episodes plus their compiled memories. We only return memories
        // because demo-state for the docs persona doesn't surface episodes.
        if (u.searchParams.get('subject_id') === DOCS_SUBJECT_ID) {
          return new Response(
            JSON.stringify({
              episodes: Array.from({ length: 178 }, (_, i) => ({
                id: `ep-${i}`,
                source: 'statewave-docs',
                type: 'doc_section',
                payload: {},
                created_at: '2026-05-01T00:00:00Z',
              })),
              memories: [
                {
                  id: 'm-1',
                  kind: 'episode_summary',
                  content: 'Statewave uses PostgreSQL + pgvector.',
                  confidence: 0.9,
                },
                {
                  id: 'm-2',
                  kind: 'episode_summary',
                  content: 'Heuristic compilation is the default; LLM compilation is opt-in.',
                  confidence: 0.85,
                },
              ],
            }),
            { status: 200 },
          )
        }
      }
      throw new Error(`Unexpected fetch in demo-state docs test: ${url}`)
    })
  })
  afterEach(() => vi.restoreAllMocks())

  it('returns the docs subject and surfaces docs-derived memories', async () => {
    const resp = await demoState(
      makeRequest('GET', 'http://test/api/demo-state?persona=statewave-support', {
        headers: { cookie: cookieHeader(VALID_UUID) },
      }),
    )
    expect(resp.status).toBe(200)
    const data = await resp.json()
    expect(data.subjectId).toBe(DOCS_SUBJECT_ID)
    expect(data.persona).toBe('statewave-support')
    // No visitor chat history rehydrated — docs episodes are doc sections,
    // not turns.
    expect(data.episodes).toEqual([])
    // Visitor-driven episode count is 0 even though the docs subject has 178
    // episodes — those don't count as the visitor's session.
    expect(data.episodeCount).toBe(0)
    // But docs memories ARE surfaced so the inspector reflects real grounded
    // knowledge.
    expect(data.memories).toHaveLength(2)
    expect(data.memories[0].content).toContain('PostgreSQL')
  })

  it('issues a fresh cookie for first-time docs-persona visitors', async () => {
    const resp = await demoState(
      makeRequest('GET', 'http://test/api/demo-state?persona=statewave-support'),
    )
    expect(resp.status).toBe(200)
    const setCookie = resp.headers.get('set-cookie')
    expect(setCookie).toMatch(/sw_demo_visitor=[0-9a-f-]{36}/)
    const data = await resp.json()
    expect(data.subjectId).toBe(DOCS_SUBJECT_ID)
    expect(data.episodeCount).toBe(0)
  })
})

describe('POST /api/demo-seed — statewave-support persona', () => {
  beforeEach(() => {
    setEnv()
    // demo-seed should reject before making any network calls — but mock to
    // catch any accidental fetches.
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = typeof input === 'string' ? input : (input as Request).url
      throw new Error(`demo-seed should not fetch when refusing docs persona: ${url}`)
    })
  })
  afterEach(() => vi.restoreAllMocks())

  it('refuses the docs persona with a clear reason and does not touch Statewave', async () => {
    const resp = await demoSeed(
      makeRequest('POST', 'http://test/api/demo-seed', {
        headers: { 'content-type': 'application/json', cookie: cookieHeader(VALID_UUID) },
        body: JSON.stringify({ persona: 'statewave-support' }),
      }),
    )
    expect(resp.status).toBe(400)
    const data = await resp.json()
    expect(data.seeded).toBe(false)
    expect(data.reason).toBe('docs-shared')
    expect(String(data.error)).toMatch(/docs pack/i)
    expect(globalThis.fetch as ReturnType<typeof vi.fn>).not.toHaveBeenCalled()
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

  it('deletes visitor-memory subjects but never the shared docs subject', async () => {
    const resp = await demoReset(
      makeRequest('POST', 'http://test/api/demo-reset', {
        headers: { cookie: cookieHeader(VALID_UUID) },
      }),
    )
    expect(resp.status).toBe(200)
    expect(deletedSubjects.length).toBeGreaterThan(0)
    expect(deletedSubjects).not.toContain(DOCS_SUBJECT_ID)
    // Sanity: every deleted subject is a per-visitor subject.
    for (const sid of deletedSubjects) {
      expect(sid.startsWith('demo_web_')).toBe(true)
    }
  })
})
