/**
 * 🧠 A2UI LLM FALLBACK — deep-compile path for the intent compiler.
 *
 * The deterministic compiler (compiler.ts) always runs first — instant and
 * offline. When it leaves required fields unresolved (GRILLE_GATE would ask),
 * this module optionally escalates to an LLM for richer parsing:
 *
 *   local compile ➔ GRILLE_GATE still missing ➔ 🧠 DEEP COMPILE (LLM) ➔ merge
 *
 * The LLM's raw output is never trusted: every pick is validated against the
 * real registry pools + context (allowed colors, charm category, tier char
 * limit) before it fills a gap. If no provider is configured or the call
 * fails, the caller keeps the deterministic result — the fallback is a pure
 * enhancement, never a hard dependency.
 *
 * Isomorphic: the merge logic runs server-side in the API route; the client
 * helper below is the thin fetch wrapper components use.
 *
 * @module @/lib/a2ui/llm
 */

import { z } from "zod";
import { VIBE_LIBRARY } from "@/lib/vibeEngine";
import {
  colorPoolFor,
  charmPoolFor,
  computeConfidence,
  requiredFields,
  type A2UIContext,
  type A2UICompileResult,
  type A2UIField,
  type CompiledDesign,
} from "@/lib/a2ui/compiler";
import type { CharmOption } from "@/lib/camelot/schemas";

// ---------------------------------------------------------------------------
// LLM pick contract
// ---------------------------------------------------------------------------

/** Structured attributes the LLM may extract from the raw intent. */
export interface LLMPick {
  colorId?: string | null;
  charmIds?: string[];
  text?: string | null;
  vibeLabel?: string | null;
  /** Short human-readable note about what the model inferred. */
  explanation?: string | null;
}

export const LLMPickSchema = z.object({
  colorId: z.string().max(40).nullable().optional(),
  charmIds: z.array(z.string().max(40)).max(5).optional(),
  text: z.string().max(64).nullable().optional(),
  vibeLabel: z.string().max(40).nullable().optional(),
  explanation: z.string().max(200).nullable().optional(),
});

/**
 * Extracts an LLMPick from raw model output. Tolerates ```json fences and
 * surrounding prose; returns null when no valid JSON object is present.
 */
export function parseLLMPick(text: string): LLMPick | null {
  const cleaned = text.replace(/```(?:json)?/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed: unknown = JSON.parse(cleaned.slice(start, end + 1));
    const result = LLMPickSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Trigger rule
// ---------------------------------------------------------------------------

/**
 * When to escalate to the LLM: exactly when the deterministic compiler left a
 * required field unresolved. Fully-resolved compiles stay instant and offline.
 */
export function shouldUseLLM(result: A2UICompileResult): boolean {
  return result.missing.length > 0;
}

// ---------------------------------------------------------------------------
// Merge (server-side source of truth)
// ---------------------------------------------------------------------------

function matchVibeLabel(label: string): string | undefined {
  const l = label.trim().toLowerCase();
  for (const [key, data] of Object.entries(VIBE_LIBRARY)) {
    if (data.label.toLowerCase() === l || key === l) return data.label;
  }
  return undefined;
}

/**
 * Merges a validated LLM pick into the deterministic result, filling ONLY the
 * fields the local compiler left missing. Every pick is re-checked against the
 * context pools, so the model can never inject an invalid color/charm or
 * overrun the tier char limit. Returns a fresh A2UICompileResult with
 * recomputed missing/trace/confidence.
 */
export function mergeLLMDesign(
  local: A2UICompileResult,
  pick: LLMPick,
  ctx: A2UIContext
): A2UICompileResult {
  const design: CompiledDesign = { ...local.design };
  const missing = new Set<A2UIField>(local.missing);

  // ── color ────────────────────────────────────────────────────────────────
  if (missing.has("color") && pick.colorId) {
    const found = colorPoolFor(ctx).find((c) => c.id === pick.colorId);
    if (found) design.color = found;
  }

  // ── charms ───────────────────────────────────────────────────────────────
  if (missing.has("charm") && pick.charmIds?.length) {
    const pool = charmPoolFor(ctx);
    const valid = pick.charmIds
      .map((id) => pool.find((c) => c.id === id))
      .filter((c): c is CharmOption => Boolean(c))
      .slice(0, 2);
    if (valid.length) design.charms = valid;
  }

  // ── text ─────────────────────────────────────────────────────────────────
  // Stricter than the deterministic path: only [A-Z0-9 ] survives, matching
  // KeychainDesignSchema exactly so LLM-derived text can never fail checkout.
  if (missing.has("text") && pick.text) {
    const cleaned = pick.text
      .toUpperCase()
      .replace(/[^A-Z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, " ");
    if (cleaned) {
      design.text = cleaned.slice(0, ctx.tier === 3 ? 16 : 8);
    }
  }

  // ── vibe ─────────────────────────────────────────────────────────────────
  if (!design.vibeLabel && pick.vibeLabel) {
    const label = matchVibeLabel(pick.vibeLabel);
    if (label) design.vibeLabel = label;
  }

  // ── recompute gate state ─────────────────────────────────────────────────
  // Mirrors compileDesignIntent's gate exactly (charm is required on tier>1
  // even though it contributes as a confidence bonus, not a required field).
  const recomputedMissing: A2UIField[] = [];
  if (!design.color) recomputedMissing.push("color");
  if (ctx.tier > 1 && !design.charms.length) recomputedMissing.push("charm");
  if (!design.text && !ctx.lockLetters && ctx.tier > 1)
    recomputedMissing.push("text");

  const gateFree = local.trace.filter(
    (line) =>
      !line.startsWith("🛡️ GRILLE_GATE") && !line.startsWith("⚖️ GRILLE_GATE")
  );
  const trace = [
    ...gateFree,
    pick.explanation
      ? `🧠 DEEP COMPILE — ${pick.explanation}`
      : "🧠 DEEP COMPILE — LLM refined intent",
    recomputedMissing.length
      ? `🛡️ GRILLE_GATE — asking sovereign for: ${recomputedMissing.join(", ")}`
      : "⚖️ GRILLE_GATE — all required fields resolved",
  ];

  return {
    raw: local.raw,
    design,
    missing: recomputedMissing,
    trace,
    confidence: computeConfidence(ctx, design),
  };
}

// ---------------------------------------------------------------------------
// Client helper
// ---------------------------------------------------------------------------

export interface LLMCompileResponse {
  /** Merged result when the LLM path ran; the deterministic result otherwise. */
  result: A2UICompileResult | null;
  source: "llm" | "local";
  llmError?: string | null;
}

/**
 * Calls POST /api/a2ui/compile (server does provider resolution + validation).
 * Never throws for LLM/network failures — returns `source: "local"` so callers
 * keep their deterministic result. The only rejection is a non-OK response
 * from the server itself.
 */
export async function llmCompileDesign(
  raw: string,
  ctx: A2UIContext,
  signal?: AbortSignal
): Promise<LLMCompileResponse> {
  let res: Response;
  try {
    res = await fetch("/api/a2ui/compile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        raw,
        tier: ctx.tier,
        allowedColors: ctx.allowedColors,
        charmCategory: ctx.charmCategory,
        lockLetters: ctx.lockLetters,
      }),
      signal,
    });
  } catch {
    // Network failure or abort — fall back to the deterministic result.
    return { result: null, source: "local" };
  }

  if (!res.ok) {
    return { result: null, source: "local" };
  }

  try {
    const data = (await res.json()) as LLMCompileResponse;
    if (data.source === "llm" && data.result) {
      return { result: data.result, source: "llm", llmError: data.llmError };
    }
    return { result: data.result, source: "local", llmError: data.llmError };
  } catch {
    return { result: null, source: "local" };
  }
}
