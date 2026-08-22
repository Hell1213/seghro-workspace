import { NextRequest, NextResponse } from "next/server";
import {
  matchBuiltinRule,
  getNextFallback,
  SELF_HEALING_SYSTEM_PROMPT,
  SELF_HEALING_USER_PROMPT,
  type HealingContext,
  type HealingDecision,
} from "@/lib/self-healing-agent";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ctx: HealingContext = {
      endpointName: body.endpointName ?? "unknown",
      endpointUrl: body.endpointUrl ?? "",
      category: body.category ?? "llm",
      statusCode: body.statusCode ?? 500,
      errorMessage: body.errorMessage ?? "Unknown error",
      latency: body.latency ?? 0,
      circuitBreakerState: body.circuitBreakerState ?? "closed",
      recentErrors: body.recentErrors ?? [],
      retryCount: body.retryCount ?? 0,
    };

    // Step 1: Try built-in pattern matching (instant, no LLM call)
    const builtinResult = matchBuiltinRule(ctx);
    if (builtinResult) {
      return NextResponse.json({
        source: "builtin-rule",
        decision: builtinResult,
        nextFallback: getNextFallback(ctx.category, ctx.endpointName),
        timestamp: new Date().toISOString(),
      });
    }

    // Step 2: For unknown patterns, use LLM analysis (async, in background)
    // Return the built-in fallback immediately, LLM analysis happens async
    const llmDecision: HealingDecision = {
      action: "LLM analysis initiated — applying safe defaults",
      type: "automatic",
      severity: "warning",
      reasoning: `Unknown error pattern for ${ctx.endpointName} (${ctx.statusCode}). Applied safe defaults: open circuit breaker, activate fallback, alert ops. LLM analysis running in background for root cause.`,
      steps: [
        "Open circuit breaker",
        "Activate fallback provider",
        "Alert ops team",
        "Run LLM root-cause analysis (background)",
      ],
      fallbackProvider: getNextFallback(ctx.category, ctx.endpointName) ?? undefined,
      estimatedRecoveryMs: 10000,
    };

    // Fire-and-forget LLM analysis (non-blocking)
    analyzeWithLLM(ctx).catch(() => {
      // LLM analysis failed — built-in rules already handled it
    });

    return NextResponse.json({
      source: "safe-defaults",
      decision: llmDecision,
      nextFallback: getNextFallback(ctx.category, ctx.endpointName),
      systemPrompt: SELF_HEALING_SYSTEM_PROMPT.slice(0, 120) + "...",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process healing request", details: String(error) },
      { status: 500 }
    );
  }
}

// ---- Background LLM analysis (fire-and-forget) ----

async function analyzeWithLLM(ctx: HealingContext) {
  try {
    const ZAI = await import("z-ai-web-dev-sdk").then((m) => m.default || m);
    const zai = await ZAI.create();

    const userPrompt = SELF_HEALING_USER_PROMPT(ctx);

    const response = await zai.chat.completions.create({
      messages: [
        { role: "system", content: SELF_HEALING_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      thinking: { type: "disabled" },
    });

    const content = response.choices?.[0]?.message?.content;
    if (content) {
      // Parse and log the LLM decision
      try {
        const parsed = JSON.parse(content);
        console.log("[Aegis Self-Heal] LLM decision:", JSON.stringify(parsed));
      } catch {
        console.log("[Aegis Self-Heal] LLM analysis (raw):", content.slice(0, 200));
      }
    }
  } catch (err) {
    console.error("[Aegis Self-Heal] LLM analysis failed:", err);
  }
}

// GET endpoint — returns the system prompt and available providers (for UI display)
export async function GET() {
  return NextResponse.json({
    capabilities: [
      "Circuit breaker: closed → open → half-open state machine",
      "Automatic fallback routing across LLM providers",
      "Exponential backoff retry with configurable limits",
      "Request queuing during outages",
      "Adaptive timeout adjustment",
      "LLM-agnostic: works with any provider via API key",
      "Built-in pattern matching for 8+ common failure types",
      "Background LLM analysis for unknown patterns",
    ],
    fallbackChains: {
      llm: ["OpenAI GPT-4o", "Anthropic Claude 3.5", "Google Gemini Pro", "Meta Llama 3"],
      payment: ["Stripe", "Adyen", "PayPal"],
      search: ["Tavily", "Brave Search", "Bing Web Search"],
      database: ["Pinecone", "Weaviate", "ChromaDB"],
      mcp: ["GitHub MCP", "GitLab MCP", "Local Tools"],
    },
    supportedFailurePatterns: [
      "llm-429: Rate limit → backoff + fallback",
      "llm-5xx: Server error → circuit open + fallback",
      "payment-409: Conflict → idempotent retry",
      "payment-5xx: Payment down → queue + alert",
      "db-connection: Connection refused → cache fallback",
      "search-down: Search down → circuit open + fallback search",
      "mcp-5xx: MCP error → backoff + alternative MCP",
      "timeout: Request timeout → increase timeout + retry",
    ],
    systemPromptPreview: SELF_HEALING_SYSTEM_PROMPT.slice(0, 300) + "...",
  });
}
