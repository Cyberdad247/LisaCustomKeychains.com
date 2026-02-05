"use client";

import { resolveVibe, type VibeData } from "@/lib/vibeEngine";
import { Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";

// Manual debounce implementation to avoid dependency issues
function useDebounce(callback: (input: string) => void, delay: number) {
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  return (input: string) => {
    if (timer) clearTimeout(timer);
    const newTimer = setTimeout(() => {
      callback(input);
    }, delay);
    setTimer(newTimer);
  };
}

export default function VibeInput({
  onVibeChange,
}: {
  onVibeChange: (data: VibeData) => void;
}) {
  const [loading, setLoading] = useState(false);

  const performLookup = (input: string) => {
    if (input.length < 3) return;
    setLoading(true);
    const resolved = resolveVibe(input);
    if (resolved) {
      onVibeChange(resolved);
    }
    setLoading(false);
  };

  const debouncedLookup = useDebounce(performLookup, 1000);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    debouncedLookup(input);
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center justify-between">
        <span>Enter Your Vibe</span>
        {loading && (
          <Loader2 className="w-3 h-3 animate-spin text-purple-600" />
        )}
      </label>
      <div className="relative group">
        <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 group-focus-within:text-purple-500 transition-colors" />
        <input
          onChange={handleInputChange}
          className="w-full bg-white border border-stone-200 pl-10 pr-4 py-3 rounded text-sm text-purple-600 focus:border-purple-600 outline-none transition-all placeholder:text-stone-200 font-medium"
          placeholder="e.g. Sports, Coffee, Love..."
        />
      </div>
    </div>
  );
}
