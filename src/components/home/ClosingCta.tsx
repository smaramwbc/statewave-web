import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { formatCompactCount, useGithubStars } from '../../lib/credibility-stats'
import { H2, Eyebrow, Icon, Ln } from './ui'
import { usePrefersReducedMotion, useCopy } from './hooks'
import { DOCS, GITHUB } from './links'
import './home-c.css'

const CMDS = [
  { tab: 'npx', cmd: 'npx @statewavedev/statewave' },
  { tab: 'curl', cmd: 'curl -fsSL https://www.statewave.ai/install | sh' },
  { tab: 'docker compose', cmd: 'docker compose up -d' },
] as const
const FIELDS = [
  ['receipt_id', '01J9ZK4T7M3QX8R2V6N0B5HCWD'],
  ['subject', 'account:northwind'],
  ['selected', '2 memories · 2 episodes'],
  ['context_hash', 'sha256:9f2c…e41a'],
  ['policy', 'snapshot · enforce'],
] as const

/** The receipt fills in line by line, then repeats every 18s while on screen
 *  (paused offscreen; static and fully signed under reduced motion). */
function useReceiptFill() {
  const rm = usePrefersReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const [onscreen, setOnscreen] = useState(false)
  const [n, setN] = useState(6)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setOnscreen(e.isIntersecting), { rootMargin: '0px 0px -25% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    if (!onscreen || rm) return
    let loop: ReturnType<typeof setTimeout>
    let steps: ReturnType<typeof setTimeout>[] = []
    const run = () => {
      setN(0)
      steps = [1, 2, 3, 4, 5, 6].map((i) => setTimeout(() => setN(i), i * 1600))
      loop = setTimeout(run, 18000)
    }
    run()
    return () => { clearTimeout(loop); steps.forEach(clearTimeout) }
  }, [onscreen, rm])
  return [ref, n] as const
}

export function ClosingCta() {
  const [ref, n] = useReceiptFill()
  const [tab, setTab] = useState(0)
  const [copied, copy] = useCopy(CMDS[tab].cmd)
  const signed = n >= 6
  const stars = formatCompactCount(useGithubStars())

  return (
    <section ref={ref} className="sw-cta-sec" aria-label="Get started">
      <div className="sw-cta">
        <div aria-hidden="true" className="sw-cta__lines">
          {[[20, 24, 0.18], [78, -22, 0.14]].map(([l, r, o]) => (
            <i key={l} style={{ left: `${l}%`, background: `linear-gradient(180deg,rgba(156,195,255,0),rgba(156,195,255,${o}) 50%,rgba(156,195,255,0))`, transform: `rotate(${r}deg)` }} />
          ))}
        </div>

        <p className="sr-only">Example receipt, signed.</p>
        <div aria-hidden="true" className="sw-cta__receipt">
          <div className="sw-cta__rh">
            <span className="sw-eyebrow">Receipt</span>
            <span className="sw-chip sw-cta__chip" data-signed={signed || undefined}>
              {!signed && <span className="sw-dot" />}{signed ? '✓ Signed' : 'Signing'}
            </span>
          </div>
          <div className="sw-mono sw-cta__fields">
            {FIELDS.map(([k, v], i) => (
              <div key={k} className="sw-cta__row">
                <span>{k}</span>
                <span className="sw-ellipsis sw-cta__val" data-on={n > i || undefined}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="sw-cta__inner">
          <Eyebrow dark>Start in one command</Eyebrow>
          <H2 xl a="Give your agent a memory" b="you can audit." />
          <div className="sw-cta__cmd">
            <code className="sw-mono sw-ellipsis sw-cta__code">
              <span className="sw-cta__prompt">$ </span>{CMDS[tab].cmd}
            </code>
            <button type="button" aria-label={copied ? 'Copied' : 'Copy install command'} title={copied ? 'Copied' : 'Copy'} onClick={copy} className="sw-cta__copy">
              {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
            </button>
          </div>
          <div role="group" aria-label="Install method" className="sw-cta__tabs">
            {CMDS.map((c, i) => (
              <button key={c.tab} type="button" aria-pressed={tab === i} onClick={() => setTab(i)} className="sw-mono sw-cta__tab">
                {c.tab}
              </button>
            ))}
          </div>
          <div className="sw-cta__actions">
            <Ln to={DOCS} className="sw-btn sw-btn--solid">Read the docs</Ln>
            <Ln to={GITHUB} className="sw-btn sw-btn--ghost"><Icon name="github" size={18} />Star on GitHub{stars ? ` · ${stars}` : ''}</Ln>
          </div>
          <Ln to="mailto:licensing@statewave.ai" className="sw-cta__mail">
            Need an SLA or an architecture review? Talk to us →
          </Ln>
        </div>
      </div>
    </section>
  )
}
