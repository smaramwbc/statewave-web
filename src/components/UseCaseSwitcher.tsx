import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { USE_CASE_DETAIL_PAGES } from '../lib/use-case-pages'

/* Reusable breadcrumb + switcher for use-case detail pages:
 *
 *   Use Cases  /  [ <current page>  ⌄ ]
 *
 * The pill is a dropdown listing every use-case detail page from the registry
 * (lib/use-case-pages), so visitors can jump between them. Drop this at the top
 * of any future /use-cases/<slug> page with the page's own `currentSlug`. */
export function UseCaseSwitcher({ currentSlug }: { currentSlug: string }) {
  const current = USE_CASE_DETAIL_PAGES.find((p) => p.slug === currentSlug)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <nav
      aria-label="Use case"
      className="flex items-center justify-center gap-2 text-sm"
    >
      <Link
        to="/use-cases"
        className="text-theme-secondary hover:text-theme-primary transition-colors"
      >
        Use Cases
      </Link>
      <span className="text-theme-muted" aria-hidden>
        /
      </span>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="inline-flex items-center gap-1.5 rounded-lg border border-theme-border bg-surface-2 px-3 py-1.5 font-medium text-theme-primary hover:border-accent/30 transition-colors"
        >
          {current?.label ?? 'Use case'}
          <svg
            className={`w-3 h-3 text-theme-muted transition-transform ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden
          >
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {open && (
          <ul
            role="listbox"
            className="absolute left-1/2 z-30 mt-2 min-w-[15rem] -translate-x-1/2 rounded-xl border border-theme-border bg-surface-1 p-1 text-left shadow-xl shadow-black/20"
          >
            {USE_CASE_DETAIL_PAGES.map((p) => {
              const active = p.slug === currentSlug
              return (
                <li key={p.slug} role="option" aria-selected={active}>
                  <Link
                    to={p.path}
                    onClick={() => setOpen(false)}
                    className={`block rounded-lg px-3 py-2 transition-colors ${
                      active
                        ? 'bg-accent/10 text-accent'
                        : 'text-theme-secondary hover:bg-surface-2 hover:text-theme-primary'
                    }`}
                  >
                    {p.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </nav>
  )
}
