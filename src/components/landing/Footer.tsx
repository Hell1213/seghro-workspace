'use client';

import { motion } from 'framer-motion';
import { Shield, Github, Twitter } from 'lucide-react';

const footerLinks = {
  Product: ['Features', 'Pricing', 'Integrations', 'Changelog', 'Docs'],
  Company: ['About', 'Blog', 'Careers', 'Contact'],
  Resources: ['Documentation', 'API Reference', 'Status', 'Weekly'],
  Legal: ['Privacy', 'Terms', 'Security', 'Trust Center'],
};

export function Footer() {
  return (
    <footer className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#dc2626]">
                <Shield className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">Sentinel</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed mb-4">
              Production monitoring for AI agents. Catch silent failures before your users do.
            </p>
            <div className="flex items-center gap-2">
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
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
                  <li key={link}>
                    <a href="#" className="text-xs text-gray-400 dark:text-gray-500 hover:text-[#dc2626] dark:hover:text-red-400 transition-colors">
                      {link}
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
