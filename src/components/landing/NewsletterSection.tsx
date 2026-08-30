'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function NewsletterSection() {
  const [email, setEmail] = useState('');

  const handleSubscribe = () => {
    if (!email.trim()) return;
    toast.success('Subscribed!');
    setEmail('');
  };

  return (
    <section id="newsletter" className="relative py-20 sm:py-24 bg-background dark:bg-[#0a0a0a] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="relative rounded-2xl border border-red-100 dark:border-red-900/30 bg-gradient-to-br from-background via-background to-red-50/50 dark:from-[#141414] dark:via-[#141414] dark:to-red-950/20 p-8 sm:p-12 lg:p-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: 'easeOut' as const }}
        >
          <div className="mx-auto max-w-2xl text-center">
            <motion.div
              className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/50"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <Mail className="h-5 w-5 text-[#dc2626]" />
            </motion.div>

            <motion.h2
              className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              Seghro Weekly
            </motion.h2>

            <motion.p
              className="mt-2 text-sm font-medium text-[#dc2626]"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              The Friday briefing on AI agent reliability.
            </motion.p>

            <motion.p
              className="mt-4 text-base text-gray-500 dark:text-gray-400 leading-relaxed"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              A curated weekly digest of production incidents, reliability patterns,
              and best practices for building trustworthy AI systems.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-col sm:flex-row gap-3"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                className="h-11 flex-1 rounded-lg border-red-200 dark:border-red-800/50 bg-background dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-[#dc2626] focus-visible:border-[#dc2626]"
              />
              <Button
                onClick={handleSubscribe}
                className="h-11 px-6 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-medium rounded-lg shadow-md shadow-red-200 dark:shadow-red-900/30 hover:shadow-red-300 dark:hover:shadow-red-900/50 transition-all"
              >
                Subscribe
              </Button>
            </motion.div>

            <motion.p
              className="mt-3 text-xs text-gray-400 dark:text-gray-400"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              No spam. Unsubscribe anytime.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
