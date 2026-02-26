'use client'
import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useData } from '@/components/data-provider'
import { useLang } from '@/components/lang-provider'
import { useTheme } from '@/components/theme-provider'
import { LANGS } from '@/lib/i18n'
import { C, MO, SA, I, Av, ini, Toast } from '@/components/ui'

const NAV = [
  { id: '/dashboard', k: 'nav.dashboard', i: 'home' },
  { id: '/dashboard/employees', k: 'nav.employees', i: 'users' },
  { id: '/dashboard/locations', k: 'nav.locations', i: 'mapPin' },
  { id: '/dashboard/scheduling', k: 'nav.scheduling', i: 'clock', mod: 'shifts' },
  { id: '/dashboard/leave', k: 'nav.leave', i: 'calendar', mod: 'leave' },
  { id: '/dashboard/analytics', k: 'nav.analytics', i: 'chart', mod: 'analytics' },
  { id: '/dashboard/performance', k: 'nav.performance', i: 'star', mod: 'performance' },
  { id: '/dashboard/workflows', k: 'nav.workflows', i: 'zap', mod: 'workflows' },
  { id: '/dashboard/policies', k: 'nav.policies', i: 'file', mod: 'policies' },
  { id: '_div' },
  { id: '/dashboard/settings', k: 'nav.settings', i: 'settings' },
]

function useTypewriter(words) {
  const [text, setText] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const current = words[wordIdx]
    if (!isDeleting && text === current) ref.current = setTimeout(() => setIsDeleting(true), 3000)
    else if (isDeleting && text === '') ref.current = setTimeout(() => { setWordIdx((wordIdx + 1) % words.length); setIsDeleting(false) }, 300)
    else ref.current = setTimeout(() => setText(isDeleting ? current.slice(0, text.length - 1) : current.slice(0, text.length + 1)), isDeleting ? 50 : 80)
    return () => clearTimeout(ref.current)
  }, [text, isDeleting, wordIdx, words])
  return text
}

export default function DashboardShell({ children }) {
  const { tenant, profile, toast, ana, signOut, loading } = useData()
  const { t, lang, setLang } = useLang()
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const [langOpen, setLangOpen] = useState(false)
  const mods = tenant.enabled_modules || []
  const items = NAV.filter(it => !it.mod || mods.includes(it.mod))
  const currentLang = LANGS.find(l => l.code === lang)
  const brandText = useTypewriter(['People Operating System', 'pplos.io'])

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', color: 'var(--tx)', fontFamily: SA, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <img src="/logo.png" alt="People.OS" style={{ height: 32, marginBottom: 12 }} />
        <div style={{ fontFamily: MO, fontSize: 20, fontWeight: 700, color: 'var(--accent)', marginBottom: 12 }}>People.OS</div>
        <div style={{ fontSize: 12, color: 'var(--tx-d)' }}>{t('common.loading')}</div>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', color: 'var(--tx)', fontFamily: SA, fontSize: 13, overflow: 'hidden', transition: 'background 0.3s, color 0.3s' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: 'var(--bg-s)', borderRight: '1px solid var(--bd)', display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'background 0.3s' }}>
        <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid var(--bd-s)' }}>
          {/* Brand with typewriter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <img src="/logo.png" alt="People.OS" style={{ height: 20, objectFit: 'contain' }} />
            <span style={{ fontFamily: MO, fontSize: 9, fontWeight: 700, color: 'var(--accent)', minWidth: 90, whiteSpace: 'nowrap' }}>
              {brandText}<span className="typewriter-cursor" style={{ height: '0.9em' }} />
            </span>
          </div>
          {/* Tenant selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 9px', background: 'var(--bg-c)', borderRadius: 7, border: '1px solid var(--bd-s)' }}>
            <div style={{ width: 22, height: 22, borderRadius: 5, background: 'var(--accent-dim)', display: 'grid', placeItems: 'center', fontFamily: MO, fontSize: 9, fontWeight: 800, color: 'var(--accent)' }}>{ini(tenant.name)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600 }}>{tenant.name}</div>
              <div style={{ fontSize: 9, color: 'var(--tx-d)' }}>{tenant.plan}</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '8px 6px', overflowY: 'auto' }}>
          {items.map((it, i) => it.id === '_div'
            ? <div key={i} style={{ height: 1, background: 'var(--bd-s)', margin: '6px 8px' }} />
            : <button key={it.id} onClick={() => router.push(it.id)} style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px',
                border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: SA,
                background: pathname === it.id ? 'var(--accent-dim)' : 'transparent',
                color: pathname === it.id ? 'var(--accent)' : 'var(--tx-m)', marginBottom: 1,
                transition: 'background 0.15s, color 0.15s',
              }}>
                <I n={it.i} s={15} c={pathname === it.id ? 'var(--accent)' : 'var(--tx-d)'} />
                {t(it.k)}
                {it.id === '/dashboard/leave' && ana.pLeaves > 0 && (
                  <span style={{ marginLeft: 'auto', fontFamily: MO, fontSize: 8, background: 'rgba(251,191,36,0.08)', color: 'var(--am)', padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>{ana.pLeaves}</span>
                )}
              </button>
          )}
        </nav>
        {/* Footer */}
        <div style={{ padding: '10px 12px', borderTop: '1px solid var(--bd-s)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Av name={profile.full_name || 'Admin'} size={24} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 500 }}>{profile.full_name || 'Admin'}</div>
              <div style={{ fontSize: 9, color: 'var(--tx-d)' }}>{profile.role}</div>
            </div>
          </div>
          {/* Theme toggle */}
          <button onClick={toggleTheme} style={{
            display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '6px 8px',
            border: '1px solid var(--bd-s)', borderRadius: 5, cursor: 'pointer', fontSize: 11, fontWeight: 500,
            background: 'var(--bg-c)', color: 'var(--tx-m)', fontFamily: SA, marginBottom: 6,
            transition: 'background 0.2s',
          }}>
            <I n={theme === 'dark' ? 'sun' : 'moon'} s={13} c="var(--tx-d)" />
            <span style={{ flex: 1, textAlign: 'left' }}>{theme === 'dark' ? t('theme.light') : t('theme.dark')}</span>
          </button>
          {/* Language selector */}
          <div style={{ position: 'relative', marginBottom: 6 }}>
            <button onClick={() => setLangOpen(!langOpen)} style={{
              display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '6px 8px',
              border: '1px solid var(--bd-s)', borderRadius: 5, cursor: 'pointer', fontSize: 11, fontWeight: 500,
              background: 'var(--bg-c)', color: 'var(--tx-m)', fontFamily: SA,
            }}>
              <span>{currentLang?.flag}</span>
              <span style={{ flex: 1, textAlign: 'left' }}>{currentLang?.label}</span>
              <span style={{ fontSize: 8, color: 'var(--tx-d)' }}>▼</span>
            </button>
            {langOpen && (
              <div style={{ position: 'absolute', bottom: '100%', left: 0, width: '100%', background: 'var(--bg-c)', border: '1px solid var(--bd)', borderRadius: 7, marginBottom: 4, overflow: 'hidden', zIndex: 100 }}>
                {LANGS.map(l => (
                  <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '7px 10px', border: 'none', cursor: 'pointer', fontSize: 11,
                      background: lang === l.code ? 'var(--accent-dim)' : 'transparent', color: lang === l.code ? 'var(--accent)' : 'var(--tx-m)', fontFamily: SA, fontWeight: lang === l.code ? 600 : 400 }}>
                    <span>{l.flag}</span> {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={signOut} style={{
            display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '6px 8px',
            border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 11, fontWeight: 500,
            background: 'transparent', color: 'var(--tx-d)', fontFamily: SA,
          }}>
            <I n="logout" s={13} c="var(--tx-d)" /> {t('nav.signout')}
          </button>
        </div>
      </aside>
      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '10px 24px', borderBottom: '1px solid var(--bd-s)', flexShrink: 0, background: 'var(--bg-s)', transition: 'background 0.3s' }}>
          <div style={{ fontFamily: MO, fontSize: 10, color: 'var(--tx-d)', padding: '4px 8px', background: 'var(--bg-c)', borderRadius: 5, border: '1px solid var(--bd-s)' }}>
            {tenant.slug}.peopleos.io
          </div>
        </header>
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>{children}</div>
      </main>
      <Toast toast={toast} />
    </div>
  )
}
