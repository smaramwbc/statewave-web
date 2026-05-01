/**
 * POST /api/demo-reset
 *
 * Permanently deletes the visitor's Statewave subject (episodes + memories)
 * and reissues a fresh visitor cookie. Idempotent: missing subjects still
 * succeed so the UX is "reset always works".
 */

import {
  allSubjectsFor,
  buildSetCookie,
  deleteSubject,
  json,
  newVisitorId,
  parseDemoVisitor,
  subjectFor,
} from './_demo'

export const config = { runtime: 'edge' }

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return json({}, { status: 200 })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, { status: 405 })

  const existing = parseDemoVisitor(req.headers.get('cookie'))
  if (existing) {
    // Each persona has its own subject (`demo_web_<uuid>__<persona>`); plus a
    // legacy bare `demo_web_<uuid>` from before that layout existed. Delete
    // them all in parallel so the visitor's slate is genuinely empty.
    await Promise.all(allSubjectsFor(existing).map(deleteSubject))
  }

  // Reissue a fresh visitor — leaves the user with a clean slate immediately
  // ready to write to.
  const newId = newVisitorId()
  return json(
    { subjectId: subjectFor(newId), reset: true },
    { setCookie: buildSetCookie(newId) },
  )
}
