'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Activity, Clock, Users, Zap } from 'lucide-react';

interface StatItem {
  icon: typeof Activity;
  value: number;
  suffix: string;
  prefix: string;
  label: string;
  decimals: number;
}

const stats: StatItem[] = [
  {
    icon: Activity,
    value: 10,
    suffix: 'M+',
    prefix: '',
    label: 'Traces Analyzed',
    decimals: 0,
  },
  {
    icon: Clock,
    value: 99.9,
    suffix: '%',
    prefix: '',
    label: 'Uptime',
    decimals: 1,
  },
  {
    icon: Users,
    value: 500,
    suffix: '+',
    prefix: '',
    label: 'Teams',
    decimals: 0,
  },
  {
    icon: Zap,
    value: 50,
    suffix: 'ms',
    prefix: '<',
    label: 'Latency',
    decimals: 0,
  },
];

function AnimatedNumber({ value, decimals, isInView }: { value: number; decimals: number; isInView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 2000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = eased * value;
      setCount(start);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value]);

  return <span>{count.toFixed(decimals)}</span>;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="relative py-24 sm:py-32 bg-gray-950 overflow-hidden">
      {/* Red glow accents */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#dc2626]/10 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#dc2626]/8 rounded-full blur-[100px]" />

      <div ref={ref} className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Trusted at{' '}
            <span className="text-[#dc2626]">scale</span>
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Numbers that reflect the reliability teams depend on every day.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="relative group rounded-2xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm p-6 text-center hover:border-[#dc2626]/30 transition-all duration-300"
            >
              {/* Red accent top bar */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-[#dc2626] rounded-full group-hover:w-3/4 transition-all duration-500" />

              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#dc2626]/10 mb-4">
                <stat.icon className="h-5 w-5 text-[#dc2626]" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                {stat.prefix}
                <AnimatedNumber value={stat.value} decimals={stat.decimals} isInView={isInView} />
                {stat.suffix}
              </div>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
