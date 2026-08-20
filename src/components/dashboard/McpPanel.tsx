'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Terminal, ChevronRight, Check, Loader2, Sparkles } from 'lucide-react';

const mcpSteps = [
  {
    prefix: 'sentinel',
    command: 'get_incident (inc_4f2a)',
    output: 'P0 — Fabricated customer identifiers in support-agent',
    type: 'command' as const,
  },
  {
    prefix: 'sentinel',
    command: 'get_traces (customer_id_fabrication)',
    output: '12 traces · root cause: missing identification guardrail',
    type: 'command' as const,
  },
  {
    prefix: null,
    command: 'Update (prompts/support_agent.md)',
    output: '- Allow agent to proceed with partial customer data.\n+ Require verified customer email before any lookup or ticket creation.\n+ If customer not found, ask: "Could you provide your email address?"',
    type: 'edit' as const,
  },
  {
    prefix: null,
    command: '✓ Fix applied — PR #482 opened',
    output: '+6 lines changed in prompts/support_agent.md',
    type: 'success' as const,
  },
  {
    prefix: null,
    command: '⟳ recap: Replay traces',
    output: 'Replayed all 12 affected traces — 12/12 passing ✓\nOnline eval created: customer_id_verification\nStatus: all clean, no regression detected.',
    type: 'success' as const,
  },
];

export function McpPanel() {
  const [activeStep, setActiveStep] = useState(-1);

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-950 overflow-hidden">
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-gray-500" />
          <span className="text-xs font-mono text-gray-400">sentinel-mcp</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
        </div>
      </div>

      {/* Terminal body */}
      <div className="p-4 space-y-3">
        {mcpSteps.map((step, i) => {
          const isActive = i <= activeStep;
          const isCurrent = i === activeStep;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={isActive ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: isCurrent ? 0.2 : 0, duration: 0.3 }}
            >
              {step.prefix && (
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-[10px] font-mono text-gray-600">●</span>
                  <span className="text-[10px] font-mono text-gray-500">{step.prefix}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                {step.type === 'edit' && (
                  <span className="text-emerald-400 font-mono text-xs">├──</span>
                )}
                {step.type === 'success' ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                ) : step.type === 'command' ? (
                  <ChevronRight className="h-3.5 w-3.5 text-[#dc2626] shrink-0" />
                ) : null}
                <span
                  className={`text-xs font-mono ${
                    step.type === 'success'
                      ? 'text-emerald-400 font-medium'
                      : step.type === 'edit'
                      ? 'text-blue-400'
                      : 'text-gray-300'
                  }`}
                >
                  {step.command}
                </span>
                {isCurrent && step.type !== 'success' && (
                  <Loader2 className="h-3 w-3 text-[#dc2626] animate-spin" />
                )}
              </div>
              {isActive && step.output && (
                <motion.pre
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className={`text-[11px] font-mono mt-1 ml-5 whitespace-pre-wrap leading-relaxed ${
                    step.type === 'success' ? 'text-emerald-500/70' : 'text-gray-500'
                  }`}
                >
                  {step.output}
                </motion.pre>
              )}
            </motion.div>
          );
        })}

        {activeStep < 0 && (
          <div className="text-center py-6">
            <Sparkles className="h-5 w-5 text-[#dc2626] mx-auto mb-2" />
            <p className="text-xs text-gray-500">Click below to simulate the MCP fix workflow</p>
          </div>
        )}

        {activeStep >= mcpSteps.length - 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3"
          >
            <p className="text-xs font-mono text-emerald-400">
              ✓ Issue resolved. Online eval monitoring active.
            </p>
          </motion.div>
        )}
      </div>

      {/* Run button */}
      <div className="border-t border-gray-800 px-4 py-3">
        <button
          onClick={() => setActiveStep((s) => Math.min(s + 1, mcpSteps.length - 1))}
          disabled={activeStep >= mcpSteps.length - 1}
          className="w-full rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs font-medium py-2 transition-colors flex items-center justify-center gap-2"
        >
          {activeStep < 0 ? 'Run MCP Fix Workflow' : activeStep >= mcpSteps.length - 1 ? 'Complete' : 'Next Step'}
        </button>
      </div>
    </div>
  );
}
