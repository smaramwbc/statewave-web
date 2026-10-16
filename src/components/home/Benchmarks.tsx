import { Eyebrow, H2, Ln } from './ui'
import { useSeen, useTween } from './hooks'
import './home-b.css'

const REPO = 'https://github.com/smaramwbc/statewave-memory-benchmarks'
const READS = [
  ['A real lead, not a landslide', '+0.039 over Mem0 OSS on 1,540 questions. 0.905 vs 0.899 against the paid tier is inside single-run noise.'],
  ['Only the memory backend changes', "A fork of Mem0's harness: same eval loop, judge and scoring code untouched from upstream."],
  ['Run against their best config', "Three fixes to Mem0's own client code raise Mem0's scores, and all three are applied to their backends, not withheld."],
] as const
const LOCOMO_OTHERS = [['Mem0 cloud', 0.899], ['Mem0 OSS', 0.866]] as const
const LME = [['Statewave', 0.967, true], ['Mem0 cloud (paid)', 0.933, false], ['Mem0 open source', 0.833, false]] as const

/** Bars use a 0.80–1.00 axis so the gaps are visible; the note says so. */
const zoom = (v: number, b: number) => `${Math.max(0, ((v * b - 0.8) / 0.2) * 100).toFixed(1)}%`
const fmt = (v: number, b: number) => (v * b).toFixed(3)

/** Scores count up from zero once the section scrolls into view. Every score
 *  here travels with its harness, opponents, retrieval-budget asymmetry and a
 *  link to the full methodology — see /benchmarks.
 *
 *  The figures below are hard-coded. /benchmarks (src/pages/BenchmarksPage.tsx)
 *  is the source of truth: change both together. */
export function Benchmarks() {
  const [ref, seen] = useSeen<HTMLElement>()
  const b = useTween(1, 1400, seen, 100)

  return (
    <section ref={ref} className="sw-section sw-bench-sec" aria-label="Benchmarks">
      <div className="sw-wrap">
        <Eyebrow>Benchmarks</Eyebrow>
        <H2 a="On par with Mem0's paid cloud" b="on Mem0's own harness." />
        <p className="sw-lede">
          Statewave's memory runtime scored on LoCoMo and LongMemEval with a fork of Mem0's harness, judge and scoring
          code unchanged.
        </p>

        <div className="sw-bench">
          <div className="sw-bench__left">
            <div className="sw-bench__hero">
              <span className="sw-mono sw-bench__cap">LoCoMo · n = 1,540 · LLM-judge</span>
              <div className="sw-bench__figwrap">
                <div className="sw-bench__fig">{fmt(0.905, b)}</div>
              </div>
              <div>
                <div className="sw-bench__name">Statewave</div>
                <div className="sw-bench__sub">gpt-4o answerer and judge, Mem0's judge unchanged</div>
              </div>
            </div>
            <div className="sw-bench__others">
              <div className="sw-bench__list">
                {LOCOMO_OTHERS.map(([name, v]) => (
                  <div key={name}>
                    <div className="sw-bench__row">
                      <span className="sw-bench__name">{fmt(v, b)}</span>
                      <span className="sw-bench__lbl">{name}</span>
                    </div>
                    <div className="sw-bar sw-bench__bar"><i className="sw-bar__mem0" style={{ width: zoom(v, b) }} /></div>
                  </div>
                ))}
                <div className="sw-mono sw-bench__axis">
                  <span>0.80</span><span>0.90</span><span>1.00</span>
                </div>
              </div>
              <p className="sw-bench__note">Axis zoomed to 0.80–1.00 so the real separation is visible.</p>
            </div>
          </div>

          <div className="sw-bench__right">
            <h3 className="sw-h3">Three honest reads</h3>
            <div className="sw-reads">
              {READS.map(([t, d], i) => (
                <div key={t} className="sw-read">
                  <span className="sw-mono sw-read__n">0{i + 1}</span>
                  <div>
                    <div className="sw-read__t">{t}</div>
                    <div className="sw-read__d">{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sw-lme">
          <div>
            <div className="sw-read__t">LongMemEval</div>
            <div className="sw-mono sw-lme__sub">n = 30 · directional</div>
          </div>
          {LME.map(([name, v, hot]) => (
            <div key={name} className="sw-lme__row">
              <span className={`sw-mono sw-lme__v${hot ? ' is-hot' : ''}`}>{fmt(v, b)}</span>
              <span className="sw-bar"><i className={hot ? 'sw-bar__hot' : 'sw-bar__lme'} style={{ width: zoom(v, b) }} /></span>
              <span className="sw-lme__n">{name}</span>
            </div>
          ))}
        </div>

        <div className="sw-bench__foot">
          <div className="sw-bench__meta">
            <span className="sw-mono sw-bench__m1">
              Single run · gpt-4.1 extraction · text-embedding-3-small · gpt-4o answerer and judge
            </span>
            <span className="sw-bench__m2">
              Mem0 OSS caps retrieval at ≤20 memories per query by library default, where Statewave and Mem0 cloud honor
              the harness's top-200 request.
            </span>
          </div>
          <div className="sw-bench__btns">
            <Ln to="/benchmarks" className="sw-btn sw-btn--outline">Full methodology →</Ln>
            <Ln to={REPO} className="sw-btn sw-btn--outline">Fork the harness →</Ln>
            <Ln to="/why" className="sw-btn sw-btn--outline">Compare all memory layers →</Ln>
          </div>
        </div>
      </div>
    </section>
  )
}
