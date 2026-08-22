import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getUserOrgId } from '@/lib/org-scope';
import { z } from 'zod';
import { error, success, validationError } from '@/lib/api-response';

const querySchema = z.object({
  search: z.string().optional(),
});

const createSchema = z.object({
  name: z.string().min(1, 'Agent name is required'),
  description: z.string().optional(),
  framework: z.string().optional(),
  status: z.enum(['active', 'idle', 'error']).optional().default('active'),
});

export async function GET(request: NextRequest) {
  try {
    // Org-scoped auth check
    const orgId = await getUserOrgId();
    if (!orgId) {
      console.warn('[/api/agents] No auth session — returning data in demo mode');
    }

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      search: searchParams.get('search') ?? undefined,
    });

    const where: Record<string, unknown> = {};
    if (orgId) {
      where.orgId = orgId;
    }
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

export async function POST(request: NextRequest) {
  try {
    const orgId = await getUserOrgId();

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten());
    }

    const agent = await db.agent.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        framework: parsed.data.framework ?? null,
        status: parsed.data.status,
        ...(orgId ? { orgId } : {}),
      },
    });

    return success({
      id: agent.id,
      name: agent.name,
      description: agent.description ?? '',
      status: agent.status,
      framework: agent.framework ?? '',
      lastRunAt: (agent.lastRunAt ?? agent.updatedAt).toISOString(),
      totalRuns: agent.totalRuns,
      errorRate: agent.errorRate,
      avgLatency: agent.avgLatency,
    }, 201);
  } catch (err) {
    console.error('[/api/agents] POST Error:', err);
    return error('Failed to create agent');
  }
}
