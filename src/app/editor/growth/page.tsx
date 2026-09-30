"use client";

import { useState } from "react";
import { Inbox, Star, MessageCircle } from "lucide-react";
import QuotePipeline from "./QuotePipeline";
import ReviewTracker from "./ReviewTracker";
import DMKeywords from "./DMKeywords";

const TABS = [
  { id: "quotes", label: "Quote Pipeline", icon: Inbox },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "dm", label: "DM Keywords", icon: MessageCircle },
] as const;

export default function GrowthPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("quotes");

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-xl font-black tracking-widest uppercase text-gray-900">
          Growth{" "}
          <span className="bg-chromium-purple bg-300% animate-chromium-glint text-transparent bg-clip-text">
            Engine
          </span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">Quotes, reviews, and DM automation — the revenue flywheel.</p>
      </header>

      <div className="flex gap-2 mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-colors ${
              tab === id ? "bg-purple-700 text-white" : "bg-white text-slate-500 border border-stone-200 hover:border-purple-300"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="max-w-4xl">
        {tab === "quotes" && <QuotePipeline />}
        {tab === "reviews" && <ReviewTracker />}
        {tab === "dm" && <DMKeywords />}
      </div>
    </div>
  );
}
