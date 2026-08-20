'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  ShieldCheck,
  ToggleLeft,
  Clock,
  Zap,
  ArrowUpRight,
  Activity,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ApiEndpoint } from '@/lib/self-healing-data';

const statusConfig: Record<
  ApiEndpoint['status'],
  { dot: string; glow: string; border: string; label: string }
> = {
  healthy: {
    dot: 'bg-emerald-500',
    glow: 'status-glow-active',
    border: 'border-l-emerald-500',
    label: 'Healthy',
  },
  degraded: {
    dot: 'bg-amber-500',
    glow: 'status-glow-degraded',
    border: 'border-l-amber-500',
    label: 'Degraded',
  },
  down: {
    dot: 'bg-red-500 animate-pulse',
    glow: 'status-glow-critical',
    border: 'border-l-red-500',
    label: 'Down',
  },
  maintenance: {
    dot: 'bg-gray-400',
    glow: '',
    border: 'border-l-gray-400',
    label: 'Maintenance',
  },
};

const circuitConfig: Record<
  ApiEndpoint['circuitBreaker'],
  { bg: string; text: string; border: string; label: string }
> = {
  closed: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
    label: 'Closed',
  },
  open: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
    label: 'Open',
  },
  'half-open': {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    label: 'Half-Open',
  },
};

const categoryLabels: Record<ApiEndpoint['category'], string> = {
  llm: 'LLM',
  payment: 'Payment',
  database: 'Database',
  search: 'Search',
  mcp: 'MCP',
};

function EndpointSparkline({ data, isNegative }: { data: number[]; isNegative: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = 60;
    const h = 24;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const color = isNegative ? '#dc2626' : '#22c55e';
    const fillColor = isNegative ? 'rgba(220,38,38,0.08)' : 'rgba(34,197,94,0.08)';

    if (data.length < 2) return;

    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;

    ctx.beginPath();
    data.forEach((p, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((p - min) / range) * (h - 4) - 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    const lastX = w;
    const lastY = h - ((data[data.length - 1] - min) / range) * (h - 4) - 2;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }, [data, isNegative]);

  return <canvas ref={canvasRef} />;
}

interface EndpointCardProps {
  endpoint: ApiEndpoint;
  onAction: (endpointId: string, action: string) => void;
  sparklineData: number[];
  index: number;
}

export function EndpointCard({
  endpoint,
  onAction,
  sparklineData,
  index,
}: EndpointCardProps) {
  const cfg = statusConfig[endpoint.status];
  const circ = circuitConfig[endpoint.circuitBreaker];
  const isNegative = endpoint.errorRate > 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className={`rounded-xl border-l-4 ${cfg.border} glass-card card-lift overflow-hidden`}
    >
      <div className="p-4 sm:p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex h-8 w-8 items-center justify-center shrink-0">
              <div className={`relative h-2.5 w-2.5 rounded-full ${cfg.dot} ${cfg.glow}`} />
              {endpoint.status === 'down' && (
                <span className="absolute inset-0 rounded-full bg-red-500/30 animate-pulse-ring" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {endpoint.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                >
                  {categoryLabels[endpoint.category]}
                </Badge>
              </div>
            </div>
          </div>
          <EndpointSparkline data={sparklineData} isNegative={isNegative} />
        </div>

        {/* URL */}
        <p className="text-[11px] font-mono text-gray-400 dark:text-gray-500 truncate mb-3 pl-[42px]">
          {endpoint.baseUrl}
        </p>

        {/* Circuit breaker badge */}
        <div className="flex items-center gap-2 mb-4 pl-[42px]">
          <Badge
            variant="outline"
            className={`text-[10px] px-2 py-0 rounded-full ${circ.bg} ${circ.text} ${circ.border}`}
          >
            {circ.label}
          </Badge>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">Circuit</span>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div>
            <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">
              <Clock className="h-3 w-3" />
              Latency
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {endpoint.latency > 0 ? `${endpoint.latency}ms` : '—'}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">
              <Zap className="h-3 w-3" />
              Error Rate
            </div>
            <p
              className={`text-sm font-semibold ${
                endpoint.errorRate > 10
                  ? 'text-[#dc2626]'
                  : endpoint.errorRate > 5
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-gray-900 dark:text-gray-100'
              }`}
            >
              {endpoint.errorRate}%
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">
              <Activity className="h-3 w-3" />
              Uptime
            </div>
            <p
              className={`text-sm font-semibold ${
                endpoint.uptime >= 99.9
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : endpoint.uptime >= 95
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-[#dc2626]'
              }`}
            >
              {endpoint.uptime}%
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">
              <ArrowUpRight className="h-3 w-3" />
              Total Reqs
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {endpoint.totalRequests.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-[11px] text-gray-500 hover:text-[#dc2626] hover:bg-red-50 dark:hover:bg-red-950/30 gap-1"
            onClick={() => onAction(endpoint.id, 'health-check')}
          >
            <RefreshCw className="h-3 w-3" />
            <span className="hidden sm:inline">Force Health Check</span>
            <span className="sm:hidden">Check</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-[11px] text-gray-500 hover:text-[#dc2626] hover:bg-red-50 dark:hover:bg-red-950/30 gap-1"
            onClick={() => onAction(endpoint.id, 'reset-circuit')}
          >
            <ShieldCheck className="h-3 w-3" />
            <span className="hidden sm:inline">Reset Circuit</span>
            <span className="sm:hidden">Reset</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 text-[11px] gap-1 ${
              endpoint.fallbackEnabled
                ? 'text-[#dc2626] bg-red-50 dark:bg-red-950/30'
                : 'text-gray-400 hover:text-[#dc2626] hover:bg-red-50 dark:hover:bg-red-950/30'
            }`}
            onClick={() => onAction(endpoint.id, 'toggle-fallback')}
          >
            <ToggleLeft className="h-3 w-3" />
            <span className="hidden sm:inline">Toggle Fallback</span>
            <span className="sm:hidden">Fallback</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
