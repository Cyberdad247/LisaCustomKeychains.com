import { NextResponse } from "next/server";
import { corsPreflight, withCors, rateLimited, clientIp } from "@/lib/live-chat-http";

// Public: customer polls for new messages. Proxied to the VPS gateway.
// GET ?sessionId=...&since=<timestamp ms>

const GATEWAY = "https://bob.lisascustomkeychains.com";
const GATEWAY_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

export async function OPTIONS(req: Request) {
  return corsPreflight(req);
}

export async function GET(req: Request) {
  if (rateLimited(clientIp(req), 120, 60_000)) {
    return withCors(NextResponse.json({ error: "Too many requests" }, { status: 429 }), req);
  }

  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId") ?? "";
  const since = url.searchParams.get("since") ?? "0";
  if (!sessionId) {
    return withCors(NextResponse.json({ error: "Missing sessionId" }, { status: 400 }), req);
  }

  try {
    const res = await fetch(
      `${GATEWAY}/live-chat/poll?sessionId=${encodeURIComponent(sessionId)}&since=${encodeURIComponent(since)}`,
      { headers: { "User-Agent": GATEWAY_UA }, signal: AbortSignal.timeout(15_000) }
    );
    if (!res.ok) throw new Error(`gateway ${res.status}`);
    const data = await res.json();
    return withCors(NextResponse.json(data), req);
  } catch (e) {
    console.error("live-chat poll proxy error:", e);
    return withCors(NextResponse.json({ error: "Chat is unavailable right now." }, { status: 502 }), req);
  }
}
