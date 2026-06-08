"use client";

import { useEffect, useState } from "react";

type ContentItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

const STATUS_COLORS: Record<ContentItem["status"], string> = {
  pending:  "bg-amber-50 border-amber-200 text-amber-800",
  approved: "bg-emerald-50 border-emerald-200 text-emerald-800",
  rejected: "bg-red-50 border-red-200 text-red-700",
};

const STATUS_DOT: Record<ContentItem["status"], string> = {
  pending:  "bg-amber-400",
  approved: "bg-emerald-500",
  rejected: "bg-red-400",
};

export default function ContentCalendar() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");

  useEffect(() => {
    fetch("/api/content-queue")
      .then((r) => r.json())
      .then((data) => { setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function updateItem(id: string, status: ContentItem["status"], body?: string) {
    const res = await fetch("/api/content-queue", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, body }),
    });
    if (res.ok) {
      const updated: ContentItem = await res.json();
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    }
    setEditing(null);
  }

  const pending  = items.filter((i) => i.status === "pending").length;
  const approved = items.filter((i) => i.status === "approved").length;
  const rejected = items.filter((i) => i.status === "rejected").length;

  return (
    <div className="bg-white border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-900">
          AI Content Queue
        </h2>
        <div className="flex gap-3 text-[10px] font-mono uppercase tracking-wider">
          <span className="text-amber-700">{pending} pending</span>
          <span className="text-emerald-700">{approved} approved</span>
          <span className="text-red-600">{rejected} rejected</span>
        </div>
      </div>

      {loading && (
        <p className="text-xs text-gray-400 animate-pulse">Loading queue…</p>
      )}

      {!loading && items.length === 0 && (
        <p className="text-xs text-gray-500">
          Queue is empty. The daily cron at 9am EST will populate drafts once the
          generate-content route is implemented.
        </p>
      )}

      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.id}
            className={`rounded border p-4 ${STATUS_COLORS[item.status]}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${STATUS_DOT[item.status]}`} />
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold opacity-60">
                    {item.type}
                  </span>
                  <p className="text-sm font-bold leading-snug">{item.title}</p>
                </div>
              </div>
              <span className="text-[10px] opacity-50 whitespace-nowrap">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>

            {editing === item.id ? (
              <div className="mt-3 space-y-2">
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="w-full rounded border border-gray-300 bg-white p-2 text-xs text-gray-800 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 min-h-20"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => updateItem(item.id, "approved", editBody)}
                    className="px-3 py-1 text-[10px] uppercase tracking-widest font-bold bg-emerald-600 text-white rounded hover:bg-emerald-700"
                  >
                    Save & Approve
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="px-3 py-1 text-[10px] uppercase tracking-widest font-bold border border-gray-300 text-gray-600 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="mt-2 text-xs leading-relaxed opacity-80">{item.body}</p>
                {item.status === "pending" && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => updateItem(item.id, "approved")}
                      className="px-3 py-1 text-[10px] uppercase tracking-widest font-bold bg-emerald-600 text-white rounded hover:bg-emerald-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => { setEditing(item.id); setEditBody(item.body); }}
                      className="px-3 py-1 text-[10px] uppercase tracking-widest font-bold border border-amber-400 text-amber-800 rounded hover:bg-amber-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => updateItem(item.id, "rejected")}
                      className="px-3 py-1 text-[10px] uppercase tracking-widest font-bold border border-red-300 text-red-700 rounded hover:bg-red-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
                {item.status !== "pending" && (
                  <button
                    onClick={() => updateItem(item.id, "pending")}
                    className="mt-2 text-[10px] uppercase tracking-widest text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    Reset to pending
                  </button>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
