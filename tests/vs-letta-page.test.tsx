/**
 * /vs/letta: the Statewave-vs-Letta comparison page.
 *
 * These tests lock down the properties the page's credibility rests on:
 *
 *   - every figure in the Letta panel derives from the CONTEXT_BENCH table
 *     rather than being retyped into the prose
 *   - the leaderboard strip labels each model individually, so identity and
 *     value are never carried by dot position alone
 *   - the page does not claim numbers the rest of the site disclaims
 *   - the nominative-use trademark notice stays on the page
 */
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ThemeProvider } from '../src/lib/theme'
import { StatewaveVsLettaPage } from '../src/pages/StatewaveVsLettaPage'

function renderPage() {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={['/vs/letta']}>
        <StatewaveVsLettaPage />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

afterEach(cleanup)

describe('StatewaveVsLettaPage: Letta leaderboard figures', () => {
  it('derives the spread and cost ratio from the model table', () => {
    const { container } = renderPage()
    // 93 − 37 = 56 points; $567.66 / $27.36 = 20.7 → 21×. Both are computed in
    // the page, so a mistyped row in CONTEXT_BENCH surfaces here.
    expect(container.textContent).toContain('56 pts')
    expect(container.textContent).toContain('21×')
    expect(container.textContent).toContain('$27.36')
    expect(container.textContent).toContain('$567.66')
  })

  it('names the extremes it plots rather than describing them vaguely', () => {
    const { container } = renderPage()
    expect(container.textContent).toContain('openai/gpt-5.2-codex-xhigh')
    expect(container.textContent).toContain('minimax/minimax-m2.5')
  })

  it('states the same spread in the intro copy as in the stat tile', () => {
    const { container } = renderPage()
    // The headline sentence interpolates the computed values, so the prose
    // can never drift from the chart beneath it.
    expect(container.textContent).toMatch(/swings 56 points and 21× in cost/)
  })

  it('cites the live leaderboard host, not the redirecting docs path', () => {
    const { container } = renderPage()
    expect(container.innerHTML).toContain('https://leaderboard.letta.com/')
    expect(container.innerHTML).not.toContain('docs.letta.com/leaderboard')
  })
})

describe('StatewaveVsLettaPage: chart accessibility', () => {
  it('labels every leaderboard dot with its model, score, and cost', () => {
    renderPage()
    const dots = screen.getAllByLabelText(/percent, \$/)
    expect(dots).toHaveLength(15)
    expect(
      screen.getByLabelText('openai/gpt-5.2-codex-xhigh: 93 percent, $44.46'),
    ).toBeTruthy()
  })

  it('labels each Statewave gauge with its benchmark, score, and sample size', () => {
    renderPage()
    const gauges = screen.getAllByRole('img')
    expect(gauges).toHaveLength(2)
    expect(screen.getByLabelText(/LoCoMo: 0\.905 accuracy, n=1,540/)).toBeTruthy()
    expect(screen.getByLabelText(/LongMemEval: 0\.967 accuracy, n=30/)).toBeTruthy()
  })

  it('plots every dot inside the axis it labels', () => {
    renderPage()
    // A model scoring outside the hard-coded 30–100 window would be drawn off
    // the end of the track, silently. The axis has to cover the data.
    for (const dot of screen.getAllByLabelText(/percent, \$/)) {
      const left = Number.parseFloat((dot as HTMLElement).style.left)
      expect(left, `${dot.getAttribute('aria-label')} is off-axis`).toBeGreaterThanOrEqual(0)
      expect(left, `${dot.getAttribute('aria-label')} is off-axis`).toBeLessThanOrEqual(100)
    }
  })

  it('discloses the axis the leaderboard dots are plotted on', () => {
    const { container } = renderPage()
    expect(container.textContent).toContain('30%')
    expect(container.textContent).toContain('100%')
  })
})

describe('StatewaveVsLettaPage: claims', () => {
  it('counts the ranking signals it actually shows', () => {
    const { container } = renderPage()
    // The hero stat reads its number from the SIGNALS array that renders the
    // strip, so the two can't disagree.
    expect(container.textContent).toContain('ranking signals, deterministic')
    expect(screen.queryByText('SEMANTIC SIMILARITY')).toBeNull()
    expect(container.textContent).toMatch(/4\s*ranking signals/)
  })

  it('claims no BEAM score, which /benchmarks explicitly disclaims', () => {
    const { container } = renderPage()
    expect(container.textContent).not.toContain('BEAM')
  })

  it('marks Context-Bench as non-comparable to the LoCoMo figures', () => {
    const { container } = renderPage()
    expect(container.textContent).toMatch(/not comparable to the LoCoMo/i)
  })
})
