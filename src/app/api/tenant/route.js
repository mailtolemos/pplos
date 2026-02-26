import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const slug = new URL(request.url).searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data } = await sb.from('tenants').select('name, slug, plan').eq('slug', slug.toLowerCase()).single()
  if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 })

  return NextResponse.json(data)
}
