"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  ExternalLink,
  Link2,
  ChevronDown,
  ChevronUp,
  Eye,
  Edit3,
  Check,
  FileText,
  Globe,
  X,
} from "lucide-react";
import { hermesStream } from "@/lib/hermes";
import type { BlogPost, AffiliateLink } from "@/app/api/blog/route";
import type { AffiliateProgram } from "@/app/api/blog/affiliates/route";

function emptyPost(): Partial<BlogPost> {
  return {
    title: "",
    excerpt: "",
    content: "",
    coverImageUrl: "",
    metaTitle: "",
    metaDescription: "",
    targetKeyword: "",
    tags: [],
    affiliateLinks: [],
    status: "draft",
  };
}

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 60);
}

function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h4 class='text-base font-bold mt-4 mb-1'>$1</h4>")
    .replace(/^## (.+)$/gm, "<h3 class='text-lg font-bold mt-5 mb-2'>$1</h3>")
    .replace(/^# (.+)$/gm, "<h2 class='text-xl font-bold mt-6 mb-2'>$1</h2>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-purple-700 underline" target="_blank" rel="noopener sponsored">$1</a>')
    .replace(/^- (.+)$/gm, "<li class='ml-4 list-disc'>$1</li>")
    .replace(/\n\n/g, "</p><p class='mb-3'>")
    .replace(/^(?!<[h234li])(.+)$/gm, "<p class='mb-3'>$1</p>");
}

function AffiliateRow({
  link,
  programs,
  onRemove,
}: {
  link: AffiliateLink;
  programs: AffiliateProgram[];
  onRemove: () => void;
}) {
  const program = programs.find((p) => p.id === link.program);
  return (
    <div className="flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
      <Link2 className="h-3.5 w-3.5 shrink-0 text-purple-500" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-900 truncate">{link.text}</p>
        <p className="text-[10px] text-slate-400 truncate">
          {program?.name ?? link.program} · {link.url}
        </p>
      </div>
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-slate-400 hover:text-purple-600 transition-colors"
      >
        <ExternalLink className="h-3 w-3" />
      </a>
      <button onClick={onRemove} className="text-slate-300 hover:text-rose-500 transition-colors">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function BlogEngine() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [programs, setPrograms] = useState<AffiliateProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<BlogPost>>(emptyPost());
  const [aiPrompt, setAiPrompt] = useState("");
  const [preview, setPreview] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [affiliateOpen, setAffiliateOpen] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);
  const [newLink, setNewLink] = useState({ text: "", url: "", program: "" });
  const outputRef = useRef<HTMLTextAreaElement>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [postsRes, programsRes] = await Promise.all([
        fetch("/api/blog"),
        fetch("/api/blog/affiliates"),
      ]);
      if (postsRes.ok) setPosts(await postsRes.json());
      if (programsRes.ok) setPrograms(await programsRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  function startNew() {
    setEditingId(null);
    setDraft(emptyPost());
    setAiPrompt("");
    setPreview(false);
  }

  function loadForEdit(post: BlogPost) {
    setEditingId(post.id);
    setDraft({ ...post });
    setAiPrompt("");
    setPreview(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function savePost(status: "draft" | "published") {
    setSaving(true);
    try {
      const payload = { ...draft, status };
      const url = editingId ? `/api/blog?id=${editingId}` : "/api/blog";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      const saved: BlogPost = await res.json();
      if (editingId) {
        setPosts((prev) => prev.map((p) => (p.id === editingId ? saved : p)));
      } else {
        setPosts((prev) => [saved, ...prev]);
      }
      setEditingId(saved.id);
      setDraft({ ...saved });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function deletePost(id: string) {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/blog?id=${id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) startNew();
  }

  async function generate() {
    if (!aiPrompt.trim() || generating) return;
    setGenerating(true);
    const keyword = draft.targetKeyword || "custom keychains";
    const existingContent = draft.content?.trim();
    const context = existingContent
      ? `Improve and expand this blog post content (keep existing ideas, enhance with SEO for keyword "${keyword}"):\n\n${existingContent}`
      : `Write a complete blog post body for: ${aiPrompt.trim()}. Target keyword: "${keyword}". Include natural mentions for craft supplies and keychain products where relevant for affiliate links.`;

    let streamed = "";
    await hermesStream(
      { intent: "section-body", context: { current: context, field: "blog post" } },
      {
        onChunk: (text) => {
          streamed += text;
          setDraft((prev) => ({ ...prev, content: (existingContent ? existingContent + "\n\n" : "") + streamed }));
          if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
        },
        onDone: () => setGenerating(false),
        onError: () => setGenerating(false),
      }
    );
  }

  async function suggestAffiliateLinks() {
    if (!draft.content?.trim() || generating) return;
    setGenerating(true);
    const context = `Based on this blog post content, suggest 3 natural product mentions where affiliate links to Amazon, Joann, or Michaels would add value. For each, provide: anchor text, suggested product search term, and which program.\n\nContent:\n${draft.content.slice(0, 800)}`;
    let streamed = "";
    await hermesStream(
      { intent: "ad-copy", context: { current: context, field: "affiliate suggestions" } },
      {
        onChunk: (text) => { streamed += text; },
        onDone: () => {
          setDraft((prev) => ({
            ...prev,
            content: (prev.content ?? "") + "\n\n---\n**Affiliate Link Suggestions:**\n" + streamed,
          }));
          setGenerating(false);
          setAffiliateOpen(true);
        },
        onError: () => setGenerating(false),
      }
    );
  }

  function addAffiliateLink() {
    if (!newLink.text.trim() || !newLink.url.trim()) return;
    const link: AffiliateLink = {
      id: crypto.randomUUID(),
      text: newLink.text,
      url: newLink.url,
      program: newLink.program || "custom",
    };
    setDraft((prev) => ({
      ...prev,
      affiliateLinks: [...(prev.affiliateLinks ?? []), link],
    }));
    setNewLink({ text: "", url: "", program: "" });
  }

  function removeAffiliateLink(id: string) {
    setDraft((prev) => ({
      ...prev,
      affiliateLinks: (prev.affiliateLinks ?? []).filter((l) => l.id !== id),
    }));
  }

  async function savePrograms(updated: AffiliateProgram[]) {
    setPrograms(updated);
    await fetch("/api/blog/affiliates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
  }

  const wordCount = (draft.content ?? "").split(/\s+/).filter(Boolean).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600">
            Blog Engine
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Content{" "}
            <span className="bg-chromium-purple bg-300% animate-chromium-glint text-transparent bg-clip-text">
              Creator
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* LEFT: Post list */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-200 px-4 py-3">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
                Posts ({posts.length})
              </h2>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
              </div>
            ) : posts.length === 0 ? (
              <div className="py-6 text-center">
                <FileText className="mx-auto h-6 w-6 text-stone-300" />
                <p className="mt-2 text-[11px] text-slate-400">No posts yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-stone-100">
                {posts.map((post) => (
                  <li
                    key={post.id}
                    className={`flex items-start gap-2 px-3 py-3 cursor-pointer hover:bg-stone-50 transition-colors ${
                      editingId === post.id ? "bg-purple-50" : ""
                    }`}
                    onClick={() => loadForEdit(post)}
                  >
                    <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${post.status === "published" ? "bg-emerald-500" : "bg-amber-400"}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 line-clamp-2 leading-snug">
                        {post.title || "(Untitled)"}
                      </p>
                      <p className="mt-0.5 text-[9px] uppercase tracking-wider text-slate-400">
                        {post.status === "published"
                          ? `Published ${new Date(post.publishedAt).toLocaleDateString()}`
                          : `Draft · Updated ${new Date(post.updatedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Affiliate Programs Manager */}
          <div className="rounded-xl border border-stone-200 bg-white shadow-sm">
            <button
              onClick={() => setProgramsOpen((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3"
            >
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
                Affiliate Programs
              </h2>
              {programsOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>
            {programsOpen && (
              <div className="border-t border-stone-100 px-4 py-3 space-y-3">
                {programs.map((prog, i) => (
                  <div key={prog.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold text-slate-800">{prog.name}</p>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={prog.active}
                          onChange={(e) => {
                            const updated = programs.map((p, j) =>
                              j === i ? { ...p, active: e.target.checked } : p
                            );
                            savePrograms(updated);
                          }}
                          className="h-3 w-3 rounded accent-purple-600"
                        />
                        <span className="text-[9px] text-slate-500">Active</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder="Your affiliate ID"
                      value={prog.affiliateId}
                      onChange={(e) => {
                        const updated = programs.map((p, j) =>
                          j === i ? { ...p, affiliateId: e.target.value } : p
                        );
                        setPrograms(updated);
                      }}
                      onBlur={() => savePrograms(programs)}
                      className="w-full rounded-md border border-stone-200 px-2 py-1 text-[11px] outline-none focus:border-purple-300"
                    />
                    <p className="text-[9px] text-slate-400">{prog.commission} commission</p>
                    {prog.signupUrl && (
                      <a
                        href={prog.signupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-0.5 text-[9px] text-purple-600 hover:underline"
                      >
                        Sign up <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Editor */}
        <div className="lg:col-span-3 space-y-5">
          <div className="rounded-xl border border-stone-200 bg-white shadow-sm">
            {/* Editor toolbar */}
            <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3">
              <div className="flex items-center gap-2">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
                  {editingId ? "Editing Post" : "New Post"}
                </h2>
                {editingId && draft.status === "published" && (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                    Live
                  </span>
                )}
                {wordCount > 0 && (
                  <span className="text-[9px] text-slate-400">{wordCount} words</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreview((v) => !v)}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                    preview
                      ? "bg-purple-100 text-purple-700"
                      : "text-slate-400 hover:bg-stone-100 hover:text-slate-700"
                  }`}
                >
                  {preview ? <Edit3 className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {preview ? "Edit" : "Preview"}
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mb-2">
                  Title
                </label>
                <input
                  value={draft.title ?? ""}
                  onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. 10 Unique Keychain Gift Ideas for Sports Fans"
                  className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-lg font-semibold text-slate-950 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
                />
                {draft.title && (
                  <p className="mt-1 text-[10px] text-slate-400">
                    Slug: /blog/{slugify(draft.title)}
                  </p>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mb-2">
                  Excerpt (shown in listing)
                </label>
                <textarea
                  value={draft.excerpt ?? ""}
                  onChange={(e) => setDraft((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="1–2 sentence summary of this post…"
                  rows={2}
                  className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 resize-none"
                />
              </div>

              {/* AI Generator */}
              <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-purple-700">
                    AI Blog Writer · Hermes
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-purple-600 mb-1">
                      Target Keyword (SEO)
                    </label>
                    <input
                      value={draft.targetKeyword ?? ""}
                      onChange={(e) => setDraft((prev) => ({ ...prev, targetKeyword: e.target.value }))}
                      placeholder="e.g. custom keychains gifts"
                      className="w-full rounded-md border border-purple-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-purple-600 mb-1">
                      Post Idea / Topic
                    </label>
                    <input
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g. gift ideas for sports fans"
                      className="w-full rounded-md border border-purple-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={generate}
                    disabled={(!aiPrompt.trim() && !draft.content?.trim()) || generating}
                    className="flex items-center gap-1.5 rounded-lg bg-purple-700 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white hover:bg-purple-900 disabled:opacity-40 transition-colors"
                  >
                    {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {draft.content?.trim() ? "Expand Content" : "Generate Post"}
                  </button>
                  {draft.content?.trim() && !generating && (
                    <button
                      onClick={suggestAffiliateLinks}
                      disabled={generating}
                      className="flex items-center gap-1.5 rounded-lg border border-purple-300 bg-white px-4 py-2 text-[11px] font-bold text-purple-700 hover:bg-purple-50 transition-colors"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      Suggest Affiliate Links
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mb-2">
                  Content (Markdown)
                </label>
                {preview ? (
                  <div
                    className="min-h-64 rounded-lg border border-stone-200 bg-stone-50 px-5 py-4 text-sm text-slate-900 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: draft.content
                        ? renderMarkdown(draft.content)
                        : "<p class='text-slate-400 italic'>Nothing to preview yet.</p>",
                    }}
                  />
                ) : (
                  <textarea
                    ref={outputRef}
                    value={draft.content ?? ""}
                    onChange={(e) => setDraft((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your blog post here. Markdown is supported: **bold**, # Heading, [link](url), - list"
                    rows={14}
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-3 font-mono text-sm text-slate-950 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 resize-y"
                  />
                )}
              </div>

              {/* Cover image */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mb-2">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={draft.coverImageUrl ?? ""}
                  onChange={(e) => setDraft((prev) => ({ ...prev, coverImageUrl: e.target.value }))}
                  placeholder="https://…"
                  className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  value={(draft.tags ?? []).join(", ")}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                    }))
                  }
                  placeholder="keychains, gifts, crafts"
                  className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
                />
              </div>

              {/* SEO Fields (collapsible) */}
              <div className="rounded-lg border border-stone-200">
                <button
                  onClick={() => setSeoOpen((v) => !v)}
                  className="flex w-full items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-700">
                      SEO Fields
                    </span>
                  </div>
                  {seoOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                {seoOpen && (
                  <div className="border-t border-stone-200 px-4 py-4 space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        Meta Title (max 60 chars)
                      </label>
                      <input
                        value={draft.metaTitle ?? ""}
                        onChange={(e) => setDraft((prev) => ({ ...prev, metaTitle: e.target.value }))}
                        placeholder={draft.title ?? "Page title for Google"}
                        maxLength={60}
                        className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-purple-300"
                      />
                      <p className="mt-0.5 text-[9px] text-slate-400">
                        {(draft.metaTitle ?? "").length}/60 chars
                      </p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        Meta Description (max 160 chars)
                      </label>
                      <textarea
                        value={draft.metaDescription ?? ""}
                        onChange={(e) => setDraft((prev) => ({ ...prev, metaDescription: e.target.value }))}
                        placeholder={draft.excerpt ?? "Shown in Google search results…"}
                        maxLength={160}
                        rows={2}
                        className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-purple-300 resize-none"
                      />
                      <p className="mt-0.5 text-[9px] text-slate-400">
                        {(draft.metaDescription ?? "").length}/160 chars
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Affiliate Links (collapsible) */}
              <div className="rounded-lg border border-stone-200">
                <button
                  onClick={() => setAffiliateOpen((v) => !v)}
                  className="flex w-full items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <Link2 className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-700">
                      Affiliate Links
                    </span>
                    {(draft.affiliateLinks ?? []).length > 0 && (
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[9px] font-bold text-purple-700">
                        {draft.affiliateLinks!.length}
                      </span>
                    )}
                  </div>
                  {affiliateOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                {affiliateOpen && (
                  <div className="border-t border-stone-200 px-4 py-4 space-y-3">
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Links added here appear in a <strong>Resources</strong> section at the end of the post with proper <code className="rounded bg-stone-100 px-1 text-[9px]">rel="sponsored"</code> disclosure.
                    </p>

                    {/* Existing links */}
                    <div className="space-y-2">
                      {(draft.affiliateLinks ?? []).map((link) => (
                        <AffiliateRow
                          key={link.id}
                          link={link}
                          programs={programs}
                          onRemove={() => removeAffiliateLink(link.id)}
                        />
                      ))}
                    </div>

                    {/* Add new */}
                    <div className="rounded-lg border border-dashed border-stone-300 p-3 space-y-2">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Add Link</p>
                      <input
                        value={newLink.text}
                        onChange={(e) => setNewLink((prev) => ({ ...prev, text: e.target.value }))}
                        placeholder="Anchor text (e.g. keychain cord)"
                        className="w-full rounded border border-stone-200 px-2.5 py-1.5 text-xs outline-none focus:border-purple-300"
                      />
                      <input
                        type="url"
                        value={newLink.url}
                        onChange={(e) => setNewLink((prev) => ({ ...prev, url: e.target.value }))}
                        placeholder="Affiliate URL"
                        className="w-full rounded border border-stone-200 px-2.5 py-1.5 text-xs outline-none focus:border-purple-300"
                      />
                      <div className="flex items-center gap-2">
                        <select
                          value={newLink.program}
                          onChange={(e) => setNewLink((prev) => ({ ...prev, program: e.target.value }))}
                          className="flex-1 rounded border border-stone-200 px-2.5 py-1.5 text-xs outline-none focus:border-purple-300"
                        >
                          <option value="">Program…</option>
                          {programs.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        <button
                          onClick={addAffiliateLink}
                          disabled={!newLink.text.trim() || !newLink.url.trim()}
                          className="flex items-center gap-1 rounded bg-slate-950 px-3 py-1.5 text-[10px] font-bold text-white disabled:opacity-40 hover:bg-purple-700 transition-colors"
                        >
                          <Check className="h-3 w-3" />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action row */}
              <div className="flex flex-wrap items-center gap-3 border-t border-stone-100 pt-4">
                <button
                  onClick={() => savePost("published")}
                  disabled={saving || !draft.title?.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-950 px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-white hover:bg-purple-700 disabled:opacity-40 transition-colors"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
                  {saving ? "Saving…" : "Publish"}
                </button>
                <button
                  onClick={() => savePost("draft")}
                  disabled={saving || !draft.title?.trim()}
                  className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-5 py-2.5 text-[11px] font-bold text-slate-700 hover:bg-stone-50 disabled:opacity-40 transition-colors"
                >
                  Save Draft
                </button>
                {editingId && draft.status === "published" && (
                  <a
                    href={`/blog/${draft.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] text-purple-600 hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View post
                  </a>
                )}
                {editingId && (
                  <button
                    onClick={() => deletePost(editingId)}
                    className="ml-auto flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
