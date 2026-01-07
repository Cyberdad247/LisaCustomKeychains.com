/**
 * 🏰 CAMELOT_OS v56.5 TITANIUM CORE
 *
 * The executable implementation of the Titanium Laws.
 * This module provides type-safe utilities that enforce
 * the Sovereign IDE's governance protocols.
 *
 * @module @/lib/camelot
 * @author Lukas Swarm (Invisioned Marketing Inc.)
 */

import { z, ZodError, ZodSchema } from "zod";

// ============================================================
// TITANIUM LAW #2: Defensive Error Access Pattern
// ============================================================

/**
 * Safely extracts the first error message from a ZodError.
 * Implements Octavian's defensive issues access pattern:
 * `result.error.issues?.[0]?.message`
 *
 * @param error - The ZodError to extract from
 * @param fallback - Fallback message if extraction fails
 * @returns The first error message or fallback
 */
export function extractZodError(
  error: ZodError | null | undefined,
  fallback = "Validation failed"
): string {
  return error?.issues?.[0]?.message ?? fallback;
}

// ============================================================
// TITANIUM LAW #1: Type-Safe Validation Wrapper
// ============================================================

/**
 * Result type for sovereign validation operations.
 * Enforces explicit success/failure handling with no `any` types.
 */
export type SovereignResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: string };

/**
 * Wraps Zod schema validation with the Titanium Law patterns.
 *
 * @example
 * ```ts
 * const result = sovereignValidate(UserSchema, unknownData);
 * if (result.success) {
 *   console.log(result.data.name); // Type-safe access
 * } else {
 *   console.error(result.error); // String error message
 * }
 * ```
 */
export function sovereignValidate<T>(
  schema: ZodSchema<T>,
  data: unknown
): SovereignResult<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      data: null,
      error: extractZodError(result.error),
    };
  }

  return {
    success: true,
    data: result.data,
    error: null,
  };
}

// ============================================================
// KINETIC RUNE UTILITIES
// ============================================================

/**
 * Kinetic Rune identifiers for tracing operations.
 */
export const KINETIC_RUNES = {
  ACTUATE: "Ω_ACTUATE",
  KINETIC: "Ω_KINETIC",
  REFORGE: "Ω_REFORGE",
  BRIEF: "Ω_BRIEF",
  AUDIT: "Ω_AUDIT",
  BYPASS: "Ω_BYPASS",
  THINK: "Ω_THINK",
  STITCH: "Ω_STITCH",
} as const;

export type KineticRune = (typeof KINETIC_RUNES)[keyof typeof KINETIC_RUNES];

/**
 * Logs a Kinetic Rune operation for tracing.
 *
 * @param rune - The rune being invoked
 * @param action - Description of the action
 */
export function logRune(rune: KineticRune, action: string): void {
  if (process.env.NODE_ENV === "development") {
    console.log(`[${rune}] ${action}`);
  }
}

// ============================================================
// BIOMORPHIC SQUIRE PROTOCOLS
// ============================================================

/**
 * Squire class identifiers for operation categorization.
 */
export const SQUIRE_CLASS = {
  BEE: { id: "BEE", precision: "2-micron", responseMs: 100 },
  BEAVER: { id: "BEAVER", precision: "dam-breaking", responseHr: 24 },
  TERMITE: { id: "TERMITE", precision: "250kg", response: "continuous" },
} as const;

// ============================================================
// EXPORTS
// ============================================================

export { z } from "zod";
