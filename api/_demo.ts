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

/**
 * Visitor-memory personas — each gets its own per-visitor subject and full
 * write/compile/reset cycle. `allSubjectsFor()` iterates this list, so adding
 * a non-visitor-memory persona here would let `/api/demo-reset` delete shared
 * data. Don't.
 */
export const DEMO_PERSONAS = [
  'support-agent',
  'coding-assistant',
  'sales-copilot',
  'devops-agent',
  'research-assistant',
] as const
export type DemoPersona = (typeof DEMO_PERSONAS)[number]

/**
 * Docs-shared personas — read-only against a fixed shared Statewave subject
 * containing the official docs memory pack. No per-visitor write, no compile,
 * no seed, no reset. The widget surfaces these alongside DEMO_PERSONAS but
 * routes them through a different code path.
 */
export const DOCS_SUBJECT_ID = 'statewave-support-docs'
export const DOCS_SHARED_PERSONAS = ['statewave-support'] as const
export type DocsSharedPersona = (typeof DOCS_SHARED_PERSONAS)[number]

export function isDemoPersona(value: string | undefined | null): value is DemoPersona {
  return !!value && (DEMO_PERSONAS as readonly string[]).includes(value)
}

export function isDocsSharedPersona(
  value: string | undefined | null,
): value is DocsSharedPersona {
  return !!value && (DOCS_SHARED_PERSONAS as readonly string[]).includes(value)
}

/** Any persona id the widget recognises (visitor-memory or docs-shared). */
export function isKnownPersona(value: string | undefined | null): boolean {
  return isDemoPersona(value) || isDocsSharedPersona(value)
}

/**
 * Resolve the Statewave subject a given persona reads from. Docs-shared
 * personas always resolve to `DOCS_SUBJECT_ID` regardless of visitor —
 * this is what makes the docs pack a shared knowledge base instead of a
 * per-visitor copy.
 */
export function subjectForPersona(visitorId: string, persona: string | null | undefined): string {
  if (isDocsSharedPersona(persona)) return DOCS_SUBJECT_ID
  return subjectFor(visitorId, persona ?? null)
}

/**
 * Subject id for a visitor. With a persona, returns `demo_web_<uuid>__<persona>`
 * so each persona has its own memory pool. Without a persona, returns the bare
 * `demo_web_<uuid>` (used by /api/demo-reset to clean up legacy subjects from
 * before this layout existed; new traffic should always pass a persona).
 */
export function subjectFor(visitorId: string, persona?: string | null): string {
  const base = `${DEMO_SUBJECT_PREFIX}${visitorId.replace(/-/g, '')}`
  if (!persona) return base
  const safe = persona.toLowerCase().replace(/[^a-z0-9-]/g, '')
  if (!safe) return base
  return `${base}__${safe}`
}

/** All subject ids that belong to a visitor — used when wiping on reset. */
export function allSubjectsFor(visitorId: string): string[] {
  return [subjectFor(visitorId), ...DEMO_PERSONAS.map((p) => subjectFor(visitorId, p))]
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
  /** Doc-pack episodes carry { doc_path, content_hash, pack_version }; needed
   *  to resolve docs-grounded citations when /v1/context returns memories
   *  but no inline episodes. */
  provenance?: Record<string, unknown>
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

/**
 * Fetch every episode for a subject via the admin endpoint. Used by the
 * docs-grounded citation resolver which needs to reach episodes the
 * /v1/timeline endpoint won't return — that endpoint caps responses at
 * 100 regardless of limit/offset, which is too low for the 178-section
 * docs pack (citations from deployment/, privacy/, etc would otherwise
 * never resolve). Requires an API key with admin scope; the widget's
 * STATEWAVE_API_KEY already has it.
 *
 * The admin endpoint enforces an upper bound on `limit` — values > 200
 * return HTTP 422. limit=200 is the sweet spot: it returns the full
 * 178-episode docs pack in one call (verified live against
 * statewave-api.fly.dev). If a subject ever grows past 200 episodes we
 * pick up the rest with offset pagination.
 */
const ADMIN_PAGE_LIMIT = 200

export async function fetchAllEpisodesAdmin(subjectId: string): Promise<TimelineEpisode[]> {
  const out: TimelineEpisode[] = []
  // Defensive paginator: caps total fetch at 1000 episodes so a runaway
  // pagination on a large subject can't OOM the edge runtime.
  for (let offset = 0; offset < 1000; offset += ADMIN_PAGE_LIMIT) {
    const resp = await fetch(
      `${statewaveUrl()}/admin/subjects/${encodeURIComponent(subjectId)}/episodes?limit=${ADMIN_PAGE_LIMIT}&offset=${offset}`,
      { headers: { 'X-API-Key': statewaveApiKey() } },
    )
    if (!resp.ok) break
    const data = await resp.json()
    const page = Array.isArray(data)
      ? (data as TimelineEpisode[])
      : ((data?.episodes ?? []) as TimelineEpisode[])
    if (page.length === 0) break
    out.push(...page)
    if (page.length < ADMIN_PAGE_LIMIT) break
  }
  return out
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

export interface ContextMemory {
  id: string
  content: string
  kind: string
  confidence: number
  /** UUIDs of the raw episodes this compiled memory was extracted from. */
  source_episode_ids?: string[]
}

export interface ContextEpisode {
  id: string
  source?: string
  type?: string
  /** Free-form. Doc-pack episodes carry { title, breadcrumb, doc_path, url, text }. */
  payload?: Record<string, unknown>
  /** Doc-pack episodes carry { doc_path, content_hash, pack_version }. */
  provenance?: Record<string, unknown>
}

export interface ContextBundle {
  subject_id: string
  task: string
  facts: ContextMemory[]
  procedures: ContextMemory[]
  /** Raw episodes that survived ranking — present in the wire response from
   *  `POST /v1/context`. For the docs subject these carry the doc_path and
   *  breadcrumb we render as visible sources. */
  episodes?: ContextEpisode[]
  assembled_context: string
  token_estimate: number
}

export interface DocSource {
  doc_path: string
  breadcrumb: string
  url: string
}

/**
 * Walk a context bundle and produce a deduplicated, ranked list of doc-pack
 * sources for citation rendering. Pulls first from the bundle's own
 * `episodes[]` (the ranked retrieved set), then fills in via memories'
 * `source_episode_ids`. Caps at `limit` (default 4) and drops anything
 * without a `doc_path` — i.e. anything not from the docs pack.
 *
 * Returns [] when nothing is grounded — callers should hide the citation UI
 * rather than rendering an empty "Sources:" line.
 */
export function resolveDocSources(
  context: ContextBundle | null | undefined,
  limit = 4,
): DocSource[] {
  if (!context) return []
  const sources: DocSource[] = []
  const seen = new Set<string>()

  const tryAddEpisode = (ep: ContextEpisode | undefined) => {
    if (!ep) return
    const docPath = (ep.provenance as { doc_path?: string } | undefined)?.doc_path
    if (!docPath || seen.has(docPath)) return
    const payload = (ep.payload ?? {}) as { breadcrumb?: string; url?: string; title?: string }
    const breadcrumb = payload.breadcrumb || payload.title || docPath
    const url = payload.url || `https://github.com/smaramwbc/statewave-docs/blob/main/${docPath}`
    sources.push({ doc_path: docPath, breadcrumb, url })
    seen.add(docPath)
  }

  // Pass 1: episodes returned in the bundle, in their ranked order.
  for (const ep of context.episodes ?? []) {
    if (sources.length >= limit) break
    tryAddEpisode(ep)
  }

  // Pass 2: walk compiled memories back to their source episodes for any
  // doc paths that didn't already surface via raw episodes (e.g. when the
  // server returned the summary instead of the underlying section).
  if (sources.length < limit) {
    const epById = new Map<string, ContextEpisode>()
    for (const ep of context.episodes ?? []) epById.set(ep.id, ep)
    const allMemories = [...(context.facts ?? []), ...(context.procedures ?? [])]
    for (const mem of allMemories) {
      if (sources.length >= limit) break
      for (const epId of mem.source_episode_ids ?? []) {
        if (sources.length >= limit) break
        tryAddEpisode(epById.get(epId))
      }
    }
  }

  return sources
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
