import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { useLocation } from 'react-router'
import { ArrowRight, ChartColumn, CodeXml, LayoutGrid, Newspaper, Scale, Workflow } from 'lucide-react'
import { Divider, Eyebrow, H2, Ln } from '../components/home/ui'
import { useSeen } from '../components/home/hooks'
import { usePageSEO } from '../lib/seo'
import '../components/home/home-b.css'
import '../components/not-found/not-found.css'

/* The 404 page in the v8 style: an interior hero (straight edge and the home's cross divider, not the
 * arc) that names the missing path, then the pages most visitors are after. */

const BEAMS = [[18, 24, 0.22], [34, 24, 0.12], [70, -22, 0.16], [86, -22, 0.1]]

const PAGES = [
  { to: '/product', Icon: Workflow, name: 'How it works', text: 'Episodes in, typed memories out, and the ranked context bundle your agent reads.' },
  { to: '/use-cases', Icon: LayoutGrid, name: 'Use cases', text: 'Support agents, coding copilots, multi-agent systems and assistants with durable memory.' },
  { to: '/benchmarks', Icon: ChartColumn, name: 'Benchmarks', text: 'LoCoMo and LongMemEval against mem0, run on mem0’s own harness.' },
  { to: '/developers', Icon: CodeXml, name: 'Developers', text: 'Python and TypeScript SDKs, the REST API and Docker Compose deployment.' },
  { to: '/vs', Icon: Scale, name: 'Comparisons', text: 'Statewave next to Mem0, Letta, Zep and Supermemory.' },
  { to: '/blog', Icon: Newspaper, name: 'Blog', text: 'How agent memory works under the hood, and the design choices behind Statewave.' },
]

function Popular() {
  const [ref, seen] = useSeen<HTMLUListElement>()
  return (
    <section className="nf-section" aria-labelledby="nf-popular">
      <div className="nf-wrap">
        <div className="nf-head">
          <Eyebrow>Popular pages</Eyebrow>
          <H2 id="nf-popular" a="Try one of these instead." />
        </div>
        <ul ref={ref} className="nf-pages" {...(seen ? { 'data-seen': '' } : {})}>
          {PAGES.map(({ to, Icon, name, text }, i) => (
            <li key={to} style={{ '--i': i } as CSSProperties}>
              <Ln to={to} className="nf-page">
                <span className="nf-page__icon"><Icon size={20} aria-hidden="true" /></span>
                <span className="nf-page__body">
                  <span className="nf-page__name">{name}</span>
                  <span className="nf-page__text">{text}</span>
                </span>
                <ArrowRight className="nf-page__go" size={18} aria-hidden="true" />
              </Ln>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function NotFoundPage() {
  usePageSEO({
    title: '404 — Page Not Found — Statewave',
    description:
      'The page you’re looking for doesn’t exist or has been moved. Head back to the Statewave home page or browse the developer resources.',
    robots: 'noindex, follow',
    breadcrumb: false,
  })
  const { pathname } = useLocation()
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => { root.current?.setAttribute('data-armed', '') }, [])

  return (
    <div ref={root} className="sw-home nf">
      <section className="sw-hero nf-hero" aria-labelledby="nf-title">
        <div className="sw-hero__beams" aria-hidden="true">
          {BEAMS.map(([l, r, o]) => (
            <i key={l} style={{ left: `${l}%`, transform: `rotate(${r}deg)`, ['--o' as string]: o }} />
          ))}
        </div>
        <div className="sw-hero__in">
          <p className="nf-code">404</p>
          <h1 id="nf-title" className="sw-hero__title">Page not found</h1>
          <p className="sw-hero__sub">
            Nothing lives at <code className="nf-path">{pathname}</code>. It may have moved, or the
            link may have a typo.
          </p>
          <div className="nf-cta">
            <Ln to="/" className="sw-btn sw-btn--solid">
              Back to home <ArrowRight size={18} aria-hidden="true" />
            </Ln>
            <Ln to="/faq" className="sw-btn sw-btn--ghost">Browse the FAQ</Ln>
          </div>
        </div>
      </section>
      <Divider />
      <Popular />
    </div>
  )
}
