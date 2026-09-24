import { useEffect, useRef } from 'react'

/* Cloudflare Turnstile, shared by every signup form on the site.
 *
 * Moved here from LaunchPage unchanged so the Statewave Guide subscribe form
 * uses the same widget, the same fail-open seam and the same single script
 * load rather than a second copy of all three.
 */


// Minimal shape of the Cloudflare Turnstile global. Kept local (no global
// augmentation) so this stays a self-contained, privacy-preserving widget.
interface TurnstileApi {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string
      callback: (token: string) => void
      'expired-callback'?: () => void
      'error-callback'?: () => void
    },
  ) => string
  remove: (widgetId: string) => void
}

const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script'
const TURNSTILE_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

function getTurnstile(): TurnstileApi | undefined {
  return (window as unknown as { turnstile?: TurnstileApi }).turnstile
}

function loadTurnstileScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (getTurnstile()) return resolve()
    const existing = document.getElementById(TURNSTILE_SCRIPT_ID)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('turnstile load')))
      return
    }
    const s = document.createElement('script')
    s.id = TURNSTILE_SCRIPT_ID
    s.src = TURNSTILE_SRC
    s.async = true
    s.defer = true
    s.addEventListener('load', () => resolve())
    s.addEventListener('error', () => reject(new Error('turnstile load')))
    document.head.appendChild(s)
  })
}

/**
 * Cloudflare Turnstile — privacy-preserving CAPTCHA. Explicit render so it
 * plays nicely with React. Remounted (via a `key` bump from the parent)
 * after a failed submit to issue a fresh single-use token. If the script
 * fails to load the parent's submit still works; the server enforces the
 * token when TURNSTILE_SECRET_KEY is set.
 */
export function Turnstile({
  siteKey,
  onToken,
}: {
  siteKey: string
  onToken: (token: string) => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false
    let widgetId: string | undefined

    loadTurnstileScript()
      .then(() => {
        if (cancelled) return
        const api = getTurnstile()
        const el = containerRef.current
        if (!api || !el) return
        widgetId = api.render(el, {
          sitekey: siteKey,
          callback: (token: string) => onToken(token),
          'expired-callback': () => onToken(''),
          'error-callback': () => onToken(''),
        })
      })
      .catch(() => {
        /* script blocked/failed — server-side check still gates when set */
      })

    return () => {
      cancelled = true
      const api = getTurnstile()
      if (api && widgetId) {
        try {
          api.remove(widgetId)
        } catch {
          /* widget already gone */
        }
      }
    }
  }, [siteKey, onToken])

  return <div ref={containerRef} className="mt-1" />
}
