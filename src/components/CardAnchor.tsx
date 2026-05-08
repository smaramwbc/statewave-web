import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface CardAnchorProps {
  /** DOM id used as the anchor target. Slug-style, lowercase, dashes. */
  id: string
  className?: string
}

/**
 * Card-level permalink button. Mirrors the visual pattern of the Heading
 * component but routes the click through React Router so `useLocation().hash`
 * updates — that's what triggers the active card highlight downstream.
 *
 * Click behavior:
 *  1. `navigate('#id', { replace: true })` so the URL hash reflects the card
 *     and the consumer's `useHashActive(id)` hook re-renders with the active
 *     state. ScrollToTop will smooth-scroll to the element (a no-op if the
 *     user clicked the button on a card already in view).
 *  2. `navigator.clipboard.writeText(absolute_url)` so the user can paste a
 *     shareable deep link. Failure is non-blocking — the URL bar still shows
 *     the hash.
 *
 * Default visibility is `opacity-0` and the parent card uses `group` so the
 * button fades in on hover. Override `className` to change that default.
 */
export function CardAnchor({ id, className = '' }: CardAnchorProps) {
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate()

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()
    if (typeof window === 'undefined') return

    navigate(`#${id}`, { replace: true })

    const url = `${window.location.origin}${window.location.pathname}#${id}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Clipboard API can fail on insecure contexts or denied permissions —
      // the URL bar still has the hash as a fallback for manual copy.
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Copy link to this card"
      title={copied ? 'Link copied' : 'Copy link to this card'}
      className={`inline-flex items-center align-middle text-theme-muted/55 hover:text-accent focus-visible:text-accent focus:outline-none transition-opacity duration-150 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 ${className}`}
    >
      <svg
        aria-hidden
        className="w-3.5 h-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="4" y1="9" x2="20" y2="9" />
        <line x1="4" y1="15" x2="20" y2="15" />
        <line x1="10" y1="3" x2="8" y2="21" />
        <line x1="16" y1="3" x2="14" y2="21" />
      </svg>
      <span
        aria-live="polite"
        className={`ml-1 text-[10px] font-medium uppercase tracking-wide transition-all duration-200 ${
          copied ? 'text-accent opacity-100 translate-x-0' : 'opacity-0 -translate-x-1 pointer-events-none'
        }`}
      >
        copied
      </span>
    </button>
  )
}

