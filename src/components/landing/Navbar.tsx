'use client';

import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Shield, Menu, X, Moon, Sun, Search } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  onSearchClick?: () => void;
}

export function Navbar({ onSearchClick }: NavbarProps) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- needed to detect client hydration for next-themes
    setMounted(true);
  }, []);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 40);
  });

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Dashboard', href: '#dashboard' },
    { label: 'Docs', href: '#docs' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Integrations', href: '#integrations' },
    { label: 'Status', href: '#status' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/92 dark:bg-[#0a0a0a]/92 shadow-sm shadow-gray-200/50 dark:shadow-gray-900/50 border-b border-gray-100/50 dark:border-gray-800/50'
          : 'bg-transparent'
      }`}
      style={{ backdropFilter: scrolled ? 'blur(12px)' : 'none' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <motion.div
            className="flex items-center gap-2.5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[#dc2626] shadow-md shadow-red-500/20">
              <Shield className="h-4.5 w-4.5 text-white" />
              <span className="absolute inset-0 rounded-lg bg-[#dc2626] animate-ping opacity-20" />
            </div>
            <span className={`text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100 transition-all duration-300 ${scrolled ? 'drop-shadow-[0_0_8px_rgba(220,38,38,0.35)]' : ''}`}>
              Sentinel
            </span>
          </motion.div>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:text-[#dc2626] rounded-lg hover:bg-red-50/60 dark:hover:bg-red-950/40 focus-ring"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onSearchClick}
              className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-800/50 px-3 py-1.5 text-sm text-gray-400 dark:text-gray-500 transition-colors hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-500 dark:hover:text-gray-400 cursor-pointer"
              aria-label="Open command palette"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Search agents, traces, issues...</span>
              <kbd className="ml-4 hidden sm:inline-flex items-center gap-0.5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:text-gray-500">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
            <a
              href="#docs"
              className="px-3.5 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:text-[#dc2626] rounded-lg hover:bg-red-50/60 dark:hover:bg-red-950/40 focus-ring"
            >
              Documentation
            </a>
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors focus-ring"
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait">
                  {theme === 'dark' ? (
                    <motion.div
                      key="sun"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ scale: 0, rotate: 90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            )}
            <Button className="bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm px-5 shadow-md shadow-red-200 hover:shadow-red-300 transition-all btn-glow">
              Get Started
            </Button>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden bg-white/95 dark:bg-[#0a0a0a]/95 border-b border-gray-100 dark:border-gray-800 px-4 pb-4"
            style={{ backdropFilter: 'blur(12px)' }}
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-[#dc2626] rounded-lg hover:bg-red-50/60 dark:hover:bg-red-950/40"
              >
                {link.label}
              </a>
            ))}
            <Button className="w-full mt-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm btn-glow">
              Get Started
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
