import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getUserOrgId, isDemoMode } from '@/lib/org-scope';
import { demoAlerts } from '@/lib/demo-data';
import { z } from 'zod';
import { error, success, validationError } from '@/lib/api-response';

export async function GET() {
  try {
    const orgId = await getUserOrgId();
    if (isDemoMode(orgId)) {
      return success(demoAlerts);
    }

    const where: Record<string, unknown> = {};
    if (orgId) {
      where.agent = { orgId };
    }

    const alerts = await db.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return success(alerts.map((a) => ({
        id: a.id,
        title: a.title,
        message: a.message ?? '',
        severity: a.severity,
        status: a.status,
        channel: a.channel,
        createdAt: a.createdAt.toISOString(),
      })))
  } catch (err) {
    console.error('[/api/alerts] Error:', err);
    return error('Failed to fetch alerts');
  }
}

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['read', 'acknowledged', 'resolved']).optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten());
    }

    const newStatus = parsed.data.status ?? 'read';
    const updated = await db.alert.update({
      where: { id: parsed.data.id },
      data: { status: newStatus },
    });

    return success({
      id: updated.id,
      status: updated.status,
    });
  } catch (err) {
    console.error('[/api/alerts] PATCH Error:', err);
    return error('Failed to update alert');
  }
}
