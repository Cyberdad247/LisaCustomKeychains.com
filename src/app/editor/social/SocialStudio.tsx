"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  Plus,
  Trash2,
  Copy,
  Check,
  Loader2,
  Clock,
  Send,
  X,
  ImageIcon,
} from "lucide-react";
import { hermesStream } from "@/lib/hermes";
import type { SocialPost, SocialPlatform, PostStatus } from "@/app/api/social/route";

const PLATFORMS: {
  id: SocialPlatform;
  label: string;
  charLimit: number;
  color: string;
  bg: string;
}[] = [
  { id: "instagram", label: "Instagram", charLimit: 2200, color: "text-pink-600", bg: "bg-gradient-to-br from-purple-500 to-pink-500" },
  { id: "facebook", label: "Facebook", charLimit: 2000, color: "text-blue-600", bg: "bg-blue-600" },
  { id: "tiktok", label: "TikTok", charLimit: 150, color: "text-slate-900", bg: "bg-slate-900" },
  { id: "pinterest", label: "Pinterest", charLimit: 500, color: "text-red-600", bg: "bg-red-600" },
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_STYLES: Record<PostStatus, string> = {
  draft: "bg-amber-50 text-amber-700 border-amber-200",
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function emptyPost(platform: SocialPlatform = "instagram"): Partial<SocialPost> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return {
    platform,
    content: "",
    imageUrl: "",
    scheduledDate: tomorrow.toISOString().slice(0, 10),
    status: "draft",
    hashtags: [],
  };
}

function PlatformPreview({ post }: { post: Partial<SocialPost> }) {
  const platform = PLATFORMS.find((p) => p.id === post.platform) ?? PLATFORMS[0];

  if (post.platform === "instagram") {
    return (
      <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm max-w-[300px]">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-stone-100">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
          <span className="text-xs font-bold text-slate-900">lisacustomkeychains</span>
        </div>
        {post.imageUrl ? (
          <img src={post.imageUrl} alt="" className="w-full aspect-square object-cover" />
        ) : (
          <div className="w-full aspect-square bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-purple-300" />
          </div>
        )}
        <div className="px-3 py-2">
          <p className="text-xs text-slate-800 line-clamp-3 leading-relaxed">
            {post.content || <span className="text-slate-400 italic">Caption preview…</span>}
          </p>
        </div>
      </div>
    );
  }

  if (post.platform === "facebook") {
    return (
      <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm max-w-[300px]">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-black">LC</div>
          <div>
            <p className="text-xs font-bold text-slate-900">Lisa Custom Keychains</p>
            <p className="text-[10px] text-slate-400">{post.scheduledDate || "Scheduled"}</p>
          </div>
        </div>
        <p className="px-3 pb-2 text-xs text-slate-800 leading-relaxed">
          {post.content || <span className="text-slate-400 italic">Post preview…</span>}
        </p>
        {post.imageUrl ? (
          <img src={post.imageUrl} alt="" className="w-full aspect-video object-cover" />
        ) : (
          <div className="w-full aspect-video bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-blue-300" />
          </div>
        )}
      </div>
    );
  }

  if (post.platform === "tiktok") {
    return (
      <div className="rounded-xl overflow-hidden shadow-sm max-w-[180px] aspect-[9/16] relative bg-slate-900">
        {post.imageUrl ? (
          <img src={post.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-slate-600" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-3">
          <p className="text-[10px] text-white line-clamp-2 leading-tight">
            {post.content || "Caption…"}
          </p>
          <p className="text-[9px] text-slate-400 mt-1">@lisacustomkeychains</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm max-w-[220px]">
      <div className={`${platform.bg} h-2`} />
      {post.imageUrl ? (
        <img src={post.imageUrl} alt="" className="w-full aspect-[2/3] object-cover" />
      ) : (
        <div className="w-full aspect-[2/3] bg-red-50 flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-red-200" />
        </div>
      )}
      <div className="px-3 py-2">
        <p className="text-[10px] text-slate-700 line-clamp-2">
          {post.content || <span className="italic text-slate-400">Pin description…</span>}
        </p>
      </div>
    </div>
  );
}

export default function SocialStudio() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [copied, setCopied] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<SocialPost>>(emptyPost());
  const [aiPrompt, setAiPrompt] = useState("");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const outputRef = useRef<HTMLTextAreaElement>(null);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/social");
      if (res.ok) setPosts(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const currentPlatform = PLATFORMS.find((p) => p.id === draft.platform) ?? PLATFORMS[0];
  const charCount = (draft.content ?? "").length;
  const charOver = charCount > currentPlatform.charLimit;

  function startNew() {
    setEditingId(null);
    setDraft(emptyPost(draft.platform));
    setGeneratedText("");
    setAiPrompt("");
  }

  function loadForEdit(post: SocialPost) {
    setEditingId(post.id);
    setDraft({ ...post });
    setGeneratedText("");
    setAiPrompt("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function savePost() {
    setSaving(true);
    try {
      const url = editingId ? `/api/social?id=${editingId}` : "/api/social";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error("Save failed");
      const saved: SocialPost = await res.json();
      if (editingId) {
        setPosts((prev) => prev.map((p) => (p.id === editingId ? saved : p)));
      } else {
        setPosts((prev) => [saved, ...prev]);
      }
      startNew();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function deletePost(id: string) {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/social?id=${id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) startNew();
  }

  async function generate() {
    if (!aiPrompt.trim() || generating) return;
    setGenerating(true);
    setGeneratedText("");
    await hermesStream(
      {
        intent: "social-caption",
        context: {
          current: aiPrompt.trim(),
          field: `${currentPlatform.label} post (${currentPlatform.charLimit} char limit)`,
        },
      },
      {
        onChunk: (text) => {
          setGeneratedText((prev) => {
            const next = prev + text;
            if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
            return next;
          });
        },
        onDone: () => setGenerating(false),
        onError: () => setGenerating(false),
      }
    );
  }

  function useGenerated() {
    setDraft((prev) => ({ ...prev, content: generatedText }));
    setGeneratedText("");
  }

  function copyGenerated() {
    navigator.clipboard.writeText(generatedText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // Calendar
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const calendarDays: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function postsOnDay(day: number): SocialPost[] {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return posts.filter((p) => p.scheduledDate?.startsWith(dateStr));
  }

  function prevMonth() {
    setCurrentMonth(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setCurrentMonth(new Date(year, month + 1, 1));
  }

  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Page header */}
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600">
            Social Studio
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Content{" "}
            <span className="bg-chromium-purple bg-300% animate-chromium-glint text-transparent bg-clip-text">
              Calendar
            </span>
          </h1>
        </div>
        <button
          onClick={startNew}
          className="flex items-center gap-1.5 rounded-lg bg-slate-950 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          New Post
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* LEFT: Calendar + Post List */}
        <div className="space-y-5 lg:col-span-2">
          {/* Calendar */}
          <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <button onClick={prevMonth} className="rounded p-1 text-slate-500 hover:bg-stone-100">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-bold text-slate-900">
                {MONTH_NAMES[month]} {year}
              </span>
              <button onClick={nextMonth} className="rounded p-1 text-slate-500 hover:bg-stone-100">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {DAYS_OF_WEEK.map((d) => (
                <div key={d} className="py-1 text-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                  {d}
                </div>
              ))}
              {calendarDays.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} />;
                const dayPosts = postsOnDay(day);
                const today = new Date();
                const isToday =
                  today.getFullYear() === year &&
                  today.getMonth() === month &&
                  today.getDate() === day;
                return (
                  <button
                    key={day}
                    onClick={() => {
                      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                      setDraft((prev) => ({ ...prev, scheduledDate: dateStr }));
                    }}
                    className={`relative flex flex-col items-center rounded-lg py-1 text-xs transition-colors ${
                      isToday
                        ? "bg-purple-600 font-bold text-white"
                        : "text-slate-700 hover:bg-stone-100"
                    }`}
                  >
                    {day}
                    {dayPosts.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {dayPosts.slice(0, 3).map((_, j) => (
                          <span key={j} className={`w-1 h-1 rounded-full ${isToday ? "bg-white/70" : "bg-purple-400"}`} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Post list */}
          <div className="rounded-xl border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-200 px-4 py-3">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
                All Posts ({posts.length})
              </h2>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
              </div>
            ) : posts.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="mx-auto h-8 w-8 text-stone-300" />
                <p className="mt-2 text-xs text-slate-400">No posts yet. Create your first one!</p>
              </div>
            ) : (
              <ul className="divide-y divide-stone-100">
                {posts.map((post) => {
                  const plt = PLATFORMS.find((p) => p.id === post.platform);
                  return (
                    <li key={post.id} className="flex items-start gap-3 px-4 py-3">
                      <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${plt?.bg ?? "bg-gray-400"}`} />
                      <div className="min-w-0 flex-1 cursor-pointer" onClick={() => loadForEdit(post)}>
                        <p className="text-xs font-semibold text-slate-900 line-clamp-1">
                          {post.content || "(no content)"}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[9px] uppercase tracking-wider text-slate-400">
                            {plt?.label}
                          </span>
                          {post.scheduledDate && (
                            <span className="flex items-center gap-0.5 text-[9px] text-slate-400">
                              <Clock className="h-2.5 w-2.5" />
                              {post.scheduledDate}
                            </span>
                          )}
                          <span className={`rounded-full border px-1.5 py-0 text-[9px] font-bold ${STATUS_STYLES[post.status]}`}>
                            {post.status}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="ml-1 shrink-0 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* RIGHT: Post Creator */}
        <div className="space-y-5 lg:col-span-3">
          <div className="rounded-xl border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-200 px-5 py-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
                {editingId ? "Edit Post" : "Create Post"}
              </h2>
            </div>

            <div className="p-5 space-y-5">
              {/* Platform tabs */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mb-2">
                  Platform
                </label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((plt) => (
                    <button
                      key={plt.id}
                      onClick={() => setDraft((prev) => ({ ...prev, platform: plt.id }))}
                      className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all ${
                        draft.platform === plt.id
                          ? "bg-slate-950 text-white shadow-sm"
                          : "border border-stone-200 bg-white text-slate-600 hover:border-slate-400"
                      }`}
                    >
                      {plt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Generator */}
              <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-purple-700">
                    AI Caption Generator · Hermes
                  </span>
                </div>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder={`Describe your post (e.g. "new basketball keychain drop, showing close-up of stitching detail")`}
                  rows={2}
                  className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 resize-none"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={generate}
                    disabled={!aiPrompt.trim() || generating}
                    className="flex items-center gap-1.5 rounded-lg bg-purple-700 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white hover:bg-purple-900 disabled:opacity-40 transition-colors"
                  >
                    {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    Generate
                  </button>
                  {generatedText && !generating && (
                    <>
                      <button
                        onClick={useGenerated}
                        className="flex items-center gap-1 rounded-lg border border-purple-300 bg-white px-3 py-2 text-[11px] font-bold text-purple-700 hover:bg-purple-50 transition-colors"
                      >
                        <Check className="h-3 w-3" />
                        Use
                      </button>
                      <button
                        onClick={copyGenerated}
                        className="flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-stone-50 transition-colors"
                      >
                        {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        Copy
                      </button>
                    </>
                  )}
                </div>
                {(generatedText || generating) && (
                  <textarea
                    ref={outputRef}
                    readOnly
                    value={generatedText}
                    rows={4}
                    className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none resize-none"
                  />
                )}
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                    Content
                  </label>
                  <span className={`text-[10px] font-bold ${charOver ? "text-rose-600" : "text-slate-400"}`}>
                    {charCount}/{currentPlatform.charLimit}
                  </span>
                </div>
                <textarea
                  value={draft.content ?? ""}
                  onChange={(e) => setDraft((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your post caption…"
                  rows={5}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm text-slate-950 outline-none focus:ring-2 focus:ring-purple-100 resize-none ${
                    charOver ? "border-rose-300 focus:border-rose-400" : "border-stone-200 focus:border-purple-300"
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Image URL */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={draft.imageUrl ?? ""}
                    onChange={(e) => setDraft((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://…"
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                {/* Scheduled date */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mb-2">
                    Schedule Date
                  </label>
                  <input
                    type="date"
                    value={draft.scheduledDate ?? ""}
                    onChange={(e) => setDraft((prev) => ({ ...prev, scheduledDate: e.target.value }))}
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mb-2">
                  Status
                </label>
                <div className="flex gap-2">
                  {(["draft", "scheduled", "published"] as PostStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setDraft((prev) => ({ ...prev, status: s }))}
                      className={`rounded-full border px-3 py-1 text-[11px] font-bold capitalize transition-colors ${
                        draft.status === s
                          ? STATUS_STYLES[s]
                          : "border-stone-200 bg-white text-slate-500 hover:bg-stone-50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
                <button
                  onClick={savePost}
                  disabled={saving || !draft.content?.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-950 px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-white hover:bg-purple-700 disabled:opacity-40 transition-colors"
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : draft.status === "published" ? (
                    <Send className="h-3.5 w-3.5" />
                  ) : (
                    <Calendar className="h-3.5 w-3.5" />
                  )}
                  {saving ? "Saving…" : editingId ? "Update Post" : draft.status === "published" ? "Publish" : "Save"}
                </button>
                {editingId && (
                  <button
                    onClick={startNew}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel edit
                  </button>
                )}
              </div>

              {/* Preview */}
              {(draft.content || draft.imageUrl) && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mb-3">
                    Preview
                  </p>
                  <PlatformPreview post={draft} />
                </div>
              )}
            </div>
          </div>

          {/* Meta API note */}
          <div className="rounded-xl border border-dashed border-purple-300 bg-purple-50 px-5 py-4">
            <p className="text-[11px] font-bold text-purple-700">
              Auto-posting via Meta API
            </p>
            <p className="mt-1 text-[11px] text-purple-600 leading-relaxed">
              Set{" "}
              <code className="rounded bg-purple-100 px-1 font-mono">META_ACCESS_TOKEN</code>{" "}
              in Vercel environment variables to enable one-click publishing to Instagram and Facebook.
              Posts with status <strong>"published"</strong> will be sent immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
