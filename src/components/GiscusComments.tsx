import { useEffect, useRef } from 'react'
import { useTheme } from '../lib/theme'

interface Props {
  /** Thread key. Use `pathname` for one-thread-per-post. */
  term: string
}

const REPO = 'smaramwbc/statewave'
const REPO_ID = 'R_kgDOSLaP5Q'
const CATEGORY = 'General'
const CATEGORY_ID = 'DIC_kwDOSLaP5c4C7zFu'

function giscusTheme(resolvedTheme: 'light' | 'dark' | null): string {
if (resolvedTheme === 'dark') return 'transparent_dark'
if (resolvedTheme === 'light') return 'light'
return 'preferred_color_scheme'
}

export function GiscusComments({ term }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()

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

  useEffect(() => {
    const iframe = containerRef.current?.querySelector<HTMLIFrameElement>(
      'iframe.giscus-frame',
    )

    if (!iframe?.contentWindow) return

    iframe.contentWindow.postMessage(
      {
        giscus: {
          setConfig: {
            theme: giscusTheme(resolvedTheme),
          },
        },
      },
      'https://giscus.app',
    )
  }, [resolvedTheme])

  return (
    <div className="sw-card overflow-hidden rounded-2xl border border-brand-500/20 p-4 sm:p-6">
      <div ref={containerRef} className="giscus min-h-[260px]" />
    </div>
  )
}