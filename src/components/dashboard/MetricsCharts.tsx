'use client';

import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

interface MetricSeries {
  name: string;
  data: { timestamp: string; value: number; label?: string }[];
  color: string;
}

interface PieItem {
  name: string;
  value: number;
  color: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 shadow-lg">
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-0.5">
          {new Date(label).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
          {payload[0].value.toFixed(1)}
        </p>
      </div>
    );
  }
  return null;
};

const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-[10px] font-bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function MetricsCharts({
  timeSeries,
  severity,
  frameworks,
}: {
  timeSeries: MetricSeries[];
  severity: PieItem[];
  frameworks: PieItem[];
}) {
  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const chartData = timeSeries[0]?.data.map((d, i) => {
    const point: Record<string, any> = { time: d.timestamp };
    timeSeries.forEach((series) => {
      point[series.name] = series.data[i]?.value || 0;
    });
    return point;
  });

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      {/* Main time series chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="lg:col-span-2 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Agent Metrics (24h)</h3>
          <div className="flex items-center gap-3">
            {timeSeries.map((s) => (
              <span key={s.name} className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.name}
              </span>
            ))}
          </div>
        </div>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <defs>
                {timeSeries.map((s) => (
                  <linearGradient key={s.name} id={`grad-${s.name}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #f3f4f6)" vertical={false} />
              <XAxis
                dataKey="time"
                tickFormatter={formatTime}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
                interval={19}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {timeSeries.map((s) => (
                <Area
                  key={s.name}
                  type="monotone"
                  dataKey={s.name}
                  stroke={s.color}
                  strokeWidth={2}
                  fill={`url(#grad-${s.name})`}
                  dot={false}
                  animationDuration={1200}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Severity breakdown pie */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5"
      >
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Issue Severity</h3>
        <div className="h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={severity}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={58}
                paddingAngle={3}
                dataKey="value"
                labelLine={false}
                label={PieLabel}
                animationBegin={300}
              >
                {severity.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {severity.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="truncate">{item.name}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Framework distribution bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="lg:col-span-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5"
      >
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Framework Distribution</h3>
        <div className="h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={frameworks} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={1000}>
                {frameworks.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
