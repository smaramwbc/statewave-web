import React from 'react'
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../src/lib/theme'
import { ChatWidgetProvider } from '../src/lib/widget-context'
import App from '../src/App'

afterEach(() => {
  cleanup()
})

function renderApp(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider>
        <ChatWidgetProvider>
          <App />
        </ChatWidgetProvider>
      </ThemeProvider>
    </MemoryRouter>,
  )
}

describe('Route rendering', () => {
  it('renders home page at /', async () => {
    renderApp('/')
    await waitFor(() => {
      expect(screen.getAllByText(/open-source memory runtime/i).length).toBeGreaterThan(0)
    })
  })

  it('renders product page at /product', async () => {
    renderApp('/product')
    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })
  })

  it('renders why page at /why', async () => {
    renderApp('/why')
    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })
  })

  it('renders developers page at /developers', async () => {
    renderApp('/developers')
    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })
  })

  it('renders connectors page at /connectors', async () => {
    renderApp('/connectors')
    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })
    // Connectors page must surface the headline message and the connector cards.
    await waitFor(() => {
      expect(screen.getByText(/give your agents memory/i)).toBeInTheDocument()
    })
  })

  it('renders 404 for unknown routes', async () => {
    renderApp('/unknown-page')
    await waitFor(() => {
      expect(screen.getByText('404')).toBeInTheDocument()
    })
  })
})

describe('Navbar', () => {
  it('renders navigation links', () => {
    renderApp('/')
    const navs = screen.getAllByRole('navigation', { name: /main/i })
    expect(navs.length).toBeGreaterThan(0)
    expect(screen.getAllByText('Product').length).toBeGreaterThan(0)
  })

})

describe('Accessibility', () => {
  it('has skip-to-content link', () => {
    renderApp('/')
    expect(screen.getByText('Skip to content')).toBeInTheDocument()
  })

  it('has main landmark', () => {
    renderApp('/')
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('has navigation landmark with label', () => {
    renderApp('/')
    const navs = screen.getAllByRole('navigation', { name: /main navigation/i })
    expect(navs.length).toBeGreaterThan(0)
  })
})
