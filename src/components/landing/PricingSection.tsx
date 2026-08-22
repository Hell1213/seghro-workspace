'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PricingTier {
  name: string;
  price: string;
  subtitle: string;
  description?: string;
  features: string[];
  buttonLabel: string;
  buttonVariant: 'default' | 'outline';
  highlighted: boolean;
  badge?: string;
}

const tiers: PricingTier[] = [
  {
    name: 'Starter',
    price: '$0',
    subtitle: '/month',
    features: [
      'Up to 3 agents',
      '1,000 traces/month',
      '7-day data retention',
      'Community support',
      'Basic issue detection',
    ],
    buttonLabel: 'Get Started Free',
    buttonVariant: 'outline',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$49',
    subtitle: '/month',
    description: 'Everything in Starter, plus:',
    features: [
      'Up to 25 agents',
      '100,000 traces/month',
      '30-day data retention',
      'Priority support',
      'Self-Healing API control',
      'Custom alert rules',
      'API health monitoring',
      'CSV & PDF export',
    ],
    buttonLabel: 'Start Free Trial',
    buttonVariant: 'default',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    subtitle: 'Contact Sales',
    description: 'Everything in Pro, plus:',
    features: [
      'Unlimited agents',
      'Unlimited traces',
      '90-day data retention',
      'Dedicated support',
      'Self-Healing API control',
      'Custom integrations',
      'SLA guarantee (99.99%)',
      'On-premise deployment option',
      'SOC 2 compliance',
    ],
    buttonLabel: 'Contact Sales',
    buttonVariant: 'outline',
    highlighted: false,
  },
];

export function PricingSection() {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="pricing" className="relative py-24 sm:py-32 dark:bg-gray-900/50">
      <div className="absolute inset-0 bg-dot-pattern opacity-40" />
      {/* Subtle gradient mesh */}
      <div className="absolute top-1/4 right-0 w-1/2 h-1/2 bg-red-500/[0.02] blur-[100px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gray-500/[0.03] blur-[80px] rounded-full" />

      <div ref={ref} className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge
            variant="outline"
            className="mb-4 border-[#dc2626]/20 text-[#dc2626] dark:text-red-400 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20"
          >
            Pricing
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Simple, transparent{'\u00A0'}
            <span className="text-gradient">pricing</span>
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-300 max-w-2xl mx-auto">
            Start free and scale as your AI operations grow. No hidden fees, no surprises.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`glass-card card-lift rounded-2xl p-6 sm:p-8 ${
                tier.highlighted
                  ? 'border-2 border-[#dc2626]/20 ring-1 ring-[#dc2626]/10 relative -mt-4 gradient-border-card'
                  : ''
              }`}
            >
              {/* Most Popular badge */}
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-flex items-center rounded-full bg-[#dc2626] px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    {tier.badge}
                  </span>
                </div>
              )}

              {/* Plan name */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {tier.name}
              </h3>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-1">
                <span className={`text-4xl font-bold tracking-tight ${
                  tier.highlighted
                    ? 'text-[#dc2626]'
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {tier.price}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {tier.subtitle}
                </span>
              </div>

              {tier.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  {tier.description}
                </p>
              )}

              {/* Divider */}
              <div className="h-px bg-gray-100 dark:bg-gray-800 my-6" />

              {/* Features list */}
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              <Button
                variant={tier.buttonVariant}
                onClick={() => {
                  if (tier.buttonLabel === 'Contact Sales') {
                    toast.info('Sales inquiry sent! Our team will reach out within 24 hours.', { description: 'sales@sentinel.dev' });
                    return;
                  }
                  router.push('/register');
                }}
                className={`w-full font-semibold ${
                  tier.buttonVariant === 'default'
                    ? 'bg-[#dc2626] hover:bg-[#b91c1c] text-white shadow-lg shadow-red-200/50 dark:shadow-red-900/30 hover:shadow-red-300/60 dark:hover:shadow-red-900/50 btn-glow'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {tier.buttonLabel}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          All plans include SSL encryption, 99.9% uptime SLA, and unlimited team members.
        </motion.p>
      </div>
    </section>
  );
}
