import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from './Logo'
import { useChatWidget, useTrackDemoCta } from '../lib/widget-context-api'

export function Footer() {
  const { openWidget } = useChatWidget()
  const footerDemoRef = useRef<HTMLButtonElement>(null)
  useTrackDemoCta(footerDemoRef)
  return (
    <footer className="border-t border-theme-border bg-surface-0 pl-safe pr-safe">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 py-12 sm:py-14 md:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 md:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <Logo variant="icon" className="h-7 w-7" />
              <span className="text-base font-semibold tracking-tight">
                <span className="text-theme-primary">State</span><span className="bg-gradient-to-r from-brand-400 to-accent bg-clip-text text-transparent">wave</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-theme-muted leading-relaxed">
              Open-source memory runtime for AI agents.<br />
              Self-hosted on Postgres. Apache-2.0.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-theme-primary mb-4">Product</h3>
            <ul className="space-y-2.5 sm:space-y-2">
              <li><Link to="/product" className="text-sm text-theme-muted hover:text-theme-primary transition-colors">How it works</Link></li>
              <li><Link to="/why" className="text-sm text-theme-muted hover:text-theme-primary transition-colors">Why Statewave</Link></li>
              <li><Link to="/use-cases" className="text-sm text-theme-muted hover:text-theme-primary transition-colors">Use Cases</Link></li>
              <li><Link to="/connectors" className="text-sm text-theme-muted hover:text-theme-primary transition-colors">Connectors</Link></li>
              <li>
                <button
                  ref={footerDemoRef}
                  type="button"
                  onClick={() => openWidget()}
                  className="text-sm text-theme-muted hover:text-theme-primary transition-colors text-left"
                >
                  Live Demo
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-theme-primary mb-4">Developers</h3>
            <ul className="space-y-2.5 sm:space-y-2">
              <li><a href="https://github.com/smaramwbc/statewave-docs/blob/main/getting-started.md" target="_blank" rel="noopener noreferrer" className="text-sm text-theme-muted hover:text-theme-primary transition-colors">Getting Started</a></li>
              <li><a href="https://github.com/smaramwbc/statewave-docs/blob/main/api/v1-contract.md" target="_blank" rel="noopener noreferrer" className="text-sm text-theme-muted hover:text-theme-primary transition-colors">API Reference</a></li>
              <li><a href="https://github.com/smaramwbc/statewave-py" target="_blank" rel="noopener noreferrer" className="text-sm text-theme-muted hover:text-theme-primary transition-colors">Python SDK</a></li>
              <li><a href="https://github.com/smaramwbc/statewave-ts" target="_blank" rel="noopener noreferrer" className="text-sm text-theme-muted hover:text-theme-primary transition-colors">TypeScript SDK</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-theme-primary mb-4">Community</h3>
            <ul className="space-y-2.5 sm:space-y-2">
              <li><a href="https://github.com/smaramwbc/statewave" target="_blank" rel="noopener noreferrer" className="text-sm text-theme-muted hover:text-theme-primary transition-colors">GitHub</a></li>
              <li><a href="https://github.com/smaramwbc/statewave-examples" target="_blank" rel="noopener noreferrer" className="text-sm text-theme-muted hover:text-theme-primary transition-colors">Examples</a></li>
              <li><a href="https://github.com/smaramwbc/statewave-docs/blob/main/roadmap.md" target="_blank" rel="noopener noreferrer" className="text-sm text-theme-muted hover:text-theme-primary transition-colors">Roadmap</a></li>
              <li><Link to="/blog" className="text-sm text-theme-muted hover:text-theme-primary transition-colors">Blog</Link></li>
              <li><Link to="/about" className="text-sm text-theme-muted hover:text-theme-primary transition-colors">About</Link></li>
              <li><Link to="/launch" className="text-sm text-theme-muted hover:text-theme-primary transition-colors">Launch waitlist</Link></li>
              <li><Link to="/press" className="text-sm text-theme-muted hover:text-theme-primary transition-colors">Press kit</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-theme-border flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-4">
          <p className="text-xs text-theme-muted">
            © {new Date().getFullYear()} Statewave. Open source under Apache-2.0.
            <span className="mx-2 text-theme-border">·</span>
            <Link to="/privacy" className="hover:text-theme-primary transition-colors">Privacy</Link>
            <span className="mx-2 text-theme-border">·</span>
            <Link to="/terms" className="hover:text-theme-primary transition-colors">Terms</Link>
            <span className="mx-2 text-theme-border">·</span>
            <Link to="/cookies" className="hover:text-theme-primary transition-colors">Cookies</Link>
            <span className="mx-2 text-theme-border">·</span>
            <Link to="/impressum" className="hover:text-theme-primary transition-colors">Impressum</Link>
          </p>
          <p className="text-xs text-theme-muted md:text-right">
            Built for teams who believe AI memory is infrastructure, not an afterthought.
          </p>
        </div>
      </div>
    </footer>
  )
}
