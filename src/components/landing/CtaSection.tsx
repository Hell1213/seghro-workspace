'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CtaSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="cta" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Animated red gradient mesh background */}
      <div className="absolute inset-0 bg-white dark:bg-gray-950" />
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-[#dc2626]/8 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#dc2626]/5 rounded-full blur-[120px] animate-pulse [animation-delay:1s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-100/50 dark:bg-red-950/30 rounded-full blur-[100px] animate-pulse [animation-delay:2s]" />

      <div ref={ref} className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-6">
            Start monitoring your{'\u00A0'}
            <span className="text-gradient">agents today</span>
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-10">
            Free for up to 3 agents. No credit card required.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="bg-[#dc2626] hover:bg-[#b91c1c] text-white font-semibold px-8 h-12 text-base rounded-xl shadow-lg shadow-red-200/50 dark:shadow-red-900/30 hover:shadow-red-300/60 dark:hover:shadow-red-900/50 transition-all btn-glow"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 font-semibold px-8 h-12 text-base rounded-xl transition-all"
            >
              Book a Demo
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
