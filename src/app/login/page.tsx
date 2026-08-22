'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Github, Loader2, AlertCircle, Check, TrendingUp, Sparkles, Target } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { AegisLogo } from '@/components/AegisLogo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const registered = searchParams.get('registered') === 'true'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        const message = result.error === 'CredentialsSignin'
          ? 'Invalid email or password'
          : result.error
        setError(message)
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setIsLoading(true)
    signIn('google', { callbackUrl })
  }

  async function handleGitHubSignIn() {
    setIsLoading(true)
    signIn('github', { callbackUrl })
  }

  const featureCards = [
    { icon: TrendingUp, label: 'DECISIONS', value: 'Scale / Pause' },
    { icon: Sparkles, label: 'AI ENGINE', value: 'GPT-4o / Claude' },
    { icon: Target, label: 'FOCUS', value: 'Agent Quality' },
  ]

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Left Panel: Branding ── */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-10 xl:p-14 overflow-hidden bg-gradient-to-br from-[#dc2626] via-[#b91c1c] to-[#7f1d1d]">
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.65%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E")' }} />

        {/* Logo */}
        <div className="relative z-10">
          <AegisLogo iconSize={36} white textClass="text-xl" />
        </div>

        {/* Center content */}
        <div className="relative z-10 max-w-md">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/70 mb-5"
          >
            AI Agent Observability Platform
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl xl:text-5xl font-bold text-white leading-[1.1] mb-5"
          >
            Stop guessing why your agents fail.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base text-white/80 leading-relaxed"
          >
            Surface silent failures, pull context across traces, and auto-heal your agents before users churn. Real-time observability for production AI systems.
          </motion.p>
        </div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative z-10 flex gap-4"
        >
          {featureCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl bg-white/[0.08] border border-white/[0.1] backdrop-blur-sm p-5 min-w-[140px]"
            >
              <card.icon className="w-5 h-5 text-white/80 mb-3" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/50 mb-1">{card.label}</p>
              <p className="text-sm font-semibold text-white">{card.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Decorative glow */}
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-white/[0.04] blur-[100px]" />
        <div className="absolute -top-20 -left-20 h-[300px] w-[300px] rounded-full bg-white/[0.03] blur-[80px]" />
      </div>

      {/* ── Right Panel: Form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#FAFAF9] dark:bg-[#0a0a0a]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[400px]"
        >
          {/* Mobile-only logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <AegisLogo iconSize={36} textClass="text-xl" />
          </div>

          {/* Header */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back
          </h2>
          <p className="text-[15px] text-gray-500 dark:text-gray-400 mb-8">
            Sign in to your AI agent dashboard.
          </p>

          {/* Alerts */}
          <AnimatePresence>
            {registered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm mb-5"
              >
                <Check className="w-4 h-4 shrink-0" />
                Account created! Please sign in.
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm mb-5"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-500 dark:text-gray-400 mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-[50px] rounded-[10px] border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-900 text-[15px] px-4 focus-visible:border-[#dc2626] focus-visible:ring-[#dc2626]/20"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-500 dark:text-gray-400">
                  Password
                </label>
                <a href="#" className="text-xs text-[#dc2626] hover:text-[#b91c1c] font-medium">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-[50px] rounded-[10px] border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-900 text-[15px] px-4 pr-12 focus-visible:border-[#dc2626] focus-visible:ring-[#dc2626]/20"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            {/* Sign In button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-[50px] rounded-full bg-[#dc2626] hover:bg-[#b91c1c] text-white text-[15px] font-semibold shadow-lg shadow-red-600/25 hover:shadow-red-600/40 transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          {/* OR divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#FAFAF9] dark:bg-[#0a0a0a] px-3 text-[11px] uppercase tracking-wider text-gray-400 font-medium">
                or
              </span>
            </div>
          </div>

          {/* Social login buttons */}
          <div className="space-y-3">
            {/* Google */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-[50px] rounded-[10px] border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 gap-3 text-[15px] font-medium text-gray-700 dark:text-gray-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </Button>

            {/* GitHub */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGitHubSignIn}
              disabled={isLoading}
              className="w-full h-[50px] rounded-[10px] border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 gap-3 text-[15px] font-medium text-gray-700 dark:text-gray-300"
            >
              <Github className="w-5 h-5" />
              Continue with GitHub
            </Button>
          </div>

          {/* Footer link */}
          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No account yet?{' '}
            <Link href="/register" className="text-[#dc2626] hover:text-[#b91c1c] font-medium transition-colors">
              Create one
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-600">
              Demo: <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 font-mono text-[11px]">demo@aegis.dev</code> / <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 font-mono text-[11px]">demo1234</code>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}