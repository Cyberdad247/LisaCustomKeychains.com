"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ColorOption, CharmOption } from "../../lib/camelot/schemas";

interface ForgePreviewProps {
  text: string;
  color: ColorOption;
  charms: CharmOption[];
  isTier3: boolean;
}

// Compact live preview of the keychain design, shown beside the walkthrough.
export default function ForgePreview({ text, color, charms, isTier3 }: ForgePreviewProps) {
  const strand1 = isTier3 ? text.slice(0, 8) : text;
  const strand2 = isTier3 ? text.slice(8, 16) : "";

  const renderStrand = (strand: string, keyPrefix: string, delay: number) => (
    <motion.div
      className="relative flex flex-col items-center"
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <div
        className="w-14 h-[300px] rounded-b-2xl shadow-xl flex flex-col items-center gap-0.5 pt-5 pb-3 overflow-hidden border-x-2 border-black/10 transition-colors"
        style={{ background: color.hex }}
      >
        <div className="w-11 min-h-6 bg-white text-slate-900 flex items-center justify-center font-black rounded-sm mb-2 shadow text-[5px] tracking-tight leading-none px-1 py-1 text-center">
          {charms[0]?.icon}
        </div>
        <AnimatePresence mode="popLayout">
          {strand.split("").map((char, i) => (
            <motion.div
              key={`${keyPrefix}-${i}-${char}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`w-6 h-6 bg-white text-slate-900 flex items-center justify-center font-black rounded-sm text-[10px] shadow mb-0.5 ${i % 2 === 0 ? "rotate-2" : "-rotate-2"}`}
            >
              {char.toUpperCase()}
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="w-11 min-h-6 bg-white text-slate-900 flex items-center justify-center font-black rounded-sm mt-auto mb-3 shadow text-[5px] tracking-tight leading-none px-1 py-1 text-center">
          {charms[1]?.icon || charms[0]?.icon}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="relative aspect-square bg-stone-100 rounded-2xl overflow-hidden flex items-center justify-center p-6 border border-stone-200/50">
      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-md border border-purple-100 rounded-full shadow-sm z-10">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
        </span>
        <span className="text-[8px] font-black text-slate-600 tracking-widest uppercase">Live</span>
      </div>
      <div className="flex gap-5 items-center scale-90">
        {renderStrand(strand1, "s1", 0)}
        {isTier3 && renderStrand(strand2, "s2", 0.5)}
      </div>
    </div>
  );
}
