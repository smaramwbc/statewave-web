import { A, LegalPage } from '../components/legal/LegalPage'
import { OFFICE } from '../components/legal/office'
import type { LegalSection } from '../components/legal/LegalPage'

/**
 * /privacy — GDPR-compliant privacy policy for statewave.ai.
 *
 * NOTE FOR REVIEWERS: this draft is generic-OSS-friendly and reflects
 * the actual data flows of statewave.ai (cookieless analytics via
 * Plausible, one strictly necessary cookie, the newsletter, the demo
 * widget). Before
 * publishing, get a DE/EU lawyer to vet the language — especially the
 * Article 6 lawful-basis claims and the third-party processor list.
 */
const SECTIONS: LegalSection[] = [
  {
    id: 'controller',
    title: 'Who is the data controller?',
    toc: 'Data controller',
    body: (
      <p>
        The data controller for this site is WebConnect World SL, Carretera San
        Jeronimo 15 / Piso 2, 28014 Madrid, Spain. Contact: <A to={`mailto:${OFFICE}`}>{OFFICE}</A>.
      </p>
    ),
  },
  {
    id: 'what',
    title: 'What data do we collect, and why?',
    toc: 'What we collect',
    body: (
      <>
        <h3>Marketing site</h3>
        <p>
          For traffic analytics we use Plausible Analytics, a cookieless,
          privacy-focused service that aggregates page views without
          cookies, cross-site tracking, or storing personal data, and
          builds no profiles of individual visitors (Art. 6(1)(f) GDPR
          &mdash; legitimate interest in understanding site usage). We run
          no advertising or third-party tracking. Server access logs (IP
          address, request URL, user agent, timestamp) are retained for up
          to <strong>14 days</strong> for security and abuse-prevention
          purposes (Art. 6(1)(f) GDPR &mdash; legitimate interest in
          operating the service). After 14 days logs are deleted.
        </p>
        <h3>Newsletter</h3>
        <p>
          When you subscribe via the form on <A to="/launch">/launch</A> or
          under a blog post, we store your email address. We use it only to send occasional
          Statewave project updates &mdash; releases, connectors, SDK changes,
          benchmarks, governance features, and important project news (Art.
          6(1)(a) GDPR &mdash; consent). You can withdraw consent at any time via
          the one-click unsubscribe link in every email; we erase the record
          within 7 days of withdrawal. Email addresses collected before the v1.0
          release under the earlier launch-notification consent remain governed by
          that original consent until those subscribers opt into the ongoing
          newsletter.
        </p>
        <h3>Live demo widget</h3>
        <p>
          The interactive demo at <A to="/demo">/demo</A> sets one strictly
          necessary first-party cookie (<code>sw_demo_visitor</code>, 30 days) so
          your conversation can continue across page loads. Messages you type
          into the demo are processed by the Statewave runtime to generate the
          AI response and may be retained for up to 30 days for service
          operation and debugging (Art. 6(1)(f) &mdash; legitimate interest in
          operating the demo and protecting it against abuse). The demo can be
          reset at any time from inside the chat widget.
        </p>
        <h3>Email contact</h3>
        <p>
          Emails you send to <code>{OFFICE}</code>, <code>press@statewave.ai</code>,{' '}
          <code>security@statewave.ai</code>, or <code>licensing@statewave.ai</code> are
          retained as long as required to handle the request and meet record-keeping
          obligations (typically 3 years for commercial correspondence).
        </p>
      </>
    ),
  },
  {
    id: 'processors',
    title: 'Third-party processors',
    toc: 'Processors',
    body: (
      <>
        <p>
          We use the following processors to operate the site and email service.
          Each is under a Data Processing Agreement (DPA) with us.
        </p>
        <ul className="lg-defs">
          <li>
            <strong>Hosting / CDN</strong> Vercel Inc. (US;
            EU&ndash;US Data Privacy Framework) &mdash; serves static assets and the
            API for the newsletter signup form.
          </li>
          <li>
            <strong>App hosting</strong> Fly.io
            (Frankfurt + Madrid regions) &mdash; hosts the Statewave runtime that
            powers the live demo.
          </li>
          <li>
            <strong>Analytics</strong> Plausible
            Analytics (EU-hosted) &mdash; cookieless, privacy-focused traffic
            analytics. Aggregated page-view metrics only; no cookies, no
            cross-site tracking, and no storage of personal data.
          </li>
          <li>
            <strong>Email delivery</strong> Resend
            (US; standard contractual clauses) &mdash; transactional emails
            (signup confirmations, password reset) and the newsletter.
          </li>
          <li>
            <strong>Newsletter storage</strong> Beehiiv
            or Resend Audiences (depending on the channel) &mdash; the newsletter
            subscription record itself.
          </li>
          <li>
            <strong>Bot protection</strong> Cloudflare,
            Inc. (US; EU&ndash;US Data Privacy Framework) &mdash; the &ldquo;I&rsquo;m
            human&rdquo; check (Turnstile) on the newsletter signup form. The check
            loads when you start entering an email address, and Cloudflare receives
            your IP address, browser information and a verification token. It is not
            used for advertising or cross-site tracking (Art. 6(1)(f) GDPR &mdash;
            legitimate interest in preventing automated abuse of the form).
          </li>
          <li>
            <strong>LLM API providers</strong> Demo
            conversations may be sent to one of OpenAI, Anthropic, or another
            LiteLLM-supported provider for inference. Which one is in use at any
            given time is visible inside the demo widget. None of these LLM
            providers are used for analytics or tracking on this site.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'rights',
    title: 'What are your rights under the GDPR?',
    toc: 'Your GDPR rights',
    body: (
      <>
        <p>Under the GDPR you have the right to:</p>
        <ul className="lg-list">
          <li>request access to the personal data we hold about you (Art. 15)</li>
          <li>request rectification of inaccurate data (Art. 16)</li>
          <li>request erasure of your data (Art. 17)</li>
          <li>request restriction of processing (Art. 18)</li>
          <li>request data portability (Art. 20)</li>
          <li>object to processing based on legitimate interest (Art. 21)</li>
          <li>withdraw consent at any time without affecting prior processing (Art. 7(3))</li>
          <li>lodge a complaint with a supervisory authority (Art. 77)</li>
        </ul>
        <p>
          To exercise any of these rights, email <A to={`mailto:${OFFICE}`}>{OFFICE}</A>. We respond within 30 days (one
          extension of up to 60 additional days where justified per Art. 12(3)).
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    toc: 'Changes',
    body: (
      <p>
        If we materially change how we handle personal data we&rsquo;ll update
        this page and the &ldquo;Last updated&rdquo; date at the top. If the change
        broadens what we collect or how we use it we&rsquo;ll notify newsletter
        subscribers by email before the new terms apply.
      </p>
    ),
  },
]

export function PrivacyPage() {
  return (
    <LegalPage
      path="/privacy"
      title="Privacy Policy"
      sub="What personal data statewave.ai collects, why, who processes it, and your rights under the GDPR."
      updated={{ iso: '2026-07-07', label: '7 July 2026' }}
      lead={(
        <>
          <p>
            statewave.ai is the marketing site for the Statewave open-source memory
            runtime. This policy describes what personal data we collect on this
            site and through related services, why we collect it, who we share it
            with, and what rights you have under the GDPR.
          </p>
          <p>
            The site operator is identified on <A to="/impressum">/impressum</A>.
            Cookie-specific details (names, lifetimes, types) live on <A to="/cookies">/cookies</A>.
          </p>
        </>
      )}
      sections={SECTIONS}
    />
  )
}
