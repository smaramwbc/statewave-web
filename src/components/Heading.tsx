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

  // flex + items-baseline + min-w-0 on the text wrapper lets the title text
  // wrap inside its own span (instead of pushing the # button to a new line)
  // when the heading width is tight. The button is flex-shrink-0 so it always
  // keeps its full size and stays glued to the right of the first text line.
  return (
    <Tag id={id} className={`group flex items-baseline scroll-mt-20 ${className}`}>
      <span className="min-w-0">{children}</span>
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
      className={`relative ml-2 inline-flex flex-shrink-0 items-center align-middle text-theme-muted/55 hover:text-accent focus-visible:text-accent focus:outline-none transition-colors duration-150 ${className}`}
    >
      <HashIcon className="w-[0.7em] h-[0.7em]" />
      {/* "copied" tag is absolute so it doesn't add layout width to the button
          (otherwise the always-rendered, opacity-0 span made the button ~80px
          wide and overlapped heading text in tight columns).
          Positioned ABOVE the button (bottom-full + right-0) so it never
          overflows the viewport when the button sits at the column right edge
          — sliding it to the right of the icon would push the label off-screen. */}
      <span
        aria-live="polite"
        className={`absolute bottom-full right-0 mb-1 text-[11px] font-medium uppercase tracking-wide whitespace-nowrap transition-all duration-200 ${
          copied ? 'text-accent opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'
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
