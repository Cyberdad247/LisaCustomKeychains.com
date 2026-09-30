"use client";

import { useState } from "react";
import { Sparkles, Loader2, Check, ChevronDown, ChevronUp } from "lucide-react";
import { CAMPAIGN_PACKS, type CampaignPack } from "@/lib/campaigns";

function PackCard({ pack }: { pack: CampaignPack }) {
  const [expanded, setExpanded] = useState(false);
  const [activating, setActivating] = useState(false);
  const [done, setDone] = useState(false);

  async function activate() {
    if (activating || done) return;
    setActivating(true);
    try {
      // Queue the hero + announcement as content items for Lisa's approval
      await fetch("/api/content-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "campaign-hero",
          title: `${pack.name} — hero copy`,
          body: `Headline: ${pack.hero.headline}\nSubline: ${pack.hero.subline}\nCTA: ${pack.hero.cta}\n\nAnnouncement bar: ${pack.announcement}`,
          status: "pending",
        }),
      });
      // Create social drafts
      for (const d of pack.socialDrafts) {
        await fetch("/api/social", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            platform: d.platform,
            content: d.content,
            hashtags: d.hashtags,
            status: "draft",
            scheduledDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
          }),
        });
      }
      setDone(true);
    } catch (e) {
      console.error(e);
    } finally {
      setActivating(false);
    }
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-700">{pack.season}</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">{pack.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{pack.tagline}</p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="rounded p-1 text-slate-400 hover:bg-stone-100"
          aria-label="Preview pack"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3 border-t border-stone-100 pt-4 text-sm">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hero</p>
            <p className="font-semibold text-slate-900">{pack.hero.headline}</p>
            <p className="text-slate-600">{pack.hero.subline}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Announcement</p>
            <p className="text-slate-700">{pack.announcement}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Social drafts ({pack.socialDrafts.length})
            </p>
            <ul className="mt-1 space-y-1">
              {pack.socialDrafts.map((d, i) => (
                <li key={i} className="text-slate-600">
                  <span className="font-semibold capitalize">{d.platform}:</span>{" "}
                  {d.content.slice(0, 80)}…
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <button
        onClick={activate}
        disabled={activating || done}
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-purple-700 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white hover:bg-purple-800 transition-colors disabled:opacity-50"
      >
        {activating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : done ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
        {activating ? "Activating..." : done ? "Queued for approval" : "Activate pack"}
      </button>
    </div>
  );
}

export default function CampaignPacks() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
          Seasonal Campaign Packs
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          One click queues hero copy, announcement text, and social drafts for Lisa&apos;s approval.
        </p>
      </div>
      {CAMPAIGN_PACKS.map((pack) => (
        <PackCard key={pack.id} pack={pack} />
      ))}
    </div>
  );
}
