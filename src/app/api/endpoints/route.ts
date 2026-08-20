import { NextRequest, NextResponse } from "next/server";
import { apiEndpoints, type ApiEndpoint } from "@/lib/self-healing-data";

export async function GET() {
  return NextResponse.json(apiEndpoints);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, endpointId, endpoint } = body as {
    action: "add" | "remove" | "health-check" | "reset-circuit";
    endpointId?: string;
    endpoint?: Partial<ApiEndpoint>;
  };

  switch (action) {
    case "add": {
      if (!endpoint?.id || !endpoint?.name || !endpoint?.baseUrl) {
        return NextResponse.json(
          { error: "id, name, and baseUrl are required" },
          { status: 400 }
        );
      }
      return NextResponse.json({
        success: true,
        message: `Endpoint "${endpoint.name}" added successfully`,
        endpointId: endpoint.id,
      });
    }

    case "remove": {
      if (!endpointId) {
        return NextResponse.json(
          { error: "endpointId is required" },
          { status: 400 }
        );
      }
      const target = apiEndpoints.find((ep) => ep.id === endpointId);
      return NextResponse.json({
        success: true,
        message: target
          ? `Endpoint "${target.name}" removed successfully`
          : `Endpoint "${endpointId}" not found (simulated)`,
        endpointId,
      });
    }

    case "health-check": {
      if (!endpointId) {
        return NextResponse.json(
          { error: "endpointId is required" },
          { status: 400 }
        );
      }
      const target = apiEndpoints.find((ep) => ep.id === endpointId);
      return NextResponse.json({
        success: true,
        message: target
          ? `Health check initiated for "${target.name}"`
          : `Health check initiated for "${endpointId}" (simulated)`,
        endpointId,
        timestamp: new Date().toISOString(),
      });
    }

    case "reset-circuit": {
      if (!endpointId) {
        return NextResponse.json(
          { error: "endpointId is required" },
          { status: 400 }
        );
      }
      const target = apiEndpoints.find((ep) => ep.id === endpointId);
      return NextResponse.json({
        success: true,
        message: target
          ? `Circuit breaker reset to CLOSED for "${target.name}"`
          : `Circuit breaker reset for "${endpointId}" (simulated)`,
        endpointId,
        previousState: target?.circuitBreaker ?? "unknown",
        newState: "closed",
        timestamp: new Date().toISOString(),
      });
    }

    default:
      return NextResponse.json(
        { error: `Unknown action: ${action}` },
        { status: 400 }
      );
  }
}
