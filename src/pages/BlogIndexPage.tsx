import { Link } from 'react-router'
import { Section } from '../components/Section'
import { usePageSEO } from '../lib/seo'
import { BLOG_POSTS, blogPostUrl } from '../lib/blog'
import { BASE_URL } from '../lib/seo-meta'

/* /blog index page.
 *
 * Renders the post list as a card grid sorted newest first. Each card
 * carries the same metadata the BlogPosting JSON-LD on the post page
 * does (title, date, description, tags) so a JS-less crawler still
 * indexes the catalogue.
 *
 * The Blog schema for the index is emitted via usePageSEO so it ends up
 * as a `data-seo="managed"` JSON-LD script in <head>. The post pages
 * each emit their own BlogPosting + BreadcrumbList.
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

export function BlogIndexPage() {
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
        <div className="mx-auto max-w-5xl px-5 sm:px-6">
          <p className="section-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75">
            Blog
          </p>

          <h1 className="font-heading text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-theme-primary sm:text-5xl md:text-[56px]">
            Notes from the Statewave project
          </h1>

          <p className="mt-6 text-base leading-relaxed text-theme-secondary sm:text-lg">
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
        <div className="mx-auto max-w-5xl">
          {BLOG_POSTS.length === 0 ? (
            <p className="text-theme-muted">No posts yet — check back soon.</p>
          ) : (
            <ul className="space-y-6">
              {BLOG_POSTS.map((p) => (
                <li
                  key={p.meta.slug}
                  className="sw-card rounded-2xl border border-brand-500/20 p-6 transition-[border-color,transform,background-color] duration-300 hover:-translate-y-0.5 hover:border-brand-500/45"
                >
                  <Link to={blogPostUrl(p.meta.slug)} className="group block">
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-[13px]">
                      <time
                        dateTime={p.meta.date}
                        className="text-theme-muted/80"
                      >
                        {formatDate(p.meta.date)}
                      </time>

                      {p.meta.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-brand-500/20 bg-brand-500/8 px-2.5 py-1 text-[11px] font-medium tracking-[0.02em] text-theme-secondary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h2 className="text-xl font-semibold leading-tight text-theme-primary sm:text-2xl">
                      {p.meta.title}
                    </h2>

                    <p className="mt-3 text-sm leading-relaxed text-theme-secondary sm:text-base">
                      {p.meta.description}
                    </p>

                    <p className="mt-4 text-sm text-accent">
                      Read post{' '}
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
            </ul>
          )}
        </div>
      </Section>
    </>
  )
}
