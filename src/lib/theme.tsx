import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  /** Null during SSR and the first client render — flips to the real value in
   *  a mount effect. Consumers that conditionally render different DOM per
   *  theme must handle null (return null or a theme-agnostic shape) or risk
   *  a hydration mismatch. Visual correctness during the null window is
   *  handled by the inline <script> in index.html, which sets the
   *  `data-theme` attribute on <html> before paint — components driven by
   *  CSS variables on that attribute look right regardless of React state. */
  resolvedTheme: ResolvedTheme | null
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(resolved: ResolvedTheme) {
  const html = document.documentElement
  // Suppress all transitions for the duration of the swap. Without this,
  // body bg fades over 200ms while the alpha-tinted scrollbar thumb composites
  // over the moving background, producing visible flicker. See the
  // `.theme-switching` rule in index.css for the full story.
  html.classList.add('theme-switching')
  html.setAttribute('data-theme', resolved)
  // Force a style recalc so the new variables apply with transitions still
  // disabled, then restore transitions on the next frame for hover/focus etc.
  void html.offsetWidth
  requestAnimationFrame(() => {
    html.classList.remove('theme-switching')
  })
}

/** The site has no theme switcher: the theme always follows the visitor's OS
 *  setting, and nothing is stored. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  // `resolvedTheme` stays null until mount so SSR and the first client render
  // produce identical DOM (no hydration warnings). The inline <script> in
  // index.html has already set `data-theme` before paint.
  const [resolvedTheme, setResolved] = useState<ResolvedTheme | null>(null)

  useEffect(() => {
    const sync = () => {
      const resolved = getSystemTheme()
      setResolved(resolved)
      applyTheme(resolved)
    }
    sync()
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return (
    <ThemeContext.Provider value={{ resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
