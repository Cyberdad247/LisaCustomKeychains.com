/**
 * 🛡️ KEYCHAIN VALIDATION MODULE
 *
 * THE SENTRY: Validates bead count based on physical yarn length.
 * Refactored to use Camelot OS Titanium utilities.
 *
 * @module @/lib/validation/keychain
 * @author SIR_OCTAVIAN (Invisioned Marketing Inc.)
 */

import { sovereignValidate, type SovereignResult } from "@/lib/camelot";
import {
  KeychainDesignSchema,
  type KeychainDesign,
  VibeNotesSchema,
  type VibeNotes,
} from "@/lib/camelot/schemas";

// Re-export the schema and type for backward compatibility
export { KeychainDesignSchema as KeychainSchema, type KeychainDesign };

/**
 * Validates the keychain design using Camelot's sovereign validation.
 * Implements Titanium Law #2: Defensive issues access pattern.
 *
 * @param data - Unknown data to validate
 * @returns SovereignResult with typed data or error string
 */
export function validateKeychain(
  data: unknown
): SovereignResult<KeychainDesign> {
  return sovereignValidate(KeychainDesignSchema, data);
}

/**
 * Validates vibe notes for Icon Shard customization.
 *
 * @param data - Unknown data to validate
 * @returns SovereignResult with typed data or error string
 */
export function validateVibeNotes(data: unknown): SovereignResult<VibeNotes> {
  return sovereignValidate(VibeNotesSchema, data);
}
