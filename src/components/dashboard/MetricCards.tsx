'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
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
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
} from 'recharts';

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

const NEGATIVE_METRICS = new Set(['Open Issues', 'Avg Error Rate']);
const DATA_POINTS = 12;
const UPDATE_INTERVAL = 5000;

function generateInitialData(isNegative: boolean): { v: number }[] {
  const points: { v: number }[] = [];
  let val = isNegative ? 30 + Math.random() * 30 : 40 + Math.random() * 40;
  for (let i = 0; i < DATA_POINTS; i++) {
    const drift = isNegative
      ? (Math.random() - 0.45) * 10
      : (Math.random() - 0.48) * 10;
    val = Math.max(5, Math.min(95, val + drift));
    points.push({ v: Number(val.toFixed(1)) });
  }
  return points;
}

function nextPoint(lastVal: number, isNegative: boolean): { v: number } {
  const drift = isNegative
    ? (Math.random() - 0.45) * 10
    : (Math.random() - 0.48) * 10;
  const newVal = Math.max(5, Math.min(95, lastVal + drift));
  return { v: Number(newVal.toFixed(1)) };
}

function MiniAreaChart({
  data,
  isNegative,
}: {
  data: { v: number }[];
  isNegative: boolean;
}) {
  const gradientId = isNegative ? 'redGradient' : 'greenGradient';
  const strokeColor = isNegative ? '#dc2626' : '#22c55e';

  return (
    <div className="w-full h-[30px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <YAxis domain={[0, 100]} hide />
          <Area
            type="monotone"
            dataKey="v"
            stroke={strokeColor}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            isAnimationActive={true}
            animationDuration={1200}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function useLiveChartData(isNegative: boolean) {
  const [data, setData] = useState(() => generateInitialData(isNegative));

  const tick = useCallback(() => {
    setData((prev) => {
      const lastVal = prev[prev.length - 1].v;
      const newPoint = nextPoint(lastVal, isNegative);
      const next = [...prev.slice(1), newPoint];
      return next;
    });
  }, [isNegative]);

  useEffect(() => {
    const id = setInterval(tick, UPDATE_INTERVAL);
    return () => clearInterval(id);
  }, [tick]);

  return data;
}

function MetricCardInner({
  card,
  index,
}: {
  card: MetricCard;
  index: number;
}) {
  const Icon = iconMap[card.label] || Activity;
  const isNegative = NEGATIVE_METRICS.has(card.label);
  const isBadTrend =
    (card.trend === 'up' && isNegative) ||
    (card.trend === 'down' && !isNegative);
  const chartData = useLiveChartData(isBadTrend);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 transition-all group hover:border-red-100 dark:hover:border-red-900/40 relative overflow-hidden card-lift hover:shadow-[0_2px_0_0_#dc2626]"
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
      <p className="relative text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
        {card.value}
      </p>
      <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500 truncate">
        {card.change}
      </p>
      <div className="mt-3 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
        <MiniAreaChart data={chartData} isNegative={isBadTrend} />
      </div>
    </motion.div>
  );
}

export function MetricCards({ cards }: { cards: MetricCard[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, i) => (
        <MetricCardInner key={card.label} card={card} index={i} />
      ))}
    </div>
  );
}
