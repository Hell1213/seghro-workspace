'use client';

import { useCallback } from 'react';
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

// Lazy load below-fold sections for performance — no motion wrappers needed,
// each section handles its own entrance animation via useInView internally.
const HowItWorks = dynamic(
  () => import('@/components/landing/HowItWorks').then(m => ({ default: m.HowItWorks })),
  { ssr: false }
);
const StatsSection = dynamic(
  () => import('@/components/landing/StatsSection').then(m => ({ default: m.StatsSection })),
  { ssr: false }
);
const DashboardSection = dynamic(
  () => import('@/components/dashboard/DashboardSection').then(m => ({ default: m.DashboardSection })),
  { ssr: false }
);
const TestimonialsSection = dynamic(
  () => import('@/components/landing/TestimonialsSection').then(m => ({ default: m.TestimonialsSection })),
  { ssr: false }
);
const DocsSection = dynamic(
  () => import('@/components/landing/DocsSection').then(m => ({ default: m.DocsSection })),
  { ssr: false }
);
const PricingSection = dynamic(
  () => import('@/components/landing/PricingSection').then(m => ({ default: m.PricingSection })),
  { ssr: false }
);
const NewsletterSection = dynamic(
  () => import('@/components/landing/NewsletterSection').then(m => ({ default: m.NewsletterSection })),
  { ssr: false }
);
const IntegrationSection = dynamic(
  () => import('@/components/landing/IntegrationSection').then(m => ({ default: m.IntegrationSection })),
  { ssr: false }
);
const CtaSection = dynamic(
  () => import('@/components/landing/CtaSection').then(m => ({ default: m.CtaSection })),
  { ssr: false }
);
const ChangelogSection = dynamic(
  () => import('@/components/landing/ChangelogSection').then(m => ({ default: m.ChangelogSection })),
  { ssr: false }
);
const StatusSection = dynamic(
  () => import('@/components/landing/StatusSection').then(m => ({ default: m.StatusSection })),
  { ssr: false }
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
    <div className="min-h-screen flex flex-col bg-background">
      <ScrollProgress />
      <Navbar onSearchClick={toggle} />

      <main className="flex-1">
        <HeroSection />

        <div className="section-divider max-w-7xl mx-auto" />
        <FeaturesSection />

        <div className="section-divider max-w-7xl mx-auto" />
        <HowItWorks />

        <StatsSection />

        <div className="section-divider max-w-7xl mx-auto" />
        <DashboardSection />

        <div className="section-divider max-w-7xl mx-auto" />
        <DocsSection />

        <div className="section-divider max-w-7xl mx-auto" />
        <TestimonialsSection />

        <div className="section-divider max-w-7xl mx-auto" />
        <PricingSection />

        <NewsletterSection />

        <div className="section-divider max-w-7xl mx-auto" />
        <IntegrationSection />

        <div className="section-divider max-w-7xl mx-auto" />
        <ChangelogSection />

        <div className="section-divider max-w-7xl mx-auto" />
        <StatusSection />

        <CtaSection />
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
