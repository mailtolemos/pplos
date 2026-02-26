import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const SUPER_ADMINS = (process.env.NEXT_PUBLIC_SUPER_ADMINS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)

function adminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

async function verifySuperAdmin() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !SUPER_ADMINS.includes(user.email?.toLowerCase())) return null
  return user
}

export async function POST(request) {
  const user = await verifySuperAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { tenant_id, exit } = await request.json()
  const sb = adminClient()
  const cookieStore = await cookies()

  if (exit) {
    // Restore original tenant_id from cookie
    const originalTid = cookieStore.get('pplos_original_tenant')?.value
    if (originalTid) {
      await sb.from('profiles').update({ tenant_id: originalTid }).eq('id', user.id)
    }
    const res = NextResponse.json({ ok: true })
    res.cookies.delete('pplos_impersonate')
    res.cookies.delete('pplos_original_tenant')
    return res
  }

  if (!tenant_id) return NextResponse.json({ error: 'tenant_id required' }, { status: 400 })

  // Save original tenant_id
  const { data: profile } = await sb.from('profiles').select('tenant_id').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  // Swap tenant_id in profile (so RLS works)
  const { error } = await sb.from('profiles').update({ tenant_id }).eq('id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const res = NextResponse.json({ ok: true })
  res.cookies.set('pplos_impersonate', tenant_id, { path: '/', httpOnly: false, maxAge: 60 * 60 * 4, sameSite: 'lax' })
  res.cookies.set('pplos_original_tenant', profile.tenant_id, { path: '/', httpOnly: false, maxAge: 60 * 60 * 4, sameSite: 'lax' })
  return res
}
