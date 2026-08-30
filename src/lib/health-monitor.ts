import { db } from './db';
import { matchBuiltinRule } from './self-healing-agent';
import { dispatchWebhooks } from './webhook-dispatcher';
import { getCircuitState, shouldAllowRequest, recordSuccess, recordFailure, tripCircuit } from './circuit-breaker';
import { executeHealingAction } from './action-executor';

export async function runHealthChecks() {
  const endpoints = await db.monitoredEndpoint.findMany({ where: { status: { not: 'maintenance' } } });
  const results: { endpointId: string; healthy: boolean; statusCode: number; latency: number; error?: string }[] = [];

  for (const ep of endpoints) {
    // Check circuit breaker before making request
    if (!shouldAllowRequest(ep.id)) {
      console.log(`[HealthMonitor] Circuit OPEN for ${ep.name}, skipping...`);
      results.push({ endpointId: ep.id, healthy: false, statusCode: 0, latency: 0, error: 'Circuit breaker OPEN' });
      continue;
    }

    const start = Date.now();
    try {
      const res = await fetch(ep.baseUrl, { method: 'GET', signal: AbortSignal.timeout(10000) });
      const latency = Date.now() - start;
      const healthy = res.ok;
      const statusCode = res.status;

      await db.monitoredEndpoint.update({
        where: { id: ep.id },
        data: {
          responseTime: latency,
          errorRate: healthy ? Math.max(0, ep.errorRate - 0.1) : Math.min(100, ep.errorRate + 5),
          lastChecked: new Date(),
          status: healthy ? (latency > 5000 ? 'degraded' : 'healthy') : 'down',
        },
      });

      if (healthy) {
        recordSuccess(ep.id);
      } else {
        recordFailure(ep.id);
      }

      results.push({ endpointId: ep.id, healthy, statusCode, latency });

      // Trigger healing if unhealthy or high latency
      if (!healthy || latency > 5000) {
        await triggerHealing(ep.id, { statusCode, latency, errorMessage: `HTTP ${statusCode}` });
      }
    } catch (err) {
      const latency = Date.now() - start;
      const statusCode = 0;
      recordFailure(ep.id);

      await db.monitoredEndpoint.update({
        where: { id: ep.id },
        data: {
          responseTime: latency,
          errorRate: Math.min(100, ep.errorRate + 10),
          lastChecked: new Date(),
          status: 'down',
        },
      });

      results.push({ endpointId: ep.id, healthy: false, statusCode, latency, error: String(err) });
      await triggerHealing(ep.id, { statusCode, latency, errorMessage: String(err) });
    }
  }

  return results;
}

async function triggerHealing(endpointId: string, context: { statusCode: number; latency: number; errorMessage: string }) {
  const endpoint = await db.monitoredEndpoint.findUnique({ where: { id: endpointId } });
  if (!endpoint) return;

  // Try built-in rules first
  const decision = matchBuiltinRule({
    endpointName: endpoint.name,
    endpointUrl: endpoint.baseUrl,
    category: endpoint.category as 'llm' | 'payment' | 'database' | 'search' | 'mcp',
    statusCode: context.statusCode,
    errorMessage: context.errorMessage,
    latency: context.latency,
    circuitBreakerState: getCircuitState(endpointId) as 'closed' | 'open' | 'half-open',
    recentErrors: [],
    retryCount: 0,
  });

  if (decision) {
    // Built-in rule matched — trip circuit and execute healing
    tripCircuit(endpointId);
    await executeHealingAction(endpointId, decision);
  } else {
    // Unknown pattern — trip circuit, use safe defaults + LLM analysis
    tripCircuit(endpointId);
    await executeHealingAction(endpointId, {
      action: 'Safe defaults applied — open circuit, alert ops',
      type: 'automatic',
      severity: 'warning',
      reasoning: `Unknown failure pattern for ${endpoint.name} (HTTP ${context.statusCode}, ${context.latency}ms). Applied safe defaults.`,
      steps: ['Open circuit breaker', 'Alert ops team via webhook'],
      estimatedRecoveryMs: 30000,
    });
    // Background LLM analysis could go here (fire-and-forget)
  }
}
