import { describe, it, expect, afterEach } from 'vitest'
import { existsSync } from 'fs'
import { resolve } from 'path'
import { render, screen, cleanup, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ThemeProvider } from '../src/lib/theme'
import { ChatWidgetProvider } from '../src/lib/widget-context'
import App from '../src/App'

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

const publicDir = resolve(__dirname, '..', 'public')

describe('/press', () => {
  it('renders the press kit with the press contact', async () => {
    renderApp('/press')
    expect(await screen.findByRole('heading', { level: 1, name: /everything you need/i })).toBeInTheDocument()
    const main = screen.getByRole('main')
    const hrefs = Array.from(main.querySelectorAll('a[href]')).map((a) => a.getAttribute('href'))
    expect(hrefs).toContain('mailto:press@statewave.ai')
    expect(hrefs).toContain('/press/BRAND-ASSETS.zip')
    expect(hrefs).toContain('/press/SCREENSHOTS.zip')
  })

  it('serves every download from a file that exists, as a download rather than a page', async () => {
    renderApp('/press')
    const main = await screen.findByRole('main')
    const files = Array.from(main.querySelectorAll<HTMLAnchorElement>('a[href^="/press/"], a[href^="/images/press/"]'))
    expect(files.length).toBeGreaterThan(10)
    for (const a of files) {
      const href = a.getAttribute('href')!
      expect(existsSync(resolve(publicDir, href.slice(1))), `${href} is not in public/`).toBe(true)
      // A router <Link> would try to render the file as a route.
      expect(a.hasAttribute('download'), `${href} is not a download link`).toBe(true)
    }
  })

  it('pairs each logo card with its own file, not the other background’s', async () => {
    renderApp('/press')
    for (const [title, png] of [
      ['For dark backgrounds', '/press/statewave-wordmark-dark.png'],
      ['For light backgrounds', '/press/statewave-wordmark-light.png'],
    ]) {
      const card = (await screen.findByText(title)).closest('figure')!
      expect(card.querySelector('img')!.getAttribute('src')).toBe(png)
      const pngLink = within(card).getByRole('link', { name: /PNG/ })
      expect(pngLink.getAttribute('href')).toBe(png)
    }
  })
})
