import { apiEndpoints } from '@/lib/self-healing-data';
import { error, success } from '@/lib/api-response';

// TODO: Move to database when backend is extracted

export async function GET() {
  try {
    const healthy = apiEndpoints.filter((e) => e.status === 'healthy').length;
    const degraded = apiEndpoints.filter((e) => e.status === 'degraded').length;
    const down = apiEndpoints.filter((e) => e.status === 'down').length;
    const circuitsOpen = apiEndpoints.filter(
      (e) => e.circuitBreaker === 'open',
    ).length;
    const totalLatency = apiEndpoints.reduce((sum, e) => sum + e.latency, 0);
    const avgErrorRate =
      Math.round(
        (apiEndpoints.reduce((sum, e) => sum + e.errorRate, 0) /
          apiEndpoints.length) *
          100,
      ) / 100;

    return success({
      endpoints: apiEndpoints,
      summary: {
        healthy,
        degraded,
        down,
        totalLatency,
        avgErrorRate,
        circuitsOpen,
      },
    });
  } catch (err) {
    console.error('[/api/api-health] Error:', err);
    return error('Failed to fetch API health');
  }
}
