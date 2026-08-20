'use client';

import {
  useState,
  useEffect,
  useRef,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Compass,
  Bot,
  GitBranch,
  AlertTriangle,
  LayoutDashboard,
  Bell,
  Moon,
  Sun,
  ClipboardCopy,
  ArrowRight,
  Clock,
  Zap,
  Command,
  BookOpen,
  CreditCard,
  Heart,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onSelectAgent?: (agentId: string) => void;
  onSelectTrace?: (traceId: string) => void;
  onSelectIssue?: (issueId: string) => void;
}

interface CommandItem {
  id: string;
  label: string;
  secondary?: string;
  icon: React.ElementType;
  group: 'navigation' | 'agents' | 'traces' | 'issues' | 'shortcuts';
  action: () => void;
}

/* ------------------------------------------------------------------ */
/*  Navigation sections                                                */
/* ------------------------------------------------------------------ */

const NAV_SECTIONS = [
  { id: 'hero', label: 'Hero', href: '#hero' },
  { id: 'features', label: 'Features', href: '#features' },
  { id: 'how-it-works', label: 'How It Works', href: '#how-it-works' },
  { id: 'stats', label: 'Stats', href: '#stats' },
  { id: 'dashboard', label: 'Dashboard', href: '#dashboard' },
  { id: 'testimonials', label: 'Testimonials', href: '#testimonials' },
  { id: 'newsletter', label: 'Newsletter', href: '#newsletter' },
  { id: 'integrations', label: 'Integrations', href: '#integrations' },
  { id: 'cta', label: 'Get Started', href: '#cta' },
];

/* ------------------------------------------------------------------ */
/*  Local-storage recent items                                         */
/* ------------------------------------------------------------------ */

const RECENT_KEY = 'sentinel-cmd-palette-recent';
const MAX_RECENT = 5;

function getRecentItems(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
}

function addRecentItem(id: string) {
  try {
    const items = getRecentItems().filter((r) => r !== id);
    items.unshift(id);
    localStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, MAX_RECENT)));
  } catch {
    // ignore
  }
}

/* ------------------------------------------------------------------ */
/*  Group icon map                                                     */
/* ------------------------------------------------------------------ */

const GROUP_ICON: Record<string, React.ElementType> = {
  Navigation: Compass,
  Agents: Bot,
  Traces: GitBranch,
  Issues: AlertTriangle,
  Recent: Clock,
  'Quick Actions': Zap,
  'Keyboard Shortcuts': Command,
};

const GROUP_ORDER: CommandItem['group'][] = [
  'navigation',
  'agents',
  'traces',
  'issues',
  'shortcuts',
];

const GROUP_LABELS: Record<CommandItem['group'], string> = {
  navigation: 'Navigation',
  agents: 'Agents',
  traces: 'Traces',
  issues: 'Issues',
  shortcuts: 'Keyboard Shortcuts',
};

/* ------------------------------------------------------------------ */
/*  Inner panel (mounts fresh each open)                               */
/* ------------------------------------------------------------------ */

function CommandPalettePanel({
  onClose,
  onSelectAgent,
  onSelectTrace,
  onSelectIssue,
}: Omit<CommandPaletteProps, 'open'>) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<CommandItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  /* -- hydration gate ------------------------------------------------ */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  /* -- scroll selected item into view -------------------------------- */
  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.querySelector('[data-active="true"]');
    active?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  /* -- fetch data on mount ------------------------------------------- */
  useEffect(() => {
    Promise.all([
      fetch('/api/agents').then((r) => r.json()),
      fetch('/api/traces').then((r) => r.json()),
      fetch('/api/issues').then((r) => r.json()),
    ])
      .then(([agentsData, tracesData, issuesData]) => {
        const built: CommandItem[] = [];

        // Navigation
        for (const nav of NAV_SECTIONS) {
          built.push({
            id: `nav-${nav.id}`,
            label: nav.label,
            icon: Compass,
            group: 'navigation',
            action: () => {
              document
                .getElementById(nav.id)
                ?.scrollIntoView({ behavior: 'smooth' });
              onClose();
            },
          });
        }

        // Agents
        for (const agent of agentsData) {
          built.push({
            id: `agent-${agent.id}`,
            label: agent.name,
            secondary: `${agent.framework} · ${agent.status}`,
            icon: Bot,
            group: 'agents',
            action: () => {
              onSelectAgent?.(agent.id);
              document
                .getElementById('dashboard')
                ?.scrollIntoView({ behavior: 'smooth' });
              onClose();
            },
          });
        }

        // Traces
        for (const trace of tracesData) {
          built.push({
            id: `trace-${trace.id}`,
            label: trace.traceId,
            secondary: `${trace.status} · ${trace.duration}ms`,
            icon: GitBranch,
            group: 'traces',
            action: () => {
              onSelectTrace?.(trace.id);
              document
                .getElementById('dashboard')
                ?.scrollIntoView({ behavior: 'smooth' });
              onClose();
            },
          });
        }

        // Issues
        for (const issue of issuesData) {
          built.push({
            id: `issue-${issue.id}`,
            label: issue.title,
            secondary: `${issue.severity} · ${issue.status}`,
            icon: AlertTriangle,
            group: 'issues',
            action: () => {
              onSelectIssue?.(issue.id);
              document
                .getElementById('dashboard')
                ?.scrollIntoView({ behavior: 'smooth' });
              onClose();
            },
          });
        }

        // Keyboard Shortcuts
        built.push(
          {
            id: 'shortcut-dashboard',
            label: 'Go to Dashboard',
            icon: LayoutDashboard,
            group: 'shortcuts',
            action: () => {
              document.querySelector('#dashboard')?.scrollIntoView({ behavior: 'smooth' });
              onClose();
            },
          },
          {
            id: 'shortcut-docs',
            label: 'Open Documentation',
            icon: BookOpen,
            group: 'shortcuts',
            action: () => {
              document.querySelector('#docs')?.scrollIntoView({ behavior: 'smooth' });
              onClose();
            },
          },
          {
            id: 'shortcut-pricing',
            label: 'View Pricing',
            icon: CreditCard,
            group: 'shortcuts',
            action: () => {
              document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' });
              onClose();
            },
          },
          {
            id: 'shortcut-api-health',
            label: 'API Health Tab',
            icon: Heart,
            group: 'shortcuts',
            action: () => {
              window.location.hash = '#dashboard-api-health';
              onClose();
            },
          },
          {
            id: 'shortcut-dark',
            label: 'Toggle Dark Mode',
            icon: Moon,
            group: 'shortcuts',
            action: () => {
              const btn = document.querySelector('[aria-label="Toggle theme"]');
              if (btn) (btn as HTMLElement).click();
              onClose();
            },
          },
          {
            id: 'shortcut-search',
            label: 'Search Agents',
            icon: Search,
            group: 'shortcuts',
            action: () => {
              window.location.hash = '#dashboard-traces';
              onClose();
            },
          },
        );

        setItems(built);
      })
      .catch(() => {
        // silent fail – palette still shows navigation
      })
      .finally(() => setLoading(false));
  }, [onClose, onSelectAgent, onSelectTrace, onSelectIssue]);

  /* -- filter items -------------------------------------------------- */
  const filteredItems = query.trim()
    ? items.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          (item.secondary &&
            item.secondary.toLowerCase().includes(query.toLowerCase()))
      )
    : items;

  /* -- build display groups ------------------------------------------ */
  const displayGroups = (() => {
    if (query.trim()) {
      const groups: { title: string; items: CommandItem[] }[] = [];
      for (const g of GROUP_ORDER) {
        const gItems = filteredItems.filter((i) => i.group === g);
        if (gItems.length > 0) {
          groups.push({ title: GROUP_LABELS[g], items: gItems });
        }
      }
      return groups;
    }

    // No query – show recent items, then quick actions
    const recentIds = getRecentItems();
    const recentItems = recentIds
      .map((id) => items.find((i) => i.id === id))
      .filter(Boolean) as CommandItem[];

    const quickActions: CommandItem[] = [
      {
        id: 'qa-dashboard',
        label: 'Go to Dashboard',
        icon: LayoutDashboard,
        group: 'navigation',
        action: () => {
          document
            .getElementById('dashboard')
            ?.scrollIntoView({ behavior: 'smooth' });
          onClose();
        },
      },
      {
        id: 'qa-issues',
        label: 'View Issues',
        icon: AlertTriangle,
        group: 'navigation',
        action: () => {
          document
            .getElementById('dashboard')
            ?.scrollIntoView({ behavior: 'smooth' });
          onClose();
        },
      },
      {
        id: 'qa-alerts',
        label: 'View Alerts',
        icon: Bell,
        group: 'navigation',
        action: () => {
          document
            .getElementById('dashboard')
            ?.scrollIntoView({ behavior: 'smooth' });
          onClose();
        },
      },
      {
        id: 'qa-dark',
        label: 'Toggle Dark Mode',
        secondary:
          mounted
            ? theme === 'dark'
              ? 'Switch to light'
              : 'Switch to dark'
            : undefined,
        icon: theme === 'dark' ? Sun : Moon,
        group: 'navigation',
        action: () => {
          setTheme(theme === 'dark' ? 'light' : 'dark');
          onClose();
        },
      },
      {
        id: 'qa-copy',
        label: 'Copy Install Command',
        secondary: 'pip install sentinel-sdk',
        icon: ClipboardCopy,
        group: 'navigation',
        action: () => {
          navigator.clipboard.writeText('pip install sentinel-sdk');
          toast.success('Copied to clipboard!');
          onClose();
        },
      },
    ];

    const groups: { title: string; items: CommandItem[] }[] = [];
    if (recentItems.length > 0) {
      groups.push({ title: 'Recent', items: recentItems });
    }
    groups.push({ title: 'Quick Actions', items: quickActions });

    // Keyboard Shortcuts always at bottom
    const shortcutItems = items.filter((i) => i.group === 'shortcuts');
    if (shortcutItems.length > 0) {
      groups.push({ title: 'Keyboard Shortcuts', items: shortcutItems });
    }

    return groups;
  })();

  // Flatten for keyboard navigation
  const flatItems = displayGroups.flatMap((g) => g.items);

  /* -- execute item -------------------------------------------------- */
  function executeItem(item: CommandItem) {
    addRecentItem(item.id);
    item.action();
  }

  /* -- keyboard handling --------------------------------------------- */
  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < flatItems.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : flatItems.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (flatItems[activeIndex]) {
          executeItem(flatItems[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-[100] bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <motion.div
        className="fixed inset-0 z-[101] flex items-start justify-center pt-[15vh] px-4"
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        transition={{
          duration: 0.2,
          ease: [0.16, 1, 0.3, 1],
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="w-full max-w-xl rounded-2xl border border-gray-200 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/80 shadow-2xl shadow-black/20 dark:shadow-black/50 backdrop-blur-xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-gray-200/60 dark:border-gray-700/40 px-4 py-3">
            <Search className="h-4.5 w-4.5 shrink-0 text-gray-400 dark:text-gray-500" />
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
              placeholder="Search agents, traces, issues..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:text-gray-400">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div
            ref={listRef}
            className="max-h-[340px] overflow-y-auto py-2 custom-scrollbar"
          >
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[#dc2626]" />
              </div>
            )}

            {!loading && flatItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
                <Search className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No results found</p>
                <p className="text-xs mt-0.5">Try a different search term</p>
              </div>
            )}

            {!loading &&
              displayGroups.map((group) => (
                <div key={group.title} className="mb-1">
                  <div className="flex items-center gap-2 px-4 py-1.5">
                    {(() => {
                      const GIcon = GROUP_ICON[group.title] || Compass;
                      return <GIcon className="h-3 w-3 text-[#dc2626]" />;
                    })()}
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      {group.title}
                    </span>
                  </div>
                  {group.items.map((item) => {
                    const flatIdx = flatItems.indexOf(item);
                    const isActive = flatIdx === activeIndex;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        data-active={isActive}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors cursor-pointer"
                        style={
                          isActive
                            ? { backgroundColor: 'rgba(220, 38, 38, 0.08)' }
                            : undefined
                        }
                        onMouseEnter={() => setActiveIndex(flatIdx)}
                        onClick={() => executeItem(item)}
                      >
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors"
                          style={
                            isActive
                              ? {
                                  backgroundColor: 'rgba(220, 38, 38, 0.12)',
                                  color: '#dc2626',
                                }
                              : {
                                  backgroundColor: 'rgba(156, 163, 175, 0.1)',
                                  color: '#9ca3af',
                                }
                          }
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className="font-medium truncate"
                            style={
                              isActive
                                ? { color: '#dc2626' }
                                : { color: 'inherit' }
                            }
                          >
                            {item.label}
                          </div>
                          {item.secondary && (
                            <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                              {item.secondary}
                            </div>
                          )}
                        </div>
                        {isActive && (
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#dc2626]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-200/60 dark:border-gray-700/40 px-4 py-2.5">
            <div className="flex items-center gap-3 text-[11px] text-gray-400 dark:text-gray-500">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-1 py-0.5 font-mono text-[10px]">
                  ↑↓
                </kbd>{' '}
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-1 py-0.5 font-mono text-[10px]">
                  ↵
                </kbd>{' '}
                select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-1 py-0.5 font-mono text-[10px]">
                  esc
                </kbd>{' '}
                close
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
              <Command className="h-3 w-3" />
              <span>sentinel</span>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Wrapper with AnimatePresence                                       */
/* ------------------------------------------------------------------ */

export function CommandPalette(props: CommandPaletteProps) {
  return (
    <AnimatePresence>
      {props.open && <CommandPalettePanel key="cmd-palette" {...props} />}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Hook: useCommandPalette — manages open/close + keyboard shortcut    */
/* ------------------------------------------------------------------ */

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const close = () => setOpen(false);
  const toggle = () => setOpen((prev) => !prev);

  return { open, close, toggle };
}
