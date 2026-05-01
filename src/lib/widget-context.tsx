/**
 * Chat Widget Context
 *
 * Holds the global state for the floating comparison chat widget. Persistence
 * is server-backed: a first-party HttpOnly cookie identifies the visitor and
 * the Statewave server stores their episodes/memories. The client never sees
 * the visitor cookie value (HttpOnly) and never writes the chat to localStorage.
 *
 * Lifecycle:
 *  - On widget open, GET /api/demo-state to issue the cookie (first visit) or
 *    rehydrate the chat + memories (returning visit).
 *  - sendMessage POSTs to /api/widget-chat. The server writes the episode and
 *    runs compile, then we refetch /api/demo-state to surface fresh memory.
 *  - resetDemo POSTs to /api/demo-reset which deletes the subject and reissues
 *    a fresh cookie.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
  type RefObject,
} from 'react'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface MemoryItem {
  id: string
  content: string
  kind: string
  confidence: number
}

export interface ContextBundle {
  subject_id: string
  task: string
  facts: MemoryItem[]
  procedures: MemoryItem[]
  assembled_context: string
  token_estimate: number
}

interface ChatWidgetState {
  isOpen: boolean
  isMinimized: boolean
  /** Persona is a client-only prompt biasing label (not a Statewave subject id). */
  persona: string
  personaLabel: string
  /** The Statewave subject this browser is bound to. Returned by the server. */
  subjectId: string | null
  isReturningVisitor: boolean
  episodeCount: number
  memories: MemoryItem[]
  statelessMessages: ChatMessage[]
  statewaveMessages: ChatMessage[]
  lastContext: ContextBundle | null
  isLoading: boolean
  isResetting: boolean
  /** True while we're fetching demo state and (if needed) seeding from a persona. */
  isHydrating: boolean
  /**
   * Why we're hydrating. `setup` = first-time visitor (no cookie yet) — the
   * server will issue a cookie and seed the showcase pool. `restore` = we're
   * reading an existing visitor's memory back from the server. `reset` =
   * starting over after a deliberate wipe. Drives the loading copy.
   */
  hydrationReason: 'setup' | 'restore' | 'reset' | null
  /** Whether this browser has seen the welcome panel. Persists in localStorage,
   *  independent of demo memory state. */
  hasSeenWelcome: boolean
  /** True while at least one on-page demo CTA (e.g. hero "Try the Demo")
   *  is in the viewport — the floating launcher hides itself in that case
   *  so we don't double-up on the same affordance. */
  hasVisibleCta: boolean
}

interface ChatWidgetActions {
  openWidget: (persona?: string, personaLabel?: string) => void
  closeWidget: () => void
  minimizeWidget: () => void
  expandWidget: () => void
  selectPersona: (persona: string, label: string) => void
  sendMessage: (text: string) => Promise<void>
  /** Wipes the visitor's Statewave subject and clears chat. */
  resetDemo: () => Promise<void>
  /** Local-only: clears the chat panel without touching server state. */
  clearChat: () => void
  /**
   * Copies episodes from a showcase persona subject (e.g. demo-support-agent)
   * into the visitor's subject if it is empty, then refreshes state. No-op
   * for visitors that already have data.
   */
  seedFromPersona: (persona: string) => Promise<boolean>
  /** Internal — used by useTrackDemoCta. Increment when an on-page CTA enters
   *  the viewport, decrement when it leaves. */
  _bumpVisibleCta: (delta: 1 | -1) => void
  /** Mark the welcome as seen and reveal the chat. Persists across reloads. */
  dismissWelcome: () => void
  /** Re-show the welcome panel (small "?" help button in the header). */
  showWelcome: () => void
}

type ChatWidgetContextType = ChatWidgetState & ChatWidgetActions

const ChatWidgetContext = createContext<ChatWidgetContextType | null>(null)

export function useChatWidget() {
  const ctx = useContext(ChatWidgetContext)
  if (!ctx) throw new Error('useChatWidget must be used within ChatWidgetProvider')
  return ctx
}

const DEMO_PERSONAS = [
  { id: 'support-agent', label: 'Support Agent' },
  { id: 'coding-assistant', label: 'Coding Assistant' },
  { id: 'sales-copilot', label: 'Sales Copilot' },
  { id: 'devops-agent', label: 'DevOps Agent' },
  { id: 'research-assistant', label: 'Research Assistant' },
] as const

export const DEMO_SUBJECTS = DEMO_PERSONAS.map((p) => ({ id: p.id, label: p.label }))

const DEFAULT_PERSONA = DEMO_PERSONAS[0]

interface DemoStateResponse {
  subjectId: string
  isNew: boolean
  episodes: ChatMessage[]
  memories: MemoryItem[]
  episodeCount: number
}

/**
 * The HeroBackground passes legacy showcase subject ids like `demo-support-agent`
 * through openWidget. Strip the demo- prefix so they map to persona ids
 * (`support-agent`, `coding-assistant`, …).
 */
function normalizePersona(maybeSubject: string): string {
  return maybeSubject.startsWith('demo-') ? maybeSubject.slice(5) : maybeSubject
}

// ─── Onboarding state ───────────────────────────────────────────────────────
// Tracks whether this browser has seen the welcome panel. Stored separately
// from demo memory: resetDemo() does NOT clear it. The user can wipe their
// memory pool without re-seeing the intro.
const ONBOARDING_KEY = 'statewave-demo-onboarding-v1'

interface OnboardingRecord {
  welcomeSeenAt: number | null
}

function loadOnboarding(): OnboardingRecord {
  if (typeof window === 'undefined') return { welcomeSeenAt: null }
  try {
    const raw = window.localStorage.getItem(ONBOARDING_KEY)
    if (!raw) return { welcomeSeenAt: null }
    const parsed = JSON.parse(raw) as OnboardingRecord
    return { welcomeSeenAt: typeof parsed.welcomeSeenAt === 'number' ? parsed.welcomeSeenAt : null }
  } catch {
    return { welcomeSeenAt: null }
  }
}

function persistOnboarding(rec: OnboardingRecord): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(ONBOARDING_KEY, JSON.stringify(rec))
  } catch {
    // localStorage unavailable (private mode, quota) — silently no-op; the
    // welcome will simply re-show next visit.
  }
}

export function ChatWidgetProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [persona, setPersona] = useState<string>(DEFAULT_PERSONA.id)
  const [personaLabel, setPersonaLabel] = useState<string>(DEFAULT_PERSONA.label)
  const [subjectId, setSubjectId] = useState<string | null>(null)
  const [isReturningVisitor, setIsReturningVisitor] = useState(false)
  const [episodeCount, setEpisodeCount] = useState(0)
  const [memories, setMemories] = useState<MemoryItem[]>([])
  const [statelessMessages, setStatelessMessages] = useState<ChatMessage[]>([])
  const [statewaveMessages, setStatewaveMessages] = useState<ChatMessage[]>([])
  const [lastContext, setLastContext] = useState<ContextBundle | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isHydrating, setIsHydrating] = useState(false)
  const [hydrationReason, setHydrationReason] = useState<'setup' | 'restore' | 'reset' | null>(null)
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean>(() => loadOnboarding().welcomeSeenAt !== null)
  const [visibleCtaCount, setVisibleCtaCount] = useState(0)
  const _bumpVisibleCta = useCallback((delta: 1 | -1) => {
    setVisibleCtaCount((n) => Math.max(0, n + delta))
  }, [])

  const dismissWelcome = useCallback(() => {
    persistOnboarding({ welcomeSeenAt: Date.now() })
    setHasSeenWelcome(true)
  }, [])

  const showWelcome = useCallback(() => {
    setHasSeenWelcome(false)
  }, [])

  const refreshState = useCallback(async (forPersona?: string) => {
    try {
      const params = new URLSearchParams()
      if (forPersona) params.set('persona', forPersona)
      const url = `/api/demo-state${params.size ? `?${params.toString()}` : ''}`
      const resp = await fetch(url, { credentials: 'same-origin' })
      if (!resp.ok) return null
      const data = (await resp.json()) as DemoStateResponse
      setSubjectId(data.subjectId)
      setIsReturningVisitor(!data.isNew && (data.episodes.length > 0 || data.memories.length > 0))
      setEpisodeCount(data.episodeCount)
      setMemories(data.memories)
      // The hydration reason defaults from the server's view of this visitor:
      // a brand-new cookie means we're "setting up", an existing one means
      // we're "restoring". Callers can override before/after this fetch.
      setHydrationReason((current) => current === 'reset' ? 'reset' : (data.isNew ? 'setup' : 'restore'))
      // Deliberately do NOT rehydrate the chat column from server-side episodes.
      // Returning visitors get their compiled memories back (shown in the
      // inspector + the "Welcome back" placeholder) while the chat starts
      // fresh — so the conversation surface is always for the current
      // session, not a wall of replayed text from earlier visits.
      return data
    } catch (err) {
      console.warn('[widget] Failed to refresh demo state:', err)
      return null
    }
  }, [])

  const seedFromPersona = useCallback(async (rawPersona: string): Promise<boolean> => {
    const p = normalizePersona(rawPersona)
    try {
      const resp = await fetch('/api/demo-seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ persona: p }),
      })
      if (!resp.ok) return false
      const data = (await resp.json()) as { seeded?: boolean }
      // Always refresh against the persona we just seeded — even when
      // seeded=false (already populated) we want the latest counts/memories
      // on the inspector.
      await refreshState(p)
      return data.seeded === true
    } catch (err) {
      console.warn('[widget] seed failed:', err)
      return false
    }
  }, [refreshState])

  const openWidget = useCallback((rawPersona?: string, label?: string) => {
    setIsOpen(true)
    setIsMinimized(false)
    const explicit = !!rawPersona
    let chosen = persona
    if (rawPersona) {
      chosen = normalizePersona(rawPersona)
      setPersona(chosen)
      setPersonaLabel(label ?? DEMO_PERSONAS.find((x) => x.id === chosen)?.label ?? chosen)
    }
    // Only show the hydration spinner if there's genuinely nothing to display
    // for the active persona yet. After the page-load preload (or a previous
    // open), memories are already populated; refresh in the background instead
    // of flashing the spinner over the welcome-back placeholder.
    const personaUnchanged = chosen === persona
    const havePersonaData = personaUnchanged && (memories.length > 0 || episodeCount > 0)
    if (!havePersonaData) {
      setIsHydrating(true)
      setHydrationReason(havePersonaData ? 'restore' : 'setup')
    }
    void (async () => {
      try {
        const data = await refreshState(chosen)
        const personaIsSeeded = !!DEMO_PERSONAS.find((x) => x.id === chosen)
        const willSeed = explicit && data && data.episodeCount === 0 && data.memories.length === 0 && personaIsSeeded
        if (willSeed) setHydrationReason('setup')
        else if (data && (data.episodeCount > 0 || data.memories.length > 0)) setHydrationReason('restore')
        if (willSeed) {
          await seedFromPersona(chosen)
        }
      } finally {
        setIsHydrating(false)
        setHydrationReason(null)
      }
    })()
  }, [persona, memories.length, episodeCount, refreshState, seedFromPersona])

  const closeWidget = useCallback(() => setIsOpen(false), [])
  const minimizeWidget = useCallback(() => setIsMinimized(true), [])
  const expandWidget = useCallback(() => setIsMinimized(false), [])

  const selectPersona = useCallback((p: string, label: string) => {
    const norm = normalizePersona(p)
    setPersona(norm)
    setPersonaLabel(label)
    // Each persona is its own memory pool — switching is exactly like
    // clicking a different particle group on the homepage. Reset the chat
    // surface, fetch the new persona's state, and auto-seed if empty.
    setStatelessMessages([])
    setStatewaveMessages([])
    setLastContext(null)
    setIsHydrating(true)
    setHydrationReason('setup')
    void (async () => {
      try {
        const data = await refreshState(norm)
        const personaIsSeeded = !!DEMO_PERSONAS.find((x) => x.id === norm)
        const willSeed = data && data.episodeCount === 0 && data.memories.length === 0 && personaIsSeeded
        if (willSeed) setHydrationReason('setup')
        else if (data && (data.episodeCount > 0 || data.memories.length > 0)) setHydrationReason('restore')
        if (willSeed) {
          await seedFromPersona(norm)
        }
      } finally {
        setIsHydrating(false)
        setHydrationReason(null)
      }
    })()
  }, [refreshState, seedFromPersona])

  const clearChat = useCallback(() => {
    setStatelessMessages([])
    setStatewaveMessages([])
    setLastContext(null)
  }, [])

  const resetDemo = useCallback(async () => {
    setIsResetting(true)
    setHydrationReason('reset')
    try {
      const resp = await fetch('/api/demo-reset', { method: 'POST', credentials: 'same-origin' })
      if (!resp.ok) throw new Error(`Reset failed (${resp.status})`)
      const data = (await resp.json()) as { subjectId: string }
      setSubjectId(data.subjectId)
      setStatelessMessages([])
      setStatewaveMessages([])
      setMemories([])
      setLastContext(null)
      setEpisodeCount(0)
      setIsReturningVisitor(false)
    } catch (err) {
      console.error('[widget] Reset failed:', err)
    } finally {
      setIsResetting(false)
      setHydrationReason(null)
    }
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return
    const trimmed = text.trim()
    // Sending is the visitor's strongest "I get it" signal — auto-dismiss
    // the welcome panel here too, not just on the explicit Skip link.
    if (!hasSeenWelcome) {
      persistOnboarding({ welcomeSeenAt: Date.now() })
      setHasSeenWelcome(true)
    }
    const userMsg: ChatMessage = { role: 'user', content: trimmed, timestamp: Date.now() }
    setStatelessMessages((prev) => [...prev, userMsg])
    setStatewaveMessages((prev) => [...prev, userMsg])
    setIsLoading(true)

    try {
      const [statelessResp, statewaveResp] = await Promise.all([
        fetch('/api/widget-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ messages: [{ role: 'user', content: trimmed }], mode: 'stateless', persona }),
        }),
        fetch('/api/widget-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ messages: [{ role: 'user', content: trimmed }], mode: 'statewave', persona }),
        }),
      ])

      const statelessText = await statelessResp.text()
      const statewaveText = await statewaveResp.text()
      let statelessData: { reply?: string; error?: string }
      let statewaveData: { reply?: string; error?: string; context?: ContextBundle; capReached?: boolean }
      try { statelessData = JSON.parse(statelessText) } catch { statelessData = { error: `API error: ${statelessResp.status}` } }
      try { statewaveData = JSON.parse(statewaveText) } catch { statewaveData = { error: `API error: ${statewaveResp.status}` } }

      setStatelessMessages((prev) => [...prev, {
        role: 'assistant',
        content: statelessData.reply ?? statelessData.error ?? 'No response',
        timestamp: Date.now(),
      }])
      setStatewaveMessages((prev) => [...prev, {
        role: 'assistant',
        content: statewaveData.reply ?? statewaveData.error ?? 'No response',
        timestamp: Date.now(),
      }])

      if (statewaveData.context) setLastContext(statewaveData.context)

      // After a successful Statewave turn, the server has written an episode
      // and run compile against the active persona's subject. Refresh against
      // that same persona so the inspector reflects new memory.
      if (statewaveResp.ok && !statewaveData.capReached) {
        void refreshState(persona)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error'
      console.error('[widget] API error:', err)
      const errMsg = (role: 'user' | 'assistant'): ChatMessage => ({ role, content: `Error: ${errorMsg}`, timestamp: Date.now() })
      setStatelessMessages((prev) => [...prev, errMsg('assistant')])
      setStatewaveMessages((prev) => [...prev, errMsg('assistant')])
    } finally {
      setIsLoading(false)
    }
  }, [persona, hasSeenWelcome, refreshState])

  // Preload the default persona's memory pool on page mount so the demo is
  // populated the moment a visitor opens the widget — no spinner-while-seeding
  // pause on first interaction. Returning visitors just get a fast confirm
  // fetch; new visitors get cookie issued + showcase episodes seeded silently.
  useEffect(() => {
    let cancelled = false
    void (async () => {
      const data = await refreshState(DEFAULT_PERSONA.id)
      if (cancelled || !data) return
      if (data.episodeCount === 0 && data.memories.length === 0) {
        await seedFromPersona(DEFAULT_PERSONA.id)
      }
    })()
    return () => { cancelled = true }
    // Run once on mount. refreshState/seedFromPersona are stable callbacks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value: ChatWidgetContextType = {
    isOpen,
    isMinimized,
    persona,
    personaLabel,
    subjectId,
    isReturningVisitor,
    episodeCount,
    memories,
    statelessMessages,
    statewaveMessages,
    lastContext,
    isLoading,
    isResetting,
    isHydrating,
    hydrationReason,
    hasSeenWelcome,
    hasVisibleCta: visibleCtaCount > 0,
    openWidget,
    closeWidget,
    minimizeWidget,
    expandWidget,
    selectPersona,
    sendMessage,
    resetDemo,
    clearChat,
    seedFromPersona,
    _bumpVisibleCta,
    dismissWelcome,
    showWelcome,
  }

  return <ChatWidgetContext.Provider value={value}>{children}</ChatWidgetContext.Provider>
}

/**
 * Marks a DOM element as an on-page "Try the demo" CTA. While the element is
 * visible in the viewport the floating launcher in the corner hides itself,
 * so the user only ever sees one demo affordance at a time.
 *
 * Usage:
 *   const ctaRef = useRef<HTMLButtonElement>(null)
 *   useTrackDemoCta(ctaRef)
 *   <button ref={ctaRef} onClick={() => openWidget()}>Try the demo</button>
 */
export function useTrackDemoCta(ref: RefObject<HTMLElement | null>): void {
  const { _bumpVisibleCta } = useChatWidget()
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let registered = false
    const obs = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting
        if (visible && !registered) {
          _bumpVisibleCta(1)
          registered = true
        } else if (!visible && registered) {
          _bumpVisibleCta(-1)
          registered = false
        }
      },
      { threshold: 0.1 },
    )
    obs.observe(el)
    return () => {
      obs.disconnect()
      if (registered) _bumpVisibleCta(-1)
    }
  }, [ref, _bumpVisibleCta])
}
