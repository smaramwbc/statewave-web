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
  delete process.env.LAUNCH_SIGNUP_WEBHOOK_RESEND
  delete process.env.LAUNCH_SIGNUP_WEBHOOK_RESEND_TOKEN
  delete process.env.LAUNCH_SIGNUP_WEBHOOK_BEEHIIV
  delete process.env.LAUNCH_SIGNUP_WEBHOOK_BEEHIIV_TOKEN
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

describe('/api/launch-signup — newsletter (email only)', () => {
  it('accepts an email-only signup (name no longer required) and forwards it', async () => {
    process.env.LAUNCH_SIGNUP_WEBHOOK_RESEND = 'https://resend.test/hook'
    process.env.LAUNCH_SIGNUP_WEBHOOK_RESEND_TOKEN = 'resend-key'
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('ok', { status: 200 }))
    const res = await dispatchWeb(req({ email: 'ada@example.com' }))
    expect(res?.status).toBe(200)
    expect(await res?.json()).toEqual({ ok: true })
  })

  it('still rejects an invalid email with 400', async () => {
    const res = await dispatchWeb(req({ email: 'not-an-email' }))
    expect(res?.status).toBe(400)
  })
})

describe('/api/launch-signup — honeypot', () => {
  it('returns a fake 200 and does NOT forward when the honeypot is filled', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    process.env.LAUNCH_SIGNUP_WEBHOOK_RESEND = 'https://resend.test/hook'
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
    process.env.LAUNCH_SIGNUP_WEBHOOK_RESEND = 'https://resend.test/hook'
    process.env.LAUNCH_SIGNUP_WEBHOOK_RESEND_TOKEN = 'resend-key'
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
    expect(urls.some((u) => u.includes('resend.test/hook'))).toBe(true)
  })

  it('403 when secret is set but no token is supplied', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret'
    const res = await dispatchWeb(req(VALID))
    expect(res?.status).toBe(403)
  })
})

describe('/api/launch-signup — webhook fan-out', () => {
  it('returns 503 when no targets are configured', async () => {
    const res = await dispatchWeb(req(VALID))
    expect(res?.status).toBe(503)
  })

  it('returns 200 when both targets succeed', async () => {
    process.env.LAUNCH_SIGNUP_WEBHOOK_RESEND = 'https://resend.test/hook'
    process.env.LAUNCH_SIGNUP_WEBHOOK_RESEND_TOKEN = 'resend-key'
    process.env.LAUNCH_SIGNUP_WEBHOOK_BEEHIIV = 'https://beehiiv.test/hook'
    process.env.LAUNCH_SIGNUP_WEBHOOK_BEEHIIV_TOKEN = 'beehiiv-key'

    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('ok', { status: 200 }))

    const res = await dispatchWeb(req(VALID))
    expect(res?.status).toBe(200)

    const webhookCalls = fetchSpy.mock.calls.filter(
      (c) => !String(c[0]).includes('siteverify'),
    )
    expect(webhookCalls).toHaveLength(2)

    const urls = webhookCalls.map((c) => String(c[0]))
    expect(urls).toContain('https://resend.test/hook')
    expect(urls).toContain('https://beehiiv.test/hook')
  })

  it('sends correct auth headers per target', async () => {
    process.env.LAUNCH_SIGNUP_WEBHOOK_RESEND = 'https://resend.test/hook'
    process.env.LAUNCH_SIGNUP_WEBHOOK_RESEND_TOKEN = 'resend-key'
    process.env.LAUNCH_SIGNUP_WEBHOOK_BEEHIIV = 'https://beehiiv.test/hook'
    process.env.LAUNCH_SIGNUP_WEBHOOK_BEEHIIV_TOKEN = 'beehiiv-key'

    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('ok', { status: 200 }))

    await dispatchWeb(req(VALID))

    const webhookCalls = fetchSpy.mock.calls.filter(
      (c) => !String(c[0]).includes('siteverify'),
    )
    const resendCall = webhookCalls.find((c) => String(c[0]).includes('resend'))!
    const beehiivCall = webhookCalls.find((c) => String(c[0]).includes('beehiiv'))!

    expect((resendCall[1] as RequestInit).headers).toHaveProperty(
      'Authorization',
      'Bearer resend-key',
    )
    expect((beehiivCall[1] as RequestInit).headers).toHaveProperty(
      'Authorization',
      'Bearer beehiiv-key',
    )
  })

  it('returns 502 when one target fails (all-or-nothing)', async () => {
    process.env.LAUNCH_SIGNUP_WEBHOOK_RESEND = 'https://resend.test/hook'
    process.env.LAUNCH_SIGNUP_WEBHOOK_RESEND_TOKEN = 'resend-key'
    process.env.LAUNCH_SIGNUP_WEBHOOK_BEEHIIV = 'https://beehiiv.test/hook'
    process.env.LAUNCH_SIGNUP_WEBHOOK_BEEHIIV_TOKEN = 'beehiiv-key'

    vi.spyOn(globalThis, 'fetch').mockImplementation(
      async (input: string | URL | Request) => {
        const url = typeof input === 'string' ? input : input.toString()
        if (url.includes('resend.test')) {
          return new Response('error', { status: 500 })
        }
        return new Response('ok', { status: 200 })
      },
    )

    const res = await dispatchWeb(req(VALID))
    expect(res?.status).toBe(502)
  })

  it('returns 502 when both targets fail', async () => {
    process.env.LAUNCH_SIGNUP_WEBHOOK_RESEND = 'https://resend.test/hook'
    process.env.LAUNCH_SIGNUP_WEBHOOK_RESEND_TOKEN = 'resend-key'
    process.env.LAUNCH_SIGNUP_WEBHOOK_BEEHIIV = 'https://beehiiv.test/hook'
    process.env.LAUNCH_SIGNUP_WEBHOOK_BEEHIIV_TOKEN = 'beehiiv-key'

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('error', { status: 500 }),
    )

    const res = await dispatchWeb(req(VALID))
    expect(res?.status).toBe(502)
  })

  it('still runs every target to completion when one fails first (allSettled, no sibling abandonment)', async () => {
    process.env.LAUNCH_SIGNUP_WEBHOOK_RESEND = 'https://resend.test/hook'
    process.env.LAUNCH_SIGNUP_WEBHOOK_RESEND_TOKEN = 'resend-key'
    process.env.LAUNCH_SIGNUP_WEBHOOK_BEEHIIV = 'https://beehiiv.test/hook'
    process.env.LAUNCH_SIGNUP_WEBHOOK_BEEHIIV_TOKEN = 'beehiiv-key'

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(
      async (input: string | URL | Request) => {
        const url = typeof input === 'string' ? input : input.toString()
        // resend rejects immediately; with Promise.all the beehiiv call
        // could be abandoned. allSettled must still await it.
        if (url.includes('resend.test')) {
          return new Response('error', { status: 500 })
        }
        return new Response('ok', { status: 200 })
      },
    )

    const res = await dispatchWeb(req(VALID))
    expect(res?.status).toBe(502)

    const webhookCalls = fetchSpy.mock.calls.filter(
      (c) => !String(c[0]).includes('siteverify'),
    )
    const urls = webhookCalls.map((c) => String(c[0]))
    // Both providers were actually called — the sibling was not abandoned.
    expect(urls).toContain('https://resend.test/hook')
    expect(urls).toContain('https://beehiiv.test/hook')
  })

  it('works with only one target configured', async () => {
    process.env.LAUNCH_SIGNUP_WEBHOOK_RESEND = 'https://resend.test/hook'
    process.env.LAUNCH_SIGNUP_WEBHOOK_RESEND_TOKEN = 'resend-key'

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('ok', { status: 200 }),
    )

    const res = await dispatchWeb(req(VALID))
    expect(res?.status).toBe(200)
  })

  it('skips a URL whose token is missing and 503s if that leaves none', async () => {
    process.env.LAUNCH_SIGNUP_WEBHOOK_RESEND = 'https://resend.test/hook'
    // no LAUNCH_SIGNUP_WEBHOOK_RESEND_TOKEN

    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('ok', { status: 200 }))

    const res = await dispatchWeb(req(VALID))
    expect(res?.status).toBe(503)

    const webhookCalls = fetchSpy.mock.calls.filter(
      (c) => !String(c[0]).includes('siteverify'),
    )
    // The token-less target was skipped, not called with a guaranteed 401.
    expect(webhookCalls).toHaveLength(0)
  })

  it('skips only the token-less target and still 200s via the configured one', async () => {
    process.env.LAUNCH_SIGNUP_WEBHOOK_RESEND = 'https://resend.test/hook'
    process.env.LAUNCH_SIGNUP_WEBHOOK_RESEND_TOKEN = 'resend-key'
    process.env.LAUNCH_SIGNUP_WEBHOOK_BEEHIIV = 'https://beehiiv.test/hook'
    // no LAUNCH_SIGNUP_WEBHOOK_BEEHIIV_TOKEN → beehiiv skipped

    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('ok', { status: 200 }))

    const res = await dispatchWeb(req(VALID))
    expect(res?.status).toBe(200)

    const webhookCalls = fetchSpy.mock.calls.filter(
      (c) => !String(c[0]).includes('siteverify'),
    )
    expect(webhookCalls).toHaveLength(1)
    expect(String(webhookCalls[0][0])).toBe('https://resend.test/hook')
  })

  it('sends Resend-shaped payload with first_name and properties', async () => {
    process.env.LAUNCH_SIGNUP_WEBHOOK_RESEND = 'https://resend.test/hook'
    process.env.LAUNCH_SIGNUP_WEBHOOK_RESEND_TOKEN = 'resend-key'

    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('ok', { status: 200 }))

    await dispatchWeb(
      req({ name: 'Ada', email: 'ada@example.com', role: 'Engineer', company: 'Acme' }),
    )

    const call = fetchSpy.mock.calls.find((c) => String(c[0]).includes('resend'))!
    const body = JSON.parse((call[1] as RequestInit).body as string)
    expect(body.email).toBe('ada@example.com')
    expect(body.first_name).toBe('Ada')
    expect(body.properties.role).toBe('Engineer')
    expect(body.properties.company).toBe('Acme')
    expect(body.properties.source).toBe('statewave.ai/newsletter')
  })

  it('sends Beehiiv-shaped payload with custom_fields and reactivate_existing', async () => {
    process.env.LAUNCH_SIGNUP_WEBHOOK_BEEHIIV = 'https://beehiiv.test/hook'
    process.env.LAUNCH_SIGNUP_WEBHOOK_BEEHIIV_TOKEN = 'beehiiv-key'

    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('ok', { status: 200 }))

    await dispatchWeb(
      req({ name: 'Ada', email: 'ada@example.com', role: 'Engineer', company: 'Acme' }),
    )

    const call = fetchSpy.mock.calls.find((c) => String(c[0]).includes('beehiiv'))!
    const body = JSON.parse((call[1] as RequestInit).body as string)
    expect(body.email).toBe('ada@example.com')
    expect(body.utm_source).toBe('statewave.ai/newsletter')
    expect(body.utm_medium).toBe('newsletter')
    expect(body.reactivate_existing).toBe(true)
    expect(body.custom_fields).toContainEqual({ name: 'First Name', value: 'Ada' })
    expect(body.custom_fields).toContainEqual({ name: 'Role', value: 'Engineer' })
    expect(body.custom_fields).toContainEqual({ name: 'Company', value: 'Acme' })
  })
})
