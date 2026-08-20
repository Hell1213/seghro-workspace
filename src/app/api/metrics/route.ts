import { NextResponse } from "next/server";
import { metricsData, agentMetricCards, severityBreakdown, frameworkDistribution } from "@/lib/seed-data";

export async function GET() {
  return NextResponse.json({
    timeSeries: metricsData,
    cards: agentMetricCards,
    severityBreakdown,
    frameworkDistribution,
  });
}
