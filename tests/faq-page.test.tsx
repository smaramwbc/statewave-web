import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ThemeProvider } from '../src/lib/theme'
import { ChatWidgetProvider } from '../src/lib/widget-context'
import App from '../src/App'
import { FAQ_ENTRIES } from '../src/lib/faq'

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

describe('/faq', () => {
  it('shows every FAQ entry exactly once, each under a topic', async () => {
    renderApp('/faq')
    const main = await screen.findByRole('main')
    expect(within(main).getAllByRole('heading', { level: 1 })).toHaveLength(1)
    const questions = Array.from(main.querySelectorAll('summary h3')).map(h => h.textContent)
    expect(questions.sort()).toEqual(FAQ_ENTRIES.map(e => e.question).sort())
    for (const h3 of main.querySelectorAll('summary h3')) {
      expect(h3.closest('section[id]')?.querySelector('h2')).not.toBeNull()
    }
  })

  it('assigns every entry to a named topic, so none falls back to "More questions"', async () => {
    renderApp('/faq')
    const main = await screen.findByRole('main')
    expect(main.querySelector('#more')).toBeNull()
  })

  it('points each topic chip at a section on the page', async () => {
    renderApp('/faq')
    const nav = await screen.findByRole('navigation', { name: 'Topics' })
    const links = within(nav).getAllByRole('link')
    expect(links.length).toBeGreaterThan(1)
    for (const a of links) {
      const id = a.getAttribute('href')!.slice(1)
      expect(document.getElementById(id), `#${id}`).not.toBeNull()
    }
  })
})

describe('404', () => {
  it('names the missing path and links back home', async () => {
    renderApp('/no-such-page')
    expect(await screen.findByRole('heading', { level: 1, name: /page not found/i })).toBeInTheDocument()
    const main = screen.getByRole('main')
    expect(main.querySelector('code')?.textContent).toBe('/no-such-page')
    expect(within(main).getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/')
  })
})
