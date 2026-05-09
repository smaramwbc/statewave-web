import { useState, type ReactNode } from 'react'

interface HeadingProps {
  /** DOM id used as the anchor target. Slug-style, lowercase, dashes. */
  id: string
  /** Heading tag — default h2. */
  level?: 1 | 2 | 3 | 4
  children: ReactNode
  className?: string
}

/**
 * Section heading with a copy-link affordance, à la GitHub / MDN / Stripe.
 *
 * - Renders the chosen `<h{level}>` with the given id, so existing #anchor
 *   links keep working.
 * - On hover (or focus) reveals a `#` button next to the heading.
 * - Clicking the button updates the URL hash and copies the absolute link
 *   to the clipboard. A small "copied" tag fades in for ~1.5s as feedback.
 */
export function Heading({ id, level = 2, children, className = '' }: HeadingProps) {
  const Tag = (`h${level}` as unknown) as 'h1' | 'h2' | 'h3' | 'h4'

  return (
    <Tag id={id} className={`group relative scroll-mt-20 ${className}`}>
      {children}
      <SectionAnchorCopyButton id={id} />
    </Tag>
  )
}

/**
 * Standalone "copy link" button that mirrors the Heading affordance, for
 * cases where the surrounding heading can't be a plain `<h2>` (e.g. an
 * animated `motion.h2` with gradient-clipped text). The container element
 * needs `group` somewhere up the tree for the hover-reveal styling, and
 * the `id` should match the anchor target on its scroll-margin parent.
 */
export function SectionAnchorCopyButton({ id, className = '' }: { id: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (typeof window === 'undefined') return
    const url = `${window.location.origin}${window.location.pathname}#${id}`
    // history.replaceState avoids a navigation while still surfacing the
    // section anchor in the URL bar (so the visitor can copy it themselves
    // if clipboard access is denied).
    try {
      window.history.replaceState(null, '', `#${id}`)
    } catch {
      // Ignored — non-blocking.
    }
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Clipboard API can fail on insecure contexts or denied permissions.
      // The URL bar still shows the anchor as a fallback.
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy link to this section"
      title={copied ? 'Link copied' : 'Copy link to this section'}
      className={`ml-2 inline-flex items-center align-middle text-theme-muted/55 hover:text-accent focus-visible:text-accent focus:outline-none transition-colors duration-150 ${className}`}
    >
      <HashIcon className="w-[0.7em] h-[0.7em]" />
      <span
        aria-live="polite"
        className={`ml-1.5 text-[11px] font-medium uppercase tracking-wide transition-all duration-200 ${
          copied ? 'text-accent opacity-100 translate-x-0' : 'opacity-0 -translate-x-1 pointer-events-none'
        }`}
      >
        copied
      </span>
    </button>
  )
}

function HashIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
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
  )
}
