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
import { useChatWidget, DEMO_SUBJECTS } from '../lib/widget-context'
import { useTheme } from '../lib/theme'

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
    hasVisibleCta,
    openWidget,
    closeWidget,
    minimizeWidget,
    expandWidget,
    selectPersona,
    sendMessage,
    resetDemo,
  } = useChatWidget()

  const [input, setInput] = useState('')
  const [showInspector, setShowInspector] = useState(false)
  const [showSubjectMenu, setShowSubjectMenu] = useState(false)
  // Mobile: tabbed view for comparison (0=both, 1=stateless, 2=statewave)
  const [mobileTab, setMobileTab] = useState<'split' | 'stateless' | 'statewave'>('split')
  // Track which suggestion round we're on (rotates through available suggestions)
  const [suggestionRound, setSuggestionRound] = useState(0)
  // Maximized state - expands to full browser window
  const [isMaximized, setIsMaximized] = useState(false)
  const statelessScrollRef = useRef<HTMLDivElement>(null)
  const statewaveScrollRef = useRef<HTMLDivElement>(null)
  // Guards against re-entrant scroll syncing: when we programmatically set
  // scrollTop on column B from B's onScroll handler, we don't want B's handler
  // to fire and try to sync back to A.
  const syncingScrollRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const expandedRef = useRef<HTMLDivElement>(null)

  // Multi-round suggestions based on ACTUAL memories in the backend
  // Each array is a round of follow-up questions that flow naturally
  const SUGGESTIONS: Record<string, string[][]> = {
    'support-agent': [
      // Round 1: Initial contact
      [
        "I'm having that login error again on mobile",
        "What was the AUTH-503 issue about?",
        "Did my $50 refund go through?",
      ],
      // Round 2: Follow-ups
      [
        "Can you escalate this to L2 like last time?",
        "I prefer email — can you send me a summary?",
        "What's my current account tier?",
      ],
      // Round 3: More follow-ups
      [
        "Send me another password reset link",
        "Was my billing discrepancy resolved?",
        "I'm still getting the same error on my phone",
      ],
    ],
    'coding-assistant': [
      // Round 1: Current work
      [
        "I think there's another memory leak in useEffect",
        "What was that useDebounce refactor suggestion?",
        "Did PR #142 get merged?",
      ],
      // Round 2: Follow-ups
      [
        "Can you check the WebSocket cleanup code?",
        "What's our current test coverage?",
        "Is v2.4.0-rc1 still on staging?",
      ],
      // Round 3: More context
      [
        "Remind me of my coding style preferences",
        "Help me with a Next.js + Prisma query",
        "What was the SearchInput issue about?",
      ],
    ],
    'sales-copilot': [
      // Round 1: Deal status
      [
        "What's the status of the Acme Corp deal?",
        "Did the CTO demo happen Thursday?",
        "Any news on the legal review?",
      ],
      // Round 2: Follow-ups
      [
        "What security objections did we address?",
        "Remind me of the pricing we proposed",
        "What changes did legal want on data retention?",
      ],
      // Round 3: Next steps
      [
        "Who's the contact at Acme Corp?",
        "When should I follow up on the contract?",
        "What's the total ARR if they sign?",
      ],
    ],
    'devops-agent': [
      // Round 1: Current alerts
      [
        "Any issues with node-7 lately?",
        "What triggered the last rollback?",
        "How many replicas are running now?",
      ],
      // Round 2: Follow-ups
      [
        "What was the root cause in the post-mortem?",
        "Show me the new runbook procedure",
        "What's our current uptime against SLA?",
      ],
      // Round 3: Infrastructure
      [
        "How many GKE clusters do we have?",
        "Did the HPA scaling work correctly?",
        "Is v2.3.0 still stable after the rollback?",
      ],
    ],
    'research-assistant': [
      // Round 1: Recent papers
      [
        "Summarize the LoRA paper findings",
        "How does LoRA compare to full fine-tuning?",
        "What papers did I save to Notion?",
      ],
      // Round 2: Follow-ups
      [
        "Show me the comparison table you made",
        "What's the citation graph for LoRA?",
        "Explain the Attention Is All You Need paper",
      ],
      // Round 3: Preferences
      [
        "Find more arxiv papers on this topic",
        "What parameter-efficient methods did we compare?",
        "What's the 10x cost reduction about?",
      ],
    ],
  }

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

  // Auto-focus input when widget opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, isMinimized, persona])

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
    // Hide the floating launcher whenever an on-page CTA (hero, footer, …) is
    // already in the viewport — having two "Try the demo" affordances visible
    // at once is noisy.
    if (hasVisibleCta) return null
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => openWidget()}
        className="fixed z-50 flex items-center gap-2.5 px-5 py-3 rounded-full shadow-xl border backdrop-blur-sm cursor-pointer"
        style={{
          bottom: isMobile ? 16 : 24,
          right: isMobile ? 16 : 24,
          backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)',
          borderColor: isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)',
          boxShadow: isDark
            ? '0 8px 32px -8px rgba(99, 102, 241, 0.4), 0 4px 16px -4px rgba(0, 0, 0, 0.3)'
            : '0 8px 32px -8px rgba(99, 102, 241, 0.25), 0 4px 16px -4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <span className="text-accent text-lg">✦</span>
        <span className="text-sm font-medium text-theme-primary">Try the demo</span>
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
          bottom: isMobile ? 16 : 24,
          right: isMobile ? 16 : 24,
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
      return {
        width: 'calc(100vw - 24px)',
        maxWidth: '100%',
        height: showInspector ? 'calc(100vh - 80px)' : 'calc(85vh - 60px)',
        maxHeight: 'calc(100vh - 80px)',
        bottom: 12,
        right: 12,
        left: 12,
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
            {/* Persona selector — biases the prompt + suggestion chips. Subject
                is the visitor's own and does not change with persona. */}
            <div className="relative">
              <button
                onClick={() => setShowSubjectMenu(!showSubjectMenu)}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium border border-theme-border/50 hover:border-accent/30 transition-colors"
                style={{ backgroundColor: isDark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.05)' }}
                title="Persona — biases the prompt; memory is shared across personas"
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
                    className="absolute top-full left-0 mt-1 w-56 rounded-lg shadow-xl border overflow-hidden z-20"
                    style={{
                      backgroundColor: isDark ? 'rgba(15, 12, 41, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <div className="px-3 py-1.5 text-[9px] uppercase tracking-wider text-theme-muted border-b border-theme-border/40">
                      Persona (prompt only)
                    </div>
                    {DEMO_SUBJECTS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          selectPersona(s.id, s.label)
                          setShowSubjectMenu(false)
                        }}
                        className={`w-full px-3 py-2 text-left text-xs hover:bg-accent/10 transition-colors ${
                          s.id === persona ? 'bg-accent/15 text-accent' : 'text-theme-secondary'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!isMobile && subjectId && (
              <span className="text-[10px] text-theme-muted font-mono truncate" title={subjectId}>
                {subjectId.length > 22 ? `${subjectId.slice(0, 22)}…` : subjectId}
              </span>
            )}
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <button
              onClick={() => {
                if (isResetting) return
                if (window.confirm('Reset demo memory? This permanently deletes the episodes and memories Statewave has stored for this browser.')) {
                  void resetDemo()
                }
              }}
              disabled={isResetting}
              className="p-1.5 rounded-lg hover:bg-theme-border/30 transition-colors disabled:opacity-50"
              title="Reset demo memory (delete this browser's Statewave subject)"
            >
              <TrashIcon className="w-4 h-4 text-theme-muted" />
            </button>
            <button
              onClick={minimizeWidget}
              className="p-1.5 rounded-lg hover:bg-theme-border/30 transition-colors"
              title="Minimize"
            >
              <MinimizeIcon className="w-4 h-4 text-theme-muted" />
            </button>
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
            <button
              onClick={closeWidget}
              className="p-1.5 rounded-lg hover:bg-theme-border/30 transition-colors"
              title="Close"
            >
              <CloseIcon className="w-4 h-4 text-theme-muted" />
            </button>
          </div>
        </div>

        {/* Mobile tab selector */}
        {isMobile && (
          <div className="flex border-b border-theme-border/30 flex-shrink-0">
            {(['split', 'stateless', 'statewave'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setMobileTab(tab)}
                className={`flex-1 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                  mobileTab === tab
                    ? tab === 'statewave'
                      ? 'text-accent border-b-2 border-accent'
                      : 'text-theme-primary border-b-2 border-theme-primary'
                    : 'text-theme-muted'
                }`}
              >
                {tab === 'split' ? 'Compare' : tab === 'stateless' ? 'No Memory' : 'Statewave'}
              </button>
            ))}
          </div>
        )}

        {/* Comparison columns */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Stateless column */}
          {(!isMobile || mobileTab === 'split' || mobileTab === 'stateless') && (
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
                className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2 sm:space-y-3"
              >
                {statelessMessages.length === 0 ? (
                  <p className="text-[10px] sm:text-xs text-theme-muted text-center py-6 sm:py-8 opacity-60">
                    No context available
                  </p>
                ) : (
                  statelessMessages.map((msg, i) => (
                    <div key={i} data-msg-idx={String(i)}>
                      <MessageBubble message={msg} side="stateless" isDark={isDark} compact={isMobile && mobileTab === 'split'} />
                    </div>
                  ))
                )}
                {isLoading && statelessMessages[statelessMessages.length - 1]?.role === 'user' && (
                  <LoadingIndicator isDark={isDark} />
                )}
              </div>
            </div>
          )}

          {/* Statewave column */}
          {(!isMobile || mobileTab === 'split' || mobileTab === 'statewave') && (
            <div className={`flex flex-col ${
              isMobile && mobileTab === 'split' ? 'w-1/2' : isMobile ? 'w-full' : 'flex-1'
            }`}>
              <div className="px-2 sm:px-3 py-1.5 sm:py-2 h-8 sm:h-9 border-b border-theme-border/30 bg-accent/5 flex-shrink-0">
                <div className="flex items-center justify-between h-full">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-accent">
                      {isMobile && mobileTab === 'split' ? 'Statewave' : 'With Statewave'}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowInspector(!showInspector)}
                    className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-medium transition-colors ${
                      showInspector ? 'bg-accent/20 text-accent' : 'hover:bg-accent/10 text-theme-muted'
                    }`}
                  >
                    <InspectIcon className="w-3 h-3" />
                    {(!isMobile || mobileTab !== 'split') && 'Inspect'}
                  </button>
                </div>
              </div>
              <div
                ref={statewaveScrollRef}
                onScroll={() => syncScrollByIndex('statewave')}
                className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2 sm:space-y-3"
              >
                {statewaveMessages.length === 0 ? (
                  isHydrating ? (
                    <div className="flex flex-col items-center justify-center py-8 sm:py-10 gap-3">
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
                      <p className="text-[10px] sm:text-xs text-theme-muted opacity-70">
                        Loading demo memory…
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8">
                      <p className="text-[10px] sm:text-xs text-theme-muted opacity-60 mb-2">
                        {isReturningVisitor ? 'Welcome back — your demo memory is loaded' : 'Memory-backed responses'}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-accent/70">
                        {memories.length} {memories.length === 1 ? 'memory' : 'memories'}
                        {episodeCount > 0 && ` · ${episodeCount} ${episodeCount === 1 ? 'episode' : 'episodes'}`}
                      </p>
                    </div>
                  )
                ) : (
                  statewaveMessages.map((msg, i) => (
                    <div key={i} data-msg-idx={String(i)}>
                      <MessageBubble message={msg} side="statewave" isDark={isDark} compact={isMobile && mobileTab === 'split'} />
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
        <form onSubmit={handleSubmit} className="px-3 sm:px-4 py-2.5 sm:py-3 border-t border-theme-border/50 flex-shrink-0">
          {/* Suggestion chips */}
          {showSuggestions && (
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={async () => {
                    // Send the suggestion directly and advance to next round
                    await sendMessage(s)
                    setSuggestionRound(r => r + 1)
                  }}
                  className="text-[10px] sm:text-[11px] px-2.5 py-1.5 rounded-md border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 hover:border-accent/50 transition-all cursor-pointer"
                >
                  {s}
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
              className="flex-1 px-3 py-2 rounded-lg text-sm border border-theme-border/50 bg-transparent text-theme-primary placeholder:text-theme-muted/50 focus:outline-none focus:border-accent/50 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-3 sm:px-4 py-2 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              Send
            </button>
          </div>
          <p className="mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] text-theme-muted text-center">
            Same model, same prompt — different outcomes
          </p>
          <p className="mt-1 text-[9px] sm:text-[10px] text-theme-muted/80 text-center leading-relaxed">
            This browser is remembered. Each Statewave turn writes a real episode to our hosted demo
            backend; memory compiles after every turn. <button type="button" onClick={() => { if (!isResetting && window.confirm('Reset demo memory? This permanently deletes this browser’s episodes and memories.')) void resetDemo() }} className="underline hover:text-theme-secondary">Reset demo memory</button>{' '}
            anytime.
          </p>
        </form>

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

              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
                {/* Memories — compiled from this browser's chat history */}
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-theme-muted mb-1">
                    Your demo memory ({memories.length})
                  </h4>
                  <p className="text-[9px] sm:text-[10px] text-theme-muted/80 leading-relaxed mb-2">
                    Compiled from {episodeCount} {episodeCount === 1 ? 'episode' : 'episodes'} written by this browser.
                    Real Statewave subject; persists across visits until you reset.
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
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Sub-components ───

interface MessageBubbleProps {
  message: { role: string; content: string }
  side: 'stateless' | 'statewave'
  isDark: boolean
  compact?: boolean
}

function MessageBubble({ message, side, isDark, compact }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isStatewave = side === 'statewave'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`${compact ? 'max-w-[95%] px-2 py-1.5 text-[10px]' : 'max-w-[90%] px-3 py-2 text-xs'} rounded-xl leading-relaxed ${
          isUser
            ? 'bg-accent/20 text-theme-primary'
            : isStatewave
              ? isDark ? 'bg-accent/10 text-theme-secondary' : 'bg-accent/5 text-theme-secondary'
              : isDark ? 'bg-white/5 text-theme-secondary' : 'bg-black/5 text-theme-secondary'
        }`}
      >
        {message.content}
      </div>
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
