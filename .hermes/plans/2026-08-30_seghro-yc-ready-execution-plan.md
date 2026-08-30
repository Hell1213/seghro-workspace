# Seghro → YC-Ready: Complete Execution Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Transform Seghro from a demo into a YC-fundable product with real AI agent integrations, real billing, real email, and a path to 10-50 beta users.

**Architecture:** Add OpenTelemetry-compatible trace ingestion (universal standard), framework-specific SDK adapters (LangChain, CrewAI, Vercel AI), real Stripe billing, Resend email, PostgreSQL migration, and a waitlist landing page. Ship an npm package for JS/TS agents and a pip package for Python agents.

**Tech Stack:** Next.js 16, TypeScript, Bun, Prisma, PostgreSQL, Stripe, Resend, OpenTelemetry SDK, npm, PyPI

---

## Phase 0: Foundation (Do First — Unblocks Everything)

### Task 0.1: Create .gitignore and .env.example

**Objective:** Prevent credential leakage and onboard future contributors.

**Files:**
- Create: `.gitignore`
- Create: `.env.example`

**Step 1: Create `.gitignore`**

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
.next/
out/
build/
.standalone/

# Environment
.env
.env.local
.env.*.local

# Database
db/*.db
db/*.db-journal
db/*.db-wal
db/*.db-shm

# Logs
*.log
dev.log
server.log

# OS
.DS_Store
Thumbs.db

# IDE
.idea/
.vscode/
*.swp
*.swo

# Testing
coverage/
.nyc_output/

# Misc
*.tsbuildinfo
next-env.d.ts
```

**Step 2: Create `.env.example`**

```env
# Database
DATABASE_URL=file:./db/custom.db

# NextAuth
NEXTAUTH_SECRET=your-random-32-char-secret-here
NEXTAUTH_URL=http://localhost:3000

# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_ID=
GITHUB_SECRET=

# Stripe (get from dashboard)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...

# Resend Email
RESEND_API_KEY=re_...
EMAIL_FROM=Seghro <noreply@seghro.dev>

# OpenTelemetry
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

**Step 3: Commit**

```bash
git add .gitignore .env.example
git commit -m "chore: add gitignore and env example"
```

---

### Task 0.2: Rename Package to "seghro"

**Objective:** Fix generic package name for professional presentation.

**Files:**
- Modify: `package.json:2`

**Step 1: Update package name**

Change line 2 from:
```json
"name": "nextjs_tailwind_shadcn_ts",
```
to:
```json
"name": "seghro",
```

**Step 2: Commit**

```bash
git add package.json
git commit -m "chore: rename package to seghro"
```

---

### Task 0.3: Migrate from SQLite to PostgreSQL

**Objective:** Enable concurrent writes, multi-user support, and production deployment.

**Files:**
- Modify: `prisma/schema.prisma:14-17`
- Create: `prisma/migrations/0001_init/migration.sql` (auto-generated)
- Modify: `.env.example` (update DATABASE_URL format)

**Step 1: Update Prisma datasource**

Change:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```
to:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Step 2: Update .env.example DATABASE_URL**

Change to:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/seghro
```

**Step 3: Generate migration**

Run: `bun run db:generate`
Expected: "Generated Prisma Client"

Run: `bunx prisma migrate dev --name init`
Expected: "Migration created"

**Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/ .env.example
git commit -m "feat: migrate from sqlite to postgresql"
```

---

### Task 0.4: Fix Demo Mode Data Leak

**Objective:** Unauthenticated users should see ONLY demo data, not real user data.

**Files:**
- Create: `src/lib/demo-data.ts`
- Modify: `src/lib/org-scope.ts:7-16`
- Modify: `src/app/api/agents/route.ts:18-34`
- Modify: `src/app/api/traces/route.ts:14-32`
- Modify: `src/app/api/issues/route.ts:18-36`
- Modify: `src/app/api/alerts/route.ts:13-23`
- Modify: `src/app/api/metrics/route.ts:50-65`
- Modify: `src/app/api/stats/route.ts:8-21`
- Modify: `src/app/api/activity/route.ts:18-31`

**Step 1: Create demo data provider**

Create `src/lib/demo-data.ts`:

```typescript
// Demo organization ID — never assign real users to this
export const DEMO_ORG_ID = "demo-org-seghro";

// Check if a request is in demo mode (unauthenticated)
export function isDemoMode(orgId: string | null): boolean {
  return !orgId || orgId === DEMO_ORG_ID;
}

// Demo agent data for unauthenticated users
export const demoAgents = [
  {
    id: "demo-agent-1",
    name: "support-agent",
    description: "Customer support LLM agent",
    status: "active",
    framework: "LangChain",
    lastRunAt: new Date(Date.now() - 120000).toISOString(),
    totalRuns: 14832,
    errorRate: 3.2,
    avgLatency: 4.2,
    _count: { traces: 247, issues: 3 },
  },
  {
    id: "demo-agent-2",
    name: "research-agent",
    description: "Research assistant",
    status: "active",
    framework: "CrewAI",
    lastRunAt: new Date(Date.now() - 300000).toISOString(),
    totalRuns: 8291,
    errorRate: 1.1,
    avgLatency: 8.7,
    _count: { traces: 189, issues: 1 },
  },
  {
    id: "demo-agent-3",
    name: "checkout-agent",
    description: "E-commerce checkout flow",
    status: "degraded",
    framework: "AutoGen",
    lastRunAt: new Date(Date.now() - 60000).toISOString(),
    totalRuns: 21504,
    errorRate: 8.8,
    avgLatency: 3.1,
    _count: { traces: 412, issues: 5 },
  },
];

export const demoTraces = [
  {
    id: "demo-trace-1",
    agentId: "demo-agent-1",
    traceId: "trace_demo_001",
    status: "success",
    duration: 4200,
    inputTokens: 1840,
    outputTokens: 420,
    createdAt: new Date(Date.now() - 120000).toISOString(),
    agent: { name: "support-agent", framework: "LangChain" },
    spans: [
      { id: "s1", name: "input_guardrail", type: "guard", status: "success", duration: 142, startTime: 0, model: null, tool: null, inputTokens: 256, outputTokens: 12 },
      { id: "s2", name: "model", type: "model", status: "success", duration: 3200, startTime: 142, model: "gpt-4o", tool: null, inputTokens: 1840, outputTokens: 420 },
    ],
  },
];

export const demoIssues = [
  {
    id: "demo-issue-1",
    agentId: "demo-agent-1",
    agentName: "support-agent",
    title: "High latency on model calls",
    description: "GPT-4o calls averaging 4.2s, exceeding 2s SLA",
    severity: "P1",
    status: "open",
    affectedRuns: 120,
    totalRuns: 14832,
    failureRate: 0.8,
    rootCause: "Model provider experiencing elevated latency",
    suggestedFix: "Enable fallback to GPT-4o-mini for non-critical queries",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 300000).toISOString(),
  },
];

export const demoAlerts = [
  {
    id: "demo-alert-1",
    title: "⚠️ checkout-agent error rate spiked to 8.8%",
    message: "Error rate increased from 3.2% to 8.8% in the last hour",
    severity: "warning",
    status: "unread",
    channel: "slack",
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
];

export const demoMetrics = {
  timeSeries: [
    {
      name: "Error Rate %",
      color: "#dc2626",
      data: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
        value: 5 + Math.random() * 4,
      })),
    },
  ],
  cards: [
    { label: "Total Agents", value: "3", change: "+1 this week", trend: "up" as const },
    { label: "Active Traces", value: "848", change: "+12% vs yesterday", trend: "up" as const },
    { label: "Open Issues", value: "1", change: "1 high", trend: "down" as const },
    { label: "Avg Error Rate", value: "4.4%", change: "-1.2% vs last week", trend: "down" as const },
    { label: "Total Token Usage", value: "1.2M", change: "+8% this week", trend: "up" as const },
    { label: "Mean Latency", value: "5.3s", change: "+0.2s vs yesterday", trend: "up" as const },
  ],
  severityBreakdown: [
    { name: "P1 High", value: 1, color: "#f87171" },
    { name: "Resolved", value: 2, color: "#9ca3af" },
  ],
  frameworkDistribution: [
    { name: "LangChain", value: 1, color: "#dc2626" },
    { name: "CrewAI", value: 1, color: "#6b7280" },
    { name: "AutoGen", value: 1, color: "#9ca3af" },
  ],
};

export const demoStats = {
  totalAgents: 3,
  activeAgents: 2,
  totalTraces: 848,
  totalIssues: 3,
  openIssues: 1,
  criticalIssues: 0,
  avgErrorRate: 4.4,
  avgLatency: 5.3,
  tokensUsed24h: 1200000,
};

export const demoActivity = [
  {
    id: "demo-activity-1",
    type: "trace" as const,
    title: "Trace completed for support-agent",
    description: "Full observability trace captured — all spans passed",
    agentName: "support-agent",
    severity: "info" as const,
    timestamp: new Date(Date.now() - 120000).toISOString(),
    metadata: { spans: "5", duration: "4.2s", tokens: "2260" },
  },
];
```

**Step 2: Update org-scope to use demo data**

Modify `src/lib/org-scope.ts`:

```typescript
import { getAuthSession } from '@/lib/auth-guard';
import { DEMO_ORG_ID, isDemoMode } from '@/lib/demo-data';

export async function getUserOrgId(): Promise<string | null> {
  try {
    const session = await getAuthSession();
    if (!session?.user) return null;
    const user = session.user as { orgId?: string | null } | undefined;
    return user?.orgId ?? null;
  } catch {
    return null;
  }
}

export function getDemoOrgId(): string {
  return DEMO_ORG_ID;
}

export { isDemoMode };
```

**Step 3: Update all API routes to return demo data when unauthenticated**

For each route (`/api/agents`, `/api/traces`, `/api/issues`, `/api/alerts`, `/api/metrics`, `/api/stats`, `/api/activity`), add at the top of GET handlers:

```typescript
import { isDemoMode, demoAgents, demoTraces, demoIssues, demoAlerts, demoMetrics, demoStats, demoActivity } from '@/lib/demo-data';

// Inside GET handler, after getting orgId:
if (isDemoMode(orgId)) {
  return success(demoAgents); // or demoTraces, demoIssues, etc.
}
```

**Step 4: Commit**

```bash
git add src/lib/demo-data.ts src/lib/org-scope.ts src/app/api/agents/route.ts src/app/api/traces/route.ts src/app/api/issues/route.ts src/app/api/alerts/route.ts src/app/api/metrics/route.ts src/app/api/stats/route.ts src/app/api/activity/route.ts
git commit -m "fix: isolate demo data from real user data"
```

---

## Phase 1: AI Agent Integrations (The Wedge)

This is the **most important phase** for YC. We need real AI agents sending real traces.

### Strategy: OpenTelemetry + Framework Adapters

**Why OpenTelemetry?**
- Universal standard for observability (traces, metrics, logs)
- Supported by LangChain, CrewAI, AutoGen, LlamaIndex, and custom agents
- One integration = works with everything
- YC loves "we're the OpenTelemetry for AI agents"

**Why Framework Adapters?**
- Not everyone uses OTel
- LangChain has 100K+ GitHub stars — huge user base
- CrewAI is growing fast
- Vercel AI SDK is the standard for JS/TS AI apps

### Task 1.1: Create OpenTelemetry Ingestion Endpoint

**Objective:** Accept OTLP/HTTP traces from any AI agent framework.

**Files:**
- Create: `src/app/api/otlp/v1/traces/route.ts`
- Create: `src/lib/otlp-parser.ts`

**Step 1: Create OTLP traces endpoint**

Create `src/app/api/otlp/v1/traces/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { validateApiKey } from '@/lib/api-response';
import { success, error } from '@/lib/api-response';

// OTLP/HTTP JSON endpoint for trace ingestion
// Accepts ExportTraceServiceRequest protobuf-as-JSON
export async function POST(request: NextRequest) {
  try {
    // Auth via API key
    const authHeader = request.headers.get('Authorization');
    const authUser = await validateApiKey(authHeader);
    if (!authUser) {
      return error('Unauthorized', 401);
    }

    const contentType = request.headers.get('Content-Type') || '';
    const body = await request.arrayBuffer();

    // Support both protobuf and JSON formats
    if (contentType.includes('application/x-protobuf') || contentType.includes('application/grpc')) {
      // For now, return success (protobuf parsing requires additional deps)
      // In production, use @opentelemetry/otlp-transformer
      return success({ accepted: true, note: 'Protobuf parsing coming soon' });
    }

    if (contentType.includes('application/json')) {
      const json = JSON.parse(new TextDecoder().decode(body));
      const resourceSpans = json.resourceSpans || [];

      for (const resourceSpan of resourceSpans) {
        for (const scopeSpan of resourceSpan.scopeSpans || []) {
          for (const span of scopeSpan.spans || []) {
            await processOtelSpan(span, authUser.id);
          }
        }
      }

      return success({ accepted: true, spans: resourceSpans.length });
    }

    return error('Unsupported content type', 415);
  } catch (err) {
    console.error('[/api/otlp/v1/traces] Error:', err);
    return error('Failed to process traces');
  }
}

async function processOtelSpan(span: any, userId: string) {
  // Extract agent name from span attributes
  const agentName = span.attributes?.find((a: any) => a.key === 'agent.name')?.value?.stringValue || 'unknown-agent';
  const agentFramework = span.attributes?.find((a: any) => a.key === 'agent.framework')?.value?.stringValue || null;

  // Upsert agent
  const existingAgent = await db.agent.findFirst({ where: { name: agentName } });
  let agent;
  if (existingAgent) {
    agent = await db.agent.update({
      where: { id: existingAgent.id },
      data: { lastRunAt: new Date(), totalRuns: { increment: 1 } },
    });
  } else {
    agent = await db.agent.create({
      data: { name: agentName, framework: agentFramework, lastRunAt: new Date(), totalRuns: 1 },
    });
  }

  // Create trace
  const trace = await db.trace.create({
    data: {
      agentId: agent.id,
      traceId: span.traceId || crypto.randomUUID(),
      status: span.status?.code === 2 ? 'error' : 'success',
      duration: (span.endTimeUnixNano - span.startTimeUnixNano) / 1_000_000, // ns to ms
      inputTokens: parseInt(span.attributes?.find((a: any) => a.key === 'llm.usage.input_tokens')?.value?.intValue || '0'),
      outputTokens: parseInt(span.attributes?.find((a: any) => a.key === 'llm.usage.output_tokens')?.value?.intValue || '0'),
      metadata: JSON.stringify(span.attributes),
    },
  });

  // Create span record
  await db.span.create({
    data: {
      traceId: trace.id,
      name: span.name || 'unknown',
      type: span.attributes?.find((a: any) => a.key === 'span.type')?.value?.stringValue || null,
      status: span.status?.code === 2 ? 'error' : 'success',
      duration: (span.endTimeUnixNano - span.startTimeUnixNano) / 1_000_000,
      startTime: span.startTimeUnixNano / 1_000_000,
      model: span.attributes?.find((a: any) => a.key === 'llm.model')?.value?.stringValue || null,
      tool: span.attributes?.find((a: any) => a.key === 'tool.name')?.value?.stringValue || null,
    },
  });
}

// Health check for OTLP endpoint
export async function GET() {
  return success({
    status: 'ok',
    endpoint: '/api/otlp/v1/traces',
    formats: ['application/json', 'application/x-protobuf'],
    auth: 'Bearer seghro_sk_...',
  });
}
```

**Step 2: Create OTLP parser utility**

Create `src/lib/otlp-parser.ts`:

```typescript
// OpenTelemetry trace parser utilities

export interface OtelSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  kind?: number;
  startTimeUnixNano: number;
  endTimeUnixNano: number;
  attributes?: OtelAttribute[];
  status?: { code: number; message?: string };
}

export interface OtelAttribute {
  key: string;
  value: {
    stringValue?: string;
    intValue?: string;
    boolValue?: boolean;
    doubleValue?: number;
  };
}

export function getSpanAttribute(span: OtelSpan, key: string): string | null {
  const attr = span.attributes?.find((a) => a.key === key);
  if (!attr) return null;
  return attr.value.stringValue || attr.value.intValue || String(attr.value.boolValue) || null;
}

export function isErrorSpan(span: OtelSpan): boolean {
  return span.status?.code === 2;
}

export function spanDurationMs(span: OtelSpan): number {
  return (span.endTimeUnixNano - span.startTimeUnixNano) / 1_000_000;
}
```

**Step 3: Commit**

```bash
git add src/app/api/otlp/v1/traces/route.ts src/lib/otlp-parser.ts
git commit -m "feat: add OpenTelemetry OTLP trace ingestion endpoint"
```

---

### Task 1.2: Create Seghro JS/TS SDK (npm package)

**Objective:** One-line integration for JS/TS AI agents.

**Files:**
- Create: `packages/js-sdk/package.json`
- Create: `packages/js-sdk/tsconfig.json`
- Create: `packages/js-sdk/src/index.ts`
- Create: `packages/js-sdk/src/seghro-client.ts`
- Create: `packages/js-sdk/src/langchain-callback.ts`
- Create: `packages/js-sdk/src/vercel-ai-telemetry.ts`
- Create: `packages/js-sdk/README.md`

**Step 1: Create package.json**

Create `packages/js-sdk/package.json`:

```json
{
  "name": "@segho/sdk",
  "version": "0.1.0",
  "description": "Seghro AI Agent Observability SDK",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "prepublishOnly": "npm run build"
  },
  "keywords": ["ai", "observability", "tracing", "llm", "agents", "langchain", "vercel-ai"],
  "license": "MIT",
  "dependencies": {
    "@opentelemetry/api": "^1.9.0"
  },
  "peerDependencies": {
    "@langchain/core": ">=0.1.0",
    "ai": ">=3.0.0"
  },
  "peerDependenciesMeta": {
    "@langchain/core": { "optional": true },
    "ai": { "optional": true }
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

**Step 2: Create tsconfig.json**

Create `packages/js-sdk/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Create main client**

Create `packages/js-sdk/src/seghro-client.ts`:

```typescript
export interface SeghroConfig {
  apiKey: string;
  endpoint?: string;
  agentName: string;
  agentFramework?: string;
  debug?: boolean;
}

export interface TraceInput {
  traceId?: string;
  status: 'success' | 'error' | 'timeout';
  duration: number;
  inputTokens?: number;
  outputTokens?: number;
  spans?: SpanInput[];
  metadata?: Record<string, unknown>;
}

export interface SpanInput {
  name: string;
  type?: 'model' | 'tool' | 'guard' | 'retrieval' | 'output' | 'custom';
  status: 'success' | 'error' | 'warning';
  duration: number;
  startTime?: number;
  model?: string;
  tool?: string;
  inputTokens?: number;
  outputTokens?: number;
}

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

    const otelPayload = {
      resourceSpans: [
        {
          resource: {
            attributes: [
              { key: 'service.name', value: { stringValue: this.agentName } },
              { key: 'service.framework', value: { stringValue: this.agentFramework } },
            ],
          },
          scopeSpans: [
            {
              scope: { name: '@segho/sdk', version: '0.1.0' },
              spans: [
                {
                  traceId: traceId,
                  spanId: crypto.randomUUID().replace(/-/g, '').slice(0, 16),
                  name: `${this.agentName}.run`,
                    kind: 1,
                  startTimeUnixNano: Date.now() * 1_000_000 - input.duration * 1_000_000,
                  endTimeUnixNano: Date.now() * 1_000_000,
                  attributes: [
                    { key: 'agent.name', value: { stringValue: this.agentName } },
                    { key: 'agent.framework', value: { stringValue: this.agentFramework } },
                    { key: 'llm.usage.input_tokens', value: { intValue: String(input.inputTokens || 0) } },
                    { key: 'llm.usage.output_tokens', value: { intValue: String(input.outputTokens || 0) } },
                    ...(input.spans || []).flatMap((s) => [
                      { key: `span.${s.name}.type`, value: { stringValue: s.type || 'custom' } },
                      { key: `span.${s.name}.duration`, value: { intValue: String(s.duration) } },
                      { key: `span.${s.name}.status`, value: { stringValue: s.status } },
                    ]),
                  ],
                  status: { code: input.status === 'error' ? 2 : 0 },
                },
                ...(input.spans || []).map((s) => ({
                  traceId: traceId,
                  spanId: crypto.randomUUID().replace(/-/g, '').slice(0, 16),
                  name: s.name,
                  kind: 1,
                  startTimeUnixNano: Date.now() * 1_000_000 - (s.startTime || 0) * 1_000_000,
                  endTimeUnixNano: Date.now() * 1_000_000 - (s.startTime || 0) * 1_000_000 + s.duration * 1_000_000,
                  attributes: [
                    { key: 'span.type', value: { stringValue: s.type || 'custom' } },
                    { key: 'tool.name', value: { stringValue: s.tool || '' } },
                    { key: 'llm.model', value: { stringValue: s.model || '' } },
                    { key: 'llm.usage.input_tokens', value: { intValue: String(s.inputTokens || 0) } },
                    { key: 'llm.usage.output_tokens', value: { intValue: String(s.outputTokens || 0) } },
                  ],
                  status: { code: s.status === 'error' ? 2 : s.status === 'warning' ? 1 : 0 },
                })),
              ],
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(otelPayload),
      });

      if (this.debug) {
        console.log(`[Seghro] Trace ${traceId} sent: ${response.status}`);
      }

      return { success: response.ok, traceId };
    } catch (err) {
      if (this.debug) {
        console.error('[Seghro] Failed to send trace:', err);
      }
      return { success: false };
    }
  }
}
```

**Step 4: Create LangChain callback handler**

Create `packages/js-sdk/src/langchain-callback.ts`:

```typescript
import { SeghroClient, TraceInput, SpanInput } from './seghro-client';

// LangChain.js BaseCallbackHandler integration
// Usage: import { SeghroCallbackHandler } from '@segho/sdk/langchain';
//        const chain = new LLMChain({ llm, callbacks: [new SeghroCallbackHandler({ apiKey, agentName })] });

export interface SeghroLangChainConfig {
  apiKey: string;
  agentName: string;
  endpoint?: string;
  debug?: boolean;
}

export class SeghroCallbackHandler {
  private client: SeghroClient;
  private spans: SpanInput[] = [];
  private startTime: number = 0;
  private debug: boolean;

  constructor(config: SeghroLangChainConfig) {
    this.client = new SeghroClient({
      apiKey: config.apiKey,
      agentName: config.agentName,
      agentFramework: 'LangChain',
      endpoint: config.endpoint,
      debug: config.debug,
    });
    this.debug = config.debug || false;
  }

  // Called when chain starts
  async handleChainStart(chain: any, inputs: Record<string, unknown>) {
    this.startTime = Date.now();
    this.spans = [];
    if (this.debug) console.log(`[Seghro] Chain started: ${chain.id?.[chain.id?.length - 1]}`);
  }

  // Called when LLM starts
  async handleLLMStart(llm: any, prompts: string[]) {
    this.spans.push({
      name: 'llm_call',
      type: 'model',
      status: 'success',
      duration: 0,
      startTime: Date.now() - this.startTime,
      model: llm.id?.[llm.id?.length - 1] || 'unknown',
    });
  }

  // Called when LLM ends
  async handleLLMEnd(output: any, runId?: string) {
    const lastSpan = this.spans[this.spans.length - 1];
    if (lastSpan && lastSpan.name === 'llm_call') {
      lastSpan.duration = Date.now() - this.startTime - (lastSpan.startTime || 0);
      lastSpan.inputTokens = output.llmOutput?.tokenUsage?.totalTokens || 0;
      lastSpan.outputTokens = output.llmOutput?.tokenUsage?.completionTokens || 0;
    }
  }

  // Called when tool starts
  async handleToolStart(tool: any, input: string) {
    this.spans.push({
      name: `tool_${tool.name}`,
      type: 'tool',
      status: 'success',
      duration: 0,
      startTime: Date.now() - this.startTime,
      tool: tool.name,
    });
  }

  // Called when tool ends
  async handleToolEnd(output: string, runId?: string) {
    const lastSpan = this.spans[this.spans.length - 1];
    if (lastSpan && lastSpan.name.startsWith('tool_')) {
      lastSpan.duration = Date.now() - this.startTime - (lastSpan.startTime || 0);
    }
  }

  // Called when chain ends — sends the trace
  async handleChainEnd(outputs: Record<string, unknown>) {
    const duration = Date.now() - this.startTime;
    const totalInputTokens = this.spans.reduce((sum, s) => sum + (s.inputTokens || 0), 0);
    const totalOutputTokens = this.spans.reduce((sum, s) => sum + (s.outputTokens || 0), 0);

    await this.client.ingestTrace({
      status: 'success',
      duration,
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
      spans: this.spans,
    });
  }

  // Called on error
  async handleChainError(error: Error) {
    const duration = Date.now() - this.startTime;
    await this.client.ingestTrace({
      status: 'error',
      duration,
      spans: this.spans,
      metadata: { error: error.message },
    });
  }
}
```

**Step 5: Create Vercel AI SDK telemetry**

Create `packages/js-sdk/src/vercel-ai-telemetry.ts`:

```typescript
import { SeghroClient } from './seghro-client';

// Vercel AI SDK telemetry integration
// Usage: import { seghroTelemetry } from '@segho/sdk/vercel-ai';
//        const result = await generateText({ model, experimental_telemetry: seghroTelemetry({ apiKey, agentName }) });

export interface SeghroVercelAIConfig {
  apiKey: string;
  agentName: string;
  endpoint?: string;
  debug?: boolean;
}

export function seghroTelemetry(config: SeghroVercelAIConfig) {
  const client = new SeghroClient({
    apiKey: config.apiKey,
    agentName: config.agentName,
    agentFramework: 'Vercel AI SDK',
    endpoint: config.endpoint,
    debug: config.debug,
  });

  return {
    isEnabled: true,
    recordEvent: async (event: any) => {
      if (event.name === 'ai.generateText.doGenerate' || event.name === 'ai.generateText') {
        await client.ingestTrace({
          status: event.name === 'ai.generateText.doGenerate' ? 'success' : 'error',
          duration: event.attributes?.['ai.response.msToFirstChunk'] || 0,
          inputTokens: event.attributes?.['ai.usage.promptTokens'] || 0,
          outputTokens: event.attributes?.['ai.usage.completionTokens'] || 0,
          spans: [
            {
              name: 'generateText',
              type: 'model',
              status: 'success',
              duration: event.attributes?.['ai.response.msToFirstChunk'] || 0,
              model: event.attributes?.['ai.model.id'] || 'unknown',
              inputTokens: event.attributes?.['ai.usage.promptTokens'] || 0,
              outputTokens: event.attributes?.['ai.usage.completionTokens'] || 0,
            },
          ],
        });
      }
    },
  };
}
```

**Step 6: Create index.ts**

Create `packages/js-sdk/src/index.ts`:

```typescript
export { SeghroClient, type SeghroConfig, type TraceInput, type SpanInput } from './seghro-client';
export { SeghroCallbackHandler, type SeghroLangChainConfig } from './langchain-callback';
export { seghroTelemetry, type SeghroVercelAIConfig } from './vercel-ai-telemetry';
```

**Step 7: Create README.md**

Create `packages/js-sdk/README.md`:

```markdown
# @seghro/sdk

One-line AI agent observability for JavaScript/TypeScript.

## Install

```bash
npm install @seghro/sdk
```

## Quick Start

```typescript
import { SeghroClient } from '@seghro/sdk';

const seghro = new SeghroClient({
  apiKey: 'seghro_sk_...',
  agentName: 'my-agent',
});

await seghro.ingestTrace({
  status: 'success',
  duration: 1200,
  inputTokens: 150,
  outputTokens: 300,
  spans: [
    { name: 'llm_call', type: 'model', status: 'success', duration: 1000, model: 'gpt-4o' },
    { name: 'tool_call', type: 'tool', status: 'success', duration: 200, tool: 'search' },
  ],
});
```

## LangChain Integration

```typescript
import { SeghroCallbackHandler } from '@segho/sdk/langchain';

const seghroHandler = new SeghroCallbackHandler({
  apiKey: 'seghro_sk_...',
  agentName: 'my-agent',
});

const chain = new LLMChain({
  llm,
  prompt,
  callbacks: [seghroHandler],
});
```

## Vercel AI SDK Integration

```typescript
import { seghroTelemetry } from '@segho/sdk/vercel-ai';

const result = await generateText({
  model: openai('gpt-4o'),
  prompt: 'Hello!',
  experimental_telemetry: seghroTelemetry({
    apiKey: 'seghro_sk_...',
    agentName: 'my-agent',
  }),
});
```

## API Key

Get your API key at https://seghro.dev/dashboard/settings
```

**Step 8: Build and test**

Run: `cd packages/js-sdk && bun install && bun run build`
Expected: `dist/` directory created with `.js` and `.d.ts` files

**Step 9: Commit**

```bash
git add packages/js-sdk/
git commit -m "feat: add @segho/sdk for JS/TS AI agent integrations"
```

---

### Task 1.3: Create Seghro Python SDK (pip package)

**Objective:** One-line integration for Python AI agents (LangChain, CrewAI, AutoGen).

**Files:**
- Create: `packages/python-sdk/pyproject.toml`
- Create: `packages/python-sdk/README.md`
- Create: `packages/python-sdk/seghro/__init__.py`
- Create: `packages/python-sdk/seghro/client.py`
- Create: `packages/python-sdk/seghro/langchain_callback.py`
- Create: `packages/python-sdk/seghro/crewai_observer.py`

**Step 1: Create pyproject.toml**

Create `packages/python-sdk/pyproject.toml`:

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
authors = [{ name = "Seghro", email = "founders@seghro.dev" ]
keywords = ["ai", "observability", "tracing", "llm", "agents", "langchain", "crewai"]
classifiers = [
    "Development Status :: 3 - Alpha",
    "Intended Audience :: Developers",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.9",
    "Programming Language :: Python :: 3.10",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
]
dependencies = [
    "httpx>=0.25.0",
    "pydantic>=2.0",
]

[project.optional-dependencies]
langchain = ["langchain-core>=0.1.0"]
crewai = ["crewai>=0.1.0"]
all = ["langchain-core>=0.1.0", "crewai>=0.1.0"]

[project.urls]
Homepage = "https://seghro.dev"
Documentation = "https://seghro.dev/docs"
Repository = "https://github.com/Hell1213/seghro"

[tool.setuptools.packages.find]
include = ["seghro*"]
```

**Step 2: Create main client**

Create `packages/python-sdk/seghro/client.py`:

```python
"""Seghro Python SDK — trace ingestion client."""

from __future__ import annotations

import time
import uuid
from typing import Any, Optional

import httpx


class SeghroClient:
    """Send traces to Seghro for observability."""

    def __init__(
        self,
        api_key: str,
        agent_name: str,
        agent_framework: str = "custom",
        endpoint: str = "https://seghro.dev/api/otlp/v1/traces",
        debug: bool = False,
    ):
        self.api_key = api_key
        self.endpoint = endpoint
        self.agent_name = agent_name
        self.agent_framework = agent_framework
        self.debug = debug
        self._client = httpx.Client(timeout=10.0)

    def ingest_trace(
        self,
        status: str = "success",
        duration: float = 0,
        input_tokens: int = 0,
        output_tokens: int = 0,
        spans: Optional[list[dict[str, Any]]] = None,
        metadata: Optional[dict[str, Any]] = None,
    ) -> dict[str, Any]:
        """Send a trace to Seghro."""
        trace_id = str(uuid.uuid4())
        now_ns = int(time.time() * 1_000_000_000)

        otel_span = {
            "traceId": trace_id,
            "spanId": uuid.uuid4().hex[:16],
            "name": f"{self.agent_name}.run",
            "kind": 1,
            "startTimeUnixNano": str(now_ns - int(duration * 1_000_000)),
            "endTimeUnixNano": str(now_ns),
            "attributes": [
                {"key": "agent.name", "value": {"stringValue": self.agent_name}},
                {"key": "agent.framework", "value": {"stringValue": self.agent_framework}},
                {"key": "llm.usage.input_tokens", "value": {"intValue": str(input_tokens)}},
                {"key": "llm.usage.output_tokens", "value": {"intValue": str(output_tokens)}},
            ],
            "status": {"code": 2 if status == "error" else 0},
        }

        child_spans = []
        for i, span in enumerate(spans or []):
            child_spans.append({
                "traceId": trace_id,
                "spanId": uuid.uuid4().hex[:16],
                "name": span.get("name", f"span_{i}"),
                "kind": 1,
                "startTimeUnixNano": str(now_ns - int(span.get("duration", 0) * 1_000_000)),
                "endTimeUnixNano": str(now_ns),
                "attributes": [
                    {"key": "span.type", "value": {"stringValue": span.get("type", "custom")}},
                    {"key": "tool.name", "value": {"stringValue": span.get("tool", "")}},
                    {"key": "llm.model", "value": {"stringValue": span.get("model", "")}},
                ],
                "status": {"code": 2 if span.get("status") == "error" else 0},
            })

        payload = {
            "resourceSpans": [
                {
                    "resource": {
                        "attributes": [
                            {"key": "service.name", "value": {"stringValue": self.agent_name}},
                            {"key": "service.framework", "value": {"stringValue": self.agent_framework}},
                        ]
                    },
                    "scopeSpans": [
                        {
                            "scope": {"name": "seghro.python", "version": "0.1.0"},
                            "spans": [otel_span] + child_spans,
                        }
                    ],
                }
            ]
        }

        try:
            response = self._client.post(
                self.endpoint,
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.api_key}",
                },
            )
            if self.debug:
                print(f"[Seghro] Trace {trace_id} sent: {response.status_code}")
            return {"success": response.is_success, "traceId": trace_id}
        except Exception as e:
            if self.debug:
                print(f"[Seghro] Failed to send trace: {e}")
            return {"success": False}

    def close(self):
        self._client.close()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()
```

**Step 3: Create LangChain callback**

Create `packages/python-sdk/seghro/langchain_callback.py`:

```python
"""LangChain callback handler for Seghro observability."""

from __future__ import annotations

import time
from typing import Any, Optional

try:
    from langchain_core.callbacks import BaseCallbackHandler
except ImportError:
    BaseCallbackHandler = object  # type: ignore

from seghro.client import SeghroClient


class SeghroCallbackHandler(BaseCallbackHandler):
    """LangChain callback that sends traces to Seghro."""

    def __init__(
        self,
        api_key: str,
        agent_name: str,
        endpoint: Optional[str] = None,
        debug: bool = False,
    ):
        self.client = SeghroClient(
            api_key=api_key,
            agent_name=agent_name,
            agent_framework="LangChain",
            endpoint=endpoint or "https://seghro.dev/api/otlp/v1/traces",
            debug=debug,
        )
        self.spans: list[dict[str, Any]] = []
        self.start_time: float = 0
        self.debug = debug

    def on_chain_start(self, serialized: dict[str, Any], inputs: dict[str, Any], **kwargs: Any) -> None:
        self.start_time = time.time()
        self.spans = []

    def on_llm_start(self, serialized: dict[str, Any], prompts: list[str], **kwargs: Any) -> None:
        self.spans.append({
            "name": "llm_call",
            "type": "model",
            "status": "success",
            "duration": 0,
            "model": serialized.get("name", "unknown"),
        })

    def on_llm_end(self, response: Any, **kwargs: Any) -> None:
        if self.spans and self.spans[-1]["name"] == "llm_call":
            self.spans[-1]["duration"] = (time.time() - self.start_time) * 1000
            usage = getattr(response, "llm_output", {}) or {}
            token_usage = usage.get("token_usage", {})
            self.spans[-1]["input_tokens"] = token_usage.get("prompt_tokens", 0)
            self.spans[-1]["output_tokens"] = token_usage.get("completion_tokens", 0)

    def on_tool_start(self, serialized: dict[str, Any], input_str: str, **kwargs: Any) -> None:
        self.spans.append({
            "name": f"tool_{serialized.get('name', 'unknown')}",
            "type": "tool",
            "status": "success",
            "duration": 0,
            "tool": serialized.get("name", ""),
        })

    def on_tool_end(self, output: str, **kwargs: Any) -> None:
        if self.spans and self.spans[-1]["name"].startswith("tool_"):
            self.spans[-1]["duration"] = (time.time() - self.start_time) * 1000

    def on_chain_end(self, outputs: dict[str, Any], **kwargs: Any) -> None:
        duration = (time.time() - self.start_time) * 1000
        total_input = sum(s.get("input_tokens", 0) for s in self.spans)
        total_output = sum(s.get("output_tokens", 0) for s in self.spans)
        self.client.ingest_trace(
            status="success",
            duration=duration,
            input_tokens=total_input,
            output_tokens=total_output,
            spans=self.spans,
        )

    def on_chain_error(self, error: Exception, **kwargs: Any) -> None:
        duration = (time.time() - self.start_time) * 1000
        self.client.ingest_trace(
            status="error",
            duration=duration,
            spans=self.spans,
            metadata={"error": str(error)},
        )
```

**Step 4: Create CrewAI observer**

Create `packages/python-sdk/seghro/crewai_observer.py`:

```python
"""CrewAI observer for Seghro observability."""

from __future__ import annotations

import time
from typing import Any, Optional

from seghro.client import SeghroClient


class SeghroCrewAIObserver:
    """Observe CrewAI agents and send traces to Seghro."""

    def __init__(
        self,
        api_key: str,
        agent_name: str,
        endpoint: Optional[str] = None,
        debug: bool = False,
    ):
        self.client = SeghroClient(
            api_key=api_key,
            agent_name=agent_name,
            agent_framework="CrewAI",
            endpoint=endpoint or "https://seghro.dev/api/otlp/v1/traces",
            debug=debug,
        )
        self.debug = debug

    def observe_task(self, task_name: str, func):
        """Decorator to observe a CrewAI task."""
        def wrapper(*args, **kwargs):
            start = time.time()
            try:
                result = func(*args, **kwargs)
                duration = (time.time() - start) * 1000
                self.client.ingest_trace(
                    status="success",
                    duration=duration,
                    spans=[{"name": task_name, "type": "tool", "status": "success", "duration": duration}],
                )
                return result
            except Exception as e:
                duration = (time.time() - start) * 1000
                self.client.ingest_trace(
                    status="error",
                    duration=duration,
                    spans=[{"name": task_name, "type": "tool", "status": "error", "duration": duration}],
                    metadata={"error": str(e)},
                )
                raise
        return wrapper
```

**Step 5: Create __init__.py**

Create `packages/python-sdk/seghro/__init__.py`:

```python
"""Seghro Python SDK — AI Agent Observability."""

from seghro.client import SeghroClient

__version__ = "0.1.0"
__all__ = ["SeghroClient"]
```

**Step 6: Create README.md**

Create `packages/python-sdk/README.md`:

```markdown
# seghro (Python)

One-line AI agent observability for Python.

## Install

```bash
pip install seghro
# With LangChain support:
pip install seghro[langchain]
# With CrewAI support:
pip install seghro[crewai]
# All integrations:
pip install seghro[all]
```

## Quick Start

```python
from seghro import SeghroClient

seghro = SeghroClient(
    api_key="seghro_sk_...",
    agent_name="my-agent",
)

seghro.ingest_trace(
    status="success",
    duration=1200,
    input_tokens=150,
    output_tokens=300,
    spans=[
        {"name": "llm_call", "type": "model", "status": "success", "duration": 1000, "model": "gpt-4o"},
        {"name": "tool_call", "type": "tool", "status": "success", "duration": 200, "tool": "search"},
    ],
)
```

## LangChain Integration

```python
from seghro.langchain_callback import SeghroCallbackHandler

seghro_handler = SeghroCallbackHandler(
    api_key="seghro_sk_...",
    agent_name="my-agent",
)

chain = LLMChain(llm=llm, prompt=prompt, callbacks=[seghro_handler])
```

## CrewAI Integration

```python
from seghro.crewai_observer import SeghroCrewAIObserver

observer = SeghroCrewAIObserver(api_key="seghro_sk_...", agent_name="my-agent")

@observer.observe_task("research")
def research_task(query):
    return f"Results for {query}"
```

## API Key

Get your API key at https://seghro.dev/dashboard/settings
```

**Step 7: Commit**

```bash
git add packages/python-sdk/
git commit -m "feat: add seghro Python SDK for AI agent integrations"
```

---

### Task 1.4: Add Integration Docs to Landing Page

**Objective:** Show developers exactly how to integrate their AI agents.

**Files:**
- Create: `src/components/landing/IntegrationSection.tsx` (already exists, enhance)
- Modify: `src/components/landing/IntegrationSection.tsx`

**Step 1: Enhance IntegrationSection with code examples**

Modify `src/components/landing/IntegrationSection.tsx` to include:

```tsx
// Add these code examples to the integration section

const jsExample = `import { SeghroClient } from '@seghro/sdk';

const seghro = new SeghroClient({
  apiKey: 'seghro_sk_...',
  agentName: 'my-agent',
});

await seghro.ingestTrace({
  status: 'success',
  duration: 1200,
  inputTokens: 150,
  outputTokens: 300,
});`;

const pythonExample = `from seghro import SeghroClient

seghro = SeghroClient(
    api_key="seghro_sk_...",
    agent_name="my-agent",
)

seghro.ingest_trace(
    status="success",
    duration=1200,
    input_tokens=150,
    output_tokens=300,
)`;

const langchainExample = `from seghro.langchain_callback import SeghroCallbackHandler

seghro_handler = SeghroCallbackHandler(
    api_key="seghro_sk_...",
    agent_name="my-agent",
)

chain = LLMChain(
    llm=llm,
    prompt=prompt,
    callbacks=[seghro_handler],
)`;

// Add tabs for JS, Python, LangChain, CrewAI, Vercel AI
```

**Step 2: Commit**

```bash
git add src/components/landing/IntegrationSection.tsx
git commit -m "feat: add integration code examples to landing page"
```

---

## Phase 2: Real Billing & Email (Revenue Infrastructure)

### Task 2.1: Integrate Stripe for Real Payments

**Objective:** Replace mock Stripe with real checkout and subscription management.

**Files:**
- Modify: `src/lib/billing.ts`
- Create: `src/lib/stripe.ts`
- Modify: `src/app/api/billing/checkout/route.ts`
- Modify: `src/app/api/billing/portal/route.ts`
- Create: `src/app/api/billing/webhook/route.ts`

**Step 1: Install Stripe**

Run: `bun add stripe`

**Step 2: Create Stripe client**

Create `src/lib/stripe.ts`:

```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

export const STRIPE_PRICES = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro: process.env.STRIPE_PRICE_PRO,
} as const;
```

**Step 3: Update billing.ts**

Replace mock functions in `src/lib/billing.ts`:

```typescript
import { stripe, STRIPE_PRICES } from './stripe';
import { db } from './db';

export async function createCheckoutSession(plan: PlanType, orgId: string, customerEmail: string) {
  // Get or create Stripe customer
  const org = await db.organization.findUniqueOrThrow({ where: { id: orgId } });
  
  let stripeCustomerId = org.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: customerEmail,
      metadata: { orgId },
    });
    stripeCustomerId = customer.id;
    await db.organization.update({
      where: { id: orgId },
      data: { stripeCustomerId },
    });
  }

  const priceId = STRIPE_PRICES[plan];
  if (!priceId) throw new Error(`No Stripe price for plan: ${plan}`);

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?subscription=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard?subscription=canceled`,
    metadata: { orgId, plan },
  });

  return { url: session.url!, sessionId: session.id };
}

export async function createPortalSession(orgId: string) {
  const org = await db.organization.findUniqueOrThrow({ where: { id: orgId } });
  if (!org.stripeCustomerId) throw new Error('No Stripe customer');

  const session = await stripe.billingPortal.sessions.create({
    customer: org.stripeCustomerId,
    return_url: `${process.env.NEXTAUTH_URL}/dashboard`,
  });

  return { url: session.url };
}
```

**Step 4: Add stripeCustomerId to Organization model**

Modify `prisma/schema.prisma`:

```prisma
model Organization {
  id               String   @id @default(cuid())
  name             String
  slug             String   @unique
  plan             String   @default("starter")
  stripeCustomerId String?  // NEW FIELD
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  users            User[]
}
```

**Step 5: Create webhook handler**

Create `src/app/api/billing/webhook/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const { orgId, plan } = session.metadata;
      await db.organization.update({
        where: { id: orgId },
        data: { plan },
      });
      break;
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;
      const org = await db.organization.findFirst({ where: { stripeCustomerId: customerId } });
      if (org) {
        await db.organization.update({
          where: { id: org.id },
          data: { plan: subscription.status === 'active' ? 'pro' : 'starter' },
        });
      }
      break;
    }
  }

  return new Response('OK', { status: 200 });
}
```

**Step 6: Commit**

```bash
git add src/lib/stripe.ts src/lib/billing.ts src/app/api/billing/webhook/route.ts prisma/schema.prisma
git commit -m "feat: integrate real Stripe billing with webhooks"
```

---

### Task 2.2: Integrate Resend for Transactional Email

**Objective:** Send real password reset and verification emails.

**Files:**
- Create: `src/lib/email.ts`
- Modify: `src/app/api/auth/forgot-password/route.ts`
- Modify: `src/app/api/auth/send-verification/route.ts`

**Step 1: Install Resend**

Run: `bun add resend`

**Step 2: Create email utility**

Create `src/lib/email.ts`:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = process.env.EMAIL_FROM || 'Seghro <noreply@seghro.dev>';
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: 'Reset your Seghro password',
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Seghro</h1>
        <h2>Reset your password</h2>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Reset Password</a>
        <p style="color: #666; font-size: 14px; margin-top: 24px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: 'Verify your Seghro email',
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Seghro</h1>
        <h2>Verify your email</h2>
        <p>Click the link below to verify your email address.</p>
        <a href="${verifyUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Verify Email</a>
      </div>
    `,
  });
}
```

**Step 3: Update forgot-password route**

Modify `src/app/api/auth/forgot-password/route.ts`:

```typescript
import { sendPasswordResetEmail } from '@/lib/email';

// Inside the route, after creating the token:
await sendPasswordResetEmail(email, token);
return success({ message: 'Password reset instructions sent' });
```

**Step 4: Update send-verification route**

Modify `src/app/api/auth/send-verification/route.ts`:

```typescript
import { sendVerificationEmail } from '@/lib/email';

// Inside the route, after creating the token:
await sendVerificationEmail(email, token);
return success({ message: 'Verification email sent' });
```

**Step 5: Commit**

```bash
git add src/lib/email.ts src/app/api/auth/forgot-password/route.ts src/app/api/auth/send-verification/route.ts
git commit -m "feat: integrate Resend for transactional emails"
```

---

## Phase 3: Growth & Traction (YC Metrics)

### Task 3.1: Add Waitlist/Email Signup to Landing Page

**Objective:** Capture emails from interested AI engineers.

**Files:**
- Create: `src/app/api/waitlist/route.ts`
- Modify: `src/components/landing/NewsletterSection.tsx`

**Step 1: Create waitlist API**

Create `src/app/api/waitlist/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { success, error, validationError } from '@/lib/api-response';

const schema = z.object({
  email: z.string().email(),
  source: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.issues);

    const { email } = parsed.data;

    // Check if already on waitlist
    const existing = await db.waitlist.findUnique({ where: { email } });
    if (existing) {
      return success({ message: 'Already on waitlist', alreadyJoined: true });
    }

    await db.waitlist.create({
      data: { email, source: body.source || 'landing' },
    });

    return success({ message: 'Added to waitlist' }, 201);
  } catch (err) {
    console.error('[Waitlist] Error:', err);
    return error('Failed to join waitlist');
  }
}
```

**Step 2: Add Waitlist model to schema**

Modify `prisma/schema.prisma`:

```prisma
model Waitlist {
  id        String   @id @default(cuid())
  email     String   @unique
  source    String   @default("landing")
  createdAt DateTime @default(now())

  @@index([email])
}
```

**Step 3: Update NewsletterSection**

Modify `src/components/landing/NewsletterSection.tsx` to call the waitlist API.

**Step 4: Commit**

```bash
git add src/app/api/waitlist/route.ts prisma/schema.prisma src/components/landing/NewsletterSection.tsx
git commit -m "feat: add waitlist signup for traction tracking"
```

---

### Task 3.2: Add Public Agent Status Pages

**Objective:** Viral growth — agents get a public status page they can share.

**Files:**
- Create: `src/app/status/[agentId]/page.tsx`
- Create: `src/app/status/[agentId]/route.ts`

**Step 1: Create public status page**

Create `src/app/status/[agentId]/page.tsx`:

```tsx
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';

export default async function AgentStatusPage({ params }: { params: { agentId: string } }) {
  const agent = await db.agent.findUnique({
    where: { id: params.agentId },
    include: {
      _count: { select: { traces: true, issues: true } },
      traces: { take: 10, orderBy: { createdAt: 'desc' } },
    },
  });

  if (!agent) notFound();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold">{agent.name}</h1>
        <p className="text-gray-500">Public Status Page</p>
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-lg font-bold">{agent.status}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Total Runs</p>
            <p className="text-lg font-bold">{agent.totalRuns}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Error Rate</p>
            <p className="text-lg font-bold">{agent.errorRate}%</p>
          </div>
        </div>
        <div className="mt-8">
          <p className="text-sm text-gray-400">Powered by <a href="https://seghro.dev" className="text-red-600">Seghro</a></p>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/status/
git commit -m "feat: add public agent status pages for viral growth"
```

---

### Task 3.3: Add API Key Auth Performance Fix

**Objective:** Fix O(n) API key lookup with prefix indexing.

**Files:**
- Modify: `src/lib/api-key-auth.ts`
- Modify: `prisma/schema.prisma` (add @@index on keyPrefix)

**Step 1: Add index to ApiKey.keyPrefix**

Modify `prisma/schema.prisma`:

```prisma
model ApiKey {
  id         String    @id @default(cuid())
  userId     String
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  name       String
  keyHash    String    @unique
  keyPrefix  String
  lastUsedAt DateTime?
  createdAt  DateTime  @default(now())
  expiresAt  DateTime?

  @@index([userId])
  @@index([keyPrefix])  // NEW: enables fast prefix lookup
}
```

**Step 2: Update validateApiKey to use prefix filter**

Modify `src/lib/api-key-auth.ts`:

```typescript
// Extract prefix from the full key (first 18 chars: "seghro_sk_" + 8 hex)
const keyPrefix = key.slice(0, 18);

// Filter by prefix first (fast index lookup)
const candidates = await db.apiKey.findMany({
  where: { keyPrefix },
  include: { user: { select: { id: true, email: true, name: true, role: true } } },
});

// Only bcrypt.compare against candidates with matching prefix
for (const record of candidates) {
  const match = await bcrypt.compare(key, record.keyHash);
  if (match) {
    // ... rest of validation
  }
}
```

**Step 3: Commit**

```bash
git add src/lib/api-key-auth.ts prisma/schema.prisma
git commit -m "perf: fix O(n) API key lookup with prefix indexing"
```

---

## Phase 4: Security Hardening

### Task 4.1: Fix CORS and Security Headers

**Objective:** Restrict CORS, tighten CSP, add CSRF protection.

**Files:**
- Modify: `next.config.ts:38-57`
- Modify: `src/middleware.ts`

**Step 1: Update CORS in next.config.ts**

Change:
```typescript
{
  key: 'Access-Control-Allow-Origin',
  value: process.env.ALLOWED_ORIGINS || '*',
},
```
to:
```typescript
{
  key: 'Access-Control-Allow-Origin',
  value: process.env.ALLOWED_ORIGINS || 'https://seghro.dev',
},
```

**Step 2: Tighten CSP**

Change:
```typescript
value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; ...",
```
to:
```typescript
value: "default-src 'self'; script-src 'self' 'nonce-{RANDOM_NONCE}'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https: wss:; frame-ancestors 'self';",
```

**Step 3: Add CSRF token to state-changing routes**

Create `src/lib/csrf.ts`:

```typescript
import { randomBytes } from 'crypto';

export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

export function validateCsrfToken(token: string, expected: string): boolean {
  return token === expected;
}
```

**Step 4: Commit**

```bash
git add next.config.ts src/middleware.ts src/lib/csrf.ts
git commit -m "security: fix CORS, tighten CSP, add CSRF protection"
```

---

### Task 4.2: Add Ownership Verification to PATCH Routes

**Objective:** Prevent users from updating other orgs' issues/alerts.

**Files:**
- Modify: `src/app/api/issues/route.ts:72-95`
- Modify: `src/app/api/alerts/route.ts:45-67`

**Step 1: Add org-scoping to issues PATCH**

Modify `src/app/api/issues/route.ts`:

```typescript
import { getUserOrgId } from '@/lib/org-scope';

export async function PATCH(request: NextRequest) {
  const orgId = await getUserOrgId();
  if (!orgId) return error('Unauthorized', 401);

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten());

  // Verify the issue belongs to the user's org
  const existing = await db.issue.findFirst({
    where: { id: parsed.data.id, agent: { orgId } },
  });
  if (!existing) return error('Issue not found', 404);

  const updated = await db.issue.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
  });

  return success({ id: updated.id, status: updated.status, updatedAt: updated.updatedAt.toISOString() });
}
```

**Step 2: Add org-scoping to alerts PATCH**

Similar pattern for alerts.

**Step 3: Commit**

```bash
git add src/app/api/issues/route.ts src/app/api/alerts/route.ts
git commit -m "security: add ownership verification to PATCH routes"
```

---

## Phase 5: Deployment & Launch Prep

### Task 5.1: Deploy to Production

**Objective:** Get Seghro running on a real domain.

**Options:**
- Vercel (easiest for Next.js)
- Railway (good for PostgreSQL + Next.js)
- Fly.io (good for Docker)

**Steps:**
1. Push to GitHub
2. Connect repo to Vercel/Railway
3. Set environment variables
4. Run `bun run db:push` in production
5. Configure custom domain (seghro.dev)

### Task 5.2: Publish SDKs

**Objective:** Make integrations discoverable.

**Steps:**
1. Create npm account, publish `@seghro/sdk`
2. Create PyPI account, publish `seghro` package
3. Add to integration docs

### Task 5.3: Create Demo Video

**Objective:** Show real agents being monitored.

**Script:**
1. Show a LangChain agent running
2. Show traces appearing in Seghro dashboard in real-time
3. Show an issue being detected
4. Show self-healing activating a fallback
5. End with "Get started in 30 seconds" + code example

---

## Execution Order

| Phase | Tasks | Estimated Time |
|-------|-------|---------------|
| Phase 0: Foundation | 0.1-0.4 | 2-3 hours |
| Phase 1: AI Integrations | 1.1-1.4 | 4-6 hours |
| Phase 2: Billing & Email | 2.1-2.2 | 2-3 hours |
| Phase 3: Growth | 3.1-3.3 | 2-3 hours |
| Phase 4: Security | 4.1-4.2 | 1-2 hours |
| Phase 5: Deploy & Launch | 5.1-5.3 | 3-4 hours |
| **Total** | | **14-21 hours** |

---

## Success Criteria (YC-Ready)

After completing this plan, Seghro will have:

- ✅ Real AI agent integrations (LangChain, CrewAI, Vercel AI, OTel)
- ✅ Real Stripe billing (subscriptions, checkout, webhooks)
- ✅ Real email (password reset, verification)
- ✅ PostgreSQL (production-ready database)
- ✅ Demo data isolation (no data leak)
- ✅ Security hardening (CORS, CSP, CSRF, ownership checks)
- ✅ Waitlist for traction tracking
- ✅ Public status pages for viral growth
- ✅ Published SDKs (npm + PyPI)
- ✅ Deployed to production

**Next after this plan:** Get 10 beta users from AI engineering communities (r/LocalLLaMA, LangChain Discord, AI agent Twitter). Record a demo video. Apply to YC with real usage metrics.
