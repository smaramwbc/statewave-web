import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scrolls to top on route change. Honors a `#hash` if present so deep links
 * like `/product#privacy` land on the referenced section instead.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1)
      const tryScroll = () => {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' })
          return true
        }
        return false
      }
      if (tryScroll()) return
      // Section may mount via lazy route — retry once after the next paint.
      const t = window.setTimeout(tryScroll, 50)
      return () => window.clearTimeout(t)
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname, hash])

  return null
}
