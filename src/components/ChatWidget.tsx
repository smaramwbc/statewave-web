/**
 * ChatWidget — Premium floating comparison chat widget
 * 
 * A website-native chatbot that demonstrates the difference between:
 * - LLM without memory (stateless)
 * - LLM with Statewave memory (stateful, inspectable)
 * 
 * RESPONSIVE SIZING STRATEGY:
 * 
 * Desktop (>1024px):
 *   - Floating bottom-right corner widget
 *   - Width: clamp(560px, 50vw, 800px) — wider for side-by-side comparison
 *   - Height: clamp(520px, 72vh, 760px)
 *   - Inspector: side panel (280px)
 * 
 * Tablet (768-1024px):
 *   - Floating bottom-right with larger presence
 *   - Width: min(95vw, 720px)
 *   - Height: min(80vh, 760px)
 *   - Inspector: slide-over panel
 * 
 * Mobile (<768px):
 *   - Bottom-sheet style, nearly full-width
 *   - Width: calc(100vw - 24px) with safe margins
 *   - Height: calc(100vh - 120px) or 85vh
 *   - Inspector: tabbed/stacked view instead of side panel
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatWidget, DEMO_SUBJECTS, isDocsSharedPersona, personaBlurb, type DocSource } from '../lib/widget-context-api'
import { useTheme } from '../lib/theme'
import { Logo } from './Logo'
import { MarkdownMessage } from './chat/MarkdownMessage'
import { SUGGESTIONS } from './chat/suggestions'
import { safeUrl } from '@statewavedev/chat-react'

// Responsive breakpoints
const useResponsive = () => {
  const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth
      if (w < 768) setViewport('mobile')
      else if (w < 1024) setViewport('tablet')
      else setViewport('desktop')
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return viewport
}

export function ChatWidget() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const viewport = useResponsive()
  const isMobile = viewport === 'mobile'
  const isTablet = viewport === 'tablet'

  const {
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
    tourTotal,
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
    dismissWelcome,
    showWelcome,
    nextTourStep,
    prevTourStep,
    skipTour,
  } = useChatWidget()

  const [input, setInput] = useState('')
  const [showInspector, setShowInspector] = useState(false)
  const [showSubjectMenu, setShowSubjectMenu] = useState(false)
  // Whether the widget is in the focused production support channel (Ask
  // Support entry) vs. the comparison demo flow. Suppresses the persona
  // picker, comparison columns, marketing copy, and the guided tour.
  const isSupportMode = mode === 'support'
  // Mobile: tabbed view for comparison. We deliberately drop the "split"
  // option on phones — two columns of chat at ~180px wide each are
  // unreadable; the user can't actually read either side. Mobile gets a
  // toggle between "Without Memory" and "With Statewave" instead, defaulting
  // to the Statewave column (the winning side of the comparison) so the
  // first impression is the answer the visitor came to see. We derive the
  // effective tab via a memo rather than setState-in-effect so React 19's
  // exhaustive-deps lint stays happy and we don't trigger a cascading
  // render on every viewport change.
  const [mobileTabRaw, setMobileTab] = useState<'split' | 'stateless' | 'statewave'>('split')
  const mobileTab: 'split' | 'stateless' | 'statewave' =
    isMobile && mobileTabRaw === 'split' ? 'statewave' : mobileTabRaw
  // Track which suggestion round we're on (rotates through available suggestions)
  const [suggestionRound, setSuggestionRound] = useState(0)
  // Maximized state - expands to full browser window
  const [isMaximized, setIsMaximized] = useState(false)
  // Reset-demo confirmation: replaces window.confirm() with an in-widget
  // modal that matches the Statewave theme. Lives inside the widget shell
  // so it never breaks the visual frame.
  const [confirmReset, setConfirmReset] = useState(false)
  const statelessScrollRef = useRef<HTMLDivElement>(null)
  const statewaveScrollRef = useRef<HTMLDivElement>(null)
  // Guards against re-entrant scroll syncing: when we programmatically set
  // scrollTop on column B from B's onScroll handler, we don't want B's handler
  // to fire and try to sync back to A.
  const syncingScrollRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const expandedRef = useRef<HTMLDivElement>(null)

  // Suggestions are keyed on persona (not subject — every visitor shares one
  // subject; persona only biases the system prompt + suggestion chips).
  const personaSuggestions = SUGGESTIONS[persona] ?? []
  const currentRound = suggestionRound % Math.max(personaSuggestions.length, 1)
  const suggestions = personaSuggestions[currentRound] ?? []
  const showSuggestions = suggestions.length > 0 && !isLoading

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSuggestionRound(0)
  }, [persona])

  // Auto-focus input when widget opens, and refocus once a turn finishes —
  // the input is `disabled` while isLoading, which blurs it on submit, and
  // browsers don't restore focus when `disabled` flips back to false.
  useEffect(() => {
    if (!isOpen || isMinimized || isLoading) return
    const id = window.setTimeout(() => inputRef.current?.focus(), 50)
    return () => window.clearTimeout(id)
  }, [isOpen, isMinimized, persona, isLoading])

  // Click anywhere outside the expanded widget minimizes it.
  // Defer listener registration so the same click that opened the widget
  // (e.g. a hero particle click) does not immediately collapse it.
  useEffect(() => {
    if (!isOpen || isMinimized) return
    const handler = (e: MouseEvent) => {
      const node = expandedRef.current
      if (!node) return
      if (node.contains(e.target as Node)) return
      minimizeWidget()
    }
    const t = window.setTimeout(() => {
      document.addEventListener('mousedown', handler)
    }, 0)
    return () => {
      window.clearTimeout(t)
      document.removeEventListener('mousedown', handler)
    }
  }, [isOpen, isMinimized, minimizeWidget])

  // Stop wheel events on the widget chrome from scrolling the page behind it.
  // Inner scroll containers carry overscroll-behavior: contain so they handle
  // their own bounds; for everything else inside the widget (header, banner,
  // input footer) we walk up from the wheel target and absorb the event if no
  // ancestor scroll container can consume the delta. Registered with
  // passive:false because React's onWheel can't preventDefault by default.
  useEffect(() => {
    const root = expandedRef.current
    if (!root || !isOpen || isMinimized) return
    const handler = (e: WheelEvent) => {
      let el = e.target as HTMLElement | null
      while (el && el !== root) {
        if (el.scrollHeight > el.clientHeight) {
          const overflowY = window.getComputedStyle(el).overflowY
          if (overflowY === 'auto' || overflowY === 'scroll') {
            const goingDown = e.deltaY > 0
            const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1
            const atTop = el.scrollTop <= 0
            if ((goingDown && !atBottom) || (!goingDown && !atTop)) {
              // Inner container can absorb this wheel — let the browser handle it.
              return
            }
          }
        }
        el = el.parentElement
      }
      e.preventDefault()
    }
    root.addEventListener('wheel', handler, { passive: false })
    return () => root.removeEventListener('wheel', handler)
  }, [isOpen, isMinimized])

  // On new messages, scroll BOTH columns to the bottom together so the user
  // can compare the latest reply side-by-side.
  useEffect(() => {
    syncingScrollRef.current = true
    const scrollBoth = () => {
      const a = statelessScrollRef.current
      const b = statewaveScrollRef.current
      if (a) a.scrollTop = a.scrollHeight
      if (b) b.scrollTop = b.scrollHeight
    }
    scrollBoth()
    // Release the lock on the next frame so user-driven scrolls re-engage.
    const r = requestAnimationFrame(() => { syncingScrollRef.current = false })
    return () => cancelAnimationFrame(r)
  }, [statelessMessages.length, statewaveMessages.length])

  // Diff-style scroll sync: when the user scrolls one column, align the other
  // by message index. Each turn produces matching index N in both columns,
  // so anchoring on the topmost visible bubble keeps the same turn aligned
  // even when individual replies have different heights.
  const syncScrollByIndex = useCallback((source: 'stateless' | 'statewave') => {
    if (syncingScrollRef.current) return
    const src = source === 'stateless' ? statelessScrollRef.current : statewaveScrollRef.current
    const dst = source === 'stateless' ? statewaveScrollRef.current : statelessScrollRef.current
    if (!src || !dst) return
    const bubbles = src.querySelectorAll<HTMLElement>('[data-msg-idx]')
    let anchorIdx: string | null = null
    let anchorOffset = 0
    for (const el of bubbles) {
      const topInScroller = el.offsetTop - src.offsetTop - src.scrollTop
      if (topInScroller >= 0) {
        anchorIdx = el.dataset.msgIdx ?? null
        anchorOffset = topInScroller
        break
      }
    }
    if (!anchorIdx) return
    const dstAnchor = dst.querySelector<HTMLElement>(`[data-msg-idx="${CSS.escape(anchorIdx)}"]`)
    if (!dstAnchor) return
    syncingScrollRef.current = true
    dst.scrollTop = dstAnchor.offsetTop - dst.offsetTop - anchorOffset
    requestAnimationFrame(() => { syncingScrollRef.current = false })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const text = input.trim()
    setInput('')
    await sendMessage(text)
  }

  // ─── Launcher button (collapsed state) ───
  if (!isOpen) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => openWidget('statewave-support', 'Statewave Support', 'support')}
        className="fixed z-50 flex items-center gap-2.5 px-5 py-3 rounded-full shadow-xl border backdrop-blur-sm cursor-pointer"
        style={{
          // Mobile: center horizontally, clear the iOS home indicator via
          // env(safe-area-inset-bottom). Desktop keeps the corner-anchored
          // floating affordance.
          bottom: isMobile ? 'max(env(safe-area-inset-bottom), 1rem)' : 24,
          ...(isMobile
            ? { left: '50%', x: '-50%' }
            : { right: 24 }),
          backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)',
          borderColor: isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)',
          boxShadow: isDark
            ? '0 8px 32px -8px rgba(99, 102, 241, 0.4), 0 4px 16px -4px rgba(0, 0, 0, 0.3)'
            : '0 8px 32px -8px rgba(99, 102, 241, 0.25), 0 4px 16px -4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <span className="text-accent text-lg">✦</span>
        <span className="text-sm font-medium text-theme-primary">Ask Support</span>
      </motion.button>
    )
  }

  // ─── Minimized state ───
  if (isMinimized) {
    return (
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        onClick={expandWidget}
        className="fixed z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg border backdrop-blur-sm cursor-pointer"
        style={{
          // Same center-on-mobile pattern as the launcher above so both
          // states sit in the same place — less visual jumping.
          bottom: isMobile ? 'max(env(safe-area-inset-bottom), 1rem)' : 24,
          ...(isMobile
            ? { left: '50%', x: '-50%' }
            : { right: 24 }),
          backgroundColor: isDark ? 'rgba(15, 12, 41, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.15)',
        }}
      >
        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        <span className="text-xs font-medium text-theme-secondary">
          {personaLabel} · {statewaveMessages.length} msgs
        </span>
        <ChevronUpIcon className="w-4 h-4 text-theme-muted" />
      </motion.button>
    )
  }

  // ─── Responsive sizing classes ───
  const getWidgetStyles = (): React.CSSProperties => {
    // Maximized mode: large modal with padding
    if (isMaximized) {
      return {
        width: 'calc(100vw - 48px)',
        height: 'calc(100vh - 48px)',
        maxWidth: 'calc(100vw - 48px)',
        maxHeight: 'calc(100vh - 48px)',
        bottom: 24,
        right: 24,
        left: 24,
        top: 24,
      }
    }
    if (isMobile) {
      // Full-screen on mobile: the widget owns the entire viewport so the
      // user is never reading half-visible cards through a thin gap. We
      // honor iOS safe-area insets so the widget chrome doesn't slide
      // under the notch / Dynamic Island / home indicator. The inset-0
      // positioning + 100dvh height guarantees coverage even when the
      // address bar collapses on scroll.
      return {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: '100vw',
        height: '100dvh',
        maxWidth: '100vw',
        maxHeight: '100dvh',
        borderRadius: 0,
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }
    }
    if (isTablet) {
      return {
        width: 'min(95vw, 720px)',
        height: 'min(80vh, 760px)',
        maxHeight: '760px',
        bottom: 20,
        right: 20,
      }
    }
    // Desktop - wider for side-by-side comparison
    return {
      width: 'clamp(560px, 50vw, 800px)',
      height: 'clamp(520px, 72vh, 760px)',
      maxHeight: '760px',
      bottom: 24,
      right: 24,
    }
  }

  const widgetStyles = getWidgetStyles()

  // ─── Expanded widget ───
  return (
    <AnimatePresence>
      <motion.div
        ref={expandedRef}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed z-50 flex flex-col shadow-2xl border overflow-hidden rounded-2xl"
        style={{
          ...widgetStyles,
          backgroundColor: isDark ? 'rgba(10, 15, 26, 0.98)' : 'rgba(255, 255, 255, 0.98)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-theme-border/50 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {/* In support mode this is a static title — no picker, no demo
                framing. In demo mode it's the persona selector that biases
                the prompt + suggestion chips. */}
            {isSupportMode ? (
              <div
                data-testid="support-mode-title"
                className="flex items-center gap-2 sm:gap-2.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ backgroundColor: isDark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.05)' }}
              >
                <Logo variant="icon" className="!h-4 !w-4" />
                <span className="text-theme-primary font-semibold">Statewave Support</span>
              </div>
            ) : (
            <div className={`relative rounded-lg ${tourStep === 1 ? 'tour-pulse tour-pulse--inherit-radius' : ''}`} data-tour-target="persona">
              <button
                onClick={() => setShowSubjectMenu(!showSubjectMenu)}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium border border-theme-border/50 hover:border-accent/30 transition-colors"
                style={{ backgroundColor: isDark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.05)' }}
                title={
                  isDocsSharedPersona(persona)
                    ? 'Statewave Support — answers grounded in the official docs memory pack.'
                    : 'Persona — each has its own per-visitor memory pool.'
                }
              >
                <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                <span className="text-theme-primary truncate max-w-[100px] sm:max-w-[140px]">
                  {personaLabel}
                </span>
                <ChevronDownIcon className="w-3.5 h-3.5 text-theme-muted flex-shrink-0" />
              </button>

              <AnimatePresence>
                {showSubjectMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full left-0 mt-1 w-72 rounded-lg shadow-xl border overflow-hidden z-20"
                    style={{
                      backgroundColor: isDark ? 'rgba(15, 12, 41, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <div className="px-3 py-1.5 text-[9px] uppercase tracking-wider text-theme-muted border-b border-theme-border/40">
                      Persona
                    </div>
                    {/* Filter to personas the backend actually has memory for.
                        Fall back to the full catalog while the availability
                        check is still in flight (null) or if the backend
                        returned an empty list — better to show all than to
                        strand the visitor with an empty picker. */}
                    {(() => {
                      const filtered =
                        availablePersonas && availablePersonas.length > 0
                          ? DEMO_SUBJECTS.filter((s) => availablePersonas.includes(s.id))
                          : DEMO_SUBJECTS
                      const visible = filtered.length > 0 ? filtered : DEMO_SUBJECTS
                      return visible
                    })().map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          selectPersona(s.id, s.label)
                          setShowSubjectMenu(false)
                        }}
                        className={`w-full px-3 py-2 text-left text-xs hover:bg-accent/10 transition-colors ${
                          s.id === persona ? 'bg-accent/15 text-accent' : 'text-theme-secondary'
                        }`}
                        data-persona-kind={s.kind}
                      >
                        <div className="font-medium">{s.label}</div>
                        <div className="text-[10px] text-theme-muted mt-0.5 leading-snug">
                          {s.blurb}
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            )}

            {/* Internal subject id is debugging chrome — only useful for the
                demo flow where switching personas changes the subject. The
                support channel deliberately hides it: visitors should never
                see internal routing identifiers in a production support UI. */}
            {!isSupportMode && !isMobile && subjectId && (
              <span className="text-[10px] text-theme-muted font-mono truncate" title={subjectId}>
                {subjectId.length > 22 ? `${subjectId.slice(0, 22)}…` : subjectId}
              </span>
            )}
            {/* "Grounded in official docs" is conveyed three different ways
                already (persona dropdown subtitle, column body welcome card,
                trust strip in support mode). On phones the header has no
                room for a fourth surface — the badge was overflowing into
                the maximize / close icons. Show it only on tablet+. */}
            {isDocsSharedPersona(persona) && !isSupportMode && (
              <span
                data-testid="docs-grounding-badge"
                className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20 whitespace-nowrap"
                title="Answers are grounded in the official Statewave documentation memory pack. The agent will say so when a question is out of scope."
              >
                Grounded in official docs
              </span>
            )}
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            {/* On phones the widget is already full-screen, so maximize is
                redundant and minimize is awkward (collapsing from full-
                screen to a pill is jarring). We hide both on mobile and
                keep help / reset / close — those still serve real
                functions on a phone. Desktop keeps the full toolbar. */}
            {/* The "what is this demo?" replay is demo chrome — hide it in
                support mode so the channel never re-frames itself as a demo. */}
            {!isSupportMode && (
              <button
                onClick={showWelcome}
                className="p-1.5 rounded-lg hover:bg-theme-border/30 transition-colors"
                title="What is this demo?"
                aria-label="Show demo intro"
              >
                <HelpIcon className="w-4 h-4 text-theme-muted" />
              </button>
            )}
            {/* Reset is a demo-only affordance (wipes the visitor's per-persona
                showcase memory). Support mode hides it entirely. */}
            {!isSupportMode && (
              <button
                onClick={() => {
                  if (isResetting) return
                  if (isDocsSharedPersona(persona)) return
                  setConfirmReset(true)
                }}
                disabled={isResetting || isDocsSharedPersona(persona)}
                className="p-1.5 rounded-lg hover:bg-theme-border/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title={
                  isDocsSharedPersona(persona)
                    ? 'Statewave Support reads from the shared docs pack — there is no per-visitor memory to reset.'
                    : "Reset demo memory (delete this browser's Statewave subject)"
                }
                data-testid="reset-demo-button"
              >
                <TrashIcon className="w-4 h-4 text-theme-muted" />
              </button>
            )}
            {!isMobile && (
              <button
                onClick={minimizeWidget}
                className="p-1.5 rounded-lg hover:bg-theme-border/30 transition-colors"
                title="Minimize"
              >
                <MinimizeIcon className="w-4 h-4 text-theme-muted" />
              </button>
            )}
            {!isMobile && (
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-1.5 rounded-lg hover:bg-theme-border/30 transition-colors"
                title={isMaximized ? "Restore size" : "Maximize"}
              >
                {isMaximized ? (
                  <RestoreIcon className="w-4 h-4 text-theme-muted" />
                ) : (
                  <MaximizeIcon className="w-4 h-4 text-theme-muted" />
                )}
              </button>
            )}
            <button
              onClick={closeWidget}
              className="p-1.5 rounded-lg hover:bg-theme-border/30 transition-colors"
              title="Close"
            >
              <CloseIcon className="w-4 h-4 text-theme-muted" />
            </button>
          </div>
        </div>

        {/* Welcome panel — first-time onboarding. Takes over the body of the
            widget while the visitor hasn't seen the intro. Header stays so it
            reads as part of the same widget; preload + auto-seed continue in
            the background so memory is ready by the time they dismiss. */}
        {/* Welcome panel — shown the first time the widget opens. Replaces the
            comparison columns until dismissed. Persists across reloads via
            localStorage; resetDemo() does NOT bring it back (it's UI state,
            not memory). */}
        {!hasSeenWelcome && (
          <div
            data-testid="onboarding-welcome"
            className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 py-8 sm:py-10 overflow-y-auto scroll-contain"
          >
            {/* Brand mark with a soft layered halo for a premium feel. */}
            <div className="relative mb-6 flex-shrink-0">
              <div
                aria-hidden
                className="absolute inset-0 -m-6 rounded-full blur-2xl opacity-60"
                style={{
                  background: isDark
                    ? 'radial-gradient(circle, rgba(99,102,241,0.45) 0%, rgba(99,102,241,0) 70%)'
                    : 'radial-gradient(circle, rgba(99,102,241,0.30) 0%, rgba(99,102,241,0) 70%)',
                }}
              />
              <div
                aria-hidden
                className="absolute inset-0 -m-2 rounded-full"
                style={{
                  border: `1px solid ${isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.20)'}`,
                }}
              />
              <div
                className="relative w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.22) 0%, rgba(139,92,246,0.18) 100%)'
                    : 'linear-gradient(135deg, rgba(99,102,241,0.14) 0%, rgba(139,92,246,0.10) 100%)',
                  border: `1px solid ${isDark ? 'rgba(99,102,241,0.40)' : 'rgba(99,102,241,0.28)'}`,
                  boxShadow: isDark
                    ? '0 8px 32px -8px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.05)'
                    : '0 8px 24px -10px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.6)',
                }}
              >
                <Logo variant="icon" className="!h-9 !w-9" />
              </div>
            </div>

            <p className="text-[10px] uppercase tracking-[0.18em] text-accent/80 font-semibold mb-2">
              {isSupportMode ? 'Statewave Support' : 'Welcome'}
            </p>
            <h3 className="text-lg sm:text-xl font-semibold text-theme-primary text-center tracking-tight">
              {isSupportMode
                ? 'How can I help?'
                : isDocsSharedPersona(persona)
                  ? 'Ask Statewave Support'
                  : 'Try Statewave with real memory'}
            </h3>

            {/* Selected-persona card — tells the visitor *which* agent they're
                about to talk to and what its memory does, before the generic
                "how the demo works" copy below. Switching personas (header
                dropdown / hero menu) updates this in place. */}
            {!isSupportMode && (
              <div
                data-testid="welcome-persona"
                className="mt-4 flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl border max-w-md text-left"
                style={{
                  backgroundColor: isDark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.05)',
                  borderColor: isDark ? 'rgba(129, 140, 248, 0.22)' : 'rgba(99, 102, 241, 0.18)',
                }}
              >
                <span className="mt-1 w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                <span className="min-w-0">
                  <span className="block text-xs sm:text-sm font-semibold text-theme-primary">
                    {personaLabel}
                  </span>
                  <span className="block mt-0.5 text-[11px] sm:text-xs text-theme-muted leading-relaxed">
                    {personaBlurb(persona) ?? 'A demo agent with its own Statewave memory.'}
                  </span>
                </span>
              </div>
            )}

            {isSupportMode ? (
              <>
                <p className="mt-4 text-xs sm:text-sm text-theme-muted text-center max-w-md leading-relaxed">
                  Hi — I'm the Statewave support assistant. I can help with setup,
                  memory concepts, integrations, self-hosting, troubleshooting,
                  and how Statewave fits into your agent stack.
                </p>
                <p className="mt-2.5 text-xs sm:text-sm text-theme-muted text-center max-w-md leading-relaxed">
                  Answers are grounded in the official Statewave docs and cite
                  the pages they came from. I'll remember what you're exploring
                  so follow-up questions are easier next time.
                </p>
              </>
            ) : isDocsSharedPersona(persona) ? (
              <>
                <p className="mt-4 text-xs sm:text-sm text-theme-muted text-center max-w-md leading-relaxed">
                  {isMobile ? (
                    <>
                      Two AI agents, same model. Switch between the
                      <span className="font-semibold text-theme-secondary"> Without Memory </span>
                      and
                      <span className="font-semibold text-accent"> With Statewave </span>
                      tabs above — the second is grounded in the official
                      Statewave docs and cites the pages it used.
                    </>
                  ) : (
                    <>
                      Two AI agents, same model. The left replies with no context.
                      The right is grounded in the official Statewave docs and
                      cites the pages it used — no fabrication, no per-visitor memory.
                    </>
                  )}
                </p>
                <p className="mt-2.5 text-xs sm:text-sm text-theme-muted text-center max-w-md leading-relaxed">
                  Ask about deployment, retrieval, the SDKs, or how the runtime
                  works. Switch the dropdown above to try the per-visitor
                  memory personas instead.
                </p>
              </>
            ) : (
              <>
                <p className="mt-4 text-xs sm:text-sm text-theme-muted text-center max-w-md leading-relaxed">
                  {isMobile ? (
                    <>
                      Two AI agents, same model. Switch between the
                      <span className="font-semibold text-theme-secondary"> Without Memory </span>
                      and
                      <span className="font-semibold text-accent"> With Statewave </span>
                      tabs above — only the second one gets ranked memory
                      compiled live from your turns by a real Statewave server.
                    </>
                  ) : (
                    <>
                      Two AI agents, same model. The left replies with no context.
                      The right gets ranked memory compiled live from your turns by
                      a real Statewave server.
                    </>
                  )}
                </p>
                <p className="mt-2.5 text-xs sm:text-sm text-theme-muted text-center max-w-md leading-relaxed">
                  This browser is remembered, so memory carries across visits.
                  Reset anytime from the trash icon.
                </p>
              </>
            )}

            <div
              aria-hidden
              className="mt-7 mb-6 h-px w-16"
              style={{
                background: isDark
                  ? 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.4) 50%, transparent 100%)'
                  : 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.3) 50%, transparent 100%)',
              }}
            />

            <button
              type="button"
              onClick={dismissWelcome}
              className="group relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium text-white bg-accent hover:bg-accent-light transition-all"
              style={{
                boxShadow: isDark
                  ? '0 8px 24px -8px rgba(99,102,241,0.55), inset 0 1px 0 rgba(255,255,255,0.12)'
                  : '0 8px 20px -8px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.25)',
              }}
            >
              <span>Next</span>
              <span className="transition-transform group-hover:translate-x-0.5" aria-hidden>→</span>
            </button>
          </div>
        )}

        {hasSeenWelcome && <>

        {/* Tour banner — visible only while a step is active. Walks the visitor
            through the persona model, the suggestion+input flow, and the
            inspector. Each step rings the relevant UI piece via data-tour-active. */}
        {tourStep > 0 && (
          <div
            data-testid="tour-banner"
            className="relative px-3.5 sm:px-5 py-3 sm:py-3.5 border-b flex-shrink-0 overflow-hidden"
            style={{
              // Layered background: a strong accent tint over a soft gradient
              // sweep that gives the banner visible "guidance surface" weight
              // without being garish in either theme.
              background: isDark
                ? 'linear-gradient(180deg, rgba(99,102,241,0.18) 0%, rgba(99,102,241,0.10) 100%)'
                : 'linear-gradient(180deg, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0.06) 100%)',
              borderBottomColor: isDark ? 'rgba(99,102,241,0.35)' : 'rgba(99,102,241,0.28)',
            }}
          >
            {/* Vertical accent rail on the left edge — subliminal "this is a
                guided panel" cue without taking up real estate. */}
            <span
              aria-hidden
              className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent"
              style={{ boxShadow: '0 0 12px rgba(99,102,241,0.55)' }}
            />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {/* Step badge as a real chip — readable, branded. */}
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-accent text-white shadow-[0_0_12px_rgba(99,102,241,0.45)]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/90" />
                    Step {tourStep} of {tourTotal}
                  </span>
                </div>
                <p className="text-sm sm:text-[15px] font-semibold text-theme-primary tracking-tight">
                  {tourStep === 1 && (isDocsSharedPersona(persona)
                    ? 'Grounded in the official docs'
                    : 'About this persona’s memory')}
                  {tourStep === 2 && 'Try a question'}
                  {tourStep === 3 && 'See what Statewave used'}
                </p>
                <p className="mt-1 text-[11.5px] sm:text-[12.5px] text-theme-secondary leading-relaxed">
                  {tourStep === 1 && (
                    isDocsSharedPersona(persona) ? (
                      <>
                        <span className="text-theme-primary font-medium">{personaLabel}</span> answers
                        from the shared Statewave docs pack — the same pages
                        every visitor sees, with citations on every reply.
                        It’s read-only and doesn’t learn from your visit.
                        Switch the dropdown to the per-visitor personas to see
                        Statewave compile memory from your turns instead.
                      </>
                    ) : (
                      <>
                        You’re seeing <span className="text-theme-primary font-medium">{personaLabel}</span>’s
                        seeded memory pool — facts compiled by Statewave from showcase sessions, not yours.
                        Each persona has its own pool; switch via the dropdown.
                      </>
                    )
                  )}
                  {tourStep === 2 && 'Pick a chip below or type your own. Both agents answer the same prompt simultaneously — left without memory, right with Statewave-ranked context.'}
                  {tourStep === 3 && 'After a turn, open the Inspector to see the exact compiled memories Statewave drew from.'}
                </p>
              </div>
              <button
                type="button"
                onClick={skipTour}
                className="text-[10.5px] text-theme-muted hover:text-theme-secondary underline-offset-2 hover:underline whitespace-nowrap flex-shrink-0 mt-1"
              >
                skip tour
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5" aria-hidden>
                {Array.from({ length: tourTotal }).map((_, i) => (
                  <span
                    key={i}
                    className={`block h-1.5 rounded-full transition-all duration-300 ${
                      i + 1 === tourStep
                        ? 'w-6 bg-accent shadow-[0_0_8px_rgba(99,102,241,0.6)]'
                        : i + 1 < tourStep
                          ? 'w-2 bg-accent/55'
                          : 'w-2 bg-accent/20'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevTourStep}
                  disabled={tourStep <= 1}
                  className="text-[11.5px] px-2.5 py-1.5 rounded-md text-theme-secondary hover:text-theme-primary hover:bg-theme-border/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextTourStep}
                  className="text-[11.5px] px-3.5 py-1.5 rounded-md bg-accent text-white hover:bg-accent-light transition-all duration-150 font-semibold shadow-[0_2px_10px_rgba(99,102,241,0.35)] hover:shadow-[0_2px_14px_rgba(99,102,241,0.5)]"
                >
                  {tourStep < tourTotal ? 'Next' : 'Got it'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile tab selector — toggles between the two comparison columns.
            Support mode shows a single chat (no toggle needed). The "Compare"
            split is intentionally absent: two columns of chat side-by-side
            are unreadable on a 375–430px-wide screen. */}
        {isMobile && !isSupportMode && (
          <div className="flex border-b border-theme-border/30 flex-shrink-0">
            {(['stateless', 'statewave'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMobileTab(tab)}
                aria-pressed={mobileTab === tab}
                className={`flex-1 min-h-11 py-2.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                  mobileTab === tab
                    ? tab === 'statewave'
                      ? 'text-accent border-b-2 border-accent'
                      : 'text-theme-primary border-b-2 border-theme-primary'
                    : 'text-theme-muted'
                }`}
              >
                {tab === 'stateless' ? 'Without Memory' : 'With Statewave'}
              </button>
            ))}
          </div>
        )}

        {/* Comparison columns (demo) or single chat (support). The "Without
            Memory" column is suppressed entirely in support mode — a real
            support channel shows one answer, not a side-by-side comparison. */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Stateless column */}
          {!isSupportMode && (!isMobile || mobileTab === 'split' || mobileTab === 'stateless') && (
            <div className={`flex flex-col border-r border-theme-border/30 ${
              isMobile && mobileTab === 'split' ? 'w-1/2' : isMobile ? 'w-full' : 'flex-1'
            }`}>
              <div className="px-2 sm:px-3 py-1.5 sm:py-2 h-8 sm:h-9 border-b border-theme-border/30 bg-theme-surface-1/30 flex-shrink-0">
                <div className="flex items-center justify-between h-full">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-theme-muted">
                      {isMobile && mobileTab === 'split' ? 'No Mem' : 'Without Memory'}
                    </span>
                  </div>
                </div>
              </div>
              <div
                ref={statelessScrollRef}
                onScroll={() => syncScrollByIndex('stateless')}
                className="flex-1 overflow-y-auto scroll-contain p-2 sm:p-3 space-y-2 sm:space-y-3"
              >
                {statelessMessages.length === 0 ? (
                  <p className="text-[10px] sm:text-xs text-theme-muted text-center py-6 sm:py-8 opacity-60">
                    No context available
                  </p>
                ) : (
                  statelessMessages.map((msg, i) => (
                    <div key={i} data-msg-idx={String(i)}>
                      <MessageBubble
                        message={msg}
                        side="stateless"
                        isDark={isDark}
                        compact={isMobile && mobileTab === 'split'}
                        onRetry={
                          i === statelessMessages.length - 1 && msg.error && !isLoading
                            ? retryLast
                            : undefined
                        }
                      />
                    </div>
                  ))
                )}
                {isLoading && statelessMessages[statelessMessages.length - 1]?.role === 'user' && (
                  <LoadingIndicator isDark={isDark} />
                )}
              </div>
            </div>
          )}

          {/* Statewave column — the only column shown in support mode, where
              it expands to fill the full width of the widget body. */}
          {(!isMobile || mobileTab === 'split' || mobileTab === 'statewave' || isSupportMode) && (
            <div className={`flex flex-col ${
              isSupportMode ? 'flex-1 w-full' : isMobile && mobileTab === 'split' ? 'w-1/2' : isMobile ? 'w-full' : 'flex-1'
            }`}>
              {/* The "WITH STATEWAVE" subheader frames the column as one half
                  of a comparison — meaningless in support mode. Show a clean
                  trust strip instead. */}
              {isSupportMode ? (
                <div className="px-3 py-1.5 sm:py-2 h-8 sm:h-9 border-b border-theme-border/30 bg-accent/5 flex-shrink-0 flex items-center justify-between">
                  <span className="text-[9px] sm:text-[10px] text-theme-muted">
                    Answers grounded in Statewave docs when sources are available.
                  </span>
                  <button
                    onClick={() => setShowInspector(!showInspector)}
                    className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-medium transition-colors ${
                      showInspector ? 'bg-accent/20 text-accent' : 'hover:bg-accent/10 text-theme-muted'
                    }`}
                    title="Show the documentation context this answer was grounded in"
                  >
                    <InspectIcon className="w-3 h-3" />
                    Sources
                  </button>
                </div>
              ) : (
              <div className="px-2 sm:px-3 py-1.5 sm:py-2 h-8 sm:h-9 border-b border-theme-border/30 bg-accent/5 flex-shrink-0">
                <div className="flex items-center justify-between h-full">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-accent">
                      {isMobile && mobileTab === 'split' ? 'Statewave' : 'With Statewave'}
                    </span>
                  </div>
                  <button
                    data-tour-target="inspect"
                    onClick={() => {
                      setShowInspector(!showInspector)
                      // Opening the inspector during the final tour step is the
                      // strongest "I get it" signal — auto-complete the tour.
                      if (!showInspector && tourStep === tourTotal) nextTourStep()
                    }}
                    className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-medium transition-colors ${
                      showInspector ? 'bg-accent/20 text-accent' : 'hover:bg-accent/10 text-theme-muted'
                    } ${tourStep === 3 ? 'tour-pulse tour-pulse--inherit-radius' : ''}`}
                  >
                    <InspectIcon className="w-3 h-3" />
                    {(!isMobile || mobileTab !== 'split') && 'Inspect'}
                  </button>
                </div>
              </div>
              )}
              <div
                ref={statewaveScrollRef}
                onScroll={() => syncScrollByIndex('statewave')}
                className="flex-1 overflow-y-auto scroll-contain p-2 sm:p-3 space-y-2 sm:space-y-3"
              >
                {statewaveMessages.length === 0 ? (
                  isHydrating ? (
                    <div className="flex flex-col items-center justify-center py-8 sm:py-10 gap-3 px-4 text-center">
                      <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-accent"
                            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                      <p className="text-[11px] sm:text-xs font-medium text-theme-secondary">
                        {hydrationReason === 'setup' && 'Setting up your demo subject…'}
                        {hydrationReason === 'restore' && 'Restoring your memory pool…'}
                        {hydrationReason === 'reset' && 'Starting fresh — new subject…'}
                        {!hydrationReason && 'Loading demo memory…'}
                      </p>
                      <p className="text-[10px] text-theme-muted/80 leading-relaxed max-w-[260px]">
                        {hydrationReason === 'setup' && 'Issuing your visitor cookie and seeding the support-agent pool from the Statewave server. About a second.'}
                        {hydrationReason === 'restore' && 'Reading your demo subject from the Statewave server.'}
                        {hydrationReason === 'reset' && 'Wiping the previous subjects and provisioning a clean one.'}
                      </p>
                    </div>
                  ) : isSupportMode ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className="flex flex-col items-center text-center px-4 sm:px-6 py-7 sm:py-9"
                    >
                      <div className="relative mb-4">
                        <div
                          className="absolute inset-0 rounded-2xl blur-xl opacity-70"
                          style={{
                            background: isDark
                              ? 'radial-gradient(closest-side, rgba(99,102,241,0.55), transparent 75%)'
                              : 'radial-gradient(closest-side, rgba(99,102,241,0.35), transparent 75%)',
                          }}
                        />
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/15 to-accent/5 shadow-[0_6px_24px_-8px_rgba(99,102,241,0.55)]">
                          <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 4h6.5L19 9.75v8.5A2.75 2.75 0 0116.25 21H7.75A2.75 2.75 0 015 18.25V6.75A2.75 2.75 0 017.75 4z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 4v4.25c0 .69.56 1.25 1.25 1.25h4.5" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 13.5h7M8.5 16.5h4.5" />
                          </svg>
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-2.5 py-[3px] text-[9px] sm:text-[9.5px] font-semibold uppercase tracking-[0.16em] text-accent/90">
                        <span className="h-1 w-1 rounded-full bg-accent shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
                        Docs memory pack
                      </div>

                      <h3 className="mt-2.5 text-[13px] sm:text-sm font-semibold tracking-tight text-theme-primary">
                        Grounded in the official Statewave docs
                      </h3>

                      <p className="mt-1.5 max-w-[300px] text-[10.5px] sm:text-[11px] leading-relaxed text-theme-secondary/85">
                        Ask product, setup, deployment, privacy, or compiler questions. Answers come from the docs memory pack and cite the source — the agent will say so plainly when something isn't covered.
                      </p>

                      <div className="mt-4 grid w-full max-w-[320px] grid-cols-3 gap-1.5">
                        {[
                          { label: 'Cited', sub: 'every claim' },
                          { label: 'Grounded', sub: 'official docs' },
                          { label: 'Honest', sub: 'about gaps' },
                        ].map((f) => (
                          <div
                            key={f.label}
                            className="rounded-lg border border-theme-border/40 bg-theme-border/[0.04] px-1.5 py-1.5"
                          >
                            <div className="text-[10px] font-semibold text-theme-primary/90 leading-none">{f.label}</div>
                            <div className="mt-1 text-[9px] text-theme-muted/75 leading-tight">{f.sub}</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center py-6 sm:py-8 px-4">
                      <p className="text-[11px] sm:text-xs font-medium text-theme-secondary mb-1.5">
                        {isDocsSharedPersona(persona)
                          ? 'Grounded in the official Statewave docs'
                          : isReturningVisitor
                          ? 'Welcome back — your demo memory is loaded'
                          : memories.length > 0
                          ? 'Memory loaded — ready when you are'
                          : 'No memory yet'}
                      </p>
                      {isDocsSharedPersona(persona) ? (
                        <p className="text-[10px] text-theme-muted/80 leading-relaxed max-w-[280px] mx-auto">
                          Ask product, setup, deployment, privacy, or compiler questions. Answers come from the docs memory pack and cite the source. The agent will say so plainly when something isn't covered.
                        </p>
                      ) : memories.length > 0 ? (
                        <p className="text-[10px] text-accent/80">
                          {memories.length} {memories.length === 1 ? 'memory' : 'memories'}
                          {episodeCount > 0 && ` · ${episodeCount} ${episodeCount === 1 ? 'episode' : 'episodes'}`} · open the inspector to view
                        </p>
                      ) : (
                        <p className="text-[10px] text-theme-muted/80 leading-relaxed max-w-[260px] mx-auto">
                          Statewave will compile facts, procedures, and summaries from your turns as you chat. Watch the inspector populate.
                        </p>
                      )}
                    </div>
                  )
                ) : (
                  statewaveMessages.map((msg, i) => (
                    <div key={i} data-msg-idx={String(i)}>
                      <MessageBubble
                        message={msg}
                        side="statewave"
                        isDark={isDark}
                        compact={isMobile && mobileTab === 'split'}
                        onRetry={
                          i === statewaveMessages.length - 1 && msg.error && !isLoading
                            ? retryLast
                            : undefined
                        }
                      />
                    </div>
                  ))
                )}
                {isLoading && statewaveMessages[statewaveMessages.length - 1]?.role === 'user' && (
                  <LoadingIndicator isDark={isDark} accent />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          data-tour-target="ask"
          className={`px-3 sm:px-4 py-2.5 sm:py-3 border-t border-theme-border/50 flex-shrink-0 transition-shadow ${
            tourStep === 2 ? 'tour-pulse tour-pulse--inherit-radius' : ''
          }`}
        >
          {/* Suggestion chips. On phones long suggestions like "How do I
              connect Statewave to my agent?" exceed the available row width
              and were getting cut by the rounded card. We let them wrap
              within the chip (`whitespace-normal` + `text-left`) and
              constrain max-width so a single very long chip can't push past
              the input column. `break-anywhere` covers extreme edge cases
              (URLs in suggestions). */}
          {showSuggestions && (
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={async () => {
                    // Send the suggestion directly and advance to next round
                    await sendMessage(s.text)
                    setSuggestionRound(r => r + 1)
                    // Auto-advance the tour from "try a question" once the
                    // visitor actually tries one.
                    if (tourStep === 2) nextTourStep()
                  }}
                  className="text-[10px] sm:text-[11px] px-2.5 py-1.5 rounded-md border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 hover:border-accent/50 transition-all cursor-pointer max-w-full text-left whitespace-normal leading-snug break-anywhere"
                >
                  {s.text}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 rounded-lg text-base sm:text-sm border border-theme-border/50 bg-transparent text-theme-primary placeholder:text-theme-muted/50 focus:outline-none focus:border-accent/50 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-3 sm:px-4 py-2 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              Send
            </button>
          </div>
          {isSupportMode ? (
            <p className="mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] text-theme-muted/80 text-center leading-relaxed">
              I'll remember what you're exploring so follow-up questions are easier next time.
            </p>
          ) : (
          <>
            <p className="mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] text-theme-muted text-center">
              Same model, same prompt — different outcomes
            </p>
            <p className="mt-1 text-[9px] sm:text-[10px] text-theme-muted/80 text-center leading-relaxed">
              This browser is remembered. Each Statewave turn writes a real episode to our hosted demo
              backend; memory compiles after every turn. <button type="button" onClick={() => { if (!isResetting) setConfirmReset(true) }} className="underline hover:text-theme-secondary">Reset demo memory</button>{' '}
              anytime.
            </p>
          </>
          )}
        </form>

        </>}

        {/* Inspector panel */}
        <AnimatePresence>
          {showInspector && (
            <motion.div
              initial={{ opacity: 0, x: isMobile ? 0 : '100%', y: isMobile ? '100%' : 0 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: isMobile ? 0 : '100%', y: isMobile ? '100%' : 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`absolute border-theme-border/50 overflow-hidden flex flex-col ${
                isMobile
                  ? 'inset-x-0 bottom-0 top-[52px] border-t rounded-t-xl'
                  : 'inset-y-0 right-0 w-[260px] sm:w-[280px] border-l'
              }`}
              style={{
                backgroundColor: isDark ? 'rgba(10, 15, 26, 0.99)' : 'rgba(248, 250, 252, 0.99)',
              }}
            >
              <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-theme-border/50 flex-shrink-0">
                <span className="text-xs font-semibold text-theme-primary">Context Inspector</span>
                <button
                  onClick={() => setShowInspector(false)}
                  className="p-1 rounded hover:bg-theme-border/30 transition-colors"
                >
                  <CloseIcon className="w-4 h-4 text-theme-muted" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto scroll-contain p-3 sm:p-4 space-y-4">
                {/* Memories — compiled from this browser's chat history */}
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-theme-muted mb-1">
                    Your demo memory ({memories.length})
                  </h4>
                  <p className="text-[9px] sm:text-[10px] text-theme-muted/80 leading-relaxed mb-2">
                    {episodeCount > 0
                      ? <>Compiled from {episodeCount} {episodeCount === 1 ? 'episode' : 'episodes'} on your real Statewave subject. Persists across visits until you reset.</>
                      : <>Statewave will compile facts, procedures, and summaries here as you chat. Real Statewave subject; persists across visits until you reset.</>}
                  </p>
                  <div className="space-y-2">
                    {memories.slice(0, 8).map((m, i) => (
                      <div
                        key={m.id || i}
                        className="p-2 rounded-lg border border-theme-border/30 text-[10px] sm:text-[11px] text-theme-secondary"
                        style={{ backgroundColor: isDark ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.03)' }}
                      >
                        <span className="inline-block px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-medium bg-accent/20 text-accent mb-1">
                          {m.kind}
                        </span>
                        <p className="leading-relaxed">{m.content}</p>
                      </div>
                    ))}
                    {memories.length === 0 && (
                      <p className="text-[10px] sm:text-[11px] text-theme-muted opacity-60">
                        No memories yet — chat a few turns and Statewave will compile some.
                      </p>
                    )}
                    {memories.length > 8 && (
                      <p className="text-[9px] sm:text-[10px] text-theme-muted">
                        +{memories.length - 8} more memories
                      </p>
                    )}
                  </div>
                </div>

                {/* Last context used */}
                {lastContext && (
                  <div>
                    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-theme-muted mb-2">
                      Last Context
                    </h4>
                    <div
                      className="p-2 rounded-lg border border-theme-border/30 text-[9px] sm:text-[10px] font-mono text-theme-muted"
                      style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)' }}
                    >
                      <p className="mb-1">
                        <span className="text-accent">task:</span> {lastContext.task}
                      </p>
                      <p className="mb-1">
                        <span className="text-accent">facts:</span> {lastContext.facts?.length ?? 0}
                      </p>
                      <p className="mb-1">
                        <span className="text-accent">procedures:</span> {lastContext.procedures?.length ?? 0}
                      </p>
                      <p>
                        <span className="text-accent">tokens:</span> ~{lastContext.token_estimate ?? 0}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reset confirmation — themed modal that lives inside the widget
            shell so it never breaks the visual frame. Replaces the browser's
            native confirm() dialog (which can't match Statewave styling). */}
        <AnimatePresence>
          {confirmReset && (
            <motion.div
              key="confirm-reset"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 z-[60] flex items-center justify-center px-4"
              style={{
                backgroundColor: isDark ? 'rgba(3, 7, 18, 0.7)' : 'rgba(15, 23, 42, 0.45)',
                backdropFilter: 'blur(6px)',
              }}
              onClick={(e) => {
                // Clicking the backdrop dismisses; clicks on the card stop here.
                if (e.target === e.currentTarget && !isResetting) setConfirmReset(false)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape' && !isResetting) setConfirmReset(false)
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="reset-confirm-title"
              aria-describedby="reset-confirm-body"
              tabIndex={-1}
            >
              <motion.div
                initial={{ scale: 0.95, y: 8 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 8 }}
                transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="w-full max-w-[360px] rounded-2xl border shadow-2xl overflow-hidden"
                style={{
                  backgroundColor: isDark ? 'rgba(10, 15, 26, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                  borderColor: isDark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.2)',
                }}
              >
                <div className="px-5 pt-5 pb-4">
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-0.5 inline-flex w-9 h-9 rounded-full items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: isDark ? 'rgba(244, 63, 94, 0.18)' : 'rgba(244, 63, 94, 0.12)',
                        color: '#f87171',
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <h3
                        id="reset-confirm-title"
                        className="text-[15px] font-semibold text-theme-primary tracking-tight"
                      >
                        Reset demo memory?
                      </h3>
                      <p
                        id="reset-confirm-body"
                        className="mt-1.5 text-[12.5px] text-theme-secondary leading-relaxed"
                      >
                        This permanently deletes the episodes and memories
                        Statewave has stored for this browser across all personas.
                        A fresh subject is issued immediately.
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className="flex items-center justify-end gap-2 px-5 py-3 border-t"
                  style={{
                    borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
                    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(248, 250, 252, 0.6)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => { if (!isResetting) setConfirmReset(false) }}
                    disabled={isResetting}
                    className="text-[12px] px-3 py-1.5 rounded-md text-theme-secondary hover:text-theme-primary hover:bg-theme-border/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await resetDemo()
                      setConfirmReset(false)
                    }}
                    disabled={isResetting}
                    autoFocus
                    className="text-[12px] px-3.5 py-1.5 rounded-md text-white font-semibold transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: '#ef4444',
                      boxShadow: '0 2px 10px rgba(239, 68, 68, 0.35)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isResetting) {
                        e.currentTarget.style.backgroundColor = '#dc2626'
                        e.currentTarget.style.boxShadow = '0 2px 14px rgba(239, 68, 68, 0.5)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ef4444'
                      e.currentTarget.style.boxShadow = '0 2px 10px rgba(239, 68, 68, 0.35)'
                    }}
                  >
                    {isResetting ? 'Resetting…' : 'Reset memory'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Sub-components ───

interface MessageBubbleProps {
  message: { role: string; content: string; sources?: DocSource[]; error?: boolean }
  side: 'stateless' | 'statewave'
  isDark: boolean
  compact?: boolean
  /** When provided, renders a Retry affordance under the bubble. Only set on
   *  the trailing error bubble per column so the user can re-send the failed
   *  turn without retyping. */
  onRetry?: () => void
}

export function MessageBubble({ message, side, isDark, compact, onRetry }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isStatewave = side === 'statewave'
  const isError = !isUser && message.error === true
  // Sources are only attached to docs-grounded assistant turns by sendMessage,
  // and only on the Statewave side. Render the citation row when present —
  // otherwise stay completely silent (no "no sources" placeholder).
  const sources = !isUser && isStatewave ? message.sources : undefined

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`${compact ? 'max-w-[95%] px-2 py-1.5 text-[10px]' : 'max-w-[90%] px-3 py-2 text-xs'} rounded-xl leading-relaxed ${
          isUser
            ? 'bg-accent/20 text-theme-primary'
            : isError
              ? isDark ? 'bg-red-500/10 text-red-200' : 'bg-red-500/10 text-red-700'
              : isStatewave
                ? isDark ? 'bg-accent/10 text-theme-secondary' : 'bg-accent/5 text-theme-secondary'
                : isDark ? 'bg-white/5 text-theme-secondary' : 'bg-black/5 text-theme-secondary'
        }`}
      >
        {/* User turns render as plain text — we never want a visitor's typed
            text reinterpreted as Markdown (a stray `[x](javascript:...)` from
            paste-bombing, accidental formatting, etc). Assistant turns are
            model-authored, run through the safe MarkdownMessage renderer. */}
        {isUser ? message.content : <MarkdownMessage content={message.content} />}
      </div>
      {isError && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          data-testid="chat-retry"
          className={`${compact ? 'mt-1 text-[10px]' : 'mt-1.5 text-xs'} px-2 py-0.5 rounded-md font-medium border transition-colors ${
            isDark
              ? 'border-red-400/30 text-red-200 hover:bg-red-500/10'
              : 'border-red-500/30 text-red-700 hover:bg-red-500/10'
          }`}
        >
          Retry
        </button>
      )}
      {sources && sources.length > 0 && (
        <SourcesRow sources={sources} compact={compact} />
      )}
    </div>
  )
}

function SourcesRow({ sources, compact }: { sources: DocSource[]; compact?: boolean }) {
  return (
    <div
      data-testid="message-sources"
      className={`${compact ? 'mt-1 max-w-[95%]' : 'mt-1.5 max-w-[90%]'} px-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] leading-snug`}
    >
      <span className="uppercase tracking-wider text-theme-muted/80">Sources</span>
      {sources.map((s, i) => {
        const safe = safeUrl(s.url)
        return (
          <span key={s.doc_path} className="flex items-center gap-1.5">
            {safe ? (
              <a
                href={safe.href}
                target="_blank"
                rel="noopener noreferrer"
                title={s.breadcrumb}
                className="text-theme-secondary hover:text-accent hover:underline underline-offset-2 decoration-accent/40 transition-colors font-mono"
                data-testid="source-link"
                data-doc-path={s.doc_path}
              >
                {s.doc_path}
              </a>
            ) : (
              <span
                title={s.breadcrumb}
                className="text-theme-muted font-mono"
                data-testid="source-link"
                data-doc-path={s.doc_path}
              >
                {s.doc_path}
              </span>
            )}
            {i < sources.length - 1 && (
              <span aria-hidden className="text-theme-muted/50">·</span>
            )}
          </span>
        )
      })}
    </div>
  )
}

function LoadingIndicator({ isDark, accent }: { isDark: boolean; accent?: boolean }) {
  return (
    <div className="flex justify-start">
      <div
        className={`px-3 sm:px-4 py-2 rounded-xl ${
          accent
            ? isDark ? 'bg-accent/10' : 'bg-accent/5'
            : isDark ? 'bg-white/5' : 'bg-black/5'
        }`}
      >
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${accent ? 'bg-accent' : 'bg-theme-muted'}`}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Icons ───

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function MinimizeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
    </svg>
  )
}

function MaximizeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
    </svg>
  )
}

function RestoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 4H4v4M16 4h4v4M8 20H4v-4M16 20h4v-4" />
    </svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}

function InspectIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function HelpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 9.5a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 4M12 17h.01" />
    </svg>
  )
}
