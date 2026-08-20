'use client';

import { motion, useInView, useMotionValue, useSpring, type MotionValue } from 'framer-motion';
import { useRef, useCallback, type MouseEvent, type ReactNode } from 'react';
import { Search, Bell, Wrench, BarChart3, Eye, GitBranch } from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'Surface Silent Failures',
    description:
      'Audit every trace against your agent\'s instructions. Group recurring failures into actionable issues — even ones that return success codes.',
    color: 'bg-red-50 dark:bg-red-950/40 text-[#dc2626] dark:text-red-400 border-red-100 dark:border-red-900/50',
    iconColor: 'text-[#dc2626] dark:text-red-400',
    live: false,
  },
  {
    icon: Bell,
    title: 'Live Alerts',
    description:
      'Get notified on what matters. Sentinel triages issues by severity and alerts you in Slack, PagerDuty, or webhooks — no noise.',
    color: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700',
    iconColor: 'text-gray-600 dark:text-gray-400',
    live: true,
  },
  {
    icon: Wrench,
    title: 'MCP Fix Integration',
    description:
      'Pull context directly into your coding agent via MCP. Resolve issues without context-switching between tools.',
    color: 'bg-red-50 dark:bg-red-950/40 text-[#dc2626] dark:text-red-400 border-red-100 dark:border-red-900/50',
    iconColor: 'text-[#dc2626] dark:text-red-400',
    live: false,
  },
  {
    icon: BarChart3,
    title: 'Online Evals',
    description:
      'After deploying a fix, Sentinel creates an online eval. If a regression occurs, you\'ll know immediately.',
    color: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700',
    iconColor: 'text-gray-600 dark:text-gray-400',
    live: false,
  },
  {
    icon: Eye,
    title: 'Full Trace Visibility',
    description:
      'See every span, token, tool call, and model invocation. Understand exactly what your agent did and why.',
    color: 'bg-red-50 dark:bg-red-950/40 text-[#dc2626] dark:text-red-400 border-red-100 dark:border-red-900/50',
    iconColor: 'text-[#dc2626] dark:text-red-400',
    live: false,
  },
  {
    icon: GitBranch,
    title: 'Framework Agnostic',
    description:
      'Native support for LangChain, CrewAI, AutoGen, LlamaIndex, and custom frameworks. Drop-in integration.',
    color: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700',
    iconColor: 'text-gray-600 dark:text-gray-400',
    live: false,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ------------------------------------------------------------------ */
/*  Feature Card  –  magnetic tilt + glow + accent + number indicator  */
/* ------------------------------------------------------------------ */

const MAX_TILT = 3; // degrees
const SPRING_CONFIG = { stiffness: 300, damping: 30, mass: 0.5 };
const GLOW_SIZE = 150;

interface FeatureCardProps {
  feature: (typeof features)[number];
  index: number;
  children: ReactNode;
}

function FeatureCard({ feature, index, children }: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion values for the 3D tilt
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  // Spring-smoothed versions
  const smoothRotateX = useSpring(rotateX, SPRING_CONFIG);
  const smoothRotateY = useSpring(rotateY, SPRING_CONFIG);

  // Glow position (raw pixel offset from top-left of card)
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);
  const smoothGlowX = useSpring(glowX, { stiffness: 400, damping: 35, mass: 0.3 });
  const smoothGlowY = useSpring(glowY, { stiffness: 400, damping: 35, mass: 0.3 });

  // Accent line width factor (0 → 1) based on cursor X proximity to center
  const accentWidthFactor = useMotionValue(0);
  const smoothAccentWidth = useSpring(accentWidthFactor, { stiffness: 250, damping: 28, mass: 0.4 });

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Normalize to -1…+1 then scale to max tilt
      const normX = (x - centerX) / centerX;
      const normY = (y - centerY) / centerY;

      rotateY.set(normX * MAX_TILT);
      rotateX.set(-normY * MAX_TILT);

      // Glow follows cursor
      glowX.set(x - GLOW_SIZE / 2);
      glowY.set(y - GLOW_SIZE / 2);

      // Accent width: wider when cursor is near horizontal center
      const distFromCenter = Math.abs(normX);
      const widthFactor = 1 - distFromCenter; // 1 at center, 0 at edges
      accentWidthFactor.set(widthFactor);
    },
    [rotateX, rotateY, glowX, glowY, accentWidthFactor],
  );

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    accentWidthFactor.set(0);
  }, [rotateX, rotateY, accentWidthFactor]);

  const cardNumber = String(index + 1).padStart(2, '0');

  return (
    <motion.div
      ref={cardRef}
      variants={itemVariants}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 800,
        rotateX: smoothRotateX,
        rotateY: smoothRotateY,
        transformStyle: 'preserve-3d',
      }}
      className="group relative rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 card-lift overflow-hidden cursor-default"
    >
      {/* Card number indicator */}
      <span className="pointer-events-none absolute top-3 right-4 select-none text-6xl font-black text-gray-900/[0.03] dark:text-white/[0.03] leading-none">
        {cardNumber}
      </span>

      {/* Glow that follows cursor */}
      <motion.div
        className="pointer-events-none absolute z-0 rounded-full"
        style={{
          width: GLOW_SIZE,
          height: GLOW_SIZE,
          x: smoothGlowX,
          y: smoothGlowY,
          background:
            'radial-gradient(circle, rgba(220,38,38,0.15) 0%, rgba(220,38,38,0.05) 40%, transparent 70%)',
        }}
        aria-hidden
      />

      {/* Card content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Enhanced bottom accent line */}
      <motion.div
        className="absolute bottom-0 left-6 h-0.5 bg-gradient-to-r from-[#dc2626] to-transparent rounded-full origin-left"
        style={{
          scaleX: smoothAccentWidth,
        }}
        aria-hidden
      />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Features Section                                                   */
/* ------------------------------------------------------------------ */

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="features" className="relative py-24 sm:py-32 dark:bg-gray-900/50">
      <div className="absolute inset-0 bg-dot-pattern opacity-40" />
      {/* Subtle gradient mesh */}
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-red-500/[0.02] blur-[100px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gray-500/[0.03] blur-[80px] rounded-full" />
      <div ref={ref} className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Everything you need to{'\u00A0'}
            <span className="text-gradient">ship reliable agents</span>
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            From detection to resolution — a complete observability stack built
            for the unique challenges of production AI systems.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((feature, idx) => (
            <FeatureCard key={feature.title} feature={feature} index={idx}>
              {/* Icon with micro-animation */}
              <motion.div
                whileHover={{ scale: [1, 1.15, 1.05] }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${feature.color} mb-4`}
              >
                <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
              </motion.div>

              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                {feature.title}
                {'live' in feature && feature.live && (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </FeatureCard>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
