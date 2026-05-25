/*
 * Smoke test on the final prerendered artifact (`dist/index.html`).
 *
 * The real SSR-safety guard lives in `scripts/prerender.mjs`, which calls
 * `render('/')` during the build and aborts if React fell back to client-
 * only rendering or if the output collapses below a sanity floor. This
 * test runs after a build and double-checks the artifact that actually
 * ships, so a misconfigured prerender pipeline (wrong placeholder,
 * accidental over-aggressive ClientOnly wrap, etc.) is caught in CI.
 *
 * Auto-skipped if `dist/index.html` isn't present (no build yet). On
 * `npm test` after `npm run build`, it asserts the homepage's above-
 * the-fold shell is in the static markup and the below-the-fold cluster
 * was deliberately NOT prerendered.
 */

import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const here = dirname(fileURLToPath(import.meta.url))
const distHtmlPath = resolve(here, '..', 'dist', 'index.html')
const distBuildAvailable = existsSync(distHtmlPath)

describe.runIf(distBuildAvailable)('prerendered dist/index.html', () => {
  // Lazy read so the describe block can be discovered even when the
  // build artifact is absent — `runIf(false)` still evaluates this body
  // to collect test names; only the test cases inside are gated.
  const html = distBuildAvailable ? readFileSync(distHtmlPath, 'utf8') : ''

  it('is a real prerendered page (not the empty SPA template)', () => {
    expect(html.length).toBeGreaterThan(15_000)
    expect(html).not.toContain('<div id="root"></div>')
  })

  it('contains the hero <h1> in the initial document', () => {
    expect(html).toMatch(/<h1[^>]*>[\s\S]*?memory runtime[\s\S]*?<\/h1>/i)
  })

  it('renders the navbar shell (Skip-to-content link)', () => {
    expect(html).toContain('Skip to content')
    expect(html).toContain('<header')
  })

  it('does NOT prerender the below-the-fold cluster (Footer / ChatWidget / etc)', () => {
    // These are deferred to ClientOnly so the prerendered DOM stays small.
    // If a future change reverses this, the bundle size + cold LCP win
    // disappear — fail loudly.
    expect(html).not.toContain('<footer')
  })

  it('did not fall back to client-only rendering', () => {
    expect(html).not.toContain('Switched to client rendering because the server rendering errored')
  })
})

describe.runIf(!distBuildAvailable)('prerendered dist/index.html', () => {
  it('skipped — run `npm run build` first to exercise the prerender pipeline', () => {
    expect(true).toBe(true)
  })
})
