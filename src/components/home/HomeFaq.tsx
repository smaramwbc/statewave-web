import { HOME_FAQ_ENTRIES } from '../../lib/faq'
import { Eyebrow, H2, Ln } from './ui'
import './home-c.css'

/** First five entries, the same ones the homepage FAQPage JSON-LD emits. Native <details>, with the answer
 *  directly after the question heading and the "+" ordered last visually, so
 *  crawlers pair each question with its answer. */
export function HomeFaq() {
  return (
    <section className="sw-section" aria-label="Frequently asked questions">
      <div className="sw-wrap">
        <div className="sw-faq__head">
          <Eyebrow>FAQ</Eyebrow>
          <H2 a="Frequently asked questions" />
          <p className="sw-lede">Everything you need to know about Statewave.</p>
        </div>

        <div className="sw-faq">
          {HOME_FAQ_ENTRIES.map((e, i) => (
            <details key={e.question} {...(i === 0 ? { open: true } : {})}>
              <summary>
                <span aria-hidden="true" className="sw-plus">+</span>
                <h3>{e.question}</h3>
              </summary>
              <div>
                <p>{e.answer}</p>
                {e.links && e.links.length > 0 && (
                  <ul>{e.links.map((l) => <li key={l.href}><Ln to={l.href}>{l.label}</Ln></li>)}</ul>
                )}
              </div>
            </details>
          ))}
        </div>

        <div className="sw-faq__more">
          <Ln to="/faq" className="sw-btn sw-btn--outline">All questions →</Ln>
        </div>
      </div>
    </section>
  )
}
