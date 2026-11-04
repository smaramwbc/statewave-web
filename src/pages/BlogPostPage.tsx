import { useEffect, useRef, useState } from 'react'
import type { ComponentProps, CSSProperties, RefObject } from 'react'
import { useParams, Link, Navigate } from 'react-router'
import { MDXProvider } from '@mdx-js/react'
import { ArrowRight } from 'lucide-react'
import { ClientOnly } from '../components/ClientOnly'
import { Divider, Ln } from '../components/home/ui'
import { useSeen } from '../components/home/hooks'
import { usePageSEO } from '../lib/seo'
import { getPostBySlug, BLOG_POSTS, SERIES, blogPostUrl } from '../lib/blog'
import type { BlogPost } from '../lib/blog'
import {
  BASE_URL,
  DEFAULT_OG_IMAGE,
  breadcrumbJsonLd,
  articleJsonLd,
  faqPageJsonLd,
  supportAgentHowToJsonLd,
  AUTHOR_AVATAR_PATH,
} from '../lib/seo-meta'
import { POST_FAQ, HOWTO_SLUGS } from '../lib/blog-schema'
import { GiscusComments } from '../components/GiscusComments'
import { SeriesFrame } from '../components/SeriesFrame'
import { GuideSubscribe } from '../components/GuideSubscribe'
import '../components/home/home-b.css'
import '../components/blog/blog-post.css'

/* /blog/:slug in the v8 style: an interior hero (straight edge and the home's cross divider, not the
 * arc), the post in one reading column with an "On this page" list beside it on wide screens, the
 * comments, then more posts on a tint band. The post body is MDX; its tags are styled in
 * blog-post.css under .bp-prose, so no post source changes. The older components a post can carry
 * (Flow, GuideStack, SeriesFrame, GuideSubscribe) are Tailwind-styled: .bp remaps their theme colours
 * to the v8 palette, since the v8 pages are light by design and ignore the theme switch.
 *
 * SEO is unchanged: BlogPosting and BreadcrumbList JSON-LD, plus FAQPage and HowTo where a post has
 * them. Comments are Giscus inside ClientOnly, so the prerender ships the post without the iframe. */

/** "25 Aug 2026". UTC, so a date-only value like "2026-08-25" does not
 *  render as the 24th for a reader west of Greenwich, or during a
 *  prerender on a machine that is. */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatShort(iso: string): string {
  // Built by hand rather than with toLocaleDateString: recent ICU data
  // abbreviates September as "Sept" in en-GB, so the same post would read
  // "Sep" on one machine and "Sept" on another.
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/** "Build log" → "build-log", the value the blog index's ?category= filter reads. */
const categorySlug = (c: string) => c.toLowerCase().replace(/\s+/g, '-')

/* In-site links go through the router and external ones open in a new tab, like Ln everywhere else
 * on the site. Tables get a wrapper so a wide one scrolls inside its card instead of the page. */
const MDX_COMPONENTS = {
  a: ({ href = '', children, ...rest }: ComponentProps<'a'>) => {
    if (href.startsWith('/')) return <Link to={href} {...rest}>{children}</Link>
    if (href.startsWith('#')) return <a href={href} {...rest}>{children}</a>
    return <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>
  },
  table: (props: ComponentProps<'table'>) => <div className="bp-table"><table {...props} /></div>,
}

const BEAMS = [[18, 24, 0.22], [34, 24, 0.12], [70, -22, 0.16], [86, -22, 0.1]]

/* ── hero ── */

function Hero({ post }: { post: BlogPost }) {
  const { meta } = post
  const series = meta.series ? SERIES[meta.series] : undefined
  return (
    <section className="sw-hero bp-hero" aria-labelledby="bp-title">
      <div className="sw-hero__beams" aria-hidden="true">
        {BEAMS.map(([l, r, o]) => (
          <i key={l} style={{ left: `${l}%`, transform: `rotate(${r}deg)`, ['--o' as string]: o }} />
        ))}
      </div>
      <div className="sw-hero__in">
        <nav className="bp-crumbs" aria-label="Breadcrumb">
          <Ln to="/blog">Blog</Ln>
          {series && <><span aria-hidden="true">/</span><Ln to={series.path}>{series.title}</Ln></>}
          {!series && meta.category && (
            <><span aria-hidden="true">/</span><Ln to={`/blog?category=${categorySlug(meta.category)}`}>{meta.category}</Ln></>
          )}
        </nav>
        <h1 id="bp-title" className="sw-hero__title bp-title">{meta.title}</h1>
        <p className="sw-hero__sub bp-sub">{meta.description}</p>
        <p className="bp-meta">
          <img src={AUTHOR_AVATAR_PATH} alt="" width={28} height={28} />
          <span>{meta.author}</span>
          <span aria-hidden="true">·</span>
          {/* A series episode written up after the build says so: both dates, build first. */}
          <time dateTime={meta.date}>
            {meta.series && meta.built
              ? `Built ${formatShort(meta.built)} · written up ${formatShort(meta.date)}`
              : formatShort(meta.date)}
          </time>
        </p>
      </div>
    </section>
  )
}

/* ── on this page: the post's h2s, read from the rendered article after mount (the prerender
 *    reserves the column, so nothing shifts when it fills in), with the section in view marked ── */

interface TocItem { id: string; text: string }

function Toc({ article, slug }: { article: RefObject<HTMLElement | null>; slug: string }) {
  const [items, setItems] = useState<TocItem[]>([])
  const [active, setActive] = useState('')

  useEffect(() => {
    const el = article.current
    if (!el) return
    const heads = Array.from(el.querySelectorAll<HTMLHeadingElement>('h2[id]'))
    const id = setTimeout(() => setItems(heads.map(h => ({ id: h.id, text: h.textContent?.trim() ?? '' }))), 0)
    if (typeof IntersectionObserver === 'undefined' || heads.length === 0) return () => clearTimeout(id)
    // The last heading above the upper third of the viewport is the section being read.
    const io = new IntersectionObserver(() => {
      const line = window.innerHeight / 3
      let current = heads[0].id
      for (const h of heads) if (h.getBoundingClientRect().top <= line) current = h.id
      setActive(current)
    }, { rootMargin: '0px 0px -66% 0px', threshold: [0, 1] })
    heads.forEach(h => io.observe(h))
    return () => { clearTimeout(id); io.disconnect() }
  }, [article, slug])

  return (
    <aside className="bp-toc" aria-label="On this page">
      {items.length > 1 && (
        <>
          <p className="bp-toc__title">On this page</p>
          <ol>
            {items.map(i => (
              <li key={i.id}>
                <a href={`#${i.id}`} {...(i.id === active ? { 'aria-current': 'true' as const } : {})}>{i.text}</a>
              </li>
            ))}
          </ol>
        </>
      )}
    </aside>
  )
}

/* ── the post ── */

function Body({ post }: { post: BlogPost }) {
  const { meta } = post
  const article = useRef<HTMLElement>(null)
  const PostBody = post.Component
  return (
    <section className="bp-body" aria-label="Post">
      <div className="bp-wrap">
        {meta.headerImage && (
          <figure className="bp-cover">
            <img src={meta.headerImage} alt="" width={1600} height={640} />
          </figure>
        )}
        <div className={`bp-layout${meta.series ? ' bp-layout--solo' : ''}`}>
          {!meta.series && <Toc article={article} slug={meta.slug} />}
          <article ref={article} className={`bp-prose${meta.series ? ' bp-prose--series' : ''}`}>
            <MDXProvider components={MDX_COMPONENTS}>
              <PostBody />
            </MDXProvider>
            <SeriesFrame post={post} />
            {meta.tags && meta.tags.length > 0 && (
              <ul className="bp-tags" aria-label="Tags">
                {meta.tags.map(t => <li key={t}>{t}</li>)}
              </ul>
            )}
            {/* Series episodes get theirs from SeriesFrame, with the series wording; every other
                post gets the general one here. Never both: the form's ids are fixed. */}
            {!meta.series && (
              <div className="bp-subscribe">
                <GuideSubscribe variant="blog" />
              </div>
            )}
          </article>
        </div>
      </div>
    </section>
  )
}

/* ── discussion ── */

function Discussion({ post }: { post: BlogPost }) {
  return (
    <section className="bp-discuss" aria-labelledby="bp-discuss">
      <div className="bp-wrap">
        <div className="bp-discuss__in">
          <h2 id="bp-discuss" className="bp-discuss__title">Discussion</h2>
          <p className="bp-discuss__note">
            Comments live in GitHub Discussions on{' '}
            <a href="https://github.com/smaramwbc/statewave/discussions" target="_blank" rel="noopener noreferrer">
              smaramwbc/statewave
            </a>
            . Sign in with your GitHub account to join in.
          </p>
          <ClientOnly>
            <GiscusComments term={blogPostUrl(post.meta.slug)} theme="light" />
          </ClientOnly>
        </div>
      </div>
    </section>
  )
}

/* ── more posts: the same category first, then the newest ── */

function related(post: BlogPost): BlogPost[] {
  const others = BLOG_POSTS.filter(p => p.meta.slug !== post.meta.slug)
  const same = post.meta.category ? others.filter(p => p.meta.category === post.meta.category) : []
  const rest = others.filter(p => !same.includes(p))
  return [...same, ...rest].slice(0, 3)
}

function More({ post }: { post: BlogPost }) {
  const [ref, seen] = useSeen<HTMLUListElement>()
  return (
    <section className="bp-more" aria-labelledby="bp-more">
      <div className="bp-wrap">
        <div className="bp-more__head">
          <h2 id="bp-more" className="bp-more__title">More from the blog</h2>
          <Ln to="/blog" className="bp-more__all">All posts <ArrowRight size={16} aria-hidden="true" /></Ln>
        </div>
        <ul ref={ref} className="bp-cards" {...(seen ? { 'data-seen': '' } : {})}>
          {related(post).map(({ meta }, i) => (
            <li key={meta.slug} className="bp-card" style={{ '--i': i } as CSSProperties}>
              <Link to={blogPostUrl(meta.slug)} className="bp-card__link">
                {meta.headerImage && (
                  <span className="bp-card__art"><img src={meta.headerImage} alt="" loading="lazy" width={1600} height={640} /></span>
                )}
                <span className="bp-card__body">
                  <span className="bp-card__meta">
                    {meta.category && <span className="bp-card__cat">{meta.category}</span>}
                    <time dateTime={meta.date}>{formatShort(meta.date)}</time>
                  </span>
                  <span className="bp-card__title">{meta.title}</span>
                  <span className="bp-card__desc">{meta.description}</span>
                  <span className="bp-card__more">Read the post <ArrowRight size={16} aria-hidden="true" /></span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getPostBySlug(slug) : undefined
  const postImage = post?.meta.image ? `${BASE_URL}${post.meta.image}` : DEFAULT_OG_IMAGE
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => { root.current?.setAttribute('data-armed', '') }, [])

  // usePageSEO is called unconditionally to satisfy rules-of-hooks even
  // on the unknown-slug path. When `post` is undefined the JSON-LD list
  // is empty and we render <Navigate> instead — the unused metadata
  // never makes it to <head> because the effect's cleanup runs on
  // unmount immediately after redirect.
  usePageSEO(
    post
      ? {
        title: `${post.meta.title} — Statewave Blog`,
        description: post.meta.description,
        ogType: 'article',
        ogImage: postImage,
        ogImageAlt: post.meta.image ? post.meta.title : undefined,
        jsonLd: [
          articleJsonLd(post),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: post.meta.title, path: blogPostUrl(post.meta.slug) },
          ]),
          ...(POST_FAQ[post.meta.slug] ? [faqPageJsonLd(POST_FAQ[post.meta.slug])] : []),
          ...(HOWTO_SLUGS.includes(post.meta.slug) ? [supportAgentHowToJsonLd()] : []),
        ],
      }
      : {},
  )

  if (!post) {
    return <Navigate to="/blog" replace />
  }

  return (
    <div ref={root} className="sw-home bp">
      <Hero post={post} />
      <Divider />
      <Body post={post} />
      <Discussion post={post} />
      <More post={post} />
    </div>
  )
}
