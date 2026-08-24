# Seghro — AI Agent Observability Dashboard

> **agents.md** — Comprehensive project reference for AI coding agents.
> Any AI model reading this file should be able to understand, navigate, and modify this codebase without additional context.

---

## 📋 PROJECT OVERVIEW

| Field | Value |
|-------|-------|
| **Name** | Seghro |
| **Tagline** | AI Agent Observability Platform |
| **Description** | Production monitoring for AI agents. Surface silent failures, pull context across traces, and auto-heal issues. |
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5 (strict) |
| **Runtime** | Bun (not Node.js) |
| **Styling** | Tailwind CSS 4 + shadcn/ui (New York style) |
| **Database** | SQLite via Prisma ORM |
| **Auth** | NextAuth.js v4 (JWT strategy, PrismaAdapter) |
| **State** | Zustand (client), TanStack Query (server) |
| **Animation** | Framer Motion |
| **Charts** | Recharts |
| **Port** | 3000 (dev server, non-negotiable) |
| **Output** | `next.config.ts` → `output: "standalone"` (Docker-ready) |

### What Seghro Does

Seghro is a SaaS dashboard for monitoring AI agent runs in production. Users:
1. **Ingest** traces from their AI agents via API (POST /api/ingest)
2. **View** real-time dashboards showing agent health, traces, issues, and metrics
3. **Detect** issues automatically (silent failures, hallucinations, regressions)
4. **Self-heal** via LLM-powered analysis (suggests and applies fixes)
5. **Alert** through Slack, webhooks, or in-app notifications
6. **Manage** API keys, webhooks, monitored endpoints, and team members

---

## 🗂️ PROJECT STRUCTURE

```
my-project/
├── .env                          # Environment variables (DATABASE_URL, NEXTAUTH_*, GOOGLE_*, GITHUB_*)
├── .env.example                  # TODO: needs to be created
├── .gitignore                    # TODO: needs to be created
├── agents.md                     # THIS FILE — AI agent reference
├── worklog.md                    # Session-by-session development log
├── next.config.ts                # Next.js config (standalone, allowedDevOrigins, security headers)
├── package.json                  # Scripts: dev, build, start, lint, db:push, db:generate
├── prisma/
│   └── schema.prisma             # Database schema (11 models)
├── db/
│   └── custom.db                 # SQLite database file
├── public/
│   ├── logo.svg                  # Red shield logo (dark bg)
│   ├── logo-white.svg            # White shield logo (red bg)
│   └── aegis-logo.png            # STALE — should be deleted
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── layout.tsx            # Root layout (ThemeProvider, AuthProviders, metadata, OG, JSON-LD)
│   │   ├── page.tsx              # Homepage — landing page with 12+ sections, lazy-loaded
│   │   ├── login/page.tsx        # Split-screen login (credentials + Google/GitHub OAuth)
│   │   ├── register/page.tsx     # Split-screen register (Zod validation, password strength)
│   │   ├── dashboard/
│   │   │   ├── layout.tsx        # Auth-guarded layout with header, user badge, sign-out
│   │   │   └── page.tsx          # Renders DashboardSection component
│   │   ├── error.tsx             # Error boundary page
│   │   ├── not-found.tsx         # Branded 404
│   │   ├── loading.tsx           # Global loading spinner
│   │   ├── robots.ts             # robots.txt generator
│   │   ├── sitemap.ts            # sitemap.xml generator
│   │   └── api/                  # 24 API routes (see API section below)
│   ├── components/
│   │   ├── SeghroLogo.tsx        # ✅ ACTIVE — Red shield logo + "Seghro" text
│   │   ├── AegisLogo.tsx         # ❌ STALE — legacy, safe to delete
│   │   ├── AuthProviders.tsx     # NextAuth SessionProvider wrapper
│   │   ├── dashboard/            # 19 dashboard components
│   │   ├── landing/              # 13 landing page sections
│   │   └── ui/                   # ~40 shadcn/ui components + 6 custom UI components
│   ├── hooks/                    # Custom React hooks
│   │   ├── use-auto-refresh.ts   # Polling hook for dashboard data
│   │   ├── use-mobile.ts         # Viewport breakpoint detection
│   │   └── use-toast.ts          # Toast notification hook
│   ├── lib/                      # Shared server/client utilities
│   │   ├── auth.ts               # NextAuth config (providers, JWT callbacks, session)
│   │   ├── auth-guard.ts         # Auth guard utility for API routes
│   │   ├── db.ts                 # Prisma Client singleton
│   │   ├── store.ts              # Zustand store (selectedAgent, filters, etc.)
│   │   ├── org-scope.ts          # Org-based data scoping (getUserOrgId)
│   │   ├── rate-limit.ts         # In-memory rate limiter (Map-based)
│   │   ├── api-response.ts       # Standardized {success, data, error} response helpers
│   │   ├── api-key-auth.ts       # API key validation middleware (bcrypt compare)
│   │   ├── billing.ts            # Stripe billing helpers (stub/mock)
│   │   ├── export-utils.ts       # CSV/JSON export utilities
│   │   ├── seed-data.ts          # Database seed script for demo data
│   │   ├── self-healing-agent.ts # LLM-powered self-healing system (z-ai-web-dev-sdk)
│   │   ├── self-healing-data.ts  # Self-healing data providers
│   │   ├── utils.ts              # cn() utility (clsx + tailwind-merge)
│   │   └── webhook-dispatcher.ts # Webhook delivery system (HMAC signing, retry)
│   ├── middleware.ts             # Auth guard for /dashboard/* + rate limiting for /api/*
│   └── globals.css               # Tailwind CSS 4 imports + custom CSS variables
└── mini-services/                # Optional WebSocket/standalone services
```

**Stats:** 147 TypeScript/TSX files, ~20,891 lines of code

---

## 🗄️ DATABASE SCHEMA (Prisma + SQLite)

| Model | Purpose | Key Fields | Relations |
|-------|---------|------------|----------|
| **User** | Authenticated users | email (unique), password (hashed), role (admin/viewer), orgId | → Organization, → ApiKey[] |
| **Organization** | Tenant/workspace | name, slug (unique), plan (starter/pro/enterprise) | ← User[] |
| **Agent** | Monitored AI agents | name, status, framework, orgId, errorRate, avgLatency, totalRuns | ← Trace[], Issue[], Alert[] |
| **Trace** | Individual agent runs | agentId, traceId, status, duration, inputTokens, outputTokens | → Agent, ← Span[] |
| **Span** | Sub-operations within a trace | traceId, name, type, status, duration, model, tool | → Trace |
| **Issue** | Detected problems | agentId, title, severity (P0/P1/P2), status, rootCause, suggestedFix | → Agent |
| **Alert** | Notifications | agentId, issueId, channel, title, severity, status | → Agent |
| **Metric** | Time-series data | agentId, name, value, timestamp, labels | None |
| **ApiKey** | API authentication | userId, name, keyHash (unique), keyPrefix, expiresAt | → User |
| **Webhook** | Outbound webhooks | orgId, url, events (JSON string), secret, active | None |
| **MonitoredEndpoint** | External API monitoring | name, baseUrl, status, responseTime, circuitBreaker | None |
| **HealingAction** | Self-heal audit log | type, endpointName, action, result, reasoning | None |

### Known Schema Issues
- `Agent.name` is NOT unique, but `/api/ingest` uses `findUnique({ where: { name } })` — will crash at runtime
- Missing indexes on all foreign-key columns (agentId, traceId, userId, orgId)
- `Agent.orgId` is a bare String without @relation to Organization
- `Webhook.events` is a raw JSON string, not a proper relation
- SQLite has no concurrent write support — not suitable for multi-user production

---

## 🔌 API ROUTES (24 endpoints)

### Auth
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| ALL | `/api/auth/[...nextauth]` | Public | NextAuth handlers (signin, callback, session, csrf, providers) |
| POST | `/api/auth/register` | Public | Register new user + organization. Body: {name, workspace?, email, password} |

### Dashboard Data (org-scoped with demo fallback)
| Method | Route | Auth | Zod | Description |
|--------|-------|------|-----|-------------|
| GET | `/api/agents` | Optional | ✅ | List agents with trace/issue counts |
| GET/POST | `/api/traces` | Optional | ✅ | List traces with spans / Create trace |
| GET/PATCH | `/api/issues` | Optional | ✅ | List issues / Update issue status |
| GET/PATCH | `/api/alerts` | Optional | ✅ | List alerts / Update alert status |
| GET | `/api/metrics` | ❌ None | ✅ | Time-series metrics (7d window) |
| GET | `/api/stats` | ❌ None | — | Aggregate stats for metric cards |
| GET | `/api/activity` | ❌ None | — | Recent activity timeline |

### Infrastructure
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api` | — | Health check endpoint |
| GET/POST/DELETE | `/api/endpoints` | ❌ None | Monitored endpoints (uses raw SQL — needs refactor) |
| GET/POST | `/api/webhooks` | ✅ Session | Webhook CRUD with HMAC secret generation |
| GET | `/api/session` | ✅ Session | Current user session info |
| GET/POST | `/api/api-keys` | ❌ None | ⚠️ List/create API keys (NO AUTH — security issue) |
| DELETE | `/api/api-keys/[id]` | ❌ None | ⚠️ Delete API key (NO AUTH — security issue) |
| GET | `/api/api-health` | — | Static API health status page |

### Self-Healing
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/self-heal` | ❌ None | LLM-powered issue analysis (uses z-ai-web-dev-sdk) |
| GET/POST | `/api/healing` | ❌ None | Healing action history (uses raw SQL) |

### Billing (Stub)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/billing/checkout` | ❌ None | Stripe checkout session creation (mock) |
| POST | `/api/billing/portal` | ❌ None | Stripe customer portal (mock) |
| GET | `/api/billing/subscription` | Optional | Current subscription info |

### Ingestion
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/ingest` | ✅ API Key | Ingest agent traces (external SDK integration point) |
| GET | `/api/ingest` | ❌ None | Ingest stats (total trace count) |

### Org & Users
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET/POST | `/api/org` | ✅ Session | Organization info / Create org |
| GET | `/api/users` | ✅ Session+Admin | List users in org (admin-only) |

### Response Convention
Most routes use helpers from `@/lib/api-response.ts`:
```ts
import { success, error } from '@/lib/api-response'
// success(data, status)
// error(message, status)
```
**⚠️ Not all routes follow this convention** — some return raw `NextResponse.json()`.

---

## 🔐 AUTHENTICATION SYSTEM

### Provider Configuration (`src/lib/auth.ts`)
1. **Google OAuth** — uses `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from `.env`
2. **GitHub OAuth** — uses `GITHUB_ID` and `GITHUB_SECRET` from `.env` (not currently set)
3. **Credentials** — email + password login

### JWT Session Flow
```
Login → authorize() → JWT token created (with id, role) → stored in cookie
     → middleware checks cookie existence on /dashboard/* → allows access
```

### ⚠️ Known Auth Issues
- **JWT callback never sets `orgId`** — `getUserOrgId()` always returns null, breaking org-scoping
- **Credentials auth uses hardcoded password check** — doesn't use bcrypt.compare against DB hash
- **Middleware only checks cookie existence**, not JWT validity
- **NEXTAUTH_SECRET** was missing from .env (recently fixed)

### Demo Credentials
- Email: `demo@seghro.dev`
- Password: `demo1234`
- Role: admin

---

## 🎨 UI ARCHITECTURE

### Pages
| Route | Component | Layout | Auth Required |
|-------|-----------|--------|--------------|
| `/` | Landing page (12 sections) | Root | No |
| `/login` | Split-screen login | Root | No |
| `/register` | Split-screen register | Root | No |
| `/dashboard` | Full dashboard (5 tabs) | Dashboard (auth guard) | Yes |

### Dashboard Tabs (DashboardSection.tsx)
| Tab | Component | Content |
|-----|-----------|---------|
| Overview | MetricCards + AgentGrid | 6 metric cards + agent cards with status |
| Traces | TraceViewer | Filterable trace list with span details |
| Issues | IssuesPanel | Issue cards with severity, root cause, suggested fix |
| Alerts | AlertFeed | Alert list with severity and channel |
| API Health | ApiHealthPanel | Monitored endpoints with circuit breaker status |

### Dashboard Sub-Components
- **AgentDetailSheet** — Slide-over panel for individual agent details
- **AgentComparison** — Side-by-side agent comparison
- **TraceWaterfall** — Gantt-style span visualization
- **McpPanel** — MCP integration panel
- **SettingsPanel** — User settings, API keys, webhooks, org management
- **CreateAgentDialog** — Dialog to create new agents
- **SimulateTraceDialog** — Dialog to simulate test traces
- **HealingTimeline** — Self-healing action history
- **ActivityTimeline** — Recent activity feed
- **MetricsCharts** — Recharts line charts for time-series data
- **DashboardSkeleton** — Loading skeleton

### Landing Page Sections (loaded in order)
1. Navbar (sticky, responsive, command palette trigger)
2. HeroSection (gradient mesh, animated trace preview, CTAs)
3. FeaturesSection (6 feature cards with icons)
4. HowItWorks (3-step guide with code examples)
5. StatsSection (animated counters)
6. DashboardSection (live dashboard preview)
7. DocsSection (3-step getting started)
8. TestimonialsSection (4 tweet-style testimonials)
9. PricingSection (3-tier: Starter/Pro/Enterprise)
10. NewsletterSection (email signup)
11. IntegrationSection (SDK installation)
12. ChangelogSection (timeline)
13. StatusSection (service uptime)
14. CtaSection (final call-to-action)
15. Footer (links, social, copyright)

### Custom UI Components
- **CommandPalette** — ⌘K command palette with agent search
- **DashboardTour** — Onboarding tour (shown once)
- **ExportButton** — CSV/JSON data export
- **ScrollProgress** — Reading progress bar
- **BackToTop** — Scroll-to-top button
- **ParticleCanvas** — Animated particle background (unused?)

### Color System
- **Primary brand:** Red `#dc2626` (buttons, accents, logo)
- **Background:** Light `#FAFAF9` / Dark `#0a0a0a`
- **Text:** Gray scale with proper dark mode variants
- **Accent colors:** Emerald (success), Amber (warning), Red (error/danger)
- **No indigo/blue** unless explicitly requested

### Theme System
- `next-themes` with `ThemeProvider` in root layout
- `.theme-switching` CSS class prevents flash during toggle
- All components use `dark:` Tailwind variants

---

## 🔧 KEY LIBRARIES & PATTERNS

### State Management
- **Zustand** (`src/lib/store.ts`) — Client state: selectedAgent, filters, sidebar, command palette
- **TanStack Query** — Installed but NOT actively used (API calls use custom fetch hooks)
- **useAutoRefresh** (`src/hooks/use-auto-refresh.ts`) — Polling hook with configurable interval

### API Call Pattern
```tsx
// Client components fetch data directly
const res = await fetch('/api/agents')
const json = await res.json()
// json.data = actual data (wrapped in {success, data} response)
```

### Org-Scoping Pattern
```ts
// src/lib/org-scope.ts
import { getUserOrgId } from '@/lib/org-scope'
const orgId = await getUserOrgId(request) // reads from JWT session
if (orgId) {
  // filter by orgId
} else {
  console.warn('No auth session — returning data in demo mode')
  // return ALL data (demo mode)
}
```

### Rate Limiting
- In-memory Map-based limiter in `src/lib/rate-limit.ts`
- Applied via middleware for all `/api/*` routes
- Default: 20 requests per minute per IP

### Webhook Delivery
- `src/lib/webhook-dispatcher.ts` — HMAC-SHA256 signed payloads
- Retry logic with exponential backoff
- ⚠️ Uses `$queryRawUnsafe` for updating lastUsedAt

### Self-Healing
- `src/lib/self-healing-agent.ts` — LLM-agnostic analysis via z-ai-web-dev-sdk
- Takes issue context, returns analysis with suggested fix
- Healing actions stored in `HealingAction` model

---

## 🚀 DEVELOPMENT COMMANDS

```bash
# Start dev server (must run on port 3000)
bun run dev

# Lint check
bun run lint

# Database operations
bun run db:push      # Push schema changes (accepts data loss!)
bun run db:generate  # Generate Prisma client
bun run db:migrate   # Run migrations

# Build for production
bun run build        # Next.js build
bun run start        # Start production server
```

### Environment Variables
```env
DATABASE_URL=file:/path/to/db/custom.db
NEXTAUTH_SECRET=<random-32-chars>
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GITHUB_ID=<your-github-client-id>
GITHUB_SECRET=<your-github-client-secret>
```

---

## 🚨 PRODUCTION READINESS STATUS

### 🔴 CRITICAL (10 issues — must fix before any real user)

1. **NEXTAUTH_SECRET** — Was missing from .env (recently fixed). Must use cryptographically random value in production.
2. **Credentials auth doesn't use bcrypt** — `auth.ts` compares against hardcoded `demo1234`, not the DB hash. Registered users cannot log in.
3. **Org-scoping is broken** — `getUserOrgId()` always returns null because JWT callback never sets `orgId`. All users see all data.
4. **13 of 24 API routes have NO auth** — Anyone can access metrics, endpoints, self-heal, API keys, billing.
5. **API key routes are completely unprotected** — `/api/api-keys` and `/api/api-keys/[id]` have zero auth.
6. **Middleware only checks cookie existence** — Doesn't validate JWT signature or expiry.
7. **No CSRF protection** — State-changing endpoints rely solely on cookie auth.
8. **`/api/ingest` will crash** — Uses `findUnique({ where: { name } })` but Agent.name isn't unique.
9. **No .gitignore** — .env, database, and artifacts could be committed.
10. **SQLite in production** — No concurrent writes, no replication, no network access.

### 🟡 HIGH (15 issues — should fix before launch)

1. No CORS configuration
2. No Content Security Policy
3. No X-Frame-Options header
4. No email verification on registration
5. Demo mode leaks all data to unauthenticated users
6. Inconsistent API response shapes across routes
7. `/api/self-heal` has no input validation, leaks system prompt
8. `/api/endpoints` uses `$queryRawUnsafe` (6 occurrences)
9. Issue/Alert PATCH endpoints have no ownership verification
10. API key validation loads ALL keys into memory (O(n) per request)
11. Hardcoded webhook secret (`seghro-default-secret`)
12. In-memory rate limiter doesn't work in multi-instance deployments
13. Prisma query logging enabled globally (data leak in production)
14. `allowedDevOrigins: ["*"]` in next.config.ts
15. Duplicate "Docs"/"Documentation" link in mobile navbar

### 🟢 MEDIUM (19 issues — fix post-launch)

- Missing database indexes on all FK columns
- 25+ orphan UI component files shipping in bundle
- Full DashboardSection loaded on landing page (bundle bloat)
- Unused imports in 3 components
- Dead "Forgot password?" link
- Error page button says "Go to Dashboard" but navigates to `/`
- Stub footer links (About, Blog, Careers, Privacy, Terms, Security)
- Demo credentials shown on login page
- Hardcoded API URL in docs section
- Raw `<img>` tag instead of `next/image` in SettingsPanel
- JSON-LD price mismatch with actual pricing
- No empty state for "no agents" in overview
- No proper favicon file
- Stale `aegis-logo.png` in public/
- `AegisLogo.tsx` should be deleted
- `User.password` is nullable (OAuth users) but credentials provider doesn't handle this
- Package name is generic template name
- `db:push` script uses `--accept-data-loss`
- No `.env.example` file

---

## 📝 CONVENTIONS & RULES

### Code Style
- TypeScript strict mode with explicit types
- `'use client'` / `'use server'` directives required
- shadcn/ui components preferred over custom implementations
- `cn()` utility for conditional class merging (from `@/lib/utils`)
- Lucide React for all icons
- Framer Motion for animations
- `import { success, error } from '@/lib/api-response'` for API responses

### File Naming
- Pages: `page.tsx`, `layout.tsx` in route directories
- Components: PascalCase (e.g., `AgentGrid.tsx`)
- Utilities: kebab-case (e.g., `api-response.ts`)
- Hooks: camelCase with `use-` prefix (e.g., `use-auto-refresh.ts`)

### Git Workflow
- Main branch is the only branch
- `bun run lint` must pass before any commit
- Never use `bun run build` in development (use `bun run dev`)

### Important Constraints
- **Port 3000 only** — dev server must run on 3000
- **z-ai-web-dev-sdk** — MUST only be used in backend/server code, never in client components
- **API requests** — Use relative paths only. For cross-port requests, use `?XTransformPort=<port>` query param
- **No indigo/blue colors** unless explicitly requested
- **Sticky footer** — Must use `min-h-screen flex flex-col` + `mt-auto` on footer
- **Mobile-first** — Design for mobile, enhance for desktop

### Brand Guidelines
- **Name:** Seghro
- **Domain:** seghro.dev
- **Colors:** Red primary (#dc2626), dark/light backgrounds
- **Logo:** Shield icon (SVG in public/logo.svg and public/logo-white.svg)
- **Component:** `SeghroLogo` from `@/components/SeghroLogo` (NOT AegisLogo)

---

## 🗺️ ROADMAP / PENDING WORK

### Must Fix Before Production
1. Fix credentials auth to use bcrypt.compare
2. Fix JWT callback to include orgId
3. Add auth guards to all 13 unprotected API routes
4. Replace SQLite with PostgreSQL
5. Add proper CSRF protection
6. Add .gitignore and .env.example
7. Fix Agent.name findUnique crash in ingest
8. Add database indexes

### Should Build
1. CRUD operations for agents, traces, issues (currently read-only dashboard)
2. Stripe billing integration (currently stub/mock)
3. Password reset flow
4. Email verification on registration
5. Real privacy/terms/security pages
6. Proper favicon
7. Lightweight landing dashboard preview component
8. Delete orphan UI components and stale files

### Nice to Have
1. WebSocket real-time updates (port 3001 mini-service exists)
2. PWA support
3. i18n (internationalization)
4. Custom 404 page for /dashboard/* routes
5. Activity audit log
6. Team invitation system

---

*Last updated: 2025-08-23 | Generated from deep production readiness audit*