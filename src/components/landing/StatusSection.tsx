'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useCallback } from 'react';
import { Activity } from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

// ─── Data ───────────────────────────────────────────────────────────

type ServiceStatus = 'Operational' | 'Degraded' | 'Maintenance';

interface ServiceInfo {
  name: string;
  status: ServiceStatus;
  uptime: string;
  latency: string;
  lastIncident: string;
  sparkData: number[];
}

const services: ServiceInfo[] = [
  {
    name: 'API Gateway',
    status: 'Operational',
    uptime: '99.99%',
    latency: '12ms',
    lastIncident: '14 days ago',
    sparkData: [20, 18, 22, 15, 19, 21, 17, 23, 16, 20],
  },
  {
    name: 'Trace Pipeline',
    status: 'Operational',
    uptime: '99.97%',
    latency: '8ms',
    lastIncident: '21 days ago',
    sparkData: [10, 12, 9, 11, 13, 8, 14, 10, 12, 11],
  },
  {
    name: 'Alert Engine',
    status: 'Operational',
    uptime: '99.98%',
    latency: '5ms',
    lastIncident: '30 days ago',
    sparkData: [6, 7, 5, 8, 6, 9, 5, 7, 8, 6],
  },
  {
    name: 'MCP Integration',
    status: 'Degraded',
    uptime: '98.72%',
    latency: '156ms',
    lastIncident: '2 hours ago',
    sparkData: [120, 130, 145, 160, 155, 180, 170, 150, 140, 156],
  },
  {
    name: 'Dashboard UI',
    status: 'Operational',
    uptime: '99.95%',
    latency: '45ms',
    lastIncident: '7 days ago',
    sparkData: [42, 48, 44, 50, 46, 43, 47, 45, 49, 44],
  },
  {
    name: 'Data Pipeline',
    status: 'Operational',
    uptime: '99.99%',
    latency: '23ms',
    lastIncident: '45 days ago',
    sparkData: [22, 20, 25, 21, 24, 20, 23, 26, 22, 21],
  },
];

interface Incident {
  time: string;
  service: string;
  duration: string;
  status: 'Resolved' | 'Monitoring';
}

const incidents: Incident[] = [
  {
    time: 'Today, 14:32 UTC',
    service: 'MCP Integration',
    duration: '2h 14m',
    status: 'Monitoring',
  },
  {
    time: 'Yesterday, 09:15 UTC',
    service: 'Alert Engine',
    duration: '18m',
    status: 'Resolved',
  },
  {
    time: '3 days ago, 22:48 UTC',
    service: 'API Gateway',
    duration: '47m',
    status: 'Resolved',
  },
];

// Generate 90-day uptime data
function generateUptimeData(): { date: string; pct: number }[] {
  const data: { date: string; pct: number }[] = [];
  const now = new Date();
  const redIndices = new Set([17, 42, 68]);
  const amberIndices = new Set([5, 11, 33, 55, 76]);

  for (let i = 89; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    let pct: number;
    if (redIndices.has(89 - i)) {
      pct = 98.2 + Math.random() * 0.7;
    } else if (amberIndices.has(89 - i)) {
      pct = 99.0 + Math.random() * 0.89;
    } else {
      pct = 99.9 + Math.random() * 0.099;
    }
    data.push({ date: dateStr, pct: Math.round(pct * 100) / 100 });
  }
  return data;
}

const uptimeData = generateUptimeData();

// ─── Helpers ─────────────────────────────────────────────────────────

function statusColor(status: ServiceStatus) {
  switch (status) {
    case 'Operational':
      return {
        border: 'border-l-green-500',
        dot: 'bg-green-500',
        text: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-500/10',
        glow: 'status-glow-active',
      };
    case 'Degraded':
      return {
        border: 'border-l-amber-500',
        dot: 'bg-amber-500',
        text: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-500/10',
        glow: 'status-glow-degraded',
      };
    case 'Maintenance':
      return {
        border: 'border-l-gray-400',
        dot: 'bg-gray-400',
        text: 'text-gray-500 dark:text-gray-400',
        bg: 'bg-gray-500/10',
        glow: '',
      };
  }
}

function uptimeSquareColor(pct: number): string {
  if (pct >= 99.9) return 'bg-green-500 dark:bg-green-400';
  if (pct >= 99.0) return 'bg-amber-500 dark:bg-amber-400';
  return 'bg-red-500 dark:bg-red-400';
}

// ─── Sparkline Canvas Component ─────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = 80;
    const h = 10;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    data.forEach((val, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((val - min) / range) * (h - 2) - 1;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [data, color]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="block"
      aria-label="Sparkline chart"
    />
  );
}

// ─── Animation Variants ─────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

// ─── Main Component ─────────────────────────────────────────────────

export function StatusSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="status" className="relative py-24 sm:py-32 bg-gray-50/50 dark:bg-gray-900/30">
      <div ref={ref} className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-background dark:bg-gray-800 px-3.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 mb-4">
            <Activity className="h-3.5 w-3.5" />
            System Status
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 text-balance">
            <span className="text-gradient">Real-time infrastructure health</span>
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-300 max-w-2xl mx-auto">
            Monitor service uptime, latency, and incident history across all Seghro subsystems.
          </p>
        </motion.div>

        {/* ── Overall Status Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-12"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="glass-border status-shimmer inline-flex items-center gap-2.5 rounded-full bg-green-500/10 px-6 py-3 cursor-default">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                </span>
                <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                  All Systems Operational
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-gray-900 dark:bg-gray-100 text-gray-100 dark:text-gray-900 border-0 shadow-lg"
            >
              Last checked: 12 seconds ago
            </TooltipContent>
          </Tooltip>
        </motion.div>

        {/* ── Service Status Grid ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12"
        >
          {services.map((svc) => {
            const colors = statusColor(svc.status);
            const sparkColor =
              svc.status === 'Degraded' ? '#f59e0b' : '#22c55e';

            return (
              <motion.div
                key={svc.name}
                variants={itemVariants}
                className={`glass-card card-lift rounded-xl border-l-[3px] ${colors.border} p-4 sm:p-5`}
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {svc.name}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${colors.bg} ${colors.text}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${colors.dot} ${colors.glow}`} />
                    {svc.status}
                  </span>
                </div>

                {/* Metrics row */}
                <div className="flex items-end justify-between gap-2 mb-3">
                  <div className="flex gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-400">
                        Uptime
                      </p>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {svc.uptime}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-400">
                        Latency
                      </p>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {svc.latency}
                      </p>
                    </div>
                  </div>
                  <Sparkline data={svc.sparkData} color={sparkColor} />
                </div>

                {/* Last incident */}
                <p className="text-[11px] text-gray-400 dark:text-gray-400">
                  Last incident:{' '}
                  <span className={svc.status === 'Degraded' ? 'text-amber-500 font-medium' : ''}>
                    {svc.lastIncident}
                  </span>
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── 90-Day Uptime Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-card rounded-2xl p-5 sm:p-6 mb-12"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              90-Day Uptime
            </h3>
            <div className="flex items-center gap-4 text-[11px] text-gray-400 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-green-500 dark:bg-green-400" />
                &gt;99.9%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-amber-500 dark:bg-amber-400" />
                99–99.9%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-red-500 dark:bg-red-400" />
                &lt;99%
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-[3px]">
            {uptimeData.map((day, i) => (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <span
                    className={`block h-4 w-4 rounded-sm cursor-default transition-transform hover:scale-150 ${uptimeSquareColor(day.pct)}`}
                  />
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="bg-gray-900 dark:bg-gray-100 text-gray-100 dark:text-gray-900 border-0 shadow-lg"
                >
                  {day.date}: {day.pct}%
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </motion.div>

        {/* ── Incidents Summary ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-card rounded-2xl p-5 sm:p-6"
        >
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Recent Incidents
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-400">
                    Time
                  </th>
                  <th className="pb-3 text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-400">
                    Service
                  </th>
                  <th className="pb-3 text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-400">
                    Duration
                  </th>
                  <th className="pb-3 text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-400 text-right">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {incidents.map((inc, i) => (
                  <tr key={i} className="group">
                    <td className="py-3 pr-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {inc.time}
                    </td>
                    <td className="py-3 pr-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {inc.service}
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-500 dark:text-gray-400">
                      {inc.duration}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          inc.status === 'Resolved'
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {inc.status === 'Resolved' && (
                          <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500" />
                        )}
                        {inc.status === 'Monitoring' && (
                          <span className="mr-1 h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        )}
                        {inc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
