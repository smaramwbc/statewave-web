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
import {
  ChatWidgetProvider,
  DEMO_SUBJECTS,
  isDocsSharedPersona,
  isVisitorMemoryPersona,
  personaKind,
} from '../src/lib/widget-context'
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

describe('persona registry (front-end)', () => {
  it('exposes statewave-support as a docs-shared persona', () => {
    const sw = DEMO_SUBJECTS.find((s) => s.id === 'statewave-support')
    expect(sw).toBeDefined()
    expect(sw!.label).toBe('Statewave Support')
    expect(sw!.kind).toBe('docs-shared')
  })
  it('keeps the existing 5 personas as visitor-memory', () => {
    const visitorMemoryIds = [
      'support-agent',
      'coding-assistant',
      'sales-copilot',
      'devops-agent',
      'research-assistant',
    ]
    for (const id of visitorMemoryIds) {
      const entry = DEMO_SUBJECTS.find((s) => s.id === id)
      expect(entry, `${id} should be present`).toBeDefined()
      expect(entry!.kind).toBe('visitor-memory')
    }
  })
  it('kind helpers agree with the registry', () => {
    expect(isDocsSharedPersona('statewave-support')).toBe(true)
    expect(isDocsSharedPersona('support-agent')).toBe(false)
    expect(isVisitorMemoryPersona('support-agent')).toBe(true)
    expect(isVisitorMemoryPersona('statewave-support')).toBe(false)
    expect(personaKind('statewave-support')).toBe('docs-shared')
    expect(personaKind('not-a-persona')).toBeNull()
  })
})
