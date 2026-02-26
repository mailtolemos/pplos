'use client'
import { useLang } from "@/components/lang-provider"
import { useState, useMemo } from 'react'
import { useData } from '@/components/data-provider'
import { C, MO, SA, I, Bg, Btn, Inp, Av, Tbl, Ety, Modal, Tbs, Stt, DC, SC, DEPTS, ini, isoToday } from '@/components/ui'

function EmpForm({ initial, onSave, onCancel }) {
  const [nm,setNm]=useState(initial?.name||'');const[em,setEm]=useState(initial?.email||'');const[rl,setRl]=useState(initial?.role||'');const[dp,setDp]=useState(initial?.department||'Engineering');const[tp,setTp]=useState(initial?.type||'full_time');const[md,setMd]=useState(initial?.work_model||'hybrid');const[hr,setHr]=useState(initial?.hire_date||isoToday());const[sl,setSl]=useState(String(initial?.salary||''));const[sk,setSk]=useState(Array.isArray(initial?.skills)?initial.skills.join(', '):'')
  return <div style={{display:'flex',flexDirection:'column',gap:12}}>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}><Inp label="Full Name" value={nm} onChange={setNm} placeholder="Jane Doe" required/><Inp label="Email" value={em} onChange={setEm} type="email" placeholder="jane@co.com" required/></div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}><Inp label="Role" value={rl} onChange={setRl} placeholder="Engineer" required/><Inp label="Department" value={dp} onChange={setDp} options={DEPTS}/></div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}><Inp label="Type" value={tp} onChange={setTp} options={[{value:'full_time',label:'Full-time'},{value:'part_time',label:'Part-time'},{value:'contract',label:'Contract'}]}/><Inp label="Model" value={md} onChange={setMd} options={[{value:'hybrid',label:'Hybrid'},{value:'remote',label:'Remote'},{value:'on_site',label:'On-site'}]}/><Inp label="Hire Date" value={hr} onChange={setHr} type="date"/></div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}><Inp label="Salary (€/yr)" value={sl} onChange={setSl} type="number" placeholder="65000"/><Inp label="Skills" value={sk} onChange={setSk} placeholder="React, Python"/></div>
    <div style={{display:'flex',gap:8,marginTop:6}}><Btn v="primary" onClick={()=>nm&&em&&rl&&onSave({name:nm,email:em,role:rl,department:dp,type:tp,work_model:md,hire_date:hr,salary:Number(sl)||0,skills:sk.split(',').map(s=>s.trim()).filter(Boolean)})} disabled={!nm||!em||!rl} style={{flex:1,justifyContent:'center'}}>{initial?'Save Changes':'Add Employee'}</Btn>{onCancel&&<Btn v="ghost" onClick={onCancel}>Cancel</Btn>}</div>
  </div>
}

function ProfileView({ emp, onBack }) {
  const { leaves, shifts, reviews, updEmp, termEmp, delEmp } = useData()
  const [tab, setTab] = useState('overview')
  const [editing, setEditing] = useState(false)
  const dc = DC[emp.department] || C.cy
  const el = leaves.filter(l => l.employee_id === emp.id)
  const es = shifts.filter(s => s.employee_id === emp.id)
  const er = reviews.filter(r => r.employee_id === emp.id)

  if (editing) return <div>
    <button onClick={()=>setEditing(false)} style={{background:'none',border:'none',color:C.txD,cursor:'pointer',fontSize:11,marginBottom:16,fontFamily:SA}}>← Cancel</button>
    <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Edit {emp.name}</h2>
    <EmpForm initial={emp} onSave={async d=>{await updEmp(emp.id,d);setEditing(false)}} onCancel={()=>setEditing(false)}/>
  </div>

  return <div>
    <button onClick={onBack} style={{background:'none',border:'none',color:C.txD,cursor:'pointer',fontSize:11,marginBottom:16,fontFamily:SA}}>← Back</button>
    <div style={{display:'flex',gap:16,alignItems:'center',marginBottom:22,padding:20,background:C.bgE,border:`1px solid ${C.bd}`,borderRadius:12}}>
      <Av name={emp.name} size={48} color={dc}/>
      <div style={{flex:1}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}><h1 style={{fontSize:18,fontWeight:700}}>{emp.name}</h1><Bg v={SC[emp.status]||'dim'}>{(emp.status||'').replace('_',' ')}</Bg></div>
        <p style={{fontSize:12,color:C.txM,marginTop:2}}>{emp.role} · {emp.department}</p>
        <div style={{display:'flex',gap:14,marginTop:6,flexWrap:'wrap',fontSize:10,color:C.txD}}>
          <span><b style={{color:C.txM}}>Email:</b> {emp.email}</span>
          <span><b style={{color:C.txM}}>Hired:</b> {emp.hire_date}</span>
          <span><b style={{color:C.txM}}>Model:</b> {(emp.work_model||'').replace('_',' ')}</span>
        </div>
      </div>
      <div style={{display:'flex',gap:6}}>
        <Btn v="ghost" sz="sm" icon="edit" onClick={()=>setEditing(true)}>Edit</Btn>
        {emp.status==='active'&&<Btn v="danger" sz="sm" icon="x" onClick={()=>termEmp(emp.id)}>Terminate</Btn>}
        <Btn v="danger" sz="sm" icon="trash" onClick={async()=>{await delEmp(emp.id);onBack()}}>Delete</Btn>
      </div>
    </div>
    <Tbs tabs={[{id:'overview',label:'Overview'},{id:'comp',label:'Compensation'},{id:'leave',label:'Leave',count:el.length},{id:'shifts',label:'Shifts',count:es.length},{id:'reviews',label:'Reviews',count:er.length}]} active={tab} onChange={setTab}/>
    {tab==='overview'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
      <div style={{background:C.bgE,border:`1px solid ${C.bd}`,borderRadius:10,padding:18}}>
        <h3 style={{fontSize:12,fontWeight:600,marginBottom:12}}>Details</h3>
        {[['Type',(emp.type||'').replace('_',' ')],['Model',(emp.work_model||'').replace('_',' ')],['Department',emp.department],['Hired',emp.hire_date],['Salary','€'+(emp.salary||0).toLocaleString()]].map(([k,v])=><div key={k} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:`1px solid ${C.bdS}`,fontSize:11}}><span style={{color:C.txD}}>{k}</span><span style={{fontWeight:500}}>{v}</span></div>)}
      </div>
      <div style={{background:C.bgE,border:`1px solid ${C.bd}`,borderRadius:10,padding:18}}>
        <h3 style={{fontSize:12,fontWeight:600,marginBottom:12}}>Skills</h3>
        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{(emp.skills||[]).length?emp.skills.map(s=><Bg key={s}>{s}</Bg>):<span style={{fontSize:11,color:C.txD}}>None</span>}</div>
      </div>
    </div>}
    {tab==='comp'&&<div style={{background:C.bgE,border:`1px solid ${C.bd}`,borderRadius:10,padding:18}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}><h3 style={{fontSize:13,fontWeight:600}}>Compensation</h3><Btn v="ghost" sz="sm" icon="edit" onClick={()=>setEditing(true)}>Edit</Btn></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>{[['Annual','€'+(emp.salary||0).toLocaleString()],['Monthly','€'+Math.round((emp.salary||0)/14).toLocaleString()],['Daily','€'+Math.round((emp.salary||0)/260).toLocaleString()]].map(([l,v])=><div key={l} style={{background:C.bgC,borderRadius:8,padding:14,border:`1px solid ${C.bdS}`}}><div style={{fontSize:10,color:C.txD,marginBottom:4}}>{l}</div><div style={{fontFamily:MO,fontSize:22,fontWeight:700}}>{v}</div></div>)}</div>
    </div>}
    {tab==='leave'&&(el.length===0?<Ety icon="calendar" message="No leave requests"/>:<Tbl cols={[{label:'Type',render:r=><Bg v={r.type==='Sick'?'rose':'default'}>{r.type}</Bg>},{label:'Period',render:r=><span style={{fontFamily:MO,fontSize:11}}>{r.start_date}→{r.end_date}</span>},{label:'Days',render:r=><span style={{fontFamily:MO,fontWeight:700}}>{r.days}</span>},{label:'Status',render:r=><Bg v={r.status==='approved'?'green':r.status==='pending'?'amber':'rose'}>{r.status}</Bg>}]} data={el}/>)}
    {tab==='shifts'&&(es.length===0?<Ety icon="clock" message="No shifts"/>:<Tbl cols={[{label:'Date',render:r=><span style={{fontFamily:MO,fontSize:11}}>{r.date}</span>},{label:'Shift',render:r=><Bg s={{background:`${r.color}15`,color:r.color,border:`1px solid ${r.color}30`}}>{r.template}</Bg>},{label:'Time',render:r=><span style={{fontFamily:MO,fontSize:11}}>{r.time_range}</span>}]} data={es}/>)}
    {tab==='reviews'&&(er.length===0?<Ety icon="star" message="No reviews"/>:<Tbl cols={[{label:'Reviewer',render:r=><span style={{fontWeight:500}}>{r.reviewer||'—'}</span>},{label:'Score',render:r=><span style={{fontFamily:MO,fontWeight:700,color:r.score>=4?C.gn:r.score>=3?C.am:C.rs}}>{r.score}/5</span>},{label:'Feedback',render:r=><span style={{fontSize:11,color:C.txM}}>{(r.feedback||'').slice(0,80)}</span>}]} data={er}/>)}
  </div>
}

export default function EmployeesPage() {
  const { emps, addEmp } = useData()
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

  if (selEmp) return <ProfileView emp={selEmp} onBack={() => setSelId(null)} />

  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
      <div><h1 style={{fontSize:20,fontWeight:700}}>Employees</h1><p style={{fontSize:12,color:C.txD,marginTop:3}}>{emps.length} people</p></div>
      <Btn v="primary" icon="plus" onClick={()=>setModal(true)}>Add</Btn>
    </div>
    <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
      <div style={{position:'relative'}}><div style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)'}}><I n="search" s={14} c={C.txD}/></div><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{width:200,padding:'8px 12px 8px 32px',borderRadius:7,border:`1px solid ${C.bd}`,background:C.bgE,color:C.tx,fontSize:12,outline:'none',fontFamily:SA}}/></div>
      {['all',...depts,'on_leave','terminated'].map(x=><button key={x} onClick={()=>setFilter(x)} style={{padding:'5px 12px',fontSize:11,borderRadius:5,border:`1px solid ${filter===x?C.cy:C.bd}`,background:filter===x?C.cyD:'transparent',color:filter===x?C.cy:C.txD,cursor:'pointer',fontWeight:500,fontFamily:SA}}>{x==='all'?'All':x==='on_leave'?'On Leave':x==='terminated'?'Terminated':x}</button>)}
    </div>
    <Tbl cols={[
      {label:'Employee',render:r=><div style={{display:'flex',alignItems:'center',gap:8}}><Av name={r.name} size={28} color={DC[r.department]}/><div><div style={{fontWeight:500,fontSize:12}}>{r.name}</div><div style={{fontSize:10,color:C.txD}}>{r.email}</div></div></div>},
      {label:'Role',render:r=><span style={{fontSize:12}}>{r.role}</span>},
      {label:'Dept',render:r=><Bg v="dim">{r.department}</Bg>},
      {label:'Status',render:r=><Bg v={SC[r.status]||'dim'}>{(r.status||'').replace('_',' ')}</Bg>},
      {label:'Salary',render:r=><span style={{fontFamily:MO,fontSize:11,fontWeight:600}}>€{(r.salary||0).toLocaleString()}</span>},
    ]} data={filtered} onRow={r=>setSelId(r.id)} empty={<Ety icon="users" message="No employees" action="Add" onAction={()=>setModal(true)}/>}/>
    <Modal open={modal} onClose={()=>setModal(false)} title="Add Employee">
      <EmpForm onSave={async d=>{await addEmp(d);setModal(false)}}/>
    </Modal>
  </div>
}
