import { NextResponse } from "next/server";
import { alerts } from "@/lib/seed-data";

export async function GET() {
  return NextResponse.json(alerts);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id } = body;
  const alert = alerts.find((a) => a.id === id);
  if (alert) {
    alert.status = "read";
    return NextResponse.json(alert);
  }
  return NextResponse.json({ error: "Alert not found" }, { status: 404 });
}