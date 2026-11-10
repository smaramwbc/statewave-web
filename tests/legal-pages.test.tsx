import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, within, waitFor } from '@testing-library/react'
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

const LEGAL = [
  ['/privacy', /privacy policy/i],
  ['/terms', /terms of service/i],
  ['/cookies', /cookie policy/i],
  ['/impressum', /impressum/i],
] as const

describe.each(LEGAL)('%s', (route, h1) => {
  it('is public: prerendered, in the sitemap and indexable', async () => {
    expect(PUBLIC_ROUTES).toContain(route)
    renderApp(route)
    expect(await screen.findByRole('heading', { level: 1, name: h1 })).toBeInTheDocument()
    await waitFor(() => {
      expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).not.toMatch(/noindex/)
    })
  })

  it('points every "On this page" entry at a section on the page', async () => {
    renderApp(route)
    const toc = await screen.findByRole('navigation', { name: 'On this page' })
    const links = within(toc).getAllByRole('link')
    expect(links.length).toBeGreaterThan(3)
    for (const a of links) {
      const id = a.getAttribute('href')!.replace(/^#/, '')
      expect(document.getElementById(id), `#${id} has no section`).not.toBeNull()
    }
  })

  it('links the other three legal pages, not itself', async () => {
    renderApp(route)
    const band = (await screen.findByRole('heading', { name: 'The other legal pages' })).closest('section')!
    const hrefs = within(band).getAllByRole('link').map(a => a.getAttribute('href'))
    const others = LEGAL.map(([r]) => r).filter(r => r !== route)
    expect(hrefs).toEqual(expect.arrayContaining(others))
    expect(hrefs).not.toContain(route)
  })
})

describe('/impressum', () => {
  it('shows the operator with its tax IDs', async () => {
    renderApp('/impressum')
    const main = await screen.findByRole('main')
    expect(await within(main).findByText('WebConnect World SL')).toBeInTheDocument()
    expect(within(main).getByText('B88379102')).toBeInTheDocument()
    expect(within(main).getByText('ESB88379102')).toBeInTheDocument()
  })
})
