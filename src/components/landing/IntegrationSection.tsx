'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

const frameworks = [
  { name: 'LangChain', logo: 'LC', color: 'bg-[#dc2626] text-white' },
  { name: 'CrewAI', logo: 'CA', color: 'bg-gray-800 text-white' },
  { name: 'AutoGen', logo: 'AG', color: 'bg-gray-600 text-white' },
  { name: 'LlamaIndex', logo: 'LI', color: 'bg-gray-400 text-white' },
  { name: 'LangGraph', logo: 'LG', color: 'bg-gray-700 text-white' },
  { name: 'Custom SDK', logo: 'SDK', color: 'border-2 border-gray-300 text-gray-600' },
];

const securityBadges = [
  { label: 'SOC 2 Type II', desc: 'Independently audited' },
  { label: 'AES-256', desc: 'Encryption at rest' },
  { label: 'TLS 1.2+', desc: 'Encryption in transit' },
  { label: 'Data Isolation', desc: 'Per-org isolation' },
];

export function IntegrationSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const [copied, setCopied] = useState(false);

  const installCode = `pip install sentinel-ai

# In your agent file
from sentinel import trace_agent

agent = trace_agent(your_agent,
  project_id="your_project_id"
)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(installCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="integrations" className="relative py-24 sm:py-32">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Fits into your{' '}
            <span className="text-gradient">existing stack</span>
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Native support for the frameworks your team already uses. One line to instrument.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Frameworks + Install */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Framework grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {frameworks.map((fw, i) => (
                <motion.div
                  key={fw.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="group flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3.5 hover:border-red-200 hover:shadow-sm transition-all"
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold ${fw.color} transition-transform group-hover:scale-110`}>
                    {fw.logo}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{fw.name}</span>
                </motion.div>
              ))}
            </div>

            {/* Install code */}
            <div className="rounded-xl border border-gray-200 bg-gray-950 p-5 relative">
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-500" />
                )}
              </button>
              <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
                {installCode}
              </pre>
            </div>
          </motion.div>

          {/* Right: Security */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Trust is non-negotiable
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Your data stays yours. Protected by best-in-class infrastructure and verified compliance.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {securityBadges.map((badge, i) => (
                  <motion.div
                    key={badge.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="rounded-xl bg-gray-50 p-4"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-2 w-2 rounded-full bg-[#dc2626]" />
                      <span className="text-sm font-semibold text-gray-900">{badge.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">{badge.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}