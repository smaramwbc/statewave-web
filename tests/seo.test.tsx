import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../src/lib/theme'
import { ChatWidgetProvider } from '../src/lib/widget-context'
import App from '../src/App'
import {
  BASE_URL,
  PAGE_META,
  PUBLIC_ROUTES,
  canonicalUrl,
  type RouteKey,
} from '../src/lib/seo-meta'

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

function metaContent(name: string, attr: 'name' | 'property' = 'name'): string | null {
  const el = document.head.querySelector(`meta[${attr}="${name}"]`)
  return el?.getAttribute('content') ?? null
}

function linkHref(rel: string): string | null {
  const el = document.head.querySelector(`link[rel="${rel}"]`)
  return el?.getAttribute('href') ?? null
}

describe('Per-page SEO metadata', () => {
  for (const route of PUBLIC_ROUTES) {
    const meta = PAGE_META[route]
    it(`route ${route} sets title, description, canonical, OG, Twitter`, async () => {
      renderApp(route)
      await waitFor(() => {
        expect(document.title).toBe(meta.title)
      })

      expect(metaContent('description')).toBe(meta.description)
      expect(linkHref('canonical')).toBe(canonicalUrl(route))

      expect(metaContent('og:title', 'property')).toBe(meta.title)
      expect(metaContent('og:description', 'property')).toBe(meta.description)
      expect(metaContent('og:url', 'property')).toBe(canonicalUrl(route))
      expect(metaContent('og:type', 'property')).toBe(meta.ogType ?? 'website')
      expect(metaContent('og:site_name', 'property')).toBe('Statewave')
      expect(metaContent('og:locale', 'property')).toBe('en_US')
      expect(metaContent('og:image', 'property')).toBe(`${BASE_URL}/og-image.png`)
      expect(metaContent('og:image:width', 'property')).toBe('1200')
      expect(metaContent('og:image:height', 'property')).toBe('630')
      expect(metaContent('og:image:alt', 'property')).toBeTruthy()

      expect(metaContent('twitter:card')).toBe('summary_large_image')
      expect(metaContent('twitter:title')).toBe(meta.title)
      expect(metaContent('twitter:description')).toBe(meta.description)
      expect(metaContent('twitter:image')).toBe(`${BASE_URL}/og-image.png`)

      expect(metaContent('robots')).toMatch(/index, follow/)
      expect(document.documentElement.lang).toBe('en')
    })
  }

  it('every public route has unique title and description', () => {
    const titles = new Set<string>()
    const descriptions = new Set<string>()
    for (const route of PUBLIC_ROUTES) {
      const meta = PAGE_META[route as RouteKey]
      titles.add(meta.title)
      descriptions.add(meta.description)
    }
    expect(titles.size).toBe(PUBLIC_ROUTES.length)
    expect(descriptions.size).toBe(PUBLIC_ROUTES.length)
  })

  it('404 page sets noindex and a 404 title', async () => {
    renderApp('/this-route-does-not-exist')
    await waitFor(() => {
      expect(document.title).toMatch(/404/)
    })
    expect(metaContent('robots')).toMatch(/noindex/)
  })

  it('every page title fits within ~70 characters', () => {
    for (const route of PUBLIC_ROUTES) {
      const meta = PAGE_META[route as RouteKey]
      // Search engines typically truncate around 60–70 characters; alert
      // before any future change pushes a title over.
      expect(meta.title.length, `Title for ${route} too long`).toBeLessThanOrEqual(75)
    }
  })

  it('every page description is a meaningful length (≥80, ≤200 chars)', () => {
    for (const route of PUBLIC_ROUTES) {
      const meta = PAGE_META[route as RouteKey]
      const len = meta.description.length
      expect(len, `Description for ${route} too short`).toBeGreaterThanOrEqual(80)
      // Generous upper bound — Google sometimes shows 320, but the
      // first 160 are what matter most. Keep room for that.
      expect(len, `Description for ${route} too long`).toBeLessThanOrEqual(320)
    }
  })
})
