'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import {
  Bot,
  Activity,
  AlertTriangle,
  TrendingUp,
  Coins,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface MetricCard {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}

const iconMap: Record<string, React.ElementType> = {
  'Total Agents': Bot,
  'Active Traces': Activity,
  'Open Issues': AlertTriangle,
  'Avg Error Rate': TrendingUp,
  'Total Token Usage': Coins,
  'Mean Latency': Clock,
};

function MiniSparkline({ isNegative }: { isNegative: boolean }) {
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

    // Generate random sparkline data
    const points: number[] = [];
    let val = 50 + Math.random() * 20;
    for (let i = 0; i < 12; i++) {
      val += (Math.random() - 0.48) * 12;
      val = Math.max(10, Math.min(90, val));
      points.push(val);
    }

    // Draw
    const color = isNegative ? '#dc2626' : '#22c55e';
    const fillColor = isNegative ? 'rgba(220,38,38,0.08)' : 'rgba(34,197,94,0.08)';

    ctx.beginPath();
    points.forEach((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - (p / 100) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Fill area
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    // End dot
    const lastX = w;
    const lastY = h - (points[points.length - 1] / 100) * h;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }, [isNegative]);

  return <canvas ref={canvasRef} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />;
}

export function MetricCards({ cards }: { cards: MetricCard[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, i) => {
        const Icon = iconMap[card.label] || Activity;
        const isNegative =
          card.label === 'Open Issues' || card.label === 'Avg Error Rate';
        const isBadTrend =
          (card.trend === 'up' && isNegative) ||
          (card.trend === 'down' && !isNegative);

        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 transition-all group hover:border-red-100 dark:hover:border-red-900/40 relative overflow-hidden card-lift"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shimmer pointer-events-none" />
            <div className="relative flex items-center justify-between mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 group-hover:bg-red-50 dark:group-hover:bg-red-950/30 transition-colors">
                <Icon className="h-4 w-4 text-gray-400 group-hover:text-[#dc2626] transition-colors" />
              </div>
              {card.trend === 'up' ? (
                <ArrowUpRight className={`h-3.5 w-3.5 ${isBadTrend ? 'text-[#dc2626]' : 'text-emerald-500'}`} />
              ) : (
                <ArrowDownRight className={`h-3.5 w-3.5 ${isBadTrend ? 'text-[#dc2626]' : 'text-emerald-500'}`} />
              )}
            </div>
            <p className="relative text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{card.value}</p>
            <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500 truncate">{card.change}</p>
            <div className="absolute bottom-2 right-2">
              <MiniSparkline isNegative={isBadTrend} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
