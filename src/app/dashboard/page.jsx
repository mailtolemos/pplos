'use client'
import { useEffect } from 'react'
import { useData } from '@/components/data-provider'
import { useLang } from '@/components/lang-provider'
import { C, MO, I, Bg, Btn, Stt, DC } from '@/components/ui'

export default function DashboardPage(){
  const{tenant,profile,ana,leaves,log,appLeave,denLeave}=useData()
  const{t,lang}=useLang()
  useEffect(() => { document.title = `${tenant.name} — People.OS` }, [tenant.name])
  const deptData=Object.entries(ana.ds).map(([n,c])=>({name:n,count:c,color:DC[n]||C.txD})).sort((a,b)=>b.count-a.count)
  const mx=Math.max(...deptData.map(d=>d.count),1)
  const pending=leaves.filter(l=>l.status==='pending')
  const loc=lang==='pt'?'pt-PT':lang==='fr'?'fr-FR':lang==='it'?'it-IT':lang==='de'?'de-DE':'en-GB'
  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22}}>
      <div><h1 style={{fontSize:20,fontWeight:700}}>{t('dash.welcome')}, {profile.full_name || tenant.name}</h1><p style={{fontSize:12,color:C.txD,marginTop:3,fontFamily:MO}}>{tenant.name} · {tenant.slug}.pplos.io</p></div>
      <span style={{fontFamily:MO,fontSize:10,color:C.txD}}>{new Date().toLocaleDateString(loc,{weekday:'short',day:'2-digit',month:'short',year:'numeric'})}</span>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:22}}>
      <Stt label={t('dash.headcount')} value={ana.total} icon="users"/><Stt label={t('dash.active')} value={ana.active} icon="check"/><Stt label={t('dash.on_leave')} value={ana.onLeave} icon="calendar"/><Stt label={t('dash.pending')} value={ana.pLeaves} icon="bell"/>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'3fr 2fr',gap:12,marginBottom:12}}>
      <div style={{background:C.bgE,border:`1px solid ${C.bd}`,borderRadius:10,padding:18}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:14}}><span style={{fontSize:13,fontWeight:600}}>{t('dash.pending_leave')}</span><Bg v={pending.length?'amber':'dim'}>{pending.length}</Bg></div>
        {pending.length===0?<div style={{padding:16,textAlign:'center',color:C.txD,fontSize:12}}>{t('dash.all_clear')}</div>:
          pending.slice(0,5).map(l=><div key={l.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:`1px solid ${C.bdS}`}}>
            <div><div style={{fontSize:12,fontWeight:500}}>{l.employee_name}</div><div style={{fontSize:10,color:C.txD,fontFamily:MO}}>{l.type}·{l.days}d</div></div>
            <div style={{display:'flex',gap:4}}><Btn v="primary" sz="xs" icon="check" onClick={()=>appLeave(l.id)}>{t('common.ok')}</Btn><Btn v="ghost" sz="xs" icon="x" onClick={()=>denLeave(l.id)}>{t('common.no')}</Btn></div>
          </div>)}
      </div>
      <div style={{background:C.bgE,border:`1px solid ${C.bd}`,borderRadius:10,padding:18}}>
        <div style={{fontSize:13,fontWeight:600,marginBottom:14}}>{t('dash.departments')}</div>
        {deptData.map(d=><div key={d.name} style={{marginBottom:10}}><div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:4}}><span style={{color:C.txM}}>{d.name}</span><span style={{fontFamily:MO,fontWeight:600}}>{d.count}</span></div><div style={{height:4,background:C.bd,borderRadius:2,overflow:'hidden'}}><div style={{height:'100%',width:`${(d.count/mx)*100}%`,background:d.color,borderRadius:2}}/></div></div>)}
      </div>
    </div>
    <div style={{background:C.bgE,border:`1px solid ${C.bd}`,borderRadius:10,padding:18}}>
      <div style={{fontSize:13,fontWeight:600,marginBottom:14}}>{t('dash.activity')}</div>
      {log.length===0?<div style={{textAlign:'center',color:C.txD,fontSize:12,padding:16}}>{t('dash.start')}</div>:
        log.slice(0,8).map(a=><div key={a.id} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 0',borderBottom:`1px solid ${C.bdS}`,fontSize:12}}><div style={{width:5,height:5,borderRadius:'50%',background:C.cy,flexShrink:0}}/><span style={{flex:1,color:C.txM}}>{a.action}</span><span style={{fontFamily:MO,fontSize:10,color:C.txD}}>{new Date(a.created_at).toLocaleTimeString(loc,{hour:'2-digit',minute:'2-digit'})}</span></div>)}
    </div>
  </div>
}
