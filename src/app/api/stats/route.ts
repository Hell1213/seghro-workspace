import { db } from '@/lib/db';
import { success, error } from '@/lib/api-response';

export async function GET() {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      totalAgents,
      activeAgents,
      totalTraces,
      totalIssues,
      openIssues,
      criticalIssues,
      agentAggregations,
      tokenAggregation,
    ] = await Promise.all([
      db.agent.count(),
      db.agent.count({ where: { status: 'active' } }),
      db.trace.count(),
      db.issue.count(),
      db.issue.count({ where: { status: 'open' } }),
      db.issue.count({ where: { severity: 'P0' } }),
      db.agent.aggregate({
        _avg: {
          errorRate: true,
          avgLatency: true,
        },
      }),
      db.trace.aggregate({
        _sum: {
          inputTokens: true,
          outputTokens: true,
        },
        where: {
          createdAt: { gte: twentyFourHoursAgo },
        },
      }),
    ]);

    return success({
      totalAgents,
      activeAgents,
      totalTraces,
      totalIssues,
      openIssues,
      criticalIssues,
      avgErrorRate: agentAggregations._avg.errorRate ?? 0,
      avgLatency: agentAggregations._avg.avgLatency ?? 0,
      tokensUsed24h: (tokenAggregation._sum.inputTokens ?? 0) + (tokenAggregation._sum.outputTokens ?? 0),
    });
  } catch (err) {
    console.error('[/api/stats] GET Error:', err);
    return error('Failed to fetch stats');
  }
}
