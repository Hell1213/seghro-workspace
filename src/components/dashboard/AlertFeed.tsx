'use client';

import { motion } from 'framer-motion';
import { Bell, BellOff, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AlertItem {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'unread' | 'read';
  channel: string;
  createdAt: string;
}

const severityAccent = {
  critical: 'border-l-red-500',
  warning: 'border-l-amber-400',
  info: 'border-l-gray-300',
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

export function AlertFeed({ alerts }: { alerts: AlertItem[] }) {
  const unreadCount = alerts.filter((a) => a.status === 'unread').length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-[#dc2626]" />
          <h3 className="text-sm font-semibold text-gray-900">Live Alerts</h3>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#dc2626] px-1.5 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" className="text-xs text-gray-400 h-7">
          <BellOff className="h-3.5 w-3.5 mr-1" />
          Mark all read
        </Button>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin">
        {alerts.map((alert, i) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className={`rounded-lg border-l-[3px] ${severityAccent[alert.severity]} border border-gray-100 ${
              alert.status === 'unread' ? 'bg-white' : 'bg-gray-50/50'
            } p-3.5 hover:shadow-sm transition-all group cursor-pointer`}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="text-xs font-semibold text-gray-800 leading-tight">
                {alert.title}
              </h4>
              <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">
                {timeAgo(alert.createdAt)}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">
              {alert.message}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center gap-1 text-[10px] text-gray-400">
                <Hash className="h-2.5 w-2.5" />
                {alert.channel}
              </span>
              {alert.status === 'unread' && (
                <div className="h-1.5 w-1.5 rounded-full bg-[#dc2626]" />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}