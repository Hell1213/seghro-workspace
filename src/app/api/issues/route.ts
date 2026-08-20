import { NextRequest, NextResponse } from "next/server";
import { issues } from "@/lib/seed-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId");
  const severity = searchParams.get("severity");
  const status = searchParams.get("status");

  let filtered = [...issues];
  if (agentId) filtered = filtered.filter((i) => i.agentId === agentId);
  if (severity) filtered = filtered.filter((i) => i.severity === severity);
  if (status) filtered = filtered.filter((i) => i.status === status);

  return NextResponse.json(filtered);
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, status } = body;
  const issue = issues.find((i) => i.id === id);
  if (issue) {
    issue.status = status || issue.status;
    return NextResponse.json(issue);
  }
  return NextResponse.json({ error: "Issue not found" }, { status: 404 });
}