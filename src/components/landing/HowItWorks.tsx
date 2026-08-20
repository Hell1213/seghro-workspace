'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Scan, AlertTriangle, Code, CheckCircle2, ArrowRight } from 'lucide-react';

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
    accent: 'text-gray-600',
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
    accent: 'text-gray-600',
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id="how-it-works" className="relative py-24 sm:py-32 bg-gray-50/50">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            From failure to fix in{'00A0'}
            <span className="text-gradient">four steps</span>
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            A closed-loop workflow that catches what your error monitoring can&apos;t.
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-[#dc2626] via-gray-200 to-gray-200 hidden lg:block" />

          <div className="space-y-12 lg:space-y-16">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{
                  duration: 0.7,
                  delay: i * 0.15,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative grid lg:grid-cols-2 gap-8 items-center"
              >
                {/* Step number on the line */}
                <div className="absolute left-5 lg:left-5 top-2 z-10 hidden lg:flex">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white border-2 border-[#dc2626] text-xs font-bold text-[#dc2626]">
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <div
                  className={`${
                    i % 2 === 1 ? 'lg:col-start-2 lg:pl-16' : 'lg:pr-16'
                  } pl-16 lg:pl-0`}
                >
                  <div className={`inline-flex items-center gap-2 mb-3 ${step.accent}`}>
                    <step.icon className="h-5 w-5" />
                    <span className="text-sm font-semibold tracking-wider uppercase">
                      Step {step.number}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Code block */}
                <div
                  className={`${
                    i % 2 === 1 ? 'lg:col-start-1 lg:pr-16' : 'lg:pl-16'
                  } pl-16 lg:pl-0`}
                >
                  <div className="rounded-xl border border-gray-200 bg-gray-950 p-5 overflow-hidden">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                      <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                    </div>
                    <pre className="text-[12px] sm:text-sm font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {step.code}
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
