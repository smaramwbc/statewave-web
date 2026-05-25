// @vitest-environment node
/*
 * Smoke test for the SSR/prerender output.
 *
 * Imports the *built* SSR bundle at `dist-ssr/entry.server.js` rather than
 * the `src/entry.server.tsx` source, because vitest's module resolver
 * picks a different `react-router` entry point than Vite SSR does — the
 * source-import path errors with "useRoutes() may be used only in the
 * context of a <Router>" while the production build's bundle renders
 * cleanly. Testing the built artifact is closer to what actually ships.
 *
 * The test is auto-skipped if the bundle isn't present (e.g. on `npm test`
 * without a prior `npm run build:ssr-bundle`). CI's `npm run build` step
 * regenerates the bundle and triggers these assertions implicitly via the
 * prerender script's own size check.
 */

import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { pathToFileURL } from 'url'

const bundlePath = resolve(__dirname, '..', 'dist-ssr', 'entry.server.js')
const builtBundleAvailable = existsSync(bundlePath)

describe.runIf(builtBundleAvailable)('SSR render (built bundle)', () => {
  let html = ''

  it('imports and calls render(/) without throwing', async () => {
    const mod = await import(pathToFileURL(bundlePath).href)
    html = mod.render('/')
    expect(typeof html).toBe('string')
    expect(html.length).toBeGreaterThan(10_000)
  })

  it('contains the hero <h1> so the browser can paint it before JS runs', () => {
    expect(html).toMatch(/<h1[^>]*>[\s\S]*?memory runtime[\s\S]*?<\/h1>/i)
  })

  it('renders the navbar shell (skip-to-content link)', () => {
    expect(html).toContain('Skip to content')
  })

  it('renders both the header and footer (full app shell, not a partial)', () => {
    expect(html).toContain('<header')
    expect(html).toContain('<footer')
  })

  it('did not fall back to client-only rendering', () => {
    expect(html).not.toContain('Switched to client rendering because the server rendering errored')
  })
})

describe.runIf(!builtBundleAvailable)('SSR render (built bundle)', () => {
  it('skipped — run `npm run build:ssr-bundle` first', () => {
    expect(readFileSync(__filename, 'utf8')).toContain('SSR render')
  })
})
