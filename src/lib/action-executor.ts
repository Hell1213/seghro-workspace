import { db } from './db';
import { dispatchWebhooks } from './webhook-dispatcher';
import { tripCircuit, resetCircuit, getCircuitState } from './circuit-breaker';

export interface HealingDecision {
  action: string;
  type: 'automatic' | 'manual';
  severity: 'info' | 'warning' | 'critical';
  reasoning: string;
  steps: string[];
  estimatedRecoveryMs: number;
}

export async function executeHealingAction(endpointId: string, decision: HealingDecision) {
  const endpoint = await db.monitoredEndpoint.findUnique({ where: { id: endpointId } });
  if (!endpoint) return;

  for (const step of decision.steps) {
    const lower = step.toLowerCase();
    if (lower.includes('open circuit breaker') && !lower.includes('reset')) {
      tripCircuit(endpointId);
      await db.monitoredEndpoint.update({ where: { id: endpointId }, data: { circuitBreaker: 'open' } });
    } else if (lower.includes('reset') && lower.includes('circuit')) {
      resetCircuit(endpointId);
      await db.monitoredEndpoint.update({ where: { id: endpointId }, data: { circuitBreaker: 'closed' } });
    } else if (lower.includes('half-open')) {
      await db.monitoredEndpoint.update({ where: { id: endpointId }, data: { circuitBreaker: 'half-open' } });
    } else if (lower.includes('activate fallback')) {
      // Fallback routing is handled externally
    } else if (lower.includes('alert')) {
      await dispatchWebhooks('healing.alert', {
        endpoint: endpoint.name,
        action: decision.action,
        severity: decision.severity,
      });
    }
  }

  await db.healingAction.create({
    data: {
      type: decision.type,
      endpointName: endpoint.name,
      action: decision.action,
      result: 'success',
      severity: decision.severity,
      reasoning: decision.reasoning,
      steps: JSON.stringify(decision.steps),
      timestamp: new Date(),
    },
  });

  await dispatchWebhooks('healing.executed', {
    endpointId,
    endpointName: endpoint.name,
    action: decision.action,
    severity: decision.severity,
    steps: decision.steps,
    estimatedRecoveryMs: decision.estimatedRecoveryMs,
  });
}
