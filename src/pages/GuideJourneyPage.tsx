import { Link } from 'react-router'
import { Section } from '../components/Section'
import { usePageSEO } from '../lib/seo'
import { SERIES, getSeriesPosts, blogPostUrl } from '../lib/blog'
import { BASE_URL, PAGE_META, breadcrumbJsonLd } from '../lib/seo-meta'

/* /blog/statewave-guide — the Journey Index for the Statewave Guide series.
 *
 * This page is the spine of the series: a permanent, ordered list of every
 * episode. Each episode links back here, which is what turns N posts into
 * one story rather than N posts that happen to share a tag.
 *
 * It is a STATIC route and must stay declared ahead of /blog/:slug — the
 * slug 'statewave-guide' is deliberately not a post, so without this page
 * the link every episode carries would fall through to the post route and
 * redirect to /blog.
 *
 * Episode order comes from getSeriesPosts() (ascending by declared episode
 * number, not by date), so a re-dated or backfilled episode still reads in
 * build order.
 */

const SERIES_ID = 'statewave-guide'
const SERIES_ROUTE = '/blog/statewave-guide' as const

/* The four running threads of the series. Every episode advances at least
 * one of them; they double as the post tags, which is how an episode's
 * threads stay visible on the post page itself. */
const THREADS = [
  {
    tag: '#source-of-truth',
    body: 'The code as documentation — routes, forms, schemas and git history read as product knowledge.',
  },
  {
    tag: '#memory',
    body: 'The assistant remembering the user across sessions, so it stops explaining the same thing twice.',
  },
  {
    tag: '#guidance',
    body: 'Actually pointing at things inside the live UI, rather than describing where they are.',
  },
  {
    tag: '#trust',
    body: 'Permissions, being wrong, and the things it must never do.',
  },
] as const

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function GuideJourneyPage() {
  const series = SERIES[SERIES_ID]
  const episodes = getSeriesPosts(SERIES_ID)
  const url = `${BASE_URL}${series.path}`

  // Title and description come from the route table rather than being
  // written again here: PAGE_META is the single source of truth the
  // sitemap, the prerenderer and the per-route SEO test all read, and a
  // second copy of the same sentence only exists to drift out of sync.
  const page = PAGE_META[SERIES_ROUTE]

  usePageSEO({
    title: page.title,
    description: page.description,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Statewave Guide — the Journey Index',
        url,
        description:
          'Every episode of the Statewave Guide build journey, in order.',
        isPartOf: { '@type': 'Blog', name: 'Statewave blog', url: `${BASE_URL}/blog` },
        hasPart: episodes.map((p) => ({
          '@type': 'BlogPosting',
          headline: p.meta.title,
          datePublished: p.meta.date,
          url: `${BASE_URL}${blogPostUrl(p.meta.slug)}`,
          description: p.meta.description,
        })),
      },
      breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Blog', path: '/blog' },
        { name: 'Statewave Guide', path: series.path },
      ]),
    ],
  })

  return (
    <>
      <section className="relative pt-28 sm:pt-32 md:pt-36">
        <div className="mx-auto max-w-5xl px-5 sm:px-6">
          <p className="text-xs text-theme-muted">
            <Link
              to="/blog"
              className="transition-colors duration-200 hover:text-theme-primary"
            >
              ← Blog
            </Link>
          </p>

          <p className="section-eyebrow mb-4 mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            {series.title}
          </p>

          <h1 className="font-heading text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-theme-primary sm:text-5xl md:text-[56px]">
            The Journey Index
          </h1>

          <p className="mt-6 max-w-3xl text-base leading-relaxed text-theme-secondary sm:text-lg">
            We're building a help chat that actually understands the product — by
            reading the codebase, not a wiki — and we're showing the whole build,
            including the parts that didn't work. Every episode lands here, in
            order.
          </p>
        </div>
      </section>

      <Section>
        <div className="mx-auto max-w-5xl">
          <h2 className="font-heading text-2xl font-semibold text-theme-primary">
            Episodes
          </h2>

          {episodes.length === 0 ? (
            <p className="mt-6 text-theme-muted">
              The first episode goes up shortly.
            </p>
          ) : (
            <ol className="mt-6 space-y-4">
              {episodes.map((p) => (
                <li
                  key={p.meta.slug}
                  className="sw-card rounded-2xl border border-brand-500/20 bg-surface-1/45 p-6 transition-[border-color,transform,background-color] duration-300 hover:-translate-y-0.5 hover:border-brand-500/45"
                >
                  <Link to={blogPostUrl(p.meta.slug)} className="group block">
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <span className="font-heading text-lg font-bold tracking-tight text-theme-primary">
                        {series.episodeLabel(p.meta.episode ?? 0)}
                      </span>
                      <time
                        dateTime={p.meta.date}
                        className="text-[13px] text-theme-muted/80"
                      >
                        {formatDate(p.meta.date)}
                      </time>
                    </div>

                    <h3 className="mt-3 font-heading text-xl font-semibold leading-tight text-theme-primary sm:text-2xl">
                      {p.meta.title}
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-theme-secondary sm:text-base">
                      {p.meta.description}
                    </p>

                    <p className="mt-4 text-sm text-accent">
                      Read episode{' '}
                      <span
                        aria-hidden
                        className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </p>
                  </Link>
                </li>
              ))}
            </ol>
          )}

          <h2 className="mt-16 font-heading text-2xl font-semibold text-theme-primary">
            The running threads
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-theme-secondary sm:text-base">
            Every episode advances at least one of these.
          </p>

          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {THREADS.map((t) => (
              <li
                key={t.tag}
                className="rounded-2xl border border-brand-500/25 bg-brand-500/[0.05] p-6"
              >
                <p className="font-mono text-sm font-semibold text-theme-primary">
                  {t.tag}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-theme-secondary">
                  {t.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </>
  )
}
