import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getUserOrgId } from '@/lib/org-scope';
import { z } from 'zod';
import { error } from '@/lib/api-response';

const querySchema = z.object({
  agentId: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Org-scoped auth check
    const orgId = await getUserOrgId();
    if (!orgId) {
      console.warn('[/api/traces] No auth session — returning data in demo mode');
    }

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      agentId: searchParams.get('agentId') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      search: searchParams.get('search') ?? undefined,
    });

    const where: Record<string, unknown> = {};
    if (orgId) {
      where.agent = { orgId };
    }
    if (parsed.success) {
      if (parsed.data.agentId) where.agentId = parsed.data.agentId;
      if (parsed.data.status) where.status = parsed.data.status;
      if (parsed.data.search) {
        where.traceId = { contains: parsed.data.search };
      }
    }

    const traces = await db.trace.findMany({
      where,
      include: {
        agent: { select: { name: true, framework: true } },
        spans: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Map to frontend-expected shape
    return Response.json(
      traces.map((t) => ({
        id: t.id,
        agentId: t.agentId,
        traceId: t.traceId,
        status: t.status,
        duration: t.duration,
        inputTokens: t.inputTokens,
        outputTokens: t.outputTokens,
        createdAt: t.createdAt.toISOString(),
        agent: t.agent,
        spans: t.spans.map((s) => ({
          id: s.id,
          name: s.name,
          type: s.type,
          status: s.status,
          duration: s.duration,
          startTime: s.startTime,
          model: s.model,
          tool: s.tool,
          inputTokens: s.inputTokens,
          outputTokens: s.outputTokens,
        })),
      })),
    );
  } catch (err) {
    console.error('[/api/traces] Error:', err);
    return error('Failed to fetch traces');
  }
}
