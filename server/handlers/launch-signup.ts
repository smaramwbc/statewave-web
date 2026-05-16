/**
 * POST /api/launch-signup
 *
 * Backs the form on /launch. Defence-in-depth for a public, unauthenticated
 * endpoint advertised on launch day. Layers, cheapest-first:
 *
 *   1. Per-IP rate limit          — server/rate-limit.ts (already wired)
 *   2. Same-origin enforcement    — Origin/Referer allowlist (header-cheap)
 *   3. Body cap + JSON parse + field validation
 *   4. Honeypot                   — hidden field bots fill, humans don't
 *   5. Cloudflare Turnstile       — server-side token verify (env seam)
 *   6. Forward to LAUNCH_SIGNUP_WEBHOOK (the email-infra provider, #6)
 *
 * Env seams:
 *   LAUNCH_SIGNUP_WEBHOOK  — provider URL we POST the signup to (#6). Unset
 *                            → honest 503 (never a silent drop).
 *   TURNSTILE_SECRET_KEY   — Cloudflare Turnstile secret. Unset → bot
 *                            verification is SKIPPED and a loud warning is
 *                            logged. This is fail-open by design (form must
 *                            work pre-provision) but it is NOT acceptable
 *                            for production launch — the key must be set
 *                            before T-0 (tracked in statewave-launch #22 as
 *                            a hard gate).
 *
 * Edge-layer rate limiting (Vercel WAF rule) is the recommended additional
 * backstop and is config, not code — see statewave-launch #22.
 */

import { json } from '../statewave-client.js'
import {
  checkRateLimit,
  clientIp,
  LAUNCH_SIGNUP_LIMIT,
  LAUNCH_SIGNUP_WINDOW_MS,
} from '../rate-limit.js'

const MAX_BODY_BYTES = 8 * 1024
const FORWARD_TIMEOUT_MS = 8000
const TURNSTILE_TIMEOUT_MS = 8000
const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify'

// Hosts the /launch form is legitimately served from. Same-origin is a
// cheap filter, not the primary defence — so a *missing* Origin/Referer
// (privacy browsers strip them) is allowed; only a present-and-foreign
// origin is rejected, to avoid false-rejecting real humans.
const ALLOWED_HOSTS = ['statewave.ai', 'www.statewave.ai']

// Field length caps — generous but bounded, to keep abuse/junk out.
const LIMITS = {
  name: 200,
  email: 320, // RFC 5321 max
  role: 200,
  company: 200,
  what_you_would_build: 2000,
} as const

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Hidden field the client renders off-screen. Real users never fill it;
// naive bots that blast every input do. Named to look fillable.
const HONEYPOT_FIELD = 'hp_company_url'

type SignupField = keyof typeof LIMITS

function clean(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

function hostAllowed(rawHeader: string | null): boolean {
  if (!rawHeader) return false
  let host: string
  try {
    host = new URL(rawHeader).host.toLowerCase()
  } catch {
    return false
  }
  if (ALLOWED_HOSTS.includes(host)) return true
  // Vercel preview deploys + local dev.
  const hostname = host.split(':')[0]
  if (host.endsWith('.vercel.app')) return true
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true
  return false
}

/** True iff the request's origin is acceptable (or absent — fail-open). */
function sameOriginOk(req: Request): boolean {
  const origin = req.headers.get('origin')
  if (origin) return hostAllowed(origin)
  const referer = req.headers.get('referer')
  if (referer) return hostAllowed(referer)
  // Neither header present — don't false-reject; rate-limit + honeypot +
  // Turnstile still apply.
  return true
}

async function turnstilePasses(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    console.warn(
      '[launch-signup] TURNSTILE_SECRET_KEY unset — bot verification DISABLED. ' +
        'Set it in the statewave-web prod env before launch (statewave-launch #22).',
    )
    return true // fail-open by design; #22 gates this for production
  }
  if (!token) return false

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TURNSTILE_TIMEOUT_MS)
  try {
    const body = new URLSearchParams({ secret, response: token })
    if (ip && ip !== 'unknown') body.set('remoteip', ip)
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: controller.signal,
    })
    if (!res.ok) {
      console.error(`[launch-signup] turnstile verify HTTP ${res.status}`)
      return false
    }
    const data = (await res.json().catch(() => null)) as { success?: boolean } | null
    return data?.success === true
  } catch (err) {
    const reason = err instanceof Error && err.name === 'AbortError' ? 'timeout' : 'error'
    console.error(`[launch-signup] turnstile verify ${reason}`)
    return false
  } finally {
    clearTimeout(timer)
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return json({}, { status: 200 })
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 })
  }

  // 1. Per-IP rate limit before doing any work. A public launch-page form
  // WILL get hammered on T-0; this is the casual-scraping speed bump
  // (vendor-neutral, in-process — see server/rate-limit.ts).
  const ip = clientIp(req)
  const rl = checkRateLimit(`launch-signup:${ip}`, {
    limit: LAUNCH_SIGNUP_LIMIT,
    windowMs: LAUNCH_SIGNUP_WINDOW_MS,
  })
  if (!rl.allowed) {
    return json(
      { error: 'Too many signups from your network. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(rl.retryAfterSec) },
      },
    )
  }

  // 2. Same-origin enforcement (header-cheap; rejects only present-and-foreign).
  if (!sameOriginOk(req)) {
    return json({ error: 'Forbidden' }, { status: 403 })
  }

  // 3. Bound the body before parsing — a serverless function shouldn't
  // buffer an arbitrarily large payload.
  const raw = await req.text()
  if (raw.length > MAX_BODY_BYTES) {
    return json({ error: 'Payload too large' }, { status: 413 })
  }

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(raw || '{}')
  } catch {
    return json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // 4. Honeypot. If the hidden field is filled it's a bot — return a
  // success-shaped response so it doesn't learn it was caught, but do
  // NOT forward anything downstream.
  if (clean(parsed[HONEYPOT_FIELD], 1) !== '') {
    return json({ ok: true }, { status: 200 })
  }

  const signup = {} as Record<SignupField, string>
  for (const field of Object.keys(LIMITS) as SignupField[]) {
    signup[field] = clean(parsed[field], LIMITS[field])
  }

  if (!signup.name) {
    return json({ error: 'Name is required' }, { status: 400 })
  }
  if (!signup.email || !EMAIL_RE.test(signup.email)) {
    return json({ error: 'A valid email is required' }, { status: 400 })
  }

  // 5. Cloudflare Turnstile — server-side verification (the real bot
  // defence). Skipped + loudly warned when TURNSTILE_SECRET_KEY is unset.
  const token = clean(parsed.turnstile_token, 4096)
  if (!(await turnstilePasses(token, ip))) {
    return json(
      { error: 'Verification failed. Please retry.' },
      { status: 403 },
    )
  }

  // 6. Forward to the provider.
  const webhook = process.env.LAUNCH_SIGNUP_WEBHOOK
  if (!webhook) {
    // Honest failure: do NOT pretend success and drop the signup.
    // statewave-launch #6 must set LAUNCH_SIGNUP_WEBHOOK before launch.
    return json(
      { error: 'Signup is temporarily unavailable. Please try again shortly.' },
      { status: 503 },
    )
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FORWARD_TIMEOUT_MS)
  try {
    const upstream = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...signup,
        source: 'statewave.ai/launch',
        submitted_at: new Date().toISOString(),
      }),
      signal: controller.signal,
    })
    if (!upstream.ok) {
      // Don't leak upstream detail to the client; log a count-level note.
      console.error(`[launch-signup] upstream ${upstream.status}`)
      return json(
        { error: 'Could not record signup right now. Please try again.' },
        { status: 502 },
      )
    }
    return json({ ok: true }, { status: 200 })
  } catch (err) {
    const reason = err instanceof Error && err.name === 'AbortError' ? 'timeout' : 'error'
    console.error(`[launch-signup] forward ${reason}`)
    return json(
      { error: 'Could not record signup right now. Please try again.' },
      { status: 502 },
    )
  } finally {
    clearTimeout(timer)
  }
}
