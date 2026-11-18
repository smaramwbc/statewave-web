import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion, type Variants } from 'framer-motion'

/* Shared by the /guide illustrations. Ported from the page in #333 (Jyolsna's Statewave Guide landing),
 * whose figures were checked against the statewave-guide README and
 * docs/provider-reality-check-round-2.md. The Tailwind colour tokens they read (theme-*, --viz-*) are
 * pinned to the v8 palette in guide.css, so they stay light whatever the visitor's theme. */

export const REPO = 'https://github.com/smaramwbc/statewave-guide'
export const ACCENT = '#2F5BF0'

/* Hover lift follows the /about and /benchmarks card recipe. */
export const LIFT = 'transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-[var(--viz-border-strong)] hover:shadow-[0_18px_50px_rgba(47,91,240,0.12)]'
export const CARD = `rounded-[16px] border border-[var(--viz-border)] bg-[var(--viz-card)] ${LIFT}`
export const INNER = 'rounded-[10px] bg-[var(--viz-card-2)]'
export const TILE = 'rounded-[12px] border border-[var(--viz-border)] bg-[var(--viz-card)]'
export const DASHED = 'rounded-[12px] border border-dashed border-[var(--viz-border-strong)]'
export const MONO_LABEL = 'font-mono text-[11px] font-semibold tracking-[0.14em] text-theme-muted'
export const STILL: Variants = { hidden: {}, show: {} }

/** Focus ring shared by the interactive illustration controls. */
export const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F5BF0]'

/**
 * Steps an illustration through `count` states while it is on screen. The
 * first click or hover hands control to the reader and the auto-advance stops
 * for good. The states crossfade rather than slide, so this runs under reduced
 * motion too; `auto` says whether it is still advancing on its own.
 */
export function useCycle(count: number, ms: number) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.4 })
  const [i, setI] = useState(0)
  const [touched, setTouched] = useState(false)
  const auto = inView && !touched
  useEffect(() => {
    if (!auto) return
    const id = setInterval(() => setI((n) => (n + 1) % count), ms)
    return () => clearInterval(id)
  }, [auto, count, ms])
  const pick = (n: number) => { setTouched(true); setI(n) }
  return { ref, i, pick, auto }
}

/** Types `text` out once per `key` change. Instant under reduced motion. */
export function useTyped(text: string, key: unknown, cps = 28) {
  const reduced = useReducedMotion() ?? false
  const [n, setN] = useState(0)
  useEffect(() => {
    if (reduced) return
    const id = setInterval(() => setN((c) => (c >= text.length ? c : c + 1)), 1000 / cps)
    return () => { clearInterval(id); setN(0) }
  }, [text, key, cps, reduced])
  return reduced ? text : text.slice(0, n)
}
