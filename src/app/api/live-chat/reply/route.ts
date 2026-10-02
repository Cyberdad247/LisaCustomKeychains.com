import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { addMessage, markSessionRead, markLisaSeen } from "@/lib/live-chat-store";
import { isOwnerSessionValid } from "@/lib/storefront-config";

/** Lisa replies to a shopper. Owner-gated. Body: { sessionId, text } */
export async function POST(req: Request) {
  const cookieStore = await cookies();
  if (!isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { sessionId?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const text = (body.text ?? "").trim();
  if (!body.sessionId || !text) {
    return NextResponse.json({ error: "Missing sessionId or text" }, { status: 400 });
  }

  const message = addMessage(body.sessionId, "lisa", text);
  if (!message) {
    return NextResponse.json({ error: "Unknown session" }, { status: 404 });
  }

  markLisaSeen();
  markSessionRead(body.sessionId);
  return NextResponse.json({ message });
}
