import { z } from "zod";

/**
 * THE SENTRY: Validates the vibe input string
 */
export const VibeInputSchema = z
  .string()
  .min(1)
  .max(30)
  .regex(/^[a-zA-Z0-9 ]+$/);

export interface VibeData {
  icon: string;
  colors: string[];
  label: string;
}

export const VIBE_LIBRARY: Record<string, VibeData> = {
  sports: {
    icon: "🏀",
    colors: ["#f97316", "#000000", "#ffffff"],
    label: "Sporty",
  },
  love: {
    icon: "❤️",
    colors: ["#ef4444", "#f9a8d4", "#800020"],
    label: "Romantic",
  },
  nature: {
    icon: "🌿",
    colors: ["#16a34a", "#78350f", "#BCB88A"],
    label: "Earthly",
  },
  music: {
    icon: "🎵",
    colors: ["#9333ea", "#312e81", "#E6E6FA"],
    label: "Lyrical",
  },
  sun: {
    icon: "☀️",
    colors: ["#facc15", "#fb923c", "#FFDAB9"],
    label: "Sunny",
  },
  star: {
    icon: "⭐",
    colors: ["#fef08a", "#52525b", "#36454F"],
    label: "Celestial",
  },
  gaming: {
    icon: "🎮",
    colors: ["#2563eb", "#18181b", "#000080"],
    label: "Gamer",
  },
  coffee: {
    icon: "☕",
    colors: ["#451a03", "#ffedd5", "#78350f"],
    label: "Cozy",
  },
  nurse: {
    icon: "🩺",
    colors: ["#0ea5e9", "#f8fafc", "#dc2626"],
    label: "Medical",
  },
  beach: {
    icon: "🏖️",
    colors: ["#38bdf8", "#fde047", "#BDFCC9"],
    label: "Coastal",
  },
  lavender: {
    icon: "🪻",
    colors: ["#E6E6FA", "#9333ea", "#f8fafc"],
    label: "Serene",
  },
  sage: {
    icon: "🍃",
    colors: ["#BCB88A", "#16a34a", "#f3f4f6"],
    label: "Natural",
  },
  butterfly: {
    icon: "🦋",
    colors: ["#60a5fa", "#f472b6", "#E6E6FA"],
    label: "Whimsical",
  },
  pizza: {
    icon: "🍕",
    colors: ["#ef4444", "#fbbf24", "#78350f"],
    label: "Foodie",
  },
  book: {
    icon: "📖",
    colors: ["#4b5563", "#d1d5db", "#ffffff"],
    label: "Academic",
  },
  moon: {
    icon: "🌙",
    colors: ["#1e293b", "#94a3b8", "#f1f5f9"],
    label: "Lunar",
  },
  fire: {
    icon: "🔥",
    colors: ["#dc2626", "#f97316", "#fde047"],
    label: "Energetic",
  },
  rainbow: {
    icon: "🌈",
    colors: ["#ef4444", "#3b82f6", "#10b981"],
    label: "Rainbow",
  },
  dog: {
    icon: "🐶",
    colors: ["#78350f", "#a16207", "#fef3c7"],
    label: "Puppy",
  },
  cat: {
    icon: "🐱",
    colors: ["#4b5563", "#9ca3af", "#f3f4f6"],
    label: "Kitty",
  },
  coding: {
    icon: "💻",
    colors: ["#000000", "#10b981", "#ffffff"],
    label: "Hacker",
  },
};

// 🚀 Optimization: Zero-latency Cache
const vibeCache = new Map<string, VibeData>();

/**
 * THE ROUTER: Standalone logic to match input to icons
 */
export function resolveVibe(input: string): VibeData {
  const cleanInput = input.toLowerCase().trim();

  if (vibeCache.has(cleanInput)) return vibeCache.get(cleanInput)!;

  // 1. Exact Match Check
  if (VIBE_LIBRARY[cleanInput]) {
    vibeCache.set(cleanInput, VIBE_LIBRARY[cleanInput]);
    return VIBE_LIBRARY[cleanInput];
  }

  // 2. Keyword Search (Built-in Logic)
  for (const [key, data] of Object.entries(VIBE_LIBRARY)) {
    if (cleanInput.includes(key)) {
      vibeCache.set(cleanInput, data);
      return data;
    }
  }

  // 3. FALLBACK: Default "Sparkle" Vibe
  const fallback = {
    icon: "✨",
    colors: ["#18181b", "#3f3f46"],
    label: "Custom",
  };
  vibeCache.set(cleanInput, fallback);
  return fallback;
}
