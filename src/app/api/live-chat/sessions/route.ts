import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isOwnerSessionValid } from "@/lib/storefront-config";

// Owner-gated: Lisa's inbox session list. Proxied to the VPS gateway (shared store).

const GATEWAY = "https://bob.lisascustomkeychains.com";
const GATEWAY_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

export async function GET() {
  const cookieStore = await cookies();
  if (!isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.BOB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ sessions: [], notConfigured: true });
  }

  try {
    const res = await fetch(`${GATEWAY}/live-chat/sessions`, {
      headers: { Authorization: `Bearer ${apiKey}`, "User-Agent": GATEWAY_UA },
      signal: AbortSignal.timeout(15_000),
    });
    if (res.status === 401) {
      return NextResponse.json({ sessions: [], error: "gateway unauthorized" }, { status: 502 });
    }
    if (!res.ok) throw new Error(`gateway ${res.status}`);
    const data = await res.json();
    return NextResponse.json({ sessions: data.sessions ?? [] });
  } catch (e) {
    console.error("live-chat sessions proxy error:", e);
    return NextResponse.json({ sessions: [], error: "gateway" }, { status: 502 });
  }
}
