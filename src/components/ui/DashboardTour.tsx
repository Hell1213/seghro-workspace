'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass } from 'lucide-react';

type TourPosition = 'top' | 'bottom' | 'left' | 'right';

interface TourStep {
  target: string;
  title: string;
  description: string;
  position: TourPosition;
}

const TOUR_STEPS: TourStep[] = [
  {
    target: "[data-tour='metrics']",
    title: 'Key Metrics',
    description:
      'Monitor agent health, trace volume, error rates, and token usage at a glance.',
    position: 'bottom',
  },
  {
    target: "[data-tour='agents']",
    title: 'Agent Grid',
    description:
      'Click any agent card to see detailed performance, recent traces, and health history.',
    position: 'right',
  },
  {
    target: "[data-tour='charts']",
    title: 'Analytics Charts',
    description:
      'Track error rates, latency, and token usage trends over the last 24 hours.',
    position: 'top',
  },
  {
    target: "[data-tour='mcp']",
    title: 'MCP Fix Workflow',
    description:
      'Automatically diagnose and fix common agent issues using Model Context Protocol.',
    position: 'left',
  },
  {
    target: "[data-tour='tabs']",
    title: 'Dashboard Tabs',
    description:
      'Switch between Overview, Traces, Issues, and Alerts to explore different aspects.',
    position: 'bottom',
  },
];

interface TooltipCoords {
  x: number;
  y: number;
  arrowSide: TourPosition;
}

const TOOLTIP_OFFSET = 16;
const TOOLTIP_MAX_W = 320;

function calcTooltipPosition(
  rect: DOMRect,
  position: TourPosition
): TooltipCoords {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let x = 0;
  let y = 0;
  let arrowSide = position;

  switch (position) {
    case 'top': {
      x = rect.left + rect.width / 2;
      y = rect.top - TOOLTIP_OFFSET;
      break;
    }
    case 'bottom': {
      x = rect.left + rect.width / 2;
      y = rect.bottom + TOOLTIP_OFFSET;
      break;
    }
    case 'left': {
      x = rect.left - TOOLTIP_OFFSET;
      y = rect.top + rect.height / 2;
      break;
    }
    case 'right': {
      x = rect.right + TOOLTIP_OFFSET;
      y = rect.top + rect.height / 2;
      break;
    }
  }

  // Clamp within viewport (approximate — tooltip max-width is 320px)
  const halfW = TOOLTIP_MAX_W / 2;
  if (x - halfW < 8) {
    x = halfW + 8;
  }
  if (x + halfW > vw - 8) {
    x = vw - halfW - 8;
  }
  if (y < 8) {
    // Flip to bottom if too high
    y = rect.bottom + TOOLTIP_OFFSET;
    arrowSide = 'bottom';
  }
  if (y + 120 > vh - 8) {
    // Flip to top if too low
    y = rect.top - TOOLTIP_OFFSET;
    arrowSide = 'top';
  }

  return { x, y, arrowSide };
}

const arrowStyles: Record<
  TourPosition,
  { transform: string; top?: string; bottom?: string; left?: string; right?: string }
> = {
  top: {
    transform: 'translateX(-50%)',
    bottom: '-6px',
    left: '50%',
  },
  bottom: {
    transform: 'translateX(-50%)',
    top: '-6px',
    left: '50%',
  },
  left: {
    transform: 'translateY(-50%)',
    right: '-6px',
    top: '50%',
  },
  right: {
    transform: 'translateY(-50%)',
    left: '-6px',
    top: '50%',
  },
};

export default function DashboardTour() {
  const [isVisible, setIsVisible] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!sessionStorage.getItem('sentinel-tour-done');
    }
    return false;
  });
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPos, setTooltipPos] = useState<TooltipCoords | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const stepIndexRef = useRef(0);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizeHandlerRef = useRef<() => void>(() => {});

  // ── IntersectionObserver: show button when #dashboard is visible ──
  useEffect(() => {
    const dashboardEl = document.getElementById('dashboard');
    if (!dashboardEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(dashboardEl);
    return () => observer.disconnect();
  }, []);

  // ── Tour controls (declared early for dependency) ──
  const finishTour = useCallback(() => {
    setIsActive(false);
    setTooltipPos(null);
    setTargetRect(null);
    setTourCompleted(true);
    sessionStorage.setItem('sentinel-tour-done', '1');
  }, []);

  const startTour = useCallback(() => {
    stepIndexRef.current = 0;
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const updatePositionRef = useRef<() => void>(() => {});

  // ── Position calculation for current step ──
  const updatePosition = useCallback(() => {
    const step = TOUR_STEPS[stepIndexRef.current];
    if (!step) return;

    const el = document.querySelector(step.target);
    if (!el) {
      // Target not found — skip to next
      if (stepIndexRef.current < TOUR_STEPS.length - 1) {
        stepIndexRef.current += 1;
        setCurrentStep(stepIndexRef.current);
        requestAnimationFrame(() => updatePositionRef.current());
      } else {
        finishTour();
      }
      return;
    }

    const rect = el.getBoundingClientRect();
    setTargetRect(rect);
    const pos = calcTooltipPosition(rect, step.position);
    setTooltipPos(pos);
  }, [finishTour]);

  useEffect(() => {
    updatePositionRef.current = updatePosition;
  });

  // ── When step changes, scroll & position ──
  useEffect(() => {
    if (!isActive) return;

    const step = TOUR_STEPS[currentStep];
    if (!step) return;

    const el = document.querySelector(step.target);
    if (!el) {
      // Skip step if target not found
      if (currentStep < TOUR_STEPS.length - 1) {
        stepIndexRef.current = currentStep + 1;
        setCurrentStep(stepIndexRef.current);
      } else {
        finishTour();
      }
      return;
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Wait for scroll to settle before positioning
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      updatePosition();
    }, 350);

    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [isActive, currentStep, updatePosition, finishTour]);

  // ── Window resize handler ──
  useEffect(() => {
    if (!isActive) return;

    resizeHandlerRef.current = () => {
      updatePosition();
    };
    window.addEventListener('resize', resizeHandlerRef.current);
    return () => window.removeEventListener('resize', resizeHandlerRef.current);
  }, [isActive, updatePosition]);

  const nextStep = useCallback(() => {
    if (stepIndexRef.current < TOUR_STEPS.length - 1) {
      stepIndexRef.current += 1;
      setCurrentStep(stepIndexRef.current);
    } else {
      finishTour();
    }
  }, [finishTour]);

  const prevStep = useCallback(() => {
    if (stepIndexRef.current > 0) {
      stepIndexRef.current -= 1;
      setCurrentStep(stepIndexRef.current);
    }
  }, []);

  const isLast = currentStep === TOUR_STEPS.length - 1;
  const isFirst = currentStep === 0;
  const step = TOUR_STEPS[currentStep];

  return (
    <>
      {/* ── Floating "Take Tour" button ── */}
      <AnimatePresence>
        {!isActive && isVisible && !tourCompleted && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={startTour}
            className="fixed bottom-20 left-4 z-50 h-9 px-3.5 rounded-full bg-[#dc2626] text-white text-xs font-medium shadow-lg shadow-red-200 dark:shadow-red-950/50 hover:bg-[#b91c1c] transition-colors inline-flex items-center gap-1.5"
          >
            <Compass className="h-3.5 w-3.5" />
            Take Tour
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Active tour overlay + highlight + tooltip ── */}
      <AnimatePresence>
        {isActive && targetRect && (
          <>
            {/* Overlay: transparent target-sized element with massive box-shadow for cutout */}
            <motion.div
              key={`overlay-${currentStep}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed z-[60] pointer-events-none"
              style={{
                top: targetRect.top,
                left: targetRect.left,
                width: targetRect.width,
                height: targetRect.height,
                borderRadius: 12,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.3)',
                outline: '3px solid #dc2626',
                outlineOffset: '4px',
              }}
            />

            {/* Tooltip */}
            {tooltipPos && step && (
              <motion.div
                key={`tooltip-${currentStep}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="fixed z-[70] pointer-events-auto"
                style={{
                  left: tooltipPos.x,
                  top: tooltipPos.y,
                  translate:
                    tooltipPos.arrowSide === 'top' ||
                    tooltipPos.arrowSide === 'bottom'
                      ? '-50% 0'
                      : tooltipPos.arrowSide === 'left'
                        ? '0 -50%'
                        : '0 -50%',
                }}
              >
                {/* Arrow / caret */}
                <div
                  className="absolute w-3 h-3 bg-white dark:bg-gray-900 rotate-45 z-10"
                  style={arrowStyles[tooltipPos.arrowSide]}
                />

                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-w-xs relative">
                  {/* Title */}
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {step.title}
                  </p>

                  {/* Description */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {step.description}
                  </p>

                  {/* Step counter */}
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2.5 mb-2">
                    {currentStep + 1}/{TOUR_STEPS.length}
                  </p>

                  {/* Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {!isFirst && (
                        <button
                          onClick={prevStep}
                          className="h-7 px-2.5 rounded-md text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          Prev
                        </button>
                      )}
                      <button
                        onClick={isLast ? finishTour : nextStep}
                        className="h-7 px-3 rounded-md text-xs font-medium bg-[#dc2626] text-white hover:bg-[#b91c1c] transition-colors"
                      >
                        {isLast ? 'Finish' : 'Next'}
                      </button>
                    </div>
                    <button
                      onClick={finishTour}
                      className="h-7 px-2.5 rounded-md text-xs font-medium text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </>
  );
}
