import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

const SUPER_ADMINS = (process.env.NEXT_PUBLIC_SUPER_ADMINS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)

export async function middleware(request) {
  let response = NextResponse.next({ request })

  // ─── Subdomain detection ───
  const host = request.headers.get('host') || ''
  const hostname = host.split(':')[0] // strip port
  // Extract subdomain: aab.pplos.io → aab, www.pplos.io → null, pplos.io → null, localhost → null
  let subdomain = null
  if (hostname.endsWith('.pplos.io')) {
    const sub = hostname.replace('.pplos.io', '')
    if (sub && sub !== 'www') subdomain = sub
  }
  // For local dev: aab.localhost → aab
  if (hostname.endsWith('.localhost')) {
    const sub = hostname.replace('.localhost', '')
    if (sub && sub !== 'www') subdomain = sub
  }

  // Pass subdomain as header for downstream use
  if (subdomain) {
    response.headers.set('x-tenant-slug', subdomain)
    request.headers.set('x-tenant-slug', subdomain)
    // Re-create response with updated request headers
    response = NextResponse.next({
      request: { headers: request.headers }
    })
    response.headers.set('x-tenant-slug', subdomain)
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          if (subdomain) response.headers.set('x-tenant-slug', subdomain)
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()

  // Protect /dashboard
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  // Protect /admin — must be logged in AND super admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    if (!SUPER_ADMINS.includes(user.email?.toLowerCase())) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
  // Redirect logged in users away from auth pages
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL(user ? '/dashboard' : '/login', request.url))
  }
  return response
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'] }
