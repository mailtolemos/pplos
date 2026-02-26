'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ThemeCtx = createContext()

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('pplos_theme')
      if (saved === 'light' || saved === 'dark') {
        setThemeState(saved)
        document.documentElement.setAttribute('data-theme', saved)
      }
    } catch {}
    setMounted(true)
  }, [])

  const setTheme = useCallback((t) => {
    setThemeState(t)
    document.documentElement.setAttribute('data-theme', t)
    try { window.localStorage.setItem('pplos_theme', t) } catch {}
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  return (
    <ThemeCtx.Provider value={{ theme, setTheme, toggleTheme, mounted }}>
      {children}
    </ThemeCtx.Provider>
  )
}

export const useTheme = () => useContext(ThemeCtx)
