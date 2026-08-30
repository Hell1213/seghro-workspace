import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

interface Agent {
  id: string;
  name: string;
  description: string | null;
  status: string;
  framework: string | null;
  orgId: string | null;
  lastRunAt: Date | null;
  totalRuns: number;
  errorRate: number;
  avgLatency: number;
  createdAt: Date;
  updatedAt: Date;
}

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data
  await db.alert.deleteMany()
  await db.metric.deleteMany()
  await db.span.deleteMany()
  await db.trace.deleteMany()
  await db.issue.deleteMany()
  await db.agent.deleteMany()
  await db.user.deleteMany()
  await db.organization.deleteMany()

  // Create demo organization
  const org = await db.organization.create({
    data: {
      name: 'Sentinel Demo',
      slug: 'sentinel-demo',
      plan: 'pro',
    },
  })
  console.log(`✅ Organization created: ${org.name}`)

  // Create demo user
  const user = await db.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@sentinel.dev',
      role: 'admin',
      orgId: org.id,
    },
  })
  console.log(`✅ User created: ${user.email} (${user.role})`)

  // Create agents
  const agentsData = [
    { name: 'support-agent', description: 'Customer support LLM agent handling ticket creation and escalation', status: 'critical', framework: 'LangChain', totalRuns: 14832, errorRate: 34.2, avgLatency: 4.2, lastRunAt: new Date(Date.now() - 120000) },
    { name: 'research-agent', description: 'Research assistant for literature review and summarization', status: 'active', framework: 'CrewAI', totalRuns: 8291, errorRate: 2.1, avgLatency: 8.7, lastRunAt: new Date(Date.now() - 300000) },
    { name: 'checkout-agent', description: 'E-commerce checkout flow with refund and policy enforcement', status: 'degraded', framework: 'AutoGen', totalRuns: 21504, errorRate: 12.8, avgLatency: 3.1, lastRunAt: new Date(Date.now() - 60000) },
    { name: 'onboarding-agent', description: 'User onboarding flow with personalization and setup guidance', status: 'active', framework: 'LlamaIndex', totalRuns: 5620, errorRate: 1.4, avgLatency: 6.3, lastRunAt: new Date(Date.now() - 450000) },
    { name: 'data-pipeline', description: 'Automated data extraction, transformation and loading agent', status: 'inactive', framework: 'LangGraph', totalRuns: 3201, errorRate: 0.8, avgLatency: 12.4, lastRunAt: new Date(Date.now() - 86400000) },
    { name: 'code-review-bot', description: 'Automated code review agent for pull request analysis', status: 'active', framework: 'CrewAI', totalRuns: 9874, errorRate: 3.7, avgLatency: 5.8, lastRunAt: new Date(Date.now() - 180000) },
  ]

  const createdAgents: Agent[] = []
  for (const a of agentsData) {
    const agent = await db.agent.create({ data: a })
    createdAgents.push(agent)
    console.log(`✅ Agent created: ${agent.name}`)
  }

  // Create traces with spans
  const spanSets: Record<string, { name: string; type: string; status: string; duration: number; startTime: number; model?: string; tool?: string; inputTokens: number; outputTokens: number }[]> = {
    [createdAgents[0].id]: [
      { name: 'input_guardrail', type: 'guard', status: 'success', duration: 142, startTime: 0, inputTokens: 256, outputTokens: 12 },
      { name: 'retrieve_context', type: 'retrieval', status: 'success', duration: 2100, startTime: 142, inputTokens: 512, outputTokens: 890 },
      { name: 'vector_search', type: 'retrieval', status: 'success', duration: 1440, startTime: 142, inputTokens: 200, outputTokens: 340 },
      { name: 'model', type: 'model', status: 'warning', duration: 3200, startTime: 2242, model: 'gpt-4o', inputTokens: 1840, outputTokens: 420 },
      { name: 'tools', type: 'tool', status: 'error', duration: 3400, startTime: 5442, tool: 'create_ticket', inputTokens: 600, outputTokens: 180 },
      { name: 'research_literature', type: 'retrieval', status: 'success', duration: 3200, startTime: 5442, inputTokens: 800, outputTokens: 1200 },
      { name: 'model', type: 'model', status: 'error', duration: 1800, startTime: 8842, model: 'gpt-4o', inputTokens: 2100, outputTokens: 90 },
      { name: 'model', type: 'model', status: 'warning', duration: 1900, startTime: 10642, model: 'gpt-4o-mini', inputTokens: 1900, outputTokens: 340 },
      { name: 'speak_to_user', type: 'output', status: 'success', duration: 500, startTime: 12542, inputTokens: 300, outputTokens: 85 },
    ],
    [createdAgents[1].id]: [
      { name: 'query_parser', type: 'guard', status: 'success', duration: 85, startTime: 0, inputTokens: 180, outputTokens: 8 },
      { name: 'literature_search', type: 'retrieval', status: 'success', duration: 4500, startTime: 85, inputTokens: 300, outputTokens: 2100 },
      { name: 'model', type: 'model', status: 'success', duration: 5200, startTime: 4585, model: 'claude-3.5-sonnet', inputTokens: 3200, outputTokens: 1800 },
      { name: 'format_output', type: 'output', status: 'success', duration: 120, startTime: 9785, inputTokens: 200, outputTokens: 1500 },
    ],
    [createdAgents[2].id]: [
      { name: 'input_validation', type: 'guard', status: 'success', duration: 95, startTime: 0, inputTokens: 140, outputTokens: 10 },
      { name: 'policy_check', type: 'guard', status: 'error', duration: 280, startTime: 95, inputTokens: 350, outputTokens: 22 },
      { name: 'model', type: 'model', status: 'warning', duration: 1800, startTime: 375, model: 'gpt-4o', inputTokens: 900, outputTokens: 280 },
      { name: 'refund_tool', type: 'tool', status: 'error', duration: 600, startTime: 2175, tool: 'process_refund', inputTokens: 200, outputTokens: 45 },
      { name: 'model', type: 'model', status: 'success', duration: 1400, startTime: 2775, model: 'gpt-4o-mini', inputTokens: 700, outputTokens: 190 },
      { name: 'response', type: 'output', status: 'success', duration: 80, startTime: 4175, inputTokens: 100, outputTokens: 60 },
    ],
  }

  const defaultSpans = [
    { name: 'user_profile', type: 'retrieval', status: 'success', duration: 300, startTime: 0, inputTokens: 100, outputTokens: 450 },
    { name: 'model', type: 'model', status: 'success', duration: 4200, startTime: 300, model: 'gpt-4o', inputTokens: 1400, outputTokens: 980 },
    { name: 'response', type: 'output', status: 'success', duration: 60, startTime: 7400, inputTokens: 80, outputTokens: 120 },
  ]

  let traceCount = 0
  for (const agent of createdAgents) {
    const spans = spanSets[agent.id] || defaultSpans
    const count = agent.status === 'critical' ? 3 : 1

    for (let i = 0; i < count; i++) {
      const totalDuration = Math.max(...spans.map(s => s.startTime + s.duration))
      const inputTokens = spans.reduce((a, s) => a + s.inputTokens, 0)
      const outputTokens = spans.reduce((a, s) => a + s.outputTokens, 0)
      const status = agent.status === 'critical' && i === 0 ? 'error'
        : agent.status === 'degraded' && i === 0 ? 'warning'
        : 'success'

      const trace = await db.trace.create({
        data: {
          agentId: agent.id,
          traceId: `${agent.id.slice(-2)}e0c8418-${i === 0 ? 'c8a5' : 'a7b3'}-4efb-972b-${i === 0 ? '5dd2abd93cee' : '8ec4f7a21d09'}`,
          status,
          duration: totalDuration,
          inputTokens,
          outputTokens,
          createdAt: new Date(Date.now() - (i * 300000 + Math.random() * 60000)),
          spans: {
            create: spans.map(s => ({
              name: s.name,
              type: s.type,
              status: s.status,
              duration: s.duration,
              startTime: s.startTime,
              model: s.model,
              tool: s.tool,
              inputTokens: s.inputTokens,
              outputTokens: s.outputTokens,
            })),
          },
        },
      })
      traceCount++
    }
  }
  console.log(`✅ ${traceCount} traces created with spans`)

  // Create issues
  const issuesData = [
    { agentId: createdAgents[0].id, title: 'Fabricated customer identifiers', description: 'When a customer cannot be identified, the agent invents placeholder identifiers instead of asking.', severity: 'P0', status: 'open', affectedRuns: 33, totalRuns: 50, failureRate: 66, rootCause: 'Missing guardrail for customer identification.', suggestedFix: 'Require the agent to ask for the customers email before any lookup.' },
    { agentId: createdAgents[2].id, title: 'Refunds promised outside policy window', description: 'Agent offers refunds beyond the 30-day policy window, creating liability exposure.', severity: 'P0', status: 'investigating', affectedRuns: 12, totalRuns: 85, failureRate: 14.1, rootCause: 'Prompt revision introduced broader refund language.', suggestedFix: 'Tighten prompts to only offer refunds within the 30-day policy window.' },
    { agentId: createdAgents[0].id, title: 'Orphaned escalation tickets', description: 'Agent creates escalation tickets referencing non-existent customer IDs.', severity: 'P1', status: 'open', affectedRuns: 15, totalRuns: 50, failureRate: 30, rootCause: 'Escalations fire before customer verification.', suggestedFix: 'Add dependency: escalation tool requires valid customerId.' },
    { agentId: createdAgents[5].id, title: 'False positive security alerts', description: 'Security scan produces excessive false positives on benign pattern matches.', severity: 'P2', status: 'resolved', affectedRuns: 28, totalRuns: 200, failureRate: 14, rootCause: 'Overly aggressive regex patterns in security scanner.', suggestedFix: 'Add context-aware filtering for test files and constants.' },
    { agentId: createdAgents[2].id, title: 'Inconsistent tax calculation', description: 'Agent applies different tax rates for identical orders depending on conversation context.', severity: 'P1', status: 'open', affectedRuns: 8, totalRuns: 85, failureRate: 9.4, rootCause: 'Tax calculation tool uses stale context.', suggestedFix: 'Pass full current order state to tax calculation tool.' },
    { agentId: createdAgents[1].id, title: 'Hallucinated citation references', description: 'Agent generates plausible but non-existent paper citations in research summaries.', severity: 'P2', status: 'reopened', affectedRuns: 5, totalRuns: 120, failureRate: 4.2, rootCause: 'Model generates citations from training data.', suggestedFix: 'Constrain output to only cite papers from retrieval step.' },
  ]

  const createdIssues: Array<{ id: string; title: string; description: string | null; status: string; severity: string; agentId: string; affectedRuns: number; totalRuns: number; failureRate: number; rootCause: string | null; suggestedFix: string | null; createdAt: Date; updatedAt: Date }> = []
  for (const issue of issuesData) {
    const created = await db.issue.create({ data: issue })
    createdIssues.push(created)
    console.log(`✅ Issue created: ${created.title}`)
  }

  // Create alerts
  const alertsData = [
    { title: '🚨 New P0 issue found in support-agent', message: 'When a customer cannot be identified, the agent invents placeholder identifiers. 33 of the last 50 runs affected.', severity: 'critical', status: 'unread', channel: 'slack', createdAt: new Date(Date.now() - 120000) },
    { title: '⚠️ checkout-agent error rate spiked to 12.8%', message: 'Error rate increased from 3.2% to 12.8% in the last hour.', severity: 'warning', status: 'unread', channel: 'slack', createdAt: new Date(Date.now() - 600000) },
    { title: '🔧 Fix deployed for code-review-bot', message: 'PR #482 merged — false positive security alerts issue resolved.', severity: 'info', status: 'read', channel: 'slack', createdAt: new Date(Date.now() - 3600000) },
    { title: '📊 Weekly agent reliability report ready', message: 'support-agent: 66% failure rate (critical) | checkout-agent: 14% failure rate (degraded) | Others: <5% (healthy)', severity: 'info', status: 'read', channel: 'slack', createdAt: new Date(Date.now() - 7200000) },
    { title: '🔄 research-agent hallucinated citations reopened', message: 'Issue #06 reopened — 5 new occurrences detected in the last 24h.', severity: 'warning', status: 'unread', channel: 'slack', createdAt: new Date(Date.now() - 5400000) },
    { title: '✅ onboarding-agent all traces passing', message: '50 consecutive traces scored clean.', severity: 'info', status: 'read', channel: 'slack', createdAt: new Date(Date.now() - 10800000) },
    { title: '🚨 Escalation: 7 orphaned tickets created', message: 'support-agent created 7 escalation tickets routing to nonexistent customer IDs.', severity: 'critical', status: 'unread', channel: 'slack', agentId: createdAgents[0].id, issueId: createdIssues[2]?.id, createdAt: new Date(Date.now() - 1800000) },
  ]

  for (const alert of alertsData) {
    await db.alert.create({ data: alert as any })
  }
  console.log(`✅ ${alertsData.length} alerts created`)

  // Create metrics
  const now = Date.now()
  const metricNames = ['Error Rate %', 'Avg Latency (s)', 'Throughput (req/min)', 'Token Usage (K)']
  let metricCount = 0

  for (const agent of createdAgents) {
    for (const name of metricNames) {
      for (let i = 0; i < 96; i++) {
        const t = new Date(now - i * 15 * 60 * 1000)
        const baseValues: Record<string, number> = {
          'Error Rate %': 8,
          'Avg Latency (s)': 5.2,
          'Throughput (req/min)': 42,
          'Token Usage (K)': 180,
        }
        const variance: Record<string, number> = {
          'Error Rate %': 6,
          'Avg Latency (s)': 2,
          'Throughput (req/min)': 15,
          'Token Usage (K)': 60,
        }
        const value = Math.max(0, baseValues[name] + (Math.random() - 0.5) * variance[name])
        await db.metric.create({
          data: {
            agentId: agent.id,
            name,
            value,
            timestamp: t,
          },
        })
        metricCount++
      }
    }
  }
  console.log(`✅ ${metricCount} metric data points created`)

  // Seed monitored endpoints
  const endpoints = [
    { id: 'ep-openai-gpt4o', name: 'OpenAI GPT-4o', baseUrl: 'https://api.openai.com/v1', category: 'llm', status: 'healthy', circuitBreaker: 'closed', responseTime: 45, errorRate: 0.3 },
    { id: 'ep-anthropic-claude', name: 'Anthropic Claude 3.5', baseUrl: 'https://api.anthropic.com/v1', category: 'llm', status: 'degraded', circuitBreaker: 'half-open', responseTime: 820, errorRate: 15.2 },
    { id: 'ep-stripe', name: 'Stripe Payments', baseUrl: 'https://api.stripe.com/v1', category: 'payment', status: 'healthy', circuitBreaker: 'closed', responseTime: 187, errorRate: 0.4 },
    { id: 'ep-tavily', name: 'Tavily Search', baseUrl: 'https://api.tavily.com', category: 'search', status: 'down', circuitBreaker: 'open', responseTime: 0, errorRate: 100 },
  ]

  for (const ep of endpoints) {
    await db.monitoredEndpoint.upsert({ where: { id: ep.id }, update: ep, create: ep })
    console.log(`✅ Endpoint created: ${ep.name}`)
  }

  console.log('\n🎉 Seeding complete!')
  console.log(`   Demo user: demo@sentinel.dev / demo1234`)
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
