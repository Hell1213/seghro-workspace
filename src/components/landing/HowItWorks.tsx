'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Scan, AlertTriangle, Code, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Scan,
    title: 'Instrument',
    description:
      'Add one line to wrap your agent. Sentinel automatically captures every span, token, tool call, and model invocation — zero configuration needed.',
    code: `from sentinel import trace_agent\n\nagent = trace_agent(my_agent, \n  project_id="sentinel_3a18f6d4")`,
    accent: 'text-[#dc2626]',
  },
  {
    number: '02',
    icon: AlertTriangle,
    title: 'Detect',
    description:
      'Sentinel audits every trace against your agent\'s system prompt and groups recurring failures into issues — even silent ones that return success codes.',
    code: `# 33 of 50 runs affected\nISSUE: Fabricated customer IDs\nSEVERITY: P0 Critical\nROOT CAUSE: Missing guardrail`,
    accent: 'text-gray-600 dark:text-gray-300',
  },
  {
    number: '03',
    icon: Code,
    title: 'Fix',
    description:
      'Pull context into your coding agent via MCP. Sentinel provides the exact trace, root cause, and suggested fix — resolve without context-switching.',
    code: `# lemma · get_incident (inc_4f2a)\n└ P0 — fabricated customer IDs\n\n# Update prompts/support.md\n+ Require email before any lookup`,
    accent: 'text-[#dc2626]',
  },
  {
    number: '04',
    icon: CheckCircle2,
    title: 'Validate',
    description:
      'After deploying the fix, Sentinel creates an online eval scoring every new trace against the failure mode. Regressions trigger immediate alerts.',
    code: `EVAL: refund_policy_violations\nSTATUS: all passing ✓\nNEW TRACES: 24 scored clean\nREGRESSION: none detected`,
    accent: 'text-gray-600 dark:text-gray-300',
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id="how-it-works" className="relative py-20 sm:py-28 bg-gray-50/80 dark:bg-gray-900/60">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            From failure to fix in{' '}
            <span className="text-gradient">four steps</span>
          </h2>
          <p className="mt-3 text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            A closed-loop workflow that catches what your error monitoring can&apos;t.
          </p>
        </motion.div>

        {/* Steps container — single column on mobile, 2-col zigzag on lg+ */}
        <div className="relative">
          {/* Vertical connector line — only on lg+ */}
          <div className="absolute left-[19px] lg:left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-[#dc2626] via-gray-200 dark:via-gray-800 to-gray-200 dark:to-gray-800 hidden sm:block" />

          <div className="space-y-10 lg:space-y-14">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative grid lg:grid-cols-2 gap-6 lg:gap-8 items-start"
              >
                {/* Step number on the line — always visible on sm+ */}
                <div className="absolute left-0 top-0 z-10 flex">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-gray-900 border-2 border-[#dc2626] text-xs font-bold text-[#dc2626]">
                    {step.number}
                  </div>
                </div>

                {/* Content column — always left on mobile, zigzag on lg+ */}
                <div
                  className={`pl-14 sm:pl-14 lg:pl-16 ${
                    i % 2 === 1 ? 'lg:col-start-2 lg:pl-16' : 'lg:pr-16'
                  }`}
                >
                  <div className={`inline-flex items-center gap-2 mb-2 ${step.accent}`}>
                    <step.icon className="h-4 w-4" />
                    <span className="text-xs font-semibold tracking-wider uppercase">
                      Step {step.number}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Code block column — always left on mobile, zigzag on lg+ */}
                <div
                  className={`pl-14 sm:pl-14 lg:pl-16 ${
                    i % 2 === 1 ? 'lg:col-start-1 lg:pr-16' : 'lg:pl-16'
                  }`}
                >
                  <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-950 p-4 sm:p-5 overflow-hidden card-lift">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                      <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                    </div>
                    <pre className="text-[11px] sm:text-sm font-mono text-gray-300 whitespace-pre-wrap leading-relaxed relative">
                      {step.code}
                      <span className="inline-block w-2 h-4 bg-[#dc2626]/70 animate-blink ml-0.5 -mb-0.5" />
                    </pre>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
