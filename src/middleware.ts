import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimitMiddleware } from '@/lib/rate-limit'

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
}

// Generate a short request ID for log correlation (Edge-compatible)
function requestId(): string {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 10)
  return `${ts}-${rand}`
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const reqId = requestId()

  // ---------- Rate limiting for /api/* ----------
  if (pathname.startsWith('/api')) {
    const rl = rateLimitMiddleware(request)

    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', requestId: reqId, retryAfter: Math.ceil((rl.resetAt - Date.now()) / 1000) },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rl.resetAt),
            'X-Request-Id': reqId,
          },
        }
      )
    }

    const response = NextResponse.next()
    response.headers.set('X-Request-Id', reqId)
    response.headers.set('X-RateLimit-Remaining', String(rl.remaining))
    response.headers.set('X-RateLimit-Limit', String(rl.limit))
    response.headers.set('X-RateLimit-Reset', String(rl.resetAt))
    return response
  }

  // ---------- Auth guard for /dashboard/* ----------
  const token = request.cookies.get('next-auth.session-token')
    || request.cookies.get('__Secure-next-auth.session-token')

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Add security headers
  const response = NextResponse.next()
  // X-Frame-Options omitted — handled by reverse-proxy in production
  response.headers.set('X-Request-Id', reqId)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}
