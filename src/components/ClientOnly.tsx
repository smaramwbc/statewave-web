import { useEffect, useState, type ReactNode } from 'react'

/**
 * Render children only after the first client mount. During SSR and the
 * initial client render this returns `null`, so the server-emitted HTML
 * matches the client's first pass exactly and hydrates cleanly. A
 * post-mount effect flips the flag, and the children render on the next
 * tick.
 *
 * Use this to keep below-the-fold or non-critical UI out of the
 * prerendered `dist/index.html` so the browser has less DOM to parse
 * before first paint — without giving up the hydrated, interactive
 * client experience.
 *
 * Tradeoff: anything wrapped here is invisible to crawlers that don't
 * execute JS (most search engines do; legacy meta-fetchers may not).
 * Keep SEO-critical content (canonical metadata, JSON-LD, the hero
 * h1/copy) OUTSIDE this wrapper.
 */
export function ClientOnly({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true)
  }, [])
  return hydrated ? <>{children}</> : null
}
