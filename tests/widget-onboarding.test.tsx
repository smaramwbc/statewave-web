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
import { useChatWidget } from '../src/lib/widget-context-api'
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

/** Opens the widget in demo mode (no args = visitor-memory persona selector).
 *  The floating launcher is now the support entry point; use this helper in
 *  tests that exercise demo-only features like the guided tour. */
function DemoModeOpener() {
  const { openWidget } = useChatWidget()
  return <button type="button" onClick={() => openWidget()}>Open Demo</button>
}

/**
 * Stubs every fetch call the widget makes so the preload + chat flows resolve
 * without network. Returns a controllable spy so individual tests can assert
 * what was called.
 */
function stubAllFetches() {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const url = typeof input === 'string' ? input : (input as Request).url
    if (url.includes('/api/demo-personas')) {
      return new Response(
        JSON.stringify({ available: ['support-agent', 'statewave-support'] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      )
    }
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

    // Click the floating launcher — now the support entry point.
    fireEvent.click(screen.getByText('Ask Support'))

    // Support-mode welcome panel appears with the support-oriented heading.
    expect(await screen.findByTestId('onboarding-welcome')).toBeInTheDocument()
    expect(screen.getByText(/How can I help\?/i)).toBeInTheDocument()
    // The Next CTA is the only way forward from the welcome panel.
    expect(screen.getByRole('button', { name: /^Next$/i })).toBeInTheDocument()
    // Comparison columns (demo-only) must not render in support mode.
    expect(screen.queryByText(/Without Memory/i)).toBeNull()
  })

  it('Next dismisses the welcome panel and reveals the support chat surface', async () => {
    render(
      <TestWrapper>
        <ChatWidget />
      </TestWrapper>,
    )

    fireEvent.click(screen.getByText('Ask Support'))
    const next = await screen.findByRole('button', { name: /^Next$/i })

    act(() => {
      fireEvent.click(next)
    })

    // Welcome is gone; support-mode header and chat surface are visible.
    await waitFor(() => {
      expect(screen.queryByTestId('onboarding-welcome')).toBeNull()
    })
    expect(screen.getByTestId('support-mode-title')).toBeInTheDocument()
    // Demo comparison columns are suppressed in support mode.
    expect(screen.queryByText(/Without Memory/i)).toBeNull()
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

    fireEvent.click(screen.getByText('Ask Support'))

    // Support chat surface appears immediately — no welcome panel.
    expect(await screen.findByTestId('support-mode-title')).toBeInTheDocument()
    expect(screen.queryByTestId('onboarding-welcome')).toBeNull()
    expect(screen.queryByText(/How can I help\?/i)).toBeNull()
  })

  it('the welcome panel does not auto-send any prompt on dismiss', async () => {
    const fetchSpy = stubAllFetches()
    // Ensure no prior dismissal so the welcome shows.
    window.localStorage.clear()

    render(
      <TestWrapper>
        <ChatWidget />
      </TestWrapper>,
    )

    fireEvent.click(screen.getByText('Ask Support'))
    const next = await screen.findByRole('button', { name: /^Next$/i })

    act(() => {
      fireEvent.click(next)
    })

    // Welcome dismissed; support chat surface appears with empty input.
    await waitFor(() => {
      expect(screen.queryByTestId('onboarding-welcome')).toBeNull()
    })
    const input = screen.getByPlaceholderText(/Ask something/i) as HTMLInputElement
    expect(input.value).toBe('')
    // localStorage flag set (welcome marked seen).
    expect(window.localStorage.getItem(ONBOARDING_KEY)).toBeTruthy()
    // No /api/widget-chat call should have fired — regression guard against
    // accidental auto-send on welcome dismiss.
    const chatCalls = fetchSpy.mock.calls.filter(
      ([url]) => typeof url === 'string' && url.includes('/api/widget-chat'),
    )
    expect(chatCalls.length).toBe(0)
  })

  it('does not expose the "Show demo intro" replay button in support mode', async () => {
    // Visitor has already dismissed the welcome.
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

    fireEvent.click(screen.getByText('Ask Support'))
    // Support chat surface visible, no welcome.
    await screen.findByTestId('support-mode-title')

    // The "Show demo intro" replay button is demo chrome — hidden in support mode.
    expect(screen.queryByLabelText(/Show demo intro/i)).toBeNull()
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
        <DemoModeOpener />
        <ChatWidget />
      </TestWrapper>,
    )

    // Open the widget in demo mode (floating launcher is now the support entry).
    fireEvent.click(screen.getByText('Open Demo'))
    // Dismiss welcome via the primary Next CTA.
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /^Next$/i }))
    })

    // Tour banner appears at step 1. Default persona is statewave-support
    // (docs-grounded), so step 1 explains the docs-grounded path rather than
    // the visitor-memory persona model.
    const banner = await screen.findByTestId('tour-banner')
    expect(banner).toBeInTheDocument()
    expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument()
    expect(screen.getByText(/Grounded in the official docs/i)).toBeInTheDocument()
  })

  it('Next + Back navigate through the tour; Got it ends and persists completion', async () => {
    render(
      <TestWrapper>
        <DemoModeOpener />
        <ChatWidget />
      </TestWrapper>,
    )

    fireEvent.click(screen.getByText('Open Demo'))
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /^Next$/i }))
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
        <DemoModeOpener />
        <ChatWidget />
      </TestWrapper>,
    )

    fireEvent.click(screen.getByText('Open Demo'))
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /^Next$/i }))
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
        <DemoModeOpener />
        <ChatWidget />
      </TestWrapper>,
    )

    fireEvent.click(screen.getByText('Open Demo'))
    await screen.findByText(/Without Memory/i)
    expect(screen.queryByTestId('tour-banner')).toBeNull()
  })

  it('moves the tour-pulse highlight class to the right target on each step', async () => {
    render(
      <TestWrapper>
        <DemoModeOpener />
        <ChatWidget />
      </TestWrapper>,
    )

    fireEvent.click(screen.getByText('Open Demo'))
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /^Next$/i }))
    })
    await screen.findByTestId('tour-banner')

    const personaTarget = document.querySelector('[data-tour-target="persona"]') as HTMLElement
    const askTarget = document.querySelector('[data-tour-target="ask"]') as HTMLElement
    const inspectTarget = document.querySelector('[data-tour-target="inspect"]') as HTMLElement
    expect(personaTarget).toBeTruthy()
    expect(askTarget).toBeTruthy()
    expect(inspectTarget).toBeTruthy()

    // Step 1 → only persona is pulsing.
    expect(personaTarget.classList.contains('tour-pulse')).toBe(true)
    expect(askTarget.classList.contains('tour-pulse')).toBe(false)
    expect(inspectTarget.classList.contains('tour-pulse')).toBe(false)

    // Advance to step 2 → only ask form is pulsing.
    act(() => { fireEvent.click(screen.getByText('Next')) })
    expect(personaTarget.classList.contains('tour-pulse')).toBe(false)
    expect(askTarget.classList.contains('tour-pulse')).toBe(true)
    expect(inspectTarget.classList.contains('tour-pulse')).toBe(false)

    // Advance to step 3 → only inspect button is pulsing.
    act(() => { fireEvent.click(screen.getByText('Next')) })
    expect(personaTarget.classList.contains('tour-pulse')).toBe(false)
    expect(askTarget.classList.contains('tour-pulse')).toBe(false)
    expect(inspectTarget.classList.contains('tour-pulse')).toBe(true)

    // Got it → no element pulses.
    act(() => { fireEvent.click(screen.getByText(/Got it/i)) })
    await waitFor(() => {
      expect(screen.queryByTestId('tour-banner')).toBeNull()
    })
    expect(personaTarget.classList.contains('tour-pulse')).toBe(false)
    expect(askTarget.classList.contains('tour-pulse')).toBe(false)
    expect(inspectTarget.classList.contains('tour-pulse')).toBe(false)
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
        <DemoModeOpener />
        <ChatWidget />
      </TestWrapper>,
    )

    fireEvent.click(screen.getByText('Open Demo'))
    // Welcome doesn't show, but the tour banner resumes at step 1.
    await screen.findByText(/Without Memory/i)
    expect(await screen.findByTestId('tour-banner')).toBeInTheDocument()
    expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument()
  })
})

/**
 * Support mode — the focused production support channel opened from the
 * "Ask Support" navbar button or `?ask=support` deep link. It must look
 * and feel different from the demo flow: no persona picker, no comparison
 * columns, no demo language, no guided tour.
 */
describe('Widget — Ask Support (support mode)', () => {
  beforeEach(() => {
    window.localStorage.clear()
    stubAllFetches()
    // Clean URL between tests so the deep-link effect runs fresh.
    window.history.replaceState({}, '', '/')
  })
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    window.history.replaceState({}, '', '/')
  })

  it('opens directly in support mode via the ?ask=support deep link', async () => {
    window.history.replaceState({}, '', '/?ask=support')

    render(
      <TestWrapper>
        <ChatWidget />
      </TestWrapper>,
    )

    // Static "Statewave Support" title appears (not the persona dropdown
    // button) — the deep link bypasses the launcher and lands the visitor
    // straight in the support channel.
    expect(await screen.findByTestId('support-mode-title')).toBeInTheDocument()
  })

  it('does not render the persona picker or any persona/demo choices', async () => {
    window.history.replaceState({}, '', '/?ask=support')

    render(
      <TestWrapper>
        <ChatWidget />
      </TestWrapper>,
    )

    await screen.findByTestId('support-mode-title')

    // The picker dropdown trigger lives under data-tour-target="persona" in
    // demo mode. It must not render in support mode.
    expect(document.querySelector('[data-tour-target="persona"]')).toBeNull()
    // None of the visitor-memory persona labels should be visible (no
    // dropdown, no chips).
    expect(screen.queryByText(/^Support Agent$/)).toBeNull()
    expect(screen.queryByText(/^Coding Assistant$/)).toBeNull()
    expect(screen.queryByText(/^Sales Copilot$/)).toBeNull()
  })

  it('does not render the dual-column comparison ("Without Memory" / "With Statewave")', async () => {
    window.history.replaceState({}, '', '/?ask=support')

    render(
      <TestWrapper>
        <ChatWidget />
      </TestWrapper>,
    )

    // Dismiss the support welcome so the chat surface renders — that's
    // where the column subheaders live.
    const next = await screen.findByRole('button', { name: /^Next$/i })
    act(() => { fireEvent.click(next) })
    await waitFor(() => {
      expect(screen.queryByTestId('onboarding-welcome')).toBeNull()
    })

    // Demo-flavored comparison subheaders must be gone. Match exact header
    // strings — loose regex would also match suggestion-chip text like
    // "How is Statewave different from vector memory?".
    expect(screen.queryByText('Without Memory')).toBeNull()
    expect(screen.queryByText('With Statewave')).toBeNull()
    // The trust strip replacing them references docs grounding.
    expect(screen.getByText(/grounded in Statewave docs/i)).toBeInTheDocument()
  })

  it('shows support-oriented welcome copy with no demo or persona language', async () => {
    window.history.replaceState({}, '', '/?ask=support')

    render(
      <TestWrapper>
        <ChatWidget />
      </TestWrapper>,
    )

    const welcome = await screen.findByTestId('onboarding-welcome')
    // Support-oriented intro is present.
    expect(welcome).toHaveTextContent(/Statewave support assistant/i)
    expect(welcome).toHaveTextContent(/setup, memory concepts, integrations/i)
    // None of the demo-flavored phrases the brief calls out should appear.
    expect(welcome).not.toHaveTextContent(/try a demo/i)
    expect(welcome).not.toHaveTextContent(/pick a persona/i)
    expect(welcome).not.toHaveTextContent(/play around/i)
    expect(welcome).not.toHaveTextContent(/only a demo/i)
    expect(welcome).not.toHaveTextContent(/per-visitor memory persona/i)
  })

  it('does not start the guided tour after dismissing the support welcome', async () => {
    window.history.replaceState({}, '', '/?ask=support')

    render(
      <TestWrapper>
        <ChatWidget />
      </TestWrapper>,
    )

    const next = await screen.findByRole('button', { name: /^Next$/i })
    act(() => { fireEvent.click(next) })

    // Welcome dismisses but the tour banner — the demo-only walkthrough —
    // must not appear in the support channel.
    await waitFor(() => {
      expect(screen.queryByTestId('onboarding-welcome')).toBeNull()
    })
    expect(screen.queryByTestId('tour-banner')).toBeNull()
  })

  it('does not expose the internal subject id in the header', async () => {
    window.history.replaceState({}, '', '/?ask=support')

    render(
      <TestWrapper>
        <ChatWidget />
      </TestWrapper>,
    )

    await screen.findByTestId('support-mode-title')
    // The demo-flow header shows the visitor's Statewave subject id; the
    // support channel must hide that — visitors should never see internal
    // routing identifiers in a production support UI.
    expect(screen.queryByText(/^demo_web_/)).toBeNull()
    expect(screen.queryByText(/^statewave-support-docs$/)).toBeNull()
  })

  it('the floating launcher opens the support channel (not the demo)', async () => {
    // No deep link — visitor clicks the floating "Ask Support" launcher.
    render(
      <TestWrapper>
        <ChatWidget />
      </TestWrapper>,
    )

    fireEvent.click(screen.getByText('Ask Support'))

    // Support-mode static title is present; demo persona picker is absent.
    expect(await screen.findByTestId('support-mode-title')).toBeInTheDocument()
    // Support welcome heading — not the demo marketing copy.
    expect(screen.getByText(/How can I help\?/i)).toBeInTheDocument()
    expect(screen.queryByText(/Ask Statewave Support/i)).toBeNull()
  })

  it('only fires the statewave /api/widget-chat call per turn — no stateless comparison fetch', async () => {
    const fetchSpy = stubAllFetches()
    window.history.replaceState({}, '', '/?ask=support')

    render(
      <TestWrapper>
        <ChatWidget />
      </TestWrapper>,
    )

    // Dismiss the support welcome to expose the input.
    const next = await screen.findByRole('button', { name: /^Next$/i })
    act(() => { fireEvent.click(next) })
    const input = await screen.findByPlaceholderText(/Ask something/i) as HTMLInputElement

    fireEvent.change(input, { target: { value: 'How do I get started?' } })
    const sendBtn = screen.getByRole('button', { name: /^Send$/i })
    act(() => { fireEvent.click(sendBtn) })

    // Wait until the Statewave assistant turn has resolved.
    await waitFor(() => {
      const calls = fetchSpy.mock.calls.filter(
        ([url]) => typeof url === 'string' && url.includes('/api/widget-chat'),
      )
      expect(calls.length).toBeGreaterThan(0)
    })

    const chatCalls = fetchSpy.mock.calls.filter(
      ([url]) => typeof url === 'string' && url.includes('/api/widget-chat'),
    )
    // Exactly one /api/widget-chat call per turn in support mode — the
    // stateless "without memory" comparison fetch is suppressed.
    expect(chatCalls.length).toBe(1)
    // And that one call must be the statewave-mode call, not the stateless one.
    const [, init] = chatCalls[0] as [string, RequestInit]
    const body = JSON.parse(init.body as string)
    expect(body.mode).toBe('statewave')
  })
})
