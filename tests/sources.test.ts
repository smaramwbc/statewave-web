// @vitest-environment node
/**
 * Tests for the docs-grounded citation pipeline:
 *   1. Pure `resolveDocSources` helper — dedup, ranking, fallback paths,
 *      missing-provenance graceful handling.
 *   2. End-to-end through the widget-chat handler — only docs-shared
 *      replies carry a `sources` array; visitor-memory replies don't.
 *
 * Sources must come from the retrieved context (what the model was given),
 * never from the model's reply text — these tests pin that contract.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DOCS_SUBJECT_ID,
  resolveDocSources,
  type ContextBundle,
} from '../api/_demo'
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

// Helper: build a minimal context bundle with the fields the resolver reads.
function bundle(overrides: Partial<ContextBundle> = {}): ContextBundle {
  return {
    subject_id: DOCS_SUBJECT_ID,
    task: 't',
    facts: [],
    procedures: [],
    episodes: [],
    assembled_context: '',
    token_estimate: 0,
    ...overrides,
  }
}

describe('resolveDocSources', () => {
  it('returns [] for null / undefined / empty bundles', () => {
    expect(resolveDocSources(null)).toEqual([])
    expect(resolveDocSources(undefined)).toEqual([])
    expect(resolveDocSources(bundle())).toEqual([])
  })

  it('extracts sources from raw episodes in ranked order', () => {
    const result = resolveDocSources(
      bundle({
        episodes: [
          {
            id: 'e1',
            payload: {
              breadcrumb: 'Architecture Overview › Compilation pipeline',
              url: 'https://example/docs/architecture/overview.md#compilation-pipeline',
            },
            provenance: { doc_path: 'architecture/overview.md' },
          },
          {
            id: 'e2',
            payload: {
              breadcrumb: 'Deployment Guide › Fly.io',
              url: 'https://example/docs/deployment/guide.md#flyio',
            },
            provenance: { doc_path: 'deployment/guide.md' },
          },
        ],
      }),
    )
    expect(result).toHaveLength(2)
    expect(result[0].doc_path).toBe('architecture/overview.md')
    expect(result[0].breadcrumb).toContain('Compilation pipeline')
    expect(result[0].url).toContain('overview.md')
    expect(result[1].doc_path).toBe('deployment/guide.md')
  })

  it('deduplicates by doc_path keeping the first occurrence', () => {
    const result = resolveDocSources(
      bundle({
        episodes: [
          {
            id: 'e1',
            payload: { breadcrumb: 'Overview › Section A' },
            provenance: { doc_path: 'architecture/overview.md' },
          },
          {
            id: 'e2',
            payload: { breadcrumb: 'Overview › Section B' },
            provenance: { doc_path: 'architecture/overview.md' },
          },
          {
            id: 'e3',
            payload: { breadcrumb: 'Deployment › Fly' },
            provenance: { doc_path: 'deployment/guide.md' },
          },
        ],
      }),
    )
    expect(result.map((s) => s.doc_path)).toEqual([
      'architecture/overview.md',
      'deployment/guide.md',
    ])
    expect(result[0].breadcrumb).toContain('Section A')
  })

  it('caps the result at the limit (default 4)', () => {
    const eps = Array.from({ length: 10 }, (_, i) => ({
      id: `e${i}`,
      payload: { breadcrumb: `B${i}` },
      provenance: { doc_path: `doc-${i}.md` },
    }))
    expect(resolveDocSources(bundle({ episodes: eps }))).toHaveLength(4)
    expect(resolveDocSources(bundle({ episodes: eps }), 2)).toHaveLength(2)
  })

  it('falls back to memories.source_episode_ids when episodes alone do not cover', () => {
    const result = resolveDocSources(
      bundle({
        // The summary-only case: the bundle returned the compiled summary
        // but also still ships its source episode in `episodes[]`.
        facts: [
          {
            id: 'm1',
            content: 'Heuristic compilation is the default.',
            kind: 'episode_summary',
            confidence: 0.9,
            source_episode_ids: ['e-source-1'],
          },
        ],
        episodes: [
          {
            id: 'e-source-1',
            payload: {
              breadcrumb: 'Compiler Modes › Heuristic',
              url: 'https://example/docs/architecture/compiler-modes.md#heuristic',
            },
            provenance: { doc_path: 'architecture/compiler-modes.md' },
          },
        ],
      }),
    )
    expect(result).toHaveLength(1)
    expect(result[0].doc_path).toBe('architecture/compiler-modes.md')
  })

  it('drops episodes without a doc_path (i.e. non-docs-pack data)', () => {
    const result = resolveDocSources(
      bundle({
        episodes: [
          // Visitor-memory style episode: no doc_path
          { id: 'e1', payload: { messages: [{ role: 'user', content: 'hi' }] }, provenance: {} },
          // Docs-pack episode
          {
            id: 'e2',
            payload: { breadcrumb: 'Privacy' },
            provenance: { doc_path: 'architecture/privacy-and-data-flow.md' },
          },
        ],
      }),
    )
    expect(result).toHaveLength(1)
    expect(result[0].doc_path).toBe('architecture/privacy-and-data-flow.md')
  })

  it('falls back to title or doc_path when breadcrumb is missing', () => {
    const result = resolveDocSources(
      bundle({
        episodes: [
          {
            id: 'e1',
            payload: { title: 'Getting Started' },
            provenance: { doc_path: 'getting-started.md' },
          },
          {
            id: 'e2',
            payload: {},
            provenance: { doc_path: 'SUPPORT.md' },
          },
        ],
      }),
    )
    expect(result[0].breadcrumb).toBe('Getting Started')
    expect(result[1].breadcrumb).toBe('SUPPORT.md')
  })

  it('synthesises a GitHub URL when payload.url is missing', () => {
    const result = resolveDocSources(
      bundle({
        episodes: [
          {
            id: 'e1',
            payload: { breadcrumb: 'X' },
            provenance: { doc_path: 'deployment/guide.md' },
          },
        ],
      }),
    )
    expect(result[0].url).toMatch(/^https:\/\//)
    expect(result[0].url).toContain('deployment/guide.md')
  })
})

describe('POST /api/widget-chat — sources in the response', () => {
  beforeEach(() => {
    setEnv()
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = typeof input === 'string' ? input : (input as Request).url
      if (url.includes('/v1/timeline')) {
        return new Response(JSON.stringify({ episodes: [], memories: [] }), { status: 200 })
      }
      if (url.includes('/v1/context')) {
        // Wire-shape response with episodes[] and source_episode_ids — what the
        // server actually returns from POST /v1/context.
        return new Response(
          JSON.stringify({
            subject_id: DOCS_SUBJECT_ID,
            task: 't',
            facts: [
              {
                id: 'm-1',
                kind: 'episode_summary',
                content: 'Statewave uses PostgreSQL with pgvector.',
                confidence: 0.9,
                source_episode_ids: ['e-1'],
              },
            ],
            procedures: [],
            episodes: [
              {
                id: 'e-1',
                source: 'statewave-docs',
                type: 'doc_section',
                payload: {
                  title: 'Compilation pipeline',
                  breadcrumb: 'Architecture Overview › Compilation pipeline',
                  url: 'https://github.com/smaramwbc/statewave-docs/blob/main/architecture/overview.md#compilation-pipeline',
                },
                provenance: { doc_path: 'architecture/overview.md' },
              },
              {
                id: 'e-2',
                source: 'statewave-docs',
                type: 'doc_section',
                payload: {
                  breadcrumb: 'Deployment › Fly.io',
                  url: 'https://github.com/smaramwbc/statewave-docs/blob/main/deployment/guide.md#flyio',
                },
                provenance: { doc_path: 'deployment/guide.md' },
              },
            ],
            assembled_context: '',
            token_estimate: 0,
          }),
          { status: 200 },
        )
      }
      if (url.includes('/v1/episodes') || url.includes('/v1/memories/compile')) {
        // Defensive — docs persona must NOT call these. Throwing surfaces as a
        // test failure if the contract regresses.
        throw new Error(`docs persona must not call ${url}`)
      }
      if (url.includes('api.openai.com')) {
        return new Response(
          JSON.stringify({ choices: [{ message: { content: 'PostgreSQL with pgvector.' } }] }),
          { status: 200 },
        )
      }
      throw new Error(`Unexpected fetch in sources test: ${url}`)
    })
  })
  afterEach(() => vi.restoreAllMocks())

  it('docs-shared persona reply carries a deduplicated sources array', async () => {
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
    expect(Array.isArray(data.sources)).toBe(true)
    expect(data.sources).toHaveLength(2)
    expect(data.sources[0]).toMatchObject({
      doc_path: 'architecture/overview.md',
      breadcrumb: expect.stringContaining('Compilation pipeline'),
      url: expect.stringContaining('overview.md'),
    })
    expect(data.sources[1].doc_path).toBe('deployment/guide.md')
  })
})

describe('POST /api/widget-chat — admin-episodes fallback for citations', () => {
  // Pins the production-observed shape: /v1/context returns compiled
  // memories with source_episode_ids but NO inline episodes. The fallback
  // resolves citations via /admin/subjects/{id}/episodes — NOT /v1/timeline,
  // because timeline hard-caps at 100 episodes regardless of limit/offset
  // (verified against statewave-api.fly.dev) which silently drops citations
  // from the back half of any subject larger than 100. This test guards
  // against regressing back to the broken timeline-based path AND against
  // the prompt-format leak that was copying "[kind]" tags into replies.

  let adminEpisodesCalls = 0
  let timelineCalls = 0
  let lastSystemPrompt = ''

  beforeEach(() => {
    setEnv()
    adminEpisodesCalls = 0
    timelineCalls = 0
    lastSystemPrompt = ''
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = typeof input === 'string' ? input : (input as Request).url
      if (url.includes('/admin/subjects/') && url.includes('/episodes')) {
        adminEpisodesCalls++
        // Admin endpoint returns full episode set — what /v1/timeline cannot.
        return new Response(
          JSON.stringify({
            episodes: [
              {
                id: 'e-postgres',
                source: 'statewave-docs',
                type: 'doc_section',
                payload: {
                  breadcrumb: 'Architecture Overview › Data store',
                  url: 'https://github.com/smaramwbc/statewave-docs/blob/main/architecture/overview.md#data-store',
                },
                provenance: { doc_path: 'architecture/overview.md' },
              },
              // An unrelated episode — must NOT leak into citations because
              // its id is not in any memory.source_episode_ids.
              {
                id: 'e-other',
                source: 'statewave-docs',
                type: 'doc_section',
                payload: { breadcrumb: 'Other section' },
                provenance: { doc_path: 'unrelated.md' },
              },
            ],
          }),
          { status: 200 },
        )
      }
      if (url.includes('/v1/timeline')) {
        timelineCalls++
        // The docs-shared path must NOT use timeline — it caps at 100. Return
        // a sentinel that would break the test if mistakenly used.
        return new Response(JSON.stringify({ episodes: [], memories: [] }), { status: 200 })
      }
      if (url.includes('/v1/context')) {
        // Production-shape: facts with source_episode_ids, but episodes[]
        // is empty — server elided the raw episodes for token efficiency.
        return new Response(
          JSON.stringify({
            subject_id: DOCS_SUBJECT_ID,
            task: 't',
            facts: [
              {
                id: 'm-1',
                kind: 'profile_fact',
                content: 'Statewave uses PostgreSQL with pgvector.',
                confidence: 0.9,
                source_episode_ids: ['e-postgres'],
              },
            ],
            procedures: [],
            episodes: [],
            assembled_context: '',
            token_estimate: 0,
          }),
          { status: 200 },
        )
      }
      if (url.includes('api.openai.com')) {
        // Capture the system prompt the model actually receives so we can
        // assert it contains no [kind] tags.
        try {
          const body = JSON.parse((init?.body as string) ?? '{}')
          const sys = body.messages?.find((m: { role: string }) => m.role === 'system')
          lastSystemPrompt = sys?.content ?? ''
        } catch {
          /* ignore */
        }
        return new Response(
          JSON.stringify({ choices: [{ message: { content: 'Postgres + pgvector.' } }] }),
          { status: 200 },
        )
      }
      throw new Error(`Unexpected fetch in fallback test: ${url}`)
    })
  })
  afterEach(() => vi.restoreAllMocks())

  it('falls back to /admin/subjects/{id}/episodes when /v1/context returns no inline episodes', async () => {
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
    expect(adminEpisodesCalls).toBe(1)
    expect(timelineCalls).toBe(0) // must not regress to the capped endpoint
    expect(data.sources).toHaveLength(1)
    expect(data.sources[0].doc_path).toBe('architecture/overview.md')
    expect(data.sources[0].url).toContain('overview.md')
    // The unrelated episode in the response must NOT appear in citations —
    // only episodes referenced by retrieved memories survive.
    expect(data.sources.find((s: { doc_path: string }) => s.doc_path === 'unrelated.md')).toBeUndefined()
  })

  it('memory context in the system prompt does not leak [kind] tags', async () => {
    // Regression guard for the production bug where the model was copying
    // "(profile_fact)" into user-visible replies because the prompt format
    // was `- [profile_fact] content`. Memories now appear as plain bullets.
    const req = makeRequest('POST', 'http://test/api/widget-chat', {
      headers: { 'content-type': 'application/json', cookie: cookieHeader(VALID_UUID) },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'What database?' }],
        mode: 'statewave',
        persona: 'statewave-support',
      }),
    })
    await widgetChat(req)
    expect(lastSystemPrompt).toContain('Statewave uses PostgreSQL with pgvector.')
    // The bullet must NOT carry a bracketed kind tag.
    expect(lastSystemPrompt).not.toMatch(/\[profile_fact\]/)
    expect(lastSystemPrompt).not.toMatch(/\[episode_summary\]/)
    expect(lastSystemPrompt).not.toMatch(/\[procedure\]/)
    // And the system prompt must not invite hedging when context exists.
    expect(lastSystemPrompt).not.toMatch(/docs don't cover this exactly/i)
  })
})

describe('POST /api/widget-chat — visitor-memory persona has no sources', () => {
  beforeEach(() => {
    setEnv()
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = typeof input === 'string' ? input : (input as Request).url
      if (url.includes('/v1/timeline')) {
        return new Response(JSON.stringify({ episodes: [], memories: [] }), { status: 200 })
      }
      if (url.includes('/v1/context')) {
        return new Response(
          JSON.stringify({
            subject_id: 'demo_web_x',
            task: 't',
            facts: [],
            procedures: [],
            episodes: [],
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
          JSON.stringify({ memories_created: 0, memories: [] }),
          { status: 200 },
        )
      }
      if (url.includes('api.openai.com')) {
        return new Response(
          JSON.stringify({ choices: [{ message: { content: 'hi' } }] }),
          { status: 200 },
        )
      }
      throw new Error(`Unexpected fetch in visitor-memory sources test: ${url}`)
    })
  })
  afterEach(() => vi.restoreAllMocks())

  it('does not attach a sources field on visitor-memory replies', async () => {
    const req = makeRequest('POST', 'http://test/api/widget-chat', {
      headers: { 'content-type': 'application/json', cookie: cookieHeader(VALID_UUID) },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'hi' }],
        mode: 'statewave',
        persona: 'support-agent',
      }),
    })
    const resp = await widgetChat(req)
    expect(resp.status).toBe(200)
    const data = await resp.json()
    // No `sources` key on this code path — the citation UI is docs-grounded only.
    expect(data.sources).toBeUndefined()
  })
})
