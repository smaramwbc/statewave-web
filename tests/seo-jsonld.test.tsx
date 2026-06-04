import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../src/lib/theme'
import { ChatWidgetProvider } from '../src/lib/widget-context'
import App from '../src/App'
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  organizationJsonLd,
  softwareApplicationJsonLd,
  websiteJsonLd,
} from '../src/lib/seo-meta'
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

interface JsonLdNode {
  '@type': string
  [key: string]: unknown
}

function readManagedJsonLd(): JsonLdNode[] {
  const scripts = document.head.querySelectorAll(
    'script[type="application/ld+json"][data-seo="managed"]',
  )
  return Array.from(scripts).map(
    (s) => JSON.parse(s.textContent ?? '{}') as JsonLdNode,
  )
}

describe('JSON-LD builders', () => {
  it('Organization is valid schema.org Organization', () => {
    const node = organizationJsonLd()
    expect(node['@context']).toBe('https://schema.org')
    expect(node['@type']).toBe('Organization')
    expect(node.name).toBe('Statewave')
    expect(node.url).toBe('https://www.statewave.ai')
    expect(Array.isArray(node.sameAs)).toBe(true)
  })

  it('WebSite is valid schema.org WebSite', () => {
    const node = websiteJsonLd()
    expect(node['@type']).toBe('WebSite')
    expect(node.inLanguage).toBe('en')
  })

  it('SoftwareApplication is valid schema.org SoftwareApplication', () => {
    const node = softwareApplicationJsonLd()
    expect(node['@type']).toBe('SoftwareApplication')
    expect(node.applicationCategory).toBe('DeveloperApplication')
    expect(node.codeRepository).toBe('https://github.com/smaramwbc/statewave')
  })

  it('BreadcrumbList builds valid ListItem entries', () => {
    const node = breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Use Cases', path: '/use-cases' },
    ])
    expect(node['@type']).toBe('BreadcrumbList')
    const items = node.itemListElement as Array<{
      '@type': string
      position: number
      name: string
      item: string
    }>
    expect(items).toHaveLength(2)
    expect(items[0]).toMatchObject({
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://www.statewave.ai',
    })
    expect(items[1]).toMatchObject({
      position: 2,
      item: 'https://www.statewave.ai/use-cases',
    })
  })

  it('FAQPage emits one Question per entry with an Answer', () => {
    const node = faqPageJsonLd(FAQ_ENTRIES)
    expect(node['@type']).toBe('FAQPage')
    const questions = node.mainEntity as Array<{
      '@type': string
      name: string
      acceptedAnswer: { '@type': string; text: string }
    }>
    expect(questions).toHaveLength(FAQ_ENTRIES.length)
    for (const [i, q] of questions.entries()) {
      expect(q['@type']).toBe('Question')
      expect(q.name).toBe(FAQ_ENTRIES[i].question)
      expect(q.acceptedAnswer['@type']).toBe('Answer')
      expect(q.acceptedAnswer.text).toBe(FAQ_ENTRIES[i].answer)
    }
  })
})

describe('Per-page injected JSON-LD', () => {
  it('homepage injects only a FAQPage (entity blocks stay static in index.html)', async () => {
    renderApp('/')
    await waitFor(() => {
      const types = readManagedJsonLd().map((n) => n['@type'])
      expect(types).toContain('FAQPage')
    })
    // Organization / WebSite / SoftwareApplication live in the static
    // index.html head site-wide; re-emitting them here would only duplicate
    // them in the rendered DOM, so the SPA layer must not.
    const types = readManagedJsonLd().map((n) => n['@type'])
    expect(types).not.toContain('Organization')
    expect(types).not.toContain('WebSite')
    expect(types).not.toContain('SoftwareApplication')
  })

  it('homepage removes the static baseline FAQPage so only one remains', async () => {
    // Simulate the static index.html baseline FAQPage that ships in <head>
    // for non-JS crawlers (a non-managed, four-question subset).
    const baseline = document.createElement('script')
    baseline.type = 'application/ld+json'
    baseline.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [{ '@type': 'Question', name: 'baseline' }],
    })
    document.head.appendChild(baseline)

    renderApp('/')
    await waitFor(() => {
      const managed = readManagedJsonLd().map((n) => n['@type'])
      expect(managed).toContain('FAQPage')
    })

    const allFaq = Array.from(
      document.head.querySelectorAll('script[type="application/ld+json"]'),
    )
      .map((s) => JSON.parse(s.textContent ?? '{}') as JsonLdNode)
      .filter((n) => n['@type'] === 'FAQPage')
    // Exactly one FAQPage, and it's the full managed list — not the baseline.
    expect(allFaq).toHaveLength(1)
    expect(
      (allFaq[0].mainEntity as unknown[]).length,
    ).toBe(FAQ_ENTRIES.length)
  })

  it('homepage does NOT emit a BreadcrumbList', async () => {
    renderApp('/')
    await waitFor(() => {
      const types = readManagedJsonLd().map((n) => n['@type'])
      expect(types).toContain('FAQPage')
    })
    const types = readManagedJsonLd().map((n) => n['@type'])
    expect(types).not.toContain('BreadcrumbList')
  })

  it('inner pages emit a BreadcrumbList', async () => {
    renderApp('/product')
    await waitFor(() => {
      const types = readManagedJsonLd().map((n) => n['@type'])
      expect(types).toContain('BreadcrumbList')
    })
  })

  it('all injected JSON-LD parses cleanly (no broken JSON)', async () => {
    renderApp('/use-cases')
    await waitFor(() => {
      const scripts = document.head.querySelectorAll(
        'script[type="application/ld+json"][data-seo="managed"]',
      )
      expect(scripts.length).toBeGreaterThan(0)
      for (const s of scripts) {
        expect(() => JSON.parse(s.textContent ?? '')).not.toThrow()
      }
    })
  })

  it('navigating a route swaps managed JSON-LD without leaving stale entries', async () => {
    const { unmount } = renderApp('/')
    await waitFor(() => {
      expect(
        readManagedJsonLd().some((n) => n['@type'] === 'FAQPage'),
      ).toBe(true)
    })
    unmount()
    cleanup()

    renderApp('/product')
    await waitFor(() => {
      const types = readManagedJsonLd().map((n) => n['@type'])
      expect(types).toContain('BreadcrumbList')
      expect(types).not.toContain('FAQPage')
    })
  })
})
