export const maxDuration = 60;
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getAllProducts } from "@/lib/shopify";
import { isOwnerSessionValid } from "@/lib/storefront-config";

// Queen Lisa's BoB — chamberlain mode. Owner-gated. Business advice,
// quote summaries, grounded in the live catalog. Same VPS brain, owner persona.

let catalogCache: { at: number; text: string } | null = null;

async function catalogContext(): Promise<string> {
  if (catalogCache && Date.now() - catalogCache.at < 3_600_000) return catalogCache.text;
  try {
    const edges = await getAllProducts();
    const lines = edges.slice(0, 120).map(({ node }) => {
      const price = node.priceRange?.minVariantPrice;
      return `- ${node.title} [${node.productType || "keychain"}] $${price?.amount ?? "?"} (/${node.handle})`;
    });
    const text = `LIVE PRODUCT CATALOG (${edges.length} products):\n${lines.join("\n")}`;
    catalogCache = { at: Date.now(), text };
    return text;
  } catch {
    return "Product catalog temporarily unavailable.";
  }
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  if (!isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gateway = process.env.BOB_GATEWAY_URL;
  const apiKey = process.env.BOB_API_KEY;
  if (!gateway || !apiKey) {
    return NextResponse.json(
      { reply: "BoB is not connected yet. Set BOB_GATEWAY_URL and BOB_API_KEY in Vercel." },
      { status: 503 }
    );
  }

  let body: { messages?: { role: string; content: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const messages = (body.messages ?? [])
    .filter((m) => m && typeof m.content === "string" && ["user", "assistant"].includes(m.role))
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));
  if (messages.length === 0) {
    return NextResponse.json({ error: "No messages" }, { status: 400 });
  }

  try {
    const catalog = await catalogContext();
    const res = await fetch(`${gateway.replace(/\/$/, "")}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ messages, catalog, persona: "owner" }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new Error(`gateway ${res.status}`);
    const data = await res.json();
    return NextResponse.json({ reply: data.reply ?? "" });
  } catch (e) {
    console.error("BoB owner gateway error:", e);
    return NextResponse.json(
      { reply: "I cannot reach my desk just now, my Queen. Try again shortly." },
      { status: 502 }
    );
  }
}
