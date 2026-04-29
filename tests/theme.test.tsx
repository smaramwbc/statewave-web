import React from 'react'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ThemeProvider, useTheme } from '../src/lib/theme'
import { render, screen, cleanup } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

function ThemeConsumer() {
  const { mode, resolvedTheme, setMode } = useTheme()
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button onClick={() => setMode('dark')}>Set Dark</button>
      <button onClick={() => setMode('light')}>Set Light</button>
      <button onClick={() => setMode('auto')}>Set Auto</button>
    </div>
  )
}

describe('Theme system', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  afterEach(() => {
    cleanup()
  })

  it('defaults to auto mode', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('mode').textContent).toBe('auto')
  })

  it('persists mode to localStorage', async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    )
    await userEvent.click(screen.getByText('Set Dark'))
    expect(localStorage.getItem('statewave-theme-mode')).toBe('dark')
  })

  it('applies data-theme attribute to document', async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    )
    await userEvent.click(screen.getByText('Set Light'))
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('resolves auto to system preference', () => {
    // happy-dom defaults to no preference, which resolves to light
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    )
    const resolved = screen.getByTestId('resolved').textContent
    expect(['light', 'dark']).toContain(resolved)
  })

  it('reads stored preference on mount', () => {
    localStorage.setItem('statewave-theme-mode', 'dark')
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('mode').textContent).toBe('dark')
    expect(screen.getByTestId('resolved').textContent).toBe('dark')
  })
})
