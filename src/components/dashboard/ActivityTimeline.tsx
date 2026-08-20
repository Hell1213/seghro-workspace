'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Bell,
  Wrench,
  Rocket,
  FileSearch,
  type LucideIcon,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type EventType =
  | 'trace'
  | 'issue'
  | 'healing'
  | 'alert'
  | 'deployment';

interface ActivityEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  agentName?: string;
  severity?: 'info' | 'warning' | 'critical';
  timestamp: string;
  metadata?: Record<string, string>;
}

const eventConfig: Record<EventType, { icon: LucideIcon; color: string; bg: string; darkBg: string }> = {
  trace: {
    icon: FileSearch,
    color: 'text-cyan-500',
    bg: 'bg-cyan-100',
    darkBg: 'dark:bg-cyan-900/40',
  },
  issue: {
    icon: AlertTriangle,
    color: 'text-amber-500',
    bg: 'bg-amber-100',
    darkBg: 'dark:bg-amber-900/40',
  },
  healing: {
    icon: Wrench,
    color: 'text-orange-500',
    bg: 'bg-orange-100',
    darkBg: 'dark:bg-orange-900/40',
  },
  alert: {
    icon: Bell,
    color: 'text-[#dc2626]',
    bg: 'bg-red-100',
    darkBg: 'dark:bg-red-900/40',
  },
  deployment: {
    icon: Rocket,
    color: 'text-emerald-500',
    bg: 'bg-emerald-100',
    darkBg: 'dark:bg-emerald-900/40',
  },
};

const severityColorMap: Record<string, { title: string; darkTitle: string }> = {
  critical: { title: 'text-[#dc2626]', darkTitle: 'dark:text-red-400' },
  warning: { title: 'text-amber-600', darkTitle: 'dark:text-amber-400' },
  info: { title: 'text-gray-900', darkTitle: 'dark:text-gray-100' },
};

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatMetadata(meta?: Record<string, string>): string {
  if (!meta) return '';
  return Object.entries(meta)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ');
}

function TimelineSkeleton() {
  return (
    <div className="w-full space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="relative flex gap-4 py-3">
          <div className="relative z-10 flex-shrink-0">
            <Skeleton className="h-[30px] w-[30px] rounded-full" />
          </div>
          <div className="flex-1 min-w-0 pt-0.5 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  },
};

export function ActivityTimeline() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/activity')
      .then((res) => res.json())
      .then((data: ActivityEvent[]) => {
        setEvents(data);
      })
      .catch(() => {
        // Silently fall back to empty state
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="w-full">
        <TimelineSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-800" />

        <motion.div
          className="space-y-0"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {events.map((event) => {
            const config = eventConfig[event.type];
            const Icon = config.icon;
            const isCritical = event.severity === 'critical';
            const severityColors = severityColorMap[event.severity ?? 'info'];
            const metaStr = event.agentName
              ? `Agent: ${event.agentName}` + (event.metadata ? ` · ${formatMetadata(event.metadata)}` : '')
              : formatMetadata(event.metadata);
            return (
              <motion.div
                key={event.id}
                variants={itemVariants}
                className="relative flex gap-4 py-3 group"
              >
                {/* Dot / icon */}
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className={`flex h-[30px] w-[30px] items-center justify-center rounded-full ${config.bg} ${config.darkBg} ring-4 ring-white dark:ring-gray-950`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                  </div>
                  {isCritical && (
                    <div className="absolute top-0 left-0 h-[30px] w-[30px] rounded-full animate-ping bg-red-400/20" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium truncate ${severityColors.title} ${severityColors.darkTitle}`}>
                      {event.title}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                      {formatRelativeTime(event.timestamp)}
                    </span>
                    {metaStr && (
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">
                        ·{'\u00A0'}{metaStr}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
