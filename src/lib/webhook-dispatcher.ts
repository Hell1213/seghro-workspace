// Server-only module — Webhook delivery system for Seghro V8
// Dispatches HTTP POST requests to registered webhook endpoints when events occur.

import { createHmac, randomUUID } from 'crypto'
import { db } from '@/lib/db'

const WEBHOOK_TIMEOUT_MS = 10_000
const DEFAULT_SECRET = 'seghro-default-secret'

interface DispatchResult {
  delivered: number
  failed: number
}

/**
 * Dispatch webhooks for a given event to all matching active webhook endpoints.
 *
 * - Queries all active webhooks whose `events` JSON array contains the given event name.
 * - For each matching webhook, sends an HTTP POST with HMAC-SHA256 signature headers.
 * - Updates each webhook's `lastUsedAt` via raw SQL to avoid stale Prisma client issues.
 *
 * @returns { delivered, failed } counts of webhook deliveries.
 */
export async function dispatchWebhooks(
  event: string,
  payload: Record<string, unknown>
): Promise<DispatchResult> {
  let delivered = 0
  let failed = 0

  try {
    // Fetch all active webhooks — we filter by event client-side since `events` is a JSON string
    const webhooks = await db.webhook.findMany({
      where: { active: true },
    })

    // Filter webhooks whose events JSON array contains the target event
    const matching = webhooks.filter((w) => {
      try {
        const events: unknown[] = JSON.parse(w.events)
        return Array.isArray(events) && events.includes(event)
      } catch {
        return false
      }
    })

    if (matching.length === 0) {
      console.log(`[webhook-dispatcher] No webhooks registered for event: ${event}`)
      return { delivered: 0, failed: 0 }
    }

    console.log(
      `[webhook-dispatcher] Dispatching event "${event}" to ${matching.length} webhook(s)`
    )

    // Build the request body once (same for all webhooks)
    const body: Record<string, unknown> = {
      event,
      timestamp: new Date().toISOString(),
      data: payload,
    }
    const bodyJson = JSON.stringify(body)

    // Deliver to each webhook concurrently
    const results = await Promise.allSettled(
      matching.map(async (webhook) => {
        const secret = webhook.secret || DEFAULT_SECRET
        const deliveryId = randomUUID()

        // Compute HMAC-SHA256 signature over the raw JSON body
        const signature = createHmac('sha256', secret)
          .update(bodyJson)
          .digest('hex')

        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS)

        try {
          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Signature': signature,
              'X-Webhook-Event': event,
              'X-Webhook-Delivery': deliveryId,
            },
            body: bodyJson,
            signal: controller.signal,
          })

          clearTimeout(timeout)

          if (response.ok) {
            console.log(
              `[webhook-dispatcher] ✓ Delivered to ${webhook.url} (delivery=${deliveryId}, status=${response.status})`
            )
          } else {
            console.warn(
              `[webhook-dispatcher] ✗ Non-2xx from ${webhook.url} (delivery=${deliveryId}, status=${response.status})`
            )
          }

          return response.ok
        } catch (err) {
          clearTimeout(timeout)
          const reason =
            err instanceof Error && err.name === 'AbortError'
              ? 'timeout'
              : err instanceof Error
                ? err.message
                : 'unknown error'
          console.error(
            `[webhook-dispatcher] ✗ Failed to deliver to ${webhook.url} (delivery=${deliveryId}): ${reason}`
          )
          return false
        } finally {
          // Update lastUsedAt via raw SQL to handle potentially stale Prisma client
          try {
            const now = new Date().toISOString()
            await db.$queryRawUnsafe(
              `UPDATE "Webhook" SET "lastUsedAt" = '${now}', "updatedAt" = '${now}' WHERE "id" = '${webhook.id}'`
            )
          } catch (updateErr) {
            console.error(
              `[webhook-dispatcher] Failed to update lastUsedAt for webhook ${webhook.id}:`,
              updateErr
            )
          }
        }
      })
    )

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value === true) {
        delivered++
      } else {
        failed++
      }
    }
  } catch (err) {
    console.error(`[webhook-dispatcher] Unexpected error dispatching event "${event}":`, err)
    failed++
  }

  console.log(
    `[webhook-dispatcher] Event "${event}" complete: ${delivered} delivered, ${failed} failed`
  )

  return { delivered, failed }
}

/**
 * Convenience function: dispatch an alert.created webhook event.
 */
export async function deliverAlert(
  alertData: Record<string, unknown>
): Promise<DispatchResult> {
  return dispatchWebhooks('alert.created', alertData)
}

/**
 * Convenience function: dispatch an issue.detected webhook event.
 */
export async function deliverIssue(
  issueData: Record<string, unknown>
): Promise<DispatchResult> {
  return dispatchWebhooks('issue.detected', issueData)
}
