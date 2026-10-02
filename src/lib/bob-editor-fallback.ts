/**
 * Sir BoB — local editor-aware fallback.
 *
 * When the VPS gateway is unreachable (Cloudflare block, rate limit, model
 * timeout), the owner-chat route falls back to this module instead of a
 * generic greeting. It matches Lisa's question against the editor handbook
 * topics and answers in BoB's voice with real, actionable guidance.
 *
 * This is deterministic and offline-safe: no network, no API keys, instant.
 */

type Topic = {
  keys: string[];
  /** Specific topics (1) beat generic orientation topics (2). */
  priority: 1 | 2;
  answer: string;
};

const TOPICS: Topic[] = [
  {
    keys: ["growth", "quote", "pipeline", "review", "dm keyword", "manychat", "lead"],
    priority: 1,
    answer:
      "The Growth tab is your sales engine, my Queen. It holds the **Quote Pipeline** — every custom inquiry moves through stages: new, contacted, quoted, won, lost — and I can draft replies for each stage. There's also the **Review Tracker** (log review requests, watch your response rate and average rating) and **DM Keywords** (map keywords to auto-replies, with a ManyChat export for automation). A good first move: open the pipeline and move any waiting quotes one stage forward.",
  },
  {
    keys: ["social", "post", "instagram", "content queue", "schedule", "publish", "caption"],
    priority: 1,
    answer:
      "Social Studio is where your content lives, my Queen. Draft posts in the **content queue**, and when you're ready, approve each one — **nothing ever publishes without your explicit say-so**, that's the law. Keep the rhythm: **Monday** product spotlight, **Wednesday** engraving or process clips, **Friday** testimonial or story. And a gentle rule for remembrance pieces: no urgency, no countdowns — memorial content stays soft and never salesy.",
  },
  {
    keys: ["blog", "article", "seo"],
    priority: 1,
    answer:
      "The Blog tab is your storytelling desk, my Queen. Draft articles there — engraving stories, gift guides, behind-the-scenes — and approve them before they go live. Good blog topics double as social captions, so one good draft can feed the whole week.",
  },
  {
    keys: ["ad", "meta", "campaign", "budget", "advertis"],
    priority: 1,
    answer:
      "Campaign Packs live under the Ads tab, my Queen — ready-made creative bundles for Meta campaigns. One standing rule: **no ad spend without your explicit approval on each campaign**. Tell me which product you want to push and I'll help you shape the pack before anything goes near a budget.",
  },
  {
    keys: ["command", "dashboard", "overview", "triage", "health", "cockpit"],
    priority: 1,
    answer:
      "The Command Center is your war-room overview, my Queen. The **AI Cockpit** (where we're speaking now) is my advisor seat, **Triage** scores what needs your attention, and **Business Health** tracks the vital signs — catalog, orders, quote inbox. If any panel looks empty or odd, try signing in again; sessions expire quietly and the panels don't always say so.",
  },
  {
    keys: ["store", "product", "shopify", "order", "inventory", "storefront"],
    priority: 1,
    answer:
      "Your storefront is the public face, my Queen — the customization walkthrough lets shoppers build their keychain step by step (occasion, thread, text, charms), and I'm there as the Forge Guide. Orders flow in through Shopify; this editor is where you steer everything behind it.",
  },
  {
    keys: ["memorial", "remembrance", "sympathy", "in memory"],
    priority: 1,
    answer:
      "For remembrance pieces, my Queen, we hold a gentle line: soft and respectful, never salesy — **no urgency, no countdowns, no pressure** on memorial content. If you're drafting one, I can help you find the right tender wording.",
  },
  {
    keys: ["password", "login", "sign in", "session", "logged out", "expired"],
    priority: 1,
    answer:
      "If the editor signed you out or a panel looks strangely empty, my Queen, your session likely expired — sign in again with the owner password and the panels should fill back in. If the password itself isn't working, that's something to raise with your admin (he manages the secrets).",
  },
  {
    keys: ["who are you", "introduce", "your name", "what can you do"],
    priority: 2,
    answer:
      "I am Sir BoB, your chamberlain in this editor, my Queen. I can walk you through every tab — **Command** for the overview, **Social** for your content queue, **Blog** for stories, **Ads** for campaign packs, and **Growth** for quotes, reviews, and DM automation. Ask me about any of them, or tell me what you want to get done today and I'll point you at the right place.",
  },
  {
    keys: ["first", "start", "begin", "onboarding", "tour", "show me around", "where do i"],
    priority: 2,
    answer:
      "Here's a knight's recommended first patrol, my Queen: **1)** glance at the Command Center so the lay of the land feels familiar, **2)** open the Growth tab and check the Quote Pipeline for anything waiting, **3)** peek at Social Studio's content queue to see what's drafted. The onboarding checklist at the top of this page walks it step by step — and each step has an **Ask BoB** button that brings your question straight to me.",
  },
];

const FALLBACK_ANSWER =
  "A fair question, my Queen — my link to the deeper archives is down at the moment, so I'll answer from what I know of this editor. " +
  "I can guide you through the **Command** overview, **Social** content, **Blog** stories, **Ads** campaigns, or the **Growth** engine (quotes, reviews, DM automation). " +
  "Ask me about any of those by name — for example, “What can you help me do in the Growth tab?” — and I'll walk you through it.";

/**
 * Match a free-text question against handbook topics.
 * Returns a BoB-voiced answer, or the generic orientation answer if nothing matches.
 */
export function answerEditorQuestion(question: string): string {
  const q = question.toLowerCase();
  // Two passes: specific topics first, generic orientation second.
  for (const want of [1, 2] as const) {
    let best: Topic | null = null;
    let bestScore = 0;
    for (const topic of TOPICS) {
      if (topic.priority !== want) continue;
      let score = 0;
      for (const key of topic.keys) {
        if (q.includes(key)) score += key.length; // longer keys = more specific
      }
      if (score > bestScore) {
        bestScore = score;
        best = topic;
      }
    }
    if (best) return best.answer;
  }
  return FALLBACK_ANSWER;
}
