"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  role: "user" | "bob";
  text: string;
}

interface LisaMessage {
  id: string;
  sender: "customer" | "lisa";
  text: string;
  at: number;
}

const QUICK_REPLIES = [
  "I need a bulk order quote",
  "What can be customized?",
  "How long does weaving take?",
];

// The literal command that switches the widget to the human chat with Lisa.
const LISA_COMMAND = "talk to lisa";
const POLL_MS = 3000;

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
  const [lisaMode, setLisaMode] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bob",
      text: "Good day. I am Sir BoB, shop assistant to Lisa's Custom Keychains. Ask me about our handcrafted collections, custom name spellings, or bulk orders — every single piece is hand-woven by Queen Lisa herself. Type \u201cTalk to Lisa\u201d anytime to reach the maker herself.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState({ name: "", contact: "", quantity: "", details: "" });
  const [quoteSent, setQuoteSent] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // --- Direct chat with Lisa (human mode) ---
  const [lisaName, setLisaName] = useState("");
  const [lisaNameInput, setLisaNameInput] = useState("");
  const [lisaSessionId, setLisaSessionId] = useState<string | null>(null);
  const [lisaMessages, setLisaMessages] = useState<LisaMessage[]>([]);
  const [lisaInput, setLisaInput] = useState("");
  const [lisaOnline, setLisaOnline] = useState(false);
  const [lisaSending, setLisaSending] = useState(false);
  const lisaSinceRef = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, quoteMode, lisaMode, lisaMessages]);

  // Restore Lisa chat identity/session across visits (shared with the legacy widget).
  useEffect(() => {
    try {
      const n = localStorage.getItem("lck_chat_name") ?? "";
      const s = localStorage.getItem("lck_chat_session") ?? "";
      if (n) setLisaName(n);
      if (s) setLisaSessionId(s);
    } catch {
      /* private mode */
    }
  }, []);

  const enterLisaMode = useCallback(() => {
    setLisaMode(true);
    setQuoteMode(false);
    setMessages((m) => [
      ...m,
      {
        role: "bob",
        text: "Of course — connecting you with Lisa now. She usually replies from her Instagram, so she will see your message there.",
      },
    ]);
  }, []);

  const pollLisa = useCallback(async () => {
    if (!lisaSessionId) return;
    try {
      const res = await fetch(
        `/api/live-chat/poll?sessionId=${encodeURIComponent(lisaSessionId)}&since=${lisaSinceRef.current}`
      );
      if (!res.ok) return;
      const data = await res.json();
      setLisaOnline(!!data.lisaOnline);
      const fresh: LisaMessage[] = data.messages ?? [];
      if (fresh.length > 0) {
        lisaSinceRef.current = Math.max(...fresh.map((m) => m.at), lisaSinceRef.current);
        setLisaMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          return [...prev, ...fresh.filter((m) => !ids.has(m.id))].sort((a, b) => a.at - b.at);
        });
      }
    } catch {
      /* chat poll failed — retry next tick */
    }
  }, [lisaSessionId]);

  useEffect(() => {
    if (!open || !lisaMode || !lisaSessionId) return;
    pollLisa();
    const t = setInterval(pollLisa, POLL_MS);
    return () => clearInterval(t);
  }, [open, lisaMode, lisaSessionId, pollLisa]);

  const startLisaChat = () => {
    const n = lisaNameInput.trim().slice(0, 40) || "Guest";
    setLisaName(n);
    try {
      localStorage.setItem("lck_chat_name", n);
    } catch {
      /* ignore */
    }
  };

  const sendLisa = async () => {
    const text = lisaInput.trim();
    if (!text || lisaSending) return;
    setLisaSending(true);
    try {
      const res = await fetch("/api/live-chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: lisaSessionId, name: lisaName, text }),
      });
      const data = await res.json();
      if (data.sessionId && data.sessionId !== lisaSessionId) {
        setLisaSessionId(data.sessionId);
        try {
          localStorage.setItem("lck_chat_session", data.sessionId);
        } catch {
          /* ignore */
        }
      }
      if (data.message) {
        lisaSinceRef.current = Math.max(lisaSinceRef.current, data.message.at);
        setLisaMessages((prev) => [...prev, data.message].sort((a, b) => a.at - b.at));
      }
      setLisaInput("");
    } catch {
      /* send failed — keep the text so they can retry */
    }
    setLisaSending(false);
  };

  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean || loading) return;
    // The literal command: "Talk to Lisa" switches to the human chat.
    if (clean.toLowerCase() === LISA_COMMAND) {
      enterLisaMode();
      setInput("");
      return;
    }
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
          text: "I am having trouble reaching my desk just now. Please try again shortly, or type \u201cTalk to Lisa\u201d to reach her directly.",
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
                <p className="font-serif font-bold leading-tight">
                  {lisaMode ? "Chat with Lisa" : "Sir BoB"}
                </p>
                <p className="text-xs text-purple-300">
                  {lisaMode
                    ? lisaOnline
                      ? "Lisa is online now"
                      : "Lisa is away — she replies from Instagram"
                    : "Shop assistant · Lisa's Custom Keychains"}
                </p>
              </div>
              {lisaMode ? (
                <button
                  onClick={() => {
                    setLisaMode(false);
                    setMessages((m) => [
                      ...m,
                      { role: "bob", text: "Back with me. What else can I help with?" },
                    ]);
                  }}
                  aria-label="Back to Sir BoB"
                  className="text-xs text-purple-300 hover:text-white border border-purple-500/50 rounded-full px-3 py-1"
                >
                  ← BoB
                </button>
              ) : null}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="text-purple-300 hover:text-white text-xl leading-none px-1"
              >
                ×
              </button>
            </div>

            {lisaMode ? (
              <>
                {!lisaName ? (
                  /* Name gate */
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center bg-stone-50">
                    <p className="text-sm text-slate-600">
                      Questions about a design, an order, or a custom piece? You&apos;re talking to
                      the maker herself — she replies from her Instagram.
                    </p>
                    <input
                      value={lisaNameInput}
                      onChange={(e) => setLisaNameInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && startLisaChat()}
                      placeholder="What should Lisa call you?"
                      maxLength={40}
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={startLisaChat}
                      className="rounded-lg bg-purple-700 text-white text-sm font-semibold px-6 py-2 hover:bg-purple-800"
                    >
                      Start chatting
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Lisa messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-[#FCFCFC]">
                      {lisaMessages.length === 0 && (
                        <p className="text-xs text-slate-400 text-center mt-6">
                          Say hello — {lisaOnline ? "Lisa usually replies within a minute." : "leave a message and Lisa will get back to you from Instagram."}
                        </p>
                      )}
                      {lisaMessages.map((m) => (
                        <div key={m.id} className={`flex ${m.sender === "customer" ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                              m.sender === "customer"
                                ? "bg-purple-700 text-white rounded-br-sm"
                                : "bg-white border border-stone-200 text-slate-800 rounded-bl-sm"
                            }`}
                          >
                            {m.sender === "lisa" && (
                              <p className="text-[10px] font-bold text-purple-700 mb-0.5">Lisa</p>
                            )}
                            <p className="whitespace-pre-wrap break-words">{m.text}</p>
                          </div>
                        </div>
                      ))}
                      <div ref={bottomRef} />
                    </div>

                    {/* Lisa input */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        sendLisa();
                      }}
                      className="p-3 flex gap-2 shrink-0 bg-white border-t border-stone-200"
                    >
                      <input
                        value={lisaInput}
                        onChange={(e) => setLisaInput(e.target.value)}
                        placeholder="Type your message…"
                        maxLength={500}
                        className="flex-1 text-sm border border-stone-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        type="submit"
                        disabled={lisaSending || !lisaInput.trim()}
                        className="bg-purple-700 text-white text-sm rounded-full px-4 py-2 hover:bg-purple-800 disabled:opacity-40"
                      >
                        Send
                      </button>
                    </form>
                  </>
                )}
              </>
            ) : !quoteMode ? (
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
                    onClick={() => send("Talk to Lisa")}
                    className="whitespace-nowrap text-xs border border-amber-400 text-amber-800 rounded-full px-3 py-1.5 hover:bg-amber-50 shrink-0 font-semibold"
                  >
                    Talk to Lisa
                  </button>
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
                        Something went wrong sending your request. Please try again, or type
                        “Talk to Lisa” to reach her directly.
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
