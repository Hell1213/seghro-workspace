import crypto from 'crypto'
import { db } from './db'

/**
 * Token type for verification flows.
 * - `email-verification` — email address confirmation (24h expiry)
 * - `password-reset` — password reset request (1h expiry)
 */
export type VerificationTokenType = 'email-verification' | 'password-reset'

/**
 * Configurable expiry durations (in hours) per token type.
 */
const VERIFICATION_EXPIRY_HOURS: Record<VerificationTokenType, number> = {
  'email-verification': 24,
  'password-reset': 1,
}

/**
 * Generates a new verification token for the given email and type.
 * Any existing tokens of the same type for this email are deleted first
 * to ensure only one active token exists per flow.
 *
 * @param email - The user's email address (used as the identifier)
 * @param type - The type of verification token
 * @returns The generated hex token string
 */
export async function generateVerificationToken(
  email: string,
  type: VerificationTokenType,
) {
  // Delete existing tokens of same type for this email
  await db.verificationToken.deleteMany({
    where: { identifier: email, type },
  })

  const token = crypto.randomBytes(32).toString('hex')
  const hours = VERIFICATION_EXPIRY_HOURS[type]

  await db.verificationToken.create({
    data: {
      identifier: email,
      token,
      type,
      expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000),
    },
  })

  return token
}

/**
 * Validates a verification token by looking it up in the database.
 * The token must match the given type and must not have expired.
 *
 * @param token - The token string to verify
 * @param type - The expected token type
 * @returns The VerificationToken record if valid, or null if not found/expired
 */
export async function verifyToken(
  token: string,
  type: string,
) {
  const record = await db.verificationToken.findFirst({
    where: {
      token,
      type,
      expiresAt: { gt: new Date() },
    },
  })

  if (!record) return null
  return record
}

/**
 * Deletes (consumes) a verification token after it has been used.
 *
 * @param id - The database ID of the VerificationToken record to delete
 */
export async function consumeToken(id: string) {
  await db.verificationToken.delete({
    where: { id },
  })
}
