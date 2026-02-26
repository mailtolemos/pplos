'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { t as translate, LANGS } from '@/lib/i18n'

const LangCtx = createContext()

export function LangProvider({ children }) {
  const [lang, setLangState] = useState('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('pplos_lang')
      if (saved && LANGS.some(l => l.code === saved)) setLangState(saved)
    } catch {}
    setMounted(true)
  }, [])

  const setLang = useCallback((code) => {
    setLangState(code)
    try { window.localStorage.setItem('pplos_lang', code) } catch {}
  }, [])

  const t = useCallback((key) => translate(key, lang), [lang])

  return <LangCtx.Provider value={{ lang, setLang, t, mounted }}>{children}</LangCtx.Provider>
}

export const useLang = () => useContext(LangCtx)
