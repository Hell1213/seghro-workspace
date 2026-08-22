import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiEndpoints, type ApiEndpoint } from '@/lib/self-healing-data';
import { z } from 'zod';
import { error, validationError } from '@/lib/api-response';

const postSchema = z.object({
  action: z.enum(['add', 'remove', 'health-check', 'reset-circuit']),
  endpointId: z.string().optional(),
  endpoint: z.object({
    id: z.string(),
    name: z.string(),
    baseUrl: z.string(),
  }).optional(),
});

/** Seed endpoints from self-healing-data.ts into the database */
async function seedEndpointsFromData() {
  const [row] = await db.$queryRawUnsafe<{ c: number }[]>('SELECT COUNT(*) as c FROM MonitoredEndpoint');
  if (row.c > 0) return;

  for (const ep of apiEndpoints) {
    await db.$executeRawUnsafe(
      `INSERT INTO MonitoredEndpoint (id, name, baseUrl, status, responseTime, errorRate, lastChecked, circuitBreaker, category, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      ep.id, ep.name, ep.baseUrl, ep.status, ep.latency, ep.errorRate,
      new Date(ep.lastCheck).toISOString(), ep.circuitBreaker, ep.category
    );
  }
}

export async function GET() {
  try {
    await seedEndpointsFromData();
    const rows = await db.$queryRawUnsafe<{
      id: string; name: string; baseUrl: string; status: string;
      responseTime: number; errorRate: number; lastChecked: string;
      circuitBreaker: string; category: string;
    }[]>('SELECT id, name, baseUrl, status, responseTime, errorRate, lastChecked, circuitBreaker, category FROM MonitoredEndpoint ORDER BY createdAt ASC');

    return NextResponse.json(rows.map(ep => ({
      id: ep.id,
      name: ep.name,
      baseUrl: ep.baseUrl,
      category: ep.category,
      status: ep.status,
      circuitBreaker: ep.circuitBreaker,
      latency: ep.responseTime,
      errorRate: ep.errorRate,
      lastCheck: ep.lastChecked,
    })));
  } catch (err) {
    console.error('[/api/endpoints] Error:', err);
    return error('Failed to fetch endpoints');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = postSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.flatten());
    }

    const { action, endpointId, endpoint } = parsed.data;

    switch (action) {
      case 'add': {
        if (!endpoint) {
          return validationError({ endpoint: ['endpoint object is required for add action'] });
        }
        await db.$executeRawUnsafe(
          `INSERT OR IGNORE INTO MonitoredEndpoint (id, name, baseUrl, createdAt, updatedAt) VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
          endpoint.id, endpoint.name, endpoint.baseUrl
        );
        return NextResponse.json({
          success: true,
          message: `Endpoint "${endpoint.name}" added successfully`,
          endpointId: endpoint.id,
        });
      }

      case 'remove': {
        if (!endpointId) {
          return validationError({ endpointId: ['endpointId is required'] });
        }
        const [target] = await db.$queryRawUnsafe<{ name: string }[]>(
          'SELECT name FROM MonitoredEndpoint WHERE id = ?', endpointId
        );
        await db.$executeRawUnsafe('DELETE FROM MonitoredEndpoint WHERE id = ?', endpointId);
        return NextResponse.json({
          success: true,
          message: target
            ? `Endpoint "${target.name}" removed successfully`
            : `Endpoint "${endpointId}" not found`,
          endpointId,
        });
      }

      case 'health-check': {
        if (!endpointId) {
          return validationError({ endpointId: ['endpointId is required'] });
        }
        const [target] = await db.$queryRawUnsafe<{ name: string }[]>(
          'SELECT name FROM MonitoredEndpoint WHERE id = ?', endpointId
        );
        await db.$executeRawUnsafe(
          "UPDATE MonitoredEndpoint SET lastChecked = datetime('now') WHERE id = ?",
          endpointId
        );
        return NextResponse.json({
          success: true,
          message: target
            ? `Health check initiated for "${target.name}"`
            : `Health check initiated for "${endpointId}"`,
          endpointId,
          timestamp: new Date().toISOString(),
        });
      }

      case 'reset-circuit': {
        if (!endpointId) {
          return validationError({ endpointId: ['endpointId is required'] });
        }
        const [target] = await db.$queryRawUnsafe<{ name: string; circuitBreaker: string }[]>(
          'SELECT name, circuitBreaker FROM MonitoredEndpoint WHERE id = ?', endpointId
        );
        const previousState = target?.circuitBreaker ?? 'unknown';
        await db.$executeRawUnsafe(
          "UPDATE MonitoredEndpoint SET circuitBreaker = 'closed' WHERE id = ?",
          endpointId
        );
        return NextResponse.json({
          success: true,
          message: target
            ? `Circuit breaker reset to CLOSED for "${target.name}"`
            : `Circuit breaker reset for "${endpointId}"`,
          endpointId,
          previousState,
          newState: 'closed',
          timestamp: new Date().toISOString(),
        });
      }

      default:
        return error('Unknown action', 400);
    }
  } catch (err) {
    console.error('[/api/endpoints] POST Error:', err);
    return error('Failed to process endpoint action');
  }
}
