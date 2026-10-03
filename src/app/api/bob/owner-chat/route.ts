export const maxDuration = 60;
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getAllProducts } from "@/lib/shopify";
import { isOwnerSessionValid } from "@/lib/storefront-config";
import { EDITOR_GUIDE } from "@/lib/editor-guide";
import { answerEditorQuestion } from "@/lib/bob-editor-fallback";

// Queen Lisa's BoB — chamberlain mode. Owner-gated. Business advice,
// quote summaries, grounded in the live catalog. Same VPS brain, owner persona.

const GATEWAY = "https://bob.lisascustomkeychains.com";

// A real browser UA: Cloudflare's firewall (error 1010) blocks default
// server-to-server user agents (node/undici, python-urllib, curl).
const GATEWAY_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

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

import {
  buildSirBobOwnerSystemPrompt,
  modulateOceanMatrix,
} from "@/lib/camelot/sir-bob";

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

  const catalog = await catalogContext();
  const empathyState = modulateOceanMatrix(messages);
  const systemPrompt = buildSirBobOwnerSystemPrompt({ catalog, empathyState });

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
        persona: "owner",
        systemPrompt,
        ocean: empathyState.activeOcean,
        empathyScore: empathyState.score,
      }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new Error(`gateway ${res.status}`);
    const data = await res.json();
    if (data.reply) {
      return NextResponse.json({
        reply: data.reply,
        ocean: empathyState.activeOcean,
        empathyScore: empathyState.score,
      });
    }
    throw new Error("gateway empty reply");
  } catch (e) {
    console.error("BoB owner gateway error, falling back to sovereign Gemini mesh:", e);
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
            return NextResponse.json({
              reply: replyText.trim(),
              provider: "gemini-sovereign-fallback",
              ocean: empathyState.activeOcean,
              empathyScore: empathyState.score,
            });
          }
        }
      } catch (gErr) {
        console.error("Gemini fallback failed:", gErr);
      }
    }

    // Local editor-aware fallback: answer from the handbook so Lisa still
    // gets real guidance even when the VPS is unreachable. Never a generic greeting.
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const localAnswer = answerEditorQuestion(lastUser?.content ?? "");
    const reply =
      localAnswer ||
      "Greetings, my Queen. I am actively monitoring our catalog and orders under the vMAX matrix. How may I advise your operations today?";

    return NextResponse.json(
      {
        reply,
        provider: "local-editor-fallback",
        ocean: empathyState.activeOcean,
        empathyScore: empathyState.score,
      },
      { status: 200 }
    );
  }
}

