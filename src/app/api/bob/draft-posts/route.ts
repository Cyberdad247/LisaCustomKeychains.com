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

const DRAFT_PROMPT = `Draft this week's social posts for Lisa's Custom Keychains following the marketing playbook exactly.

MONDAY — product spotlight (Instagram):
Spotlight one keychain design. Warm, artisan voice. Under 150 words.
Include 8-10 hashtags from the rotating template, always including #CustomKeychain #PersonalizedGifts #HandmadeUSA.

WEDNESDAY — engraving timelapse caption (Instagram + TikTok):
Short caption for a 15-second engraving process video. Under 40 words.
TikTok version under 150 characters total.

FRIDAY — testimonial / story post (Facebook):
Emotional-commerce anchor like "Hold their memory close." Gentle tone,
never exploitative. Under 120 words. End with a soft call to visit lisacustomkeychains.com.

RULES:
- Never use emojis.
- Memorial pieces: tenderness, never urgency. No countdown timers.
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
      signal: AbortSignal.timeout(55_000),
    });
    if (!res.ok) throw new Error(`gateway ${res.status}`);
    const data = await res.json();
    const drafts = parseDrafts(data.reply ?? "");
    if (drafts.length === 0) {
      return NextResponse.json(
        { error: "BoB returned no usable drafts", raw: (data.reply ?? "").slice(0, 500) },
        { status: 502 }
      );
    }
    return NextResponse.json({ drafts });
  } catch (e) {
    console.error("BoB draft-posts error:", e);
    return NextResponse.json({ error: "Draft generation failed" }, { status: 502 });
  }
}
