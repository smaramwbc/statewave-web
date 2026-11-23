import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { ArrowDownToLine, ArrowUpRight, Fingerprint, Maximize2, Minimize2, Repeat2, ShieldCheck } from 'lucide-react'
import { Divider, Eyebrow, H2, Ln } from '../components/home/ui'
import { useSeen } from '../components/home/hooks'
import { PAGE_FAQS } from '../lib/page-faqs'
import { usePageSEO } from '../lib/seo'
import '../components/home/home-b.css'
import '../components/whitepaper/whitepaper.css'

/* /whitepaper in the v8 style: the landing page for "Compiled Memory", the technical white paper.
 * The PDF (public/whitepaper/compiled-memory.pdf) is generated and kept in sync out-of-band; this
 * page presents it. Every claim, figure and page number here is the paper's own. Wrapper copy stays
 * in the neutral brand voice: the author byline lives in the PDF itself, not in marketing copy here.
 * An interior page: the hero ends on a straight edge and the home's cross divider, not the arc. */

const PDF = '/whitepaper/compiled-memory.pdf'
const PDF_NAME = 'Statewave-Compiled-Memory.pdf'
const BENCHMARKS_REPO = 'https://github.com/smaramwbc/statewave-memory-benchmarks'
const BEAMS = [[18, 24, 0.22], [34, 24, 0.12], [70, -22, 0.16], [86, -22, 0.1]]

/** The paper's own browser viewers open at a page with #page=N. */
const atPage = (n: number) => `${PDF}#page=${n}`

const PROPERTIES = [
  { Icon: Repeat2, name: 'Determinism', text: 'The same query against the same snapshot returns the same bytes, so memory becomes something a regression test can pin down.' },
  { Icon: Fingerprint, name: 'Provenance', text: 'Every asserted fact traces back to the immutable event that produced it: an audit trail, not a similarity score.' },
  { Icon: ShieldCheck, name: 'Governability', text: 'An operator can constrain and prove what an agent saw at decision time. Policy runs before scoring, so relevance can’t override it.' },
]

const STAGES = [
  { name: 'Record', text: 'Raw events become immutable, append-only episodes, deduplicated by an idempotency key. There is no edit path, so a citation can’t rot.' },
  { name: 'Compile', text: 'A heuristic or LLM compiler distils episodes into typed, confidence-scored memories with validity windows and links to their sources. A conflict supersedes, it never deletes.' },
  { name: 'Context', text: 'A policy filter runs first, then a fixed, non-learned score packs memories into a token-bounded bundle. Same inputs, same bytes.' },
  { name: 'Govern', text: 'Provenance is a finite query, receipts hash exactly what the agent saw, and sensitivity-label policy can deny or redact before anything is delivered.' },
]

type Row = readonly [string, number]
const LOCOMO: readonly Row[] = [['Statewave', 0.905], ['mem0 cloud (managed)', 0.899], ['mem0 OSS', 0.866]]
const LONGMEMEVAL: readonly Row[] = [['Statewave', 0.967], ['mem0 cloud (managed)', 0.933], ['mem0 OSS', 0.833]]

const CONTENTS = [
  { n: '1', title: 'Introduction', page: 2, text: 'Why memory is an infrastructure problem, and why retrieval quality is necessary but not sufficient.' },
  { n: '2', title: 'Background', page: 4, text: 'Why stateless models need an external state machine, and the hard regime where history far exceeds the budget.' },
  { n: '3', title: 'Problem formulation', page: 4, text: 'Episodes, subjects, memories and context bundles, with determinism and provenance defined formally.' },
  { n: '4', title: 'The Statewave model', page: 5, text: 'Record, compile, context and govern, including the exact scoring signals and the token-bounded packing.' },
  { n: '5', title: 'A comparison of memory architectures', page: 9, text: 'Prompt stuffing, RAG, Mem0, memU, Zep and Graphiti, Letta and MemGPT: which properties each exposes as a contract.' },
  { n: '6', title: 'Empirical evaluation', page: 13, text: 'LoCoMo and LongMemEval on a fork of mem0’s own harness, with every harness fix disclosed.' },
  { n: '7', title: 'Limitations and threats to validity', page: 15, text: 'What is still unproven, empirically and operationally, stated as plainly as the results.' },
  { n: '8', title: 'Discussion: design principles', page: 16, text: 'Raw truth first, determinism as a deliberate trade-off, and the compiler as the recall lever.' },
  { n: '9', title: 'Conclusion and references', page: 16, text: 'The thesis that carries beyond any single benchmark, and the sources behind the comparison.' },
]

const FAQ = PAGE_FAQS['/whitepaper'] ?? []

/* ── hero ── */

function Hero() {
  return (
    <section className="sw-hero wp-hero" aria-label="Compiled Memory white paper">
      <div className="sw-hero__beams" aria-hidden="true">
        {BEAMS.map(([l, r, o]) => (
          <i key={l} style={{ left: `${l}%`, transform: `rotate(${r}deg)`, ['--o' as string]: o }} />
        ))}
      </div>
      <div className="sw-hero__in">
        <Eyebrow dark>White paper · Statewave v1.0</Eyebrow>
        <h1 className="sw-hero__title">
          Compiled Memory<br /> <span className="sw-hero__grad">Agent context you can prove.</span>
        </h1>
        <p className="sw-hero__sub">
          A deterministic, provenance-traced runtime for long-horizon AI agent context: why agent
          memory should be compiled and governed, not merely retrieved.
        </p>
        <div className="wp-hero__cta">
          <a href={PDF} target="_blank" rel="noopener" className="sw-btn sw-btn--solid">
            Read the paper <ArrowUpRight size={18} aria-hidden="true" />
          </a>
          <a href={PDF} download={PDF_NAME} className="sw-btn sw-btn--ghost">
            Download PDF <ArrowDownToLine size={18} aria-hidden="true" />
          </a>
        </div>
        <p className="wp-hero__meta">18 pages · PDF · 170 KB · Free, no signup</p>
      </div>
    </section>
  )
}

/* ── the argument: three properties retrieval alone doesn't give you ── */

function Thesis() {
  const [ref, seen] = useSeen<HTMLUListElement>()
  return (
    <section className="wp-section" aria-labelledby="wp-thesis">
      <div className="wp-wrap">
        <div className="wp-head">
          <Eyebrow>The argument</Eyebrow>
          <H2 id="wp-thesis" a="Retrieval quality is necessary." b="It isn’t sufficient." />
          <p className="sw-lede">
            A language model is stateless: everything an agent seems to remember was chosen by the
            memory layer that fills its context window. The paper argues that layer should be a
            compiled, governed runtime rather than a retrieval index, because three properties that
            production and regulated deployments need are hard to get from vector-first and
            graph-first designs.
          </p>
        </div>
        <ul ref={ref} className="wp-props" {...(seen ? { 'data-seen': '' } : {})}>
          {PROPERTIES.map(({ Icon, name, text }, i) => (
            <li key={name} className="wp-prop" style={{ '--i': i } as CSSProperties}>
              <span className="wp-prop__icon" aria-hidden="true"><Icon size={22} /></span>
              <h3 className="wp-prop__name">{name}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ── the model: four stages ── */

function Model() {
  const [ref, seen] = useSeen<HTMLOListElement>()
  return (
    <section className="wp-section wp-section--tint" aria-labelledby="wp-model">
      <div className="wp-wrap">
        <div className="wp-head">
          <Eyebrow>Section 4 · The Statewave model</Eyebrow>
          <H2 id="wp-model" a="Four stages," b="one transparent function." />
          <p className="sw-lede">
            One self-hosted service over PostgreSQL and pgvector. Raw events are the truth; memories
            are derived from them and can always be recompiled.
          </p>
        </div>
        <ol ref={ref} className="wp-stages" {...(seen ? { 'data-seen': '' } : {})}>
          {STAGES.map((s, i) => (
            <li key={s.name} className="wp-stage" style={{ '--i': i } as CSSProperties}>
              <span className="wp-stage__n sw-mono">0{i + 1}</span>
              <h3 className="wp-stage__name">{s.name}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ── the evaluation: the paper's own figures, with the conditions next to them ── */

function Bars({ title, n, rows }: { title: string; n: string; rows: readonly Row[] }) {
  const [ref, seen] = useSeen<HTMLDivElement>()
  return (
    <div ref={ref} className="wp-bench" {...(seen ? { 'data-seen': '' } : {})}>
      <div className="wp-bench__head">
        <h3>{title}</h3>
        <span className="sw-mono">{n}</span>
      </div>
      <dl>
        {rows.map(([name, v], i) => (
          <div key={name} className={`wp-bar${i === 0 ? ' wp-bar--us' : ''}`} style={{ '--v': v, '--i': i } as CSSProperties}>
            <dt>{name}</dt>
            <dd><span className="wp-bar__fill" aria-hidden="true" /><span className="sw-mono">{v.toFixed(3)}</span></dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function Results() {
  return (
    <section className="wp-section" aria-labelledby="wp-results">
      <div className="wp-wrap">
        <div className="wp-head">
          <Eyebrow>Section 6 · Empirical evaluation</Eyebrow>
          <H2 id="wp-results" a="Run on mem0’s own harness." b="Only the backend changes." />
          <p className="sw-lede">
            A fork of mem0’s memory-benchmarks suite with its judge and scoring untouched. All three
            systems use the same gpt-4o answerer and judge and a top-200 retrieval cap, so the memory
            backend is the only variable.
          </p>
        </div>
        <div className="wp-benches">
          <Bars title="LoCoMo" n="n = 1,540" rows={LOCOMO} />
          <Bars title="LongMemEval, matched set" n="n = 30" rows={LONGMEMEVAL} />
        </div>
        <p className="wp-note">
          Overall accuracy, one run per system. On LoCoMo the 0.006 gap to mem0 cloud is inside
          single-run noise; LongMemEval’s matched set has five questions per category, so read it as
          directional. BEAM is pending. Every harness fix that helped the mem0 backends is listed in
          section 6.3.
        </p>
        <div className="wp-links">
          <Ln to="/benchmarks" className="wp-link">Full methodology on the benchmarks page <ArrowUpRight size={16} aria-hidden="true" /></Ln>
          <Ln to={BENCHMARKS_REPO} className="wp-link">Rerun it: statewave-memory-benchmarks <ArrowUpRight size={16} aria-hidden="true" /></Ln>
        </div>
      </div>
    </section>
  )
}

/* ── contents: each entry opens the PDF at its page ── */

function Contents() {
  const [ref, seen] = useSeen<HTMLOListElement>()
  return (
    <section className="wp-section wp-section--tint" aria-labelledby="wp-contents">
      <div className="wp-wrap">
        <div className="wp-head">
          <Eyebrow>Contents</Eyebrow>
          <H2 id="wp-contents" a="What’s inside" b="18 pages, nine sections." />
        </div>
        <ol ref={ref} className="wp-toc" {...(seen ? { 'data-seen': '' } : {})}>
          {CONTENTS.map((c, i) => (
            <li key={c.n} style={{ '--i': i } as CSSProperties}>
              <a href={atPage(c.page)} target="_blank" rel="noopener" className="wp-toc__item">
                <span className="wp-toc__n sw-mono">{c.n}</span>
                <span className="wp-toc__body">
                  <span className="wp-toc__title">{c.title}</span>
                  <span className="wp-toc__text">{c.text}</span>
                </span>
                <span className="wp-toc__page sw-mono">p. {c.page}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ── the reader: the PDF in the page, or filling the window ── */

function Reader() {
  // "Full screen" here means filling the browser window (an in-page overlay),
  // not the native Fullscreen API that takes over the whole monitor.
  const [max, setMax] = useState(false)
  useEffect(() => {
    if (!max) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMax(false) }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [max])
  return (
    // Filling the window lifts the whole section above the site header and footer.
    <section className={`wp-section wp-section--reader${max ? ' wp-section--top' : ''}`} aria-labelledby="wp-read">
      <div className="wp-wrap">
        <div className={`wp-reader${max ? ' wp-reader--max' : ''}`}>
          <div className="wp-reader__bar">
            <h2 id="wp-read" className="sw-h3">Read it here</h2>
            <div className="wp-reader__actions">
              <a href={PDF} download={PDF_NAME} className="wp-chip">
                <ArrowDownToLine size={16} aria-hidden="true" /> Download
              </a>
              <button type="button" className="wp-chip wp-chip--solid" onClick={() => setMax(v => !v)} aria-pressed={max}>
                {max ? <Minimize2 size={16} aria-hidden="true" /> : <Maximize2 size={16} aria-hidden="true" />}
                {max ? 'Exit full screen' : 'Full screen'}
              </button>
            </div>
          </div>
          <div className="wp-reader__frame">
            <object data={PDF} type="application/pdf" aria-label="Compiled Memory white paper (PDF)">
              <p className="wp-reader__fallback">
                Your browser can’t display the PDF inside the page.{' '}
                <a href={PDF} target="_blank" rel="noopener">Open the white paper</a> instead.
              </p>
            </object>
          </div>
        </div>
        {/* Phones rarely render a PDF inside a page, so they get the file itself. */}
        <a href={PDF} target="_blank" rel="noopener" className="wp-open">
          <span className="wp-open__title">Compiled Memory <ArrowUpRight size={18} aria-hidden="true" /></span>
          <span className="wp-open__meta">Open the PDF · 18 pages · 170 KB</span>
        </a>
      </div>
    </section>
  )
}

/* ── FAQ ── */

function Faq() {
  return (
    <section className="wp-section wp-section--tint" aria-label="Frequently asked questions">
      <div className="wp-wrap">
        <div className="wp-head wp-head--center">
          <Eyebrow>FAQ</Eyebrow>
          <H2 a="Questions about the paper" />
        </div>
        <div className="sw-faq">
          {FAQ.map((e, n) => (
            <details key={e.question} {...(n === 0 ? { open: true } : {})}>
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

export function WhitepaperPage() {
  // Title, description, canonical and the article schema come from the /whitepaper route entry.
  usePageSEO()
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => { root.current?.setAttribute('data-armed', '') }, [])
  return (
    <div ref={root} className="sw-home wp">
      <Hero />
      <Divider />
      <Thesis />
      <Model />
      <Results />
      <Contents />
      <Reader />
      <Faq />
    </div>
  )
}
