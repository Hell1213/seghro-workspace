'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronRight, ChevronDown, Clock, Cpu, Wrench, Shield, Search, MessageSquare, Zap } from 'lucide-react';

interface Span {
  id: string;
  name: string;
  type: 'model' | 'tool' | 'guard' | 'retrieval' | 'output';
  status: 'success' | 'error' | 'warning';
  duration: number;
  startTime: number;
  model?: string;
  tool?: string;
  inputTokens: number;
  outputTokens: number;
}

interface Trace {
  id: string;
  agentId: string;
  traceId: string;
  status: 'success' | 'error' | 'warning';
  duration: number;
  inputTokens: number;
  outputTokens: number;
  createdAt: string;
  spans: Span[];
}

const typeIcons: Record<string, React.ElementType> = {
  model: Cpu,
  tool: Wrench,
  guard: Shield,
  retrieval: Search,
  output: MessageSquare,
};

const typeColors: Record<string, string> = {
  model: 'text-[#dc2626]',
  tool: 'text-amber-600',
  guard: 'text-emerald-600',
  retrieval: 'text-blue-600',
  output: 'text-gray-500',
};

const statusDot: Record<string, string> = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  warning: 'bg-amber-500',
};

const spanBarColors: Record<string, string> = {
  model: 'bg-[#dc2626]',
  tool: 'bg-amber-400',
  guard: 'bg-emerald-400',
  retrieval: 'bg-blue-400',
  output: 'bg-gray-400',
};

function SpanRow({ span, maxDuration, depth = 0 }: { span: Span; maxDuration: number; depth?: number }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = typeIcons[span.type] || Zap;
  const widthPct = Math.max(4, (span.duration / maxDuration) * 100);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full text-left group hover:bg-gray-50/80 transition-colors rounded-lg px-3 py-2 ${depth > 0 ? 'ml-8' : ''}`}
      >
        <div className="flex items-center gap-2.5">
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-gray-300" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          )}
          <div className={`h-2 w-2 rounded-full ${statusDot[span.status]} ${span.status === 'error' ? 'animate-pulse' : ''}`} />
          <Icon className={`h-3.5 w-3.5 ${typeColors[span.type]}`} />
          <span className="text-xs font-mono text-gray-700 flex-1 truncate">
            {span.name}
          </span>
          {span.model && (
            <span className="text-[10px] font-mono text-gray-400 hidden sm:inline">{span.model}</span>
          )}
          {span.tool && (
            <span className="text-[10px] font-mono text-gray-400 hidden sm:inline">{span.tool}</span>
          )}
          <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {(span.duration / 1000).toFixed(1)}s
          </span>
        </div>
        {/* Span bar */}
        <div className="mt-1.5 ml-[52px] h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${spanBarColors[span.type]} opacity-80`}
            initial={{ width: 0 }}
            animate={{ width: `${widthPct}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-14 mr-3 mb-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-gray-400">Input Tokens:</span>{'00A0'}
                  <span className="text-gray-700 font-medium">{span.inputTokens.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-400">Output Tokens:</span>{'00A0'}
                  <span className="text-gray-700 font-medium">{span.outputTokens.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-400">Duration:</span>{'00A0'}
                  <span className="text-gray-700 font-medium">{span.duration}ms</span>
                </div>
                <div>
                  <span className="text-gray-400">Status:</span>{'00A0'}
                  <span className={`font-medium ${span.status === 'error' ? 'text-[#dc2626]' : span.status === 'warning' ? 'text-amber-600' : 'text-emerald-600'}`}>{span.status}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function TraceViewer({ traces }: { traces: Trace[] }) {
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);

  const trace = selectedTrace || traces[0];
  if (!trace) return null;

  const maxDuration = Math.max(...trace.spans.map((s) => s.duration));
  const totalDuration = ((trace.duration) / 1000).toFixed(1);

  const traceStatusColor = trace.status === 'error' ? 'border-red-200 bg-red-50/30' : trace.status === 'warning' ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200 bg-white';

  return (
    <div className="space-y-4">
      {/* Trace selector tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {traces.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTrace(t)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-mono transition-all ${
              trace.id === t.id
                ? 'bg-[#dc2626] text-white shadow-sm'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${statusDot[t.status]}`} />
              {t.traceId.slice(0, 12)}…
            </span>
          </button>
        ))}
      </div>

      {/* Trace detail */}
      <motion.div
        key={trace.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`rounded-xl border ${traceStatusColor} overflow-hidden`}
      >
        {/* Trace header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className={`h-2.5 w-2.5 rounded-full ${statusDot[trace.status]} ${trace.status === 'error' ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-mono font-medium text-gray-800">ai.agent.run</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-gray-400 font-mono">
            <span>{totalDuration}s</span>
            <span>{trace.spans.length} spans</span>
            <span>{trace.inputTokens + trace.outputTokens} tokens</span>
          </div>
        </div>

        {/* Spans */}
        <div className="p-2">
          {trace.spans.map((span) => (
            <SpanRow key={span.id} span={span} maxDuration={maxDuration} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
