import { useLocation, useNavigate } from 'react-router-dom'

/**
 * Cross-page return affordance. When a page is navigated to via a `<Link>` /
 * `navigate()` that passed:
 *
 *   state={{ returnTo, returnLabel, returnSection?, returnScrollY? }}
 *
 * this component renders a back-pill so the user can jump back to the *exact*
 * scroll position of the originating section — not just the anchor — without
 * relying on the browser back button (which doesn't help when the link was
 * opened in a new tab or after a hard refresh).
 *
 * On the return navigation we hand the saved Y down to ScrollToTop via
 * `state.scrollY`, which restores it precisely once the destination page has
 * laid out.
 *
 * On a direct visit with no nav-state, renders nothing.
 */
interface ReturnState {
  returnTo?: string
  returnLabel?: string
  returnSection?: string
  returnScrollY?: number
}

export function ReturnLink() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state ?? null) as ReturnState | null
  if (!state?.returnTo || !state.returnLabel) return null

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    navigate(state.returnTo!, { state: { scrollY: state.returnScrollY } })
  }

  return (
    <div className="mb-6">
      <a
        href={state.returnTo}
        onClick={onClick}
        className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-accent/25 bg-accent/[0.06] text-accent hover:bg-accent/10 hover:border-accent/40 transition-colors"
      >
        <svg
          className="w-3 h-3 transition-transform group-hover:-translate-x-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>
          Back to {state.returnLabel}
          {state.returnSection && (
            <span className="text-accent/70"> · {state.returnSection}</span>
          )}
        </span>
      </a>
    </div>
  )
}
