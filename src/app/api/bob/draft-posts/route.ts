export const maxDuration = 60;
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { isOwnerSessionValid } from "@/lib/storefront-config";

// Sir BoB content copilot — owner-gated. Asks the VPS brain (owner persona,
// which carries the marketing playbook) to draft this week's M/W/F social
// posts. Returns structured drafts the editor inserts into the content queue.

const GATEWAY = "https://bob.lisascustomkeychains.com";

export type DraftPost = {
  platform: "instagram" | "facebook" | "tiktok" | "pinterest";
  content: string;
  hashtags: string[];
};

const DRAFT_PROMPT = `You are Sir BoB vMAX (Chief Growth Officer & Chamberlain for Lisa's Custom Keychains).
Draft this week's social posts for Lisa's Custom Keychains following the strategic growth playbook to support our $10,000 monthly target while honoring artisanal batch production.

MONDAY — product spotlight (Instagram):
Spotlight one handcrafted keychain design (focus on personalized custom name spellings or unique woven artifacts). Warm, artisan voice. Under 150 words.
Include 8-10 hashtags from the rotating template, always including #CustomKeychain #PersonalizedGifts #HandmadeUSA #ArtisanCraft.

WEDNESDAY — weaving & knotting timelapse caption (Instagram + TikTok):
Short caption for a 15-second knotting and bead-threading process video highlighting precision artisan batching. Under 40 words.
TikTok version under 150 characters total.

FRIDAY — testimonial / story post (Facebook):
Emotional-commerce anchor like "Hold their memory close" or celebrating a custom personalized gift. Gentle tone,
never exploitative. Under 120 words. End with a soft call to visit lisascustomkeychains.com.

RULES (Sir BoB vMAX Titanium Standards):
- Never use emojis under any circumstances.
- Zero loss: emphasize handcrafted durability, solid hardware, and custom spelling precision.
- Memorial & awareness pieces: tender reverent tone, never urgency or sales countdowns.
- Ground product mentions in real keychain lines: Soul, Spirit, Premium, Splashy designs, Handmade Heart Bead earrings.

Reply in this exact format, nothing else:

[MONDAY]
<post text>
#tag1 #tag2 ...

[WEDNESDAY-IG]
<caption>
#tag1 #tag2 ...

[WEDNESDAY-TIKTOK]
<caption under 150 chars>

[FRIDAY]
<post text>`;

function parseDrafts(reply: string): DraftPost[] {
  const drafts: DraftPost[] = [];
  const sections: Record<string, DraftPost["platform"]> = {
    MONDAY: "instagram",
    "WEDNESDAY-IG": "instagram",
    "WEDNESDAY-TIKTOK": "tiktok",
    FRIDAY: "facebook",
  };
  for (const [marker, platform] of Object.entries(sections)) {
    const re = new RegExp(`\\[${marker.replace("-", "\\-")}\\]\\s*([\\s\\S]*?)(?=\\[\\w[\\w\\-]*\\]|$)`);
    const m = reply.match(re);
    if (!m) continue;
    const text = m[1].trim();
    const tags = Array.from(text.matchAll(/#(\w+)/g)).map((t) => t[0]);
    const content = text.replace(/#\w+/g, "").replace(/\n{3,}/g, "\n\n").trim();
    if (content) drafts.push({ platform, content, hashtags: tags });
  }
  return drafts;
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  if (!isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${GATEWAY}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: DRAFT_PROMPT }],
        catalog: "",
        persona: "owner",
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) {
      const data = await res.json();
      const drafts = parseDrafts(data.reply ?? "");
      if (drafts.length > 0) {
        return NextResponse.json({ drafts });
      }
    }
  } catch (e) {
    console.warn("BoB gateway unreachable or slow, falling back to Gemini mesh:", e);
  }

  // Fallback to Google Gemini
  const geminiKey = process.env.GOOGLE_AI_API_KEY;
  if (geminiKey) {
    try {
      const gRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: DRAFT_PROMPT }],
              },
            ],
            generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
          }),
          signal: AbortSignal.timeout(15_000),
        }
      );
      if (gRes.ok) {
        const gData = await gRes.json();
        const replyText = gData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        const drafts = parseDrafts(replyText);
        if (drafts.length > 0) {
          return NextResponse.json({ drafts, provider: "gemini-mesh" });
        }
      }
    } catch (gErr) {
      console.error("Gemini draft generation fallback failed:", gErr);
    }
  }

  // Guaranteed fallback artisan drafts
  const fallbackDrafts: DraftPost[] = [
    {
      platform: "instagram",
      content: "Each knot is tied by hand in our Ohio studio with premium recycled cotton cord. Built for keys, bags, and everyday adventures.",
      hashtags: ["#CustomKeychain", "#PersonalizedGifts", "#HandmadeUSA", "#ArtisanMacrame", "#ShopSmall"],
    },
    {
      platform: "tiktok",
      content: "Hand-weaving Lisa's signature heart-bead charm keychains. Smooth cord, solid metal clasp.",
      hashtags: ["#KeychainMaking", "#HandmadeKeychains", "#SmallBusinessCheck"],
    },
    {
      platform: "facebook",
      content: "Hold a special memory close wherever you go. Our custom woven keychains can be personalized with your favorite colors and lucky charms. Visit lisascustomkeychains.com to build yours today.",
      hashtags: ["#HandmadeWithLove", "#CustomGifts", "#HandcraftedKeychains"],
    },
  ];

  return NextResponse.json({ drafts: fallbackDrafts, provider: "sovereign-artisan-preset" });
}
