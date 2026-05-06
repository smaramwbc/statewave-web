// Hero visualization proxy — read-only Statewave API requests for
// the homepage hero. Caches responses for 60s. Runs in any vendor's
// Web-fetch-compatible runtime (Node 18+, Vercel Edge, Cloudflare
// Workers, Deno) — see server/dispatch.ts.

import { StatewaveConfigError } from '../statewave-client.js'

function statewaveUrl(): string {
  const v = process.env.STATEWAVE_URL
  if (!v || !v.trim()) throw new StatewaveConfigError('STATEWAVE_URL')
  return v
}
function statewaveApiKey(): string {
  const v = process.env.STATEWAVE_API_KEY
  if (!v || !v.trim()) throw new StatewaveConfigError('STATEWAVE_API_KEY')
  return v
}

const DEMO_SUBJECTS = [
  'demo-support-agent',
  'demo-coding-assistant',
  'demo-sales-copilot',
  'demo-devops-agent',
  'demo-research-assistant',
]

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  try {
    const results = await Promise.all(
      DEMO_SUBJECTS.map(async (subjectId) => {
        // /v1/timeline returns both episodes and memories (with real
        // source_episode_ids provenance) in a single call.
        // Wider window so memories can reference their real source episodes
        // (without this, lots of source_episode_ids point outside the slice).
        const resp = await fetch(
          `${statewaveUrl()}/v1/timeline?subject_id=${subjectId}&limit=200`,
          { headers: { 'X-API-Key': statewaveApiKey() } },
        )
        const data = (resp.ok
          ? await resp.json()
          : { episodes: [], memories: [] }) as {
          episodes?: Record<string, unknown>[]
          memories?: Record<string, unknown>[]
        }

        return {
          subject_id: subjectId,
          memories: (data.memories ?? [])
            .map((m: Record<string, unknown>) => ({
              id: m.id,
              content: (m.content || m.summary || '') as string,
              kind: m.kind || 'fact',
              confidence: m.confidence ?? 0.8,
              source_episode_ids: (m.source_episode_ids as string[]) ?? [],
            }))
            .filter((m) => m.content),
          episodes: (data.episodes ?? []).map((e: Record<string, unknown>) => ({
            id: e.id,
            source: e.source || 'unknown',
            type: e.type || 'interaction',
            payload: e.payload || {},
            created_at: e.created_at || '',
          })),
        }
      })
    )

    return new Response(JSON.stringify({ subjects: results }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err) {
    // Config errors (missing STATEWAVE_URL / STATEWAVE_API_KEY) propagate so
    // the operator sees a loud failure rather than a generic "backend
    // unreachable" — silently absorbing missing-required-config into a 502
    // is the kind of fallback this codebase deliberately doesn't do.
    if (err instanceof StatewaveConfigError) throw err
    return new Response(JSON.stringify({ error: 'Backend unreachable' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
