/**
 * POST /api/launch-signup
 *
 * Backs the form on /launch. Validates the 5 fields and forwards the
 * signup to whatever provider the email-infra work (statewave-launch #6)
 * wires up, via a single env seam:
 *
 *   LAUNCH_SIGNUP_WEBHOOK   — a URL we POST the signup JSON to. Works with
 *                             Beehiiv automation, Resend, Zapier, n8n, etc.
 *                             #6 sets this once the waitlist provider exists.
 *
 * Until that env var is set the endpoint returns 503 (not a silent 200) so
 * the form shows an honest "try again" state instead of black-holing a
 * launch-waitlist signup.
 */

import { json } from '../statewave-client.js'

const MAX_BODY_BYTES = 8 * 1024
const FORWARD_TIMEOUT_MS = 8000

// Field length caps — generous but bounded, to keep abuse/junk out.
const LIMITS = {
  name: 200,
  email: 320, // RFC 5321 max
  role: 200,
  company: 200,
  what_you_would_build: 2000,
} as const

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type SignupField = keyof typeof LIMITS

function clean(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return json({}, { status: 200 })
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 })
  }

  // Bound the body before parsing — a serverless function shouldn't buffer
  // an arbitrarily large payload.
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
