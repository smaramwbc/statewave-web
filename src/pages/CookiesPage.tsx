import { Section } from '../components/Section'
import { Heading } from '../components/Heading'
import { usePageSEO } from '../lib/seo'

export function CookiesPage() {
  usePageSEO({
    title: 'Cookie Policy — Statewave',
    description:
      'What cookies and browser storage statewave.ai uses, why, and how long they live. Statewave does not run analytics, advertising, or third-party trackers.',
    robots: 'noindex, follow',
    breadcrumb: false,
  })

  return (
    <>
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-8 sm:pb-12">
        <div className="mx-auto max-w-3xl px-5 sm:px-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">
            Legal
          </p>
          <h1 className="mt-5 text-[clamp(1.75rem,5vw,2.5rem)] font-semibold text-theme-primary tracking-[-0.02em] leading-[1.15]">
            Cookie Policy
          </h1>
          <p className="mt-5 text-sm text-theme-muted">
            Last updated: 9 May 2026
          </p>
          <p className="mt-6 text-base text-theme-secondary leading-relaxed">
            statewave.ai is a marketing site for an open-source project. We do
            not run analytics, advertising, or third-party trackers. The only
            cookie we set is a strictly necessary one used by the live demo
            chat widget so the conversation can continue across page loads.
          </p>
        </div>
      </section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <Heading id="cookies" className="text-2xl font-bold text-theme-primary mb-6">
            Cookies we set
          </Heading>
          <div className="rounded-2xl border border-theme-border bg-surface-1 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-2/60">
                  <tr className="border-b border-theme-border">
                    <th className="text-left p-4 text-theme-muted font-medium">Name</th>
                    <th className="text-left p-4 text-theme-muted font-medium">Purpose</th>
                    <th className="text-left p-4 text-theme-muted font-medium">Type</th>
                    <th className="text-left p-4 text-theme-muted font-medium">Lifetime</th>
                  </tr>
                </thead>
                <tbody className="text-theme-secondary">
                  <tr>
                    <td className="p-4 font-mono text-xs">sw_demo_visitor</td>
                    <td className="p-4 text-theme-muted">
                      Identifies your browser to the live demo chat so it can
                      seed and reload your demo conversation. Strictly necessary
                      for the demo to work.
                    </td>
                    <td className="p-4 text-theme-muted">
                      First-party, HttpOnly, SameSite=Lax, Secure in production
                    </td>
                    <td className="p-4 text-theme-muted">30 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-4 text-sm text-theme-muted leading-relaxed">
            This cookie is &ldquo;strictly necessary&rdquo; under the GDPR /
            ePrivacy framework: it&rsquo;s only set when you open the demo
            chat, it carries no personal information beyond a random visitor
            ID, and it is not shared with any third party.
          </p>
        </div>
      </Section>

      <Section className="bg-surface-1/40">
        <div className="mx-auto max-w-3xl">
          <Heading id="local-storage" className="text-2xl font-bold text-theme-primary mb-6">
            Browser storage we use
          </Heading>
          <p className="text-sm text-theme-muted leading-relaxed mb-6">
            For completeness, we also use a small number of <code className="font-mono text-xs px-1 py-0.5 rounded bg-surface-2 text-theme-secondary">localStorage</code>{' '}
            keys to remember your UI preferences. These never leave your
            browser and are not used to track you.
          </p>
          <ul className="space-y-3 text-sm text-theme-secondary">
            <li className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
              <code className="font-mono text-xs px-2 py-0.5 rounded bg-surface-2 text-theme-primary shrink-0">
                statewave-theme-mode
              </code>
              <span className="text-theme-muted">
                Your light / dark / system theme preference.
              </span>
            </li>
            <li className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
              <code className="font-mono text-xs px-2 py-0.5 rounded bg-surface-2 text-theme-primary shrink-0">
                statewave:manifesto-lang
              </code>
              <span className="text-theme-muted">
                The language you picked on the /why page so we don&rsquo;t
                have to re-detect it on every visit.
              </span>
            </li>
            <li className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
              <code className="font-mono text-xs px-2 py-0.5 rounded bg-surface-2 text-theme-primary shrink-0">
                statewave-demo-onboarding-v1
              </code>
              <span className="text-theme-muted">
                Whether you&rsquo;ve already seen the demo widget&rsquo;s
                welcome panel, so we don&rsquo;t show it on every page load.
              </span>
            </li>
          </ul>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <Heading id="no-trackers" className="text-2xl font-bold text-theme-primary mb-6">
            What we don&rsquo;t do
          </Heading>
          <ul className="space-y-3 text-sm text-theme-secondary">
            {[
              'No analytics or product telemetry on this site (no GA, Plausible, PostHog, Mixpanel, Segment, etc.).',
              'No advertising or marketing cookies.',
              'No third-party social-media trackers, fingerprinting, or session-replay.',
              'No cross-site tracking. The demo cookie is first-party and only readable by statewave.ai.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <svg className="w-4 h-4 text-accent mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section className="bg-surface-1/40">
        <div className="mx-auto max-w-3xl">
          <Heading id="how-to-clear" className="text-2xl font-bold text-theme-primary mb-6">
            Removing the cookie and storage
          </Heading>
          <p className="text-sm text-theme-secondary leading-relaxed">
            You can clear cookies and site data for statewave.ai at any time
            from your browser&rsquo;s settings. The demo widget also has a
            &ldquo;Reset demo&rdquo; control inside the chat that issues a
            fresh visitor ID.
          </p>
          <p className="mt-4 text-sm text-theme-muted leading-relaxed">
            If you clear the visitor cookie, the demo will simply start a new
            conversation the next time you open it. Clearing localStorage will
            reset your theme and language preferences to defaults &mdash; the
            site will keep working normally.
          </p>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <Heading id="changes" className="text-2xl font-bold text-theme-primary mb-6">
            Changes to this policy
          </Heading>
          <p className="text-sm text-theme-secondary leading-relaxed">
            If we ever add cookies that aren&rsquo;t strictly necessary
            &mdash; for example product analytics &mdash; we&rsquo;ll update
            this page and add a proper consent prompt before any non-essential
            cookie is set.
          </p>
        </div>
      </Section>
    </>
  )
}
