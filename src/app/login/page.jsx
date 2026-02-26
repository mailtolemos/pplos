'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLang } from '@/components/lang-provider'
import { LANGS } from '@/lib/i18n'

const C={bg:"#08080a",bgE:"#131316",bgC:"#19191d",bd:"#252529",tx:"#ededef",txD:"#636369",cy:"#22d3ee",rs:"#fb7185"}
const MO="'JetBrains Mono',monospace"

export default function LoginPage(){
  const[email,setEmail]=useState('');const[password,setPassword]=useState('');const[error,setError]=useState(null);const[loading,setLoading]=useState(false)
  const router=useRouter();const{t,lang,setLang}=useLang()
  async function handleLogin(e){e.preventDefault();setError(null);setLoading(true);const supabase=createClient();const{error}=await supabase.auth.signInWithPassword({email,password});if(error){setError(error.message);setLoading(false)}else{router.push('/dashboard');router.refresh()}}
  return(
    <div style={{minHeight:'100vh',display:'grid',placeItems:'center',background:C.bg,padding:24,position:'relative'}}>
      <div style={{position:'absolute',top:16,right:16,display:'flex',gap:4}}>{LANGS.map(l=><button key={l.code} onClick={()=>setLang(l.code)} style={{padding:'4px 8px',fontSize:11,borderRadius:5,border:`1px solid ${lang===l.code?C.cy:C.bd}`,background:lang===l.code?C.cy+'15':'transparent',color:lang===l.code?C.cy:C.txD,cursor:'pointer',fontFamily:'inherit'}}>{l.flag}</button>)}</div>
      <div style={{width:'100%',maxWidth:400}}>
        <div style={{textAlign:'center',marginBottom:40}}><div style={{fontFamily:MO,fontSize:28,fontWeight:700,color:C.cy}}>pplos.io://</div><p style={{fontSize:13,color:C.txD,marginTop:8}}>{t('auth.signin')}</p></div>
        <form onSubmit={handleLogin} style={{background:C.bgC,border:`1px solid ${C.bd}`,borderRadius:14,padding:28,display:'flex',flexDirection:'column',gap:16}}>
          <div style={{display:'flex',flexDirection:'column',gap:5}}><label style={{fontSize:11,color:C.txD,fontWeight:500}}>{t('auth.email')}</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@company.com" style={{padding:'10px 12px',borderRadius:7,border:`1px solid ${C.bd}`,background:C.bgE,color:C.tx,fontSize:13,outline:'none',fontFamily:'inherit'}}/></div>
          <div style={{display:'flex',flexDirection:'column',gap:5}}><label style={{fontSize:11,color:C.txD,fontWeight:500}}>{t('auth.password')}</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••" style={{padding:'10px 12px',borderRadius:7,border:`1px solid ${C.bd}`,background:C.bgE,color:C.tx,fontSize:13,outline:'none',fontFamily:'inherit'}}/></div>
          {error&&<div style={{fontSize:12,color:C.rs,padding:'8px 10px',background:'rgba(251,113,133,0.08)',borderRadius:7,border:'1px solid rgba(251,113,133,0.18)'}}>{error}</div>}
          <button type="submit" disabled={loading} style={{padding:'11px 16px',borderRadius:7,border:'none',background:C.cy,color:C.bg,fontSize:13,fontWeight:600,cursor:loading?'wait':'pointer',opacity:loading?0.6:1,fontFamily:MO}}>{loading?t('auth.signing_in'):t('auth.signin.btn')}</button>
          <div style={{textAlign:'center',fontSize:12,color:C.txD}}>{t('auth.no_account')} <a href="/signup" style={{color:C.cy,textDecoration:'none'}}>{t('auth.create_workspace')}</a></div>
        </form>
      </div>
    </div>
  )
}
