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
 *   6. Forward to webhook targets (Resend + Beehiiv, #6)
 *
 * Env seams:
 *   LAUNCH_SIGNUP_WEBHOOK_RESEND       — Resend /contacts URL. Unset → skipped.
 *   LAUNCH_SIGNUP_WEBHOOK_RESEND_TOKEN — Resend API key (re_xxx). Required
 *                                         when the RESEND URL is set.
 *   LAUNCH_SIGNUP_WEBHOOK_BEEHIIV      — Beehiiv subscriptions URL (includes
 *                                         publication ID). Unset → skipped.
 *   LAUNCH_SIGNUP_WEBHOOK_BEEHIIV_TOKEN — Beehiiv API key. Required when the
 *                                         BEEHIIV URL is set.
 *
 *   A target needs BOTH its URL and token. A URL set without its token is
 *   a guaranteed 401, so it is skipped with a loud error log (same
 *   fail-open-with-warning stance as the Turnstile seam) rather than
 *   turning one misconfigured target into an opaque 502 for every signup.
 *   At least one fully-configured target must remain, or the handler
 *   returns 503 (an honest failure — never a silent drop of all signups).
 *   Targets fire in parallel via Promise.allSettled (every request runs
 *   to completion even if a sibling fails first — Promise.all would
 *   abandon the in-flight sibling on a serverless freeze). All-or-nothing
 *   is preserved: 200 only if every target succeeds, 502 if any fail.
 *
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

interface WebhookTarget {
  name: string
  url: string
  token: string
  payload: (signup: Record<SignupField, string>) => string
}

function webhookTargets(): WebhookTarget[] {
  const targets: WebhookTarget[] = []

  const add = (
    name: string,
    url: string | undefined,
    token: string | undefined,
    tokenVar: string,
    payload: WebhookTarget['payload'],
  ): void => {
    if (!url) return // not configured — skipped by design
    if (!token || !token.trim()) {
      // URL configured but no credential. Both providers require Bearer
      // auth, so a call here is a guaranteed 401. Skip with a loud log
      // rather than let one misconfigured target opaque-502 every signup
      // (same fail-open-with-warning stance as the Turnstile seam). If
      // this leaves zero usable targets the caller still returns an
      // honest 503 — never a silent drop of all signups.
      console.error(
        `[launch-signup] ${name} URL set but ${tokenVar} missing — skipping this target`,
      )
      return
    }
    targets.push({ name, url, token, payload })
  }

  add(
    'resend',
    process.env.LAUNCH_SIGNUP_WEBHOOK_RESEND,
    process.env.LAUNCH_SIGNUP_WEBHOOK_RESEND_TOKEN,
    'LAUNCH_SIGNUP_WEBHOOK_RESEND_TOKEN',
    (signup) =>
      JSON.stringify({
        email: signup.email,
        first_name: signup.name,
        properties: {
          role: signup.role,
          company: signup.company,
          what_you_would_build: signup.what_you_would_build,
          // Consent-separation marker. New /launch submissions are ongoing-
          // newsletter consent and are tagged `statewave.ai/newsletter` so they
          // are reliably separable from the pre-v1.0 launch-notification cohort
          // (which carries the old `statewave.ai/launch` source). Do not send
          // recurring newsletters to the launch cohort without fresh consent.
          source: 'statewave.ai/newsletter',
        },
      }),
  )

  add(
    'beehiiv',
    process.env.LAUNCH_SIGNUP_WEBHOOK_BEEHIIV,
    process.env.LAUNCH_SIGNUP_WEBHOOK_BEEHIIV_TOKEN,
    'LAUNCH_SIGNUP_WEBHOOK_BEEHIIV_TOKEN',
    (signup) =>
      JSON.stringify({
        email: signup.email,
        // Consent-separation markers. New /launch submissions are ongoing-
        // newsletter consent, tagged so they are reliably separable from the
        // pre-v1.0 launch-notification cohort (old `statewave.ai/launch`).
        // The platform must segment sends on this (or use a dedicated audience)
        // — the launch cohort must not receive recurring updates without
        // fresh re-consent.
        utm_source: 'statewave.ai/newsletter',
        utm_medium: 'newsletter',
        // Documented Beehiiv param: a returning subscriber who had previously
        // unsubscribed is reactivated instead of erroring. This only ever fires
        // on a *voluntary* new-form submission (the user actively enters and
        // submits their address with the newsletter consent copy visible), so
        // it constitutes fresh consent — it never reactivates anyone without a
        // new submission.
        reactivate_existing: true,
        custom_fields: [
          ...(signup.name ? [{ name: 'First Name', value: signup.name }] : []),
          ...(signup.role ? [{ name: 'Role', value: signup.role }] : []),
          ...(signup.company ? [{ name: 'Company', value: signup.company }] : []),
          ...(signup.what_you_would_build
            ? [{ name: 'What You Would Build', value: signup.what_you_would_build }]
            : []),
        ],
      }),
  )

  return targets
}

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

  // Newsletter signup collects only the email address (the minimum needed).
  // Name and other fields are optional and forwarded when present.
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

  // 6. Forward to webhook targets (all-or-nothing).
  const targets = webhookTargets()
  if (targets.length === 0) {
    return json(
      { error: 'Signup is temporarily unavailable. Please try again shortly.' },
      { status: 503 },
    )
  }

  // allSettled (not all): every target's request runs to completion even
  // if a sibling fails first. Promise.all rejects on the first failure and,
  // once we return the response, a serverless freeze can truncate the
  // still-in-flight sibling. A non-2xx is a failure: neither Resend nor
  // Beehiiv documents a distinct "already exists" status, so we do not
  // speculatively treat an unknown 4xx as success (that would mask real
  // failures). All-or-nothing is preserved.
  const results = await Promise.allSettled(
    targets.map(async (target) => {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), FORWARD_TIMEOUT_MS)
      try {
        const res = await fetch(target.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${target.token}`,
          },
          body: target.payload(signup),
          signal: controller.signal,
        })
        if (!res.ok) {
          console.error(`[launch-signup] ${target.name} upstream ${res.status}`)
          throw new Error(`${target.name} HTTP ${res.status}`)
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.error(`[launch-signup] ${target.name} timeout`)
        }
        throw err
      } finally {
        clearTimeout(timer)
      }
    }),
  )

  if (results.every((r) => r.status === 'fulfilled')) {
    return json({ ok: true }, { status: 200 })
  }
  return json(
    { error: 'Could not record signup right now. Please try again.' },
    { status: 502 },
  )
}
