"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { applyProposedConfig } from "./actions";

type Change = { path: string; before: string; after: string };
type Msg = { role: "you" | "lisa-agent"; text: string };
type Pending = { config: unknown; changes: Change[] };

const STARTERS = [
  "Change the announcement bar to mention summer acrylic keychains",
  "Make the brand accent color pink",
  "Rewrite the hero subcopy to feel warmer",
];

export default function ThreadEditor() {
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "lisa-agent",
      text:
        "Hi Lisa! Tell me what you'd like to change about your storefront — the hero, announcement bar, colors, featured products, or social links. I'll show you a preview before anything goes live.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  function push(msg: Msg) {
    setMessages((m) => [...m, msg]);
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    });
  }

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setInput("");
    setPending(null);
    push({ role: "you", text: message });
    setBusy(true);
    try {
      const res = await fetch("/api/client-editor/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (!res.ok) {
        push({ role: "lisa-agent", text: data.error || "Something went wrong." });
        return;
      }
      push({ role: "lisa-agent", text: data.reply || "Done." });
      if (data.validationErrors?.length) {
        push({
          role: "lisa-agent",
          text: `I couldn't apply that: ${data.validationErrors.join("; ")}`,
        });
      }
      if (data.proposedConfig && data.changes?.length) {
        setPending({ config: data.proposedConfig, changes: data.changes });
      }
    } catch {
      push({ role: "lisa-agent", text: "Network error — please try again." });
    } finally {
      setBusy(false);
    }
  }

  async function accept() {
    if (!pending) return;
    setBusy(true);
    try {
      const result = await applyProposedConfig(JSON.stringify(pending.config));
      if (result.ok) {
        push({ role: "lisa-agent", text: "Published — it's live on your storefront now." });
        setPending(null);
        router.refresh();
      } else {
        push({ role: "lisa-agent", text: `Couldn't publish: ${result.error}` });
      }
    } finally {
      setBusy(false);
    }
  }

  function reject() {
    setPending(null);
    push({ role: "lisa-agent", text: "No problem — I discarded that change." });
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950 text-white shadow-sm">
      <header className="border-b border-white/10 px-5 py-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">
          Conversational editor
        </p>
        <h2 className="mt-1 text-lg font-semibold">Talk to your storefront</h2>
        <p className="mt-1 text-xs text-white/50">
          Nothing changes until you click Accept. Products &amp; checkout stay in Shopify.
        </p>
      </header>

      <div ref={listRef} className="max-h-[420px] overflow-y-auto px-5 py-4">
        <div className="grid gap-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "you"
                  ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-purple-600 px-4 py-2.5 text-sm"
                  : "mr-auto max-w-[85%] rounded-2xl rounded-bl-sm bg-white/10 px-4 py-2.5 text-sm text-white/90"
              }
            >
              {m.text}
            </div>
          ))}

          {pending && (
            <div className="mr-auto w-full max-w-[95%] rounded-xl border border-purple-500/40 bg-purple-500/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-purple-300">
                Preview — {pending.changes.length} change
                {pending.changes.length === 1 ? "" : "s"}
              </p>
              <ul className="mt-3 grid gap-2">
                {pending.changes.map((c, i) => (
                  <li key={i} className="text-xs leading-5">
                    <span className="font-mono text-purple-200">{c.path}</span>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2">
                      <span className="rounded bg-rose-500/15 px-1.5 py-0.5 text-rose-200 line-through">
                        {c.before}
                      </span>
                      <span className="text-white/40">→</span>
                      <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-200">
                        {c.after}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={accept}
                  disabled={busy}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-black text-emerald-950 hover:bg-emerald-400 disabled:opacity-50"
                >
                  Accept &amp; publish
                </button>
                <button
                  onClick={reject}
                  disabled={busy}
                  className="rounded-lg border border-white/20 px-4 py-2 text-sm font-bold text-white/70 hover:bg-white/10 disabled:opacity-50"
                >
                  Discard
                </button>
              </div>
            </div>
          )}

          {busy && !pending && (
            <div className="mr-auto rounded-2xl bg-white/5 px-4 py-2.5 text-sm text-white/40">
              Thinking…
            </div>
          )}
        </div>
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 px-5 pb-3">
          {STARTERS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/60 hover:bg-white/10"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 border-t border-white/10 p-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={busy}
          placeholder="Tell me what to change…"
          className="flex-1 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-purple-400 disabled:opacity-50"
        />
        <button
          disabled={busy || !input.trim()}
          className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-black hover:bg-purple-500 disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </section>
  );
}
