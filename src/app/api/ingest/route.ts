import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth-guard';
import { validateApiKey } from '@/lib/api-key-auth';
import { success, error, validationError } from '@/lib/api-response';

const ingestSchema = z.object({
  agentName: z.string().min(1),
  agentFramework: z.string().optional(),
  traceId: z.string().min(1),
  status: z.enum(['success', 'error', 'timeout']),
  duration: z.number().positive(),
  inputTokens: z.number().int().min(0),
  outputTokens: z.number().int().min(0),
  spans: z
    .array(
      z.object({
        name: z.string(),
        type: z.string().optional(),
        status: z.string(),
        duration: z.number(),
        startTime: z.number(),
        inputTokens: z.number().int().min(0).optional(),
        outputTokens: z.number().int().min(0).optional(),
        model: z.string().optional(),
        tool: z.string().optional(),
      }),
    )
    .optional(),
  metadata: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Auth: try session first, fall back to API key
    const session = await getAuthSession();
    const authUser = session?.user
      ? { id: (session.user as { id?: string }).id, role: (session.user as { role?: string }).role }
      : await validateApiKey(request.headers.get('Authorization'));

    if (!authUser) {
      return error('Unauthorized', 401);
    }

    // Parse and validate request body
    const body = await request.json();
    const parsed = ingestSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.issues);
    }

    const { agentName, agentFramework, traceId, status, duration, inputTokens, outputTokens, spans, metadata } =
      parsed.data;

    // Upsert Agent by name
    const existingAgent = await db.agent.findFirst({ where: { name: agentName } });

    let agent;
    if (existingAgent) {
      agent = await db.agent.update({
        where: { id: existingAgent.id },
        data: {
          lastRunAt: new Date(),
          totalRuns: { increment: 1 },
          ...(agentFramework ? { framework: agentFramework } : {}),
        },
      });
    } else {
      agent = await db.agent.create({
        data: {
          name: agentName,
          framework: agentFramework ?? null,
          lastRunAt: new Date(),
          totalRuns: 1,
        },
      });
    }

    // Create Trace
    const trace = await db.trace.create({
      data: {
        agentId: agent.id,
        traceId,
        status,
        duration,
        inputTokens,
        outputTokens,
        metadata: metadata ?? null,
      },
    });

    // Batch create Spans
    if (spans && spans.length > 0) {
      await db.span.createMany({
        data: spans.map((s) => ({
          traceId: trace.id,
          name: s.name,
          type: s.type ?? null,
          status: s.status,
          duration: s.duration,
          startTime: s.startTime,
          inputTokens: s.inputTokens ?? 0,
          outputTokens: s.outputTokens ?? 0,
          model: s.model ?? null,
          tool: s.tool ?? null,
        })),
      });
    }

    // Create Metric records
    await db.metric.createMany({
      data: [
        { name: 'latency', value: duration, agentId: agent.id },
        { name: 'input_tokens', value: inputTokens, agentId: agent.id },
        { name: 'output_tokens', value: outputTokens, agentId: agent.id },
      ],
    });

    // Issue detection: create Issue for error status
    if (status === 'error') {
      await db.issue.create({
        data: {
          agentId: agent.id,
          title: `Trace ${traceId} failed`,
          description: metadata ?? `Agent ${agentName} trace ended with error status. Duration: ${duration}ms`,
          severity: 'P1',
          status: 'open',
          affectedRuns: 1,
          totalRuns: agent.totalRuns,
          failureRate: 1 / agent.totalRuns,
        },
      });
    }

    return success({ traceId: trace.id, agentId: agent.id }, 201);
  } catch (err) {
    console.error('[/api/ingest] POST Error:', err);
    return error('Failed to ingest trace data');
  }
}

export async function GET() {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalTraces, recentTraces] = await Promise.all([
      db.trace.count(),
      db.trace.count({ where: { createdAt: { gte: twentyFourHoursAgo } } }),
    ]);

    return success({
      totalTraces,
      tracesLast24h: recentTraces,
    });
  } catch (err) {
    console.error('[/api/ingest] GET Error:', err);
    return error('Failed to fetch ingestion stats');
  }
}
