import { useCallback, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Turnstile } from './Turnstile'
import { TURNSTILE_SITE_KEY } from '../lib/turnstile'

/* "Get the next post" — email capture for the Statewave Guide series, on the
 * Journey Index and at the foot of every episode.
 *
 * It posts to the same endpoint as /launch (/api/launch-signup): same rate
 * limit, same honeypot, same Turnstile check, same Resend + Beehiiv
 * forwarding. One hardened path for every signup on the site rather than a
 * second one to keep in step.
 *
 * It also sends `source: 'statewave-guide'`. The endpoint reads only the
 * fields it knows, so today that is ignored and a Guide signup is an
 * ordinary newsletter signup — which is why the copy says so. If Guide
 * readers are to be segmented, the endpoint starts reading `source` and
 * nothing here changes.
 */

// Mirror of the server-side check in server/handlers/launch-signup.ts.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type State = 'idle' | 'submitting' | 'success' | 'error'

export function GuideSubscribe() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>('idle')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [token, setToken] = useState('')
  const [nonce, setNonce] = useState(0)
  const turnstileOn = TURNSTILE_SITE_KEY !== ''
  const onToken = useCallback((t: string) => setToken(t), [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (state === 'submitting') return

    const value = email.trim()
    if (!EMAIL_RE.test(value)) {
      setState('error')
      setMessage("That doesn't look like a valid email address.")
      return
    }
    if (turnstileOn && !token) {
      setState('error')
      setMessage('Please complete the “I’m human” check, then subscribe.')
      return
    }

    setState('submitting')
    setMessage('')
    // Tokens are single-use; a failed attempt needs a fresh challenge.
    const resetChallenge = () => {
      setToken('')
      setNonce((n) => n + 1)
    }

    try {
      const response = await fetch('/api/launch-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: value,
          turnstile_token: token,
          hp_company_url: honeypot,
          source: 'statewave-guide',
        }),
      })
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: unknown } | null
        const server = data && typeof data.error === 'string' ? data.error.trim() : ''
        setState('error')
        setMessage(
          server ||
            (response.status === 503
              ? "Subscriptions aren't available right now — please try again shortly."
              : 'Something went wrong. Please try again in a moment.'),
        )
        resetChallenge()
        return
      }
      setState('success')
      setEmail('')
    } catch {
      setState('error')
      setMessage('Network error — please check your connection and try again.')
      resetChallenge()
    }
  }

  return (
    <div className="rounded-2xl border border-brand-500/25 bg-brand-500/[0.05] p-6 sm:p-7">
      <p className="section-eyebrow m-0! text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">
        Follow the build
      </p>
      <p className="mt-2! mb-0! font-heading text-lg font-semibold not-italic text-theme-primary">
        Get each new Statewave Guide post by email.
      </p>

      {state === 'success' ? (
        <p role="status" className="mt-4! mb-0! text-sm not-italic text-success">
          You’re subscribed. The next post will land in your inbox.
        </p>
      ) : (
        <form onSubmit={submit} noValidate className="mt-4 flex flex-col gap-3 sm:flex-row">
          <label htmlFor="guide-subscribe-email" className="sr-only">
            Email address
          </label>
          <input
            id="guide-subscribe-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (state === 'error') setState('idle')
            }}
            aria-invalid={state === 'error'}
            aria-describedby={message ? 'guide-subscribe-message' : undefined}
            placeholder="you@company.com"
            className="min-w-0 flex-1 rounded-full border border-brand-500/30 bg-surface-1/60 px-4 py-2.5 text-sm not-italic text-theme-primary placeholder:text-theme-muted focus:border-brand-500/60 focus:outline-none"
          />

          {/* Honeypot — off-screen, skipped by keyboard and screen readers. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor="guide-hp">Company website</label>
            <input
              id="guide-hp"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={state === 'submitting'}
            className="btn-gradient shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold not-italic text-white! disabled:opacity-60"
          >
            {state === 'submitting' ? 'Subscribing…' : 'Subscribe'}
          </button>
        </form>
      )}

      {turnstileOn && state !== 'success' && (
        <Turnstile key={nonce} siteKey={TURNSTILE_SITE_KEY} onToken={onToken} />
      )}

      {message && (
        <p id="guide-subscribe-message" role="alert" className="mt-3! mb-0! text-sm not-italic text-danger">
          {message}
        </p>
      )}

      <p className="mt-3! mb-0! text-xs not-italic text-theme-muted">
        Along with occasional Statewave updates. Unsubscribe anytime —{' '}
        <Link to="/privacy">privacy</Link>.
      </p>
    </div>
  )
}
