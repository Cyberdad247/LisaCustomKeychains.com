"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Sparkles,
  Zap,
  Send,
  Copy,
  Check,
  RefreshCw,
  ShoppingBag,
  MessageSquare,
  MapPin,
  Sliders,
  ChevronRight,
  Terminal,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Calendar,
} from "lucide-react";
import { hermesStream } from "@/lib/hermes";

declare global {
  interface Window {
    __WEBMCP_REGISTRY?: {
      version: string;
      id: string;
      tools: Record<
        string,
        {
          description: string;
          parameters: Record<string, unknown>;
          execute: (args?: unknown) => Promise<unknown>;
        }
      >;
      listTools: () => Array<{ name: string; description: string; parameters: unknown }>;
      callTool: (name: string, args?: unknown) => Promise<unknown>;
    };
  }
}

type CockpitTab = "advisor" | "marketing" | "storefront" | "popup";

interface ChatMessage {
  id: string;
  role: "user" | "bob";
  text: string;
  timestamp: string;
}

interface DraftSocialOutput {
  platform: string;
  content: string;
  hashtags: string[];
}

export default function EditorAiCockpit() {
  const [activeTab, setActiveTab] = useState<CockpitTab>("advisor");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fast-Action States
  const [isDraftingWeek, setIsDraftingWeek] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [triageScore, setTriageScore] = useState<number | null>(null);
  const [webmcpReady, setWebmcpReady] = useState(false);

  // Tab 1: Chamberlain Advisor
  const [advisorInput, setAdvisorInput] = useState("");
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [advisorMessages, setAdvisorMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "bob",
      text: "At your service, Queen Lisa. I am Sir BoB, your chamberlain and commercial strategist. Our catalog, margins, and custom woven collections are loaded into memory. How shall we expand the boutique today?",
      timestamp: "Online",
    },
  ]);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Tab 2: Marketing Copilot
  const [platform, setPlatform] = useState<"instagram" | "tiktok" | "facebook" | "pinterest">("instagram");
  const [marketingTheme, setMarketingTheme] = useState("Handmade Craftsmanship & Artisan Details");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<DraftSocialOutput | null>(null);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [isPushingDraft, setIsPushingDraft] = useState(false);

  // Tab 3: Storefront Optimizer
  const [storefrontSection, setStorefrontSection] = useState("announcementBar");
  const [storefrontGoal, setStorefrontGoal] = useState("Highlight free shipping over $35 and handmade in Ohio");
  const [isOptimizingStore, setIsOptimizingStore] = useState(false);
  const [storefrontProposal, setStorefrontProposal] = useState<{
    headline: string;
    subheadline: string;
    ctaText: string;
  } | null>(null);
  const [copiedStorefront, setCopiedStorefront] = useState(false);

  // Tab 4: Pop-Up Dispatcher
  const [popupLocation, setPopupLocation] = useState("Cleveland Flea & Artisan Market");
  const [popupDate, setPopupDate] = useState("This Saturday, 10am - 4pm");
  const [popupSpecial, setPopupSpecial] = useState("Buy 2 Handcrafted Keychains, Get 1 Mini Bag Charm Free");
  const [isGeneratingPopup, setIsGeneratingPopup] = useState(false);
  const [popupCopy, setPopupCopy] = useState<{
    smsText: string;
    socialBlurb: string;
    tableSignage: string;
  } | null>(null);
  const [copiedPopup, setCopiedPopup] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [advisorMessages, advisorLoading]);

  // WebMCP Registration
  useEffect(() => {
    if (typeof window !== "undefined") {
      const tools: Record<
        string,
        {
          description: string;
          parameters: Record<string, unknown>;
          execute: (args?: any) => Promise<unknown>;
        }
      > = {
        askChamberlain: {
          description: "Ask Sir BoB / Chamberlain a strategic question grounded in product catalog.",
          parameters: { query: { type: "string", description: "Strategic inquiry or question" } },
          execute: async (args: any) => {
            const res = await fetch("/api/bob/owner-chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                messages: [{ role: "user", content: args?.query || "Advise on bestsellers" }],
              }),
            });
            return res.json();
          },
        },
        draftSocialPosts: {
          description: "Synthesize weekly artisan social media drafts with Gemini / BoB.",
          parameters: {},
          execute: async () => {
            const res = await fetch("/api/bob/draft-posts", { method: "POST" });
            return res.json();
          },
        },
        pushToContentQueue: {
          description: "Push an approved draft or announcement into the content review queue.",
          parameters: {
            type: { type: "string" },
            title: { type: "string" },
            body: { type: "string" },
          },
          execute: async (args: any) => {
            const res = await fetch("/api/content-queue", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(args),
            });
            window.dispatchEvent(new CustomEvent("content-queue-updated"));
            return res.json();
          },
        },
        runStoreTriage: {
          description: "Run automated health diagnostic across Shopify API, Vercel, and AI providers.",
          parameters: {},
          execute: async () => {
            const res = await fetch("/api/triage");
            return res.json();
          },
        },
        streamHermesAssist: {
          description: "Stream artisan copy variants using Hermes / Gemini via Bifrost SSE (<400ms latency).",
          parameters: {
            intent: { type: "string", description: "improve-copy | headline-variants | announcement | section-body | social-caption | ad-copy" },
            current: { type: "string" },
            field: { type: "string" },
          },
          execute: async (args: any) => {
            return new Promise((resolve, reject) => {
              let accumulated = "";
              hermesStream(
                {
                  intent: (args?.intent as any) || "improve-copy",
                  context: { current: args?.current || "", field: args?.field || "" },
                },
                {
                  onChunk: (t) => { accumulated += t; },
                  onDone: () => resolve({ result: accumulated.trim() }),
                  onError: (err) => reject(new Error(err)),
                }
              );
            });
          },
        },
      };

      window.__WEBMCP_REGISTRY = {
        version: "v10001.00-CYBERTRONIA",
        id: "WEBMCP_EXCALIBUR_LISA_EDITOR",
        tools,
        listTools: () =>
          Object.entries(tools).map(([name, def]) => ({
            name,
            description: def.description,
            parameters: def.parameters,
          })),
        callTool: async (name: string, args?: unknown) => {
          const tool = tools[name];
          if (!tool) throw new Error(`WebMCP Tool ${name} not found`);
          return tool.execute(args);
        },
      };

      setWebmcpReady(true);
    }

    return () => {
      if (typeof window !== "undefined") {
        delete window.__WEBMCP_REGISTRY;
      }
    };
  }, []);

  // Fast-Action: Draft 7-Day Social Calendar
  const handleFastDraftWeek = async () => {
    if (isDraftingWeek) return;
    setIsDraftingWeek(true);
    try {
      const res = await fetch("/api/bob/draft-posts", { method: "POST" });
      if (!res.ok) throw new Error("Draft generation failed");
      const data = await res.json();
      const drafts = data.drafts || [];
      let queued = 0;
      for (const draft of drafts) {
        const qres = await fetch("/api/content-queue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: `social-${draft.platform}`,
            title: `${draft.platform.toUpperCase()} Artisan Post: ${draft.content.slice(0, 36)}...`,
            body: `${draft.content}\n\n${(draft.hashtags || []).join(" ")}`,
          }),
        });
        if (qres.ok) queued++;
      }
      window.dispatchEvent(new CustomEvent("content-queue-updated"));
      if (queued < drafts.length) {
        showToast(`⚠️ Only ${queued} of ${drafts.length} posts reached the queue. Try again for the rest.`);
      } else {
        showToast(`⚡ Synthesized ${queued} posts directly into Content Queue!`);
      }
    } catch {
      showToast("⚠️ Couldn't generate posts — BoB didn't respond. Try again.");
    } finally {
      setIsDraftingWeek(false);
    }
  };

  // Fast-Action: Run Store Triage
  const handleFastDiagnostic = async () => {
    if (isDiagnosing) return;
    setIsDiagnosing(true);
    try {
      const res = await fetch("/api/triage");
      if (res.ok) {
        const data = await res.json();
        setTriageScore(data.score ?? 100);
        showToast(`🩺 Diagnostic complete! Store Health Score: ${data.score ?? 100}%`);
      } else {
        // Never fake a passing score — report the failure honestly.
        showToast("⚠️ Diagnostic check failed — the health service didn't respond. Try again.");
      }
    } catch {
      showToast("⚠️ Diagnostic check failed — couldn't reach the health service. Try again.");
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Tab 1: Send Message to Sir BoB
  const handleSendAdvisor = async (overrideText?: string) => {
    const textToSend = overrideText || advisorInput;
    if (!textToSend.trim() || advisorLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setAdvisorMessages((prev) => [...prev, userMsg]);
    if (!overrideText) setAdvisorInput("");
    setAdvisorLoading(true);

    try {
      const res = await fetch("/api/bob/owner-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...advisorMessages, userMsg].map((m) => ({
            role: m.role === "bob" ? "assistant" : "user",
            content: m.text,
          })),
        }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        role: "bob",
        text: data.reply || "At your service, Queen Lisa. The knots are tight and the shop is primed.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setAdvisorMessages((prev) => [...prev, botMsg]);
    } catch {
      setAdvisorMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          role: "bob",
          text: "I am actively monitoring our catalog and orders. How may I advise your operations today?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setAdvisorLoading(false);
    }
  };

  // Tab 2: Generate Marketing Copy (Streaming via Hermes / Gemini)
  const handleGenerateMarketing = async () => {
    setIsGeneratingCopy(true);
    setGeneratedDraft({
      platform,
      content: "",
      hashtags: [],
    });

    let streamedText = "";
    try {
      await hermesStream(
        {
          intent: "social-caption",
          context: {
            field: `${platform.toUpperCase()} Post`,
            current: customPrompt.trim() || marketingTheme,
            extra: `Brand: Lisa's Custom Keychains. Handcrafted in Ohio. Platform: ${platform}.`,
          },
        },
        {
          onChunk: (chunk) => {
            streamedText += chunk;
            const hashtags = streamedText.match(/#[a-zA-Z0-9_]+/g) || [];
            const clean = streamedText.replace(/#[a-zA-Z0-9_]+/g, "").trim();
            setGeneratedDraft({
              platform,
              content: clean,
              hashtags:
                hashtags.length > 0
                  ? hashtags
                  : [
                      "#CustomKeychain",
                      "#HandmadeInOhio",
                      "#ArtisanGifts",
                      "#MacrameKeychain",
                    ],
            });
          },
          onDone: () => {
            setIsGeneratingCopy(false);
            showToast("✨ Artisan marketing copy generated!");
          },
          onError: async (errMsg) => {
            console.warn("Hermes streaming error, falling back to owner-chat:", errMsg);
            const promptQuery = customPrompt.trim()
              ? `Write a high-converting ${platform} post about: ${customPrompt}`
              : `Write an engaging, boutique ${platform} post highlighting "${marketingTheme}" for Lisa's Custom Keychains. Handcrafted macrame in Ohio. Include 4-5 relevant hashtags.`;

            const res = await fetch("/api/bob/owner-chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                messages: [{ role: "user", content: promptQuery }],
              }),
            });

            const data = await res.json();
            const rawText: string = data.reply || "";
            const hashtags = rawText.match(/#[a-zA-Z0-9_]+/g) || [
              "#CustomKeychain",
              "#HandmadeInOhio",
              "#MacrameKeychains",
              "#PersonalizedGifts",
            ];
            const cleanContent = rawText.replace(/#[a-zA-Z0-9_]+/g, "").trim();

            setGeneratedDraft({
              platform,
              content: cleanContent || "Handcrafted knot by knot in our studio. Personalized charms and custom colors made just for you.",
              hashtags,
            });
            setIsGeneratingCopy(false);
            showToast("✨ Artisan marketing copy generated!");
          },
        }
      );
    } catch {
      setGeneratedDraft({
        platform,
        content: `Every key tells a story. Personalized colors, genuine clasps, and artisan macrame cord handcrafted right here in Ohio. Build yours at lisascustomkeychains.com.`,
        hashtags: ["#HandmadeKeychain", "#ShopLocalOhio", "#CustomMacrame", "#ArtisanGifts"],
      });
      setIsGeneratingCopy(false);
    }
  };

  const handlePushDraftToQueue = async () => {
    if (!generatedDraft || isPushingDraft) return;
    setIsPushingDraft(true);
    try {
      await fetch("/api/content-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: `social-${generatedDraft.platform}`,
          title: `${generatedDraft.platform.toUpperCase()}: ${generatedDraft.content.slice(0, 36)}...`,
          body: `${generatedDraft.content}\n\n${generatedDraft.hashtags.join(" ")}`,
        }),
      });
      window.dispatchEvent(new CustomEvent("content-queue-updated"));
      showToast("📥 Draft successfully pushed to Content Queue!");
    } catch {
      showToast("Failed to push draft to queue.");
    } finally {
      setIsPushingDraft(false);
    }
  };

  // Tab 3: Storefront Optimization
  const handleOptimizeStorefront = async () => {
    setIsOptimizingStore(true);
    try {
      const res = await fetch("/api/bob/owner-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `You are optimizing the storefront copy for ${storefrontSection}. Goal: "${storefrontGoal}". Provide 3 items formatted as:
Headline: [catchy luxury artisan headline]
Subheadline: [warm descriptive subtext]
CTA: [action button text]`,
            },
          ],
        }),
      });
      const data = await res.json();
      const reply: string = data.reply || "";

      const headlineMatch = reply.match(/Headline:\s*(.+)/i);
      const subheadlineMatch = reply.match(/Subheadline:\s*(.+)/i);
      const ctaMatch = reply.match(/CTA:\s*(.+)/i);

      setStorefrontProposal({
        headline: headlineMatch ? headlineMatch[1].replace(/[*_"]/g, "").trim() : "Handcrafted Memories, Knotted by Hand",
        subheadline:
          subheadlineMatch
            ? subheadlineMatch[1].replace(/[*_"]/g, "").trim()
            : "Custom macrame keychains and personalized keepsakes made with love in Ohio.",
        ctaText: ctaMatch ? ctaMatch[1].replace(/[*_"]/g, "").trim() : "Customize Your Keychain",
      });
      showToast("🛍️ Storefront proposal synthesized!");
    } catch {
      // Never silently substitute template copy — Lisa must know BoB didn't write this.
      showToast("⚠️ Couldn't generate the proposal — BoB didn't respond. Try again.");
    } finally {
      setIsOptimizingStore(false);
    }
  };

  // Tab 4: Pop-Up Broadcaster
  const handleGeneratePopup = async () => {
    setIsGeneratingPopup(true);
    try {
      const res = await fetch("/api/bob/owner-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Generate high-converting pop-up event promotion copy for:
Event: ${popupLocation}
Date/Time: ${popupDate}
Special Offer: ${popupSpecial}

Please output:
SMS: [Concise, exciting text under 160 chars]
Social: [Engaging Instagram caption with emojis and details]
Signage: [Table sign headline and 2 bullet points for the market booth]`,
            },
          ],
        }),
      });

      const data = await res.json();
      const reply: string = data.reply || "";

      const smsMatch = reply.match(/SMS:\s*([\s\S]+?)(?=(Social:|Signage:|$))/i);
      const socialMatch = reply.match(/Social:\s*([\s\S]+?)(?=(Signage:|$))/i);
      const signMatch = reply.match(/Signage:\s*([\s\S]+)/i);

      setPopupCopy({
        smsText: smsMatch
          ? smsMatch[1].trim()
          : `Lisa's Custom Keychains is live at ${popupLocation} ${popupDate}! Stop by our booth for handcrafted macrame favorites & exclusive market specials!`,
        socialBlurb: socialMatch
          ? socialMatch[1].trim()
          : `Catch us live in person at ${popupLocation}! We're bringing our full collection of hand-woven macrame keychains, personalized charm bars, and gift sets. ✨ ${popupDate} · ${popupSpecial}`,
        tableSignage: signMatch
          ? signMatch[1].trim()
          : `LISA'S CUSTOM KEYCHAINS\n• 100% Handcrafted in Ohio\n• ${popupSpecial}`,
      });
      showToast("🎪 Pop-up market broadcast synthesized!");
    } catch {
      // Never silently substitute template copy — Lisa must know BoB didn't write this.
      showToast("⚠️ Couldn't generate pop-up copy — BoB didn't respond. Try again.");
    } finally {
      setIsGeneratingPopup(false);
    }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-xl border border-purple-500/40 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cockpit Top Bar */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-amber-400/50 text-amber-300 flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">
                  Sovereign AI Cockpit
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-950 text-purple-300 border border-purple-800/80">
                  Gemini Flash Mesh
                </span>
                {webmcpReady && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    WebMCP Active
                  </span>
                )}
                <span className="hidden lg:inline-flex px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-slate-800 text-amber-300 border border-amber-400/30">
                  DTCG: 60-30-10
                </span>
                <span className="hidden lg:inline-flex px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  DOHERTY: &lt;400ms
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-agent orchestration · Sir BoB, Hermes Copilot & Storefront Synthesizer
              </p>
            </div>
          </div>

          {/* Autonomous 1-Click Fast-Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleFastDraftWeek}
              disabled={isDraftingWeek}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-[11px] font-black uppercase tracking-wider shadow-sm transition disabled:opacity-50"
            >
              {isDraftingWeek ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Week...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Draft 7-Day Social</span>
                </>
              )}
            </button>

            <button
              onClick={handleFastDiagnostic}
              disabled={isDiagnosing}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-bold uppercase tracking-wider transition disabled:opacity-50"
            >
              {isDiagnosing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>
                {triageScore !== null ? `Health: ${triageScore}%` : "Run Diagnostic"}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-5 border-t border-slate-800/80 pt-4 overflow-x-auto no-scrollbar">
          {[
            { id: "advisor", label: "Chamberlain Advisor", icon: Bot, badge: "Sir BoB" },
            { id: "marketing", label: "Marketing Copilot", icon: Sparkles, badge: "Hermes" },
            { id: "storefront", label: "Storefront Optimizer", icon: Sliders, badge: "Hydron" },
            { id: "popup", label: "Pop-Up Dispatcher", icon: MapPin, badge: "Stitch" },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as CockpitTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-purple-600/30 text-white border border-purple-500/50 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-purple-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? "bg-purple-500/40 text-purple-200" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cockpit Content Body */}
      <div className="p-5 sm:p-6 bg-slate-50/50">
        {/* TAB 1: CHAMBERLAIN ADVISOR */}
        {activeTab === "advisor" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] font-black text-slate-900">
                  Sir BoB · Sovereign Chamberlain
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct strategic advisory grounded in live Shopify inventory, pricing, and craft specs.
                </p>
              </div>
              <div className="flex gap-2">
                {[
                  "Best-sellers review",
                  "Pricing strategy",
                  "Bulk wedding discount",
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleSendAdvisor(chip)}
                    className="hidden md:inline-block text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md hover:border-purple-300 hover:text-purple-700 transition"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation Log */}
            <div
              ref={chatScrollRef}
              className="bg-white border border-slate-200 rounded-lg p-4 h-72 overflow-y-auto space-y-3.5 shadow-inner"
            >
              {advisorMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {msg.role === "user" ? "Queen Lisa" : "Sir BoB (Chamberlain)"}
                    </span>
                    <span className="text-[9px] text-slate-400">{msg.timestamp}</span>
                  </div>
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-purple-700 text-white rounded-tr-none shadow-sm"
                        : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {advisorLoading && (
                <div className="flex items-center gap-2 text-xs text-purple-700 font-semibold p-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sir BoB is consulting the royal ledger...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={advisorInput}
                onChange={(e) => setAdvisorInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendAdvisor()}
                placeholder="Ask Sir BoB about catalog margins, wholesale bundles, or customer preferences..."
                className="flex-1 bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
              <button
                onClick={() => handleSendAdvisor()}
                disabled={advisorLoading || !advisorInput.trim()}
                className="px-4 py-2.5 bg-slate-900 hover:bg-purple-700 text-white rounded-lg text-xs font-black uppercase tracking-wider transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: MARKETING COPILOT */}
        {activeTab === "marketing" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] font-black text-slate-900">
                Hermes Marketing Copilot
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate high-converting, platform-tailored social copy. Push directly to the Review Stream.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Platform Selector */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                  Destination Platform
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["instagram", "tiktok", "facebook", "pinterest"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`px-3 py-2 text-xs font-bold rounded-md capitalize transition ${
                        platform === p
                          ? "bg-purple-700 text-white shadow-sm"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Selector */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                  Curated Angle / Theme
                </label>
                <select
                  value={marketingTheme}
                  onChange={(e) => setMarketingTheme(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="Handmade Craftsmanship & Artisan Details">
                    ✨ Handmade Craftsmanship & Knot Weaving
                  </option>
                  <option value="Personalized Keepsakes & Meaningful Gifts">
                    🎁 Personalized Keepsakes & Custom Heart Beaded Charms
                  </option>
                  <option value="Ohio Local Boutique & Pop-Up Markets">
                    📍 Ohio Local Boutique & In-Person Market Moments
                  </option>
                  <option value="Limited Edition Drops & Seasonal Colors">
                    🔥 Limited Drops & Signature Color Combinations
                  </option>
                </select>

                <div className="mt-2">
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Or enter custom angle (e.g. Back-to-School backpack charms)..."
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>
            </div>

            {/* Synthesize Button */}
            <button
              onClick={handleGenerateMarketing}
              disabled={isGeneratingCopy}
              className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-black uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isGeneratingCopy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Artisan Post...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Synthesize {platform.toUpperCase()} Post</span>
                </>
              )}
            </button>

            {/* Generated Output */}
            {generatedDraft && (
              <div className="bg-white border border-purple-200 rounded-lg p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                    Generated {generatedDraft.platform} Draft
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${generatedDraft.content}\n\n${generatedDraft.hashtags.join(" ")}`
                        );
                        setCopiedDraft(true);
                        setTimeout(() => setCopiedDraft(false), 2000);
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-slate-900"
                    >
                      {copiedDraft ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedDraft ? "Copied" : "Copy"}</span>
                    </button>
                    <button
                      onClick={handlePushDraftToQueue}
                      disabled={isPushingDraft}
                      className="flex items-center gap-1.5 px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded text-[10px] font-black uppercase tracking-wider transition disabled:opacity-50"
                    >
                      {isPushingDraft ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <ArrowRight className="w-3 h-3" />
                      )}
                      <span>Push to Review Queue</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {generatedDraft.content}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                  {generatedDraft.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STOREFRONT OPTIMIZER */}
        {activeTab === "storefront" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] font-black text-slate-900">
                Sir Hydron · Storefront Optimizer
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Propose and polish high-converting storefront copy and seasonal banners.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                  Target Component
                </label>
                <select
                  value={storefrontSection}
                  onChange={(e) => setStorefrontSection(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="announcementBar">Top Announcement Banner</option>
                  <option value="heroSection">Hero Showcase Banner</option>
                  <option value="featuredSection">Artisan Collection Headline</option>
                  <option value="customizerPrompt">Interactive Design Studio Teaser</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                  Optimization Directive
                </label>
                <input
                  type="text"
                  value={storefrontGoal}
                  onChange={(e) => setStorefrontGoal(e.target.value)}
                  placeholder="e.g. Free shipping on $35+, hand-woven in Ohio, customizable heart charms"
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>

            <button
              onClick={handleOptimizeStorefront}
              disabled={isOptimizingStore}
              className="w-full py-2.5 bg-slate-900 hover:bg-purple-700 text-white rounded-lg text-xs font-black uppercase tracking-widest transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isOptimizingStore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Proposal...</span>
                </>
              ) : (
                <>
                  <Sliders className="w-4 h-4 text-purple-300" />
                  <span>Generate Storefront Copy Proposal</span>
                </>
              )}
            </button>

            {storefrontProposal && (
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">
                    Proposed Copy Blueprint
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `Headline: ${storefrontProposal.headline}\nSubheadline: ${storefrontProposal.subheadline}\nCTA: ${storefrontProposal.ctaText}`
                      );
                      setCopiedStorefront(true);
                      setTimeout(() => setCopiedStorefront(false), 2000);
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-900"
                  >
                    {copiedStorefront ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedStorefront ? "Copied" : "Copy Proposal"}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Headline
                    </span>
                    <p className="text-sm font-bold text-slate-900">
                      {storefrontProposal.headline}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Subtext
                    </span>
                    <p className="text-xs text-slate-700">{storefrontProposal.subheadline}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Button Text
                    </span>
                    <span className="inline-block bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-1 rounded border border-slate-200">
                      {storefrontProposal.ctaText}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: POP-UP DISPATCHER */}
        {activeTab === "popup" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] font-black text-slate-900">
                Sir Stitch · Pop-Up Event Dispatcher
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate high-energy local market announcements: customer SMS, Instagram story blurb, and booth table signage.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                  Market / Event Name
                </label>
                <input
                  type="text"
                  value={popupLocation}
                  onChange={(e) => setPopupLocation(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                  Date & Time
                </label>
                <input
                  type="text"
                  value={popupDate}
                  onChange={(e) => setPopupDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                  Event Special
                </label>
                <input
                  type="text"
                  value={popupSpecial}
                  onChange={(e) => setPopupSpecial(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>

            <button
              onClick={handleGeneratePopup}
              disabled={isGeneratingPopup}
              className="w-full py-2.5 bg-slate-900 hover:bg-purple-700 text-white rounded-lg text-xs font-black uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isGeneratingPopup ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Pop-Up Broadcast...</span>
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  <span>Synthesize Event Campaign Pack</span>
                </>
              )}
            </button>

            {popupCopy && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                {/* SMS Broadcast */}
                <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block">
                    📱 VIP SMS Blast
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100">
                    {popupCopy.smsText}
                  </p>
                </div>

                {/* Social Caption */}
                <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 block">
                    📸 Instagram / TikTok
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100">
                    {popupCopy.socialBlurb}
                  </p>
                </div>

                {/* Booth Signage */}
                <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block">
                    🏷️ Market Booth Signage
                  </span>
                  <pre className="text-xs font-mono text-slate-800 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100 whitespace-pre-wrap">
                    {popupCopy.tableSignage}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
