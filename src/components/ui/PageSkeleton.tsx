'use client';

import { motion, AnimatePresence } from 'framer-motion';

export function PageSkeleton({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen flex flex-col bg-white dark:bg-[#0a0a0a] transition-opacity duration-700"
        >
          {/* Top bar — mimics Navbar height */}
          <div className="h-16 w-full bg-gray-100 dark:bg-gray-900 animate-pulse" />

          {/* Center content area */}
          <div className="flex-1 flex flex-col gap-12 max-w-5xl mx-auto w-full px-4 py-16">
            {/* Hero block — heading + subtitle */}
            <div className="flex flex-col gap-4 h-48 justify-center">
              <div className="w-1/2 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
              <div className="w-[70%] h-6 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            </div>

            {/* Features block — 3 cards side by side */}
            <div className="h-24 flex gap-4">
              <div className="flex-1 h-full rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
              <div className="flex-1 h-full rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
              <div className="flex-1 h-full rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            </div>

            {/* Dashboard placeholder — large block with animated border */}
            <div className="h-64 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse animated-border" />
          </div>

          {/* Bottom footer */}
          <div className="h-12 w-full bg-gray-100 dark:bg-gray-900 animate-pulse" />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
