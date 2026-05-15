import { Section } from '../components/Section'
import { Heading } from '../components/Heading'
import { usePageSEO } from '../lib/seo'

/**
 * /privacy — GDPR-compliant privacy policy for statewave.ai.
 *
 * NOTE FOR REVIEWERS: this draft is generic-OSS-friendly and reflects
 * the actual data flows of statewave.ai (no analytics, one strictly
 * necessary cookie, the launch waitlist, the demo widget). Before
 * publishing, get a DE/EU lawyer to vet the language — especially the
 * Article 6 lawful-basis claims and the third-party processor list.
 */
export function PrivacyPage() {
  usePageSEO({
    title: 'Statewave — Privacy Policy',
    description:
      'How statewave.ai handles personal data: lawful bases, data we collect, third-party processors, retention, and your GDPR rights.',
    robots: 'noindex, follow',
    breadcrumb: false,
  })

  return (
    <>
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-8 sm:pb-12">
        <div className="mx-auto max-w-3xl px-5 sm:px-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">Legal</p>
          <h1 className="mt-5 text-[clamp(1.75rem,5vw,2.5rem)] font-semibold text-theme-primary tracking-[-0.02em] leading-[1.15]">
            Privacy Policy
          </h1>
          <p className="mt-5 text-sm text-theme-muted">Last updated: 15 May 2026</p>
          <p className="mt-6 text-base text-theme-secondary leading-relaxed">
            statewave.ai is the marketing site for the Statewave open-source memory
            runtime. This policy describes what personal data we collect on this
            site and through related services, why we collect it, who we share it
            with, and what rights you have under the GDPR.
          </p>
          <p className="mt-3 text-sm text-theme-muted leading-relaxed">
            The site operator is identified on{' '}
            <a href="/impressum" className="text-accent hover:underline">/impressum</a>.
            Cookie-specific details (names, lifetimes, types) live on{' '}
            <a href="/cookies" className="text-accent hover:underline">/cookies</a>.
          </p>
        </div>
      </section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <Heading id="controller" className="text-2xl font-bold text-theme-primary mb-6">
            Data controller
          </Heading>
          <p className="text-sm text-theme-secondary leading-relaxed">
            The data controller for this site is WebConnect World SL, Carretera San
            Jeronimo 15 / Piso 2, 28014 Madrid, Spain. Contact:{' '}
            <a href="mailto:office@webconnect.pro" className="text-accent hover:underline">
              office@webconnect.pro
            </a>
            .
          </p>
        </div>
      </Section>

      <Section className="bg-surface-1/40">
        <div className="mx-auto max-w-3xl">
          <Heading id="what" className="text-2xl font-bold text-theme-primary mb-6">
            What data we collect, and why
          </Heading>
          <div className="space-y-6 text-sm text-theme-secondary leading-relaxed">
            <div>
              <h3 className="text-theme-primary font-medium mb-2">Marketing site</h3>
              <p>
                We do not run analytics, advertising, or third-party trackers on
                statewave.ai. Server access logs (IP address, request URL, user
                agent, timestamp) are retained for up to <strong>14 days</strong> for
                security and abuse-prevention purposes (Art. 6(1)(f) GDPR &mdash;
                legitimate interest in operating the service). After 14 days
                logs are deleted.
              </p>
            </div>
            <div>
              <h3 className="text-theme-primary font-medium mb-2">Launch waitlist (/launch)</h3>
              <p>
                When you submit the form on{' '}
                <a href="/launch" className="text-accent hover:underline">/launch</a>{' '}
                we store your name, email address, optional role, optional company,
                and optional answer to &ldquo;what would you build&rdquo;. We use this
                to send the launch-day announcement and up to three follow-up emails
                during the launch month (Art. 6(1)(a) GDPR &mdash; consent). You can
                withdraw consent at any time via the one-click unsubscribe link in
                every email; we erase the record within 7 days of withdrawal.
              </p>
            </div>
            <div>
              <h3 className="text-theme-primary font-medium mb-2">Live demo widget</h3>
              <p>
                The interactive demo at <a href="/demo" className="text-accent hover:underline">/demo</a>{' '}
                sets one strictly necessary first-party cookie
                (<code className="font-mono text-xs">sw_demo_visitor</code>, 30 days) so
                your conversation can continue across page loads. Messages you type
                into the demo are processed by the Statewave runtime to generate the
                AI response and may be retained for up to 30 days for service
                operation and debugging (Art. 6(1)(f) &mdash; legitimate interest in
                operating the demo and protecting it against abuse). The demo can be
                reset at any time from inside the chat widget.
              </p>
            </div>
            <div>
              <h3 className="text-theme-primary font-medium mb-2">Email contact</h3>
              <p>
                Emails you send to <code className="font-mono text-xs">office@webconnect.pro</code>,{' '}
                <code className="font-mono text-xs">press@statewave.ai</code>,{' '}
                <code className="font-mono text-xs">security@statewave.ai</code>, or{' '}
                <code className="font-mono text-xs">licensing@statewave.ai</code> are
                retained as long as required to handle the request and meet record-keeping
                obligations (typically 3 years for commercial correspondence).
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <Heading id="processors" className="text-2xl font-bold text-theme-primary mb-6">
            Third-party processors
          </Heading>
          <p className="text-sm text-theme-secondary leading-relaxed mb-4">
            We use the following processors to operate the site and email service.
            Each is under a Data Processing Agreement (DPA) with us.
          </p>
          <ul className="space-y-3 text-sm text-theme-secondary">
            <li>
              <strong className="text-theme-primary">Hosting / CDN:</strong> Vercel Inc. (US;
              EU&ndash;US Data Privacy Framework) &mdash; serves static assets and the
              API for the launch waitlist form.
            </li>
            <li>
              <strong className="text-theme-primary">App hosting:</strong> Fly.io
              (Frankfurt + Madrid regions) &mdash; hosts the Statewave runtime that
              powers the live demo.
            </li>
            <li>
              <strong className="text-theme-primary">Email delivery:</strong> Resend
              (US; standard contractual clauses) &mdash; transactional emails
              (signup confirmations, password reset) and the launch waitlist newsletter.
            </li>
            <li>
              <strong className="text-theme-primary">Waitlist storage:</strong> Beehiiv
              or Resend Audiences (depending on the channel) &mdash; the launch
              waitlist record itself.
            </li>
            <li>
              <strong className="text-theme-primary">LLM API providers:</strong> Demo
              conversations may be sent to one of OpenAI, Anthropic, or another
              LiteLLM-supported provider for inference. Which one is in use at any
              given time is visible inside the demo widget. None of these providers
              are used for analytics on this site.
            </li>
          </ul>
        </div>
      </Section>

      <Section className="bg-surface-1/40">
        <div className="mx-auto max-w-3xl">
          <Heading id="rights" className="text-2xl font-bold text-theme-primary mb-6">
            Your GDPR rights
          </Heading>
          <p className="text-sm text-theme-secondary leading-relaxed mb-4">
            Under the GDPR you have the right to:
          </p>
          <ul className="space-y-2 text-sm text-theme-secondary list-disc list-inside">
            <li>request access to the personal data we hold about you (Art. 15)</li>
            <li>request rectification of inaccurate data (Art. 16)</li>
            <li>request erasure of your data (Art. 17)</li>
            <li>request restriction of processing (Art. 18)</li>
            <li>request data portability (Art. 20)</li>
            <li>object to processing based on legitimate interest (Art. 21)</li>
            <li>withdraw consent at any time without affecting prior processing (Art. 7(3))</li>
            <li>lodge a complaint with a supervisory authority (Art. 77)</li>
          </ul>
          <p className="mt-4 text-sm text-theme-secondary leading-relaxed">
            To exercise any of these rights, email{' '}
            <a href="mailto:office@webconnect.pro" className="text-accent hover:underline">
              office@webconnect.pro
            </a>
            . We respond within 30 days (one extension of up to 60 additional days where
            justified per Art. 12(3)).
          </p>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <Heading id="changes" className="text-2xl font-bold text-theme-primary mb-6">
            Changes to this policy
          </Heading>
          <p className="text-sm text-theme-secondary leading-relaxed">
            If we materially change how we handle personal data we&rsquo;ll update
            this page and the &ldquo;Last updated&rdquo; date at the top. If the change
            broadens what we collect or how we use it we&rsquo;ll notify waitlist
            subscribers by email before the new terms apply.
          </p>
        </div>
      </Section>
    </>
  )
}
