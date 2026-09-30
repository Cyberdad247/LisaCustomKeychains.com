"use client";

import { useEffect, useState } from "react";
import { Plus, Star, Check, RefreshCw } from "lucide-react";
import type { ReviewEntry } from "@/app/api/reviews/route";

export default function ReviewTracker() {
  const [reviews, setReviews] = useState<ReviewEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [recording, setRecording] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reviews");
      if (res.ok) setReviews(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const logRequest = async () => {
    if (!customer.trim()) return;
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer: customer.trim(), orderRef: orderRef.trim() }),
    });
    if (res.ok) {
      const entry = await res.json();
      setReviews((prev) => [entry, ...prev]);
      setCustomer("");
      setOrderRef("");
    }
  };

  const saveReview = async (id: string) => {
    const res = await fetch("/api/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, rating, text }),
    });
    if (res.ok) {
      const updated = await res.json();
      setReviews((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setRecording(null);
      setText("");
      setRating(5);
    }
  };

  const toggleApproved = async (r: ReviewEntry) => {
    const res = await fetch("/api/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: r.id, approved: !r.approved }),
    });
    if (res.ok) {
      const updated = await res.json();
      setReviews((prev) => prev.map((x) => (x.id === r.id ? updated : x)));
    }
  };

  const received = reviews.filter((r) => r.receivedAt);
  const responseRate = reviews.length ? Math.round((received.length / reviews.length) * 100) : 0;
  const avgRating = received.length
    ? (received.reduce((s, r) => s + (r.rating ?? 0), 0) / received.length).toFixed(1)
    : "—";

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500 py-8">
        <RefreshCw className="w-4 h-4 animate-spin" /> Loading reviews…
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          ["Requests sent", String(reviews.length)],
          ["Response rate", `${responseRate}%`],
          ["Avg rating", String(avgRating)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-stone-200 bg-white p-4 text-center">
            <p className="text-2xl font-black text-slate-900">{value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Log a request */}
      <div className="flex gap-2 mb-5">
        <input
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          placeholder="Customer name"
          className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
        />
        <input
          value={orderRef}
          onChange={(e) => setOrderRef(e.target.value)}
          placeholder="Order ref (optional)"
          className="w-40 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
        />
        <button
          onClick={logRequest}
          className="flex items-center gap-1.5 rounded-lg bg-purple-700 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white hover:bg-purple-800"
        >
          <Plus className="w-3.5 h-3.5" /> Log request
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-xl border border-stone-200 bg-white p-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="font-bold text-sm text-slate-900">
                {r.customer}
                {r.orderRef && <span className="text-slate-400 font-normal"> · {r.orderRef}</span>}
              </p>
              <div className="flex items-center gap-2">
                {r.receivedAt ? (
                  <span className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {r.rating}/5
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                    Awaiting review
                  </span>
                )}
                {r.receivedAt && (
                  <button
                    onClick={() => toggleApproved(r)}
                    className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest rounded-full px-2.5 py-1 border ${
                      r.approved
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-stone-50 text-stone-500 border-stone-200 hover:border-emerald-300"
                    }`}
                  >
                    {r.approved && <Check className="w-3 h-3" />}
                    {r.approved ? "On storefront" : "Approve"}
                  </button>
                )}
              </div>
            </div>

            {r.text && <p className="text-sm text-slate-600 mt-2 italic">“{r.text}”</p>}
            <p className="text-[11px] text-slate-400 mt-1">
              Request sent {new Date(r.requestSentAt).toLocaleDateString()}
              {r.receivedAt && ` · received ${new Date(r.receivedAt).toLocaleDateString()}`}
            </p>

            {!r.receivedAt && recording !== r.id && (
              <button
                onClick={() => setRecording(r.id)}
                className="mt-2 text-[11px] font-black uppercase tracking-widest text-purple-700 hover:text-purple-900"
              >
                Record review
              </button>
            )}
            {recording === r.id && (
              <div className="mt-3 rounded-lg bg-stone-50 border border-stone-200 p-3 space-y-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
                      <Star
                        className={`w-5 h-5 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-stone-300"}`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="What did they say?"
                  rows={2}
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveReview(r.id)}
                    className="rounded-lg bg-slate-900 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-white hover:bg-purple-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setRecording(null)}
                    className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-sm text-slate-500 py-6 text-center">
            No review requests logged yet. Send one after each delivery.
          </p>
        )}
      </div>
    </div>
  );
}
