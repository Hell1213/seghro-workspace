// ---- Mock Data for Sentinel AI Agent Observability ----

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: "active" | "degraded" | "critical" | "inactive";
  framework: string;
  lastRunAt: string;
  totalRuns: number;
  errorRate: number;
  avgLatency: number;
}

export interface TraceSpan {
  id: string;
  name: string;
  type: "model" | "tool" | "guard" | "retrieval" | "output";
  status: "success" | "error" | "warning";
  duration: number;
  startTime: number;
  model?: string;
  tool?: string;
  inputTokens: number;
  outputTokens: number;
}

export interface Trace {
  id: string;
  agentId: string;
  traceId: string;
  status: "success" | "error" | "warning";
  duration: number;
  inputTokens: number;
  outputTokens: number;
  createdAt: string;
  spans: TraceSpan[];
}

export interface Issue {
  id: string;
  agentId: string;
  agentName: string;
  title: string;
  description: string;
  severity: "P0" | "P1" | "P2";
  status: "open" | "investigating" | "resolved" | "reopened";
  affectedRuns: number;
  totalRuns: number;
  failureRate: number;
  rootCause: string;
  suggestedFix: string;
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "warning" | "info";
  status: "unread" | "read";
  channel: string;
  createdAt: string;
}

export interface MetricPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface MetricSeries {
  name: string;
  data: MetricPoint[];
  color: string;
}

// ---- AGENTS ----
export const agents: Agent[] = [
  {
    id: "agent_01",
    name: "support-agent",
    description: "Customer support LLM agent handling ticket creation and escalation",
    status: "critical",
    framework: "LangChain",
    lastRunAt: new Date(Date.now() - 120000).toISOString(),
    totalRuns: 14832,
    errorRate: 34.2,
    avgLatency: 4.2,
  },
  {
    id: "agent_02",
    name: "research-agent",
    description: "Research assistant for literature review and summarization",
    status: "active",
    framework: "CrewAI",
    lastRunAt: new Date(Date.now() - 300000).toISOString(),
    totalRuns: 8291,
    errorRate: 2.1,
    avgLatency: 8.7,
  },
  {
    id: "agent_03",
    name: "checkout-agent",
    description: "E-commerce checkout flow with refund and policy enforcement",
    status: "degraded",
    framework: "AutoGen",
    lastRunAt: new Date(Date.now() - 60000).toISOString(),
    totalRuns: 21504,
    errorRate: 12.8,
    avgLatency: 3.1,
  },
  {
    id: "agent_04",
    name: "onboarding-agent",
    description: "User onboarding flow with personalization and setup guidance",
    status: "active",
    framework: "LlamaIndex",
    lastRunAt: new Date(Date.now() - 450000).toISOString(),
    totalRuns: 5620,
    errorRate: 1.4,
    avgLatency: 6.3,
  },
  {
    id: "agent_05",
    name: "data-pipeline",
    description: "Automated data extraction, transformation and loading agent",
    status: "inactive",
    framework: "LangGraph",
    lastRunAt: new Date(Date.now() - 86400000).toISOString(),
    totalRuns: 3201,
    errorRate: 0.8,
    avgLatency: 12.4,
  },
  {
    id: "agent_06",
    name: "code-review-bot",
    description: "Automated code review agent for pull request analysis",
    status: "active",
    framework: "CrewAI",
    lastRunAt: new Date(Date.now() - 180000).toISOString(),
    totalRuns: 9874,
    errorRate: 3.7,
    avgLatency: 5.8,
  },
];

// ---- TRACE SPANS ----
const makeSpans = (agentId: string): TraceSpan[] => {
  const baseTime = Date.now() - 300000;
  const spanSets: Record<string, TraceSpan[]> = {
    agent_01: [
      { id: "s1", name: "input_guardrail", type: "guard", status: "success", duration: 142, startTime: baseTime, inputTokens: 256, outputTokens: 12 },
      { id: "s2", name: "retrieve_context", type: "retrieval", status: "success", duration: 2100, startTime: baseTime + 142, inputTokens: 512, outputTokens: 890 },
      { id: "s3", name: "vector_search", type: "retrieval", status: "success", duration: 1440, startTime: baseTime + 142, inputTokens: 200, outputTokens: 340 },
      { id: "s4", name: "model", type: "model", status: "warning", duration: 3200, startTime: baseTime + 2242, model: "gpt-4o", inputTokens: 1840, outputTokens: 420 },
      { id: "s5", name: "tools", type: "tool", status: "error", duration: 3400, startTime: baseTime + 5442, tool: "create_ticket", inputTokens: 600, outputTokens: 180 },
      { id: "s6", name: "research_literature", type: "retrieval", status: "success", duration: 3200, startTime: baseTime + 5442, inputTokens: 800, outputTokens: 1200 },
      { id: "s7", name: "model", type: "model", status: "error", duration: 1800, startTime: baseTime + 8842, model: "gpt-4o", inputTokens: 2100, outputTokens: 90 },
      { id: "s8", name: "model", type: "model", status: "warning", duration: 1900, startTime: baseTime + 10642, model: "gpt-4o-mini", inputTokens: 1900, outputTokens: 340 },
      { id: "s9", name: "speak_to_user", type: "output", status: "success", duration: 500, startTime: baseTime + 12542, inputTokens: 300, outputTokens: 85 },
    ],
    agent_02: [
      { id: "s1", name: "query_parser", type: "guard", status: "success", duration: 85, startTime: baseTime, inputTokens: 180, outputTokens: 8 },
      { id: "s2", name: "literature_search", type: "retrieval", status: "success", duration: 4500, startTime: baseTime + 85, inputTokens: 300, outputTokens: 2100 },
      { id: "s3", name: "model", type: "model", status: "success", duration: 5200, startTime: baseTime + 4585, model: "claude-3.5-sonnet", inputTokens: 3200, outputTokens: 1800 },
      { id: "s4", name: "format_output", type: "output", status: "success", duration: 120, startTime: baseTime + 9785, inputTokens: 200, outputTokens: 1500 },
    ],
    agent_03: [
      { id: "s1", name: "input_validation", type: "guard", status: "success", duration: 95, startTime: baseTime, inputTokens: 140, outputTokens: 10 },
      { id: "s2", name: "policy_check", type: "guard", status: "error", duration: 280, startTime: baseTime + 95, inputTokens: 350, outputTokens: 22 },
      { id: "s3", name: "model", type: "model", status: "warning", duration: 1800, startTime: baseTime + 375, model: "gpt-4o", inputTokens: 900, outputTokens: 280 },
      { id: "s4", name: "refund_tool", type: "tool", status: "error", duration: 600, startTime: baseTime + 2175, tool: "process_refund", inputTokens: 200, outputTokens: 45 },
      { id: "s5", name: "model", type: "model", status: "success", duration: 1400, startTime: baseTime + 2775, model: "gpt-4o-mini", inputTokens: 700, outputTokens: 190 },
      { id: "s6", name: "response", type: "output", status: "success", duration: 80, startTime: baseTime + 4175, inputTokens: 100, outputTokens: 60 },
    ],
    agent_04: [
      { id: "s1", name: "user_profile", type: "retrieval", status: "success", duration: 300, startTime: baseTime, inputTokens: 100, outputTokens: 450 },
      { id: "s2", name: "model", type: "model", status: "success", duration: 4200, startTime: baseTime + 300, model: "gpt-4o", inputTokens: 1400, outputTokens: 980 },
      { id: "s3", name: "setup_guide", type: "tool", status: "success", duration: 800, startTime: baseTime + 4500, tool: "create_checklist", inputTokens: 300, outputTokens: 200 },
      { id: "s4", name: "model", type: "model", status: "success", duration: 2100, startTime: baseTime + 5300, model: "gpt-4o", inputTokens: 1100, outputTokens: 650 },
      { id: "s5", name: "response", type: "output", status: "success", duration: 60, startTime: baseTime + 7400, inputTokens: 80, outputTokens: 120 },
    ],
    agent_05: [
      { id: "s1", name: "source_connect", type: "tool", status: "success", duration: 2100, startTime: baseTime, inputTokens: 50, outputTokens: 0 },
      { id: "s2", name: "extract", type: "model", status: "success", duration: 5600, startTime: baseTime + 2100, model: "claude-3.5-sonnet", inputTokens: 2800, outputTokens: 1200 },
      { id: "s3", name: "transform", type: "model", status: "success", duration: 3800, startTime: baseTime + 7700, model: "claude-3.5-sonnet", inputTokens: 1600, outputTokens: 900 },
      { id: "s4", name: "load", type: "tool", status: "success", duration: 900, startTime: baseTime + 11500, inputTokens: 400, outputTokens: 0 },
    ],
    agent_06: [
      { id: "s1", name: "fetch_pr", type: "tool", status: "success", duration: 450, startTime: baseTime, inputTokens: 80, outputTokens: 0 },
      { id: "s2", name: "parse_diff", type: "model", status: "success", duration: 2800, startTime: baseTime + 450, model: "gpt-4o", inputTokens: 3400, outputTokens: 680 },
      { id: "s3", name: "security_scan", type: "guard", status: "warning", duration: 1200, startTime: baseTime + 3250, inputTokens: 1200, outputTokens: 45 },
      { id: "s4", name: "model", type: "model", status: "success", duration: 3100, startTime: baseTime + 4450, model: "gpt-4o", inputTokens: 2100, outputTokens: 920 },
      { id: "s5", name: "post_comment", type: "tool", status: "success", duration: 350, startTime: baseTime + 7550, inputTokens: 150, outputTokens: 0 },
    ],
  };
  return spanSets[agentId] || spanSets["agent_01"];
};

// ---- TRACES ----
export const traces: Trace[] = agents.flatMap((agent) => {
  const count = agent.id === "agent_01" ? 3 : 1;
  return Array.from({ length: count }, (_, i) => {
    const spans = makeSpans(agent.id);
    const totalDuration = Math.max(...spans.map((s) => s.startTime + s.duration)) - Math.min(...spans.map((s) => s.startTime));
    return {
      id: `trace_${agent.id}_${i}`,
      agentId: agent.id,
      traceId: `${agent.id.slice(-2)}e0c8418-${i === 0 ? "c8a5" : "a7b3"}-4efb-972b-${i === 0 ? "5dd2abd93cee" : "8ec4f7a21d09"}`,
      status: (agent.status === "critical" && i === 0) ? "error" as const : agent.status === "degraded" && i === 0 ? "warning" as const : "success" as const,
      duration: totalDuration,
      inputTokens: spans.reduce((a, s) => a + s.inputTokens, 0),
      outputTokens: spans.reduce((a, s) => a + s.outputTokens, 0),
      createdAt: new Date(Date.now() - (i * 300000 + Math.random() * 60000)).toISOString(),
      spans,
    };
  });
});

// ---- ISSUES ----
export const issues: Issue[] = [
  {
    id: "issue_01",
    agentId: "agent_01",
    agentName: "support-agent",
    title: "Fabricated customer identifiers",
    description: "When a customer can't be identified, the agent invents placeholder identifiers instead of asking — then files tickets and escalations against them.",
    severity: "P0",
    status: "open",
    affectedRuns: 33,
    totalRuns: 50,
    failureRate: 66,
    rootCause: "Missing guardrail for customer identification. Agent skips required verification step.",
    suggestedFix: "Require the agent to ask for the customer's email before any lookup. Add a hard guardrail that blocks ticket creation without a verified customerId.",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: "issue_02",
    agentId: "agent_03",
    agentName: "checkout-agent",
    title: "Refunds promised outside policy window",
    description: "Agent offers refunds beyond the 30-day policy window, creating liability exposure.",
    severity: "P0",
    status: "investigating",
    affectedRuns: 12,
    totalRuns: 85,
    failureRate: 14.1,
    rootCause: "Prompt revision introduced broader refund language without policy constraints.",
    suggestedFix: "Tighten prompts/refund_policy.md — only offer refunds within the 30-day policy window. Outside the window, route to a human agent.",
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    updatedAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: "issue_03",
    agentId: "agent_01",
    agentName: "support-agent",
    title: "Orphaned escalation tickets",
    description: "Agent creates escalation tickets referencing non-existent customer IDs, resulting in orphaned tickets in the queue.",
    severity: "P1",
    status: "open",
    affectedRuns: 15,
    totalRuns: 50,
    failureRate: 30,
    rootCause: "Same root cause as fabricated identifiers — escalations fire before customer verification.",
    suggestedFix: "Add dependency: escalation tool requires valid customerId input from the identification step.",
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    updatedAt: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: "issue_04",
    agentId: "agent_06",
    agentName: "code-review-bot",
    title: "False positive security alerts",
    description: "Security scan produces excessive false positives on benign pattern matches (regex, encoded strings).",
    severity: "P2",
    status: "resolved",
    affectedRuns: 28,
    totalRuns: 200,
    failureRate: 14,
    rootCause: "Overly aggressive regex patterns in security scanner matching encoded strings as potential injection.",
    suggestedFix: "Add context-aware filtering. Skip encoded string detection for test files and constants.",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "issue_05",
    agentId: "agent_03",
    agentName: "checkout-agent",
    title: "Inconsistent tax calculation",
    description: "Agent applies different tax rates for identical orders depending on conversation context.",
    severity: "P1",
    status: "open",
    affectedRuns: 8,
    totalRuns: 85,
    failureRate: 9.4,
    rootCause: "Tax calculation tool uses stale context from earlier in the conversation instead of current order state.",
    suggestedFix: "Pass full current order state to tax calculation tool. Clear conversation context cache before financial computations.",
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "issue_06",
    agentId: "agent_02",
    agentName: "research-agent",
    title: "Hallucinated citation references",
    description: "Agent generates plausible but non-existent paper citations in research summaries.",
    severity: "P2",
    status: "reopened",
    affectedRuns: 5,
    totalRuns: 120,
    failureRate: 4.2,
    rootCause: "Model generates citations from training data rather than restricting to retrieved search results.",
    suggestedFix: "Constrain output to only cite papers from the retrieval step. Add post-generation verification against search results.",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

// ---- ALERTS ----
export const alerts: Alert[] = [
  {
    id: "alert_01",
    title: "🚨 New P0 issue found in support-agent",
    message: "When a customer can't be identified, the agent invents placeholder identifiers instead of asking — then files tickets and escalations against them. 33 of the last 50 runs affected.",
    severity: "critical",
    status: "unread",
    channel: "slack",
    createdAt: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: "alert_02",
    title: "⚠️ checkout-agent error rate spiked to 12.8%",
    message: "Error rate increased from 3.2% to 12.8% in the last hour. Primary failure: refunds promised outside policy window.",
    severity: "warning",
    status: "unread",
    channel: "slack",
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: "alert_03",
    title: "🔧 Fix deployed for code-review-bot",
    message: "PR #482 merged — false positive security alerts issue resolved. Online eval scoring all traces clean.",
    severity: "info",
    status: "read",
    channel: "slack",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "alert_04",
    title: "📊 Weekly agent reliability report ready",
    message: "support-agent: 66% failure rate (critical) | checkout-agent: 14% failure rate (degraded) | Others: <5% (healthy)",
    severity: "info",
    status: "read",
    channel: "slack",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "alert_05",
    title: "🔄 research-agent hallucinated citations reopened",
    message: "Issue #06 reopened — 5 new occurrences detected in the last 24h despite previous fix attempt.",
    severity: "warning",
    status: "unread",
    channel: "slack",
    createdAt: new Date(Date.now() - 5400000).toISOString(),
  },
  {
    id: "alert_06",
    title: "✅ onboarding-agent all traces passing",
    message: "50 consecutive traces scored clean. No issues detected in the last 4 hours.",
    severity: "info",
    status: "read",
    channel: "slack",
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: "alert_07",
    title: "🚨 Escalation: 7 orphaned tickets created",
    message: "support-agent created 7 escalation tickets routing to nonexistent customer IDs in the last 30 minutes.",
    severity: "critical",
    status: "unread",
    channel: "slack",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

// ---- METRICS ----
function generateTimeSeriesData(hours: number, baseValue: number, variance: number, trend: number = 0): MetricPoint[] {
  const points: MetricPoint[] = [];
  const now = Date.now();
  for (let i = hours * 4; i >= 0; i--) {
    const t = now - i * 15 * 60 * 1000;
    const noise = (Math.random() - 0.5) * variance;
    const trendVal = trend * (hours * 4 - i);
    points.push({
      timestamp: new Date(t).toISOString(),
      value: Math.max(0, baseValue + noise + trendVal),
    });
  }
  return points;
}

export const metricsData: MetricSeries[] = [
  {
    name: "Error Rate %",
    data: generateTimeSeriesData(24, 8, 6, 0.02),
    color: "#dc2626",
  },
  {
    name: "Avg Latency (s)",
    data: generateTimeSeriesData(24, 5.2, 2, -0.01),
    color: "#6b7280",
  },
  {
    name: "Throughput (req/min)",
    data: generateTimeSeriesData(24, 42, 15, 0.05),
    color: "#ef4444",
  },
  {
    name: "Token Usage (K)",
    data: generateTimeSeriesData(24, 180, 60, 0.1),
    color: "#9ca3af",
  },
];

export const agentMetricCards = [
  { label: "Total Agents", value: "6", change: "+1 this week", trend: "up" as const },
  { label: "Active Traces", value: "1,247", change: "+12% vs yesterday", trend: "up" as const },
  { label: "Open Issues", value: "4", change: "2 critical", trend: "down" as const },
  { label: "Avg Error Rate", value: "9.2%", change: "-3.1% vs last week", trend: "down" as const },
  { label: "Total Token Usage", value: "2.4M", change: "+18% this week", trend: "up" as const },
  { label: "Mean Latency", value: "6.8s", change: "+0.4s vs yesterday", trend: "up" as const },
];

export const severityBreakdown = [
  { name: "P0 Critical", value: 2, color: "#dc2626" },
  { name: "P1 High", value: 2, color: "#f87171" },
  { name: "P2 Medium", value: 2, color: "#d1d5db" },
  { name: "Resolved", value: 1, color: "#9ca3af" },
];

export const frameworkDistribution = [
  { name: "LangChain", value: 2, color: "#dc2626" },
  { name: "CrewAI", value: 2, color: "#6b7280" },
  { name: "AutoGen", value: 1, color: "#9ca3af" },
  { name: "LlamaIndex", value: 1, color: "#d1d5db" },
];
