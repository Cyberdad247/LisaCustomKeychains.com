import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { META_OAUTH_STATE_COOKIE } from "@/lib/meta-oauth";

function statesMatch(received: string | null, expected: string | undefined): boolean {
  if (!received || !expected) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error_description") || url.searchParams.get("error");

  if (error) {
    return NextResponse.json({ status: "ERROR", error }, { status: 400 });
  }

  // Verify the CSRF nonce before trusting anything else in the callback.
  const expectedState = request.cookies.get(META_OAUTH_STATE_COOKIE)?.value;
  if (!statesMatch(state, expectedState)) {
    const response = NextResponse.json(
      {
        status: "INVALID_STATE",
        message:
          "OAuth state mismatch. Restart the connection from the client editor.",
      },
      { status: 400 },
    );
    response.cookies.delete(META_OAUTH_STATE_COOKIE);
    return response;
  }

  if (!code) {
    const response = NextResponse.json(
      { status: "MISSING_CODE", message: "Meta did not return an OAuth code." },
      { status: 400 },
    );
    response.cookies.delete(META_OAUTH_STATE_COOKIE);
    return response;
  }

  // State verified; the one-time nonce has served its purpose.
  const response = NextResponse.json({
    status: "CODE_RECEIVED",
    message:
      "OAuth callback is wired. Token exchange is intentionally not enabled until META_APP_SECRET and storage rules are configured.",
  });
  response.cookies.delete(META_OAUTH_STATE_COOKIE);
  return response;
}
