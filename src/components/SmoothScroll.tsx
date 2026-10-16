import { useEffect } from 'react'

/** Lenis eased wheel scrolling. Desktop pointers only: touch keeps native
 *  momentum, and Lenis itself falls back to native when the visitor has
 *  prefers-reduced-motion on. Native scrolling stays underneath, so
 *  `position: sticky` and in-page anchors keep working (anchors are left native). */
export function SmoothScroll() {
  useEffect(() => {
    if (!window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches) return
    let stop = () => {}
    let dead = false
    void import('lenis').then(({ default: Lenis }) => {
      if (dead) return
      const lenis = new Lenis({
        lerp: 0.12,
        // Lenis' own anchor handling landed 40px off the native scroll-padding/margin
        // targets (some under the fixed nav), so in-page #hash links stay native.
        // nested scrollers (chat, drawers, menus) keep native wheel handling
        prevent: (node) => !!node.closest('[data-lenis-prevent], .sw-chat__body, .scroll-contain, [role="dialog"]'),
      })
      let raf = 0
      const tick = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(tick) }
      raf = requestAnimationFrame(tick)
      stop = () => { cancelAnimationFrame(raf); lenis.destroy() }
    })
    return () => { dead = true; stop() }
  }, [])
  return null
}
