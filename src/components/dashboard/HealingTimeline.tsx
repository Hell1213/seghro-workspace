'use client';

import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  ShieldAlert,
  RotateCcw,
  ArrowRightLeft,
  Timer,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { HealingAction } from '@/lib/self-healing-data';

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const severityConfig = {
  info: {
    color: 'border-l-gray-400 dark:border-l-gray-600',
    dot: 'bg-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-800/50',
  },
  warning: {
    color: 'border-l-amber-500',
    dot: 'bg-amber-500',
    bg: 'bg-amber-50/50 dark:bg-amber-950/20',
  },
  critical: {
    color: 'border-l-[#dc2626]',
    dot: 'bg-[#dc2626]',
    bg: 'bg-red-50/50 dark:bg-red-950/20',
  },
};

const actionIcons: Record<string, React.ElementType> = {
  'circuit breaker opened': ShieldAlert,
  'circuit breaker set to half-open': ArrowRightLeft,
  'circuit breaker reset attempt': RotateCcw,
  'fallback activated': ArrowRightLeft,
  'retry initiated': RotateCcw,
  'timeout increased': Timer,
  'queue enabled': Zap,
};

const resultIcons = {
  success: CheckCircle2,
  failed: XCircle,
  pending: Clock,
};

const resultColors = {
  success: 'text-emerald-500',
  failed: 'text-[#dc2626]',
  pending: 'text-amber-500',
};

interface HealingTimelineProps {
  actions: HealingAction[];
}

export function HealingTimeline({ actions }: HealingTimelineProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <Zap className="h-4 w-4 text-[#dc2626]" />
        Self-Healing Actions
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gray-200 dark:border-gray-700 text-gray-500 ml-1">
          {actions.length}
        </Badge>
      </h3>
      <div className="max-h-[400px] overflow-y-auto dashboard-scroll rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-0">
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-800" />

          {actions.map((action, i) => {
            const sev = severityConfig[action.severity];
            const ActionIcon = actionIcons[action.action.toLowerCase()] || Zap;
            const ResultIcon = resultIcons[action.result];
            const resultColor = resultColors[action.result];

            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
                className={`relative pl-8 pb-4 last:pb-0 border-l-2 ${sev.color} ml-0.5`}
              >
                {/* Dot on timeline */}
                <div
                  className={`absolute left-[-5px] top-1.5 h-[10px] w-[10px] rounded-full border-2 border-white dark:border-gray-900 ${sev.dot}`}
                />

                <div className={`${sev.bg} rounded-lg p-3`}>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge
                        className={`text-[10px] px-1.5 py-0 border-0 ${
                          action.type === 'automatic'
                            ? 'bg-[#dc2626] text-white'
                            : 'bg-gray-600 text-white'
                        }`}
                      >
                        {action.type === 'automatic' ? 'AUTO' : 'MANUAL'}
                      </Badge>
                      <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 truncate">
                        {action.action}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        {timeAgo(action.timestamp)}
                      </span>
                      <ResultIcon className={`h-3.5 w-3.5 ${resultColor}`} />
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <ActionIcon className="h-3 w-3 mt-0.5 text-gray-400 dark:text-gray-500 shrink-0" />
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                      {action.details}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400 dark:text-gray-500">
                    <span className="font-mono">{action.endpointName}</span>
                    {action.duration != null && (
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {action.duration >= 1000
                          ? `${(action.duration / 1000).toFixed(1)}s`
                          : `${action.duration}ms`}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
