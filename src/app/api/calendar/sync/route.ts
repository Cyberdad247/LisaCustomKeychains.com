import { NextRequest, NextResponse } from "next/server";
import { syncEventsFromICS } from "@/lib/calendar";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncEventsFromICS();
  return NextResponse.json({
    ok: !result.error,
    ...result,
    timestamp: new Date().toISOString(),
  });
}

// Allow manual GET trigger from the editor dashboard (owner session checked client-side)
export async function GET() {
  const icsUrl = process.env.GOOGLE_CALENDAR_ICS_URL;
  return NextResponse.json({
    configured: Boolean(icsUrl),
    hint: icsUrl
      ? "POST with Authorization: Bearer <CRON_SECRET> to sync now."
      : "Set GOOGLE_CALENDAR_ICS_URL in environment variables to enable calendar sync.",
  });
}
