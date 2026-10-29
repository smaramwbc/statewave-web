import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { ArrowUpRight, Check, Copy } from 'lucide-react'
import { Divider, Eyebrow, Ln } from '../home/ui'
import { useCopy, useSeen } from '../home/hooks'
import { usePageSEO } from '../../lib/seo'
import { OFFICE } from './office'
import '../home/home-b.css'
import './legal.css'

/* The four legal pages (/privacy, /terms, /cookies, /impressum) in the v8 style. One template, so
 * they read as one set: the hero ends on a straight edge and the home's cross divider (the arc is
 * the home's alone), the text sits in one reading column beside a sticky "On this page" list, and a
 * tint band at the foot links the other three. The legal text itself lives in each page. */

export type LegalSection = {
  id: string
  title: string
  /** Shorter label for the "On this page" list. Defaults to the title. */
  toc?: string
  body: ReactNode
}

const PAGES = [
  { to: '/privacy', name: 'Privacy Policy', blurb: 'What personal data we collect, why, who processes it and your rights under the GDPR.' },
  { to: '/terms', name: 'Terms of Service', blurb: 'The rules for using the site, the live demo and the newsletter.' },
  { to: '/cookies', name: 'Cookie Policy', blurb: 'The one cookie we set, the browser storage we use and what we never do.' },
  { to: '/impressum', name: 'Impressum', blurb: 'The operator, its registered address, tax IDs and contact addresses.' },
] as const

const BEAMS = [[18, 24, 0.22], [34, 24, 0.12], [70, -22, 0.16], [86, -22, 0.1]]

/** A link inside the legal text: the router for site paths, the mail app for an address, a new tab
 *  for everything else. */
export function A({ to, children }: { to: string; children: ReactNode }) {
  if (to.startsWith('mailto:')) return <a href={to} className="lg-a">{children}</a>
  return <Ln to={to} className="lg-a">{children}</Ln>
}

function CopyIcon({ done }: { done: boolean }) {
  return done ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />
}

/** A copy-to-clipboard button for one value, for when no mail app is set up or the value goes into a form. */
export function CopyBtn({ text, label }: { text: string; label: string }) {
  const [done, copy] = useCopy(text)
  return (
    <button type="button" className="lg-copy" onClick={copy} aria-label={done ? 'Copied' : label} title={label}>
      <CopyIcon done={done} />
    </button>
  )
}

/** An address as a mailto link plus its copy button. */
export function Mail({ to }: { to: string }) {
  return (
    <span className="lg-mail">
      <a href={`mailto:${to}`} className="lg-a">{to}</a>
      <CopyBtn text={to} label={`Copy ${to}`} />
    </span>
  )
}

function Hero({ title, sub, updated }: { title: string; sub: string; updated?: { iso: string; label: string } }) {
  return (
    <section className="sw-hero lg-hero" aria-label={title}>
      <div className="sw-hero__beams" aria-hidden="true">
        {BEAMS.map(([l, r, o]) => (
          <i key={l} style={{ left: `${l}%`, transform: `rotate(${r}deg)`, ['--o' as string]: o }} />
        ))}
      </div>
      <div className="sw-hero__in">
        <Eyebrow dark>Legal</Eyebrow>
        <h1 className="sw-hero__title">{title}</h1>
        <p className="sw-hero__sub">{sub}</p>
        {updated && (
          <p className="lg-hero__date">Last updated <time dateTime={updated.iso}>{updated.label}</time></p>
        )}
      </div>
    </section>
  )
}

/** Marks the section being read in the "On this page" list. */
function useActive(ids: string[]) {
  const [active, setActive] = useState(ids[0])
  const key = ids.join(' ')
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const els = key.split(' ').map(id => document.getElementById(id)).filter((el): el is HTMLElement => !!el)
    // A section counts as read while it crosses the band just under the sticky header.
    const io = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
    }, { rootMargin: '-96px 0px -65% 0px' })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [key])
  return active
}

function Toc({ sections }: { sections: LegalSection[] }) {
  const active = useActive(sections.map(s => s.id))
  return (
    <nav className="lg-toc" aria-label="On this page">
      <p className="lg-toc__title">On this page</p>
      <ol>
        {sections.map(s => (
          <li key={s.id}>
            <a href={`#${s.id}`} {...(s.id === active ? { 'aria-current': 'location' as const } : {})}>{s.toc ?? s.title}</a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

function Section({ s }: { s: LegalSection }) {
  const [ref, seen] = useSeen<HTMLElement>()
  return (
    <section ref={ref} id={s.id} className="lg-sec" aria-labelledby={`${s.id}-h`} {...(seen ? { 'data-seen': '' } : {})}>
      <h2 id={`${s.id}-h`}>{s.title}</h2>
      {s.body}
    </section>
  )
}

function More({ current }: { current: string }) {
  const [ref, seen] = useSeen<HTMLUListElement>()
  return (
    <section className="lg-band" aria-labelledby="lg-more-h">
      <div className="lg-wrap">
        <div className="lg-band__head">
          <h2 id="lg-more-h" className="sw-h3">The other legal pages</h2>
          <p>Questions about any of them go to <Mail to={OFFICE} /></p>
        </div>
        <ul ref={ref} className="lg-cards" {...(seen ? { 'data-seen': '' } : {})}>
          {PAGES.filter(p => p.to !== current).map((p, i) => (
            <li key={p.to} style={{ '--i': i } as CSSProperties}>
              <Ln to={p.to} className="lg-card">
                <span className="lg-card__name">{p.name} <ArrowUpRight size={18} aria-hidden="true" /></span>
                <span className="lg-card__blurb">{p.blurb}</span>
              </Ln>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function LegalPage({
  path, title, sub, updated, lead, sections,
}: {
  path: (typeof PAGES)[number]['to']
  title: string
  sub: string
  updated?: { iso: string; label: string }
  /** Opening paragraphs, before the first section. */
  lead?: ReactNode
  sections: LegalSection[]
}) {
  // Title, description and canonical come from the route's entry in lib/seo-meta.
  usePageSEO()
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => { root.current?.setAttribute('data-armed', '') }, [])
  return (
    <div ref={root} className="sw-home lg">
      <Hero title={title} sub={sub} updated={updated} />
      <Divider />
      <div className="lg-wrap lg-body">
        <Toc sections={sections} />
        <article className="lg-doc">
          {lead && <div className="lg-lead">{lead}</div>}
          {sections.map(s => <Section key={s.id} s={s} />)}
        </article>
      </div>
      <More current={path} />
    </div>
  )
}
