/**
 * Vite dev plugin that runs the `api/*.ts` Edge Function handlers
 * in-process so `npm run dev` is a single-process local stack — no
 * `vercel dev`, no remote proxy.
 *
 * The same handler files are deployed to Vercel as Edge Functions in
 * production. They take a Web `Request` and return a `Response`. Node
 * 18+ provides both globals, so we can call them directly from a Vite
 * middleware: convert the Connect-style req into a `Request`, await
 * the handler, and stream the `Response` back into Vite's `res`.
 *
 * Routing: each `api/<name>.ts` is mounted at `/api/<name>`, mirroring
 * the Vercel filesystem-routing convention. Sub-handlers under
 * `api/auth/*` aren't used by the website (those live in
 * statewave-admin). Files prefixed with `_` (e.g. `_demo.ts`) are
 * shared-helper modules, not endpoints — skip them.
 */
import type { Plugin, ViteDevServer, Connect } from 'vite'
import type { ServerResponse } from 'node:http'
import { promises as fs } from 'node:fs'
import * as path from 'node:path'
import { pathToFileURL } from 'node:url'

type FetchHandler = (req: Request) => Promise<Response>

interface RouteEntry {
  path: string // e.g. "/api/widget-chat"
  file: string // absolute path to api/<name>.ts
}

async function discoverRoutes(apiDir: string): Promise<RouteEntry[]> {
  let entries: string[]
  try {
    entries = await fs.readdir(apiDir)
  } catch {
    return []
  }
  const out: RouteEntry[] = []
  for (const name of entries) {
    if (!name.endsWith('.ts')) continue
    if (name.startsWith('_')) continue // shared helpers, not endpoints
    const stem = name.slice(0, -'.ts'.length)
    out.push({
      path: `/api/${stem}`,
      file: path.join(apiDir, name),
    })
  }
  return out
}

function buildRequestFromIncoming(
  req: Connect.IncomingMessage,
  body: Buffer | null,
): Request {
  const host = (req.headers['host'] as string | undefined) ?? 'localhost'
  const proto =
    (req.headers['x-forwarded-proto'] as string | undefined) ?? 'http'
  const url = new URL(req.url ?? '/', `${proto}://${host}`)
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
  // GET/HEAD requests cannot have a body. Set body only when present.
  if (body && body.length > 0 && init.method !== 'GET' && init.method !== 'HEAD') {
    init.body = body
  }
  return new Request(url.toString(), init)
}

async function readBody(
  req: Connect.IncomingMessage,
): Promise<Buffer | null> {
  if (req.method === 'GET' || req.method === 'HEAD') return null
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return chunks.length > 0 ? Buffer.concat(chunks) : null
}

async function writeResponse(
  response: Response,
  res: ServerResponse,
): Promise<void> {
  res.statusCode = response.status
  response.headers.forEach((value, key) => {
    // Filter content-encoding — vite/connect handles compression itself.
    if (key.toLowerCase() === 'content-encoding') return
    res.setHeader(key, value)
  })
  if (!response.body) {
    res.end()
    return
  }
  const buf = Buffer.from(await response.arrayBuffer())
  res.end(buf)
}

export function statewaveApiPlugin(): Plugin {
  let routes: RouteEntry[] = []
  let apiDir = ''

  return {
    name: 'statewave-web-api',
    async configureServer(server: ViteDevServer) {
      apiDir = path.resolve(server.config.root, 'api')
      routes = await discoverRoutes(apiDir)
      if (routes.length === 0) {
        server.config.logger.warn(
          '[statewave-web-api] no api/*.ts handlers found — check working directory.',
        )
      } else {
        server.config.logger.info(
          `[statewave-web-api] mounted ${routes.length} routes: ${routes
            .map((r) => r.path)
            .join(', ')}`,
        )
      }

      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? ''
        // Strip query string for route matching — handlers parse it themselves.
        const pathname = url.split('?', 1)[0]
        const match = routes.find((r) => r.path === pathname)
        if (!match) return next()
        try {
          const body = await readBody(req)
          // Use ssrLoadModule so edits to api/*.ts hot-reload without restart.
          const mod = await server.ssrLoadModule(
            pathToFileURL(match.file).href,
          )
          const handler = (mod as { default?: FetchHandler }).default
          if (typeof handler !== 'function') {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                error: `Handler ${match.path} has no default export`,
              }),
            )
            return
          }
          const fetchReq = buildRequestFromIncoming(req, body)
          const response = await handler(fetchReq)
          await writeResponse(response, res)
        } catch (err) {
          server.config.logger.error(
            `[statewave-web-api] ${match.path} threw: ${
              err instanceof Error ? err.stack ?? err.message : String(err)
            }`,
          )
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'internal_error' }))
        }
      })
    },
  }
}
