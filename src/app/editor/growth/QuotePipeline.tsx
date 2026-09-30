"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Sparkles, Copy, Check, Loader2 } from "lucide-react";
import type { QuoteStage, QuoteStatus } from "@/app/api/bob/quote-status/route";

interface Quote {
  ref: string;
  ts: number;
  name: string;
  contact: string;
  quantity: string;
  details: string;
}

const STAGES: { id: QuoteStage; label: string; color: string }[] = [
  { id: "new", label: "New", color: "bg-sky-100 text-sky-800 border-sky-200" },
  { id: "contacted", label: "Contacted", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { id: "quoted", label: "Quoted", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { id: "won", label: "Won", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { id: "lost", label: "Lost", color: "bg-stone-100 text-stone-500 border-stone-200" },
];

export default function QuotePipeline() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [status, setStatus] = useState<Record<string, QuoteStatus>>({});
  const [loading, setLoading] = useState(true);
  const [drafting, setDrafting] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [qr, sr] = await Promise.all([fetch("/api/bob/quotes"), fetch("/api/bob/quote-status")]);
      if (qr.ok) setQuotes((await qr.json()).quotes ?? []);
      if (sr.ok) setStatus(await sr.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setStage = async (ref: string, stage: QuoteStage) => {
    const res = await fetch("/api/bob/quote-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref, stage }),
    });
    if (res.ok) {
      const s = await res.json();
      setStatus((prev) => ({ ...prev, [ref]: s }));
    }
  };

  const draftReply = async (q: Quote) => {
    setDrafting(q.ref);
    try {
      const res = await fetch("/api/bob/owner-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Draft a warm, professional reply to this bulk quote request. Keep it under 120 words, no emojis. Include a next step.\n\nFrom: ${q.name} (${q.contact})\nQuantity: ${q.quantity}\nDetails: ${q.details || "none given"}`,
            },
          ],
        }),
      });
      const data = await res.json();
      setDrafts((prev) => ({ ...prev, [q.ref]: data.reply || "BoB could not draft a reply." }));
    } catch {
      setDrafts((prev) => ({ ...prev, [q.ref]: "Draft failed — try again." }));
    } finally {
      setDrafting(null);
    }
  };

  const copy = async (ref: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(ref);
    setTimeout(() => setCopied(null), 1500);
  };

  const stageOf = (ref: string): QuoteStage => status[ref]?.stage ?? "new";
  const counts = STAGES.map((s) => ({
    ...s,
    n: quotes.filter((q) => stageOf(q.ref) === s.id).length,
  }));
  const openQty = quotes
    .filter((q) => !["won", "lost"].includes(stageOf(q.ref)))
    .reduce((sum, q) => sum + (parseInt(q.quantity) || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500 py-8">
        <RefreshCw className="w-4 h-4 animate-spin" /> Loading pipeline…
      </div>
    );
  }

  return (
    <div>
      {/* Pipeline summary */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {counts.map((s) => (
          <span
            key={s.id}
            className={`px-3 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-widest ${s.color}`}
          >
            {s.label}: {s.n}
          </span>
        ))}
        <span className="ml-auto text-xs text-slate-500">
          <span className="font-black text-slate-900">{openQty}</span> units in open pipeline
        </span>
        <button
          onClick={load}
          className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-purple-700"
        >
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      {quotes.length === 0 ? (
        <p className="text-sm text-slate-500 py-6 text-center">No quote requests yet.</p>
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => {
            const stage = stageOf(q.ref);
            return (
              <div key={q.ref} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="font-bold text-sm text-slate-900">
                    {q.name} <span className="text-slate-400 font-normal">· {q.contact}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono bg-stone-100 rounded px-2 py-0.5 text-slate-500">
                      {q.ref}
                    </span>
                    <select
                      value={stage}
                      onChange={(e) => setStage(q.ref, e.target.value as QuoteStage)}
                      className="text-[11px] font-black uppercase tracking-widest rounded-full border px-2.5 py-1 bg-white"
                    >
                      {STAGES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-sm mt-1 text-slate-700">
                  <span className="text-purple-700 font-bold">Qty:</span> {q.quantity}
                </p>
                {q.details && <p className="text-sm text-slate-500 mt-1">{q.details}</p>}
                <p className="text-[11px] text-slate-400 mt-1">{new Date(q.ts * 1000).toLocaleString()}</p>

                <div className="mt-3">
                  {drafts[q.ref] ? (
                    <div className="rounded-lg bg-purple-50 border border-purple-200 p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-purple-600 mb-1.5">
                        BoB&apos;s draft
                      </p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{drafts[q.ref]}</p>
                      <button
                        onClick={() => copy(q.ref, drafts[q.ref])}
                        className="mt-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-purple-700 hover:text-purple-900"
                      >
                        {copied === q.ref ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied === q.ref ? "Copied" : "Copy reply"}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => draftReply(q)}
                      disabled={drafting === q.ref}
                      className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-purple-700 hover:text-purple-900 disabled:opacity-50"
                    >
                      {drafting === q.ref ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      {drafting === q.ref ? "BoB drafting…" : "Draft reply with BoB"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
