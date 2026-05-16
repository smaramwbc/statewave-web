// @vitest-environment node
/**
 * Dispatch + 404 + startup-failure tests.
 *
 * Pins the contract that:
 *   - the vendor-neutral `dispatchWeb` returns the right `Response` for
 *     each known route (demo-personas, demo-state, widget-chat, hero-data)
 *   - unknown `/api/*` paths return null (the caller renders 404)
 *   - missing required Statewave config throws a named
 *     `StatewaveConfigError` instead of silently routing to a default URL
 *     or running unauthenticated
 *
 * No real backend — fetch is mocked. Each test sets up the env it needs.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { dispatchWeb, ROUTE_PATHS } from '../server/dispatch'
import { StatewaveConfigError } from '../server/statewave-client'

const ENV_BACKUP = { ...process.env }

beforeEach(() => {
  process.env.STATEWAVE_API_KEY = 'test-key'
  process.env.STATEWAVE_URL = 'https://statewave-api.test'
})

afterEach(() => {
  process.env = { ...ENV_BACKUP }
  vi.restoreAllMocks()
})

function jsonReq(path: string, method = 'POST', body: unknown = {}, cookie = ''): Request {
  return new Request(`http://localhost${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    body: method === 'GET' || method === 'HEAD' ? undefined : JSON.stringify(body),
  })
}

describe('dispatchWeb — known routes', () => {
  it('exposes exactly the website API surface (no extras, no missing)', () => {
    expect([...ROUTE_PATHS].sort()).toEqual([
      '/api/demo-personas',
      '/api/demo-reset',
      '/api/demo-seed',
      '/api/demo-state',
      '/api/hero-data',
      '/api/launch-signup',
      '/api/widget-chat',
    ])
  })

  it('routes /api/demo-personas to the persona handler (no body required, GET path)', async () => {
    // demo-personas reads the visitor cookie and returns persona metadata. We
    // don't assert the full body — we just want to see SOMETHING was dispatched
    // (status set, response is a Response).
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
      new Response(JSON.stringify({ episodes: [], memories: [] }), { status: 200 }),
    )
    const res = await dispatchWeb(jsonReq('/api/demo-personas', 'GET'))
    expect(res).not.toBeNull()
    expect(res!.status).toBeGreaterThanOrEqual(200)
    expect(res!.status).toBeLessThan(500)
  })

  it('routes /api/demo-state to the state handler', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
      new Response(JSON.stringify({ episodes: [], memories: [] }), { status: 200 }),
    )
    const res = await dispatchWeb(
      jsonReq('/api/demo-state?persona=statewave-support', 'GET'),
    )
    expect(res).not.toBeNull()
    expect(res!.status).toBe(200)
  })

  it('routes /api/widget-chat to the chat handler (rejects bad body cleanly)', async () => {
    const res = await dispatchWeb(jsonReq('/api/widget-chat', 'POST', { invalid: true }))
    expect(res).not.toBeNull()
    // Missing `messages` + `mode` should produce a 4xx, not a 5xx, not a hang.
    expect(res!.status).toBe(400)
  })

  it('routes /api/hero-data to the hero handler (proxies a backend call)', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
      new Response(JSON.stringify({ episodes: [], memories: [] }), { status: 200 }),
    )
    const res = await dispatchWeb(jsonReq('/api/hero-data', 'GET'))
    expect(res).not.toBeNull()
    expect(res!.status).toBe(200)
  })
})

describe('dispatchWeb — unknown paths', () => {
  it('returns null for unknown /api/* paths so the caller can render its own 404', async () => {
    const res = await dispatchWeb(jsonReq('/api/does-not-exist', 'GET'))
    expect(res).toBeNull()
  })

  it('returns null for non-/api paths too — dispatch never serves the SPA', async () => {
    const res = await dispatchWeb(jsonReq('/index.html', 'GET'))
    expect(res).toBeNull()
  })
})

describe('StatewaveConfigError — required env vars', () => {
  it('throws StatewaveConfigError when STATEWAVE_URL is unset and a handler tries to talk to the backend', async () => {
    delete process.env.STATEWAVE_URL
    // hero-data is the simplest "talks to backend immediately" handler.
    // dispatchWeb propagates the throw; it does NOT silently fall back.
    let caught: Error | null = null
    try {
      await dispatchWeb(jsonReq('/api/hero-data', 'GET'))
    } catch (err) {
      caught = err as Error
    }
    expect(caught).toBeInstanceOf(StatewaveConfigError)
    expect((caught as Error).message).toMatch(/STATEWAVE_URL/)
  })

  it('throws StatewaveConfigError when STATEWAVE_API_KEY is unset', async () => {
    delete process.env.STATEWAVE_API_KEY
    let caught: Error | null = null
    try {
      await dispatchWeb(jsonReq('/api/hero-data', 'GET'))
    } catch (err) {
      caught = err as Error
    }
    expect(caught).toBeInstanceOf(StatewaveConfigError)
    expect((caught as Error).message).toMatch(/STATEWAVE_API_KEY/)
  })

  it('does NOT default to https://statewave-api.fly.dev — public users would be silently routed to whichever Statewave instance was the project default', async () => {
    delete process.env.STATEWAVE_URL
    let threw = false
    try {
      await dispatchWeb(jsonReq('/api/hero-data', 'GET'))
    } catch {
      threw = true
    }
    expect(threw).toBe(true)
  })

  it('does NOT default to an empty API key — silent un-authenticated requests should never happen', async () => {
    process.env.STATEWAVE_API_KEY = ''
    let threw = false
    try {
      await dispatchWeb(jsonReq('/api/hero-data', 'GET'))
    } catch {
      threw = true
    }
    expect(threw).toBe(true)
  })
})
