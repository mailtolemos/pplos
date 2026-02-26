'use client'
import { useLang } from "@/components/lang-provider"
import { useState, useMemo } from 'react'
import { useData } from '@/components/data-provider'
import { C, MO, SA, I, Bg, Btn, Inp, Av, Tbl, Ety, Modal, Tbs, Stt, DC } from '@/components/ui'

const DAYS = { en: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], pt: ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'], fr: ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'], it: ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'], de: ['Mo','Di','Mi','Do','Fr','Sa','So'] }
const COLORS = ['#b4a0f4','#fbbf24','#e879f9','#fb7185','#34d399','#818cf8','#fb923c','#2dd4bf']

function RuleForm({ locationId, onSave, t }) {
  const [nm, setNm] = useState('')
  const [st, setSt] = useState('09:00')
  const [en, setEn] = useState('17:00')
  const [dw, setDw] = useState([1,2,3,4,5])
  const [mn, setMn] = useState('1')
  const [cl, setCl] = useState(COLORS[0])
  const { lang } = useLang()
  const dayLabels = DAYS[lang] || DAYS.en

  const toggleDay = (d) => setDw(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d].sort())

  return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <Inp label={t('loc.shift_name')} value={nm} onChange={setNm} placeholder="Morning" required />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <Inp label={t('loc.start_time')} value={st} onChange={setSt} type="time" />
      <Inp label={t('loc.end_time')} value={en} onChange={setEn} type="time" />
    </div>
    <div>
      <label style={{ fontSize: 11, color: C.txD, fontWeight: 500, marginBottom: 6, display: 'block' }}>{t('loc.days')}</label>
      <div style={{ display: 'flex', gap: 4 }}>
        {[1,2,3,4,5,6,7].map(d => (
          <button key={d} onClick={() => toggleDay(d)} style={{
            width: 36, height: 30, borderRadius: 6, fontSize: 10, fontWeight: 600, fontFamily: MO,
            border: `1px solid ${dw.includes(d) ? C.cy : C.bd}`,
            background: dw.includes(d) ? C.cyD : 'transparent',
            color: dw.includes(d) ? C.cy : C.txD, cursor: 'pointer',
          }}>{dayLabels[d-1]}</button>
        ))}
      </div>
    </div>
    <Inp label={t('loc.min_staff')} value={mn} onChange={setMn} type="number" />
    <div>
      <label style={{ fontSize: 11, color: C.txD, fontWeight: 500, marginBottom: 6, display: 'block' }}>Color</label>
      <div style={{ display: 'flex', gap: 4 }}>
        {COLORS.map(c => (
          <button key={c} onClick={() => setCl(c)} style={{
            width: 24, height: 24, borderRadius: 6, background: c, border: cl === c ? '2px solid white' : '2px solid transparent',
            cursor: 'pointer', boxShadow: cl === c ? `0 0 0 1px ${c}` : 'none',
          }} />
        ))}
      </div>
    </div>
    <Btn v="primary" onClick={() => nm && onSave({ location_id: locationId, name: nm, start_time: st, end_time: en, days_of_week: dw, min_employees: Number(mn) || 1, color: cl })} disabled={!nm} style={{ width: '100%', justifyContent: 'center' }}>{t('common.create')}</Btn>
  </div>
}

function LocationDetail({ loc, onBack }) {
  const { t, lang } = useLang()
  const { emps, locs, shiftRules, shifts, addRule, delRule, updEmp, generateSchedule, clearLocationShifts, show } = useData()
  const [tab, setTab] = useState('employees')
  const [ruleModal, setRuleModal] = useState(false)
  const [genModal, setGenModal] = useState(false)
  const [period, setPeriod] = useState('monthly')
  const [workDays, setWorkDays] = useState('5')
  const [generating, setGenerating] = useState(false)
  const dayLabels = DAYS[lang] || DAYS.en

  const locEmps = emps.filter(e => e.location_id === loc.id)
  const locRules = shiftRules.filter(r => r.location_id === loc.id)
  const locShifts = shifts.filter(s => s.location_id === loc.id)
  const unassigned = emps.filter(e => e.status === 'active' && e.location_id !== loc.id)

  const doGenerate = async () => {
    setGenerating(true)
    await generateSchedule(loc.id, period, Number(workDays) || 5)
    setGenerating(false)
    setGenModal(false)
  }

  return <div>
    <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.txD, cursor: 'pointer', fontSize: 11, marginBottom: 16, fontFamily: SA }}>{t('common.back')}</button>

    <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 22, padding: 20, background: C.bgE, border: `1px solid ${C.bd}`, borderRadius: 12 }}>
      <div style={{ width: 48, height: 48, borderRadius: 10, background: C.cyD, display: 'grid', placeItems: 'center' }}><I n="mapPin" s={22} c={C.cy} /></div>
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700 }}>{loc.name}</h1>
        {loc.address && <p style={{ fontSize: 12, color: C.txM, marginTop: 2 }}>{loc.address}</p>}
        <div style={{ display: 'flex', gap: 14, marginTop: 6, fontSize: 10, color: C.txD }}>
          <span>{locEmps.length} {t('loc.employees').toLowerCase()}</span>
          <span>{locRules.length} {t('loc.rules').toLowerCase()}</span>
          <span>{locShifts.length} {t('sched.shift').toLowerCase()}s</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <Btn v="primary" icon="zap" onClick={() => setGenModal(true)}>{t('loc.generate')}</Btn>
      </div>
    </div>

    <Tbs tabs={[
      { id: 'employees', label: t('loc.employees'), count: locEmps.length },
      { id: 'rules', label: t('loc.rules'), count: locRules.length },
      { id: 'shifts', label: t('nav.scheduling'), count: locShifts.length },
    ]} active={tab} onChange={setTab} />

    {/* ─── Employees Tab ─── */}
    {tab === 'employees' && <div>
      {unassigned.length > 0 && <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 11, color: C.txD, fontWeight: 500, marginBottom: 6, display: 'block' }}>{t('loc.assign')}</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {unassigned.map(e => (
            <button key={e.id} onClick={() => updEmp(e.id, { location_id: loc.id })} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 7,
              border: `1px dashed ${C.bd}`, background: 'transparent', cursor: 'pointer', color: C.txM, fontSize: 11, fontFamily: SA
            }}><I n="plus" s={10} c={C.txD} />{e.name}</button>
          ))}
        </div>
      </div>}
      <Tbl cols={[
        { label: t('emp.employee'), render: r => <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Av name={r.name} size={28} color={DC[r.department]} /><div><div style={{ fontWeight: 500, fontSize: 12 }}>{r.name}</div><div style={{ fontSize: 10, color: C.txD }}>{r.role} · {r.department}</div></div></div> },
        { label: t('common.status'), render: r => <Bg v={r.status === 'active' ? 'green' : 'amber'}>{r.status}</Bg> },
        { label: '', render: r => <Btn v="ghost" sz="xs" icon="x" onClick={() => updEmp(r.id, { location_id: null })}>{t('common.del')}</Btn> },
      ]} data={locEmps} empty={<Ety icon="users" message={t('emp.no_employees')} />} />
    </div>}

    {/* ─── Rules Tab ─── */}
    {tab === 'rules' && <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <Btn v="primary" sz="sm" icon="plus" onClick={() => setRuleModal(true)}>{t('loc.add_rule')}</Btn>
      </div>
      {locRules.length === 0 ? <Ety icon="clock" message={t('loc.no_rules')} action={t('loc.add_rule')} onAction={() => setRuleModal(true)} /> :
        <div style={{ display: 'grid', gap: 8 }}>
          {locRules.map(r => {
            const [sh, sm] = (r.start_time || '09:00').split(':').map(Number)
            const [eh, em] = (r.end_time || '17:00').split(':').map(Number)
            let hours = (eh + em / 60) - (sh + sm / 60)
            if (hours <= 0) hours += 24
            return <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: C.bgE, border: `1px solid ${C.bd}`, borderRadius: 10 }}>
              <div style={{ width: 8, height: 36, borderRadius: 4, background: r.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: C.txD, fontFamily: MO, marginTop: 2 }}>
                  {r.start_time}–{r.end_time} · {Math.round(hours)}h · {r.min_employees} {t('loc.min_staff').toLowerCase()}
                </div>
                <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
                  {[1,2,3,4,5,6,7].map(d => (
                    <span key={d} style={{ fontSize: 9, fontFamily: MO, fontWeight: 600, padding: '1px 4px', borderRadius: 3, background: r.days_of_week?.includes(d) ? `${r.color}20` : 'transparent', color: r.days_of_week?.includes(d) ? r.color : C.txD }}>
                      {dayLabels[d-1]}
                    </span>
                  ))}
                </div>
              </div>
              <Btn v="danger" sz="xs" icon="trash" onClick={() => delRule(r.id)}>{t('common.del')}</Btn>
            </div>
          })}
        </div>}
      <Modal open={ruleModal} onClose={() => setRuleModal(false)} title={t('loc.add_rule')}>
        <RuleForm locationId={loc.id} onSave={async d => { await addRule(d); setRuleModal(false) }} t={t} />
      </Modal>
    </div>}

    {/* ─── Shifts Tab ─── */}
    {tab === 'shifts' && <div>
      {locShifts.length > 0 && <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <Btn v="danger" sz="sm" icon="trash" onClick={() => clearLocationShifts(loc.id)}>Clear all</Btn>
      </div>}
      <Tbl cols={[
        { label: t('sched.date'), render: r => <span style={{ fontFamily: MO, fontSize: 11 }}>{r.date}</span> },
        { label: t('emp.employee'), render: r => <span style={{ fontWeight: 500 }}>{r.employee_name}</span> },
        { label: t('sched.shift'), render: r => <Bg s={{ background: `${r.color}15`, color: r.color, border: `1px solid ${r.color}30` }}>{r.template}</Bg> },
        { label: t('sched.hours'), render: r => <span style={{ fontFamily: MO, fontSize: 11 }}>{r.time_range}</span> },
      ]} data={locShifts.slice(0, 200)} empty={<Ety icon="calendar" message={t('loc.no_rules')} action={t('loc.generate')} onAction={() => setGenModal(true)} />} />
      {locShifts.length > 200 && <div style={{ textAlign: 'center', color: C.txD, fontSize: 11, marginTop: 8 }}>+{locShifts.length - 200} more...</div>}
    </div>}

    {/* ─── Generate Modal ─── */}
    <Modal open={genModal} onClose={() => setGenModal(false)} title={t('loc.generate')} w={420}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ padding: 14, background: C.bgE, borderRadius: 8, border: `1px solid ${C.bd}` }}>
          <div style={{ fontSize: 11, color: C.txD, marginBottom: 6 }}>{t('loc.location')}</div>
          <div style={{ fontWeight: 600 }}>{loc.name}</div>
          <div style={{ fontSize: 11, color: C.txD, marginTop: 4 }}>
            {locEmps.length} {t('loc.employees').toLowerCase()} · {locRules.length} {t('loc.rules').toLowerCase()}
          </div>
        </div>
        <Inp label={t('loc.period')} value={period} onChange={setPeriod} options={[
          { value: 'monthly', label: t('loc.monthly') },
          { value: 'quarterly', label: t('loc.quarterly') },
          { value: 'yearly', label: t('loc.yearly') },
        ]} />
        <Inp label={t('loc.days_week')} value={workDays} onChange={setWorkDays} type="number" />
        <Btn v="primary" onClick={doGenerate} disabled={generating || !locEmps.length || !locRules.length} style={{ width: '100%', justifyContent: 'center' }}>
          {generating ? t('loc.generating') : t('loc.generate')}
        </Btn>
        {(!locEmps.length || !locRules.length) && <div style={{ fontSize: 11, color: C.rs, textAlign: 'center' }}>
          {!locEmps.length ? t('emp.no_employees') : t('loc.no_rules')}
        </div>}
      </div>
    </Modal>
  </div>
}

function LocForm({ onSave, t }) {
  const [nm, setNm] = useState('')
  const [ad, setAd] = useState('')
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <Inp label={t('loc.name')} value={nm} onChange={setNm} placeholder="Lisbon HQ" required />
    <Inp label={t('loc.address')} value={ad} onChange={setAd} placeholder="Rua Augusta 123, Lisboa" />
    <Btn v="primary" onClick={() => nm && onSave({ name: nm, address: ad })} disabled={!nm} style={{ width: '100%', justifyContent: 'center' }}>{t('common.create')}</Btn>
  </div>
}

export default function LocationsPage() {
  const { locs, emps, shiftRules, shifts, addLoc, delLoc } = useData()
  const { t } = useLang()
  const [selId, setSelId] = useState(null)
  const [modal, setModal] = useState(false)
  const selLoc = locs.find(l => l.id === selId)

  if (selLoc) return <LocationDetail loc={selLoc} onBack={() => setSelId(null)} />

  return <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700 }}>{t('loc.title')}</h1>
      <Btn v="primary" icon="plus" onClick={() => setModal(true)}>{t('common.add')}</Btn>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280, 1fr))', gap: 12 }}>
      {locs.map(loc => {
        const le = emps.filter(e => e.location_id === loc.id).length
        const lr = shiftRules.filter(r => r.location_id === loc.id).length
        const ls = shifts.filter(s => s.location_id === loc.id).length
        return <div key={loc.id} onClick={() => setSelId(loc.id)} style={{
          padding: 18, background: C.bgE, border: `1px solid ${C.bd}`, borderRadius: 12,
          cursor: 'pointer', transition: 'border-color 0.15s',
        }} onMouseEnter={e => e.currentTarget.style.borderColor = C.cy} onMouseLeave={e => e.currentTarget.style.borderColor = C.bd}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: C.cyD, display: 'grid', placeItems: 'center' }}><I n="mapPin" s={18} c={C.cy} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{loc.name}</div>
              {loc.address && <div style={{ fontSize: 10, color: C.txD, marginTop: 1 }}>{loc.address}</div>}
            </div>
            <Btn v="danger" sz="xs" icon="trash" onClick={e => { e.stopPropagation(); delLoc(loc.id) }} />
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 10, color: C.txD }}>
            <span><strong style={{ color: C.txM }}>{le}</strong> {t('loc.employees').toLowerCase()}</span>
            <span><strong style={{ color: C.txM }}>{lr}</strong> {t('loc.rules').toLowerCase()}</span>
            <span><strong style={{ color: C.txM }}>{ls}</strong> shifts</span>
          </div>
        </div>
      })}
    </div>
    {!locs.length && <Ety icon="mapPin" message={t('loc.no_locations')} action={t('common.add')} onAction={() => setModal(true)} />}
    <Modal open={modal} onClose={() => setModal(false)} title={t('loc.add')}>
      <LocForm onSave={async d => { await addLoc(d); setModal(false) }} t={t} />
    </Modal>
  </div>
}
