import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: implement content generation logic
  console.log("[cron] generate-content triggered at", new Date().toISOString());

  return NextResponse.json({ ok: true, triggered: new Date().toISOString() });
}
