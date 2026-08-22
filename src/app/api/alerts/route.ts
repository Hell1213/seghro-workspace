import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getUserOrgId } from '@/lib/org-scope';
import { z } from 'zod';
import { error, validationError } from '@/lib/api-response';

const patchSchema = z.object({
  id: z.string().min(1),
});

export async function GET() {
  try {
    // Org-scoped auth check
    const orgId = await getUserOrgId();
    if (!orgId) {
      console.warn('[/api/alerts] No auth session — returning data in demo mode');
    }

    const where: Record<string, unknown> = {};
    if (orgId) {
      where.agent = { orgId };
    }

    const alerts = await db.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return Response.json(
      alerts.map((a) => ({
        id: a.id,
        title: a.title,
        message: a.message ?? '',
        severity: a.severity,
        status: a.status,
        channel: a.channel,
        createdAt: a.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    console.error('[/api/alerts] Error:', err);
    return error('Failed to fetch alerts');
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.flatten());
    }

    const updated = await db.alert.update({
      where: { id: parsed.data.id },
      data: { status: 'read' },
    });

    return Response.json({
      id: updated.id,
      status: updated.status,
    });
  } catch (err) {
    console.error('[/api/alerts] PATCH Error:', err);
    return error('Failed to update alert');
  }
}
