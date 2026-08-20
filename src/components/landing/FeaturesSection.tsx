'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Search, Bell, Wrench, BarChart3, Eye, GitBranch } from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'Surface Silent Failures',
    description:
      'Audit every trace against your agent\'s instructions. Group recurring failures into actionable issues — even ones that return success codes.',
    color: 'bg-red-50 text-[#dc2626] border-red-100',
    iconColor: 'text-[#dc2626]',
  },
  {
    icon: Bell,
    title: 'Live Alerts',
    description:
      'Get notified on what matters. Sentinel triages issues by severity and alerts you in Slack, PagerDuty, or webhooks — no noise.',
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    iconColor: 'text-gray-600',
  },
  {
    icon: Wrench,
    title: 'MCP Fix Integration',
    description:
      'Pull context directly into your coding agent via MCP. Resolve issues without context-switching between tools.',
    color: 'bg-red-50 text-[#dc2626] border-red-100',
    iconColor: 'text-[#dc2626]',
  },
  {
    icon: BarChart3,
    title: 'Online Evals',
    description:
      'After deploying a fix, Sentinel creates an online eval. If a regression occurs, you\'ll know immediately.',
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    iconColor: 'text-gray-600',
  },
  {
    icon: Eye,
    title: 'Full Trace Visibility',
    description:
      'See every span, token, tool call, and model invocation. Understand exactly what your agent did and why.',
    color: 'bg-red-50 text-[#dc2626] border-red-100',
    iconColor: 'text-[#dc2626]',
  },
  {
    icon: GitBranch,
    title: 'Framework Agnostic',
    description:
      'Native support for LangChain, CrewAI, AutoGen, LlamaIndex, and custom frameworks. Drop-in integration.',
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    iconColor: 'text-gray-600',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 bg-dot-pattern opacity-40" />
      <div ref={ref} className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Everything you need to{' '}
            <span className="text-gradient">ship reliable agents</span>
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            From detection to resolution — a complete observability stack built
            for the unique challenges of production AI systems.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-lg hover:shadow-red-100/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${feature.color} mb-4 transition-transform group-hover:scale-110`}> 
                <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {feature.description}
              </p>
              {/* Hover accent line */}
              <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-[#dc2626] to-transparent rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
