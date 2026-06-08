"use client";

import Image from "next/image";
import { useState } from "react";

type AdMockup = {
  id: string;
  category: string;
  platform: string[];
  colorScheme: "purple-dark" | "purple-light" | "cream" | "white";
  badge: string | null;
  headline: string;
  subheadline: string;
  body: string;
  cta: string;
  price: string | null;
  hashtags: string[];
  productHandle: string | null;
  imageUrl: string;
  notes: string;
};

const SCHEME_STYLES: Record<AdMockup["colorScheme"], { card: string; headline: string; badge: string; cta: string }> = {
  "purple-dark": {
    card: "bg-slate-950 border-purple-800",
    headline: "text-white",
    badge: "bg-purple-600 text-white",
    cta: "bg-purple-600 text-white hover:bg-purple-500",
  },
  "purple-light": {
    card: "bg-purple-50 border-purple-200",
    headline: "text-purple-950",
    badge: "bg-purple-700 text-white",
    cta: "bg-purple-700 text-white hover:bg-purple-800",
  },
  cream: {
    card: "bg-stone-50 border-stone-200",
    headline: "text-slate-950",
    badge: "bg-amber-500 text-white",
    cta: "bg-slate-950 text-white hover:bg-purple-800",
  },
  white: {
    card: "bg-white border-gray-200",
    headline: "text-slate-900",
    badge: "bg-emerald-600 text-white",
    cta: "bg-slate-900 text-white hover:bg-slate-700",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  brand: "Brand Story",
  "keychains-basic": "Keychains — Basic",
  "keychains-standard": "Keychains — Standard",
  "keychains-epic": "Keychains — Epic",
  "earrings-dangle": "Earrings — Dangle",
  "earrings-heart": "Earrings — Heart",
  "earrings-boho": "Earrings — Boho",
  "earrings-charm": "Earrings — Charm",
  "earrings-set": "Earrings — Set",
  "matching-set": "Matching Set",
  event: "Event / Pop-Up",
  seasonal: "Seasonal",
};

const ALL_CATEGORIES = ["all", ...Object.keys(CATEGORY_LABELS)];

export default function AdGallery({ mockups }: { mockups: AdMockup[] }) {
  const [filter, setFilter] = useState("all");
  const [copied, setCopied] = useState<string | null>(null);

  const visible = filter === "all" ? mockups : mockups.filter((m) => m.category === filter);

  function copyCaption(m: AdMockup) {
    const text = [m.headline, m.subheadline, "", m.body, "", m.cta, "", m.hashtags.join(" ")].join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(m.id);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 text-[10px] uppercase tracking-widest font-bold rounded transition-colors ${
              filter === cat
                ? "bg-purple-700 text-white"
                : "border border-gray-300 text-gray-600 hover:border-purple-400 hover:text-purple-700"
            }`}
          >
            {cat === "all" ? `All (${mockups.length})` : (CATEGORY_LABELS[cat] ?? cat)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {visible.map((m) => {
          const s = SCHEME_STYLES[m.colorScheme];
          return (
            <div key={m.id} className={`rounded-2xl border overflow-hidden shadow-md flex flex-col ${s.card}`}>
              <div className="relative aspect-square w-full overflow-hidden">
                <Image
                  src={m.imageUrl}
                  alt={m.headline}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover"
                  unoptimized
                />
                {m.badge && (
                  <span className={`absolute top-3 left-3 px-2 py-1 text-[10px] uppercase tracking-widest font-black rounded-full shadow ${s.badge}`}>
                    {m.badge}
                  </span>
                )}
                {m.price && (
                  <span className="absolute top-3 right-3 px-2 py-1 text-[10px] font-black bg-black/70 text-white rounded-full">
                    {m.price}
                  </span>
                )}
              </div>

              <div className="p-5 flex flex-col gap-3 flex-1">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-purple-500 mb-1">
                    {CATEGORY_LABELS[m.category] ?? m.category}
                  </p>
                  <h3 className={`text-lg font-black leading-tight ${s.headline}`}>{m.headline}</h3>
                  <p className={`text-xs font-semibold mt-1 opacity-70 ${s.headline}`}>{m.subheadline}</p>
                </div>

                <p className={`text-xs leading-relaxed opacity-60 ${s.headline}`}>{m.body}</p>

                <div className="flex flex-wrap gap-1 mt-auto pt-2">
                  {m.hashtags.slice(0, 4).map((tag) => (
                    <span key={tag} className={`text-[9px] font-mono opacity-40 ${s.headline}`}>{tag}</span>
                  ))}
                  {m.hashtags.length > 4 && (
                    <span className={`text-[9px] font-mono opacity-40 ${s.headline}`}>+{m.hashtags.length - 4} more</span>
                  )}
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => copyCaption(m)}
                    className={`flex-1 py-2 text-[10px] uppercase tracking-widest font-bold rounded-full transition-colors ${s.cta}`}
                  >
                    {copied === m.id ? "Copied!" : "Copy Caption"}
                  </button>
                  {m.productHandle && (
                    <a
                      href={`/product/${m.productHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 text-[10px] uppercase tracking-widest font-bold border border-current rounded-full opacity-50 hover:opacity-100 transition-opacity"
                    >
                      View
                    </a>
                  )}
                </div>

                <p className="text-[9px] text-gray-400 italic leading-snug border-t border-current border-opacity-10 pt-2 mt-1">
                  {m.notes}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
