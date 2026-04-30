/**
 * Live Statewave data service for the hero visualization.
 *
 * Fetches real memories and episodes via our own /api/hero-data proxy
 * (which talks to the Statewave Fly.io backend with the API key server-side).
 *
 * Returns null if unreachable — HeroBackground shows nothing until data loads.
 */

export interface LiveMemory {
  id: string
  content: string
  kind: string
  confidence: number
  subject_id?: string
}

export interface LiveEpisode {
  id: string
  subject_id?: string
  source: string
  type: string
  payload: Record<string, unknown>
  created_at: string
}

export interface LiveSubjectData {
  subject_id: string
  memories: LiveMemory[]
  episodes: LiveEpisode[]
}

/**
 * Fetch all demo subjects' data via the /api/hero-data proxy.
 * Returns null if unreachable or no data.
 */
export async function fetchLiveData(): Promise<LiveSubjectData[] | null> {
  try {
    const resp = await fetch('/api/hero-data', {
      signal: AbortSignal.timeout(8000),
    })
    if (!resp.ok) return null

    const data = await resp.json()
    const subjects: LiveSubjectData[] = data.subjects ?? []

    // Only return if we actually have memories
    const totalMemories = subjects.reduce((sum, r) => sum + r.memories.length, 0)
    if (totalMemories === 0) return null

    return subjects
  } catch (err) {
    console.info('[statewave-live] Proxy unreachable:', err)
    return null
  }
}
