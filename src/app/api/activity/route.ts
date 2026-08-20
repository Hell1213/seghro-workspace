import { NextResponse } from "next/server";

export interface ActivityEvent {
  id: string;
  type: "trace" | "issue" | "healing" | "alert" | "deployment";
  title: string;
  description: string;
  agentName?: string;
  severity?: "info" | "warning" | "critical";
  timestamp: string;
  metadata?: Record<string, string>;
}

function minutesAgo(m: number): string {
  return new Date(Date.now() - m * 60 * 1000).toISOString();
}

const activityEvents: ActivityEvent[] = [
  {
    id: "act-1",
    type: "trace",
    title: "Trace completed for support-agent",
    description: "Full observability trace captured — 14 spans, 0 errors",
    agentName: "support-agent",
    severity: "info",
    timestamp: minutesAgo(5),
    metadata: { spans: "14", duration: "1.8s" },
  },
  {
    id: "act-2",
    type: "issue",
    title: "New P0 issue detected: Fabricated customer identifiers",
    description:
      "support-agent generated fake customer IDs in 3 of 12 responses this hour",
    agentName: "support-agent",
    severity: "critical",
    timestamp: minutesAgo(18),
    metadata: { priority: "P0", affectedRuns: "3/12" },
  },
  {
    id: "act-3",
    type: "healing",
    title: "Circuit breaker opened for Tavily Search",
    description:
      "3 consecutive 503 errors detected — requests queued and will retry after cooldown",
    severity: "critical",
    timestamp: minutesAgo(32),
    metadata: { service: "tavily-search", failures: "3", cooldown: "60s" },
  },
  {
    id: "act-4",
    type: "alert",
    title: "Error rate spike on checkout-agent (12.8%)",
    description:
      "Error rate jumped from 1.2% to 12.8% in the last 15 minutes — exceeds 10% threshold",
    agentName: "checkout-agent",
    severity: "warning",
    timestamp: minutesAgo(47),
    metadata: { threshold: "10%", current: "12.8%", window: "15m" },
  },
  {
    id: "act-5",
    type: "deployment",
    title: "Agent comparison panel deployed to production",
    description:
      "Side-by-side agent comparison with 6 metrics and performance bar charts now live",
    severity: "info",
    timestamp: minutesAgo(75),
    metadata: { version: "v2.4.1", env: "production" },
  },
  {
    id: "act-6",
    type: "trace",
    title: "Trace completed for research-agent",
    description:
      "Full observability trace captured — 22 spans, 1 warning (retrieval timeout)",
    agentName: "research-agent",
    severity: "info",
    timestamp: minutesAgo(98),
    metadata: { spans: "22", duration: "4.2s", warnings: "1" },
  },
  {
    id: "act-7",
    type: "healing",
    title: "Fallback activated for Anthropic Claude 3.5",
    description:
      "Primary model returned 429 — automatically switched to GPT-4o fallback",
    severity: "warning",
    timestamp: minutesAgo(130),
    metadata: {
      primary: "claude-3.5-sonnet",
      fallback: "gpt-4o",
      reason: "429 Rate Limited",
    },
  },
  {
    id: "act-8",
    type: "issue",
    title: "Issue resolved: False positive security alerts",
    description:
      "Code-review-bot was flagging safe patterns as security risks — prompt updated to reduce false positives by 94%",
    agentName: "code-review-bot",
    severity: "info",
    timestamp: minutesAgo(165),
    metadata: { issueId: "ISS-247", fixRate: "94%" },
  },
  {
    id: "act-9",
    type: "alert",
    title: "Weekly reliability report generated",
    description:
      "All 6 agents above 99.2% uptime — 2 incidents auto-resolved by self-healing",
    severity: "info",
    timestamp: minutesAgo(210),
    metadata: { period: "weekly", uptime: "99.4%", incidents: "2" },
  },
  {
    id: "act-10",
    type: "trace",
    title: "Trace failed for support-agent",
    description:
      "Trace capture failed — agent timed out after 30s with no spans recorded",
    agentName: "support-agent",
    severity: "critical",
    timestamp: minutesAgo(280),
    metadata: { reason: "timeout", agentStatus: "degraded" },
  },
  {
    id: "act-11",
    type: "healing",
    title: "Queue enabled for Tavily Search",
    description:
      "Request queue activated — 8 pending requests will be processed sequentially after circuit breaker resets",
    severity: "critical",
    timestamp: minutesAgo(310),
    metadata: { service: "tavily-search", queued: "8", strategy: "sequential" },
  },
  {
    id: "act-12",
    type: "deployment",
    title: "Settings panel deployed",
    description:
      "SaaS settings with notification preferences, data retention, and theme customization now available",
    severity: "info",
    timestamp: minutesAgo(380),
    metadata: { version: "v2.4.0", env: "production" },
  },
  {
    id: "act-13",
    type: "trace",
    title: "Trace completed for code-review-bot",
    description:
      "Full observability trace captured — 9 spans, 0 errors — all guardrails passed",
    agentName: "code-review-bot",
    severity: "info",
    timestamp: minutesAgo(440),
    metadata: { spans: "9", duration: "2.1s", guardsPassed: "4/4" },
  },
  {
    id: "act-14",
    type: "issue",
    title: "Issue reopened: Hallucinated citation references",
    description:
      "research-agent citing non-existent papers again — previous fix was insufficient",
    agentName: "research-agent",
    severity: "warning",
    timestamp: minutesAgo(520),
    metadata: { issueId: "ISS-189", reopenCount: "2" },
  },
  {
    id: "act-15",
    type: "alert",
    title: "Escalation: 7 orphaned tickets created",
    description:
      "support-agent created tickets without linking to parent conversations — requires manual triage",
    agentName: "support-agent",
    severity: "critical",
    timestamp: minutesAgo(620),
    metadata: { orphaned: "7", action: "manual-triage", sla: "4h" },
  },
];

// Sort newest first
activityEvents.sort(
  (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
);

export async function GET() {
  return NextResponse.json(activityEvents);
}
