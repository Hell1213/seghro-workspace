import { NextRequest, NextResponse } from 'next/server';
import { apiEndpoints, type ApiEndpoint } from '@/lib/self-healing-data';
import { z } from 'zod';
import { error, validationError } from '@/lib/api-response';

// TODO: Move to database when backend is extracted

const postSchema = z.object({
  action: z.enum(['add', 'remove', 'health-check', 'reset-circuit']),
  endpointId: z.string().optional(),
  endpoint: z.object({
    id: z.string(),
    name: z.string(),
    baseUrl: z.string(),
  }).optional(),
});

export async function GET() {
  try {
    return NextResponse.json(apiEndpoints);
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
        const target = apiEndpoints.find((ep) => ep.id === endpointId);
        return NextResponse.json({
          success: true,
          message: target
            ? `Endpoint "${target.name}" removed successfully`
            : `Endpoint "${endpointId}" not found (simulated)`,
          endpointId,
        });
      }

      case 'health-check': {
        if (!endpointId) {
          return validationError({ endpointId: ['endpointId is required'] });
        }
        const target = apiEndpoints.find((ep) => ep.id === endpointId);
        return NextResponse.json({
          success: true,
          message: target
            ? `Health check initiated for "${target.name}"`
            : `Health check initiated for "${endpointId}" (simulated)`,
          endpointId,
          timestamp: new Date().toISOString(),
        });
      }

      case 'reset-circuit': {
        if (!endpointId) {
          return validationError({ endpointId: ['endpointId is required'] });
        }
        const target = apiEndpoints.find((ep) => ep.id === endpointId);
        return NextResponse.json({
          success: true,
          message: target
            ? `Circuit breaker reset to CLOSED for "${target.name}"`
            : `Circuit breaker reset for "${endpointId}" (simulated)`,
          endpointId,
          previousState: target?.circuitBreaker ?? 'unknown',
          newState: 'closed',
          timestamp: new Date().toISOString(),
        });
      }

      default:
        return error(`Unknown action`, 400);
    }
  } catch (err) {
    console.error('[/api/endpoints] POST Error:', err);
    return error('Failed to process endpoint action');
  }
}
