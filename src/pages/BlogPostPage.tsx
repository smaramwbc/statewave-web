import { useParams, Link, Navigate } from 'react-router-dom'
import { MDXProvider } from '@mdx-js/react'
import { Section } from '../components/Section'
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
  // Layout / typography for MDX-rendered post bodies. Hand-written in
  // Tailwind utilities so post markup matches the rest of the site
  // (theme-aware colors via the same data-theme variables) without
  // adding @tailwindcss/typography as a dependency.
  'text-base text-theme-secondary leading-[1.75]',
  '[&_h1]:hidden', // post h1 is rendered by the page shell, not the MDX
  '[&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-theme-primary [&_h2]:tracking-tight [&_h2]:leading-tight',
  '[&_h3]:mt-10 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-theme-primary',
  '[&_h4]:mt-8 [&_h4]:mb-2 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-theme-primary',
  // Heading-autolink anchors should be invisible until hover/focus —
  // rehype-autolink-headings wraps each heading in an <a>, which we
  // strip of any underline/color decoration.
  '[&_h2_a]:no-underline [&_h2_a]:text-theme-primary',
  '[&_h3_a]:no-underline [&_h3_a]:text-theme-primary',
  '[&_h4_a]:no-underline [&_h4_a]:text-theme-primary',
  '[&_p]:mt-5 [&_p]:mb-5',
  '[&_strong]:text-theme-primary [&_strong]:font-semibold',
  '[&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-accent-light',
  // Lists
  '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-5 [&_ul_li]:mb-2',
  '[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-5 [&_ol_li]:mb-2',
  // Inline code
  '[&_code]:rounded [&_code]:bg-surface-2 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.875em] [&_code]:font-mono [&_code]:text-theme-primary',
  // Fenced code blocks. <pre><code>... — the inner <code> inherits the
  // monospace; outer <pre> handles padding, background, overflow.
  '[&_pre]:my-6 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:bg-surface-2 [&_pre]:border [&_pre]:border-theme-border [&_pre]:overflow-x-auto [&_pre]:text-sm',
  '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-theme-secondary',
  // Tables
  '[&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm',
  '[&_th]:text-left [&_th]:px-3 [&_th]:py-2 [&_th]:border-b [&_th]:border-theme-border [&_th]:text-theme-primary [&_th]:font-semibold',
  '[&_td]:px-3 [&_td]:py-2 [&_td]:border-b [&_td]:border-theme-border',
  // Blockquote
  '[&_blockquote]:my-6 [&_blockquote]:pl-4 [&_blockquote]:border-l-2 [&_blockquote]:border-accent/40 [&_blockquote]:text-theme-muted [&_blockquote]:italic',
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
              author: { '@type': 'Organization', name: post.meta.author },
              publisher: {
                '@type': 'Organization',
                name: 'Statewave',
                url: BASE_URL,
                logo: {
                  '@type': 'ImageObject',
                  url: `${BASE_URL}/statewave_icon_dark.png`,
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
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-6">
        <div className="mx-auto max-w-3xl px-5 sm:px-6">
          <p className="text-xs text-theme-muted">
            <Link to="/blog" className="hover:text-theme-primary">
              ← Blog
            </Link>
          </p>
          <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.22em] text-accent">
            <time dateTime={post.meta.date}>{formatDate(post.meta.date)}</time>
            {post.meta.tags && post.meta.tags.length > 0 && (
              <>
                <span className="mx-2 text-theme-border">·</span>
                <span>{post.meta.tags.join(' · ')}</span>
              </>
            )}
          </p>
          <h1 className="mt-3 text-[clamp(1.75rem,5vw,2.75rem)] font-semibold text-theme-primary tracking-[-0.02em] leading-[1.15]">
            {post.meta.title}
          </h1>
          <p className="mt-5 text-base sm:text-lg text-theme-secondary leading-relaxed">
            {post.meta.description}
          </p>
          <p className="mt-4 text-xs text-theme-muted">
            By {post.meta.author}
          </p>
        </div>
      </section>

      <Section>
        <article className={`mx-auto max-w-3xl ${PROSE_CLASSES}`}>
          <MDXProvider>
            <PostBody />
          </MDXProvider>
        </article>
      </Section>

      <Section className="bg-surface-1/40">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-semibold text-theme-primary mb-2">
            More from the blog
          </h2>
          <ul className="mt-4 space-y-2">
            {BLOG_POSTS.filter((p) => p.meta.slug !== post.meta.slug)
              .slice(0, 3)
              .map((p) => (
                <li key={p.meta.slug}>
                  <Link
                    to={blogPostUrl(p.meta.slug)}
                    className="text-sm text-accent hover:underline"
                  >
                    {p.meta.title}
                  </Link>
                </li>
              ))}
          </ul>
          <p className="mt-6 text-xs text-theme-muted">
            <Link to="/blog" className="hover:text-theme-primary">
              All posts →
            </Link>
          </p>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-semibold text-theme-primary mb-4">
            Discussion
          </h2>
          <p className="text-sm text-theme-muted mb-6">
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
      </Section>
    </>
  )
}
