import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './lib/theme'
import { ChatWidgetProvider } from './lib/widget-context'
import './index.css'
import App from './App'

const container = document.getElementById('root')!

const tree = (
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ChatWidgetProvider>
          <App />
        </ChatWidgetProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)

// In production builds the `scripts/prerender.mjs` step injects the
// server-rendered homepage markup into the `<div id="root">` placeholder,
// so we hydrate on top of that DOM. In `vite dev` (and on any route the
// prerender step doesn't cover) the root is empty, so we fall back to a
// fresh client render.
if (container.hasChildNodes()) {
  hydrateRoot(container, tree)
} else {
  createRoot(container).render(tree)
}
