import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getUserOrgId } from '@/lib/org-scope';
import { z } from 'zod';
import { error, success, validationError } from '@/lib/api-response';
import crypto from 'crypto';

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

const createSchema = z.object({
  agentId: z.string().min(1, 'Agent ID is required'),
  status: z.enum(['success', 'error']).optional().default('success'),
  duration: z.coerce.number().min(0).optional().default(1200),
  inputTokens: z.coerce.number().int().min(0).optional().default(150),
  outputTokens: z.coerce.number().int().min(0).optional().default(300),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten());
    }

    const traceId = crypto.randomBytes(16).toString('hex');
    const data = parsed.data;

    const trace = await db.trace.create({
      data: {
        agentId: data.agentId,
        traceId,
        status: data.status,
        duration: data.duration,
        inputTokens: data.inputTokens,
        outputTokens: data.outputTokens,
      },
      include: {
        agent: { select: { name: true, framework: true } },
      },
    });

    return success({
      id: trace.id,
      agentId: trace.agentId,
      traceId: trace.traceId,
      status: trace.status,
      duration: trace.duration,
      inputTokens: trace.inputTokens,
      outputTokens: trace.outputTokens,
      createdAt: trace.createdAt.toISOString(),
      agent: trace.agent,
      spans: [],
    }, 201);
  } catch (err) {
    console.error('[/api/traces] POST Error:', err);
    return error('Failed to create trace');
  }
}
