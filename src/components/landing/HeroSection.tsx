'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowDown, Activity, Zap, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ParticleCanvas from '@/components/ui/ParticleCanvas';
import { useState, useEffect } from 'react';

function TypingText({ text, delay = 0, speed = 30, className }: { text: string; delay?: number; speed?: number; className?: string }) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length < text.length) {
      const t = setTimeout(() => setDisplayed(text.slice(0, displayed.length + 1)), speed);
      return () => clearTimeout(t);
    }
  }, [started, displayed, text, speed]);

  return (
    <span className={className}>
      {displayed}
      {displayed.length < text.length && (
        <span className="inline-block w-[2px] h-[1em] bg-[#dc2626] ml-0.5 animate-blink align-middle" />
      )}
    </span>
  );
}

function AnimatedTrace() {
  const spans = [
    { label: 'input_guardrail', duration: 142, color: 'bg-emerald-400', width: '8%' },
    { label: 'retrieve_context', duration: 2100, color: 'bg-blue-400', width: '22%' },
    { label: 'model (gpt-4o)', duration: 3200, color: 'bg-[#dc2626]', width: '32%' },
    { label: 'tools', duration: 3400, color: 'bg-amber-400', width: '25%' },
    { label: 'speak_to_user', duration: 500, color: 'bg-gray-400', width: '13%' },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-950 p-6 shadow-2xl">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-green-500" />
        </div>
        <span className="text-xs font-mono text-gray-500">trace: 4e0c8418-c8a5</span>
      </div>

      {/* Trace title */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-sm font-mono text-gray-300">ai.agent.run</span>
        <span className="text-xs font-mono text-gray-600">12.4s · 18 spans</span>
      </div>

      {/* Spans */}
      <div className="space-y-3">
        {spans.map((span, i) => (
          <motion.div
            key={span.label}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.15, duration: 0.5, ease: 'easeOut' }}
            className="group"
          >
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[11px] font-mono text-gray-500 w-36 truncate">{span.label}</span>
              <span className="text-[11px] font-mono text-gray-600">{span.duration}ms</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${span.color}`}
                initial={{ width: 0 }}
                animate={{ width: span.width }}
                transition={{ delay: 0.5 + i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Error indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3"
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-mono text-red-400">ISSUE DETECTED</span>
        </div>
        <p className="mt-1 text-xs text-red-300/80 font-mono">
          Agent fabricated customer ID instead of asking for verification
        </p>
      </motion.div>

      {/* Decorative glow */}
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-red-500/10 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-gray-500/10 blur-3xl" />
    </div>
  );
}

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section id="hero" ref={ref} className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Particle network */}
      <ParticleCanvas />
      {/* Background grid + noise texture */}
      <div className="absolute inset-0 bg-grid-pattern dark:opacity-30" />
      <div className="absolute inset-0 bg-noise dark:opacity-30" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-red-500/5 blur-[120px]" />
      {/* Floating gradient orbs */}
      <div className="absolute top-20 right-[15%] w-72 h-72 rounded-full bg-red-500/[0.04] blur-[80px] animate-float" />
      <div className="absolute bottom-32 left-[10%] w-56 h-56 rounded-full bg-gray-400/[0.06] blur-[60px] animate-float [animation-delay:2s]" />

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full"
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-medium text-[#dc2626]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                Production Monitoring for AI Agents
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]"
            >
              <span className="text-gray-900 dark:text-gray-100">Stop guessing why </span>
              <span className="text-gradient">your agents fail</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl min-h-[3.5rem]"
            >
              <TypingText
                text="Surface silent failures, pull context across traces, and improve your agent before users churn. Real-time observability for production AI systems."
                delay={800}
                speed={18}
              />
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Button
                size="lg"
                className="bg-[#dc2626] hover:bg-[#b91c1c] text-white px-7 shadow-lg shadow-red-200 hover:shadow-red-300 transition-all hover:scale-[1.02] btn-glow"
              >
                <Activity className="mr-2 h-4 w-4 self-center" />
                View Live Dashboard
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 px-7"
              >
                Read the Docs
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-10 flex items-center gap-8 text-sm text-gray-400 dark:text-gray-500"
            >
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#dc2626]" />
                <span><strong className="text-gray-600 dark:text-gray-300">50ms</strong> trace latency</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#dc2626]" />
                <span><strong className="text-gray-600 dark:text-gray-300">SOC 2</strong> compliant</span>
              </div>
            </motion.div>
          </div>

          {/* Right visual - Animated trace */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <AnimatedTrace />
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <ArrowDown className="h-5 w-5 text-gray-300 dark:text-gray-600" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
