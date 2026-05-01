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
  const [visibleCtaCount, setVisibleCtaCount] = useState(0)
  const _bumpVisibleCta = useCallback((delta: 1 | -1) => {
    setVisibleCtaCount((n) => Math.max(0, n + delta))
  }, [])

  const refreshState = useCallback(async () => {
    try {
      const resp = await fetch('/api/demo-state', { credentials: 'same-origin' })
      if (!resp.ok) return null
      const data = (await resp.json()) as DemoStateResponse
      setSubjectId(data.subjectId)
      setIsReturningVisitor(!data.isNew && (data.episodes.length > 0 || data.memories.length > 0))
      setEpisodeCount(data.episodeCount)
      setMemories(data.memories)
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
      // Always refresh — even when seeded=false (already populated) we want
      // the latest counts/memories on the inspector.
      await refreshState()
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
    // Refresh state first. If the caller explicitly opened against a showcase
    // persona AND the visitor's subject is empty, seed it. The plain launcher
    // (no persona) skips seeding so users can build memory from chat.
    setIsHydrating(true)
    void (async () => {
      try {
        const data = await refreshState()
        const personaIsSeeded = !!DEMO_PERSONAS.find((x) => x.id === chosen)
        if (explicit && data && data.episodeCount === 0 && data.memories.length === 0 && personaIsSeeded) {
          await seedFromPersona(chosen)
        }
      } finally {
        setIsHydrating(false)
      }
    })()
  }, [persona, refreshState, seedFromPersona])

  const closeWidget = useCallback(() => setIsOpen(false), [])
  const minimizeWidget = useCallback(() => setIsMinimized(true), [])
  const expandWidget = useCallback(() => setIsMinimized(false), [])

  const selectPersona = useCallback((p: string, label: string) => {
    const norm = normalizePersona(p)
    setPersona(norm)
    setPersonaLabel(label)
    // Persona switch is a UI-only prompt biasing change. Memories belong to the
    // visitor, not to the persona, so we keep the chat as-is and just clear the
    // stateless side which is purely live.
    setStatelessMessages([])
    setLastContext(null)
  }, [])

  const clearChat = useCallback(() => {
    setStatelessMessages([])
    setStatewaveMessages([])
    setLastContext(null)
  }, [])

  const resetDemo = useCallback(async () => {
    setIsResetting(true)
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
    }
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return
    const trimmed = text.trim()
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
      // and run compile. Refresh state so the inspector reflects new memory.
      if (statewaveResp.ok && !statewaveData.capReached) {
        void refreshState()
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
  }, [persona, refreshState])

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
