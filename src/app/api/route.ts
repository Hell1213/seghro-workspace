import { db } from "@/lib/db";
import { success } from "@/lib/api-response";

const startTime = Date.now();

export async function GET() {
  const start = performance.now();
  let dbStatus: "up" | "down" = "up";
  let dbLatencyMs = 0;

  try {
    const dbStart = performance.now();
    await db.$queryRaw`SELECT 1`;
    dbLatencyMs = Math.round((performance.now() - dbStart) * 100) / 100;
  } catch {
    dbStatus = "down";
  }

  const uptimeMs = Date.now() - startTime;
  const totalLatencyMs = Math.round((performance.now() - start) * 100) / 100;

  return success({
    status: dbStatus === "up" ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: uptimeMs,
    version: "0.2.1",
    checks: {
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      api: {
        status: "up",
        latencyMs: totalLatencyMs,
      },
    },
  });
}
