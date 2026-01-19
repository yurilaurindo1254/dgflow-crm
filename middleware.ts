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

    // Role-based protection
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'client'

    // Define Permissions locally to avoid import issues in Edge Middleware
    const PERMISSIONS: Record<string, string[]> = {
      admin: ['*'],
      project_manager: [
        '/projetos', 
        '/tarefas', 
        '/equipe', 
        '/clientes', 
        '/briefings',
        '/' // Dashboard
      ],
      designer: ['/tarefas', '/agenda', '/briefings'],
      editor: ['/tarefas', '/agenda', '/briefings'],
      client: ['/portal']
    };

    // Helper to check permission
    const checkMiddlewarePermission = (userRole: string, path: string) => {
      // Admin bypass
      if (userRole === 'admin') return true;

      const allowedPaths = PERMISSIONS[userRole] || [];
      // '*' means all access (already handled by admin check but good for explicit config)
      if (allowedPaths.includes('*')) return true;

      // Check if current path matches or starts with any allowed path
      // Special case: '/' matches exactly '/' but also we might want dashboard access
      // For this logic, strict matching on start
      return allowedPaths.some(allowed => {
         if (allowed === '/') return path === '/'; // Strict root check
         return path === allowed || path.startsWith(`${allowed}/`);
      });
    };

    const currentPath = request.nextUrl.pathname;
    
    // Skip static assets or public api routes if they weren't caught by matcher (matcher handles most)
    // Also skip internal next paths if any leak through
    
    // Logic:
    // 1. If role is 'client' and trying to access regular dashboard -> Redirect to Portal
    // 2. If role is 'designer/editor' and trying to access forbidden routes -> Redirect to their home (e.g. /tarefas)
    
    const isAllowed = checkMiddlewarePermission(role, currentPath);

    if (!isAllowed) {
       // Determine fallback
       let fallback = '/';
       if (role === 'client') fallback = '/portal';
       else if (role === 'designer' || role === 'editor') fallback = '/tarefas';
       
       // Avoid redirect loop
       if (currentPath !== fallback) {
         url.pathname = fallback;
         return NextResponse.redirect(url);
       }
    }
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
