export type CircuitBreakerState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerConfig {
  failureThreshold: number;
  cooldownMs: number;
  halfOpenSuccessThreshold: number;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 50,
  cooldownMs: 30000,
  halfOpenSuccessThreshold: 3,
};

interface CircuitEntry {
  state: CircuitBreakerState;
  lastTripped: number;
  consecutiveSuccesses: number;
}

const stateStore = new Map<string, CircuitEntry>();

export function getCircuitState(endpointId: string): CircuitBreakerState {
  return stateStore.get(endpointId)?.state ?? 'closed';
}

export function shouldAllowRequest(endpointId: string, config: CircuitBreakerConfig = DEFAULT_CONFIG): boolean {
  const entry = stateStore.get(endpointId);
  if (!entry) return true;

  if (entry.state === 'closed') return true;
  if (entry.state === 'open') {
    if (Date.now() - entry.lastTripped > config.cooldownMs) {
      entry.state = 'half-open';
      entry.consecutiveSuccesses = 0;
      return true;
    }
    return false;
  }
  if (entry.state === 'half-open') return true;
  return true;
}

export function recordSuccess(endpointId: string, config: CircuitBreakerConfig = DEFAULT_CONFIG) {
  const entry = stateStore.get(endpointId) ?? { state: 'closed', lastTripped: 0, consecutiveSuccesses: 0 };
  entry.consecutiveSuccesses++;
  if (entry.state === 'half-open' && entry.consecutiveSuccesses >= config.halfOpenSuccessThreshold) {
    entry.state = 'closed';
    entry.consecutiveSuccesses = 0;
  }
  stateStore.set(endpointId, entry);
}

export function recordFailure(endpointId: string, config: CircuitBreakerConfig = DEFAULT_CONFIG) {
  const entry = stateStore.get(endpointId) ?? { state: 'closed', lastTripped: 0, consecutiveSuccesses: 0 };
  if (entry.state === 'half-open') {
    entry.state = 'open';
    entry.lastTripped = Date.now();
    entry.consecutiveSuccesses = 0;
  } else if (entry.state === 'closed') {
    entry.state = 'open';
    entry.lastTripped = Date.now();
  }
  stateStore.set(endpointId, entry);
}

export function tripCircuit(endpointId: string) {
  stateStore.set(endpointId, { state: 'open', lastTripped: Date.now(), consecutiveSuccesses: 0 });
}

export function resetCircuit(endpointId: string) {
  stateStore.set(endpointId, { state: 'closed', lastTripped: 0, consecutiveSuccesses: 0 });
}
