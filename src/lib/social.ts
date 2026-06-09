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
  {
    id: "fallback-instagram-football",
    platform: "instagram",
    caption: "Friday night lights energy — custom team keychains for every position.",
    imageUrl: "/images/sports/football_mockup.jpg",
    permalink: "https://www.instagram.com/lisascustomkeychains?igsh=MXMzZWVyOGw2Z3Vtag==",
    timestamp: "2026-05-14T00:00:00.000Z",
    mediaType: "image",
  },
  {
    id: "fallback-facebook-soccer",
    platform: "facebook",
    caption: "Soccer season is here — grab a matching set before the next game.",
    imageUrl: "/images/sports/soccer_mockup.jpg",
    permalink: "https://www.facebook.com/share/14WQBPgC1Rz/",
    timestamp: "2026-05-12T00:00:00.000Z",
    mediaType: "image",
  },
];

function isSocialPost(value: unknown): value is SocialPost {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<SocialPost>;
  return (
    typeof p.id === "string" &&
    (p.platform === "facebook" || p.platform === "instagram") &&
    typeof p.caption === "string" &&
    typeof p.imageUrl === "string" &&
    typeof p.permalink === "string" &&
    typeof p.timestamp === "string"
  );
}

async function fetchInstagramPosts(accessToken: string): Promise<SocialPost[]> {
  const url = new URL("https://graph.instagram.com/me/media");
  url.searchParams.set(
    "fields",
    "id,caption,media_type,media_url,permalink,timestamp,thumbnail_url",
  );
  url.searchParams.set("limit", "12");
  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Instagram API ${res.status}: ${await res.text()}`);

  const data = (await res.json()) as {
    data?: Array<{
      id: string;
      caption?: string;
      media_type: string;
      media_url?: string;
      thumbnail_url?: string;
      permalink: string;
      timestamp: string;
    }>;
  };

  if (!data.data) return [];

  return data.data
    .filter((item) => item.media_type !== "VIDEO" || item.thumbnail_url)
    .map(
      (item): SocialPost => ({
        id: item.id,
        platform: "instagram",
        caption: item.caption || "",
        imageUrl:
          item.media_type === "VIDEO" ? (item.thumbnail_url ?? "") : (item.media_url ?? ""),
        thumbnailUrl: item.thumbnail_url,
        permalink: item.permalink,
        timestamp: item.timestamp,
        mediaType:
          item.media_type === "CAROUSEL_ALBUM"
            ? "carousel"
            : item.media_type === "VIDEO"
              ? "video"
              : "image",
      }),
    )
    .filter((p) => p.imageUrl);
}

async function fetchFacebookPosts(accessToken: string): Promise<SocialPost[]> {
  // Resolve the first connected page and its page-scoped token
  const pagesRes = await fetch(
    `https://graph.facebook.com/me/accounts?access_token=${accessToken}`,
    { next: { revalidate: 3600 } },
  );
  if (!pagesRes.ok) return [];

  const pagesData = (await pagesRes.json()) as {
    data?: Array<{ id: string; access_token: string }>;
  };
  const page = pagesData.data?.[0];
  if (!page) return [];

  const postsRes = await fetch(
    `https://graph.facebook.com/${page.id}/posts?fields=id,message,created_time,attachments{media,type}&limit=12&access_token=${page.access_token}`,
    { next: { revalidate: 3600 } },
  );
  if (!postsRes.ok) return [];

  const postsData = (await postsRes.json()) as {
    data?: Array<{
      id: string;
      message?: string;
      created_time: string;
      attachments?: { data: Array<{ media?: { image?: { src: string } }; type: string }> };
    }>;
  };

  if (!postsData.data) return [];

  return postsData.data
    .filter((post) => post.attachments?.data?.[0]?.media?.image?.src)
    .map(
      (post): SocialPost => ({
        id: post.id,
        platform: "facebook",
        caption: post.message || "",
        imageUrl: post.attachments!.data[0].media!.image!.src,
        permalink: `https://www.facebook.com/${post.id}`,
        timestamp: post.created_time,
        mediaType: "image",
      }),
    );
}

export async function getSocialPosts(): Promise<{
  posts: SocialPost[];
  source: "live" | "configured" | "fallback";
}> {
  const accessToken = process.env.META_ACCESS_TOKEN?.trim();
  if (accessToken) {
    try {
      const [igResult, fbResult] = await Promise.allSettled([
        fetchInstagramPosts(accessToken),
        fetchFacebookPosts(accessToken),
      ]);

      const posts = [
        ...(igResult.status === "fulfilled" ? igResult.value : []),
        ...(fbResult.status === "fulfilled" ? fbResult.value : []),
      ]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 12);

      if (posts.length > 0) return { posts, source: "live" };
    } catch (err) {
      console.warn("[social] Meta API failed, falling back.", err);
    }
  }

  const raw = process.env.SOCIAL_FEED_JSON?.trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const posts = parsed.filter(isSocialPost).slice(0, 12);
        if (posts.length > 0) return { posts, source: "configured" };
      }
    } catch (err) {
      console.warn("[social] Invalid SOCIAL_FEED_JSON.", err);
    }
  }

  return { posts: FALLBACK_POSTS, source: "fallback" };
}
