'use client';

import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { Menu, X, Moon, Sun, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SeghroLogo } from '@/components/SeghroLogo';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  onSearchClick?: () => void;
}

export function Navbar({ onSearchClick }: NavbarProps) {
  const router = useRouter();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Instant theme switch — disable all CSS transitions during class swap to prevent flash/blink
  const handleThemeToggle = () => {
    const root = document.documentElement;
    root.classList.add('theme-switching');
    // Force reflow so the browser registers the class before theme change
    void root.offsetHeight;
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    // Re-enable transitions after paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove('theme-switching');
      });
    });
  };
  const [mounted, setMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- needed to detect client hydration for next-themes
    setMounted(true);
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 40);
  });

  // Dynamic nav links based on screen size — fewer items on smaller md screens
  const navLinks = useMemo(() => {
    const allLinks = [
      { label: 'Features', href: '#features' },
      { label: 'Dashboard', href: '#dashboard' },
      { label: 'Docs', href: '#docs' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Integrations', href: '#integrations' },
      { label: 'Status', href: '#status' },
    ];
    // On md/lg screens, show fewer links to prevent wrapping
    if (windowWidth < 1280) {
      return allLinks.slice(0, 5);
    }
    return allLinks;
  }, [windowWidth]);

  const showSearchText = windowWidth >= 1024;
  const showDocLink = windowWidth >= 1100;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,box-shadow,border-color] duration-300 ${
        scrolled
          ? 'bg-white/92 dark:bg-[#0a0a0a]/92 shadow-sm shadow-gray-200/50 dark:shadow-gray-900/50 border-b border-gray-100/50 dark:border-gray-800/50'
          : 'bg-transparent'
      }`}
      style={{ backdropFilter: scrolled ? 'blur(12px)' : 'none' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex items-center shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SeghroLogo
              iconSize={32}
              textClass={`text-lg transition-[text-shadow,drop-shadow] duration-300 ${scrolled ? 'drop-shadow-[0_0_8px_rgba(220,38,38,0.35)]' : ''}`}
            />
          </motion.div>

          {/* Desktop nav links — hide on mobile, flex on md+ */}
          <div className="hidden md:flex items-center gap-0.5 overflow-hidden">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="whitespace-nowrap px-2.5 lg:px-3.5 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:text-[#dc2626] rounded-lg hover:bg-red-50/60 dark:hover:bg-red-950/40 focus-ring"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search trigger */}
            <button
              onClick={onSearchClick}
              className="hidden md:flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-800/50 px-2.5 py-1.5 text-sm text-gray-400 dark:text-gray-500 transition-colors hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-500 dark:hover:text-gray-400 cursor-pointer shrink-0"
              aria-label="Open command palette"
            >
              <Search className="h-3.5 w-3.5" />
              {showSearchText && (
                <span className="hidden lg:inline text-xs">Search...</span>
              )}
              <kbd className="ml-1 hidden lg:inline-flex items-center gap-0.5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:text-gray-500">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>

            {/* Documentation link — only on wider screens */}
            {showDocLink && (
              <a
                href="#docs"
                className="hidden md:inline-block whitespace-nowrap px-2.5 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:text-[#dc2626] rounded-lg hover:bg-red-50/60 dark:hover:bg-red-950/40 focus-ring"
              >
                Documentation
              </a>
            )}

            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={handleThemeToggle}
                className="relative h-8 w-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 focus-ring shrink-0"
                aria-label="Toggle theme"
              >
                <Sun className={`h-4 w-4 absolute transition-all duration-200 ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50 pointer-events-none'}`} />
                <Moon className={`h-4 w-4 absolute transition-all duration-200 ${theme === 'dark' ? 'opacity-0 -rotate-90 scale-50 pointer-events-none' : 'opacity-100 rotate-0 scale-100'}`} />
              </button>
            )}

            {/* Get Started CTA — visible on md+ */}
            <Button
              onClick={() => router.push('/login')}
              className="hidden md:inline-flex bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm px-4 lg:px-5 shadow-md shadow-red-200 hover:shadow-red-300 btn-glow shrink-0"
            >
              Get Started
            </Button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
            className="md:hidden overflow-hidden bg-white/95 dark:bg-[#0a0a0a]/95 border-b border-gray-100 dark:border-gray-800 px-4 pb-4"
            style={{ backdropFilter: 'blur(12px)' }}
          >
            {/* Search in mobile */}
            <button
              onClick={() => { setMobileOpen(false); onSearchClick?.(); }}
              className="w-full flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-400 mb-2"
            >
              <Search className="h-4 w-4" />
              <span>Search agents, traces, issues...</span>
            </button>
            {[
              { label: 'Features', href: '#features' },
              { label: 'Dashboard', href: '#dashboard' },
              { label: 'Docs', href: '#docs' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'How It Works', href: '#how-it-works' },
              { label: 'Integrations', href: '#integrations' },
              { label: 'Status', href: '#status' },
            ].map((link) => (
              <a
                key={link.href + link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-[#dc2626] rounded-lg hover:bg-red-50/60 dark:hover:bg-red-950/40"
              >
                {link.label}
              </a>
            ))}
            <Button
              onClick={() => { setMobileOpen(false); router.push('/login'); }}
              className="w-full mt-3 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm btn-glow"
            >
              Get Started
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
