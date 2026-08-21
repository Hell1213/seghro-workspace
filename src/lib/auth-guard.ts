import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * Get the current session (returns null if not authenticated)
 */
export async function getAuthSession() {
  return getServerSession(authOptions)
}

/**
 * Require authentication — throws 401 if no session
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return session
}

/**
 * Require a specific role — throws 403 if user doesn't have the role
 */
export async function requireRole(role: string) {
  const session = await requireAuth()

  const userRole = (session.user as { role?: string }).role || 'viewer'
  if (userRole !== role) {
    throw new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return session
}