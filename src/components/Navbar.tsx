import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { ThemeSwitcher } from './ThemeSwitcher'
import { Logo } from './Logo'
import { useChatWidget } from '../lib/widget-context'

const links = [
  { to: '/product', label: 'Product' },
  { to: '/why', label: 'Why Statewave' },
  { to: '/use-cases', label: 'Use Cases' },
  { to: '/developers', label: 'Developers' },
]

export function Navbar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { openWidget } = useChatWidget()

  const askSupport = () => {
    openWidget('statewave-support', 'Statewave Support')
    setMobileOpen(false)
  }

  // Close mobile menu on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) setMobileOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [mobileOpen])

  // Close mobile menu on route change
  const prevPathname = useRef(location.pathname)
  if (prevPathname.current !== location.pathname) {
    prevPathname.current = location.pathname
    if (mobileOpen) setMobileOpen(false)
  }

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-theme-border bg-surface-0/80 backdrop-blur-xl"
    >
      <nav aria-label="Main navigation" className="mx-auto max-w-7xl px-6 h-[60px] flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
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
            className="text-[12.5px] font-medium px-3 py-1.5 rounded-md border border-theme-border text-theme-secondary hover:text-theme-primary hover:border-accent/50 transition-colors duration-150"
            title="Ask the Statewave Support agent — answers grounded in the official docs"
          >
            Ask Support
          </button>
          <ThemeSwitcher />
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 -mr-2 text-theme-muted hover:text-theme-primary transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="md:hidden border-t border-theme-border bg-surface-0/98 backdrop-blur-xl"
        >
          <div className="px-6 py-5 flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="text-[15px] font-medium text-theme-secondary hover:text-theme-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://github.com/smaramwbc/statewave"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[15px] font-medium text-theme-secondary hover:text-theme-primary transition-colors"
            >
              GitHub
            </a>
            <button
              type="button"
              onClick={askSupport}
              className="text-[15px] font-medium text-left text-theme-secondary hover:text-theme-primary transition-colors"
            >
              Ask Support
            </button>
            <div className="pt-3 border-t border-theme-border flex items-center justify-between">
              <span className="text-xs text-theme-muted">Theme</span>
              <ThemeSwitcher />
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}
