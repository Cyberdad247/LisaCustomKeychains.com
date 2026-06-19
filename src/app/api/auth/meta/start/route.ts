import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

import {
  META_OAUTH_STATE_COOKIE,
  META_OAUTH_STATE_TTL_SECONDS,
} from "@/lib/meta-oauth";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const appId = process.env.META_APP_ID;
  const redirectUri =
    process.env.META_REDIRECT_URI || `${origin}/api/auth/meta/callback`;

  if (!appId) {
    return NextResponse.redirect(
      new URL("/client-editor?meta=missing-app-id", origin),
    );
  }

  // Random per-request nonce stored in an httpOnly cookie and echoed back in the
  // `state` param, so the callback can reject forged/replayed redirects (CSRF).
  const state = randomBytes(32).toString("hex");

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: ["pages_show_list", "pages_read_engagement", "instagram_basic"].join(","),
    state,
  });

  const response = NextResponse.redirect(
    `https://www.facebook.com/v22.0/dialog/oauth?${params.toString()}`,
  );
  response.cookies.set(META_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: META_OAUTH_STATE_TTL_SECONDS,
  });
  return response;
}
