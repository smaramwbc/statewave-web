import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { ArrowUpRight, Plug } from 'lucide-react'
import { Divider, Eyebrow, H2, Icon, Ln } from '../components/home/ui'
import { CHANGELOG, PRODUCTS, isProductId } from '../lib/changelog'
import type { ChangeKind, ProductId, Release, ReleaseChange } from '../lib/changelog'
import { PAGE_FAQS } from '../lib/page-faqs'
import { usePageSEO } from '../lib/seo'
import '../components/home/home-b.css'
import '../components/changelog/changelog.css'

/* /changelog in the v8 style. Every entry comes from src/lib/changelog.json, the snapshot of the
 * GitHub releases of the server, the SDKs and the connectors (npm run refresh:changelog). Nothing
 * on the page is written by hand except the copy around it: no version or date is typed here.
 * An interior page: the hero ends on a straight edge and the home's cross divider, not the arc. */

const RELEASES = CHANGELOG.releases
const PRODUCT = Object.fromEntries(PRODUCTS.map(p => [p.id, p])) as Record<ProductId, (typeof PRODUCTS)[number]>

// UTC and a fixed locale, so the server HTML and the browser print the same date.
const DAY = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
const MONTH = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
const day = (iso: string) => DAY.format(new Date(iso))

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

/** The inline markdown the notes use: `code`, **bold** and [links](https://…). Anything else stays text. */
const TOKEN = /`([^`]+)`|\*\*(.+?)\*\*|\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let k = 0
  for (const m of text.matchAll(TOKEN)) {
    if (m.index > last) out.push(text.slice(last, m.index))
    if (m[1] !== undefined) out.push(<code key={k++} className="sw-mono">{m[1]}</code>)
    else if (m[2] !== undefined) out.push(<b key={k++}>{inline(m[2])}</b>)
    else out.push(<Ln key={k++} to={m[4]}>{inline(m[3])}</Ln>)
    last = m.index + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

function Mark({ id, size = 16 }: { id: ProductId; size?: number }) {
  if (id === 'server') return <img src="/brand/icon.svg" alt="" width={size} height={size} />
  if (id === 'connectors') return <Plug size={size} aria-hidden="true" />
  return <Icon name={id} size={size} />
}

/* ── the product filter: ?product=… so a filtered list can be shared. The server renders every
 *    release; the query is read only after hydration, so the first client render matches. ── */

type Filter = ProductId | 'all'
const subscribeNever = () => () => {}

function useProductFilter() {
  const hydrated = useSyncExternalStore(subscribeNever, () => true, () => false)
  const [picked, setPicked] = useState<Filter | null>(null)
  const fromUrl = hydrated ? new URLSearchParams(window.location.search).get('product') : null
  const product: Filter = picked ?? (isProductId(fromUrl) ? fromUrl : 'all')
  const select = (p: Filter) => {
    setPicked(p)
    const url = new URL(window.location.href)
    if (p === 'all') url.searchParams.delete('product')
    else url.searchParams.set('product', p)
    // Keep the router's history state; only the query changes.
    window.history.replaceState(window.history.state, '', url)
  }
  return [product, select] as const
}

/* ── hero: the latest release of each product, as the identity graphic. A tile filters the list
 *    to that product and jumps to it. ── */

const LATEST = PRODUCTS.map(p => RELEASES.find(r => r.product === p.id && !r.prerelease)).filter(
  (r): r is Release => r !== undefined,
)

function Hero({ onPick }: { onPick: (p: Filter) => void }) {
  return (
    <section className="sw-hero cl-hero" aria-label="Changelog">
      <div className="sw-hero__beams" aria-hidden="true">
        {[[18, 24, 0.22], [34, 24, 0.12], [70, -22, 0.16], [86, -22, 0.1]].map(([l, r, o]) => (
          <i key={l} style={{ left: `${l}%`, transform: `rotate(${r}deg)`, ['--o' as string]: o }} />
        ))}
      </div>
      <div className="sw-hero__in">
        <Eyebrow dark>Changelog</Eyebrow>
        <h1 className="sw-hero__title cl-title">
          What’s new<br /> <span className="sw-hero__grad">in Statewave.</span>
        </h1>
        <p className="sw-hero__sub">
          Release notes for the server, the Python and TypeScript SDKs and the connectors, taken from their GitHub
          releases.
        </p>
        <ul className="cl-latest" aria-label="Latest releases">
          {LATEST.map(r => (
            <li key={r.product}>
              <a href="#releases" onClick={() => onPick(r.product)}>
                <span className="cl-latest__box"><Mark id={r.product} size={24} /></span>
                <span className="cl-latest__name">{PRODUCT[r.product].name}</span>
                <b className="sw-mono">{r.tag}</b>
                <time dateTime={r.date}>{day(r.date)}</time>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ── one release ── */

const KIND: Record<ChangeKind, string> = { breaking: 'Breaking', feature: 'New', security: 'Security', fix: 'Fixed', other: 'Changed' }
const KIND_ORDER: ChangeKind[] = ['breaking', 'feature', 'security', 'fix', 'other']
/** Changes shown before "Show N more". */
const SHOWN = 5

function Change({ c }: { c: ReleaseChange }) {
  return (
    <li data-kind={c.kind}>
      <span className="cl-kind">{KIND[c.kind]}</span>
      <span className="cl-change">
        {c.package && <code className="sw-mono cl-pkg">{c.package} {c.version}</code>}
        {inline(c.text)}
        {c.pr !== undefined && c.url && <> <Ln to={c.url} className="cl-pr" ariaLabel={`Pull request ${c.pr}`}>#{c.pr}</Ln></>}
      </span>
    </li>
  )
}

function Entry({ r }: { r: Release }) {
  const name = PRODUCT[r.product].name
  const changes = [...r.changes].sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind))
  const rest = changes.slice(SHOWN)
  // A package already named on a change line needs no chip of its own.
  const named = new Set(changes.map(c => c.package))
  const chips = r.packages.filter(p => !named.has(p.name))
  const bare = !r.summary && !r.notice && changes.length === 0 && chips.length === 0
  return (
    <article id={`${r.product}-${r.tag}`} className="cl-rel" data-product={r.product}>
      <div className="cl-rel__head">
        <span className="cl-prod"><span className="cl-prod__mark"><Mark id={r.product} size={14} /></span>{name}</span>
        <time dateTime={r.date}>{day(r.date)}</time>
        {r.prerelease && <span className="cl-pre">Pre-release</span>}
      </div>
      <h4 className="cl-rel__title">
        <Ln to={r.url}><span className="cl-sr">{name} </span>{r.tag}</Ln>
        {r.title && <span className="cl-rel__name">{inline(r.title)}</span>}
      </h4>
      {r.notice && <p className="cl-notice">{inline(r.notice)}</p>}
      {r.summary && <p className="cl-summary">{inline(r.summary)}</p>}
      {changes.length > 0 && (
        <ul className="cl-changes">{changes.slice(0, SHOWN).map((c, i) => <Change key={i} c={c} />)}</ul>
      )}
      {rest.length > 0 && (
        <details className="cl-more">
          <summary>Show {plural(rest.length, 'more change')}</summary>
          <ul className="cl-changes">{rest.map((c, i) => <Change key={i} c={c} />)}</ul>
        </details>
      )}
      {chips.length > 0 && (
        <ul className="cl-pkgs" aria-label="Packages">
          {chips.map(p => <li key={p.name}><code className="sw-mono">{p.name} {p.version}</code></li>)}
        </ul>
      )}
      {bare && (
        <p className="cl-quiet">
          {r.maintenance > 0
            ? `Maintenance only: ${plural(r.maintenance, 'dependency, CI or docs update')}.`
            : 'No notes were published with this release.'}
        </p>
      )}
      <div className="cl-rel__foot">
        <Ln to={r.url} className="cl-gh">Release notes on GitHub <ArrowUpRight size={14} aria-hidden="true" /></Ln>
        {!bare && r.maintenance > 0 && <span>+ {plural(r.maintenance, 'maintenance update')}</span>}
        {r.newContributors.length > 0 && (
          <span>
            First {r.newContributors.length === 1 ? 'contribution' : 'contributions'} from{' '}
            {r.newContributors.map((login, i) => (
              <span key={login}>{i > 0 && ', '}<Ln to={`https://github.com/${login}`}>@{login}</Ln></span>
            ))}
          </span>
        )}
      </div>
    </article>
  )
}

/* ── the list: a filter, then releases grouped by month, newest first ── */

const COUNTS = Object.fromEntries(PRODUCTS.map(p => [p.id, RELEASES.filter(r => r.product === p.id).length]))

function Releases({ product, onPick }: { product: Filter; onPick: (p: Filter) => void }) {
  const visible = product === 'all' ? RELEASES : RELEASES.filter(r => r.product === product)
  const months: { key: string; label: string; items: Release[] }[] = []
  for (const r of visible) {
    const key = r.date.slice(0, 7)
    let m = months.at(-1)
    if (!m || m.key !== key) months.push((m = { key, label: MONTH.format(new Date(r.date)), items: [] }))
    m.items.push(r)
  }
  const oldest = visible.at(-1)
  return (
    <section id="releases" className="cl-section cl-anchor" aria-label="Releases">
      <div className="cl-wrap">
        <div className="cl-head">
          <Eyebrow>Release notes</Eyebrow>
          <H2 a="Every release," b="newest first." />
          <p className="sw-lede">
            New features, fixes and the npm packages each release moved. Dependency, CI and docs updates are counted
            rather than listed, and every entry links to its full notes on GitHub.
          </p>
        </div>
        <div className="cl-bar">
          <div className="cl-filters" role="group" aria-label="Filter by product">
            <button type="button" aria-pressed={product === 'all'} onClick={() => onPick('all')}>
              All <i>{RELEASES.length}</i>
            </button>
            {PRODUCTS.map(p => (
              <button key={p.id} type="button" aria-pressed={product === p.id} onClick={() => onPick(p.id)}>
                <Mark id={p.id} size={14} />{p.name} <i>{COUNTS[p.id]}</i>
              </button>
            ))}
          </div>
        </div>
        <p className="cl-count" aria-live="polite">
          {plural(visible.length, 'release')}{oldest && ` since ${MONTH.format(new Date(oldest.date))}`}
        </p>
        {months.map(m => (
          <section key={m.key} className="cl-month" aria-labelledby={`cl-${m.key}`}>
            <h3 id={`cl-${m.key}`} className="cl-month__label">{m.label}</h3>
            <div className="cl-rels">
              {m.items.map(r => <Entry key={`${r.product}-${r.tag}`} r={r} />)}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}

/* ── faq ── */

/** The same entries usePageSEO emits as FAQPage JSON-LD, so the visible questions and the
 *  structured data can't drift. */
const FAQ = PAGE_FAQS['/changelog'] ?? []

function Faq() {
  return (
    <section className="cl-section cl-section--tint" aria-label="Frequently asked questions">
      <div className="cl-wrap">
        <div className="cl-head cl-head--center">
          <Eyebrow>FAQ</Eyebrow>
          <H2 a="Questions about releases" />
        </div>
        <div className="sw-faq">
          {FAQ.map((e, i) => (
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

export function ChangelogPage() {
  // Title, description and canonical come from the /changelog entry in lib/seo-meta.
  usePageSEO()
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => { root.current?.setAttribute('data-armed', '') }, [])
  const [product, select] = useProductFilter()
  return (
    <div ref={root} className="sw-home cl">
      <Hero onPick={select} />
      <Divider />
      <Releases product={product} onPick={select} />
      <Faq />
    </div>
  )
}
