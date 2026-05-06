/**
 * GET /api/demo-personas
 *
 * Returns the list of demo persona ids whose backing Statewave subject has
 * non-empty memory in the upstream backend. The widget calls this once on
 * page load (in parallel with the default-persona preload) and uses the
 * result to filter its persona dropdown — so personas whose showcase pool or
 * docs pack hasn't been provisioned simply don't surface in the picker.
 *
 * Response: `{ available: string[] }` — persona ids in the same shape as the
 * client-side DEMO_PERSONAS registry (e.g. "support-agent", "statewave-support").
 *
 * Cached at the edge for 5 minutes (stale-while-revalidate 10) because the
 * backing subjects are static showcase / docs pools that rarely change. Avoids
 * fan-out of 6 timeline calls on every page view.
 */

import { DOCS_SUBJECT_ID, fetchTimeline } from '../statewave-client.js'


/**
 * Persona id → upstream Statewave subject we check for non-empty memory.
 * Visitor-memory personas point at their showcase pool (the seed source);
 * docs-shared personas point at the shared docs subject.
 *
 * Keep in sync with:
 *   - SEED_SOURCES in api/demo-seed.ts (visitor-memory subset)
 *   - DOCS_SHARED_PERSONAS in api/_demo.ts (docs-shared subset)
 *   - DEMO_PERSONAS in src/lib/widget-context.tsx (client catalog)
 */
const PERSONA_BACKING_SUBJECTS: Record<string, string> = {
  'support-agent': 'demo-support-agent',
  'coding-assistant': 'demo-coding-assistant',
  'sales-copilot': 'demo-sales-copilot',
  'devops-agent': 'demo-devops-agent',
  'research-assistant': 'demo-research-assistant',
  'statewave-support': DOCS_SUBJECT_ID,
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() })
  }
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    })
  }

  const entries = Object.entries(PERSONA_BACKING_SUBJECTS)
  const checks = await Promise.all(
    entries.map(async ([persona, subject]) => {
      const { episodes } = await fetchTimeline(subject)
      return episodes.length > 0 ? persona : null
    }),
  )
  const available = checks.filter((p): p is string => p !== null)

  return new Response(JSON.stringify({ available }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // Backing subjects are static showcase / docs pools — short edge cache
      // is safe and prevents fan-out on every page load.
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      ...corsHeaders(),
    },
  })
}
