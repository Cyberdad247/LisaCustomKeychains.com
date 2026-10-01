"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Wand2, Sparkles, ChevronDown, Check, Loader2 } from "lucide-react";
import {
  compileDesignIntent,
  type A2UIContext,
  type A2UICompileResult,
  type CompiledDesign,
} from "@/lib/a2ui/compiler";
import { llmCompileDesign, shouldUseLLM } from "@/lib/a2ui/llm";
import { THREAD_COLORS, CHARM_OPTIONS } from "@/lib/camelot/registry";
import type { ColorOption, CharmOption } from "@/lib/camelot/schemas";

/**
 * ⚡ A2UI COMPILER — Anya-to-UI intent compiler.
 *
 * Free-text design intent ➔ compiled builder state, with a Grille_Gate
 * (ASK_SOVEREIGN) that asks for missing fields instead of guessing.
 *
 * When the deterministic compiler leaves fields unresolved, the pipeline
 * escalates to 🧠 DEEP COMPILE (LLM-assisted) for richer parsing; the merged
 * result is validated server-side and the local result is always the fallback.
 */

type PipelineStage = "idle" | "renorm" | "quantize" | "gate" | "deep" | "done";

interface A2UICompilerProps {
  tier: A2UIContext["tier"];
  allowedColors?: string[];
  charmCategory?: string;
  lockLetters?: boolean;
  onApply: (design: Partial<CompiledDesign>) => void;
  compact?: boolean;
}

const STAGE_GLYPHS: Record<PipelineStage, string> = {
  idle: "⚜️",
  renorm: "⚡",
  quantize: "🧪",
  gate: "🛡️",
  deep: "🧠",
  done: "⚜️",
};

const STAGE_LABELS: Record<PipelineStage, string> = {
  idle: "AWAITING INTENT",
  renorm: "RENORMALIZE",
  quantize: "QUANTIZE",
  gate: "GRILLE GATE",
  deep: "DEEP COMPILE",
  done: "ROUTED",
};

function StageLine({
  stage,
  active,
  delay,
}: {
  stage: PipelineStage;
  active: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: active ? 1 : 0.45, x: 0 }}
      transition={{ delay, duration: 0.25 }}
      className={`flex items-center gap-2 text-[9px] font-black tracking-[0.2em] uppercase transition-colors ${
        active ? "text-purple-600" : "text-slate-300"
      }`}
    >
      <span>{STAGE_GLYPHS[stage]}</span>
      <span>{STAGE_LABELS[stage]}</span>
      {active && <span className="text-purple-300">·</span>}
    </motion.div>
  );
}

export default function A2UICompiler({
  tier,
  allowedColors,
  charmCategory,
  lockLetters,
  onApply,
  compact = false,
}: A2UICompilerProps) {
  const shouldReduceMotion = useReducedMotion();
  const [intent, setIntent] = useState("");
  const [stage, setStage] = useState<PipelineStage>("idle");
  const [result, setResult] = useState<A2UICompileResult | null>(null);
  const [visibleTrace, setVisibleTrace] = useState(0);
  const [missingText, setMissingText] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [llmUsed, setLlmUsed] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const llmAbort = useRef<AbortController | null>(null);

  const colorPool: ColorOption[] =
    allowedColors?.length
      ? THREAD_COLORS.filter((c) => allowedColors.includes(c.id))
      : THREAD_COLORS;
  const charmPool: CharmOption[] =
    charmCategory === "sports"
      ? CHARM_OPTIONS.filter((c) =>
          ["football", "basketball", "soccer", "softball", "volleyball", "tennis-balls", "bowling-pins"].includes(c.id)
        )
      : CHARM_OPTIONS;

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
      llmAbort.current?.abort();
    };
  }, []);

  const schedule = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const handleCompile = () => {
    if (intent.trim().length < 3) return;
    // Cancel any in-flight pipeline timers + LLM fetch from a previous compile.
    timers.current.forEach(clearTimeout);
    timers.current = [];
    llmAbort.current?.abort();
    llmAbort.current = null;
    setResult(null);
    setVisibleTrace(0);
    setMissingText("");
    setLlmUsed(false);
    setIsCompiling(true);
    setStage("renorm");

    const ctx: A2UIContext = { tier, allowedColors, charmCategory, lockLetters };
    const raw = intent;
    const compiled = compileDesignIntent(raw, ctx);
    const useLLM = shouldUseLLM(compiled);

    const finish = (final: A2UICompileResult) => {
      setStage("done");
      setIsCompiling(false);
      setVisibleTrace(final.trace.length);
      setIntent("");
    };

    schedule(() => setStage("quantize"), 350);
    schedule(() => setStage("gate"), 700);
    schedule(() => {
      // Auto-apply resolved fields immediately (deterministic result).
      onApply(compiled.design);

      if (!useLLM) {
        setResult(compiled);
        finish(compiled);
        return;
      }

      // 🧠 DEEP COMPILE — escalate to the LLM for richer parsing.
      setStage("deep");
      const controller = new AbortController();
      llmAbort.current = controller;
      const timeout = setTimeout(() => controller.abort(), 15000);
      void llmCompileDesign(raw, ctx, controller.signal)
        .then(({ result, source }) => {
          clearTimeout(timeout);
          if (llmAbort.current !== controller) return; // superseded
          if (source === "llm" && result) {
            setLlmUsed(true);
            setResult(result);
            // Merge only fills fields the local compile missed — safe to re-apply.
            onApply(result.design);
          } else {
            setResult(compiled);
          }
        })
        .catch(() => {
          clearTimeout(timeout);
          if (llmAbort.current !== controller) return; // superseded
          setResult(compiled);
        })
        .finally(() => {
          if (llmAbort.current !== controller) return; // superseded
          llmAbort.current = null;
          finish(compiled);
        });
    }, 1050);
  };

  const quickApplyColor = (color: ColorOption) => {
    onApply({ color });
  };

  const quickApplyCharm = (charm: CharmOption) => {
    onApply({ charms: [charm] });
  };

  const quickApplyText = () => {
    if (!missingText.trim()) return;
    const limit = tier === 3 ? 16 : 8;
    onApply({ text: missingText.toUpperCase().slice(0, limit) });
    setMissingText("");
  };

  const hasResult = stage === "done" && result;
  const missing = result?.missing ?? [];

  return (
    <div
      className={`rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/80 to-white p-5 shadow-sm ${
        compact ? "" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Wand2 className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-700">
              A2UI Compiler
            </p>
            <p className="text-[10px] font-semibold text-slate-400">
              Describe it — the gate compiles it.
            </p>
          </div>
        </div>

        {/* Pipeline status strip */}
        <div className="hidden sm:flex items-center gap-3">
          {(["renorm", "quantize", "gate", "deep", "done"] as PipelineStage[]).map(
            (s, i) => (
              <StageLine
                key={s}
                stage={s}
                active={stage === s || (stage === "done" && s === "done")}
                delay={0}
              />
            )
          )}
        </div>
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-2">
        <input
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCompile()}
          placeholder='e.g. Royal purple with a basketball charm, name "JAYDEN"'
          className="flex-1 min-w-0 rounded-xl border border-purple-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-stone-300 focus:border-purple-500 outline-none transition-all"
          aria-label="Describe your custom design"
        />
        <button
          type="button"
          onClick={handleCompile}
          disabled={isCompiling || intent.trim().length < 3}
          className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-purple-700 text-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCompiling ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">Compile</span>
        </button>
      </div>

      {/* Pipeline trace */}
      <AnimatePresence>
        {hasResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {/* Trace lines */}
            <div className="mt-3 space-y-1 border-l-2 border-purple-100 pl-3">
              {result.trace.map((line, i) => (
                <motion.p
                  key={i}
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.12 }}
                  className="text-[10px] font-semibold text-slate-500 font-mono"
                >
                  {line}
                </motion.p>
              ))}
            </div>

            {/* Resolved chips */}
            {!compact && (
              <div className="mt-3 flex flex-wrap gap-2">
                {result.design.color && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-700">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/10"
                      style={{ background: result.design.color.hex }}
                    />
                    {result.design.color.name}
                  </span>
                )}
                {result.design.charms.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center rounded-full border border-purple-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-700"
                  >
                    {c.name}
                  </span>
                ))}
                {result.design.text && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-700">
                    <Check className="w-3 h-3 text-emerald-500" />
                    {result.design.text}
                  </span>
                )}
                <span className="inline-flex items-center rounded-full bg-slate-900 text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                  Applied ✓
                </span>
                {llmUsed && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-600 text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                    🧠 LLM-Assisted
                  </span>
                )}
              </div>
            )}

            {/* GRILLE_GATE — ASK_SOVEREIGN for missing fields */}
            {missing.length > 0 && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-800 flex items-center gap-2">
                  🛡️ ASK_SOVEREIGN — the gate needs one more detail
                </p>

                {missing.includes("color") && (
                  <div className="mt-3">
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2">
                      Which thread color?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {colorPool.slice(0, 10).map((color) => (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => quickApplyColor(color)}
                          title={color.name}
                          aria-label={`Pick ${color.name}`}
                          className="w-8 h-8 rounded-full border-2 border-white shadow ring-1 ring-stone-200 transition-transform hover:scale-110"
                          style={{ background: color.hex }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {missing.includes("charm") && (
                  <div className="mt-3">
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2">
                      Pick a charm
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {charmPool.map((charm) => (
                        <button
                          key={charm.id}
                          type="button"
                          onClick={() => quickApplyCharm(charm)}
                          className="rounded-full border border-amber-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-700 hover:border-purple-400 hover:text-purple-700 transition-colors"
                        >
                          {charm.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {missing.includes("text") && (
                  <div className="mt-3 flex gap-2">
                    <input
                      value={missingText}
                      onChange={(e) =>
                        setMissingText(e.target.value.toUpperCase().slice(0, tier === 3 ? 16 : 8))
                      }
                      onKeyDown={(e) => e.key === "Enter" && quickApplyText()}
                      placeholder="Enter the text to bead…"
                      className="flex-1 min-w-0 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 placeholder:text-stone-300 focus:border-purple-500 outline-none uppercase tracking-wider"
                      aria-label="Enter custom text"
                    />
                    <button
                      type="button"
                      onClick={quickApplyText}
                      disabled={!missingText.trim()}
                      className="rounded-lg bg-slate-900 text-white px-4 py-2 text-[10px] font-black uppercase tracking-wider disabled:opacity-40"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            )}

            {compact && (
              <p className="mt-3 text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                <Check className="w-3 h-3" /> Design routed to the forge
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
