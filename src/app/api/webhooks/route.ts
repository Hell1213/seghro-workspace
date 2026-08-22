import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getAuthSession } from '@/lib/auth-guard'
import { success, error, validationError } from '@/lib/api-response'

const createWebhookSchema = z.object({
  url: z.string().url({ message: 'A valid URL is required' }),
  events: z.array(z.string()).min(1, { message: 'At least one event is required' }),
  secret: z.string().optional(),
  channel: z.string().optional(),
  active: z.boolean().default(true),
})

/** GET — list all webhooks for the authenticated user's org (demo mode: list all) */
export async function GET() {
  try {
    const session = await getAuthSession()

    if (session?.user) {
      const userId = (session.user as { id?: string }).id

      if (userId) {
        const user = await db.user.findUnique({
          where: { id: userId },
          select: { orgId: true },
        })

        if (user?.orgId) {
          const webhooks = await db.webhook.findMany({
            where: { orgId: user.orgId },
            orderBy: { createdAt: 'desc' },
          })
          return success(
            webhooks.map((w) => ({
              ...w,
              events: JSON.parse(w.events),
            }))
          )
        }
      }
    }

    // Demo mode: no session or no org — list all webhooks
    const webhooks = await db.webhook.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return success(
      webhooks.map((w) => ({
        ...w,
        events: JSON.parse(w.events),
      }))
    )
  } catch (err) {
    console.error('[/api/webhooks] GET Error:', err)
    return error('Failed to fetch webhooks')
  }
}

/** POST — create a new webhook */
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user) {
      return error('Unauthorized', 401)
    }

    const userId = (session.user as { id?: string }).id
    if (!userId) {
      return error('User ID not found in session', 401)
    }

    const body = await request.json()
    const parsed = createWebhookSchema.safeParse(body)

    if (!parsed.success) {
      return validationError(parsed.error.issues)
    }

    const { url, events, secret, active } = parsed.data

    // Look up the user's org
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { orgId: true },
    })

    if (!user?.orgId) {
      return error('User is not part of an organization', 404)
    }

    const webhook = await db.webhook.create({
      data: {
        orgId: user.orgId,
        url,
        events: JSON.stringify(events),
        secret: secret || null,
        active,
      },
    })

    return success(
      {
        ...webhook,
        events: JSON.parse(webhook.events),
      },
      201
    )
  } catch (err) {
    console.error('[/api/webhooks] POST Error:', err)
    return error('Failed to create webhook')
  }
}

/** DELETE — delete a webhook by ID (?id=...) */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user) {
      return error('Unauthorized', 401)
    }

    const userId = (session.user as { id?: string }).id
    if (!userId) {
      return error('User ID not found in session', 401)
    }

    const { searchParams } = new URL(request.url)
    const webhookId = searchParams.get('id')

    if (!webhookId) {
      return validationError([
        {
          code: 'custom',
          path: ['id'],
          message: 'Webhook ID is required (query param ?id=)',
        },
      ])
    }

    // Verify the webhook belongs to the user's org
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { orgId: true },
    })

    if (!user?.orgId) {
      return error('User is not part of an organization', 404)
    }

    const existing = await db.webhook.findFirst({
      where: { id: webhookId, orgId: user.orgId },
    })

    if (!existing) {
      return error('Webhook not found', 404)
    }

    await db.webhook.delete({ where: { id: webhookId } })

    return success({ deleted: true, id: webhookId })
  } catch (err) {
    console.error('[/api/webhooks] DELETE Error:', err)
    return error('Failed to delete webhook')
  }
}
