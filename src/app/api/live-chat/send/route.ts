import { NextResponse } from "next/server";
import { createSession, getSession, addMessage } from "@/lib/live-chat-store";
import { corsPreflight, withCors, rateLimited, clientIp } from "@/lib/live-chat-http";

export async function OPTIONS(req: Request) {
  return corsPreflight(req);
}

/**
 * Customer sends a message. Creates a session on first call.
 * Body: { sessionId?: string, name?: string, text: string }
 */
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

  let session = body.sessionId ? getSession(body.sessionId) : undefined;
  if (!session) {
    session = createSession(body.name ?? "Guest");
  }

  const message = addMessage(session.id, "customer", text);
  if (!message) {
    return withCors(NextResponse.json({ error: "Could not send" }, { status: 400 }), req);
  }

  return withCors(NextResponse.json({ sessionId: session.id, message }), req);
}
