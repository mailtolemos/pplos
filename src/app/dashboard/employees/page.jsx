'use client'
import { useLang } from "@/components/lang-provider"
import { useState, useMemo } from 'react'
import { useData } from '@/components/data-provider'
import { C, MO, SA, I, Bg, Btn, Inp, Av, Tbl, Ety, Modal, Tbs, Stt, DC, SC, DEPTS, ini, isoToday } from '@/components/ui'

function EmpForm({ initial, onSave, onCancel, t, locs }) {
  const [nm,setNm]=useState(initial?.name||'');const[em,setEm]=useState(initial?.email||'');const[rl,setRl]=useState(initial?.role||'');const[dp,setDp]=useState(initial?.department||'Engineering');const[tp,setTp]=useState(initial?.type||'full_time');const[md,setMd]=useState(initial?.work_model||'hybrid');const[hr,setHr]=useState(initial?.hire_date||isoToday());const[sl,setSl]=useState(String(initial?.salary||''));const[sk,setSk]=useState(Array.isArray(initial?.skills)?initial.skills.join(', '):'');const[li,setLi]=useState(initial?.location_id||'')
  return <div style={{display:'flex',flexDirection:'column',gap:12}}>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}><Inp label={t('emp.full_name')} value={nm} onChange={setNm} placeholder="Jane Doe" required/><Inp label={t('common.email')} value={em} onChange={setEm} type="email" placeholder="jane@co.com" required/></div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}><Inp label={t('emp.role')} value={rl} onChange={setRl} placeholder="Engineer" required/><Inp label={t('emp.department')} value={dp} onChange={setDp} options={DEPTS}/></div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}><Inp label={t('common.type')} value={tp} onChange={setTp} options={[{value:'full_time',label:t('emp.full_time')},{value:'part_time',label:t('emp.part_time')},{value:'contract',label:t('emp.contract')}]}/><Inp label={t('emp.model')} value={md} onChange={setMd} options={[{value:'hybrid',label:t('emp.hybrid')},{value:'remote',label:t('emp.remote')},{value:'on_site',label:t('emp.on_site')}]}/><Inp label={t('emp.hire_date')} value={hr} onChange={setHr} type="date"/></div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}><Inp label={t('emp.salary')+' (€/yr)'} value={sl} onChange={setSl} type="number" placeholder="65000"/><Inp label={t('loc.location')} value={li} onChange={setLi} options={[{value:'',label:t('loc.none')},...locs.map(l=>({value:l.id,label:l.name}))]}/></div>
    <Inp label={t('emp.skills')} value={sk} onChange={setSk} placeholder="React, Python"/>
    <div style={{display:'flex',gap:8,marginTop:6}}><Btn v="primary" onClick={()=>nm&&em&&rl&&onSave({name:nm,email:em,role:rl,department:dp,type:tp,work_model:md,hire_date:hr,salary:Number(sl)||0,skills:sk.split(',').map(s=>s.trim()).filter(Boolean),location_id:li||null})} disabled={!nm||!em||!rl} style={{flex:1,justifyContent:'center'}}>{initial?t('common.save_changes'):t('emp.add_employee')}</Btn>{onCancel&&<Btn v="ghost" onClick={onCancel}>{t('common.cancel')}</Btn>}</div>
  </div>
}

function ProfileView({ emp, onBack, t, locs }) {
  const { leaves, shifts, reviews, updEmp, termEmp, delEmp } = useData()
  const [tab, setTab] = useState('overview')
  const [editing, setEditing] = useState(false)
  const dc = DC[emp.department] || C.cy
  const el = leaves.filter(l => l.employee_id === emp.id)
  const es = shifts.filter(s => s.employee_id === emp.id)
  const er = reviews.filter(r => r.employee_id === emp.id)
  const loc = locs.find(l => l.id === emp.location_id)

  if (editing) return <div>
    <button onClick={()=>setEditing(false)} style={{background:'none',border:'none',color:C.txD,cursor:'pointer',fontSize:11,marginBottom:16,fontFamily:SA}}>{t('common.cancel')}</button>
    <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>{t('common.edit')} {emp.name}</h2>
    <EmpForm initial={emp} onSave={async d=>{await updEmp(emp.id,d);setEditing(false)}} onCancel={()=>setEditing(false)} t={t} locs={locs}/>
  </div>

  return <div>
    <button onClick={onBack} style={{background:'none',border:'none',color:C.txD,cursor:'pointer',fontSize:11,marginBottom:16,fontFamily:SA}}>{t('common.back')}</button>
    <div style={{display:'flex',gap:16,alignItems:'center',marginBottom:22,padding:20,background:C.bgE,border:`1px solid ${C.bd}`,borderRadius:12}}>
      <Av name={emp.name} size={48} color={dc}/>
      <div style={{flex:1}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}><h1 style={{fontSize:18,fontWeight:700}}>{emp.name}</h1><Bg v={SC[emp.status]||'dim'}>{(emp.status||'').replace('_',' ')}</Bg></div>
        <p style={{fontSize:12,color:C.txM,marginTop:2}}>{emp.role} · {emp.department}</p>
        <div style={{display:'flex',gap:14,marginTop:6,flexWrap:'wrap',fontSize:10,color:C.txD}}>
          <span><b style={{color:C.txM}}>{t('common.email')}:</b> {emp.email}</span>
          <span><b style={{color:C.txM}}>{t('emp.hired')}:</b> {emp.hire_date}</span>
          <span><b style={{color:C.txM}}>{t('emp.model')}:</b> {(emp.work_model||'').replace('_',' ')}</span>
          {loc && <span><b style={{color:C.txM}}>{t('loc.location')}:</b> {loc.name}</span>}
        </div>
      </div>
      <div style={{display:'flex',gap:6}}>
        <Btn v="ghost" sz="sm" icon="edit" onClick={()=>setEditing(true)}>{t('common.edit')}</Btn>
        {emp.status==='active'&&<Btn v="danger" sz="sm" icon="x" onClick={()=>termEmp(emp.id)}>{t('emp.terminate')}</Btn>}
        <Btn v="danger" sz="sm" icon="trash" onClick={async()=>{await delEmp(emp.id);onBack()}}>{t('common.delete')}</Btn>
      </div>
    </div>
    <Tbs tabs={[{id:'overview',label:t('emp.overview')},{id:'comp',label:t('emp.compensation')},{id:'leave',label:t('nav.leave'),count:el.length},{id:'shifts',label:t('sched.shift')+'s',count:es.length},{id:'reviews',label:t('perf.reviews'),count:er.length}]} active={tab} onChange={setTab}/>
    {tab==='overview'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
      <div style={{background:C.bgE,border:`1px solid ${C.bd}`,borderRadius:10,padding:18}}>
        <h3 style={{fontSize:12,fontWeight:600,marginBottom:12}}>{t('emp.details')}</h3>
        {[[t('common.type'),(emp.type||'').replace('_',' ')],[t('emp.model'),(emp.work_model||'').replace('_',' ')],[t('emp.department'),emp.department],[t('loc.location'),loc?.name||t('loc.none')],[t('emp.hired'),emp.hire_date],[t('emp.salary'),'€'+(emp.salary||0).toLocaleString()]].map(([k,v])=><div key={k} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:`1px solid ${C.bdS}`,fontSize:11}}><span style={{color:C.txD}}>{k}</span><span style={{fontWeight:500}}>{v}</span></div>)}
      </div>
      <div style={{background:C.bgE,border:`1px solid ${C.bd}`,borderRadius:10,padding:18}}>
        <h3 style={{fontSize:12,fontWeight:600,marginBottom:12}}>{t('emp.skills')}</h3>
        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{(emp.skills||[]).length?emp.skills.map(s=><Bg key={s}>{s}</Bg>):<span style={{fontSize:11,color:C.txD}}>{t('emp.none')}</span>}</div>
      </div>
    </div>}
    {tab==='comp'&&<div style={{background:C.bgE,border:`1px solid ${C.bd}`,borderRadius:10,padding:18}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}><h3 style={{fontSize:13,fontWeight:600}}>{t('emp.compensation')}</h3><Btn v="ghost" sz="sm" icon="edit" onClick={()=>setEditing(true)}>{t('common.edit')}</Btn></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>{[[t('emp.annual'),'€'+(emp.salary||0).toLocaleString()],[t('emp.monthly'),'€'+Math.round((emp.salary||0)/14).toLocaleString()],[t('emp.daily'),'€'+Math.round((emp.salary||0)/260).toLocaleString()]].map(([l,v])=><div key={l} style={{background:C.bgC,borderRadius:8,padding:14,border:`1px solid ${C.bdS}`}}><div style={{fontSize:10,color:C.txD,marginBottom:4}}>{l}</div><div style={{fontFamily:MO,fontSize:22,fontWeight:700}}>{v}</div></div>)}</div>
    </div>}
    {tab==='leave'&&(el.length===0?<Ety icon="calendar" message={t('emp.no_leave')}/>:<Tbl cols={[{label:t('common.type'),render:r=><Bg v={r.type==='Sick'?'rose':'default'}>{r.type}</Bg>},{label:t('leave.period'),render:r=><span style={{fontFamily:MO,fontSize:11}}>{r.start_date}→{r.end_date}</span>},{label:t('leave.days'),render:r=><span style={{fontFamily:MO,fontWeight:700}}>{r.days}</span>},{label:t('common.status'),render:r=><Bg v={r.status==='approved'?'green':r.status==='pending'?'amber':'rose'}>{r.status}</Bg>}]} data={el}/>)}
    {tab==='shifts'&&(es.length===0?<Ety icon="clock" message={t('emp.no_shifts')}/>:<Tbl cols={[{label:t('sched.date'),render:r=><span style={{fontFamily:MO,fontSize:11}}>{r.date}</span>},{label:t('sched.shift'),render:r=><Bg s={{background:`${r.color}15`,color:r.color,border:`1px solid ${r.color}30`}}>{r.template}</Bg>},{label:t('sched.hours'),render:r=><span style={{fontFamily:MO,fontSize:11}}>{r.time_range}</span>}]} data={es}/>)}
    {tab==='reviews'&&(er.length===0?<Ety icon="star" message={t('emp.no_reviews')}/>:<Tbl cols={[{label:t('perf.reviewer'),render:r=><span style={{fontWeight:500}}>{r.reviewer||'—'}</span>},{label:t('perf.score'),render:r=><span style={{fontFamily:MO,fontWeight:700,color:r.score>=4?C.gn:r.score>=3?C.am:C.rs}}>{r.score}/5</span>},{label:t('perf.feedback'),render:r=><span style={{fontSize:11,color:C.txM}}>{(r.feedback||'').slice(0,80)}</span>}]} data={er}/>)}
  </div>
}

export default function EmployeesPage() {
  const { emps, addEmp, locs } = useData()
  const { t } = useLang()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selId, setSelId] = useState(null)
  const [modal, setModal] = useState(false)
  const selEmp = emps.find(e => e.id === selId)
  const depts = [...new Set(emps.map(e => e.department).filter(Boolean))]

  const filtered = useMemo(() => {
    let d = emps
    if (search) d = d.filter(e => (e.name + e.role + e.email).toLowerCase().includes(search.toLowerCase()))
    if (filter === 'on_leave') d = d.filter(e => e.status === 'on_leave')
    else if (filter === 'terminated') d = d.filter(e => e.status === 'terminated')
    else if (filter !== 'all') d = d.filter(e => e.department === filter)
    return d
  }, [emps, search, filter])

  if (selEmp) return <ProfileView emp={selEmp} onBack={() => setSelId(null)} t={t} locs={locs} />

  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
      <div><h1 style={{fontSize:20,fontWeight:700}}>{t('emp.title')}</h1><p style={{fontSize:12,color:C.txD,marginTop:3}}>{emps.length} {t('emp.people')}</p></div>
      <Btn v="primary" icon="plus" onClick={()=>setModal(true)}>{t('common.add')}</Btn>
    </div>
    <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
      <div style={{position:'relative'}}><div style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)'}}><I n="search" s={14} c={C.txD}/></div><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('common.search')} style={{width:200,padding:'8px 12px 8px 32px',borderRadius:7,border:`1px solid ${C.bd}`,background:C.bgE,color:C.tx,fontSize:12,outline:'none',fontFamily:SA}}/></div>
      {['all',...depts,'on_leave','terminated'].map(x=><button key={x} onClick={()=>setFilter(x)} style={{padding:'5px 12px',fontSize:11,borderRadius:5,border:`1px solid ${filter===x?C.cy:C.bd}`,background:filter===x?C.cyD:'transparent',color:filter===x?C.cy:C.txD,cursor:'pointer',fontWeight:500,fontFamily:SA}}>{x==='all'?t('common.all'):x==='on_leave'?t('common.on_leave'):x==='terminated'?t('common.terminated'):x}</button>)}
    </div>
    <Tbl cols={[
      {label:t('emp.employee'),render:r=>{const loc=locs.find(l=>l.id===r.location_id);return <div style={{display:'flex',alignItems:'center',gap:8}}><Av name={r.name} size={28} color={DC[r.department]}/><div><div style={{fontWeight:500,fontSize:12}}>{r.name}</div><div style={{fontSize:10,color:C.txD}}>{r.email}{loc?' · '+loc.name:''}</div></div></div>}},
      {label:t('emp.role'),render:r=><span style={{fontSize:12}}>{r.role}</span>},
      {label:t('emp.dept'),render:r=><Bg v="dim">{r.department}</Bg>},
      {label:t('common.status'),render:r=><Bg v={SC[r.status]||'dim'}>{(r.status||'').replace('_',' ')}</Bg>},
      {label:t('emp.salary'),render:r=><span style={{fontFamily:MO,fontSize:11,fontWeight:600}}>€{(r.salary||0).toLocaleString()}</span>},
    ]} data={filtered} onRow={r=>setSelId(r.id)} empty={<Ety icon="users" message={t('emp.no_employees')} action={t('common.add')} onAction={()=>setModal(true)}/>}/>
    <Modal open={modal} onClose={()=>setModal(false)} title={t('emp.add_employee')}>
      <EmpForm onSave={async d=>{await addEmp(d);setModal(false)}} t={t} locs={locs}/>
    </Modal>
  </div>
}
