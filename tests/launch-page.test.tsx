/**
 * /launch is now the permanent Statewave newsletter / updates page (v1.0 has
 * shipped — it is no longer a launch waitlist). These tests lock down the
 * contract a visitor depends on:
 *
 *   - newsletter framing, not a launch countdown
 *   - NO expired launch date / countdown anywhere in the rendered DOM
 *   - a single required email field (minimal data collection — no name/company)
 *   - accessible, understandable client-side validation
 *   - a visible success state after a successful submit
 */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../src/lib/theme'
import { LaunchPage } from '../src/pages/LaunchPage'

function renderPage() {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={['/launch']}>
        <LaunchPage />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('LaunchPage — newsletter', () => {
  it('frames the page as a newsletter, not a launch countdown', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /stay current with statewave/i })).toBeTruthy()
    expect(screen.getByText(/statewave v1\.0/i)).toBeTruthy()
  })

  it('renders no expired launch date or countdown', () => {
    const { container } = renderPage()
    const html = container.innerHTML
    expect(html).not.toMatch(/june 16/i)
    expect(html).not.toMatch(/launching/i)
    expect(html).not.toMatch(/countdown/i)
    expect(html).not.toMatch(/launch.?day/i)
    expect(html).not.toMatch(/notify me on launch/i)
  })

  it('collects only an email — no name/company/profiling fields', () => {
    renderPage()
    const email = screen.getByLabelText(/email/i)
    expect(email).toBeTruthy()
    expect((email as HTMLInputElement).type).toBe('email')
    // The removed profiling fields are gone. (The off-screen aria-hidden
    // honeypot keeps a "Company website" label by design — it is a bot trap,
    // not a collected field — so we assert on the real removed fields here.)
    expect(screen.queryByLabelText(/^name/i)).toBeNull()
    expect(screen.queryByLabelText(/^role/i)).toBeNull()
    expect(screen.queryByLabelText(/what would you build/i)).toBeNull()
  })

  it('shows an accessible validation error for an empty submit', async () => {
    renderPage()
    fireEvent.submit(screen.getByRole('button', { name: /subscribe/i }).closest('form')!)
    await waitFor(() => {
      const alert = screen.getByRole('alert')
      expect(alert.textContent).toMatch(/enter your email/i)
    })
  })

  it('shows a success state after a successful subscribe', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    )
    renderPage()
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'ada@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /subscribe/i }))
    await waitFor(() => {
      expect(screen.getByRole('status').textContent).toMatch(/subscribed/i)
    })
  })
})
