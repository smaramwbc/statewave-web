import { useEffect, useRef } from 'react'
import { Divider, Eyebrow, H2, Icon, Ln } from '../components/home/ui'
import { HeroDemo, RuntimeShowcase } from '../components/guide/demo'
import {
  ArchitectureFigure, ClaimsCard, DemoCards, EvidenceEditor, MemoryCard, MemoryFigure, QuickStartTerminal, VerifierFigures,
} from '../components/guide/figures'
import { REPO } from '../components/guide/shared'
import { PAGE_FAQS } from '../lib/page-faqs'
import { usePageSEO } from '../lib/seo'
import '../components/guide/guide.css'

/* /guide: the landing for Statewave Guide, the open-source in-app guidance framework (a separate product
 * from the memory runtime, with an optional Statewave adapter). Content, demos and figures come from #333
 * by Jyolsna, checked against the statewave-guide README and docs/provider-reality-check-round-2.md;
 * the page around them is rebuilt in the v8 style. Styles: components/guide/guide.css (.gd). */

const DIARY = '/blog/statewave-guide'
const BEAMS = [[18, 24, 0.22], [34, 24, 0.12], [70, -22, 0.16], [86, -22, 0.1]]

function Hero() {
  return (
    <section className="sw-hero gd-hero" aria-labelledby="gd-title">
      <div className="sw-hero__beams" aria-hidden="true">
        {BEAMS.map(([l, r, o]) => (
          <i key={l} style={{ left: `${l}%`, transform: `rotate(${r}deg)`, ['--o' as string]: o }} />
        ))}
      </div>
      <div className="sw-hero__in">
        <Eyebrow dark>Statewave Guide · Open source</Eyebrow>
        <h1 id="gd-title" className="sw-hero__title">
          Your app<br /> <span className="sw-hero__grad">explains itself.</span>
        </h1>
        <p className="sw-hero__sub">
          Ask where something is, and Guide points at the real control, backed by evidence from your source code.
        </p>
        <div className="sw-hero__ctas">
          <Ln to="#quick-start" className="sw-btn sw-btn--solid sw-hero__cta">
            Run the demo locally
            <span aria-hidden="true" className="sw-hero__go">↓</span>
          </Ln>
          <Ln to="#code-aware" className="sw-btn sw-btn--ghost">How it works</Ln>
        </div>
        <p className="gd-hero__note">
          Built in public: <Ln to={DIARY}>read the build diary</Ln>.
        </p>
      </div>
      <div className="gd-wrap gd-hero__demo"><HeroDemo /></div>
    </section>
  )
}

function Rules() {
  return (
    <section className="gd-section" aria-labelledby="the-two-rules">
      <div className="gd-wrap">
        <div className="gd-head gd-head--center">
          <Eyebrow>The two rules</Eyebrow>
          <H2 id="the-two-rules" a="Two rules run" b="through everything." />
        </div>
        <div className="gd-rules">
          <article className="gd-rule gd-rise">
            <ClaimsCard />
            <div className="gd-rule__copy">
              <h3>Unknown is better than wrong.</h3>
              <p>A fact reaches the user only with source-level evidence behind it. No evidence, no sentence. The system refuses rather than guesses.</p>
            </div>
          </article>
          <article className="gd-rule gd-rise">
            <MemoryCard />
            <div className="gd-rule__copy">
              <h3>Memory remembers experience, not truth.</h3>
              <p>What you did shapes how things are presented. It can never add a button, an answer, or a permission the product doesn’t have right now.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

const DIFFERENT = [
  'Deterministic: two runs over unchanged source produce byte-identical output. The graph is byte-identical; the answers built on top of it are not.',
  'Frontend and backend join on the API endpoint identity, not name-matching.',
  'Typed relationship kinds (invokes, opens, calls_api, requires_permission, …), each carrying file + line + symbol evidence.',
]

function CodeAware() {
  return (
    <section className="gd-section gd-section--navy" aria-labelledby="code-aware" data-nav-tone="dark">
      <div className="gd-wrap">
        <div className="gd-head">
          <Eyebrow dark>How it’s different</Eyebrow>
          <H2 id="code-aware" a="The DOM is scenery." b="The source graph is the product." />
        </div>
        <div className="gd-split gd-split--body">
          <div>
            <p className="sw-lede">
              A product tour knows a button exists at a position. Guide’s indexer reconstructs what pressing it does, with
              file-and-line evidence for every edge, by statically analyzing your React + Node source with ts-morph. If a
              relationship can’t be proven from code, it’s omitted rather than guessed.
            </p>
            <ol className="gd-points">
              {DIFFERENT.map((t, n) => <li key={n}><b>0{n + 1}</b>{t}</li>)}
            </ol>
          </div>
          <div className="gd-rise"><EvidenceEditor /></div>
        </div>
      </div>
    </section>
  )
}

function Verifier() {
  return (
    <section className="gd-section gd-section--tint" aria-labelledby="verified-not-guessed">
      <div className="gd-wrap">
        <div className="gd-head">
          <Eyebrow>Safety</Eyebrow>
          <H2 id="verified-not-guessed" a="A model chooses what to say." b="It can’t choose what’s true." />
          <p className="sw-lede">
            The application graph enumerates the claims that are provably true before a model sees anything. The model
            only selects from that menu and phrases it, or declines. A verifier then re-checks the selected claim before
            it reaches the Product Model.
          </p>
        </div>
        <VerifierFigures />
        <p className="gd-note">
          Measured against one model (claude-opus-5) on one synthetic fixture, and an independent LLM-based usefulness
          review still scored the output below its own bar. Harness and method:{' '}
          <Ln to={`${REPO}/tree/main/benchmarks/provider-reality-check`}>benchmarks/provider-reality-check</Ln>.
        </p>
      </div>
    </section>
  )
}

function Runtime() {
  return (
    <section className="gd-section gd-section--navy" aria-labelledby="runtime-context" data-nav-tone="dark">
      <div className="gd-wrap">
        <div className="gd-head gd-head--center">
          <Eyebrow dark>At runtime</Eyebrow>
          <H2 id="runtime-context" a="What’s on screen right now," b="borrowed, never kept." />
        </div>
        <div className="gd-runtime gd-rise"><RuntimeShowcase /></div>
      </div>
    </section>
  )
}

function Memory() {
  return (
    <section className="gd-section" aria-labelledby="memory">
      <div className="gd-wrap">
        <div className="gd-head">
          <Eyebrow>Memory</Eyebrow>
          <H2 id="memory" a="Remembers the person." b="Never rewrites the product." />
        </div>
        <div className="gd-split gd-split--body">
          <div>
            <p className="sw-lede">
              Guide’s memory is a closed vocabulary of six event kinds: counters and choices, never text. A walkthrough
              finished a thousand times is one durable record. A preference changed four times is one active value.
            </p>
            <p className="sw-lede">
              The optional durable-memory adapter, <code>@statewavedev/guide-statewave</code>, is server-side only; the
              credential never reaches the browser: page → your backend → <Ln to="/product" className="sw-lede__link">Statewave</Ln>.
            </p>
          </div>
          {/* Measured against a real Statewave server (README, "Memory"). */}
          <div className="gd-figure gd-rise"><MemoryFigure /></div>
        </div>
      </div>
    </section>
  )
}

function Architecture() {
  return (
    <section className="gd-section gd-section--tint" aria-labelledby="architecture">
      <div className="gd-wrap">
        <div className="gd-head">
          <Eyebrow>Architecture</Eyebrow>
          <H2 id="architecture" a="Eight packages." b="A strict boundary between each." />
          <p className="sw-lede">Point at a layer to see which package owns it, or at a package to see where it sits.</p>
        </div>
        <ArchitectureFigure />
      </div>
    </section>
  )
}

function QuickStart() {
  return (
    <section className="gd-section" aria-labelledby="quick-start">
      <div className="gd-wrap">
        <div className="gd-head">
          <Eyebrow>Quick start</Eyebrow>
          <H2 id="quick-start" a="Ten minutes." b="No AI keys. No Statewave account." />
        </div>
        <div className="gd-split gd-split--body">
          <div>
            <ul className="gd-chips">
              {['Node >= 20', 'pnpm 9+', 'no AI keys', 'no Statewave server'].map(t => (
                <li key={t}><span aria-hidden="true">✓</span>{t}</li>
              ))}
            </ul>
            <div className="gd-start__ctas">
              <Ln to={REPO} className="sw-btn gd-btn-dark"><Icon name="github" size={18} />View on GitHub</Ln>
              <Ln to={DIARY} className="gd-start__link">Read the build diary →</Ln>
            </div>
          </div>
          <div className="gd-rise"><QuickStartTerminal /></div>
        </div>
        <p className="gd-label">What the demo does</p>
        <DemoCards />
      </div>
    </section>
  )
}

function Faq() {
  const faq = PAGE_FAQS['/guide'] ?? []
  return (
    <section className="gd-section gd-section--tint" aria-label="Frequently asked questions">
      <div className="gd-wrap">
        <div className="gd-head gd-head--center">
          <Eyebrow>FAQ</Eyebrow>
          <H2 a="Questions about Statewave Guide" />
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

function Close() {
  return (
    <section className="gd-close" aria-labelledby="build-it" data-nav-tone="dark">
      <div className="gd-wrap gd-close__in">
        <span className="gd-close__logo"><img src="/brand/icon.svg" alt="" width={36} height={36} /></span>
        <h2 id="build-it" className="gd-close__title">Let your app<br /><span className="sw-hero__grad">explain itself.</span></h2>
        <div className="sw-hero__ctas">
          <Ln to={REPO} className="sw-btn sw-btn--solid"><Icon name="github" size={18} />View on GitHub</Ln>
          <Ln to="/product" className="sw-btn sw-btn--ghost">Explore Statewave’s memory runtime</Ln>
        </div>
        <div className="gd-close__links">
          <Ln to={DIARY}>Build diary</Ln>
          <Ln to={`${REPO}/blob/main/docs/trust.md`}>Trust, verifiable in an hour</Ln>
        </div>
      </div>
    </section>
  )
}

export function GuidePage() {
  // FAQPage and breadcrumb JSON-LD come from routeJsonLd in lib/page-schema.ts, shared with the prerenderer.
  usePageSEO({})

  // Scroll-in effects only arm once the page has mounted, so server HTML is never hidden.
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => { root.current?.setAttribute('data-armed', '') }, [])

  return (
    <div ref={root} className="sw-home gd">
      <Hero />
      {/* The horizon arc is the homepage's alone; inner pages end the hero on a straight edge and the cross divider. */}
      <Divider />
      <Rules />
      <Divider />
      <CodeAware />
      <Divider />
      <Verifier />
      <Divider />
      <Runtime />
      <Divider />
      <Memory />
      <Divider />
      <Architecture />
      <Divider />
      <QuickStart />
      <Faq />
      <Close />
    </div>
  )
}
