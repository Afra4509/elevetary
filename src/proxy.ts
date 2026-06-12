import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'

const PUBLIC_PATHS = ['/', '/login', '/docs', '/status', '/chat', '/playground']
const API_PUBLIC = ['/api/auth', '/api/v1', '/api/internal/health', '/api/internal']

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public API routes
  if (API_PUBLIC.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Allow public pages
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next()
  }

  // Static assets
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // Protected routes — check cookie
  const token = req.cookies.get('auth_token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const session = await verifyJWT(token)
  if (!session) {
    const res = NextResponse.redirect(new URL('/login', req.url))
    res.cookies.delete('auth_token')
    return res
  }

  // Admin-only routes
  if (pathname.startsWith('/admin') && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Redirect already-logged-in users away from login
  if (pathname === '/login') {
    return NextResponse.redirect(
      new URL(session.role === 'admin' ? '/admin' : '/dashboard', req.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
