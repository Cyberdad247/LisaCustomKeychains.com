/**
 * 🛡️ TITANIUM LAWS ENFORCEMENT
 *
 * Runtime utilities for enforcing the Titanium Laws.
 * Use these in development to catch violations early.
 *
 * @module @/lib/camelot/laws
 * @author SIR_OCTAVIAN (Invisioned Marketing Inc.)
 */

import { logRune, KINETIC_RUNES } from "./index";

// ============================================================
// LAW ENFORCEMENT TYPES
// ============================================================

export interface LawViolation {
  law: number;
  description: string;
  location: string;
  severity: "warning" | "error" | "critical";
}

export type LawAuditResult = {
  passed: boolean;
  violations: LawViolation[];
  timestamp: string;
};

// ============================================================
// LAW DESCRIPTIONS
// ============================================================

export const TITANIUM_LAWS = {
  LAW_1: {
    id: 1,
    name: "No_Implicit_Any",
    description:
      "All types must be explicitly defined. No `any` types allowed.",
    enforcement: "tsconfig.json: noImplicitAny: true",
  },
  LAW_2: {
    id: 2,
    name: "Zod_Issues_Access",
    description:
      "Defensive error access pattern: result.error.issues?.[0]?.message",
    enforcement: "Use sovereignValidate() from @/lib/camelot",
  },
  LAW_3: {
    id: 3,
    name: "Direct_Handshake",
    description:
      "Client to Modal direct connection to bypass Vercel 10s limit.",
    enforcement: "CORS-enabled Modal.com endpoints",
  },
  LAW_4: {
    id: 4,
    name: "WASM_Python",
    description: "Pyodide for client-side Python preflight operations.",
    enforcement: "Load Pyodide in service worker",
  },
  LAW_5: {
    id: 5,
    name: "RLM_Protocol",
    description: "Recursive development: Shard → Scratchpad → Stitch",
    enforcement: "Atomic commits, feature branches",
  },
} as const;

// ============================================================
// DEVELOPMENT UTILITIES
// ============================================================

/**
 * Logs all active Titanium Laws to console in development.
 * Useful for onboarding new developers.
 */
export function displayLaws(): void {
  if (process.env.NODE_ENV !== "development") return;

  logRune(KINETIC_RUNES.AUDIT, "Displaying Titanium Laws");

  console.log("\n🛡️ TITANIUM LAWS (v56.5)\n");
  Object.values(TITANIUM_LAWS).forEach((law) => {
    console.log(`  [${law.id}] ${law.name}`);
    console.log(`      ${law.description}`);
    console.log(`      → ${law.enforcement}\n`);
  });
}

/**
 * Creates a law violation record for audit logging.
 */
export function createViolation(
  law: keyof typeof TITANIUM_LAWS,
  location: string,
  severity: LawViolation["severity"] = "error"
): LawViolation {
  const lawDef = TITANIUM_LAWS[law];
  return {
    law: lawDef.id,
    description: lawDef.description,
    location,
    severity,
  };
}

/**
 * Generates an audit result for logging.
 */
export function generateAuditResult(
  violations: LawViolation[]
): LawAuditResult {
  return {
    passed: violations.length === 0,
    violations,
    timestamp: new Date().toISOString(),
  };
}

// ============================================================
// TYPE GUARDS
// ============================================================

/**
 * Type guard to ensure a value is not undefined or null.
 * Useful for Titanium Law #2 compliance.
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

/**
 * Asserts a value is defined, throwing if not.
 * Use sparingly - prefer optional chaining.
 */
export function assertDefined<T>(
  value: T | undefined | null,
  message = "Value is undefined"
): asserts value is T {
  if (!isDefined(value)) {
    throw new Error(message);
  }
}
