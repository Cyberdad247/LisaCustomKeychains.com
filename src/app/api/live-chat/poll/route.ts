import { NextResponse } from "next/server";
import { getSession, isLisaOnline } from "@/lib/live-chat-store";
import { corsPreflight, withCors, rateLimited, clientIp } from "@/lib/live-chat-http";

export async function OPTIONS(req: Request) {
  return corsPreflight(req);
}

/**
 * Customer polls for new messages.
 * GET ?sessionId=...&since=<timestamp ms>
 */
export async function GET(req: Request) {
  if (rateLimited(clientIp(req), 120, 60_000)) {
    return withCors(NextResponse.json({ error: "Too many requests" }, { status: 429 }), req);
  }

  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId") ?? "";
  const since = Number(url.searchParams.get("since") ?? "0") || 0;

  const session = getSession(sessionId);
  if (!session) {
    return withCors(NextResponse.json({ error: "Unknown session" }, { status: 404 }), req);
  }

  const messages = session.messages.filter((m) => m.at > since);
  return withCors(
    NextResponse.json({ messages, lisaOnline: isLisaOnline(), serverTime: Date.now() }),
    req
  );
}
