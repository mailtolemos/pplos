import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { DataProvider } from '@/components/data-provider'
import DashboardShell from '@/components/dashboard-shell'

export default async function DashboardLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, tenants(*)')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.tenants) redirect('/signup')

  const tenant = profile.tenants
  const cookieStore = await cookies()
  const isImpersonating = !!cookieStore.get('pplos_impersonate')?.value

  return (
    <DataProvider initialTenant={tenant} initialProfile={profile} impersonating={isImpersonating}>
      <DashboardShell>
        {children}
      </DashboardShell>
    </DataProvider>
  )
}
