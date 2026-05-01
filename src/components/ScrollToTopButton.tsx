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

  // The full chat widget covers the bottom-right area — but back-to-top
  // sits at the bottom-center, well clear of it. Hidden anyway when the
  // chat is open so we don't compete for attention with active chat input.
  const fullChatOpen = isOpen && !isMinimized
  if (fullChatOpen) return null
  // unused now (we centered the button), kept in dependencies via destructure
  void hasVisibleCta

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          // Centered horizontally so it doesn't fight the right-anchored
          // chat launcher / minimized pill.
          style={{ bottom: 24, left: '50%', x: '-50%' }}
          className="fixed z-50 w-10 h-10 rounded-full bg-surface-2 border border-theme-border shadow-lg flex items-center justify-center text-theme-muted hover:text-theme-primary hover:bg-surface-3 transition-colors"
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
