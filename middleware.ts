import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create an authenticated Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  // ROUTE PROTECTION LOGIC
  
  // 1. If user is NOT logged in and tries to access dashboard pages (or root), redirect to /login
  if (!user && (
    request.nextUrl.pathname === '/' || 
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/briefings') ||
    request.nextUrl.pathname.startsWith('/clientes') ||
    request.nextUrl.pathname.startsWith('/servicos')
    // Add other protected paths here
  )) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 2. If user IS logged in:
  if (user) {
    // If trying to access /login or /register, redirect to dashboard
    if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register' || request.nextUrl.pathname === '/cadastro') {
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    // Role-based protection: Prevent 'client' roles from accessing main dashboard
    // and prevent 'admin/team' from being stuck in portal if needed (though usually admins can see portal)
    
    // Fetch user profile to get role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'client'

    // 1. If 'client' tries to access admin routes -> redirect to /portal
    const isAdminRoute = 
      request.nextUrl.pathname === '/' || 
      request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/briefings') ||
      request.nextUrl.pathname.startsWith('/clientes') ||
      request.nextUrl.pathname.startsWith('/orcamentos') ||
      request.nextUrl.pathname.startsWith('/servicos')

    if (role === 'client' && isAdminRoute) {
      url.pathname = '/portal'
      return NextResponse.redirect(url)
    }

    // 2. If 'admin/team' tries to access /portal (optional: maybe allow? User said "Bloqueie o acesso de usuários com role 'client' ao /dashboard")
    // We'll allow admins to see the portal for testing/management.

  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes, handle in specific files if needed)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
