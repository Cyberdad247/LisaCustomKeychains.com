export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { getAllProducts } from "@/lib/shopify";

// Sir BoB chat proxy — the model brain lives on the VPS gateway.
// Env: BOB_GATEWAY_URL (e.g. http://<vps>:8102), BOB_API_KEY (shared secret).

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > MAX_PER_WINDOW;
}

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
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ reply: "You are chatting quite fast — give me a breath and try again." }, { status: 429 });
  }

  const gateway = process.env.BOB_GATEWAY_URL;
  const apiKey = process.env.BOB_API_KEY;
  if (!gateway || !apiKey) {
    return NextResponse.json(
      { reply: "I am not yet connected to my desk. Please check back soon, or contact Lisa directly." },
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
      body: JSON.stringify({ messages, catalog }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) {
      throw new Error(`gateway ${res.status}`);
    }
    const data = await res.json();
    return NextResponse.json({ reply: data.reply ?? "" });
  } catch (e) {
    console.error("BoB gateway error:", e);
    return NextResponse.json(
      { reply: "I am having trouble reaching my desk just now. Please try again shortly." },
      { status: 502 }
    );
  }
}
