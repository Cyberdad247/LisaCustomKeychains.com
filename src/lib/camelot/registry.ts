/**
 * 🏰 CAMELOT REGISTRY
 * 
 * Central registry for static data, configuration, and options.
 * This file consolidates constants that are used across multiple components.
 * 
 * @module @/lib/camelot/registry
 */

import { type ColorOption, type CharmOption } from "./schemas";

/**
 * Standard thread colors for customization.
 */
export const THREAD_COLORS: ColorOption[] = [
    { id: "purple", name: "Royal Purple", hex: "#9333ea" },
    { id: "pink", name: "Soft Pink", hex: "#ec4899" },
    { id: "blue", name: "Sky Blue", hex: "#3b82f6" },
    { id: "lavender", name: "Lavender Mist", hex: "#E6E6FA" },
    { id: "mint", name: "Fresh Mint", hex: "#BDFCC9" },
    { id: "black", name: "Void Black", hex: "#18181b" },
    { id: "charcoal", name: "Charcoal Silk", hex: "#36454F" },
    { id: "rose", name: "Rose", hex: "#fb7185" },
    { id: "burgundy", name: "Classic Burgundy", hex: "#800020" },
    { id: "red", name: "Crimson Red", hex: "#dc2626" },
    { id: "orange", name: "Amber Orange", hex: "#f59e0b" },
    { id: "peach", name: "Sweet Peach", hex: "#FFDAB9" },
    { id: "yellow", name: "Golden Yellow", hex: "#fbbf24" },
    { id: "green", name: "Emerald Green", hex: "#10b981" },
    { id: "sage", name: "Velvet Sage", hex: "#BCB88A" },
    { id: "white", name: "Cloud White", hex: "#f8fafc" },
    { id: "grey", name: "Slate Grey", hex: "#475569" },
    { id: "brown", name: "Earth Brown", hex: "#451a03" },
    { id: "indigo", name: "Indigo Deep", hex: "#4338ca" },
    { id: "navy", name: "Midnight Navy", hex: "#000080" },
    { id: "teal", name: "Ocean Teal", hex: "#0d9488" },
    { id: "coral", name: "Sun Coral", hex: "#ff7f50" },
    { id: "violet", name: "Neon Violet", hex: "#a855f7" },
    {
        id: "rainbow",
        name: "Rainbow",
        hex: "linear-gradient(to bottom, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)",
        isRainbow: true,
    },
];

/**
 * Standard charms for customization.
 */
export const CHARM_OPTIONS: CharmOption[] = [
    { id: "heart", name: "Heart", icon: "❤️" },
    { id: "star", name: "Star", icon: "⭐" },
    { id: "butterfly", name: "Butterfly", icon: "🦋" },
    { id: "flower", name: "Flower", icon: "🌸" },
    { id: "diamond", name: "Diamond", icon: "💎" },
    { id: "moon", name: "Moon", icon: "🌙" },
    { id: "sun", name: "Sun", icon: "☀️" },
    { id: "clover", name: "Clover", icon: "🍀" },
    { id: "bow", name: "Bow", icon: "🎀" },
    { id: "rainbow", name: "Rainbow", icon: "🌈" },
    { id: "bouquet", name: "Bouquet", icon: "💐" },
    { id: "sparkles", name: "Sparkles", icon: "✨" },
    { id: "coffee", name: "Coffee", icon: "☕" },
    { id: "cat", name: "Kitty", icon: "🐱" },
    { id: "dog", name: "Puppy", icon: "🐶" },
    { id: "pizza", name: "Pizza", icon: "🍕" },
    { id: "cloud", name: "Cloud", icon: "☁️" },
    { id: "lightning", name: "Volt", icon: "⚡" },
    { id: "alien", name: "Zorp", icon: "👽" },
];

/**
 * Null charm option (used for earrings/slots).
 */
export const NULL_CHARM: CharmOption = { id: "none", name: "No Charm", icon: "" };
