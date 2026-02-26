'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLang } from '@/components/lang-provider'
import { LANGS } from '@/lib/i18n'

const C={bg:"#08080a",bgE:"#131316",bgC:"#19191d",bd:"#252529",tx:"#ededef",txM:"#9898a0",txD:"#636369",cy:"#22d3ee",rs:"#fb7185"}
const MO="'JetBrains Mono',monospace"

export default function SignupPage(){
  const[step,setStep]=useState(1);const[email,setEmail]=useState('');const[password,setPassword]=useState('');const[fullName,setFullName]=useState('');const[company,setCompany]=useState('');const[error,setError]=useState(null);const[loading,setLoading]=useState(false)
  const router=useRouter();const{t,lang,setLang}=useLang()
  async function handleSignup(e){e.preventDefault();setError(null);setLoading(true);const supabase=createClient()
    try{const{data:authData,error:authErr}=await supabase.auth.signUp({email,password});if(authErr)throw authErr;if(!authData.user)throw new Error('Check email for confirmation');const userId=authData.user.id;const slug=company.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-+$/,'')
      const{data:tenant,error:tenErr}=await supabase.from('tenants').insert({name:company,slug,plan:'growth'}).select().single();if(tenErr)throw tenErr
      const{error:profErr}=await supabase.from('profiles').insert({id:userId,tenant_id:tenant.id,full_name:fullName,role:'admin'});if(profErr)throw profErr
      await supabase.rpc('seed_tenant_data',{p_tenant_id:tenant.id}).catch(()=>{})
      router.push('/dashboard');router.refresh()
    }catch(err){setError(err.message);setLoading(false)}}
  return(
    <div style={{minHeight:'100vh',display:'grid',placeItems:'center',background:C.bg,padding:24,position:'relative'}}>
      <div style={{position:'absolute',top:16,right:16,display:'flex',gap:4}}>{LANGS.map(l=><button key={l.code} onClick={()=>setLang(l.code)} style={{padding:'4px 8px',fontSize:11,borderRadius:5,border:`1px solid ${lang===l.code?C.cy:C.bd}`,background:lang===l.code?C.cy+'15':'transparent',color:lang===l.code?C.cy:C.txD,cursor:'pointer',fontFamily:'inherit'}}>{l.flag}</button>)}</div>
      <div style={{width:'100%',maxWidth:420}}>
        <div style={{textAlign:'center',marginBottom:40}}><div style={{fontFamily:MO,fontSize:28,fontWeight:700,color:C.cy}}>pplos.io://</div><p style={{fontSize:13,color:C.txD,marginTop:8}}>{t('auth.create_hr')}</p></div>
        <form onSubmit={handleSignup} style={{background:C.bgC,border:`1px solid ${C.bd}`,borderRadius:14,padding:28,display:'flex',flexDirection:'column',gap:16}}>
          <div style={{display:'flex',gap:8,marginBottom:4}}>{[1,2].map(s=><div key={s} style={{flex:1,height:3,borderRadius:2,background:step>=s?C.cy:C.bd}}/>)}</div>
          {step===1&&<>
            <div style={{display:'flex',flexDirection:'column',gap:5}}><label style={{fontSize:11,color:C.txD,fontWeight:500}}>{t('auth.your_name')}</label><input value={fullName} onChange={e=>setFullName(e.target.value)} required placeholder="Jane Doe" style={{padding:'10px 12px',borderRadius:7,border:`1px solid ${C.bd}`,background:C.bgE,color:C.tx,fontSize:13,outline:'none'}}/></div>
            <div style={{display:'flex',flexDirection:'column',gap:5}}><label style={{fontSize:11,color:C.txD,fontWeight:500}}>{t('auth.company_name')}</label><input value={company} onChange={e=>setCompany(e.target.value)} required placeholder="Douro Labs" style={{padding:'10px 12px',borderRadius:7,border:`1px solid ${C.bd}`,background:C.bgE,color:C.tx,fontSize:13,outline:'none'}}/></div>
            {company&&<div style={{fontSize:11,fontFamily:MO,color:C.txD}}>{t('auth.your_workspace')}: <span style={{color:C.cy}}>{company.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-+$/,'')}.pplos.io</span></div>}
            <button type="button" onClick={()=>fullName&&company&&setStep(2)} disabled={!fullName||!company} style={{padding:'11px',borderRadius:7,border:'none',background:C.cy,color:C.bg,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:MO,opacity:(!fullName||!company)?0.4:1}}>{t('auth.continue')}</button>
          </>}
          {step===2&&<>
            <div style={{display:'flex',flexDirection:'column',gap:5}}><label style={{fontSize:11,color:C.txD,fontWeight:500}}>{t('auth.email')}</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="jane@dourolabs.com" style={{padding:'10px 12px',borderRadius:7,border:`1px solid ${C.bd}`,background:C.bgE,color:C.tx,fontSize:13,outline:'none'}}/></div>
            <div style={{display:'flex',flexDirection:'column',gap:5}}><label style={{fontSize:11,color:C.txD,fontWeight:500}}>{t('auth.password')}</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder={t('auth.min_chars')} minLength={6} style={{padding:'10px 12px',borderRadius:7,border:`1px solid ${C.bd}`,background:C.bgE,color:C.tx,fontSize:13,outline:'none'}}/></div>
            <div style={{fontSize:11,color:C.txD,background:C.bgE,padding:'10px 12px',borderRadius:7,border:`1px solid ${C.bd}`}}><strong style={{color:C.txM}}>{t('auth.workspace')}:</strong> {company}<br/><strong style={{color:C.txM}}>{t('auth.admin')}:</strong> {fullName}</div>
            {error&&<div style={{fontSize:12,color:C.rs,padding:'8px 10px',background:'rgba(251,113,133,0.08)',borderRadius:7,border:'1px solid rgba(251,113,133,0.18)'}}>{error}</div>}
            <div style={{display:'flex',gap:8}}><button type="button" onClick={()=>setStep(1)} style={{flex:1,padding:'11px',borderRadius:7,border:`1px solid ${C.bd}`,background:'transparent',color:C.txM,fontSize:13,cursor:'pointer'}}>{t('auth.back')}</button><button type="submit" disabled={loading} style={{flex:2,padding:'11px',borderRadius:7,border:'none',background:C.cy,color:C.bg,fontSize:13,fontWeight:600,cursor:loading?'wait':'pointer',opacity:loading?0.6:1,fontFamily:MO}}>{loading?t('auth.creating'):t('auth.launch')}</button></div>
          </>}
          <div style={{textAlign:'center',fontSize:12,color:C.txD}}>{t('auth.have_account')} <a href="/login" style={{color:C.cy,textDecoration:'none'}}>{t('auth.signin_link')}</a></div>
        </form>
      </div>
    </div>
  )
}
