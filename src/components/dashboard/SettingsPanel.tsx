'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Download, RotateCcw, Trash2, Pencil, Building2, User, Loader2, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApiKeysPanel } from '@/components/dashboard/ApiKeysPanel';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

/* ------------------------------------------------------------------ */
/*  Copy Button Helper                                                 */
/* ------------------------------------------------------------------ */

function CopyIconButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus-ring"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Section Heading                                                    */
/* ------------------------------------------------------------------ */

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {description}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Profile Section                                                    */
/* ------------------------------------------------------------------ */

function ProfileSection({ open }: { open: boolean }) {
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    role: string;
    image: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    // Use microtask to avoid synchronous setState in effect body
    Promise.resolve().then(() => {
      if (cancelled) return;
      setLoading(true);
      fetch('/api/session')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (cancelled) return;
          if (data) {
            setProfile({
              name: data.name ?? 'Unknown',
              email: data.email ?? '',
              role: data.role ?? 'viewer',
              image: data.image ?? null,
            });
          }
          setLoading(false);
        })
        .catch(() => {
          if (!cancelled) setLoading(false);
        });
    });
    return () => { cancelled = true; };
  }, [open]);

  return (
    <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        {loading ? (
          <div className="flex items-center gap-2 py-2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            <span className="text-xs text-gray-400">Loading profile…</span>
          </div>
        ) : profile ? (
          <>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-semibold text-gray-600 dark:text-gray-300 overflow-hidden">
                {profile.image ? (
                  <img src={profile.image} alt={profile.name} className="h-full w-full object-cover" />
                ) : (
                  profile.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {profile.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {profile.email}
                </p>
              </div>
              <Badge variant="outline" className="shrink-0 text-[10px] gap-1">
                <Shield className="w-3 h-3" />
                {profile.role}
              </Badge>
            </div>
          </>
        ) : (
          <p className="text-xs text-gray-400 py-2">Sign in to view your profile.</p>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Workspace Section                                                  */
/* ------------------------------------------------------------------ */

function WorkspaceSection({ open }: { open: boolean }) {
  const [org, setOrg] = useState<{
    name: string;
    plan: string;
    userCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchOrg = useCallback(() => {
    setLoading(true);
    fetch('/api/org')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setOrg({
            name: data.name ?? 'Unknown',
            plan: data.plan ?? 'free',
            userCount: data.userCount ?? 1,
          });
        }
      })
      .catch(() => { /* silent */ })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!open) return;
    fetchOrg();
  }, [open, fetchOrg]);

  async function handleSave() {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/org', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (res.ok) {
        setEditing(false);
        fetchOrg();
      }
    } catch { /* silent */ }
    finally { setSaving(false); }
  }

  return (
    <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-400" />
            Workspace
          </CardTitle>
          {!loading && org && (
            <button
              onClick={() => {
                setEditName(org.name);
                setEditing(true);
              }}
              className="h-7 w-7 rounded-md flex items-center justify-center text-gray-400 hover:text-[#dc2626] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              aria-label="Edit workspace name"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        {loading ? (
          <div className="flex items-center gap-2 py-2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            <span className="text-xs text-gray-400">Loading workspace…</span>
          </div>
        ) : org ? (
          editing ? (
            <div className="space-y-2">
              <Label htmlFor="org-name" className="text-xs">Workspace Name</Label>
              <div className="flex gap-2">
                <Input
                  id="org-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-8 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') setEditing(false);
                  }}
                  autoFocus
                />
                <Button size="sm" className="h-8 text-xs" onClick={handleSave} disabled={!editName.trim() || saving}>
                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {org.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {org.userCount} member{org.userCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] capitalize">
                  {org.plan} plan
                </Badge>
              </div>
            </>
          )
        ) : (
          <p className="text-xs text-gray-400 py-2">Sign in to view your workspace.</p>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  /* --- Notification toggles --- */
  const [slackEnabled, setSlackEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [toastEnabled, setToastEnabled] = useState(true);

  /* --- Self-Healing toggles --- */
  const [autoRemediation, setAutoRemediation] = useState(true);
  const [circuitBreakers, setCircuitBreakers] = useState(true);
  const [healthInterval, setHealthInterval] = useState('30');
  const [errorThreshold, setErrorThreshold] = useState('50');

  /* --- Data Retention --- */
  const [retention, setRetention] = useState('30');
  const [traceSampling, setTraceSampling] = useState(false);

  /* --- Danger Zone --- */
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="sm:max-w-md overflow-y-auto dashboard-scroll p-0"
      >
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 sticky top-0 bg-background z-10 border-b">
          <SheetTitle className="text-lg">Settings</SheetTitle>
          <SheetDescription>
            Configure your workspace, notifications, and monitoring preferences.
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 py-6 space-y-6">
          {/* ===== 0. Profile ===== */}
          <section>
            <ProfileSection open={open} />
          </section>

          {/* ===== 1. Workspace ===== */}
          <section>
            <WorkspaceSection open={open} />
          </section>

          <Separator />

          {/* ===== 1b. API Keys ===== */}
          <section>
            <ApiKeysPanel />
          </section>

          <Separator />

          {/* ===== 2. Notifications ===== */}
          <section>
            <SectionHeading
              title="Notifications"
              description="Choose how you want to be alerted about issues."
            />
            <div className="mt-3 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Slack notifications
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Post alerts to your Slack channel
                  </p>
                </div>
                <Switch
                  checked={slackEnabled}
                  onCheckedChange={setSlackEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Email alerts
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Send critical alerts via email
                  </p>
                </div>
                <Switch
                  checked={emailEnabled}
                  onCheckedChange={setEmailEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    In-app toasts
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Show real-time pop-up notifications
                  </p>
                </div>
                <Switch
                  checked={toastEnabled}
                  onCheckedChange={setToastEnabled}
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* ===== 3. Self-Healing ===== */}
          <section>
            <SectionHeading
              title="Self-Healing"
              description="Configure auto-remediation and circuit breaker behavior."
            />
            <div className="mt-3 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Enable auto-remediation
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Automatically fix detected API failures
                  </p>
                </div>
                <Switch
                  checked={autoRemediation}
                  onCheckedChange={setAutoRemediation}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Enable circuit breakers
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Prevent cascading failures across endpoints
                  </p>
                </div>
                <Switch
                  checked={circuitBreakers}
                  onCheckedChange={setCircuitBreakers}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="health-interval">Health check interval</Label>
                <div className="relative">
                  <Input
                    id="health-interval"
                    type="number"
                    min={5}
                    max={300}
                    value={healthInterval}
                    onChange={(e) => setHealthInterval(e.target.value)}
                    className="h-9 text-sm pr-14"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                    seconds
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="error-threshold">
                  Error threshold for circuit open
                </Label>
                <div className="relative">
                  <Input
                    id="error-threshold"
                    type="number"
                    min={1}
                    max={100}
                    value={errorThreshold}
                    onChange={(e) => setErrorThreshold(e.target.value)}
                    className="h-9 text-sm pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                    %
                  </span>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* ===== 4. Data Retention ===== */}
          <section>
            <SectionHeading
              title="Data Retention"
              description="Control how long trace and metric data is stored."
            />
            <div className="mt-3 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="retention">Retention period</Label>
                <Select value={retention} onValueChange={setRetention}>
                  <SelectTrigger id="retention" className="w-full h-9 text-sm">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Enable trace sampling
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Store only a representative subset of traces
                  </p>
                </div>
                <Switch
                  checked={traceSampling}
                  onCheckedChange={setTraceSampling}
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* ===== 5. Danger Zone ===== */}
          <section>
            <SectionHeading title="Danger Zone" />
            <div
              className={cn(
                'mt-3 rounded-xl border-2 p-4 space-y-3',
                'border-red-200 dark:border-red-900/50',
                'bg-red-50/50 dark:bg-red-950/20'
              )}
            >
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start text-sm"
              >
                <Download className="h-4 w-4" />
                Export All Data
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start text-sm"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Dashboard
              </Button>

              {confirmDelete ? (
                <div className="space-y-2">
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                    Are you sure? This action cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1 text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      Confirm Delete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-sm"
                      onClick={() => setConfirmDelete(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full justify-start text-sm"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Workspace
                </Button>
              )}
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}