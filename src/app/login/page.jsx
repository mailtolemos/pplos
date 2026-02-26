'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLang } from '@/components/lang-provider'
import { useTheme } from '@/components/theme-provider'
import { LANGS } from '@/lib/i18n'

const MO = "'JetBrains Mono',monospace"

function useTypewriter(words, typeSpeed = 80, deleteSpeed = 50, pauseTime = 2500) {
  const [text, setText] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const timeoutRef = useRef(null)
  useEffect(() => {
    const current = words[wordIdx]
    if (!isDeleting && text === current) timeoutRef.current = setTimeout(() => setIsDeleting(true), pauseTime)
    else if (isDeleting && text === '') timeoutRef.current = setTimeout(() => { setWordIdx((wordIdx + 1) % words.length); setIsDeleting(false) }, 300)
    else timeoutRef.current = setTimeout(() => setText(isDeleting ? current.slice(0, text.length - 1) : current.slice(0, text.length + 1)), isDeleting ? deleteSpeed : typeSpeed)
    return () => clearTimeout(timeoutRef.current)
  }, [text, isDeleting, wordIdx, words, typeSpeed, deleteSpeed, pauseTime])
  return text
}

function getSubdomain() {
  if (typeof window === 'undefined') return null
  const hostname = window.location.hostname
  if (hostname.endsWith('.pplos.io')) {
    const sub = hostname.replace('.pplos.io', '')
    if (sub && sub !== 'www') return sub
  }
  if (hostname.endsWith('.localhost')) {
    const sub = hostname.replace('.localhost', '')
    if (sub && sub !== 'www') return sub
  }
  return null
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [tenantInfo, setTenantInfo] = useState(null) // { name, slug, plan }
  const router = useRouter()
  const { t, lang, setLang } = useLang()
  const { theme, toggleTheme } = useTheme()

  const subdomain = typeof window !== 'undefined' ? getSubdomain() : null
  const brandWords = tenantInfo
    ? [tenantInfo.name, 'People Operating System']
    : ['People Operating System', 'pplos.io']
  const brandText = useTypewriter(brandWords, 60, 40, 2500)

  useEffect(() => { setTimeout(() => setMounted(true), 100) }, [])

  // Fetch tenant info for subdomain
  useEffect(() => {
    const sub = getSubdomain()
    if (!sub) return
    fetch(`/api/tenant?slug=${sub}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.name) setTenantInfo(data) })
      .catch(() => {})
  }, [])

  async function handleLogin(e) {
    e.preventDefault(); setError(null); setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/dashboard'); router.refresh()
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)', padding: 24, position: 'relative', transition: 'background 0.3s ease' }}>
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
        }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
      </div>

      <div style={{ width: '100%', maxWidth: 420, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <img src="/logo.png" alt="People.OS" style={{ height: 40, marginBottom: 16, objectFit: 'contain' }} />
          <div style={{ fontFamily: MO, fontSize: 22, fontWeight: 700, color: 'var(--accent)', minHeight: 36 }}>
            {brandText}<span className="typewriter-cursor" />
          </div>
          {tenantInfo ? (
            <p style={{ fontSize: 13, color: 'var(--tx-d)', marginTop: 10 }}>
              {t('auth.signin').replace(t('auth.workspace').toLowerCase(), '')} <strong style={{ color: 'var(--tx-m)' }}>{tenantInfo.name}</strong>
            </p>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--tx-d)', marginTop: 10 }}>{t('auth.signin')}</p>
          )}
        </div>

        <form onSubmit={handleLogin} style={{
          background: 'var(--bg-c)', border: '1px solid var(--bd)',
          borderRadius: 14, padding: 28, display: 'flex', flexDirection: 'column', gap: 16,
          animation: 'fadeSlideUp 0.5s ease 0.2s both',
        }}>
          {tenantInfo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--accent-dim)', borderRadius: 8, border: '1px solid var(--accent-border)', marginBottom: 4 }}>
              <div style={{ width: 32, height: 32, borderRadius: 7, background: 'var(--accent)', display: 'grid', placeItems: 'center', fontFamily: MO, fontSize: 12, fontWeight: 800, color: '#fff' }}>
                {tenantInfo.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>{tenantInfo.name}</div>
                <div style={{ fontSize: 10, color: 'var(--tx-d)', fontFamily: MO }}>{tenantInfo.slug}.pplos.io</div>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 11, color: 'var(--tx-d)', fontWeight: 500 }}>{t('auth.email')}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="jane@company.com"
              style={{ padding: '10px 12px', borderRadius: 7, border: '1px solid var(--bd)', background: 'var(--bg-e)', color: 'var(--tx)', fontSize: 13, outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--bd)'} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 11, color: 'var(--tx-d)', fontWeight: 500 }}>{t('auth.password')}</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" minLength={6}
                style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: 7, border: '1px solid var(--bd)', background: 'var(--bg-e)', color: 'var(--tx)', fontSize: 13, outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--bd)'} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--tx-d)', cursor: 'pointer', fontSize: 14 }}>
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>
          {error && <div style={{ fontSize: 12, color: 'var(--rs)', padding: '8px 10px', background: 'rgba(251,113,133,0.08)', borderRadius: 7, border: '1px solid rgba(251,113,133,0.18)' }}>{error}</div>}
          <button type="submit" disabled={loading} style={{
            padding: '11px', borderRadius: 7, border: 'none', background: 'var(--accent)', color: '#fff',
            fontSize: 13, fontWeight: 600, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1, fontFamily: MO, transition: 'opacity 0.2s',
          }}>{loading ? t('auth.signing_in') : t('auth.signin.btn')}</button>
          {!tenantInfo && (
            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--tx-d)' }}>
              {t('auth.no_account')}{' '}<a href="/signup" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>{t('auth.create_workspace')}</a>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
