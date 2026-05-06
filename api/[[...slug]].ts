/**
 * Optional Vercel adapter for statewave-web.
 *
 * This file exists ONLY to satisfy Vercel's file-system-based router.
 * It's the only Vercel-specific file in the website tree, and all it
 * does is forward the request into the vendor-neutral dispatch in
 * `server/dispatch.ts`. Adding a new endpoint requires no edit here —
 * the dispatch table in `server/dispatch.ts` is the single source of
 * truth for routes.
 *
 * The catch-all glob `[[...slug]]` matches every `/api/*` path. Vercel's
 * Edge runtime gives us a Web `Request` with an absolute URL, which
 * `dispatchWeb` resolves via the route table — the same shape the
 * standalone Node server (`server/index.ts`) and the Vite dev plugin
 * already use internally.
 *
 * `export const config = { runtime: 'edge' }` is a Vercel-only directive
 * scoped to this Vercel-only file. Vercel's Node serverless runtime
 * passes `(req: IncomingMessage, res: ServerResponse)` — incompatible
 * with the Web fetch-handler shape we use everywhere else — so we ask
 * Vercel for the Edge runtime, which natively dispatches Web fetch
 * handlers. This directive has no effect on the standalone Node server,
 * Docker, or the Vite dev plugin.
 *
 * Anyone self-hosting statewave-web should NOT need this file — see
 * `server/index.ts` and the `Dockerfile` for the vendor-neutral run
 * path. It's safe to delete this file when not deploying to Vercel.
 */

import { dispatchWeb } from '../server/dispatch.js'

export const config = { runtime: 'edge' }

export default async function handler(req: Request): Promise<Response> {
  const res = await dispatchWeb(req)
  if (res) return res
  const url = new URL(req.url)
  return new Response(
    JSON.stringify({ error: 'not_found', path: url.pathname }),
    {
      status: 404,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    },
  )
}
