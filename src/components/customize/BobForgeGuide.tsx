"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2 } from "lucide-react";

export type Occasion = "gift" | "memorial" | "wedding" | "sports" | "self" | null;

interface BobForgeGuideProps {
  step: number;
  occasion: Occasion;
  text: string;
  onSuggestion: (text: string) => void;
}

const OCCASION_LABEL: Record<Exclude<Occasion, null>, string> = {
  gift: "a gift",
  memorial: "a memorial",
  wedding: "a wedding",
  sports: "game day",
  self: "yourself",
};

// Curated engraving suggestions per occasion — BoB's opening counsel.
const SUGGESTIONS: Record<Exclude<Occasion, null>, string[]> = {
  gift: ["BEST MOM", "THANK YOU", "BESTIE", "LOVE YOU"],
  memorial: ["FOREVER", "IN MEMORY", "ALWAYS", "REST EASY"],
  wedding: ["MR & MRS", "JUST MARRIED", "EST 2026", "FOREVER"],
  sports: [],
  self: ["DREAM BIG", "FEARLESS", "MY ERA", "BLESSED"],
};

// Step guidance — BoB speaks as the forge guide.
function guidanceFor(step: number, occasion: Occasion): string {
  const occ = occasion ? OCCASION_LABEL[occasion] : "your keychain";
  switch (step) {
    case 0:
      return "Good day. I am BoB, keeper of the forge. First, tell me what brings you here — the occasion shapes everything Lisa weaves.";
    case 1:
      return occasion === "memorial"
        ? "For a memorial piece, soft tones — lavender, white, sage — carry tenderness well. Choose the thread that feels like them."
        : `For ${occ}, pick a thread color that speaks. This is the canvas Lisa weaves by hand.`;
    case 2:
      return occasion === "memorial"
        ? "A name, a date, a few words they lived by. Keep it gentle — Lisa engraves exactly what you write."
        : occasion === "sports"
          ? "Game day pieces speak through color and charms — text stays off so the team spirit shines."
          : "Now the heart of it — the name or words Lisa will weave bead by bead. Tap a suggestion or write your own.";
    case 3:
      return "Charms crown the piece — one for the top of the strand, one for the bottom. Pick the pair that tells the story.";
    case 4:
      return "Behold your creation. If it sings to you, ignite the transaction and Lisa will forge it within 24–48 hours.";
    default:
      return "I am at your service.";
  }
}

interface ChatMsg {
  role: "user" | "bob";
  text: string;
}

export default function BobForgeGuide({ step, occasion, text, onSuggestion }: BobForgeGuideProps) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastStep = useRef(step);

  const guidance = guidanceFor(step, occasion);
  const suggestions = occasion && step === 2 ? SUGGESTIONS[occasion] : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Announce step changes in the chat thread
  useEffect(() => {
    if (lastStep.current !== step) {
      lastStep.current = step;
      setMessages((m) => [...m, { role: "bob", text: guidanceFor(step, occasion) }]);
    }
  }, [step, occasion]);

  const send = async (raw: string) => {
    const clean = raw.trim();
    if (!clean || loading) return;
    setMessages((m) => [...m, { role: "user", text: clean }]);
    setInput("");
    setLoading(true);
    try {
      const context = `The shopper is customizing a keychain in the guided forge. Occasion: ${occasion ?? "not chosen yet"}. Current text: "${text || "none"}". Step ${step + 1} of 5.`;
      const res = await fetch("/api/bob/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "user", content: context },
            ...messages.slice(-6).map((m) => ({
              role: m.role === "bob" ? "assistant" : "user",
              content: m.text,
            })),
            { role: "user", content: clean },
          ],
        }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "bob", text: data.reply || "Forgive me — I lost the thread. Say that once more?" },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "bob", text: "I cannot reach my desk just now. Try again shortly." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1e1b2e] rounded-2xl border border-purple-900/40 shadow-xl overflow-hidden">
      {/* BoB header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-purple-900/30">
        <div className="relative rounded-full flex items-center justify-center shrink-0 w-10 h-10">
          <div
            className="absolute inset-0 rounded-full animate-[spin_14s_linear_infinite]"
            style={{ background: "conic-gradient(from 0deg, #7c3aed, #d4af37, #7c3aed, #4c1d95, #7c3aed)" }}
          />
          <div className="absolute rounded-full bg-[#1e1b2e] flex items-center justify-center" style={{ inset: 2 }}>
            <span className="font-serif font-bold text-amber-200 text-sm">B</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold text-amber-100 font-serif">Sir BoB</p>
          <p className="text-[10px] uppercase tracking-widest text-purple-300/70">Forge Guide</p>
        </div>
      </div>

      {/* Guidance */}
      <div className="px-4 pt-3">
        <AnimatePresence mode="wait">
          <motion.p
            key={`${step}-${occasion}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="text-[13px] text-purple-100/90 leading-relaxed italic font-serif"
          >
            “{guidance}”
          </motion.p>
        </AnimatePresence>

        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSuggestion(s)}
                className="px-2.5 py-1 rounded-full bg-purple-800/60 border border-purple-600/40 text-[10px] font-bold tracking-wider text-purple-100 hover:bg-purple-700/60 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat thread */}
      <div className="px-4 py-3 max-h-48 overflow-y-auto space-y-2.5">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] px-3 py-2 rounded-xl text-[12px] leading-relaxed ${
                m.role === "user"
                  ? "bg-purple-600 text-white rounded-br-sm"
                  : "bg-white/10 text-purple-50 rounded-bl-sm border border-purple-800/40"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Ask input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 px-3 py-2.5 border-t border-purple-900/30"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask BoB for ideas…"
          className="flex-1 bg-white/5 border border-purple-800/40 rounded-full px-3.5 py-2 text-[12px] text-purple-50 placeholder:text-purple-300/40 focus:outline-none focus:border-purple-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 flex items-center justify-center text-white transition-colors shrink-0"
          aria-label="Ask BoB"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        </button>
      </form>
    </div>
  );
}
