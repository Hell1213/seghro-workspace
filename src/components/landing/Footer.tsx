'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Github,
  Twitter,
  Star,
  Users,
  Activity,
  Linkedin,
  Youtube,
  Send,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const footerLinks: Record<string, { label: string; href?: string }[]> = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Integrations', href: '#integrations' },
    { label: 'Changelog', href: '#changelog' },
    { label: 'Docs', href: '#docs' },
  ],
  Company: [
    { label: 'About' },
    { label: 'Blog' },
    { label: 'Careers' },
    { label: 'Contact' },
  ],
  Resources: [
    { label: 'Documentation', href: '#docs' },
    { label: 'API Reference' },
    { label: 'Changelog', href: '#changelog' },
    { label: 'Status', href: '#status' },
    { label: 'Weekly' },
  ],
  Legal: [
    { label: 'Privacy' },
    { label: 'Terms' },
    { label: 'Security' },
    { label: 'Trust Center' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: DiscordIcon, href: '#', label: 'Discord' },
];

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
    </svg>
  );
}

const footerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    toast.success('Subscribed! You will receive our weekly AI observability digest.');
    setEmail('');
  };

  return (
    <motion.footer
      className="relative border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden"
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      {/* Gradient mesh overlay */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#dc2626]/[0.03] blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-gray-400/[0.04] dark:bg-gray-600/[0.04] blur-3xl" />
      </div>

      {/* Noise texture */}
      <div className="pointer-events-none bg-noise absolute inset-0" />

      {/* Top accent bar */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-[#dc2626]/50 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Live System Status Indicator */}
        <motion.div variants={itemVariants} className="flex justify-center pb-5">
        <div className="badge-pulse inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 dark:border-emerald-800/50 dark:bg-emerald-950/40 px-4 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
            All Systems Operational
          </span>
        </div>
      </motion.div>

        {/* Social proof row */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pb-6 border-b border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Star className="h-4 w-4 text-amber-500" />
            <span>4.9/5 on Product Hunt</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Github className="h-4 w-4" />
            <span>10K+ GitHub Stars</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Users className="h-4 w-4" />
            <span>2,000+ Teams</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Activity className="h-4 w-4 text-emerald-500" />
            <span>99.9% Uptime</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pt-8">
          {/* Brand + Social Links + Newsletter */}
          <motion.div variants={itemVariants} className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#dc2626]">
                <Shield className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Sentinel
              </span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 mb-3">
              Production-grade AI agent observability
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed mb-5">
              Production monitoring for AI agents. Catch silent failures before your users do.
            </p>

            {/* Social links row */}
            <div className="flex items-center gap-1.5 mb-5">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 dark:text-gray-500 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-[#dc2626] dark:hover:text-red-400 hover:scale-110 hover:-translate-y-0.5"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            {/* Inline Newsletter Input */}
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Subscribe to our newsletter
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                className="h-8 text-xs bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus-visible:ring-[#dc2626]/30 focus-visible:border-[#dc2626]/50 rounded-lg"
                aria-label="Email address"
              />
              <Button
                size="sm"
                onClick={handleSubscribe}
                className="btn-glow h-8 px-3 bg-[#dc2626] hover:bg-red-700 text-white text-xs font-medium rounded-lg shrink-0"
              >
                <Send className="h-3.5 w-3.5 mr-1" />
                Subscribe
              </Button>
            </div>
          </motion.div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <motion.div key={title} variants={itemVariants}>
              <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href || '#'}
                      className="text-xs text-gray-400 dark:text-gray-500 hover:text-[#dc2626] dark:hover:text-red-400 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Copyright row */}
        <motion.div
          variants={itemVariants}
          className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-xs text-gray-400 dark:text-gray-500">
            &copy; 2025 Sentinel{' '}
            <span className="inline-block h-1 w-1 rounded-full bg-[#dc2626] mx-1.5 align-middle" />
            Built with &hearts; for AI reliability
          </p>
          <p className="text-xs text-gray-300 dark:text-gray-700">
            Inspired by the observability challenges of production AI systems.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
}
