// Seasonal campaign packs for Lisa's Custom Keychains.
// Each pack bundles hero copy, announcement bar text, featured product picks,
// and social drafts that activate together. Curated from the marketing
// playbook: emotional commerce, no urgency on memorials, USA Made + 7-day
// turnaround trust signals.

export type CampaignPack = {
  id: string;
  name: string;
  season: string;
  tagline: string;
  hero: { headline: string; subline: string; cta: string };
  announcement: string;
  featuredHandles: string[];
  socialDrafts: { platform: "instagram" | "facebook" | "tiktok" | "pinterest"; content: string; hashtags: string[] }[];
};

export const CAMPAIGN_PACKS: CampaignPack[] = [
  {
    id: "halloween-2026",
    name: "Haunted Heirlooms",
    season: "Halloween 2026",
    tagline: "Spooky-season gifting with a handmade touch",
    hero: {
      headline: "Treats Without the Tricks",
      subline: "Hand-engraved keychains that outlast the candy — made in the USA, shipped in 7 days.",
      cta: "Shop Halloween Picks",
    },
    announcement: "Halloween order cutoff: October 20 for guaranteed delivery",
    featuredHandles: [],
    socialDrafts: [
      {
        platform: "instagram",
        content:
          "No tricks, just treats that last. Our hand-engraved keychains make the sweetest spooky-season surprises — each one made by hand in the USA and shipped within 7 days. Who's on your treat list this year?",
        hashtags: ["#CustomKeychain", "#PersonalizedGifts", "#HandmadeUSA", "#HalloweenGifts", "#SpookySeason"],
      },
      {
        platform: "tiktok",
        content: "POV: you engrave the perfect Halloween treat in 15 seconds. Handmade, personal, unforgettable.",
        hashtags: ["#CustomKeychain", "#HandmadeUSA", "#HalloweenGifts"],
      },
      {
        platform: "facebook",
        content:
          "Looking for a Halloween gift that isn't candy? A hand-engraved keychain with their name, a special date, or a little spooky charm — made in the USA with a 7-day turnaround. Order by October 20 for guaranteed Halloween delivery.",
        hashtags: ["#PersonalizedGifts", "#HandmadeUSA", "#HalloweenGifts"],
      },
    ],
  },
  {
    id: "black-friday-2026",
    name: "The Thoughtful Friday",
    season: "Black Friday 2026",
    tagline: "Meaningful gifts beat doorbuster chaos",
    hero: {
      headline: "Skip the Chaos. Give Meaning.",
      subline: "Hand-engraved keychains, personalized for everyone on your list. USA made, 7-day turnaround.",
      cta: "Start Gifting",
    },
    announcement: "Black Friday: free gift wrapping on every order, this weekend only",
    featuredHandles: [],
    socialDrafts: [
      {
        platform: "instagram",
        content:
          "While everyone else fights over doorbusters, give something that actually means something. A hand-engraved keychain with their name on it — made in the USA, in your hands within 7 days. This is the thoughtful Friday.",
        hashtags: ["#CustomKeychain", "#PersonalizedGifts", "#HandmadeUSA", "#BlackFridayGifts", "#ThoughtfulGifting"],
      },
      {
        platform: "tiktok",
        content: "The 15-second engraving that beats any Black Friday deal. Personal, handmade, unforgettable.",
        hashtags: ["#CustomKeychain", "#BlackFridayGifts", "#HandmadeUSA"],
      },
      {
        platform: "pinterest",
        content:
          "Black Friday gift idea that never goes on clearance: a personalized engraved keychain. Memorials, weddings, pet remembrances, and everyday love — hand-made in the USA.",
        hashtags: ["#PersonalizedGifts", "#GiftIdeas", "#HandmadeUSA"],
      },
    ],
  },
  {
    id: "christmas-2026",
    name: "Hold Their Memory Close",
    season: "Christmas 2026",
    tagline: "The emotional-commerce peak — tenderness, not urgency",
    hero: {
      headline: "Hold Their Memory Close",
      subline: "Hand-engraved keychains for the people you love most. Made in the USA, delivered in time for Christmas.",
      cta: "Create Their Gift",
    },
    announcement: "Christmas order cutoff: December 15 for guaranteed holiday delivery",
    featuredHandles: [],
    socialDrafts: [
      {
        platform: "instagram",
        content:
          "Some gifts you open. Others you hold close every single day. Our hand-engraved keychains carry names, dates, and memories — made by hand in the USA, in time for Christmas when you order by December 15.",
        hashtags: ["#CustomKeychain", "#PersonalizedGifts", "#HandmadeUSA", "#ChristmasGifts", "#MemorialGift"],
      },
      {
        platform: "facebook",
        content:
          "For the ones who made this year matter — and the ones we hold in memory. A hand-engraved keychain is a small gift with enormous weight. Each piece is made by hand in the USA with a 7-day turnaround. Order by December 15 for Christmas delivery.",
        hashtags: ["#PersonalizedGifts", "#ChristmasGifts", "#MemorialGift", "#HandmadeUSA"],
      },
      {
        platform: "tiktok",
        content: "Watch a Christmas memory get engraved in 15 seconds. This is what handmade love looks like.",
        hashtags: ["#CustomKeychain", "#ChristmasGifts", "#HandmadeUSA"],
      },
    ],
  },
];
