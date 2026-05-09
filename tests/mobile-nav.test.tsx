/**
 * Mobile drawer behavior on the public site Navbar.
 *
 * What we lock down here is the contract a mobile visitor depends on, not
 * implementation details:
 *
 *   - the toggle button has tap-target sizing and ARIA wired up
 *   - opening flips the dialog into the DOM with body-scroll locked
 *   - Escape closes
 *   - clicking a link closes (so the drawer never lingers across routes)
 *
 * happy-dom does not implement the visual viewport, so we don't try to
 * assert mobile-specific Tailwind classes ("hidden on md+") at runtime;
 * the rendered DOM still contains both desktop and mobile chrome and we
 * scope queries to the dialog when needed.
 */
import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../src/lib/theme'
import { ChatWidgetProvider } from '../src/lib/widget-context'
import { Navbar } from '../src/components/Navbar'

afterEach(() => {
  cleanup()
  // Reset any scroll-lock side-effects between tests so a flaky test
  // doesn't poison the next one's body styles.
  document.documentElement.removeAttribute('data-scroll-lock')
  document.body.style.position = ''
  document.body.style.top = ''
})

beforeEach(() => {
  window.scrollTo = (() => {}) as typeof window.scrollTo
})

function renderNavbar(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider>
        <ChatWidgetProvider>
          <Navbar />
        </ChatWidgetProvider>
      </ThemeProvider>
    </MemoryRouter>,
  )
}

describe('Navbar mobile drawer', () => {
  it('toggle button has accessible label and aria-expanded', () => {
    renderNavbar()
    const toggle = screen.getByRole('button', { name: /open menu/i })
    expect(toggle).toBeInTheDocument()
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAttribute('aria-controls', 'mobile-nav-drawer')
  })

  it('toggle button meets 44×44 tap target', () => {
    renderNavbar()
    const toggle = screen.getByRole('button', { name: /open menu/i })
    // Tailwind's w-11/h-11 is 44px. We assert the class because happy-dom
    // does not run a layout pass that could produce a real measured size.
    expect(toggle.className).toMatch(/w-11/)
    expect(toggle.className).toMatch(/h-11/)
  })

  it('opens drawer with role="dialog" and locks body scroll', async () => {
    renderNavbar()
    const toggle = screen.getByRole('button', { name: /open menu/i })
    fireEvent.click(toggle)

    const dialog = await screen.findByRole('dialog', { name: /site navigation/i })
    expect(dialog).toBeInTheDocument()
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    // Body scroll lock is what keeps the page underneath from scrolling
    // when the user drags inside the drawer.
    expect(document.documentElement.dataset.scrollLock).toBe('true')
    expect(document.body.style.position).toBe('fixed')
  })

  it('renders all primary links inside the drawer', async () => {
    renderNavbar()
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))
    const dialog = await screen.findByRole('dialog', { name: /site navigation/i })
    for (const label of ['How it works', 'Why Statewave', 'Use Cases', 'Developers', 'GitHub']) {
      expect(within(dialog).getByText(label)).toBeInTheDocument()
    }
  })

  it('closes drawer on Escape and unlocks body scroll', async () => {
    renderNavbar()
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))
    await screen.findByRole('dialog', { name: /site navigation/i })

    fireEvent.keyDown(document, { key: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /site navigation/i })).not.toBeInTheDocument()
    })
    expect(document.documentElement.hasAttribute('data-scroll-lock')).toBe(false)
    expect(document.body.style.position).toBe('')
  })

  it('closes drawer when a primary link is tapped', async () => {
    renderNavbar()
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))
    const dialog = await screen.findByRole('dialog', { name: /site navigation/i })

    fireEvent.click(within(dialog).getByText('How it works'))

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /site navigation/i })).not.toBeInTheDocument()
    })
  })

  it('closes drawer when the backdrop is clicked', async () => {
    renderNavbar()
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))
    await screen.findByRole('dialog', { name: /site navigation/i })

    const backdrop = screen.getByTestId('mobile-nav-backdrop')
    fireEvent.click(backdrop)

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /site navigation/i })).not.toBeInTheDocument()
    })
  })
})
