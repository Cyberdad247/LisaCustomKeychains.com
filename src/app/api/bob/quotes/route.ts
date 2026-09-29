import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isOwnerSessionValid } from "@/lib/storefront-config";

// Owner-gated: list bulk quote requests captured by the shopper BoB.

const GATEWAY = "https://bob.lisascustomkeychains.com";
export async function GET() {
  const cookieStore = await cookies();
  if (!isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gateway = GATEWAY;
  const apiKey = process.env.BOB_API_KEY;
  if (!gateway || !apiKey) {
    return NextResponse.json({ quotes: [], notConfigured: true });
  }

  try {
    const res = await fetch(`${gateway}/quotes`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`gateway ${res.status}`);
    const data = await res.json();
    return NextResponse.json({ quotes: data.quotes ?? [] });
  } catch (e) {
    console.error("BoB quotes gateway error:", e);
    return NextResponse.json({ quotes: [], error: "gateway" }, { status: 502 });
  }
}
