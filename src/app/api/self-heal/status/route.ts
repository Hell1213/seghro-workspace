import { NextRequest } from 'next/server';
import { getAuthSession } from '@/lib/auth-guard';
import { db } from '@/lib/db';
import { success, error } from '@/lib/api-response';
import { getCircuitState } from '@/lib/circuit-breaker';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user) return error('Unauthorized', 401);

    const endpoints = await db.monitoredEndpoint.findMany({ orderBy: { lastChecked: 'desc' } });
    const recentHealing = await db.healingAction.findMany({ take: 5, orderBy: { timestamp: 'desc' } });

    return success({
      endpoints: endpoints.map(ep => ({
        ...ep,
        circuitState: getCircuitState(ep.id),
        isHealthy: ep.status === 'healthy',
      })),
      recentActions: recentHealing,
      summary: {
        total: endpoints.length,
        healthy: endpoints.filter(e => e.status === 'healthy').length,
        degraded: endpoints.filter(e => e.status === 'degraded').length,
        down: endpoints.filter(e => e.status === 'down').length,
        circuitsOpen: endpoints.filter(e => e.circuitBreaker === 'open').length,
      },
    });
  } catch (err) {
    return error('Failed to fetch healing status');
  }
}
