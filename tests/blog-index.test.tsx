/**
 * /blog's category filter. The prerendered page lists every post whatever
 * ?category= says (the server never sees the query), and the client applies
 * the query only after hydration, so the two renders match. A shared link to
 * /blog?category=… still opens on the filtered list.
 */
import { describe, expect, it, afterEach } from 'vitest'
import { act } from 'react'
import { renderToString } from 'react-dom/server'
import { hydrateRoot } from 'react-dom/client'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { BlogIndexPage } from '../src/pages/BlogIndexPage'
import { BLOG_POSTS, BLOG_CATEGORIES } from '../src/lib/blog'

const page = () => (
  <MemoryRouter initialEntries={['/blog']}>
    <BlogIndexPage />
  </MemoryRouter>
)

/** data-category of every card not behind `hidden`. */
const shown = (root: ParentNode) =>
  Array.from(root.querySelectorAll<HTMLLIElement>('li.bl-card'))
    .filter((li) => !li.hidden)
    .map((li) => li.dataset.category)

const BUILD_LOG = BLOG_POSTS.filter((p) => p.meta.category === 'Build log').length

afterEach(() => {
  cleanup()
  window.history.replaceState(null, '', '/')
})

describe('/blog category filter', () => {
  it('files every post under a known category', () => {
    for (const p of BLOG_POSTS) expect(BLOG_CATEGORIES).toContain(p.meta.category)
  })

  it('prerenders every post, whatever the query says', () => {
    window.history.replaceState(null, '', '/blog?category=concepts')
    const doc = new DOMParser().parseFromString(renderToString(page()), 'text/html')
    expect(shown(doc)).toHaveLength(BLOG_POSTS.length)
  })

  it('applies ?category= after hydration, without a mismatch', async () => {
    window.history.replaceState(null, '', '/blog?category=build-log')
    const container = document.createElement('div')
    container.innerHTML = renderToString(page())
    document.body.appendChild(container)
    const errors: unknown[] = []
    let root: ReturnType<typeof hydrateRoot> | undefined
    await act(async () => {
      root = hydrateRoot(container, page(), { onRecoverableError: (e) => errors.push(e) })
    })
    expect(errors).toEqual([])
    expect(BUILD_LOG).toBeGreaterThan(0)
    expect(shown(container)).toEqual(Array(BUILD_LOG).fill('build-log'))
    act(() => root?.unmount())
    container.remove()
  })

  it('filters on a chip and keeps the choice in the URL', () => {
    render(page())
    fireEvent.click(screen.getByRole('button', { name: /^Concepts/ }))
    expect(new Set(shown(document))).toEqual(new Set(['concepts']))
    expect(window.location.search).toBe('?category=concepts')

    fireEvent.click(screen.getByRole('button', { name: /^All/ }))
    expect(shown(document)).toHaveLength(BLOG_POSTS.length)
    expect(window.location.search).toBe('')
  })
})
