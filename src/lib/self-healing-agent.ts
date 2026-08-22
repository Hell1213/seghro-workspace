// ================================================================
// Seghro Self-Healing Agent — LLM-Agnostic Core
// Works with ANY LLM provider via OpenAI-compatible API format.
// Just swap the base URL and API key.
// ================================================================

export interface LLMConfig {
  provider: string;
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface HealingContext {
  endpointName: string;
  endpointUrl: string;
  category: 'llm' | 'payment' | 'database' | 'search' | 'mcp';
  statusCode: number;
  errorMessage: string;
  latency: number;
  circuitBreakerState: 'closed' | 'open' | 'half-open';
  recentErrors: string[];
  retryCount: number;
}

export interface HealingDecision {
  action: string;
  type: 'automatic' | 'manual';
  severity: 'info' | 'warning' | 'critical';
  reasoning: string;
  steps: string[];
  fallbackProvider?: string;
  estimatedRecoveryMs: number;
}

// ---- System Prompt — LLM-Agnostic ----
// This prompt is designed to work with any frontier model
// (GPT-4o, Claude 3.5, Gemini Pro, Llama 3, Mistral, etc.)

export const SELF_HEALING_SYSTEM_PROMPT = `You are Seghro's Self-Healing Agent — an automated API reliability system.

## Your Role
You analyze API failures and decide the best recovery strategy. You are NOT a coding assistant. You are an infrastructure healing agent that makes real-time decisions to keep AI agent systems running.

## Key Principles
1. **Minimize user impact** — always prefer automatic recovery over manual intervention
2. **Preserve data integrity** — never suggest actions that could cause data loss
3. **Be provider-agnostic** — you work with any LLM/API provider
4. **Escalate appropriately** — some issues require human intervention

## Decision Framework

### For LLM Provider Failures (OpenAI, Anthropic, Gemini, etc.)
- 429 Rate Limit → Exponential backoff (1s→2s→4s→8s), then activate fallback LLM
- 500/502/503 Server Error → Open circuit breaker, route to fallback provider immediately
- Timeout (>30s) → Increase timeout by 2x, retry once, then fallback
- Context length error → Truncate context, retry, suggest prompt optimization

### For Payment API Failures (Stripe, etc.)
- 409 Conflict → Retry with idempotency key
- 402 Payment Required → Queue request, alert ops team
- 500/503 → Enable payment queue, show user-friendly message, alert immediately
- Timeout → Retry once, then queue for later processing

### For Database Failures (Redis, Pinecone, etc.)
- Connection refused → Check if maintenance, enable local cache fallback
- Timeout → Increase timeout 2x, check connection pool
- OOM → Alert ops, suggest scaling

### For MCP Server Failures
- 502/504 → Retry with exponential backoff, activate alternative MCP server
- Auth failure → Refresh credentials, retry
- Timeout → Increase timeout, check MCP server health

## Response Format
Always respond with valid JSON:
{
  "action": "<specific action name>",
  "type": "automatic" | "manual",
  "severity": "info" | "warning" | "critical",
  "reasoning": "<why this action was chosen>",
  "steps": ["<step 1>", "<step 2>"],
  "fallbackProvider": "<provider to switch to, if applicable>",
  "estimatedRecoveryMs": <number>
}

## Constraints
- If you don't have enough context, request more information rather than guessing
- Never recommend disabling security features
- Rate your confidence: if <60%, mark as "manual" so a human can verify
- Always include specific, actionable steps
`;

export const SELF_HEALING_USER_PROMPT = (ctx: HealingContext) => `
## API Failure Report

**Endpoint:** ${ctx.endpointName}
**URL:** ${ctx.endpointUrl}
**Category:** ${ctx.category}
**HTTP Status:** ${ctx.statusCode}
**Error Message:** ${ctx.errorMessage}
**Latency:** ${ctx.latency}ms
**Circuit Breaker:** ${ctx.circuitBreakerState.toUpperCase()}
**Retries Attempted:** ${ctx.retryCount}

## Recent Error History (last 5)
${ctx.recentErrors.map((e, i) => `${i + 1}. ${e}`).join('\n')}

Analyze this failure and provide the optimal healing strategy. Consider:
- The error pattern (is it transient or persistent?)
- Available fallback providers for this category
- Whether the circuit breaker state is appropriate
- If automatic recovery is safe or if human intervention is needed

Respond with ONLY the JSON healing decision.`;

// ---- Built-in healing strategies (no LLM needed for common patterns) ----

export const BUILTIN_HEALING_RULES: Record<string, Partial<HealingDecision>> = {
  // LLM rate limits
  'llm-429': {
    action: 'Exponential backoff + fallback LLM activation',
    type: 'automatic',
    severity: 'warning',
    reasoning: 'Rate limit detected. Applying exponential backoff and routing overflow to fallback LLM provider.',
    steps: ['Wait 2s (backoff)', 'Route to fallback LLM', 'Resume when rate limit clears'],
    estimatedRecoveryMs: 4000,
  },
  // LLM server errors
  'llm-5xx': {
    action: 'Circuit breaker OPEN + immediate fallback',
    type: 'automatic',
    severity: 'critical',
    reasoning: 'LLM provider server error. Opening circuit breaker and routing all traffic to fallback provider.',
    steps: ['Open circuit breaker', 'Activate fallback LLM', 'Start half-open probe in 5 min'],
    estimatedRecoveryMs: 300000,
  },
  // Payment conflicts
  'payment-409': {
    action: 'Idempotent retry',
    type: 'automatic',
    severity: 'info',
    reasoning: 'Payment conflict likely due to duplicate request. Retrying with idempotency key.',
    steps: ['Generate idempotency key', 'Retry payment intent creation'],
    estimatedRecoveryMs: 2000,
  },
  // Payment server errors
  'payment-5xx': {
    action: 'Enable payment queue + alert ops',
    type: 'automatic',
    severity: 'critical',
    reasoning: 'Payment provider down. Enabling request queue to buffer payments and alerting ops team.',
    steps: ['Enable payment queue', 'Show user-friendly message', 'Alert ops team via PagerDuty'],
    estimatedRecoveryMs: 30000,
  },
  // Database connection issues
  'db-connection': {
    action: 'Enable local cache fallback',
    type: 'automatic',
    severity: 'warning',
    reasoning: 'Database connection refused. Enabling local cache fallback and checking maintenance schedule.',
    steps: ['Switch to local cache', 'Check maintenance schedule', 'Retry connection in 30s'],
    estimatedRecoveryMs: 30000,
  },
  // Search API down
  'search-down': {
    action: 'Circuit breaker OPEN + fallback search',
    type: 'automatic',
    severity: 'critical',
    reasoning: 'Search API completely down. Opening circuit breaker and routing to fallback search provider.',
    steps: ['Open circuit breaker', 'Activate fallback search (Brave)', 'Queue pending requests'],
    estimatedRecoveryMs: 10000,
  },
  // MCP server errors
  'mcp-5xx': {
    action: 'Retry with backoff + alternative MCP',
    type: 'automatic',
    severity: 'warning',
    reasoning: 'MCP server returned server error. Retrying with exponential backoff and preparing alternative MCP server.',
    steps: ['Retry with 2s backoff', 'If fails: activate alternative MCP', 'Log incident for review'],
    estimatedRecoveryMs: 5000,
  },
  // Timeout handling
  'timeout': {
    action: 'Increase timeout + retry',
    type: 'automatic',
    severity: 'info',
    reasoning: 'Request timed out. Increasing timeout threshold by 2x and attempting one retry.',
    steps: ['Double timeout setting', 'Retry request once', 'If still times out: fallback'],
    estimatedRecoveryMs: 5000,
  },
};

// ---- Pattern matching for built-in rules ----

export function matchBuiltinRule(ctx: HealingContext): HealingDecision | null {
  const status = ctx.statusCode;
  const category = ctx.category;

  // LLM category
  if (category === 'llm') {
    if (status === 429) return { ...BUILTIN_HEALING_RULES['llm-429'], fallbackProvider: 'Alternate LLM provider' } as HealingDecision;
    if (status >= 500) return { ...BUILTIN_HEALING_RULES['llm-5xx'], fallbackProvider: 'Alternate LLM provider' } as HealingDecision;
  }

  // Payment category
  if (category === 'payment') {
    if (status === 409) return BUILTIN_HEALING_RULES['payment-409'] as HealingDecision;
    if (status >= 500) return BUILTIN_HEALING_RULES['payment-5xx'] as HealingDecision;
  }

  // Database category
  if (category === 'database') {
    if (status === 0 || ctx.errorMessage.includes('ECONNREFUSED') || ctx.errorMessage.includes('connection refused')) {
      return BUILTIN_HEALING_RULES['db-connection'] as HealingDecision;
    }
  }

  // Search category
  if (category === 'search') {
    if (status >= 500 || status === 0) return { ...BUILTIN_HEALING_RULES['search-down'], fallbackProvider: 'Brave Search' } as HealingDecision;
  }

  // MCP category
  if (category === 'mcp') {
    if (status >= 500) return BUILTIN_HEALING_RULES['mcp-5xx'] as HealingDecision;
  }

  // Timeout pattern (any category)
  if (ctx.latency > 0 && ctx.errorMessage.toLowerCase().includes('timeout')) {
    return BUILTIN_HEALING_RULES['timeout'] as HealingDecision;
  }

  return null;
}

// ---- Fallback chain definitions per category ----

export const FALLBACK_CHAINS: Record<string, string[]> = {
  llm: ['OpenAI GPT-4o', 'Anthropic Claude 3.5', 'Google Gemini Pro', 'Meta Llama 3'],
  payment: ['Stripe', 'Adyen', 'PayPal'],
  search: ['Tavily', 'Brave Search', 'Bing Web Search'],
  database: ['Pinecone', 'Weaviate', 'ChromaDB'],
  mcp: ['GitHub MCP', 'GitLab MCP', 'Local Tools'],
};

export function getNextFallback(category: string, currentProvider: string): string | null {
  const chain = FALLBACK_CHAINS[category];
  if (!chain) return null;
  const idx = chain.findIndex(p => p.toLowerCase().includes(currentProvider.toLowerCase()));
  if (idx === -1) return chain[0];
  return chain[idx + 1] ?? null;
}
