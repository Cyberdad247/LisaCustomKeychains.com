import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith("/dev-portal") &&
    process.env.ENABLE_DEV_PORTAL !== "true"
  ) {
    return new NextResponse("Not found", {
      status: 404,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "x-robots-tag": "noindex",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dev-portal/:path*"],
};
