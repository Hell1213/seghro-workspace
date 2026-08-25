import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { success, error, validationError } from '@/lib/api-response'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  workspace: z.string().min(2, 'Workspace name is required').optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return validationError(parsed.error.issues)
    }

    const { name, workspace, email, password } = parsed.data

    // Check if email already exists
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return error('An account with this email already exists', 409)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create organization from workspace name or default
    const orgName = workspace || `${name}'s Workspace`
    const orgSlug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const uniqueSlug = `${orgSlug}-${Date.now().toString(36)}`

    const org = await db.organization.create({
      data: {
        name: orgName,
        slug: uniqueSlug,
        plan: 'starter',
      },
    })

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'admin', // First user in org is admin
        orgId: org.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    return success({ user }, 201)
  } catch (err) {
    console.error('[Register API] Error:', err)
    return error('Internal server error')
  }
}
