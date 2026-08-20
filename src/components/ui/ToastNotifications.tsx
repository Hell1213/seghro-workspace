'use client';

import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Bell, X } from 'lucide-react';

interface ToastAlert {
  id: string;
  title: string;
  message: string;
  severity: string;
  createdAt: string;
}

interface ToastNotificationsProps {
  alerts: ToastAlert[];
  maxVisible?: number;
}

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const severityConfig: Record<
  string,
  {
    borderColor: string;
    iconColor: string;
    bgClass: string;
    Icon: typeof AlertTriangle;
  }
> = {
  critical: {
    borderColor: 'border-l-red-500',
    iconColor: 'text-red-500',
    bgClass: 'bg-red-50/50 dark:bg-red-950/20',
    Icon: AlertTriangle,
  },
  warning: {
    borderColor: 'border-l-amber-500',
    iconColor: 'text-amber-500',
    bgClass: '',
    Icon: AlertTriangle,
  },
  info: {
    borderColor: 'border-l-blue-500',
    iconColor: 'text-blue-500',
    bgClass: '',
    Icon: Bell,
  },
};

const DEFAULT_CONFIG = {
  borderColor: 'border-l-gray-400',
  iconColor: 'text-gray-400',
  bgClass: '',
  Icon: Bell,
};

export function ToastNotifications({
  alerts,
  maxVisible = 3,
}: ToastNotificationsProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const shownIdsRef = useRef<Set<string>>(new Set());
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Derive visible alerts: trim to maxVisible, remove dismissed
  const visibleAlerts = useMemo(() => {
    return alerts
      .slice(0, maxVisible)
      .filter((a) => !dismissedIds.has(a.id));
  }, [alerts, maxVisible, dismissedIds]);

  // Dismiss an alert (clear timer + update set)
  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setDismissedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  // Start auto-dismiss timers for newly seen alerts
  useEffect(() => {
    const trimmed = alerts.slice(0, maxVisible);

    trimmed.forEach((alert) => {
      if (
        !shownIdsRef.current.has(alert.id) &&
        !dismissedIds.has(alert.id)
      ) {
        shownIdsRef.current.add(alert.id);

        const timer = setTimeout(() => {
          dismiss(alert.id);
        }, 6000);

        timersRef.current.set(alert.id, timer);
      }
    });
  }, [alerts, maxVisible, dismissedIds, dismiss]);

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-30 flex flex-col-reverse gap-2 w-80 sm:w-96">
      <AnimatePresence mode="popLayout">
        {visibleAlerts.map((alert) => {
          const config = severityConfig[alert.severity] ?? DEFAULT_CONFIG;
          const { borderColor, iconColor, bgClass, Icon } = config;

          return (
            <motion.div
              key={alert.id}
              layout
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`relative rounded-xl border bg-white dark:bg-gray-900 shadow-xl border-l-4 border-l-transparent ${borderColor} ${bgClass}`}
            >
              <button
                onClick={() => dismiss(alert.id)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-start gap-3 p-4 pr-8">
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${iconColor}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                      {alert.title}
                    </p>
                    <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {timeAgo(alert.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {alert.message}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
