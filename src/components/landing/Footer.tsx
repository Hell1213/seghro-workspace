'use client';

import { motion } from 'framer-motion';
import { Shield, Github, Twitter, Star, Users, Activity } from 'lucide-react';

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
    { label: 'Status' },
    { label: 'Weekly' },
  ],
  Legal: [
    { label: 'Privacy' },
    { label: 'Terms' },
    { label: 'Security' },
    { label: 'Trust Center' },
  ],
};

export function Footer() {
  return (
    <footer className="relative border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
      {/* Top accent bar */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#dc2626]/50 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Social proof row */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pb-6 border-b border-gray-100 dark:border-gray-800">
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
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pt-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#dc2626]">
                <Shield className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">Sentinel</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 mb-3">Production-grade AI agent observability</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed mb-4">
              Production monitoring for AI agents. Catch silent failures before your users do.
            </p>
            <div className="flex items-center gap-2">
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 dark:text-gray-500 hover:text-[#dc2626] dark:hover:text-red-400 transition-all duration-200 hover:-translate-y-0.5">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 dark:text-gray-500 hover:text-[#dc2626] dark:hover:text-red-400 transition-all duration-200 hover:-translate-y-0.5">
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href || '#'} className="text-xs text-gray-400 dark:text-gray-500 hover:text-[#dc2626] dark:hover:text-red-400 transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 dark:text-gray-500">© 2025 Sentinel. Built for AI agent reliability.</p>
          <p className="text-xs text-gray-300 dark:text-gray-700">Inspired by the observability challenges of production AI systems.</p>
        </div>
      </div>
    </footer>
  );
}
