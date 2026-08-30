// ---- Self-Healing API Control System — Seed Data ----

export interface ApiEndpoint {
  id: string;
  name: string;
  baseUrl: string;
  category: 'llm' | 'payment' | 'database' | 'search' | 'mcp';
  status: 'healthy' | 'degraded' | 'down' | 'maintenance';
  circuitBreaker: 'closed' | 'open' | 'half-open';
  latency: number;
  errorRate: number;
  uptime: number;
  lastCheck: string;
  totalRequests: number;
  failedRequests: number;
  timeout: number;
  retryConfig: { maxRetries: number; backoffMs: number; enabled: boolean };
  fallbackEnabled: boolean;
  fallbackEndpoint?: string;
  tags: string[];
}

export interface HealingAction {
  id: string;
  endpointId: string;
  endpointName: string;
  action: string;
  type: 'automatic' | 'manual';
  severity: 'info' | 'warning' | 'critical';
  details: string;
  result: 'success' | 'failed' | 'pending';
  timestamp: string;
  duration?: number | null;
}

export interface HealthHistory {
  timestamp: string;
  endpointId: string;
  latency: number;
  errorRate: number;
  statusCode: number;
  responseTime: number;
}

// ---- API Endpoints ----

export const apiEndpoints: ApiEndpoint[] = [
  {
    id: 'ep-openai-gpt4o',
    name: 'OpenAI GPT-4o',
    baseUrl: 'https://api.openai.com/v1',
    category: 'llm',
    status: 'healthy',
    circuitBreaker: 'closed',
    latency: 45,
    errorRate: 0.3,
    uptime: 99.97,
    lastCheck: new Date(Date.now() - 120_000).toISOString(),
    totalRequests: 1_284_530,
    failedRequests: 3_853,
    timeout: 30_000,
    retryConfig: { maxRetries: 3, backoffMs: 1000, enabled: true },
    fallbackEnabled: true,
    fallbackEndpoint: 'ep-anthropic-claude',
    tags: ['production', 'primary-llm', 'critical'],
  },
  {
    id: 'ep-anthropic-claude',
    name: 'Anthropic Claude 3.5',
    baseUrl: 'https://api.anthropic.com/v1',
    category: 'llm',
    status: 'degraded',
    circuitBreaker: 'half-open',
    latency: 820,
    errorRate: 15.2,
    uptime: 94.1,
    lastCheck: new Date(Date.now() - 45_000).toISOString(),
    totalRequests: 876_210,
    failedRequests: 133_224,
    timeout: 30_000,
    retryConfig: { maxRetries: 5, backoffMs: 2000, enabled: true },
    fallbackEnabled: true,
    fallbackEndpoint: 'ep-openai-gpt4o',
    tags: ['production', 'fallback-llm', 'critical'],
  },
  {
    id: 'ep-pinecone',
    name: 'Pinecone Vector DB',
    baseUrl: 'https://indexing.pinecone.io',
    category: 'database',
    status: 'healthy',
    circuitBreaker: 'closed',
    latency: 12,
    errorRate: 0.1,
    uptime: 99.99,
    lastCheck: new Date(Date.now() - 30_000).toISOString(),
    totalRequests: 2_410_877,
    failedRequests: 2_410,
    timeout: 10_000,
    retryConfig: { maxRetries: 2, backoffMs: 500, enabled: true },
    fallbackEnabled: false,
    tags: ['production', 'vector-store', 'retrieval'],
  },
  {
    id: 'ep-stripe',
    name: 'Stripe Payments',
    baseUrl: 'https://api.stripe.com/v1',
    category: 'payment',
    status: 'healthy',
    circuitBreaker: 'closed',
    latency: 187,
    errorRate: 0.4,
    uptime: 99.95,
    lastCheck: new Date(Date.now() - 60_000).toISOString(),
    totalRequests: 342_091,
    failedRequests: 1_368,
    timeout: 15_000,
    retryConfig: { maxRetries: 2, backoffMs: 1000, enabled: true },
    fallbackEnabled: false,
    tags: ['production', 'payments', 'revenue-critical'],
  },
  {
    id: 'ep-tavily',
    name: 'Tavily Search',
    baseUrl: 'https://api.tavily.com',
    category: 'search',
    status: 'down',
    circuitBreaker: 'open',
    latency: 0,
    errorRate: 100,
    uptime: 0,
    lastCheck: new Date(Date.now() - 15_000).toISOString(),
    totalRequests: 523_410,
    failedRequests: 523_410,
    timeout: 10_000,
    retryConfig: { maxRetries: 3, backoffMs: 1500, enabled: true },
    fallbackEnabled: true,
    fallbackEndpoint: 'ep-brave-search',
    tags: ['production', 'web-search', 'agent-tool'],
  },
  {
    id: 'ep-redis',
    name: 'Redis Cache',
    baseUrl: 'https://redis.internal.seghro.ai',
    category: 'database',
    status: 'healthy',
    circuitBreaker: 'closed',
    latency: 3,
    errorRate: 0.05,
    uptime: 99.99,
    lastCheck: new Date(Date.now() - 10_000).toISOString(),
    totalRequests: 18_420_300,
    failedRequests: 9_210,
    timeout: 5_000,
    retryConfig: { maxRetries: 1, backoffMs: 200, enabled: true },
    fallbackEnabled: false,
    tags: ['production', 'cache', 'session-store'],
  },
  {
    id: 'ep-github-mcp',
    name: 'GitHub MCP Server',
    baseUrl: 'https://mcp.github.com/seghro',
    category: 'mcp',
    status: 'degraded',
    circuitBreaker: 'closed',
    latency: 340,
    errorRate: 6.8,
    uptime: 97.2,
    lastCheck: new Date(Date.now() - 90_000).toISOString(),
    totalRequests: 198_430,
    failedRequests: 13_493,
    timeout: 15_000,
    retryConfig: { maxRetries: 3, backoffMs: 1000, enabled: true },
    fallbackEnabled: true,
    fallbackEndpoint: 'ep-gitlab-mcp',
    tags: ['production', 'mcp', 'code-tools'],
  },
  {
    id: 'ep-notion',
    name: 'Notion API',
    baseUrl: 'https://api.notion.com/v1',
    category: 'mcp',
    status: 'maintenance',
    circuitBreaker: 'closed',
    latency: 0,
    errorRate: 0,
    uptime: 100,
    lastCheck: new Date(Date.now() - 300_000).toISOString(),
    totalRequests: 67_820,
    failedRequests: 340,
    timeout: 10_000,
    retryConfig: { maxRetries: 2, backoffMs: 1000, enabled: false },
    fallbackEnabled: false,
    tags: ['production', 'mcp', 'knowledge-base', 'scheduled-maintenance'],
  },
];

// ---- Healing Actions ----

export const healingActions: HealingAction[] = [
  {
    id: 'ha-001',
    endpointId: 'ep-tavily',
    endpointName: 'Tavily Search',
    action: 'Circuit breaker opened',
    type: 'automatic',
    severity: 'critical',
    details:
      'Tavily Search API returned 5xx errors on 10 consecutive requests within 30 seconds. Circuit breaker tripped to OPEN state. All traffic diverted to fallback endpoint (Brave Search).',
    result: 'success',
    timestamp: new Date(Date.now() - 1_800_000).toISOString(),
    duration: 245,
  },
  {
    id: 'ha-002',
    endpointId: 'ep-anthropic-claude',
    endpointName: 'Anthropic Claude 3.5',
    action: 'Fallback activated',
    type: 'automatic',
    severity: 'warning',
    details:
      'Anthropic Claude 3.5 latency exceeded 800ms threshold (measured 1,240ms). 12 requests rerouted to OpenAI GPT-4o fallback endpoint while monitoring continues.',
    result: 'success',
    timestamp: new Date(Date.now() - 3_600_000).toISOString(),
    duration: 89,
  },
  {
    id: 'ha-003',
    endpointId: 'ep-github-mcp',
    endpointName: 'GitHub MCP Server',
    action: 'Retry initiated',
    type: 'automatic',
    severity: 'info',
    details:
      'GitHub MCP Server returned 502 Bad Gateway on file tree request. Retry #2 of 3 succeeded with 200 OK. Total recovery time: 3.2s.',
    result: 'success',
    timestamp: new Date(Date.now() - 5_400_000).toISOString(),
    duration: 3200,
  },
  {
    id: 'ha-004',
    endpointId: 'ep-anthropic-claude',
    endpointName: 'Anthropic Claude 3.5',
    action: 'Circuit breaker set to half-open',
    type: 'automatic',
    severity: 'warning',
    details:
      'After 5 minutes in OPEN state, circuit breaker transitioned to HALF-OPEN. Probing with 5% of traffic to assess recovery. Error rate must drop below 5% to fully close.',
    result: 'pending',
    timestamp: new Date(Date.now() - 2_700_000).toISOString(),
    duration: 120,
  },
  {
    id: 'ha-005',
    endpointId: 'ep-tavily',
    endpointName: 'Tavily Search',
    action: 'Queue enabled',
    type: 'automatic',
    severity: 'critical',
    details:
      'Tavily Search fully down. Request queueing enabled to buffer 500 pending search requests. Queue will drain to fallback (Brave Search) at 50 req/s. Estimated drain time: 10 seconds.',
    result: 'success',
    timestamp: new Date(Date.now() - 1_200_000).toISOString(),
    duration: 10_500,
  },
  {
    id: 'ha-006',
    endpointId: 'ep-notion',
    endpointName: 'Notion API',
    action: 'Timeout increased',
    type: 'manual',
    severity: 'info',
    details:
      'Ops team manually increased Notion API timeout from 5,000ms to 10,000ms due to planned maintenance window. Retry disabled during maintenance to avoid load on Notion infrastructure.',
    result: 'success',
    timestamp: new Date(Date.now() - 7_200_000).toISOString(),
    duration: null,
  },
  {
    id: 'ha-007',
    endpointId: 'ep-openai-gpt4o',
    endpointName: 'OpenAI GPT-4o',
    action: 'Retry initiated',
    type: 'automatic',
    severity: 'info',
    details:
      'OpenAI GPT-4o returned 429 rate limit on burst of 50 concurrent requests. Exponential backoff retry (1s → 2s → 4s) resolved all requests within 7s.',
    result: 'success',
    timestamp: new Date(Date.now() - 9_000_000).toISOString(),
    duration: 7000,
  },
  {
    id: 'ha-008',
    endpointId: 'ep-tavily',
    endpointName: 'Tavily Search',
    action: 'Fallback activated',
    type: 'automatic',
    severity: 'critical',
    details:
      'Tavily Search outage detected. All search queries automatically rerouted to Brave Search API. Zero requests dropped. FSLI (Full-Service Level Indicator) maintained at 100%.',
    result: 'success',
    timestamp: new Date(Date.now() - 900_000).toISOString(),
    duration: 15,
  },
  {
    id: 'ha-009',
    endpointId: 'ep-github-mcp',
    endpointName: 'GitHub MCP Server',
    action: 'Circuit breaker opened',
    type: 'automatic',
    severity: 'warning',
    details:
      'GitHub MCP Server error rate spiked to 22% over 2-minute window. Circuit breaker opened to protect downstream agents. Half-open probe scheduled in 60 seconds.',
    result: 'success',
    timestamp: new Date(Date.now() - 14_400_000).toISOString(),
    duration: 180,
  },
  {
    id: 'ha-010',
    endpointId: 'ep-anthropic-claude',
    endpointName: 'Anthropic Claude 3.5',
    action: 'Fallback activated',
    type: 'manual',
    severity: 'warning',
    details:
      'On-call engineer manually activated OpenAI GPT-4o fallback for Anthropic Claude 3.5 after observing sustained 820ms+ latency affecting user-facing agent responses.',
    result: 'success',
    timestamp: new Date(Date.now() - 10_800_000).toISOString(),
    duration: null,
  },
  {
    id: 'ha-011',
    endpointId: 'ep-stripe',
    endpointName: 'Stripe Payments',
    action: 'Retry initiated',
    type: 'automatic',
    severity: 'info',
    details:
      'Stripe API returned 409 Conflict on concurrent payment intent creation. Optimistic retry with idempotency key resolved in 2 attempts (1.8s total).',
    result: 'success',
    timestamp: new Date(Date.now() - 18_000_000).toISOString(),
    duration: 1800,
  },
  {
    id: 'ha-012',
    endpointId: 'ep-pinecone',
    endpointName: 'Pinecone Vector DB',
    action: 'Timeout increased',
    type: 'automatic',
    severity: 'info',
    details:
      'Pinecone upsert latency temporarily increased to 45ms during index rebalancing. Timeout auto-adjusted from 10,000ms to 15,000ms. Latency returned to baseline after 4 minutes.',
    result: 'success',
    timestamp: new Date(Date.now() - 21_600_000).toISOString(),
    duration: 240_000,
  },
  {
    id: 'ha-013',
    endpointId: 'ep-tavily',
    endpointName: 'Tavily Search',
    action: 'Circuit breaker reset attempt',
    type: 'manual',
    severity: 'critical',
    details:
      'Ops team attempted manual circuit breaker reset for Tavily Search. Probe request failed with 503. Circuit breaker remains OPEN. Next automatic retry in 30 seconds.',
    result: 'failed',
    timestamp: new Date(Date.now() - 600_000).toISOString(),
    duration: 5000,
  },
];

// ---- Health History (24 points per endpoint, 15-min intervals, last 6 hours) ----

function generateHealthHistory(): HealthHistory[] {
  const history: HealthHistory[] = [];
  const now = Date.now();
  const sixHoursMs = 6 * 60 * 60 * 1000;
  const intervalMs = 15 * 60 * 1000;
  const points = 24;

  const endpointProfiles: Record<
    string,
    { baseLatency: number; baseErrorRate: number; degradedAfter?: number; downAfter?: number }
  > = {
    'ep-openai-gpt4o': { baseLatency: 42, baseErrorRate: 0.2 },
    'ep-anthropic-claude': { baseLatency: 380, baseErrorRate: 1.5, degradedAfter: 3 },
    'ep-pinecone': { baseLatency: 11, baseErrorRate: 0.08 },
    'ep-stripe': { baseLatency: 180, baseErrorRate: 0.3 },
    'ep-tavily': { baseLatency: 120, baseErrorRate: 0.5, downAfter: 2 },
    'ep-redis': { baseLatency: 2, baseErrorRate: 0.03 },
    'ep-github-mcp': { baseLatency: 180, baseErrorRate: 1.2, degradedAfter: 5 },
    'ep-notion': { baseLatency: 95, baseErrorRate: 0.1 },
  };

  for (const [epId, profile] of Object.entries(endpointProfiles)) {
    for (let i = 0; i < points; i++) {
      const ts = new Date(now - sixHoursMs + i * intervalMs).toISOString();
      const hourIndex = i;

      let latency = profile.baseLatency;
      let errorRate = profile.baseErrorRate;
      let statusCode = 200;

      // Simulate degradation and outage progression
      if (profile.downAfter !== undefined && hourIndex >= profile.downAfter) {
        if (hourIndex === profile.downAfter) {
          latency = 5000;
          errorRate = 45;
          statusCode = 502;
        } else {
          latency = 0;
          errorRate = 100;
          statusCode = 503;
        }
      } else if (profile.degradedAfter !== undefined && hourIndex >= profile.degradedAfter) {
        const degradationProgress = Math.min(
          1,
          (hourIndex - profile.degradedAfter) / 4
        );
        latency =
          profile.baseLatency +
          (epId === 'ep-anthropic-claude'
            ? degradationProgress * 440
            : degradationProgress * 160);
        errorRate =
          profile.baseErrorRate + degradationProgress * (epId === 'ep-anthropic-claude' ? 13.7 : 5.6);
        statusCode = Math.random() > 0.7 ? 429 : 200;
      }

      // Add realistic jitter
      const jitter = 1 + (Math.random() - 0.5) * 0.3;
      latency = Math.round(latency * jitter);
      errorRate = Math.round(errorRate * 100) / 100;
      errorRate = Math.max(0, errorRate);

      history.push({
        timestamp: ts,
        endpointId: epId,
        latency: Math.max(0, latency),
        errorRate,
        statusCode,
        responseTime: Math.max(0, latency + Math.round(Math.random() * 5)),
      });
    }
  }

  return history;
}

export const healthHistory: HealthHistory[] = generateHealthHistory();
