'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ShieldAlert,
  Plus,
  CheckCircle2,
  Loader2,
  Heart,
  ServerCrash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { EndpointCard } from '@/components/dashboard/EndpointCard';
import { HealingTimeline } from '@/components/dashboard/HealingTimeline';
import { healthHistory } from '@/lib/self-healing-data';
import type { ApiEndpoint, HealingAction } from '@/lib/self-healing-data';

interface HealthSummary {
  healthy: number;
  degraded: number;
  down: number;
  maintenance: number;
  circuitsOpen: number;
}

export function ApiHealthPanel() {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [healingActions, setHealingActions] = useState<HealingAction[]>([]);
  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formCategory, setFormCategory] = useState<string>('');
  const [formTimeout, setFormTimeout] = useState('10000');
  const [formRetries, setFormRetries] = useState('3');
  const [formBackoff, setFormBackoff] = useState('1000');
  const [formFallback, setFormFallback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [epRes, healthRes, healingRes] = await Promise.all([
        fetch('/api/endpoints'),
        fetch('/api/api-health'),
        fetch('/api/healing'),
      ]);

      const [epData, healthData, healingData] = await Promise.all([
        epRes.json(),
        healthRes.json(),
        healingRes.json(),
      ]);

      setEndpoints(epData);
      if (healthData.summary) {
        setSummary(healthData.summary);
      }
      if (healingData.actions) {
        setHealingActions(healingData.actions);
      }
    } catch {
      // silent fail — data already empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Build sparkline data per endpoint from health history
  const sparklineMap = useMemo(() => {
    const map: Record<string, number[]> = {};
    for (const ep of endpoints) {
      const points = healthHistory
        .filter((h) => h.endpointId === ep.id)
        .map((h) => h.latency);
      map[ep.id] = points.length >= 2 ? points : [0, 0];
    }
    return map;
  }, [endpoints]);

  const handleAction = useCallback(
    async (endpointId: string, action: string) => {
      setActionLoading(`${endpointId}-${action}`);
      try {
        await fetch('/api/endpoints', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, endpointId }),
        });
        toast.success(`Action "${action}" triggered for ${endpointId}`);
        // Re-fetch after action
        fetchData();
      } catch {
        toast.error(`Failed to execute action: ${action}`);
      } finally {
        setActionLoading(null);
      }
    },
    [fetchData],
  );

  const handleAddEndpoint = useCallback(async () => {
    if (!formName.trim() || !formUrl.trim() || !formCategory) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/endpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          endpoint: {
            name: formName,
            baseUrl: formUrl,
            category: formCategory,
            timeout: Number(formTimeout),
            retryConfig: {
              maxRetries: Number(formRetries),
              backoffMs: Number(formBackoff),
              enabled: true,
            },
            fallbackEndpoint: formFallback || undefined,
          },
        }),
      });
      if (res.ok) {
        toast.success(`Endpoint "${formName}" added successfully`);
        setDialogOpen(false);
        setFormName('');
        setFormUrl('');
        setFormCategory('');
        setFormTimeout('10000');
        setFormRetries('3');
        setFormBackoff('1000');
        setFormFallback('');
        fetchData();
      }
    } catch {
      toast.error('Failed to add endpoint');
    } finally {
      setSubmitting(false);
    }
  }, [formName, formUrl, formCategory, formTimeout, formRetries, formBackoff, formFallback, fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 text-[#dc2626] animate-spin" />
        <span className="ml-2 text-sm text-gray-400">Loading API health data…</span>
      </div>
    );
  }

  const healthyCount = summary?.healthy ?? endpoints.filter((e) => e.status === 'healthy').length;
  const degradedCount = summary?.degraded ?? endpoints.filter((e) => e.status === 'degraded').length;
  const downCount = summary?.down ?? endpoints.filter((e) => e.status === 'down').length;
  const circuitsOpen = summary?.circuitsOpen ?? endpoints.filter((e) => e.circuitBreaker === 'open').length;

  return (
    <div className="space-y-6">
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Heart className="h-5 w-5 text-[#dc2626]" />
          API Health
        </h2>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs h-8 gap-1.5 btn-glow"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Endpoint
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-gray-100">
                Add API Endpoint
              </DialogTitle>
              <DialogDescription>
                Register a new endpoint for health monitoring and self-healing.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="ep-name">Name *</Label>
                <Input
                  id="ep-name"
                  placeholder="e.g. OpenAI GPT-4o"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ep-url">Base URL *</Label>
                <Input
                  id="ep-url"
                  placeholder="https://api.example.com/v1"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ep-category">Category *</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger id="ep-category" className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="llm">LLM</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="search">Search</SelectItem>
                    <SelectItem value="mcp">MCP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="ep-timeout">Timeout (ms)</Label>
                  <Input
                    id="ep-timeout"
                    type="number"
                    value={formTimeout}
                    onChange={(e) => setFormTimeout(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ep-retries">Max Retries</Label>
                  <Input
                    id="ep-retries"
                    type="number"
                    value={formRetries}
                    onChange={(e) => setFormRetries(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ep-backoff">Backoff (ms)</Label>
                  <Input
                    id="ep-backoff"
                    type="number"
                    value={formBackoff}
                    onChange={(e) => setFormBackoff(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ep-fallback">Fallback URL (optional)</Label>
                <Input
                  id="ep-fallback"
                  placeholder="https://fallback.api.example.com"
                  value={formFallback}
                  onChange={(e) => setFormFallback(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddEndpoint}
                disabled={submitting}
                className="bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs btn-glow"
              >
                {submitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
                Add Endpoint
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0, duration: 0.4 }}
          className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 sm:p-4 card-lift"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <span className="text-[11px] text-gray-400 dark:text-gray-500">Healthy</span>
          </div>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{healthyCount}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.4 }}
          className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 sm:p-4 card-lift"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/30">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <span className="text-[11px] text-gray-400 dark:text-gray-500">Degraded</span>
          </div>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{degradedCount}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.4 }}
          className="rounded-xl border border-red-100 dark:border-red-900/50 bg-white dark:bg-gray-900 p-3 sm:p-4 card-lift relative overflow-hidden"
        >
          {downCount > 0 && (
            <div className="absolute inset-0 bg-red-500/5 dark:bg-red-500/10 pointer-events-none" />
          )}
          <div className="relative flex items-center gap-2 mb-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/30">
              <ServerCrash className="h-3.5 w-3.5 text-[#dc2626] animate-pulse" />
            </div>
            <span className="text-[11px] text-gray-400 dark:text-gray-500">Down</span>
          </div>
          <p className="relative text-xl font-bold text-[#dc2626]">{downCount}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.4 }}
          className={`rounded-xl border p-3 sm:p-4 card-lift relative overflow-hidden ${
            circuitsOpen > 0
              ? 'border-red-100 dark:border-red-900/50 bg-white dark:bg-gray-900'
              : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'
          }`}
        >
          {circuitsOpen > 0 && (
            <div className="absolute inset-0 bg-red-500/5 dark:bg-red-500/10 pointer-events-none" />
          )}
          <div className="relative flex items-center gap-2 mb-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/30">
              <ShieldAlert className="h-3.5 w-3.5 text-[#dc2626]" />
            </div>
            <span className="text-[11px] text-gray-400 dark:text-gray-500">
              Circuits Open
            </span>
          </div>
          <p className={`relative text-xl font-bold ${circuitsOpen > 0 ? 'text-[#dc2626]' : 'text-gray-700 dark:text-gray-300'}`}>
            {circuitsOpen}
          </p>
        </motion.div>
      </div>

      {/* Section heading for endpoint grid */}
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-[#dc2626]" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Monitored Endpoints
        </h3>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gray-200 dark:border-gray-700 text-gray-500">
          {endpoints.length}
        </Badge>
      </div>

      {/* Endpoint Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {endpoints.map((ep, i) => (
          <EndpointCard
            key={ep.id}
            endpoint={ep}
            index={i}
            onAction={handleAction}
            sparklineData={sparklineMap[ep.id] || [0, 0]}
          />
        ))}
      </div>

      {/* Healing Actions Timeline */}
      <HealingTimeline actions={healingActions} />
    </div>
  );
}
