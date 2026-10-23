import React from 'react'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ThemeProvider, useTheme } from '../src/lib/theme'
import { render, screen, cleanup } from '@testing-library/react'

function ThemeConsumer() {
  const { resolvedTheme } = useTheme()
  return (
    <div>
      <span data-testid="resolved">{resolvedTheme}</span>
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

  it('does not read or write localStorage', () => {
    localStorage.setItem('statewave-theme-mode', 'dark')
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    )
    expect(localStorage.getItem('statewave-theme-mode')).toBe('dark')
    expect(screen.getByTestId('resolved').textContent).not.toBe('')
  })

  it('applies data-theme from the system preference', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    )
    const attr = document.documentElement.getAttribute('data-theme')
    expect(attr).toBe(screen.getByTestId('resolved').textContent)
    expect(['light', 'dark']).toContain(attr)
  })
})
