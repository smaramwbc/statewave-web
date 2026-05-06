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
} from '../server/statewave-client'
import widgetChat from '../server/handlers/widget-chat'

const VALID_UUID = '11111111-2222-4333-8444-555555555555'

function cookieHeader(uuid: string): string {
  return `sw_demo_visitor=${uuid}`
}
function makeRequest(method: string, url: string, init: RequestInit = {}): Request {
  return new Request(url, { method, ...init })
}
function setEnv() {
  // No OPENAI_API_KEY here on purpose — the website no longer talks to OpenAI
  // directly; chat completions flow through the Statewave server's
  // /v1/llm/complete endpoint, authenticated with STATEWAVE_API_KEY.
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

  it('caps the result at the limit (default 3)', () => {
    // Lowered from 4 → 3 to reduce citation noise on simple questions
    // where the top 3 docs are almost always the strongest matches and
    // the 4th tends to be a tangential mention.
    const eps = Array.from({ length: 10 }, (_, i) => ({
      id: `e${i}`,
      payload: { breadcrumb: `B${i}` },
      provenance: { doc_path: `doc-${i}.md` },
    }))
    expect(resolveDocSources(bundle({ episodes: eps }))).toHaveLength(3)
    expect(resolveDocSources(bundle({ episodes: eps }), 2)).toHaveLength(2)
    // Explicit higher cap still respected when callers want it.
    expect(resolveDocSources(bundle({ episodes: eps }), 5)).toHaveLength(5)
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
  let lastEpisodeWriteSubject = ''
  let lastCompileSubject = ''

  beforeEach(() => {
    setEnv()
    lastEpisodeWriteSubject = ''
    lastCompileSubject = ''
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = typeof input === 'string' ? input : (input as Request).url
      if (url.includes('/v1/timeline')) {
        return new Response(JSON.stringify({ episodes: [], memories: [] }), { status: 200 })
      }
      if (url.includes('/v1/context')) {
        // Hybrid path makes two /v1/context calls (docs + visitor). Disambiguate
        // by request body subject_id. The visitor-context call returns an empty
        // bundle so citations come purely from the docs context.
        const body = init?.body ? JSON.parse(init.body as string) : {}
        if (body.subject_id !== DOCS_SUBJECT_ID) {
          return new Response(
            JSON.stringify({
              subject_id: body.subject_id,
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
        // Wire-shape response with episodes[] and source_episode_ids — what the
        // server actually returns from POST /v1/context against the docs subject.
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
      if (url.includes('/v1/episodes')) {
        // Hybrid path writes the visitor turn to the visitor subject. Capture
        // the subject so a separate test can pin "never written to docs".
        const body = init?.body ? JSON.parse(init.body as string) : {}
        lastEpisodeWriteSubject = body.subject_id
        return new Response(JSON.stringify({ id: 'ep-new' }), { status: 201 })
      }
      if (url.includes('/v1/memories/compile')) {
        const body = init?.body ? JSON.parse(init.body as string) : {}
        lastCompileSubject = body.subject_id
        return new Response(JSON.stringify({ memories_created: 0, memories: [] }), { status: 200 })
      }
      if (url.includes('/v1/llm/complete')) {
        return new Response(
          JSON.stringify({ reply: 'PostgreSQL with pgvector.' }),
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
    // Hybrid contract: the chat turn must persist to the visitor's subject —
    // never to the shared docs subject. Same for compile.
    expect(lastEpisodeWriteSubject).not.toBe(DOCS_SUBJECT_ID)
    expect(lastEpisodeWriteSubject).toMatch(/^demo_web_[0-9a-f]{32}__statewave-support$/)
    expect(lastCompileSubject).not.toBe(DOCS_SUBJECT_ID)
    expect(lastCompileSubject).toMatch(/^demo_web_[0-9a-f]{32}__statewave-support$/)
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
  let docsTimelineCalls = 0
  let lastSystemPrompt = ''

  beforeEach(() => {
    setEnv()
    adminEpisodesCalls = 0
    docsTimelineCalls = 0
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
        // The hybrid path uses /v1/timeline against the per-visitor subject
        // for the episode-cap pre-check — that's expected and harmless.
        // What we MUST NOT regress to is using /v1/timeline against the docs
        // subject for citation lookup, because timeline hard-caps at 100
        // and would silently drop citations from larger packs. Track docs-
        // subject hits separately so the test can assert that count is 0.
        const u = new URL(url)
        if (u.searchParams.get('subject_id') === DOCS_SUBJECT_ID) docsTimelineCalls++
        return new Response(JSON.stringify({ episodes: [], memories: [] }), { status: 200 })
      }
      if (url.includes('/v1/context')) {
        // Production-shape: facts with source_episode_ids, but episodes[]
        // is empty — server elided the raw episodes for token efficiency.
        // Hybrid path makes two /v1/context calls (docs + visitor); only the
        // docs call carries the citation-bearing facts.
        const body = init?.body ? JSON.parse(init.body as string) : {}
        if (body.subject_id !== DOCS_SUBJECT_ID) {
          return new Response(
            JSON.stringify({
              subject_id: body.subject_id,
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
      if (url.includes('/v1/episodes')) {
        // Visitor-subject write — expected on the hybrid path. Don't capture
        // here; the previous block has the contract test.
        return new Response(JSON.stringify({ id: 'ep-new' }), { status: 201 })
      }
      if (url.includes('/v1/memories/compile')) {
        return new Response(JSON.stringify({ memories_created: 0, memories: [] }), { status: 200 })
      }
      if (url.includes('/v1/llm/complete')) {
        // Capture the system prompt the model actually receives so we can
        // assert it contains no [kind] tags. The Statewave-server endpoint
        // accepts the same OpenAI-style messages array, so the system
        // message is still messages[0].
        try {
          const body = JSON.parse((init?.body as string) ?? '{}')
          const sys = body.messages?.find((m: { role: string }) => m.role === 'system')
          lastSystemPrompt = sys?.content ?? ''
        } catch {
          /* ignore */
        }
        return new Response(JSON.stringify({ reply: 'Postgres + pgvector.' }), { status: 200 })
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
    // Hybrid path is allowed to call /v1/timeline against the visitor subject
    // (cap pre-check), but MUST NOT call it against the docs subject for
    // citation lookup — that endpoint hard-caps at 100 episodes.
    expect(docsTimelineCalls).toBe(0)
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

describe('POST /api/widget-chat — citations align with top-K retrieved memories', () => {
  // Regression guard for a real production bug: `wantedEpisodeIds` was
  // built from EVERY retrieved memory's source_episode_ids (often 40+
  // memories). The longest doc-pack docs (backup-restore, migrations,
  // troubleshooting) have far more episodes per doc than topical docs
  // (getting-started, api/v1-contract). They dominated by raw episode
  // count and the citation strip showed the same three docs regardless
  // of question. The fix caps the walk to the TOP-K (= 5) memories so
  // citations align with what the model actually grounded the answer in.

  beforeEach(() => {
    setEnv()
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = typeof input === 'string' ? input : (input as Request).url
      if (url.includes('/admin/subjects/') && url.includes('/episodes')) {
        // Return episodes for ALL doc paths the test fixture references
        // — DB insertion order would put the noisy docs first, exactly
        // the regression we're guarding against.
        return new Response(
          JSON.stringify({
            episodes: [
              { id: 'noise-1', source: 'docs', type: 'doc_section', payload: { breadcrumb: 'Backup' }, provenance: { doc_path: 'dev/backup-restore.md' } },
              { id: 'noise-2', source: 'docs', type: 'doc_section', payload: { breadcrumb: 'Migrations' }, provenance: { doc_path: 'deployment/migrations.md' } },
              { id: 'noise-3', source: 'docs', type: 'doc_section', payload: { breadcrumb: 'Troubleshooting' }, provenance: { doc_path: 'deployment/troubleshooting.md' } },
              { id: 'top-1', source: 'docs', type: 'doc_section', payload: { breadcrumb: 'Getting started › Install SDK' }, provenance: { doc_path: 'getting-started.md' } },
              { id: 'top-2', source: 'docs', type: 'doc_section', payload: { breadcrumb: 'API › Memories' }, provenance: { doc_path: 'api/v1-contract.md' } },
              { id: 'top-3', source: 'docs', type: 'doc_section', payload: { breadcrumb: 'Architecture › Overview' }, provenance: { doc_path: 'architecture/overview.md' } },
            ],
          }),
          { status: 200 },
        )
      }
      if (url.includes('/v1/timeline')) {
        return new Response(JSON.stringify({ episodes: [], memories: [] }), { status: 200 })
      }
      if (url.includes('/v1/context')) {
        const body = init?.body ? JSON.parse(init.body as string) : {}
        if (body.subject_id !== DOCS_SUBJECT_ID) {
          return new Response(
            JSON.stringify({
              subject_id: body.subject_id,
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
        // Eight ranked memories, no inline episodes. The first five
        // (top-K) point to the *topical* docs; the last three point to
        // the noisy docs that used to dominate citations. Production-
        // shape: many memories per query, source_episode_ids only.
        return new Response(
          JSON.stringify({
            subject_id: DOCS_SUBJECT_ID,
            task: 't',
            facts: [
              { id: 'm-1', kind: 'profile_fact', content: 'Install with npm install statewave-ts.', confidence: 0.95, source_episode_ids: ['top-1'] },
              { id: 'm-2', kind: 'profile_fact', content: 'GET /v1/memories/search returns ranked memories.', confidence: 0.92, source_episode_ids: ['top-2'] },
              { id: 'm-3', kind: 'profile_fact', content: 'Statewave is a memory runtime for AI agents.', confidence: 0.9, source_episode_ids: ['top-3'] },
              { id: 'm-4', kind: 'profile_fact', content: 'Statewave runs on Postgres + pgvector.', confidence: 0.88, source_episode_ids: ['top-3'] },
              { id: 'm-5', kind: 'profile_fact', content: 'Subjects are the unit of memory organisation.', confidence: 0.85, source_episode_ids: ['top-3'] },
              // Below the top-K cutoff — these MUST NOT show up in citations.
              { id: 'm-6', kind: 'profile_fact', content: 'Long ops doc tangentially mentions Postgres backup.', confidence: 0.4, source_episode_ids: ['noise-1'] },
              { id: 'm-7', kind: 'profile_fact', content: 'Migrations doc references state restore.', confidence: 0.35, source_episode_ids: ['noise-2'] },
              { id: 'm-8', kind: 'profile_fact', content: 'Troubleshooting tip about restore failures.', confidence: 0.3, source_episode_ids: ['noise-3'] },
            ],
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
        return new Response(JSON.stringify({ memories_created: 0, memories: [] }), { status: 200 })
      }
      if (url.includes('/v1/llm/complete')) {
        return new Response(JSON.stringify({ reply: 'Use npm install statewave-ts.' }), { status: 200 })
      }
      throw new Error(`Unexpected fetch in citation top-K test: ${url}`)
    })
  })
  afterEach(() => vi.restoreAllMocks())

  it('cites only docs reached via the top-K memories (lower-ranked memories are excluded)', async () => {
    const req = makeRequest('POST', 'http://test/api/widget-chat', {
      headers: { 'content-type': 'application/json', cookie: cookieHeader(VALID_UUID) },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'How do I install with npm?' }],
        mode: 'statewave',
        persona: 'statewave-support',
      }),
    })
    const resp = await widgetChat(req)
    expect(resp.status).toBe(200)
    const data = await resp.json()
    const docPaths = (data.sources ?? []).map((s: { doc_path: string }) => s.doc_path)
    // The top-K (= 5) memories pointed only to: getting-started.md,
    // api/v1-contract.md, architecture/overview.md. None of the noise
    // docs may appear, even though they're physically present in the
    // admin episodes response.
    expect(docPaths).toContain('getting-started.md')
    expect(docPaths).not.toContain('dev/backup-restore.md')
    expect(docPaths).not.toContain('deployment/migrations.md')
    expect(docPaths).not.toContain('deployment/troubleshooting.md')
    // Limit is 3 by default, so we expect <= 3 unique citations.
    expect(docPaths.length).toBeGreaterThan(0)
    expect(docPaths.length).toBeLessThanOrEqual(3)
  })

  it('orders citations by the rank of the memory that referenced them, not DB insertion order', async () => {
    const req = makeRequest('POST', 'http://test/api/widget-chat', {
      headers: { 'content-type': 'application/json', cookie: cookieHeader(VALID_UUID) },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'How do I install with npm?' }],
        mode: 'statewave',
        persona: 'statewave-support',
      }),
    })
    const resp = await widgetChat(req)
    const data = await resp.json()
    const docPaths = (data.sources ?? []).map((s: { doc_path: string }) => s.doc_path)
    // m-1 (highest score) points to getting-started.md → must be first.
    // m-2 (next) → api/v1-contract.md → second.
    // m-3..m-5 all point to architecture/overview.md → third.
    expect(docPaths[0]).toBe('getting-started.md')
    expect(docPaths[1]).toBe('api/v1-contract.md')
    expect(docPaths[2]).toBe('architecture/overview.md')
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
      if (url.includes('/v1/llm/complete')) {
        return new Response(JSON.stringify({ reply: 'hi' }), { status: 200 })
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
