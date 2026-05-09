import { useEffect, useMemo, useRef, useState } from 'react'
import { LANGUAGES, languageFor, type LangCode } from '../lib/manifesto-i18n'

interface Props {
  value: LangCode
  onChange: (code: LangCode) => void
}

/**
 * Compact language picker used by the /why manifesto. Trigger pill shows the
 * current language's native name; click reveals a search-filterable list of
 * the 20 supported locales. Native names everywhere — never "Spanish",
 * always "Español".
 *
 * UX notes:
 *  - Search input auto-focuses on open. Match is accent- and case-insensitive
 *    against both nativeName and englishName, so "espanol" finds "Español"
 *    and "japanese" finds "日本語".
 *  - Enter selects the first filtered match — fastest path for keyboard users.
 *  - Escape and outside click both close. The list scrolls within max-h on
 *    long mobile lists.
 *  - Visual scale matches the eyebrow row (text-[11px], tracking-wide) so the
 *    picker reads as labelware rather than UI chrome.
 */
export function LanguagePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const current = languageFor(value)

  // Closing the picker resets the query so re-opening starts from a clean
  // state. Bundled into a helper so every close path goes through the same
  // reset and we don't end up with setState-in-effect cascades.
  const closePicker = () => {
    setOpen(false)
    setQuery('')
  }

  // Focus the search field as soon as the dropdown appears so the user can
  // start typing immediately.
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent | TouchEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) closePicker()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePicker()
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

  const filtered = useMemo(() => filterLanguages(query), [query])

  const commitFirstMatch = () => {
    const first = filtered[0]
    if (first) {
      onChange(first.code)
      closePicker()
    }
  }

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => (open ? closePicker() : setOpen(true))}
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
        <div
          className="absolute right-0 mt-2 z-20 w-[240px] rounded-xl border border-theme-border bg-surface-1 shadow-lg shadow-black/10 backdrop-blur-sm overflow-hidden"
          role="dialog"
          aria-label="Choose language"
        >
          {/* Search input — always visible at top, sticky-feeling but doesn't
              actually need position:sticky since it sits above its sibling
              scroll container. */}
          <div className="px-2 pt-2 pb-1.5 border-b border-theme-border">
            <div className="relative">
              <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-theme-muted" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    commitFirstMatch()
                  }
                }}
                placeholder="Search languages…"
                aria-label="Search languages"
                className="w-full pl-7 pr-2 py-1.5 text-base sm:text-[12px] rounded-md border border-theme-border bg-surface-2 text-theme-primary placeholder-theme-muted focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20"
              />
            </div>
          </div>

          {/* Results */}
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-[12px] text-theme-muted text-center">
              No languages match "<span className="text-theme-secondary">{query}</span>"
            </p>
          ) : (
            <ul
              role="listbox"
              aria-label="Manifesto language"
              className="max-h-[50vh] overflow-y-auto py-1"
            >
              {filtered.map((lang) => {
                const active = lang.code === value
                return (
                  <li key={lang.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        onChange(lang.code)
                        closePicker()
                      }}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-1.5 text-[13px] text-left transition-colors ${
                        active
                          ? 'text-accent bg-accent/[0.06]'
                          : 'text-theme-secondary hover:text-theme-primary hover:bg-surface-2'
                      }`}
                    >
                      <span className="flex flex-col items-start">
                        <span className="leading-tight">{lang.nativeName}</span>
                        {/* English name shown as a quiet sub-label only when
                            the search is non-empty — helps the user confirm
                            why a result matched (e.g. "japanese" → 日本語). */}
                        {query && lang.englishName !== lang.nativeName && (
                          <span className="text-[10px] text-theme-muted leading-tight mt-0.5">
                            {lang.englishName}
                          </span>
                        )}
                      </span>
                      {active ? (
                        <svg
                          className="w-3.5 h-3.5 text-accent shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-[10px] uppercase tracking-wider text-theme-muted/70 shrink-0">
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
      )}
    </div>
  )
}

/* ─── Filter helpers ─────────────────────────────────────────────────────── */

/**
 * Strip diacritics + lowercase. Lets "espanol" match "Español", "francais"
 * match "Français", "vietnamese" match "Việt", etc.
 */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
}

function filterLanguages(query: string) {
  const q = normalize(query.trim())
  if (!q) return LANGUAGES
  return LANGUAGES.filter((lang) => {
    return (
      normalize(lang.nativeName).includes(q) ||
      normalize(lang.englishName).includes(q) ||
      lang.code.includes(q)
    )
  })
}

/* ─── Icons ──────────────────────────────────────────────────────────────── */

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

function SearchIcon({ className }: { className?: string }) {
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
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  )
}
