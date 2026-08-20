'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { GitBranch } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ReleaseEntry {
  version: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
  latest?: boolean;
}

const releases: ReleaseEntry[] = [
  {
    version: 'v2.0',
    title: 'Self-Healing API Control System',
    description:
      'Circuit breakers, automatic fallback activation, request queuing, and real-time health monitoring for all your agent dependencies. Monitor 8+ endpoint categories including LLMs, databases, payments, and MCP servers.',
    tags: ['Circuit Breakers', 'Auto-Fallback', 'Health Monitoring', 'Request Queuing'],
    date: '2 days ago',
    latest: true,
  },
  {
    version: 'v1.4',
    title: 'Documentation Hub & SaaS Settings',
    description:
      'Interactive getting started guide, API integration examples with copy-to-clipboard, comprehensive API reference table, and a full settings panel with workspace config, notification preferences, and data retention controls.',
    tags: ['Docs', 'Settings', 'API Reference'],
    date: '1 week ago',
  },
  {
    version: 'v1.3',
    title: 'Transparent Pricing',
    description:
      'Three-tier pricing with Starter (free), Pro ($49/mo), and Enterprise (custom). All plans include SSL encryption and 99.9% uptime SLA.',
    tags: ['Pricing', 'SaaS'],
    date: '1 week ago',
  },
  {
    version: 'v1.2',
    title: 'Agent Comparison & Trace Waterfall',
    description:
      'Side-by-side agent comparison with 6 metrics and animated performance bars. Gantt-chart waterfall visualization for trace spans with color-coded types and hover tooltips.',
    tags: ['Comparison', 'Waterfall', 'Performance'],
    date: '2 weeks ago',
  },
  {
    version: 'v1.1',
    title: 'Advanced Tracing & Alerting',
    description:
      'Canvas sparkline metrics, CSV export with custom column mapping, onboarding tour with sessionStorage persistence, and filter/search state persistence across sessions.',
    tags: ['Sparklines', 'Export', 'Tour', 'Filters'],
    date: '3 weeks ago',
  },
  {
    version: 'v1.0',
    title: 'Sentinel Launch',
    description:
      'Real-time AI agent observability with 5 dashboard tabs, 6 monitored agents, trace explorer with span details, issue detection, MCP fix workflow integration, and particle network hero animation.',
    tags: ['Launch', 'Dashboard', 'Traces', 'MCP'],
    date: '1 month ago',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export function ChangelogSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="changelog" className="relative py-24 sm:py-32 bg-gray-50/50 dark:bg-gray-900/30">
      <div ref={ref} className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 mb-4">
            <GitBranch className="h-3.5 w-3.5" />
            Changelog
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            What&#39;s{'\u00A0'}
            <span className="text-gradient">new</span>
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Latest updates, improvements, and fixes across all Sentinel features.
          </p>
        </motion.div>

        {/* Timeline */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-4xl mx-auto"
        >
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[18px] top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-800 hidden lg:block" />

            <div className="space-y-6">
              {releases.map((release) => (
                <motion.div
                  key={release.version}
                  variants={itemVariants}
                  className="relative lg:grid lg:grid-cols-[1fr_2fr] lg:gap-8"
                >
                  {/* Left: Version badge on timeline */}
                  <div className="hidden lg:flex items-start pt-6">
                    <div className="relative flex items-center gap-3">
                      {/* Timeline dot */}
                      <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            release.latest
                              ? 'bg-[#dc2626]'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        />
                      </div>
                      {/* Version label */}
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          release.latest
                            ? 'bg-[#dc2626] text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {release.version}
                      </span>
                    </div>
                  </div>

                  {/* Right: Release card */}
                  <div className="glass-card card-lift rounded-2xl p-5 sm:p-6">
                    <div className="flex items-center gap-3 mb-3">
                      {/* Mobile version badge */}
                      <span
                        className={`lg:hidden rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          release.latest
                            ? 'bg-[#dc2626] text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {release.version}
                      </span>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {release.title}
                      </h3>
                      {release.latest && (
                        <span className="rounded-full bg-[#dc2626]/10 dark:bg-[#dc2626]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#dc2626]">
                          NEW
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                      {release.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      {release.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-[11px] px-2 py-0 h-6 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                        >
                          {tag}
                        </Badge>
                      ))}
                      <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                        {release.date}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
