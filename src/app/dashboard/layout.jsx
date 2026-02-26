import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DataProvider } from '@/components/data-provider'
import DashboardShell from '@/components/dashboard-shell'

export default async function DashboardLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Load profile + tenant
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, tenants(*)')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.tenants) {
    // No profile/tenant — user might have signed up but setup failed
    redirect('/signup')
  }

  const tenant = profile.tenants

  return (
    <DataProvider initialTenant={tenant} initialProfile={profile}>
      <DashboardShell>
        {children}
      </DashboardShell>
    </DataProvider>
  )
}
