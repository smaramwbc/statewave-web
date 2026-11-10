import { useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'
import { Eyebrow, H2, Ln } from '../home/ui'
import { useCopy } from '../home/hooks'
import { PAGE_FAQS } from '../../lib/page-faqs'
import type { RouteKey } from '../../lib/seo-meta'
import { useChatWidget, useTrackDemoCta } from '../../lib/widget-context-api'

/* The pieces every use case page shares: the hero's beams, breadcrumb and tool tiles, a tabbed code
 * panel, the FAQ and the closing band. Styles live in use-case.css under .uc, so a page only has to
 * put `uc` on its root (inside .sw-home) and compose its own sections around these. */

const BEAMS = [[18, 24, 0.22], [34, 24, 0.12], [70, -22, 0.16], [86, -22, 0.1]]

export function Beams() {
  return (
    <div className="sw-hero__beams" aria-hidden="true">
      {BEAMS.map(([l, r, o]) => (
        <i key={l} style={{ left: `${l}%`, transform: `rotate(${r}deg)`, ['--o' as string]: o }} />
      ))}
    </div>
  )
}

export function Crumbs({ current }: { current: string }) {
  return (
    <nav className="uc-crumbs" aria-label="Breadcrumb">
      <Ln to="/use-cases">Use cases</Ln><span aria-hidden="true">/</span>
      <span aria-current="page">{current}</span>
    </nav>
  )
}

/** The hero's identity graphic: the products this use case plugs into, as small tiles. */
export function Tools({ label, tools }: { label: string; tools: { name: string; src: string }[] }) {
  return (
    <ul className="uc-tools" aria-label={label}>
      {tools.map(t => (
        <li key={t.name}>
          <span className="uc-tools__box"><img src={t.src} alt="" width={26} height={26} /></span>
          <span className="uc-tools__name">{t.name}</span>
        </li>
      ))}
    </ul>
  )
}

/** Opens the chat widget, on one demo persona when given. While it's on screen the floating launcher
 *  hides, so there's only ever one way into the demo in view. */
export function DemoButton({ persona, label, className, children }: {
  persona?: string; label?: string; className: string; children: ReactNode
}) {
  const ref = useRef<HTMLButtonElement>(null)
  useTrackDemoCta(ref)
  const { openWidget } = useChatWidget()
  return (
    <button ref={ref} type="button" className={className} onClick={() => (persona ? openWidget(persona, label) : openWidget())}>
      {children}
    </button>
  )
}

export interface CodeTab {
  label: string
  file: string
  code: string
  output?: string
  outputLabel?: string
}

/** A dark code panel with one tab per snippet and a copy button for the visible one. */
export function CodeTabs({ label, tabs }: { label: string; tabs: CodeTab[] }) {
  const id = useId()
  const [i, setI] = useState(0)
  const t = tabs[i]
  const [done, copy] = useCopy(t.code)
  return (
    <div className="uc-code">
      <div className="uc-code__bar">
        <div className="uc-code__tabs" role="tablist" aria-label={label}>
          {tabs.map((x, k) => (
            <button
              key={x.label}
              type="button"
              role="tab"
              id={`${id}-tab-${k}`}
              aria-selected={k === i}
              aria-controls={`${id}-panel`}
              onClick={() => setI(k)}
            >
              {x.label}
            </button>
          ))}
        </div>
        <button type="button" className="uc-code__copy" onClick={copy}>
          {done ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
          {done ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${i}`} className="uc-code__panel" key={t.label}>
        <p className="uc-code__file sw-mono">{t.file}</p>
        <pre className="uc-code__body"><code>{t.code}</code></pre>
        {t.output && (
          <div className="uc-code__out">
            <p>{t.outputLabel ?? 'Output'}</p>
            <pre><code>{t.output}</code></pre>
          </div>
        )}
      </div>
    </div>
  )
}

/** The page's FAQ, from the same PAGE_FAQS entries usePageSEO emits as FAQPage JSON-LD, so the
 *  visible questions and the structured data can't drift. */
export function UseCaseFaq({ route, title }: { route: RouteKey; title: string }) {
  const faq = PAGE_FAQS[route] ?? []
  if (faq.length === 0) return null
  return (
    <section className="uc-section uc-section--tint" aria-label="Frequently asked questions">
      <div className="uc-wrap">
        <div className="uc-head uc-head--center">
          <Eyebrow>FAQ</Eyebrow>
          <H2 a={title} />
        </div>
        <div className="sw-faq">
          {faq.map((e, i) => (
            <details key={e.question} {...(i === 0 ? { open: true } : {})}>
              <summary><span aria-hidden="true" className="sw-plus">+</span><h3>{e.question}</h3></summary>
              <div>
                <p>{e.answer}</p>
                {e.links && e.links.length > 0 && (
                  <ul>{e.links.map(l => <li key={l.href}><Ln to={l.href}>{l.label}</Ln></li>)}</ul>
                )}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

/** The navy closing band: the mark, a two-line title, then whatever buttons and links the page adds. */
export function UseCaseClose({ title, grad, children }: { title: string; grad: string; children: ReactNode }) {
  return (
    <section className="uc-close" aria-label="Get started" data-nav-tone="dark">
      <div className="uc-wrap uc-close__in">
        <span className="uc-close__logo"><img src="/brand/icon.svg" alt="" width={36} height={36} /></span>
        <h2 className="uc-close__title">{title}<br /><span className="sw-hero__grad">{grad}</span></h2>
        {children}
      </div>
    </section>
  )
}
