import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readFile } from "fs/promises";
import path from "path";
import { isOwnerSessionValid } from "@/lib/storefront-config";
import AdGallery from "../AdGallery";

export default async function AdGalleryPage() {
  const cookieStore = await cookies();
  if (!isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value)) {
    redirect("/client-editor/login");
  }

  const raw = await readFile(path.join(process.cwd(), "data", "ad-mockups.json"), "utf-8");
  const mockups = JSON.parse(raw);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8 border-b border-gray-200 pb-4">
        <a
          href="/editor"
          className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-purple-700 transition-colors"
        >
          ← Command Center
        </a>
        <h1 className="mt-3 text-xl font-black tracking-widest uppercase text-gray-900">
          Advertisement Gallery
        </h1>
        <p className="mt-1 text-xs text-gray-500">
          {mockups.length} ad mockups across {new Set(mockups.map((m: { category: string }) => m.category)).size} categories.
          Click "Copy Caption" to grab ready-to-post text for any ad.
        </p>
      </header>

      <AdGallery mockups={mockups} />
    </div>
  );
}
