/**
 * Node-shape dispatch — Node `IncomingMessage` / `ServerResponse`
 * bridge over the Web-shape `dispatchWeb` in `server/dispatch.ts`.
 *
 * Used by the standalone Node server (`server/index.ts`) and the Vite
 * dev plugin. Reads the request body, builds a Web `Request`, calls
 * `dispatchWeb`, streams the `Response` back into the Node
 * `ServerResponse`.
 *
 * Kept separate from `dispatch.ts` so the Vercel serverless bundler —
 * which doesn't always have `@types/node` on its type path — can import
 * the Web-shape dispatch without trying to resolve Node-only types
 * (`Buffer`, `IncomingMessage`, etc.).
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import { Buffer } from 'node:buffer'

import { dispatchWeb } from './dispatch.js'

export { ROUTE_PATHS } from './dispatch.js'

/**
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
  const body = await readBody(req)
  const webReq = nodeRequestToWeb(req, url, body)
  const webRes = await dispatchWeb(webReq)
  if (!webRes) return false
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
      headers.set(k, v as string)
    }
  }
  // Carry the real TCP peer address into the Web Request so the
  // vendor-neutral rate limiter has an unspoofable key when there is no
  // upstream proxy (bare container / local). Behind a proxy the limiter
  // prefers Fly-Client-IP / X-Forwarded-For; this is the fallback. We
  // overwrite any inbound value of this header name so a client can't
  // pre-seed it to dodge the limit.
  const socketIp = req.socket?.remoteAddress
  if (socketIp) {
    headers.set('x-statewave-socket-ip', socketIp)
  } else {
    headers.delete('x-statewave-socket-ip')
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
