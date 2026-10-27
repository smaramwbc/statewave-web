import { ArrowRight, ChevronDown, ChevronUp, History, Layers, LinkIcon, Lock, Package } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useSeen } from '../home/hooks'
import { Brand, Head, Pill, Tile } from './ui'

/** `open` is only passed on phones, where the cards collapse to their header and open one at a time. */
function Stage({ n, i, icon, kind, title, body, open, onToggle, children }: {
  n: number; i: number; icon: ReactNode; kind: string; title: string; body: string; open?: boolean; onToggle?: () => void; children: ReactNode
}) {
  const fold = open !== undefined
  const id = `pd-obj-${n}`
  return (
    <article className="pd-obj" data-open={open || undefined} style={{ ['--i' as string]: i }}>
      <div className="pd-obj__head">
        <div className="pd-obj__kind"><Tile size={40}>{icon}</Tile><span>{n}&nbsp;&nbsp;{kind}</span>{fold && (open ? <ChevronUp size={20} className="pd-obj__chev" aria-hidden="true" /> : <ChevronDown size={20} className="pd-obj__chev" aria-hidden="true" />)}</div>
        <h3>{fold ? <button type="button" className="pd-obj__toggle" aria-expanded={open} aria-controls={id} onClick={onToggle}>{title}</button> : title}</h3>
      </div>
      <p>{body}</p>
      <div id={id} className="pd-obj__ex" hidden={fold && !open}><div className="pd-obj__card">{children}</div></div>
    </article>
  )
}

/** Phones only: matches the max-width: 639px block in product.css. The server renders every card open. */
function usePhone() {
  const [phone, setPhone] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const sync = () => setPhone(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return phone
}

const Step = ({ label, i }: { label: string; i: number }) => (
  <div className="pd-obj__step" aria-hidden="true" style={{ ['--i' as string]: i }}>
    <span><ArrowRight size={18} /></span>
    {label}
  </div>
)

const TIMELINE = [
  ['14 Aug', 'Asked for invoices by email', 'Prefers email'],
  ['2 Sep', 'Moved renewal to the 14th', 'Renews on the 14th'],
  ['9 Sep', 'Duplicate charge refunded', 'Had a duplicate charge refunded'],
] as const

/** The story plays in reading order the first time it scrolls in: episode, compile, memory, rank,
 *  bundle; then the timeline fills row by row. Server HTML and reduced motion show it all at once. */
export function DomainModel() {
  const [story, storyIn] = useSeen<HTMLDivElement>()
  const [table, tableIn] = useSeen<HTMLDivElement>()
  const phone = usePhone()
  const [openCard, setOpenCard] = useState(1)
  const fold = (n: number) => (phone ? { open: openCard === n, onToggle: () => setOpenCard(openCard === n ? 0 : n) } : {})
  return (
    <section id="domain-model" className="pd-sec pd-sec--panel" aria-label="What Statewave remembers">
      <div className="sw-wrap">
        <Head
          title="What Statewave remembers"
          lede="Raw events go in, facts come out, and your agent gets a ranked bundle. Every fact links back to the event it came from."
        />

        <div ref={story} className="pd-story pd-seq" data-in={storyIn || undefined}>
          <Stage {...fold(1)} n={1} i={0} icon={<History size={20} />} kind="Episode" title="What happened" body="The raw event, saved exactly as it arrived. It is never edited.">
            <div className="pd-row"><Brand name="slack" /><b>Slack</b><span className="pd-muted pd-grow">#billing · 2 Sep</span></div>
            <q className="pd-obj__quote">Heads up, we moved our renewal to the 14th.</q>
            <div className="pd-row pd-small">
              <Lock size={13} className="pd-ok" /><span className="pd-ok pd-grow">Saved as-is</span><code className="pd-muted">7c1e04a2-…</code>
            </div>
          </Stage>
          <Step label="Compiled" i={1} />
          <Stage {...fold(2)} n={2} i={2} icon={<Layers size={20} />} kind="Memory" title="What’s true now" body="A fact Statewave learns from the episode, with a link back to it.">
            <div className="pd-row"><Pill tone="accent">Profile fact</Pill><Pill tone="ok">Active</Pill></div>
            <b className="pd-obj__fact">Plan renews on the 14th</b>
            <div className="pd-obj__old"><span>Plan renews on the 1st</span><span className="pd-warn">Replaced</span></div>
            <div className="pd-row pd-small pd-row--start">
              <LinkIcon size={13} className="pd-muted" /><span className="pd-muted">From</span><Brand name="slack" size={12} /><b>Slack, 2 Sep</b>
            </div>
          </Stage>
          <Step label="Ranked and packed" i={3} />
          <Stage {...fold(3)} n={3} i={4} icon={<Package size={20} />} kind="Bundle" title="What your agent gets" body="The best facts for the task, ranked and packed to your token budget.">
            <div className="pd-row pd-row--start"><span className="pd-muted pd-small">Task</span><b className="pd-medium">When does our plan renew?</b></div>
            <div className="pd-bitem is-top"><span>Plan renews on the 14th</span><b>21.4</b></div>
            <div className="pd-bitem"><span>Resend invoices from the portal</span><b>18.2</b></div>
            <div className="pd-bitem is-out"><span>Onboarding notes</span><b>Didn’t fit</b></div>
            <div className="pd-row pd-small"><span className="pd-muted pd-grow">Token budget</span><b className="pd-medium">1,284 / 2,000</b></div>
            <div className="pd-meter" role="img" aria-label="1,284 of 2,000 tokens used"><i style={{ width: '64.2%' }} /></div>
          </Stage>
        </div>

        <div className="pd-evs">
          <div className="pd-evs__copy">
            <h3>Episodic vs semantic memory</h3>
            <p>Episodes are the timeline of what happened. Memories are what’s true because of it. Your agent gets both in one bundle.</p>
          </div>
          <div ref={table} className="pd-card pd-evs__table pd-seq" data-in={tableIn || undefined}>
            <div className="pd-evs__h"><b>Episodic</b> <span>the timeline</span></div>
            <span />
            <div className="pd-evs__h"><b>Semantic</b> <span>what’s true now</span></div>
            {TIMELINE.map(([d, ep, fact], r) => (
              <div key={d} className="pd-evs__row" style={{ ['--r' as string]: r }}>
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
