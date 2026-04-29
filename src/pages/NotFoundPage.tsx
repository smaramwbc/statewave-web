import { Link } from 'react-router-dom'
import { usePageSEO } from '../lib/seo'

export function NotFoundPage() {
  usePageSEO({ title: '404 — Page Not Found — Statewave' })

  return (
    <section className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-6xl font-bold text-accent">404</p>
        <h1 className="mt-4 text-2xl font-bold text-theme-primary">Page not found</h1>
        <p className="mt-3 text-theme-muted">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-light transition-colors"
        >
          Back to home
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </section>
  )
}
