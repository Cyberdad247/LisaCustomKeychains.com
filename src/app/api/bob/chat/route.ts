export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { getAllProducts } from "@/lib/shopify";

// Sir BoB chat proxy — the model brain lives on the VPS gateway.
// The gateway's /chat is a public storefront endpoint (per-IP rate limited
// on both ends), so the URL is hardcoded and no secret is needed here.

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
    // Bound the catalog fetch so a slow Shopify API can never hang the chat.
    const edges = await Promise.race([
      getAllProducts(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("catalog timeout")), 8000)
      ),
    ]);
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

import {
  buildSirBobCustomerSystemPrompt,
  modulateOceanMatrix,
} from "@/lib/camelot/sir-bob";

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ reply: "You are chatting quite fast — give me a breath and try again." }, { status: 429 });
  }

  const gateway = "https://bob.lisascustomkeychains.com";

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

  const catalog = await catalogContext();
  const empathyState = modulateOceanMatrix(messages);
  const systemPrompt = buildSirBobCustomerSystemPrompt({ catalog, empathyState });

  const GATEWAY_UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

  try {
    const res = await fetch(`${gateway}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": GATEWAY_UA,
      },
      body: JSON.stringify({
        messages,
        catalog,
        persona: "customer",
        systemPrompt,
        ocean: empathyState.activeOcean,
        empathyScore: empathyState.score,
      }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) {
      throw new Error(`gateway ${res.status}`);
    }
    const data = await res.json();
    return NextResponse.json({ reply: data.reply ?? "" });
  } catch (e) {
    console.error("BoB customer gateway error, falling back to sovereign Gemini mesh:", e);
    const geminiKey = process.env.GOOGLE_AI_API_KEY;
    if (geminiKey) {
      try {
        const userPrompt = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");

        const gRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: `${systemPrompt}\n\n${userPrompt}\n\nRespond as Sir BoB to the customer:` }],
                },
              ],
              generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
            }),
            signal: AbortSignal.timeout(15_000),
          }
        );
        if (gRes.ok) {
          const gData = await gRes.json();
          const replyText = gData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            return NextResponse.json({
              reply: replyText.trim(),
              provider: "gemini-sovereign-fallback",
            });
          }
        }
      } catch (gErr) {
        console.error("Customer Gemini fallback failed:", gErr);
      }
    }

    return NextResponse.json(
      {
        reply: empathyState.isMemorial
          ? "Thank you for reaching out to Lisa's Custom Keychains. Lisa treats all memorial and remembrance pieces with utmost care and love. Please leave your note or request, and we will weave it with the gentlest touch."
          : "Good day. I am temporarily stepping away from my desk, but Queen Lisa handcrafts every custom order right here. Feel free to browse our collection or leave a note with your desired colors and charms.",
      },
      { status: 200 }
    );
  }
}

