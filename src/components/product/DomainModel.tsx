import { ArrowRight, History, Layers, LinkIcon, Lock, Package } from 'lucide-react'
import type { ReactNode } from 'react'
import { Brand, Head, Pill, Tile } from './ui'

function Stage({ n, icon, kind, title, body, children }: { n: number; icon: ReactNode; kind: string; title: string; body: string; children: ReactNode }) {
  return (
    <article className="pd-obj">
      <div className="pd-obj__kind"><Tile size={40}>{icon}</Tile><span>{n}&nbsp;&nbsp;{kind}</span></div>
      <h3>{title}</h3>
      <p>{body}</p>
      <div className="pd-obj__ex"><div className="pd-obj__card">{children}</div></div>
    </article>
  )
}

const Step = ({ label }: { label: string }) => (
  <div className="pd-obj__step" aria-hidden="true">
    <span><ArrowRight size={18} /></span>
    {label}
  </div>
)

const TIMELINE = [
  ['14 Aug', 'Asked for invoices by email', 'Prefers email'],
  ['2 Sep', 'Moved renewal to the 14th', 'Renews on the 14th'],
  ['9 Sep', 'Duplicate charge refunded', 'Had a duplicate charge refunded'],
] as const

export function DomainModel() {
  return (
    <section id="domain-model" className="pd-sec pd-sec--panel" aria-label="What Statewave remembers">
      <div className="sw-wrap">
        <Head
          title="What Statewave remembers"
          lede="Raw events go in, facts come out, and your agent gets a ranked bundle. Every fact links back to the event it came from."
        />

        <div className="pd-story">
          <Stage n={1} icon={<History size={20} />} kind="Episode" title="What happened" body="The raw event, saved exactly as it arrived. It is never edited.">
            <div className="pd-row"><Brand name="slack" /><b>Slack</b><span className="pd-muted pd-grow">#billing · 2 Sep</span></div>
            <q className="pd-obj__quote">Heads up, we moved our renewal to the 14th.</q>
            <div className="pd-row pd-small">
              <Lock size={13} className="pd-ok" /><span className="pd-ok pd-grow">Saved as-is</span><code className="pd-muted">ep_7c1e04a2</code>
            </div>
          </Stage>
          <Step label="Compiled" />
          <Stage n={2} icon={<Layers size={20} />} kind="Memory" title="What’s true now" body="A fact Statewave learns from the episode, with a link back to it.">
            <div className="pd-row"><Pill tone="accent">Profile fact</Pill><Pill tone="ok">Active</Pill></div>
            <b className="pd-obj__fact">Plan renews on the 14th</b>
            <div className="pd-obj__old"><span>Plan renews on the 1st</span><span className="pd-warn">Replaced</span></div>
            <div className="pd-row pd-small pd-row--start">
              <LinkIcon size={13} className="pd-muted" /><span className="pd-muted">From</span><Brand name="slack" size={12} /><b>Slack, 2 Sep</b>
            </div>
          </Stage>
          <Step label="Ranked and packed" />
          <Stage n={3} icon={<Package size={20} />} kind="Bundle" title="What your agent gets" body="The best facts for the task, ranked and packed to your token budget.">
            <div className="pd-row pd-row--start"><span className="pd-muted pd-small">Task</span><b className="pd-medium">When does our plan renew?</b></div>
            <div className="pd-bitem is-top"><span>Plan renews on the 14th</span><b>21.4</b></div>
            <div className="pd-bitem"><span>Resend invoices from the portal</span><b>18.2</b></div>
            <div className="pd-bitem is-out"><span>Duplicate INV-2291 refunded</span><b>Left out</b></div>
            <div className="pd-row pd-small"><span className="pd-muted pd-grow">Token budget</span><b className="pd-medium">1,284 / 2,000</b></div>
            <div className="pd-meter" role="img" aria-label="1,284 of 2,000 tokens used"><i style={{ width: '64.2%' }} /></div>
          </Stage>
        </div>

        <div className="pd-evs">
          <div className="pd-evs__copy">
            <h3>Episodic vs semantic memory</h3>
            <p>Episodes are the timeline of what happened. Memories are what’s true because of it. Your agent gets both in one bundle.</p>
          </div>
          <div className="pd-card pd-evs__table">
            <div className="pd-evs__h"><b>Episodic</b> <span>the timeline</span></div>
            <span />
            <div className="pd-evs__h"><b>Semantic</b> <span>what’s true now</span></div>
            {TIMELINE.map(([d, ep, fact]) => (
              <div key={d} className="pd-evs__row">
                <div className="pd-evs__ep"><span>{d}</span>{ep}</div>
                <img src="/images/product/v8/ep-connector.svg" alt="" width={24} height={10} />
                <div className="pd-evs__fact"><i />{fact}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
