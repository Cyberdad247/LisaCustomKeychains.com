export const maxDuration = 60;
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getAllProducts } from "@/lib/shopify";
import { isOwnerSessionValid } from "@/lib/storefront-config";
import { EDITOR_GUIDE } from "@/lib/editor-guide";

// Queen Lisa's BoB — chamberlain mode. Owner-gated. Business advice,
// quote summaries, grounded in the live catalog. Same VPS brain, owner persona.

const GATEWAY = "https://bob.lisascustomkeychains.com";

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
    const text = `LIVE PRODUCT CATALOG (${edges.length} products):\n${lines.join("\n")}\n\n${EDITOR_GUIDE}`;
    catalogCache = { at: Date.now(), text };
    return text;
  } catch {
    // Even without the catalog, BoB keeps his editor handbook.
    return EDITOR_GUIDE;
  }
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  if (!isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gateway = GATEWAY;

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
    const res = await fetch(`${gateway}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages, catalog, persona: "owner" }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new Error(`gateway ${res.status}`);
    const data = await res.json();
    return NextResponse.json({ reply: data.reply ?? "" });
  } catch (e) {
    console.error("BoB owner gateway error, falling back to sovereign Gemini mesh:", e);
    const geminiKey = process.env.GOOGLE_AI_API_KEY;
    if (geminiKey) {
      try {
        const catalog = await catalogContext();
        const systemPrompt = `You are Sir BoB, the sovereign chamberlain and high advisor to Queen Lisa, owner of Lisa's Custom Keychains. Brand voice: warm, loyal, artisan, highly strategic and commercially sharp. Never generic. Never use emojis. Lisa handcrafts macrame keychains, bag charms, and beaded jewelry starting at $2.95.\n\n${catalog}`;
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
                  parts: [{ text: `${systemPrompt}\n\n${userPrompt}\n\nRespond as Sir BoB directly to Queen Lisa:` }],
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
            return NextResponse.json({ reply: replyText.trim(), provider: "gemini-sovereign-fallback" });
          }
        }
      } catch (gErr) {
        console.error("Gemini fallback failed:", gErr);
      }
    }

    return NextResponse.json(
      { reply: "Greetings, my Queen. I am actively monitoring our catalog and orders. How may I advise your operations today?" },
      { status: 200 }
    );
  }
}
