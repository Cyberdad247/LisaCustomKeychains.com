import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isOwnerSessionValid } from "@/lib/storefront-config";

// Owner-gated: Lisa reads a full conversation. Proxied to the VPS gateway.

const GATEWAY = "https://bob.lisascustomkeychains.com";
const GATEWAY_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

export async function GET(req: Request) {
  const cookieStore = await cookies();
  if (!isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.BOB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  const sessionId = new URL(req.url).searchParams.get("sessionId") ?? "";
  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${GATEWAY}/live-chat/messages?sessionId=${encodeURIComponent(sessionId)}`,
      {
        headers: { Authorization: `Bearer ${apiKey}`, "User-Agent": GATEWAY_UA },
        signal: AbortSignal.timeout(15_000),
      }
    );
    if (!res.ok) throw new Error(`gateway ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error("live-chat messages proxy error:", e);
    return NextResponse.json({ error: "gateway" }, { status: 502 });
  }
}
