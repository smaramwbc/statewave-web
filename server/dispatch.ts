/**
 * Web-shape dispatch — the vendor-neutral API surface.
 *
 * Every handler is a Web `(Request) => Promise<Response>` function (the
 * fetch-handler shape — Web standard, works in Node 18+, Cloudflare
 * Workers, Deno, Vercel Edge, AWS Lambda Web adapters, …). The route
 * table below maps URL paths to those handlers; everything else is just
 * thin glue.
 *
 * **No Node types in this module.** It's imported by the Vercel
 * serverless adapter (`api/[[...slug]].ts`), where `@types/node` may
 * not be on the type path. Node-shape dispatch + the IncomingMessage
 * bridge live in a separate file (`server/dispatch-node.ts`) so the
 * Vercel build doesn't drag in Node-typed code it can't resolve.
 *
 * Three callers share this dispatch:
 *
 *  1. `server/dispatch-node.ts` (and from there, `server/index.ts`
 *     and `server/vite-plugin.ts`) — the standalone Node HTTP server
 *     and the Vite dev plugin.
 *  2. `api/[[...slug]].ts` — the optional Vercel adapter.
 */

import demoPersonas from './handlers/demo-personas.js'
import demoReset from './handlers/demo-reset.js'
import demoSeed from './handlers/demo-seed.js'
import demoState from './handlers/demo-state.js'
import heroData from './handlers/hero-data.js'
import launchSignup from './handlers/launch-signup.js'
import widgetChat from './handlers/widget-chat.js'

export type FetchHandler = (req: Request) => Promise<Response>

// Path → handler. Each entry is a single endpoint; there is no
// file-system magic, no auto-discovery — adding a new endpoint is an
// explicit edit here, which is the point.
const ROUTES: Record<string, FetchHandler> = {
  '/api/demo-personas': demoPersonas,
  '/api/demo-reset': demoReset,
  '/api/demo-seed': demoSeed,
  '/api/demo-state': demoState,
  '/api/hero-data': heroData,
  '/api/launch-signup': launchSignup,
  '/api/widget-chat': widgetChat,
}

export const ROUTE_PATHS = Object.freeze(Object.keys(ROUTES))

/**
 * Web-shape dispatch — used by the Vercel adapter and the Node-shape
 * dispatch wrapper.
 *
 * Returns null when the path doesn't match any route. The caller is
 * expected to render a 404 itself; we don't synthesise one here so the
 * caller can pick its own response shape (JSON vs HTML, etc.).
 */
export async function dispatchWeb(req: Request): Promise<Response | null> {
  const url = new URL(req.url)
  const handler = ROUTES[url.pathname]
  if (!handler) return null
  return handler(req)
}
