/**
 * 🛡️ SOVEREIGN SCHEMAS
 *
 * Central schema registry for the Camelot OS.
 * All Zod schemas should be defined here for cross-component reuse.
 *
 * @module @/lib/camelot/schemas
 * @author SIR_OCTAVIAN (Invisioned Marketing Inc.)
 */

import { z } from "zod";

// ============================================================
// PRIMITIVE SCHEMAS
// ============================================================

/**
 * Non-empty string that's been trimmed.
 */
export const NonEmptyString = z
  .string()
  .trim()
  .min(1, "This field is required");

/**
 * Hex color code validator.
 */
export const HexColor = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color");

/**
 * Shopify GID format validator.
 * Format: gid://shopify/{Type}/{ID}
 */
export const ShopifyGid = z
  .string()
  .regex(/^gid:\/\/shopify\/\w+\/\d+$/, "Invalid Shopify GID format");

// ============================================================
// DOMAIN SCHEMAS: KEYCHAIN CUSTOMIZATION
// ============================================================

/**
 * Color option for keychain customization.
 */
export const ColorOptionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  hex: HexColor,
});

/**
 * Charm option for keychain customization.
 */
export const CharmOptionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  icon: z.string().min(1),
});

/**
 * Complete keychain design schema.
 * Enforces physical constraints (8-bead limit per strand, 16 total for Premium).
 */
export const KeychainDesignSchema = z.object({
  text: z
    .string()
    .min(1, "Name is required")
    .max(16, "Maximum 16 beads allowed for Premium Dual Strand designs")
    .regex(
      /^[A-Z0-9 ]+$/,
      "Only uppercase letters, numbers, and spaces allowed"
    ),
  color: ColorOptionSchema,
  charm: CharmOptionSchema.optional(),
  charms: z.array(CharmOptionSchema).max(3).optional(),
});

/**
 * Vibe notes schema for add-on customization.
 * Used for Icon Shard suggestions (e.g., 'sports', 'stars').
 */
export const VibeNotesSchema = z.object({
  notes: z
    .string()
    .max(200, "Vibe notes must be under 200 characters")
    .optional(),
});

// ============================================================
// DOMAIN SCHEMAS: CART & CHECKOUT
// ============================================================

/**
 * Line item properties for Shopify checkout.
 * Standardized keys for LCK production flow.
 */
export const LineItemPropertiesSchema = z.object({
  text: z.string().optional(),
  color: z.string().optional(),
  vibe_notes: z.string().optional(), // Stores JSON blob of vibe/charm data
});

/**
 * Add to cart payload schema.
 */
export const AddToCartSchema = z.object({
  variantId: ShopifyGid,
  quantity: z.number().int().positive().max(10),
  properties: LineItemPropertiesSchema.optional(),
});

// ============================================================
// DOMAIN SCHEMAS: CRM & NOTIFICATIONS
// ============================================================

/**
 * Customer contact form schema.
 */
export const ContactFormSchema = z.object({
  name: NonEmptyString.max(100),
  email: z.string().email("Invalid email address"),
  message: NonEmptyString.max(1000),
});

/**
 * Order notification payload schema.
 */
export const OrderNotificationSchema = z.object({
  orderId: z.string().min(1),
  customerEmail: z.string().email(),
  totalAmount: z.string(),
  lineItems: z.array(
    z.object({
      title: z.string(),
      quantity: z.number(),
      properties: LineItemPropertiesSchema.optional(),
    })
  ),
});

// ============================================================
// TYPE EXPORTS
// ============================================================

export type ColorOption = z.infer<typeof ColorOptionSchema>;
export type CharmOption = z.infer<typeof CharmOptionSchema>;
export type KeychainDesign = z.infer<typeof KeychainDesignSchema>;
export type VibeNotes = z.infer<typeof VibeNotesSchema>;
export type LineItemProperties = z.infer<typeof LineItemPropertiesSchema>;
export type AddToCart = z.infer<typeof AddToCartSchema>;
export type ContactForm = z.infer<typeof ContactFormSchema>;
export type OrderNotification = z.infer<typeof OrderNotificationSchema>;
