import { Section } from '../components/Section'
import { Heading } from '../components/Heading'
import { usePageSEO } from '../lib/seo'

/**
 * /terms — Terms of Service for the statewave.ai marketing site and
 * the hosted demo.
 *
 * NOTE FOR REVIEWERS: this draft covers what statewave.ai actually
 * does today: marketing site + hosted demo + newsletter. It does
 * NOT cover a paid product or self-hosted Statewave (those are
 * governed separately — Apache-2.0 for the OSS, individual contracts
 * for any future hosted plan). Get a lawyer to vet before publishing,
 * especially the limitation-of-liability and dispute-resolution clauses.
 */
export function TermsPage() {
  usePageSEO({
    title: 'Statewave — Terms of Service',
    description:
      'Terms of Service for the statewave.ai marketing site, the hosted live demo, and the newsletter.',
    robots: 'noindex, follow',
    breadcrumb: false,
  })

  return (
    <>
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-8 sm:pb-12">
        <div className="mx-auto max-w-3xl px-5 sm:px-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">Legal</p>
          <h1 className="mt-5 text-[clamp(1.75rem,5vw,2.5rem)] font-semibold text-theme-primary tracking-[-0.02em] leading-[1.15]">
            Terms of Service
          </h1>
          <p className="mt-5 text-sm text-theme-muted">Last updated: 10 June 2026</p>
          <p className="mt-6 text-base text-theme-secondary leading-relaxed">
            These terms govern your use of <a href="https://www.statewave.ai" className="text-accent hover:underline">statewave.ai</a>{' '}
            (the &ldquo;Site&rdquo;), the live demo at <a href="/demo" className="text-accent hover:underline">/demo</a>,
            and the newsletter at <a href="/launch" className="text-accent hover:underline">/launch</a>. By using any
            of these you agree to these terms.
          </p>
          <p className="mt-3 text-sm text-theme-muted leading-relaxed">
            The Statewave open-source software itself is governed by the{' '}
            <a
              href="https://github.com/smaramwbc/statewave/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Apache License 2.0
            </a>
            {' '}&mdash; these terms do not apply to your self-hosted use of the software.
          </p>
        </div>
      </section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <Heading id="operator" className="text-2xl font-bold text-theme-primary mb-6">
            Operator
          </Heading>
          <p className="text-sm text-theme-secondary leading-relaxed">
            The Site is operated by WebConnect World SL (the &ldquo;Operator&rdquo; or
            &ldquo;we&rdquo;), registered in Madrid, Spain. Full legal disclosure on{' '}
            <a href="/impressum" className="text-accent hover:underline">/impressum</a>.
          </p>
        </div>
      </Section>

      <Section className="bg-surface-1/40">
        <div className="mx-auto max-w-3xl">
          <Heading id="use" className="text-2xl font-bold text-theme-primary mb-6">
            Acceptable use
          </Heading>
          <p className="text-sm text-theme-secondary leading-relaxed mb-4">
            You may use the Site and the live demo for any lawful purpose. You may not:
          </p>
          <ul className="space-y-2 text-sm text-theme-secondary list-disc list-inside">
            <li>attempt to extract, scrape, or rate-abuse the demo or its underlying LLM endpoints;</li>
            <li>submit content that is unlawful, harassing, defamatory, or that infringes third-party rights;</li>
            <li>attempt to circumvent technical access controls, identify other demo users, or impersonate others;</li>
            <li>use the demo to process personal data of third parties for whom you do not have a lawful basis;</li>
            <li>misuse the newsletter signup (e.g. submitting fictitious or third-party emails without consent).</li>
          </ul>
          <p className="mt-4 text-sm text-theme-secondary leading-relaxed">
            We may rate-limit, temporarily block, or permanently ban access (without
            refund obligations, since the Site is free of charge) where reasonably necessary
            to enforce these rules or to protect the Service.
          </p>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <Heading id="demo" className="text-2xl font-bold text-theme-primary mb-6">
            Live demo
          </Heading>
          <p className="text-sm text-theme-secondary leading-relaxed">
            The live demo is provided <strong>free of charge, &ldquo;as is&rdquo;, and
            without any warranty of fitness for a particular purpose</strong>. The demo
            is for evaluation only; do not enter sensitive personal data, regulated
            data, or any information you would not want stored for up to 30 days in
            our demo logs. Demo conversations may be processed by third-party LLM
            providers (see <a href="/privacy" className="text-accent hover:underline">Privacy Policy</a>{' '}
            for the current processor list). We may take the demo offline at any time
            for maintenance, security, or end-of-life of the demo.
          </p>
        </div>
      </Section>

      <Section className="bg-surface-1/40">
        <div className="mx-auto max-w-3xl">
          <Heading id="newsletter" className="text-2xl font-bold text-theme-primary mb-6">
            Newsletter
          </Heading>
          <p className="text-sm text-theme-secondary leading-relaxed">
            By subscribing via the form on <a href="/launch" className="text-accent hover:underline">/launch</a>{' '}
            you consent to receive occasional Statewave project updates by email. You can
            withdraw consent at any time via the one-click unsubscribe link in every email.
            Details of the data we collect, how long we keep it, and our processor stack are
            in the{' '}
            <a href="/privacy" className="text-accent hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <Heading id="ip" className="text-2xl font-bold text-theme-primary mb-6">
            Intellectual property
          </Heading>
          <p className="text-sm text-theme-secondary leading-relaxed">
            The Statewave open-source software, SDKs, benchmark suite, and project
            documentation are licensed under the Apache License 2.0. Source code is on{' '}
            <a
              href="https://github.com/smaramwbc/statewave"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              GitHub
            </a>
            . Marketing copy on this Site, the Statewave wordmark, and the visual
            identity remain copyright of the Operator and are subject to the trademark
            policy at{' '}
            <a
              href="https://github.com/smaramwbc/statewave/blob/main/TRADEMARKS.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              TRADEMARKS.md
            </a>
            . Short version: you may reference &ldquo;Statewave&rdquo; in articles, reviews,
            and integration notes; you may not rebrand forks of the code as Statewave.
          </p>
        </div>
      </Section>

      <Section className="bg-surface-1/40">
        <div className="mx-auto max-w-3xl">
          <Heading id="warranty" className="text-2xl font-bold text-theme-primary mb-6">
            Warranty disclaimer
          </Heading>
          <p className="text-sm text-theme-secondary leading-relaxed">
            The Site, the demo, and the newsletter are provided <strong>&ldquo;as is&rdquo;</strong>{' '}
            and <strong>&ldquo;as available&rdquo;</strong>, without warranty of any kind,
            express or implied, including but not limited to warranties of
            merchantability, fitness for a particular purpose, non-infringement, or
            uninterrupted availability. To the maximum extent permitted by applicable
            law, the Operator disclaims all such warranties.
          </p>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <Heading id="liability" className="text-2xl font-bold text-theme-primary mb-6">
            Limitation of liability
          </Heading>
          <p className="text-sm text-theme-secondary leading-relaxed">
            To the maximum extent permitted by applicable law, in no event will the
            Operator be liable for any indirect, incidental, special, consequential, or
            punitive damages, or any loss of profits or revenue, arising out of or in
            connection with your use of the Site, demo, or newsletter &mdash; whether
            based on warranty, contract, tort, or any other legal theory. Nothing in
            these terms excludes or limits liability for fraud, gross negligence, or
            wilful misconduct, or any liability that cannot be excluded under
            applicable law.
          </p>
        </div>
      </Section>

      <Section className="bg-surface-1/40">
        <div className="mx-auto max-w-3xl">
          <Heading id="law" className="text-2xl font-bold text-theme-primary mb-6">
            Governing law and jurisdiction
          </Heading>
          <p className="text-sm text-theme-secondary leading-relaxed">
            These terms are governed by the laws of Spain, without regard to its
            conflict-of-laws provisions. Disputes will be resolved exclusively before
            the competent courts of Madrid, Spain &mdash; subject to any mandatory
            consumer-protection rules of your country of habitual residence that grant
            you stronger protection.
          </p>
          <p className="mt-3 text-sm text-theme-muted leading-relaxed">
            EU online dispute resolution platform:{' '}
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              ec.europa.eu/consumers/odr
            </a>
            . We are not obliged or willing to participate in a consumer arbitration
            board procedure.
          </p>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <Heading id="changes" className="text-2xl font-bold text-theme-primary mb-6">
            Changes to these terms
          </Heading>
          <p className="text-sm text-theme-secondary leading-relaxed">
            We may update these terms from time to time. Material changes will be
            reflected in the &ldquo;Last updated&rdquo; date at the top of this page.
            Continued use of the Site after the change constitutes acceptance of the
            updated terms.
          </p>
        </div>
      </Section>
    </>
  )
}
