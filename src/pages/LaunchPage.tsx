import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Section } from '../components/Section'
import { Heading } from '../components/Heading'
import { usePageSEO } from '../lib/seo'

// Cloudflare Turnstile public site key. Behind an env seam (same pattern as
// the server's TURNSTILE_SECRET_KEY): when unset the widget is skipped and
// the form still works (fail-open). Privacy-preserving CAPTCHA — chosen over
// reCAPTCHA to keep the site free of third-party tracking (analytics stays
// cookieless via Plausible).
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
      <section className="relative overflow-hidden pt-24 pb-12 sm:pt-28 sm:pb-14 md:pt-36 md:pb-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-10 h-[24rem] w-[42rem] -translate-x-1/2 rounded-full bg-brand-500/[0.06] blur-3xl"
        />

        <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-6">
          <p className="section-eyebrow mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            Statewave Newsletter
          </p>

          <h1 className="font-heading text-4xl font-bold leading-[0.98] tracking-[-0.03em] text-theme-primary sm:text-5xl md:text-[56px]">
            Stay current with Statewave.
          </h1>

          <p className="mx-auto mt-6 max-w-[48rem] text-[17px] leading-[1.7] text-theme-secondary/85 sm:text-[19px] md:text-[20px]">
            Statewave v1.0 — the open-source memory runtime for AI agents — is
            available. Subscribe for occasional updates on releases, connectors,
            SDKs, benchmarks, governance features, and important project news.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/25 bg-brand-500/[0.06] px-4 py-2 text-sm font-medium text-brand-400 transition-colors hover:border-brand-500/45 hover:bg-brand-500/[0.1]"
            >
              Get started
              <span aria-hidden="true">→</span>
            </a>

            <a
              href="https://github.com/smaramwbc/statewave"
              className="inline-flex items-center rounded-full border border-theme-border bg-surface-1/45 px-4 py-2 text-sm font-medium text-theme-secondary transition-colors hover:border-brand-500/30 hover:text-theme-primary"
            >
              GitHub
            </a>

            <a
              href="https://github.com/smaramwbc/statewave-docs"
              className="inline-flex items-center rounded-full border border-theme-border bg-surface-1/45 px-4 py-2 text-sm font-medium text-theme-secondary transition-colors hover:border-brand-500/30 hover:text-theme-primary"
            >
              Documentation
            </a>

            <a
              href="https://github.com/smaramwbc/statewave/releases/tag/v1.0.0"
              className="inline-flex items-center rounded-full border border-theme-border bg-surface-1/45 px-4 py-2 text-sm font-medium text-theme-secondary transition-colors hover:border-brand-500/30 hover:text-theme-primary"
            >
              v1.0 release notes
            </a>
          </div>
        </div>
      </section>

      <Section className="bg-surface-1">
        <div className="mx-auto max-w-2xl">
          <div className="relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-12 -top-6 h-32 rounded-full bg-brand-500/[0.07] blur-3xl"
            />

            <div className="relative rounded-[2rem] border border-theme-border bg-surface-2/35 p-6 backdrop-blur-sm sm:p-8 md:p-10">
              <Heading
                id="signup"
                className="mb-3 font-heading text-2xl font-bold leading-tight tracking-[-0.02em] text-theme-primary sm:text-3xl"
              >
                Subscribe to Statewave updates
              </Heading>

              <p className="mb-7 max-w-xl text-[15px] leading-[1.7] text-theme-secondary/85">
                Occasional emails — major releases, new connectors and SDK changes,
                benchmarks and research, governance features, and meaningful project
                news. No spam, no third-party trackers, and we never share your email.
              </p>

              {state === 'success' ? (
                <div
                  role="status"
                  className="rounded-2xl border border-brand-500/30 bg-brand-500/[0.06] p-5 text-sm text-theme-primary"
                >
                  <p className="font-semibold">You&rsquo;re subscribed.</p>

                  <p className="mt-2 leading-relaxed text-theme-secondary/90">
                    Thanks — we&rsquo;ll be in touch when there&rsquo;s something worth
                    sharing. Every email includes a one-click unsubscribe.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="newsletter-email" className="block">
                      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-muted">
                        Email
                        <span className="ml-1 text-brand-500">*</span>
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
                        aria-describedby={
                          emailError ? 'newsletter-email-error' : undefined
                        }
                        onChange={(e) => handleEmailChange(e.target.value)}
                        className={`w-full rounded-2xl border bg-surface-0/80 px-4 py-3.5 text-sm text-theme-primary outline-none transition-all placeholder:text-theme-muted/70 focus:ring-2 ${emailError
                          ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-theme-border focus:border-brand-500/60 focus:ring-brand-500/20'
                          }`}
                      />
                    </label>

                    {emailError ? (
                      <p
                        id="newsletter-email-error"
                        role="alert"
                        className="mt-2 text-xs text-red-600 dark:text-red-400"
                      >
                        {emailError}
                      </p>
                    ) : null}
                  </div>

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
                    className="group relative mt-2 inline-flex w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-brand-400 via-brand-500 to-violet-500 px-6 py-4 text-sm font-semibold text-white shadow-[0_0_32px_rgba(99,102,241,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(99,102,241,0.32)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-white/0 transition-colors duration-300 group-hover:bg-white/[0.06]"
                    />

                    <span className="relative z-10">
                      {state === 'submitting' ? 'Subscribing…' : 'Subscribe'}
                    </span>
                  </button>



                  {state === 'error' && formError ? (
                    <div
                      role="alert"
                      className="rounded-2xl border border-red-500/30 bg-red-500/[0.06] px-4 py-3 text-sm text-red-600 dark:text-red-400"
                    >
                      {formError}
                    </div>
                  ) : null}

                  <p className="pt-1 text-[11px] leading-relaxed text-theme-muted/85">
                    By subscribing you agree to receive occasional Statewave project
                    updates at the address above. We use your email only to send these
                    updates; unsubscribe in one click from any email. See our{' '}
                    <a
                      href="/privacy"
                      className="underline underline-offset-4 transition-colors hover:text-theme-secondary"
                    >
                      Privacy Policy
                    </a>
                    .
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </Section>

      <Section className="relative overflow-hidden bg-surface-1/40">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-[38rem] -translate-x-1/2 rounded-full bg-brand-500/[0.05] blur-3xl"
        />

        <div className="relative mx-auto max-w-5xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
              What to expect
            </p>

            <Heading
              id="what"
              className="font-heading text-3xl font-bold leading-tight tracking-[-0.025em] text-theme-primary sm:text-4xl"
            >
              What you&rsquo;ll receive
            </Heading>

            <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-[1.7] text-theme-secondary/85 sm:text-[17px]">
              Occasional updates focused on the releases, tools, research, and
              decisions shaping Statewave.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.75rem] border border-theme-border bg-surface-2/35 p-6 backdrop-blur-sm transition-colors hover:border-theme-border-hover">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/[0.07] text-sm font-semibold text-brand-400">
                01
              </span>

              <h3 className="mt-5 font-heading text-lg font-semibold text-theme-primary">
                Releases
              </h3>

              <p className="mt-2 text-sm leading-[1.7] text-theme-secondary/85">
                New Statewave versions and clear summaries of what changed, written
                the way developers want to read them.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-theme-border bg-surface-2/35 p-6 backdrop-blur-sm transition-colors hover:border-theme-border-hover">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/[0.07] text-sm font-semibold text-brand-400">
                02
              </span>

              <h3 className="mt-5 font-heading text-lg font-semibold text-theme-primary">
                Connectors &amp; SDKs
              </h3>

              <p className="mt-2 text-sm leading-[1.7] text-theme-secondary/85">
                New integrations and notable changes across the Python and TypeScript
                SDKs.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-theme-border bg-surface-2/35 p-6 backdrop-blur-sm transition-colors hover:border-theme-border-hover">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/[0.07] text-sm font-semibold text-brand-400">
                03
              </span>

              <h3 className="mt-5 font-heading text-lg font-semibold text-theme-primary">
                Benchmarks &amp; research
              </h3>

              <p className="mt-2 text-sm leading-[1.7] text-theme-secondary/85">
                Reproducible results, technical experiments, and research write-ups
                when we publish them.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-theme-border bg-surface-2/35 p-6 backdrop-blur-sm transition-colors hover:border-theme-border-hover">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/[0.07] text-sm font-semibold text-brand-400">
                04
              </span>

              <h3 className="mt-5 font-heading text-lg font-semibold text-theme-primary">
                Governance &amp; project news
              </h3>

              <p className="mt-2 text-sm leading-[1.7] text-theme-secondary/85">
                Meaningful governance features, project decisions, and important
                community announcements.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm leading-relaxed text-theme-secondary/85">
            <span>Prefer to follow along directly?</span>

            <a
              href="https://github.com/smaramwbc/statewave"
              className="font-medium text-brand-400 transition-colors hover:text-brand-300"
            >
              Star and watch the repository
            </a>

            <span>on GitHub, or read the</span>

            <a
              href="https://github.com/smaramwbc/statewave-docs"
              className="font-medium text-brand-400 transition-colors hover:text-brand-300"
            >
              documentation
            </a>
            <span>.</span>
          </div>
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
