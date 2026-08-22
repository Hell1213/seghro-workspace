import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getUserOrgId } from '@/lib/org-scope';
import { z } from 'zod';
import { error, validationError } from '@/lib/api-response';

const querySchema = z.object({
  agentId: z.string().optional(),
  severity: z.string().optional(),
  status: z.string().optional(),
});

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['open', 'investigating', 'resolved', 'wontfix', 'reopened']),
});

export async function GET(request: NextRequest) {
  try {
    // Org-scoped auth check
    const orgId = await getUserOrgId();
    if (!orgId) {
      console.warn('[/api/issues] No auth session — returning data in demo mode');
    }

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      agentId: searchParams.get('agentId') ?? undefined,
      severity: searchParams.get('severity') ?? undefined,
      status: searchParams.get('status') ?? undefined,
    });

    const where: Record<string, unknown> = {};
    if (orgId) {
      where.agent = { orgId };
    }
    if (parsed.success) {
      if (parsed.data.agentId) where.agentId = parsed.data.agentId;
      if (parsed.data.severity) where.severity = parsed.data.severity;
      if (parsed.data.status) where.status = parsed.data.status;
    }

    const issues = await db.issue.findMany({
      where,
      include: { agent: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    // Map to frontend-expected shape (includes agentName)
    return Response.json(
      issues.map((i) => ({
        id: i.id,
        agentId: i.agentId,
        agentName: i.agent.name,
        title: i.title,
        description: i.description ?? '',
        severity: i.severity,
        status: i.status,
        affectedRuns: i.affectedRuns,
        totalRuns: i.totalRuns,
        failureRate: i.failureRate,
        rootCause: i.rootCause ?? '',
        suggestedFix: i.suggestedFix ?? '',
        createdAt: i.createdAt.toISOString(),
        updatedAt: i.updatedAt.toISOString(),
      })),
    );
  } catch (err) {
    console.error('[/api/issues] Error:', err);
    return error('Failed to fetch issues');
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.flatten());
    }

    const updated = await db.issue.update({
      where: { id: parsed.data.id },
      data: { status: parsed.data.status },
    });

    return Response.json({
      id: updated.id,
      status: updated.status,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error('[/api/issues] PATCH Error:', err);
    return error('Failed to update issue');
  }
}
