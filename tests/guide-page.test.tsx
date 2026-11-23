import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ThemeProvider } from '../src/lib/theme'
import { ChatWidgetProvider } from '../src/lib/widget-context'
import App from '../src/App'
import { PAGE_FAQS } from '../src/lib/page-faqs'

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

const REPO = 'https://github.com/smaramwbc/statewave-guide'

describe('/guide', () => {
  it('opens on the Statewave Guide hero, with the quick start and the build diary one click away', async () => {
    renderApp('/guide')
    const h1 = await screen.findByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('Your app explains itself.')
    expect(screen.getByRole('link', { name: /Run the demo locally/ })).toHaveAttribute('href', '#quick-start')
    expect(document.getElementById('quick-start')).not.toBeNull()
    expect(screen.getByRole('link', { name: 'read the build diary' })).toHaveAttribute('href', '/blog/statewave-guide')
  })

  it('sends "View on GitHub" to the statewave-guide repo', async () => {
    renderApp('/guide')
    await screen.findByRole('heading', { level: 1 })
    const links = screen.getAllByRole('link', { name: /View on GitHub/ })
    expect(links.length).toBeGreaterThan(0)
    for (const a of links) expect(a).toHaveAttribute('href', REPO)
  })

  it('shows every FAQ entry as a question heading', async () => {
    renderApp('/guide')
    const faq = await screen.findByRole('region', { name: 'Frequently asked questions' })
    const questions = within(faq).getAllByRole('heading', { level: 3 }).map(h => h.textContent)
    expect(questions).toEqual(PAGE_FAQS['/guide']!.map(e => e.question))
  })
})
