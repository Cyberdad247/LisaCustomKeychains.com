/**
 * ⚡ A2UI COMPILER (Anya-to-UI Dynamics)
 *
 * Compiles free-text design intent into structured builder state:
 *
 *   Raw Intent ➔ [RENORMALIZE] ➔ [QUANTIZE] ➔ [GRILLE_GATE] ➔ Design
 *
 * - RENORMALIZE: strip noise/stopwords, preserve quoted + ALL-CAPS text.
 * - QUANTIZE:    map tokens onto the color, charm, and vibe registries.
 * - GRILLE_GATE: if required fields are missing, ASK_SOVEREIGN (report
 *                `missing`) instead of silently guessing.
 *
 * Fully deterministic and offline — no LLM dependency. Consumers apply the
 * compiled design to their own builder state via `onApply`.
 *
 * @module @/lib/a2ui/compiler
 */

import { THREAD_COLORS, CHARM_OPTIONS } from "@/lib/camelot/registry";
import { VIBE_LIBRARY } from "@/lib/vibeEngine";
import type { ColorOption, CharmOption } from "@/lib/camelot/schemas";

export type A2UIField = "color" | "charm" | "text";
export type A2UITier = 1 | 2 | 3;

/** Context that constrains what the compiler may resolve to. */
export interface A2UIContext {
  tier: A2UITier;
  /** Color IDs (registry) the consumer allows. Empty/undefined = all. */
  allowedColors?: string[];
  /** Charm pool filter, e.g. "sports". Empty/undefined = all. */
  charmCategory?: string;
  /** When true, text is not permitted (locked letters / earrings). */
  lockLetters?: boolean;
}

/** Structured design produced by the compiler. */
export interface CompiledDesign {
  color?: ColorOption;
  charms: CharmOption[];
  text?: string;
  vibeLabel?: string;
}

export interface A2UICompileResult {
  raw: string;
  design: CompiledDesign;
  /** Fields the gate could not resolve — ASK_SOVEREIGN payload. */
  missing: A2UIField[];
  /** Renormalization trace — surfaced for transparency in the UI. */
  trace: string[];
  /** 0..1 confidence based on how many resolvable fields were found. */
  confidence: number;
}

// ---------------------------------------------------------------------------
// Registries
// ---------------------------------------------------------------------------

/** Color id → alias tokens (lowercased). First alias is the display name. */
const COLOR_ALIASES: Record<string, string[]> = {
  purple: ["purple", "royal", "violet"],
  pink: ["pink", "soft pink"],
  blue: ["blue", "sky", "sky blue"],
  lavender: ["lavender", "lavender mist"],
  mint: ["mint", "fresh mint"],
  black: ["black", "void", "void black"],
  charcoal: ["charcoal", "charcoal silk"],
  rose: ["rose"],
  burgundy: ["burgundy", "classic burgundy"],
  red: ["red", "crimson", "crimson red"],
  orange: ["orange", "amber", "amber orange"],
  peach: ["peach", "sweet peach"],
  yellow: ["yellow", "gold", "golden", "golden yellow"],
  green: ["green", "emerald", "emerald green"],
  sage: ["sage", "velvet sage"],
  white: ["white", "cloud", "cloud white"],
  grey: ["grey", "gray", "slate", "slate grey"],
  brown: ["brown", "earth", "earth brown"],
  indigo: ["indigo", "indigo deep"],
  navy: ["navy", "midnight navy", "midnight"],
  teal: ["teal", "ocean", "ocean teal"],
  coral: ["coral", "sun coral"],
  rainbow: ["rainbow"],
};

/** Charm id → alias tokens. Also maps vibe words onto charms. */
const CHARM_ALIASES: Record<string, string[]> = {
  football: ["football"],
  basketball: ["basketball", "bball", "hoops"],
  soccer: ["soccer"],
  softball: ["softball"],
  stars: ["stars", "star", "celestial", "sparkle"],
  hearts: ["hearts", "heart", "love", "romantic"],
  butterflies: ["butterflies", "butterfly", "whimsical"],
  flowers: ["flowers", "flower", "floral", "nature", "garden"],
  skulls: ["skulls", "skull", "gothic", "spooky"],
  volleyball: ["volleyball"],
  "tennis-balls": ["tennis", "tennis balls"],
  "bowling-pins": ["bowling", "bowling pins"],
};

const SPORTS_CHARM_IDS = [
  "football",
  "basketball",
  "soccer",
  "softball",
  "volleyball",
  "tennis-balls",
  "bowling-pins",
];

/** Stopwords stripped during renormalization. */
const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "for", "with", "my", "me", "i", "of", "to",
  "in", "on", "at", "is", "are", "want", "like", "please", "make", "making",
  "design", "keychain", "keychains", "color", "colored", "charm", "charms",
  "beads", "bead", "thread", "yarn", "style", "custom", "one", "some", "it",
  "this", "that", "for", "son", "daughter", "him", "her", "them", "their",
]);

// ---------------------------------------------------------------------------
// RENORMALIZE
// ---------------------------------------------------------------------------

interface NormalizedIntent {
  /** Lowercased tokens (noise stripped). */
  tokens: string[];
  /** Original uppercase runs — candidate text (beads). */
  upperWords: string[];
  /** Quoted segments — strong text candidates. */
  quoted: string[];
  raw: string;
}

function renormalize(raw: string): NormalizedIntent {
  const trimmed = raw.trim();

  // Quoted segments first: "JAYDEN" or 'JAYDEN'
  const quoted = Array.from(trimmed.matchAll(/"([^"]+)"|'([^']+)'/g)).map(
    (m) => m[1] ?? m[2] ?? ""
  );

  // Uppercase runs of 2+ chars (e.g., JAYDEN, CLASS OF 2026)
  const upperWords = Array.from(
    trimmed.matchAll(/\b([A-Z][A-Z0-9 .&'-]{1,20})\b/g)
  )
    .map((m) => m[1])
    .filter((w) => w.replace(/[^A-Z0-9]/g, "").length >= 2);

  // Strip quotes/punctuation, lowercase, split.
  const cleaned = trimmed
    .replace(/["']/g, " ")
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .toLowerCase();
  const tokens = cleaned.split(/\s+/).filter(Boolean);

  return { tokens, upperWords, quoted, raw: trimmed };
}

// ---------------------------------------------------------------------------
// QUANTIZE
// ---------------------------------------------------------------------------

function filterColors(ctx: A2UIContext): ColorOption[] {
  const pool = ctx.allowedColors?.length
    ? THREAD_COLORS.filter((c) => ctx.allowedColors!.includes(c.id))
    : THREAD_COLORS;
  return pool.length ? pool : THREAD_COLORS;
}

function filterCharms(ctx: A2UIContext): CharmOption[] {
  let pool = CHARM_OPTIONS;
  if (ctx.charmCategory === "sports") {
    pool = pool.filter((c) => SPORTS_CHARM_IDS.includes(c.id));
  }
  return pool.length ? pool : CHARM_OPTIONS;
}

function scoreTokens(
  tokens: string[],
  aliases: Record<string, string[]>
): Map<string, number> {
  const scores = new Map<string, number>();
  for (const [id, words] of Object.entries(aliases)) {
    let hits = 0;
    for (const word of words) {
      if (tokens.includes(word)) {
        hits += word.includes(" ") ? 2 : 1; // multi-word alias = stronger
      } else if (tokens.some((t) => word.startsWith(t) && t.length >= 3)) {
        hits += 0.5; // partial match, e.g. "purp" → purple
      }
    }
    if (hits > 0) scores.set(id, hits);
  }
  return scores;
}

function resolveColor(
  tokens: string[],
  ctx: A2UIContext
): ColorOption | undefined {
  const pool = filterColors(ctx);
  const scores = scoreTokens(tokens, COLOR_ALIASES);
  let best: { color: ColorOption; score: number } | undefined;
  for (const color of pool) {
    const score = scores.get(color.id) ?? 0;
    if (score > 0 && (!best || score > best.score)) {
      best = { color, score };
    }
  }
  return best?.color;
}

function resolveCharms(
  tokens: string[],
  ctx: A2UIContext,
  limit: number
): CharmOption[] {
  const pool = filterCharms(ctx);
  const scores = scoreTokens(tokens, CHARM_ALIASES);
  const ranked = pool
    .map((charm) => ({ charm, score: scores.get(charm.id) ?? 0 }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
  return ranked.slice(0, limit).map((entry) => entry.charm);
}

function resolveVibe(tokens: string[]): string | undefined {
  for (const [key, data] of Object.entries(VIBE_LIBRARY)) {
    if (tokens.includes(key)) return data.label;
  }
  return undefined;
}

/**
 * Extracts beaded text from quoted segments and ALL-CAPS runs.
 * Words that already resolved as a color/charm are excluded so
 * "BLUE FOOTBALL JAYDEN" produces text "JAYDEN", not "FOOTBALL".
 */
function extractText(
  normalized: NormalizedIntent,
  limit: number,
  excluded: Set<string>
): string | undefined {
  // Quoted segments win; then whole uppercase runs; then individual words
  // from those runs (so "FOOTBALL JAYDEN" also yields "JAYDEN").
  const entries = [
    ...normalized.quoted.map((q) => ({ raw: q, quoted: true })),
    ...normalized.upperWords.map((w) => ({ raw: w, quoted: false })),
    ...normalized.upperWords.flatMap((w) =>
      w.split(/\s+/).map((word) => ({ raw: word, quoted: false }))
    ),
  ];

  const candidates = entries
    .map((e) => ({
      ...e,
      cleaned: e.raw
        .toUpperCase()
        .replace(/[^A-Z0-9 .&'-]/g, "")
        .trim(),
    }))
    .filter((c) => c.cleaned.replace(/[^A-Z0-9]/g, "").length >= 2)
    .filter((c) => {
      const words = c.cleaned.toLowerCase().split(/\s+/);
      return words.every((w) => !excluded.has(w));
    })
    .sort(
      (a, b) =>
        Number(b.quoted) - Number(a.quoted) ||
        b.cleaned.length - a.cleaned.length
    );

  const best = candidates[0];
  if (!best) return undefined;
  return best.cleaned.replace(/\s+/g, " ").slice(0, limit);
}

// ---------------------------------------------------------------------------
// GRILLE_GATE
// ---------------------------------------------------------------------------

export function requiredFields(ctx: A2UIContext): A2UIField[] {
  const fields: A2UIField[] = ["color"];
  if (!ctx.lockLetters && ctx.tier > 1) fields.push("text");
  return fields;
}

/**
 * 0..1 confidence that the required fields were resolved. Shared by the
 * deterministic compiler and the LLM merge path so both report identically.
 */
export function computeConfidence(
  ctx: A2UIContext,
  design: CompiledDesign
): number {
  const required = requiredFields(ctx);
  const found = required.filter((f) =>
    f === "color" ? Boolean(design.color) : Boolean(design.text)
  ).length;
  const charmBonus = design.charms.length ? 0.75 : 0;
  return Math.min(1, (found + charmBonus) / (required.length + 1));
}

// ---------------------------------------------------------------------------
// Compiler entry
// ---------------------------------------------------------------------------

/**
 * Compiles raw design intent into a structured design.
 * Never throws: unresolvable fields are reported via `missing` (ASK_SOVEREIGN).
 */
export function compileDesignIntent(
  raw: string,
  ctx: A2UIContext
): A2UICompileResult {
  const normalized = renormalize(raw);
  const trace: string[] = [
    `⚡ RENORMALIZE — ${normalized.tokens.length} tokens`,
  ];

  const color = resolveColor(normalized.tokens, ctx);
  if (color) trace.push(`🧪 QUANTIZE — color → ${color.name}`);

  const charmLimit = 2;
  const charms = resolveCharms(normalized.tokens, ctx, charmLimit);
  if (charms.length) {
    trace.push(`🧪 QUANTIZE — charms → ${charms.map((c) => c.name).join(" + ")}`);
  }

  const vibeLabel = resolveVibe(normalized.tokens);
  if (vibeLabel) trace.push(`🧪 QUANTIZE — vibe → ${vibeLabel}`);

  // Exclude tokens that already resolved as color/charm from text extraction.
  const excluded = new Set<string>();
  if (color) for (const w of COLOR_ALIASES[color.id] ?? []) excluded.add(w);
  for (const c of charms) {
    for (const w of CHARM_ALIASES[c.id] ?? []) excluded.add(w);
  }

  const charLimit = ctx.tier === 3 ? 16 : 8;
  let text: string | undefined;
  if (!ctx.lockLetters && ctx.tier > 1) {
    text = extractText(normalized, charLimit, excluded);
    if (text) trace.push(`🧪 QUANTIZE — text → ${text}`);
  } else {
    trace.push(`🧪 QUANTIZE — text suppressed (tier ${ctx.tier})`);
  }

  // ── GRILLE_GATE — ASK_SOVEREIGN for anything missing ──────────────────
  const missing: A2UIField[] = [];
  if (!color) missing.push("color");
  // Charms are required on letter-bearing tiers; tier 1 is color-only.
  if (ctx.tier > 1 && !charms.length) missing.push("charm");
  if (!text && !ctx.lockLetters && ctx.tier > 1) missing.push("text");
  trace.push(
    missing.length
      ? `🛡️ GRILLE_GATE — asking sovereign for: ${missing.join(", ")}`
      : `⚖️ GRILLE_GATE — all required fields resolved`
  );

  const design: CompiledDesign = {
    ...(color ? { color } : {}),
    charms,
    ...(text ? { text } : {}),
    ...(vibeLabel ? { vibeLabel } : {}),
  };

  const confidence = computeConfidence(ctx, design);

  return { raw, design, missing, trace, confidence };
}

/** True when a charm id is available in the given context (UI quick-picks). */
export function isCharmAvailable(id: string, ctx: A2UIContext): boolean {
  return filterCharms(ctx).some((c) => c.id === id);
}

/** Exposed for tooling/tests. */
export function colorPoolFor(ctx: A2UIContext): ColorOption[] {
  return filterColors(ctx);
}

/** Exposed for tooling/tests. */
export function charmPoolFor(ctx: A2UIContext): CharmOption[] {
  return filterCharms(ctx);
}
