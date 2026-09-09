/**
 * Every public page must answer at least one question *as a question
 * heading*, with the answer as the next thing in the DOM.
 *
 * That pair — an <h2>/<h3> ending in "?" immediately followed by a
 * substantive paragraph — is what Perplexity, ChatGPT, and Claude extract
 * as a citable answer. Thirteen of the site's pages had no question heading
 * at all, and the three comparison pages that did have Q&A rendered the
 * question as a styled <p>, which reads as body text to an extractor. Both
 * are invisible regressions: the page looks identical either way.
 */
import { describe, expect, it, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
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

/** Walk the document forward from `from` and return the first run of text
 *  that isn't chevron/badge chrome — the same thing an extractor pairs with
 *  the heading above it. */
function firstAnswerAfter(root: Element, from: Element): string | null {
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let seen = false
  while (walker.nextNode()) {
    const node = walker.currentNode
    if (!seen) {
      if (from.contains(node)) seen = true
      continue
    }
    const text = node.textContent?.trim() ?? ''
    if (text.length >= 40) return text
  }
  return null
}

describe.each(PUBLIC_ROUTES)('%s', (route) => {
  it('has a question heading with its answer directly after it', async () => {
    renderApp(route)
    const main = await screen.findByRole('main')

    const questions = Array.from(
      main.querySelectorAll('h1, h2, h3, h4'),
    ).filter((h) => (h.textContent ?? '').trim().endsWith('?'))

    expect(
      questions.length,
      `${route} has no question heading — nothing on it can be cited as a direct answer`,
    ).toBeGreaterThan(0)

    for (const heading of questions) {
      expect(
        firstAnswerAfter(main, heading),
        `${route}: "${heading.textContent?.trim()}" has no answer text after it`,
      ).not.toBeNull()
    }
  })
})
