'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface AgentOption {
  id: string;
  name: string;
  framework: string;
}

interface SimulateTraceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  agents: AgentOption[];
}

export function SimulateTraceDialog({ open, onOpenChange, onSuccess, agents }: SimulateTraceDialogProps) {
  const [agentId, setAgentId] = useState('');
  const [status, setStatus] = useState('success');
  const [duration, setDuration] = useState('1200');
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setAgentId('');
    setStatus('success');
    setDuration('1200');
  };

  const handleSubmit = async () => {
    if (!agentId) {
      toast.error('Please select an agent');
      return;
    }

    const dur = parseFloat(duration);
    if (isNaN(dur) || dur < 0) {
      toast.error('Please enter a valid duration');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/traces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          status,
          duration: dur,
        }),
      });

      if (res.ok) {
        const agentName = agents.find(a => a.id === agentId)?.name ?? 'Agent';
        toast.success(`Trace simulated for "${agentName}" (${status})`);
        resetForm();
        onOpenChange(false);
        onSuccess();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to simulate trace');
      }
    } catch {
      toast.error('Failed to simulate trace');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <AnimatePresence>
        {open && (
          <DialogContent className="sm:max-w-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <GitBranch className="h-4 w-4 text-emerald-600" />
                  </div>
                  Simulate Trace
                </DialogTitle>
                <DialogDescription>
                  Generate a test trace for an agent to verify observability.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Agent *</Label>
                  <Select value={agentId} onValueChange={setAgentId}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select an agent..." />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}{a.framework ? ` (${a.framework})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trace-duration" className="text-xs font-medium">Duration (ms)</Label>
                    <Input
                      id="trace-duration"
                      type="number"
                      min="0"
                      step="100"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={submitting || !agentId}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs min-w-[120px]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Simulating...
                    </>
                  ) : (
                    'Simulate Trace'
                  )}
                </Button>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
