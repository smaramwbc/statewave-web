import { useEffect, useState, type FormEvent } from 'react'
import { Section } from '../components/Section'
import { Heading } from '../components/Heading'
import { usePageSEO } from '../lib/seo'

/**
 * /launch — public landing for the June 2, 2026 launch, with email
 * capture. Form submission is stubbed: it POSTs to `/api/launch-signup`
 * which is wired to Beehiiv / Resend separately (see statewave-launch
 * issue #6 — handled by the email-infra team).
 */

const LAUNCH_AT = new Date('2026-06-02T07:01:00.000Z') // 09:01 CEST = 00:01 PT = 07:01 UTC

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
    title: 'Statewave — Launching Tue June 2, 2026',
    description:
      'Open-source memory runtime for AI agents launches Tue June 2, 2026 at 09:01 CEST. Drop your email to get the launch-day announcement, bench numbers, and 10 invites for early collaborators.',
  })

  const { days, hours, minutes, seconds, isPast } = useCountdown(LAUNCH_AT)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  function handleChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (state === 'submitting') return
    setState('submitting')
    setErrorMessage('')
    try {
      const response = await fetch('/api/launch-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!response.ok) {
        const text = await response.text().catch(() => '')
        throw new Error(text || `Signup failed (${response.status})`)
      }
      setState('success')
      setForm(EMPTY_FORM)
    } catch (err) {
      setState('error')
      setErrorMessage(err instanceof Error ? err.message : 'Signup failed. Please try again.')
    }
  }

  return (
    <>
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-6 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">
            Launching Tuesday, June 2, 2026 · 09:01 CEST
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
              On June 2, 2026 we ship Statewave v1.0 plus the open LoCoMo benchmark.
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
                  We&rsquo;ll send the launch-day note on Tue June 2 at 09:01 CEST.
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
                />
                <Field
                  id="launch-email"
                  label="Email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(v) => handleChange('email', v)}
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

                <button
                  type="submit"
                  disabled={state === 'submitting'}
                  className="mt-2 w-full rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {state === 'submitting' ? 'Sending…' : 'Notify me on launch day'}
                </button>

                {state === 'error' ? (
                  <p
                    role="alert"
                    className="text-xs text-red-600 dark:text-red-400"
                  >
                    {errorMessage || 'Something went wrong. Please try again.'}
                  </p>
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
            What ships on June 2
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
}: FieldProps) {
  const sharedClass =
    'w-full rounded-xl border border-theme-border bg-surface-0 px-4 py-3 text-sm text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors'

  return (
    <label htmlFor={id} className="block">
      <span className="block text-xs font-medium uppercase tracking-[0.16em] text-theme-muted mb-2">
        {label}
        {required ? <span className="text-accent ml-1">*</span> : null}
      </span>
      {multiline ? (
        <textarea
          id={id}
          name={id}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={sharedClass}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={sharedClass}
        />
      )}
    </label>
  )
}
