// 🧠 A2UI DEEP COMPILE — LLM-assisted fallback for the intent compiler.
//
// The deterministic compiler always runs server-side first. When it leaves
// required fields unresolved, this route optionally escalates to the
// configured LLM provider (Ollama local → Gemini → Anthropic, same priority
// as /api/ai/assist) for richer intent parsing. The model's raw output is
// validated against the real registry pools and merged in llm.ts — the model
// can never inject an invalid color/charm or overrun the tier char limit.
//
// PUBLIC route (no owner session): this powers the public /customize flow.
// Protected by strict zod validation + a lightweight in-memory rate limit.

import { NextRequest } from "next/server";
import { z } from "zod";
import { resolveProvider } from "@/app/api/ai/assist/route";
import {
  compileDesignIntent,
  colorPoolFor,
  charmPoolFor,
  type A2UIContext,
} from "@/lib/a2ui/compiler";
import {
  mergeLLMDesign,
  parseLLMPick,
  type LLMPick,
} from "@/lib/a2ui/llm";

const CompileRequestSchema = z.object({
  raw: z.string().trim().min(1).max(200, "Intent too long"),
  tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  allowedColors: z.array(z.string()).max(40).optional(),
  charmCategory: z.string().max(30).optional(),
  lockLetters: z.boolean().optional(),
});

// ─── Lightweight in-memory rate limit (per-IP token bucket) ─────────────────
const RATE_LIMIT = 12; // requests per window per IP
const WINDOW_MS = 60_000;
const buckets = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  // Opportunistic pruning so the map never grows unbounded.
  if (buckets.size > 500) {
    buckets.forEach((bucket, key) => {
      if (now > bucket.resetAt) buckets.delete(key);
    });
  }
  const bucket = buckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT;
}

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

// ─── Provider calls (non-streaming — we need strict JSON back) ──────────────

const EXTRACT_TIMEOUT_MS = 15_000;

async function extractFromProvider(
  system: string,
  user: string
): Promise<string> {
  const provider = resolveProvider();
  if (!provider) throw new Error("No AI provider configured");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), EXTRACT_TIMEOUT_MS);
  try {
    if (provider === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": process.env.ANTHROPIC_API_KEY!,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 300,
          temperature: 0.2,
          system,
          messages: [{ role: "user", content: user }],
        }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Anthropic ${res.status}`);
      const data = (await res.json()) as {
        content?: Array<{ type?: string; text?: string }>;
      };
      return data.content?.map((c) => c.text ?? "").join("") ?? "";
    }

    if (provider === "gemini") {
      const model = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GOOGLE_AI_API_KEY!}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.2 },
        }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Gemini ${res.status}`);
      const data = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      return data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    }

    // Ollama — OpenAI-compatible
    const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
    const model = process.env.OLLAMA_MODEL ?? "llama3.2";
    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model,
        max_tokens: 300,
        temperature: 0.2,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Ollama ${res.status} — is Ollama running?`);
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content ?? "";
  } finally {
    clearTimeout(timer);
  }
}

function buildPrompt(
  raw: string,
  ctx: A2UIContext
): { system: string; user: string } {
  const colorList = colorPoolFor(ctx)
    .map((c) => `${c.id}(${c.name})`)
    .join(", ");
  const charmList = charmPoolFor(ctx)
    .map((c) => `${c.id}(${c.name})`)
    .join(", ");
  const charLimit = ctx.tier === 3 ? 16 : 8;
  const lockNote = ctx.lockLetters
    ? "Text/letters are NOT available for this product — always use null for text."
    : `Text is beaded uppercase letters; max ${charLimit} chars. Only include text the customer explicitly asked to bead (a name, initials, or short phrase).`;

  const system = [
    "You are the intent compiler for Lisa's Custom Keychains, a handmade macrame keychain shop.",
    "A customer described a custom design. Extract the design attributes and return ONLY one JSON object.",
    "",
    `Available thread colors (id -> name): ${colorList}`,
    `Available charms (id -> name): ${charmList}`,
    lockNote,
    "If an attribute is not mentioned or cannot be inferred with confidence, use null (or [] for charmIds).",
    "Never invent colors, charms, or text outside the lists. Choose at most 2 charmIds.",
    "vibeLabel is an optional short mood word (e.g. Sporty, Romantic, Coastal) — null if none.",
    "",
    'Respond with exactly: {"colorId": "purple" or null, "charmIds": ["basketball"] or [], "text": "JAYDEN" or null, "vibeLabel": "Sporty" or null, "explanation": "one short phrase"}',
  ].join("\n");

  const user = [
    `Customer request: "${raw}"`,
    `Tier: ${ctx.tier}${ctx.lockLetters ? " (letters locked)" : ""}`,
  ].join("\n");

  return { system, user };
}

export async function POST(request: NextRequest) {
  if (rateLimited(clientIp(request))) {
    return Response.json(
      { error: "Rate limit exceeded — try again in a minute" },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CompileRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { raw, ...ctxRaw } = parsed.data;
  const ctx: A2UIContext = ctxRaw;

  // Deterministic compile — always the baseline, never skipped.
  const local = compileDesignIntent(raw, ctx);

  // No provider configured → return the local result untouched (fast path).
  if (!resolveProvider()) {
    return Response.json({ result: local, source: "local" });
  }

  const { system, user } = buildPrompt(raw, ctx);

  try {
    const modelText = await extractFromProvider(system, user);
    const pick: LLMPick | null = parseLLMPick(modelText);
    if (!pick) {
      return Response.json({
        result: local,
        source: "local",
        llmError: "LLM returned no parseable design",
      });
    }
    const merged = mergeLLMDesign(local, pick, ctx);
    return Response.json({ result: merged, source: "llm" });
  } catch (err) {
    console.error("[a2ui/compile] LLM path failed:", err);
    return Response.json({
      result: local,
      source: "local",
      llmError: String(err),
    });
  }
}
