"use client";

import { useEffect, useState } from "react";
import { Crown, Check, MessageCircle, ChevronDown, PartyPopper } from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  detail: string;
  href?: string;
  linkLabel?: string;
  bobQuestion: string;
}

const STEPS: OnboardingStep[] = [
  {
    id: "meet-bob",
    title: "Meet Sir BoB",
    detail: "Your chamberlain lives in the AI Cockpit below. Say hello and let him introduce himself.",
    bobQuestion: "Introduce yourself, Sir BoB — tell me in a few sentences what you can do for me in this editor.",
  },
  {
    id: "first-post",
    title: "Create your first post",
    detail: "Open Social Studio and write or schedule an Instagram post.",
    href: "/editor/social",
    linkLabel: "Open Social Studio",
    bobQuestion: "Walk me through creating my first social post, step by step.",
  },
  {
    id: "draft-week",
    title: "Draft a week with BoB",
    detail: "In Social Studio, press “Draft with Sir BoB” for a Mon/Wed/Fri set.",
    href: "/editor/social",
    linkLabel: "Open Social Studio",
    bobQuestion: "What does “Draft with Sir BoB” do, and what happens after I press it?",
  },
  {
    id: "approve-queue",
    title: "Approve your content queue",
    detail: "Back on Command, review drafts in the content queue and approve the good ones.",
    bobQuestion: "How do I review and approve drafts in my content queue?",
  },
  {
    id: "campaign",
    title: "Activate a seasonal campaign",
    detail: "Pick a campaign pack below — Halloween, Black Friday, or Christmas — and activate it.",
    bobQuestion: "Which campaign pack should I activate first, and what will it do?",
  },
  {
    id: "growth-tour",
    title: "Tour the Growth tab",
    detail: "Quotes, reviews, and DM automation live under Growth in the top nav.",
    href: "/editor/growth",
    linkLabel: "Open Growth",
    bobQuestion: "Explain the quote pipeline to me — what do the stages mean?",
  },
  {
    id: "first-review",
    title: "Log a review request",
    detail: "After your next delivery, log it in Growth → Reviews so no testimonial slips away.",
    href: "/editor/growth",
    linkLabel: "Open Reviews",
    bobQuestion: "How do I track reviews, and why does it matter?",
  },
];

const STORAGE_KEY = "lisa-editor-onboarding";
const HIDDEN_KEY = "lisa-editor-onboarding-hidden";

export function askCockpitBob(question: string) {
  window.dispatchEvent(new CustomEvent("cockpit-ask-bob", { detail: question }));
  document.getElementById("ai-cockpit")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function OnboardingChecklist() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [hidden, setHidden] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      setDone(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
      setHidden(localStorage.getItem(HIDDEN_KEY) === "1");
    } catch {
      /* fresh start */
    }
    setLoaded(true);
  }, []);

  const toggle = (id: string) => {
    setDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const hide = () => {
    setHidden(true);
    try {
      localStorage.setItem(HIDDEN_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  if (!loaded || hidden) return null;

  const completed = STEPS.filter((s) => done[s.id]).length;
  const allDone = completed === STEPS.length;

  return (
    <section className="mb-8 rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-amber-50/50 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-3 px-6 py-4 text-left"
      >
        <span className="w-9 h-9 rounded-full bg-purple-700 text-white flex items-center justify-center shrink-0">
          {allDone ? <PartyPopper className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
        </span>
        <span className="flex-1">
          <span className="block text-sm font-black uppercase tracking-widest text-slate-900">
            {allDone ? "Onboarding complete, my Queen" : "Queen's onboarding"}
          </span>
          <span className="block text-xs text-slate-500 mt-0.5">
            {allDone
              ? "Sir BoB stands ready whenever you need him."
              : `${completed} of ${STEPS.length} steps — Sir BoB will guide you through each one.`}
          </span>
        </span>
        <span className="text-[11px] font-black text-purple-700 bg-purple-100 rounded-full px-2.5 py-1">
          {completed}/{STEPS.length}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="px-6 pb-5">
          {allDone && (
            <div className="mb-3 flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
              <p className="text-sm text-emerald-800">
                The realm is yours. BoB remains at your service in the Cockpit below.
              </p>
              <button
                onClick={hide}
                className="text-[11px] font-black uppercase tracking-widest text-emerald-700 hover:text-emerald-900"
              >
                Dismiss
              </button>
            </div>
          )}
          <ol className="space-y-2.5">
            {STEPS.map((step, i) => {
              const isDone = !!done[step.id];
              return (
                <li
                  key={step.id}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 transition-colors ${
                    isDone ? "border-emerald-200 bg-emerald-50/50" : "border-stone-200 bg-white"
                  }`}
                >
                  <button
                    onClick={() => toggle(step.id)}
                    aria-label={isDone ? `Mark "${step.title}" not done` : `Mark "${step.title}" done`}
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isDone
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-stone-300 hover:border-purple-500"
                    }`}
                  >
                    {isDone && <Check className="w-3 h-3" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${isDone ? "text-slate-500 line-through" : "text-slate-900"}`}>
                      <span className="text-slate-400 font-mono text-xs mr-1.5">{i + 1}.</span>
                      {step.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{step.detail}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {step.href && (
                        <a
                          href={step.href}
                          className="text-[11px] font-black uppercase tracking-widest text-purple-700 hover:text-purple-900"
                        >
                          {step.linkLabel} →
                        </a>
                      )}
                      <button
                        onClick={() => askCockpitBob(step.bobQuestion)}
                        className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-amber-700 hover:text-amber-900"
                      >
                        <MessageCircle className="w-3 h-3" />
                        Ask BoB
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
}
