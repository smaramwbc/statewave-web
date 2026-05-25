import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { ThemeProvider } from './lib/theme'
import { ChatWidgetProvider } from './lib/widget-context'
import App from './App'

/** Render the SPA tree for a single URL into an HTML string. Used by
 *  `scripts/prerender.mjs` at build time to bake the homepage's above-the-
 *  fold markup into `dist/index.html` so the browser can paint the hero
 *  before the JS bundle finishes downloading. The client entry then
 *  hydrates on top of this markup via `hydrateRoot`. */
export function render(url: string): string {
  return renderToString(
    <StaticRouter location={url}>
      <ThemeProvider>
        <ChatWidgetProvider>
          <App />
        </ChatWidgetProvider>
      </ThemeProvider>
    </StaticRouter>,
  )
}
