import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isOwnerSessionValid } from "@/lib/storefront-config";

// Owner-gated: Lisa replies to a shopper. Proxied to the VPS gateway.
// Body: { sessionId, text }

const GATEWAY = "https://bob.lisascustomkeychains.com";
const GATEWAY_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  if (!isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.BOB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "not configured" }, { status: 500 });
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

  try {
    const res = await fetch(`${GATEWAY}/live-chat/reply`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": GATEWAY_UA,
      },
      body: JSON.stringify({ sessionId: body.sessionId, text: text.slice(0, 500) }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`gateway ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error("live-chat reply proxy error:", e);
    return NextResponse.json({ error: "gateway" }, { status: 502 });
  }
}
