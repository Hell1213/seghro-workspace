'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { StatsSection } from '@/components/landing/StatsSection';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { NewsletterSection } from '@/components/landing/NewsletterSection';
import { IntegrationSection } from '@/components/landing/IntegrationSection';
import { CtaSection } from '@/components/landing/CtaSection';
import { Footer } from '@/components/landing/Footer';
import { DocsSection } from '@/components/landing/DocsSection';
import { CommandPalette, useCommandPalette } from '@/components/ui/CommandPalette';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { BackToTop } from '@/components/ui/BackToTop';
import DashboardTour from '@/components/ui/DashboardTour';
import { useAppStore } from '@/lib/store';

export default function Home() {
  const { open, close, toggle } = useCommandPalette();
  const setSelectedAgent = useAppStore((s) => s.setSelectedAgent);

  const handleSelectAgent = useCallback(
    (agentId: string) => {
      setSelectedAgent(agentId);
    },
    [setSelectedAgent]
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ScrollProgress />
      <Navbar onSearchClick={toggle} />

      <main className="flex-1">
        <HeroSection />

        <div className="section-divider max-w-7xl mx-auto" />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <FeaturesSection />
        </motion.div>

        <div className="section-divider max-w-7xl mx-auto" />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <HowItWorks />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <StatsSection />
        </motion.div>

        <div className="section-divider max-w-7xl mx-auto" />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <DashboardSection />
        </motion.div>

        <div className="section-divider max-w-7xl mx-auto" />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <DocsSection />
        </motion.div>

        <div className="section-divider max-w-7xl mx-auto" />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <TestimonialsSection />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <NewsletterSection />
        </motion.div>

        <div className="section-divider max-w-7xl mx-auto" />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <IntegrationSection />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <CtaSection />
        </motion.div>
      </main>

      <Footer />

      <BackToTop />
      <DashboardTour />

      <CommandPalette
        open={open}
        onClose={close}
        onSelectAgent={handleSelectAgent}
      />
    </div>
  );
}
