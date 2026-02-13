/**
 * 🛡️ EARRING VALIDATION MODULE
 *
 * THE SENTRY: Validates earring designs with 4-letter limit and matching pair logic.
 * Follows Camelot OS Titanium utilities pattern.
 *
 * @module @/lib/validation/earring
 * @author Merlin_Ω (Camelot OS v203.2)
 */

import { sovereignValidate, type SovereignResult } from "@/lib/camelot";
import {
    EarringDesignSchema,
    type EarringDesign,
} from "@/lib/camelot/schemas";

// Re-export schema and type for external use
export { EarringDesignSchema, type EarringDesign };

/**
 * Validates the earring design using Camelot's sovereign validation.
 * Implements Titanium Law #2: Defensive issues access pattern.
 *
 * @param data - Unknown data to validate
 * @returns SovereignResult with typed data or error string
 */
export function validateEarring(
    data: unknown
): SovereignResult<EarringDesign> {
    return sovereignValidate(EarringDesignSchema, data);
}
