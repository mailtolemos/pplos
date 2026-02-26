'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLang } from '@/components/lang-provider'
import { useTheme } from '@/components/theme-provider'
import { LANGS } from '@/lib/i18n'

const MO = "'JetBrains Mono',monospace"

function useTypewriter(words) {
  const [text, setText] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const current = words[wordIdx]
    if (!isDeleting && text === current) ref.current = setTimeout(() => setIsDeleting(true), 2500)
    else if (isDeleting && text === '') ref.current = setTimeout(() => { setWordIdx((wordIdx + 1) % words.length); setIsDeleting(false) }, 300)
    else ref.current = setTimeout(() => setText(isDeleting ? current.slice(0, text.length - 1) : current.slice(0, text.length + 1)), isDeleting ? 50 : 80)
    return () => clearTimeout(ref.current)
  }, [text, isDeleting, wordIdx, words])
  return text
}

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [company, setCompany] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { t, lang, setLang } = useLang()
  const { theme, toggleTheme } = useTheme()
  const brandText = useTypewriter(['People Operating System', 'pplos.io'])

  useEffect(() => { setTimeout(() => setMounted(true), 100) }, [])

  async function handleSignup(e) {
    e.preventDefault(); setError(null); setLoading(true)
    const supabase = createClient()
    try {
      const { data: authData, error: authErr } = await supabase.auth.signUp({ email, password })
      if (authErr) throw authErr
      if (!authData.user) throw new Error('Check email for confirmation')
      const userId = authData.user.id
      const slug = company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')
      const { data: tenant, error: tenErr } = await supabase.from('tenants').insert({ name: company, slug, plan: 'growth' }).select().single()
      if (tenErr) throw tenErr
      const { error: profErr } = await supabase.from('profiles').insert({ id: userId, tenant_id: tenant.id, full_name: fullName, role: 'admin' })
      if (profErr) throw profErr
      await supabase.rpc('seed_tenant_data', { p_tenant_id: tenant.id }).catch(() => {})
      router.push('/dashboard'); router.refresh()
    } catch (err) { setError(err.message); setLoading(false) }
  }

  const inputStyle = {
    padding: '10px 12px', borderRadius: 7, border: '1px solid var(--bd)',
    background: 'var(--bg-e)', color: 'var(--tx)', fontSize: 13,
    outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s', width: '100%',
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center',
      background: 'var(--bg)', padding: 24, position: 'relative',
    }}>
      {/* Top controls */}
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
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <img src="/logo.png" alt="People.OS" style={{ height: 40, marginBottom: 16, objectFit: 'contain' }} />
          <div style={{ fontFamily: MO, fontSize: 22, fontWeight: 700, color: 'var(--accent)', minHeight: 36 }}>
            {brandText}<span className="typewriter-cursor" />
          </div>
          <p style={{ fontSize: 13, color: 'var(--tx-d)', marginTop: 10 }}>{t('auth.create_hr')}</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} style={{
          background: 'var(--bg-c)', border: '1px solid var(--bd)',
          borderRadius: 14, padding: 28, display: 'flex', flexDirection: 'column', gap: 16,
          animation: 'fadeSlideUp 0.5s ease 0.2s both',
        }}>
          {/* Progress */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: step >= s ? 'var(--accent)' : 'var(--bd)', transition: 'background 0.3s' }} />
            ))}
          </div>

          {step === 1 && <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 11, color: 'var(--tx-d)', fontWeight: 500 }}>{t('auth.your_name')}</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="Jane Doe" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--bd)'} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 11, color: 'var(--tx-d)', fontWeight: 500 }}>{t('auth.company_name')}</label>
              <input value={company} onChange={e => setCompany(e.target.value)} required placeholder="Douro Labs" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--bd)'} />
            </div>
            {company && (
              <div style={{ fontSize: 11, fontFamily: MO, color: 'var(--tx-d)' }}>
                {t('auth.your_workspace')}: <span style={{ color: 'var(--accent)' }}>{company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}.pplos.io</span>
              </div>
            )}
            <button type="button" onClick={() => fullName && company && setStep(2)} disabled={!fullName || !company} style={{
              padding: '11px', borderRadius: 7, border: 'none', background: 'var(--accent)',
              color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: MO,
              opacity: (!fullName || !company) ? 0.4 : 1, transition: 'opacity 0.2s',
            }}>{t('auth.continue')}</button>
          </>}

          {step === 2 && <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 11, color: 'var(--tx-d)', fontWeight: 500 }}>{t('auth.email')}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="jane@dourolabs.com" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--bd)'} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 11, color: 'var(--tx-d)', fontWeight: 500 }}>{t('auth.password')}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder={t('auth.min_chars')} minLength={6} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--bd)'} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--tx-d)', background: 'var(--bg-e)', padding: '10px 12px', borderRadius: 7, border: '1px solid var(--bd)' }}>
              <strong style={{ color: 'var(--tx-m)' }}>{t('auth.workspace')}:</strong> {company}<br />
              <strong style={{ color: 'var(--tx-m)' }}>{t('auth.admin')}:</strong> {fullName}
            </div>
            {error && (
              <div style={{ fontSize: 12, color: 'var(--rs)', padding: '8px 10px', background: 'rgba(251,113,133,0.08)', borderRadius: 7, border: '1px solid rgba(251,113,133,0.18)' }}>{error}</div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => setStep(1)} style={{
                flex: 1, padding: '11px', borderRadius: 7, border: '1px solid var(--bd)',
                background: 'transparent', color: 'var(--tx-m)', fontSize: 13, cursor: 'pointer',
              }}>{t('auth.back')}</button>
              <button type="submit" disabled={loading} style={{
                flex: 2, padding: '11px', borderRadius: 7, border: 'none', background: 'var(--accent)',
                color: '#fff', fontSize: 13, fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.6 : 1, fontFamily: MO,
              }}>{loading ? t('auth.creating') : t('auth.launch')}</button>
            </div>
          </>}

          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--tx-d)' }}>
            {t('auth.have_account')} <a href="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>{t('auth.signin_link')}</a>
          </div>
        </form>
      </div>
    </div>
  )
}
