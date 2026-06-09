import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { logoutOwner, publishStorefrontConfig } from "./actions";
import { getStorefrontConfig, isOwnerSessionValid } from "@/lib/storefront-config";
import HermesAssist from "./HermesAssist";
import EditorNav from "@/app/editor/EditorNav";

export default async function ClientEditorPage({
  searchParams,
}: {
  searchParams: Promise<{ published?: string }>;
}) {
  const cookieStore = await cookies();
  if (!isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value)) {
    redirect("/client-editor/login");
  }

  const config = await getStorefrontConfig();
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-stone-50 text-slate-950">
      <EditorNav />
      <HermesAssist />
      <main className="px-5 py-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm text-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">
                Storefront Editor
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Lisa{" "}
                <span className="bg-chromium-purple bg-300% animate-chromium-glint text-transparent bg-clip-text">
                  storefront
                </span>{" "}
                controls
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                Change public-facing details without touching code. Shopify remains
                the product, inventory, and checkout source of truth.
              </p>
            </div>
            <form action={logoutOwner}>
              <button className="rounded-lg border border-white/20 px-4 py-2 text-sm font-bold text-white/70 hover:bg-white/10 transition-colors">
                Sign out
              </button>
            </form>
          </div>
          {params.published === "1" && (
            <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
              Storefront settings published successfully.
            </div>
          )}
        </header>

        <form action={publishStorefrontConfig} className="mt-6 grid gap-6">
          <section className="grid gap-4 md:grid-cols-4">
            <StatusCard label="Storefront" value={config.storefrontUrl} />
            <StatusCard label="Shopify" value={config.shopDomain} />
            <StatusCard label="Last update" value={new Date(config.updatedAt).toLocaleString()} />
            <StatusCard label="Config API" value="/api/storefront-config" />
          </section>

          <EditorSection
            title="Hero"
            description="Top-of-page copy and button labels. Keep wording short so it fits mobile."
          >
            <Field label="Badge" name="heroBadge" defaultValue={config.hero.badge} />
            <Field label="Headline line 1" name="heroHeadlineTop" defaultValue={config.hero.headlineTop} />
            <Field label="Headline accent" name="heroHeadlineAccent" defaultValue={config.hero.headlineAccent} />
            <Field label="Primary button" name="heroPrimaryCtaLabel" defaultValue={config.hero.primaryCtaLabel} />
            <Field label="Secondary button" name="heroSecondaryCtaLabel" defaultValue={config.hero.secondaryCtaLabel} />
            <Field label="Featured label" name="heroFeaturedLabel" defaultValue={config.hero.featuredLabel} />
            <Field label="Featured caption" name="heroFeaturedCaption" defaultValue={config.hero.featuredCaption} />
            <Field label="Brand accent" name="brandAccent" defaultValue={config.brand.accent} />
            <TextArea label="Hero subcopy" name="heroSubcopy" defaultValue={config.hero.subcopy} />
            <Field label="Announcement" name="announcement" defaultValue={config.announcement} />
          </EditorSection>

          <EditorSection
            title="Featured Shopify handles"
            description="Use exact Shopify product handles. These do not replace Shopify as the product source."
          >
            {config.productSlots.map((slot, index) => (
              <div key={slot.id} className="grid gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4 md:grid-cols-3">
                <Field label="Slot label" name={`slotLabel-${index}`} defaultValue={slot.label} />
                <Field label="Shopify handle" name={`slotHandle-${index}`} defaultValue={slot.shopifyHandle} />
                <Field label="Placement" name={`slotPlacement-${index}`} defaultValue={slot.placement} />
              </div>
            ))}
          </EditorSection>

          <EditorSection
            title="Homepage sections"
            description="Only subtle section copy is editable here. Layout and product cards stay controlled by the site."
          >
            {config.homepageSections.map((section, index) => (
              <div key={section.id} className="grid gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-purple-700">
                  {section.label} {section.routeAnchor}
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Headline" name={`sectionHeadline-${index}`} defaultValue={section.headline} />
                  <Field label="CTA label" name={`sectionCta-${index}`} defaultValue={section.ctaLabel} />
                  <TextArea label="Body" name={`sectionBody-${index}`} defaultValue={section.body} />
                  <Field label="Image URL" name={`sectionImageUrl-${index}`} defaultValue={section.imageUrl} />
                  <label className="grid gap-2 text-sm font-semibold text-slate-700">
                    Upload replacement photo
                    <input
                      name={`sectionImageUpload-${index}`}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="rounded-lg border border-dashed border-stone-300 bg-white px-3 py-3 text-sm text-slate-700"
                    />
                  </label>
                </div>
              </div>
            ))}
          </EditorSection>

          <EditorSection
            title="Social links"
            description="Public links and fallback text only. API credentials stay server-side."
          >
            <Field label="Instagram URL" name="instagramUrl" defaultValue={config.social.instagramUrl} />
            <Field label="Facebook URL" name="facebookUrl" defaultValue={config.social.facebookUrl} />
            <Field label="Feed source label" name="socialSource" defaultValue={config.social.source} />
            <Field label="Social headline" name="socialHeadline" defaultValue={config.social.headline} />
            <TextArea label="Social section body" name="socialBody" defaultValue={config.social.body} />
            <TextArea
              label="Fallback message"
              name="socialFallbackMessage"
              defaultValue={config.social.fallbackMessage}
            />
          </EditorSection>

          <section className="rounded-xl border border-slate-900 bg-slate-950 p-5 text-white shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Publish subtle updates</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                  Saves the client editor settings and refreshes the public homepage.
                </p>
              </div>
              <button className="rounded-lg bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-slate-950 hover:bg-purple-100">
                Publish
              </button>
            </div>
          </section>
        </form>
      </div>
      </main>
    </div>
  );
}

function EditorSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <input
        name={name}
        defaultValue={defaultValue}
        className="rounded-lg border border-stone-200 bg-white px-3 py-3 text-sm font-medium text-slate-950 outline-none ring-purple-200 transition focus:border-purple-300 focus:ring-4"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
      {label}
      <textarea
        name={name}
        defaultValue={defaultValue}
        className="min-h-24 rounded-lg border border-stone-200 bg-white px-3 py-3 text-sm font-medium text-slate-950 outline-none ring-purple-200 transition focus:border-purple-300 focus:ring-4"
      />
    </label>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-3 truncate text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}
