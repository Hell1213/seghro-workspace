# Alert Streamer — Lightweight WebSocket service
FROM oven/bun:1

WORKDIR /app

# Copy dependency manifests
COPY package.json bun.lock ./

# Install production dependencies only
RUN bun install --frozen-lockfile --production

# Copy source
COPY index.ts .

EXPOSE 3001

ENV PORT=3001

CMD ["bun", "index.ts"]
