import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { loginOwner } from "../actions";
import { isOwnerSessionValid, ownerPasswordConfigured } from "@/lib/storefront-config";

export default async function ClientEditorLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const cookieStore = await cookies();
  if (isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value)) {
    redirect("/client-editor");
  }

  const configured = ownerPasswordConfigured();
  const { error } = await searchParams;
  const errorMessage =
    error === "invalid-password"
      ? "That password did not match. Check capitalization and try again."
      : error === "not-configured"
        ? "Set OWNER_DASHBOARD_PASSWORD in the environment before using this editor."
        : "";

  return (
    <main className="grid min-h-screen place-items-center bg-stone-50 px-5 text-slate-950">
      <section className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-700">
          Client editor
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Lisa storefront controls
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Sign in to update small homepage copy, social links, and featured Shopify handles.
          Product data still comes from Shopify.
        </p>

        {!configured && (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
            Set OWNER_DASHBOARD_PASSWORD in the environment before using this editor.
          </div>
        )}

        {errorMessage && configured && (
          <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-900">
            {errorMessage}
          </div>
        )}

        <form action={loginOwner} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Owner password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              className="rounded-lg border border-stone-200 px-3 py-3 text-slate-950 outline-none ring-purple-200 transition focus:border-purple-300 focus:ring-4"
            />
          </label>
          <button
            disabled={!configured}
            className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}
