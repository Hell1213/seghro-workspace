'use client';

import { motion } from 'framer-motion';
import { Bot, ExternalLink } from 'lucide-react';
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

export function AgentGrid({ agents, onSelect }: { agents: Agent[]; onSelect: (agent: Agent) => void }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map((agent, i) => {
        const cfg = statusConfig[agent.status];
        return (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            onClick={() => onSelect(agent)}
            className="group cursor-pointer rounded-xl border border-gray-100 bg-white p-5 hover:border-red-200 hover:shadow-lg hover:shadow-red-50 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`relative flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 group-hover:bg-red-50 transition-colors`}>
                  <Bot className="h-4.5 w-4.5 text-gray-400 group-hover:text-[#dc2626] transition-colors" />
                  <div className={`absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ${cfg.color} ${agent.status === 'critical' ? 'animate-pulse' : ''}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 font-mono">{agent.name}</h3>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${cfg.badge}`}>
                    {cfg.label}
                  </Badge>
                </div>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-gray-300 group-hover:text-[#dc2626] transition-colors" />
            </div>

            <p className="text-xs text-gray-400 mb-4 line-clamp-2 leading-relaxed">
              {agent.description}
            </p>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Error Rate</span>
                <span className={`font-semibold ${agent.errorRate > 10 ? 'text-[#dc2626]' : agent.errorRate > 5 ? 'text-amber-600' : 'text-gray-700'}`}>
                  {agent.errorRate}%
                </span>
              </div>
              <Progress
                value={Math.min(agent.errorRate, 100)}
                className="h-1.5"
              />
              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                <span>{agent.framework}</span>
                <span>{timeAgo(agent.lastRunAt)}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
