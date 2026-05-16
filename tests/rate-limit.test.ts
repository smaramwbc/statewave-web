// @vitest-environment node
/**
 * Rate-limit unit + launch-signup integration tests.
 *
 * Pins:
 *   - fixed-window allow/block/reset behaviour
 *   - client-IP resolution precedence (Fly > XFF > X-Real-IP > socket)
 *   - /api/launch-signup returns 429 + Retry-After past the per-IP budget
 *     and a fresh IP is unaffected (independent buckets)
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { checkRateLimit, clientIp } from '../server/rate-limit'
import { dispatchWeb } from '../server/dispatch'

const ENV_BACKUP = { ...process.env }

beforeEach(() => {
  process.env.STATEWAVE_API_KEY = 'test-key'
  process.env.STATEWAVE_URL = 'https://statewave-api.test'
})
afterEach(() => {
  process.env = { ...ENV_BACKUP }
  vi.restoreAllMocks()
})

describe('checkRateLimit (fixed window)', () => {
  it('allows up to the limit then blocks, with a Retry-After', () => {
    const key = `t:${Math.random()}`
    const opts = { limit: 3, windowMs: 60_000 }
    expect(checkRateLimit(key, opts).allowed).toBe(true)
    expect(checkRateLimit(key, opts).allowed).toBe(true)
    const third = checkRateLimit(key, opts)
    expect(third.allowed).toBe(true)
    expect(third.remaining).toBe(0)
    const blocked = checkRateLimit(key, opts)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterSec).toBeGreaterThan(0)
    expect(blocked.retryAfterSec).toBeLessThanOrEqual(60)
  })

  it('resets after the window elapses', () => {
    const key = `t:${Math.random()}`
    const opts = { limit: 1, windowMs: 20 }
    expect(checkRateLimit(key, opts).allowed).toBe(true)
    expect(checkRateLimit(key, opts).allowed).toBe(false)
    return new Promise((r) => setTimeout(r, 30)).then(() => {
      expect(checkRateLimit(key, opts).allowed).toBe(true)
    })
  })

  it('keys are independent', () => {
    const o = { limit: 1, windowMs: 60_000 }
    expect(checkRateLimit('a', o).allowed).toBe(true)
    expect(checkRateLimit('a', o).allowed).toBe(false)
    expect(checkRateLimit('b', o).allowed).toBe(true)
  })
})

describe('clientIp precedence', () => {
  const make = (headers: Record<string, string>) =>
    new Request('http://localhost/api/launch-signup', { headers })

  it('prefers Fly-Client-IP over everything', () => {
    expect(
      clientIp(
        make({
          'fly-client-ip': '9.9.9.9',
          'x-forwarded-for': '1.1.1.1, 2.2.2.2',
          'x-real-ip': '3.3.3.3',
          'x-statewave-socket-ip': '4.4.4.4',
        }),
      ),
    ).toBe('9.9.9.9')
  })

  it('falls back to leftmost XFF, then X-Real-IP, then socket', () => {
    expect(clientIp(make({ 'x-forwarded-for': '1.1.1.1, 2.2.2.2' }))).toBe('1.1.1.1')
    expect(clientIp(make({ 'x-real-ip': '3.3.3.3' }))).toBe('3.3.3.3')
    expect(clientIp(make({ 'x-statewave-socket-ip': '4.4.4.4' }))).toBe('4.4.4.4')
    expect(clientIp(make({}))).toBe('unknown')
  })

  it('normalises IPv4-mapped IPv6', () => {
    expect(clientIp(make({ 'x-statewave-socket-ip': '::ffff:5.6.7.8' }))).toBe('5.6.7.8')
  })
})

describe('/api/launch-signup rate limiting', () => {
  function req(ip: string) {
    return new Request('http://localhost/api/launch-signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'fly-client-ip': ip,
      },
      body: JSON.stringify({ name: 'A', email: 'a@example.com' }),
    })
  }

  it('429s past the per-IP budget and a fresh IP is unaffected', async () => {
    // No LAUNCH_SIGNUP_WEBHOOK → handler 503s, but the rate-limit check
    // runs first, so the 6th request from one IP is 429 regardless.
    const ip = `203.0.113.${Math.floor(Math.random() * 254) + 1}`
    let last: Response | null = null
    for (let i = 0; i < 6; i++) {
      last = await dispatchWeb(req(ip))
    }
    expect(last?.status).toBe(429)
    expect(last?.headers.get('Retry-After')).toBeTruthy()
    // CORS header still present on the 429 (browser fetch needs it).
    expect(last?.headers.get('Access-Control-Allow-Origin')).toBe('*')

    // A different IP is in its own bucket → not rate-limited (503 from
    // the missing webhook, NOT 429).
    const fresh = await dispatchWeb(req('198.51.100.7'))
    expect(fresh?.status).not.toBe(429)
  })
})
