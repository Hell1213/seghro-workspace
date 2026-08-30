import { db } from '@/lib/db';
import { success, error } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { demoStats } from '@/lib/demo-data';

export async function GET() {
  try {
    let orgId: string | null = null;
    try {
      const session = await getServerSession(authOptions);
      if (session?.user) {
        const user = session.user as { orgId?: string | null };
        orgId = user.orgId ?? null;
      }
    } catch { /* unauthenticated — demo mode */ }

    // Demo mode: return demo stats
    if (!orgId) {
      return success(demoStats);
    }

    const agentWhere = orgId ? { orgId } : {};
    const traceWhere = orgId ? { agent: { orgId } } : {};
    const issueWhere = orgId ? { agent: { orgId } } : {};

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      totalAgents, activeAgents, totalTraces, totalIssues, openIssues, criticalIssues,
      agentAggregations, tokenAggregation,
    ] = await Promise.all([
      db.agent.count({ where: agentWhere }),
      db.agent.count({ where: { status: 'active', ...agentWhere } }),
      db.trace.count({ where: traceWhere }),
      db.issue.count({ where: issueWhere }),
      db.issue.count({ where: { status: 'open', ...issueWhere } }),
      db.issue.count({ where: { severity: 'P0', ...issueWhere } }),
      db.agent.aggregate({ _avg: { errorRate: true, avgLatency: true }, where: agentWhere }),
      db.trace.aggregate({ _sum: { inputTokens: true, outputTokens: true }, where: { createdAt: { gte: twentyFourHoursAgo }, ...traceWhere } }),
    ]);

    return success({
      totalAgents, activeAgents, totalTraces, totalIssues, openIssues, criticalIssues,
      avgErrorRate: agentAggregations._avg.errorRate ?? 0,
      avgLatency: agentAggregations._avg.avgLatency ?? 0,
      tokensUsed24h: (tokenAggregation._sum.inputTokens ?? 0) + (tokenAggregation._sum.outputTokens ?? 0),
    });
  } catch (err) {
    console.error('[/api/stats] GET Error:', err);
    return error('Failed to fetch stats');
  }
}
