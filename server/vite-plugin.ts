/**
 * Vite dev plugin — runs the vendor-neutral dispatch in-process behind
 * `npm run dev`.
 *
 * Single-process local stack: no `vercel dev`, no remote proxy, no
 * separate API server window. Edits to `server/handlers/*.ts` hot-reload
 * via Vite's module graph.
 *
 * Dispatch lives in `server/dispatch.ts` — adding a new endpoint
 * requires editing the route table there, not this plugin.
 */
import type { Plugin, ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'

export function statewaveApiPlugin(): Plugin {
  return {
    name: 'statewave-web-api',
    async configureServer(server: ViteDevServer) {
      // ssrLoadModule keeps `server/dispatch.ts` and the handlers it
      // imports hot-reloadable on edit.
      const loadDispatch = async () => {
        const mod = await server.ssrLoadModule(
          new URL('./dispatch.ts', import.meta.url).href,
        )
        return mod as typeof import('./dispatch.js')
      }

      server.middlewares.use(async (req, res, next) => {
        const url = (req.url ?? '').split('?', 1)[0]
        if (!url.startsWith('/api/')) return next()
        try {
          const { dispatchNode } = await loadDispatch()
          const handled = await dispatchNode(
            req as IncomingMessage,
            res as ServerResponse,
          )
          if (!handled && !res.writableEnded) {
            res.statusCode = 404
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ error: 'not_found', path: url }))
          }
        } catch (err) {
          server.config.logger.error(
            `[statewave-web-api] ${url} threw: ${
              err instanceof Error ? err.stack ?? err.message : String(err)
            }`,
          )
          if (!res.writableEnded) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ error: 'internal_error' }))
          }
        }
      })

      server.config.logger.info(
        '[statewave-web-api] dispatch wired (see server/dispatch.ts for route table)',
      )
    },
  }
}
