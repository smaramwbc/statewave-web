import { useState } from 'react'

type Variant = 'inline' | 'card-corner'

interface CopyButtonProps {
  /** The text written to the clipboard on click. */
  text: string
  /** Accessible label, e.g. "Copy boilerplate paragraph". */
  label: string
  /** `inline` (tiny icon next to text) | `card-corner` (top-right of a card). */
  variant?: Variant
  /** Optional extra className appended to the base styles. */
  className?: string
}

/**
 * Generic "Copy to clipboard" button for non-code snippets — boilerplate,
 * fact values, contact addresses, operator details, etc. Falls back
 * silently on insecure contexts or denied permissions; the button still
 * flashes "Copied" feedback so the user knows the click registered.
 *
 * For code panels prefer the sibling `CodeCopyButton`, which has slightly
 * different styling tuned to monospace surfaces.
 */
export function CopyButton({
  text,
  label,
  variant = 'inline',
  className = '',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // clipboard can fail on insecure contexts or denied permissions
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  const base =
    variant === 'inline'
      ? 'shrink-0 inline-flex items-center justify-center rounded-md border border-transparent w-6 h-6 align-middle ml-1.5 text-theme-muted/70 hover:text-accent hover:border-accent/30 focus-visible:text-accent focus:outline-none transition-colors'
      : 'shrink-0 inline-flex items-center gap-1.5 rounded-md border border-theme-border/60 px-2.5 py-1 text-[11px] font-medium text-theme-muted hover:text-accent hover:border-accent/40 focus-visible:text-accent focus:outline-none transition-colors bg-surface-0/60'

  const composed = className ? `${base} ${className}` : base

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label}
      title={copied ? 'Copied' : label}
      className={composed}
    >
      {copied ? (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <rect x="9" y="9" width="11" height="11" rx="2" strokeWidth={1.8} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 15V6a2 2 0 0 1 2-2h9" />
        </svg>
      )}
      {variant === 'card-corner' ? (
        <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
      ) : (
        <span className="sr-only" aria-live="polite">
          {copied ? 'Copied' : label}
        </span>
      )}
    </button>
  )
}
