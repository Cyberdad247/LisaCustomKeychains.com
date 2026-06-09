// Bifrost — multi-provider streaming AI route.
// Provider priority (auto): Ollama (local/free) → Gemini (free tier) → Anthropic (paid).
// Override with AI_PROVIDER=ollama|gemini|anthropic env var.
// Owner-session gated.

import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { isOwnerSessionValid } from "@/lib/storefront-config";
import { type HermesIntent, type HermesContext } from "@/lib/hermes";

export type AIProvider = "anthropic" | "gemini" | "ollama";

const LISA_BRAND = `Lisa's Custom Keychains is a handmade macrame keychain and earring small business. Lisa hand-crafts every piece herself. Brand voice: warm, artisan, personal, authentic. Not corporate. Not generic. Products start at $2.95. Never use exclamation marks more than once. Keep everything concise.`;

const SYSTEM_PROMPTS: Record<HermesIntent, string> = {
  "improve-copy": `${LISA_BRAND}\n\nImprove existing storefront copy. Return ONLY the improved text — no explanation, no quotes, no intro. Match original length unless more is needed.`,
  "headline-variants": `${LISA_BRAND}\n\nGenerate 3 short headline variants. Format exactly:\n1. [headline]\n2. [headline]\n3. [headline]\n\nEach under 8 words. No explanations.`,
  "announcement": `${LISA_BRAND}\n\nWrite announcement bar text (under 120 characters). One sentence. Urgent but not pushy. Return ONLY the announcement text.`,
  "section-body": `${LISA_BRAND}\n\nWrite body copy for a homepage section (2–3 sentences, under 280 characters). Return ONLY the body copy.`,
  "social-caption": `${LISA_BRAND}\n\nWrite social media captions for Instagram and Facebook. Include 5–8 relevant hashtags at the end. Conversational, visual, personal. Return ONLY the caption + hashtags.`,
  "ad-copy": `${LISA_BRAND}\n\nWrite Facebook/Instagram ad copy. Format as:\nHEADLINE: ... (under 40 chars)\nSUBHEADLINE: ... (under 60 chars)\nBODY: ... (under 100 chars)\nCTA: ... (under 20 chars)`,
};

function buildUserMessage(intent: HermesIntent, ctx: HermesContext): string {
  const parts: string[] = [];
  if (ctx.field) parts.push(`Field: ${ctx.field}`);
  if (ctx.current) parts.push(`Current text:\n${ctx.current}`);
  if (ctx.extra) parts.push(`Additional context: ${ctx.extra}`);
  const taskMap: Record<HermesIntent, string> = {
    "headline-variants": "Generate 3 headline variants for this field.",
    "social-caption": "Write a social media caption for this.",
    "ad-copy": "Write structured ad copy for this product/offer.",
    "improve-copy": "Improve this copy.",
    "announcement": "Write an announcement bar message.",
    "section-body": "Write body copy for this section.",
  };
  parts.push(taskMap[intent]);
  return parts.join("\n\n");
}

export function resolveProvider(): AIProvider | null {
  const explicit = process.env.AI_PROVIDER as AIProvider;
  if (explicit && ["anthropic", "gemini", "ollama"].includes(explicit)) return explicit;
  // Auto mode: prefer free providers first
  if (process.env.OLLAMA_BASE_URL) return "ollama";
  if (process.env.GOOGLE_AI_API_KEY) return "gemini";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return null;
}

export function providerInfo(): { provider: AIProvider | null; model: string; configured: boolean } {
  const provider = resolveProvider();
  const models: Record<AIProvider, string> = {
    anthropic: "claude-sonnet-4-6",
    gemini: process.env.GEMINI_MODEL ?? "gemini-1.5-flash",
    ollama: process.env.OLLAMA_MODEL ?? "llama3.2",
  };
  return {
    provider,
    model: provider ? models[provider] : "none",
    configured: provider !== null,
  };
}

// ─── Anthropic streaming ──────────────────────────────────────────────────────

async function streamAnthropic(
  system: string,
  userMsg: string
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.ANTHROPIC_API_KEY!;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
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
      system,
      messages: [{ role: "user", content: userMsg }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic ${res.status}`);

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          for (const line of decoder.decode(value, { stream: true }).split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6).trim();
            if (payload === "[DONE]") continue;
            try {
              const ev = JSON.parse(payload) as { type: string; delta?: { text?: string } };
              if (ev.type === "content_block_delta" && ev.delta?.text) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: ev.delta.text })}\n\n`));
              }
            } catch { /* skip */ }
          }
        }
      } finally {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
        reader.releaseLock();
      }
    },
  });
}

// ─── Gemini streaming ─────────────────────────────────────────────────────────

async function streamGemini(
  system: string,
  userMsg: string
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.GOOGLE_AI_API_KEY!;
  const model = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: userMsg }] }],
      generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
    }),
  });

  if (!res.ok) throw new Error(`Gemini ${res.status}`);

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          for (const line of decoder.decode(value, { stream: true }).split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6).trim();
            if (!payload) continue;
            try {
              const ev = JSON.parse(payload) as {
                candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
              };
              const text = ev.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
              }
            } catch { /* skip */ }
          }
        }
      } finally {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
        reader.releaseLock();
      }
    },
  });
}

// ─── Ollama streaming (OpenAI-compatible) ────────────────────────────────────

async function streamOllama(
  system: string,
  userMsg: string
): Promise<ReadableStream<Uint8Array>> {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL ?? "llama3.2";

  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model,
      stream: true,
      max_tokens: 512,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMsg },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Ollama ${res.status} — is Ollama running?`);

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          for (const line of decoder.decode(value, { stream: true }).split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6).trim();
            if (payload === "[DONE]") continue;
            try {
              const ev = JSON.parse(payload) as {
                choices?: Array<{ delta?: { content?: string }; finish_reason?: string }>;
              };
              const text = ev.choices?.[0]?.delta?.content;
              if (text) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
              }
            } catch { /* skip */ }
          }
        }
      } finally {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
        reader.releaseLock();
      }
    },
  });
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function GET() {
  return Response.json(providerInfo());
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  if (!isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const provider = resolveProvider();
  if (!provider) {
    return new Response(
      JSON.stringify({
        error: "No AI provider configured. Set OLLAMA_BASE_URL, GOOGLE_AI_API_KEY, or ANTHROPIC_API_KEY in environment variables.",
        setup: {
          ollama: "Install Ollama (free, local): https://ollama.com — then set OLLAMA_BASE_URL=http://localhost:11434",
          gemini: "Get a free Gemini API key at https://aistudio.google.com/app/apikey — then set GOOGLE_AI_API_KEY",
          anthropic: "Get an Anthropic API key at https://console.anthropic.com — then set ANTHROPIC_API_KEY",
        },
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
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

  const system = SYSTEM_PROMPTS[intent];
  const userMsg = buildUserMessage(intent, context);

  try {
    let stream: ReadableStream<Uint8Array>;
    if (provider === "gemini") {
      stream = await streamGemini(system, userMsg);
    } else if (provider === "ollama") {
      stream = await streamOllama(system, userMsg);
    } else {
      stream = await streamAnthropic(system, userMsg);
    }
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-AI-Provider": provider,
      },
    });
  } catch (err) {
    console.error(`[bifrost] ${provider} error:`, err);
    return new Response(`AI provider error (${provider}): ${String(err)}`, { status: 502 });
  }
}
