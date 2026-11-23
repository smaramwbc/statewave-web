import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { ArrowRight, BookOpen, Cpu, Hammer, Lightbulb } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Divider, Eyebrow } from '../components/home/ui'
import { useSeen } from '../components/home/hooks'
import { usePageSEO } from '../lib/seo'
import { BLOG_POSTS, BLOG_CATEGORIES, SERIES, blogPostUrl } from '../lib/blog'
import type { BlogCategory, BlogPost } from '../lib/blog'
import { BASE_URL } from '../lib/seo-meta'
import '../components/home/home-b.css'
import '../components/blog/blog-index.css'

/* /blog in the v8 style. An interior page: the hero ends on a straight edge and the home's cross
 * divider, not the arc, and the posts sit in a full-width tint band.
 *
 * The card image is the post's `headerImage` — that asset is pure artwork with no text baked in,
 * which is what makes it usable behind a real <h2>. The `image` (OG) asset is NOT interchangeable
 * here: it has the title and category rendered into the PNG for social feeds, so using it would
 * print the title twice and bury it in a bitmap no crawler or screen reader can read.
 *
 * The category filter is ?category=… so a filtered list can be shared, deliberately not a route:
 * /blog/category/<x> pages would multiply prerendered routes, sitemap entries and canonicals for
 * what is a browsing convenience (the canonical stays /blog). The server renders every post and the
 * query is read only after hydration, so the first client render matches; the cards a filter drops
 * stay in the DOM behind `hidden`, so a JS-less crawler still sees the full catalogue.
 *
 * Category is an editorial, visible-only taxonomy: it is not part of the BlogPosting JSON-LD on the
 * post page (that carries the post's tags as `keywords`). */

type Filter = BlogCategory | 'All'

const ICONS: Record<BlogCategory, LucideIcon> = {
  Concepts: Lightbulb,
  Engineering: Cpu,
  Guides: BookOpen,
  'Build log': Hammer,
}

const COUNTS = Object.fromEntries(
  BLOG_CATEGORIES.map((c) => [c, BLOG_POSTS.filter((p) => p.meta.category === c).length]),
) as Record<BlogCategory, number>

// Only offer a filter for a category that actually has posts — an empty filter that returns
// nothing reads as a broken page.
const ACTIVE = BLOG_CATEGORIES.filter((c) => COUNTS[c] > 0)

/** "Build log" → "build-log", the value ?category= carries. */
const slug = (c: BlogCategory) => c.toLowerCase().replace(/ /g, '-')
const BY_SLUG = new Map(ACTIVE.map((c) => [slug(c), c]))

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`
const i = (n: number) => ({ ['--i' as string]: n }) as CSSProperties

// UTC so the prerendered date and the hydrated one agree wherever the reader is.
const DATE = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })

function formatDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : DATE.format(d)
}

/* ── the filter: ?category=… The server renders every post; the query is read only after
 *    hydration, so the first client render matches. ── */

const subscribeNever = () => () => {}

function useCategoryFilter() {
  const hydrated = useSyncExternalStore(subscribeNever, () => true, () => false)
  const [picked, setPicked] = useState<Filter | null>(null)
  const fromUrl = hydrated
    ? BY_SLUG.get(new URLSearchParams(window.location.search).get('category') ?? '')
    : undefined
  const filter: Filter = picked ?? fromUrl ?? 'All'
  const select = (f: Filter) => {
    setPicked(f)
    const url = new URL(window.location.href)
    if (f === 'All') url.searchParams.delete('category')
    else url.searchParams.set('category', slug(f))
    // Keep the router's history state; only the query changes.
    window.history.replaceState(window.history.state, '', url)
  }
  return [filter, select] as const
}

/* ── hero: one tile per category, the identity graphic. A tile filters the list and jumps to it. ── */

function Hero({ onPick }: { onPick: (f: Filter) => void }) {
  return (
    <section className="sw-hero bl-hero" aria-label="Blog">
      <div className="sw-hero__beams" aria-hidden="true">
        {[[18, 24, 0.22], [34, 24, 0.12], [70, -22, 0.16], [86, -22, 0.1]].map(([l, r, o]) => (
          <i key={l} style={{ left: `${l}%`, transform: `rotate(${r}deg)`, ['--o' as string]: o }} />
        ))}
      </div>
      <div className="sw-hero__in">
        <Eyebrow dark>Blog</Eyebrow>
        <h1 className="sw-hero__title">
          Notes from the <span className="sw-hero__grad">Statewave project</span>
        </h1>
        <p className="sw-hero__sub">
          How agent memory works under the hood, deployment patterns we land on, and the design choices
          behind a Postgres-only, self-hosted memory runtime. Subscribe via{' '}
          <a href="/blog/rss.xml" className="bl-rss">RSS</a>.
        </p>
        {ACTIVE.length > 1 && (
          <ul className="bl-cats" aria-label="Browse by category">
            {ACTIVE.map((c, n) => {
              const Glyph = ICONS[c]
              return (
                <li key={c} style={i(n)}>
                  <a href="#posts" onClick={() => onPick(c)}>
                    <span className="bl-cats__box"><Glyph size={22} aria-hidden="true" /></span>
                    <span className="bl-cats__label">
                      <span className="bl-cats__name">{c}</span>
                      <span className="bl-cats__count">{plural(COUNTS[c], 'post')}</span>
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

/* ── one post ── */

function Card({ post, shown, n }: { post: BlogPost; shown: boolean; n: number }) {
  // Each card rises in once as it scrolls into view (CSS: .bl-card[data-seen]); the two cards of a
  // row are staggered by --i. A card a filter brings back that was never on screen rises in then.
  const [ref, seen] = useSeen<HTMLLIElement>()
  const { meta } = post
  return (
    <li
      ref={ref}
      hidden={!shown}
      className="bl-card"
      data-seen={seen || undefined}
      data-category={slug(meta.category)}
      style={i(n % 2)}
    >
      <Link to={blogPostUrl(meta.slug)} className="bl-card__link">
        {meta.headerImage && (
          <span className="bl-card__art">
            <img src={meta.headerImage} alt="" loading="lazy" width={1600} height={640} />
          </span>
        )}
        <div className="bl-card__body">
          <div className="bl-card__meta">
            <span className="bl-card__cat">{meta.category}</span>
            <time dateTime={meta.date}>{formatDate(meta.date)}</time>
          </div>
          <h2 className="bl-card__title">{meta.title}</h2>
          <p className="bl-card__desc">{meta.description}</p>
          <p className="bl-card__more">
            Read post <ArrowRight size={16} aria-hidden="true" />
          </p>
        </div>
      </Link>
    </li>
  )
}

/* ── the list: a sticky filter row, then every post, newest first ── */

function Posts({ filter, onPick }: { filter: Filter; onPick: (f: Filter) => void }) {
  const section = useRef<HTMLElement>(null)
  const visible = filter === 'All' ? BLOG_POSTS : BLOG_POSTS.filter((p) => p.meta.category === filter)
  // A filter whose posts are all one series links that series' own index, which reads them in order.
  const first = visible[0]?.meta.series
  const series = first && visible.every((p) => p.meta.series === first) ? SERIES[first] : null

  // Picked from the sticky row while deep in the list: bring the top of the list back, or a shorter
  // list leaves the reader looking at the footer.
  const pick = (f: Filter) => {
    onPick(f)
    const el = section.current
    if (el && el.getBoundingClientRect().top < 0) {
      const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      el.scrollIntoView({ block: 'start', behavior: still ? 'auto' : 'smooth' })
    }
  }

  // Position among the posts on show, for the stagger.
  const place = new Map(visible.map((p, k) => [p.meta.slug, k]))
  return (
    <section ref={section} id="posts" className="bl-section bl-section--tint" aria-label="Posts">
      <div className="bl-wrap">
        {BLOG_POSTS.length === 0 ? (
          <p className="bl-count">No posts yet — check back soon.</p>
        ) : (
          <>
            {ACTIVE.length > 1 && (
              <div className="bl-bar">
                <div className="bl-filters" role="group" aria-label="Filter posts by category">
                  <button type="button" aria-pressed={filter === 'All'} onClick={() => pick('All')}>
                    All <i>{BLOG_POSTS.length}</i>
                  </button>
                  {ACTIVE.map((c) => (
                    <button key={c} type="button" aria-pressed={filter === c} onClick={() => pick(c)}>
                      {c} <i>{COUNTS[c]}</i>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <p className="bl-count" aria-live="polite">
              {plural(visible.length, 'post')}
              {filter === 'All' ? ', newest first' : ` in ${filter}`}
              {series && (
                <>
                  {' · '}
                  <Link to={series.path} className="bl-series">
                    Read the {series.title} in order <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </>
              )}
            </p>
            <ul className="bl-grid">
              {BLOG_POSTS.map((p) => {
                const n = place.get(p.meta.slug)
                return <Card key={p.meta.slug} post={p} shown={n !== undefined} n={n ?? 0} />
              })}
            </ul>
          </>
        )}
      </div>
    </section>
  )
}

export function BlogIndexPage() {
  // Title, description and canonical come from the /blog entry in lib/seo-meta; the posts feed the
  // Blog JSON-LD node.
  usePageSEO({
    blogPosts: BLOG_POSTS.map((p) => ({
      title: p.meta.title,
      date: p.meta.date,
      url: `${BASE_URL}${blogPostUrl(p.meta.slug)}`,
      description: p.meta.description,
      author: p.meta.author,
    })),
  })
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => { root.current?.setAttribute('data-armed', '') }, [])
  const [filter, select] = useCategoryFilter()
  return (
    <div ref={root} className="sw-home bl">
      <Hero onPick={select} />
      <Divider />
      <Posts filter={filter} onPick={select} />
    </div>
  )
}
