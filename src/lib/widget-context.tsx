/**
 * Chat Widget Context
 * 
 * Global state for the floating comparison chat widget.
 * Allows any component (like HeroBackground) to open the widget
 * with a specific subject pre-selected.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

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
  subjectId: string | null
  subjectLabel: string | null
  memories: MemoryItem[]
  statelessMessages: ChatMessage[]
  statewaveMessages: ChatMessage[]
  lastContext: ContextBundle | null
  isLoading: boolean
}

interface ChatWidgetActions {
  openWidget: (subjectId?: string, subjectLabel?: string) => void
  closeWidget: () => void
  minimizeWidget: () => void
  expandWidget: () => void
  selectSubject: (subjectId: string, label: string) => void
  sendMessage: (text: string) => Promise<void>
  clearChat: () => void
}

type ChatWidgetContextType = ChatWidgetState & ChatWidgetActions

const ChatWidgetContext = createContext<ChatWidgetContextType | null>(null)

export function useChatWidget() {
  const ctx = useContext(ChatWidgetContext)
  if (!ctx) throw new Error('useChatWidget must be used within ChatWidgetProvider')
  return ctx
}

const DEMO_SUBJECTS = [
  { id: 'demo-support-agent', label: 'Support Agent' },
  { id: 'demo-coding-assistant', label: 'Coding Assistant' },
  { id: 'demo-sales-copilot', label: 'Sales Copilot' },
  { id: 'demo-devops-agent', label: 'DevOps Agent' },
  { id: 'demo-research-assistant', label: 'Research Assistant' },
]

export { DEMO_SUBJECTS }

export function ChatWidgetProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [subjectId, setSubjectId] = useState<string | null>(null)
  const [subjectLabel, setSubjectLabel] = useState<string | null>(null)
  const [memories, setMemories] = useState<MemoryItem[]>([])
  const [statelessMessages, setStatelessMessages] = useState<ChatMessage[]>([])
  const [statewaveMessages, setStatewaveMessages] = useState<ChatMessage[]>([])
  const [lastContext, setLastContext] = useState<ContextBundle | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchMemories = useCallback(async (sid: string) => {
    try {
      const resp = await fetch('/api/hero-data')
      if (!resp.ok) return
      const data = await resp.json()
      const subject = data.subjects?.find((s: { subject_id: string }) => s.subject_id === sid)
      if (subject?.memories) {
        setMemories(subject.memories.map((m: { id: string; content: string; kind: string; confidence: number }) => ({
          id: m.id,
          content: m.content,
          kind: m.kind,
          confidence: m.confidence,
        })))
      }
    } catch (err) {
      console.warn('[widget] Failed to fetch memories:', err)
    }
  }, [])

  const openWidget = useCallback((sid?: string, label?: string) => {
    setIsOpen(true)
    setIsMinimized(false)
    if (sid) {
      setSubjectId(sid)
      setSubjectLabel(label || DEMO_SUBJECTS.find(s => s.id === sid)?.label || sid)
      fetchMemories(sid)
    } else if (!subjectId) {
      // Default to first subject
      const def = DEMO_SUBJECTS[0]
      setSubjectId(def.id)
      setSubjectLabel(def.label)
      fetchMemories(def.id)
    }
  }, [subjectId, fetchMemories])

  const closeWidget = useCallback(() => {
    setIsOpen(false)
  }, [])

  const minimizeWidget = useCallback(() => {
    setIsMinimized(true)
  }, [])

  const expandWidget = useCallback(() => {
    setIsMinimized(false)
  }, [])

  const selectSubject = useCallback((sid: string, label: string) => {
    setSubjectId(sid)
    setSubjectLabel(label)
    setStatelessMessages([])
    setStatewaveMessages([])
    setLastContext(null)
    fetchMemories(sid)
  }, [fetchMemories])

  const clearChat = useCallback(() => {
    setStatelessMessages([])
    setStatewaveMessages([])
    setLastContext(null)
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    if (!subjectId || !text.trim()) return

    const userMsg: ChatMessage = { role: 'user', content: text.trim(), timestamp: Date.now() }
    setStatelessMessages(prev => [...prev, userMsg])
    setStatewaveMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      // Call both in parallel
      const [statelessResp, statewaveResp] = await Promise.all([
        fetch('/api/widget-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [{ role: 'user', content: text }], subjectId, mode: 'stateless' }),
        }),
        fetch('/api/widget-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [{ role: 'user', content: text }], subjectId, mode: 'statewave' }),
        }),
      ])

      const [statelessData, statewaveData] = await Promise.all([
        statelessResp.json(),
        statewaveResp.json(),
      ])

      setStatelessMessages(prev => [...prev, {
        role: 'assistant',
        content: statelessData.reply || statelessData.error || 'No response',
        timestamp: Date.now(),
      }])

      setStatewaveMessages(prev => [...prev, {
        role: 'assistant',
        content: statewaveData.reply || statewaveData.error || 'No response',
        timestamp: Date.now(),
      }])

      if (statewaveData.context) {
        setLastContext(statewaveData.context)
      }
    } catch (err) {
      const errorMsg: ChatMessage = { role: 'assistant', content: `Error: ${(err as Error).message}`, timestamp: Date.now() }
      setStatelessMessages(prev => [...prev, errorMsg])
      setStatewaveMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }, [subjectId])

  const value: ChatWidgetContextType = {
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
  }

  return (
    <ChatWidgetContext.Provider value={value}>
      {children}
    </ChatWidgetContext.Provider>
  )
}
