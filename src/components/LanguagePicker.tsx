import { useEffect, useRef, useState } from 'react'
import { LANGUAGES, languageFor, type LangCode } from '../lib/manifesto-i18n'

interface Props {
  value: LangCode
  onChange: (code: LangCode) => void
}

/**
 * Compact language picker used by the /why manifesto. Shows the current
 * language's native name as a small pill; click reveals a list of all
 * supported languages (also in their native names — never "Spanish",
 * always "Español").
 *
 * UX notes:
 *  - Hides on outside click & Escape.
 *  - Keyboard-friendly: Tab into the trigger, Enter/Space toggles, arrow
 *    keys aren't wired (the list is small enough that Tab cycles cleanly).
 *  - Anchored to its trigger via absolute positioning — no portal needed
 *    since the manifesto column never overflows on mobile.
 *
 * Visual scale matches the eyebrow row (text-[11px], tracking-wide), so it
 * reads as labelware rather than UI chrome.
 */
export function LanguagePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const current = languageFor(value)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent | TouchEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${current.englishName}. Change language.`}
        className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-theme-border bg-surface-2/60 hover:bg-surface-2 hover:border-theme-border-hover text-[11px] font-medium tracking-wide text-theme-secondary hover:text-theme-primary transition-colors"
      >
        <GlobeIcon className="w-3 h-3 text-theme-muted group-hover:text-accent transition-colors" />
        <span>{current.nativeName}</span>
        <svg
          className={`w-2.5 h-2.5 text-theme-muted transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Manifesto language"
          className="absolute right-0 mt-2 z-20 min-w-[200px] max-h-[60vh] overflow-y-auto py-1 rounded-xl border border-theme-border bg-surface-1 shadow-lg shadow-black/10 backdrop-blur-sm"
        >
          {LANGUAGES.map((lang) => {
            const active = lang.code === value
            return (
              <li key={lang.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(lang.code)
                    setOpen(false)
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-1.5 text-[13px] text-left transition-colors ${
                    active
                      ? 'text-accent bg-accent/[0.06]'
                      : 'text-theme-secondary hover:text-theme-primary hover:bg-surface-2'
                  }`}
                >
                  <span>{lang.nativeName}</span>
                  {active ? (
                    <svg
                      className="w-3.5 h-3.5 text-accent"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-[10px] uppercase tracking-wider text-theme-muted/70">
                      {lang.code}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
    </svg>
  )
}
