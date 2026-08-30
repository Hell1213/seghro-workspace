# Seghro — Principal Engineer's Complete Production Work Plan

> **For Hermes:** Use subagent-driven-development to implement task-by-task.

**Goal:** Make EVERY feature in Seghro actually WORK in production — not demo, not stub, not "concept." A real user can sign up, create an API key, send traces from their AI agent, see self-healing actually execute, and get billed. YC-demo-day ready.

**Architecture:** Build the self-healing agentic loop as the centerpiece (background monitor → circuit breaker state machine → fallback routing → LLM analysis → action executor), wrap it with real AI agent SDKs, add real Stripe billing, real Resend email, harden security, and deploy to production with PostgreSQL + Redis.

**Total Estimated Time:** 60-80 hours (2-3 weeks solo, 1 week intensive)

---

## PHASE 0: FOUNDATION (Blockers — Must Be First)

### Task 0.1: .gitignore + .env.example + Package Rename

**Objective:** Standardize project identity and prevent credential leaks.

**Files:**
- Create: `.gitignore`
- Create: `.env.example`
- Modify: `package.json:2`

**Step 1: Create `.gitignore`**

```gitignore
node_modules/
.next/
out/
build/
.standalone/
.env
.env.local
.env.*.local
db/*.db
db/*.db-journal
db/*.db-wal
db/*.db-shm
*.log
.DS_Store
Thumbs.db
.idea/
.vscode/
*.swp
coverage/
.nyc_output/
*.tsbuildinfo
next-env.d.ts
```

**Step 2: Create `.env.example`**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/seghro
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_ID=
GITHUB_SECRET=
RAZORPAY_KEY_ID=rzp_test_
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
RAZORPAY_PLAN_STARTER=plan_
RAZORPAY_PLAN_PRO=plan_
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_
RESEND_API_KEY=re_
EMAIL_FROM=Seghro <noreply@seghro.dev>
OPENAI_API_KEY=sk-
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Step 3: Rename package**

Change `package.json:2` from `"nextjs_tailwind_shadcn_ts"` to `"seghro"`.

**Step 4: Verify**

Run: `bun run lint`
Expected: 0 errors

**Step 5: Commit**

```bash
git add .gitignore .env.example package.json
git commit -m "chore: add gitignore, env example, rename to seghro"
```

---

### Task 0.2: Migrate SQLite → PostgreSQL

**Objective:** Production-grade database with concurrent writes.

**Files:**
- Modify: `prisma/schema.prisma:14-17`
- Modify: `.env` (local dev)

**Step 1: Update Prisma schema**

Change `provider = "sqlite"` to `provider = "postgresql"`.

Change `url = env("DATABASE_URL")` stays the same.

**Step 2: Update .env**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/seghro
```

**Step 3: Create migration**

Run: `bun run db:generate`
Expected: "Generated Prisma Client"

Run: `bunx prisma migrate dev --name init`
Expected: "Migration created and applied"

**Step 4: Seed database**

Run: `bun run db:seed`
Expected: Seeded without errors

**Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: migrate from sqlite to postgresql"
```

---

### Task 0.3: Fix Demo Data Leak

**Objective:** Unauthenticated users see ONLY isolated demo data, not real user data.

**Files:**
- Create: `src/lib/demo-data.ts`
- Modify: `src/lib/org-scope.ts`
- Modify: `src/app/api/agents/route.ts`
- Modify: `src/app/api/traces/route.ts`
- Modify: `src/app/api/issues/route.ts`
- Modify: `src/app/api/alerts/route.ts`
- Modify: `src/app/api/metrics/route.ts`
- Modify: `src/app/api/stats/route.ts`
- Modify: `src/app/api/activity/route.ts`

**Step 1: Create `src/lib/demo-data.ts`**

```typescript
export const DEMO_ORG_ID = "demo-org-seghro";

export function isDemoMode(orgId: string | null): boolean {
  return !orgId || orgId === DEMO_ORG_ID;
}

export const demoAgents = [
  { id: "demo-agent-1", name: "support-agent", description: "Customer support LLM agent", status: "active", framework: "LangChain", lastRunAt: new Date(Date.now() - 120000).toISOString(), totalRuns: 14832, errorRate: 3.2, avgLatency: 4.2, _count: { traces: 247, issues: 3 } },
  { id: "demo-agent-2", name: "research-agent", description: "Research assistant", status: "active", framework: "CrewAI", lastRunAt: new Date(Date.now() - 300000).toISOString(), totalRuns: 8291, errorRate: 1.1, avgLatency: 8.7, _count: { traces: 189, issues: 1 } },
];

export const demoTraces = [
  { id: "demo-trace-1", agentId: "demo-agent-1", traceId: "trace_demo_001", status: "success", duration: 4200, inputTokens: 1840, outputTokens: 420, createdAt: new Date(Date.now() - 120000).toISOString(), agent: { name: "support-agent", framework: "LangChain" }, spans: [{ id: "s1", name: "llm_call", type: "model", status: "success", duration: 3200, startTime: 0, model: "gpt-4o", tool: null, inputTokens: 1840, outputTokens: 420 }] },
];

export const demoIssues = [
  { id: "demo-issue-1", agentId: "demo-agent-1", agentName: "support-agent", title: "High latency on model calls", description: "GPT-4o calls averaging 4.2s", severity: "P1", status: "open", affectedRuns: 120, totalRuns: 14832, failureRate: 0.8, rootCause: "Model provider elevated latency", suggestedFix: "Enable fallback to GPT-4o-mini", createdAt: new Date(Date.now() - 7200000).toISOString(), updatedAt: new Date(Date.now() - 300000).toISOString() },
];

export const demoAlerts = [
  { id: "demo-alert-1", title: "Demo: checkout-agent error rate", message: "This is demo data", severity: "warning", status: "unread", channel: "slack", createdAt: new Date(Date.now() - 600000).toISOString() },
];

export const demoMetrics = {
  timeSeries: [{ name: "Error Rate %", color: "#dc2626", data: Array.from({ length: 24 }, (_, i) => ({ timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(), value: 5 + Math.random() * 4 })) }],
  cards: [
    { label: "Total Agents", value: "2", change: "+1 this week", trend: "up" as const },
    { label: "Active Traces", value: "436", change: "+12% vs yesterday", trend: "up" as const },
    { label: "Open Issues", value: "1", change: "1 high", trend: "down" as const },
    { label: "Avg Error Rate", value: "2.2%", change: "-0.5% vs last week", trend: "down" as const },
    { label: "Total Token Usage", value: "840K", change: "+8% this week", trend: "up" as const },
    { label: "Mean Latency", value: "6.5s", change: "+0.2s vs yesterday", trend: "up" as const },
  ],
  severityBreakdown: [{ name: "P1 High", value: 1, color: "#f87171" }, { name: "Resolved", value: 1, color: "#9ca3af" }],
  frameworkDistribution: [{ name: "LangChain", value: 1, color: "#dc2626" }, { name: "CrewAI", value: 1, color: "#6b7280" }],
};

export const demoStats = { totalAgents: 2, activeAgents: 2, totalTraces: 436, totalIssues: 2, openIssues: 1, criticalIssues: 0, avgErrorRate: 2.2, avgLatency: 6.5, tokensUsed24h: 840000 };

export const demoActivity = [
  { id: "demo-activity-1", type: "trace" as const, title: "Trace completed for support-agent", description: "Full observability trace captured", agentName: "support-agent", severity: "info" as const, timestamp: new Date(Date.now() - 120000).toISOString(), metadata: { spans: "5", duration: "4.2s", tokens: "2260" } },
];
```

**Step 2: Update all API routes**

In each GET handler, after getting `orgId`:

```typescript
import { isDemoMode, demoAgents } from '@/lib/demo-data';

if (isDemoMode(orgId)) {
  return success(demoAgents);
}
```

**Step 3: Commit**

```bash
git add src/lib/demo-data.ts src/app/api/agents/route.ts src/app/api/traces/route.ts src/app/api/issues/route.ts src/app/api/alerts/route.ts src/app/api/metrics/route.ts src/app/api/stats/route.ts src/app/api/activity/route.ts
git commit -m "fix: isolate demo data from real user data"
```

---

## PHASE 1: SELF-HEALING AGENTIC LOOP (The Core Product)

This is THE differentiator. Everything else supports this.

### Task 1.1: Background Health Monitor (Cron Job)

**Objective:** Continuously ping all monitored endpoints, detect failures, trigger healing.

**Files:**
- Create: `src/lib/health-monitor.ts`
- Create: `src/app/api/cron/health-check/route.ts`

**Step 1: Create health monitor**

Create `src/lib/health-monitor.ts`:

```typescript
import { db } from './db';
import { matchBuiltinRule } from './self-healing-agent';
import { dispatchWebhooks } from './webhook-dispatcher';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function runHealthChecks() {
  const endpoints = await db.monitoredEndpoint.findMany({ where: { status: { not: 'maintenance' } } });
  const results: { endpointId: string; healthy: boolean; statusCode: number; latency: number; error?: string }[] = [];

  for (const ep of endpoints) {
    const start = Date.now();
    try {
      const res = await fetch(ep.baseUrl, { method: 'GET', signal: AbortSignal.timeout(ep.responseTime || 10000) });
      const latency = Date.now() - start;
      const healthy = res.ok;
      const statusCode = res.status;

      await db.monitoredEndpoint.update({
        where: { id: ep.id },
        data: { latency, errorRate: healthy ? Math.max(0, ep.errorRate - 0.1) : Math.min(100, ep.errorRate + 5), lastChecked: new Date() },
      });

      results.push({ endpointId: ep.id, healthy, statusCode, latency });

      // Check if we should trigger healing
      if (!healthy || latency > 5000) {
        await triggerHealing(ep.id, { statusCode, latency, errorMessage: `HTTP ${statusCode}` });
      }
    } catch (err) {
      const latency = Date.now() - start;
      const statusCode = 0;
      await db.monitoredEndpoint.update({
        where: { id: ep.id },
        data: { latency, errorRate: Math.min(100, ep.errorRate + 10), lastChecked: new Date() },
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
    category: endpoint.category as any,
    statusCode: context.statusCode,
    errorMessage: context.errorMessage,
    latency: context.latency,
    circuitBreakerState: endpoint.circuitBreaker as any,
    recentErrors: [],
    retryCount: 0,
  });

  if (decision) {
    // Built-in rule matched — execute healing
    await executeHealing(endpoint, decision);
  } else {
    // Unknown pattern — use LLM + safe defaults
    await analyzeWithLLM(endpoint, context);
  }
}

async function executeHealing(endpoint: any, decision: any) {
  // Update circuit breaker state
  if (decision.action.includes('Circuit breaker OPEN')) {
    await db.monitoredEndpoint.update({ where: { id: endpoint.id }, data: { circuitBreaker: 'open' } });
  } else if (decision.action.includes('Circuit breaker set to half-open')) {
    await db.monitoredEndpoint.update({ where: { id: endpoint.id }, data: { circuitBreaker: 'half-open' } });
  } else if (decision.action.includes('reset to CLOSED')) {
    await db.monitoredEndpoint.update({ where: { id: endpoint.id }, data: { circuitBreaker: 'closed' } });
  }

  // Log healing action
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

  // Dispatch webhooks
  await dispatchWebhooks('healing.executed', { endpointName: endpoint.name, action: decision.action, severity: decision.severity });
}

async function analyzeWithLLM(endpoint: any, context: { statusCode: number; latency: number; errorMessage: string }) {
  try {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      system: `You are an API reliability expert. Analyze this API failure and return a JSON healing decision with fields: action, type (automatic/manual), severity (info/warning/critical), reasoning, steps (array), estimatedRecoveryMs.`,
      userPrompt: `Endpoint: ${endpoint.name}\nURL: ${endpoint.baseUrl}\nStatus: ${context.statusCode}\nError: ${context.errorMessage}\nLatency: ${context.latency}ms\nCategory: ${endpoint.category}`,
    });

    const decision = JSON.parse(text);
    await executeHealing(endpoint, decision);
  } catch (err) {
    // LLM failed — apply safe defaults
    await executeHealing(endpoint, {
      action: 'Safe defaults applied — open circuit, alert ops',
      type: 'automatic',
      severity: 'warning',
      reasoning: `LLM analysis failed: ${String(err)}. Applied safe defaults.`,
      steps: ['Open circuit breaker', 'Alert ops team via webhook'],
      estimatedRecoveryMs: 30000,
    });
  }
}
```

**Step 2: Create cron endpoint**

Create `src/app/api/cron/health-check/route.ts`:

```typescript
import { runHealthChecks } from '@/lib/health-monitor';
import { success, error } from '@/lib/api-response';

export async function GET() {
  try {
    const results = await runHealthChecks();
    return success({ checked: results.length, results });
  } catch (err) {
    return error('Health check run failed');
  }
}
```

**Step 3: Set up cron job in package.json**

Add to `package.json`:

```json
"scripts": {
  "cron:health": "curl -s http://localhost:3000/api/cron/health-check"
}
```

**Step 4: Schedule with system cron or external service**

For production, use a cron service (GitHub Actions, Vercel Cron, or Railway Cron):

Create `.github/workflows/health-check.yml`:

```yaml
name: Health Check Monitor
on:
  schedule:
    - cron: '*/5 * * * *'
jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - run: curl -s ${{ secrets.APP_URL }}/api/cron/health-check
```

**Step 5: Commit**

```bash
git add src/lib/health-monitor.ts src/app/api/cron/health-check/route.ts .github/workflows/health-check.yml
git commit -m "feat: add background health monitoring with cron scheduling"
```

---

### Task 1.2: Circuit Breaker State Machine

**Objective:** Implement the closed → open → half-open state machine with proper transitions.

**Files:**
- Create: `src/lib/circuit-breaker.ts`
- Modify: `src/lib/health-monitor.ts`

**Step 1: Create circuit breaker utility**

Create `src/lib/circuit-breaker.ts`:

```typescript
export type CircuitBreakerState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerConfig {
  failureThreshold: number; // Error rate % to trip (default 50)
  cooldownMs: number; // Time in OPEN before trying HALF-OPEN (default 30000)
  halfOpenSuccessThreshold: number; // Consecutive successes to close (default 3)
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 50,
  cooldownMs: 30000,
  halfOpenSuccessThreshold: 3,
};

const stateStore = new Map<string, { state: CircuitBreakerState; lastTripped: number; consecutiveSuccesses: number }>();

export function getCircuitState(endpointId: string): CircuitBreakerState {
  return stateStore.get(endpointId)?.state ?? 'closed';
}

export function shouldAllowRequest(endpointId: string, config: CircuitBreakerConfig = DEFAULT_CONFIG): boolean {
  const entry = stateStore.get(endpointId);
  if (!entry) return true; // No entry = closed = allow

  if (entry.state === 'closed') return true;
  if (entry.state === 'open') {
    // Check cooldown
    if (Date.now() - entry.lastTripped > config.cooldownMs) {
      entry.state = 'half-open';
      entry.consecutiveSuccesses = 0;
      return true; // Allow probe request
    }
    return false; // Still in cooldown
  }
  if (entry.state === 'half-open') return true; // Allow probe requests
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
    // Check if error rate exceeds threshold (this is done externally)
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
```

**Step 2: Integrate into health monitor**

In `health-monitor.ts`, add circuit breaker checks before making requests:

```typescript
import { shouldAllowRequest, recordSuccess, recordFailure, tripCircuit, getCircuitState } from './circuit-breaker';

// Inside runHealthChecks, before fetch:
if (!shouldAllowRequest(ep.id)) {
  // Circuit is open, skip this endpoint
  continue;
}

// After fetch:
if (healthy) {
  recordSuccess(ep.id);
} else {
  recordFailure(ep.id);
  if (/* error rate > threshold */) {
    tripCircuit(ep.id);
  }
}
```

**Step 3: Commit**

```bash
git add src/lib/circuit-breaker.ts
git commit -m "feat: add circuit breaker state machine with proper transitions"
```

---

### Task 1.3: Fallback Routing Engine

**Objective:** When primary endpoint fails, route requests to fallback provider.

**Files:**
- Create: `src/lib/fallback-router.ts`

**Step 1: Create fallback router**

Create `src/lib/fallback-router.ts`:

```typescript
import { FALLBACK_CHAINS, getNextFallback } from './self-healing-agent';

export interface RouteResult {
  success: boolean;
  provider: string;
  response?: Response;
  error?: string;
  latency: number;
}

export async function routeWithFallback(
  endpointName: string,
  category: 'llm' | 'payment' | 'database' | 'search' | 'mcp',
  requestFn: (providerName: string, providerUrl: string) => Promise<Response>
): Promise<RouteResult> {
  const chain = FALLBACK_CHAINS[category] || [];
  const startIndex = chain.findIndex(p => p.toLowerCase().includes(endpointName.toLowerCase()));
  const orderedProviders = [...chain.slice(startIndex), ...chain.slice(0, startIndex)];

  for (const provider of orderedProviders) {
    const start = Date.now();
    try {
      const response = await requestFn(provider, getProviderUrl(provider));
      return { success: response.ok, provider, response, latency: Date.now() - start };
    } catch (err) {
      continue; // Try next provider
    }
  }

  return { success: false, provider: 'none', error: 'All providers failed', latency: 0 };
}

function getProviderUrl(providerName: string): string {
  const urls: Record<string, string> = {
    'OpenAI GPT-4o': 'https://api.openai.com/v1',
    'Anthropic Claude 3.5': 'https://api.anthropic.com/v1',
    'Google Gemini Pro': 'https://generativelanguage.googleapis.com/v1',
    'Stripe': 'https://api.stripe.com/v1',
    'Tavily': 'https://api.tavily.com',
    'Brave Search': 'https://api.search.brave.com',
  };
  return urls[providerName] || '';
}
```

**Step 2: Commit**

```bash
git add src/lib/fallback-router.ts
git commit -m "feat: add fallback routing engine with provider chains"
```

---

### Task 1.4: Action Executor (Actually Perform Healing)

**Objective:** When a healing decision is made, actually execute the actions.

**Files:**
- Create: `src/lib/action-executor.ts`
- Modify: `src/lib/health-monitor.ts` (use action executor)

**Step 1: Create action executor**

Create `src/lib/action-executor.ts`:

```typescript
import { db } from './db';
import { dispatchWebhooks } from './webhook-dispatcher';
import { resetCircuit } from './circuit-breaker';

export interface HealingAction {
  action: string;
  type: 'automatic' | 'manual';
  severity: 'info' | 'warning' | 'critical';
  reasoning: string;
  steps: string[];
  estimatedRecoveryMs: number;
}

export async function executeHealingAction(endpointId: string, action: HealingAction) {
  const endpoint = await db.monitoredEndpoint.findUnique({ where: { id: endpointId } });
  if (!endpoint) return;

  // Execute steps
  for (const step of action.steps) {
    if (step.toLowerCase().includes('open circuit breaker')) {
      await db.monitoredEndpoint.update({ where: { id: endpointId }, data: { circuitBreaker: 'open' } });
    } else if (step.toLowerCase().includes('reset') && step.toLowerCase().includes('circuit')) {
      await db.monitoredEndpoint.update({ where: { id: endpointId }, data: { circuitBreaker: 'closed' } });
      resetCircuit(endpointId);
    } else if (step.toLowerCase().includes('half-open')) {
      await db.monitoredEndpoint.update({ where: { id: endpointId }, data: { circuitBreaker: 'half-open' } });
    } else if (step.toLowerCase().includes('activate fallback')) {
      // Fallback routing is handled by fallback-router.ts
    } else if (step.toLowerCase().includes('alert')) {
      await dispatchWebhooks('healing.alert', { endpoint: endpoint.name, action: action.action, severity: action.severity });
    }
  }

  // Log to HealingAction
  await db.healingAction.create({
    data: {
      type: action.type,
      endpointName: endpoint.name,
      action: action.action,
      result: 'success',
      severity: action.severity,
      reasoning: action.reasoning,
      steps: JSON.stringify(action.steps),
      timestamp: new Date(),
    },
  });

  // Dispatch webhooks
  await dispatchWebhooks('healing.executed', {
    endpointId,
    endpointName: endpoint.name,
    action: action.action,
    severity: action.severity,
    steps: action.steps,
    estimatedRecoveryMs: action.estimatedRecoveryMs,
  });
}
```

**Step 2: Update health-monitor.ts to use action executor**

Replace the inline healing execution with:

```typescript
import { executeHealingAction } from './action-executor';

// In triggerHealing:
if (decision) {
  await executeHealingAction(endpoint.id, decision);
}
```

**Step 3: Commit**

```bash
git add src/lib/action-executor.ts
git commit -m "feat: add action executor that performs real healing actions"
```

---

### Task 1.5: Self-Healing Status API

**Objective:** Expose healing status via API for dashboard consumption.

**Files:**
- Create: `src/app/api/self-heal/status/route.ts`

**Step 1: Create status endpoint**

```typescript
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
```

**Step 2: Commit**

```bash
git add src/app/api/self-heal/status/route.ts
git commit -m "feat: add self-healing status API for dashboard"
```

---

### Task 1.6: Add AI SDK for LLM Integration

**Objective:** Real LLM-powered analysis for unknown failure patterns.

**Files:**
- Install: `ai`, `@ai-sdk/openai`

**Step 1: Install packages**

Run: `bun add ai @ai-sdk/openai`

**Step 2: Add OPENAI_API_KEY to .env**

```env
OPENAI_API_KEY=sk-...
```

**Step 3: Update self-heal/route.ts to use real LLM**

Replace the background analysis with:

```typescript
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

// In analyzeWithLLM:
const { text } = await generateText({
  model: openai('gpt-4o-mini'),
  system: SELF_HEALING_SYSTEM_PROMPT,
  userPrompt: SELF_HEALING_USER_PROMPT(ctx),
  temperature: 0.1,
});
```

**Step 4: Commit**

```bash
git commit -am "feat: integrate OpenAI SDK for real LLM analysis"
```

---

### Task 1.7: Seed Monitored Endpoints

**Objective:** Populate real monitored endpoints for demo + real users.

**Files:**
- Modify: `prisma/seed.ts`

**Step 1: Add endpoint seeding**

In `prisma/seed.ts`, add:

```typescript
// Seed monitored endpoints
const endpoints = [
  { id: 'ep-openai-gpt4o', name: 'OpenAI GPT-4o', baseUrl: 'https://api.openai.com/v1', category: 'llm', status: 'healthy', circuitBreaker: 'closed', latency: 45, errorRate: 0.3, responseTime: 45 },
  { id: 'ep-anthropic-claude', name: 'Anthropic Claude 3.5', baseUrl: 'https://api.anthropic.com/v1', category: 'llm', status: 'degraded', circuitBreaker: 'half-open', latency: 820, errorRate: 15.2, responseTime: 820 },
  { id: 'ep-stripe', name: 'Stripe Payments', baseUrl: 'https://api.stripe.com/v1', category: 'payment', status: 'healthy', circuitBreaker: 'closed', latency: 187, errorRate: 0.4, responseTime: 187 },
  { id: 'ep-tavily', name: 'Tavily Search', baseUrl: 'https://api.tavily.com', category: 'search', status: 'down', circuitBreaker: 'open', latency: 0, errorRate: 100, responseTime: 0 },
];

for (const ep of endpoints) {
  await db.monitoredEndpoint.upsert({ where: { id: ep.id }, update: ep, create: ep });
  console.log(`✅ Endpoint created: ${ep.name}`);
}
```

**Step 2: Run seed**

Run: `bun run db:seed`

**Step 3: Commit**

```bash
git add prisma/seed.ts
git commit -m "feat: seed monitored endpoints for self-healing"
```

---

## PHASE 2: AI AGENT INTEGRATIONS (Data Ingestion)

### Task 2.1: OpenTelemetry OTLP Endpoint

**Objective:** Accept traces from any OTel-compatible agent.

**Files:**
- Create: `src/app/api/otlp/v1/traces/route.ts`
- Create: `src/lib/otlp-parser.ts`

**Step 1: Create OTLP traces endpoint**

Create `src/app/api/otlp/v1/traces/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { validateApiKey } from '@/lib/api-key-auth';
import { success, error } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const authUser = await validateApiKey(request.headers.get('Authorization'));
    if (!authUser) return error('Unauthorized', 401);

    const contentType = request.headers.get('Content-Type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      const spans = body.resourceSpans?.flatMap((rs: any) =>
        rs.scopeSpans?.flatMap((ss: any) => ss.spans || []) || []
      ) || [];

      for (const span of spans) {
        await processOtelSpan(span, authUser.id);
      }

      return success({ acceptedSpans: spans.length });
    }

    return error('Unsupported content type', 415);
  } catch (err) {
    console.error('[/api/otlp/v1/traces] Error:', err);
    return error('Failed to process traces');
  }
}

async function processOtelSpan(span: any, userId: string) {
  const agentName = span.attributes?.find((a: any) => a.key === 'agent.name')?.value?.stringValue || 'unknown';
  const framework = span.attributes?.find((a: any) => a.key === 'agent.framework')?.value?.stringValue || 'custom';

  const existingAgent = await db.agent.findFirst({ where: { name: agentName } });
  let agent;
  if (existingAgent) {
    agent = await db.agent.update({ where: { id: existingAgent.id }, data: { lastRunAt: new Date(), totalRuns: { increment: 1 } } });
  } else {
    agent = await db.agent.create({ data: { name: agentName, framework, lastRunAt: new Date(), totalRuns: 1 } });
  }

  const trace = await db.trace.create({
    data: {
      agentId: agent.id,
      traceId: span.traceId || crypto.randomUUID(),
      status: span.status?.code === 2 ? 'error' : 'success',
      duration: ((span.endTimeUnixNano || 0) - (span.startTimeUnixNano || 0)) / 1_000_000,
      inputTokens: parseInt(span.attributes?.find((a: any) => a.key === 'llm.usage.input_tokens')?.value?.intValue || '0'),
      outputTokens: parseInt(span.attributes?.find((a: any) => a.key === 'llm.usage.output_tokens')?.value?.intValue || '0'),
      metadata: JSON.stringify(span.attributes),
    },
  });

  await db.span.create({
    data: {
      traceId: trace.id,
      name: span.name || 'unknown',
      type: span.attributes?.find((a: any) => a.key === 'span.type')?.value?.stringValue || null,
      status: span.status?.code === 2 ? 'error' : 'success',
      duration: ((span.endTimeUnixNano || 0) - (span.startTimeUnixNano || 0)) / 1_000_000,
      startTime: (span.startTimeUnixNano || 0) / 1_000_000,
      model: span.attributes?.find((a: any) => a.key === 'llm.model')?.value?.stringValue || null,
      tool: span.attributes?.find((a: any) => a.key === 'tool.name')?.value?.stringValue || null,
    },
  });
}

export async function GET() {
  return success({ status: 'ok', endpoint: '/api/otlp/v1/traces', formats: ['application/json'], auth: 'Bearer seghro_sk_...' });
}
```

**Step 2: Commit**

```bash
git add src/app/api/otlp/v1/traces/route.ts
git commit -m "feat: add OpenTelemetry OTLP trace ingestion endpoint"
```

---

### Task 2.2: Create @seghro/sdk (npm Package)

**Objective:** One-line trace ingestion for JS/TS AI agents.

**Files:**
- Create: `packages/js-sdk/package.json`
- Create: `packages/js-sdk/tsconfig.json`
- Create: `packages/js-sdk/src/index.ts`
- Create: `packages/js-sdk/src/seghro-client.ts`
- Create: `packages/js-sdk/src/langchain-callback.ts`
- Create: `packages/js-sdk/src/vercel-ai.ts`
- Create: `packages/js-sdk/README.md`

**Step 1: Create package.json**

```json
{
  "name": "@seghro/sdk",
  "version": "0.1.0",
  "description": "Seghro AI Agent Observability SDK",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": { "build": "tsc", "dev": "tsc --watch" },
  "dependencies": { "@opentelemetry/api": "^1.9.0" },
  "peerDependencies": { "@langchain/core": ">=0.1.0", "ai": ">=3.0.0" },
  "peerDependenciesMeta": { "@langchain/core": { "optional": true }, "ai": { "optional": true } },
  "devDependencies": { "typescript": "^5.0.0", "@types/node": "^20.0.0" },
  "license": "MIT"
}
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": { "target": "ES2020", "module": "commonjs", "lib": ["ES2020"], "declaration": true, "outDir": "./dist", "rootDir": "./src", "strict": true, "esModuleInterop": true, "skipLibCheck": true },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Create src/seghro-client.ts**

```typescript
export interface SeghroConfig { apiKey: string; endpoint?: string; agentName: string; agentFramework?: string; debug?: boolean; }
export interface TraceInput { traceId?: string; status: 'success' | 'error' | 'timeout'; duration: number; inputTokens?: number; outputTokens?: number; spans?: SpanInput[]; metadata?: Record<string, unknown>; }
export interface SpanInput { name: string; type?: 'model' | 'tool' | 'guard' | 'retrieval' | 'output' | 'custom'; status: 'success' | 'error' | 'warning'; duration: number; startTime?: number; model?: string; tool?: string; inputTokens?: number; outputTokens?: number; }

export class SeghroClient {
  private apiKey: string;
  private endpoint: string;
  private agentName: string;
  private agentFramework: string;
  private debug: boolean;

  constructor(config: SeghroConfig) {
    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint || 'https://seghro.dev/api/otlp/v1/traces';
    this.agentName = config.agentName;
    this.agentFramework = config.agentFramework || 'custom';
    this.debug = config.debug || false;
  }

  async ingestTrace(input: TraceInput): Promise<{ success: boolean; traceId?: string }> {
    const traceId = input.traceId || crypto.randomUUID();
    const now = Date.now();

    const payload = {
      resourceSpans: [{
        resource: { attributes: [{ key: 'service.name', value: { stringValue: this.agentName } }, { key: 'service.framework', value: { stringValue: this.agentFramework } }] },
        scopeSpans: [{
          scope: { name: '@seghro/sdk', version: '0.1.0' },
          spans: [{
            traceId, spanId: crypto.randomUUID().replace(/-/g, '').slice(0, 16), name: `${this.agentName}.run`, kind: 1,
            startTimeUnixNano: (now - input.duration) * 1_000_000, endTimeUnixNano: now * 1_000_000,
            attributes: [
              { key: 'agent.name', value: { stringValue: this.agentName } },
              { key: 'agent.framework', value: { stringValue: this.agentFramework } },
              { key: 'llm.usage.input_tokens', value: { intValue: String(input.inputTokens || 0) } },
              { key: 'llm.usage.output_tokens', value: { intValue: String(input.outputTokens || 0) } },
            ],
            status: { code: input.status === 'error' ? 2 : 0 },
          }],
        }],
      }],
    };

    try {
      const res = await fetch(this.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` }, body: JSON.stringify(payload) });
      if (this.debug) console.log(`[Seghro] Trace ${traceId}: ${res.status}`);
      return { success: res.ok, traceId };
    } catch (err) {
      if (this.debug) console.error('[Seghro] Failed:', err);
      return { success: false };
    }
  }
}
```

**Step 4: Create src/langchain-callback.ts**

```typescript
import { SeghroClient, TraceInput, SpanInput } from './seghro-client';

export class SeghroCallbackHandler {
  private client: SeghroClient;
  private spans: SpanInput[] = [];
  private startTime = 0;

  constructor(config: { apiKey: string; agentName: string; endpoint?: string; debug?: boolean }) {
    this.client = new SeghroClient({ ...config, agentFramework: 'LangChain' });
  }

  async handleChainStart() { this.startTime = Date.now(); this.spans = []; }
  async handleLLMStart(llm: any, prompts: string[]) { this.spans.push({ name: 'llm_call', type: 'model', status: 'success', duration: 0, model: llm.id?.at(-1) || 'unknown' }); }
  async handleLLMEnd(output: any) {
    const last = this.spans[this.spans.length - 1];
    if (last?.name === 'llm_call') { last.duration = Date.now() - this.startTime; last.inputTokens = output.llmOutput?.tokenUsage?.promptTokens || 0; last.outputTokens = output.llmOutput?.tokenUsage?.completionTokens || 0; }
  }
  async handleChainEnd() {
    await this.client.ingestTrace({ status: 'success', duration: Date.now() - this.startTime, inputTokens: this.spans.reduce((s, sp) => s + (sp.inputTokens || 0), 0), outputTokens: this.spans.reduce((s, sp) => s + (sp.outputTokens || 0), 0), spans: this.spans });
  }
  async handleChainError(error: Error) { await this.client.ingestTrace({ status: 'error', duration: Date.now() - this.startTime, spans: this.spans, metadata: { error: error.message } }); }
}
```

**Step 5: Create src/vercel-ai.ts**

```typescript
import { SeghroClient } from './seghro-client';

export function seghroTelemetry(config: { apiKey: string; agentName: string; endpoint?: string }) {
  const client = new SeghroClient({ ...config, agentFramework: 'Vercel AI SDK' });
  return {
    isEnabled: true,
    recordEvent: async (event: any) => {
      if (event.name === 'ai.generateText.doGenerate') {
        await client.ingestTrace({ status: 'success', duration: event.attributes?.['ai.response.msToFirstChunk'] || 0, inputTokens: event.attributes?.['ai.usage.promptTokens'] || 0, outputTokens: event.attributes?.['ai.usage.completionTokens'] || 0 });
      }
    },
  };
}
```

**Step 6: Create src/index.ts**

```typescript
export { SeghroClient } from './seghro-client';
export { SeghroCallbackHandler } from './langchain-callback';
export { seghroTelemetry } from './vercel-ai';
```

**Step 7: Build**

Run: `cd packages/js-sdk && bun install && bun run build`

**Step 8: Commit**

```bash
git add packages/js-sdk/
git commit -m "feat: add @seghro/sdk npm package for JS/TS agents"
```

---

### Task 2.3: Create seghro Python SDK (pip Package)

**Objective:** One-line trace ingestion for Python AI agents.

**Files:**
- Create: `packages/python-sdk/pyproject.toml`
- Create: `packages/python-sdk/seghro/__init__.py`
- Create: `packages/python-sdk/seghro/client.py`
- Create: `packages/python-sdk/seghro/langchain_callback.py`
- Create: `packages/python-sdk/README.md`

**Step 1: Create pyproject.toml**

```toml
[build-system]
requires = ["setuptools>=68.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "seghro"
version = "0.1.0"
description = "Seghro AI Agent Observability SDK for Python"
readme = "README.md"
license = { text = "MIT" }
requires-python = ">=3.9"
dependencies = ["httpx>=0.25.0"]
classifiers = ["Programming Language :: Python :: 3"]

[project.optional-dependencies]
langchain = ["langchain-core>=0.1.0"]
all = ["langchain-core>=0.1.0"]

[project.urls]
Homepage = "https://seghro.dev"

[tool.setuptools.packages.find]
include = ["seghro*"]
```

**Step 2: Create seghro/client.py**

```python
"""Seghro Python SDK — trace ingestion client."""

from __future__ import annotations
import time
import uuid
from typing import Any, Optional
import httpx


class SeghroClient:
    def __init__(self, api_key: str, agent_name: str, agent_framework: str = "custom", endpoint: str = "https://seghro.dev/api/otlp/v1/traces", debug: bool = False):
        self.api_key = api_key
        self.endpoint = endpoint
        self.agent_name = agent_name
        self.agent_framework = agent_framework
        self.debug = debug
        self._client = httpx.Client(timeout=10.0)

    def ingest_trace(self, status: str = "success", duration: float = 0, input_tokens: int = 0, output_tokens: int = 0, spans: Optional[list] = None, metadata: Optional[dict] = None) -> dict:
        trace_id = str(uuid.uuid4())
        now_ns = int(time.time() * 1_000_000_000)
        payload = {
            "resourceSpans": [{
                "resource": {"attributes": [{"key": "service.name", "value": {"stringValue": self.agent_name}}, {"key": "service.framework", "value": {"stringValue": self.agent_framework}}]},
                "scopeSpans": [{
                    "scope": {"name": "seghro.python", "version": "0.1.0"},
                    "spans": [{
                        "traceId": trace_id, "spanId": uuid.uuid4().hex[:16], "name": f"{self.agent_name}.run", "kind": 1,
                        "startTimeUnixNano": str(now_ns - int(duration * 1_000_000)), "endTimeUnixNano": str(now_ns),
                        "attributes": [{"key": "agent.name", "value": {"stringValue": self.agent_name}}, {"key": "llm.usage.input_tokens", "value": {"intValue": str(input_tokens)}}, {"key": "llm.usage.output_tokens", "value": {"intValue": str(output_tokens)}}],
                        "status": {"code": 2 if status == "error" else 0},
                    }],
                }],
            }]
        }
        try:
            res = self._client.post(self.endpoint, json=payload, headers={"Content-Type": "application/json", "Authorization": f"Bearer {self.api_key}"})
            return {"success": res.is_success, "traceId": trace_id}
        except Exception:
            return {"success": False}

    def close(self):
        self._client.close()
```

**Step 3: Create seghro/langchain_callback.py**

```python
"""LangChain callback handler for Seghro observability."""

from __future__ import annotations
import time
from seghro.client import SeghroClient

class SeghroCallbackHandler:
    def __init__(self, api_key: str, agent_name: str, endpoint: str = None, debug: bool = False):
        self.client = SeghroClient(api_key=api_key, agent_name=agent_name, agent_framework="LangChain", endpoint=endpoint or "https://seghro.dev/api/otlp/v1/traces", debug=debug)
        self.spans = []
        self.start_time = 0

    def on_chain_start(self, serialized, inputs, **kwargs):
        self.start_time = time.time()
        self.spans = []

    def on_llm_end(self, response, **kwargs):
        pass  # Add span tracking

    def on_chain_end(self, outputs, **kwargs):
        duration = (time.time() - self.start_time) * 1000
        self.client.ingest_trace(status="success", duration=duration, spans=self.spans)

    def on_chain_error(self, error, **kwargs):
        duration = (time.time() - self.start_time) * 1000
        self.client.ingest_trace(status="error", duration=duration, spans=self.spans)
```

**Step 4: Create seghro/__init__.py**

```python
from seghro.client import SeghroClient
__version__ = "0.1.0"
__all__ = ["SeghroClient"]
```

**Step 5: Commit**

```bash
git add packages/python-sdk/
git commit -m "feat: add seghro Python SDK for AI agent integrations"
```

---

## PHASE 3: REVENUE INFRASTRUCTURE

### Task 3.1: Real Razorpay Integration

**Objective:** Replace mock billing with real Razorpay checkout + subscriptions for India-first SaaS.

**Files:**
- Install: `razorpay`
- Create: `src/lib/razorpay.ts`
- Modify: `src/lib/billing.ts`
- Create: `src/app/api/billing/webhook/route.ts`
- Create: `src/app/api/billing/checkout/route.ts` (rewrite)
- Create: `src/app/api/billing/portal/route.ts` (rewrite)

**Step 1: Install Razorpay**

Run: `bun add razorpay`

**Step 2: Create razorpay.ts**

```typescript
import Razorpay from 'razorpay';

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const RAZORPAY_PLANS = {
  starter: process.env.RAZORPAY_PLAN_STARTER, // plan_xxx
  pro: process.env.RAZORPAY_PLAN_PRO, // plan_xxx
} as const;
```

**Step 3: Update billing.ts**

```typescript
import { razorpay, RAZORPAY_PLANS } from './razorpay';
import { db } from './db';

export async function createCheckoutSession(plan: PlanType, orgId: string, customerEmail: string) {
  const org = await db.organization.findUniqueOrThrow({ where: { id: orgId } });

  let razorpayCustomerId = org.stripeCustomerId;
  if (!razorpayCustomerId) {
    // Razorpay doesn't have customer objects — store org reference in notes
    razorpayCustomerId = orgId;
  }

  const planId = RAZORPAY_PLANS[plan];
  if (!planId) throw new Error(`No Razorpay plan for: ${plan}`);

  // Create Razorpay subscription
  const subscription = await razorpay.subscriptions.create({
    plan_id: planId,
    total_count: 12, // 12 billing cycles
    customer_notify: 1,
    notes: { orgId, plan, customerEmail },
  });

  // Store subscriptionId on org
  await db.organization.update({
    where: { id: orgId },
    data: { stripeCustomerId: subscription.id },
  });

  return {
    url: `${process.env.NEXTAUTH_URL}/billing/razorpay?subscription_id=${subscription.id}`,
    sessionId: subscription.id,
  };
}

export async function createPortalSession(orgId: string) {
  // Razorpay doesn't have a portal — return billing page
  return { url: `${process.env.NEXTAUTH_URL}/billing` };
}
```

**Step 4: Create webhook handler**

Create `src/app/api/billing/webhook/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { success, error } from '@/lib/api-response';
import crypto from 'crypto';

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-razorpay-signature')!;

  // Verify webhook signature
  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');

  if (signature !== expected) {
    return error('Invalid signature', 400);
  }

  const event = JSON.parse(body);
  const payload = event.payload.subscription?.entity || event.payload.payment?.entity;

  switch (event.event) {
    case 'subscription.activated':
    case 'subscription.charged': {
      const { orgId, plan } = payload.notes;
      await db.organization.update({
        where: { id: orgId },
        data: { plan },
      });
      break;
    }
    case 'subscription.cancelled':
    case 'subscription.halted': {
      const { orgId } = payload.notes;
      await db.organization.update({
        where: { id: orgId },
        data: { plan: 'starter' },
      });
      break;
    }
    case 'payment.failed': {
      const { orgId } = payload.notes;
      // Alert the org admin — could send email/webhook here
      console.warn(`Payment failed for org ${orgId}`);
      break;
    }
  }

  return success({ received: true });
}
```

**Step 5: Create Razorpay payment page**

Create `src/app/billing/razorpay/page.tsx` — handles Razorpay checkout flow:

```tsx
'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';

export default function RazorpayCheckout() {
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get('subscription_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

  useEffect(() => {
    if (!subscriptionId) return;

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      subscription_id: subscriptionId,
      name: 'Seghro',
      description: 'Subscription Payment',
      handler: async (response: any) => {
        // Verify payment on server
        const res = await fetch('/api/billing/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });
        if (res.ok) setStatus('success');
        else setStatus('failed');
      },
      modal: {
        ondismiss: () => setStatus('failed'),
      },
      theme: { color: '#dc2626' },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  }, [subscriptionId]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {status === 'loading' && <p>Loading payment...</p>}
      {status === 'success' && <p>Payment successful! Redirecting to dashboard...</p>}
      {status === 'failed' && <p>Payment failed. Please try again.</p>}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
    </div>
  );
}
```

**Step 6: Add stripeCustomerId field**

Add `stripeCustomerId String?` to Organization model (rename conceptually but keep field name for compatibility).

**Step 7: Commit**

```bash
git add src/lib/razorpay.ts src/lib/billing.ts src/app/api/billing/webhook/route.ts src/app/billing/razorpay/page.tsx prisma/schema.prisma
git commit -m "feat: integrate real Razorpay billing with webhooks"
```

---

### Task 3.2: Resend Email Integration

**Objective:** Send real transactional emails.

**Files:**
- Install: `resend`
- Create: `src/lib/email.ts`
- Modify: `src/app/api/auth/forgot-password/route.ts`
- Modify: `src/app/api/auth/send-verification/route.ts`

**Step 1: Install**

Run: `bun add resend`

**Step 2: Create email.ts**

```typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'Seghro <noreply@seghro.dev>';
const URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export async function sendPasswordResetEmail(email: string, token: string) {
  await resend.emails.send({ from: FROM, to: email, subject: 'Reset your Seghro password', html: `<a href="${URL}/reset-password?token=${token}">Reset Password</a>` });
}
export async function sendVerificationEmail(email: string, token: string) {
  await resend.emails.send({ from: FROM, to: email, subject: 'Verify your Seghro email', html: `<a href="${URL}/verify-email?token=${token}">Verify Email</a>` });
}
```

**Step 3: Update auth routes to call email functions**

**Step 4: Commit**

```bash
git add src/lib/email.ts src/app/api/auth/forgot-password/route.ts src/app/api/auth/send-verification/route.ts
git commit -m "feat: integrate Resend for transactional emails"
```

---

## PHASE 4: SECURITY & PRODUCTION HARDENING

### Task 4.1: CORS/CSP/CSRF Fixes

**Objective:** Harden headers, restrict CORS, add CSRF tokens.

**Files:**
- Modify: `next.config.ts`
- Modify: `src/middleware.ts`
- Create: `src/lib/csrf.ts`

**Step 1: Fix CORS**

Change `Access-Control-Allow-Origin` from `*` to `process.env.ALLOWED_ORIGINS || 'https://seghro.dev'`.

**Step 2: Tighten CSP**

Remove `'unsafe-inline'` from script-src, add nonce-based CSP.

**Step 3: Add CSRF tokens**

Create `src/lib/csrf.ts` with `generateCsrfToken()` and `validateCsrfToken()`.

**Step 4: Add to state-changing routes**

All POST/PATCH/DELETE routes must validate CSRF token from header.

**Step 5: Commit**

```bash
git add next.config.ts src/middleware.ts src/lib/csrf.ts
git commit -m "security: fix CORS/CSP/CSRF"
```

---

### Task 4.2: Ownership Verification on PATCH Routes

**Objective:** Prevent cross-org data modification.

**Files:**
- Modify: `src/app/api/issues/route.ts`
- Modify: `src/app/api/alerts/route.ts`

**Step 1: Add org-scoping check**

In PATCH handlers, verify the resource belongs to the user's org before updating.

**Step 2: Commit**

```bash
git add src/app/api/issues/route.ts src/app/api/alerts/route.ts
git commit -m "security: add ownership verification to PATCH routes"
```

---

### Task 4.3: API Key Auth Performance Fix

**Objective:** O(n) → O(1) lookup with prefix indexing.

**Files:**
- Modify: `src/lib/api-key-auth.ts`
- Modify: `prisma/schema.prisma`

**Step 1: Add index to keyPrefix**

Add `@@index([keyPrefix])` to ApiKey model.

**Step 2: Filter by prefix first**

Extract prefix from key, filter `where: { keyPrefix }`, then bcrypt.compare only against candidates.

**Step 3: Commit**

```bash
git add src/lib/api-key-auth.ts prisma/schema.prisma
git commit -m "perf: fix O(n) API key lookup with prefix indexing"
```

---

### Task 4.4: Remove Hardcoded Webhook Secret

**Objective:** Force explicit webhook secret, remove default.

**Files:**
- Modify: `src/lib/webhook-dispatcher.ts`

**Step 1: Remove DEFAULT_SECRET**

Change the fallback to throw error if no secret is set.

**Step 2: Commit**

```bash
git add src/lib/webhook-dispatcher.ts
git commit -m "security: remove hardcoded webhook default secret"
```

---

## PHASE 5: GROWTH & DEPLOYMENT

### Task 5.1: Waitlist API

**Objective:** Capture interested AI engineers.

**Files:**
- Create: `src/app/api/waitlist/route.ts`
- Add model: `Waitlist` in schema.prisma

**Step 1: Create waitlist endpoint**

POST `/api/waitlist` with `{ email, source }` — stores in DB.

**Step 2: Commit**

```bash
git add src/app/api/waitlist/route.ts prisma/schema.prisma
git commit -m "feat: add waitlist API for traction tracking"
```

---

### Task 5.2: Public Agent Status Pages

**Objective:** Viral growth — agents get a public status page.

**Files:**
- Create: `src/app/status/[agentId]/page.tsx`

**Step 1: Create public status page**

Read-only page showing agent health, powered by Seghro branding.

**Step 2: Commit**

```bash
git add src/app/status/
git commit -m "feat: add public agent status pages for viral growth"
```

---

### Task 5.3: Deploy to Production

**Objective:** Get Seghro running on a real domain.

**Steps:**
1. Push to GitHub
2. Connect to Vercel/Railway
3. Set environment variables
4. Run migrations
5. Configure custom domain (seghro.dev)

---

## PHASE 6: QUALITY ASSURANCE

### Task 6.1: E2E Tests (Playwright)

**Objective:** Prevent regressions in production.

**Files:**
- Create: `tests/e2e/auth.spec.ts`
- Create: `tests/e2e/dashboard.spec.ts`
- Create: `tests/e2e/ingest.spec.ts`

**Step 1: Install Playwright**

Run: `bun add -d @playwright/test`

**Step 2: Write tests**

Test: registration → login → create API key → ingest trace → verify trace appears → trigger healing → verify healing action logged.

**Step 3: Commit**

```bash
git add tests/e2e/
git commit -m "test: add E2E tests for critical user flows"
```

---

### Task 6.2: Load Testing

**Objective:** Verify the system handles expected traffic.

**Files:**
- Create: `tests/load/ingest.js` (k6 script)

**Step 1: Write k6 script**

Simulate 100 concurrent agents ingesting traces.

**Step 2: Run**

Run: `k6 run tests/load/ingest.js`

**Step 3: Fix any bottlenecks**

---

## FINAL SUMMARY

| Phase | Tasks | Time |
|-------|-------|------|
| 0: Foundation | 0.1-0.3 | 2-3h |
| 1: Self-Healing Loop | 1.1-1.7 | 10-12h |
| 2: AI Integrations | 2.1-2.3 | 4-6h |
| 3: Revenue | 3.1-3.2 | 2-3h |
| 4: Security | 4.1-4.4 | 2-3h |
| 5: Growth/Deploy | 5.1-5.3 | 3-4h |
| 6: QA | 6.1-6.2 | 2-3h |
| **Total** | | **25-34h** |

---

## WHAT MAKES THIS YC-READY AFTER THIS PLAN

1. **Self-healing is REAL** — not demo. Background worker pings endpoints, trips circuits, routes fallbacks, calls LLM for analysis, executes actions, logs everything.

2. **Real agents send real traces** — SDKs for JS/TS + Python, OTel endpoint for any framework.

3. **Real billing** — Stripe checkout, subscriptions, webhooks.

4. **Real email** — password reset, verification.

5. **Production infrastructure** — PostgreSQL, Redis, proper deployment.

6. **Security** — CORS/CSP/CSRF hardened, ownership checks everywhere.

7. **Growth loop** — waitlist, public status pages.

8. **Quality** — E2E tests, load testing.

**The self-healing agentic loop is the wedge. Everything else is the moat.**
