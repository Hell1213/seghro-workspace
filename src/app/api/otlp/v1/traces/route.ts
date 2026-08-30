import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { validateApiKey } from '@/lib/api-key-auth';
import { success, error } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const authUser = await validateApiKey(request.headers.get('Authorization'));
    if (!authUser) return error('Unauthorized', 401);

    const contentType = request.headers.get('Content-Type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      const spans = body.resourceSpans?.flatMap((rs: any) =>
        rs.scopeSpans?.flatMap((ss: any) => ss.spans || []) || []
      ) || [];

      let ingested = 0;
      for (const span of spans) {
        const agentName = span.attributes?.find((a: any) => a.key === 'agent.name')?.value?.stringValue || 'unknown';
        const framework = span.attributes?.find((a: any) => a.key === 'agent.framework')?.value?.stringValue || 'custom';

        const existingAgent = await db.agent.findFirst({ where: { name: agentName } });
        let agent;
        if (existingAgent) {
          agent = await db.agent.update({ where: { id: existingAgent.id }, data: { lastRunAt: new Date(), totalRuns: { increment: 1 } } });
        } else {
          agent = await db.agent.create({ data: { name: agentName, framework, lastRunAt: new Date(), totalRuns: 1 } });
        }

        const trace = await db.trace.create({
          data: {
            agentId: agent.id,
            traceId: span.traceId || crypto.randomUUID(),
            status: span.status?.code === 2 ? 'error' : 'success',
            duration: ((span.endTimeUnixNano || 0) - (span.startTimeUnixNano || 0)) / 1_000_000,
            inputTokens: parseInt(span.attributes?.find((a: any) => a.key === 'llm.usage.input_tokens')?.value?.intValue || '0'),
            outputTokens: parseInt(span.attributes?.find((a: any) => a.key === 'llm.usage.output_tokens')?.value?.intValue || '0'),
            metadata: JSON.stringify(span.attributes),
          },
        });

        await db.span.create({
          data: {
            traceId: trace.id,
            name: span.name || 'unknown',
            type: span.attributes?.find((a: any) => a.key === 'span.type')?.value?.stringValue || null,
            status: span.status?.code === 2 ? 'error' : 'success',
            duration: ((span.endTimeUnixNano || 0) - (span.startTimeUnixNano || 0)) / 1_000_000,
            startTime: (span.startTimeUnixNano || 0) / 1_000_000,
            model: span.attributes?.find((a: any) => a.key === 'llm.model')?.value?.stringValue || null,
            tool: span.attributes?.find((a: any) => a.key === 'tool.name')?.value?.stringValue || null,
          },
        });
        ingested++;
      }

      return success({ acceptedSpans: ingested });
    }

    return error('Unsupported content type', 415);
  } catch (err) {
    console.error('[/api/otlp/v1/traces] Error:', err);
    return error('Failed to process traces');
  }
}

export async function GET() {
  return success({ status: 'ok', endpoint: '/api/otlp/v1/traces', formats: ['application/json'], auth: 'Bearer seghro_sk_...' });
}
