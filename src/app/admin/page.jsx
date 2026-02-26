'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/theme-provider'

const MO = "'JetBrains Mono',monospace"
const SA = "'Instrument Sans',-apple-system,sans-serif"

function I({ n, s = 16, c = 'currentColor' }) {
  const paths = {
    building: <><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/></>,
    users: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    edit: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    home: <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    sun: <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/></>,
    moon: <><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></>,
    check: <><polyline points="20 6 9 17 4 12"/></>,
    login: <><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></>,
  }
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>{paths[n]}</svg>
}

export default function AdminPage() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [tenants, setTenants] = useState([])
  const [profiles, setProfiles] = useState([])
  const [empCounts, setEmpCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('tenants')
  const [modal, setModal] = useState(null) // 'create' | { type: 'edit', tenant }
  const [toast, setToast] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', plan: 'growth', email: '', password: '', fullName: '', status: 'active' })

  const show = useCallback((msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }, [])

  useEffect(() => {
    fetch('/api/admin').then(r => r.json()).then(data => {
      if (data.error) { show(data.error, 'error'); return }
      setTenants(data.tenants || [])
      setProfiles(data.profiles || [])
      setEmpCounts(data.empCounts || {})
      setLoading(false)
    }).catch(() => { show('Failed to load', 'error'); setLoading(false) })
  }, [])

  async function apiPost(body) {
    const res = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    return res.json()
  }

  async function createTenant() {
    const { name, slug, plan, email, password, fullName } = form
    if (!name || !slug || !email || !password || !fullName) { show('Fill all fields', 'error'); return }
    setSubmitting(true)
    try {
      const data = await apiPost({ action: 'create', name, slug, plan, email, password, fullName })
      setSubmitting(false)
      if (data.error) { show(data.error, 'error'); return }
      setTenants(p => [data.tenant, ...p])
      if (data.profile) setProfiles(p => [data.profile, ...p])
      setModal(null)
      setForm({ name: '', slug: '', plan: 'growth', email: '', password: '', fullName: '', status: 'active' })
      show(`${name} created`)
    } catch (e) { setSubmitting(false); show(e.message || 'Failed', 'error') }
  }

  async function updateTenant(id, updates) {
    const data = await apiPost({ action: 'update', id, updates })
    if (data.error) { show(data.error, 'error'); return }
    setTenants(p => p.map(t => t.id === id ? data.tenant : t))
    show('Updated')
    return data.tenant
  }

  async function saveTenantEdit() {
    if (!modal?.tenant) return
    setSubmitting(true)
    const t = await updateTenant(modal.tenant.id, { name: form.name, slug: form.slug, plan: form.plan, status: form.status })
    setSubmitting(false)
    if (t) setModal(null)
  }

  async function deleteTenant(id) {
    if (!confirm('Delete this tenant and ALL its data? This cannot be undone.')) return
    const data = await apiPost({ action: 'delete', id })
    if (data.error) { show(data.error, 'error'); return }
    setTenants(p => p.filter(t => t.id !== id))
    setProfiles(p => p.filter(pr => pr.tenant_id !== id))
    show('Deleted')
  }

  async function jumpInto(tenantId) {
    show('Switching...', 'success')
    const res = await fetch('/api/admin/impersonate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant_id: tenantId }),
    })
    const data = await res.json()
    if (data.error) { show(data.error, 'error'); return }
    window.location.href = '/dashboard'
  }

  function openEdit(t) {
    setForm({ name: t.name, slug: t.slug, plan: t.plan, status: t.status || 'active', email: '', password: '', fullName: '' })
    setModal({ type: 'edit', tenant: t })
  }

  const stats = useMemo(() => ({
    tenants: tenants.length,
    active: tenants.filter(t => t.status === 'active').length,
    users: profiles.length,
    employees: Object.values(empCounts).reduce((a, b) => a + b, 0),
  }), [tenants, profiles, empCounts])

  const getTenantName = (tid) => tenants.find(t => t.id === tid)?.name || '—'

  const input = { padding: '10px 12px', borderRadius: 7, border: '1px solid var(--bd)', background: 'var(--bg-e)', color: 'var(--tx)', fontSize: 13, outline: 'none', fontFamily: SA, width: '100%' }
  const statBox = (label, value, icon) => (
    <div style={{ background: 'var(--bg-e)', border: '1px solid var(--bd)', borderRadius: 10, padding: '16px 18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 10, color: 'var(--tx-d)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
        <I n={icon} s={14} c="var(--tx-d)" />
      </div>
      <span style={{ fontFamily: MO, fontSize: 24, fontWeight: 700, letterSpacing: '-0.04em' }}>{value}</span>
    </div>
  )

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', alignItems: 'center', justifyContent: 'center', fontFamily: SA }}>
      <div style={{ textAlign: 'center' }}>
        <img src="/logo.png" alt="People.OS" style={{ height: 32, marginBottom: 12 }} />
        <div style={{ fontFamily: MO, fontSize: 14, color: 'var(--accent)' }}>Loading admin panel...</div>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', color: 'var(--tx)', fontFamily: SA, fontSize: 13, overflow: 'hidden', transition: 'background 0.3s' }}>
      <aside style={{ width: 220, background: 'var(--bg-s)', borderRight: '1px solid var(--bd)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid var(--bd-s)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <img src="/logo.png" alt="People.OS" style={{ height: 20 }} />
            <span style={{ fontFamily: MO, fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>Super Admin</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 9px', background: 'var(--bg-c)', borderRadius: 7, border: '1px solid var(--bd-s)' }}>
            <I n="shield" s={14} c="var(--accent)" />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)' }}>Platform Admin</span>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '8px 6px' }}>
          {[{ id: 'tenants', label: 'Companies', icon: 'building' }, { id: 'users', label: 'Users', icon: 'users' }].map(item => (
            <button key={item.id} onClick={() => setTab(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px',
              border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: SA,
              background: tab === item.id ? 'var(--accent-dim)' : 'transparent',
              color: tab === item.id ? 'var(--accent)' : 'var(--tx-m)', marginBottom: 1,
            }}>
              <I n={item.icon} s={15} c={tab === item.id ? 'var(--accent)' : 'var(--tx-d)'} /> {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '10px 12px', borderTop: '1px solid var(--bd-s)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '6px 8px', border: '1px solid var(--bd-s)', borderRadius: 5, cursor: 'pointer', fontSize: 11, background: 'var(--bg-c)', color: 'var(--tx-m)', fontFamily: SA }}>
            <I n={theme === 'dark' ? 'sun' : 'moon'} s={13} c="var(--tx-d)" />
            <span style={{ flex: 1, textAlign: 'left' }}>{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
          </button>
          <button onClick={() => router.push('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '6px 8px', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 11, background: 'transparent', color: 'var(--tx-d)', fontFamily: SA }}>
            <I n="home" s={13} c="var(--tx-d)" /> Back to Dashboard
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {statBox('Companies', stats.tenants, 'building')}
          {statBox('Active', stats.active, 'check')}
          {statBox('Users', stats.users, 'users')}
          {statBox('Employees', stats.employees, 'users')}
        </div>

        {tab === 'tenants' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700 }}>Companies</h1>
              <button onClick={() => { setForm({ name: '', slug: '', plan: 'growth', email: '', password: '', fullName: '', status: 'active' }); setModal('create') }} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: MO, fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 7, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer' }}>
                <I n="plus" s={14} c="#fff" /> New Company
              </button>
            </div>
            <div style={{ border: '1px solid var(--bd)', borderRadius: 10, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead><tr style={{ background: 'var(--bg-e)', borderBottom: '1px solid var(--bd)' }}>
                  {['Company', 'Slug', 'Plan', 'Status', 'Employees', 'Created', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--tx-d)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {tenants.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--bd-s)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 500 }}>{t.name}</td>
                      <td style={{ padding: '10px 14px', fontFamily: MO, fontSize: 11, color: 'var(--accent)' }}>{t.slug}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontFamily: MO, fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 5, background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>{t.plan}</span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          fontFamily: MO, fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 5,
                          background: t.status === 'active' ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.08)',
                          color: t.status === 'active' ? 'var(--gn)' : 'var(--am)',
                          border: `1px solid ${t.status === 'active' ? 'rgba(52,211,153,0.18)' : 'rgba(251,191,36,0.18)'}`,
                        }}>{t.status || 'active'}</span>
                      </td>
                      <td style={{ padding: '10px 14px', fontFamily: MO, fontWeight: 600 }}>{empCounts[t.id] || 0}</td>
                      <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--tx-d)', fontFamily: MO }}>{new Date(t.created_at).toLocaleDateString('en-GB')}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => jumpInto(t.id)} title="Jump into dashboard" style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--accent)', fontFamily: MO, fontWeight: 600 }}>
                            <I n="login" s={11} c="var(--accent)" /> Enter
                          </button>
                          <button onClick={() => openEdit(t)} style={{ background: 'rgba(128,128,128,0.06)', border: '1px solid var(--bd)', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--tx-m)', fontFamily: MO }}>
                            <I n="edit" s={11} c="var(--tx-d)" /> Edit
                          </button>
                          <button onClick={() => deleteTenant(t.id)} style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.18)', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--rs)', fontFamily: MO }}>
                            <I n="trash" s={11} c="var(--rs)" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Users</h1>
            <div style={{ border: '1px solid var(--bd)', borderRadius: 10, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead><tr style={{ background: 'var(--bg-e)', borderBottom: '1px solid var(--bd)' }}>
                  {['User', 'Role', 'Company', 'Created'].map(h => (
                    <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--tx-d)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {profiles.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--bd-s)' }}>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 500 }}>{p.full_name || '—'}</div>
                        <div style={{ fontSize: 10, color: 'var(--tx-d)', fontFamily: MO }}>{p.id.slice(0, 8)}...</div>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontFamily: MO, fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 5, background: p.role === 'admin' ? 'var(--accent-dim)' : 'rgba(128,128,128,0.06)', color: p.role === 'admin' ? 'var(--accent)' : 'var(--tx-d)', border: `1px solid ${p.role === 'admin' ? 'var(--accent-border)' : 'var(--bd)'}` }}>{p.role}</span>
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 500 }}>{getTenantName(p.tenant_id)}</td>
                      <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--tx-d)', fontFamily: MO }}>{new Date(p.created_at).toLocaleDateString('en-GB')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ─── Create Modal ─── */}
      {modal === 'create' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }} onClick={() => setModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-c)', border: '1px solid var(--bd)', borderRadius: 14, width: 480, maxWidth: '92vw', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Create Company</h3>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--tx-d)', cursor: 'pointer' }}><I n="x" s={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Company Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 11, color: 'var(--tx-d)', fontWeight: 500 }}>Company Name *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '') })} placeholder="Douro Labs" style={input} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 11, color: 'var(--tx-d)', fontWeight: 500 }}>Slug *</label>
                  <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="douro-labs" style={{ ...input, fontFamily: MO }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 11, color: 'var(--tx-d)', fontWeight: 500 }}>Plan</label>
                <select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })} style={input}>
                  <option value="starter">Starter (€4/user/mo)</option>
                  <option value="growth">Growth (€8/user/mo)</option>
                  <option value="enterprise">Enterprise (custom)</option>
                </select>
              </div>
              <div style={{ height: 1, background: 'var(--bd)', margin: '4px 0' }} />
              <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Admin User</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 11, color: 'var(--tx-d)', fontWeight: 500 }}>Admin Full Name *</label>
                <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="Jane Doe" style={input} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 11, color: 'var(--tx-d)', fontWeight: 500 }}>Admin Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jane@dourolabs.com" style={input} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 11, color: 'var(--tx-d)', fontWeight: 500 }}>Password *</label>
                  <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 6 chars" style={input} />
                </div>
              </div>
              {form.name && <div style={{ fontSize: 11, fontFamily: MO, color: 'var(--tx-d)' }}>Workspace: <span style={{ color: 'var(--accent)' }}>{form.slug}.pplos.io</span></div>}
              <button onClick={createTenant} disabled={submitting} style={{
                padding: '11px', borderRadius: 7, border: 'none', background: 'var(--accent)', color: '#fff',
                fontSize: 13, fontWeight: 600, cursor: submitting ? 'wait' : 'pointer', fontFamily: MO, marginTop: 4,
                opacity: submitting ? 0.6 : 1,
              }}>{submitting ? 'Creating...' : 'Create Company & Admin 🚀'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Edit Modal ─── */}
      {modal?.type === 'edit' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }} onClick={() => setModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-c)', border: '1px solid var(--bd)', borderRadius: 14, width: 460, maxWidth: '92vw', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Edit Company</h3>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--tx-d)', cursor: 'pointer' }}><I n="x" s={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 11, color: 'var(--tx-d)', fontWeight: 500 }}>Company Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={input} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 11, color: 'var(--tx-d)', fontWeight: 500 }}>Slug</label>
                <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} style={{ ...input, fontFamily: MO }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 11, color: 'var(--tx-d)', fontWeight: 500 }}>Plan</label>
                  <select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })} style={input}>
                    <option value="starter">Starter</option>
                    <option value="growth">Growth</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 11, color: 'var(--tx-d)', fontWeight: 500 }}>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={input}>
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="suspended">Suspended</option>
                    <option value="churned">Churned</option>
                  </select>
                </div>
              </div>
              <div style={{ fontSize: 11, fontFamily: MO, color: 'var(--tx-d)' }}>Workspace: <span style={{ color: 'var(--accent)' }}>{form.slug}.pplos.io</span></div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={saveTenantEdit} disabled={submitting} style={{
                  flex: 1, padding: '11px', borderRadius: 7, border: 'none', background: 'var(--accent)', color: '#fff',
                  fontSize: 13, fontWeight: 600, cursor: submitting ? 'wait' : 'pointer', fontFamily: MO, opacity: submitting ? 0.6 : 1,
                }}>{submitting ? 'Saving...' : 'Save Changes'}</button>
                <button onClick={() => jumpInto(modal.tenant.id)} style={{
                  padding: '11px 18px', borderRadius: 7, border: '1px solid var(--accent-border)', background: 'var(--accent-dim)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: MO, color: 'var(--accent)',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}><I n="login" s={14} c="var(--accent)" /> Enter</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000, background: 'var(--bg-c)', border: `1px solid ${toast.type === 'success' ? 'rgba(52,211,153,0.3)' : 'rgba(251,113,133,0.3)'}`, borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <I n={toast.type === 'success' ? 'check' : 'x'} s={14} c={toast.type === 'success' ? 'var(--gn)' : 'var(--rs)'} />
          <span style={{ fontSize: 12, fontWeight: 500 }}>{toast.msg}</span>
        </div>
      )}
    </div>
  )
}
