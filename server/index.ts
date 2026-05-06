/**
 * Standalone Node HTTP server for statewave-web.
 *
 * This is the vendor-neutral run path — what `docker compose up`,
 * `node dist/server/index.js`, or `pm2 start` boots. No Vercel, no
 * Cloudflare, no platform-specific magic. The only Vercel-specific
 * file in the tree is `api/[[...slug]].ts`, which is a thin optional
 * adapter for the Vercel deploy and shares the same dispatch.
 *
 * Two responsibilities:
 *
 *   * Route `/api/*` requests to `server/dispatch.ts`. If `dispatch`
 *     doesn't recognise the path, we synthesise a JSON 404 here.
 *   * Serve the built SPA from `WEB_STATIC_DIR` (default `./dist`).
 *     SPA semantics: any non-file, non-`/api` path falls through to
 *     `index.html` so client-side routing works.
 *
 * Required env: STATEWAVE_URL, STATEWAVE_API_KEY (validated lazily by
 * the handlers — first request will throw a `StatewaveConfigError` if
 * missing). PORT and HOST are optional defaults for the listener.
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { promises as fs, readFileSync } from 'node:fs'
import { resolve, normalize, join, extname } from 'node:path'

import { dispatchNode, ROUTE_PATHS } from './dispatch-node.js'

// Load `.env.local` then `.env` if present, so `npm start` works after a
// plain `cp .env.local.example .env.local`. Shell / Docker `-e` /
// `vercel env` / `fly secrets` always win because we only set keys that
// are not already defined.
loadEnvFiles(['.env.local', '.env'])

const PORT = Number.parseInt(process.env.PORT ?? '8080', 10) || 8080
const HOST = process.env.HOST ?? '0.0.0.0'
const STATIC_DIR = resolve(process.env.WEB_STATIC_DIR ?? './dist')

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
}

function send404(res: ServerResponse, path: string): void {
  res.statusCode = 404
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify({ error: 'not_found', path }))
}

function send500(res: ServerResponse, err: unknown): void {
  res.statusCode = 500
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  // Surface a stable error code; full detail goes to stderr.
  res.end(JSON.stringify({ error: 'internal_error' }))
  console.error('[statewave-web] handler threw:', err)
}

// Minimal `.env` parser — no third-party dep. Skips comments / blank
// lines, supports `KEY=value` and `KEY="value with spaces"`. Stays
// intentionally simple; if you need full dotenv semantics, set the env
// in your shell / docker / platform secrets instead.
function loadEnvFiles(paths: string[]): void {
  for (const p of paths) {
    let raw: string
    try {
      raw = readFileSync(resolve(p), 'utf8')
    } catch {
      continue
    }
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq < 1) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (process.env[key] === undefined) process.env[key] = value
    }
  }
}

async function serveStatic(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const reqPath = (req.url ?? '/').split('?', 1)[0]
  // Normalise + reject path traversal. `normalize('/' + p)` collapses ..
  // segments, then we strip the leading slash.
  const safe = normalize('/' + reqPath).replace(/^\/+/, '')
  const candidates: string[] = safe ? [join(STATIC_DIR, safe)] : []
  // SPA fallback: if the request is a directory or has no file extension,
  // serve index.html so the client-side router can render the route.
  candidates.push(join(STATIC_DIR, 'index.html'))

  for (const file of candidates) {
    if (!file.startsWith(STATIC_DIR)) continue // belt-and-braces traversal guard
    try {
      const stat = await fs.stat(file)
      if (!stat.isFile()) continue
      const data = await fs.readFile(file)
      const mime = MIME[extname(file).toLowerCase()] ?? 'application/octet-stream'
      res.statusCode = 200
      res.setHeader('Content-Type', mime)
      // index.html stays uncached so SPA updates land immediately. Hashed
      // build assets are cache-friendly via Vite's filename hash.
      if (file.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      } else {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      }
      res.end(data)
      return
    } catch {
      // try next candidate
    }
  }
  send404(res, reqPath)
}

const server = createServer(async (req, res) => {
  try {
    const url = req.url ?? '/'
    const path = url.split('?', 1)[0]
    if (path.startsWith('/api/')) {
      const handled = await dispatchNode(req, res)
      if (!handled && !res.writableEnded) {
        send404(res, path)
      }
      return
    }
    await serveStatic(req, res)
  } catch (err) {
    if (!res.writableEnded) send500(res, err)
  }
})

server.listen(PORT, HOST, () => {
  console.log(`[statewave-web] listening on http://${HOST}:${PORT}`)
  console.log(`[statewave-web] static dir: ${STATIC_DIR}`)
  console.log(`[statewave-web] api routes: ${ROUTE_PATHS.join(', ')}`)
  if (!process.env.STATEWAVE_URL) {
    console.warn(
      '[statewave-web] WARNING: STATEWAVE_URL is not set. The first /api request will fail with StatewaveConfigError until it is configured.',
    )
  }
  if (!process.env.STATEWAVE_API_KEY) {
    console.warn(
      '[statewave-web] WARNING: STATEWAVE_API_KEY is not set. The first /api request will fail with StatewaveConfigError until it is configured.',
    )
  }
})

// Graceful shutdown — Docker / orchestration sends SIGTERM; let in-flight
// requests finish, then exit cleanly.
function shutdown(signal: string) {
  console.log(`[statewave-web] received ${signal}, draining...`)
  server.close((err) => {
    if (err) {
      console.error('[statewave-web] shutdown error:', err)
      process.exit(1)
    }
    process.exit(0)
  })
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
