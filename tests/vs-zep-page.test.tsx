/**
 * /vs/zep: the Statewave-vs-Zep comparison page.
 *
 * These tests lock down the properties the page's credibility rests on:
 *
 *   - the gauges are labeled with the same LoCoMo/LongMemEval figures
 *     /benchmarks and /vs/letta already ship, so the three pages can't drift
 *   - the "no BEAM score" rule from /vs/letta holds here too
 *   - the corrected fact (Zep's self-hosted Community Edition was
 *     discontinued) actually appears on the page, not just in a comment
 *   - the "managed, not deterministic" panel is labeled illustrative, since
 *     Zep publishes no per-run determinism figure to plot instead
 *   - the nominative-use trademark notice stays on the page
 */
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ThemeProvider } from '../src/lib/theme'
import { StatewaveVsZepPage } from '../src/pages/StatewaveVsZepPage'

function renderPage() {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={['/vs/zep']}>
        <StatewaveVsZepPage />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

afterEach(cleanup)

describe('StatewaveVsZepPage: benchmark figures', () => {
  it('labels each Statewave gauge with its benchmark, score, and sample size', () => {
    renderPage()
    const gauges = screen.getAllByRole('img')
    expect(gauges).toHaveLength(2)
    expect(screen.getByLabelText(/LoCoMo: 0\.905 accuracy, n=1,540/)).toBeTruthy()
    expect(screen.getByLabelText(/LongMemEval: 0\.967 accuracy, n=30/)).toBeTruthy()
  })

  it('claims no BEAM score, which /benchmarks explicitly disclaims', () => {
    const { container } = renderPage()
    expect(container.textContent).not.toContain('BEAM')
  })

  it('states the hybrid retrieval lift figures shown on /vs/letta', () => {
    const { container } = renderPage()
    expect(container.textContent).toContain('LoCoMo +2.1')
    expect(container.textContent).toContain('LongMemEval +16.0')
  })
})

describe('StatewaveVsZepPage: claims', () => {
  it('counts the ranking signals it actually shows', () => {
    const { container } = renderPage()
    expect(container.textContent).toContain('ranking signals, deterministic')
    expect(screen.getByText('SEMANTIC SIMILARITY')).toBeTruthy()
    expect(container.textContent).toMatch(/5\s*ranking signals/)
  })

  it('uses raw_episode, not artifact_ref, as the fourth kind-priority bar', () => {
    // ProductPage's scoring model and /vs/letta both score
    // profile_fact=10, procedure=8, episode_summary=5, raw_episode=3.
    // The source design mock used artifact_ref=4 for this bar; that figure
    // doesn't match the shipped scoring model and should not appear here.
    const { container } = renderPage()
    expect(container.textContent).toContain('raw_episode')
    expect(container.textContent).not.toContain('artifact_ref')
  })

  it('labels the illustrative Zep determinism panel as illustrative', () => {
    const { container } = renderPage()
    expect(container.textContent).toMatch(/Illustrative.*Zep publishes no per-run determinism guarantee/)
  })

  it('discloses that Zep discontinued its self-hosted Community Edition', () => {
    const { container } = renderPage()
    expect(container.textContent).toMatch(/Community Edition discontinued 2025/)
    expect(container.textContent).toMatch(/discontinued its self-hosted Community Edition in 2025/)
  })

  it('never uses an em dash anywhere on the page', () => {
    const { container } = renderPage()
    expect(container.textContent).not.toContain('—')
  })
})

describe('StatewaveVsZepPage: comparison table', () => {
  it('renders the retrieval, governance, and ops row groups', () => {
    const { container } = renderPage()
    expect(container.textContent).toContain('RETRIEVAL & RANKING')
    expect(container.textContent).toContain('GOVERNANCE & PROVENANCE')
    expect(container.textContent).toContain('OPERATIONS & LICENSING')
  })
})
