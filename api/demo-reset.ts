/**
 * POST /api/demo-reset
 *
 * Permanently deletes the visitor's Statewave subject (episodes + memories)
 * and reissues a fresh visitor cookie. Idempotent: missing subjects still
 * succeed so the UX is "reset always works".
 */

import {
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
    await deleteSubject(subjectFor(existing))
  }

  // Reissue a fresh visitor — leaves the user with a clean slate immediately
  // ready to write to.
  const newId = newVisitorId()
  return json(
    { subjectId: subjectFor(newId), reset: true },
    { setCookie: buildSetCookie(newId) },
  )
}
