import { Link, useLocation, type Location } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useCallback,
  useLayoutEffect,
  useState,
  useEffect,
  useRef,
  type SyntheticEvent,
} from 'react'
import { ThemeSwitcher } from './ThemeSwitcher'
import { Logo } from './Logo'
import { useChatWidget } from '../lib/widget-context-api'

/** Stop a pointer event at the React handler so it never bubbles up to
 *  the window — used by the More-menu backdrop and panel to keep the
 *  HeroBackground canvas's `window.addEventListener('mousemove', ...)`
 *  from firing while the dropdown is open. */
function stopBubble(e: SyntheticEvent) {
  e.stopPropagation()
}

interface NavLink {
  to: string
  label: string
}

const links: NavLink[] = [
  { to: '/product', label: 'How it works' },
  { to: '/why', label: 'Why Statewave' },
  { to: '/use-cases', label: 'Use Cases' },
  { to: '/connectors', label: 'Connectors' },
  { to: '/developers', label: 'Developers' },
  { to: '/blog', label: 'Blog' },
  { to: '/about', label: 'About' },
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
  const drawerRef = useRef<HTMLDivElement>(null)
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
        <Link to="/" className="flex items-center gap-2.5 shrink-0 -my-2 py-2">
          <Logo variant="icon" className="h-7 w-7" />
          <span className="text-[1.05rem] font-semibold tracking-tight">
            <span className="text-theme-primary">State</span><span className="bg-gradient-to-r from-brand-400 to-accent bg-clip-text text-transparent">wave</span>
          </span>
        </Link>

        {/* Desktop nav — priority+ overflow.
            As browser width shrinks past the point where all 7 links fit,
            trailing items collapse into a "More" dropdown instead of
            wrapping into a multi-line mess. GitHub is intentionally not
            in the in-nav anymore — it's in the hero CTAs and the footer
            Community section, so it stays discoverable without competing
            for header space. */}
        <OverflowNav links={links} location={location} />

        {/* Desktop right — actions */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
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
              className="md:hidden fixed top-[60px] left-0 right-0 bottom-0 z-50 border-t border-theme-border bg-surface-0 backdrop-blur-xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.45)] pl-safe pr-safe focus:outline-none"
            >
              <div className="h-full px-5 sm:px-6 pt-4 pb-[max(env(safe-area-inset-bottom),1.5rem)] flex flex-col gap-1 overflow-y-auto">
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

/* Priority+ navigation.
 *
 * Renders the desktop nav as a horizontal list that responds to its
 * container width: items that don't fit drop into a "More" dropdown
 * instead of wrapping to a new line. This is the same pattern Google
 * Search, GitHub, and most large-app shells use, and it's the smart
 * solution because:
 *   * Adding new nav items later doesn't break the header — they just
 *     join the visible list or the More list depending on width.
 *   * Each individual viewport width gets the maximum number of links
 *     it can show without overflowing — not a fixed-by-breakpoint pick.
 *   * There's never a wrapped-text moment, even mid-resize.
 *
 * Implementation: we measure each link's offsetWidth + the "More"
 * trigger's reserved width via a ResizeObserver on the container, then
 * shift `firstOverflow` to the first index whose right edge would
 * exceed the available width. Items at or after that index are hidden
 * from the inline list and rendered inside the dropdown panel instead.
 *
 * SSR / hydration: on first render `firstOverflow === links.length`
 * (no overflow), so the prerendered HTML and the first client render
 * agree. The layout effect then runs and may collapse — visible only
 * if the viewport actually triggers overflow.
 */

const MORE_TRIGGER_RESERVE_PX = 80 // wider than the trigger so we don't toggle on every pixel
const NAV_GAP_PX = 28 // matches gap-7 below

function linkClass(isActive: boolean): string {
  return [
    'text-[13px] font-medium transition-colors duration-150 whitespace-nowrap',
    isActive ? 'text-theme-primary' : 'text-theme-muted hover:text-theme-primary',
  ].join(' ')
}

function OverflowNav({ links, location }: { links: NavLink[]; location: Location }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([])
  const moreButtonRef = useRef<HTMLButtonElement>(null)
  const morePanelRef = useRef<HTMLDivElement>(null)
  // Cached natural width of each item, captured on first mount while every
  // item is still visible. We can't re-measure later because items with
  // display:none have scrollWidth === 0 — re-running the algorithm on those
  // would under-count, decide everything fits, un-hide them, oscillate.
  const widthsRef = useRef<number[]>([])
  const measuredOnceRef = useRef(false)
  const [firstOverflow, setFirstOverflow] = useState<number>(links.length)
  const [menuOpen, setMenuOpen] = useState(false)

  const recompute = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    if (!measuredOnceRef.current) {
      // First pass: every item is mounted and visible (the default
      // firstOverflow === links.length state). Capture each item's natural
      // width once and reuse forever.
      widthsRef.current = itemRefs.current.map((el) => (el ? el.scrollWidth : 0))
      measuredOnceRef.current = true
    }

    const containerWidth = container.clientWidth
    let used = 0
    let nextOverflow = links.length
    for (let i = 0; i < links.length; i++) {
      const itemWidth = widthsRef.current[i] ?? 0
      if (itemWidth === 0) continue
      const withGap = (i === 0 ? 0 : NAV_GAP_PX) + itemWidth
      // Reserve space for the More trigger only if there are still items
      // after this one that we might need to push into it.
      const reservedForMore = i < links.length - 1 ? MORE_TRIGGER_RESERVE_PX : 0
      if (used + withGap > containerWidth - reservedForMore) {
        nextOverflow = i
        break
      }
      used += withGap
    }
    setFirstOverflow((prev) => (prev === nextOverflow ? prev : nextOverflow))
  }, [links.length])

  // useLayoutEffect so the recomputation lands in the same paint as the
  // initial render — avoids a visible flash of "all 7 items inline"
  // before the dropdown collapses on narrow viewports.
  useLayoutEffect(() => {
    recompute()
    const container = containerRef.current
    if (!container || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(recompute)
    ro.observe(container)
    return () => ro.disconnect()
  }, [recompute])

  // Close menu on Escape / outside click / route change.
  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (
        !moreButtonRef.current?.contains(t) &&
        !morePanelRef.current?.contains(t)
      ) {
        setMenuOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const prevPathRef = useRef(location.pathname)
  if (prevPathRef.current !== location.pathname) {
    prevPathRef.current = location.pathname
    if (menuOpen) setMenuOpen(false)
  }

  const overflowLinks = links.slice(firstOverflow)
  const hasOverflow = overflowLinks.length > 0

  return (
    // Layout:
    //  * `justify-start` (the flex default) keeps overflowing items
    //    bleeding rightward only, never leftward into the logo.
    //  * `mx-8` (NOT `px-8`) gives a visible gap between the logo and
    //    the nav, and between the nav and the right-actions cluster.
    //    With padding instead of margin, items live inside the
    //    padding but `clientWidth` includes the padding — the overflow
    //    algorithm would over-budget by 64px and items would visually
    //    touch the Ask Support button. Margin shrinks the flex-1
    //    allocation itself, so clientWidth reflects only the content
    //    space the algorithm can actually use.
    //  * NO `overflow-hidden` — the More dropdown panel is absolutely
    //    positioned below this container, and `overflow-hidden` would
    //    clip it (the user sees an empty popup). The cached-widths
    //    measurement + useLayoutEffect collapse make the items shrink
    //    reliably without needing visual clipping as a fallback.
    <div
      ref={containerRef}
      className="hidden md:flex items-center gap-7 flex-1 min-w-0 mx-8"
    >
      {links.map((link, i) => {
        const isActive = location.pathname === link.to
        const hidden = i >= firstOverflow
        return (
          <Link
            key={link.to}
            ref={(el) => {
              itemRefs.current[i] = el
            }}
            to={link.to}
            // We never unmount overflowed items — keeping them in the DOM
            // with `hidden` lets the next ResizeObserver tick re-measure
            // their natural width when the container grows again.
            className={`${linkClass(isActive)} ${hidden ? 'hidden' : ''}`}
            aria-hidden={hidden ? 'true' : undefined}
            tabIndex={hidden ? -1 : undefined}
          >
            {link.label}
          </Link>
        )
      })}
      {hasOverflow && (
        <div className="relative">
          <button
            ref={moreButtonRef}
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="More navigation links"
            // The native <button> ships with ~2px padding + ~2px border
            // even after Tailwind v4's preflight (which only resets
            // background and font, not box-model chrome). That makes
            // the button bbox ~8px taller than the sibling <a> links;
            // the parent flex's `items-center` then drops the button
            // text ~4–5px below the <a> baselines — exactly the
            // misalignment we kept seeing. Explicitly zero p / m /
            // border / appearance so the button measures identically
            // to a bare-text anchor.
            className={`${linkClass(false)} p-0 m-0 border-0 bg-transparent appearance-none cursor-pointer`}
          >
            More
            {/* Two jobs being done at once here:
                (1) The outer <span> has `vertical-align: -0.75em` so the
                    button's line-box expands downward. That pulls the
                    button's bbox center down, and the parent flex's
                    items-center then pushes the bbox up so its centre
                    matches the <a> siblings — net effect: the "More"
                    text baseline sits exactly on the same line as
                    "How it works" etc.
                (2) The <svg> inside is positioned with `top: -0.7em` so
                    that even though the wrapper is rendered low, the
                    visible chevron is at the text x-height middle —
                    where it would naturally sit if vertical-align were
                    behaving sanely.
                Yes, this is a hack. The underlying browser bug:
                `<button>` reports a slightly different bbox than `<a>`
                in flex children even when font / line-height / padding
                / border / appearance are all explicitly equalised.
                Empirically -0.75em / -0.7em is the pair that lands. */}
            <span
              className="inline-block ml-1 w-3.5 h-3.5 relative"
              style={{ verticalAlign: '-0.75em' }}
              aria-hidden="true"
            >
              <svg
                className={`absolute inset-0 w-full h-full transition-transform duration-150 ${menuOpen ? 'rotate-180' : ''}`}
                style={{ top: '-0.7em' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>
          {menuOpen && (
            <>
              {/* Invisible full-viewport backdrop + the panel below. The
                  backdrop dismisses the menu on click; both elements
                  also stopPropagation on every pointer event so the
                  HeroBackground canvas (which listens on `window` for
                  mousemove → particle hover) never sees movement that
                  happens over the open menu surface. Without this, the
                  particle tooltip kept firing behind the dropdown panel
                  even though visually the panel was on top. The
                  backdrop and panel are DOM siblings so we have to
                  attach the stop handler to BOTH — an event on the
                  panel never bubbles through the backdrop. */}
              <button
                type="button"
                aria-label="Dismiss menu"
                tabIndex={-1}
                onClick={() => setMenuOpen(false)}
                onMouseMove={stopBubble}
                onMouseOver={stopBubble}
                onPointerMove={stopBubble}
                className="fixed inset-0 z-40 cursor-default bg-transparent"
              />
              <div
                ref={morePanelRef}
                role="menu"
                aria-label="More navigation links"
                onMouseMove={stopBubble}
                onMouseOver={stopBubble}
                onPointerMove={stopBubble}
                className="absolute right-0 top-full mt-0 min-w-[180px] rounded-lg border border-theme-border bg-surface-0 backdrop-blur-xl shadow-[0_12px_32px_-8px_rgba(0,0,0,0.3)] py-1.5 z-50"
              >
                {overflowLinks.map((link) => {
                  const isActive = location.pathname === link.to
                  return (
                    <Link
                      key={link.to}
                      role="menuitem"
                      to={link.to}
                      onClick={() => setMenuOpen(false)}
                      className={`block px-3.5 py-2 text-[13px] whitespace-nowrap transition-colors ${
                        isActive
                          ? 'text-theme-primary bg-accent/5'
                          : 'text-theme-secondary hover:text-theme-primary hover:bg-accent/5'
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
