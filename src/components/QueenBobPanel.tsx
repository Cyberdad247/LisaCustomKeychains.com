"use client";

import { useEffect, useState } from "react";

interface Quote {
  ref: string;
  ts: number;
  name: string;
  contact: string;
  quantity: string;
  details: string;
}

interface ChatMessage {
  role: "user" | "bob";
  text: string;
}

export default function QueenBobPanel() {
  const [tab, setTab] = useState<"advisor" | "quotes">("advisor");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bob",
      text: "At your service, my Queen. Ask me about the business — pricing, quotes, products, marketing — or open the quote inbox to review bulk requests.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [quotesState, setQuotesState] = useState<"idle" | "loading" | "error">("idle");

  const loadQuotes = async () => {
    setQuotesState("loading");
    try {
      const res = await fetch("/api/bob/quotes");
      const data = await res.json();
      setQuotes(data.quotes ?? []);
      setQuotesState(data.error ? "error" : "idle");
    } catch {
      setQuotesState("error");
    }
  };

  useEffect(() => {
    if (tab === "quotes" && quotesState === "idle" && quotes.length === 0) {
      loadQuotes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab ]);

  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean || loading) return;
    setMessages((m) => [...m, { role: "user", text: clean }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/bob/owner-chat", {
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
        { role: "bob", text: data.reply || "Forgive me — say that once more, my Queen." },
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
    <section className="rounded-xl border border-slate-800 bg-slate-950 text-white p-5 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
            Sir BoB · Chamberlain
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Your counsel, my Queen
          </h2>
        </div>
        <div className="flex gap-2">
          {(["advisor", "quotes"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-sm rounded-lg px-4 py-2 font-bold transition-colors ${
                tab === t
                  ? "bg-amber-400 text-slate-950"
                  : "border border-white/20 text-white/70 hover:bg-white/10"
              }`}
            >
              {t === "advisor" ? "Advisor" : `Quote inbox${quotes.length ? ` (${quotes.length})` : ""}`}
            </button>
          ))}
        </div>
      </div>

      {tab === "advisor" ? (
        <div className="mt-4">
          <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-amber-400 text-slate-950 rounded-br-md"
                      : "bg-white/10 text-white rounded-bl-md"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <p className="text-xs text-white/40">BoB is thinking…</p>}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="mt-3 flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask BoB…"
              maxLength={500}
              className="flex-1 text-sm bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-amber-400 text-slate-950 text-sm font-bold rounded-full px-4 py-2 hover:bg-amber-300 disabled:opacity-40"
            >
              Send
            </button>
          </form>
        </div>
      ) : (
        <div className="mt-4">
          <div className="flex justify-end">
            <button
              onClick={loadQuotes}
              className="text-xs border border-white/20 rounded-full px-3 py-1.5 text-white/70 hover:bg-white/10"
            >
              Refresh
            </button>
          </div>
          {quotesState === "loading" ? (
            <p className="text-sm text-white/40 mt-3">Loading requests…</p>
          ) : quotesState === "error" ? (
            <p className="text-sm text-red-400 mt-3">Could not reach the quote store.</p>
          ) : quotes.length === 0 ? (
            <p className="text-sm text-white/40 mt-3">No quote requests yet.</p>
          ) : (
            <div className="mt-3 space-y-3 max-h-96 overflow-y-auto pr-1">
              {quotes.map((q) => (
                <div key={q.ref} className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="font-bold text-sm">
                      {q.name} <span className="text-white/40 font-normal">· {q.contact}</span>
                    </p>
                    <span className="text-[11px] font-mono bg-white/10 rounded px-2 py-0.5">
                      {q.ref}
                    </span>
                  </div>
                  <p className="text-sm mt-1">
                    <span className="text-amber-400 font-bold">Qty:</span> {q.quantity}
                  </p>
                  {q.details && <p className="text-sm text-white/70 mt-1">{q.details}</p>}
                  <p className="text-[11px] text-white/30 mt-2">
                    {new Date(q.ts * 1000).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
