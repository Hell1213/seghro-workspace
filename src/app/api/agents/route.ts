import { NextResponse } from "next/server";
import { agents } from "@/lib/seed-data";

export async function GET() {
  return NextResponse.json(agents);
}