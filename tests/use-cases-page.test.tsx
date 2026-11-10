import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, within, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ThemeProvider } from '../src/lib/theme'
import { ChatWidgetProvider } from '../src/lib/widget-context'
import App from '../src/App'
import { PAGE_FAQS } from '../src/lib/page-faqs'
import { USE_CASE_DETAIL_PAGES } from '../src/lib/use-case-pages'

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

describe('/use-cases', () => {
  it('links to every use case detail page', async () => {
    renderApp('/use-cases')
    const main = await screen.findByRole('main')
    expect(within(main).getAllByRole('heading', { level: 1 })).toHaveLength(1)
    for (const page of USE_CASE_DETAIL_PAGES) {
      expect(main.querySelector(`a[href="${page.path}"]`), `no link to ${page.path}`).not.toBeNull()
    }
  })

  it('points each hero chip at a page or at a card on this page', async () => {
    renderApp('/use-cases')
    const nav = await screen.findByRole('navigation', { name: 'Use cases' })
    for (const a of within(nav).getAllByRole('link')) {
      const href = a.getAttribute('href')!
      if (href.startsWith('#')) expect(document.getElementById(href.slice(1)), href).not.toBeNull()
      else expect(href.startsWith('/use-cases/'), href).toBe(true)
    }
  })
})

describe('/use-cases/support-agents', () => {
  it('renders the page with its FAQ and the ways to try it', async () => {
    renderApp('/use-cases/support-agents')
    expect(await screen.findByRole('heading', { level: 1, name: /support agents that remember/i })).toBeInTheDocument()
    const main = screen.getByRole('main')
    for (const e of PAGE_FAQS['/use-cases/support-agents'] ?? []) {
      expect(within(main).getByRole('heading', { level: 3, name: e.question })).toBeInTheDocument()
    }
    expect(within(main).getAllByRole('button', { name: /try the live demo/i }).length).toBeGreaterThan(0)
    expect(main.querySelector('a[href$="/statewave-examples/tree/main/support-agent-python"]')).not.toBeNull()
    expect(main.querySelector('a[href="/connectors"]')).not.toBeNull()
  })

  it('switches the code panel between tabs', async () => {
    renderApp('/use-cases/support-agents')
    const tablist = await screen.findByRole('tablist', { name: 'Support agent code' })
    const [first, second] = within(tablist).getAllByRole('tab')
    expect(first).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(second)
    expect(second).toHaveAttribute('aria-selected', 'true')
    expect(first).toHaveAttribute('aria-selected', 'false')
    const panel = document.getElementById(second.getAttribute('aria-controls')!)
    expect(panel?.textContent).toContain('create_handoff')
  })
})
