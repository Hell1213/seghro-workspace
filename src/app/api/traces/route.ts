import { NextRequest, NextResponse } from "next/server";
import { traces } from "@/lib/seed-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId");

  let filtered = traces;
  if (agentId) {
    filtered = traces.filter((t) => t.agentId === agentId);
  }

  return NextResponse.json(filtered);
}