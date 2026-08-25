import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { success, error } from '@/lib/api-response'

/** Generate a random 32-char hex string */
function generateKeySuffix(): string {
  return crypto.randomBytes(16).toString('hex')
}

/** GET — list API keys for the authenticated user */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return error('Unauthorized', 401)
    }

    const userId = (session.user as { id: string }).id

    const keys = await db.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        lastUsedAt: true,
        createdAt: true,
        expiresAt: true,
      },
    })

    return success(keys)
  } catch (err) {
    console.error('[API Keys GET] Error:', err)
    return error('Internal server error')
  }
}

/** POST — create a new API key */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return error('Unauthorized', 401)
    }

    const userId = (session.user as { id: string }).id

    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return error('Name is required', 400)
    }

    // Generate the full key
    const suffix = generateKeySuffix()
    const fullKey = `seghro_sk_${suffix}`
    const keyPrefix = fullKey.slice(0, 18) // "seghro_sk_" + first 8 of hex
    const keyHash = await bcrypt.hash(fullKey, 12)

    const apiKey = await db.apiKey.create({
      data: {
        userId,
        name: name.trim(),
        keyHash,
        keyPrefix,
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        createdAt: true,
      },
    })

    // Return the full key ONLY on creation
    return success({ apiKey, fullKey }, 201)
  } catch (err) {
    console.error('[API Keys POST] Error:', err)
    return error('Internal server error')
  }
}
