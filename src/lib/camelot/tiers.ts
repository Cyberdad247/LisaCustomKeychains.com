/**
 * 🏷️ SOVEREIGN TIERS
 *
 * Centralized pricing tier utility for Lisa's Custom Keychains.
 * Ensures consistent behavior across Builder and Customizer components.
 */

export type PricingTier = 1 | 2 | 3;

/**
 * Maps a numeric price to a Sovereign Pricing Tier.
 *
 * - Tier 1: Basic (<= $2.95) - Color only
 * - Tier 2: Classic ($2.96 - $5.95) - 1 Strand (max 8 beads)
 * - Tier 3: Premium (> $5.95) - 2 Strands (max 16 beads)
 */
export function getTierByPrice(price: number): PricingTier {
  if (price <= 2.95) return 1;
  if (price <= 5.95) return 2;
  return 3;
}

/**
 * Returns the character limit for a given tier.
 */
export function getCharLimit(tier: PricingTier): number {
  if (tier === 1) return 0;
  if (tier === 2) return 8;
  return 16;
}

/**
 * Returns a human-readable description of the tier's capability.
 */
export function getTierDescription(tier: PricingTier): string {
  switch (tier) {
    case 1:
      return "Basic Collection: Color selection only.";
    case 2:
      return "Classic Signature Collection: Color + 1 strand (8 chars).";
    case 3:
      return "Premium Dual-Core Bundle: Color + 2 strands (16 chars).";
    default:
      return "";
  }
}
