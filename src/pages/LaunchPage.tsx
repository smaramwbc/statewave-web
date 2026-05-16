import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Section } from '../components/Section'
import { Heading } from '../components/Heading'
import { usePageSEO } from '../lib/seo'

// Cloudflare Turnstile public site key. Behind an env seam (same pattern as
// the server's TURNSTILE_SECRET_KEY): when unset the widget is skipped and
// the form still works (fail-open). statewave-launch #22 gates setting both
// keys before launch. Privacy-preserving CAPTCHA — chosen over reCAPTCHA so
// the site's "no third-party trackers" promise stays true.
const TURNSTILE_SITE_KEY = (import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '') as string

/**
 * /launch — public landing for the June 16, 2026 launch, with email
 * capture. Form submission is stubbed: it POSTs to `/api/launch-signup`
 * which is wired to Beehiiv / Resend separately (see statewave-launch
 * issue #6 — handled by the email-infra team).
 */

const LAUNCH_AT = new Date('2026-06-16T07:01:00.000Z') // 09:01 CEST = 00:01 PT = 07:01 UTC

// Mirror of the server-side check (server/handlers/launch-signup.ts) so the
// client catches bad input before the network round-trip.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FormState {
  name: string
  email: string
  role: string
  company: string
  what_you_would_build: string
}

const EMPTY_FORM: FormState = {
  name: '',
  email: '',
  role: '',
  company: '',
  what_you_would_build: '',
}

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const remaining = Math.max(0, target.getTime() - now)
  const seconds = Math.floor(remaining / 1000) % 60
  const minutes = Math.floor(remaining / (60 * 1000)) % 60
  const hours = Math.floor(remaining / (60 * 60 * 1000)) % 24
  const days = Math.floor(remaining / (24 * 60 * 60 * 1000))

  return { days, hours, minutes, seconds, isPast: remaining === 0 }
}

export function LaunchPage() {
  usePageSEO({
    title: 'Statewave — Launching Tue June 16, 2026',
    description:
      'Open-source memory runtime for AI agents launches Tue June 16, 2026 at 09:01 CEST. Drop your email to get the launch-day announcement, bench numbers, and 10 invites for early collaborators.',
  })

  const { days, hours, minutes, seconds, isPast } = useCountdown(LAUNCH_AT)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [formError, setFormError] = useState<string>('')
  // Hidden honeypot — real users never touch it; naive bots fill every input.
  const [honeypot, setHoneypot] = useState('')
  // Turnstile token + a nonce we bump to remount the widget for a fresh
  // challenge after a failed submit (tokens are single-use).
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileNonce, setTurnstileNonce] = useState(0)
  const turnstileEnabled = TURNSTILE_SITE_KEY !== ''

  function validate(values: FormState): Partial<Record<keyof FormState, string>> {
    const errs: Partial<Record<keyof FormState, string>> = {}
    if (!values.name.trim()) {
      errs.name = 'Please enter your name.'
    }
    const email = values.email.trim()
    if (!email) {
      errs.email = 'Please enter your email.'
    } else if (!EMAIL_RE.test(email)) {
      errs.email = "That doesn't look like a valid email address."
    }
    return errs
  }

  function handleChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    // Clear a field's error the moment the user starts correcting it.
    setFieldErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
    if (formError) setFormError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (state === 'submitting') return

    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      setState('idle')
      // Move focus to the first invalid field for keyboard + screen-reader users.
      const firstInvalid = (['name', 'email'] as const).find((k) => errs[k])
      if (firstInvalid) {
        document.getElementById(`launch-${firstInvalid}`)?.focus()
      }
      return
    }

    // If Turnstile is configured, require a token before the round-trip.
    if (turnstileEnabled && !turnstileToken) {
      setState('error')
      setFormError('Please complete the “I’m human” check above, then submit.')
      return
    }

    setFieldErrors({})
    setFormError('')
    setState('submitting')
    const failChallenge = () => {
      // Turnstile tokens are single-use — remount the widget so the next
      // attempt gets a fresh challenge.
      setTurnstileToken('')
      setTurnstileNonce((n) => n + 1)
    }
    try {
      const response = await fetch('/api/launch-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role.trim(),
          company: form.company.trim(),
          what_you_would_build: form.what_you_would_build.trim(),
          turnstile_token: turnstileToken,
          hp_company_url: honeypot,
        }),
      })
      if (!response.ok) {
        // Parse the JSON error cleanly — never surface raw JSON to the user.
        const data = (await response.json().catch(() => null)) as { error?: unknown } | null
        const serverMsg =
          data && typeof data.error === 'string' && data.error.trim() ? data.error.trim() : ''
        const friendly =
          serverMsg ||
          (response.status === 503
            ? "Signups aren't open quite yet — please try again shortly."
            : response.status >= 500
              ? 'Something went wrong on our end. Please try again in a moment.'
              : 'We couldn’t submit that. Please check your details and try again.')
        setState('error')
        setFormError(friendly)
        failChallenge()
        return
      }
      setState('success')
      setForm(EMPTY_FORM)
      setHoneypot('')
      setTurnstileToken('')
    } catch {
      setState('error')
      setFormError('Network error — please check your connection and try again.')
      failChallenge()
    }
  }

  return (
    <>
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-6 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">
            Launching Tuesday, June 16, 2026 · 09:01 CEST
          </p>
          <h1 className="mt-5 text-[clamp(2rem,6vw,3.25rem)] font-semibold text-theme-primary tracking-[-0.02em] leading-[1.1]">
            Open-source memory runtime for AI agents.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-theme-secondary leading-relaxed">
            Reproducible, provenance-tagged context bundles instead of query-time retrieval.
            Apache-2.0 across server and SDKs. Self-hosted on Postgres + pgvector.
          </p>

          <div className="mt-10 mb-2">
            {isPast ? (
              <p className="text-base text-theme-primary font-medium">
                We&rsquo;re live. <a href="/" className="text-accent hover:underline">Open the repo &rarr;</a>
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-md mx-auto">
                {[
                  { label: 'days', value: days },
                  { label: 'hrs', value: hours },
                  { label: 'min', value: minutes },
                  { label: 'sec', value: seconds },
                ].map((unit) => (
                  <div
                    key={unit.label}
                    className="rounded-2xl border border-theme-border bg-surface-1 px-3 py-4 sm:px-4 sm:py-5"
                  >
                    <div className="text-[clamp(1.5rem,4vw,2rem)] font-semibold tabular-nums text-theme-primary leading-none">
                      {String(unit.value).padStart(2, '0')}
                    </div>
                    <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-theme-muted">
                      {unit.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Section>
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-theme-border bg-surface-1 p-6 sm:p-8 md:p-10">
            <Heading id="signup" className="text-2xl font-bold text-theme-primary mb-3">
              Get the launch-day announcement
            </Heading>
            <p className="text-sm text-theme-secondary leading-relaxed mb-6">
              On June 16, 2026 we ship Statewave v1.0 plus the open LoCoMo benchmark.
              Drop your email and we&rsquo;ll send the announcement, the row-level bench data,
              and an invite to the first-100 supporter group. No spam, no third-party trackers.
            </p>

            {state === 'success' ? (
              <div
                role="status"
                className="rounded-2xl border border-accent/30 bg-accent/5 p-5 text-sm text-theme-primary"
              >
                <p className="font-medium">You&rsquo;re on the list.</p>
                <p className="mt-2 text-theme-secondary leading-relaxed">
                  We&rsquo;ll send the launch-day note on Tue June 16 at 09:01 CEST.
                  Reply to that email if you want the early-access invite.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <Field
                  id="launch-name"
                  label="Name"
                  required
                  value={form.name}
                  onChange={(v) => handleChange('name', v)}
                  error={fieldErrors.name}
                />
                <Field
                  id="launch-email"
                  label="Email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(v) => handleChange('email', v)}
                  error={fieldErrors.email}
                />
                <Field
                  id="launch-role"
                  label="Role"
                  placeholder="e.g. Staff Eng, ML Eng, Founder, Researcher"
                  value={form.role}
                  onChange={(v) => handleChange('role', v)}
                />
                <Field
                  id="launch-company"
                  label="Company"
                  placeholder="optional"
                  value={form.company}
                  onChange={(v) => handleChange('company', v)}
                />
                <Field
                  id="launch-what"
                  label="What would you build with agent memory?"
                  placeholder="one sentence is fine"
                  multiline
                  value={form.what_you_would_build}
                  onChange={(v) => handleChange('what_you_would_build', v)}
                />

                {/* Honeypot — off-screen, never shown to humans, ignored by
                    AT. A filled value tells the server it's a bot. */}
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: '-9999px',
                    width: 1,
                    height: 1,
                    overflow: 'hidden',
                  }}
                >
                  <label htmlFor="hp_company_url">Company website</label>
                  <input
                    id="hp_company_url"
                    name="hp_company_url"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                {turnstileEnabled ? (
                  <Turnstile
                    key={turnstileNonce}
                    siteKey={TURNSTILE_SITE_KEY}
                    onToken={setTurnstileToken}
                  />
                ) : null}

                <button
                  type="submit"
                  disabled={state === 'submitting'}
                  className="mt-2 w-full rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {state === 'submitting' ? 'Sending…' : 'Notify me on launch day'}
                </button>

                {state === 'error' && formError ? (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400"
                  >
                    {formError}
                  </div>
                ) : null}

                <p className="text-[11px] text-theme-muted leading-relaxed">
                  By submitting you agree to receive the launch-day note plus at most three
                  follow-up emails over the launch month. Unsubscribe in one click on the first email.
                </p>
              </form>
            )}
          </div>
        </div>
      </Section>

      <Section className="bg-surface-1/40">
        <div className="mx-auto max-w-3xl">
          <Heading id="what" className="text-2xl font-bold text-theme-primary mb-6">
            What ships on June 16
          </Heading>
          <ul className="space-y-3 text-sm text-theme-secondary leading-relaxed">
            <li>
              <strong className="text-theme-primary">Statewave v1.0</strong> &mdash; the
              open-source runtime, Apache-2.0, Postgres + pgvector, Python + TypeScript SDKs.
            </li>
            <li>
              <strong className="text-theme-primary">Open LoCoMo benchmark</strong> &mdash;
              row-level JSONL comparing Statewave against Mem0, Zep, and naive context-dumping.
              Anyone can rerun it in roughly 20 minutes against their own API keys.
            </li>
            <li>
              <strong className="text-theme-primary">9 official connectors</strong> &mdash;
              GitHub, Slack, Notion, Discord, Markdown/ADRs, Zendesk/Intercom/Freshdesk, Gmail,
              n8n, Zapier &mdash; plus an MCP server.
            </li>
            <li>
              <strong className="text-theme-primary">Self-host or try hosted</strong> &mdash;
              Docker Compose, Helm chart, or bare-metal. The hosted demo at{' '}
              <a href="/demo" className="text-accent hover:underline">statewave.ai/demo</a> runs
              against a live Statewave instance with no signup required.
            </li>
          </ul>
        </div>
      </Section>
    </>
  )
}

interface FieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
  placeholder?: string
  multiline?: boolean
  error?: string
}

function Field({
  id,
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder,
  multiline = false,
  error,
}: FieldProps) {
  const hasError = Boolean(error)
  const errorId = `${id}-error`
  const base =
    'w-full rounded-xl border bg-surface-0 px-4 py-3 text-sm text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 transition-colors'
  const borderClass = hasError
    ? 'border-red-500/60 focus:ring-red-500/30 focus:border-red-500'
    : 'border-theme-border focus:ring-accent/40 focus:border-accent'
  const cls = `${base} ${borderClass}`
  const shared = {
    id,
    name: id,
    required,
    placeholder,
    value,
    'aria-invalid': hasError || undefined,
    'aria-describedby': hasError ? errorId : undefined,
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    className: cls,
  }

  return (
    <div>
      <label htmlFor={id} className="block">
        <span className="block text-xs font-medium uppercase tracking-[0.16em] text-theme-muted mb-2">
          {label}
          {required ? <span className="text-accent ml-1">*</span> : null}
        </span>
        {multiline ? (
          <textarea {...shared} rows={3} />
        ) : (
          <input {...shared} type={type} />
        )}
      </label>
      {hasError ? (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  )
}

// Minimal shape of the Cloudflare Turnstile global. Kept local (no global
// augmentation) so this stays a self-contained, privacy-preserving widget.
interface TurnstileApi {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string
      callback: (token: string) => void
      'expired-callback'?: () => void
      'error-callback'?: () => void
    },
  ) => string
  remove: (widgetId: string) => void
}

const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script'
const TURNSTILE_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

function getTurnstile(): TurnstileApi | undefined {
  return (window as unknown as { turnstile?: TurnstileApi }).turnstile
}

function loadTurnstileScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (getTurnstile()) return resolve()
    const existing = document.getElementById(TURNSTILE_SCRIPT_ID)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('turnstile load')))
      return
    }
    const s = document.createElement('script')
    s.id = TURNSTILE_SCRIPT_ID
    s.src = TURNSTILE_SRC
    s.async = true
    s.defer = true
    s.addEventListener('load', () => resolve())
    s.addEventListener('error', () => reject(new Error('turnstile load')))
    document.head.appendChild(s)
  })
}

/**
 * Cloudflare Turnstile — privacy-preserving CAPTCHA. Explicit render so it
 * plays nicely with React. Remounted (via a `key` bump from the parent)
 * after a failed submit to issue a fresh single-use token. If the script
 * fails to load the parent's submit still works; the server enforces the
 * token when TURNSTILE_SECRET_KEY is set.
 */
function Turnstile({
  siteKey,
  onToken,
}: {
  siteKey: string
  onToken: (token: string) => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false
    let widgetId: string | undefined

    loadTurnstileScript()
      .then(() => {
        if (cancelled) return
        const api = getTurnstile()
        const el = containerRef.current
        if (!api || !el) return
        widgetId = api.render(el, {
          sitekey: siteKey,
          callback: (token: string) => onToken(token),
          'expired-callback': () => onToken(''),
          'error-callback': () => onToken(''),
        })
      })
      .catch(() => {
        /* script blocked/failed — server-side check still gates when set */
      })

    return () => {
      cancelled = true
      const api = getTurnstile()
      if (api && widgetId) {
        try {
          api.remove(widgetId)
        } catch {
          /* widget already gone */
        }
      }
    }
  }, [siteKey, onToken])

  return <div ref={containerRef} className="mt-1" />
}
