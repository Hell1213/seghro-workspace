'use client';

import { motion } from 'framer-motion';
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
            className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:shadow-md hover:shadow-red-50 dark:hover:shadow-red-950/20 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 group-hover:bg-red-50 dark:group-hover:bg-red-950/30 transition-colors">
                <Icon className="h-4 w-4 text-gray-400 group-hover:text-[#dc2626] transition-colors" />
              </div>
              {card.trend === 'up' ? (
                <ArrowUpRight className={`h-3.5 w-3.5 ${isBadTrend ? 'text-[#dc2626]' : 'text-emerald-500'}`} />
              ) : (
                <ArrowDownRight className={`h-3.5 w-3.5 ${isBadTrend ? 'text-[#dc2626]' : 'text-emerald-500'}`} />
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{card.value}</p>
            <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500 truncate">{card.change}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
