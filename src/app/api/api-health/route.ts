import { NextResponse } from "next/server";
import { apiEndpoints } from "@/lib/self-healing-data";

export async function GET() {
  const healthy = apiEndpoints.filter((e) => e.status === "healthy").length;
  const degraded = apiEndpoints.filter((e) => e.status === "degraded").length;
  const down = apiEndpoints.filter((e) => e.status === "down").length;
  const circuitsOpen = apiEndpoints.filter(
    (e) => e.circuitBreaker === "open"
  ).length;
  const totalLatency = apiEndpoints.reduce((sum, e) => sum + e.latency, 0);
  const avgErrorRate =
    Math.round(
      (apiEndpoints.reduce((sum, e) => sum + e.errorRate, 0) /
        apiEndpoints.length) *
        100
    ) / 100;

  return NextResponse.json({
    endpoints: apiEndpoints,
    summary: {
      healthy,
      degraded,
      down,
      totalLatency,
      avgErrorRate,
      circuitsOpen,
    },
  });
}
