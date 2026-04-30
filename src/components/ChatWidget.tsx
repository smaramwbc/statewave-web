/**
 * ChatWidget — Premium floating comparison chat widget
 * 
 * A website-native chatbot that demonstrates the difference between:
 * - LLM without memory (stateless)
 * - LLM with Statewave memory (stateful, inspectable)
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatWidget, DEMO_SUBJECTS } from '../lib/widget-context'
import { useTheme } from '../lib/theme'

export function ChatWidget() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const {
    isOpen,
    isMinimized,
    subjectId,
    subjectLabel,
    memories,
    statelessMessages,
    statewaveMessages,
    lastContext,
    isLoading,
    openWidget,
    closeWidget,
    minimizeWidget,
    expandWidget,
    selectSubject,
    sendMessage,
    clearChat,
  } = useChatWidget()

  const [input, setInput] = useState('')
  const [showInspector, setShowInspector] = useState(false)
  const [showSubjectMenu, setShowSubjectMenu] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [statelessMessages, statewaveMessages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const text = input.trim()
    setInput('')
    await sendMessage(text)
  }

  // Launcher button (collapsed state)
  if (!isOpen) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => openWidget()}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-full shadow-xl border backdrop-blur-sm cursor-pointer"
        style={{
          backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)',
          borderColor: isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)',
          boxShadow: isDark
            ? '0 8px 32px -8px rgba(99, 102, 241, 0.4), 0 4px 16px -4px rgba(0, 0, 0, 0.3)'
            : '0 8px 32px -8px rgba(99, 102, 241, 0.25), 0 4px 16px -4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <span className="text-accent text-lg">✦</span>
        <span className="text-sm font-medium text-theme-primary">Try with Memory</span>
      </motion.button>
    )
  }

  // Minimized state
  if (isMinimized) {
    return (
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        onClick={expandWidget}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg border backdrop-blur-sm cursor-pointer"
        style={{
          backgroundColor: isDark ? 'rgba(15, 12, 41, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.15)',
        }}
      >
        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        <span className="text-xs font-medium text-theme-secondary">
          {subjectLabel || 'Chat'} · {statewaveMessages.length} msgs
        </span>
        <ChevronUpIcon className="w-4 h-4 text-theme-muted" />
      </motion.button>
    )
  }

  // Expanded widget
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-6 right-6 z-50 w-[480px] max-h-[560px] flex flex-col rounded-2xl shadow-2xl border overflow-hidden"
        style={{
          backgroundColor: isDark ? 'rgba(10, 15, 26, 0.98)' : 'rgba(255, 255, 255, 0.98)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-theme-border/50">
          <div className="flex items-center gap-3">
            {/* Subject selector */}
            <div className="relative">
              <button
                onClick={() => setShowSubjectMenu(!showSubjectMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-theme-border/50 hover:border-accent/30 transition-colors"
                style={{ backgroundColor: isDark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.05)' }}
              >
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-theme-primary">{subjectLabel || 'Select subject'}</span>
                <ChevronDownIcon className="w-3.5 h-3.5 text-theme-muted" />
              </button>

              <AnimatePresence>
                {showSubjectMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full left-0 mt-1 w-48 rounded-lg shadow-xl border overflow-hidden z-10"
                    style={{
                      backgroundColor: isDark ? 'rgba(15, 12, 41, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    {DEMO_SUBJECTS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          selectSubject(s.id, s.label)
                          setShowSubjectMenu(false)
                        }}
                        className={`w-full px-3 py-2 text-left text-xs hover:bg-accent/10 transition-colors ${
                          s.id === subjectId ? 'bg-accent/15 text-accent' : 'text-theme-secondary'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <span className="text-[10px] text-theme-muted font-mono">{subjectId}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              className="p-1.5 rounded-lg hover:bg-theme-border/30 transition-colors"
              title="Clear chat"
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
              onClick={closeWidget}
              className="p-1.5 rounded-lg hover:bg-theme-border/30 transition-colors"
              title="Close"
            >
              <CloseIcon className="w-4 h-4 text-theme-muted" />
            </button>
          </div>
        </div>

        {/* Comparison columns */}
        <div className="flex-1 flex overflow-hidden">
          {/* Stateless column */}
          <div className="flex-1 flex flex-col border-r border-theme-border/30">
            <div className="px-3 py-2 border-b border-theme-border/30 bg-theme-surface-1/30">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-theme-muted">Without Memory</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {statelessMessages.length === 0 ? (
                <p className="text-xs text-theme-muted text-center py-8 opacity-60">
                  No context available
                </p>
              ) : (
                statelessMessages.map((msg, i) => (
                  <MessageBubble key={i} message={msg} side="stateless" isDark={isDark} />
                ))
              )}
              {isLoading && statelessMessages[statelessMessages.length - 1]?.role === 'user' && (
                <LoadingIndicator isDark={isDark} />
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Statewave column */}
          <div className="flex-1 flex flex-col">
            <div className="px-3 py-2 border-b border-theme-border/30 bg-accent/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">With Statewave</span>
                </div>
                <button
                  onClick={() => setShowInspector(!showInspector)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                    showInspector ? 'bg-accent/20 text-accent' : 'hover:bg-accent/10 text-theme-muted'
                  }`}
                >
                  <InspectIcon className="w-3 h-3" />
                  Inspect
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {statewaveMessages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-theme-muted opacity-60 mb-2">
                    Memory-backed responses
                  </p>
                  <p className="text-[10px] text-accent/70">
                    {memories.length} memories loaded
                  </p>
                </div>
              ) : (
                statewaveMessages.map((msg, i) => (
                  <MessageBubble key={i} message={msg} side="statewave" isDark={isDark} />
                ))
              )}
              {isLoading && statewaveMessages[statewaveMessages.length - 1]?.role === 'user' && (
                <LoadingIndicator isDark={isDark} accent />
              )}
              <div ref={chatEndRef} />
            </div>
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-theme-border/50">
          <div className="flex items-center gap-2">
            <input
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
              className="px-4 py-2 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
          <p className="mt-2 text-[10px] text-theme-muted text-center">
            Same model, same prompt — different outcomes
          </p>
        </form>

        {/* Inspector panel */}
        <AnimatePresence>
          {showInspector && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute inset-y-0 right-0 w-[280px] border-l border-theme-border/50 overflow-hidden flex flex-col"
              style={{
                backgroundColor: isDark ? 'rgba(10, 15, 26, 0.99)' : 'rgba(248, 250, 252, 0.99)',
              }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-theme-border/50">
                <span className="text-xs font-semibold text-theme-primary">Context Inspector</span>
                <button
                  onClick={() => setShowInspector(false)}
                  className="p-1 rounded hover:bg-theme-border/30 transition-colors"
                >
                  <CloseIcon className="w-4 h-4 text-theme-muted" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Memories */}
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-theme-muted mb-2">
                    Memories ({memories.length})
                  </h4>
                  <div className="space-y-2">
                    {memories.slice(0, 8).map((m, i) => (
                      <div
                        key={m.id || i}
                        className="p-2 rounded-lg border border-theme-border/30 text-[11px] text-theme-secondary"
                        style={{ backgroundColor: isDark ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.03)' }}
                      >
                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium bg-accent/20 text-accent mb-1">
                          {m.kind}
                        </span>
                        <p className="leading-relaxed">{m.content}</p>
                      </div>
                    ))}
                    {memories.length === 0 && (
                      <p className="text-[11px] text-theme-muted opacity-60">No memories loaded</p>
                    )}
                  </div>
                </div>

                {/* Last context used */}
                {lastContext && (
                  <div>
                    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-theme-muted mb-2">
                      Last Context
                    </h4>
                    <div className="p-2 rounded-lg border border-theme-border/30 text-[10px] font-mono text-theme-muted" style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)' }}>
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

function MessageBubble({ message, side, isDark }: { message: { role: string; content: string }; side: 'stateless' | 'statewave'; isDark: boolean }) {
  const isUser = message.role === 'user'
  const isStatewave = side === 'statewave'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[90%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
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
        className={`px-4 py-2 rounded-xl ${
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
