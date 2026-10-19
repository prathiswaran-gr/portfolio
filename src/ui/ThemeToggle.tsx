import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { getInitialTheme, onThemeChange, toggleTheme, type Theme } from './theme'
import { tap } from './sound'
import { portfolioConfig } from '../portfolio.config'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [120, 320], [0, 1])
  const pointerEvents = useTransform(opacity, (o) => (o < 0.5 ? 'none' : 'auto'))

  useEffect(() => onThemeChange(setTheme), [])

  if (!portfolioConfig.theme.allowToggle) return null

  const isDark = theme === 'dark'

  return (
    <motion.button
      className="theme-toggle"
      style={{ opacity, pointerEvents }}
      onClick={() => {
        const next = toggleTheme()
        setTheme(next)
        tap()
      }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span className={`theme-icon ${isDark ? 'is-dark' : 'is-light'}`} aria-hidden="true">
        {isDark ? (
          // Moon icon
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          // Sun icon
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        )}
      </span>
      <span>{isDark ? 'dark' : 'light'}</span>
    </motion.button>
  )
}
