# Task 2-c: DB Migration — API Routes

## Summary
Migrated all API routes from hardcoded seed-data imports to real Prisma database queries.

## Files Created
- `src/lib/api-response.ts` — Standardized response helpers (success/error/validationError)

## Files Modified
- `src/app/api/agents/route.ts` — Prisma findMany with search filter, soft auth
- `src/app/api/traces/route.ts` — Prisma findMany with agentId/status/search filters
- `src/app/api/issues/route.ts` — Prisma findMany + Zod PATCH validation
- `src/app/api/alerts/route.ts` — Prisma findMany + Zod PATCH validation
- `src/app/api/metrics/route.ts` — Prisma groupBy/aggregate for time series, cards, severity, frameworks
- `src/app/api/activity/route.ts` — Combined query (traces + issues + alerts), sorted by time
- `src/app/api/endpoints/route.ts` — Added try/catch, Zod POST validation, TODO comment
- `src/app/api/healing/route.ts` — Added try/catch, TODO comment
- `src/app/api/api-health/route.ts` — Added try/catch, TODO comment

## Key Decisions
- GET responses return raw data (not wrapped in {success, data}) to maintain frontend compatibility
- Issues PATCH Zod enum includes 'reopened' (used by frontend) in addition to task-specified values
- Metrics time-series uses groupBy timestamp with _avg across agents
- In-memory routes (endpoints, healing, api-health) kept as-is with TODO comments
- self-heal route already had try/catch, left unchanged

## Verification
- All 10 API routes returning HTTP 200
- ESLint: zero errors
- Dashboard data shapes verified via curl: agents[], issues[], alerts[], {timeSeries, cards, severityBreakdown, frameworkDistribution}, activity[]
- PATCH /api/issues tested: successfully updates status in DB
- WebSocket alert streamer untouched (separate mini-service)
