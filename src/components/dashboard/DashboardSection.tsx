'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import {
  LayoutDashboard,
  GitBranch,
  AlertTriangle,
  Bell,
  Bot,
  Clock,
  Search,
  Filter,
  X,
  GitCompareArrows,
  BarChart3,
  Heart,
  Settings,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ExportButton } from '@/components/ui/ExportButton';
import { MetricCards } from './MetricCards';
import { AgentGrid } from './AgentGrid';
import { TraceViewer } from './TraceViewer';
import { IssuesPanel } from './IssuesPanel';
import { AlertFeed } from './AlertFeed';
import { ActivityTimeline } from './ActivityTimeline';
import { MetricsCharts } from './MetricsCharts';
import { McpPanel } from './McpPanel';
import { AgentDetailSheet } from './AgentDetailSheet';
import { AgentComparison } from './AgentComparison';
import { TraceWaterfall } from './TraceWaterfall';
import { DashboardSkeleton } from './DashboardSkeleton';
import { ApiHealthPanel } from './ApiHealthPanel';
import { SettingsPanel } from './SettingsPanel';

type TabId = 'overview' | 'traces' | 'issues' | 'alerts' | 'api-health';

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'traces', label: 'Traces', icon: GitBranch },
  { id: 'issues', label: 'Issues', icon: AlertTriangle },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'api-health', label: 'API Health', icon: Heart },
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

  // Sync tab to URL hash
  useEffect(() => {
    const hash = window.location.hash.replace('#dashboard-', '').replace('#', '');
    if (['overview', 'traces', 'issues', 'alerts', 'api-health'].includes(hash)) {
      setActiveTab(hash as TabId);
    }
  }, []);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    window.history.replaceState(null, '', `#dashboard-${tab}`);
  };
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [detailAgent, setDetailAgent] = useState<Agent | null>(null);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [comparisonAgents, setComparisonAgents] = useState<[Agent, Agent] | null>(null);
  const [showWaterfall, setShowWaterfall] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [traces, setTraces] = useState<Trace[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [alertItems, setAlertItems] = useState<AlertItem[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Search and filter state
  const [issueSearch, setIssueSearch] = useState('');
  const [issueSeverityFilter, setIssueSeverityFilter] = useState<string>('all');
  const [issueStatusFilter, setIssueStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Trace search and filter state
  const [traceSearch, setTraceSearch] = useState('');
  const [traceStatusFilter, setTraceStatusFilter] = useState<string>('all');

  // Filter persistence via localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sentinel-dash-filters');
      if (saved) {
        const f = JSON.parse(saved);
        if (f.traceSearch) setTraceSearch(f.traceSearch);
        if (f.issueSearch) setIssueSearch(f.issueSearch);
        if (f.traceStatusFilter) setTraceStatusFilter(f.traceStatusFilter);
        if (f.issueSeverityFilter) setIssueSeverityFilter(f.issueSeverityFilter);
        if (f.issueStatusFilter) setIssueStatusFilter(f.issueStatusFilter);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('sentinel-dash-filters', JSON.stringify({
        traceSearch, issueSearch, traceStatusFilter, issueSeverityFilter, issueStatusFilter,
      }));
    } catch { /* ignore */ }
  }, [traceSearch, issueSearch, traceStatusFilter, issueSeverityFilter, issueStatusFilter]);

  // WebSocket for real-time alerts
  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket('ws://localhost:3001/?XTransformPort=3001');
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'new_alert') {
            setAlertItems((prev) => [data.alert, ...prev].slice(0, 20));
          }
        } catch (e) {
          // ignore parse errors
        }
      };
    } catch (e) {
      // WebSocket not available, that's ok
    }
    return () => {
      if (ws) ws.close();
    };
  }, []);

  const fetchIssues = async () => {
    try {
      const issuesRes = await fetch('/api/issues').then((r) => r.json());
      setIssues(issuesRes);
    } catch {
      // silently fail
    }
  };

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

  const handleCompareAgent = (agent: Agent) => {
    if (comparisonIds.includes(agent.id)) {
      setComparisonIds(comparisonIds.filter(id => id !== agent.id));
      return;
    }
    const newIds = [...comparisonIds, agent.id].slice(-2);
    setComparisonIds(newIds);
    if (newIds.length === 2) {
      const a = agents.find(a => a.id === newIds[0]);
      const b = agents.find(a => a.id === newIds[1]);
      if (a && b) {
        setComparisonAgents([a, b]);
        setComparisonIds([]);
      }
    }
  };

  const filteredTraces = traces.filter((t) => {
    const matchesAgent = !selectedAgentId || t.agentId === selectedAgentId;
    const matchesSearch = !traceSearch ||
      t.traceId.toLowerCase().includes(traceSearch.toLowerCase()) ||
      t.agentId.toLowerCase().includes(traceSearch.toLowerCase()) ||
      t.status.toLowerCase().includes(traceSearch.toLowerCase());
    const matchesStatus = traceStatusFilter === 'all' || t.status === traceStatusFilter;
    return matchesAgent && matchesSearch && matchesStatus;
  });

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch = !issueSearch ||
      issue.title.toLowerCase().includes(issueSearch.toLowerCase()) ||
      issue.agentName.toLowerCase().includes(issueSearch.toLowerCase()) ||
      issue.description.toLowerCase().includes(issueSearch.toLowerCase());
    const matchesSeverity = issueSeverityFilter === 'all' || issue.severity === issueSeverityFilter;
    const matchesStatus = issueStatusFilter === 'all' || issue.status === issueStatusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <section id="dashboard" className="relative py-24 sm:py-32 bg-gray-50/50 dark:bg-gray-900/30">
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
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            The{'\u00A0'}
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
          className="animated-border rounded-2xl bg-white dark:bg-gray-950 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden"
        >
          {/* Dashboard header with tabs */}
          <div className="border-b border-gray-100 dark:border-gray-800 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div data-tour="tabs" className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`relative flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-all duration-200 ${
                        isActive
                          ? 'text-[#dc2626] border-[#dc2626]'
                          : 'text-gray-400 dark:text-gray-500 border-transparent hover:text-gray-600 dark:hover:text-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                      {isActive && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 bg-gradient-to-r from-transparent via-[#dc2626] to-transparent rounded-full" />
                      )}
                      {tab.id === 'issues' && issues.length > 0 && (
                        <span className="badge-pulse flex h-4 min-w-4 items-center justify-center rounded-full bg-[#dc2626] px-1 text-[9px] font-bold text-white">
                          {issues.filter((i) => i.status !== 'resolved').length}
                        </span>
                      )}
                      {tab.id === 'alerts' && alertItems.filter((a) => a.status === 'unread').length > 0 && (
                        <span className="badge-pulse flex h-4 min-w-4 items-center justify-center rounded-full bg-[#dc2626] px-1 text-[9px] font-bold text-white">
                          {alertItems.filter((a) => a.status === 'unread').length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </div>
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="ml-2 h-7 w-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#dc2626] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors focus-ring"
                  aria-label="Open settings"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Dashboard content */}
          <div className="p-4 sm:p-6">
            {loading ? (
              <DashboardSkeleton />
            ) : (
              <>
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {metrics?.cards && (
                      <div data-tour="metrics">
                        <MetricCards cards={metrics.cards} />
                      </div>
                    )}

                    <div className="grid lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                          <Bot className="h-4 w-4 text-gray-400" />
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Monitored Agents</h3>
                          <span className="text-xs text-gray-400 dark:text-gray-500">({agents.length})</span>
                        </div>
                        <div data-tour="agents"><AgentGrid agents={agents} onSelect={(agent) => setDetailAgent(agent)} onCompare={handleCompareAgent} comparisonIds={comparisonIds} />
                        {comparisonIds.length === 1 && (
                          <p className="text-xs text-[#dc2626] mt-2 flex items-center gap-1.5"><GitCompareArrows className="h-3 w-3" />1 agent selected — click another to compare</p>
                        )}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">MCP Fix Workflow</h3>
                        <div data-tour="mcp"><McpPanel /></div>
                      </div>
                    </div>

                    {metrics?.timeSeries && metrics?.severityBreakdown && metrics?.frameworkDistribution && (
                      <div data-tour="charts">
                        <MetricsCharts
                          timeSeries={metrics.timeSeries}
                          severity={metrics.severityBreakdown}
                          frameworks={metrics.frameworkDistribution}
                        />
                      </div>
                    )}
                  </motion.div>
                )}

                {/* TRACES TAB */}
                {activeTab === 'traces' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-gray-400" />
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Trace Explorer</h3>
                        <span className="text-xs text-gray-400 dark:text-gray-500">({filteredTraces.length}/{traces.length} traces)</span>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                          <Input
                            placeholder="Search traces..."
                            value={traceSearch}
                            onChange={(e) => setTraceSearch(e.target.value)}
                            className="h-8 pl-8 pr-8 text-xs bg-gray-50 border-gray-200 w-full sm:w-56"
                          />
                          {traceSearch && (
                            <button
                              onClick={() => setTraceSearch('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2"
                            >
                              <X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                            </button>
                          )}
                        </div>
                        <ExportButton
                          data={filteredTraces as unknown as Record<string, unknown>[]}
                          filename="sentinel-traces"
                          columns={['traceId', 'agentId', 'status', 'duration', 'inputTokens', 'outputTokens', 'createdAt']}
                          label="Export"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <button
                        onClick={() => setShowWaterfall(!showWaterfall)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${showWaterfall ? 'bg-[#dc2626] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'}`}
                      >
                        <BarChart3 className="h-3 w-3" />
                        Waterfall
                      </button>
                      {selectedAgentId && (
                        <button
                          onClick={() => setSelectedAgentId(null)}
                          className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#dc2626]/10 text-[#dc2626] border border-[#dc2626]/20 hover:bg-[#dc2626]/20 transition-colors"
                        >
                          ← All agents
                        </button>
                      )}
                      {['all', 'success', 'error'].map((stat) => (
                        <button
                          key={stat}
                          onClick={() => setTraceStatusFilter(stat)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                            traceStatusFilter === stat
                              ? stat === 'success' ? 'bg-emerald-500 text-white'
                                : stat === 'error' ? 'bg-[#dc2626] text-white'
                                : 'bg-gray-200 text-gray-700'
                              : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {stat.charAt(0).toUpperCase() + stat.slice(1)}
                        </button>
                      ))}
                    </div>

                    {filteredTraces.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No traces match your filters</p>
                      </div>
                    ) : (
                      <TraceViewer traces={filteredTraces} />
                    )}
                    {showWaterfall && filteredTraces.length > 0 && (
                      <div className="mt-6">
                        <div className="flex items-center gap-2 mb-3">
                          <BarChart3 className="h-4 w-4 text-gray-400" />
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Waterfall Timeline</h3>
                        </div>
                        <TraceWaterfall spans={filteredTraces[0]?.spans ?? []} totalDuration={filteredTraces[0]?.duration ?? 1} />
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ISSUES TAB */}
                {activeTab === 'issues' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-[#dc2626]" />
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Detected Issues</h3>
                        <span className="text-xs text-gray-400 dark:text-gray-500">({filteredIssues.length}/{issues.length})</span>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                          <Input
                            placeholder="Search issues..."
                            value={issueSearch}
                            onChange={(e) => setIssueSearch(e.target.value)}
                            className="h-8 pl-8 pr-8 text-xs bg-gray-50 border-gray-200 w-full sm:w-56"
                          />
                          {issueSearch && (
                            <button
                              onClick={() => setIssueSearch('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2"
                            >
                              <X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => setShowFilters(!showFilters)}
                          className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border transition-colors ${
                            showFilters
                              ? 'bg-[#dc2626] text-white border-[#dc2626]'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Filter className="h-3.5 w-3.5" />
                          Filters
                        </button>
                        <ExportButton
                          data={filteredIssues as unknown as Record<string, unknown>[]}
                          filename="sentinel-issues"
                          columns={['agentName', 'title', 'severity', 'status', 'failureRate', 'affectedRuns', 'createdAt']}
                          label="Export"
                        />
                      </div>
                    </div>

                    {showFilters && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="flex flex-wrap items-center gap-2 mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
                      >
                        <span className="text-[11px] text-gray-500 font-medium">Severity:</span>
                        {['all', 'P0', 'P1', 'P2'].map((sev) => (
                          <button
                            key={sev}
                            onClick={() => setIssueSeverityFilter(sev)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                              issueSeverityFilter === sev
                                ? sev === 'P0' ? 'bg-[#dc2626] text-white'
                                  : sev === 'P1' ? 'bg-amber-500 text-white'
                                  : sev === 'P2' ? 'bg-gray-500 text-white'
                                  : 'bg-gray-200 text-gray-700'
                                : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {sev === 'all' ? 'All' : sev}
                          </button>
                        ))}
                        <div className="w-px h-4 bg-gray-200 mx-1" />
                        <span className="text-[11px] text-gray-500 font-medium">Status:</span>
                        {['all', 'open', 'investigating', 'resolved', 'reopened'].map((stat) => (
                          <button
                            key={stat}
                            onClick={() => setIssueStatusFilter(stat)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                              issueStatusFilter === stat
                                ? 'bg-[#dc2626] text-white'
                                : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {stat.charAt(0).toUpperCase() + stat.slice(1)}
                          </button>
                        ))}
                      </motion.div>
                    )}

                    {filteredIssues.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No issues match your filters</p>
                      </div>
                    ) : (
                      <IssuesPanel issues={filteredIssues} onUpdate={fetchIssues} />
                    )}
                  </motion.div>
                )}

                {/* API HEALTH TAB */}
                {activeTab === 'api-health' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <ApiHealthPanel />
                  </motion.div>
                )}

                {/* ALERTS TAB */}
                {activeTab === 'alerts' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                      <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent{'\u00A0'}Activity</h3>
                        </div>
                        <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-4 max-h-[600px] overflow-y-auto dashboard-scroll">
                          <ActivityTimeline />
                        </div>
                      </div>
                      <div className="lg:col-span-3">
                        <AlertFeed alerts={alertItems} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>

      <AgentDetailSheet agent={detailAgent} open={!!detailAgent} onClose={() => setDetailAgent(null)} />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      {comparisonAgents && (
        <AgentComparison
          agentA={comparisonAgents[0]}
          agentB={comparisonAgents[1]}
          open={!!comparisonAgents}
          onClose={() => { setComparisonAgents(null); setComparisonIds([]); }}
        />
      )}
    </section>
  );
}
