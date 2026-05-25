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

export interface BlogPostFrontmatter {
  title: string
  slug: string
  date: string
  description: string
  author: string
  tags?: string[]
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
