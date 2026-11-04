import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ThemeProvider } from '../src/lib/theme'
import { ChatWidgetProvider } from '../src/lib/widget-context'
import App from '../src/App'
import { BLOG_POSTS, SERIES } from '../src/lib/blog'

// The comments load giscus.app's script, which happy-dom refuses to fetch.
vi.mock('../src/components/GiscusComments', () => ({ GiscusComments: () => null }))

afterEach(() => {
  cleanup()
})

function renderApp(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider>
        <ChatWidgetProvider>
          <App />
        </ChatWidgetProvider>
      </ThemeProvider>
    </MemoryRouter>,
  )
}

const article = BLOG_POSTS.find(p => !p.meta.series && p.meta.category)!
const episode = BLOG_POSTS.find(p => p.meta.series)!

describe('/blog/:slug', () => {
  it('renders the post under its title, with a breadcrumb back to its category', async () => {
    renderApp(`/blog/${article.meta.slug}`)
    expect(await screen.findByRole('heading', { level: 1, name: article.meta.title })).toBeInTheDocument()
    const crumbs = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(within(crumbs).getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog')
    expect(within(crumbs).getByRole('link', { name: article.meta.category! }))
      .toHaveAttribute('href', `/blog?category=${article.meta.category!.toLowerCase().replace(/\s+/g, '-')}`)
  })

  it('lists the post’s sections in "On this page"', async () => {
    renderApp(`/blog/${article.meta.slug}`)
    const toc = await screen.findByRole('complementary', { name: 'On this page' })
    const heads = document.querySelectorAll('article h2[id]')
    const links = await within(toc).findAllByRole('link')
    expect(links).toHaveLength(heads.length)
    links.forEach((a, i) => expect(a).toHaveAttribute('href', `#${heads[i].id}`))
  })

  it('wraps tables to scroll on their own and opens external links in a new tab', async () => {
    const withTable = BLOG_POSTS.find(p => p.meta.slug === 'zep-alternatives')!
    renderApp(`/blog/${withTable.meta.slug}`)
    await screen.findByRole('heading', { level: 1, name: withTable.meta.title })
    const body = document.querySelector('article')!
    for (const table of body.querySelectorAll('table')) {
      expect(table.parentElement).toHaveClass('bp-table')
    }
    for (const a of body.querySelectorAll<HTMLAnchorElement>('a[href^="http"]')) {
      expect(a).toHaveAttribute('target', '_blank')
    }
  })

  it('gives a series episode its series breadcrumb and no section list', async () => {
    renderApp(`/blog/${episode.meta.slug}`)
    await screen.findByRole('heading', { level: 1, name: episode.meta.title })
    const crumbs = screen.getByRole('navigation', { name: 'Breadcrumb' })
    const series = SERIES[episode.meta.series!]
    expect(within(crumbs).getByRole('link', { name: series.title })).toHaveAttribute('href', series.path)
    expect(screen.queryByRole('complementary', { name: 'On this page' })).toBeNull()
  })

  it('suggests three other posts', async () => {
    renderApp(`/blog/${article.meta.slug}`)
    const more = await screen.findByRole('region', { name: 'More from the blog' })
    const cards = within(more).getAllByRole('listitem')
    expect(cards).toHaveLength(3)
    for (const card of cards) {
      expect(within(card).getByRole('link')).not.toHaveAttribute('href', `/blog/${article.meta.slug}`)
    }
  })
})
