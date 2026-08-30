'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Wrench, Shield, Search, MessageSquare } from 'lucide-react';

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

interface TraceWaterfallProps {
  spans: Span[];
  totalDuration: number;
}

const typeIcons: Record<string, React.ElementType> = {
  model: Cpu,
  tool: Wrench,
  guard: Shield,
  retrieval: Search,
  output: MessageSquare,
};

const typeBarColors: Record<string, string> = {
  model: 'bg-[#dc2626]',
  tool: 'bg-amber-400',
  guard: 'bg-emerald-400',
  retrieval: 'bg-blue-400',
  output: 'bg-gray-400',
};

const typeIconColors: Record<string, string> = {
  model: 'text-[#dc2626]',
  tool: 'text-amber-500',
  guard: 'text-emerald-500',
  retrieval: 'text-blue-500',
  output: 'text-gray-400',
};

function formatDuration(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${ms.toFixed(0)}ms`;
}

export function TraceWaterfall({ spans, totalDuration }: TraceWaterfallProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (spans.length === 0 || totalDuration <= 0) return null;

  const hoveredSpan = hoveredIndex !== null ? spans[hoveredIndex] : null;

  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
      {/* Header row */}
      <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-medium border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center">
          <div className="shrink-0" style={{ width: '200px' }}>
            Span Name
          </div>
          <div className="flex-1">
            Timeline
          </div>
          <div className="shrink-0 text-right" style={{ width: '80px' }}>
            Duration
          </div>
        </div>
      </div>

      {/* Span rows */}
      <div className="relative">
        {spans.map((span, i) => {
          const Icon = typeIcons[span.type] || Cpu;
          const leftPct = (span.startTime / totalDuration) * 100;
          const widthPct = (span.duration / totalDuration) * 100;
          const isError = span.status === 'error';

          return (
            <div
              key={span.id}
              className="flex items-center border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors px-4 h-9 relative"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Left column: icon + name */}
              <div className="shrink-0 flex items-center gap-2" style={{ width: '200px' }}>
                <Icon className={`h-3.5 w-3.5 shrink-0 ${typeIconColors[span.type]}`} />
                <span className="font-mono text-xs text-gray-700 dark:text-gray-300 truncate">
                  {span.name}
                </span>
              </div>

              {/* Center: waterfall bar area */}
              <div className="flex-1 relative h-5">
                <motion.div
                  className={`absolute top-0 h-5 rounded-md ${typeBarColors[span.type]} opacity-80 ${isError ? 'border-l-2 border-l-red-500 bg-red-100/60 dark:bg-red-950/40' : ''}`}
                  style={{ left: `${leftPct}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(2, widthPct)}%` }}
                  transition={{
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1] as const,
                    delay: i * 0.05,
                  }}
                />
              </div>

              {/* Right column: duration */}
              <div className="shrink-0 text-right" style={{ width: '80px' }}>
                <span className="font-mono text-xs text-gray-400 dark:text-gray-500">
                  {formatDuration(span.duration)}
                </span>
              </div>

              {/* Tooltip */}
              {hoveredIndex === i && (
                <div className="absolute z-50 left-[200px] top-full mt-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-[11px] font-mono rounded-lg px-3 py-2 shadow-lg pointer-events-none whitespace-nowrap">
                  <div className="font-medium text-xs mb-1">{span.name}</div>
                  <div className="space-y-0.5 text-gray-300 dark:text-gray-600">
                    <div>Type: <span className="text-gray-100 dark:text-gray-800">{span.type}</span></div>
                    <div>Status: <span className={span.status === 'error' ? 'text-red-400 dark:text-red-600' : span.status === 'warning' ? 'text-amber-400 dark:text-amber-600' : 'text-emerald-400 dark:text-emerald-600'}>{span.status}</span></div>
                    <div>Duration: <span className="text-gray-100 dark:text-gray-800">{formatDuration(span.duration)}</span></div>
                    <div>Tokens: <span className="text-gray-100 dark:text-gray-800">{span.inputTokens.toLocaleString()} in / {span.outputTokens.toLocaleString()} out</span></div>
                    {span.model && <div>Model: <span className="text-gray-100 dark:text-gray-800">{span.model}</span></div>}
                    {span.tool && <div>Tool: <span className="text-gray-100 dark:text-gray-800">{span.tool}</span></div>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Time axis */}
      <div className="flex justify-between px-4 py-2 text-[10px] font-mono text-gray-400 dark:text-gray-600 border-t border-gray-100 dark:border-gray-800">
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
          <span key={pct}>{formatDuration(totalDuration * pct)}</span>
        ))}
      </div>
    </div>
  );
}
