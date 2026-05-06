/**
 * Vendor-neutral request dispatch for the statewave-web API surface.
 *
 * Every handler is a Web `(Request) => Promise<Response>` function (the
 * fetch-handler shape — Web standard, works in Node 18+, Cloudflare
 * Workers, Deno, Vercel Edge, AWS Lambda Web adapters, …). The route
 * table below maps URL paths to those handlers; everything else is just
 * thin glue.
 *
 * Three callers share this dispatch:
 *
 *  1. `server/index.ts` — the standalone Node HTTP server (the
 *     vendor-neutral run path; what `docker compose up` runs).
 *  2. `server/vite-plugin.ts` — the in-process dev server.
 *  3. `api/[[...slug]].ts` — the optional Vercel adapter.
 *
 * No handler imports anything Vercel-specific, no `runtime: 'edge'`
 * directive, no platform-specific request types. The website's API
 * surface runs anywhere Web fetch + Node 18+ run.
 */

import type { IncomingMessage, ServerResponse } from 'node:http'

import demoPersonas from './handlers/demo-personas.js'
import demoReset from './handlers/demo-reset.js'
import demoSeed from './handlers/demo-seed.js'
import demoState from './handlers/demo-state.js'
import heroData from './handlers/hero-data.js'
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
  '/api/widget-chat': widgetChat,
}

export const ROUTE_PATHS = Object.freeze(Object.keys(ROUTES))

/**
 * Web-shape dispatch — used by the Vercel adapter and any other
 * caller that already has a Web `Request` in hand.
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

/**
 * Node-HTTP dispatch — used by the standalone server (`server/index.ts`)
 * and the Vite dev plugin. Reads the request body, builds a Web
 * `Request`, calls the handler, streams the `Response` back into the
 * Node `ServerResponse`.
 *
 * Returns true when a route matched (response written), false when the
 * caller should handle the path itself (e.g. SPA static serving).
 */
export async function dispatchNode(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<boolean> {
  const url = new URL(
    req.url ?? '/',
    `http://${req.headers.host ?? 'localhost'}`,
  )
  if (!ROUTES[url.pathname]) return false

  const body = await readBody(req)
  const webReq = nodeRequestToWeb(req, url, body)
  const webRes = await dispatchWeb(webReq)
  if (!webRes) {
    // Shouldn't reach — we already checked ROUTES has this path. Defensive.
    return false
  }
  await writeWebResponseToNode(webRes, res)
  return true
}

// ─── Internal helpers (small, focused, no third-party deps) ──────────────

async function readBody(req: IncomingMessage): Promise<Buffer | null> {
  const method = (req.method ?? 'GET').toUpperCase()
  if (method === 'GET' || method === 'HEAD') return null
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return chunks.length > 0 ? Buffer.concat(chunks) : null
}

function nodeRequestToWeb(
  req: IncomingMessage,
  url: URL,
  body: Buffer | null,
): Request {
  const headers = new Headers()
  for (const [k, v] of Object.entries(req.headers)) {
    if (v == null) continue
    if (Array.isArray(v)) {
      for (const item of v) headers.append(k, item)
    } else {
      headers.set(k, v)
    }
  }
  const init: RequestInit = {
    method: req.method ?? 'GET',
    headers,
  }
  if (body && body.length > 0 && init.method !== 'GET' && init.method !== 'HEAD') {
    init.body = body
  }
  return new Request(url.toString(), init)
}

async function writeWebResponseToNode(
  webRes: Response,
  nodeRes: ServerResponse,
): Promise<void> {
  nodeRes.statusCode = webRes.status
  webRes.headers.forEach((value, key) => {
    // content-encoding: the response body has already been decompressed by
    // the Web `Response` adapter, so the original encoding header would
    // mislead the downstream pipe. Drop it.
    if (key.toLowerCase() === 'content-encoding') return
    nodeRes.setHeader(key, value)
  })
  if (!webRes.body) {
    nodeRes.end()
    return
  }
  const buf = Buffer.from(await webRes.arrayBuffer())
  nodeRes.end(buf)
}
