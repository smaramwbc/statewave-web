import { Check, Copy } from 'lucide-react'
import { Ln } from './ui'
import { useCopy } from './hooks'
import { HeroChat } from './HeroChat'
import { DOCS } from './links'
import './home-b.css'

const INSTALL = 'npx @statewavedev/statewave'

/** The install command is the most important thing on the page: one line, copyable. */
function InstallLine() {
  const [done, copy] = useCopy(INSTALL)
  return (
    <div className="sw-hero__cmd">
      <span aria-hidden="true" className="sw-hero__prompt">$</span>
      <code className="sw-mono">{INSTALL}</code>
      <button type="button" className="sw-hero__copy" onClick={copy} aria-label={done ? 'Copied' : 'Copy install command'} title={done ? 'Copied' : 'Copy'}>
        {done ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
      </button>
    </div>
  )
}

export function Hero() {
  return (
    <section className="sw-hero" aria-label="Statewave">
      <div className="sw-hero__beams" aria-hidden="true">
        {[[18, 24, 0.22], [34, 24, 0.12], [70, -22, 0.16], [86, -22, 0.1]].map(([l, r, o]) => (
          <i key={l} style={{ left: `${l}%`, transform: `rotate(${r}deg)`, ['--o' as string]: o }} />
        ))}
      </div>

      <div className="sw-hero__in">
        <span className="sw-eyebrow sw-eyebrow--dark">Open-source memory runtime · Apache-2.0</span>
        <h1 className="sw-hero__title">
          Memory for AI agents.<br /> Every answer traces<br /> <span className="sw-hero__grad">back to its source.</span>
        </h1>
        <p className="sw-hero__sub">
          Persistent memory for your agents, with a signed receipt for every answer. Runs on your Postgres.
        </p>
        <InstallLine />
        <div className="sw-hero__ctas">
          <Ln to={DOCS} className="sw-btn sw-btn--solid sw-hero__cta">
            Get started
            <span aria-hidden="true" className="sw-hero__go">→</span>
          </Ln>
          <Ln to="/demo" className="sw-btn sw-btn--ghost">Try the live demo</Ln>
        </div>
      </div>

      <div className="sw-console-wrap">
        <HeroChat />
      </div>
    </section>
  )
}
