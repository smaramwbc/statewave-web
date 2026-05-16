/**
 * Chat Widget Context — public API surface (types, Context object, hooks,
 * persona registry). The Provider implementation lives in widget-context.tsx;
 * splitting these out keeps that file component-only so React Fast Refresh
 * works cleanly during development.
 */

import { createContext, useContext, useEffect, type RefObject } from 'react'

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
  /** Marks an assistant bubble that's standing in for a failed exchange so
   *  the UI can render a Retry affordance instead of a regular reply. */
  error?: boolean
  /** The original user input that produced this error bubble. Used by the
   *  retry path to re-issue the exchange without making the visitor retype. */
  retryText?: string
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

export interface ChatWidgetState {
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
  /** Persona ids whose backing subject has data on the upstream Statewave
   *  backend. Resolved by an on-mount call to `/api/demo-personas` (fired in
   *  parallel with the default-persona preload). `null` while the request is
   *  in flight or if it failed — consumers should fall back to the full
   *  hardcoded catalog in that case. */
  availablePersonas: string[] | null
  /**
   * Which entry-point opened the widget. Drives whether the visitor sees the
   * full demo experience (persona picker, comparison columns, marketing copy,
   * guided tour) or a focused production support channel (single chat, no
   * picker, support copy, no tour).
   *   `demo`    — opened via "Try the demo" launcher / hero CTAs.
   *   `support` — opened via "Ask Support" navbar button or `?ask=support`
   *               deep-link. Always pinned to the `statewave-support` persona.
   */
  mode: 'demo' | 'support'
}

export interface ChatWidgetActions {
  /**
   * Open the widget. With no args, opens the demo flow at the default
   * persona. With `mode = 'support'`, the widget opens in the focused
   * support channel — persona is forced to `statewave-support` regardless
   * of the `persona` argument, and the picker / comparison / tour are
   * suppressed by the consumer.
   */
  openWidget: (persona?: string, personaLabel?: string, mode?: 'demo' | 'support') => void
  closeWidget: () => void
  minimizeWidget: () => void
  expandWidget: () => void
  selectPersona: (persona: string, label: string) => void
  sendMessage: (text: string) => Promise<void>
  /** Re-issues the most recent failed exchange without making the visitor
   *  retype. Strips the trailing error bubble(s) first. No-op if the last
   *  exchange succeeded or there's no remembered failure. */
  retryLast: () => Promise<void>
  /** Wipes the visitor's Statewave subject and clears chat. */
  resetDemo: () => Promise<void>
  /** Local-only: clears the chat panel without touching server state. */
  clearChat: () => void
  /**
   * Copies episodes from a showcase persona subject (e.g. demo-support-agent)
   * into the visitor's subject if it is empty, then refreshes state. No-op
   * for visitors that already have data.
   */
  seedFromPersona: (persona: string, signal?: AbortSignal) => Promise<boolean>
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

export type ChatWidgetContextType = ChatWidgetState & ChatWidgetActions

export const ChatWidgetContext = createContext<ChatWidgetContextType | null>(null)

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
export const DEMO_PERSONAS = [
  {
    id: 'support-agent',
    label: 'Support Agent',
    kind: 'visitor-memory',
    blurb: 'Remembers each customer’s account, past tickets, and preferences across chats.',
  },
  {
    id: 'coding-assistant',
    label: 'Coding Assistant',
    kind: 'visitor-memory',
    blurb: 'Recalls your stack, conventions, and past decisions so you stop re-explaining your codebase.',
  },
  {
    id: 'sales-copilot',
    label: 'Sales Copilot',
    kind: 'visitor-memory',
    blurb: 'Tracks every prospect — company, deal stage, and prior conversations.',
  },
  {
    id: 'devops-agent',
    label: 'DevOps Agent',
    kind: 'visitor-memory',
    blurb: 'Keeps your services, incidents, and runbooks in context across sessions.',
  },
  {
    id: 'research-assistant',
    label: 'Research Assistant',
    kind: 'visitor-memory',
    blurb: 'Builds on earlier findings and sources instead of restarting every session.',
  },
  {
    id: 'statewave-support',
    label: 'Statewave Support',
    kind: 'docs-shared',
    blurb: 'Answers grounded in the official Statewave docs, with citations to the pages used.',
  },
] as const

export type PersonaKind = 'visitor-memory' | 'docs-shared'

export const DEMO_SUBJECTS = DEMO_PERSONAS.map((p) => ({
  id: p.id,
  label: p.label,
  kind: p.kind as PersonaKind,
  blurb: p.blurb,
}))

export function personaKind(id: string): PersonaKind | null {
  return DEMO_PERSONAS.find((p) => p.id === id)?.kind ?? null
}

/**
 * One-line, visitor-facing description of what a persona's memory does.
 * Accepts either a persona id (`support-agent`) or a hero-canvas subject id
 * (`demo-support-agent`) — the `demo-` prefix is stripped so the particle
 * tooltips can share the same copy as the widget. Returns `null` for unknown
 * ids so callers can fall back to generic copy.
 */
export function personaBlurb(idOrSubjectId: string): string | null {
  const id = idOrSubjectId.replace(/^demo-/, '')
  return DEMO_PERSONAS.find((p) => p.id === id)?.blurb ?? null
}

export function isVisitorMemoryPersona(id: string): boolean {
  return personaKind(id) === 'visitor-memory'
}

export function isDocsSharedPersona(id: string): boolean {
  return personaKind(id) === 'docs-shared'
}

export const DEFAULT_PERSONA = DEMO_PERSONAS.find((p) => p.id === 'statewave-support')!

/** Number of post-welcome tour steps. The tour banner walks through the
 *  persona / suggestion-and-input / inspector pieces of the widget. Bumping
 *  this constant alone is not enough — copy lives in ChatWidget.tsx. */
export const TOUR_STEPS = 3

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
