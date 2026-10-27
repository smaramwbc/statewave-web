import { useEffect, useRef } from 'react'
import { usePageSEO } from '../lib/seo'
import { Hero } from '../components/product/Hero'
import { HowItWorks } from '../components/product/HowItWorks'
import { DomainModel } from '../components/product/DomainModel'
import { Privacy } from '../components/product/Privacy'
import { Support } from '../components/product/Support'
import { ProductCta, ProductFaq, RunIt } from '../components/product/Closing'
import '../components/product/product.css'

export function ProductPage() {
  // Product and FAQPage JSON-LD come from routeJsonLd('/product') in lib/page-schema.ts,
  // which the prerenderer shares; passing them here too would duplicate them.
  usePageSEO({})

  // Same reveal arming as the homepage: server HTML stays visible until hydration.
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => { root.current?.setAttribute('data-armed', '') }, [])

  return (
    <div ref={root} className="sw-home sw-pd">
      <Hero />
      <HowItWorks />
      <DomainModel />
      <Privacy />
      <Support />
      <RunIt />
      <ProductFaq />
      <ProductCta />
    </div>
  )
}
