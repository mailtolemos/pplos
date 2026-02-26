import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const SUPER_ADMINS = (process.env.NEXT_PUBLIC_SUPER_ADMINS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)

// Service role client — bypasses RLS
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

// Verify the request is from a super admin
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

// GET — list all tenants, profiles, employee counts
export async function GET() {
  const user = await verifySuperAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const sb = adminClient()
  const [tenants, profiles, emps] = await Promise.all([
    sb.from('tenants').select('*').order('created_at', { ascending: false }),
    sb.from('profiles').select('*').order('created_at', { ascending: false }),
    sb.from('employees').select('tenant_id'),
  ])

  const empCounts = {}
  ;(emps.data || []).forEach(e => { empCounts[e.tenant_id] = (empCounts[e.tenant_id] || 0) + 1 })

  return NextResponse.json({
    tenants: tenants.data || [],
    profiles: profiles.data || [],
    empCounts,
  })
}

// POST — create tenant + admin user, update tenant, delete tenant
export async function POST(request) {
  const user = await verifySuperAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const body = await request.json()
  const sb = adminClient()

  // ─── Create Tenant + Admin ───
  if (body.action === 'create') {
    const { name, slug, plan, email, password, fullName } = body
    if (!name || !slug || !email || !password || !fullName) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }

    // Create tenant
    const { data: tenant, error: tErr } = await sb.from('tenants')
      .insert({ name, slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, ''), plan })
      .select().single()
    if (tErr) return NextResponse.json({ error: tErr.message }, { status: 400 })

    // Create auth user (service role can do this)
    const { data: authData, error: aErr } = await sb.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (aErr) {
      // Rollback tenant
      await sb.from('tenants').delete().eq('id', tenant.id)
      return NextResponse.json({ error: aErr.message }, { status: 400 })
    }

    // Create profile
    const { error: pErr } = await sb.from('profiles')
      .insert({ id: authData.user.id, tenant_id: tenant.id, full_name: fullName, role: 'admin' })
    if (pErr) {
      await sb.from('tenants').delete().eq('id', tenant.id)
      await sb.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: pErr.message }, { status: 400 })
    }

    // Seed data
    await sb.rpc('seed_tenant_data', { p_tenant_id: tenant.id }).catch(() => {})

    return NextResponse.json({ tenant, profile: { id: authData.user.id, tenant_id: tenant.id, full_name: fullName, role: 'admin' } })
  }

  // ─── Update Tenant ───
  if (body.action === 'update') {
    const { id, updates } = body
    const { data, error } = await sb.from('tenants').update(updates).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ tenant: data })
  }

  // ─── Delete Tenant ───
  if (body.action === 'delete') {
    const { id } = body
    // Delete all related data (cascades handle most, but let's be thorough)
    const { error } = await sb.from('tenants').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ deleted: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
