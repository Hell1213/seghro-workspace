# Task 2-d: Global Error Boundary (`src/app/error.tsx`)

## Status: ✅ Complete

## What was created
- `src/app/error.tsx` — Next.js global error boundary component

## Implementation details

### Design
- **'use client'** component (required for Next.js error boundaries)
- **Sentinel-branded** with red accent colors, logo, and consistent design language
- **Dark/light theme** support via Tailwind `dark:` variants (no `useTheme` hook needed — avoids hydration issues)
- **Framer Motion animations** — staggered entrance (brand → icon → title → message → buttons)
- **Background decorations** — grid pattern + red/gray blur glow orbs

### Features
1. **Error display** — Shows `error.message` in a styled red alert box with `AlertTriangle` icon
2. **Error digest** — Displays Next.js error digest ID when available
3. **Dev-only stack trace** — Collapsible panel with amber "Dev" badge, only visible in development mode
4. **Copy to clipboard** — One-click copy button on stack trace with checkmark feedback
5. **Try Again** — Calls Next.js `reset()` to re-render the failed segment (primary red button)
6. **Go to Dashboard** — Navigates to `/` via `window.location.href` (outline button)
7. **Support link** — Footer with `mailto:support@sentinel.dev`

### Design patterns used
- `motion.div` staggered animations (matching login page, HeroSection patterns)
- `bg-grid-pattern` utility from `globals.css`
- `btn-glow` hover effect from design system
- `scrollbar-thin` for stack trace scroll
- `glass-card`-inspired Card with `backdrop-blur-xl`
- shadcn/ui `Card`, `CardContent`, `Button` components
- Lucide icons: `ShieldAlert`, `AlertTriangle`, `RotateCcw`, `Home`, `ChevronDown`, `Copy`, `Check`

### Lint
- ESLint: **zero errors, zero warnings**

### Notes
- No `useTheme` hook — uses pure CSS `dark:` variants to avoid hydration mismatch (error boundary renders outside normal React tree)
- No `mounted` guard needed since there's no hydration-sensitive state
- `process.env.NODE_ENV === 'development'` gates the stack trace section
