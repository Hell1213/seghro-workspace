'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState, useCallback } from 'react';
import { Quote } from 'lucide-react';

interface Testimonial {
  name: string;
  handle: string;
  initials: string;
  tweet: string;
  timestamp: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Sarah Chen',
    handle: '@sarachen_dev',
    initials: 'SC',
    tweet: 'Sentinel caught a silent failure in our LangChain agent that was returning wrong JSON to 12% of users. We had no idea until the trace audit surfaced it. Absolute game changer.',
    timestamp: '2 hours ago',
  },
  {
    name: 'Marcus Johnson',
    handle: '@marcusj_eng',
    initials: 'MJ',
    tweet: 'We went from ~40 minutes of debugging agent failures to under 5. The trace viewer alone is worth the price. Seeing every tool call laid out visually is incredible.',
    timestamp: '5 hours ago',
  },
  {
    name: 'Aiko Tanaka',
    handle: '@aiko_aiops',
    initials: 'AT',
    tweet: 'Finally, observability for AI agents that actually understands the domain. Sentinel doesn\'t just log traces — it audits them against your agent\'s instructions. Smart.',
    timestamp: '8 hours ago',
  },
  {
    name: 'David Park',
    handle: '@dpark_cto',
    initials: 'DP',
    tweet: 'MCP fix integration is the killer feature. Our agents can pull context from Sentinel and self-heal. Reduced our incident response time by 10x.',
    timestamp: '1 day ago',
  },
  {
    name: 'Elena Rodriguez',
    handle: '@elenar_ml',
    initials: 'ER',
    tweet: '99.9% uptime isn\'t just marketing — we\'ve been running Sentinel for 6 months and it\'s never missed a trace. The reliability of this platform is unmatched.',
    timestamp: '1 day ago',
  },
  {
    name: 'James Wright',
    handle: '@jwright_sre',
    initials: 'JW',
    tweet: 'Shipped our CrewAI agents to production 3x faster because we had Sentinel watching from day one. The online evals after fixes give us real confidence.',
    timestamp: '2 days ago',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [isPaused, setIsPaused] = useState(false);

  const startScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const speed = 0.5;

    function step() {
      if (!isPaused && el) {
        el.scrollLeft += speed;
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth) {
          el.scrollLeft = 0;
        }
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [isPaused]);

  useEffect(() => {
    startScroll();
  }, [startScroll]);

  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <section id="testimonials" className="relative py-24 sm:py-32 bg-gray-50">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Loved by{'00A0'}
            <span className="text-gradient">engineering teams</span>
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Hear from the teams shipping reliable AI agents in production.
          </p>
        </motion.div>
      </div>

      {/* Scrolling carousel */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="relative"
      >
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {duplicatedTestimonials.map((t, i) => (
            <motion.div
              key={`${t.handle}-${i}`}
              variants={itemVariants}
              className="flex-shrink-0 w-[340px] sm:w-[380px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md hover:shadow-red-100/20 transition-all duration-300"
            >
              <Quote className="h-5 w-5 text-gray-200 mb-3" />
              <p className="text-sm text-gray-600 leading-relaxed mb-5">
                {t.tweet}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dc2626] text-white text-xs font-bold">
                  {t.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.handle}</p>
                </div>
                <span className="text-xs text-gray-300 flex-shrink-0">{t.timestamp}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
