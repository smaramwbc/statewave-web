import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { ThemeSwitcher } from './ThemeSwitcher'
import { Logo } from './Logo'
import { useChatWidget } from '../lib/widget-context'

const links = [
  { to: '/product', label: 'How it works' },
  { to: '/why', label: 'Why Statewave' },
  { to: '/use-cases', label: 'Use Cases' },
  { to: '/connectors', label: 'Connectors' },
  { to: '/developers', label: 'Developers' },
]

/**
 * Locks page scroll while the mobile drawer is open.
 *
 * Plain `overflow: hidden` on <html>/<body> works on Android but fails on
 * iOS Safari — the page underneath still scrolls when the user drags the
 * drawer. The trick that holds on every platform is to flip a data
 * attribute on <html> (the CSS in index.css does the actual locking)
 * AND remember the scroll offset so we can restore it on close. We also
 * reach for `position: fixed` on the body during the lock to defeat iOS's
 * momentum scrolling without losing the user's place.
 */
function lockBodyScroll() {
  const scrollY = window.scrollY
  document.documentElement.dataset.scrollLock = 'true'
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollY}px`
  document.body.style.left = '0'
  document.body.style.right = '0'
  document.body.style.width = '100%'
  return scrollY
}

function unlockBodyScroll(scrollY: number) {
  document.documentElement.removeAttribute('data-scroll-lock')
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.left = ''
  document.body.style.right = ''
  document.body.style.width = ''
  window.scrollTo(0, scrollY)
}

export function Navbar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { openWidget } = useChatWidget()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const toggleButtonRef = useRef<HTMLButtonElement>(null)
  const lockedScrollRef = useRef<number | null>(null)

  const askSupport = () => {
    openWidget('statewave-support', 'Statewave Support', 'support')
    setMobileOpen(false)
  }

  // Close on Escape
  useEffect(() => {
    if (!mobileOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [mobileOpen])

  // Body scroll lock + focus management while drawer is open. We move focus
  // to the close button so screen-reader and keyboard users land somewhere
  // sensible inside the drawer; on close we return focus to the toggle.
  useEffect(() => {
    if (!mobileOpen) return undefined
    // Capture the toggle node *before* the cleanup so React's exhaustive-
    // deps warning doesn't fire and so we don't dereference a ref that
    // could have been swapped on unmount.
    const toggleNode = toggleButtonRef.current
    lockedScrollRef.current = lockBodyScroll()
    const id = requestAnimationFrame(() => {
      closeButtonRef.current?.focus()
    })
    return () => {
      cancelAnimationFrame(id)
      if (lockedScrollRef.current !== null) {
        unlockBodyScroll(lockedScrollRef.current)
        lockedScrollRef.current = null
      }
      toggleNode?.focus()
    }
  }, [mobileOpen])

  // Close on route change
  const prevPathname = useRef(location.pathname)
  if (prevPathname.current !== location.pathname) {
    prevPathname.current = location.pathname
    if (mobileOpen) setMobileOpen(false)
  }

  return (
    <>
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-theme-border bg-surface-0/80 backdrop-blur-xl pt-safe pl-safe pr-safe"
    >
      <nav aria-label="Main navigation" className="mx-auto max-w-7xl px-5 sm:px-6 h-[60px] flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 -my-2 py-2" aria-label="Statewave home">
          <Logo variant="icon" className="h-7 w-7" />
          <span className="text-[1.05rem] font-semibold tracking-tight">
            <span className="text-theme-primary">State</span><span className="bg-gradient-to-r from-brand-400 to-accent bg-clip-text text-transparent">wave</span>
          </span>
        </Link>

        {/* Desktop nav — centered links */}
        <div className="hidden md:flex items-center gap-7">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-[13px] font-medium transition-colors duration-150 ${
                location.pathname === link.to
                  ? 'text-theme-primary'
                  : 'text-theme-muted hover:text-theme-primary'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://github.com/smaramwbc/statewave"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] font-medium text-theme-muted hover:text-theme-primary transition-colors duration-150"
          >
            GitHub
          </a>
        </div>

        {/* Desktop right — actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={askSupport}
            className="text-[12.5px] font-medium px-3 py-1.5 rounded-md bg-accent text-white hover:bg-accent-light transition-colors duration-150 shadow-[0_4px_14px_-4px_rgba(99,102,241,0.45)]"
            title="Ask the Statewave Support agent — answers grounded in the official docs"
          >
            Ask Support
          </button>
          <ThemeSwitcher />
        </div>

        {/* Mobile toggle — 44×44 tap target. -mr-2 keeps the icon visually
            aligned with the right edge while still meeting the tap-target
            minimum on either side. */}
        <button
          ref={toggleButtonRef}
          className="md:hidden -mr-2 inline-flex items-center justify-center w-11 h-11 rounded-md text-theme-muted hover:text-theme-primary hover:bg-surface-2 transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-drawer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>
    </motion.header>

    {/* Mobile drawer — a full-height opaque sheet that occupies the entire
        viewport below the header. It MUST be rendered as a sibling of the
        animated header (not a child) — framer-motion applies a `transform`
        to the header which creates a CSS containing block, and a `fixed`
        descendant of a transformed element is positioned relative to that
        ancestor's box rather than the viewport. The header is only 60px
        tall, so a `bottom: 0` fixed child inside it would collapse to 0
        height. Lifting the drawer out of the header restores the viewport-
        relative positioning we actually want.

        Doing it this way (rather than a short drop-down with a translucent
        backdrop) also means the page content underneath is completely
        hidden and uninteractable: there is no visible "behind the menu"
        region for taps or accidental clicks to leak through. We keep the
        backdrop layer purely for the open/close fade so the transition
        still feels grounded. */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              key="backdrop"
              data-testid="mobile-nav-backdrop"
              aria-label="Dismiss navigation menu"
              tabIndex={-1}
              onClick={() => setMobileOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="md:hidden fixed inset-0 top-[60px] z-40 bg-surface-0"
            />
            <motion.div
              key="drawer"
              id="mobile-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="md:hidden fixed top-[60px] left-0 right-0 bottom-0 z-50 border-t border-theme-border bg-surface-0 backdrop-blur-xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.45)] pl-safe pr-safe"
            >
              <div className="h-full px-5 sm:px-6 pt-4 pb-[max(env(safe-area-inset-bottom),1.5rem)] flex flex-col gap-1 overflow-y-auto">
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="sr-only focus:not-sr-only self-end text-xs text-theme-muted px-3 py-2"
                >
                  Close menu
                </button>
                <nav aria-label="Mobile navigation" className="flex flex-col">
                  {links.map((link) => {
                    const active = location.pathname === link.to
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between min-h-12 px-3 -mx-3 rounded-lg text-[16px] font-medium transition-colors ${
                          active
                            ? 'text-theme-primary bg-surface-2'
                            : 'text-theme-secondary hover:text-theme-primary hover:bg-surface-1'
                        }`}
                        aria-current={active ? 'page' : undefined}
                      >
                        <span>{link.label}</span>
                        {active && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">Current</span>
                        )}
                      </Link>
                    )
                  })}
                  <a
                    href="https://github.com/smaramwbc/statewave"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center min-h-12 px-3 -mx-3 rounded-lg text-[16px] font-medium text-theme-secondary hover:text-theme-primary hover:bg-surface-1 transition-colors"
                  >
                    GitHub
                  </a>
                </nav>
                <div className="mt-3 pt-4 border-t border-theme-border flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={askSupport}
                    className="inline-flex items-center justify-center min-h-12 px-5 rounded-lg bg-accent text-white text-[15px] font-medium hover:bg-accent-light transition-colors shadow-[0_4px_14px_-4px_rgba(99,102,241,0.45)]"
                  >
                    Ask Support
                  </button>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-theme-muted uppercase tracking-wider">Theme</span>
                    <ThemeSwitcher />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
