export const DEMO_ORG_ID = "demo-org-seghro";

export function isDemoMode(orgId: string | null): boolean {
  return !orgId || orgId === DEMO_ORG_ID;
}

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
      {
        id: "s1",
        name: "llm_call",
        type: "model",
        status: "success",
        duration: 3200,
        startTime: 0,
        model: "gpt-4o",
        tool: null,
        inputTokens: 1840,
        outputTokens: 420,
      },
    ],
  },
];

export const demoIssues = [
  {
    id: "demo-issue-1",
    agentId: "demo-agent-1",
    agentName: "support-agent",
    title: "High latency on model calls",
    description: "GPT-4o calls averaging 4.2s",
    severity: "P1",
    status: "open",
    affectedRuns: 120,
    totalRuns: 14832,
    failureRate: 0.8,
    rootCause: "Model provider elevated latency",
    suggestedFix: "Enable fallback to GPT-4o-mini",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 300000).toISOString(),
  },
];

export const demoAlerts = [
  {
    id: "demo-alert-1",
    title: "Demo: checkout-agent error rate",
    message: "This is demo data",
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
    { label: "Total Agents", value: "2", change: "+1 this week", trend: "up" as const },
    { label: "Active Traces", value: "436", change: "+12% vs yesterday", trend: "up" as const },
    { label: "Open Issues", value: "1", change: "1 high", trend: "down" as const },
    { label: "Avg Error Rate", value: "2.2%", change: "-0.5% vs last week", trend: "down" as const },
    { label: "Total Token Usage", value: "840K", change: "+8% this week", trend: "up" as const },
    { label: "Mean Latency", value: "6.5s", change: "+0.2s vs yesterday", trend: "up" as const },
  ],
  severityBreakdown: [
    { name: "P1 High", value: 1, color: "#f87171" },
    { name: "Resolved", value: 1, color: "#9ca3af" },
  ],
  frameworkDistribution: [
    { name: "LangChain", value: 1, color: "#dc2626" },
    { name: "CrewAI", value: 1, color: "#6b7280" },
  ],
};

export const demoStats = {
  totalAgents: 2,
  activeAgents: 2,
  totalTraces: 436,
  totalIssues: 2,
  openIssues: 1,
  criticalIssues: 0,
  avgErrorRate: 2.2,
  avgLatency: 6.5,
  tokensUsed24h: 840000,
};

export const demoActivity = [
  {
    id: "demo-activity-1",
    type: "trace" as const,
    title: "Trace completed for support-agent",
    description: "Full observability trace captured",
    agentName: "support-agent",
    severity: "info" as const,
    timestamp: new Date(Date.now() - 120000).toISOString(),
    metadata: { spans: "5", duration: "4.2s", tokens: "2260" },
  },
];
