'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Bot, Activity, Clock, AlertTriangle, Zap, ExternalLink } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { issues } from '@/lib/seed-data';

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
  active: { label: 'Active', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  degraded: { label: 'Degraded', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  critical: { label: 'Critical', badge: 'bg-red-50 text-red-700 border-red-200' },
  inactive: { label: 'Inactive', badge: 'bg-gray-50 text-gray-500 border-gray-200' },
};

const severityBadge = {
  P0: 'bg-red-600 text-white',
  P1: 'bg-amber-500 text-white',
  P2: 'bg-gray-400 text-white',
};

// Seeded random number generator from a numeric seed
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export function AgentDetailSheet({ agent, open, onClose }: { agent: Agent | null; open: boolean; onClose: () => void }) {
  const agentIssues = useMemo(() => {
    if (!agent) return [];
    return issues.filter((i) => i.agentId === agent.id).slice(0, 3);
  }, [agent]);

  const sparklineData = useMemo(() => {
    if (!agent) return [];
    const seed = Math.round(agent.errorRate * 1000);
    const rand = seededRandom(seed);
    return Array.from({ length: 10 }, (_, i) => ({
      value: Math.max(0, agent.errorRate + (rand() - 0.5) * agent.errorRate * 1.5 + (i > 5 ? -2 : 0)),
    }));
  }, [agent]);

  if (!agent) return null;

  const cfg = statusConfig[agent.status];

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 bg-white dark:bg-gray-950 overflow-y-auto">
        <SheetHeader className="p-5 pb-0">
          <SheetTitle className="sr-only">Agent Details</SheetTitle>
          <SheetDescription className="sr-only">Detailed information about {agent.name}</SheetDescription>
        </SheetHeader>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="px-5 pb-6 space-y-5"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex items-start justify-between pr-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
                <Bot className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold font-mono text-gray-900 dark:text-gray-100">{agent.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${cfg.badge}`}>
                    {cfg.label}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gray-200 text-gray-500">
                    {agent.framework}
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.p variants={itemVariants} className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            {agent.description}
          </motion.p>

          {/* Stats Row - 2x2 grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-3">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 mb-1">
                <Activity className="h-3 w-3" />
                Total Runs
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{agent.totalRuns.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-3">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 mb-1">
                <AlertTriangle className="h-3 w-3" />
                Error Rate
              </div>
              <p className={`text-sm font-semibold ${agent.errorRate > 10 ? 'text-red-600' : agent.errorRate > 5 ? 'text-amber-600' : 'text-gray-900 dark:text-gray-100'}`}>
                {agent.errorRate}%
              </p>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-3">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 mb-1">
                <Zap className="h-3 w-3" />
                Avg Latency
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{agent.avgLatency}s</p>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-3">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 mb-1">
                <Clock className="h-3 w-3" />
                Last Run
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{timeAgo(agent.lastRunAt)}</p>
            </div>
          </motion.div>

          {/* Sparkline Chart */}
          <motion.div variants={itemVariants}>
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Error Rate Trend</h4>
            <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30 p-3">
              <ResponsiveContainer width="100%" height={80}>
                <AreaChart data={sparklineData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <defs>
                    <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#dc2626" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#dc2626" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#dc2626"
                    strokeWidth={2}
                    fill="url(#errorGradient)"
                    dot={false}
                    isAnimationActive={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Recent Issues */}
          <motion.div variants={itemVariants}>
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Recent Issues</h4>
            {agentIssues.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 py-3">No issues found for this agent.</p>
            ) : (
              <div className="space-y-2">
                {agentIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-center gap-2.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3"
                  >
                    <Badge className={`${severityBadge[issue.severity]} text-[10px] px-1.5 py-0 border-0`}>
                      {issue.severity}
                    </Badge>
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate flex-1">{issue.title}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1 text-xs h-8 border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-600">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              View Full Trace
            </Button>
            <Button variant="outline" size="sm" className="flex-1 text-xs h-8 border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-600">
              View All Issues
            </Button>
          </motion.div>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
