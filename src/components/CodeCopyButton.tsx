import React from 'react'

/**
 * Floating "Copy" button for code snippet panels. Copies the given code on
 * click and flashes a "Copied" tag for ~1.5s. Falls back gracefully on
 * insecure contexts where clipboard access is denied; the button still
 * flashes feedback so the user knows something happened.
 *
 * `iconOnly` drops the visible "Copy"/"Copied" word for dense panel headers
 * where the label is redundant next to the icon. The accessible name still
 * comes through `aria-label`, and the live region still announces the state
 * change. Only the visual text is suppressed.
 */
export function CodeCopyButton({
  code,
  label,
  iconOnly = false,
}: {
  code: string
  label: string
  iconOnly?: boolean
}) {
  const [copied, setCopied] = React.useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      // ignored: clipboard can fail on insecure contexts or denied permissions
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label}
      title={copied ? 'Copied' : label}
      className={`shrink-0 inline-flex items-center rounded-md border border-transparent text-[10.5px] font-medium text-theme-muted/80 hover:text-accent hover:border-accent/30 focus-visible:text-accent focus:outline-none transition-colors ${
        iconOnly ? 'p-1.5 hover:bg-accent/10' : 'gap-1.5 px-2 py-0.5'
      }`}
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
      <span aria-live="polite" className={iconOnly ? 'sr-only' : undefined}>
        {copied ? 'Copied' : 'Copy'}
      </span>
    </button>
  )
}
