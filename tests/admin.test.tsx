import React from 'react'
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../src/lib/theme'
import App from '../src/App'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function renderApp(route = '/admin') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </MemoryRouter>,
  )
}

describe('Admin Dashboard', () => {
  beforeEach(() => {
    // Mock fetch to return dashboard data
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        readiness: {
          status: 'ready',
          checks: [
            { name: 'database', status: 'ok', detail: '', latency_ms: 1.2 },
            { name: 'queue', status: 'ok', detail: '', latency_ms: 0 },
            { name: 'llm', status: 'ok', detail: 'not configured (skip)', latency_ms: 0 },
          ],
        },
        migration: {
          current_revision: '0012_add_health_cache',
          expected_head: '0012_add_health_cache',
          is_compatible: true,
          pending_count: 0,
        },
        counts: { episodes: 1234, memories: 567, subjects: 42 },
        jobs: { completed: 100, pending: 2, failed: 0 },
        webhooks: { total: 50, delivered: 48, failed: 1, pending: 1, dead_letter: 0 },
        health_distribution: { healthy: 30, watch: 8, at_risk: 4 },
      }),
    }))
  })

  it('renders admin header', async () => {
    renderApp()
    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument()
    })
  })

  it('renders system status section', async () => {
    renderApp()
    await waitFor(() => {
      expect(screen.getByText('System Status')).toBeInTheDocument()
    })
  })

  it('renders data counts', async () => {
    renderApp()
    await waitFor(() => {
      expect(screen.getByText('1,234')).toBeInTheDocument()
      expect(screen.getByText('567')).toBeInTheDocument()
      expect(screen.getByText('42')).toBeInTheDocument()
    })
  })

  it('renders webhooks section', async () => {
    renderApp()
    await waitFor(() => {
      expect(screen.getByText('Webhooks')).toBeInTheDocument()
      expect(screen.getByText('48')).toBeInTheDocument()
    })
  })

  it('shows error state on fetch failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))
    renderApp()
    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard')).toBeInTheDocument()
    })
  })
})
