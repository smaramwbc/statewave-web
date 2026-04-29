// Vercel Edge Function — proxies read-only Statewave API requests
// for the hero visualization. Caches responses for 60s.

export const config = { runtime: 'edge' }

const STATEWAVE_URL = process.env.STATEWAVE_URL || 'https://statewave-api.fly.dev'
const STATEWAVE_API_KEY = process.env.STATEWAVE_API_KEY || ''

const DEMO_SUBJECTS = [
  'demo-support-agent',
  'demo-coding-assistant',
  'demo-sales-copilot',
  'demo-devops-agent',
  'demo-research-assistant',
]

export default async function handler(req: Request): Promise<Response> {
  // Only allow GET
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  try {
    const results = await Promise.all(
      DEMO_SUBJECTS.map(async (subjectId) => {
        const [memoriesResp, timelineResp] = await Promise.all([
          fetch(`${STATEWAVE_URL}/v1/memories/search?subject_id=${subjectId}&limit=20`, {
            headers: { 'X-API-Key': STATEWAVE_API_KEY },
          }),
          fetch(`${STATEWAVE_URL}/v1/timeline?subject_id=${subjectId}&limit=30`, {
            headers: { 'X-API-Key': STATEWAVE_API_KEY },
          }),
        ])

        const memoriesData = memoriesResp.ok ? await memoriesResp.json() : { memories: [] }
        const timelineData = timelineResp.ok ? await timelineResp.json() : { episodes: [] }

        return {
          subject_id: subjectId,
          memories: (memoriesData.memories ?? []).map((m: Record<string, unknown>) => ({
            id: m.id,
            content: m.content || m.summary || '',
            kind: m.kind || 'fact',
            confidence: m.confidence || 0.8,
          })).filter((m: { content: string }) => m.content),
          episodes: (timelineData.episodes ?? timelineData.events ?? []).map((e: Record<string, unknown>) => ({
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
    return new Response(JSON.stringify({ error: 'Backend unreachable' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
