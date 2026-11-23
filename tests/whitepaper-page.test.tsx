import { describe, it, expect, afterEach } from 'vitest'
import { existsSync } from 'fs'
import { resolve } from 'path'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ThemeProvider } from '../src/lib/theme'
import { ChatWidgetProvider } from '../src/lib/widget-context'
import App from '../src/App'
import { PUBLIC_ROUTES } from '../src/lib/seo-meta'

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

const PDF = '/whitepaper/compiled-memory.pdf'
const PAGES = 18

describe('/whitepaper', () => {
  it('is public, so it is prerendered and in the sitemap', () => {
    expect(PUBLIC_ROUTES).toContain('/whitepaper')
    expect(existsSync(resolve(__dirname, '..', 'public', PDF.slice(1)))).toBe(true)
  })

  it('offers the paper to read and to download, never through the router', async () => {
    renderApp('/whitepaper')
    expect(await screen.findByRole('heading', { level: 1, name: /compiled memory/i })).toBeInTheDocument()
    const main = screen.getByRole('main')
    const pdfLinks = Array.from(main.querySelectorAll<HTMLAnchorElement>(`a[href^="${PDF}"]`))
    // A router <Link> would try to render the PDF as a route; these are plain anchors.
    expect(pdfLinks.some(a => a.hasAttribute('download'))).toBe(true)
    expect(pdfLinks.some(a => a.getAttribute('target') === '_blank')).toBe(true)
  })

  it('opens each contents entry at a page that exists in the PDF', async () => {
    renderApp('/whitepaper')
    const main = await screen.findByRole('main')
    const pages = Array.from(main.querySelectorAll<HTMLAnchorElement>(`a[href^="${PDF}#page="]`))
      .map(a => Number(a.getAttribute('href')!.split('#page=')[1]))
    expect(pages.length).toBe(9)
    for (const p of pages) expect(p).toBeGreaterThanOrEqual(1)
    for (const p of pages) expect(p).toBeLessThanOrEqual(PAGES)
  })

  it('describes the paper as a ScholarlyArticle with the PDF as its encoding', async () => {
    renderApp('/whitepaper')
    await waitFor(() => {
      const nodes = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .map(s => JSON.parse(s.textContent ?? '{}'))
        .flatMap(n => (Array.isArray(n) ? n : [n]))
      const article = nodes.find(n => n['@type'] === 'ScholarlyArticle')
      expect(article?.encoding?.contentUrl).toBe(`https://www.statewave.ai${PDF}`)
    })
  })
})
