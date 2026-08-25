import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { success, error } from '@/lib/api-response'
import { verifyToken, consumeToken } from '@/lib/token'

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return error('Validation failed', 400, parsed.error.flatten().fieldErrors)
    }

    const { token, password } = parsed.data

    const record = await verifyToken(token, 'password-reset')
    if (!record) {
      return error('Invalid or expired reset token', 400)
    }

    const user = await db.user.findUnique({ where: { email: record.identifier } })
    if (!user) {
      return error('User not found', 404)
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    // Mark the PasswordReset record as used
    await db.passwordReset.updateMany({
      where: { token },
      data: { usedAt: new Date() },
    })

    await consumeToken(record.id)

    return success({ message: 'Password reset successfully' })
  } catch (err) {
    console.error('Reset password error:', err)
    return error('Internal server error', 500)
  }
}
