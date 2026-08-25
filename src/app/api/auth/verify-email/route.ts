import { z } from 'zod'
import { db } from '@/lib/db'
import { success, error } from '@/lib/api-response'
import { verifyToken, consumeToken } from '@/lib/token'

const schema = z.object({
  token: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return error('Validation failed', 400, parsed.error.flatten().fieldErrors)
    }

    const { token } = parsed.data

    const record = await verifyToken(token, 'email-verification')
    if (!record) {
      return error('Invalid or expired verification token', 400)
    }

    const user = await db.user.findUnique({ where: { email: record.identifier } })
    if (user) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      })
    }

    await consumeToken(record.id)

    return success({ verified: true, email: user?.email ?? record.identifier })
  } catch (err) {
    console.error('Verify email error:', err)
    return error('Internal server error', 500)
  }
}
