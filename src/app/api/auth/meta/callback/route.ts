import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error_description") || url.searchParams.get("error");

  if (error) {
    return NextResponse.json({ status: "ERROR", error }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json(
      { status: "MISSING_CODE", message: "Meta did not return an OAuth code." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    status: "CODE_RECEIVED",
    message:
      "OAuth callback is wired. Token exchange is intentionally not enabled until META_APP_SECRET and storage rules are configured.",
  });
}
