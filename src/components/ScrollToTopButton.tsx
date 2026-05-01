import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatWidget } from '../lib/widget-context'

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)
  const { isOpen, isMinimized, hasVisibleCta } = useChatWidget()

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // The full chat widget covers the bottom-right area — back-to-top is buried
  // and redundant while it's open.
  const fullChatOpen = isOpen && !isMinimized
  if (fullChatOpen) return null

  // Stack above whatever else is parked at bottom-right (floating launcher or
  // minimized chat pill) so the two never overlap.
  const launcherShowing = !isOpen && !isMinimized && !hasVisibleCta
  const minimizedShowing = !isOpen && isMinimized
  const stackAbove = launcherShowing || minimizedShowing

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ bottom: stackAbove ? 88 : 24, right: 24 }}
          className="fixed z-50 w-10 h-10 rounded-full bg-surface-2 border border-theme-border shadow-lg flex items-center justify-center text-theme-muted hover:text-theme-primary hover:bg-surface-3 transition-[bottom,colors] duration-200"
          aria-label="Scroll to top"
          title="Back to top"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
