# ============================================================
# Sentinel V8 — Multi-stage Dockerfile (Bun + Next.js 16 standalone)
# ============================================================

# --- Stage 1: Install dependencies ---
FROM oven/bun:1 AS deps
WORKDIR /app

# Copy dependency manifests first (leverages Docker layer cache)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production=false

# --- Stage 2: Build the application ---
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy everything from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN bunx prisma generate

# Build Next.js (standalone output)
# The build script does: next build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/
RUN bun run build

# --- Stage 3: Production runner ---
FROM oven/bun:1 AS runner

ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

WORKDIR /app

# Copy standalone output from builder
COPY --from=builder /app/.next/standalone ./

# Copy static assets (already merged by build script, but ensure existence)
COPY --from=builder /app/.next/standalone/.next ./.next
COPY --from=builder /app/.next/standalone/public ./public

# Copy Prisma schema + generated client for runtime DB access
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy db/ folder (SQLite file) for dev/eval compatibility
COPY --from=builder /app/db ./db

# Switch to non-root user
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", ".next/standalone/server.js"]
