/**
 * Chat Widget Tests
 * 
 * Basic smoke tests for the widget functionality.
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '../src/lib/theme'
import { ChatWidgetProvider } from '../src/lib/widget-context'
import { ChatWidget } from '../src/components/ChatWidget'

// Test wrapper
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ChatWidgetProvider>
          {children}
        </ChatWidgetProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

describe('ChatWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders launcher button in collapsed state', () => {
    render(
      <TestWrapper>
        <ChatWidget />
      </TestWrapper>
    )

    expect(screen.getByText('Try the demo')).toBeInTheDocument()
  })
})
