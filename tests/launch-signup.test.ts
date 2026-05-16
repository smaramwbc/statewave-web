// @vitest-environment node
/**
 * /api/launch-signup bot-defence tests (the layers added on top of the
 * already-shipped rate limiter):
 *
 *   - same-origin: present-and-foreign Origin → 403; absent → allowed
 *   - honeypot: filled hidden field → fake 200, NO downstream forward
 *   - Turnstile: unset secret → fail-open (reaches 503, not 403);
 *                set + invalid token → 403; set + valid → forwards → 200
 *
 * fetch is mocked and switched on URL (Turnstile siteverify vs the
 * provider webhook). Each test uses a unique client IP so the shared
 * in-process rate limiter never interferes.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { dispatchWeb } from '../server/dispatch'

const ENV_BACKUP = { ...process.env }

beforeEach(() => {
  process.env.STATEWAVE_API_KEY = 'test-key'
  process.env.STATEWAVE_URL = 'https://statewave-api.test'
  delete process.env.TURNSTILE_SECRET_KEY
  delete process.env.LAUNCH_SIGNUP_WEBHOOK
})

afterEach(() => {
  process.env = { ...ENV_BACKUP }
  vi.restoreAllMocks()
})

let ipCounter = 10
function freshIp(): string {
  ipCounter += 1
  return `198.51.100.${ipCounter}`
}

function req(
  body: Record<string, unknown>,
  headers: Record<string, string> = {},
): Request {
  return new Request('http://localhost/api/launch-signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'fly-client-ip': freshIp(),
      origin: 'https://statewave.ai',
      ...headers,
    },
    body: JSON.stringify(body),
  })
}

const VALID = { name: 'Ada', email: 'ada@example.com' }

describe('/api/launch-signup — same-origin', () => {
  it('rejects a present-and-foreign Origin with 403', async () => {
    const res = await dispatchWeb(
      req(VALID, { origin: 'https://evil.example.com' }),
    )
    expect(res?.status).toBe(403)
  })

  it('allows a request with no Origin/Referer (fail-open)', async () => {
    // No origin/referer → not rejected by same-origin; Turnstile unset →
    // fail-open; no webhook → 503 (proves it got past the origin gate).
    const r = new Request('http://localhost/api/launch-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'fly-client-ip': freshIp() },
      body: JSON.stringify(VALID),
    })
    const res = await dispatchWeb(r)
    expect(res?.status).toBe(503)
  })

  it('allows a *.vercel.app preview origin', async () => {
    const res = await dispatchWeb(
      req(VALID, { origin: 'https://statewave-web-git-abc.vercel.app' }),
    )
    expect(res?.status).toBe(503) // past origin gate; no webhook
  })
})

describe('/api/launch-signup — honeypot', () => {
  it('returns a fake 200 and does NOT forward when the honeypot is filled', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    process.env.LAUNCH_SIGNUP_WEBHOOK = 'https://provider.test/hook'
    const res = await dispatchWeb(
      req({ ...VALID, hp_company_url: 'http://spam.bot' }),
    )
    expect(res?.status).toBe(200)
    expect(await res?.json()).toEqual({ ok: true })
    // Crucial: nothing was forwarded downstream.
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})

describe('/api/launch-signup — Turnstile env seam', () => {
  it('fail-open when TURNSTILE_SECRET_KEY is unset (reaches 503, not 403)', async () => {
    const res = await dispatchWeb(req(VALID))
    expect(res?.status).toBe(503) // got past Turnstile; no webhook configured
  })

  it('403 when secret is set but the token is invalid', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret'
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: false }), { status: 200 }),
    )
    const res = await dispatchWeb(req({ ...VALID, turnstile_token: 'bad' }))
    expect(res?.status).toBe(403)
  })

  it('forwards and 200s when secret is set and the token verifies', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret'
    process.env.LAUNCH_SIGNUP_WEBHOOK = 'https://provider.test/hook'
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async (input: string | URL | Request) => {
        const url = typeof input === 'string' ? input : input.toString()
        if (url.includes('siteverify')) {
          return new Response(JSON.stringify({ success: true }), { status: 200 })
        }
        return new Response('ok', { status: 200 })
      })
    const res = await dispatchWeb(req({ ...VALID, turnstile_token: 'good' }))
    expect(res?.status).toBe(200)
    expect(await res?.json()).toEqual({ ok: true })
    // siteverify + provider webhook both called.
    const urls = fetchSpy.mock.calls.map((c) =>
      typeof c[0] === 'string' ? c[0] : String(c[0]),
    )
    expect(urls.some((u) => u.includes('siteverify'))).toBe(true)
    expect(urls.some((u) => u.includes('provider.test/hook'))).toBe(true)
  })

  it('403 when secret is set but no token is supplied', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret'
    const res = await dispatchWeb(req(VALID))
    expect(res?.status).toBe(403)
  })
})
