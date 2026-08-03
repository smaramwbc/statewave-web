/**
 * /benchmarks: the LoCoMo + LongMemEval scoreboard page.
 *
 * These tests lock down the properties the page's credibility rests on, and
 * the accessibility contract of its chart:
 *
 *   - every rendered figure derives from the SYSTEMS table (no drift between
 *     the headline deltas and the underlying scores)
 *   - each chart bar is individually labeled, so identity and value are never
 *     carried by color alone
 *   - a legend names all three series
 *   - FAQ answers stay in the DOM while collapsed (crawlers + Ctrl-F)
 *   - the in-page section nav points at anchors that actually exist
 */
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, within, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ThemeProvider } from '../src/lib/theme'
import { BenchmarksPage } from '../src/pages/BenchmarksPage'

function renderPage() {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={['/benchmarks']}>
        <BenchmarksPage />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

afterEach(cleanup)

describe('BenchmarksPage: figures', () => {
  it('states the headline lead over the open-source peer consistently', () => {
    const { container } = renderPage()
    // 0.905 − 0.866 = +0.039 (LoCoMo), 0.967 − 0.833 = +0.134 (LongMemEval).
    // Both are computed in the page, so a wrong score surfaces here.
    expect(container.innerHTML).toContain('+0.039')
    expect(container.innerHTML).toContain('+0.134')
  })

  it('never claims a reproduction of mem0’s published gpt-5 figures', () => {
    const { container } = renderPage()
    expect(container.innerHTML).toMatch(/not a reproduction/i)
  })

  it('discloses the zoomed axis rather than hiding it', () => {
    renderPage()
    expect(screen.getAllByText('0.80').length).toBeGreaterThan(0)
    expect(screen.getAllByText('1.00').length).toBeGreaterThan(0)
  })
})

describe('BenchmarksPage: chart accessibility', () => {
  it('labels every bar with its system and score, not color alone', () => {
    renderPage()
    // Two panels (LoCoMo + LongMemEval) x three systems = six labeled bars.
    const bars = screen.getAllByRole('img')
    expect(bars).toHaveLength(6)

    expect(
      screen.getByLabelText(/Statewave, LoCoMo score 0\.905/i),
    ).toBeTruthy()
    expect(
      screen.getByLabelText(/mem0 OSS, LongMemEval score 0\.833.*leads by \+0\.134/i),
    ).toBeTruthy()
  })

  it('renders a legend naming all three series', () => {
    renderPage()
    const legend = screen.getByRole('list', { name: /chart series/i })
    expect(within(legend).getByText('Statewave')).toBeTruthy()
    expect(within(legend).getByText('mem0 cloud')).toBeTruthy()
    expect(within(legend).getByText('mem0 OSS')).toBeTruthy()
  })
})

describe('BenchmarksPage: interaction', () => {
  it('lets the reader collapse the zoomed axis back to full scale', () => {
    renderPage()
    const group = screen.getByRole('radiogroup', { name: /axis scale/i })
    const zoomed = within(group).getByRole('radio', { name: '0.80–1.00' })
    const full = within(group).getByRole('radio', { name: '0–1.00' })

    // Zoomed is the default, but the honest full-scale view is one click away.
    expect(zoomed).toHaveAttribute('aria-checked', 'true')
    expect(full).toHaveAttribute('aria-checked', 'false')

    fireEvent.click(full)
    expect(full).toHaveAttribute('aria-checked', 'true')
    expect(zoomed).toHaveAttribute('aria-checked', 'false')
    // Axis ticks re-render for the new scale.
    expect(screen.getAllByText('0.25').length).toBeGreaterThan(0)
  })

  it('keeps every printed score equal to its own label on both axes', () => {
    renderPage()
    const group = screen.getByRole('radiogroup', { name: /axis scale/i })

    // Regression: the scores were briefly derived from their bar's position on
    // the axis, so flipping the scale re-rendered against the new bounds while
    // the bars were still travelling and printed figures nobody measured —
    // 0.905 showing as 0.981. The axis changes how a score is drawn, never
    // what it reads.
    for (const axis of ['0–1.00', '0.80–1.00']) {
      fireEvent.click(within(group).getByRole('radio', { name: axis }))
      for (const bar of screen.getAllByRole('img')) {
        const score = bar.getAttribute('aria-label')?.match(/score (\d\.\d{3})/)?.[1]
        expect(score, `bar has no score in its label on the ${axis} axis`).toBeTruthy()
        expect(bar.textContent, `printed score disagrees with its label on ${axis}`).toContain(
          score,
        )
      }
    }
  })

  it('isolates a single series from the legend, and releases it', () => {
    renderPage()
    const legend = screen.getByRole('list', { name: /chart series/i })
    const statewave = within(legend).getByRole('button', { name: /Statewave/ })

    expect(statewave).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(statewave)
    expect(statewave).toHaveAttribute('aria-pressed', 'true')
    // Clicking the isolated series again clears the filter rather than
    // trapping the reader in a single-series view.
    fireEvent.click(statewave)
    expect(statewave).toHaveAttribute('aria-pressed', 'false')
  })

  it('switches the reproduce command between backends', () => {
    renderPage()
    const tabs = screen.getByRole('tablist', { name: /backend/i })
    const cloud = within(tabs).getByRole('tab', { name: /mem0 cloud/i })

    // Statewave is selected first; its command is the one on screen.
    expect(screen.getByRole('tabpanel').textContent).toContain('--backend statewave')

    fireEvent.click(cloud)
    expect(cloud).toHaveAttribute('aria-selected', 'true')
    const panel = screen.getByRole('tabpanel')
    expect(panel.textContent).toContain('--backend cloud')
    expect(panel.textContent).not.toContain('--backend statewave')
  })

  it('shows the backend’s own published figures as the expected result', () => {
    const { container } = renderPage()
    const run = container.querySelector('#run')
    expect(run, 'reproduce section must exist').toBeTruthy()

    // Step 3 answers "did my run work?", so it has to track the command in
    // step 2 rather than sitting on whichever backend rendered first.
    expect(run!.textContent).toContain('0.905')
    expect(run!.textContent).toContain('0.967')

    const tabs = screen.getByRole('tablist', { name: /backend/i })
    fireEvent.click(within(tabs).getByRole('tab', { name: /mem0 OSS/i }))
    expect(run!.textContent).toContain('0.866')
    expect(run!.textContent).toContain('0.833')
    expect(run!.textContent).not.toContain('0.905')
  })

  it('scopes the retrieval caveat to the backend it qualifies', () => {
    const { container } = renderPage()
    const run = container.querySelector('#run')!

    // The ≤20 cap is a mem0 OSS library default. On the Statewave tab it is
    // noise; on the OSS tab it is material to reading the score.
    expect(run.textContent).not.toMatch(/≤20 memories\/query/)

    const tabs = screen.getByRole('tablist', { name: /backend/i })
    fireEvent.click(within(tabs).getByRole('tab', { name: /mem0 OSS/i }))
    expect(run.textContent).toMatch(/≤20 memories\/query/)
  })
})

describe('BenchmarksPage: structure', () => {
  it('keeps FAQ answers in the DOM while collapsed', () => {
    renderPage()
    // The last FAQ is closed by default; its answer text must still be
    // present so search engines and in-page find can reach it.
    expect(screen.getByText(/the layer that ingests, stores, and retrieves/i)).toBeTruthy()
  })

  it('points the section nav at anchors that exist on the page', () => {
    const { container } = renderPage()
    const nav = screen.getByRole('navigation', { name: /benchmark sections/i })
    const links = within(nav).getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)

    for (const link of links) {
      const id = link.getAttribute('href')?.replace('#', '')
      expect(id, 'nav link must have a hash href').toBeTruthy()
      expect(
        container.querySelector(`#${id}`),
        `no section with id "${id}" for nav link`,
      ).toBeTruthy()
    }
  })
})
