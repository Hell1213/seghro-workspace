'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Search,
  Bell,
  Wrench,
  BarChart3,
  Eye,
  GitBranch,
  Heart,
  RefreshCcw,
} from 'lucide-react';

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
  iconColor: string;
  live?: boolean;
  status?: 'healthy' | 'degraded' | 'down' | 'info';
}

const features: Feature[] = [
  {
    icon: Search,
    title: 'Surface Silent Failures',
    description:
      "Audit every trace against your agent's instructions. Group recurring failures into actionable issues — even ones that return success codes.",
    color: 'bg-red-50 dark:bg-red-950/40 text-[#dc2626] dark:text-red-400 border-red-100 dark:border-red-900/50',
    iconColor: 'text-[#dc2626] dark:text-red-400',
    status: 'healthy',
  },
  {
    icon: Bell,
    title: 'Live Alerts',
    description:
      'Get notified on what matters. Sentinel triages issues by severity and alerts you in Slack, PagerDuty, or webhooks — no noise.',
    color: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700',
    iconColor: 'text-gray-600 dark:text-gray-400',
    live: true,
    status: 'healthy',
  },
  {
    icon: Wrench,
    title: 'MCP Fix Integration',
    description:
      'Pull context directly into your coding agent via MCP. Resolve issues without context-switching between tools.',
    color: 'bg-red-50 dark:bg-red-950/40 text-[#dc2626] dark:text-red-400 border-red-100 dark:border-red-900/50',
    iconColor: 'text-[#dc2626] dark:text-red-400',
    status: 'healthy',
  },
  {
    icon: BarChart3,
    title: 'Online Evals',
    description:
      "After deploying a fix, Sentinel creates an online eval. If a regression occurs, you'll know immediately.",
    color: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700',
    iconColor: 'text-gray-600 dark:text-gray-400',
    status: 'info',
  },
  {
    icon: Heart,
    title: 'Self-Healing APIs',
    description:
      'Circuit breakers, auto-fallback, request queuing, and adaptive timeouts. If Stripe, OpenAI, or any API degrades — Sentinel heals it automatically.',
    color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    status: 'degraded',
    live: true,
  },
  {
    icon: Eye,
    title: 'Full Trace Visibility',
    description:
      'See every span, token, tool call, and model invocation. Understand exactly what your agent did and why.',
    color: 'bg-red-50 dark:bg-red-950/40 text-[#dc2626] dark:text-red-400 border-red-100 dark:border-red-900/50',
    iconColor: 'text-[#dc2626] dark:text-red-400',
    status: 'healthy',
  },
  {
    icon: RefreshCcw,
    title: 'LLM-Agnostic Agent Healing',
    description:
      'Works with any LLM — just provide your API key. Auto-switches between OpenAI, Anthropic, Gemini, and more during outages. No vendor lock-in.',
    color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
    status: 'healthy',
  },
  {
    icon: GitBranch,
    title: 'Framework Agnostic',
    description:
      'Native support for LangChain, CrewAI, AutoGen, LlamaIndex, and custom frameworks. Drop-in integration.',
    color: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700',
    iconColor: 'text-gray-600 dark:text-gray-400',
    status: 'info',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

const STATUS_DOT: Record<string, string> = {
  healthy: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  down: 'bg-red-500',
  info: 'bg-gray-400',
};

const STATUS_LABEL: Record<string, string> = {
  healthy: 'Operational',
  degraded: 'Partial',
  down: 'Outage',
  info: 'Standby',
};

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id="features" className="relative py-20 sm:py-28 dark:bg-gray-900/50">
      <div className="absolute inset-0 bg-dot-pattern opacity-40" />
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-red-500/[0.02] blur-[100px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gray-500/[0.03] blur-[80px] rounded-full" />

      <div ref={ref} className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Everything you need to{'\u00A0'}
            <span className="text-gradient">ship reliable agents</span>
          </h2>
          <p className="mt-3 text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            From detection to resolution — a complete observability stack built
            for the unique challenges of production AI systems.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 card-lift overflow-hidden cursor-default"
            >
              {/* Status dot + label at top right */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${STATUS_DOT[feature.status || 'info']}`}
                />
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                  {STATUS_LABEL[feature.status || 'info']}
                </span>
              </div>

              {/* Icon */}
              <div
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${feature.color} mb-3`}
              >
                <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
              </div>

              {/* Title + live indicator */}
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1.5 flex items-center gap-2">
                {feature.title}
                {feature.live && (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                )}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>

              {/* Subtle bottom accent on hover */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#dc2626] to-transparent scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
