import { Section } from '../components/Section'
import { Heading } from '../components/Heading'
import { CopyButton } from '../components/CopyButton'
import { usePageSEO } from '../lib/seo'

// Plain-text copies of the operator details — defined as constants so the
// rendered prose and the copied-to-clipboard string stay in sync, and so
// the copied string is journalist-friendly plain text (no React entities,
// no <br />, no HTML).
const OPERATOR_LEGAL_NAME = 'WebConnect World SL'
const OPERATOR_ADDRESS =
  'Carretera San Jeronimo 15 / Piso 2, 28014 Madrid, Spain'
const OPERATOR_EMAIL = 'office@webconnect.pro'
const OPERATOR_CIF = 'B88379102'
const OPERATOR_VAT = 'ESB88379102'
const OPERATOR_CEO = 'Saber Maram'
const PRESS_EMAIL = 'press@statewave.ai'
const SECURITY_EMAIL = 'security@statewave.ai'
const LICENSING_EMAIL = 'licensing@statewave.ai'

const OPERATOR_FULL_BLOCK = [
  OPERATOR_LEGAL_NAME,
  'Carretera San Jeronimo 15 / Piso 2',
  '28014 Madrid',
  'Spain',
  '',
  `Email: ${OPERATOR_EMAIL}`,
  `Represented by: ${OPERATOR_CEO} (CEO)`,
  `CIF: ${OPERATOR_CIF}`,
  `VAT-ID: ${OPERATOR_VAT}`,
].join('\n')

/**
 * /impressum — legal disclosure for the operator of statewave.ai.
 * Required by §5 TMG (DE) when serving German users; the equivalent
 * "Aviso Legal" obligation applies under Spanish LSSI-CE for the
 * registered SL.
 *
 * Operator data sourced from webconnect.pro/impressum (the parent
 * company's authoritative disclosure). Update both surfaces in lock-step
 * if any of these change.
 */
export function ImpressumPage() {
  usePageSEO({
    title: 'Statewave — Impressum / Legal Disclosure',
    description:
      'Operator and legal-disclosure information for statewave.ai per § 5 TMG and Spanish LSSI-CE.',
    robots: 'noindex, follow',
    breadcrumb: false,
  })

  return (
    <>
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-8 sm:pb-12">
        <div className="mx-auto max-w-3xl px-5 sm:px-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">Legal</p>
          <h1 className="mt-5 text-[clamp(1.75rem,5vw,2.5rem)] font-semibold text-theme-primary tracking-[-0.02em] leading-[1.15]">
            Impressum / Legal Disclosure
          </h1>
          <p className="mt-5 text-sm text-theme-muted">
            Information pursuant to § 5 TMG (DE) and the Spanish LSSI-CE for the operator of{' '}
            <a href="https://statewave.ai" className="text-accent hover:underline">statewave.ai</a>.
          </p>
        </div>
      </section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <Heading id="operator" className="text-2xl font-bold text-theme-primary mb-6">
            Operator
          </Heading>
          <div className="relative rounded-2xl border border-theme-border bg-surface-1 p-5 sm:p-6 pr-20 sm:pr-24">
            <div className="absolute top-3 right-3">
              <CopyButton
                text={OPERATOR_FULL_BLOCK}
                label="Copy full operator block"
                variant="card-corner"
              />
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-[10rem,1fr] gap-y-3 sm:gap-x-6 text-sm">
              <dt className="text-theme-muted">Legal entity</dt>
              <dd className="text-theme-primary inline-flex items-baseline gap-1">
                <span>{OPERATOR_LEGAL_NAME}</span>
                <CopyButton text={OPERATOR_LEGAL_NAME} label="Copy legal entity name" />
              </dd>

              <dt className="text-theme-muted">Address</dt>
              <dd className="text-theme-primary">
                <span className="inline-flex items-baseline gap-1">
                  <span>
                    Carretera San Jeronimo 15 / Piso 2<br />
                    28014 Madrid<br />
                    Spain
                  </span>
                  <CopyButton
                    text={OPERATOR_ADDRESS}
                    label="Copy operator postal address"
                  />
                </span>
              </dd>

              <dt className="text-theme-muted">Email</dt>
              <dd className="text-theme-primary inline-flex items-baseline gap-1">
                <a href={`mailto:${OPERATOR_EMAIL}`} className="text-accent hover:underline">
                  {OPERATOR_EMAIL}
                </a>
                <CopyButton text={OPERATOR_EMAIL} label="Copy operator email address" />
              </dd>

              <dt className="text-theme-muted">Represented by</dt>
              <dd className="text-theme-primary inline-flex items-baseline gap-1">
                <span>{OPERATOR_CEO} (CEO)</span>
                <CopyButton text={OPERATOR_CEO} label="Copy CEO name" />
              </dd>

              <dt className="text-theme-muted">CIF (Spanish tax ID)</dt>
              <dd className="text-theme-primary font-mono inline-flex items-baseline gap-1">
                <span>{OPERATOR_CIF}</span>
                <CopyButton text={OPERATOR_CIF} label="Copy CIF" />
              </dd>

              <dt className="text-theme-muted">VAT-ID (USt-IdNr.)</dt>
              <dd className="text-theme-primary font-mono inline-flex items-baseline gap-1">
                <span>{OPERATOR_VAT}</span>
                <CopyButton text={OPERATOR_VAT} label="Copy VAT-ID" />
              </dd>
            </dl>
          </div>
        </div>
      </Section>

      <Section className="bg-surface-1/40">
        <div className="mx-auto max-w-3xl">
          <Heading id="responsible" className="text-2xl font-bold text-theme-primary mb-6">
            Responsible for content
          </Heading>
          <p className="text-sm text-theme-secondary leading-relaxed">
            Responsible for the content of this site within the meaning of § 55(2) RStV:
            Saber Maram, c/o WebConnect World SL at the address above.
          </p>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <Heading id="contact" className="text-2xl font-bold text-theme-primary mb-6">
            Contact
          </Heading>
          <ul className="space-y-2 text-sm text-theme-secondary">
            <li className="inline-flex items-baseline gap-1">
              <span>General enquiries:{' '}
                <a href={`mailto:${OPERATOR_EMAIL}`} className="text-accent hover:underline">
                  {OPERATOR_EMAIL}
                </a>
              </span>
              <CopyButton text={OPERATOR_EMAIL} label="Copy general enquiries email" />
            </li>
            <li className="inline-flex items-baseline gap-1">
              <span>Press:{' '}
                <a href={`mailto:${PRESS_EMAIL}`} className="text-accent hover:underline">
                  {PRESS_EMAIL}
                </a>
              </span>
              <CopyButton text={PRESS_EMAIL} label="Copy press email" />
            </li>
            <li className="inline-flex items-baseline gap-1">
              <span>Security disclosure:{' '}
                <a href={`mailto:${SECURITY_EMAIL}`} className="text-accent hover:underline">
                  {SECURITY_EMAIL}
                </a>
              </span>
              <CopyButton text={SECURITY_EMAIL} label="Copy security email" />
            </li>
            <li className="inline-flex items-baseline gap-1">
              <span>Commercial / licensing:{' '}
                <a href={`mailto:${LICENSING_EMAIL}`} className="text-accent hover:underline">
                  {LICENSING_EMAIL}
                </a>
              </span>
              <CopyButton text={LICENSING_EMAIL} label="Copy licensing email" />
            </li>
          </ul>
        </div>
      </Section>

      <Section className="bg-surface-1/40">
        <div className="mx-auto max-w-3xl">
          <Heading id="eu-dispute" className="text-2xl font-bold text-theme-primary mb-6">
            EU online dispute resolution
          </Heading>
          <p className="text-sm text-theme-secondary leading-relaxed">
            The European Commission provides a platform for online dispute resolution
            (ODR), accessible at{' '}
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              ec.europa.eu/consumers/odr
            </a>
            .
          </p>
          <p className="mt-3 text-sm text-theme-secondary leading-relaxed">
            We are neither obliged nor willing to participate in a dispute settlement
            procedure before a consumer arbitration board (Verbraucherschlichtungsstelle).
          </p>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <Heading id="liability" className="text-2xl font-bold text-theme-primary mb-6">
            Liability for content and links
          </Heading>
          <p className="text-sm text-theme-secondary leading-relaxed">
            The content of this site is provided with all reasonable care, but no
            guarantee of completeness, accuracy or timeliness is given. Liability for
            content is limited per §§ 7–10 TMG. External links are provided for
            convenience; the operator has no influence on linked third-party content
            and assumes no liability for it. If we become aware of legal violations on a
            linked page we will remove the link without delay.
          </p>
        </div>
      </Section>

      <Section className="bg-surface-1/40">
        <div className="mx-auto max-w-3xl">
          <Heading id="copyright" className="text-2xl font-bold text-theme-primary mb-6">
            Copyright
          </Heading>
          <p className="text-sm text-theme-secondary leading-relaxed">
            Content created by the operator is, unless otherwise marked, available under
            the Apache License 2.0 (for the open-source software and documentation it
            hosts) or remains the copyright of the operator (for marketing copy and
            visual identity). The Statewave wordmark and logo are subject to the
            trademark policy at{' '}
            <a
              href="https://github.com/smaramwbc/statewave/blob/main/TRADEMARKS.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              TRADEMARKS.md
            </a>
            .
          </p>
        </div>
      </Section>
    </>
  )
}
