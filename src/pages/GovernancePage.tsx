import { useEffect, useRef } from 'react'
import { usePageSEO } from '../lib/seo'
import { Hero } from '../components/governance/Hero'
import { Checks } from '../components/governance/Checks'
import { Labels, PolicySection, Rollout } from '../components/governance/Policy'
import { Identity, Receipts, Scope } from '../components/governance/Trust'
import { GOV_DOCS } from '../components/governance/links'
import { ProductCta, ProductFaq } from '../components/product/Closing'
import '../components/product/product.css'
import '../components/governance/governance.css'

const ROLLOUT = [
  ['Bundle', 'sha256:a1b2c3… · active'],
  ['Receipts', 'filters_applied reviewed'],
  ['Mode', 'log_only, then enforce'],
  ['policy_mode', 'enforce'],
] as const

const ROLLOUT_CARD = (
  <div className="pd-card pd-receipt">
    <div className="pd-row"><b>Policy rollout</b><code className="pd-muted pd-grow">tenant_01</code><span className="gv-pill gv-pill--inv">Enforced</span></div>
    <dl>{ROLLOUT.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
  </div>
)

export function GovernancePage() {
  // FAQPage and breadcrumb JSON-LD come from routeJsonLd in lib/page-schema.ts, shared with the prerenderer.
  usePageSEO({})

  const root = useRef<HTMLDivElement>(null)
  useEffect(() => { root.current?.setAttribute('data-armed', '') }, [])

  return (
    <div ref={root} className="sw-home sw-pd sw-gv">
      <Hero />
      <Checks />
      <Labels />
      <PolicySection />
      <Rollout />
      <Receipts />
      <Identity />
      <Scope />
      <ProductFaq route="/governance" />
      <ProductCta
        title="Audit first, enforce when ready"
        text="Start in log_only, read the receipts, then switch policy_mode to enforce. Storage and retrieval stay in your own Postgres."
        docs={{ to: GOV_DOCS, label: 'Read the governance docs' }}
        card={ROLLOUT_CARD}
      />
    </div>
  )
}
