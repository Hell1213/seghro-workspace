import { db } from '@/lib/db';
import { error, success } from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { demoActivity } from '@/lib/demo-data';

interface ActivityEvent {
  id: string;
  type: 'trace' | 'issue' | 'healing' | 'alert' | 'deployment';
  title: string;
  description: string;
  agentName?: string;
  severity?: 'info' | 'warning' | 'critical';
  timestamp: string;
  metadata?: Record<string, string>;
}

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

    // Demo mode: return demo activity
    if (!orgId) {
      return success(demoActivity);
    }

    const traceWhere = orgId ? { agent: { orgId } } : {};
    const issueWhere = orgId ? { agent: { orgId } } : {};
    const alertWhere = orgId ? { agent: { orgId } } : {};

    const [recentTraces, recentIssues, recentAlerts] = await Promise.all([
      db.trace.findMany({ take: 8, orderBy: { createdAt: 'desc' }, where: traceWhere, include: { agent: { select: { name: true } }, _count: { select: { spans: true } } } }),
      db.issue.findMany({ take: 8, orderBy: { createdAt: 'desc' }, where: issueWhere, include: { agent: { select: { name: true } } } }),
      db.alert.findMany({ take: 8, orderBy: { createdAt: 'desc' }, where: alertWhere }),
    ]);

    const events: ActivityEvent[] = [];

    for (const t of recentTraces) {
      const isError = t.status === 'error';
      events.push({
        id: `trace-${t.id}`, type: 'trace',
        title: `Trace ${isError ? 'failed' : 'completed'} for ${t.agent.name}`,
        description: `Full observability trace captured — ${isError ? 'agent error detected' : 'all spans passed'}`,
        agentName: t.agent.name, severity: isError ? 'critical' : 'info',
        timestamp: t.createdAt.toISOString(),
        metadata: { spans: String(t._count.spans), duration: `${(t.duration / 1000).toFixed(1)}s`, tokens: `${t.inputTokens + t.outputTokens}` },
      });
    }

    for (const i of recentIssues) {
      events.push({
        id: `issue-${i.id}`, type: 'issue',
        title: `${i.severity === 'P0' ? 'New P0 issue' : 'Issue'}: ${i.title}`,
        description: `${i.agent.name} — ${i.description ?? ''}`,
        agentName: i.agent.name, severity: i.severity === 'P0' ? 'critical' : i.severity === 'P1' ? 'warning' : 'info',
        timestamp: i.createdAt.toISOString(),
        metadata: { severity: i.severity, status: i.status, affectedRuns: String(i.affectedRuns) },
      });
    }

    for (const a of recentAlerts) {
      events.push({
        id: `alert-${a.id}`, type: 'alert', title: a.title, description: a.message ?? '',
        severity: (a.severity as 'info' | 'warning' | 'critical') ?? 'info',
        timestamp: a.createdAt.toISOString(),
        metadata: { channel: a.channel, status: a.status },
      });
    }

    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return success(events.slice(0, 20));
  } catch (err) {
    console.error('[/api/activity] Error:', err);
    return error('Failed to fetch activity');
  }
}
