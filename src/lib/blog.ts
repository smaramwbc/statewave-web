import type { ComponentType } from 'react'

/*
 * Blog loader — reads every .mdx file under src/content/blog/, pulls the
 * `frontmatter` named export (supplied by remark-mdx-frontmatter) and the
 * `default` export (the compiled React component), and exposes them as a
 * single sorted list plus a slug-keyed lookup.
 *
 * Eager glob: the post body is part of the route chunk, not a separate
 * fetch. That's fine for small numbers of posts and what we want for the
 * prerender pipeline (the build-time renderer needs synchronous access).
 * If the post count grows past ~50, switch to a lazy glob keyed by slug
 * and prefetch on the index page.
 *
 * Front-matter shape is enforced at load time — any post missing a
 * required field throws synchronously, so a typo in a .mdx file fails
 * the build instead of shipping a half-broken card on the index.
 */

/** The editorial categories a post can carry — the eyebrow on its card and
 *  the axis the blog index filters on. Adding one here is the only place it
 *  needs to be declared; validate() rejects anything else. */
export const BLOG_CATEGORIES = [
  'Concepts',
  'Engineering',
  'Guides',
  'Build log',
] as const

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]

/** Series registry. A series is an ordered run of posts with a permanent
 *  index page of its own — the spine that turns N posts into one thing.
 *  Deliberately a different axis from a category: a category groups, a
 *  series also orders. */
export const SERIES = {
  'statewave-guide': {
    title: 'Statewave Guide',
    /** Label used where an episode needs naming, e.g. "Day 0". */
    episodeLabel: (n: number) => `Day ${n}`,
    path: '/blog/statewave-guide',
  },
} as const

export type SeriesId = keyof typeof SERIES

export interface BlogPostFrontmatter {
  title: string
  slug: string
  date: string
  description: string
  author: string
  tags?: string[]
  /** Site-relative path to this post's own social-share image (e.g.
   *  "/blog/my-post/cover.png"). Optional — falls back to the site-wide
   *  default OG image (DEFAULT_OG_IMAGE in lib/seo-meta.ts) when unset. */
  image?: string
  /** Editorial category, validated against BLOG_CATEGORIES at load time so a
   *  typo fails the build instead of silently creating a one-post category
   *  nothing links to. Optional while older posts are backfilled. */
  category?: BlogCategory

  /** Series this post belongs to, e.g. 'statewave-guide'. Requires
   *  `episode`. */
  series?: SeriesId
  /** Position within `series`, counted the way the series counts (for the
   *  Statewave Guide that's the build day, not a post counter, so gaps are
   *  honest). Required whenever `series` is set. */
  episode?: number
  /** Site-relative path to this post's banner image, shown inline at the
   *  top of the post itself (below the title card, above the article
   *  body). Separate from `image` (the OG/social-share card) because the
   *  two can reasonably differ — this one renders on the page, `image`
   *  never does. Optional — posts without one just skip the banner. */
  headerImage?: string
}

export interface BlogPost {
  meta: BlogPostFrontmatter
  Component: ComponentType
}

type MdxModule = {
  default: ComponentType
  frontmatter?: Partial<BlogPostFrontmatter>
}

const REQUIRED_FIELDS: (keyof BlogPostFrontmatter)[] = [
  'title',
  'slug',
  'date',
  'description',
  'author',
]

function validate(filePath: string, fm: Partial<BlogPostFrontmatter> | undefined): BlogPostFrontmatter {
  if (!fm) {
    throw new Error(`Blog post ${filePath} is missing a frontmatter block.`)
  }
  const missing = REQUIRED_FIELDS.filter((k) => !fm[k])
  if (missing.length > 0) {
    throw new Error(
      `Blog post ${filePath} is missing required frontmatter fields: ${missing.join(', ')}.`,
    )
  }

  if (fm.category && !BLOG_CATEGORIES.includes(fm.category)) {
    throw new Error(
      `Blog post ${filePath} has unknown category "${fm.category}". ` +
        `Known categories: ${BLOG_CATEGORIES.join(', ')}.`,
    )
  }

  // A series member without a position can't be ordered, and a position
  // without a series has nothing to be ordered within. Both are typos.
  if (fm.series && !(fm.series in SERIES)) {
    throw new Error(
      `Blog post ${filePath} declares unknown series "${fm.series}". ` +
        `Known series: ${Object.keys(SERIES).join(', ')}.`,
    )
  }
  if (fm.series && !Number.isFinite(fm.episode)) {
    throw new Error(
      `Blog post ${filePath} is in series "${fm.series}" but has no numeric ` +
        `\`episode\`. Every episode needs its position in the run.`,
    )
  }
  if (fm.episode !== undefined && !fm.series) {
    throw new Error(
      `Blog post ${filePath} sets \`episode\` but no \`series\` — an episode ` +
        `number only means something inside a series.`,
    )
  }

  return fm as BlogPostFrontmatter
}

const modules = import.meta.glob<MdxModule>('../content/blog/*.mdx', {
  eager: true,
})

export const BLOG_POSTS: readonly BlogPost[] = Object.entries(modules)
  .map(([filePath, mod]) => ({
    meta: validate(filePath, mod.frontmatter),
    Component: mod.default,
  }))
  // Newest first. ISO date strings sort lexicographically.
  .sort((a, b) => (a.meta.date < b.meta.date ? 1 : a.meta.date > b.meta.date ? -1 : 0))

const bySlug = new Map<string, BlogPost>(BLOG_POSTS.map((p) => [p.meta.slug, p]))

export function getPostBySlug(slug: string): BlogPost | undefined {
  return bySlug.get(slug)
}

export function blogPostUrl(slug: string): string {
  return `/blog/${slug}`
}

/** Every published episode of `seriesId`, oldest first — the reading order
 *  a journey index wants, which is the reverse of BLOG_POSTS' newest-first
 *  sort. Episodes are ordered by their declared number, not by date, so a
 *  backfilled or re-dated episode still lands in the right place. */
export function getSeriesPosts(seriesId: SeriesId): readonly BlogPost[] {
  return BLOG_POSTS.filter((p) => p.meta.series === seriesId).sort(
    (a, b) => (a.meta.episode ?? 0) - (b.meta.episode ?? 0),
  )
}
