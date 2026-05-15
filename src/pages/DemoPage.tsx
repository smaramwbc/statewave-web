import { useEffect, useRef } from 'react'
import { useChatWidget } from '../lib/widget-context-api'
import { HomePage } from './HomePage'
import { usePageSEO } from '../lib/seo'

/**
 * /demo — same content as the homepage, but with the live demo widget
 * auto-opened on mount. Used as the canonical CTA on Product Hunt and
 * any external surface where we want zero-friction "try it" landings.
 *
 * The URL stays `/demo` (rather than redirecting to `/`) so external
 * links remain stable and trackable.
 */
export function DemoPage() {
  const { openWidget } = useChatWidget()
  const openedRef = useRef(false)

  usePageSEO({
    title: 'Statewave — Live Demo',
    description:
      'Try Statewave in your browser. Two identical AI agents answer the same question side by side — one stateless, one backed by Statewave memory. No signup.',
  })

  useEffect(() => {
    if (openedRef.current) return
    openedRef.current = true
    openWidget()
  }, [openWidget])

  return <HomePage />
}
