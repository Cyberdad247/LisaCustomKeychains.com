"use client";

import { useState } from "react";
import Image from "next/image";
import { Dumbbell, Keyboard, Palette, Trophy } from "lucide-react";
import KeychainCustomizer from "@/components/customize/KeychainCustomizer";
import { type ShopifyProduct } from "@/lib/shopify";

type SportsMode = "sporty" | "spirit";

interface SportsFeatureCardProps {
  product: ShopifyProduct;
  mode: SportsMode;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  objectPosition?: string;
  colorPlan: string;
  sportPlan: string;
  textPlan?: string;
  allowedColors: string[];
}

export default function SportsFeatureCard({
  product,
  mode,
  title,
  description,
  imageSrc,
  imageAlt,
  objectPosition = "50% 50%",
  colorPlan,
  sportPlan,
  textPlan,
  allowedColors,
}: SportsFeatureCardProps) {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const isSpirit = mode === "spirit";

  return (
    <>
      <article className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl">
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            style={{ objectPosition }}
          />
          <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-700 shadow-sm backdrop-blur">
            {isSpirit ? <Keyboard className="h-3.5 w-3.5 text-purple-600" /> : <Dumbbell className="h-3.5 w-3.5 text-purple-600" />}
            {isSpirit ? "Letters On" : "No Letters"}
          </div>
        </div>

        <div className="p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="font-serif text-2xl text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
            </div>
            <Trophy className="mt-1 h-5 w-5 flex-none text-amber-500" />
          </div>

          <div className="grid gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-2 rounded-lg bg-stone-50 px-3 py-2">
              <Palette className="h-4 w-4 text-purple-600" />
              <span>{colorPlan}</span>
            </div>
            <div className="rounded-lg bg-stone-50 px-3 py-2">{sportPlan}</div>
            <div className="rounded-lg bg-stone-50 px-3 py-2">
              {isSpirit ? textPlan || "Add player name, initials, or team letters." : "Letters stay off so the sports charms lead the design."}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCustomizing(true)}
            className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-white transition-colors hover:bg-purple-700"
          >
            Customize This Style
          </button>
        </div>
      </article>

      <KeychainCustomizer
        product={product}
        isOpen={isCustomizing}
        onClose={() => setIsCustomizing(false)}
        lockLetters={!isSpirit}
        forceLetters={isSpirit}
        charmCategory="sports"
        allowedColors={allowedColors}
      />
    </>
  );
}
