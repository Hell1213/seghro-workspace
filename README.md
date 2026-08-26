<div align="center">

<img src="public/logo.svg" alt="Seghro Logo" width="56" height="56" />

# Seghro

**AI Agent Observability & Self-Healing Platform**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2d3748?logo=prisma)](https://prisma.io/)
[![Bun](https://img.shields.io/badge/Bun-runtime-f472b6?logo=bun)](https://bun.sh/)
[![License](https://img.shields.io/badge/License-MIT-green)](#)

<p>
  <strong>Full visibility into your AI agents.</strong> Trace every execution, detect silent failures,
  auto-heal outages, and control costs — all in one dashboard.
</p>

<a href="#getting-started">Quick Start</a> ·
<a href="#features">Features</a> ·
<a href="#api-reference">API</a> ·
<a href="#architecture">Architecture</a> ·
<a href="#screenshots">Screenshots</a>

</div>

---

## What Is Seghro?

Seghro is a production-ready **AI Agent Observability Dashboard** — think Datadog or New Relic, but purpose-built for AI agents.

It gives engineering teams end-to-end visibility into every agent execution, automatically detects issues, triggers intelligent self-healing, and provides a unified control plane for managing multi-agent systems at scale.

**Supported frameworks:** LangChain · CrewAI · AutoGen · LlamaIndex · LangGraph · Custom agents

---

## The Problem

| Problem | Impact |
|---------|--------|
| **AI agents are black boxes** | When an agent fails, you have no idea why — was it the LLM, the prompt, the tool, or the external API? |
| **No alerting on degradation** | Error rate creeps from 1% to 15% over a week. Nobody notices until customers complain. |
| **Manual incident response** | OpenAI returns 429 at 2 AM. Your on-call engineer manually switches to Anthropic, updates configs, restarts. |
| **Token costs are uncontrolled** | You don't know which agents are burning through tokens or what your cost trajectory looks like. |
| **Multi-team chaos** | 5 teams run 50 agents with no centralized view. Each team has its own monitoring (or none at all). |

---

## Features

### Observability

- **Full Trace Capture** — Every agent execution traced end-to-end with sub-step spans (LLM calls, tool invocations, retrieval steps)
- **Real-Time Metrics** — Error rate, latency, throughput, and token usage tracked per agent with time-series charts
- **Issue Detection** — Automatic issue creation for failed traces with severity classification (P0/P1/P2)
- **Activity Timeline** — Unified feed of traces, issues, and alerts sorted by recency
- **Trace Waterfall** — Gantt chart visualization of span timing within each trace

### Self-Healing

- **Circuit Breaker** — Automatic open/close/half-open state machine for external services
- **Built-in Pattern Matching** — 8+ failure patterns detected instantly (rate limits, 5xx errors, timeouts, connection refused)
- **Automatic Fallback Routing** — LLM: OpenAI → Anthropic → Gemini → Llama · Payment: Stripe → Adyen → PayPal · Search: Tavily → Brave → Bing
- **LLM-Powered Root Cause Analysis** — AI analyzes unknown failure patterns in the background for deeper insights
- **Healing Audit Log** — Every self-healing action recorded with reasoning, steps taken, and outcome

### Security & Access Control

- **Multi-provider Auth** — Google OAuth, GitHub OAuth, and email/password with bcrypt hashing
- **JWT Strategy** — Stateless auth with signed tokens containing user ID, role, and org ID
- **Organization Scoping** — Multi-tenant data isolation. Each org sees only its own agents, traces, and issues
- **Role-Based Access** — Owner, Admin, and Viewer roles with permission enforcement
- **API Key Auth** — Programmatic access with `seghro_sk_...` bearer tokens (bcrypt-hashed storage)
- **Email Verification** — Send + verify email flow with 24-hour tokens
- **Password Reset** — Secure reset flow with 1-hour expiring tokens and audit trail

### Monitoring & Integration

- **Webhook Notifications** — Outbound webhooks for event-driven integrations (Slack, PagerDuty, custom)
- **API Health Dashboard** — Real-time status of all monitored endpoints with circuit breaker states
- **API Key Management** — Create, list, and revoke API keys from the dashboard
- **Agent Management** — Register, search, and monitor AI agents with framework tagging
- **Settings Panel** — Organization management, team invitations, and subscription controls

### Billing (SaaS-Ready)

- **3-Tier Plans** — Starter (Free, 3 agents), Pro ($49/mo, 25 agents), Enterprise (Custom, unlimited)
- **Usage Tracking** — Live agent/trace counts against plan limits with visual warnings at 80%+
- **Checkout & Portal** — Stripe-ready checkout sessions and billing portal integration points

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) (strict) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (56 components) |
| Animation | [Framer Motion](https://www.framer.com/motion/) |
| Database | [Prisma ORM](https://prisma.io/) (SQLite dev / PostgreSQL prod) |
| Auth | [NextAuth v4](https://next-auth.js.org/) (JWT strategy) |
| Client State | [Zustand](https://zustand.docs.pmnd.rs/) |
| Server State | [TanStack Query](https://tanstack.com/query) |
| Validation | [Zod](https://zod.dev/) |
| Charts | [Recharts](https://recharts.org/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Runtime | [Bun](https://bun.sh/) |

**Project stats:** 94 components · 28 API routes · 13 database models · ~22,000 lines of TypeScript

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1.0+
- PostgreSQL 14+ (production) or SQLite (development)

### Installation

```bash
# Clone the repository
git clone <your-repo-url> seghro
cd seghro

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your values (see Configuration below)

# Push database schema
bun run db:push

# Start development server
bun run dev
```

Visit **http://localhost:3000** to see the landing page.

**Demo credentials:** `demo@seghro.dev` / `demo1234`

### Configuration

Create a `.env` file in the project root:

```env
# Database (PostgreSQL for production)
DATABASE_URL=postgresql://user:password@localhost:5432/seghro

# Auth (generate with: openssl rand -base64 48)
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://your-domain.com

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# CORS (comma-separated origins for production)
ALLOWED_ORIGINS=https://your-domain.com,https://app.your-domain.com

# Email Service (for verification + password reset)
# TODO: Configure SendGrid/Resend/etc.
```

### Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server on port 3000 |
| `bun run build` | Production build |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push schema to database |
| `bun run db:generate` | Generate Prisma Client |
| `bun run db:migrate` | Run database migrations |
| `bun run db:seed` | Seed database with demo data |

### Switching to PostgreSQL

The schema is fully database-agnostic (zero raw SQL). To switch from SQLite to PostgreSQL:

```bash
# 1. Update prisma/schema.prisma
#    Change: provider = "sqlite" → provider = "postgresql"

# 2. Update .env
#    DATABASE_URL=postgresql://user:password@localhost:5432/seghro

# 3. Push schema
bun run db:push
```

---

## API Reference

All API routes return a consistent response shape:

```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": "Error message", "details": {} }

// Validation Error (400)
{ "success": false, "error": "Validation failed", "details": { ... } }
```

### Authentication

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/auth/[...nextauth]` | * | No | NextAuth handlers (login, logout, callback) |
| `/api/auth/register` | POST | No | Register new user + auto-create organization |
| `/api/auth/send-verification` | POST | No | Send email verification token |
| `/api/auth/verify-email` | POST | No | Verify email with token |
| `/api/auth/forgot-password` | POST | No | Request password reset email |
| `/api/auth/reset-password` | POST | No | Reset password with token |

### Core Data

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/agents` | GET, POST | Session | List / create agents |
| `/api/traces` | GET, POST | Session | List / create traces with spans |
| `/api/issues` | GET, PATCH | Session | List / update issues (status) |
| `/api/alerts` | GET, PATCH | Session | List / update alerts (read status) |
| `/api/metrics` | GET | Optional | Time-series charts + metric cards + breakdowns |
| `/api/stats` | GET | Optional | Aggregate dashboard statistics |
| `/api/activity` | GET | Optional | Recent activity timeline (traces + issues + alerts) |

### Ingestion

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/ingest` | POST | Key or Session | Ingest trace data (agent name, spans, tokens) |
| `/api/ingest` | GET | — | Ingestion statistics (total + last 24h) |

#### Ingest Example

```bash
curl -X POST /api/ingest \
  -H "Authorization: Bearer seghro_sk_..." \
  -H "Content-Type: application/json" \
  -d '{
    "agentName": "my-langchain-agent",
    "agentFramework": "LangChain",
    "traceId": "trace-abc-123",
    "status": "success",
    "duration": 1234.5,
    "inputTokens": 150,
    "outputTokens": 300,
    "spans": [
      { "name": "llm-call", "type": "llm", "status": "success", "duration": 800, "startTime": 0, "model": "gpt-4o", "inputTokens": 150, "outputTokens": 300 }
    ]
  }'
```

### Self-Healing

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/self-heal` | POST | Session | Trigger self-healing analysis for an endpoint |
| `/api/self-heal` | GET | — | Self-healing capabilities + fallback chains |
| `/api/healing` | GET | Session | Healing action history with summary stats |
| `/api/endpoints` | GET | Session | List monitored endpoints with circuit breaker states |
| `/api/endpoints` | POST | Session | Manage endpoints (add, remove, health-check, reset-circuit) |
| `/api/api-health` | GET | — | API health overview with summary |

#### Self-Heal Example

```bash
curl -X POST /api/self-heal \
  -H "Content-Type: application/json" \
  -d '{
    "endpointName": "OpenAI GPT-4o",
    "endpointUrl": "https://api.openai.com/v1/chat/completions",
    "category": "llm",
    "statusCode": 429,
    "errorMessage": "Rate limit exceeded",
    "latency": 250,
    "circuitBreakerState": "closed",
    "retryCount": 3
  }'
```

### Organization & Users

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/org` | GET, PATCH | Session | View / update organization name |
| `/api/users` | GET, PATCH | Admin | List / update org user roles |
| `/api/session` | GET | Session | Current user profile |
| `/api/api-keys` | GET, POST | Session | List / create API keys |
| `/api/api-keys/[id]` | DELETE | Session | Revoke an API key |
| `/api/webhooks` | GET, POST, DELETE | Session | Manage outbound webhooks |

### Billing

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/billing/subscription` | GET | Optional | Current plan, limits, and usage |
| `/api/billing/checkout` | POST | Session | Create Stripe checkout session |
| `/api/billing/portal` | POST | Session | Create Stripe billing portal session |

### System

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api` | GET | — | Health check (database + API status) |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Seghro Platform                             │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────────┐    │
│  │ Landing  │  │  Login   │  │ Register │  │  Dashboard (SPA)  │    │
│  │   Page   │  │   Page   │  │   Page   │  │   5 tabs          │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬──────────┘    │
│       └──────────────┴──────────────┴─────────────────┘               │
│                              │                                        │
│  ┌───────────────────────────▼─────────────────────────────────┐     │
│  │                  Next.js 16 App Router                       │     │
│  │                                                              │     │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌────────────┐  │     │
│  │  │ Middleware │ │  NextAuth │ │ 28 API    │ │  Prisma    │  │     │
│  │  │ JWT guard │ │  v4 JWT   │ │  Routes   │ │  ORM       │  │     │
│  │  │ Rate limit│ │  bcrypt   │ │ Zod valid │ │  SQLite/PG │  │     │
│  │  └───────────┘ └───────────┘ └───────────┘ └────────────┘  │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  Self-Healing Engine                                         │     │
│  │  ├─ 8+ built-in failure patterns (429, 5xx, timeout, etc.)   │     │
│  │  ├─ Circuit breaker (closed → open → half-open)               │     │
│  │  ├─ Automatic fallback routing across providers               │     │
│  │  └─ LLM-powered root cause analysis (background)              │     │
│  └────────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────┘
```

### Database Schema (13 models)

| Model | Purpose |
|-------|---------|
| `User` | Accounts with bcrypt passwords, roles, org membership |
| `Organization` | Multi-tenant orgs with plans (starter / pro / enterprise) |
| `Agent` | AI agent definitions with metrics (error rate, latency, runs) |
| `Trace` | Individual agent execution traces with token counts |
| `Span` | Sub-steps within a trace (LLM calls, tool calls, etc.) |
| `Issue` | Detected problems with severity, status, root cause |
| `Alert` | Notification events for issues and system events |
| `Metric` | Time-series data points (latency, tokens, throughput) |
| `ApiKey` | Programmatic access keys (bcrypt-hashed) |
| `Webhook` | Outbound webhook configurations per org |
| `MonitoredEndpoint` | External service health with circuit breaker state |
| `HealingAction` | Self-healing action audit log |
| `VerificationToken` | Email verification + password reset tokens |
| `PasswordReset` | Password reset audit trail |

---

## Security

| Measure | Implementation |
|---------|---------------|
| Password Hashing | bcrypt with 12 salt rounds |
| JWT Validation | Middleware validates signature + expiry on every dashboard request |
| Rate Limiting | 20 req/min per IP on all API routes |
| API Key Auth | Bearer tokens with bcrypt-hashed storage |
| Data Isolation | Org-scoped queries on all data endpoints |
| RBAC | Owner / Admin / Viewer role hierarchy |
| CORS | Configurable via `ALLOWED_ORIGINS` env var |
| CSP | Content-Security-Policy header on all responses |
| HSTS | Strict-Transport-Security (1-year max-age) |
| SQL Injection | Zero raw SQL — all Prisma query builder |
| Request Tracing | Unique `X-Request-Id` header on every API response |
| Rate Limit Headers | `X-RateLimit-Remaining`, `X-RateLimit-Limit`, `X-RateLimit-Reset` |

---

## Project Structure

```
seghro/
├── prisma/
│   ├── schema.prisma          # 13 models, PostgreSQL-ready
│   └── seed.ts                # Demo data seeder
├── public/
│   ├── logo.svg               # Seghro logo (dark)
│   └── logo-white.svg          # Seghro logo (light)
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (fonts, theme, metadata)
│   │   ├── page.tsx            # Landing page (12+ sections, lazy-loaded)
│   │   ├── login/page.tsx      # Split-screen login (OAuth + credentials)
│   │   ├── register/page.tsx   # Registration page
│   │   ├── dashboard/
│   │   │   ├── layout.tsx      # Auth-guarded dashboard shell
│   │   │   └── page.tsx        # Dashboard page
│   │   └── api/                # 28 API route handlers
│   │       ├── auth/           # 6 auth routes
│   │       ├── billing/        # 3 billing routes
│   │       └── ...             # 19 core API routes
│   ├── components/
│   │   ├── dashboard/          # 20 dashboard components
│   │   ├── landing/            # 15 landing page sections
│   │   ├── ui/                 # 56 shadcn/ui components
│   │   └── SeghroLogo.tsx      # Brand logo component
│   └── lib/
│       ├── auth.ts             # NextAuth configuration
│       ├── auth-guard.ts       # Session helpers (getAuthSession, requireAuth)
│       ├── api-response.ts     # Consistent {success, data} response helpers
│       ├── api-key-auth.ts     # Bearer token validation
│       ├── billing.ts          # Plans, pricing, Stripe integration points
│       ├── db.ts               # Prisma client singleton
│       ├── org-scope.ts        # Multi-tenant org scoping
│       ├── rate-limit.ts       # In-memory rate limiter
│       ├── self-healing-agent.ts  # LLM-powered failure analysis
│       ├── self-healing-data.ts   # Seed data for endpoints + healing
│       ├── store.ts            # Zustand global state
│       ├── token.ts            # Email verification + password reset tokens
│       ├── utils.ts            # Utility functions
│       └── webhook-dispatcher.ts  # Outbound webhook delivery
├── .env.example                # Environment variable template
├── .gitignore                  # Standard Next.js exclusions
├── agents.md                   # AI agent handoff documentation
├── HOW_IT_WORKS.md             # Detailed how-it-works guide
├── next.config.ts              # Security headers (CORS, CSP, HSTS)
├── package.json                # Dependencies & scripts
└── tsconfig.json               # TypeScript configuration
```

---

## Screenshots

### Landing Page

A conversion-optimized landing page with 12+ sections: animated hero with particle canvas, feature grid with live status indicators, how-it-works flow, stats counter, interactive dashboard preview, documentation, testimonials, pricing (3 tiers), newsletter, integration logos, changelog timeline, and status page.

### Dashboard

Five-tab observability workspace:

1. **Overview** — Metric cards, agent grid, recent traces, open issues, alert feed, activity timeline
2. **Traces** — Full trace list with Gantt-chart waterfall visualization, span details, token breakdown
3. **Issues** — Issue table with severity badges, status filters, agent attribution, failure rates
4. **Alerts** — Real-time alert feed with severity indicators, channel labels, read/unread states
5. **API Health** — Monitored endpoint cards with circuit breaker states, self-healing timeline, healing action audit log

Plus: settings panel, API key management, agent creation dialog, trace simulation, agent comparison, command palette (Cmd+K), onboarding tour, CSV export, dark/light theme toggle.

---

## Roadmap

- [ ] Stripe integration for real billing
- [ ] Email service integration (SendGrid / Resend)
- [ ] OpenAPI / Swagger documentation
- [ ] Pagination on all list endpoints
- [ ] Request body size limits
- [ ] End-to-end test suite
- [ ] CI/CD pipeline
- [ ] Structured JSON logging
- [ ] Redis caching for hot metrics
- [ ] WebSocket real-time event streaming
- [ ] Agent comparison across time ranges
- [ ] Custom dashboards
- [ ] SLO / SLA tracking

---

## License

MIT

---

<div align="center">
  <p>Built with Next.js, TypeScript, Tailwind CSS, and Prisma</p>
  <p><strong>Seghro</strong> — See your agents. Fix them automatically.</p>
</div>
