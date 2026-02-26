'use client'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useData } from '@/components/data-provider'
import { useLang } from '@/components/lang-provider'
import { LANGS } from '@/lib/i18n'
import { C, MO, SA, I, Av, ini, Toast } from '@/components/ui'

const NAV = [
  { id: '/dashboard', k: 'nav.dashboard', i: 'home' },
  { id: '/dashboard/employees', k: 'nav.employees', i: 'users' },
  { id: '/dashboard/scheduling', k: 'nav.scheduling', i: 'clock', mod: 'shifts' },
  { id: '/dashboard/leave', k: 'nav.leave', i: 'calendar', mod: 'leave' },
  { id: '/dashboard/analytics', k: 'nav.analytics', i: 'chart', mod: 'analytics' },
  { id: '/dashboard/performance', k: 'nav.performance', i: 'star', mod: 'performance' },
  { id: '/dashboard/workflows', k: 'nav.workflows', i: 'zap', mod: 'workflows' },
  { id: '/dashboard/policies', k: 'nav.policies', i: 'file', mod: 'policies' },
  { id: '_div' },
  { id: '/dashboard/settings', k: 'nav.settings', i: 'settings' },
]

export default function DashboardShell({ children }) {
  const { tenant, profile, toast, ana, signOut, loading } = useData()
  const { t, lang, setLang } = useLang()
  const pathname = usePathname()
  const router = useRouter()
  const [langOpen, setLangOpen] = useState(false)
  const mods = tenant.enabled_modules || []
  const items = NAV.filter(it => !it.mod || mods.includes(it.mod))
  const currentLang = LANGS.find(l => l.code === lang)

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', background: C.bg, color: C.tx, fontFamily: SA, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: MO, fontSize: 24, fontWeight: 700, color: C.cy, marginBottom: 12 }}>pplos.io://</div>
        <div style={{ fontSize: 12, color: C.txD }}>{t('common.loading')}</div>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', background: C.bg, color: C.tx, fontFamily: SA, fontSize: 13, overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: C.bgS, borderRight: `1px solid ${C.bd}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '16px 14px 12px', borderBottom: `1px solid ${C.bdS}` }}>
          <div style={{ fontFamily: MO, fontSize: 13, fontWeight: 700, color: C.cy }}>pplos.io://</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 8, padding: '7px 9px', background: C.bgC, borderRadius: 7, border: `1px solid ${C.bdS}` }}>
            <div style={{ width: 22, height: 22, borderRadius: 5, background: `${C.cy}18`, display: 'grid', placeItems: 'center', fontFamily: MO, fontSize: 9, fontWeight: 800, color: C.cy }}>{ini(tenant.name)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600 }}>{tenant.name}</div>
              <div style={{ fontSize: 9, color: C.txD }}>{tenant.plan}</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '8px 6px', overflowY: 'auto' }}>
          {items.map((it, i) => it.id === '_div'
            ? <div key={i} style={{ height: 1, background: C.bdS, margin: '6px 8px' }} />
            : <button key={it.id} onClick={() => router.push(it.id)} style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px',
                border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: SA,
                background: pathname === it.id ? C.cyD : 'transparent',
                color: pathname === it.id ? C.cy : C.txM, marginBottom: 1,
              }}>
                <I n={it.i} s={15} c={pathname === it.id ? C.cy : C.txD} />
                {t(it.k)}
                {it.id === '/dashboard/leave' && ana.pLeaves > 0 && (
                  <span style={{ marginLeft: 'auto', fontFamily: MO, fontSize: 8, background: C.amD, color: C.am, padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>{ana.pLeaves}</span>
                )}
              </button>
          )}
        </nav>
        {/* Footer: user + language + signout */}
        <div style={{ padding: '10px 12px', borderTop: `1px solid ${C.bdS}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Av name={profile.full_name || 'Admin'} size={24} color={C.gn} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 500 }}>{profile.full_name || 'Admin'}</div>
              <div style={{ fontSize: 9, color: C.txD }}>{profile.role}</div>
            </div>
          </div>
          {/* Language selector */}
          <div style={{ position: 'relative', marginBottom: 6 }}>
            <button onClick={() => setLangOpen(!langOpen)} style={{
              display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '6px 8px',
              border: `1px solid ${C.bdS}`, borderRadius: 5, cursor: 'pointer', fontSize: 11, fontWeight: 500,
              background: C.bgC, color: C.txM, fontFamily: SA,
            }}>
              <span>{currentLang?.flag}</span>
              <span style={{ flex: 1, textAlign: 'left' }}>{currentLang?.label}</span>
              <span style={{ fontSize: 8, color: C.txD }}>▼</span>
            </button>
            {langOpen && (
              <div style={{ position: 'absolute', bottom: '100%', left: 0, width: '100%', background: C.bgC, border: `1px solid ${C.bd}`, borderRadius: 7, marginBottom: 4, overflow: 'hidden', zIndex: 100 }}>
                {LANGS.map(l => (
                  <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '7px 10px', border: 'none', cursor: 'pointer', fontSize: 11,
                      background: lang === l.code ? C.cyD : 'transparent', color: lang === l.code ? C.cy : C.txM, fontFamily: SA, fontWeight: lang === l.code ? 600 : 400 }}>
                    <span>{l.flag}</span> {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={signOut} style={{
            display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '6px 8px',
            border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 11, fontWeight: 500,
            background: 'transparent', color: C.txD, fontFamily: SA,
          }}>
            <I n="logout" s={13} c={C.txD} /> {t('nav.signout')}
          </button>
        </div>
      </aside>
      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '10px 24px', borderBottom: `1px solid ${C.bdS}`, flexShrink: 0, background: C.bgS }}>
          <div style={{ fontFamily: MO, fontSize: 10, color: C.txD, padding: '4px 8px', background: C.bgC, borderRadius: 5, border: `1px solid ${C.bdS}` }}>
            {tenant.slug}.pplos.io
          </div>
        </header>
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>{children}</div>
      </main>
      <Toast toast={toast} />
    </div>
  )
}
