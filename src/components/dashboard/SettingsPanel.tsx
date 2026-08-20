'use client';

import { useState, useCallback } from 'react';
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
import { Copy, Check, Download, RotateCcw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
          {/* ===== 1. Workspace ===== */}
          <section>
            <SectionHeading
              title="Workspace"
              description="Manage your workspace identity and credentials."
            />
            <div className="mt-3 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="workspace-name">Workspace Name</Label>
                <Input
                  id="workspace-name"
                  defaultValue="Lemma.ai Production"
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="api-key"
                    readOnly
                    value="sk_sentinel_live_a8f3e2d1..."
                    className="h-9 text-sm font-mono"
                  />
                  <CopyIconButton text="sk_sentinel_live_a8f3e2d1b4c5d6e7f8" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="webhook-url"
                    readOnly
                    value="https://hooks.sentinel.ai/webhook/..."
                    className="h-9 text-sm font-mono"
                  />
                  <CopyIconButton text="https://hooks.sentinel.ai/webhook/whk_3a18f6d4" />
                </div>
              </div>
            </div>
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
