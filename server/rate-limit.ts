/**
 * Vendor-neutral in-process rate limiter.
 *
 * No external store, no Redis/KV, no platform firewall — consistent with
 * statewave-web being a vendor-neutral container (the whole product pitch
 * is "no vendor lock-in", the site shouldn't contradict it). A fixed
 * window counter in a Map, swept periodically. Web-shape only (no Node
 * types) so the optional Vercel adapter can import it too.
 *
 * Threat model (matches the launch plan): casual launch-day scraping /
 * junk-submission of the public `/launch` form. NOT a distributed DDoS
 * defence. Defence-in-depth already exists in the handler (8 KB body cap,
 * per-field length caps, email validation, upstream webhook timeout) —
 * this just stops one IP hammering the endpoint.
 *
 * Deployment honesty:
 *   - Canonical path (one long-running Node/Docker container): correct,
 *     state lives for the process lifetime. A restart resets counters —
 *     fine for abuse prevention.
 *   - Multi-replica (Fly multi-machine): limit is per-replica, so the
 *     effective budget is N × limit. Acceptable for casual-scraping
 *     defence; tighten `RATE_LIMIT_MAX` if running many replicas.
 *   - Optional Vercel serverless adapter: in-memory state does NOT
 *     persist across invocations, so the limiter is weak there. The
 *     canonical deployment is the container, not Vercel — documented,
 *     not silently broken.
 */

interface Bucket {
  count: number
  resetAt: number // epoch ms when the window rolls over
}

const buckets = new Map<string, Bucket>()

// Bound memory: drop expired buckets periodically. `unref()` equivalent
// isn't available on the Web-shape `setInterval` return, but the sweep is
// cheap and the process is long-running by design, so this is fine.
const SWEEP_MS = 60_000
let sweepStarted = false
function ensureSweep(): void {
  if (sweepStarted) return
  sweepStarted = true
  setInterval(() => {
    const now = Date.now()
    for (const [key, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(key)
    }
  }, SWEEP_MS)
}

export interface RateLimitOptions {
  /** Max requests allowed per window per key. */
  limit: number
  /** Window length in milliseconds. */
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  /** Requests remaining in the current window (0 when blocked). */
  remaining: number
  /** Seconds until the window resets — use for the `Retry-After` header. */
  retryAfterSec: number
}

/**
 * Fixed-window check. Call once per request you want to limit.
 * The same `key` (typically the client IP) shares one window.
 */
export function checkRateLimit(
  key: string,
  opts: RateLimitOptions,
): RateLimitResult {
  ensureSweep()
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs })
    return { allowed: true, remaining: opts.limit - 1, retryAfterSec: 0 }
  }

  if (existing.count >= opts.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    }
  }

  existing.count += 1
  return {
    allowed: true,
    remaining: opts.limit - existing.count,
    retryAfterSec: 0,
  }
}

/**
 * Best-effort client IP for use as a rate-limit key.
 *
 * Resolution order, most-trusted first:
 *   1. `Fly-Client-IP`  — set by Fly's proxy (production host per the
 *      privacy policy); a client cannot forge this through the proxy.
 *   2. leftmost `X-Forwarded-For` — standard proxy chain; the left-most
 *      entry is the original client when behind a trusted reverse proxy.
 *   3. `X-Real-IP` — common single-proxy header.
 *   4. `x-statewave-socket-ip` — injected server-side by the Node bridge
 *      from the real TCP peer address; unspoofable by the client, and
 *      the right key when there is NO proxy (bare container / local).
 *   5. `"unknown"` — last resort; all unknown-IP traffic shares one
 *      bucket (fails safe toward limiting, not toward bypass).
 *
 * Spoofing note: a caller can forge `X-Forwarded-For` to rotate keys and
 * evade the limit. Behind Fly, prefer `Fly-Client-IP` (trusted). On a
 * bare container with no proxy, `x-statewave-socket-ip` is authoritative.
 * The body/field caps + upstream webhook bound the blast radius either
 * way; this limiter is the casual-scraping speed bump the launch plan
 * asked for, not a security boundary.
 */
export function clientIp(req: Request): string {
  const h = req.headers
  const fly = h.get('fly-client-ip')
  if (fly) return normaliseIp(fly)

  const xff = h.get('x-forwarded-for')
  if (xff) {
    const first = xff.split(',')[0]?.trim()
    if (first) return normaliseIp(first)
  }

  const xreal = h.get('x-real-ip')
  if (xreal) return normaliseIp(xreal)

  const sock = h.get('x-statewave-socket-ip')
  if (sock) return normaliseIp(sock)

  return 'unknown'
}

function normaliseIp(ip: string): string {
  const v = ip.trim()
  // Strip the IPv4-mapped-IPv6 prefix so "::ffff:1.2.3.4" and "1.2.3.4"
  // share a bucket.
  return v.startsWith('::ffff:') ? v.slice('::ffff:'.length) : v
}

// Defaults for the /launch waitlist form: 5 submissions per IP per 10
// minutes. Generous for a human, useless for a scraper. Overridable via
// env so ops can tighten without a redeploy of logic.
export const LAUNCH_SIGNUP_LIMIT = Number(process.env.RATE_LIMIT_MAX || 5)
export const LAUNCH_SIGNUP_WINDOW_MS = Number(
  process.env.RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000,
)
