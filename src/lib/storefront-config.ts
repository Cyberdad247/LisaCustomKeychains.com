import { createHash, timingSafeEqual } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { z } from "zod";

const ProductSlotSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  shopifyHandle: z.string().min(1),
  placement: z.string().min(1),
});

const HomepageSectionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  routeAnchor: z.string().min(1),
  headline: z.string().min(1).max(120),
  body: z.string().min(1).max(400),
  ctaLabel: z.string().min(1).max(80),
  imageUrl: z.string().min(1),
  editableFields: z.array(z.string()),
});

export const StorefrontConfigSchema = z.object({
  clientName: z.string().min(1),
  storefrontUrl: z.string().url(),
  shopDomain: z.string().min(1),
  updatedAt: z.string().min(1),
  hero: z.object({
    badge: z.string().min(1).max(80),
    headlineTop: z.string().min(1).max(80),
    headlineAccent: z.string().min(1).max(80),
    subcopy: z.string().min(1).max(320),
    primaryCtaLabel: z.string().min(1).max(60),
    secondaryCtaLabel: z.string().min(1).max(60),
    featuredLabel: z.string().min(1).max(80),
    featuredCaption: z.string().min(1).max(100),
  }),
  announcement: z.string().min(1).max(140),
  brand: z.object({
    accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  }),
  productSlots: z.array(ProductSlotSchema).min(1),
  homepageSections: z.array(HomepageSectionSchema).min(1),
  social: z.object({
    instagramUrl: z.string().url(),
    facebookUrl: z.string().url(),
    source: z.string().min(1).max(120),
    fallbackMessage: z.string().min(1).max(240),
    headline: z.string().min(1).max(100),
    body: z.string().min(1).max(280),
  }),
});

export type StorefrontConfig = z.infer<typeof StorefrontConfigSchema>;

const CONFIG_PATH = path.join(process.cwd(), "data", "storefront-config.json");

export const defaultStorefrontConfig: StorefrontConfig = {
  clientName: "Lisa Custom Keychains",
  storefrontUrl: "https://www.lisascustomkeychains.com",
  shopDomain: "jgvme0-av.myshopify.com",
  updatedAt: "2026-06-05T00:00:00.000-04:00",
  hero: {
    badge: "Handcrafted With Love",
    headlineTop: "Every Knot",
    headlineAccent: "Tells a Story",
    subcopy:
      "From my hands to yours. Each keychain is lovingly woven with heart. Not mass-produced. Just handmade magic.",
    primaryCtaLabel: "Build Yours",
    secondaryCtaLabel: "Shop All",
    featuredLabel: "Featured This Week",
    featuredCaption: "Handcrafted Heart Bead Earrings",
  },
  announcement: "Custom orders open this week",
  brand: { accent: "#7c3aed" },
  productSlots: [
    {
      id: "featured-1",
      label: "Featured product card 1",
      shopifyHandle: "handmade-keychain-1000011817",
      placement: "Homepage Inspiration Gallery",
    },
    {
      id: "featured-2",
      label: "Featured product card 2",
      shopifyHandle: "handmade-keychain-1000012019",
      placement: "Homepage Inspiration Gallery",
    },
    {
      id: "signature-set",
      label: "Signature set feature",
      shopifyHandle: "handmade-heart-earrings-2",
      placement: "Signature Sets",
    },
  ],
  homepageSections: [
    {
      id: "products",
      label: "Inspiration Gallery",
      routeAnchor: "#products",
      headline: "Inspiration Gallery",
      body: "Click any design below to open the designer and customize it just for you.",
      ctaLabel: "Shop custom keychains",
      imageUrl: "/images/sports/basketball_mockup.jpg",
      editableFields: ["headline", "body", "ctaLabel"],
    },
    {
      id: "sets",
      label: "Signature Sets",
      routeAnchor: "#sets",
      headline: "Signature Sets",
      body: "Perfectly matched keychain and earring pairs. One configuration, double the impact.",
      ctaLabel: "Shop sets",
      imageUrl: "/images/assorted_charms_heritage.jpg",
      editableFields: ["headline", "body", "ctaLabel"],
    },
    {
      id: "events",
      label: "Events",
      routeAnchor: "#events",
      headline: "Find Lisa at Pop-Up Events",
      body:
        "Lisa posts vending dates, table previews, and last-minute pop-up details on social. Follow both pages so customers know where to find the charm table in person.",
      ctaLabel: "Update event details",
      imageUrl: "https://i.postimg.cc/cvyv100W/Untitled_design_(2).png",
      editableFields: ["headline", "body", "ctaLabel"],
    },
  ],
  social: {
    instagramUrl: "https://www.instagram.com/lisascustomkeychains?igsh=MXMzZWVyOGw2Z3Vtag==",
    facebookUrl: "https://www.facebook.com/share/14WQBPgC1Rz/",
    source: "fallback until Meta credentials are connected",
    fallbackMessage:
      "Showing curated recent-work photos until Facebook and Instagram are connected.",
    headline: "Fresh From Lisa's Socials",
    body:
      "Recent table photos, finished custom pieces, sports charm ideas, and pop-up updates from Facebook and Instagram.",
  },
};

export async function getStorefrontConfig(): Promise<StorefrontConfig> {
  try {
    const parsed = JSON.parse(await readFile(CONFIG_PATH, "utf8")) as unknown;
    return StorefrontConfigSchema.parse({
      ...defaultStorefrontConfig,
      ...(parsed as Partial<StorefrontConfig>),
    });
  } catch {
    return defaultStorefrontConfig;
  }
}

export async function saveStorefrontConfig(config: StorefrontConfig) {
  const parsed = StorefrontConfigSchema.parse(config);
  await mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await writeFile(CONFIG_PATH, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
}

export async function saveUploadedImage(file: File | null): Promise<string> {
  if (!file || file.size === 0) return "";
  if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type)) {
    throw new Error("Unsupported image type.");
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const extension = path.extname(file.name).toLowerCase() || ".png";
  const safeName = `${Date.now()}-${createHash("sha1")
    .update(file.name)
    .digest("hex")
    .slice(0, 10)}${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, safeName), bytes);
  return `/uploads/${safeName}`;
}

export function ownerPasswordConfigured() {
  return Boolean(process.env.OWNER_DASHBOARD_PASSWORD);
}

export function verifyOwnerPassword(input: string) {
  const password = process.env.OWNER_DASHBOARD_PASSWORD;
  if (!password) return false;
  return safeEqual(input, password);
}

export function createOwnerSession() {
  const secret =
    process.env.OWNER_DASHBOARD_SECRET ||
    process.env.OWNER_DASHBOARD_PASSWORD ||
    "dev";
  return createHash("sha256").update(`lisa-owner:${secret}`).digest("hex");
}

export function isOwnerSessionValid(value: string | undefined) {
  if (!value) return false;
  return safeEqual(value, createOwnerSession());
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}
