/**
 * /vs/supermemory: the Statewave-vs-Supermemory comparison page.
 *
 * These tests lock down the properties the page's credibility rests on:
 *
 *   - the gauges are labeled with the same LoCoMo/LongMemEval figures
 *     /benchmarks, /vs/letta, and /vs/zep already ship, so the four pages
 *     can't drift
 *   - the "no BEAM score" rule from /vs/letta and /vs/zep holds here too
 *   - the kind-priority bars use raw_episode, not the source mock's
 *     artifact_ref, matching ProductPage's scoring model
 *   - Supermemory's own published figures (LoCoMo P@1, LongMemEval
 *     Recall@15) appear, labeled as a different metric from Statewave's
 *     end-to-end QA accuracy, not stacked into a single comparison
 *   - the page never uses an em dash, matching the other three vs pages
 */
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ThemeProvider } from '../src/lib/theme'
import { StatewaveVsSupermemoryPage } from '../src/pages/StatewaveVsSupermemoryPage'

function renderPage() {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={['/vs/supermemory']}>
        <StatewaveVsSupermemoryPage />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

afterEach(cleanup)

describe('StatewaveVsSupermemoryPage: benchmark figures', () => {
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

  it('states the hybrid retrieval lift figures shown on /vs/letta and /vs/zep', () => {
    const { container } = renderPage()
    expect(container.textContent).toContain('LoCoMo +2.1')
    expect(container.textContent).toContain('LongMemEval +16.0')
  })

  it('shows Supermemory\'s own published retrieval figures, labeled apart from Statewave\'s', () => {
    const { container } = renderPage()
    expect(container.textContent).toContain('59.7%')
    expect(container.textContent).toContain('83.5%')
    expect(container.textContent).toContain('95%')
    expect(container.textContent).toMatch(/Read these apart, not against each other/)
  })
})

describe('StatewaveVsSupermemoryPage: claims', () => {
  it('counts the ranking signals it actually shows', () => {
    const { container } = renderPage()
    expect(container.textContent).toContain('ranking signals, deterministic')
    expect(screen.queryByText('SEMANTIC SIMILARITY')).toBeNull()
    expect(container.textContent).toMatch(/4\s*ranking signals/)
  })

  it('uses raw_episode, not artifact_ref, as the fourth kind-priority bar', () => {
    // ProductPage's scoring model and /vs/letta and /vs/zep both score
    // profile_fact=10, procedure=8, episode_summary=5, raw_episode=3.
    // The source design mock used artifact_ref=4 for this bar; that figure
    // doesn't match the shipped scoring model and should not appear here.
    const { container } = renderPage()
    expect(container.textContent).toContain('raw_episode')
    expect(container.textContent).not.toContain('artifact_ref')
  })

  it('uses the site\'s additive scoring formula, not the mock\'s multiplicative one', () => {
    const { container } = renderPage()
    expect(container.textContent).toContain('score = priority + recency + relevance + validity')
    expect(container.textContent).not.toMatch(/rank = priority.*recency.*relevance.*validity.*similarity/)
  })

  it('never uses an em dash anywhere on the page', () => {
    const { container } = renderPage()
    expect(container.textContent).not.toContain('—')
  })
})

describe('StatewaveVsSupermemoryPage: comparison table', () => {
  it('renders the retrieval, governance, and ops row groups', () => {
    const { container } = renderPage()
    expect(container.textContent).toContain('RETRIEVAL & RANKING')
    expect(container.textContent).toContain('GOVERNANCE & PROVENANCE')
    expect(container.textContent).toContain('OPERATIONS & LICENSING')
  })
})
