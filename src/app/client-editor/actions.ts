"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createOwnerSession,
  getStorefrontConfig,
  isOwnerSessionValid,
  OWNER_SESSION_TTL_SECONDS,
  ownerPasswordConfigured,
  saveStorefrontConfig,
  saveUploadedImage,
  StorefrontConfigSchema,
  verifyOwnerPassword,
} from "@/lib/storefront-config";

export async function loginOwner(formData: FormData) {
  const password = String(formData.get("password") || "");
  if (!ownerPasswordConfigured()) {
    redirect("/client-editor/login?error=not-configured");
  }
  if (!verifyOwnerPassword(password)) {
    redirect("/client-editor/login?error=invalid-password");
  }

  const cookieStore = await cookies();
  cookieStore.set("lisa_owner_session", createOwnerSession(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: OWNER_SESSION_TTL_SECONDS,
  });
  redirect("/client-editor");
}

export async function logoutOwner() {
  const cookieStore = await cookies();
  cookieStore.delete("lisa_owner_session");
  redirect("/client-editor/login");
}

/**
 * Human-in-the-loop apply step for the conversational editor. The chat route
 * only proposes; nothing is persisted until the owner clicks Accept, which calls
 * this. Re-validates the incoming JSON against the schema before saving.
 */
export async function applyProposedConfig(
  configJson: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const cookieStore = await cookies();
  if (!isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value)) {
    return { ok: false, error: "Not signed in." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(configJson);
  } catch {
    return { ok: false, error: "Malformed proposal." };
  }

  const result = StorefrontConfigSchema.safeParse(parsed);
  if (!result.success) {
    return { ok: false, error: "Proposal failed validation." };
  }

  await saveStorefrontConfig({
    ...result.data,
    updatedAt: new Date().toISOString(),
  });
  revalidatePath("/");
  revalidatePath("/client-editor");
  revalidatePath("/api/storefront-config");
  return { ok: true };
}

export async function publishStorefrontConfig(formData: FormData) {
  const cookieStore = await cookies();
  if (!isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value)) {
    redirect("/client-editor/login");
  }

  const current = await getStorefrontConfig();
  const next = {
    ...current,
    hero: {
      ...current.hero,
      badge: String(formData.get("heroBadge") || current.hero.badge),
      headlineTop: String(formData.get("heroHeadlineTop") || current.hero.headlineTop),
      headlineAccent: String(
        formData.get("heroHeadlineAccent") || current.hero.headlineAccent,
      ),
      subcopy: String(formData.get("heroSubcopy") || current.hero.subcopy),
      primaryCtaLabel: String(
        formData.get("heroPrimaryCtaLabel") || current.hero.primaryCtaLabel,
      ),
      secondaryCtaLabel: String(
        formData.get("heroSecondaryCtaLabel") || current.hero.secondaryCtaLabel,
      ),
      featuredLabel: String(formData.get("heroFeaturedLabel") || current.hero.featuredLabel),
      featuredCaption: String(
        formData.get("heroFeaturedCaption") || current.hero.featuredCaption,
      ),
    },
    announcement: String(formData.get("announcement") || current.announcement),
    brand: {
      ...current.brand,
      accent: String(formData.get("brandAccent") || current.brand.accent),
    },
    social: {
      ...current.social,
      instagramUrl: String(formData.get("instagramUrl") || current.social.instagramUrl),
      facebookUrl: String(formData.get("facebookUrl") || current.social.facebookUrl),
      source: String(formData.get("socialSource") || current.social.source),
      fallbackMessage: String(
        formData.get("socialFallbackMessage") || current.social.fallbackMessage,
      ),
      headline: String(formData.get("socialHeadline") || current.social.headline),
      body: String(formData.get("socialBody") || current.social.body),
    },
    productSlots: current.productSlots.map((slot, index) => ({
      ...slot,
      label: String(formData.get(`slotLabel-${index}`) || slot.label),
      shopifyHandle: String(formData.get(`slotHandle-${index}`) || slot.shopifyHandle),
      placement: String(formData.get(`slotPlacement-${index}`) || slot.placement),
    })),
    homepageSections: await Promise.all(
      current.homepageSections.map(async (section, index) => {
        const uploaded = await saveUploadedImage(
          formData.get(`sectionImageUpload-${index}`) as File | null,
        );
        return {
          ...section,
          headline: String(formData.get(`sectionHeadline-${index}`) || section.headline),
          body: String(formData.get(`sectionBody-${index}`) || section.body),
          ctaLabel: String(formData.get(`sectionCta-${index}`) || section.ctaLabel),
          imageUrl:
            uploaded ||
            String(formData.get(`sectionImageUrl-${index}`) || section.imageUrl),
        };
      }),
    ),
    updatedAt: new Date().toISOString(),
  };

  await saveStorefrontConfig(next);
  revalidatePath("/");
  revalidatePath("/client-editor");
  revalidatePath("/api/storefront-config");
  redirect("/client-editor?published=1");
}
