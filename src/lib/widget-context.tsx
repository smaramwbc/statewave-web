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
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'
import {
  ChatWidgetContext,
  DEFAULT_PERSONA,
  DEMO_PERSONAS,
  TOUR_STEPS,
  isVisitorMemoryPersona,
  type ChatMessage,
  type ChatWidgetContextType,
  type ContextBundle,
  type DocSource,
  type MemoryItem,
} from './widget-context-api'

// Re-exported for back-compat with consumers that have long imported these
// data shapes from the provider module. New code should pull them straight
// from `./widget-context-api`.
export type { DocSource, ChatMessage, MemoryItem, ContextBundle } from './widget-context-api'

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

/**
 * Fetch wrapper that auto-retries transient failures so a brief network blip
 * doesn't surface as an error bubble. Retries on:
 *   - Network errors (fetch throws — typically TypeError "Failed to fetch")
 *   - HTTP 408 / 429 / 5xx (transient server-side or rate-limit responses)
 * Backoff is exponential and short (250ms, 750ms) so the visitor only sees a
 * slightly longer loading indicator on a recovering blip. Non-transient HTTP
 * statuses (4xx other than 408/429) are returned as-is for the caller to render.
 */
async function fetchWithRetry(
  input: RequestInfo,
  init: RequestInit,
  maxAttempts = 3,
): Promise<Response> {
  let lastErr: unknown
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const resp = await fetch(input, init)
      const transient =
        resp.status === 408 || resp.status === 429 || (resp.status >= 500 && resp.status < 600)
      if (transient && attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 250 * Math.pow(3, attempt - 1)))
        continue
      }
      return resp
    } catch (err) {
      lastErr = err
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 250 * Math.pow(3, attempt - 1)))
        continue
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('Network error')
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
  // Demo by default; the Ask Support entry points flip this to 'support'.
  // The mode flag drives picker/comparison/tour visibility — see ChatWidget.
  const [mode, setMode] = useState<'demo' | 'support'>('demo')
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
  // Persona ids the backend reports as having non-empty memory. `null` means
  // "still loading or fetch failed" — consumers should fall back to the full
  // hardcoded catalog in that case so the widget never strands the visitor
  // with an empty picker.
  const [availablePersonas, setAvailablePersonas] = useState<string[] | null>(null)
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
    // Start the tour at step 1 unless the visitor finished it on a prior
    // visit, OR we're in the focused support flow — Ask Support is a
    // production support channel, not a guided demo, so no tour ever runs
    // there. We deliberately do NOT mark the tour completed here, so a
    // visitor who later comes back via the demo entry still gets the tour.
    if (mode === 'support') return
    setTourStep((prev) => (prev === 0 && !hasCompletedTour ? 1 : prev))
  }, [hasCompletedTour, mode])

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

  const refreshState = useCallback(async (forPersona?: string, signal?: AbortSignal) => {
    try {
      const params = new URLSearchParams()
      if (forPersona) params.set('persona', forPersona)
      const url = `/api/demo-state${params.size ? `?${params.toString()}` : ''}`
      const resp = await fetch(url, { credentials: 'same-origin', signal })
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
      if ((err as { name?: string })?.name === 'AbortError') return null
      console.warn('[widget] Failed to refresh demo state:', err)
      return null
    }
  }, [])

  const seedFromPersona = useCallback(async (rawPersona: string, signal?: AbortSignal): Promise<boolean> => {
    const p = normalizePersona(rawPersona)
    try {
      const resp = await fetch('/api/demo-seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ persona: p }),
        signal,
      })
      if (!resp.ok) return false
      const data = (await resp.json()) as { seeded?: boolean }
      // Always refresh against the persona we just seeded — even when
      // seeded=false (already populated) we want the latest counts/memories
      // on the inspector.
      await refreshState(p, signal)
      return data.seeded === true
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') return false
      console.warn('[widget] seed failed:', err)
      return false
    }
  }, [refreshState])

  const openWidget = useCallback((rawPersona?: string, label?: string, openMode?: 'demo' | 'support') => {
    setIsOpen(true)
    setIsMinimized(false)
    // Support mode is always pinned to the docs-grounded support persona,
    // regardless of what the caller passed — Ask Support is a single-channel
    // entry point and must never inherit a previously-selected demo persona.
    const resolvedMode: 'demo' | 'support' = openMode ?? 'demo'
    setMode(resolvedMode)
    const effectivePersona = resolvedMode === 'support' ? 'statewave-support' : rawPersona
    const effectiveLabel = resolvedMode === 'support' ? 'Statewave Support' : label
    const explicit = !!effectivePersona
    let chosen = persona
    if (effectivePersona) {
      chosen = normalizePersona(effectivePersona)
      setPersona(chosen)
      setPersonaLabel(effectiveLabel ?? DEMO_PERSONAS.find((x) => x.id === chosen)?.label ?? chosen)
    }
    // Each persona is its own memory pool — switching mid-session must not
    // carry chat bubbles from the previous persona into the new one's
    // surface. selectPersona (the in-widget listbox path) already does this;
    // openWidget didn't, so clicking a different homepage particle / nav
    // entry while a chat was already open showed stale bubbles. Gate on the
    // persona actually changing so a bare `openWidget()` reopen (the
    // floating bubble, Footer / UseCases / Developers CTAs) doesn't wipe an
    // in-progress conversation.
    if (effectivePersona && chosen !== persona) {
      setStatelessMessages([])
      setStatewaveMessages([])
      setLastContext(null)
    }
    // Resume the tour for visitors who saw the welcome on a prior visit but
    // never finished walking through the steps. Mid-session reopens skip
    // this branch (tourStep > 0 already, or already completed). Support
    // mode never runs the tour regardless of completion state.
    if (resolvedMode !== 'support') {
      setTourStep((prev) => (prev === 0 && hasSeenWelcome && !hasCompletedTour ? 1 : prev))
    } else {
      setTourStep(0)
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
    // Picking a persona is only possible from the demo flow's dropdown, so
    // any selectPersona call implicitly drops the widget back into demo mode.
    setMode('demo')
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

  // Holds the most recent user input that hit a hard failure after retries.
  // The Retry button (rendered on error bubbles) reads this to re-issue the
  // exchange without making the visitor retype. Cleared as soon as a retry
  // is dispatched or a fresh send succeeds.
  const lastFailedTextRef = useRef<string | null>(null)

  /**
   * Runs a single chat exchange (one user turn → assistant replies on each
   * column) using fetchWithRetry. On hard failure after retries, appends an
   * error bubble carrying retryText so the UI can render a Retry affordance.
   * Returns nothing; side-effects state directly.
   */
  const runExchange = useCallback(async (trimmed: string, skipStateless: boolean) => {
    try {
      // The "without memory" comparison call is purely demo chrome — the
      // support channel never renders that column, so don't waste a backend
      // round-trip on it. Halves per-turn LLM load for support traffic.
      const statelessFetch = skipStateless
        ? Promise.resolve(null)
        : fetchWithRetry('/api/widget-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ messages: [{ role: 'user', content: trimmed }], mode: 'stateless', persona }),
          })
      const statewaveFetch = fetchWithRetry('/api/widget-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ messages: [{ role: 'user', content: trimmed }], mode: 'statewave', persona }),
      })
      const [statelessResp, statewaveResp] = await Promise.all([statelessFetch, statewaveFetch])

      const statewaveText = await statewaveResp.text()
      let statewaveData: {
        reply?: string
        error?: string
        context?: ContextBundle
        sources?: DocSource[]
        capReached?: boolean
      }
      try { statewaveData = JSON.parse(statewaveText) } catch { statewaveData = { error: `API error: ${statewaveResp.status}` } }

      if (statelessResp) {
        const statelessText = await statelessResp.text()
        let statelessData: { reply?: string; error?: string }
        try { statelessData = JSON.parse(statelessText) } catch { statelessData = { error: `API error: ${statelessResp.status}` } }
        setStatelessMessages((prev) => [...prev, {
          role: 'assistant',
          content: statelessData.reply ?? statelessData.error ?? 'No response',
          timestamp: Date.now(),
        }])
      }
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
      lastFailedTextRef.current = null

      // After a successful Statewave turn, the server has written an episode
      // and run compile against the active persona's subject. Refresh against
      // that same persona so the inspector reflects new memory.
      if (statewaveResp.ok && !statewaveData.capReached) {
        void refreshState(persona)
      }
    } catch (err) {
      console.error('[widget] API error after retries:', err)
      lastFailedTextRef.current = trimmed
      const errBubble = (): ChatMessage => ({
        role: 'assistant',
        content: "Connection lost. Tap Retry to send again.",
        timestamp: Date.now(),
        error: true,
        retryText: trimmed,
      })
      if (!skipStateless) setStatelessMessages((prev) => [...prev, errBubble()])
      setStatewaveMessages((prev) => [...prev, errBubble()])
    }
  }, [persona, refreshState])

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
      // Sending also kicks off the tour — but only in the demo flow. Support
      // mode never runs the demo tour regardless of completion state.
      if (mode !== 'support') {
        setTourStep((prev) => (prev === 0 && !hasCompletedTour ? 1 : prev))
      }
    }
    const userMsg: ChatMessage = { role: 'user', content: trimmed, timestamp: Date.now() }
    // Support mode renders only the statewave column, so the stateless side
    // is dead state — skip its setState too. Saves a render and keeps the
    // stateless message log empty (handy for tests asserting "no demo
    // chatter happened in the support channel").
    const skipStateless = mode === 'support'
    if (!skipStateless) setStatelessMessages((prev) => [...prev, userMsg])
    setStatewaveMessages((prev) => [...prev, userMsg])
    setIsLoading(true)
    try {
      await runExchange(trimmed, skipStateless)
    } finally {
      setIsLoading(false)
    }
  }, [hasSeenWelcome, hasCompletedTour, mode, runExchange])

  const retryLast = useCallback(async () => {
    const trimmed = lastFailedTextRef.current
    if (!trimmed) return
    // One retry attempt at a time. Clear the marker before dispatching so
    // a rapid double-click can't queue two parallel exchanges.
    lastFailedTextRef.current = null
    const skipStateless = mode === 'support'
    // Strip the trailing error bubble(s) so a successful retry replaces them
    // cleanly instead of stacking. We never strip user messages — the user's
    // turn already happened and stays in history.
    const stripTrailingError = (prev: ChatMessage[]): ChatMessage[] => {
      const last = prev[prev.length - 1]
      return last?.role === 'assistant' && last.error ? prev.slice(0, -1) : prev
    }
    setStatewaveMessages(stripTrailingError)
    if (!skipStateless) setStatelessMessages(stripTrailingError)
    setIsLoading(true)
    try {
      await runExchange(trimmed, skipStateless)
    } finally {
      setIsLoading(false)
    }
  }, [mode, runExchange])

  // Preload the default persona's memory pool on page mount so the demo is
  // populated the moment a visitor opens the widget — no spinner-while-seeding
  // pause on first interaction. Returning visitors just get a fast confirm
  // fetch; new visitors get cookie issued + showcase episodes seeded silently.
  // Docs-shared default personas (theoretical) skip seeding because their
  // pack is built upstream from official docs, not from a showcase subject.
  useEffect(() => {
    const controller = new AbortController()
    void (async () => {
      const data = await refreshState(DEFAULT_PERSONA.id, controller.signal)
      if (controller.signal.aborted || !data) return
      if (
        isVisitorMemoryPersona(DEFAULT_PERSONA.id) &&
        data.episodeCount === 0 &&
        data.memories.length === 0
      ) {
        await seedFromPersona(DEFAULT_PERSONA.id, controller.signal)
      }
    })()
    return () => controller.abort()
    // Run once on mount. refreshState/seedFromPersona are stable callbacks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fire the persona-availability check on page load (in parallel with the
  // preload above) so the dropdown filter is already resolved by the time
  // the visitor opens the widget. Failure is non-fatal — we leave the state
  // as `null` and the consumer falls back to showing the full catalog.
  useEffect(() => {
    const controller = new AbortController()
    void (async () => {
      try {
        const resp = await fetch('/api/demo-personas', {
          credentials: 'same-origin',
          signal: controller.signal,
        })
        if (!resp.ok) return
        const data = (await resp.json()) as { available?: string[] }
        if (controller.signal.aborted) return
        if (Array.isArray(data.available)) setAvailablePersonas(data.available)
      } catch (err) {
        if ((err as { name?: string })?.name === 'AbortError') return
        console.warn('[widget] persona availability fetch failed:', err)
      }
    })()
    return () => controller.abort()
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
    queueMicrotask(() => openWidget('statewave-support', 'Statewave Support', 'support'))
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
    availablePersonas,
    mode,
    openWidget,
    closeWidget,
    minimizeWidget,
    expandWidget,
    selectPersona,
    sendMessage,
    retryLast,
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
