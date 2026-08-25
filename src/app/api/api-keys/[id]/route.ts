import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { success, error } from '@/lib/api-response'

/** DELETE — revoke an API key */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return error('Unauthorized', 401)
    }

    const userId = (session.user as { id: string }).id
    const { id } = await params

    const existing = await db.apiKey.findUnique({ where: { id } })
    if (!existing) {
      return error('API key not found', 404)
    }

    // Verify ownership
    if (existing.userId !== userId) {
      return error('Forbidden', 403)
    }

    await db.apiKey.delete({ where: { id } })

    return success({ deleted: true })
  } catch (err) {
    console.error('[API Keys DELETE] Error:', err)
    return error('Internal server error')
  }
}
