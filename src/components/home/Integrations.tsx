import { useEffect, useRef } from 'react'
import { Eyebrow, H2, Icon, Ln } from './ui'
import { logo, EXAMPLES } from './links'
import './home-b.css'

const INNER: [string, string][] = [['Claude Code & Desktop', 'claude'], ['Cursor', 'cursor'], ['VS Code Copilot', 'githubcopilot'], ['Codex CLI', 'openai']]
const OUTER: [string, string][] = [['GitHub', 'github'], ['Slack', 'slack'], ['Zendesk', 'zendesk'], ['Jira', 'jira'], ['Notion', 'notion'], ['Intercom', 'intercom'], ['Gmail', 'gmail'], ['Discord', 'discord']]

/** Chips evenly spaced on a ring, starting at `offset` degrees. */
function Ring({ items, offset, kind }: { items: [string, string][]; offset: number; kind: 'inner' | 'outer' }) {
  return (
    <div className={`sw-orb__ring sw-orb__ring--${kind}`}>
      {items.map(([name, icon], i) => {
        const a = ((offset + (i * 360) / items.length) * Math.PI) / 180
        return (
          <div key={name + i} className="sw-orb__slot" style={{ left: `${(50 + 50 * Math.cos(a)).toFixed(2)}%`, top: `${(50 + 50 * Math.sin(a)).toFixed(2)}%` }}>
            <span className="sw-orb__chip" tabIndex={0} role="img" aria-label={name}>
              <img className="sw-orb__logo" src={logo(icon)} alt="" width={24} height={24} />
            </span>
          </div>
        )
      })}
    </div>
  )
}

/** Rings drift while the pointer is over the orbit and ease to a stop when it leaves
 *  (or when it rests on one logo, so its tooltip holds still). Driven by a --a angle
 *  var so start and stop are eased, which animation-play-state can't do. */
function useOrbitDrift() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let angle = 0, speed = 0, target = 0, raf = 0, last = 0
    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000); last = t
      speed += (target - speed) * Math.min(1, dt * 4)
      angle = (angle + speed * dt) % 360
      el.style.setProperty('--a', `${angle.toFixed(3)}deg`)
      raf = Math.abs(speed) > 0.02 || target ? requestAnimationFrame(frame) : 0
    }
    const go = (v: number) => { target = v; if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame) } }
    const over = (e: PointerEvent) => go((e.target as Element).closest('.sw-orb__chip') ? 0 : 14)
    const out = () => go(0)
    el.addEventListener('pointermove', over)
    el.addEventListener('pointerleave', out)
    return () => { el.removeEventListener('pointermove', over); el.removeEventListener('pointerleave', out); cancelAnimationFrame(raf) }
  }, [])
  return ref
}

export function Integrations() {
  const orb = useOrbitDrift()
  return (
    <section className="sw-section" aria-label="Works with">
      <div className="sw-wrap">
        <div className="sw-int__head">
          <Eyebrow>Integrations</Eyebrow>
          <H2 a="One MCP server." b="Connectors for your sources." />
          <p className="sw-lede">
            Statewave runs an MCP server for coding assistants and ships connectors that turn GitHub, Slack, Zendesk and
            other sources into episodes.
          </p>
        </div>

        <div className="sw-orb-grid">
          <div className="sw-orb-side sw-orb-side--l">
            <div className="sw-orb-side__t">Your coding assistant, via MCP</div>
            <p className="sw-orb-side__p">
              Claude Code, Claude Desktop, Cursor, VS Code Copilot and Codex CLI are wired automatically by the
              quickstart. Windsurf, Cline, Continue, Zed, Aider, Goose and any other MCP client connect to the same server.
            </p>
            <Ln to="/developers" className="sw-orb-side__a">Set up the MCP server →</Ln>
          </div>

          <div className="sw-orb" ref={orb}>
            <div aria-hidden="true" className="sw-orb__glow" />
            <Ring items={OUTER} offset={-67.5} kind="outer" />
            <Ring items={INNER} offset={-90} kind="inner" />
            <div className="sw-orb__core">
              <img src="/brand/icon.svg" alt="Statewave" width={72} height={72} />
            </div>
          </div>

          <div className="sw-orb-side sw-orb-side--r">
            <div className="sw-orb-side__t">Feeds memory from</div>
            <p className="sw-orb-side__p">
              GitHub, Slack, Zendesk, Jira, Notion, Intercom, Gmail and Discord on the outer ring.
            </p>
            <Ln to="/connectors" className="sw-orb-side__a">All connectors →</Ln>
          </div>
        </div>

        <div className="sw-int__fw">
          <span className="sw-int__fwl">Framework quickstarts</span>
          <Ln to={`${EXAMPLES}/tree/main/langchain`} className="sw-pill-link"><Icon name="langchain" w={20} h={14} />LangChain</Ln>
          <Ln to={`${EXAMPLES}/tree/main/crewai`} className="sw-pill-link"><Icon name="crewai" size={15} />CrewAI</Ln>
          <Ln to={`${EXAMPLES}/tree/main/autogen`} className="sw-pill-link">AutoGen</Ln>
        </div>
      </div>
    </section>
  )
}
