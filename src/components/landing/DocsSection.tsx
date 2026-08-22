'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useCallback } from 'react';
import {
  Rocket,
  Plug,
  Shield,
  ChevronDown,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Animation Variants                                                 */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
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

/* ------------------------------------------------------------------ */
/*  Reusable: Copy Button                                               */
/* ------------------------------------------------------------------ */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 flex items-center gap-1.5 rounded-md bg-gray-700/60 px-2 py-1 text-xs text-gray-300 hover:bg-gray-600/60 transition-colors focus-ring"
      aria-label="Copy code"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-400" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Card 1: Getting Started Steps                                      */
/* ------------------------------------------------------------------ */

const gettingStartedSteps = [
  {
    step: 1,
    title: 'Create your Aegis workspace',
    description:
      'Sign up and create a workspace to organize your agents, traces, and alerts.',
  },
  {
    step: 2,
    title: 'Install the SDK',
    description: 'Add the Aegis SDK to your project.',
    code: 'npm install @aegis/sdk',
  },
  {
    step: 3,
    title: 'Add the middleware to your agent',
    description:
      'Wrap your agent calls with the Aegis tracer to capture every span and token.',
    code: `import { traceAgent } from '@aegis/sdk';

const agent = traceAgent(myAgent, {
  projectId: 'aegis_3a18f6d4',
  enableSelfHealing: true,
});`,
  },
  {
    step: 4,
    title: 'View traces in real-time',
    description:
      'Open the Aegis dashboard to see traces, metrics, and auto-detected issues as they happen.',
  },
];

function GettingStartedCard() {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className="glass-card card-lift rounded-2xl p-6 flex flex-col"
      variants={itemVariants}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50">
          <Rocket className="h-5 w-5 text-[#dc2626] dark:text-red-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Getting Started
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            From zero to observability in 4 steps
          </p>
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left rounded-lg bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-ring"
        aria-expanded={expanded}
      >
        <span>{expanded ? 'Hide steps' : 'Show setup steps'}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-gray-400 transition-transform duration-300',
            expanded && 'rotate-180'
          )}
        />
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 space-y-5 overflow-hidden"
        >
          {gettingStartedSteps.map((item) => (
            <div key={item.step} className="flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#dc2626] text-xs font-bold text-white mt-0.5">
                {item.step}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {item.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                  {item.description}
                </p>
                {item.code && (
                  <div className="relative mt-2.5 rounded-xl bg-gray-900 text-gray-100 p-3.5 font-mono text-[13px] overflow-x-auto scrollbar-thin">
                    <CopyButton text={item.code} />
                    <pre className="whitespace-pre-wrap leading-relaxed pt-4">
                      {item.code}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Card 2: API Integration                                            */
/* ------------------------------------------------------------------ */

const codeExamples = [
  {
    title: 'Initialize the SDK',
    code: `import { AegisClient } from '@aegis/sdk';

const client = new AegisClient({
  apiKey: process.env.SENTINEL_API_KEY,
  baseUrl: 'https://api.aegis.ai',
});`,
  },
  {
    title: 'Wrap Agent Calls',
    code: `const result = await client.trace({
  name: 'customer_support_agent',
  metadata: { version: '2.1.0' },
  fn: async () => {
    return await myAgent.run(query);
  },
});`,
  },
  {
    title: 'Custom Trace Attributes',
    code: `client.setAttributes({
  environment: 'production',
  team: 'platform',
  agentFramework: 'langchain',
});

// Add spans for tool calls
client.startSpan('retrieval', {
  attributes: { vectorDb: 'pinecone' },
});`,
  },
];

function ApiIntegrationCard() {
  return (
    <motion.div
      className="glass-card card-lift rounded-2xl p-6 flex flex-col"
      variants={itemVariants}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <Plug className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            API Integration
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Drop-in SDK for any framework
          </p>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {codeExamples.map((example) => (
          <div key={example.title}>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              {example.title}
            </p>
            <div className="relative rounded-xl bg-gray-900 text-gray-100 p-3.5 font-mono text-[13px] overflow-x-auto scrollbar-thin">
              <CopyButton text={example.code} />
              <pre className="whitespace-pre-wrap leading-relaxed pt-4">
                {example.code}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Card 3: Self-Healing APIs                                          */
/* ------------------------------------------------------------------ */

const healingCapabilities = [
  {
    title: 'Automatic circuit breaking',
    description: 'Trips open when error rates exceed your threshold.',
  },
  {
    title: 'Exponential backoff retry',
    description: 'Progressive retry delays to avoid overwhelming failing services.',
  },
  {
    title: 'Fallback endpoint activation',
    description: 'Automatically routes traffic to backup endpoints.',
  },
  {
    title: 'Request queuing during outages',
    description: 'Buffers requests while circuits are open, replays on recovery.',
  },
  {
    title: 'Real-time health monitoring',
    description: 'Continuous pings and latency tracking for every endpoint.',
  },
];

function CircuitBreakerViz() {
  return (
    <div className="mb-5 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
        Circuit Breaker States
      </p>
      <div className="flex items-center justify-center gap-3">
        <div className="flex flex-col items-center gap-1.5">
          <div className="h-10 w-10 rounded-full bg-emerald-500/15 border-2 border-emerald-500 flex items-center justify-center">
            <div className="h-3.5 w-3.5 rounded-full bg-emerald-500" />
          </div>
          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Closed</span>
        </div>
        <div className="flex items-center">
          <div className="h-0.5 w-6 bg-gray-300 dark:bg-gray-600" />
          <div className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
          <div className="h-0.5 w-6 bg-gray-300 dark:bg-gray-600" />
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="h-10 w-10 rounded-full bg-amber-500/15 border-2 border-amber-500 flex items-center justify-center">
            <div className="h-3.5 w-3.5 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">Half-Open</span>
        </div>
        <div className="flex items-center">
          <div className="h-0.5 w-6 bg-gray-300 dark:bg-gray-600" />
          <div className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
          <div className="h-0.5 w-6 bg-gray-300 dark:bg-gray-600" />
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="h-10 w-10 rounded-full bg-red-500/15 border-2 border-red-500 flex items-center justify-center">
            <div className="h-3.5 w-3.5 rounded-full bg-red-500 animate-pulse" />
          </div>
          <span className="text-[10px] font-medium text-red-600 dark:text-red-400">Open</span>
        </div>
      </div>
    </div>
  );
}

function SelfHealingCard() {
  return (
    <motion.div
      className="glass-card card-lift rounded-2xl p-6 flex flex-col"
      variants={itemVariants}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50">
          <Shield className="h-5 w-5 text-[#dc2626] dark:text-red-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Self-Healing APIs
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Automated resilience for your agent&apos;s dependencies
          </p>
        </div>
      </div>

      <CircuitBreakerViz />

      <ul className="space-y-3 flex-1">
        {healingCapabilities.map((cap) => (
          <li key={cap.title} className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30">
              <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {cap.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {cap.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  API Reference Table                                                */
/* ------------------------------------------------------------------ */

const apiEndpoints = [
  { method: 'GET' as const, path: '/api/agents', description: 'List monitored agents' },
  { method: 'GET' as const, path: '/api/traces', description: 'Fetch trace data' },
  { method: 'GET' as const, path: '/api/endpoints', description: 'API health endpoints' },
  { method: 'POST' as const, path: '/api/endpoints', description: 'Manage endpoints' },
  { method: 'GET' as const, path: '/api/healing', description: 'Healing action history' },
  { method: 'GET' as const, path: '/api/api-health', description: 'Health summary' },
  { method: 'GET' as const, path: '/api/metrics', description: 'Time-series metrics' },
  { method: 'GET' as const, path: '/api/issues', description: 'Detected issues' },
  { method: 'GET' as const, path: '/api/alerts', description: 'Alert feed' },
];

function getMethodColor(method: string) {
  if (method === 'GET') {
    return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
  }
  return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
}

function ApiReferenceTable({ isInView }: { isInView: boolean }) {
  return (
    <motion.div
      className="glass-card rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          API Reference
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          RESTful endpoints for programmatic access to all Aegis features
        </p>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
              <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Method
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Endpoint
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {apiEndpoints.map((row, i) => (
              <tr
                key={row.path + row.method}
                className={cn(
                  'border-b border-gray-50 dark:border-gray-800/50 transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/30',
                  i % 2 === 1 && 'bg-gray-50/30 dark:bg-gray-800/15'
                )}
              >
                <td className="px-6 py-3">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold',
                      getMethodColor(row.method)
                    )}
                  >
                    {row.method}
                  </span>
                </td>
                <td className="px-6 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">
                  {row.path}
                </td>
                <td className="px-6 py-3 text-gray-600 dark:text-gray-400">
                  {row.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Section                                                       */
/* ------------------------------------------------------------------ */

export function DocsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="docs" className="relative py-24 sm:py-32 bg-background dark:bg-gray-900/50">
      <div className="absolute inset-0 bg-dot-pattern opacity-40" />
      <div className="absolute bottom-0 left-1/3 w-1/2 h-1/2 bg-red-500/[0.02] blur-[100px] rounded-full" />

      <div ref={ref} className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-700 bg-background dark:bg-gray-800 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 mb-4">
            Documentation
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Everything you need to{'\u00A0'}
            <span className="text-gradient">get started</span>
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-300 max-w-2xl mx-auto">
            Comprehensive guides, API references, and code examples to integrate
            Aegis into your AI agent stack in minutes.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12"
        >
          <GettingStartedCard />
          <ApiIntegrationCard />
          <SelfHealingCard />
        </motion.div>

        <ApiReferenceTable isInView={isInView} />
      </div>
    </section>
  );
}
