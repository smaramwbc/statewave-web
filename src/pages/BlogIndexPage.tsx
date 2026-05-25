import { Link } from 'react-router-dom'
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
          author: { '@type': 'Organization', name: p.meta.author },
        })),
      },
    ],
  })

  return (
    <>
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-8 sm:pb-12">
        <div className="mx-auto max-w-3xl px-5 sm:px-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">
            Blog
          </p>
          <h1 className="mt-5 text-[clamp(1.75rem,5vw,2.75rem)] font-semibold text-theme-primary tracking-[-0.02em] leading-[1.15]">
            Notes from the Statewave project
          </h1>
          <p className="mt-6 text-base sm:text-lg text-theme-secondary leading-relaxed">
            How agent memory works under the hood, deployment patterns we
            land on, and the design choices behind a Postgres-only,
            self-hosted memory runtime. Subscribe via{' '}
            <a
              href="/blog/rss.xml"
              className="text-accent hover:underline"
            >
              RSS
            </a>
            .
          </p>
        </div>
      </section>

      <Section>
        <div className="mx-auto max-w-3xl">
          {BLOG_POSTS.length === 0 ? (
            <p className="text-theme-muted">
              No posts yet — check back soon.
            </p>
          ) : (
            <ul className="space-y-5">
              {BLOG_POSTS.map((p) => (
                <li
                  key={p.meta.slug}
                  className="rounded-2xl border border-theme-border bg-surface-1 p-6 hover:border-accent/40 transition-colors"
                >
                  <Link to={blogPostUrl(p.meta.slug)} className="block">
                    <p className="text-xs text-theme-muted mb-2">
                      <time dateTime={p.meta.date}>{formatDate(p.meta.date)}</time>
                      {p.meta.tags && p.meta.tags.length > 0 && (
                        <>
                          <span className="mx-2 text-theme-border">·</span>
                          <span>{p.meta.tags.join(' · ')}</span>
                        </>
                      )}
                    </p>
                    <h2 className="text-xl sm:text-2xl font-semibold text-theme-primary leading-tight">
                      {p.meta.title}
                    </h2>
                    <p className="mt-3 text-sm sm:text-base text-theme-secondary leading-relaxed">
                      {p.meta.description}
                    </p>
                    <p className="mt-4 text-sm text-accent">
                      Read post <span aria-hidden>→</span>
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
