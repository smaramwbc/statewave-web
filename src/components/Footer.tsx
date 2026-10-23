import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { CREDIBILITY_STATS, formatCompactCount, useGithubStars } from '../lib/credibility-stats'
import { Check, Copy } from 'lucide-react'
import { Icon, Ln } from './home/ui'
import { GITHUB } from './home/links'
import { COLUMNS } from './site-links'
import { useTrackDemoCta } from '../lib/widget-context-api'

const INSTALL = 'npx @statewavedev/statewave'

const SOCIAL: [string, string, string][] = [
  ['GitHub', GITHUB, 'github'],
  ['Docker Hub', 'https://hub.docker.com/r/statewavedev/statewave', 'docker'],
  ['PyPI', 'https://pypi.org/project/statewave/', 'python'],
  ['npm', 'https://www.npmjs.com/package/@statewavedev/statewave', 'npm'],
]

export function Footer() {
  const stars = formatCompactCount(useGithubStars())
  const version = CREDIBILITY_STATS.pypi_version
  const [copied, setCopied] = useState(false)
  // Hides the floating chat pill while the footer's demo link is on screen, as the old footer button did.
  const demoRef = useRef<HTMLLIElement>(null)
  useTrackDemoCta(demoRef)
  const copy = async () => {
    try { await navigator.clipboard.writeText(INSTALL) } catch { /* insecure context or denied: still flash feedback */ }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <footer className="sw-foot pl-safe pr-safe">
      <div className="sw-foot__glow sw-foot__glow--v" aria-hidden="true" />
      <div className="sw-foot__glow sw-foot__glow--c" aria-hidden="true" />

      <div className="sw-foot__wrap">
        <div className="sw-foot__top">
          <div>
            <Link to="/" aria-label="Statewave home" className="sw-foot__logo">
              <img src="/brand/logo-horizontal-db.svg" alt="Statewave" width={136} height={28} />
            </Link>
            <p className="sw-foot__blurb">Open-source memory runtime for AI agents. Self-hosted on Postgres, Apache-2.0.</p>
            <p className="sw-foot__meta sw-mono">
              {version && <><Link to="/blog">v{version}</Link><i>·</i></>}
              {stars && <><Ln to={GITHUB}>★ {stars}</Ln><i>·</i></>}
              <span>Apache-2.0</span>
            </p>
          </div>

          <div className="sw-foot__side">
            <div className="sw-foot__cmd">
              <span className="sw-mono" style={{ color: '#4a8cff' }}>$</span>
              <code className="sw-mono">{INSTALL}</code>
              <button type="button" className="sw-foot__copy" onClick={copy} aria-label={copied ? 'Copied' : 'Copy install command'} title={copied ? 'Copied' : 'Copy'}>{copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}</button>
            </div>
          </div>
        </div>

        <div className="sw-foot__rule" />

        <div className="sw-foot__cols">
          {COLUMNS.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h3 className="sw-foot__label">{c.title}</h3>
              <ul>
                {c.items.map(([label, to]) => (
                  <li key={label} ref={to === '/demo' ? demoRef : undefined}><Ln to={to}>{label}</Ln></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="sw-foot__rule" />

        <div className="sw-foot__legal">
          <p>
            <span>© {new Date().getFullYear()} Statewave</span>
            <span>Apache-2.0</span>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/cookies">Cookies</Link>
            <Link to="/impressum">Impressum</Link>
          </p>
          <div className="sw-foot__social">
            {SOCIAL.map(([label, to, icon]) => (
              <Ln key={label} to={to} ariaLabel={label}><Icon name={icon} size={20} /></Ln>
            ))}
          </div>
        </div>
      </div>

      <div className="sw-foot__mark" aria-hidden="true">Statewave</div>
    </footer>
  )
}
