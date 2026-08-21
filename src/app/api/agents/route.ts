import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth-guard';
import { z } from 'zod';
import { error } from '@/lib/api-response';

const querySchema = z.object({
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Soft auth check — log warning if no session, but still return data for demo
    const session = await getAuthSession();
    if (!session) {
      console.warn('[/api/agents] No auth session — returning data in demo mode');
    }

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      search: searchParams.get('search') ?? undefined,
    });

    const where: Record<string, unknown> = {};
    if (parsed.success && parsed.data.search) {
      where.name = { contains: parsed.data.search };
    }

    const agents = await db.agent.findMany({
      where,
      include: {
        _count: { select: { traces: true, issues: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Map to match the frontend-expected shape (plain fields, ISO date strings)
    return Response.json(
      agents.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description ?? '',
        status: a.status,
        framework: a.framework ?? '',
        lastRunAt: (a.lastRunAt ?? a.updatedAt).toISOString(),
        totalRuns: a.totalRuns,
        errorRate: a.errorRate,
        avgLatency: a.avgLatency,
        _count: a._count,
      })),
    );
  } catch (err) {
    console.error('[/api/agents] Error:', err);
    return error('Failed to fetch agents');
  }
}
