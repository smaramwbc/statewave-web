import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, Copy, Database, EyeOff, Filter, Lock, ShieldCheck } from 'lucide-react'
import { Divider, Eyebrow, H2, Ln } from '../home/ui'
import { useCopy, usePrefersReducedMotion, useSeen } from '../home/hooks'
import { logo } from '../home/links'
import { CONNECTORS } from '../../content/connectors'
import type { Connector } from '../../content/connectors/types'
import { usePageSEO } from '../../lib/seo'
import '../home/home-b.css'
import './connector.css'

/* The template for every /connectors/:slug page. One idea per section, one motif across
 * the page: a blue signal travelling from the source into Statewave. Every animation stops
 * under reduced motion, and ?capture renders every state at once for screenshots. */

type C = Connector

function Mark({ c, size }: { c: Pick<C, 'name' | 'logo' | 'glyph'>; size: number }) {
  if (c.logo) return <img src={c.logo.startsWith('/') ? c.logo : logo(c.logo)} alt="" width={size} height={size} />
  if (c.glyph === 'database') return <Database size={size} aria-hidden="true" />
  return <b>{c.name.slice(0, 1)}</b>
}

function CopyCmd({ cmd, hero }: { cmd: string; hero?: boolean }) {
  const [done, copy] = useCopy(cmd)
  return (
    <div className={hero ? 'sw-hero__cmd sw-cx-cmd' : 'cx2-cmd cx2-cmd--dark'}>
      <span aria-hidden="true" className={hero ? 'sw-hero__prompt' : undefined}>$</span>
      <code className="sw-mono">{cmd}</code>
      <button type="button" className={hero ? 'sw-hero__copy' : undefined} onClick={copy} aria-label={done ? 'Copied' : 'Copy command'}>
        {done ? <Check size={hero ? 18 : 16} aria-hidden="true" /> : <Copy size={hero ? 18 : 16} aria-hidden="true" />}
      </button>
    </div>
  )
}

/* ── hero ── */

function Tile({ c, label }: { c: Pick<C, 'name' | 'logo' | 'glyph'>; label: string }) {
  return (
    <div className="sw-cx-tile">
      <span className="sw-cx-tile__box"><Mark c={c} size={40} /></span>
      <span className="sw-cx-tile__name">{c.name}</span>
      <code className="sw-mono sw-cx-tile__label">{label}</code>
    </div>
  )
}

function Hero({ c }: { c: C }) {
  return (
    <section className="sw-hero sw-cx-hero" aria-label={c.name}>
      <div className="sw-hero__beams" aria-hidden="true">
        {[[14, 24, 0.18], [30, 24, 0.1], [74, -22, 0.14], [90, -22, 0.08]].map(([l, r, o]) => (
          <i key={l} style={{ left: `${l}%`, transform: `rotate(${r}deg)`, ['--o' as string]: o }} />
        ))}
      </div>
      <div className="sw-hero__in">
        <nav className="sw-cx-crumbs" aria-label="Breadcrumb">
          <Ln to="/connectors">Connectors</Ln><span aria-hidden="true">/</span>
          <span>{c.group}</span><span aria-hidden="true">/</span>
          <span aria-current="page">{c.name}</span>
        </nav>
        <div className="sw-cx-link" aria-hidden="true">
          <Tile c={c} label={c.hero.from} />
          <span className="sw-cx-wire"><i /><i /><i /></span>
          <Tile c={{ name: 'Statewave', logo: '/brand/icon.svg' }} label={c.hero.to} />
        </div>
        <h1 className="sw-hero__title sw-cx-title">
          {c.hero.a}<br /> <span className="sw-hero__grad">{c.hero.grad}</span>
        </h1>
        <p className="sw-hero__sub">{c.hero.sub}</p>
        <ul className="sw-cx-badges" aria-label="Connector facts">
          <li className={c.status === 'stable' ? 'is-ok' : 'is-warn'}>{c.status === 'stable' ? 'Stable' : 'Preview'}</li>
          {c.modes.includes('pull') && <li>Pull</li>}
          {c.modes.includes('push') && <li>Real time</li>}
          <li className="sw-mono">{c.pkg}</li>
        </ul>
        <CopyCmd cmd={c.hero.cmd} hero />
        <div className="sw-hero__ctas">
          <Ln to="#setup" className="sw-btn sw-btn--solid sw-hero__cta">
            Set up {c.name}
            <span aria-hidden="true" className="sw-hero__go">→</span>
          </Ln>
          <Ln to={c.source} className="sw-btn sw-btn--ghost">View on GitHub</Ln>
        </div>
      </div>
    </section>
  )
}

/* ── story: one item, three moments, side by side ── */

function SourceCard({ c }: { c: C }) {
  const s = c.story.source
  return (
    <div className="cx2-card cx2-ticket">
      <div className="cx2-card__bar">
        <span className="cx2-card__mark"><Mark c={c} size={16} /></span>
        <span>{s.label} <span className="sw-mono">{s.id}</span></span>
        {s.status && <span className="sw-chip sw-chip--run">{s.status}</span>}
      </div>
      <b className="cx2-ticket__title">{s.title}</b>
      <p>{s.body}</p>
      {s.meta.length > 0 && (
        <dl>{s.meta.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      )}
      <span className="cx2-via"><i />{s.via}</span>
    </div>
  )
}

function EpisodeCard({ c }: { c: C }) {
  const e = c.story.episode
  return (
    <div className="cx2-card cx2-episode">
      <span className="cx2-kind sw-mono">{e.kind}</span>
      <div className="cx2-episode__subject">
        <span>subject</span>
        <code className="sw-mono">{e.subject}</code>
      </div>
      <p>{e.text}</p>
      <div className="cx2-episode__src"><span>source</span><code className="sw-mono">{e.url}</code></div>
      <div className="cx2-episode__lane">
        <i className="cx2-pulse" />
        <code className="sw-mono">{e.lane}</code>
        <span>{e.laneNote}</span>
      </div>
    </div>
  )
}

function AnswerCard({ c }: { c: C }) {
  const a = c.story.answer
  return (
    <div className="cx2-card cx2-chat">
      <div className="cx2-chat__q">
        <span>{a.asker}</span>
        <p>{a.ask}</p>
      </div>
      <div className="cx2-chat__a">
        <p>{a.answer}</p>
        <div className="cx2-chat__src">
          <span>Sources</span>
          {a.sources.map(s => <em key={s} className="sw-mono">{s}</em>)}
        </div>
      </div>
      <code className="cx2-chat__call sw-mono">{a.call}</code>
    </div>
  )
}

const STORY_CARDS = [SourceCard, EpisodeCard, AnswerCard]

function Story({ c }: { c: C }) {
  const [ref, seen] = useSeen<HTMLOListElement>()
  return (
    <section className="cx2-section cx2-story" aria-label="How it works">
      <div className="cx2-wrap">
        <div className="cx2-head">
          <Eyebrow>How it works</Eyebrow>
          <H2 a={c.story.heading[0]} b={c.story.heading[1]} />
          <p className="sw-lede">{c.story.lede}</p>
        </div>
        <ol ref={ref} className="cx2-story__row" data-seen={seen || undefined}>
          {c.story.steps.map((s, i) => {
            const Card = STORY_CARDS[i]
            return (
              <li key={s.title} style={{ ['--i' as string]: i }}>
                <div className="cx2-story__text">
                  <span className="cx2-story__n sw-mono">0{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
                <div className="cx2-panel-wrap">
                  <div className="cx2-panel"><Card c={c} /></div>
                  {i < 2 && <i className="cx2-hop" aria-hidden="true" />}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

/* ── reads: what the connector picks up, on one example timeline ── */

function Reads({ c }: { c: C }) {
  const r = c.reads
  const [all, setAll] = useState(true)
  const n = r.events.filter(e => all || !e.optIn).length
  return (
    <section className="cx2-section cx2-section--tint" aria-label={r.eyebrow ?? 'What it reads'}>
      <div className="cx2-wrap cx2-split">
        <div className="cx2-head">
          <Eyebrow>{r.eyebrow ?? 'What it reads'}</Eyebrow>
          <H2 a={r.heading[0]} b={r.heading[1]} />
          <p className="sw-lede">{r.lede}</p>
          {r.toggle && (
            <>
              <div className="cx2-seg" role="group" aria-label="What to read">
                <button type="button" aria-pressed={!all} onClick={() => setAll(false)}>{r.toggle.off}</button>
                <button type="button" aria-pressed={all} onClick={() => setAll(true)}>{r.toggle.on}</button>
              </div>
              <code className="cx2-flag sw-mono">{all ? r.toggle.onFlag : r.toggle.offFlag}</code>
            </>
          )}
        </div>
        <div className="cx2-timeline">
          <div className="cx2-timeline__head">
            <span>{r.title}</span>
            <b className="sw-mono" key={n}>{n} {n === 1 ? (r.unit?.[0] ?? 'episode') : (r.unit?.[1] ?? 'episodes')}</b>
          </div>
          <ol>
            {r.events.map(e => {
              const off = e.optIn && !all
              return (
                <li key={`${e.time}-${e.kind}-${e.title}`} data-off={off || undefined}>
                  <span className="cx2-timeline__time sw-mono">{e.time}</span>
                  <i className="cx2-timeline__node" />
                  <div>
                    <div className="cx2-timeline__title">
                      <b>{e.title}</b>
                      {e.optIn && <span className="cx2-timeline__tag">{off ? 'Not read' : 'Opt-in'}</span>}
                    </div>
                    <p>{e.who && <span>{e.who}: </span>}{e.text}</p>
                    <code className="sw-mono">{e.kind}</code>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}

/* ── routing: where memory goes ── */

/** Lets a long subject wrap after ':' or '/' instead of mid-word. */
const breakable = (subject: string) => subject.split(/(?<=[:/])/).flatMap((part, i) => (i ? [<wbr key={i} />, part] : [part]))

function Routing({ c }: { c: C }) {
  const r = c.routing
  const [i, setI] = useState(0)
  const o = r.options[i]
  return (
    <section className="cx2-section" aria-label="How memory is organized">
      <div className="cx2-wrap">
        <div className="cx2-head cx2-head--center">
          <Eyebrow>How memory is organized</Eyebrow>
          <H2 a={r.heading[0]} b={r.heading[1]} />
          <p className="sw-lede">{r.lede}</p>
        </div>
        <div className="cx2-route">
          <div className="cx2-route__from" role="radiogroup" aria-label={r.pick}>
            {r.options.map((x, k) => (
              <button key={x.subject} type="button" role="radio" aria-checked={k === i} onClick={() => setI(k)}>
                <b>{x.label}</b><span>{x.detail}</span>
              </button>
            ))}
          </div>
          <div className="cx2-route__wire" key={i} aria-hidden="true"><i /></div>
          <div className="cx2-route__to" key={`to-${i}`}>
            <span>Memory subject</span>
            <code className="sw-mono">{breakable(o.subject)}</code>
            <p>{o.why}</p>
          </div>
        </div>
        {r.note && (
          <p className="cx2-route__override">{r.note[0]} <code className="sw-mono">{r.note[1]}</code> {r.note[2]}</p>
        )}
      </div>
    </section>
  )
}

/* ── setup: steps on the left, a terminal that types on the right ── */

/** Types `text` two characters at a time. Remount (key) to start again. */
function useTyped(text: string) {
  const rm = usePrefersReducedMotion()
  const [n, setN] = useState(0)
  useEffect(() => {
    if (rm || n >= text.length) return
    const id = setTimeout(() => setN(n + 2), 18)
    return () => clearTimeout(id)
  }, [n, text, rm])
  const shown = rm ? text.length : Math.min(n, text.length)
  return [text.slice(0, shown), shown >= text.length] as const
}

type Tab = C['setup']['terminal'][number]

function TermBody({ tab }: { tab: Tab }) {
  const [typed, done] = useTyped(tab.cmd)
  return (
    <>
      <pre className="cx2-term__body">
        {tab.env.map(e => <span key={e} className="cx2-term__env">export {e}{'\n'}</span>)}
        {tab.env.length > 0 && '\n'}<span className="cx2-term__ps">$ </span>{typed}<span className="cx2-term__caret" />
        {tab.output && (
          <span className="cx2-term__out" data-on={done || undefined}>
            {'\n\n'}{tab.outputLabel && <span className="cx2-term__label"># {tab.outputLabel}{'\n'}</span>}{tab.output}
          </span>
        )}
      </pre>
      {tab.notes && (
        <ul className="cx2-term__notes">
          {tab.notes.map(n => <li key={n}><Check size={14} aria-hidden="true" />{n}</li>)}
        </ul>
      )}
    </>
  )
}

function Terminal({ c }: { c: C }) {
  const tabs = c.setup.terminal
  const [t, setT] = useState(0)
  const tab = tabs[t]
  const full = [...tab.env.map(e => `export ${e}`), ...(tab.env.length ? [''] : []), tab.cmd].join('\n')
  const [copied, copy] = useCopy(full)
  return (
    <div className="cx2-term">
      <div className="cx2-term__bar">
        <div className="cx2-term__tabs" role="tablist">
          {tabs.map((x, k) => (
            <button key={x.label} type="button" role="tab" aria-selected={k === t} onClick={() => setT(k)}>{x.label}</button>
          ))}
        </div>
        <button type="button" className="cx2-term__copy" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
      </div>
      <TermBody key={t} tab={tab} />
    </div>
  )
}

function Setup({ c }: { c: C }) {
  return (
    <section id="setup" className="cx2-section cx2-section--tint cx2-anchor" aria-label="Set up">
      <div className="cx2-wrap">
        <div className="cx2-head">
          <Eyebrow>Set up</Eyebrow>
          <H2 a={c.setup.heading?.[0] ?? 'Preview first.'} b={c.setup.heading?.[1] ?? 'Nothing is sent until you say so.'} />
        </div>
        <div className="cx2-setup">
          <div>
            <ol className="cx2-steps">
              {c.setup.steps.map((s, i) => (
                <li key={s.title}>
                  <span className="sw-mono">{i + 1}</span>
                  <div><b>{s.title}</b><p>{s.text}</p></div>
                </li>
              ))}
            </ol>
            {c.setup.env.length > 0 && (
              <details className="cx2-env">
                <summary>Environment variables <span>{c.setup.env.length}</span></summary>
                <dl>
                  {c.setup.env.map(e => (
                    <div key={e.name}><dt className="sw-mono">{e.name}</dt><dd><em>{e.when}</em>{e.text}</dd></div>
                  ))}
                </dl>
              </details>
            )}
          </div>
          <Terminal c={c} />
        </div>
      </div>
    </section>
  )
}

/* ── trust and close ── */

const SAFE_ICON = [<Lock size={18} key="l" />, <EyeOff size={18} key="e" />, <Filter size={18} key="f" />, <ShieldCheck size={18} key="s" />]

function Trust({ c }: { c: C }) {
  return (
    <section className="cx2-section" aria-label="Safety and limits">
      <div className="cx2-wrap">
        <div className="cx2-head">
          <Eyebrow>Safe by default</Eyebrow>
          <H2 a={c.safetyHeading?.[0] ?? 'It reads what you allow.'} b={c.safetyHeading?.[1] ?? 'Nothing else.'} />
        </div>
        <ul className="cx2-safe">
          {c.safety.slice(0, 4).map((s, i) => <li key={s}><span>{SAFE_ICON[i]}</span>{s}</li>)}
        </ul>
        <div className="cx2-limits">
          <b>Good to know</b>
          <ul>{c.limits.map(l => <li key={l}>{l}</li>)}</ul>
        </div>
      </div>
    </section>
  )
}

/* ── faq: three questions answered from the facts above, as question headings an answer engine can cite ── */

function Faq({ c }: { c: C }) {
  const it = c.group === 'MCP' ? `the ${c.name}` : `the ${c.name} connector`
  const entries = [
    { q: `What does ${it} do?`, a: c.hero.sub },
    { q: `Is ${it} safe to run?`, a: c.safety.join(' ') },
    { q: `What are ${it}’s limits?`, a: c.limits.join(' ') },
  ]
  return (
    <section className="cx2-section cx2-section--tint" aria-label="Frequently asked questions">
      <div className="cx2-wrap">
        <div className="cx2-head cx2-head--center">
          <Eyebrow>FAQ</Eyebrow>
          <H2 a={`Questions about ${it}`} />
        </div>
        <div className="sw-faq">
          {entries.map((e, i) => (
            <details key={e.q} {...(i === 0 ? { open: true } : {})}>
              <summary><span aria-hidden="true" className="sw-plus">+</span><h3>{e.q}</h3></summary>
              <div><p>{e.a}</p></div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function Close({ c }: { c: C }) {
  const related = c.related.map(s => CONNECTORS[s]).filter(Boolean)
  return (
    <section className="cx2-close" aria-label="Get started" data-nav-tone="dark">
      <div className="cx2-wrap cx2-close__in">
        <span className="cx2-close__logo"><Mark c={c} size={36} /></span>
        <h2 className="cx2-close__title">{c.close.a}<br /><span className="sw-hero__grad">{c.close.grad}</span></h2>
        <CopyCmd cmd={c.hero.cmd} />
        <div className="cx2-close__more">
          <span>{c.close.more}</span>
          {related.map(r => (
            <Ln key={r.slug} to={`/connectors/${r.slug}`} className="cx2-pill"><Mark c={r} size={16} />{r.name}</Ln>
          ))}
          <Ln to="/connectors" className="cx2-pill">All 18 <ArrowRight size={14} aria-hidden="true" /></Ln>
        </div>
        <div className="cx2-close__links">
          {c.example && <Ln to={c.example}>Full example on GitHub →</Ln>}
          <Ln to={c.source}>Connector source →</Ln>
          {c.close.useCase && <Ln to={c.close.useCase.href}>{c.close.useCase.label} →</Ln>}
        </div>
      </div>
    </section>
  )
}

export function ConnectorPage({ c }: { c: C }) {
  // Title, description and canonical come from the /connectors/<slug> entry in lib/seo-meta.
  usePageSEO()
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    root.current?.setAttribute('data-armed', '')
    if (new URLSearchParams(window.location.search).has('capture')) root.current?.setAttribute('data-capture', '')
  }, [])
  return (
    <div ref={root} className="sw-home cx2" key={c.slug}>
      <Hero c={c} />
      <Divider />
      <Story c={c} />
      <Divider />
      <Reads c={c} />
      <Divider />
      <Routing c={c} />
      <Divider />
      <Setup c={c} />
      <Divider />
      <Trust c={c} />
      <Faq c={c} />
      <Close c={c} />
    </div>
  )
}
