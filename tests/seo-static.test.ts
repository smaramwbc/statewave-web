import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { BASE_URL, PUBLIC_ROUTES, canonicalUrl } from '../src/lib/seo-meta'

const repoRoot = resolve(__dirname, '..')

function readPublic(name: string): string {
  return readFileSync(resolve(repoRoot, 'public', name), 'utf8')
}

describe('public/sitemap.xml', () => {
  const xml = readPublic('sitemap.xml')

  it('declares the urlset namespace', () => {
    expect(xml).toMatch(
      /<urlset\s+xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/,
    )
  })

  it('lists every PUBLIC_ROUTES entry exactly once with the canonical URL', () => {
    for (const route of PUBLIC_ROUTES) {
      const url = canonicalUrl(route)
      // Allow trailing slash on the bare home URL — both forms are canonical.
      const candidates =
        route === '/'
          ? [`<loc>${url}</loc>`, `<loc>${url}/</loc>`]
          : [`<loc>${url}</loc>`]
      const matchCount = candidates.reduce(
        (n, needle) => n + (xml.includes(needle) ? 1 : 0),
        0,
      )
      expect(matchCount, `Sitemap missing ${route}`).toBeGreaterThanOrEqual(1)
    }
  })

  it('does not list any internal/api routes', () => {
    expect(xml).not.toMatch(/\/api\//)
  })
})

describe('public/robots.txt', () => {
  const robots = readPublic('robots.txt')

  it('allows the public site', () => {
    expect(robots).toMatch(/User-agent:\s*\*/)
    expect(robots).toMatch(/Allow:\s*\//)
  })

  it('blocks the /api/ surface', () => {
    expect(robots).toMatch(/Disallow:\s*\/api\//)
  })

  it('points crawlers at the sitemap', () => {
    expect(robots).toContain(`Sitemap: ${BASE_URL}/sitemap.xml`)
  })
})

describe('public/llms.txt', () => {
  const llms = readPublic('llms.txt')

  it('opens with the # Statewave heading and a > tagline', () => {
    expect(llms).toMatch(/^# Statewave\s/)
    // Per the llms.txt spec, the tagline is a blockquote line directly under
    // the title.
    expect(llms).toMatch(/\n> Statewave is open memory infrastructure/)
  })

  it('describes the core concepts a crawler needs', () => {
    for (const term of [
      'Subject',
      'Episode',
      'Memory',
      'Context bundle',
      'Compiler',
      'Ranking',
    ]) {
      expect(llms, `llms.txt should mention "${term}"`).toMatch(
        new RegExp(`\\*\\*${term}\\*\\*`),
      )
    }
  })

  it('links the public site, docs, and source repos', () => {
    const required = [
      'https://statewave.ai/',
      'https://statewave.ai/product',
      'https://statewave.ai/why',
      'https://statewave.ai/use-cases',
      'https://statewave.ai/developers',
      'https://github.com/smaramwbc/statewave',
      'https://github.com/smaramwbc/statewave-py',
      'https://github.com/smaramwbc/statewave-ts',
      'https://github.com/smaramwbc/statewave-docs',
      'https://github.com/smaramwbc/statewave-examples',
    ]
    for (const url of required) {
      expect(llms, `llms.txt should reference ${url}`).toContain(url)
    }
  })
})

describe('index.html baseline metadata', () => {
  const html = readFileSync(resolve(repoRoot, 'index.html'), 'utf8')

  it('declares lang="en"', () => {
    expect(html).toMatch(/<html\s+lang="en"/)
  })

  it('contains the canonical home URL', () => {
    expect(html).toMatch(
      /<link\s+rel="canonical"\s+href="https:\/\/statewave\.ai"/,
    )
  })

  it('embeds Organization, WebSite, and SoftwareApplication JSON-LD', () => {
    expect(html).toContain('"@type": "Organization"')
    expect(html).toContain('"@type": "WebSite"')
    expect(html).toContain('"@type": "SoftwareApplication"')
  })

  it('every embedded JSON-LD block is valid JSON', () => {
    const matches = html.matchAll(
      /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    )
    let blocks = 0
    for (const m of matches) {
      blocks++
      expect(() => JSON.parse(m[1])).not.toThrow()
    }
    expect(blocks).toBeGreaterThanOrEqual(3)
  })
})
