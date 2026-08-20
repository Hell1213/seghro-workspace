'use client';

import { motion, useScroll, useMotionValueEvent, useSpring } from 'framer-motion';
import { useState } from 'react';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    setVisible(latest > 0.01);
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 h-[3px] origin-left"
      style={{
        scaleX,
        boxShadow: visible
          ? '0 0 8px rgba(220, 38, 38, 0.5), 0 0 2px rgba(220, 38, 38, 0.3)'
          : 'none',
      }}
      animate={{
        opacity: visible ? 1 : 0,
      }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="h-full w-full"
        style={{
          background: 'linear-gradient(90deg, #dc2626 0%, #ef4444 50%, #dc2626 100%)',
        }}
      />
    </motion.div>
  );
}
