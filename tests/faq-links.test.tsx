import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../src/lib/theme'
import { ChatWidgetProvider } from '../src/lib/widget-context'
import App from '../src/App'
import { FAQ_ENTRIES } from '../src/lib/faq'

afterEach(() => {
  cleanup()
})

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <ThemeProvider>
        <ChatWidgetProvider>
          <App />
        </ChatWidgetProvider>
      </ThemeProvider>
    </MemoryRouter>,
  )
}

const STATEWAVE_HOSTS = [
  'https://statewave.ai',
  'https://www.statewave.ai',
] as const

function isExternal(href: string): boolean {
  if (href.startsWith('/') || href.startsWith('#')) return false
  if (STATEWAVE_HOSTS.some((h) => href.startsWith(h))) return false
  return true
}

describe('FAQ entry data', () => {
  it('every entry has at least one follow-up link', () => {
    for (const entry of FAQ_ENTRIES) {
      expect(entry.links, `Missing links on "${entry.question}"`).toBeDefined()
      expect(entry.links!.length, `No links on "${entry.question}"`).toBeGreaterThan(0)
    }
  })

  it('every link has a non-empty label and href', () => {
    for (const entry of FAQ_ENTRIES) {
      for (const link of entry.links ?? []) {
        expect(link.label.length).toBeGreaterThan(0)
        expect(link.href.length).toBeGreaterThan(0)
      }
    }
  })

  it('the licensing entry surfaces both AGPL and the commercial path', () => {
    const licensing = FAQ_ENTRIES.find((e) =>
      /open source.*commercial use|licens/i.test(e.question),
    )
    expect(licensing, 'No licensing entry found').toBeDefined()
    const answer = licensing!.answer.toLowerCase()
    expect(answer).toMatch(/agplv3|agpl-3/)
    expect(answer).toMatch(/commercial license/)
    expect(answer).toMatch(/enterprise/)

    const linkHrefs = (licensing!.links ?? []).map((l) => l.href)
    expect(linkHrefs.some((h) => h.endsWith('LICENSING.md'))).toBe(true)
    expect(linkHrefs.some((h) => h.startsWith('mailto:licensing@'))).toBe(true)
  })
})

describe('FAQ link rendering', () => {
  it('renders every link from FAQ_ENTRIES at least once', async () => {
    renderHome()
    const faqRegion = await screen.findByRole('heading', {
      name: /frequently asked questions/i,
    })
    const section = faqRegion.closest('section')!
    expect(section).toBeInTheDocument()

    // Open every <details> so all links are queryable, regardless of the
    // first-item-open default.
    const details = section.querySelectorAll('details')
    details.forEach((d) => d.setAttribute('open', ''))

    for (const entry of FAQ_ENTRIES) {
      for (const link of entry.links ?? []) {
        const matches = within(section).getAllByRole('link', {
          name: new RegExp(escape(link.label), 'i'),
        })
        expect(
          matches.length,
          `Link "${link.label}" not rendered`,
        ).toBeGreaterThan(0)
      }
    }
  })

  it('external links open in a new tab with safe rel', async () => {
    renderHome()
    const faqHeading = await screen.findByRole('heading', {
      name: /frequently asked questions/i,
    })
    const section = faqHeading.closest('section')!
    section.querySelectorAll('details').forEach((d) => d.setAttribute('open', ''))

    const externalLinks = FAQ_ENTRIES.flatMap((e) => e.links ?? []).filter((l) =>
      isExternal(l.href),
    )
    expect(externalLinks.length).toBeGreaterThan(0)

    for (const link of externalLinks) {
      const a = within(section)
        .getAllByRole('link', { name: new RegExp(escape(link.label), 'i') })
        .find((el) => el.getAttribute('href') === link.href)
      expect(a, `Missing external link element for ${link.href}`).toBeDefined()
      expect(a!.getAttribute('target')).toBe('_blank')
      const rel = a!.getAttribute('rel') ?? ''
      expect(rel).toContain('noopener')
      expect(rel).toContain('noreferrer')
    }
  })

  it('internal route links stay in the same tab (no target=_blank)', async () => {
    renderHome()
    const faqHeading = await screen.findByRole('heading', {
      name: /frequently asked questions/i,
    })
    const section = faqHeading.closest('section')!
    section.querySelectorAll('details').forEach((d) => d.setAttribute('open', ''))

    const internalLinks = FAQ_ENTRIES.flatMap((e) => e.links ?? []).filter(
      (l) => !isExternal(l.href),
    )
    expect(internalLinks.length).toBeGreaterThan(0)

    for (const link of internalLinks) {
      const matches = within(section)
        .getAllByRole('link', { name: new RegExp(escape(link.label), 'i') })
        // Filter to the FAQ-link element specifically — the page footer or
        // other sections might also link to the same path, and those don't
        // belong to this assertion.
        .filter((el) => {
          const href = el.getAttribute('href') ?? ''
          return href === link.href || href.endsWith(link.href)
        })
      expect(
        matches.length,
        `Internal link "${link.label}" not found in FAQ`,
      ).toBeGreaterThan(0)
      for (const el of matches) {
        expect(el.getAttribute('target')).not.toBe('_blank')
      }
    }
  })
})

function escape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
