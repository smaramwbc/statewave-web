import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface RestoreState {
  scrollY?: number
}

/**
 * Scroll behavior on route change:
 *
 *  1. If `location.state.scrollY` is present, the user is returning to a page
 *     they previously left — restore the *exact* Y position they were at.
 *     This is set by ReturnLink so cross-page round-trips land precisely
 *     where they started, not at the top of the section.
 *  2. Otherwise, if a `#hash` is present, smooth-scroll to that section
 *     (deep links like `/product#privacy`, jump chips, etc.).
 *  3. Otherwise, snap to the top instantly — smooth-scrolling between two
 *     unrelated pages would just show the previous page's footer fly past.
 *
 * Lazy routes mount asynchronously, so for both #hash and saved-Y we retry
 * across a few frames until the target exists / the page is tall enough.
 *
 * `prefers-reduced-motion` falls back to instant scroll, since not every
 * browser honors that media query for `scrollIntoView` / smooth `scrollTo`.
 */
export function ScrollToTop() {
  const { pathname, hash, state } = useLocation()
  const savedY = (state as RestoreState | null)?.scrollY

  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const behavior: ScrollBehavior = reduceMotion ? 'instant' : 'smooth'

    if (typeof savedY === 'number' && savedY >= 0) {
      // Restore exact position. Wait until the page has laid out tall enough
      // for the target Y to be reachable — important for long pages mounted
      // via lazy routes.
      let attempts = 0
      const tryRestore = () => {
        const maxY = document.documentElement.scrollHeight - window.innerHeight
        if (maxY >= savedY || attempts >= 12) {
          window.scrollTo({ top: savedY, behavior })
          return true
        }
        return false
      }
      if (tryRestore()) return
      const interval = window.setInterval(() => {
        attempts += 1
        if (tryRestore()) window.clearInterval(interval)
      }, 50)
      return () => window.clearInterval(interval)
    }

    if (hash) {
      const id = decodeURIComponent(hash.slice(1))
      const tryScroll = () => {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior, block: 'start' })
          return true
        }
        return false
      }
      if (tryScroll()) return
      let attempts = 0
      const interval = window.setInterval(() => {
        attempts += 1
        if (tryScroll() || attempts >= 10) window.clearInterval(interval)
      }, 50)
      return () => window.clearInterval(interval)
    }

    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname, hash, savedY])

  return null
}
