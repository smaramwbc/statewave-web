/**
 * Onboarding tests for the chat widget.
 *
 * Covers the v1 welcome panel: it appears on first open, dismisses cleanly,
 * persists the dismissal in localStorage, and behaves correctly across
 * common visitor flows. We mock fetch up-front so the preload effect doesn't
 * try to hit the real /api/* during tests.
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor, cleanup } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '../src/lib/theme'
import { ChatWidgetProvider } from '../src/lib/widget-context'
import { ChatWidget } from '../src/components/ChatWidget'

const ONBOARDING_KEY = 'statewave-demo-onboarding-v1'

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ChatWidgetProvider>{children}</ChatWidgetProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

/**
 * Stubs every fetch call the widget makes so the preload + chat flows resolve
 * without network. Returns a controllable spy so individual tests can assert
 * what was called.
 */
function stubAllFetches() {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = typeof input === 'string' ? input : (input as Request).url
    if (url.includes('/api/demo-state')) {
      return new Response(
        JSON.stringify({
          subjectId: 'demo_web_test__support-agent',
          isNew: false,
          episodes: [],
          memories: [],
          episodeCount: 0,
          persona: 'support-agent',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      )
    }
    if (url.includes('/api/demo-seed')) {
      return new Response(
        JSON.stringify({ seeded: true, copied: 0, episodeCount: 0, memories: [] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      )
    }
    if (url.includes('/api/widget-chat')) {
      return new Response(
        JSON.stringify({ reply: 'ok', subjectId: 'demo_web_test__support-agent' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      )
    }
    return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } })
  })
}

describe('Widget onboarding — welcome panel', () => {
  beforeEach(() => {
    window.localStorage.clear()
    stubAllFetches()
  })
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('shows the welcome panel on first open (no localStorage flag yet)', async () => {
    render(
      <TestWrapper>
        <ChatWidget />
      </TestWrapper>,
    )

    // Click the floating launcher to open the widget.
    fireEvent.click(screen.getByText('Try the demo'))

    // Headline is visible
    expect(await screen.findByText(/Try Statewave with real memory/i)).toBeInTheDocument()
    // Skip link is reachable
    expect(screen.getByText(/skip onboarding/i)).toBeInTheDocument()
    // The comparison columns should NOT render yet
    expect(screen.queryByText(/Without Memory/i)).toBeNull()
  })

  it('skip onboarding dismisses the panel and reveals the comparison columns', async () => {
    render(
      <TestWrapper>
        <ChatWidget />
      </TestWrapper>,
    )

    fireEvent.click(screen.getByText('Try the demo'))
    const skip = await screen.findByText(/skip onboarding/i)

    act(() => {
      fireEvent.click(skip)
    })

    // Welcome is gone, columns are visible.
    await waitFor(() => {
      expect(screen.queryByText(/Try Statewave with real memory/i)).toBeNull()
    })
    expect(screen.getByText(/Without Memory/i)).toBeInTheDocument()
    // localStorage flag persisted.
    const raw = window.localStorage.getItem(ONBOARDING_KEY)
    expect(raw).toBeTruthy()
    expect(JSON.parse(raw!).welcomeSeenAt).toEqual(expect.any(Number))
  })

  it('does not re-show the welcome panel for visitors who have dismissed it before', async () => {
    // Simulate a returning visitor who has already seen + dismissed the welcome.
    window.localStorage.setItem(
      ONBOARDING_KEY,
      JSON.stringify({ welcomeSeenAt: Date.now() - 60_000 }),
    )

    render(
      <TestWrapper>
        <ChatWidget />
      </TestWrapper>,
    )

    fireEvent.click(screen.getByText('Try the demo'))

    // Comparison columns appear immediately, no welcome.
    expect(await screen.findByText(/Without Memory/i)).toBeInTheDocument()
    expect(screen.queryByText(/Try Statewave with real memory/i)).toBeNull()
  })

  it('clicking a welcome suggestion chip auto-dismisses and sends a message', async () => {
    const fetchSpy = stubAllFetches()
    // Ensure no prior dismissal so the welcome shows.
    window.localStorage.clear()

    render(
      <TestWrapper>
        <ChatWidget />
      </TestWrapper>,
    )

    fireEvent.click(screen.getByText('Try the demo'))
    // The welcome's "Try a question" chips are the support-agent suggestions.
    const chip = await screen.findByText(/Did my \$50 refund go through\?/i)

    act(() => {
      fireEvent.click(chip)
    })

    await waitFor(() => {
      // Welcome dismissed (columns visible).
      expect(screen.getByText(/Without Memory/i)).toBeInTheDocument()
    })
    // localStorage flag set.
    expect(window.localStorage.getItem(ONBOARDING_KEY)).toBeTruthy()
    // /api/widget-chat was called twice (stateless + statewave modes).
    const chatCalls = fetchSpy.mock.calls.filter(
      ([url]) => typeof url === 'string' && url.includes('/api/widget-chat'),
    )
    expect(chatCalls.length).toBeGreaterThanOrEqual(2)
  })

  it('exposes a "What is this demo?" header button that re-opens the welcome', async () => {
    // Visitor has already dismissed the welcome AND completed the tour.
    window.localStorage.setItem(
      ONBOARDING_KEY,
      JSON.stringify({
        welcomeSeenAt: Date.now() - 60_000,
        tourCompletedAt: Date.now() - 60_000,
      }),
    )

    render(
      <TestWrapper>
        <ChatWidget />
      </TestWrapper>,
    )

    fireEvent.click(screen.getByText('Try the demo'))
    // Comparison columns visible (welcome dismissed before).
    await screen.findByText(/Without Memory/i)

    const helpBtn = screen.getByLabelText(/Show demo intro/i)
    act(() => {
      fireEvent.click(helpBtn)
    })

    // Welcome panel returns.
    expect(await screen.findByText(/Try Statewave with real memory/i)).toBeInTheDocument()
  })
})

describe('Widget onboarding — guided tour', () => {
  beforeEach(() => {
    window.localStorage.clear()
    stubAllFetches()
  })
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('starts the tour at step 1 immediately after the welcome is dismissed', async () => {
    render(
      <TestWrapper>
        <ChatWidget />
      </TestWrapper>,
    )

    fireEvent.click(screen.getByText('Try the demo'))
    // Dismiss welcome via Skip.
    act(() => {
      fireEvent.click(screen.getByText(/skip onboarding/i))
    })

    // Tour banner appears at step 1.
    const banner = await screen.findByTestId('tour-banner')
    expect(banner).toBeInTheDocument()
    expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument()
    expect(screen.getByText(/About this persona’s memory/i)).toBeInTheDocument()
  })

  it('Next + Back navigate through the tour; Got it ends and persists completion', async () => {
    render(
      <TestWrapper>
        <ChatWidget />
      </TestWrapper>,
    )

    fireEvent.click(screen.getByText('Try the demo'))
    act(() => {
      fireEvent.click(screen.getByText(/skip onboarding/i))
    })
    await screen.findByTestId('tour-banner')

    // Step 1 -> 2
    act(() => { fireEvent.click(screen.getByText('Next')) })
    expect(screen.getByText(/Step 2 of 3/i)).toBeInTheDocument()
    expect(screen.getByText(/Try a question/i)).toBeInTheDocument()

    // Step 2 -> 3
    act(() => { fireEvent.click(screen.getByText('Next')) })
    expect(screen.getByText(/Step 3 of 3/i)).toBeInTheDocument()
    expect(screen.getByText(/See what Statewave used/i)).toBeInTheDocument()

    // Back from 3 -> 2
    act(() => { fireEvent.click(screen.getByText('Back')) })
    expect(screen.getByText(/Step 2 of 3/i)).toBeInTheDocument()

    // 2 -> 3 again, then Got it closes the tour and persists completion.
    act(() => { fireEvent.click(screen.getByText('Next')) })
    act(() => { fireEvent.click(screen.getByText(/Got it/i)) })

    await waitFor(() => {
      expect(screen.queryByTestId('tour-banner')).toBeNull()
    })
    const raw = window.localStorage.getItem(ONBOARDING_KEY)!
    expect(JSON.parse(raw).tourCompletedAt).toEqual(expect.any(Number))
  })

  it('Skip tour closes the banner and persists completion immediately', async () => {
    render(
      <TestWrapper>
        <ChatWidget />
      </TestWrapper>,
    )

    fireEvent.click(screen.getByText('Try the demo'))
    act(() => {
      fireEvent.click(screen.getByText(/skip onboarding/i))
    })
    await screen.findByTestId('tour-banner')

    act(() => { fireEvent.click(screen.getByText(/skip tour/i)) })

    await waitFor(() => {
      expect(screen.queryByTestId('tour-banner')).toBeNull()
    })
    const raw = window.localStorage.getItem(ONBOARDING_KEY)!
    expect(JSON.parse(raw).tourCompletedAt).toEqual(expect.any(Number))
  })

  it('does not show the tour banner if a returning visitor already completed it', async () => {
    window.localStorage.setItem(
      ONBOARDING_KEY,
      JSON.stringify({
        welcomeSeenAt: Date.now() - 60_000,
        tourCompletedAt: Date.now() - 60_000,
      }),
    )

    render(
      <TestWrapper>
        <ChatWidget />
      </TestWrapper>,
    )

    fireEvent.click(screen.getByText('Try the demo'))
    await screen.findByText(/Without Memory/i)
    expect(screen.queryByTestId('tour-banner')).toBeNull()
  })

  it('resumes the tour for a visitor who saw welcome but never finished the tour', async () => {
    window.localStorage.setItem(
      ONBOARDING_KEY,
      JSON.stringify({
        welcomeSeenAt: Date.now() - 60_000,
        tourCompletedAt: null,
      }),
    )

    render(
      <TestWrapper>
        <ChatWidget />
      </TestWrapper>,
    )

    fireEvent.click(screen.getByText('Try the demo'))
    // Welcome doesn't show, but the tour banner resumes at step 1.
    await screen.findByText(/Without Memory/i)
    expect(await screen.findByTestId('tour-banner')).toBeInTheDocument()
    expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument()
  })
})
