'use client';

import { motion } from 'framer-motion';
import { Bell, BellOff, Hash, CheckCircle2, Shield, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AlertItem {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'unread' | 'read' | 'acknowledged' | 'resolved';
  channel: string;
  createdAt: string;
}

const severityAccent = {
  critical: 'border-l-red-500 dark:border-l-red-400',
  warning: 'border-l-amber-400',
  info: 'border-l-gray-300 dark:border-l-gray-600',
};

const statusLabel = {
  unread: 'Unread',
  read: 'Read',
  acknowledged: 'Acknowledged',
  resolved: 'Resolved',
};

const statusBadge = {
  unread: 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400',
  read: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  acknowledged: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400',
  resolved: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400',
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export function AlertFeed({ alerts, onUpdate }: { alerts: AlertItem[]; onUpdate?: () => void }) {
  const unreadCount = alerts.filter((a) => a.status === 'unread').length;

  const handleStatusChange = async (alertId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alertId, status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Alert ${newStatus === 'acknowledged' ? 'acknowledged' : 'resolved'}`);
        onUpdate?.();
      } else {
        toast.error('Failed to update alert');
      }
    } catch {
      toast.error('Failed to update alert');
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = alerts.filter((a) => a.status === 'unread').map((a) => a.id);
    if (unreadIds.length === 0) return;

    try {
      await Promise.all(
        unreadIds.map((id) =>
          fetch('/api/alerts', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
          }),
        ),
      );
      toast.success(`${unreadIds.length} alert${unreadIds.length > 1 ? 's' : ''} marked as read`);
      onUpdate?.();
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-[#dc2626]" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Live Alerts</h3>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#dc2626] px-1.5 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-gray-400 h-7 hover:text-gray-600 dark:hover:text-gray-300"
          onClick={handleMarkAllRead}
        >
          <BellOff className="h-3.5 w-3.5 mr-1" />
          Mark all read
        </Button>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin">
        {alerts.map((alert, i) => {
          const isActive = alert.status === 'unread' || alert.status === 'read';
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className={`rounded-lg border-l-[3px] ${severityAccent[alert.severity]} border border-gray-100 dark:border-gray-800 ${
                alert.status === 'unread' ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/50'
              } p-3.5 hover:shadow-sm transition-all`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                  {alert.title}
                </h4>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${statusBadge[alert.status]}`}
                  >
                    {statusLabel[alert.status]}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {timeAgo(alert.createdAt)}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                {alert.message}
              </p>
              <div className="flex items-center justify-between gap-2 mt-2">
                <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                  <Hash className="h-2.5 w-2.5" />
                  {alert.channel}
                </span>
                {isActive && (
                  <div className="flex items-center gap-1.5">
                    {alert.status === 'unread' && (
                      <button
                        onClick={() => handleStatusChange(alert.id, 'read')}
                        className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Eye className="h-3 w-3" />
                        Read
                      </button>
                    )}
                    <button
                      onClick={() => handleStatusChange(alert.id, 'acknowledged')}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                    >
                      <Shield className="h-3 w-3" />
                      Acknowledge
                    </button>
                    <button
                      onClick={() => handleStatusChange(alert.id, 'resolved')}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
