import { NextRequest } from 'next/server';
import { matchBuiltinRule, SELF_HEALING_SYSTEM_PROMPT, SELF_HEALING_USER_PROMPT, type HealingContext, type HealingDecision } from '@/lib/self-healing-agent';
import { success, error } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { executeHealingAction } from '@/lib/action-executor';
import { getCircuitState, tripCircuit } from '@/lib/circuit-breaker';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return error('Unauthorized', 401);

    const body = await request.json();
    const ctx: HealingContext = {
      endpointName: body.endpointName ?? 'unknown',
      endpointUrl: body.endpointUrl ?? '',
      category: body.category ?? 'llm',
      statusCode: body.statusCode ?? 500,
      errorMessage: body.errorMessage ?? 'Unknown error',
      latency: body.latency ?? 0,
      circuitBreakerState: body.circuitBreakerState ?? 'closed',
      recentErrors: body.recentErrors ?? [],
      retryCount: body.retryCount ?? 0,
    };

    // Try built-in rules first
    const builtinResult = matchBuiltinRule(ctx);
    if (builtinResult) {
      // Find the endpoint and execute healing
      const endpoint = await db.monitoredEndpoint.findFirst({ where: { name: ctx.endpointName } });
      if (endpoint) {
        tripCircuit(endpoint.id);
        await executeHealingAction(endpoint.id, builtinResult);
      }
      return success({
        source: 'builtin-rule',
        decision: builtinResult,
        timestamp: new Date().toISOString(),
      });
    }

    // Unknown pattern — use LLM analysis
    try {
      const { generateText } = await import('ai');
      const { openai } = await import('@ai-sdk/openai');
      
      const { text } = await generateText({
        model: openai('gpt-4o-mini'),
        system: SELF_HEALING_SYSTEM_PROMPT,
        prompt: SELF_HEALING_USER_PROMPT(ctx),
        temperature: 0.1,
      });

      const llmDecision: HealingDecision = JSON.parse(text);
      
      const endpoint = await db.monitoredEndpoint.findFirst({ where: { name: ctx.endpointName } });
      if (endpoint) {
        tripCircuit(endpoint.id);
        await executeHealingAction(endpoint.id, llmDecision);
      }

      return success({
        source: 'llm-analysis',
        decision: llmDecision,
        timestamp: new Date().toISOString(),
      });
    } catch (llmErr) {
      // LLM failed — apply safe defaults
      const endpoint = await db.monitoredEndpoint.findFirst({ where: { name: ctx.endpointName } });
      if (endpoint) {
        tripCircuit(endpoint.id);
        await executeHealingAction(endpoint.id, {
          action: 'Safe defaults applied — open circuit, alert ops',
          type: 'automatic',
          severity: 'warning',
          reasoning: `Unknown error pattern for ${ctx.endpointName} (${ctx.statusCode}). LLM analysis failed: ${String(llmErr).slice(0, 100)}. Applied safe defaults.`,
          steps: ['Open circuit breaker', 'Alert ops team via webhook'],
          estimatedRecoveryMs: 30000,
        });
      }
      return success({
        source: 'safe-defaults',
        decision: {
          action: 'Safe defaults applied',
          type: 'automatic',
          severity: 'warning',
          reasoning: 'LLM analysis failed, applied safe defaults',
          steps: ['Open circuit breaker', 'Alert ops team'],
          estimatedRecoveryMs: 30000,
        },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err) {
    return error('Failed to process healing request');
  }
}

export async function GET() {
  return success({
    capabilities: [
      'Circuit breaker: closed → open → half-open state machine',
      'Automatic fallback routing across LLM providers',
      'Exponential backoff retry with configurable limits',
      'Request queuing during outages',
      'Adaptive timeout adjustment',
      'LLM-agnostic: works with any provider via API key',
      'Built-in pattern matching for 8+ common failure types',
      'Background LLM analysis for unknown patterns',
    ],
    fallbackChains: {
      llm: ['OpenAI GPT-4o', 'Anthropic Claude 3.5', 'Google Gemini Pro', 'Meta Llama 3'],
      payment: ['Stripe', 'Adyen', 'PayPal'],
      search: ['Tavily', 'Brave Search', 'Bing Web Search'],
      database: ['Pinecone', 'Weaviate', 'ChromaDB'],
      mcp: ['GitHub MCP', 'GitLab MCP', 'Local Tools'],
    },
    supportedFailurePatterns: [
      'llm-429: Rate limit → backoff + fallback',
      'llm-5xx: Server error → circuit open + fallback',
      'payment-409: Conflict → idempotent retry',
      'payment-5xx: Payment down → queue + alert',
      'db-connection: Connection refused → cache fallback',
      'search-down: Search down → circuit open + fallback search',
      'mcp-5xx: MCP error → backoff + alternative MCP',
      'timeout: Request timeout → increase timeout + retry',
    ],
  });
}
