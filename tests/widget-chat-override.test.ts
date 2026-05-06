// @vitest-environment node
/**
 * Tests for the eval-only `system_prompt_override` body field on
 * POST /api/widget-chat.
 *
 * The override is forwarded by statewave-admin's Self-Healing Eval to test
 * candidate prompts against the live demo agent without redeploying it. The
 * contract:
 *   * accepted on every mode (stateless / statewave / docs-shared persona)
 *   * appended to the system prompt for the current request only
 *   * never persisted to an episode or memory
 *   * never echoed back to the visitor — only a boolean confirmation flag
 *   * provider keys / bearer tokens / DB URLs are redacted before forwarding
 *   * oversized values are truncated to SYSTEM_PROMPT_OVERRIDE_MAX_BYTES
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DOCS_SUBJECT_ID,
  SYSTEM_PROMPT_OVERRIDE_MAX_BYTES,
  prepareSystemPromptOverride,
  subjectFor,
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
  process.env.STATEWAVE_API_KEY = 'test-key'
  process.env.STATEWAVE_URL = 'https://statewave-api.test'
}

interface FetchCall {
  url: string
  init?: RequestInit
}

/**
 * Mock fetch that returns realistic-shaped responses for every endpoint
 * widget-chat reaches. Captured calls let each test inspect what was sent
 * upstream — in particular, the system message of the /v1/llm/complete call
 * and the body of the /v1/episodes write.
 */
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
    throw new Error(`Unexpected fetch in override test: ${url}`)
  })
  return calls
}

function systemMessageFromLLMCall(calls: FetchCall[]): string {
  const llmCall = calls.find((c) => c.url.includes('/v1/llm/complete'))
  if (!llmCall) throw new Error('No /v1/llm/complete call captured')
  const body = JSON.parse(llmCall.init?.body as string) as { messages: Array<{ role: string; content: string }> }
  const sys = body.messages.find((m) => m.role === 'system')
  if (!sys) throw new Error('No system message in /v1/llm/complete body')
  return sys.content
}

const OVERRIDE_TEXT =
  'Be extra strict: only answer from retrieved facts. If facts are missing, say so plainly.'
const OVERRIDE_HEADER = '## Operator Override (eval-only):'

describe('prepareSystemPromptOverride', () => {
  it('returns null for non-strings, empty strings, and whitespace', () => {
    expect(prepareSystemPromptOverride(undefined)).toBeNull()
    expect(prepareSystemPromptOverride(null)).toBeNull()
    expect(prepareSystemPromptOverride(42)).toBeNull()
    expect(prepareSystemPromptOverride('')).toBeNull()
    expect(prepareSystemPromptOverride('   \n  ')).toBeNull()
  })

  it('returns the trimmed text and reports length when no redaction needed', () => {
    const out = prepareSystemPromptOverride('  be terse  ')
    expect(out).not.toBeNull()
    expect(out!.text).toBe('be terse')
    expect(out!.length).toBe(8)
    expect(out!.truncated).toBe(false)
  })

  it('redacts OpenAI keys, Anthropic keys, bearer tokens, and postgres URLs', () => {
    const raw = [
      'use sk-proj-abcdefghijklmnopqrstuvwxyz1234',
      'and sk-ant-api03-abcdefghijklmnopqrstuvwxyz',
      'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6Ik',
      'db: postgres://user:hunter2@db.internal/prod',
    ].join('\n')
    const out = prepareSystemPromptOverride(raw)!
    expect(out.text).not.toContain('sk-proj-abcdefghij')
    expect(out.text).not.toContain('sk-ant-api03')
    expect(out.text).not.toContain('hunter2')
    expect(out.text).not.toContain('eyJhbGciOiJI')
    expect(out.text).toContain('[REDACTED:openai-key]')
    expect(out.text).toContain('[REDACTED:anthropic-key]')
    expect(out.text).toContain('Bearer [REDACTED]')
    expect(out.text).toContain('postgres://[REDACTED]@[REDACTED]')
  })

  it('truncates inputs that exceed SYSTEM_PROMPT_OVERRIDE_MAX_BYTES', () => {
    const oversized = 'x'.repeat(SYSTEM_PROMPT_OVERRIDE_MAX_BYTES + 500)
    const out = prepareSystemPromptOverride(oversized)!
    expect(out.truncated).toBe(true)
    expect(out.length).toBe(SYSTEM_PROMPT_OVERRIDE_MAX_BYTES)
    expect(out.text.length).toBe(SYSTEM_PROMPT_OVERRIDE_MAX_BYTES)
  })
})

describe('POST /api/widget-chat — system_prompt_override (docs-shared persona)', () => {
  let calls: FetchCall[]
  beforeEach(() => {
    setEnv()
    calls = installFetchMock()
  })
  afterEach(() => vi.restoreAllMocks())

  it('appends the override to the system prompt and echoes the confirmation flag', async () => {
    const req = makeRequest('POST', 'http://test/api/widget-chat', {
      headers: { 'content-type': 'application/json', cookie: cookieHeader(VALID_UUID) },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'What database does Statewave use?' }],
        mode: 'statewave',
        persona: 'statewave-support',
        system_prompt_override: OVERRIDE_TEXT,
      }),
    })
    const resp = await widgetChat(req)
    expect(resp.status).toBe(200)
    const data = await resp.json()
    expect(data.system_prompt_override_applied).toBe(true)

    const sys = systemMessageFromLLMCall(calls)
    expect(sys).toContain(OVERRIDE_HEADER)
    expect(sys).toContain(OVERRIDE_TEXT)
    // The base docs-grounding prompt must still be present — override augments,
    // never replaces.
    expect(sys).toContain('Statewave Support assistant')
  })

  it('does not leak the override into the persisted episode payload or metadata', async () => {
    const req = makeRequest('POST', 'http://test/api/widget-chat', {
      headers: { 'content-type': 'application/json', cookie: cookieHeader(VALID_UUID) },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'How do I deploy?' }],
        mode: 'statewave',
        persona: 'statewave-support',
        system_prompt_override: OVERRIDE_TEXT,
      }),
    })
    await widgetChat(req)
    const writeCall = calls.find(
      (c) =>
        c.url.includes('/v1/episodes') &&
        (c.init?.method ?? 'GET').toUpperCase() === 'POST',
    )
    expect(writeCall).toBeDefined()
    const writeBody = writeCall!.init?.body as string
    expect(writeBody).not.toContain(OVERRIDE_TEXT)
    expect(writeBody).not.toContain('Operator Override')
  })

  it('omits the confirmation flag when no override is provided', async () => {
    const req = makeRequest('POST', 'http://test/api/widget-chat', {
      headers: { 'content-type': 'application/json', cookie: cookieHeader(VALID_UUID) },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'What database does Statewave use?' }],
        mode: 'statewave',
        persona: 'statewave-support',
      }),
    })
    const resp = await widgetChat(req)
    const data = await resp.json()
    expect(data.system_prompt_override_applied).toBeUndefined()
    const sys = systemMessageFromLLMCall(calls)
    expect(sys).not.toContain(OVERRIDE_HEADER)
  })

  it('redacts secrets in the override before forwarding to the LLM', async () => {
    const dirty = `${OVERRIDE_TEXT}\nAlso authenticate with sk-proj-AAAAAAAAAAAAAAAAAAAAAAAA.`
    const req = makeRequest('POST', 'http://test/api/widget-chat', {
      headers: { 'content-type': 'application/json', cookie: cookieHeader(VALID_UUID) },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Q?' }],
        mode: 'statewave',
        persona: 'statewave-support',
        system_prompt_override: dirty,
      }),
    })
    await widgetChat(req)
    const sys = systemMessageFromLLMCall(calls)
    expect(sys).toContain('[REDACTED:openai-key]')
    expect(sys).not.toContain('sk-proj-AAAAAAAAAA')
  })

  it('rejects non-string overrides silently — base prompt unchanged, no flag', async () => {
    const req = makeRequest('POST', 'http://test/api/widget-chat', {
      headers: { 'content-type': 'application/json', cookie: cookieHeader(VALID_UUID) },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Q?' }],
        mode: 'statewave',
        persona: 'statewave-support',
        system_prompt_override: 42,
      }),
    })
    const resp = await widgetChat(req)
    expect(resp.status).toBe(200)
    const data = await resp.json()
    expect(data.system_prompt_override_applied).toBeUndefined()
    const sys = systemMessageFromLLMCall(calls)
    expect(sys).not.toContain(OVERRIDE_HEADER)
  })

  it('still does not target the shared docs subject when persisting after an override', async () => {
    // Regression guard: the override path must not change WHERE the turn is
    // written. The shared docs subject must remain read-only.
    const visitorSubject = subjectFor(VALID_UUID, 'statewave-support')
    const req = makeRequest('POST', 'http://test/api/widget-chat', {
      headers: { 'content-type': 'application/json', cookie: cookieHeader(VALID_UUID) },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Q?' }],
        mode: 'statewave',
        persona: 'statewave-support',
        system_prompt_override: OVERRIDE_TEXT,
      }),
    })
    await widgetChat(req)
    const writeCalls = calls.filter(
      (c) =>
        c.url.includes('/v1/episodes') &&
        (c.init?.method ?? 'GET').toUpperCase() === 'POST',
    )
    expect(writeCalls).toHaveLength(1)
    const writeBody = JSON.parse(writeCalls[0].init?.body as string)
    expect(writeBody.subject_id).toBe(visitorSubject)
    expect(writeBody.subject_id).not.toBe(DOCS_SUBJECT_ID)
  })
})

describe('POST /api/widget-chat — system_prompt_override (visitor-memory persona)', () => {
  let calls: FetchCall[]
  beforeEach(() => {
    setEnv()
    calls = installFetchMock()
  })
  afterEach(() => vi.restoreAllMocks())

  it('applies the override and echoes the confirmation flag', async () => {
    const req = makeRequest('POST', 'http://test/api/widget-chat', {
      headers: { 'content-type': 'application/json', cookie: cookieHeader(VALID_UUID) },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        mode: 'statewave',
        persona: 'support-agent',
        system_prompt_override: OVERRIDE_TEXT,
      }),
    })
    const resp = await widgetChat(req)
    expect(resp.status).toBe(200)
    const data = await resp.json()
    expect(data.system_prompt_override_applied).toBe(true)
    const sys = systemMessageFromLLMCall(calls)
    expect(sys).toContain(OVERRIDE_HEADER)
    expect(sys).toContain(OVERRIDE_TEXT)
  })
})

describe('POST /api/widget-chat — system_prompt_override (stateless mode)', () => {
  let calls: FetchCall[]
  beforeEach(() => {
    setEnv()
    calls = installFetchMock()
  })
  afterEach(() => vi.restoreAllMocks())

  it('applies the override on the stateless baseline path too', async () => {
    const req = makeRequest('POST', 'http://test/api/widget-chat', {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        mode: 'stateless',
        system_prompt_override: OVERRIDE_TEXT,
      }),
    })
    const resp = await widgetChat(req)
    expect(resp.status).toBe(200)
    const data = await resp.json()
    expect(data.system_prompt_override_applied).toBe(true)
    const sys = systemMessageFromLLMCall(calls)
    expect(sys).toContain(OVERRIDE_HEADER)
    expect(sys).toContain(OVERRIDE_TEXT)
    // Stateless mode must not write episodes regardless of override.
    const episodeWrites = calls.filter(
      (c) =>
        c.url.includes('/v1/episodes') &&
        (c.init?.method ?? 'GET').toUpperCase() === 'POST',
    )
    expect(episodeWrites).toHaveLength(0)
  })
})
