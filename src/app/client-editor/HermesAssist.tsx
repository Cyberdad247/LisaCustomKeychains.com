"use client";

// Zeroclaw — floating AI writing assistant powered by Hermes.
// Sits outside the server-rendered form, no interference with publishStorefrontConfig.

import { useState, useRef, useCallback } from "react";
import { Sparkles, X, Copy, Check, ChevronDown, Loader2 } from "lucide-react";
import { hermesStream, type HermesIntent } from "@/lib/hermes";

type QuickTask = {
  label: string;
  intent: HermesIntent;
  placeholder: string;
  helpText: string;
};

const QUICK_TASKS: QuickTask[] = [
  {
    label: "Improve copy",
    intent: "improve-copy",
    placeholder: "Paste the text you want to improve…",
    helpText: "Paste any existing field text and get a tighter, more artisan version.",
  },
  {
    label: "Headline variants",
    intent: "headline-variants",
    placeholder: "What is this headline for? (e.g. 'hero section')",
    helpText: "Get 3 short headline options — pick the one that fits.",
  },
  {
    label: "Announcement bar",
    intent: "announcement",
    placeholder: "e.g. Summer sale, new collection, limited stock…",
    helpText: "One punchy line under 120 characters for the top of the page.",
  },
  {
    label: "Section body",
    intent: "section-body",
    placeholder: "Which section? What's the topic? (e.g. 'Signature Sets section')",
    helpText: "2–3 sentences of warm, artisan body copy for a homepage section.",
  },
  {
    label: "Social caption",
    intent: "social-caption",
    placeholder: "Describe the photo or product (e.g. 'basketball keychain closeup')",
    helpText: "Instagram/Facebook caption with hashtags ready to copy-paste.",
  },
  {
    label: "Ad copy",
    intent: "ad-copy",
    placeholder: "Describe the product or offer (e.g. '$2.95 basic keychain sale')",
    helpText: "Structured Facebook/Instagram ad with headline, subheadline, body, and CTA.",
  },
];

export default function HermesAssist() {
  const [open, setOpen] = useState(false);
  const [taskIndex, setTaskIndex] = useState(0);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const outputRef = useRef<HTMLTextAreaElement>(null);

  const task = QUICK_TASKS[taskIndex];

  const generate = useCallback(async () => {
    if (!input.trim() || streaming) return;
    setOutput("");
    setError(null);
    setStreaming(true);

    await hermesStream(
      { intent: task.intent, context: { current: input.trim(), field: task.label } },
      {
        onChunk: (text) => {
          setOutput((prev) => {
            const next = prev + text;
            // Auto-scroll output box
            if (outputRef.current) {
              outputRef.current.scrollTop = outputRef.current.scrollHeight;
            }
            return next;
          });
        },
        onDone: () => setStreaming(false),
        onError: (msg) => {
          setError(msg);
          setStreaming(false);
        },
      },
    );
  }, [input, streaming, task]);

  const copyOutput = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [output]);

  const switchTask = (index: number) => {
    setTaskIndex(index);
    setInput("");
    setOutput("");
    setError(null);
  };

  return (
    <>
      {/* Floating trigger button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-xl shadow-black/30 transition-all hover:bg-purple-700 hover:scale-105 focus-visible:ring-2 focus-visible:ring-purple-400"
          aria-label="Open AI writing assistant"
        >
          <Sparkles className="h-4 w-4" />
          AI Assist
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[min(420px,calc(100vw-24px))] rounded-2xl border border-stone-200 bg-white shadow-2xl shadow-black/20 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-200 bg-slate-950 px-5 py-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white">
                Hermes · AI Assist
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/40 hover:text-white transition-colors"
              aria-label="Close AI assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col gap-4 p-5 overflow-y-auto max-h-[70vh]">
            {/* Task selector */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mb-2">
                Task
              </label>
              <div className="relative">
                <select
                  value={taskIndex}
                  onChange={(e) => switchTask(Number(e.target.value))}
                  className="w-full appearance-none rounded-lg border border-stone-200 bg-white px-3 py-2.5 pr-8 text-sm font-semibold text-slate-950 outline-none ring-purple-200 focus:border-purple-300 focus:ring-4"
                >
                  {QUICK_TASKS.map((t, i) => (
                    <option key={t.intent} value={i}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400 leading-snug">{task.helpText}</p>
            </div>

            {/* Input */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mb-2">
                Your text / context
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={task.placeholder}
                rows={3}
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-slate-950 outline-none ring-purple-200 placeholder:text-slate-400 focus:border-purple-300 focus:ring-4 resize-none"
              />
            </div>

            {/* Generate button */}
            <button
              onClick={generate}
              disabled={!input.trim() || streaming}
              className="flex items-center justify-center gap-2 rounded-lg bg-slate-950 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white transition-all hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {streaming ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate
                </>
              )}
            </button>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                {error.includes("ANTHROPIC_API_KEY")
                  ? "AI Assist requires ANTHROPIC_API_KEY to be set in Vercel environment variables."
                  : error}
              </div>
            )}

            {/* Output */}
            {(output || streaming) && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                    Output
                  </label>
                  {output && !streaming && (
                    <button
                      onClick={copyOutput}
                      className="flex items-center gap-1 text-[10px] font-bold text-purple-600 hover:text-purple-900 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy all
                        </>
                      )}
                    </button>
                  )}
                </div>
                <textarea
                  ref={outputRef}
                  readOnly
                  value={output}
                  rows={6}
                  className="w-full rounded-lg border border-purple-200 bg-purple-50/50 px-3 py-2.5 text-sm text-slate-950 outline-none resize-none font-medium"
                />
                {streaming && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-purple-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                    Writing…
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
