import { useEffect, useRef } from 'react'
import { useTheme } from '../lib/theme'

/* Giscus comments — comments are posted to GitHub Discussions on
 * smaramwbc/statewave (category: General), with one thread per blog post
 * (mapping=specific, term=pathname). Giscus is privacy-respecting (no
 * trackers, no third-party cookies beyond the GitHub auth one it needs),
 * matches the project's stance on third-party scripts, and gives us free
 * spam/abuse handling via GitHub's account model.
 *
 * The script is appended to a container ref rather than inlined in JSX
 * because Giscus expects the script tag (and only the script tag) inside
 * its iframe-mount container; React doesn't allow a <script> with
 * `data-*` attrs as a JSX child cleanly. The component remounts when the
 * `term` changes so navigating between posts loads a fresh thread.
 *
 * Theme: re-emit a giscus.app config event on theme change so the
 * embedded iframe re-themes without a full reload.
 */

interface Props {
  /** Thread key. Use `pathname` for one-thread-per-post. */
  term: string
}

const REPO = 'smaramwbc/statewave'
const REPO_ID = 'R_kgDOSLaP5Q'
const CATEGORY = 'General'
const CATEGORY_ID = 'DIC_kwDOSLaP5c4C7zFu'

function giscusTheme(resolvedTheme: 'light' | 'dark' | null): string {
  if (resolvedTheme === 'dark') return 'dark'
  if (resolvedTheme === 'light') return 'light'
  // SSR / first render before the theme effect resolves — fall back to
  // the browser's color-scheme preference so Giscus picks something
  // sensible without us having to guess.
  return 'preferred_color_scheme'
}

export function GiscusComments({ term }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()

  // Mount / remount on term change. We deliberately don't put
  // resolvedTheme in this dep array — switching themes shouldn't rebuild
  // the iframe; the second effect below sends a config message instead.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.innerHTML = ''
    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.async = true
    script.crossOrigin = 'anonymous'
    script.setAttribute('data-repo', REPO)
    script.setAttribute('data-repo-id', REPO_ID)
    script.setAttribute('data-category', CATEGORY)
    script.setAttribute('data-category-id', CATEGORY_ID)
    script.setAttribute('data-mapping', 'specific')
    script.setAttribute('data-term', term)
    script.setAttribute('data-strict', '0')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'bottom')
    script.setAttribute('data-theme', giscusTheme(resolvedTheme))
    script.setAttribute('data-lang', 'en')
    script.setAttribute('data-loading', 'lazy')
    container.appendChild(script)
    return () => {
      container.innerHTML = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term])

  // Theme sync — postMessage to the giscus iframe when the site theme
  // flips. Cheap; the iframe re-themes in-place.
  useEffect(() => {
    const iframe = document.querySelector<HTMLIFrameElement>(
      'iframe.giscus-frame',
    )
    if (!iframe || !iframe.contentWindow) return
    iframe.contentWindow.postMessage(
      { giscus: { setConfig: { theme: giscusTheme(resolvedTheme) } } },
      'https://giscus.app',
    )
  }, [resolvedTheme])

  return <div ref={containerRef} className="giscus" />
}
