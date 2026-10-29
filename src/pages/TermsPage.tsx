import { A, LegalPage } from '../components/legal/LegalPage'
import type { LegalSection } from '../components/legal/LegalPage'

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
const REPO = 'https://github.com/smaramwbc/statewave'

const SECTIONS: LegalSection[] = [
  {
    id: 'operator',
    title: 'Who operates the Site?',
    toc: 'Operator',
    body: (
      <p>
        The Site is operated by WebConnect World SL (the &ldquo;Operator&rdquo; or
        &ldquo;we&rdquo;), registered in Madrid, Spain. Full legal disclosure
        on <A to="/impressum">/impressum</A>.
      </p>
    ),
  },
  {
    id: 'use',
    title: 'Acceptable use',
    body: (
      <>
        <p>You may use the Site and the live demo for any lawful purpose. You may not:</p>
        <ul className="lg-list">
          <li>attempt to extract, scrape, or rate-abuse the demo or its underlying LLM endpoints;</li>
          <li>submit content that is unlawful, harassing, defamatory, or that infringes third-party rights;</li>
          <li>attempt to circumvent technical access controls, identify other demo users, or impersonate others;</li>
          <li>use the demo to process personal data of third parties for whom you do not have a lawful basis;</li>
          <li>misuse the newsletter signup (e.g. submitting fictitious or third-party emails without consent).</li>
        </ul>
        <p>
          We may rate-limit, temporarily block, or permanently ban access (without
          refund obligations, since the Site is free of charge) where reasonably necessary
          to enforce these rules or to protect the Service.
        </p>
      </>
    ),
  },
  {
    id: 'demo',
    title: 'Live demo',
    body: (
      <p>
        The live demo is provided <strong>free of charge, &ldquo;as is&rdquo;, and
        without any warranty of fitness for a particular purpose</strong>. The demo
        is for evaluation only; do not enter sensitive personal data, regulated
        data, or any information you would not want stored for up to 30 days in
        our demo logs. Demo conversations may be processed by third-party LLM
        providers (see <A to="/privacy">Privacy Policy</A> for the current
        processor list). We may take the demo offline at any time
        for maintenance, security, or end-of-life of the demo.
      </p>
    ),
  },
  {
    id: 'newsletter',
    title: 'Newsletter',
    body: (
      <p>
        By subscribing via the form on <A to="/launch">/launch</A> you
        consent to receive occasional Statewave project updates by email. You can
        withdraw consent at any time via the one-click unsubscribe link in every email.
        Details of the data we collect, how long we keep it, and our processor stack are
        in the <A to="/privacy">Privacy Policy</A>.
      </p>
    ),
  },
  {
    id: 'ip',
    title: 'Intellectual property',
    body: (
      <p>
        The Statewave open-source software, SDKs, benchmark suite, and project
        documentation are licensed under the Apache License 2.0. Source code is
        on <A to={REPO}>GitHub</A>. Marketing copy on this Site, the Statewave
        wordmark, and the visual identity remain copyright of the Operator and are
        subject to the trademark policy at <A to={`${REPO}/blob/main/TRADEMARKS.md`}>TRADEMARKS.md</A>.
        Short version: you may reference &ldquo;Statewave&rdquo; in articles, reviews,
        and integration notes; you may not rebrand forks of the code as Statewave.
      </p>
    ),
  },
  {
    id: 'warranty',
    title: 'Warranty disclaimer',
    body: (
      <p>
        The Site, the demo, and the newsletter are provided <strong>&ldquo;as is&rdquo;</strong>{' '}
        and <strong>&ldquo;as available&rdquo;</strong>, without warranty of any kind,
        express or implied, including but not limited to warranties of
        merchantability, fitness for a particular purpose, non-infringement, or
        uninterrupted availability. To the maximum extent permitted by applicable
        law, the Operator disclaims all such warranties.
      </p>
    ),
  },
  {
    id: 'liability',
    title: 'Limitation of liability',
    body: (
      <p>
        To the maximum extent permitted by applicable law, in no event will the
        Operator be liable for any indirect, incidental, special, consequential, or
        punitive damages, or any loss of profits or revenue, arising out of or in
        connection with your use of the Site, demo, or newsletter &mdash; whether
        based on warranty, contract, tort, or any other legal theory. Nothing in
        these terms excludes or limits liability for fraud, gross negligence, or
        wilful misconduct, or any liability that cannot be excluded under
        applicable law.
      </p>
    ),
  },
  {
    id: 'law',
    title: 'Governing law and jurisdiction',
    toc: 'Governing law',
    body: (
      <>
        <p>
          These terms are governed by the laws of Spain, without regard to its
          conflict-of-laws provisions. Disputes will be resolved exclusively before
          the competent courts of Madrid, Spain &mdash; subject to any mandatory
          consumer-protection rules of your country of habitual residence that grant
          you stronger protection.
        </p>
        <p>
          EU online dispute resolution
          platform: <A to="https://ec.europa.eu/consumers/odr">ec.europa.eu/consumers/odr</A>.
          We are not obliged or willing to participate in a consumer arbitration
          board procedure.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to these terms',
    toc: 'Changes',
    body: (
      <p>
        We may update these terms from time to time. Material changes will be
        reflected in the &ldquo;Last updated&rdquo; date at the top of this page.
        Continued use of the Site after the change constitutes acceptance of the
        updated terms.
      </p>
    ),
  },
]

export function TermsPage() {
  return (
    <LegalPage
      path="/terms"
      title="Terms of Service"
      sub="The terms for using statewave.ai, the hosted live demo and the newsletter."
      updated={{ iso: '2026-06-10', label: '10 June 2026' }}
      lead={(
        <>
          <p>
            These terms govern your use of <A to="/">statewave.ai</A> (the
            &ldquo;Site&rdquo;), the live demo at <A to="/demo">/demo</A>, and the newsletter
            at <A to="/launch">/launch</A>. By using any of these you agree to these terms.
          </p>
          <p>
            The Statewave open-source software itself is governed by
            the <A to={`${REPO}/blob/main/LICENSE`}>Apache License 2.0</A> &mdash; these terms do
            not apply to your self-hosted use of the software.
          </p>
        </>
      )}
      sections={SECTIONS}
    />
  )
}
