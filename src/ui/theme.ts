import { portfolioConfig } from '../portfolio.config'

export type Theme = 'dark' | 'light'

const THEME_KEY = 'pf_theme'
const listeners = new Set<(theme: Theme) => void>()

export function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const saved = localStorage.getItem(THEME_KEY) as Theme | null
  if (saved === 'dark' || saved === 'light') return saved
  return portfolioConfig.theme.defaultTheme || 'dark'
}

export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem(THEME_KEY, theme)

  // Update theme-color meta tag
  const metaTheme = document.querySelector('meta[name="theme-color"]')
  if (metaTheme) {
    metaTheme.setAttribute('content', theme === 'dark' ? '#090a0f' : '#ffffff')
  }

  listeners.forEach((listener) => listener(theme))
}

export function toggleTheme(): Theme {
  const current = (document.documentElement.getAttribute('data-theme') as Theme) || getInitialTheme()
  const next: Theme = current === 'dark' ? 'light' : 'dark'
  applyTheme(next)
  return next
}

export function onThemeChange(listener: (theme: Theme) => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function initTheme() {
  const theme = getInitialTheme()
  applyTheme(theme)
}
