'use client';

import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

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

interface AgentComparisonProps {
  agentA: Agent;
  agentB: Agent;
  open: boolean;
  onClose: () => void;
}

const statusConfig = {
  active: {
    label: 'Active',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800',
  },
  degraded: {
    label: 'Degraded',
    badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
  },
  critical: {
    label: 'Critical',
    badge: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800',
  },
  inactive: {
    label: 'Inactive',
    badge: 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
  },
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const formatNumber = (n: number) => n.toLocaleString();

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function MetricCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">
        {label}
      </span>
      <div>{children}</div>
    </div>
  );
}

export function AgentComparison({ agentA, agentB, open, onClose }: AgentComparisonProps) {
  // Determine winners for color highlighting
  const errorRateWorse = agentA.errorRate > agentB.errorRate ? 'a' : agentA.errorRate < agentB.errorRate ? 'b' : null;
  const latencySlower = agentA.avgLatency > agentB.avgLatency ? 'a' : agentA.avgLatency < agentB.avgLatency ? 'b' : null;

  // Bar chart data (normalized to max)
  const bars = [
    {
      label: 'Error Rate',
      valueA: agentA.errorRate,
      valueB: agentB.errorRate,
      formatA: `${agentA.errorRate}%`,
      formatB: `${agentB.errorRate}%`,
      max: Math.max(agentA.errorRate, agentB.errorRate, 1),
    },
    {
      label: 'Latency',
      valueA: agentA.avgLatency,
      valueB: agentB.avgLatency,
      formatA: `${agentA.avgLatency}s`,
      formatB: `${agentB.avgLatency}s`,
      max: Math.max(agentA.avgLatency, agentB.avgLatency, 0.1),
    },
    {
      label: 'Total Runs',
      valueA: agentA.totalRuns,
      valueB: agentB.totalRuns,
      formatA: formatNumber(agentA.totalRuns),
      formatB: formatNumber(agentB.totalRuns),
      max: Math.max(agentA.totalRuns, agentB.totalRuns, 1),
    },
  ];

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="pr-8">
          <SheetTitle>Agent Comparison</SheetTitle>
          <SheetDescription>
            {agentA.name} vs {agentB.name}
          </SheetDescription>
        </SheetHeader>

        <motion.div
          className="mt-4 px-4 pb-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={`${agentA.id}-${agentB.id}`}
        >
          {/* Two-column comparison */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
            {/* Agent A column with highlighting context */}
            <AgentColumnWithHighlighting agent={agentA} side="a" errorRateWorse={errorRateWorse} latencySlower={latencySlower} />

            {/* VS divider */}
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center pt-10"
            >
              <span className="text-lg font-bold text-gray-300 dark:text-gray-600 select-none">
                VS
              </span>
            </motion.div>

            {/* Agent B column */}
            <AgentColumnWithHighlighting agent={agentB} side="b" errorRateWorse={errorRateWorse} latencySlower={latencySlower} />
          </div>

          {/* Performance Comparison Bar Chart */}
          <motion.div variants={itemVariants} className="mt-8">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Performance Comparison
            </h4>
            <div className="space-y-5">
              {bars.map((bar, idx) => (
                <div key={bar.label}>
                  <div className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                    {bar.label}
                  </div>
                  {/* Agent A bar */}
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 w-16 shrink-0 truncate text-right">
                      {agentA.name}
                    </span>
                    <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                      <motion.div
                        className="h-full rounded bg-red-200 dark:bg-red-900/40"
                        initial={{ width: 0 }}
                        animate={{ width: `${(bar.valueA / bar.max) * 100}%` }}
                        transition={{ duration: 0.6, delay: 0.1 * idx }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-16 shrink-0">
                      {bar.formatA}
                    </span>
                  </div>
                  {/* Agent B bar */}
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 w-16 shrink-0 truncate text-right">
                      {agentB.name}
                    </span>
                    <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                      <motion.div
                        className="h-full rounded bg-gray-300 dark:bg-gray-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${(bar.valueB / bar.max) * 100}%` }}
                        transition={{ duration: 0.6, delay: 0.1 * idx + 0.08 }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-16 shrink-0">
                      {bar.formatB}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}

/* Internal component that receives highlighting context */
function AgentColumnWithHighlighting({
  agent,
  side,
  errorRateWorse,
  latencySlower,
}: {
  agent: Agent;
  side: 'a' | 'b';
  errorRateWorse: 'a' | 'b' | null;
  latencySlower: 'a' | 'b' | null;
}) {
  const cfg = statusConfig[agent.status];

  const isErrorWorse = errorRateWorse === side;
  const isErrorBetter = errorRateWorse !== null && errorRateWorse !== side;
  const isLatencySlower = latencySlower === side;
  const isLatencyFaster = latencySlower !== null && latencySlower !== side;

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-5"
    >
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-mono mb-4">
        {agent.name}
      </h3>

      <MetricCard label="Status">
        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${cfg.badge}`}>
          {cfg.label}
        </Badge>
      </MetricCard>

      <MetricCard label="Framework">
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
          <Cpu className="h-3.5 w-3.5 text-gray-400" />
          {agent.framework}
        </span>
      </MetricCard>

      <MetricCard label="Error Rate">
        <div className="text-right">
          <span
            className={`text-sm font-semibold ${
              isErrorWorse
                ? 'text-red-600 dark:text-red-400'
                : isErrorBetter
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-gray-900 dark:text-gray-100'
            }`}
          >
            {agent.errorRate}%
          </span>
          <div className="mt-1.5 h-1 w-24 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                agent.errorRate > 10
                  ? 'bg-red-500'
                  : agent.errorRate > 5
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(agent.errorRate, 100)}%` }}
              transition={{ duration: 0.6, delay: 0.3 }}
            />
          </div>
        </div>
      </MetricCard>

      <MetricCard label="Avg Latency">
        <span
          className={`text-sm font-semibold ${
            isLatencySlower
              ? 'text-red-600 dark:text-red-400'
              : isLatencyFaster
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-gray-900 dark:text-gray-100'
          }`}
        >
          {agent.avgLatency}s
        </span>
      </MetricCard>

      <MetricCard label="Total Runs">
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {formatNumber(agent.totalRuns)}
        </span>
      </MetricCard>

      <MetricCard label="Last Run">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {timeAgo(agent.lastRunAt)}
        </span>
      </MetricCard>
    </motion.div>
  );
}
