// @vitest-environment happy-dom
/**
 * Tests for the in-message Sources row.
 *
 * Mounts the real MessageBubble (exported from ChatWidget.tsx) so the
 * assertions exercise the production rendering rules. We pin:
 *   * Sources row appears for assistant turns on the Statewave side that
 *     carry a non-empty `sources` array.
 *   * Each source link points at the doc URL, opens in a new tab, and
 *     uses the breadcrumb as its hover title.
 *   * The stateless side never renders sources, even if attached.
 *   * User turns never render sources.
 *   * Empty / missing `sources` results in no row (no "No sources" placeholder).
 */

import { afterEach, describe, it, expect } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import { ThemeProvider } from '../src/lib/theme'
import { MessageBubble } from '../src/components/ChatWidget'
import type { ChatMessage, DocSource } from '../src/lib/widget-context'

// vitest globals are not enabled, so RTL's auto-cleanup doesn't fire.
// Tear down between assertions so each `screen.queryBy*` only sees the
// current render — without this, leftover DOM from prior tests can shadow
// "I expect nothing" assertions.
afterEach(() => cleanup())

function withTheme(node: React.ReactElement) {
  return <ThemeProvider>{node}</ThemeProvider>
}

const SOURCES: DocSource[] = [
  {
    doc_path: 'architecture/overview.md',
    breadcrumb: 'Architecture Overview › Compilation pipeline',
    url: 'https://github.com/smaramwbc/statewave-docs/blob/main/architecture/overview.md#compilation-pipeline',
  },
  {
    doc_path: 'deployment/guide.md',
    breadcrumb: 'Deployment Guide › Fly.io',
    url: 'https://github.com/smaramwbc/statewave-docs/blob/main/deployment/guide.md#flyio',
  },
]

function bubble(message: ChatMessage, side: 'stateless' | 'statewave') {
  return render(
    withTheme(
      <MessageBubble message={message} side={side} isDark={true} compact={false} />,
    ),
  )
}

describe('MessageBubble Sources row', () => {
  it('renders Sources row for an assistant turn on the Statewave side', () => {
    bubble(
      {
        role: 'assistant',
        content: 'Statewave uses PostgreSQL with pgvector.',
        timestamp: 0,
        sources: SOURCES,
      },
      'statewave',
    )
    const row = screen.getByTestId('message-sources')
    expect(within(row).getByText(/sources/i)).toBeTruthy()
    const links = within(row).getAllByTestId('source-link')
    expect(links).toHaveLength(2)
    expect(links[0].getAttribute('href')).toContain('overview.md')
    expect(links[0].getAttribute('target')).toBe('_blank')
    expect(links[0].getAttribute('rel')).toBe('noopener noreferrer')
    expect(links[0].getAttribute('title')).toBe(SOURCES[0].breadcrumb)
    expect(links[0].getAttribute('data-doc-path')).toBe('architecture/overview.md')
    expect(links[0].textContent).toBe('architecture/overview.md')
  })

  it('renders no Sources row when the assistant message has no sources', () => {
    bubble(
      {
        role: 'assistant',
        content: 'I do not have a citation for this.',
        timestamp: 0,
      },
      'statewave',
    )
    expect(screen.queryByTestId('message-sources')).toBeNull()
  })

  it('renders no Sources row on the stateless side even if sources are attached', () => {
    bubble(
      {
        role: 'assistant',
        content: 'Stateless reply',
        timestamp: 0,
        sources: SOURCES,
      },
      'stateless',
    )
    expect(screen.queryByTestId('message-sources')).toBeNull()
  })

  it('renders no Sources row for user turns', () => {
    bubble(
      {
        role: 'user',
        content: 'How does Statewave work?',
        timestamp: 0,
        // Even if a buggy code path attached sources to a user turn, citations
        // are an assistant-side affordance and must never render here.
        sources: SOURCES,
      },
      'statewave',
    )
    expect(screen.queryByTestId('message-sources')).toBeNull()
  })

  it('renders no Sources row when sources is an empty array', () => {
    bubble(
      {
        role: 'assistant',
        content: 'Out of scope — please see SUPPORT.md.',
        timestamp: 0,
        sources: [],
      },
      'statewave',
    )
    expect(screen.queryByTestId('message-sources')).toBeNull()
  })
})
