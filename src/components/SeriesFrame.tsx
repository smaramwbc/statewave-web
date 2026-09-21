import { Link } from 'react-router'
import { SERIES, getSeriesPosts, blogPostUrl } from '../lib/blog'
import type { BlogPost } from '../lib/blog'
import { GuideSubscribe } from './GuideSubscribe'

/* The standing frame under every series episode: where this day lives in
 * the repository, the episodes either side of it, and the Statewave
 * footer.
 *
 * It is a template rather than text in each post for two reasons.
 *
 * The footer is specified as "identical on every post — strike here =
 * strike everywhere". Written into sixteen .mdx files it would be sixteen
 * places to keep identical; here it is one.
 *
 * And the neighbours are computed from what has actually been published.
 * Episodes go out days apart, so a hand-written "Next:" link on Monday's
 * post points at Wednesday's — which does not exist yet and would
 * redirect to /blog for two days. Here "Next" appears only once there is
 * a next, and the whole site rebuilds when it is merged, so Monday's post
 * picks the link up without being touched.
 */

function label(p: BlogPost): string {
  // "Statewave Guide — Day 0: The Beginning" → "Day 0 — The Beginning"
  return p.meta.title.replace(/^Statewave Guide — /, '').replace(/: /, ' — ')
}

export function SeriesFrame({ post }: { post: BlogPost }) {
  const id = post.meta.series
  if (!id) return null

  const run = getSeriesPosts(id)
  const i = run.findIndex((p) => p.meta.slug === post.meta.slug)
  const prev = i > 0 ? run[i - 1] : undefined
  const next = i >= 0 && i < run.length - 1 ? run[i + 1] : undefined

  const parts: React.ReactNode[] = []
  if (post.meta.repoUrl && post.meta.repoLabel) {
    parts.push(
      <span key="repo">
        This day in the repo:{' '}
        <a href={post.meta.repoUrl} target="_blank" rel="noopener noreferrer">
          {post.meta.repoLabel}
        </a>
      </span>,
    )
  }
  if (prev) {
    parts.push(
      <span key="prev">
        Previous: <Link to={blogPostUrl(prev.meta.slug)}>{label(prev)}</Link>
      </span>,
    )
  }
  if (next) {
    parts.push(
      <span key="next">
        Next: <Link to={blogPostUrl(next.meta.slug)}>{label(next)}</Link>
      </span>,
    )
  }

  return (
    <>
      {parts.length > 0 && (
        <p className="italic">
          {parts.map((part, k) => (
            <span key={k}>
              {k > 0 && ' · '}
              {part}
            </span>
          ))}
        </p>
      )}

      <GuideSubscribe />

      <hr />

      <p className="italic">
        {SERIES[id].title} is built on <strong>Statewave</strong> — an
        open-source, self-hosted memory runtime for AI agents. Governance and
        provenance, not just retrieval. Apache 2.0.
        <br />→{' '}
        <a href="https://statewave.ai" target="_blank" rel="noopener noreferrer">
          statewave.ai
        </a>{' '}
        ·{' '}
        <a
          href="https://github.com/smaramwbc/statewave"
          target="_blank"
          rel="noopener noreferrer"
        >
          github.com/smaramwbc/statewave
        </a>
      </p>

      <p className="italic">
        Every post in this series:{' '}
        <Link to={SERIES[id].path}>The {SERIES[id].title} Journey Index</Link>
      </p>
    </>
  )
}
