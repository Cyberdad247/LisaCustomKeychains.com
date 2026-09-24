"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  role: "user" | "bob";
  text: string;
}

const QUICK_REPLIES = [
  "I need a bulk order quote",
  "What can be customized?",
  "How long does weaving take?",
];

function BobSigil({ size = 56 }: { size?: number }) {
  return (
    <div
      className="relative rounded-full flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <div
        className="absolute inset-0 rounded-full animate-[spin_14s_linear_infinite]"
        style={{
          background:
            "conic-gradient(from 0deg, #7c3aed, #d4af37, #7c3aed, #4c1d95, #7c3aed)",
        }}
      />
      <div
        className="absolute rounded-full bg-[#1e1b2e] flex items-center justify-center"
        style={{ inset: 3 }}
      >
        <span
          className="font-serif font-bold text-amber-200"
          style={{ fontSize: size * 0.38 }}
        >
          B
        </span>
      </div>
    </div>
  );
}

export default function SirBobChat() {
  const [open, setOpen] = useState(false);
  const [quoteMode, setQuoteMode] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bob",
      text: "Good day. I am BoB, shop assistant to Lisa's Custom Keychains. Ask me about the collection, customization, or bulk orders — every piece is hand-woven by Lisa herself.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState({ name: "", contact: "", quantity: "", details: "" });
  const [quoteSent, setQuoteSent] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, quoteMode]);

  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean || loading) return;
    setMessages((m) => [...m, { role: "user", text: clean }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/bob/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", text: clean }]
            .slice(-12)
            .map((m) => ({
              role: m.role === "bob" ? "assistant" : "user",
              content: m.text,
            })),
        }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          role: "bob",
          text:
            data.reply ||
            "Forgive me — I lost the thread. Could you say that once more?",
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "bob",
          text: "I am having trouble reaching my desk just now. Please try again shortly, or write to Lisa directly.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const submitQuote = async () => {
    if (!quote.name.trim() || !quote.contact.trim() || !quote.quantity.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/bob/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quote),
      });
      const data = await res.json();
      if (data.ok) {
        setQuoteSent(data.ref || "received");
      } else {
        setQuoteSent("error");
      }
    } catch {
      setQuoteSent("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Chat with Sir BoB"
        className="fixed bottom-6 right-6 z-[90] rounded-full shadow-xl hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <BobSigil size={58} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.22 }}
            className="fixed bottom-24 right-6 z-[90] w-[min(380px,calc(100vw-3rem))] h-[min(600px,70vh)] bg-white rounded-2xl shadow-2xl border border-purple-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#1e1b2e] text-white shrink-0">
              <BobSigil size={38} />
              <div className="flex-1 min-w-0">
                <p className="font-serif font-bold leading-tight">Sir BoB</p>
                <p className="text-xs text-purple-300">Shop assistant · Lisa's Custom Keychains</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="text-purple-300 hover:text-white text-xl leading-none px-1"
              >
                ×
              </button>
            </div>

            {!quoteMode ? (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-stone-50">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                          m.role === "user"
                            ? "bg-purple-700 text-white rounded-br-md"
                            : "bg-white text-slate-800 border border-stone-200 rounded-bl-md shadow-sm"
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                        <span className="flex gap-1">
                          {[0, 1, 2].map((d) => (
                            <span
                              key={d}
                              className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce"
                              style={{ animationDelay: `${d * 0.15}s` }}
                            />
                          ))}
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Quick replies */}
                <div className="px-3 pt-2 flex gap-2 overflow-x-auto shrink-0 bg-stone-50">
                  {QUICK_REPLIES.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="whitespace-nowrap text-xs border border-purple-300 text-purple-800 rounded-full px-3 py-1.5 hover:bg-purple-50 shrink-0"
                    >
                      {q}
                    </button>
                  ))}
                  <button
                    onClick={() => setQuoteMode(true)}
                    className="whitespace-nowrap text-xs bg-purple-700 text-white rounded-full px-3 py-1.5 hover:bg-purple-800 shrink-0"
                  >
                    Request bulk quote
                  </button>
                </div>

                {/* Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    send(input);
                  }}
                  className="p-3 flex gap-2 shrink-0 bg-white border-t border-stone-200"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask BoB…"
                    maxLength={500}
                    className="flex-1 text-sm border border-stone-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="bg-purple-700 text-white text-sm rounded-full px-4 py-2 hover:bg-purple-800 disabled:opacity-40"
                  >
                    Send
                  </button>
                </form>
              </>
            ) : (
              /* Bulk quote form */
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-stone-50">
                <button
                  onClick={() => {
                    setQuoteMode(false);
                    setQuoteSent(null);
                  }}
                  className="text-xs text-purple-700 hover:underline"
                >
                  ← Back to chat
                </button>
                <h3 className="font-serif font-bold text-lg text-slate-800">Bulk order quote</h3>
                <p className="text-xs text-slate-500">
                  For orders of 10+ pieces, corporate gifts, or events. Lisa reviews every
                  request personally before anything is promised.
                </p>
                {quoteSent ? (
                  <div className="bg-white border border-stone-200 rounded-xl p-4 text-sm">
                    {quoteSent === "error" ? (
                      <p className="text-red-700">
                        Something went wrong sending your request. Please try again, or
                        contact Lisa directly.
                      </p>
                    ) : (
                      <p className="text-slate-700">
                        Request received{quoteSent !== "received" ? ` (ref ${quoteSent})` : ""}.
                        Lisa will review it and reply to <strong>{quote.contact}</strong> shortly.
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    {(
                      [
                        ["name", "Your name", "text"],
                        ["contact", "Email or phone", "text"],
                        ["quantity", "Quantity (e.g. 50)", "text"],
                      ] as const
                    ).map(([key, label, type]) => (
                      <input
                        key={key}
                        type={type}
                        value={quote[key]}
                        onChange={(e) => setQuote((q) => ({ ...q, [key]: e.target.value }))}
                        placeholder={label}
                        className="w-full text-sm border border-stone-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    ))}
                    <textarea
                      value={quote.details}
                      onChange={(e) => setQuote((q) => ({ ...q, details: e.target.value }))}
                      placeholder="What would you like? (designs, colors, event date…)"
                      rows={4}
                      maxLength={1000}
                      className="w-full text-sm border border-stone-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={submitQuote}
                      disabled={
                        loading || !quote.name.trim() || !quote.contact.trim() || !quote.quantity.trim()
                      }
                      className="w-full bg-purple-700 text-white text-sm rounded-xl px-4 py-2.5 hover:bg-purple-800 disabled:opacity-40"
                    >
                      {loading ? "Sending…" : "Send quote request"}
                    </button>
                  </>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
