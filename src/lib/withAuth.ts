import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";

export interface AuthenticatedRequest extends NextRequest {
  userId: string;
}

type RouteContext = { params: Record<string, string> };

export function withAuth(
  handler: (req: AuthenticatedRequest, ctx: RouteContext) => Promise<Response>
) {
  return async (req: NextRequest, ctx: RouteContext): Promise<Response> => {
    try {
      const token = req.cookies.get("token")?.value;
      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      let payload: { userId: string; email: string };
      try {
        payload = verifyJWT(token);
      } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const authedReq = req as AuthenticatedRequest;
      authedReq.userId = payload.userId;

      return handler(authedReq, ctx);
    } catch {
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}
