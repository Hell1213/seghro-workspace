'use client';

import { Bot, ExternalLink, GitCompareArrows } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'degraded' | 'critical' | 'inactive';
  framework: string;
  lastRunAt: string;
  totalRuns: number;
  errorRate: number;
  avgLatency: number;
}

const statusConfig = {
  active: { color: 'bg-emerald-500', label: 'Active', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  degraded: { color: 'bg-amber-500', label: 'Degraded', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  critical: { color: 'bg-red-500', label: 'Critical', badge: 'bg-red-50 text-red-700 border-red-200' },
  inactive: { color: 'bg-gray-400', label: 'Inactive', badge: 'bg-gray-50 text-gray-500 border-gray-200' },
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export function AgentGrid({ agents, onSelect, onCompare, comparisonIds }: { agents: Agent[]; onSelect: (agent: Agent) => void; onCompare?: (agent: Agent) => void; comparisonIds?: string[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {agents.map((agent) => {
        const cfg = statusConfig[agent.status];
        return (
          <div
            key={agent.id}
            onClick={() => onSelect(agent)}
            className="group cursor-pointer rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:border-red-200 dark:hover:border-red-900/50 transition-colors duration-200 relative overflow-hidden card-lift"
          >
            {/* Status dot — top right, always visible */}
            <div className={`absolute top-3 right-3 h-2.5 w-2.5 rounded-full ${cfg.color} ${agent.status === 'critical' ? 'animate-pulse' : ''}`} title={cfg.label} />

            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 group-hover:bg-red-50 dark:group-hover:bg-red-950/30 transition-colors">
                <Bot className="h-4 w-4 text-gray-400 group-hover:text-[#dc2626] transition-colors" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-mono truncate">{agent.name}</h3>
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${cfg.badge}`}>
                  {cfg.label}
                </Badge>
              </div>
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 line-clamp-2 leading-relaxed min-h-[2.5rem]">
              {agent.description}
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Error Rate</span>
                <span className={`font-semibold tabular-nums ${agent.errorRate > 10 ? 'text-[#dc2626]' : agent.errorRate > 5 ? 'text-amber-600' : 'text-gray-700 dark:text-gray-300'}`}>
                  {agent.errorRate}%
                </span>
              </div>
              <Progress value={Math.min(agent.errorRate, 100)} className="h-1.5" />
              <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500">
                <span>{agent.framework}</span>
                <div className="flex items-center gap-2">
                  {onCompare && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onCompare(agent); }}
                      className={`p-0.5 rounded transition-colors ${comparisonIds?.includes(agent.id) ? 'text-[#dc2626]' : 'text-gray-300 hover:text-[#dc2626] opacity-0 group-hover:opacity-100'}`}
                      title={comparisonIds?.includes(agent.id) ? 'Selected' : 'Compare'}
                    >
                      <GitCompareArrows className="h-3 w-3" />
                    </button>
                  )}
                  <span>{timeAgo(agent.lastRunAt)}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
