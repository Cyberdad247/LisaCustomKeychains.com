"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  DESIGN_CARTRIDGES,
  resolveCartridge,
  type ResolvedCartridge,
} from "@/lib/a2ui/cartridges";
import type { A2UIContext } from "@/lib/a2ui/compiler";

interface DesignCartridgesProps {
  tier: A2UIContext["tier"];
  allowedColors?: string[];
  charmCategory?: string;
  lockLetters?: boolean;
  onApply: (resolved: ResolvedCartridge) => void;
}

export default function DesignCartridges({
  tier,
  allowedColors,
  charmCategory,
  lockLetters,
  onApply,
}: DesignCartridgesProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-black tracking-[.25em] uppercase text-slate-400">
          🎴 Hot-Swappable Cartridges
        </h3>
        <span className="text-[9px] font-black uppercase tracking-widest text-purple-500">
          One tap · Instant forge
        </span>
      </div>
      <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
        {DESIGN_CARTRIDGES.map((cartridge) => (
          <motion.button
            key={cartridge.id}
            type="button"
            whileHover={shouldReduceMotion ? { opacity: 0.85 } : { y: -3 }}
            whileTap={shouldReduceMotion ? { opacity: 0.9 } : { scale: 0.96 }}
            onClick={() =>
              onApply(resolveCartridge(cartridge, { tier, allowedColors, charmCategory, lockLetters }))
            }
            title={cartridge.description}
            className="snap-start shrink-0 flex flex-col items-start gap-1 rounded-2xl border border-stone-100 bg-white px-4 py-3 shadow-sm hover:border-purple-300 hover:shadow-md transition-all text-left"
          >
            <span className="text-lg leading-none">{cartridge.glyph}</span>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-800 whitespace-nowrap">
              {cartridge.name}
            </span>
            <span className="text-[9px] font-semibold text-slate-400 whitespace-nowrap">
              {cartridge.description}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
