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

/**
 * A doc-pack source attached to a docs-grounded assistant turn. Resolved
 * server-side from the same context bundle the model was given (see
 * resolveDocSources in api/_demo.ts) — never parsed from the model's text.
 */
export interface DocSource {
  doc_path: string
  breadcrumb: string
  url: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  /** Only populated for assistant turns from the docs-shared persona. */
  sources?: DocSource[]
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
  /** Current step of the post-welcome guided tour.
   *   0  = tour not active (either welcome still showing, or tour complete)
   *   1+ = active step number (1..TOUR_STEPS) */
  tourStep: number
  /** Total number of tour steps. Stable constant so callers can render
   *  "Step N of M" without importing internals. */
  tourTotal: number
  /** True iff the visitor has finished or skipped the post-welcome tour. */
  hasCompletedTour: boolean
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
  /** Mark the welcome as seen and reveal the chat. Persists across reloads.
   *  Also kicks off the guided tour at step 1 unless the tour was already
   *  completed previously. */
  dismissWelcome: () => void
  /** Re-show the welcome panel (small "?" help button in the header).
   *  Also resets tour progress so it plays again. */
  showWelcome: () => void
  /** Advance to the next tour step, or complete the tour if already on the
   *  last step. Persists tour completion in localStorage. */
  nextTourStep: () => void
  /** Step backward one. No-op at step 1. */
  prevTourStep: () => void
  /** Skip the entire tour without completing each step. Persists. */
  skipTour: () => void
}

type ChatWidgetContextType = ChatWidgetState & ChatWidgetActions

const ChatWidgetContext = createContext<ChatWidgetContextType | null>(null)

export function useChatWidget() {
  const ctx = useContext(ChatWidgetContext)
  if (!ctx) throw new Error('useChatWidget must be used within ChatWidgetProvider')
  return ctx
}

/**
 * Persona kinds:
 *   visitor-memory — per-visitor subject, full write/compile/seed/reset cycle.
 *                    The 5 demo personas show "what Statewave remembers about
 *                    YOU as you chat".
 *   docs-shared    — read-only against a fixed shared subject containing the
 *                    official docs memory pack (built upstream by
 *                    statewave/scripts/bootstrap_docs_pack.py). Visitors can't
 *                    write to or reset this pack — it is the same pack for
 *                    everyone, and the LLM is grounded in it.
 *
 * `seedFromPersona` and the reset flow are gated on `kind`, so adding more
 * docs-shared personas later is a one-line registry change.
 */
const DEMO_PERSONAS = [
  { id: 'support-agent', label: 'Support Agent', kind: 'visitor-memory' },
  { id: 'coding-assistant', label: 'Coding Assistant', kind: 'visitor-memory' },
  { id: 'sales-copilot', label: 'Sales Copilot', kind: 'visitor-memory' },
  { id: 'devops-agent', label: 'DevOps Agent', kind: 'visitor-memory' },
  { id: 'research-assistant', label: 'Research Assistant', kind: 'visitor-memory' },
  { id: 'statewave-support', label: 'Statewave Support', kind: 'docs-shared' },
] as const

export type PersonaKind = 'visitor-memory' | 'docs-shared'

export const DEMO_SUBJECTS = DEMO_PERSONAS.map((p) => ({
  id: p.id,
  label: p.label,
  kind: p.kind as PersonaKind,
}))

export function personaKind(id: string): PersonaKind | null {
  return DEMO_PERSONAS.find((p) => p.id === id)?.kind ?? null
}

export function isVisitorMemoryPersona(id: string): boolean {
  return personaKind(id) === 'visitor-memory'
}

export function isDocsSharedPersona(id: string): boolean {
  return personaKind(id) === 'docs-shared'
}

const DEFAULT_PERSONA = DEMO_PERSONAS.find((p) => p.id === 'statewave-support')!

/** Number of post-welcome tour steps. The tour banner walks through the
 *  persona / suggestion-and-input / inspector pieces of the widget. Bumping
 *  this constant alone is not enough — copy lives in ChatWidget.tsx. */
export const TOUR_STEPS = 3

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
  /** Set when the post-welcome guided tour has either been completed or
   *  explicitly skipped. Independent of welcomeSeenAt — a visitor who
   *  dismissed welcome but hasn't finished the tour will resume the tour
   *  on next open. */
  tourCompletedAt: number | null
}

function loadOnboarding(): OnboardingRecord {
  const empty: OnboardingRecord = { welcomeSeenAt: null, tourCompletedAt: null }
  if (typeof window === 'undefined') return empty
  try {
    const raw = window.localStorage.getItem(ONBOARDING_KEY)
    if (!raw) return empty
    const parsed = JSON.parse(raw) as Partial<OnboardingRecord>
    return {
      welcomeSeenAt: typeof parsed.welcomeSeenAt === 'number' ? parsed.welcomeSeenAt : null,
      tourCompletedAt: typeof parsed.tourCompletedAt === 'number' ? parsed.tourCompletedAt : null,
    }
  } catch {
    return empty
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
  const [hasCompletedTour, setHasCompletedTour] = useState<boolean>(() => loadOnboarding().tourCompletedAt !== null)
  // tourStep semantics:
  //   0          = no tour visible (welcome still up, or tour completed)
  //   1..TOUR_STEPS = active step; tour banner is showing
  // We start at 0 here; dismissWelcome() promotes to 1 if the tour hasn't
  // been completed yet, otherwise stays 0.
  const [tourStep, setTourStep] = useState<number>(0)
  const [visibleCtaCount, setVisibleCtaCount] = useState(0)
  const _bumpVisibleCta = useCallback((delta: 1 | -1) => {
    setVisibleCtaCount((n) => Math.max(0, n + delta))
  }, [])

  const dismissWelcome = useCallback(() => {
    persistOnboarding({ welcomeSeenAt: Date.now(), tourCompletedAt: loadOnboarding().tourCompletedAt })
    setHasSeenWelcome(true)
    // Start the tour at step 1 unless the visitor finished it on a prior visit.
    setTourStep((prev) => (prev === 0 && !hasCompletedTour ? 1 : prev))
  }, [hasCompletedTour])

  const showWelcome = useCallback(() => {
    // Re-running the intro from the help button: replay welcome AND the tour.
    setHasSeenWelcome(false)
    setHasCompletedTour(false)
    setTourStep(0)
  }, [])

  const completeTour = useCallback(() => {
    persistOnboarding({ welcomeSeenAt: loadOnboarding().welcomeSeenAt ?? Date.now(), tourCompletedAt: Date.now() })
    setHasCompletedTour(true)
    setTourStep(0)
  }, [])

  const nextTourStep = useCallback(() => {
    setTourStep((prev) => {
      if (prev <= 0) return prev
      if (prev >= TOUR_STEPS) {
        // Final-step "Got it" → mark complete + close banner.
        completeTour()
        return 0
      }
      return prev + 1
    })
  }, [completeTour])

  const prevTourStep = useCallback(() => {
    setTourStep((prev) => (prev > 1 ? prev - 1 : prev))
  }, [])

  const skipTour = useCallback(() => {
    completeTour()
  }, [completeTour])

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
    // Resume the tour for visitors who saw the welcome on a prior visit but
    // never finished walking through the steps. Mid-session reopens skip
    // this branch (tourStep > 0 already, or already completed).
    setTourStep((prev) => (prev === 0 && hasSeenWelcome && !hasCompletedTour ? 1 : prev))
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
        // Only visitor-memory personas seed from a per-visitor showcase
        // subject. Docs-shared personas (statewave-support) read from a
        // fixed shared subject built upstream and must not be seeded.
        const personaIsSeeded = isVisitorMemoryPersona(chosen)
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
  }, [persona, memories.length, episodeCount, hasSeenWelcome, hasCompletedTour, refreshState, seedFromPersona])

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
        const personaIsSeeded = isVisitorMemoryPersona(norm)
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
      persistOnboarding({
        welcomeSeenAt: Date.now(),
        tourCompletedAt: loadOnboarding().tourCompletedAt,
      })
      setHasSeenWelcome(true)
      // Sending also kicks off the tour — same trigger as clicking Skip.
      setTourStep((prev) => (prev === 0 && !hasCompletedTour ? 1 : prev))
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
      let statewaveData: {
        reply?: string
        error?: string
        context?: ContextBundle
        sources?: DocSource[]
        capReached?: boolean
      }
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
        // Sources are only emitted by the docs-shared persona; for everything
        // else `sources` is absent and the bubble renders without a citations line.
        sources: Array.isArray(statewaveData.sources) && statewaveData.sources.length > 0
          ? statewaveData.sources
          : undefined,
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
  }, [persona, hasSeenWelcome, hasCompletedTour, refreshState])

  // Preload the default persona's memory pool on page mount so the demo is
  // populated the moment a visitor opens the widget — no spinner-while-seeding
  // pause on first interaction. Returning visitors just get a fast confirm
  // fetch; new visitors get cookie issued + showcase episodes seeded silently.
  // Docs-shared default personas (theoretical) skip seeding because their
  // pack is built upstream from official docs, not from a showcase subject.
  useEffect(() => {
    let cancelled = false
    void (async () => {
      const data = await refreshState(DEFAULT_PERSONA.id)
      if (cancelled || !data) return
      if (
        isVisitorMemoryPersona(DEFAULT_PERSONA.id) &&
        data.episodeCount === 0 &&
        data.memories.length === 0
      ) {
        await seedFromPersona(DEFAULT_PERSONA.id)
      }
    })()
    return () => { cancelled = true }
    // Run once on mount. refreshState/seedFromPersona are stable callbacks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Deep-link: a visitor landing with `?ask=support` (or `?widget=support`)
  // gets the widget opened directly to the Statewave Support persona. Lets
  // docs READMEs, the GitHub front page, and external materials link straight
  // into the docs-grounded chat without an extra click.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const target = params.get('ask') ?? params.get('widget')
    if (target !== 'support' && target !== 'statewave-support') return
    // Strip the param up-front so a back-nav or refresh doesn't keep reopening.
    params.delete('ask')
    params.delete('widget')
    const next = params.toString()
    const url = window.location.pathname + (next ? `?${next}` : '') + window.location.hash
    window.history.replaceState({}, '', url)
    // Defer the open into a microtask so the setState calls happen outside
    // the effect's render cycle (avoids react-hooks/set-state-in-effect)
    // and lets the page paint before the widget animates in.
    queueMicrotask(() => openWidget('statewave-support', 'Statewave Support'))
    // Run once on mount. openWidget is stable enough for this one-shot effect.
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
    tourStep,
    tourTotal: TOUR_STEPS,
    hasCompletedTour,
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
    nextTourStep,
    prevTourStep,
    skipTour,
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
