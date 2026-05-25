/*
 * Generates dist/blog/rss.xml from the published blog posts. Uses the
 * `feed` library (~6 kB) so the XML escaping / Atom / JSON Feed
 * generation is handled correctly without hand-rolling a templater that
 * eventually breaks on a post title with an apostrophe in it.
 *
 * The feed is RSS 2.0 (most readers); we also emit Atom and JSON Feed
 * because the cost is one line each and any modern feed reader prefers
 * one of those formats. All three live under dist/blog/ so the URLs are
 * /blog/rss.xml, /blog/atom.xml, /blog/feed.json.
 *
 * Page <head>'s <link rel="alternate"> announcements live on the blog
 * index page so feed readers find them after a visit.
 */

import { Feed } from 'feed'
import { writeFile, mkdir } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const DIST = path.resolve('dist')
const SSR_DIST = path.resolve('dist-ssr')

export async function generateRss() {
  const entryUrl = pathToFileURL(path.join(SSR_DIST, 'entry.server.js')).href
  const { BLOG_POSTS, blogPostUrl, BASE_URL } = await import(entryUrl)

  const feed = new Feed({
    title: 'Statewave blog',
    description:
      'Notes from the Statewave project — memory infrastructure for AI agents, deployment patterns, and design choices behind a Postgres-only self-hosted memory runtime.',
    id: `${BASE_URL}/blog`,
    link: `${BASE_URL}/blog`,
    language: 'en',
    image: `${BASE_URL}/og-image.png`,
    favicon: `${BASE_URL}/favicon.svg`,
    copyright: `Statewave, ${new Date().getUTCFullYear()}. Apache-2.0.`,
    updated: BLOG_POSTS.length > 0 ? new Date(BLOG_POSTS[0].meta.date) : new Date(),
    feedLinks: {
      rss: `${BASE_URL}/blog/rss.xml`,
      atom: `${BASE_URL}/blog/atom.xml`,
      json: `${BASE_URL}/blog/feed.json`,
    },
    author: { name: 'Statewave team', link: BASE_URL },
  })

  for (const post of BLOG_POSTS) {
    const url = `${BASE_URL}${blogPostUrl(post.meta.slug)}`
    feed.addItem({
      title: post.meta.title,
      id: url,
      link: url,
      description: post.meta.description,
      content: post.meta.description,
      author: [{ name: post.meta.author }],
      date: new Date(post.meta.date),
      category: post.meta.tags?.map((name) => ({ name })),
    })
  }

  await mkdir(path.join(DIST, 'blog'), { recursive: true })
  await writeFile(path.join(DIST, 'blog', 'rss.xml'), feed.rss2(), 'utf-8')
  await writeFile(path.join(DIST, 'blog', 'atom.xml'), feed.atom1(), 'utf-8')
  await writeFile(path.join(DIST, 'blog', 'feed.json'), feed.json1(), 'utf-8')

  console.log(
    `Generated blog/{rss.xml, atom.xml, feed.json} — ${BLOG_POSTS.length} items`,
  )
}

const isDirectRun = import.meta.url === pathToFileURL(process.argv[1]).href
if (isDirectRun) {
  generateRss().catch((err) => {
    console.error('RSS generation failed:', err)
    process.exit(1)
  })
}
