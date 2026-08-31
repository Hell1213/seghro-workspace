import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimitMiddleware } from '@/lib/rate-limit'
import { getToken } from 'next-auth/jwt'

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
}

function requestId(): string {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 10)
  return `${ts}-${rand}`
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const reqId = requestId()

  // Skip middleware for NextAuth routes (they have their own security)
  if (pathname.startsWith('/api/auth')) {
    const response = NextResponse.next()
    response.headers.set('X-Request-Id', reqId)
    return response
  }

  // Rate limiting for non-auth API routes
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

  // Auth guard for /dashboard/*
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    const token = request.cookies.get('next-auth.session-token')
      || request.cookies.get('__Secure-next-auth.session-token')
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  } else {
    try {
      const token = request.cookies.get('next-auth.session-token')?.value
        || request.cookies.get('__Secure-next-auth.session-token')?.value
      if (!token) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(loginUrl)
      }
      const decoded = await getToken({ req: request, secret })
      if (!decoded) {
        throw new Error('Invalid token')
      }
    } catch {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  const response = NextResponse.next()
  response.headers.set('X-Request-Id', reqId)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  return response
}
