# Sentinel — AI Agent Observability Dashboard

## Current Project Status
**Phase: V6 — Agent comparison, trace waterfall, navbar polish, filter persistence, HowItWorks enhancements**
- Page renders ~115KB+ HTML (35 headings, single H1, clean semantic structure)
- Dev server compiles and serves HTTP 200
- ESLint passes with zero errors
- All API routes functional (agents, traces, issues, alerts, metrics)
- WebSocket real-time alert streaming on port 3001
- Dark mode fully functional with theme toggle
- Agent detail sheet with sparkline charts verified working
- Issue resolution workflow (Open → Investigating → Resolved) verified working
- Newsletter section with email subscription toast
- Command Palette (⌘K) with fuzzy search, keyboard nav, quick actions, recent items
- Scroll progress bar + Back-to-Top button (with glow pulse)
- Activity Timeline in Alerts tab
- 9+ landing sections + 4-tab working dashboard + comprehensive styling
- 35+ component files total
- V5: Particle canvas, typing animation, CSV export, onboarding tour, URL state, sparklines
- **V6: Agent comparison panel, trace waterfall Gantt chart, navbar polish, filter persistence**

---

## V6 Session — Completed Modifications

### 1. New Feature: Agent Comparison Panel
- Created `src/components/dashboard/AgentComparison.tsx`
- Side-by-side agent comparison in a shadcn Sheet (right side, sm:max-w-2xl)
- **6 comparison metrics**: Status (colored badge), Framework, Error Rate (color-coded), Avg Latency, Total Runs, Last Run
- **Performance Comparison bar chart** at bottom: 3 rows (Error Rate, Latency, Total Runs) with animated CSS bars
- Agent A bars red-tinted, Agent B bars grey-tinted, all bars animate from width 0
- **Trigger**: Click compare icon (GitCompareArrows) on agent cards — select 2 agents to compare
- **UX hint**: After selecting 1st agent, a red hint text appears: "1 agent selected — click another to compare"
- Added `onCompare` and `comparisonIds` props to `AgentGrid.tsx`
- Compare icon: `opacity-0 group-hover:opacity-100` (appears on hover), red highlight when selected

### 2. New Feature: Trace Waterfall Gantt Chart
- Created `src/components/dashboard/TraceWaterfall.tsx`
- Gantt-chart style visualization of trace spans with timeline positioning
- **Header row**: "Span Name" | "Timeline" | "Duration" column labels
- **Span bars**: Positioned by `startTime/totalDuration` (left offset) and `duration/totalDuration` (width)
- **Color-coded by type**: model=red, tool=amber, guard=emerald, retrieval=blue, output=gray
- **Error highlighting**: Red left border + red background tint for error spans
- **Hover tooltips**: Absolute-positioned div with span details (name, type, status, duration, tokens)
- **Time axis**: 0/25/50/75/100% markers with actual ms/s values
- **Framer Motion**: Staggered bar animations (delay: i * 0.05)
- **Toggle button**: "Waterfall" button in traces tab filter bar (red when active)
- Shows below TraceViewer, uses first trace's spans by default

### 3. New Feature: Filter/Search Persistence
- Dashboard filter state saved to `localStorage` key `sentinel-dash-filters`
- **Persisted state**: traceSearch, issueSearch, traceStatusFilter, issueSeverityFilter, issueStatusFilter
- On mount: reads from localStorage and restores filter state
- On change: writes all 5 filter values to localStorage (debounced by React batching)
- Wrapped in try/catch for SSR safety and storage quota limits

### 4. Styling: Enhanced Navbar
- **Animated logo**: Shield icon now has a subtle ping animation (opacity-20) + shadow
- **Glass CTA**: "Get Started" button now has `.btn-glow` effect (inner white glow on hover)
- **Mobile menu**: Wrapped in `AnimatePresence` with height animation (smooth expand/collapse)
- **Mobile glass**: Mobile menu uses `bg-white/95` + `backdrop-filter: blur(12px)` for glass effect
- **Mobile CTA**: Get Started button in mobile menu has `.btn-glow`
- **Focus rings**: Nav links and buttons now have `.focus-ring` for accessibility

### 5. Styling: HowItWorks Code Blocks
- Applied `.card-lift` class to code block containers for hover lift effect
- Consistent with other card components across the site

### 6. Component Integration
- **AgentGrid**: Added `onCompare` callback + `comparisonIds` prop + compare icon button
- **DashboardSection**: Added `handleCompareAgent()` function, comparison state management, waterfall toggle, AgentComparison Sheet rendering
- **DashboardSection**: Added `showWaterfall` toggle state + "Waterfall" button in traces filter bar

---

## Full File Inventory (35+ component files)

### Landing Components (11 files)
- `src/components/landing/Navbar.tsx` (V6: animated logo ping, btn-glow, AnimatePresence mobile menu, glass effect)
- `src/components/landing/HeroSection.tsx` (V5: particle canvas, typing animation, btn-glow)
- `src/components/landing/FeaturesSection.tsx` (V5: card-lift)
- `src/components/landing/HowItWorks.tsx` (V6: card-lift on code blocks)
- `src/components/landing/StatsSection.tsx` (V4: animated counters, hover glow)
- `src/components/landing/IntegrationSection.tsx`
- `src/components/landing/TestimonialsSection.tsx`
- `src/components/landing/NewsletterSection.tsx`
- `src/components/landing/CtaSection.tsx` (V5: btn-glow)
- `src/components/landing/Footer.tsx` (V4: gradient accent line)

### Dashboard Components (13 files)
- `src/components/dashboard/DashboardSection.tsx` (V6: comparison, waterfall toggle, filter persistence)
- `src/components/dashboard/AgentDetailSheet.tsx`
- `src/components/dashboard/MetricCards.tsx` (V5: mini sparklines, card-lift)
- `src/components/dashboard/AgentGrid.tsx` (V6: compare icon button, comparisonIds prop)
- `src/components/dashboard/AgentComparison.tsx` ✨ NEW V6
- `src/components/dashboard/TraceViewer.tsx`
- `src/components/dashboard/TraceWaterfall.tsx` ✨ NEW V6
- `src/components/dashboard/IssuesPanel.tsx`
- `src/components/dashboard/AlertFeed.tsx`
- `src/components/dashboard/ActivityTimeline.tsx`
- `src/components/dashboard/MetricsCharts.tsx`
- `src/components/dashboard/McpPanel.tsx`
- `src/components/dashboard/DashboardSkeleton.tsx`

### UI Components (7 files)
- `src/components/ui/CommandPalette.tsx`
- `src/components/ui/ScrollProgress.tsx`
- `src/components/ui/BackToTop.tsx` (V5: glow-pulse)
- `src/components/ui/ParticleCanvas.tsx`
- `src/components/ui/ExportButton.tsx`
- `src/components/ui/DashboardTour.tsx`

### Utilities
- `src/lib/export-utils.ts`

### Mini Services
- `mini-services/alert-streamer/index.ts`
- `mini-services/alert-streamer/package.json`

### Core Files
- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/app/globals.css` (V5: 10+ new animations/utilities)

---

## Verification Results
- ✅ ESLint: Zero errors
- ✅ Page: HTTP 200, compiles and renders
- ✅ Zero JS errors (verified via agent-browser console)
- ✅ All heading text correct (verified via DOM textContent)
- ✅ All 4 dashboard tabs work (Overview, Traces, Issues, Alerts)
- ✅ Traces tab: Waterfall toggle, Gantt chart renders below TraceViewer
- ✅ Overview tab: Agent compare icon visible on hover, comparison hint text
- ✅ Dark mode: Toggle works, no visual regressions
- ✅ Mobile responsive: Tested on iPhone 14 viewport
- ✅ API routes: All 5 returning 200
- ✅ Filter persistence: localStorage read/write verified
- ✅ Navbar: Animated logo ping, glass mobile menu, btn-glow
- ✅ WebSocket: Alert streamer active on port 3001

## Unresolved Issues
- None critical. All features verified working.
- Minor: Command palette keyboard shortcut (Ctrl+K) doesn't trigger via agent-browser's synthetic events (works in real browsers)
- Minor: Agent detail sheet sparkline uses randomly seeded data
- Minor: Activity timeline uses hardcoded mock data (no API endpoint yet)
- Minor: Onboarding tour may not trigger perfectly on very fast scroll-by
- Minor: Waterfall view shows first trace's spans (could add trace selector for waterfall specifically)

## Priority Recommendations for Next Phase
1. **Performance optimization** — lazy load below-fold sections with Next.js dynamic imports
2. **Real agent detail API** — fetch historical trace data for the sparkline
3. **API for Activity Timeline** — backend endpoint for real activity events
4. **Page-level loading skeleton** — skeleton UI while JS hydrates
5. **Export to PDF** — generate styled PDF reports for traces/issues
6. **Agent comparison for 3+ agents** — extend to multi-agent comparison table
7. **Real-time notification toasts** — toast popups when WebSocket alerts arrive
8. **Trace selector for waterfall** — independent trace selection for waterfall view

---

## V7 Session — Completed Modifications

### 1. New Component: PageSkeleton
- Created `src/components/ui/PageSkeleton.tsx`
- Full-page loading skeleton matching the landing page structure
- **Top bar**: 64px skeleton mimicking Navbar height (`bg-gray-100 dark:bg-gray-900`)
- **Hero block**: 50% width heading skeleton + 70% width subtitle skeleton (h-48, gap-4)
- **Features block**: 3 equal-width rounded skeleton cards side by side (h-24, gap-4)
- **Dashboard placeholder**: Large h-64 rounded skeleton with `animated-border` class
- **Footer**: 48px skeleton bar at bottom
- All skeleton elements use `animate-pulse` shimmer + `rounded-2xl`
- Framer Motion `AnimatePresence` for smooth skeleton→content transition (exit 0.5s fade, enter 0.3s fade)
- Accepts `loading` boolean prop; passes through `children` when loading is false
- Zero new TypeScript errors

### File Inventory Update
- `src/components/ui/PageSkeleton.tsx` ✨ NEW V7

### 2. New Component: ToastNotifications
- Created `src/components/ui/ToastNotifications.tsx`
- Real-time toast notification stack for WebSocket alerts
- **Props**: `alerts: ToastAlert[]`, `maxVisible?: number` (default 3)
- **Behavior**: Shows most recent `maxVisible` alerts, new toasts slide in from right (Framer Motion x:100→0, opacity 0→1), auto-dismiss after 6s with exit animation (x:0→100, opacity 1→0)
- **Position**: Fixed bottom-right, `z-30` (above BackToTop button), `flex-col-reverse` with 8px gap (newest on top)
- **Duplicate prevention**: `shownIds` ref (Set of IDs) prevents re-triggering timers for duplicate alerts
- **Dismissed tracking**: `dismissedIds` state (Set) + useMemo derivation for visible alerts — no setState-in-effect
- **Toast design**: `rounded-xl border bg-white dark:bg-gray-900 shadow-xl border-l-4` with severity-colored left border
  - `critical`: red left border + `bg-red-50/50 dark:bg-red-950/20` + AlertTriangle icon (`text-red-500`)
  - `warning`: amber left border + AlertTriangle icon (`text-amber-500`)
  - `info`: blue left border + Bell icon (`text-blue-500`)
- **Layout**: Close button (X, top-right), severity icon, title (font-semibold text-sm), relative time (timeAgo helper), message (text-xs, line-clamp-2)
- **Width**: `w-80 sm:w-96`
- **Framer Motion**: `layout` prop for smooth stacking, `AnimatePresence mode="popLayout"` for enter/exit
- ESLint: Zero errors

### File Inventory Update
- `src/components/ui/ToastNotifications.tsx` ✨ NEW V7
