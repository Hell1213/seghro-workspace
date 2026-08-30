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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{agent.name}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Public Status Page</p>
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-lg font-bold capitalize">{agent.status}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Total Runs</p>
            <p className="text-lg font-bold">{agent.totalRuns.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Error Rate</p>
            <p className="text-lg font-bold">{agent.errorRate}%</p>
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Recent Traces</h2>
          {agent.traces.length === 0 ? (
            <p className="text-gray-500">No traces yet</p>
          ) : (
            <div className="space-y-2">
              {agent.traces.map((t: any) => (
                <div key={t.id} className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow flex justify-between">
                  <span className="text-sm font-mono">{t.traceId.slice(0, 16)}...</span>
                  <span className={`text-sm font-medium ${t.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-8 text-center text-sm text-gray-400">
          Powered by <a href="https://seghro.dev" className="text-red-600 hover:underline">Seghro</a>
        </div>
      </div>
    </div>
  );
}
