export type SocialPlatform = "facebook" | "instagram";

export type SocialPost = {
  id: string;
  platform: SocialPlatform;
  caption: string;
  imageUrl: string;
  permalink: string;
  timestamp: string;
  mediaType: "image" | "video" | "carousel";
  thumbnailUrl?: string;
};

const FALLBACK_POSTS: SocialPost[] = [
  {
    id: "fallback-instagram-table",
    platform: "instagram",
    caption: "Fresh vendor table photos, finished keychains, and ready-to-buy pieces.",
    imageUrl: "https://i.postimg.cc/cvyv100W/Untitled_design_(2).png",
    permalink: "https://www.instagram.com/lisascustomkeychains?igsh=MXMzZWVyOGw2Z3Vtag==",
    timestamp: "2026-05-16T00:00:00.000Z",
    mediaType: "image",
  },
  {
    id: "fallback-facebook-charms",
    platform: "facebook",
    caption: "Sports charms, school color ideas, and custom combinations from recent events.",
    imageUrl: "/images/assorted_charms_heritage.jpg",
    permalink: "https://www.facebook.com/share/14WQBPgC1Rz/",
    timestamp: "2026-05-16T00:00:00.000Z",
    mediaType: "image",
  },
  {
    id: "fallback-instagram-softball",
    platform: "instagram",
    caption: "Personalized names, team colors, and gift ideas from Lisa's latest work.",
    imageUrl: "/images/sports/softball_mockup.jpg",
    permalink: "https://www.instagram.com/lisascustomkeychains?igsh=MXMzZWVyOGw2Z3Vtag==",
    timestamp: "2026-05-16T00:00:00.000Z",
    mediaType: "image",
  },
  {
    id: "fallback-facebook-basketball",
    platform: "facebook",
    caption: "Game-day keychain inspiration with charm and letter combinations.",
    imageUrl: "/images/sports/basketball_mockup.jpg",
    permalink: "https://www.facebook.com/share/14WQBPgC1Rz/",
    timestamp: "2026-05-16T00:00:00.000Z",
    mediaType: "image",
  },
];

function isSocialPost(value: unknown): value is SocialPost {
  if (!value || typeof value !== "object") return false;
  const post = value as Partial<SocialPost>;
  return (
    typeof post.id === "string" &&
    (post.platform === "facebook" || post.platform === "instagram") &&
    typeof post.caption === "string" &&
    typeof post.imageUrl === "string" &&
    typeof post.permalink === "string" &&
    typeof post.timestamp === "string"
  );
}

export async function getSocialPosts(): Promise<{
  posts: SocialPost[];
  source: "configured" | "fallback";
}> {
  const raw = process.env.SOCIAL_FEED_JSON?.trim();
  if (!raw) {
    return { posts: FALLBACK_POSTS, source: "fallback" };
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const posts = parsed.filter(isSocialPost).slice(0, 12);
      if (posts.length > 0) return { posts, source: "configured" };
    }
  } catch (error) {
    console.warn("Invalid SOCIAL_FEED_JSON. Falling back to curated social posts.", error);
  }

  return { posts: FALLBACK_POSTS, source: "fallback" };
}
