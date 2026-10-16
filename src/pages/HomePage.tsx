import { useEffect, useRef } from 'react'
import { usePageSEO } from '../lib/seo'
import { Hero } from '../components/home/Hero'
import { Problem } from '../components/home/Problem'
import { HowItWorks } from '../components/home/HowItWorks'
import { Governance } from '../components/home/Governance'
import { UseCases } from '../components/home/UseCases'
import { Integrations } from '../components/home/Integrations'
import { SelfHosted } from '../components/home/SelfHosted'
import { Benchmarks } from '../components/home/Benchmarks'
import { ClosingCta } from '../components/home/ClosingCta'
import { HomeFaq } from '../components/home/HomeFaq'
import { Divider } from '../components/home/ui'

export function HomePage() {
  // The SoftwareApplication, Product and FAQPage nodes are emitted by routeJsonLd('/') in
  // lib/page-schema.ts, which the prerenderer shares; passing them here too duplicated them.
  usePageSEO({ breadcrumb: false })

  // Scroll-reveal headings stay visible in the server HTML; they only hide
  // once the page has hydrated and can reveal them again.
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => { root.current?.setAttribute('data-armed', '') }, [])

  // Every section is server-rendered into dist/index.html (answer engines like
  // GPTBot and ClaudeBot don't run JS), so nothing below is wrapped in ClientOnly.
  return (
    <div ref={root} className="sw-home">
      <Hero />
      <Divider />
      <Problem />
      <Divider />
      <HowItWorks />
      <Divider />
      <Governance />
      <Divider />
      <UseCases />
      <Divider />
      <Integrations />
      <Divider />
      <SelfHosted />
      <Divider />
      <Benchmarks />
      <ClosingCta />
      <HomeFaq />
    </div>
  )
}
