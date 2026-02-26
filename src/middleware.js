import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

const SUPER_ADMINS = (process.env.NEXT_PUBLIC_SUPER_ADMINS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)

export async function middleware(request) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
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
