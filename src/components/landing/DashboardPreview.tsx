'use client';

import { Bot, GitBranch, AlertTriangle, Clock, Zap, Activity } from 'lucide-react';

const metrics = [
  { label: 'Agents', value: '9', icon: Bot, change: '+2 this week' },
  { label: 'Traces', value: '1.2K', icon: GitBranch, change: '+340 today' },
  { label: 'Issues', value: '5', icon: AlertTriangle, change: '3 resolved' },
  { label: 'Error Rate', value: '6.1%', icon: Zap, change: '↓ 1.2% vs avg' },
  { label: 'Tokens', value: '0.1M', icon: Activity, change: '±2.4K / hr' },
  { label: 'Latency', value: '4.5s', icon: Clock, change: 'p95 avg' },
];

const agents = [
  { name: 'customer-support', status: 'active' as const, errorRate: 2.3, framework: 'LangChain', description: 'Handles customer support tickets and FAQ automation' },
  { name: 'data-pipeline', status: 'degraded' as const, errorRate: 8.1, framework: 'CrewAI', description: 'ETL pipeline for ingesting and transforming data feeds' },
  { name: 'code-reviewer', status: 'active' as const, errorRate: 1.1, framework: 'AutoGen', description: 'Automated PR review with suggestions and issue detection' },
];

const statusCfg = {
  active: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' },
  degraded: { dot: 'bg-amber-500', badge: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50' },
  critical: { dot: 'bg-red-500', badge: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50' },
};

export function DashboardPreview() {
  return (
    <section id="dashboard" className="py-20 sm:py-28 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 mb-5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#dc2626] dark:text-red-400">LIVE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            The observability dashboard
          </h2>
          <p className="max-w-2xl mx-auto text-gray-500 dark:text-gray-400 leading-relaxed">
            Real-time monitoring of AI agent traces, issues, and metrics — everything running live below.
          </p>
        </div>

        {/* Dashboard card shell */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          {/* Metric cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 sm:p-6">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:border-red-100 dark:hover:border-red-900/40 transition-colors group hover:shadow-[0_2px_0_0_#dc2626]"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 group-hover:bg-red-50 dark:group-hover:bg-red-950/30 transition-colors">
                    <m.icon className="h-4 w-4 text-gray-400 group-hover:text-[#dc2626] transition-colors" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{m.value}</p>
                <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500 truncate">{m.change}</p>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-gray-800 mx-4 sm:mx-6" />

          {/* Agent cards */}
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Monitored Agents</h3>
              <span className="text-xs text-gray-400 dark:text-gray-500">(3)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {agents.map((a) => {
                const cfg = statusCfg[a.status];
                return (
                  <div
                    key={a.name}
                    className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:border-red-200 dark:hover:border-red-900/50 transition-colors relative overflow-hidden"
                  >
                    <div className={`absolute top-3 right-3 h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
                        <Bot className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-mono truncate">{a.name}</h4>
                        <span className={`inline-block text-[10px] px-1.5 py-0 rounded border ${cfg.badge}`}>
                          {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 line-clamp-2 leading-relaxed">{a.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Error Rate</span>
                      <span className={`font-semibold tabular-nums ${a.errorRate > 5 ? 'text-amber-600' : 'text-gray-700 dark:text-gray-300'}`}>
                        {a.errorRate}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${a.errorRate > 5 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(a.errorRate * 4, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                      <span>{a.framework}</span>
                      <span>2m ago</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
