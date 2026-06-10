import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Section } from '../components/Section'
import { Heading } from '../components/Heading'
import { usePageSEO } from '../lib/seo'

// Cloudflare Turnstile public site key. Behind an env seam (same pattern as
// the server's TURNSTILE_SECRET_KEY): when unset the widget is skipped and
// the form still works (fail-open). Privacy-preserving CAPTCHA — chosen over
// reCAPTCHA so the site's "no third-party trackers" promise stays true.
const TURNSTILE_SITE_KEY = (import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '') as string

/**
 * /launch — the permanent Statewave updates / newsletter registration page.
 *
 * Statewave v1.0 has shipped; this route is no longer a launch waitlist. It
 * is kept at /launch to preserve existing inbound links, bookmarks, and
 * indexing, and now collects email addresses for occasional project updates.
 *
 * Submission POSTs to `/api/launch-signup` (an internal route name retained to
 * avoid a backend/list migration — tracked as tech debt), which forwards the
 * address to the configured Resend + Beehiiv audiences. Only the email is
 * required; no profiling fields are collected.
 */

// Mirror of the server-side check (server/handlers/launch-signup.ts) so the
// client catches bad input before the network round-trip.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LaunchPage() {
  usePageSEO({
    title: 'Statewave updates — subscribe to the newsletter',
    description:
      'Statewave v1.0 is available. Subscribe for occasional updates on releases, connectors, SDKs, benchmarks, governance features, and important project news. Unsubscribe anytime.',
  })

  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [emailError, setEmailError] = useState<string>('')
  const [formError, setFormError] = useState<string>('')
  // Hidden honeypot — real users never touch it; naive bots fill every input.
  const [honeypot, setHoneypot] = useState('')
  // Turnstile token + a nonce we bump to remount the widget for a fresh
  // challenge after a failed submit (tokens are single-use).
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileNonce, setTurnstileNonce] = useState(0)
  const turnstileEnabled = TURNSTILE_SITE_KEY !== ''

  function handleEmailChange(value: string) {
    setEmail(value)
    if (emailError) setEmailError('')
    if (formError) setFormError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (state === 'submitting') return

    const trimmed = email.trim()
    if (!trimmed) {
      setEmailError('Please enter your email.')
      document.getElementById('newsletter-email')?.focus()
      return
    }
    if (!EMAIL_RE.test(trimmed)) {
      setEmailError("That doesn't look like a valid email address.")
      document.getElementById('newsletter-email')?.focus()
      return
    }

    // If Turnstile is configured, require a token before the round-trip.
    if (turnstileEnabled && !turnstileToken) {
      setState('error')
      setFormError('Please complete the “I’m human” check above, then submit.')
      return
    }

    setEmailError('')
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
          email: trimmed,
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
            ? "Subscriptions aren't available right now — please try again shortly."
            : response.status >= 500
              ? 'Something went wrong on our end. Please try again in a moment.'
              : 'We couldn’t subscribe that address. Please check it and try again.')
        setState('error')
        setFormError(friendly)
        failChallenge()
        return
      }
      setState('success')
      setEmail('')
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
            Statewave newsletter
          </p>
          <h1 className="mt-5 text-[clamp(2rem,6vw,3.25rem)] font-semibold text-theme-primary tracking-[-0.02em] leading-[1.1]">
            Stay current with Statewave.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-theme-secondary leading-relaxed">
            Statewave v1.0 — the open-source memory runtime for AI agents — is available.
            Subscribe for occasional updates on releases, connectors, SDKs, benchmarks,
            governance features, and important project news.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
            <a href="/" className="text-accent hover:underline">Get started &rarr;</a>
            <a href="https://github.com/smaramwbc/statewave" className="text-accent hover:underline">GitHub</a>
            <a href="https://github.com/smaramwbc/statewave-docs" className="text-accent hover:underline">Documentation</a>
            <a href="https://github.com/smaramwbc/statewave/releases/tag/v1.0.0" className="text-accent hover:underline">v1.0 release notes</a>
          </div>
        </div>
      </section>

      <Section>
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-theme-border bg-surface-1 p-6 sm:p-8 md:p-10">
            <Heading id="signup" className="text-2xl font-bold text-theme-primary mb-3">
              Subscribe to Statewave updates
            </Heading>
            <p className="text-sm text-theme-secondary leading-relaxed mb-6">
              Occasional emails — major releases, new connectors and SDK changes, benchmarks and
              research, governance features, and meaningful project news. No spam, no third-party
              trackers, and we never share your email.
            </p>

            {state === 'success' ? (
              <div
                role="status"
                className="rounded-2xl border border-accent/30 bg-accent/5 p-5 text-sm text-theme-primary"
              >
                <p className="font-medium">You&rsquo;re subscribed.</p>
                <p className="mt-2 text-theme-secondary leading-relaxed">
                  Thanks — we&rsquo;ll be in touch when there&rsquo;s something worth sharing.
                  Every email includes a one-click unsubscribe.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="newsletter-email" className="block">
                    <span className="block text-xs font-medium uppercase tracking-[0.16em] text-theme-muted mb-2">
                      Email<span className="text-accent ml-1">*</span>
                    </span>
                    <input
                      id="newsletter-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      aria-invalid={emailError ? true : undefined}
                      aria-describedby={emailError ? 'newsletter-email-error' : undefined}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      className={`w-full rounded-xl border bg-surface-0 px-4 py-3 text-sm text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 transition-colors ${
                        emailError
                          ? 'border-red-500/60 focus:ring-red-500/30 focus:border-red-500'
                          : 'border-theme-border focus:ring-accent/40 focus:border-accent'
                      }`}
                    />
                  </label>
                  {emailError ? (
                    <p id="newsletter-email-error" role="alert" className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                      {emailError}
                    </p>
                  ) : null}
                </div>

                {/* Honeypot — off-screen, never shown to humans, ignored by
                    AT. A filled value tells the server it's a bot. */}
                <div
                  aria-hidden="true"
                  style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}
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
                  {state === 'submitting' ? 'Subscribing…' : 'Subscribe'}
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
                  By subscribing you agree to receive occasional Statewave project updates at the
                  address above. We use your email only to send these updates; unsubscribe in one
                  click from any email. See our{' '}
                  <a href="/privacy" className="underline hover:text-theme-secondary">Privacy Policy</a>.
                </p>
              </form>
            )}
          </div>
        </div>
      </Section>

      <Section className="bg-surface-1/40">
        <div className="mx-auto max-w-3xl">
          <Heading id="what" className="text-2xl font-bold text-theme-primary mb-6">
            What you&rsquo;ll receive
          </Heading>
          <ul className="space-y-3 text-sm text-theme-secondary leading-relaxed">
            <li>
              <strong className="text-theme-primary">Releases</strong> &mdash; new Statewave
              versions and what changed, the way developers want to read it.
            </li>
            <li>
              <strong className="text-theme-primary">Connectors &amp; SDKs</strong> &mdash; new
              integrations and notable Python / TypeScript SDK changes.
            </li>
            <li>
              <strong className="text-theme-primary">Benchmarks &amp; research</strong> &mdash;
              reproducible numbers and technical write-ups when we publish them.
            </li>
            <li>
              <strong className="text-theme-primary">Governance &amp; project news</strong> &mdash;
              meaningful governance features and important community announcements.
            </li>
          </ul>
          <p className="mt-6 text-sm text-theme-secondary leading-relaxed">
            Prefer to follow along directly? Star and watch{' '}
            <a href="https://github.com/smaramwbc/statewave" className="text-accent hover:underline">the repository</a>{' '}
            on GitHub, or read the{' '}
            <a href="https://github.com/smaramwbc/statewave-docs" className="text-accent hover:underline">documentation</a>.
          </p>
        </div>
      </Section>
    </>
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
