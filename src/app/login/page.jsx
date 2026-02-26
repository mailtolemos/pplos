'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLang } from '@/components/lang-provider'
import { useTheme } from '@/components/theme-provider'
import { LANGS } from '@/lib/i18n'

const MO = "'JetBrains Mono',monospace"

// ─── Typewriter Hook ────────────────────────────────────────
function useTypewriter(words, typeSpeed = 80, deleteSpeed = 50, pauseTime = 2500) {
  const [text, setText] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    const current = words[wordIdx]
    if (!isDeleting && text === current) {
      timeoutRef.current = setTimeout(() => setIsDeleting(true), pauseTime)
    } else if (isDeleting && text === '') {
      timeoutRef.current = setTimeout(() => {
        setWordIdx((wordIdx + 1) % words.length)
        setIsDeleting(false)
      }, 300)
    } else {
      timeoutRef.current = setTimeout(() => {
        setText(isDeleting ? current.slice(0, text.length - 1) : current.slice(0, text.length + 1))
      }, isDeleting ? deleteSpeed : typeSpeed)
    }
    return () => clearTimeout(timeoutRef.current)
  }, [text, isDeleting, wordIdx, words, typeSpeed, deleteSpeed, pauseTime])

  return text
}

// ─── Company Names for Ticker ───────────────────────────────
const companyNames = [
  "Acme Corp", "Startup.io", "TechNova", "BrightPath", "Cloudline",
  "NexGen", "Pulse Labs", "Horizonte", "Vertex", "Lumina",
  "Atlas Group", "Orbit", "Prism", "Forge", "Catalyst", "People.OS"
]

function CompanyTicker() {
  const [idx, setIdx] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [name, setName] = useState(companyNames[0])

  useEffect(() => {
    const iv = setInterval(() => {
      setAnimating(true)
      setTimeout(() => {
        setIdx(p => { const n = (p + 1) % companyNames.length; setName(companyNames[n]); return n })
        setAnimating(false)
      }, 350)
    }, 2000)
    return () => clearInterval(iv)
  }, [])

  const isBrand = name === 'People.OS'
  return (
    <span style={{
      display: 'inline-block', minWidth: 130, textAlign: 'center',
      transition: 'all 0.35s ease', opacity: animating ? 0 : 1,
      transform: animating ? 'translateY(-10px)' : 'translateY(0)',
      color: isBrand ? 'var(--accent)' : 'var(--tx-d)',
      fontWeight: isBrand ? 700 : 400,
      fontStyle: isBrand ? 'normal' : 'italic',
    }}>
      {name}
    </span>
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { t, lang, setLang } = useLang()
  const { theme, toggleTheme } = useTheme()

  const brandText = useTypewriter(['People.OS', 'pplos.io'], 80, 50, 2500)

  useEffect(() => { setTimeout(() => setMounted(true), 100) }, [])

  async function handleLogin(e) {
    e.preventDefault(); setError(null); setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/dashboard'); router.refresh()
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center',
      background: 'var(--bg)', padding: 24, position: 'relative',
      transition: 'background 0.3s ease',
    }}>
      {/* Top-right controls */}
      <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 6, zIndex: 10 }}>
        {LANGS.map(l => (
          <button key={l.code} onClick={() => setLang(l.code)} style={{
            padding: '4px 8px', fontSize: 11, borderRadius: 5,
            border: `1px solid ${lang === l.code ? 'var(--accent)' : 'var(--bd)'}`,
            background: lang === l.code ? 'var(--accent-dim)' : 'transparent',
            color: lang === l.code ? 'var(--accent)' : 'var(--tx-d)',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>{l.flag}</button>
        ))}
        <button onClick={toggleTheme} style={{
          padding: '4px 8px', fontSize: 14, borderRadius: 5,
          border: '1px solid var(--bd)', background: 'transparent',
          color: 'var(--tx-d)', cursor: 'pointer',
        }}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <div style={{
        width: '100%', maxWidth: 420,
        opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s ease',
      }}>
        {/* Logo + Typewriter Brand */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <img src="/logo.png" alt="People.OS" style={{ height: 40, marginBottom: 16, objectFit: 'contain' }} />
          <div style={{ fontFamily: MO, fontSize: 28, fontWeight: 700, color: 'var(--accent)', minHeight: 40 }}>
            {brandText}<span className="typewriter-cursor" />
          </div>
          <p style={{ fontSize: 13, color: 'var(--tx-d)', marginTop: 10 }}>{t('auth.signin')}</p>
          <div style={{ marginTop: 14, fontSize: 12, color: 'var(--tx-d)' }}>
            {t('dash.welcome')}: <CompanyTicker />
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{
          background: 'var(--bg-c)', border: '1px solid var(--bd)',
          borderRadius: 14, padding: 28, display: 'flex', flexDirection: 'column', gap: 16,
          animation: 'fadeSlideUp 0.5s ease 0.2s both',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 11, color: 'var(--tx-d)', fontWeight: 500 }}>{t('auth.email')}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="jane@company.com"
              style={{
                padding: '10px 12px', borderRadius: 7, border: '1px solid var(--bd)',
                background: 'var(--bg-e)', color: 'var(--tx)', fontSize: 13, outline: 'none',
                fontFamily: 'inherit', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--bd)'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 11, color: 'var(--tx-d)', fontWeight: 500 }}>{t('auth.password')}</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                required placeholder="••••••••" minLength={6}
                style={{
                  width: '100%', padding: '10px 40px 10px 12px', borderRadius: 7,
                  border: '1px solid var(--bd)', background: 'var(--bg-e)',
                  color: 'var(--tx)', fontSize: 13, outline: 'none', fontFamily: 'inherit',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--bd)'}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--tx-d)', cursor: 'pointer', fontSize: 14,
              }}>
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              fontSize: 12, color: 'var(--rs)', padding: '8px 10px',
              background: 'rgba(251,113,133,0.08)', borderRadius: 7,
              border: '1px solid rgba(251,113,133,0.18)',
            }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            padding: '11px', borderRadius: 7, border: 'none',
            background: 'var(--accent)', color: '#fff',
            fontSize: 13, fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.6 : 1, fontFamily: MO, transition: 'opacity 0.2s',
          }}>
            {loading ? t('auth.signing_in') : t('auth.signin.btn')}
          </button>

          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--tx-d)' }}>
            {t('auth.no_account')}{' '}
            <a href="/signup" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
              {t('auth.create_workspace')}
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
