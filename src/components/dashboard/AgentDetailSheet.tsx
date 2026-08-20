'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, Area, AreaChart, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { Bot, Activity, Clock, AlertTriangle, Zap, ExternalLink, FileSearch, CheckCircle2, Wrench, TrendingUp, BarChart3, CalendarCheck, AlertOctagon } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { issues } from '@/lib/seed-data';

interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'degraded' | 'critical' | 'inactive';
  framework: string;
  lastRunAt: string;
  totalRuns: number;
  errorRate: number;
  avgLatency: number;
}

const statusConfig = {
  active: { label: 'Active', badge: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' },
  degraded: { label: 'Degraded', badge: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50' },
  critical: { label: 'Critical', badge: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50' },
  inactive: { label: 'Inactive', badge: 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700' },
};

const severityBadge = {
  P0: 'bg-red-600 text-white',
  P1: 'bg-amber-500 text-white',
  P2: 'bg-gray-400 text-white',
};

// Seeded random number generator from a numeric seed
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

// Mock activity events
const mockActivities = [
  { id: 'a1', icon: CheckCircle2, dotColor: 'bg-emerald-500', title: 'Trace completed successfully', description: 'Processing pipeline finished in 1.2s with 0 errors', time: '2m ago' },
  { id: 'a2', icon: AlertTriangle, dotColor: 'bg-amber-500', title: 'High latency detected', description: 'P95 latency exceeded 3s threshold on endpoint /api/process', time: '8m ago' },
  { id: 'a3', icon: FileSearch, dotColor: 'bg-emerald-500', title: 'Trace inspection completed', description: 'Analyzed 47 spans across 3 service boundaries', time: '15m ago' },
  { id: 'a4', icon: Wrench, dotColor: 'bg-emerald-500', title: 'Fix deployed automatically', description: 'Self-healing patched timeout configuration for worker pool', time: '23m ago' },
  { id: 'a5', icon: AlertTriangle, dotColor: 'bg-red-500', title: 'Error rate spike detected', description: 'Error rate jumped to 18.2% on /api/inference endpoint', time: '34m ago' },
  { id: 'a6', icon: CheckCircle2, dotColor: 'bg-emerald-500', title: 'Health check passed', description: 'All 5 liveness probes returned healthy status', time: '51m ago' },
  { id: 'a7', icon: FileSearch, dotColor: 'bg-emerald-500', title: 'Dependency scan completed', description: 'Scanned 12 upstream services, all within SLA', time: '1h ago' },
  { id: 'a8', icon: Wrench, dotColor: 'bg-amber-500', title: 'Config update applied', description: 'Increased max retries from 3 to 5 for transient failures', time: '1h ago' },
];

// Mock performance data generator
function generatePerformanceData(seed: number) {
  const rand = seededRandom(seed);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day) => {
    const runs = Math.round(40 + rand() * 80);
    const errorRate = parseFloat((rand() * 15).toFixed(1));
    return { day, runs, errorRate };
  });
}

function getBarColor(errorRate: number) {
  if (errorRate < 5) return '#16a34a';
  if (errorRate < 15) return '#d97706';
  return '#dc2626';
}

// Lightweight custom tooltip for charts
function ChartTooltip({ active, payload, label, valueSuffix }: { active?: boolean; payload?: Array<{ value: number }>; label?: string; valueSuffix?: string }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2.5 py-1.5 shadow-lg">
      <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
        {payload[0].value}{valueSuffix ?? ''}
      </p>
    </div>
  );
}

export function AgentDetailSheet({ agent, open, onClose }: { agent: Agent | null; open: boolean; onClose: () => void }) {
  const agentIssues = useMemo(() => {
    if (!agent) return [];
    return issues.filter((i) => i.agentId === agent.id).slice(0, 3);
  }, [agent]);

  const sparklineData = useMemo(() => {
    if (!agent) return [];
    const seed = Math.round(agent.errorRate * 1000);
    const rand = seededRandom(seed);
    return Array.from({ length: 10 }, (_, i) => ({
      value: Math.max(0, agent.errorRate + (rand() - 0.5) * agent.errorRate * 1.5 + (i > 5 ? -2 : 0)),
    }));
  }, [agent]);

  const performanceData = useMemo(() => {
    if (!agent) return [];
    return generatePerformanceData(Math.round(agent.totalRuns * 7 + agent.errorRate * 100));
  }, [agent]);

  const perfStats = useMemo(() => {
    if (performanceData.length === 0) return { totalRuns: 0, avgSuccess: '0%', bestDay: '-', worstDay: '-' };
    const totalRuns = performanceData.reduce((s, d) => s + d.runs, 0);
    const avgSuccess = (100 - performanceData.reduce((s, d) => s + d.errorRate, 0) / performanceData.length).toFixed(1);
    const best = performanceData.reduce((a, b) => a.errorRate < b.errorRate ? a : b);
    const worst = performanceData.reduce((a, b) => a.errorRate > b.errorRate ? a : b);
    return { totalRuns, avgSuccess: `${avgSuccess}%`, bestDay: best.day, worstDay: worst.day };
  }, [performanceData]);

  if (!agent) return null;

  const cfg = statusConfig[agent.status];

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 bg-white dark:bg-gray-950 overflow-y-auto">
        <SheetHeader className="p-5 pb-0">
          <SheetTitle className="sr-only">Agent Details</SheetTitle>
          <SheetDescription className="sr-only">Detailed information about {agent.name}</SheetDescription>
        </SheetHeader>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="px-5 pb-6 space-y-5"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex items-start justify-between pr-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
                <Bot className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold font-mono text-gray-900 dark:text-gray-100">{agent.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${cfg.badge}`}>
                    {cfg.label}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                    {agent.framework}
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.p variants={itemVariants} className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            {agent.description}
          </motion.p>

          {/* Tabs */}
          <motion.div variants={itemVariants}>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full h-9 bg-gray-100 dark:bg-gray-800/60 rounded-lg p-[3px]">
                <TabsTrigger
                  value="overview"
                  className="flex-1 text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-transparent data-[state=active]:border-b-[#dc2626] data-[state=active]:text-[#dc2626]"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="flex-1 text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-transparent data-[state=active]:border-b-[#dc2626] data-[state=active]:text-[#dc2626]"
                >
                  Activity
                </TabsTrigger>
                <TabsTrigger
                  value="performance"
                  className="flex-1 text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-transparent data-[state=active]:border-b-[#dc2626] data-[state=active]:text-[#dc2626]"
                >
                  Performance
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-4 space-y-5">
                {/* Stats Row - 2x2 grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 mb-1">
                      <Activity className="h-3 w-3" />
                      Total Runs
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{agent.totalRuns.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 mb-1">
                      <AlertTriangle className="h-3 w-3" />
                      Error Rate
                    </div>
                    <p className={`text-sm font-semibold ${agent.errorRate > 10 ? 'text-red-600' : agent.errorRate > 5 ? 'text-amber-600' : 'text-gray-900 dark:text-gray-100'}`}>
                      {agent.errorRate}%
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 mb-1">
                      <Zap className="h-3 w-3" />
                      Avg Latency
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{agent.avgLatency}s</p>
                  </div>
                  <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 mb-1">
                      <Clock className="h-3 w-3" />
                      Last Run
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{timeAgo(agent.lastRunAt)}</p>
                  </div>
                </div>

                {/* Sparkline Chart */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Error Rate Trend</h4>
                  <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30 p-3">
                    <ResponsiveContainer width="100%" height={80}>
                      <AreaChart data={sparklineData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                        <defs>
                          <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#dc2626" stopOpacity={0.15} />
                            <stop offset="100%" stopColor="#dc2626" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#dc2626"
                          strokeWidth={2}
                          fill="url(#errorGradient)"
                          dot={false}
                          isAnimationActive={true}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Issues */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Recent Issues</h4>
                  {agentIssues.length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500 py-3">No issues found for this agent.</p>
                  ) : (
                    <div className="space-y-2">
                      {agentIssues.map((issue) => (
                        <div
                          key={issue.id}
                          className="flex items-center gap-2.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3"
                        >
                          <Badge className={`${severityBadge[issue.severity]} text-[10px] px-1.5 py-0 border-0`}>
                            {issue.severity}
                          </Badge>
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate flex-1">{issue.title}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-8 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-200 hover:text-red-600">
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    View Full Trace
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-8 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-200 hover:text-red-600">
                    View All Issues
                  </Button>
                </div>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="mt-4">
                <div className="relative">
                  {/* Timeline vertical line */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-800" />
                  <div className="space-y-4">
                    {mockActivities.map((event) => {
                      const IconComp = event.icon;
                      return (
                        <div key={event.id} className="relative flex gap-3 pl-1">
                          {/* Colored dot */}
                          <div className={`relative z-10 mt-1 h-[15px] w-[15px] rounded-full ${event.dotColor} flex items-center justify-center shrink-0`}>
                            <div className="h-[5px] w-[5px] rounded-full bg-white" />
                          </div>
                          {/* Content */}
                          <div className="flex-1 min-w-0 pb-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <IconComp className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                              <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{event.title}</p>
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-1 mb-0.5">{event.description}</p>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500">{event.time}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="mt-4 space-y-4">
                {/* Mini Stat Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 mb-1">
                      <BarChart3 className="h-3 w-3" />
                      Total Runs (7d)
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{perfStats.totalRuns.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 mb-1">
                      <TrendingUp className="h-3 w-3" />
                      Avg Success Rate
                    </div>
                    <p className="text-sm font-semibold text-emerald-600">{perfStats.avgSuccess}</p>
                  </div>
                  <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 mb-1">
                      <CalendarCheck className="h-3 w-3" />
                      Best Day
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{perfStats.bestDay}</p>
                  </div>
                  <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 mb-1">
                      <AlertOctagon className="h-3 w-3" />
                      Worst Day
                    </div>
                    <p className="text-sm font-semibold text-red-600">{perfStats.worstDay}</p>
                  </div>
                </div>

                {/* Charts - 2 column grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Daily Runs Bar Chart */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Daily Runs</h4>
                    <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30 p-3">
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={performanceData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                          <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar dataKey="runs" radius={[3, 3, 0, 0]}>
                            {performanceData.map((entry, index) => (
                              <Cell key={`bar-${index}`} fill={getBarColor(entry.errorRate)} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Error Rate Line Chart */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Error Rate %</h4>
                    <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30 p-3">
                      <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={performanceData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                          <defs>
                            <linearGradient id="perfErrorGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#dc2626" stopOpacity={0.2} />
                              <stop offset="100%" stopColor="#dc2626" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                          <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
                          <Tooltip content={<ChartTooltip valueSuffix="%" />} />
                          <Area
                            type="monotone"
                            dataKey="errorRate"
                            stroke="#dc2626"
                            strokeWidth={2}
                            fill="url(#perfErrorGradient)"
                            dot={{ r: 3, fill: '#dc2626', strokeWidth: 0 }}
                            isAnimationActive={true}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
