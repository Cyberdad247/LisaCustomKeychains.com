"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Bookmark, RotateCcw, Trash2, Plus, X } from "lucide-react";
import {
  listDesigns,
  saveDesign,
  deleteDesign,
  type SavedDesign,
} from "@/lib/a2ui/memory";

interface DesignMemoryProps {
  current: {
    text: string;
    colorId: string;
    colorName: string;
    charmIds: string[];
    tier: number;
  };
  onRestore: (design: SavedDesign["design"]) => void;
}

export default function DesignMemory({ current, onRestore }: DesignMemoryProps) {
  const shouldReduceMotion = useReducedMotion();
  const [designs, setDesigns] = useState<SavedDesign[]>(() => listDesigns());
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");

  const hasCurrent = Boolean(current.colorId);

  const handleSave = () => {
    const saved = saveDesign({
      name: name || "My design",
      text: current.text,
      colorId: current.colorId,
      colorName: current.colorName,
      charmIds: current.charmIds,
      tier: current.tier,
    });
    setName("");
    setDesigns([saved, ...designs.filter((d) => d.id !== saved.id)]);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    setDesigns(deleteDesign(id));
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasCurrent}
          className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-600 hover:border-purple-300 hover:text-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Bookmark className="w-3.5 h-3.5" />
          Save design
        </button>
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-600 hover:border-purple-300 hover:text-purple-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          My designs ({designs.length})
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-2xl border border-stone-100 bg-white p-4 shadow-sm">
              {designs.length === 0 ? (
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  No saved designs yet — the forge remembers what you build.
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {designs.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50 px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-slate-800 truncate">
                          {d.name}
                        </p>
                        <p className="text-[10px] font-semibold text-slate-400 truncate">
                          {d.design.colorName}
                          {d.design.text ? ` · ${d.design.text}` : ""}
                          {d.design.charmIds.length
                            ? ` · ${d.design.charmIds.join(", ")}`
                            : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRestore(d.design)}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-900 text-white px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider hover:bg-purple-700 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Restore
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(d.id)}
                        aria-label={`Delete ${d.name}`}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
