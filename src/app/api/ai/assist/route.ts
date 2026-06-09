// Bifrost AI Route — intent-aware Claude streaming endpoint.
// Owner-session gated. Requires ANTHROPIC_API_KEY env var.

import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { isOwnerSessionValid } from "@/lib/storefront-config";
import { type HermesIntent, type HermesContext } from "@/lib/hermes";

const LISA_BRAND = `Lisa's Custom Keychains is a handmade macrame keychain and earring small business. Lisa hand-crafts every piece herself. Brand voice: warm, artisan, personal, authentic. Not corporate. Not generic. Products start at $2.95. Never use exclamation marks more than once. Keep everything concise.`;

const SYSTEM_PROMPTS: Record<HermesIntent, string> = {
  "improve-copy": `${LISA_BRAND}\n\nYou improve existing copy for the storefront. Return ONLY the improved text — no explanation, no quotes, no intro. Match the length of the original unless it needs to be longer.`,

  "headline-variants": `${LISA_BRAND}\n\nYou generate 3 short headline variants. Format exactly as:\n1. [headline]\n2. [headline]\n3. [headline]\n\nEach headline is under 8 words. No explanations.`,

  "announcement": `${LISA_BRAND}\n\nYou write short announcement bar text for the storefront (under 120 characters). One sentence. Urgent but not pushy. Return ONLY the announcement text.`,

  "section-body": `${LISA_BRAND}\n\nYou write body copy for a homepage section (2–3 sentences, under 280 characters). Return ONLY the body copy.`,

  "social-caption": `${LISA_BRAND}\n\nYou write social media captions for Instagram and Facebook. Include 5–8 relevant hashtags at the end. Conversational, visual, and personal. Return ONLY the caption + hashtags.`,

  "ad-copy": `${LISA_BRAND}\n\nYou write short ad copy for Facebook/Instagram ads. Include: one punchy headline (under 40 chars), one subheadline (under 60 chars), body (under 100 chars), and a CTA (under 20 chars). Format as:\nHEADLINE: ...\nSUBHEADLINE: ...\nBODY: ...\nCTA: ...`,
};

function buildUserMessage(intent: HermesIntent, ctx: HermesContext): string {
  const parts: string[] = [];

  if (ctx.field) parts.push(`Field: ${ctx.field}`);
  if (ctx.current) parts.push(`Current text:\n${ctx.current}`);
  if (ctx.extra) parts.push(`Additional context: ${ctx.extra}`);

  if (intent === "headline-variants") {
    parts.push("Generate 3 headline variants for this field.");
  } else if (intent === "social-caption") {
    parts.push("Write a social media caption for this.");
  } else if (intent === "ad-copy") {
    parts.push("Write structured ad copy for this product/offer.");
  } else if (intent === "improve-copy") {
    parts.push("Improve this copy.");
  } else if (intent === "announcement") {
    parts.push("Write an announcement bar message.");
  } else if (intent === "section-body") {
    parts.push("Write body copy for this section.");
  }

  return parts.join("\n\n");
}

export async function POST(request: NextRequest) {
  // Auth gate
  const cookieStore = await cookies();
  if (!isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not configured in environment variables." }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  let body: { intent: HermesIntent; context: HermesContext };
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { intent, context } = body;
  if (!intent || !(intent in SYSTEM_PROMPTS)) {
    return new Response(`Unknown intent: ${intent}`, { status: 400 });
  }

  const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      stream: true,
      system: SYSTEM_PROMPTS[intent],
      messages: [{ role: "user", content: buildUserMessage(intent, context) }],
    }),
  });

  if (!anthropicRes.ok) {
    const errText = await anthropicRes.text().catch(() => "");
    console.error("[bifrost] Anthropic error:", anthropicRes.status, errText);
    return new Response("AI service error", { status: 502 });
  }

  // Proxy Anthropic SSE → simplified SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = anthropicRes.body!.getReader();
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
            break;
          }
          const raw = decoder.decode(value, { stream: true });
          for (const line of raw.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6).trim();
            if (payload === "[DONE]") continue;
            try {
              const event = JSON.parse(payload) as {
                type: string;
                delta?: { text?: string };
              };
              if (event.type === "content_block_delta" && event.delta?.text) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ text: event.delta.text })}\n\n`,
                  ),
                );
              }
            } catch {
              // skip malformed events
            }
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        reader.releaseLock();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
