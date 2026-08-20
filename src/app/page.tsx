'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { CommandPalette, useCommandPalette } from '@/components/ui/CommandPalette';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { BackToTop } from '@/components/ui/BackToTop';
import DashboardTour from '@/components/ui/DashboardTour';
import { Footer } from '@/components/landing/Footer';
import { useAppStore } from '@/lib/store';

const HowItWorks = dynamic(
  () => import('@/components/landing/HowItWorks').then(m => ({ default: m.HowItWorks })),
  { loading: () => <div className="h-96" />, ssr: false }
);
const StatsSection = dynamic(
  () => import('@/components/landing/StatsSection').then(m => ({ default: m.StatsSection })),
  { loading: () => <div className="h-96" />, ssr: false }
);
const DashboardSection = dynamic(
  () => import('@/components/dashboard/DashboardSection').then(m => ({ default: m.DashboardSection })),
  { loading: () => <div className="h-[600px]" />, ssr: false }
);
const TestimonialsSection = dynamic(
  () => import('@/components/landing/TestimonialsSection').then(m => ({ default: m.TestimonialsSection })),
  { loading: () => <div className="h-64" />, ssr: false }
);
const DocsSection = dynamic(
  () => import('@/components/landing/DocsSection').then(m => ({ default: m.DocsSection })),
  { loading: () => <div className="h-96" />, ssr: false }
);
const PricingSection = dynamic(
  () => import('@/components/landing/PricingSection').then(m => ({ default: m.PricingSection })),
  { loading: () => <div className="h-96" />, ssr: false }
);
const NewsletterSection = dynamic(
  () => import('@/components/landing/NewsletterSection').then(m => ({ default: m.NewsletterSection })),
  { loading: () => <div className="h-64" />, ssr: false }
);
const IntegrationSection = dynamic(
  () => import('@/components/landing/IntegrationSection').then(m => ({ default: m.IntegrationSection })),
  { loading: () => <div className="h-64" />, ssr: false }
);
const CtaSection = dynamic(
  () => import('@/components/landing/CtaSection').then(m => ({ default: m.CtaSection })),
  { loading: () => <div className="h-64" />, ssr: false }
);
const ChangelogSection = dynamic(
  () => import('@/components/landing/ChangelogSection').then(m => ({ default: m.ChangelogSection })),
  { loading: () => <div className="h-96" />, ssr: false }
);
const StatusSection = dynamic(
  () => import('@/components/landing/StatusSection').then(m => ({ default: m.StatusSection })),
  { loading: () => <div className="h-96" />, ssr: false }
);

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

        <div className="section-divider max-w-7xl mx-auto" />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <PricingSection />
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

        <div className="section-divider max-w-7xl mx-auto" />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <ChangelogSection />
        </motion.div>

        <div className="section-divider max-w-7xl mx-auto" />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <StatusSection />
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
