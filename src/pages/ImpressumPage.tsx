import { Copy, Check } from 'lucide-react'
import { A, CopyBtn, LegalPage, Mail } from '../components/legal/LegalPage'
import { OFFICE } from '../components/legal/office'
import type { LegalSection } from '../components/legal/LegalPage'
import { useCopy } from '../components/home/hooks'

// Plain-text copies of the operator details — defined as constants so the
// rendered prose and the copied-to-clipboard string stay in sync, and so
// the copied string is journalist-friendly plain text (no React entities,
// no <br />, no HTML).
const OPERATOR_LEGAL_NAME = 'WebConnect World SL'
const OPERATOR_ADDRESS =
  'Carretera San Jeronimo 15 / Piso 2, 28014 Madrid, Spain'
const OPERATOR_EMAIL = OFFICE
const OPERATOR_CIF = 'B88379102'
const OPERATOR_VAT = 'ESB88379102'
const OPERATOR_CEO = 'Saber Maram'
const PRESS_EMAIL = 'press@statewave.ai'
const SECURITY_EMAIL = 'security@statewave.ai'
const LICENSING_EMAIL = 'licensing@statewave.ai'
const TRADEMARKS = 'https://github.com/smaramwbc/statewave/blob/main/TRADEMARKS.md'

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

const CONTACTS = [
  ['General enquiries', OPERATOR_EMAIL],
  ['Press', PRESS_EMAIL],
  ['Security disclosure', SECURITY_EMAIL],
  ['Commercial / licensing', LICENSING_EMAIL],
] as const

function CopyAll() {
  const [done, copy] = useCopy(OPERATOR_FULL_BLOCK)
  return (
    <button type="button" className="lg-op__all" onClick={copy}>
      {done ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
      {done ? 'Copied' : 'Copy full operator block'}
    </button>
  )
}

const SECTIONS: LegalSection[] = [
  {
    id: 'operator',
    title: 'Who operates statewave.ai?',
    toc: 'Operator',
    body: (
      <>
        <p>
          statewave.ai is operated by {OPERATOR_LEGAL_NAME}, a company registered in Madrid,
          Spain, represented by its CEO, {OPERATOR_CEO}.
        </p>
        <div className="lg-op">
          <dl>
            <dt>Legal entity</dt>
            <dd><span>{OPERATOR_LEGAL_NAME}</span><CopyBtn text={OPERATOR_LEGAL_NAME} label="Copy legal entity name" /></dd>
            <dt>Address</dt>
            <dd>
              <span>Carretera San Jeronimo 15 / Piso 2<br />28014 Madrid<br />Spain</span>
              <CopyBtn text={OPERATOR_ADDRESS} label="Copy operator postal address" />
            </dd>
            <dt>Email</dt>
            <dd><span><A to={`mailto:${OPERATOR_EMAIL}`}>{OPERATOR_EMAIL}</A></span><CopyBtn text={OPERATOR_EMAIL} label="Copy operator email address" /></dd>
            <dt>Represented by</dt>
            <dd><span>{OPERATOR_CEO} (CEO)</span><CopyBtn text={OPERATOR_CEO} label="Copy CEO name" /></dd>
            <dt>CIF (Spanish tax ID)</dt>
            <dd><span className="sw-mono">{OPERATOR_CIF}</span><CopyBtn text={OPERATOR_CIF} label="Copy CIF" /></dd>
            <dt>VAT-ID (USt-IdNr.)</dt>
            <dd><span className="sw-mono">{OPERATOR_VAT}</span><CopyBtn text={OPERATOR_VAT} label="Copy VAT-ID" /></dd>
          </dl>
          <CopyAll />
        </div>
      </>
    ),
  },
  {
    id: 'responsible',
    title: 'Who is responsible for the content?',
    toc: 'Responsible for content',
    body: (
      <p>
        Responsible for the content of this site within the meaning of § 55(2) RStV:
        Saber Maram, c/o WebConnect World SL at the address above.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <ul className="lg-defs">
        {CONTACTS.map(([label, email]) => (
          <li key={email}><strong>{label}</strong><Mail to={email} /></li>
        ))}
      </ul>
    ),
  },
  {
    id: 'eu-dispute',
    title: 'EU online dispute resolution',
    toc: 'Online dispute resolution',
    body: (
      <>
        <p>
          The European Commission provides a platform for online dispute resolution
          (ODR), accessible at <A to="https://ec.europa.eu/consumers/odr">ec.europa.eu/consumers/odr</A>.
        </p>
        <p>
          We are neither obliged nor willing to participate in a dispute settlement
          procedure before a consumer arbitration board (Verbraucherschlichtungsstelle).
        </p>
      </>
    ),
  },
  {
    id: 'liability',
    title: 'Liability for content and links',
    toc: 'Liability',
    body: (
      <p>
        The content of this site is provided with all reasonable care, but no
        guarantee of completeness, accuracy or timeliness is given. Liability for
        content is limited per §§ 7–10 TMG. External links are provided for
        convenience; the operator has no influence on linked third-party content
        and assumes no liability for it. If we become aware of legal violations on a
        linked page we will remove the link without delay.
      </p>
    ),
  },
  {
    id: 'copyright',
    title: 'Copyright',
    body: (
      <p>
        Content created by the operator is, unless otherwise marked, available under
        the Apache License 2.0 (for the open-source software and documentation it
        hosts) or remains the copyright of the operator (for marketing copy and
        visual identity). The Statewave wordmark and logo are subject to the
        trademark policy at <A to={TRADEMARKS}>TRADEMARKS.md</A>.
      </p>
    ),
  },
]

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
  return (
    <LegalPage
      path="/impressum"
      title="Impressum / Legal Disclosure"
      sub="Information pursuant to § 5 TMG (DE) and the Spanish LSSI-CE for the operator of statewave.ai."
      sections={SECTIONS}
    />
  )
}
