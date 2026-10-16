import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'

const RM = '(prefers-reduced-motion: reduce)'
const subscribeRM = (cb: () => void) => {
  const mq = window.matchMedia(RM)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

/** False on the server, so server HTML always carries the animated end state. */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeRM, () => window.matchMedia(RM).matches, () => false)
}

/** True once the element has scrolled ~25% up from the bottom edge (fires once). */
export function useSeen<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); io.disconnect() }
    }, { rootMargin: '0px 0px -25% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, seen] as const
}

/** Ease 0 → `to` over `ms` once `active`. Reads as `to` until then, so
 *  server-rendered HTML carries the real figure. Under reduced motion it
 *  never animates and always reads as `to`. */
export function useTween(to: number, ms: number, active: boolean, delay = 0) {
  const [p, setP] = useState(1)
  const rm = usePrefersReducedMotion()
  useEffect(() => {
    if (!active || rm) return
    let raf = 0
    const t0 = performance.now() + delay
    const tick = (now: number) => {
      const x = Math.min(1, Math.max(0, (now - t0) / ms))
      setP(1 - Math.pow(1 - x, 3))
      if (x < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, ms, delay, rm])
  return to * (rm ? 1 : p)
}

/** Clipboard copy with a short "Copied" confirmation. */
export function useCopy(text: string, ms = 1600) {
  const [done, setDone] = useState(false)
  const t = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(t.current), [])
  const copy = useCallback(() => {
    try { void navigator.clipboard.writeText(text) } catch { /* clipboard blocked */ }
    setDone(true)
    clearTimeout(t.current)
    t.current = setTimeout(() => setDone(false), ms)
  }, [text, ms])
  return [done, copy] as const
}
