import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/api/cron/:path*", "/client-editor/:path*"],
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Gate all cron routes — must supply CRON_SECRET as Bearer token
  if (pathname.startsWith("/api/cron")) {
    const auth = req.headers.get("authorization");
    if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "content-type": "application/json" } },
      );
    }
  }

  // Outer Basic Auth gate for the HITL editor (env-gated: only active when both vars are set)
  if (pathname.startsWith("/client-editor")) {
    const user = process.env.EDITOR_USER;
    const pass = process.env.EDITOR_PASS;
    if (user && pass) {
      const auth = req.headers.get("authorization");
      const expected = `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
      if (auth !== expected) {
        return new NextResponse("Authentication Required", {
          status: 401,
          headers: { "WWW-Authenticate": `Basic realm="Lisa Editor"` },
        });
      }
    }
  }

  return NextResponse.next();
}
