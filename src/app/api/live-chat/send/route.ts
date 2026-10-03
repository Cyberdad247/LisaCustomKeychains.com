import { NextResponse } from "next/server";
import { corsPreflight, withCors, rateLimited, clientIp } from "@/lib/live-chat-http";

// Public: customer sends a message. Proxied to the VPS gateway (shared store).
// Body: { sessionId?: string, name?: string, text: string }

const GATEWAY = "https://bob.lisascustomkeychains.com";
const GATEWAY_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

export async function OPTIONS(req: Request) {
  return corsPreflight(req);
}

export async function POST(req: Request) {
  if (rateLimited(clientIp(req), 20, 60_000)) {
    return withCors(NextResponse.json({ error: "Slow down a touch — try again in a moment." }, { status: 429 }), req);
  }

  let body: { sessionId?: string; name?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return withCors(NextResponse.json({ error: "Bad request" }, { status: 400 }), req);
  }

  const text = (body.text ?? "").trim();
  if (!text) {
    return withCors(NextResponse.json({ error: "Empty message" }, { status: 400 }), req);
  }

  try {
    const res = await fetch(`${GATEWAY}/live-chat/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": GATEWAY_UA },
      body: JSON.stringify({
        sessionId: body.sessionId ?? "",
        name: (body.name ?? "Guest").slice(0, 40),
        text: text.slice(0, 500),
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`gateway ${res.status}`);
    const data = await res.json();
    return withCors(NextResponse.json(data), req);
  } catch (e) {
    console.error("live-chat send proxy error:", e);
    return withCors(NextResponse.json({ error: "Chat is unavailable right now — please try again." }, { status: 502 }), req);
  }
}
