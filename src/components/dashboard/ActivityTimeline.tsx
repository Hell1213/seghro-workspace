'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Bell,
  Eye,
  Wrench,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';

type EventType =
  | 'agent_status_change'
  | 'issue_detected'
  | 'issue_resolved'
  | 'alert_fired'
  | 'alert_acknowledged'
  | 'mcp_fix_run'
  | 'eval_completed';

interface TimelineEvent {
  id: string;
  type: EventType;
  timestamp: string;
  title: string;
  description: string;
  metadata?: string;
  critical: boolean;
}

const eventConfig: Record<EventType, { icon: LucideIcon; color: string; bg: string; darkBg: string }> = {
  agent_status_change: {
    icon: Activity,
    color: 'text-blue-500',
    bg: 'bg-blue-100',
    darkBg: 'dark:bg-blue-900/40',
  },
  issue_detected: {
    icon: AlertTriangle,
    color: 'text-amber-500',
    bg: 'bg-amber-100',
    darkBg: 'dark:bg-amber-900/40',
  },
  issue_resolved: {
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bg: 'bg-emerald-100',
    darkBg: 'dark:bg-emerald-900/40',
  },
  alert_fired: {
    icon: Bell,
    color: 'text-[#dc2626]',
    bg: 'bg-red-100',
    darkBg: 'dark:bg-red-900/40',
  },
  alert_acknowledged: {
    icon: Eye,
    color: 'text-purple-500',
    bg: 'bg-purple-100',
    darkBg: 'dark:bg-purple-900/40',
  },
  mcp_fix_run: {
    icon: Wrench,
    color: 'text-orange-500',
    bg: 'bg-orange-100',
    darkBg: 'dark:bg-orange-900/40',
  },
  eval_completed: {
    icon: BarChart3,
    color: 'text-cyan-500',
    bg: 'bg-cyan-100',
    darkBg: 'dark:bg-cyan-900/40',
  },
};

function minutesAgo(m: number): string {
  const d = new Date(Date.now() - m * 60 * 1000);
  return d.toISOString();
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const mockEvents: TimelineEvent[] = [
  {
    id: 'act-1',
    type: 'alert_fired',
    timestamp: minutesAgo(3),
    title: 'Error rate spike detected',
    description: 'Support agent error rate exceeded 40% threshold',
    metadata: 'Agent: support-agent',
    critical: true,
  },
  {
    id: 'act-2',
    type: 'alert_acknowledged',
    timestamp: minutesAgo(8),
    title: 'Alert acknowledged by ops team',
    description: 'High latency alert on code-reviewer acknowledged',
    metadata: 'User: @sarah.chen',
    critical: false,
  },
  {
    id: 'act-3',
    type: 'issue_detected',
    timestamp: minutesAgo(15),
    title: 'Token budget overflow',
    description: 'Data-pipeline agent exceeded 50k token budget per request',
    metadata: 'Severity: P1',
    critical: true,
  },
  {
    id: 'act-4',
    type: 'mcp_fix_run',
    timestamp: minutesAgo(22),
    title: 'MCP auto-fix applied',
    description: 'Retry logic patched for data-pipeline token overflow',
    metadata: 'Fix: retry-with-backoff',
    critical: false,
  },
  {
    id: 'act-5',
    type: 'agent_status_change',
    timestamp: minutesAgo(35),
    title: 'Agent status changed',
    description: 'Support agent transitioned from active to degraded',
    metadata: 'Agent: support-agent',
    critical: true,
  },
  {
    id: 'act-6',
    type: 'eval_completed',
    timestamp: minutesAgo(48),
    title: 'Evaluation run completed',
    description: 'Weekly quality eval: 87.3% pass rate across 6 agents',
    metadata: 'Score: 87.3%',
    critical: false,
  },
  {
    id: 'act-7',
    type: 'issue_resolved',
    timestamp: minutesAgo(62),
    title: 'Issue resolved',
    description: 'Hallucination loop in research-agent fixed after 3 retries',
    metadata: 'Duration: 2h 14m',
    critical: false,
  },
  {
    id: 'act-8',
    type: 'alert_fired',
    timestamp: minutesAgo(90),
    title: 'Latency threshold exceeded',
    description: 'Code-reviewer avg latency reached 4.2s (threshold: 3s)',
    metadata: 'Agent: code-reviewer',
    critical: true,
  },
  {
    id: 'act-9',
    type: 'mcp_fix_run',
    timestamp: minutesAgo(105),
    title: 'MCP fix attempted',
    description: 'Prompt optimization applied to code-reviewer for latency',
    metadata: 'Fix: prompt-trim',
    critical: false,
  },
  {
    id: 'act-10',
    type: 'agent_status_change',
    timestamp: minutesAgo(140),
    title: 'Agent back to active',
    description: 'Research-agent recovered and returned to active status',
    metadata: 'Agent: research-agent',
    critical: false,
  },
  {
    id: 'act-11',
    type: 'eval_completed',
    timestamp: minutesAgo(180),
    title: 'Regression test passed',
    description: 'Post-fix regression eval: all 24 test cases passing',
    metadata: 'Tests: 24/24',
    critical: false,
  },
  {
    id: 'act-12',
    type: 'issue_detected',
    timestamp: minutesAgo(210),
    title: 'Context window truncation',
    description: 'Data-pipeline losing context on long conversation threads',
    metadata: 'Severity: P2',
    critical: false,
  },
];

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
          {mockEvents.map((event) => {
            const config = eventConfig[event.type];
            const Icon = config.icon;
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
                  {event.critical && (
                    <div className="absolute top-0 left-0 h-[30px] w-[30px] rounded-full animate-ping bg-red-400/20" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium truncate ${event.critical ? 'text-[#dc2626] dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
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
                    {event.metadata && (
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">
                        ·{'\u00A0'}{event.metadata}
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
