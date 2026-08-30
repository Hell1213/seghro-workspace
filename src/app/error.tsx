'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RotateCcw, Home, ChevronDown, Copy, Check, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalErrorBoundary({ error, reset }: ErrorPageProps) {
  const [showStack, setShowStack] = useState(false)
  const [copied, setCopied] = useState(false)

  const isDev = process.env.NODE_ENV === 'development'

  useEffect(() => {
    console.error('[Seghro Error Boundary]', error)
  }, [error])

  async function handleCopyStack() {
    try {
      const text = 'Error: ' + error.message + '\n\nStack Trace:\n' + (error.stack || '')
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (_e) {
      // Fallback: no clipboard access
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 px-4 py-12 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[120px] bg-red-500/[0.04] dark:bg-red-500/[0.06]" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full blur-[100px] bg-gray-500/[0.03] dark:bg-gray-500/[0.06]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Branding */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/20">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Seghro</span>
          </div>
        </motion.div>

        {/* Error card */}
        <Card className="border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-xl shadow-red-900/[0.03] dark:shadow-red-900/[0.08]">
          <CardContent className="p-8">
            {/* Error icon with pulsing ring */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' as const, stiffness: 200, damping: 20 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-red-100 dark:bg-red-950/40 animate-pulse" />
                <div className="relative w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/50 flex items-center justify-center">
                  <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </motion.div>

            {/* Error title */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-center mb-4"
            >
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
                An unexpected error occurred. Our monitoring systems have been
                notified. You can try again or return to the dashboard.
              </p>
            </motion.div>

            {/* Error message box */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="mb-6"
            >
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-800/40">
                <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                    {error.message || 'An unknown error occurred'}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-red-600/70 dark:text-red-400/60 font-mono">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Dev-only: Stack trace */}
            {isDev && error.stack && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="mb-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                      Dev
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">Stack Trace</span>
                  </div>
                  <button
                    onClick={() => setShowStack(!showStack)}
                    className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    {showStack ? 'Hide' : 'Show'}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showStack ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {showStack && (
                  <div className="relative">
                    <pre className="p-4 rounded-xl bg-gray-950 dark:bg-black/60 border border-gray-800 dark:border-gray-700/50 text-xs text-gray-300 font-mono leading-relaxed overflow-x-auto max-h-64 overflow-y-auto scrollbar-thin">
                      {error.stack}
                    </pre>
                    <button
                      onClick={handleCopyStack}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-gray-800 dark:bg-gray-700/80 border border-gray-700 dark:border-gray-600/50 text-gray-400 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-600/80 transition-colors"
                      title="Copy stack trace"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.3 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Button onClick={reset} className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white font-medium gap-2 btn-glow">
                <RotateCcw className="w-4 h-4" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => { window.location.href = '/' }}
                className="flex-1 h-11 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 gap-2"
              >
                <Home className="w-4 h-4" />
                Go to Home
              </Button>
            </motion.div>
          </CardContent>
        </Card>

        {/* Footer hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500"
        >
          If this issue persists, contact{' '}
          <a
            href="mailto:support@seghro.dev"
            className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 underline underline-offset-2 transition-colors"
          >
            support@seghro.dev
          </a>
        </motion.p>
      </motion.div>
    </div>
  )
}
