/**
 * Shared helpers for the per-visitor demo persistence flow.
 *
 * The visitor identity is held in a first-party HttpOnly cookie so client JS
 * cannot read it. The server maps the cookie to a Statewave subject of the
 * form `demo_web_<uuid>`. There is no fingerprinting and no localStorage for
 * the ID — losing the cookie just produces a fresh visitor.
 */

export const DEMO_COOKIE = 'sw_demo_visitor'
export const DEMO_SUBJECT_PREFIX = 'demo_web_'
export const DEMO_COOKIE_MAX_AGE_S = 60 * 60 * 24 * 30 // 30 days
export const DEMO_EPISODE_CAP = 200
export const DEMO_MAX_MESSAGE_CHARS = 1000

function statewaveUrl(): string {
  return process.env.STATEWAVE_URL ?? 'https://statewave-api.fly.dev'
}
function statewaveApiKey(): string {
  return process.env.STATEWAVE_API_KEY ?? ''
}

export interface VisitorInfo {
  subjectId: string
  isNew: boolean
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function parseDemoVisitor(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null
  const parts = cookieHeader.split(';')
  for (const raw of parts) {
    const idx = raw.indexOf('=')
    if (idx < 0) continue
    const name = raw.slice(0, idx).trim()
    if (name !== DEMO_COOKIE) continue
    const value = decodeURIComponent(raw.slice(idx + 1).trim())
    return UUID_RE.test(value) ? value : null
  }
  return null
}

export function newVisitorId(): string {
  return crypto.randomUUID()
}

export function subjectFor(visitorId: string): string {
  return `${DEMO_SUBJECT_PREFIX}${visitorId.replace(/-/g, '')}`
}

export function buildSetCookie(visitorId: string, isProd = process.env.NODE_ENV === 'production'): string {
  const attrs = [
    `${DEMO_COOKIE}=${visitorId}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${DEMO_COOKIE_MAX_AGE_S}`,
  ]
  if (isProd) attrs.push('Secure')
  return attrs.join('; ')
}

export function getOrIssueVisitor(req: Request): VisitorInfo {
  const existing = parseDemoVisitor(req.headers.get('cookie'))
  if (existing) return { subjectId: subjectFor(existing), isNew: false }
  const id = newVisitorId()
  return { subjectId: subjectFor(id), isNew: true }
}

interface JsonResponseOptions {
  status?: number
  setCookie?: string | null
}

export function json(data: unknown, opts: JsonResponseOptions = {}): Response {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
  }
  const h = new Headers(headers)
  if (opts.setCookie) h.append('Set-Cookie', opts.setCookie)
  return new Response(JSON.stringify(data), { status: opts.status ?? 200, headers: h })
}

interface TimelineMemory {
  id: string
  content?: string
  summary?: string
  kind?: string
  confidence?: number
}

interface TimelineEpisode {
  id: string
  source?: string
  type?: string
  /** Free-form. Showcase subjects use a mix of shapes — preserve verbatim when copying. */
  payload?: unknown
  created_at?: string
}

export interface TimelineResult {
  episodes: TimelineEpisode[]
  memories: TimelineMemory[]
}

export async function fetchTimeline(subjectId: string): Promise<TimelineResult> {
  const resp = await fetch(`${statewaveUrl()}/v1/timeline?subject_id=${encodeURIComponent(subjectId)}&limit=200`, {
    headers: { 'X-API-Key': statewaveApiKey() },
  })
  if (!resp.ok) return { episodes: [], memories: [] }
  return (await resp.json()) as TimelineResult
}

export async function writeEpisode(
  subjectId: string,
  payload: unknown,
  metadata: Record<string, unknown> = {},
  source = 'demo-web-chat',
  type = 'conversation',
): Promise<boolean> {
  const resp = await fetch(`${statewaveUrl()}/v1/episodes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': statewaveApiKey() },
    body: JSON.stringify({
      subject_id: subjectId,
      source,
      type,
      payload,
      metadata,
    }),
  })
  return resp.ok
}

export async function compileMemories(subjectId: string): Promise<void> {
  // Fire-and-forget on the latency-critical path; failure is logged but does
  // not block the user response. Compilation is idempotent so retrying is safe.
  try {
    await fetch(`${statewaveUrl()}/v1/memories/compile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': statewaveApiKey() },
      body: JSON.stringify({ subject_id: subjectId }),
    })
  } catch (err) {
    console.warn('[demo] compile failed:', err)
  }
}

export async function deleteSubject(subjectId: string): Promise<boolean> {
  const resp = await fetch(`${statewaveUrl()}/v1/subjects/${encodeURIComponent(subjectId)}`, {
    method: 'DELETE',
    headers: { 'X-API-Key': statewaveApiKey() },
  })
  // 200 = deleted, 404 = nothing to delete (still success for our purposes)
  return resp.ok || resp.status === 404
}

export interface ContextBundle {
  subject_id: string
  task: string
  facts: Array<{ id: string; content: string; kind: string; confidence: number }>
  procedures: Array<{ id: string; content: string; kind: string; confidence: number }>
  assembled_context: string
  token_estimate: number
}

export async function fetchContext(subjectId: string, task: string): Promise<ContextBundle | null> {
  try {
    const resp = await fetch(`${statewaveUrl()}/v1/context`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': statewaveApiKey() },
      body: JSON.stringify({ subject_id: subjectId, task, max_tokens: 800 }),
    })
    if (!resp.ok) return null
    return (await resp.json()) as ContextBundle
  } catch (err) {
    console.warn('[demo] context fetch error:', err)
    return null
  }
}
