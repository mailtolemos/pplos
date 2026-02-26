import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const SUPER_ADMINS = (process.env.NEXT_PUBLIC_SUPER_ADMINS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)

export default async function AdminLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !SUPER_ADMINS.includes(user.email?.toLowerCase())) redirect('/dashboard')
  return <>{children}</>
}
