import { z } from 'zod'
import { db } from '@/lib/db'
import { success, error } from '@/lib/api-response'
import { generateVerificationToken } from '@/lib/token'

const schema = z.object({
  email: z.string().email(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return error('Validation failed', 400, parsed.error.flatten().fieldErrors)
    }

    const { email } = parsed.data

    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      return error('No account found with that email', 404)
    }

    if (user.emailVerified) {
      return success({ message: 'Email already verified', alreadyVerified: true })
    }

    const token = await generateVerificationToken(email, 'email-verification')

    // TODO: Send verification email via SendGrid/Resend/etc.
    return success({ message: 'Verification email sent', token })
  } catch (err) {
    console.error('Send verification error:', err)
    return error('Internal server error', 500)
  }
}
