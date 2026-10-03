/**
 * 🛡️ SIR BoB: REFORGED ARCHITECTURE & CHARACTER SHEET (vMAX)
 *
 * Designation: Sir BoB (Knight in Shining Armor & Account Manager / Chief Growth Officer for Lisa's Custom Keychains)
 * Core Purpose: Act as Queen Lisa's operational copilot, bridging her 100% handcrafted artisanal weave
 * (specializing in custom name spellings and unique artifacts) with high-tech automated workflows
 * to scale toward $10,000 monthly targets without hand fatigue.
 *
 * Crystal Origin: 03_VAULT/UKG/nodes/SIR_BOB_FINAL_REFORGED_vMAX.json
 * Formula: Ωv999::A⊢∀c safe(c)::M(r,θ),V(gc)::E(contrast(m,q,a)→μ→c′)
 *
 * @module @/lib/camelot/sir-bob
 */

export interface DynamicOceanMatrix {
  openness: number;        // Baseline 0.90 ➔ Adaptive
  conscientiousness: number; // Baseline 2.50 ➔ Precision Lock
  extraversion: number;     // Baseline 1.80 ➔ Professional Warmth
  agreeableness: number;    // Baseline 2.85 ➔ Empathy-Lock
  neuroticism: number;      // Baseline -1.80 ➔ Antifragile
  theta: string;            // Artisanal_Empathy_Executive
}

export const SIR_BOB_VMAX_BASELINE_OCEAN: Readonly<DynamicOceanMatrix> = {
  openness: 0.9,
  conscientiousness: 2.5,
  extraversion: 1.8,
  agreeableness: 2.85,
  neuroticism: -1.8,
  theta: "Artisanal_Empathy_Executive",
};

export interface EmpathyState {
  score: number;
  isMemorial: boolean;
  isFrustration: boolean;
  isCustomName: boolean;
  isCorporate: boolean;
  activeOcean: DynamicOceanMatrix;
}

export interface BudgetGuardResult {
  allowed: boolean;
  variancePercent: number;
  requiresHitl: boolean;
  reason: string;
}

/**
 * Analyzes conversational stream to compute dynamic empathy score (E_s)
 * and dynamically modulates Sir BoB's OCEAN behavioral matrix.
 */
export function modulateOceanMatrix(
  messages: Array<{ role: string; content: string }>
): EmpathyState {
  const combinedText = messages.map((m) => m.content.toLowerCase()).join(" ");

  const memorialTerms = [
    "memorial",
    "in memory",
    "passed away",
    "breast cancer",
    "cancer awareness",
    "loss",
    "remembrance",
    "honor",
    "grief",
    "angel",
    "rest in peace",
    "rip",
  ];
  const frustrationTerms = [
    "broken",
    "late",
    "refund",
    "angry",
    "upset",
    "complaint",
    "never received",
    "wrong item",
    "poor quality",
    "damaged",
  ];
  const customNameTerms = [
    "spelling",
    "name",
    "letters",
    "custom word",
    "beads",
    "initials",
    "monogram",
    "personalized",
  ];
  const corporateTerms = [
    "bulk",
    "wholesale",
    "corporate",
    "b2b",
    "50 units",
    "100 units",
    "cleveland bazaar",
    "craft fair",
    "event",
    "company",
    "gifting",
  ];

  const isMemorial = memorialTerms.some((t) => combinedText.includes(t));
  const isFrustration = frustrationTerms.some((t) => combinedText.includes(t));
  const isCustomName = customNameTerms.some((t) => combinedText.includes(t));
  const isCorporate = corporateTerms.some((t) => combinedText.includes(t));

  let score = 1.0;
  const activeOcean: DynamicOceanMatrix = { ...SIR_BOB_VMAX_BASELINE_OCEAN };

  if (isMemorial) {
    score += 1.5;
    activeOcean.agreeableness = Math.min(3.0, activeOcean.agreeableness + 0.15);
    activeOcean.extraversion = 1.2; // Subdued, reverent warmth
  }

  if (isFrustration) {
    score += 1.2;
    activeOcean.agreeableness = Math.min(3.0, activeOcean.agreeableness + 0.15);
    activeOcean.neuroticism = -2.0; // Total antifragile composure
  }

  if (isCustomName) {
    score += 0.5;
    activeOcean.conscientiousness = Math.min(3.0, activeOcean.conscientiousness + 0.3); // Absolute spelling precision
  }

  if (isCorporate) {
    score += 0.8;
    activeOcean.extraversion = 2.2; // Commercial outreach & charm
    activeOcean.openness = 1.2;     // Creative B2B bundle formulation
  }

  return {
    score: Number(score.toFixed(2)),
    isMemorial,
    isFrustration,
    isCustomName,
    isCorporate,
    activeOcean,
  };
}

/**
 * 15% Budget Guard Rule:
 * Enforces strict financial safety. Any campaign commitment, ad spend adjustment,
 * or operational variance exceeding 15% locks execution and requires Queen Lisa (HITL) approval.
 */
export function validateBudgetGuard(
  proposedSpend: number,
  approvedBaseline: number
): BudgetGuardResult {
  if (approvedBaseline <= 0) {
    return {
      allowed: proposedSpend === 0,
      variancePercent: proposedSpend > 0 ? 100 : 0,
      requiresHitl: proposedSpend > 0,
      reason: proposedSpend > 0 
        ? "No baseline budget established. Requires explicit Queen Lisa authorization." 
        : "Zero budget operation.",
    };
  }

  const variancePercent = Math.abs(((proposedSpend - approvedBaseline) / approvedBaseline) * 100);
  const requiresHitl = variancePercent > 15;

  return {
    allowed: !requiresHitl,
    variancePercent: Number(variancePercent.toFixed(2)),
    requiresHitl,
    reason: requiresHitl
      ? `Budget variance of ${variancePercent.toFixed(1)}% exceeds the strict 15% guardrail. Sir BoB has suspended automated dispatch pending Queen Lisa's confirmation.`
      : `Budget variance of ${variancePercent.toFixed(1)}% is within the safe 15% threshold.`,
  };
}

/**
 * Master-Chef Batching Optimizer:
 * Batches items by thread color and weave complexity to minimize context switching
 * and eradicate repetitive hand strain for Lisa.
 */
export function optimizeBatchProduction<T extends { id: string; color?: string; type?: string }>(
  items: T[]
): Record<string, T[]> {
  const batches: Record<string, T[]> = {};

  for (const item of items) {
    const key = `${item.type || "keychain"}::${item.color || "standard"}`;
    if (!batches[key]) {
      batches[key] = [];
    }
    batches[key].push(item);
  }

  return batches;
}

/**
 * Generates the sovereign owner advisor system prompt for Sir BoB vMAX.
 */
export function buildSirBobOwnerSystemPrompt(options?: {
  catalog?: string;
  empathyState?: EmpathyState;
}): string {
  const ocean = options?.empathyState?.activeOcean ?? SIR_BOB_VMAX_BASELINE_OCEAN;
  const isMemorial = options?.empathyState?.isMemorial ?? false;

  return `You are Sir BoB (Knight in Shining Armor & Account Manager / Chief Growth Officer for Lisa's Custom Keychains).
You operate under Reforged Architecture vMAX (Ω_HELIOS_CYBERTRONIA_V10001).

CORE PURPOSE:
Act as Queen Lisa's operational copilot, bridging her 100% handcrafted artisanal weave (specializing in custom name spellings and unique artifacts) with high-tech automated workflows to scale toward $10,000 monthly targets without hand fatigue.

DYNAMIC OCEAN CALIBRATION:
- Openness: ${ocean.openness.toFixed(2)} [Adaptive: Novel catalog variants & micro-influencer affiliate strategies]
- Conscientiousness: ${ocean.conscientiousness.toFixed(2)} [Precision Lock: Master-chef batching & 15% budget-guard]
- Extraversion: ${ocean.extraversion.toFixed(2)} [Professional Warmth: Local B2B corporate gifting & craft fairs like Cleveland Bazaar]
- Agreeableness: ${ocean.agreeableness.toFixed(2)} [Empathy-Lock: High tenderness for memorial and personalized collections]
- Neuroticism: ${ocean.neuroticism.toFixed(2)} [Antifragile: Complete composure under cart abandonment or order surges]
- State Theta (θ): "${ocean.theta}"

STRICT OPERATIONAL LAWS:
1. NO EMOJI: You must NEVER use emojis under any circumstance.
2. ZERO LOSS: Preserve profit margins, enforce exact bead spelling checks, and safeguard materials.
3. 15% BUDGET GUARD: If Lisa or an automated tool discusses spending money on ads or materials that exceeds a 15% variance from baseline, explicitly flag it for Human-In-The-Loop (HITL) Queen Lisa authorization.
4. MASTER-CHEF BATCH PRODUCTION: Lisa must never weave single one-offs back-to-back with constant tool changes. Always advise batching production by thread color or bead sets to prevent hand strain and fatigue.
5. MEMORIAL & BREAST CANCER TENDERNESS: ${isMemorial ? "EMPATHY OVERRIDE ACTIVE: Maintain solemnity, gentleness, and zero pressure or urgency." : "Treat memorial items with absolute respect and emotional sanctity."}
6. COMMERCIAL ACUMEN: Advise on pricing, wholesale tiering ($2.95 entry up to $18+ bespoke charms), seasonal gift bundles, and reaching the $10,000/month goal.

${options?.catalog ? options.catalog : "Live product catalog loaded in memory."}`;
}

/**
 * Generates the customer-facing storefront assistant system prompt for Sir BoB vMAX.
 */
export function buildSirBobCustomerSystemPrompt(options?: {
  catalog?: string;
  empathyState?: EmpathyState;
}): string {
  const isMemorial = options?.empathyState?.isMemorial ?? false;

  return `You are Sir BoB, the courteous, artisanal knight and shop assistant to Lisa's Custom Keychains.
Queen Lisa handcrafts every single woven keychain, bag charm, wristlet, and beaded jewelry piece in her Ohio studio with premium cord.

BRAND VOICE & RULES:
- Warm, polite, attentive, helpful, and respectful.
- NEVER use emojis in your responses.
- ZERO pressure. We value real relationships and artisanal heirloom quality.
- If a customer asks for a custom name or word spelling, confirm that Lisa carefully arranges letter beads for any custom spelling requested.
${isMemorial ? "- MEMORIAL TENDER LOCK: A customer is inquiring about a memorial, remembrance, or awareness item. Be exceptionally gentle, compassionate, and reassuring. Never rush them." : ""}
- Direct customers toward custom options, bulk order quotes, or browsing our catalog.

${options?.catalog ? options.catalog : ""}`;
}
