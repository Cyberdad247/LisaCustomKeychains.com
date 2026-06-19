// Config Agent — the SAFE_MODE brain behind the conversational storefront editor.
//
// Containment model: the agent can ONLY produce a partial StorefrontConfig
// ("patch"). That patch is deep-merged onto the *current* config and then
// validated by StorefrontConfigSchema. Anything that isn't a valid config is
// rejected. The LLM cannot emit code, touch the repo, or persist anything —
// this module never writes. Persistence is a separate, explicit, owner-clicked
// step (human-in-the-loop). Products/inventory/checkout stay in Shopify.

import {
  StorefrontConfigSchema,
  type StorefrontConfig,
} from "./storefront-config";

export type AIProvider = "anthropic" | "gemini" | "ollama";

export type ConfigProposal = {
  reply: string;
  patch: Record<string, unknown> | null;
};

/** Same precedence as the Bifrost assist route: free/local first. */
export function resolveProvider(): AIProvider | null {
  const explicit = process.env.AI_PROVIDER as AIProvider | undefined;
  if (explicit && ["anthropic", "gemini", "ollama"].includes(explicit)) return explicit;
  if (process.env.OLLAMA_BASE_URL) return "ollama";
  if (process.env.GOOGLE_AI_API_KEY) return "gemini";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

/**
 * Deep-merge `patch` onto `base`. Plain objects merge recursively; arrays and
 * scalars replace wholesale (so e.g. productSlots is replaced as a unit, never
 * half-merged). Returns a new object; never mutates inputs.
 */
export function deepMerge<T extends Record<string, unknown>>(
  base: T,
  patch: Record<string, unknown>,
): T {
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    const existing = out[key];
    if (isPlainObject(value) && isPlainObject(existing)) {
      out[key] = deepMerge(existing, value);
    } else {
      out[key] = value;
    }
  }
  return out as T;
}

function flatten(value: unknown, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  if (Array.isArray(value)) {
    value.forEach((item, i) => Object.assign(out, flatten(item, `${prefix}[${i}]`)));
  } else if (isPlainObject(value)) {
    for (const [k, v] of Object.entries(value)) {
      Object.assign(out, flatten(v, prefix ? `${prefix}.${k}` : k));
    }
  } else {
    out[prefix] = String(value);
  }
  return out;
}

/** Human-readable list of leaf-level changes between two configs. */
export function computeChanges(
  before: StorefrontConfig,
  after: StorefrontConfig,
): Array<{ path: string; before: string; after: string }> {
  const flatBefore = flatten(before);
  const flatAfter = flatten(after);
  const keys = Object.keys(flatBefore);
  for (const key of Object.keys(flatAfter)) {
    if (!(key in flatBefore)) keys.push(key);
  }
  const changes: Array<{ path: string; before: string; after: string }> = [];
  for (const key of keys) {
    const b = flatBefore[key] ?? "(none)";
    const a = flatAfter[key] ?? "(none)";
    if (b !== a) changes.push({ path: key, before: b, after: a });
  }
  return changes.sort((x, y) => x.path.localeCompare(y.path));
}

/**
 * Extract a `{ reply, patch }` proposal from raw model output. Tolerates
 * ```json fences and surrounding prose by locating the first balanced JSON
 * object. Throws if no usable object is found.
 */
export function parseProposal(raw: string): ConfigProposal {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : raw).trim();

  let jsonText = candidate;
  if (!candidate.startsWith("{")) {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("No JSON object found in model output.");
    }
    jsonText = candidate.slice(start, end + 1);
  }

  const parsed = JSON.parse(jsonText) as Record<string, unknown>;
  const reply = typeof parsed.reply === "string" ? parsed.reply : "";
  const patch = isPlainObject(parsed.patch) ? parsed.patch : null;
  return { reply, patch };
}

/**
 * Apply a proposed patch and validate. Returns the validated config or a list
 * of validation errors. Does NOT persist.
 */
export function applyAndValidate(
  current: StorefrontConfig,
  patch: Record<string, unknown> | null,
):
  | { ok: true; config: StorefrontConfig; changes: ReturnType<typeof computeChanges> }
  | { ok: false; errors: string[] } {
  if (!patch) return { ok: true, config: current, changes: [] };
  const merged = deepMerge(current as unknown as Record<string, unknown>, patch);
  const result = StorefrontConfigSchema.safeParse(merged);
  if (!result.success) {
    return {
      ok: false,
      errors: result.error.issues.map(
        (i) => `${i.path.join(".") || "(root)"}: ${i.message}`,
      ),
    };
  }
  return {
    ok: true,
    config: result.data,
    changes: computeChanges(current, result.data),
  };
}

export function buildSystemPrompt(current: StorefrontConfig): string {
  return `You are the editor agent for "Lisa's Custom Keychains", a handmade macrame keychain and earring storefront. You help Lisa edit her public storefront by conversation.

STRICT CONTAINMENT RULES:
- You can ONLY change fields in the StorefrontConfig JSON below. You cannot run code, deploy, or change anything else.
- Products, prices, inventory, and checkout live in Shopify — you cannot touch them. If asked, explain that politely and set "patch" to null.
- You output ONLY a single JSON object, nothing else, in this exact shape:
  {"reply": "<short friendly message to Lisa>", "patch": <object with only the fields to change, same nested shape as the config> or null}
- "patch" must contain only the keys that change (deep-merged onto the current config). Use null when you are only answering a question or refusing.
- Constraints you must respect: brand.accent must be a hex color like "#ff66cc". Respect these max lengths — hero.headlineTop/headlineAccent <=80, hero.subcopy <=320, announcement <=140, social.headline <=100, social.body <=280. Keep Lisa's warm, artisan, non-corporate voice. Avoid more than one exclamation mark.
- For arrays (productSlots, homepageSections) include the FULL array if you change any item.
- Never invent new top-level keys.

CURRENT CONFIG (this is the live state — treat it as ground truth):
${JSON.stringify(current)}`;
}

// ─── Non-streaming completion across providers ───────────────────────────────

const MAX_TOKENS = 1500;

async function completeAnthropic(system: string, user: string): Promise<string> {
  const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: MAX_TOKENS,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { content?: Array<{ text?: string }> };
  return data.content?.map((c) => c.text ?? "").join("") ?? "";
}

async function completeGemini(system: string, user: string): Promise<string> {
  const model = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { maxOutputTokens: MAX_TOKENS, temperature: 0.4 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
}

async function completeOllama(system: string, user: string): Promise<string> {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL ?? "llama3.2";
  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model,
      max_tokens: MAX_TOKENS,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Ollama ${res.status} — is Ollama running?`);
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? "";
}

export async function complete(
  provider: AIProvider,
  system: string,
  user: string,
): Promise<string> {
  if (provider === "gemini") return completeGemini(system, user);
  if (provider === "ollama") return completeOllama(system, user);
  return completeAnthropic(system, user);
}
