/**
 * 🎴 A2UI DESIGN CARTRIDGES (Hot-Swappable Presets)
 *
 * One-tap themed configurations that instantly shift the customization
 * surface — the storefront translation of "hot-swappable cartridges."
 * Each cartridge maps to real registry color/charm ids so resolution is
 * always valid against the builder's allowed pools.
 *
 * @module @/lib/a2ui/cartridges
 */

import { THREAD_COLORS, CHARM_OPTIONS } from "@/lib/camelot/registry";
import type { ColorOption, CharmOption } from "@/lib/camelot/schemas";
import type { A2UIContext } from "./compiler";

export interface DesignCartridge {
  id: string;
  name: string;
  description: string;
  glyph: string;
  /** Preferred color ids, first = primary. */
  colorIds: string[];
  /** Charm ids to preset (max 2). */
  charmIds: string[];
  /** Suggested text (only applied when the tier allows it). */
  text?: string;
  tags: string[];
}

export interface ResolvedCartridge {
  cartridge: DesignCartridge;
  color?: ColorOption;
  charms: CharmOption[];
  text?: string;
}

export const DESIGN_CARTRIDGES: DesignCartridge[] = [
  {
    id: "game-day",
    name: "Game Day",
    description: "Team-spirit energy with football and hoops.",
    glyph: "🏈",
    colorIds: ["orange", "black", "white"],
    charmIds: ["football", "basketball"],
    tags: ["sports", "team", "gift"],
  },
  {
    id: "forever-love",
    name: "Forever Love",
    description: "Soft romantic tones with heart charms.",
    glyph: "❤️",
    colorIds: ["pink", "red", "rose", "burgundy"],
    charmIds: ["hearts"],
    tags: ["love", "romantic", "gift"],
  },
  {
    id: "besties",
    name: "Besties",
    description: "Whimsical pastels for your favorite people.",
    glyph: "🦋",
    colorIds: ["lavender", "pink", "mint"],
    charmIds: ["butterflies", "flowers"],
    tags: ["friendship", "pastel", "gift"],
  },
  {
    id: "coastal-breeze",
    name: "Coastal Breeze",
    description: "Sun, sand, and ocean-cool threads.",
    glyph: "🏖️",
    colorIds: ["teal", "blue", "peach"],
    charmIds: ["stars", "butterflies"],
    tags: ["beach", "summer", "calm"],
  },
  {
    id: "nature-walk",
    name: "Nature Walk",
    description: "Earthy greens and botanical charm.",
    glyph: "🌿",
    colorIds: ["sage", "green", "brown"],
    charmIds: ["flowers", "butterflies"],
    tags: ["nature", "earthy", "calm"],
  },
  {
    id: "celestial",
    name: "Celestial",
    description: "Night-sky blues and star charms.",
    glyph: "⭐",
    colorIds: ["navy", "violet", "lavender"],
    charmIds: ["stars"],
    tags: ["stars", "moon", "dreamy"],
  },
  {
    id: "little-champ",
    name: "Little Champ",
    description: "Bright and playful for the young athletes.",
    glyph: "🏆",
    colorIds: ["blue", "red", "yellow"],
    charmIds: ["soccer", "softball"],
    tags: ["kids", "sports", "school"],
  },
  {
    id: "coffee-lover",
    name: "Coffee Lover",
    description: "Warm café tones for the cozy at heart.",
    glyph: "☕",
    colorIds: ["brown", "charcoal", "peach"],
    charmIds: ["hearts", "stars"],
    tags: ["cozy", "cafe", "gift"],
  },
];

/** Resolves a cartridge against the consumer's constraints. Never throws. */
export function resolveCartridge(
  cartridge: DesignCartridge,
  ctx: A2UIContext
): ResolvedCartridge {
  const colorPool = ctx.allowedColors?.length
    ? THREAD_COLORS.filter((c) => ctx.allowedColors!.includes(c.id))
    : THREAD_COLORS;

  const charmPool =
    ctx.charmCategory === "sports"
      ? CHARM_OPTIONS.filter((c) =>
          ["football", "basketball", "soccer", "softball", "volleyball", "tennis-balls", "bowling-pins"].includes(c.id)
        )
      : CHARM_OPTIONS;

  // Respect the cartridge's preference order, not registry order.
  const color =
    cartridge.colorIds
      .map((id) => colorPool.find((c) => c.id === id))
      .find((c): c is ColorOption => Boolean(c)) ?? colorPool[0];
  const charms = cartridge.charmIds
    .map((id) => charmPool.find((c) => c.id === id))
    .filter((c): c is CharmOption => Boolean(c))
    .slice(0, 2);

  const allowText = !ctx.lockLetters && ctx.tier > 1;
  const text =
    allowText && cartridge.text
      ? cartridge.text.toUpperCase().slice(0, ctx.tier === 3 ? 16 : 8)
      : undefined;

  return { cartridge, color, charms, text };
}
