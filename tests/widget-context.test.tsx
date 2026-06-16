/**
 * Regression tests for ChatWidgetContext state transitions.
 *
 * These tests cover the key behaviors of the chat widget context so that
 * a migration to @statewavedev/chat-react can be verified against them.
 *
 * The provider fires a /api/demo-state fetch on mount; all tests stub fetch
 * before rendering so that async effect doesn't race the assertions.
 */

import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '../src/lib/theme'
import { ChatWidgetProvider } from '../src/lib/widget-context'
import { useChatWidget } from '../src/lib/widget-context-api'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEMO_STATE_EMPTY = {
  subjectId: 'demo-test-sub',
  isNew: false,
  episodes: [],
  memories: [],
  episodeCount: 0,
}

function makeFetch(overrides: Record<string, unknown> = {}) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : (input as Request).url
    if (url.includes('/api/demo-state')) {
      return new Response(JSON.stringify(DEMO_STATE_EMPTY), { status: 200 })
    }
    if (url.includes('/api/widget-chat')) {
      return new Response(
        JSON.stringify({ reply: 'mock reply', ...overrides }),
        { status: 200 },
      )
    }
    if (url.includes('/api/demo-seed')) {
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    }
    if (url.includes('/api/demo-reset')) {
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    }
    return new Response(JSON.stringify({}), { status: 200 })
  })
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ChatWidgetProvider>{children}</ChatWidgetProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

/** Minimal consumer that exposes context state via test IDs */
function ContextConsumer() {
  const ctx = useChatWidget()
  return (
    <div>
      <span data-testid="stateless-count">{ctx.statelessMessages.length}</span>
      <span data-testid="statewave-count">{ctx.statewaveMessages.length}</span>
      <span data-testid="is-loading">{String(ctx.isLoading)}</span>
      <button
        data-testid="send-btn"
        onClick={() => ctx.sendMessage('hello world')}
      >
        Send
      </button>
      <button
        data-testid="send-empty"
        onClick={() => ctx.sendMessage('   ')}
      >
        Send Empty
      </button>
      <button
        data-testid="open-support"
        onClick={() => ctx.openWidget('statewave-support', 'Support', 'support')}
      >
        Open Support
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ChatWidgetContext — sendMessage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', makeFetch())
  })

  it('starts with empty message arrays', async () => {
    render(<Wrapper><ContextConsumer /></Wrapper>)
    await waitFor(() =>
      expect(screen.getByTestId('stateless-count').textContent).toBe('0'),
    )
    expect(screen.getByTestId('statewave-count').textContent).toBe('0')
  })

  it('ignores empty and whitespace-only input', async () => {
    render(<Wrapper><ContextConsumer /></Wrapper>)
    await waitFor(() =>
      expect(screen.getByTestId('stateless-count').textContent).toBe('0'),
    )
    await act(async () => {
      screen.getByTestId('send-empty').click()
    })
    expect(screen.getByTestId('stateless-count').textContent).toBe('0')
    expect(screen.getByTestId('statewave-count').textContent).toBe('0')
  })

  it('appends user message to both queues immediately on send', async () => {
    let resolveFetch!: () => void
    const slowFetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : (input as Request).url
      if (url.includes('/api/demo-state')) {
        return new Response(JSON.stringify(DEMO_STATE_EMPTY), { status: 200 })
      }
      if (url.includes('/api/widget-chat')) {
        // Hang until we release it so we can assert the user message appears
        await new Promise<void>((r) => { resolveFetch = r })
        return new Response(JSON.stringify({ reply: 'reply' }), { status: 200 })
      }
      return new Response('{}', { status: 200 })
    })
    vi.stubGlobal('fetch', slowFetch)

    render(<Wrapper><ContextConsumer /></Wrapper>)
    await waitFor(() =>
      expect(screen.getByTestId('stateless-count').textContent).toBe('0'),
    )

    act(() => { screen.getByTestId('send-btn').click() })

    // User message appended synchronously, assistant reply still pending
    await waitFor(() =>
      expect(screen.getByTestId('stateless-count').textContent).toBe('1'),
    )
    expect(screen.getByTestId('statewave-count').textContent).toBe('1')
    expect(screen.getByTestId('is-loading').textContent).toBe('true')

    // Release the pending fetch
    await act(async () => { resolveFetch() })
  })

  it('sets isLoading=false after response arrives', async () => {
    render(<Wrapper><ContextConsumer /></Wrapper>)
    await waitFor(() =>
      expect(screen.getByTestId('is-loading').textContent).toBe('false'),
    )
    await act(async () => { screen.getByTestId('send-btn').click() })
    await waitFor(() =>
      expect(screen.getByTestId('is-loading').textContent).toBe('false'),
    )
    // Both queues now have user + assistant = 2 each
    expect(screen.getByTestId('stateless-count').textContent).toBe('2')
    expect(screen.getByTestId('statewave-count').textContent).toBe('2')
  })

  it('support mode sends only to statewave queue', async () => {
    render(<Wrapper><ContextConsumer /></Wrapper>)
    await waitFor(() =>
      expect(screen.getByTestId('stateless-count').textContent).toBe('0'),
    )
    // Switch to support mode
    await act(async () => { screen.getByTestId('open-support').click() })
    // Send in support mode
    await act(async () => { screen.getByTestId('send-btn').click() })
    await waitFor(() =>
      expect(screen.getByTestId('is-loading').textContent).toBe('false'),
    )

    // Support mode: only statewave queue has messages; stateless stays empty
    expect(screen.getByTestId('stateless-count').textContent).toBe('0')
    expect(Number(screen.getByTestId('statewave-count').textContent)).toBeGreaterThan(0)
  })
})

describe('ChatWidgetContext — error handling', () => {
  it('adds error bubbles to both queues when the API call fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : (input as Request).url
      if (url.includes('/api/demo-state')) {
        return new Response(JSON.stringify(DEMO_STATE_EMPTY), { status: 200 })
      }
      if (url.includes('/api/widget-chat')) {
        throw new Error('Network failure')
      }
      return new Response('{}', { status: 200 })
    }))

    render(<Wrapper><ContextConsumer /></Wrapper>)
    await waitFor(() =>
      expect(screen.getByTestId('stateless-count').textContent).toBe('0'),
    )
    await act(async () => { screen.getByTestId('send-btn').click() })
    // fetchWithRetry retries 3× with 250ms + 750ms back-off (~1 s total)
    // before propagating the error; give waitFor enough headroom.
    await waitFor(() =>
      expect(screen.getByTestId('is-loading').textContent).toBe('false'),
      { timeout: 5000 },
    )

    // user + error-bubble in both queues
    expect(Number(screen.getByTestId('stateless-count').textContent)).toBe(2)
    expect(Number(screen.getByTestId('statewave-count').textContent)).toBe(2)
  })
})
