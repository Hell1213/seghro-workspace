'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { AlertOctagon, AlertTriangle, Info, ChevronDown, ChevronRight, CheckCircle2, XCircle, Clock, Target, RotateCcw, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Issue {
  id: string;
  agentId: string;
  agentName: string;
  title: string;
  description: string;
  severity: 'P0' | 'P1' | 'P2';
  status: 'open' | 'investigating' | 'resolved' | 'wontfix' | 'reopened';
  affectedRuns: number;
  totalRuns: number;
  failureRate: number;
  rootCause: string;
  suggestedFix: string;
  createdAt: string;
  updatedAt: string;
}

const severityConfig = {
  P0: { icon: AlertOctagon, color: 'text-[#dc2626]', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-900/50', badge: 'bg-[#dc2626] text-white' },
  P1: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-900/50', badge: 'bg-amber-500 text-white' },
  P2: { icon: Info, color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800/50', border: 'border-gray-200 dark:border-gray-700', badge: 'bg-gray-400 text-white' },
};

const statusConfig = {
  open: { label: 'Open', color: 'text-[#dc2626]', bg: 'bg-red-50 dark:bg-red-950/30' },
  investigating: { label: 'Investigating', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  resolved: { label: 'Resolved', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  reopened: { label: 'Reopened', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
};

export function IssuesPanel({ issues, onUpdate }: { issues: Issue[]; onUpdate?: () => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/issues', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: issueId, status: newStatus }),
      });
      if (res.ok) {
        toast.success('Issue status updated');
        onUpdate?.();
      }
    } catch {
      // silently fail
    }
  };

  return (
    <div className="space-y-3">
      {issues.map((issue, i) => {
        const sev = severityConfig[issue.severity];
        const stat = statusConfig[issue.status];
        const isExpanded = expandedId === issue.id;
        const SevIcon = sev.icon;

        return (
          <motion.div
            key={issue.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.4 }}
            className={`rounded-xl border ${sev.border} ${sev.bg} overflow-hidden transition-all`}
          >
            <button
              onClick={() => setExpandedId(isExpanded ? null : issue.id)}
              className="w-full text-left p-4 hover:bg-white/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <SevIcon className={`h-4.5 w-4.5 mt-0.5 ${sev.color} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge className={`${sev.badge} text-[10px] px-1.5 py-0 border-0`}>{issue.severity}</Badge>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${stat.color} ${stat.bg} border-current/20`}>
                      {stat.label}
                    </Badge>
                    <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500">{issue.agentName}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">{issue.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{issue.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {issue.affectedRuns}/{issue.totalRuns} runs
                    </span>
                    <span className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      {issue.failureRate}% failure
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(issue.updatedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <div className="shrink-0">
                  {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
                </div>
              </div>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-900/60 px-5 py-4 space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                        <AlertOctagon className="h-3.5 w-3.5 text-[#dc2626]" />
                        Root Cause
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-gray-800 rounded-lg p-3">{issue.rootCause}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        Suggested Fix
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg p-3 border border-emerald-100 dark:border-emerald-900/30">{issue.suggestedFix}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs h-7">
                        Fix with MCP
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs h-7">
                        View Traces
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                      {issue.status === 'open' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-7"
                            onClick={() => handleStatusChange(issue.id, 'investigating')}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Start Investigation
                          </Button>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7"
                            onClick={() => handleStatusChange(issue.id, 'resolved')}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Mark Resolved
                          </Button>
                        </>
                      )}
                      {issue.status === 'investigating' && (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7"
                          onClick={() => handleStatusChange(issue.id, 'resolved')}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Mark Resolved
                        </Button>
                      )}
                      {issue.status === 'resolved' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs h-7"
                          onClick={() => handleStatusChange(issue.id, 'reopened')}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Reopen
                        </Button>
                      )}
                      {issue.status === 'reopened' && (
                        <Button
                          size="sm"
                          className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-7"
                          onClick={() => handleStatusChange(issue.id, 'investigating')}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Start Investigation
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}