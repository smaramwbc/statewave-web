import { Link, useLocation } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { formatCompactCount, useGithubStars } from '../lib/credibility-stats'
import { Icon, Ln } from './home/ui'
import { DOCS, GITHUB } from './home/links'
import { COLUMNS } from './site-links'

// Header dropdowns reuse the footer's link groups so the two never drift. Pricing is in the
// design but this site has no pricing page, and Company is footer-only.
const GROUPS = COLUMNS.filter((c) => c.title !== 'Company')
/** Routes whose first section is a dark v8 hero; see docs/v8-page-checklist.md. */
const CLEAR_TOP = new Set(['/', '/product', '/governance'])
const isInternal = (to: string) => to.startsWith('/') && !to.includes('#')

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
  const drawerRef = useRef<HTMLDivElement>(null)
  const toggleButtonRef = useRef<HTMLButtonElement>(null)
  const lockedScrollRef = useRef<number | null>(null)
  const stars = formatCompactCount(useGithubStars())

  // Pages that open on a dark v8 hero (CLEAR_TOP) start with a transparent bar and become the
  // floating pill once the page scrolls (or the drawer is open). A route list, not a DOM probe,
  // so the prerendered HTML already has the right bar and nothing flashes on hydration.
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const clear = CLEAR_TOP.has(location.pathname) && !scrolled && !mobileOpen

  // Tone follows whatever the bar is sitting on: sample the first opaque full-width background
  // under its centre line and go dark over dark sections, so the pill takes the section's colour
  // instead of a white slab cutting across it. CSS transitions do the blending.
  const [dark, setDark] = useState(false)
  useEffect(() => {
    let raf = 0
    const sample = () => {
      raf = 0
      const stack = document.elementsFromPoint?.(window.innerWidth / 2, 36) ?? []
      for (const el of stack) {
        if (el.closest('.sw-nav')) continue
        const forced = el.closest<HTMLElement>('[data-nav-tone]')?.dataset.navTone
        if (forced) return setDark(forced === 'dark')
        // Only full-bleed bands count as a section; cards, panels and code blocks inside one are narrower.
        if (el.getBoundingClientRect().width < window.innerWidth * 0.95) continue
        const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g)
        if (!m || m.length < 3 || (m[3] !== undefined && +m[3] < 0.5)) continue
        const [r, g, b] = m.map(Number)
        return setDark(0.2126 * r + 0.7152 * g + 0.0722 * b < 110)
      }
      setDark(false)
    }
    const queue = () => { if (!raf) raf = requestAnimationFrame(sample) }
    queue()
    const settle = window.setTimeout(queue, 400) // after route content mounts
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', queue)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(settle)
      window.removeEventListener('scroll', queue)
      window.removeEventListener('resize', queue)
    }
  }, [location.pathname])
  // Desktop dropdowns: hover or focus opens, click toggles (touch), Escape and outside focus close.
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const closeTimer = useRef<number>(0)
  const openNow = (t: string) => { clearTimeout(closeTimer.current); setOpenGroup(t) }
  const closeSoon = () => { clearTimeout(closeTimer.current); closeTimer.current = window.setTimeout(() => setOpenGroup(null), 140) }
  useEffect(() => {
    if (!openGroup) return undefined
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenGroup(null) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [openGroup])
  const tone = dark && !mobileOpen ? 'dark' : 'light'

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
      drawerRef.current?.focus()
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
    if (openGroup) setOpenGroup(null)
  }

  return (
    <>
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sw-nav pt-safe pl-safe pr-safe"
      data-clear={clear || undefined}
      data-tone={tone}
    >
      <nav aria-label="Main navigation" className="sw-nav__bar">
        <Link to="/" className="sw-nav__logo" aria-label="Statewave home">
          <img src="/brand/logo-horizontal-lb.svg" alt="Statewave" width={136} height={28} className="sw-nav__logo-lb" />
          <img src="/brand/logo-horizontal-db.svg" alt="" aria-hidden="true" width={136} height={28} className="sw-nav__logo-db" />
        </Link>

        <div className="sw-nav__links">
          {GROUPS.map((g) => {
            const open = openGroup === g.title
            const current = g.items.some(([, to]) => isInternal(to) && to !== '/' && (location.pathname === to || location.pathname.startsWith(to + '/')))
            return (
              <div
                key={g.title}
                className="sw-nav__group"
                onMouseEnter={() => openNow(g.title)}
                onMouseLeave={closeSoon}
                onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) closeSoon() }}
              >
                <button
                  type="button"
                  className={`sw-nav__link sw-nav__trigger${current ? ' active' : ''}`}
                  aria-expanded={open}
                  aria-haspopup="true"
                  onClick={() => (open ? setOpenGroup(null) : openNow(g.title))}
                >
                  {g.title}
                  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className="sw-nav__chev" data-open={open || undefined}><path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <AnimatePresence>
                  {open && (
                    <motion.ul
                      className="sw-nav__panel"
                      onClick={(e) => { if ((e.target as HTMLElement).closest('a')) { clearTimeout(closeTimer.current); setOpenGroup(null) } }}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                    >
                      {g.items.map(([label, to]) => (
                        <li key={label}><Ln to={to} className="sw-nav__item">{label}</Ln></li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        <div className="sw-nav__actions">
          <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="sw-nav__gh" aria-label="Statewave on GitHub">
            <Icon name="github" size={16} />
            {stars && <span className="sw-mono">★ {stars}</span>}
          </a>
          <a href={DOCS} target="_blank" rel="noopener noreferrer" className="sw-nav__cta">Get started</a>
        </div>

        {/* Mobile toggle — 44×44 tap target. -mr-2 keeps the icon visually
            aligned with the right edge while still meeting the tap-target
            minimum on either side. */}
        <button
          ref={toggleButtonRef}
          className="sw-nav__toggle w-11 h-11"
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
        relative positioning we actually want. */}
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
              className="sw-nav__backdrop"
            />
            <motion.div
              key="drawer"
              ref={drawerRef}
              id="mobile-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              tabIndex={-1}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="sw-nav__drawer pl-safe pr-safe"
            >
              <nav aria-label="Mobile navigation" className="sw-nav__drawer-in">
                {GROUPS.map((g) => (
                  <div key={g.title} className="sw-nav__dgroup" onClick={(e) => { if ((e.target as HTMLElement).closest('a')) setMobileOpen(false) }}>
                    <p className="sw-nav__dtitle">{g.title}</p>
                    {g.items.map(([label, to]) => (
                      <Ln key={label} to={to} className="sw-nav__dlink">{label}</Ln>
                    ))}
                  </div>
                ))}
                <a href={GITHUB} target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)} className="sw-nav__dlink">
                  GitHub{stars && <span className="sw-mono" style={{ marginLeft: 8, opacity: 0.7 }}>★ {stars}</span>}
                </a>
                <a href={DOCS} target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)} className="sw-nav__cta sw-nav__cta--block">
                  Get started
                </a>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
