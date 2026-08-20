'use client';

import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';
import { Shield, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 40);
  });

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Dashboard', href: '#dashboard' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Integrations', href: '#integrations' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/92 shadow-sm shadow-gray-200/50 border-b border-gray-100/50'
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#dc2626]">
              <Shield className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">
              Sentinel
            </span>
          </motion.div>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-[#dc2626] rounded-lg hover:bg-red-50/60"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" className="text-sm text-gray-600 hover:text-[#dc2626]">
              Documentation
            </Button>
            <Button className="bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm px-5 shadow-md shadow-red-200 hover:shadow-red-300 transition-all">
              Get Started
            </Button>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-b border-gray-100 px-4 pb-4"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-[#dc2626] rounded-lg hover:bg-red-50/60"
            >
              {link.label}
            </a>
          ))}
          <Button className="w-full mt-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm">
            Get Started
          </Button>
        </motion.div>
      )}
    </nav>
  );
}
