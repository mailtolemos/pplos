'use client'
import { useLang } from "@/components/lang-provider"
import { useState } from 'react'
import { useData } from '@/components/data-provider'
import { C, MO, SA, I, Bg, Btn, Inp, Tbs, Tog, MODS } from '@/components/ui'
import { PALETTE, DEFAULTS } from '@/lib/config'

function DeptEditor({ departments, colors, onChange }) {
  const [newDept, setNewDept] = useState('')
  const add = () => {
    if (!newDept.trim() || departments.includes(newDept.trim())) return
    const d = newDept.trim()
    const c = PALETTE[departments.length % PALETTE.length]
    onChange([...departments, d], { ...colors, [d]: c })
    setNewDept('')
  }
  const remove = (dept) => {
    const nc = { ...colors }; delete nc[dept]
    onChange(departments.filter(d => d !== dept), nc)
  }
  const rename = (old, val) => {
    const nc = { ...colors }; nc[val] = nc[old]; delete nc[old]
    onChange(departments.map(d => d === old ? val : d), nc)
  }
  const setColor = (dept, color) => onChange(departments, { ...colors, [dept]: color })

  return <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    {departments.map((d, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: C.bgE, borderRadius: 7, border: `1px solid ${C.bd}` }}>
        <div style={{ position: 'relative' }}>
          <input type="color" value={colors[d] || PALETTE[i % PALETTE.length]} onChange={e => setColor(d, e.target.value)}
            style={{ width: 24, height: 24, border: 'none', borderRadius: 5, cursor: 'pointer', padding: 0, background: 'none' }} />
        </div>
        <input value={d} onChange={e => rename(d, e.target.value)}
          style={{ flex: 1, background: 'transparent', border: 'none', color: C.tx, fontSize: 12, fontFamily: SA, outline: 'none', fontWeight: 500 }} />
        <button onClick={() => remove(d)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.txD, padding: 2 }}><I n="x" s={12} c={C.txD} /></button>
      </div>
    ))}
    <div style={{ display: 'flex', gap: 6 }}>
      <input value={newDept} onChange={e => setNewDept(e.target.value)} placeholder="New department..."
        onKeyDown={e => e.key === 'Enter' && add()}
        style={{ flex: 1, padding: '6px 10px', borderRadius: 7, border: `1px solid ${C.bd}`, background: C.bgE, color: C.tx, fontSize: 12, fontFamily: SA, outline: 'none' }} />
      <Btn v="primary" sz="xs" icon="plus" onClick={add} disabled={!newDept.trim()}>Add</Btn>
    </div>
  </div>
}

function ListEditor({ items, onChange, placeholder }) {
  const [val, setVal] = useState('')
  const add = () => { if (val.trim() && !items.includes(val.trim())) { onChange([...items, val.trim()]); setVal('') } }
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {items.map((item, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: C.bgE, borderRadius: 6, border: `1px solid ${C.bd}`, fontSize: 11, fontWeight: 500 }}>
          {item}
          <button onClick={() => onChange(items.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.txD, padding: 0, lineHeight: 1 }}><I n="x" s={10} c={C.txD} /></button>
        </span>
      ))}
    </div>
    <div style={{ display: 'flex', gap: 6 }}>
      <input value={val} onChange={e => setVal(e.target.value)} placeholder={placeholder}
        onKeyDown={e => e.key === 'Enter' && add()}
        style={{ flex: 1, padding: '6px 10px', borderRadius: 7, border: `1px solid ${C.bd}`, background: C.bgE, color: C.tx, fontSize: 12, fontFamily: SA, outline: 'none' }} />
      <Btn v="primary" sz="xs" icon="plus" onClick={add} disabled={!val.trim()}>Add</Btn>
    </div>
  </div>
}

function KeyValueEditor({ items, onChange, keyLabel, valLabel }) {
  const [k, setK] = useState('')
  const [v, setV] = useState('')
  const add = () => { if (k.trim() && v.trim()) { onChange([...items, { value: k.trim().toLowerCase().replace(/\s+/g, '_'), label: v.trim() }]); setK(''); setV('') } }
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    {items.map((item, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', background: C.bgE, borderRadius: 7, border: `1px solid ${C.bd}` }}>
        <span style={{ fontFamily: MO, fontSize: 10, color: C.txD, minWidth: 70 }}>{item.value}</span>
        <input value={item.label} onChange={e => onChange(items.map((it, j) => j === i ? { ...it, label: e.target.value } : it))}
          style={{ flex: 1, background: 'transparent', border: 'none', color: C.tx, fontSize: 12, fontFamily: SA, outline: 'none' }} />
        <button onClick={() => onChange(items.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.txD }}><I n="x" s={12} c={C.txD} /></button>
      </div>
    ))}
    <div style={{ display: 'flex', gap: 6 }}>
      <input value={v} onChange={e => { setV(e.target.value); setK(e.target.value.toLowerCase().replace(/\s+/g, '_')) }} placeholder={`New ${valLabel || 'item'}...`}
        onKeyDown={e => e.key === 'Enter' && add()}
        style={{ flex: 1, padding: '6px 10px', borderRadius: 7, border: `1px solid ${C.bd}`, background: C.bgE, color: C.tx, fontSize: 12, fontFamily: SA, outline: 'none' }} />
      <Btn v="primary" sz="xs" icon="plus" onClick={add} disabled={!v.trim()}>Add</Btn>
    </div>
  </div>
}

export default function SettingsPage() {
  const { tenant, emps, updTenant, cfg } = useData()
  const { t } = useLang()
  const [tab, setTab] = useState('general')
  const [ek, setEk] = useState(null)
  const [ev, setEv] = useState('')
  const [saving, setSaving] = useState(false)

  // Local config state for editing
  const [localCfg, setLocalCfg] = useState(null)
  const c = localCfg || cfg

  const startEdit = () => { if (!localCfg) setLocalCfg({ ...cfg }) }
  const updateCfg = (key, val) => { startEdit(); setLocalCfg(p => ({ ...(p || cfg), [key]: val })) }
  const hasChanges = localCfg !== null

  const saveConfig = async () => {
    setSaving(true)
    await updTenant({ config: localCfg })
    setLocalCfg(null)
    setSaving(false)
  }
  const resetConfig = () => setLocalCfg(null)

  return <div>
    <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>{t('set.title')}</h1>
    <Tbs tabs={[
      { id: 'general', label: t('set.general') },
      { id: 'customize', label: 'Customize' },
      { id: 'modules', label: t('set.modules') },
      { id: 'billing', label: t('set.billing') },
    ]} active={tab} onChange={setTab} />

    {tab === 'general' && <div style={{ background: C.bgE, border: `1px solid ${C.bd}`, borderRadius: 10, padding: 20, maxWidth: 520 }}>
      {[['name', t('set.company'), tenant.name], ['slug', t('set.subdomain'), tenant.slug], ['plan', t('set.plan'), tenant.plan]].map(([k, l, v]) =>
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.bdS}` }}>
          <span style={{ fontSize: 12, color: C.txD }}>{l}</span>
          {ek === k ? <div style={{ display: 'flex', gap: 4 }}>
            <input value={ev} onChange={e => setEv(e.target.value)} autoFocus style={{ padding: '4px 8px', borderRadius: 5, border: `1px solid ${C.cy}`, background: C.bgC, color: C.tx, fontSize: 12, fontFamily: MO, width: 140, outline: 'none' }} />
            <Btn v="primary" sz="xs" onClick={() => { updTenant({ [k]: ev }); setEk(null) }}>{t('set.save')}</Btn>
            <Btn v="ghost" sz="xs" onClick={() => setEk(null)}>✕</Btn>
          </div> : <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 500, fontFamily: MO }}>{v}</span>
            <button onClick={() => { setEk(k); setEv(v) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.txD }}><I n="edit" s={12} /></button>
          </div>}
        </div>)}
    </div>}

    {tab === 'customize' && <div style={{ maxWidth: 600 }}>
      {hasChanges && <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16 }}>
        <Btn v="ghost" sz="sm" onClick={resetConfig}>Discard</Btn>
        <Btn v="primary" sz="sm" icon="check" onClick={saveConfig} disabled={saving}>{saving ? 'Saving...' : 'Save all changes'}</Btn>
      </div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Departments */}
        <div style={{ background: C.bgE, border: `1px solid ${C.bd}`, borderRadius: 10, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div><div style={{ fontSize: 13, fontWeight: 600 }}>Departments</div><div style={{ fontSize: 10, color: C.txD, marginTop: 2 }}>Organize employees by department</div></div>
            <Bg v="dim">{c.departments.length}</Bg>
          </div>
          <DeptEditor departments={c.departments} colors={c.department_colors} onChange={(d, cl) => { updateCfg('departments', d); updateCfg('department_colors', cl) }} />
        </div>

        {/* Leave Types */}
        <div style={{ background: C.bgE, border: `1px solid ${C.bd}`, borderRadius: 10, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div><div style={{ fontSize: 13, fontWeight: 600 }}>Leave Types</div><div style={{ fontSize: 10, color: C.txD, marginTop: 2 }}>Types of leave employees can request</div></div>
            <Bg v="dim">{c.leave_types.length}</Bg>
          </div>
          <ListEditor items={c.leave_types} onChange={v => updateCfg('leave_types', v)} placeholder="New leave type..." />
        </div>

        {/* Job Types */}
        <div style={{ background: C.bgE, border: `1px solid ${C.bd}`, borderRadius: 10, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div><div style={{ fontSize: 13, fontWeight: 600 }}>Employment Types</div><div style={{ fontSize: 10, color: C.txD, marginTop: 2 }}>Contract types for employees</div></div>
            <Bg v="dim">{c.job_types.length}</Bg>
          </div>
          <KeyValueEditor items={c.job_types} onChange={v => updateCfg('job_types', v)} valLabel="type" />
        </div>

        {/* Work Models */}
        <div style={{ background: C.bgE, border: `1px solid ${C.bd}`, borderRadius: 10, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div><div style={{ fontSize: 13, fontWeight: 600 }}>Work Models</div><div style={{ fontSize: 10, color: C.txD, marginTop: 2 }}>Where employees work from</div></div>
            <Bg v="dim">{c.work_models.length}</Bg>
          </div>
          <KeyValueEditor items={c.work_models} onChange={v => updateCfg('work_models', v)} valLabel="model" />
        </div>

        {/* Compensation */}
        <div style={{ background: C.bgE, border: `1px solid ${C.bd}`, borderRadius: 10, padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Compensation</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: C.txD, fontWeight: 500 }}>Currency</label>
              <select value={c.currency} onChange={e => updateCfg('currency', e.target.value)}
                style={{ padding: '8px 10px', borderRadius: 7, border: `1px solid ${C.bd}`, background: C.bgC, color: C.tx, fontSize: 13, fontFamily: MO, outline: 'none' }}>
                {['€', '$', '£', 'R$', 'CHF', '¥', '₹', 'kr', 'zł'].map(cur => <option key={cur} value={cur}>{cur}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: C.txD, fontWeight: 500 }}>Salary months/yr</label>
              <input type="number" value={c.salary_months} onChange={e => updateCfg('salary_months', Number(e.target.value) || 12)}
                style={{ padding: '8px 10px', borderRadius: 7, border: `1px solid ${C.bd}`, background: C.bgC, color: C.tx, fontSize: 13, fontFamily: MO, outline: 'none', width: '100%' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: C.txD, fontWeight: 500 }}>Hours/day</label>
              <input type="number" value={c.work_hours_per_day} onChange={e => updateCfg('work_hours_per_day', Number(e.target.value) || 8)}
                style={{ padding: '8px 10px', borderRadius: 7, border: `1px solid ${C.bd}`, background: C.bgC, color: C.tx, fontSize: 13, fontFamily: MO, outline: 'none', width: '100%' }} />
            </div>
          </div>
        </div>

        {/* Reset to defaults */}
        <div style={{ textAlign: 'center', paddingTop: 8 }}>
          <button onClick={() => { setLocalCfg({ ...DEFAULTS }) }} style={{ background: 'none', border: 'none', color: C.txD, fontSize: 11, cursor: 'pointer', fontFamily: SA, textDecoration: 'underline' }}>
            Reset all to defaults
          </button>
        </div>
      </div>
    </div>}

    {tab === 'modules' && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, maxWidth: 600 }}>
      {MODS.map(m => {
        const mods = tenant.enabled_modules || []
        const on = mods.includes(m.s)
        return <div key={m.s} style={{ background: C.bgE, border: `1px solid ${on ? C.cyB : C.bd}`, borderRadius: 9, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <I n={m.i} s={15} c={on ? C.cy : C.txD} />
            <div><div style={{ fontSize: 12, fontWeight: 500 }}>{m.n}</div>
              {m.a && <div style={{ fontSize: 9, color: C.txD }}>{t('common.always_on')}</div>}</div>
          </div>
          <Tog on={on} onToggle={() => { if (!m.a) updTenant({ enabled_modules: on ? mods.filter(x => x !== m.s) : [...mods, m.s] }) }} disabled={m.a} />
        </div>
      })}
    </div>}

    {tab === 'billing' && <div style={{ background: C.bgE, border: `1px solid ${C.bd}`, borderRadius: 10, padding: 20, maxWidth: 480 }}>
      <Bg v="green" s={{ marginBottom: 8 }}>{tenant.plan}</Bg>
      <div style={{ fontFamily: MO, fontSize: 26, fontWeight: 700, marginTop: 8 }}>
        {c.currency}{tenant.plan === 'starter' ? emps.length * 4 : tenant.plan === 'growth' ? emps.length * 8 : 'custom'}
        <span style={{ fontSize: 12, color: C.txD, fontWeight: 400 }}>/mo</span>
      </div>
      <div style={{ fontSize: 11, color: C.txD, marginTop: 4 }}>{emps.length} × {c.currency}{tenant.plan === 'starter' ? 4 : 8}/user</div>
    </div>}
  </div>
}
