import { useParams, Link, Navigate } from 'react-router'
import { MDXProvider } from '@mdx-js/react'
import { ClientOnly } from '../components/ClientOnly'
import { usePageSEO } from '../lib/seo'
import { getPostBySlug, BLOG_POSTS, blogPostUrl } from '../lib/blog'
import { BASE_URL, breadcrumbJsonLd } from '../lib/seo-meta'
import { GiscusComments } from '../components/GiscusComments'

/* /blog/:slug post page.
 *
 * The MDX-compiled post body is rendered inside an <article> with a
 * `prose-style` class set we hand-write in Tailwind utilities so the
 * styling matches the rest of the site without pulling in @tailwindcss/
 * typography (one more dep, one more variant to keep in sync). The
 * MDXProvider lets us replace specific tags (e.g. <a> → React-Router
 * <Link> for in-site hrefs) without changing the post sources.
 *
 * SEO: per-post BlogPosting JSON-LD + BreadcrumbList for the post page.
 * Comments are Giscus, wrapped in ClientOnly so SSR / prerender ships
 * the post markup without the Giscus iframe (which is browser-only and
 * would otherwise stall hydration on the third-party script load).
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

const PROSE_CLASSES = [
  // Base typography
  'text-base leading-[1.75] text-theme-secondary',

  // The page already renders the title
  '[&_h1]:hidden',

  // Headings
  '[&_h2]:scroll-mt-28 [&_h2]:mt-14 [&_h2]:mb-5 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:leading-tight [&_h2]:text-theme-primary',
  '[&_h3]:scroll-mt-28 [&_h3]:mt-10 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-theme-primary',
  '[&_h4]:scroll-mt-28 [&_h4]:mt-8 [&_h4]:mb-2 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-theme-primary',

  // Heading permalink anchors
  '[&_h2_a]:no-underline [&_h2_a]:text-theme-primary [&_h2_a:hover]:text-theme-primary',
  '[&_h3_a]:no-underline [&_h3_a]:text-theme-primary [&_h3_a:hover]:text-theme-primary',
  '[&_h4_a]:no-underline [&_h4_a]:text-theme-primary [&_h4_a:hover]:text-theme-primary',

  // Paragraphs
  '[&_p]:my-5',

  // Strong
  '[&_strong]:font-semibold [&_strong]:text-theme-primary',

  // Links
  '[&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-accent-light',

  // Lists
  '[&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6',
  '[&_ul_li]:mb-2',
  '[&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6',
  '[&_ol_li]:mb-2',

  // Inline code
  '[&_code]:rounded [&_code]:bg-surface-2 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.875em] [&_code]:text-theme-primary',

  // Code blocks
  '[&_pre]:my-8 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-theme-border [&_pre]:bg-surface-2 [&_pre]:p-4 [&_pre]:text-sm',
  '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-theme-secondary',

  // Tables
  '[&_table]:my-8 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm',
  '[&_th]:border-b [&_th]:border-theme-border [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-theme-primary',
  '[&_td]:border-b [&_td]:border-theme-border [&_td]:px-3 [&_td]:py-2',

  // Images
  '[&_img]:my-8 [&_img]:rounded-2xl [&_img]:border [&_img]:border-theme-border',

  // Blockquotes
  '[&_blockquote]:my-8 [&_blockquote]:border-l-2 [&_blockquote]:border-accent/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-theme-muted',

  // Horizontal rule
  '[&_hr]:my-10 [&_hr]:border-theme-border',
].join(' ')

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getPostBySlug(slug) : undefined
  const url = post ? `${BASE_URL}${blogPostUrl(post.meta.slug)}` : ''

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
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.meta.title,
            description: post.meta.description,
            datePublished: post.meta.date,
            dateModified: post.meta.date,
            url,
            author: {
              '@type': 'Organization',
              name: post.meta.author,
              url: `${BASE_URL}/about`,
            },
            publisher: {
              '@type': 'Organization',
              name: 'Statewave',
              url: BASE_URL,
              logo: {
                '@type': 'ImageObject',
                url: `${BASE_URL}/brand/icon.svg`,
              },
            },
            mainEntityOfPage: { '@type': 'WebPage', '@id': url },
            keywords: post.meta.tags?.join(', '),
            image: `${BASE_URL}/og-image.png`,
          },
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: post.meta.title, path: blogPostUrl(post.meta.slug) },
          ]),
        ],
      }
      : {},
  )

  if (!post) {
    return <Navigate to="/blog" replace />
  }

  const PostBody = post.Component

  return (
    <>
      <section className="relative pt-28 sm:pt-32 md:pt-36">
        <div className="mx-auto max-w-5xl px-5 sm:px-6">
          <div className="sw-card rounded-2xl border border-brand-500/20 bg-surface-1/45 p-6 sm:p-8 md:p-10">
            <p className="text-xs text-theme-muted">
              <Link
                to="/blog"
                className="transition-colors duration-200 hover:text-theme-primary"
              >
                ← Blog
              </Link>
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-2">
              <time
                dateTime={post.meta.date}
                className="section-eyebrow text-xs font-semibold uppercase tracking-[0.18em] text-brand-500/75"
              >
                {formatDate(post.meta.date)}
              </time>

              {post.meta.tags?.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-brand-500/20 bg-brand-500/8 px-2.5 py-1 text-[11px] font-medium tracking-[0.02em] text-theme-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="mt-6 max-w-4xl font-heading text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.05] tracking-[-0.035em] text-theme-primary">
              {post.meta.title}
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-relaxed text-theme-secondary sm:text-lg">
              {post.meta.description}
            </p>

            <p className="mt-6 text-xs text-theme-muted">
              By {post.meta.author}
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 pt-8 sm:px-6 sm:pt-12">
        <article className={`mx-auto max-w-4xl ${PROSE_CLASSES}`}>
          <MDXProvider>
            <PostBody />
          </MDXProvider>
        </article>
      </section>

      <section className="bg-surface-1/40 px-5 pb-10 pt-12 sm:px-6 sm:pb-12 sm:pt-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 font-heading text-2xl font-semibold text-theme-primary">
            More from the blog
          </h2>

          <ul className="grid gap-4 md:grid-cols-3">
            {BLOG_POSTS.filter((p) => p.meta.slug !== post.meta.slug)
              .slice(0, 3)
              .map((p) => (
                <li
                  key={p.meta.slug}
                  className="sw-card rounded-2xl border border-brand-500/20 bg-surface-1/45 p-5 transition-[border-color,transform,background-color] duration-300 hover:-translate-y-0.5 hover:border-brand-500/45"
                >
                  <Link
                    to={blogPostUrl(p.meta.slug)}
                    className="group flex h-full flex-col"
                  >
                    <time
                      dateTime={p.meta.date}
                      className="text-[11px] text-theme-muted/80"
                    >
                      {formatDate(p.meta.date)}
                    </time>

                    <h3 className="mt-3 font-heading text-base font-semibold leading-snug text-theme-primary">
                      {p.meta.title}
                    </h3>

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

          <p className="mt-6 text-xs text-theme-muted">
            <Link
              to="/blog"
              className="transition-colors duration-200 hover:text-theme-primary"
            >
              All posts →
            </Link>
          </p>
        </div>
      </section>

      <section className="px-5 pb-20 pt-10 sm:px-6 sm:pt-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-4 font-heading text-2xl font-semibold text-theme-primary">
            Discussion
          </h2>

          <p className="mb-6 text-sm leading-relaxed text-theme-muted">
            Comments are powered by GitHub Discussions on{' '}
            <a
              href="https://github.com/smaramwbc/statewave/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              smaramwbc/statewave
            </a>
            . Sign in with your GitHub account to comment.
          </p>

          <ClientOnly>
            <GiscusComments term={blogPostUrl(post.meta.slug)} />
          </ClientOnly>
        </div>
      </section>
    </>
  )
}
