'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Copy, Check } from 'lucide-react';

const frameworks = [
  { name: 'LangChain', logo: 'LC', color: 'bg-[#dc2626] text-white' },
  { name: 'CrewAI', logo: 'CA', color: 'bg-gray-800 text-white' },
  { name: 'AutoGen', logo: 'AG', color: 'bg-gray-600 text-white' },
  { name: 'LlamaIndex', logo: 'LI', color: 'bg-gray-400 text-white' },
  { name: 'LangGraph', logo: 'LG', color: 'bg-gray-700 text-white' },
  { name: 'Vercel AI', logo: 'VA', color: 'bg-gray-900 text-white' },
];

const securityBadges = [
  { label: 'SOC 2 Type II', desc: 'Independently audited' },
  { label: 'AES-256', desc: 'Encryption at rest' },
  { label: 'TLS 1.2+', desc: 'Encryption in transit' },
  { label: 'Data Isolation', desc: 'Per-org isolation' },
];

const jsCode = `npm install @seghro/sdk

# In your agent file
import { SeghroClient } from '@seghro/sdk';

const seghro = new SeghroClient({
  apiKey: 'seghro_sk_...',
  agentName: 'my-agent',
});

await seghro.ingestTrace({
  status: 'success',
  duration: 1200,
  inputTokens: 150,
  outputTokens: 300,
});`;

const pythonCode = `pip install seghro

# In your agent file
from seghro import SeghroClient

seghro = SeghroClient(
    api_key="seghro_sk_...",
    agent_name="my-agent",
)

seghro.ingest_trace(
    status="success",
    duration=1200,
    input_tokens=150,
    output_tokens=300,
)`;

const langchainCode = `# LangChain integration
from seghro.langchain_callback import SeghroCallbackHandler

seghro_handler = SeghroCallbackHandler(
    api_key="seghro_sk_...",
    agent_name="my-agent",
)

chain = LLMChain(
    llm=llm,
    prompt=prompt,
    callbacks=[seghro_handler],
)`;

export function IntegrationSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'js' | 'python' | 'langchain'>('js');

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const activeCode = activeTab === 'js' ? jsCode : activeTab === 'python' ? pythonCode : langchainCode;

  return (
    <section id="integrations" className="relative py-24 sm:py-32 bg-background dark:bg-gray-900/50">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Fits into your{' '}
            <span className="text-gradient">existing stack</span>
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-300 max-w-2xl mx-auto">
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
                  className="group flex items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-background dark:bg-gray-900 p-3.5 hover:border-red-200 dark:hover:border-red-900/50 hover:shadow-sm transition-all"
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold ${fw.color} transition-transform group-hover:scale-110`}>
                    {fw.logo}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{fw.name}</span>
                </motion.div>
              ))}
            </div>

            {/* Code tabs */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-950 overflow-hidden">
              <div className="flex border-b border-gray-800">
                {(['js', 'python', 'langchain'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2.5 text-xs font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {tab === 'js' ? 'JavaScript' : tab === 'python' ? 'Python' : 'LangChain'}
                  </button>
                ))}
                <button
                  onClick={() => handleCopy(activeCode, activeTab)}
                  className="ml-auto px-3 py-2.5 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {copied === activeTab ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              <pre className="p-4 text-sm font-mono text-gray-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {activeCode}
              </pre>
            </div>
          </motion.div>

          {/* Right: Security */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-background dark:bg-gray-900 p-6 sm:p-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                Trust is non-negotiable
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Your data stays yours. Protected by best-in-class infrastructure and verified compliance.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {securityBadges.map((badge, i) => (
                  <motion.div
                    key={badge.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-2 w-2 rounded-full bg-[#dc2626]" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{badge.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{badge.desc}</p>
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
