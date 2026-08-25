import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiEndpoints } from '@/lib/self-healing-data';
import { z } from 'zod';
import { error, success, validationError } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

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
  const count = await db.monitoredEndpoint.count();
  if (count > 0) return;

  await db.monitoredEndpoint.createMany({
    skipDuplicates: true,
    data: apiEndpoints.map((ep) => ({
      id: ep.id,
      name: ep.name,
      baseUrl: ep.baseUrl,
      status: ep.status,
      responseTime: ep.latency,
      errorRate: ep.errorRate,
      lastChecked: new Date(ep.lastCheck),
      circuitBreaker: ep.circuitBreaker,
      category: ep.category,
    })),
  });
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return error('Unauthorized', 401);
    }

    await seedEndpointsFromData();
    const rows = await db.monitoredEndpoint.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return success(rows.map(ep => ({
      id: ep.id,
      name: ep.name,
      baseUrl: ep.baseUrl,
      category: ep.category,
      status: ep.status,
      circuitBreaker: ep.circuitBreaker,
      latency: ep.responseTime,
      errorRate: ep.errorRate,
      lastCheck: ep.lastChecked.toISOString(),
    })));
  } catch (err) {
    console.error('[/api/endpoints] Error:', err);
    return error('Failed to fetch endpoints');
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return error('Unauthorized', 401);
    }

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
        try {
          await db.monitoredEndpoint.create({
            data: {
              id: endpoint.id,
              name: endpoint.name,
              baseUrl: endpoint.baseUrl,
            },
          });
        } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            // Duplicate — silently ignore (mirrors INSERT OR IGNORE)
          } else {
            throw e;
          }
        }
        return success({
          message: `Endpoint "${endpoint.name}" added successfully`,
          endpointId: endpoint.id,
        });
      }

      case 'remove': {
        if (!endpointId) {
          return validationError({ endpointId: ['endpointId is required'] });
        }
        const target = await db.monitoredEndpoint.findFirst({
          where: { id: endpointId },
          select: { name: true },
        });
        await db.monitoredEndpoint.delete({
          where: { id: endpointId },
        });
        return success({
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
        const target = await db.monitoredEndpoint.findFirst({
          where: { id: endpointId },
          select: { name: true },
        });
        await db.monitoredEndpoint.update({
          where: { id: endpointId },
          data: { lastChecked: new Date() },
        });
        return success({
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
        const target = await db.monitoredEndpoint.findFirst({
          where: { id: endpointId },
          select: { name: true, circuitBreaker: true },
        });
        const previousState = target?.circuitBreaker ?? 'unknown';
        await db.monitoredEndpoint.update({
          where: { id: endpointId },
          data: { circuitBreaker: 'closed' },
        });
        return success({
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
