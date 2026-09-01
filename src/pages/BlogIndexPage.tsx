import { useState } from 'react'
import { Link } from 'react-router'
import { Section } from '../components/Section'
import { usePageSEO } from '../lib/seo'
import { BLOG_POSTS, BLOG_CATEGORIES, blogPostUrl } from '../lib/blog'
import type { BlogCategory } from '../lib/blog'
import { BASE_URL } from '../lib/seo-meta'

/* /blog index page.
 *
 * Card grid, newest first, two columns. The card image is the post's
 * `headerImage` — that asset is pure artwork with no text baked in, which
 * is what makes it usable behind a real <h2>. The `image` (OG) asset is
 * NOT interchangeable here: it has the title and category rendered into
 * the PNG for social feeds, so using it would print the title twice and
 * bury it in a bitmap no crawler or screen reader can read.
 *
 * The category filter is client-side state, deliberately not a route.
 * /blog/category/<x> pages would multiply prerendered routes, sitemap
 * entries and canonicals for what is a browsing convenience — and the
 * full catalogue stays in the DOM behind `hidden`, so a JS-less crawler
 * still sees every post.
 *
 * Each card carries the same metadata the BlogPosting JSON-LD on the post
 * page does (title, date, description, category).
 */

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

type Filter = 'All' | BlogCategory

export function BlogIndexPage() {
  const [filter, setFilter] = useState<Filter>('All')

  // Only offer a chip for a category that actually has posts — an empty
  // filter that returns nothing reads as a broken page.
  const active = BLOG_CATEGORIES.filter((c) =>
    BLOG_POSTS.some((p) => p.meta.category === c),
  )
  const filters: Filter[] = ['All', ...active]

  usePageSEO({
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'Statewave blog',
        url: `${BASE_URL}/blog`,
        description:
          'Notes from the Statewave project — memory infrastructure for AI agents, deployment patterns, and how the runtime works under the hood.',
        publisher: { '@type': 'Organization', name: 'Statewave', url: BASE_URL },
        blogPost: BLOG_POSTS.map((p) => ({
          '@type': 'BlogPosting',
          headline: p.meta.title,
          datePublished: p.meta.date,
          url: `${BASE_URL}${blogPostUrl(p.meta.slug)}`,
          description: p.meta.description,
          author: {
            '@type': 'Organization',
            name: p.meta.author,
            url: `${BASE_URL}/about`,
          },
        })),
      },
    ],
  })

  return (
    <>
      <section className="relative pt-28 sm:pt-32 md:pt-36">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            Blog
          </p>

          <h1 className="font-heading text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-theme-primary sm:text-5xl md:text-[56px]">
            Notes from the Statewave project
          </h1>

          <p className="mt-6 max-w-3xl text-base leading-relaxed text-theme-secondary sm:text-lg">
            How agent memory works under the hood, deployment patterns we land on,
            and the design choices behind a Postgres-only, self-hosted memory
            runtime. Subscribe via{' '}
            <a href="/blog/rss.xml" className="text-accent hover:underline">
              RSS
            </a>
            .
          </p>
        </div>
      </section>

      <Section>
        <div className="mx-auto max-w-6xl">
          {BLOG_POSTS.length === 0 ? (
            <p className="text-theme-muted">No posts yet — check back soon.</p>
          ) : (
            <>
              <div
                role="group"
                aria-label="Filter posts by category"
                className="mb-10 flex flex-wrap gap-2"
              >
                {filters.map((f) => {
                  const isOn = filter === f
                  return (
                    <button
                      key={f}
                      type="button"
                      aria-pressed={isOn}
                      onClick={() => setFilter(f)}
                      className={`rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors duration-200 ${
                        isOn
                          ? 'border-brand-500/60 bg-brand-500/15 text-theme-primary'
                          : 'border-brand-500/20 bg-brand-500/[0.04] text-theme-secondary hover:border-brand-500/40 hover:text-theme-primary'
                      }`}
                    >
                      {f}
                    </button>
                  )
                })}
              </div>

              <ul className="grid gap-6 md:grid-cols-2 md:gap-7">
                {BLOG_POSTS.map((p) => {
                  const shown = filter === 'All' || p.meta.category === filter
                  return (
                    <li
                      key={p.meta.slug}
                      hidden={!shown}
                      /* Both the attribute (semantics, and a JS-less
                         crawler reads the full catalogue) and the class:
                         the UA's [hidden] rule loses to the `display:
                         list-item` these <li>s compute to, so the
                         attribute alone does not hide them. */
                      className={`sw-card overflow-hidden rounded-2xl border border-brand-500/20 bg-surface-1/45 transition-[border-color,transform,background-color] duration-300 hover:-translate-y-0.5 hover:border-brand-500/45 ${shown ? '' : 'hidden'}`}
                    >
                      <Link
                        to={blogPostUrl(p.meta.slug)}
                        className="group flex h-full flex-col"
                      >
                        {p.meta.headerImage && (
                          <img
                            src={p.meta.headerImage}
                            alt=""
                            aria-hidden="true"
                            loading="lazy"
                            width={1600}
                            height={640}
                            className="aspect-[5/2] w-full object-cover"
                          />
                        )}

                        <div className="flex flex-1 flex-col p-6">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            {p.meta.category && (
                              <span className="section-eyebrow text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-500/75">
                                {p.meta.category}
                              </span>
                            )}
                            <time
                              dateTime={p.meta.date}
                              className="text-[13px] text-theme-muted/80"
                            >
                              {formatDate(p.meta.date)}
                            </time>
                          </div>

                          <h2 className="mt-3 font-heading text-xl font-semibold leading-tight text-theme-primary sm:text-2xl">
                            {p.meta.title}
                          </h2>

                          <p className="mt-3 text-sm leading-relaxed text-theme-secondary">
                            {p.meta.description}
                          </p>

                          <p className="mt-5 text-sm text-accent">
                            Read post{' '}
                            <span
                              aria-hidden
                              className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                            >
                              →
                            </span>
                          </p>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </div>
      </Section>
    </>
  )
}
