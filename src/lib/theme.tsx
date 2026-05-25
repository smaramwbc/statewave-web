import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'

export type ThemeMode = 'auto' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'statewave-theme-mode'

interface ThemeContextValue {
  mode: ThemeMode
  /** Null during SSR and the first client render — flips to the real value in
   *  a mount effect. Consumers that conditionally render different DOM per
   *  theme must handle null (return null or a theme-agnostic shape) or risk
   *  a hydration mismatch. Visual correctness during the null window is
   *  handled by the inline <script> in index.html, which sets the
   *  `data-theme` attribute on <html> before paint — components driven by
   *  CSS variables on that attribute look right regardless of React state. */
  resolvedTheme: ResolvedTheme | null
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'auto') return getSystemTheme()
  return mode
}

function readStoredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'auto'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored
  return 'auto'
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

export function ThemeProvider({ children }: { children: ReactNode }) {
  // SSR-safe defaults. The actual values arrive in the mount effect below,
  // and `resolvedTheme` stays null until then so SSR and client first-render
  // produce identical DOM (no hydration warnings).
  const [mode, setModeState] = useState<ThemeMode>('auto')
  const [resolvedTheme, setResolved] = useState<ResolvedTheme | null>(null)

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode)
    window.localStorage.setItem(STORAGE_KEY, newMode)
    const resolved = resolveTheme(newMode)
    setResolved(resolved)
    applyTheme(resolved)
  }, [])

  // On client mount, read the persisted/system theme and reconcile React
  // state. The inline <script> in index.html already set the right
  // `data-theme` attribute before paint, so this effect only updates React
  // state — no visible flash for users in dark mode. setState-in-effect is
  // intentional here: SSR and the first client render both produce
  // `resolvedTheme=null` for hydration parity, and only this post-mount
  // effect can safely touch `window.matchMedia` / `localStorage`.
  useEffect(() => {
    const storedMode = readStoredMode()
    const resolved = resolveTheme(storedMode)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModeState(storedMode)
    setResolved(resolved)
    applyTheme(resolved)
  }, [])

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (mode === 'auto') {
        const resolved = getSystemTheme()
        setResolved(resolved)
        applyTheme(resolved)
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [mode])

  return (
    <ThemeContext.Provider value={{ mode, resolvedTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
