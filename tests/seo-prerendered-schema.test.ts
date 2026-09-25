import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { routeJsonLd } from '../src/lib/page-schema'

const repoRoot = resolve(__dirname, '..')
const distAvailable = existsSync(resolve(repoRoot, 'dist', 'index.html'))

function prerendered(route: string): string {
  const file =
    route === '/'
      ? resolve(repoRoot, 'dist', 'index.html')
      : resolve(repoRoot, 'dist', route.replace(/^\//, ''), 'index.html')
  return readFileSync(file, 'utf8')
}

/** Every `<script type="application/ld+json">` block's parsed @type. */
function emittedTypes(html: string): string[] {
  const out: string[] = []
  const re = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    // The injector escapes `<` so a `</script>` inside a string can't close
    // the block early; undo that before parsing.
    out.push(JSON.parse(m[1].replace(/\\u003c/g, '<'))['@type'])
  }
  return out
}

/*
 * Guards the bug where route-static JSON-LD reached the client but never the
 * served HTML. `usePageSEO` injects from a `useEffect`, which never fires
 * during SSR, so scripts/prerender.mjs writes the same nodes at build time.
 * Those were two separate hardcoded lists and they drifted: /openrouter's
 * SoftwareApplication and /blog's Blog node were missing from the static HTML
 * entirely, invisible to any crawler that doesn't execute JS.
 *
 * Both sides now read lib/page-schema.ts. This asserts the served bytes match
 * what that module says the route should carry — testing the artifact, not the
 * function, because the function was never the part that broke.
 */
describe.runIf(distAvailable)('prerendered JSON-LD matches page-schema', () => {
  const routes = ['/', '/openrouter', '/blog', '/product', '/developers', '/faq']

  it.each(routes)('%s emits every node routeJsonLd declares', (route) => {
    const emitted = emittedTypes(prerendered(route))
    for (const node of routeJsonLd(route, BLOG_STUB)) {
      expect(emitted, `${route} is missing ${node['@type']}`).toContain(node['@type'])
    }
  })

  it('/openrouter carries the proxy as its primary entity', () => {
    const html = prerendered('/openrouter')
    expect(emittedTypes(html)).toContain('SoftwareApplication')
    expect(html).toContain('statewave-openrouter')
  })

  it('every emitted block is valid JSON', () => {
    for (const route of routes) {
      expect(() => emittedTypes(prerendered(route))).not.toThrow()
    }
  })
})

/* Only /blog reads this; one entry is enough to make the Blog node appear. */
const BLOG_STUB = [
  {
    title: 'Stub',
    date: '2026-01-01',
    url: 'https://www.statewave.ai/blog/stub',
    description: 'Stub post used to exercise the Blog node.',
    author: 'Statewave',
  },
]
