"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Copy, Check, RefreshCw } from "lucide-react";
import type { DMKeyword } from "@/app/api/dm-keywords/route";

export default function DMKeywords() {
  const [items, setItems] = useState<DMKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [reply, setReply] = useState("");
  const [copied, setCopied] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dm-keywords");
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!keyword.trim() || !reply.trim()) return;
    const res = await fetch("/api/dm-keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword: keyword.trim(), reply: reply.trim() }),
    });
    if (res.ok) {
      setKeyword("");
      setReply("");
      load();
    }
  };

  const remove = async (k: string) => {
    if (!confirm(`Delete keyword "${k}"?`)) return;
    await fetch(`/api/dm-keywords?keyword=${encodeURIComponent(k)}`, { method: "DELETE" });
    load();
  };

  const exportText = () => {
    const text = items.map((i) => `KEYWORD: ${i.keyword}\nREPLY: ${i.reply}`).join("\n\n---\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500 py-8">
        <RefreshCw className="w-4 h-4 animate-spin" /> Loading keywords…
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-slate-500 mb-4">
        When a DM contains a keyword, the bot replies automatically. Manage the map here, then paste it into
        ManyChat (or your DM tool of choice).
      </p>

      {/* Add */}
      <div className="rounded-xl border border-stone-200 bg-white p-4 mb-5 space-y-2">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Keyword (e.g. wedding favors)"
          className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
        />
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Auto-reply text…"
          rows={2}
          className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
        />
        <button
          onClick={save}
          className="flex items-center gap-1.5 rounded-lg bg-purple-700 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white hover:bg-purple-800"
        >
          <Plus className="w-3.5 h-3.5" /> Add keyword
        </button>
      </div>

      {/* List */}
      <div className="space-y-2.5 mb-5">
        {items.map((i) => (
          <div key={i.keyword} className="rounded-xl border border-stone-200 bg-white p-4 flex gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black uppercase tracking-widest text-purple-700">{i.keyword}</p>
              <p className="text-sm text-slate-600 mt-1">{i.reply}</p>
            </div>
            <button
              onClick={() => remove(i.keyword)}
              className="shrink-0 text-slate-300 hover:text-red-600 transition-colors"
              aria-label={`Delete ${i.keyword}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={exportText}
        className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:border-purple-300 hover:text-purple-700"
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? "Copied" : "Copy all for ManyChat"}
      </button>
    </div>
  );
}
