import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'

export type ThemeMode = 'auto' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'statewave-theme-mode'

interface ThemeContextValue {
  mode: ThemeMode
  resolvedTheme: ResolvedTheme
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'auto') return getSystemTheme()
  return mode
}

function applyTheme(resolved: ResolvedTheme) {
  document.documentElement.setAttribute('data-theme', resolved)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored
    return 'auto'
  })

  const [resolvedTheme, setResolved] = useState<ResolvedTheme>(() => resolveTheme(mode))

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode)
    localStorage.setItem(STORAGE_KEY, newMode)
    const resolved = resolveTheme(newMode)
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

  // Sync on mount
  useEffect(() => {
    applyTheme(resolvedTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
