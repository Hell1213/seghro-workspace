'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import {
  LayoutDashboard,
  GitBranch,
  AlertTriangle,
  Bell,
  Bot,
} from 'lucide-react';
import { MetricCards } from './MetricCards';
import { AgentGrid } from './AgentGrid';
import { TraceViewer } from './TraceViewer';
import { IssuesPanel } from './IssuesPanel';
import { AlertFeed } from './AlertFeed';
import { MetricsCharts } from './MetricsCharts';
import { McpPanel } from './McpPanel';

type TabId = 'overview' | 'traces' | 'issues' | 'alerts';

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'traces', label: 'Traces', icon: GitBranch },
  { id: 'issues', label: 'Issues', icon: AlertTriangle },
  { id: 'alerts', label: 'Alerts', icon: Bell },
];

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

interface Trace {
  id: string;
  agentId: string;
  traceId: string;
  status: string;
  duration: number;
  inputTokens: number;
  outputTokens: number;
  createdAt: string;
  spans: any[];
}

interface Issue {
  id: string;
  agentId: string;
  agentName: string;
  title: string;
  description: string;
  severity: 'P0' | 'P1' | 'P2';
  status: string;
  affectedRuns: number;
  totalRuns: number;
  failureRate: number;
  rootCause: string;
  suggestedFix: string;
  createdAt: string;
  updatedAt: string;
}

interface AlertItem {
  id: string;
  title: string;
  message: string;
  severity: string;
  status: string;
  channel: string;
  createdAt: string;
}

export function DashboardSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [traces, setTraces] = useState<Trace[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [alertItems, setAlertItems] = useState<AlertItem[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [agentsRes, tracesRes, issuesRes, alertsRes, metricsRes] =
          await Promise.all([
            fetch('/api/agents').then((r) => r.json()),
            fetch('/api/traces').then((r) => r.json()),
            fetch('/api/issues').then((r) => r.json()),
            fetch('/api/alerts').then((r) => r.json()),
            fetch('/api/metrics').then((r) => r.json()),
          ]);
        setAgents(agentsRes);
        setTraces(tracesRes);
        setIssues(issuesRes);
        setAlertItems(alertsRes);
        setMetrics(metricsRes);
      } catch (e) {
        console.error('Failed to fetch dashboard data:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredTraces = selectedAgentId
    ? traces.filter((t) => t.agentId === selectedAgentId)
    : traces;

  return (
    <section id="dashboard" className="relative py-24 sm:py-32 bg-gray-50/50">
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div ref={ref} className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-medium text-[#dc2626] mb-4">
            <div className="h-2 w-2 rounded-full bg-[#dc2626] animate-pulse" />
            Live Demo
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            The{' '}
            <span className="text-gradient">observability dashboard</span>
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Real-time monitoring of AI agent traces, issues, and metrics —
            everything running live below.
          </p>
        </motion.div>

        {/* Dashboard container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/50 overflow-hidden"
        >
          {/* Dashboard header with tabs */}
          <div className="border-b border-gray-100 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                        isActive
                          ? 'text-[#dc2626] border-[#dc2626]'
                          : 'text-gray-400 border-transparent hover:text-gray-600'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                      {tab.id === 'issues' && issues.length > 0 && (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#dc2626] px-1 text-[9px] font-bold text-white">
                          {issues.filter((i) => i.status !== 'resolved').length}
                        </span>
                      )}
                      {tab.id === 'alerts' && alertItems.filter((a) => a.status === 'unread').length > 0 && (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#dc2626] px-1 text-[9px] font-bold text-white">
                          {alertItems.filter((a) => a.status === 'unread').length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </div>
            </div>
          </div>

          {/* Dashboard content */}
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="h-5 w-5 rounded-full border-2 border-gray-200 border-t-[#dc2626] animate-spin" />
                  <span className="text-sm">Loading dashboard...</span>
                </div>
              </div>
            ) : (
              <>
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {metrics?.cards && <MetricCards cards={metrics.cards} />}

                    <div className="grid lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                          <Bot className="h-4 w-4 text-gray-400" />
                          <h3 className="text-sm font-semibold text-gray-900">Monitored Agents</h3>
                          <span className="text-xs text-gray-400">({agents.length})</span>
                        </div>
                        <AgentGrid agents={agents} onSelect={setSelectedAgentId} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">MCP Fix Workflow</h3>
                        <McpPanel />
                      </div>
                    </div>

                    {metrics?.timeSeries && metrics?.severityBreakdown && metrics?.frameworkDistribution && (
                      <MetricsCharts
                        timeSeries={metrics.timeSeries}
                        severity={metrics.severityBreakdown}
                        frameworks={metrics.frameworkDistribution}
                      />
                    )}
                  </motion.div>
                )}

                {/* TRACES TAB */}
                {activeTab === 'traces' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <GitBranch className="h-4 w-4 text-gray-400" />
                      <h3 className="text-sm font-semibold text-gray-900">Trace Explorer</h3>
                      <span className="text-xs text-gray-400">({filteredTraces.length} traces)</span>
                    </div>
                    {selectedAgentId && (
                      <button
                        onClick={() => setSelectedAgentId(null)}
                        className="mb-3 text-xs text-[#dc2626] hover:underline"
                      >
                        ← All agents
                      </button>
                    )}
                    <TraceViewer traces={filteredTraces} />
                  </motion.div>
                )}

                {/* ISSUES TAB */}
                {activeTab === 'issues' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-[#dc2626]" />
                        <h3 className="text-sm font-semibold text-gray-900">Detected Issues</h3>
                        <span className="text-xs text-gray-400">({issues.length})</span>
                      </div>
                    </div>
                    <IssuesPanel issues={issues} />
                  </motion.div>
                )}

                {/* ALERTS TAB */}
                {activeTab === 'alerts' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <AlertFeed alerts={alertItems} />
                  </motion.div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
