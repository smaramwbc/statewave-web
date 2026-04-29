import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scrolls to top on every route change.
 * Handles footer nav links and all page transitions.
 */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  return null
}
