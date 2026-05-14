import Navbar from "@/components/Navbar";
import SportsFeatureCard from "@/components/sports/SportsFeatureCard";
import { getAllProducts } from "@/lib/shopify";
import { type ShopifyProductEdge } from "@/lib/shopify/types";
import { Metadata } from "next";
import { Medal, ShieldCheck, Star, Trophy } from "lucide-react";

export const metadata: Metadata = {
  title: "Sports Keychains Collection | Lisa's Custom Keychains",
  description:
    "Sports charm keychains in two paths: Sporty charms-only designs and Sporty with Spirit designs with team letters, names, and initials.",
};

export const dynamic = "force-dynamic";

const SPORTS_KEYWORDS = [
  "sport",
  "football",
  "basketball",
  "soccer",
  "softball",
  "volleyball",
  "tennis",
  "bowling",
  "baseball",
  "hockey",
];

const charmTableImage = "/images/assorted_charms_heritage.jpg";
const finishedKeychainsImage = "https://i.postimg.cc/cvyv100W/Untitled_design_(2).png";

function isSportsProduct({ node }: ShopifyProductEdge) {
  const type = (node.productType || "").toLowerCase();
  const title = (node.title || "").toLowerCase();
  return SPORTS_KEYWORDS.some((keyword) => type.includes(keyword) || title.includes(keyword));
}

export default async function SportsPage() {
  let allProducts: ShopifyProductEdge[] = [];

  try {
    allProducts = await getAllProducts();
  } catch (error) {
    console.error("Shopify Fetch Error:", error);
  }

  const sportsProducts = allProducts.filter(isSportsProduct);
  const catalog = sportsProducts.length > 0 ? sportsProducts : allProducts;

  const pickProduct = (index: number) => {
    const edge = catalog[index % catalog.length];
    if (!edge) {
      throw new Error("Sports catalog is unavailable.");
    }
    return edge.node;
  };

  const sportyCards = [
    {
      title: "Court Ready",
      description: "A clean sports charm keychain for basketball, volleyball, tennis, and court-day colors.",
      imageSrc: charmTableImage,
      imageAlt: "Sports charm options arranged beside Lisa's Custom Keychains logo",
      objectPosition: "56% 26%",
      colorPlan: "Pick two team colors.",
      sportPlan: "Sports charm only: ball, bat, bowling, or court bead.",
      allowedColors: ["orange", "yellow", "black", "white", "blue"],
    },
    {
      title: "Field Ready",
      description: "Built around sport symbols first, with yarn colors carrying the school or team identity.",
      imageSrc: finishedKeychainsImage,
      imageAlt: "Finished handmade keychains with sports charm examples",
      objectPosition: "22% 76%",
      colorPlan: "Use school or jersey colors.",
      sportPlan: "Sports charm only: football, softball, soccer, or baseball.",
      allowedColors: ["red", "blue", "green", "black", "white"],
    },
    {
      title: "Game Day Set",
      description: "A simple charms-only lane for teams, siblings, party favors, or fan packs.",
      imageSrc: charmTableImage,
      imageAlt: "Loose sports beads and charm color options for custom keychains",
      objectPosition: "73% 18%",
      colorPlan: "Match by team, event, or jersey.",
      sportPlan: "Sports charm only with no letter beads.",
      allowedColors: ["purple", "blue", "yellow", "white", "black"],
    },
  ];

  const spiritCards = [
    {
      title: "Player Name",
      description: "Sports charm plus a short player name, nickname, or initials for a personal team gift.",
      imageSrc: "/images/sports/softball_mockup.jpg",
      imageAlt: "Basketball charm keychain with white letter beads",
      objectPosition: "55% 55%",
      colorPlan: "Blend jersey colors with one accent.",
      sportPlan: "Sports charm stays required.",
      textPlan: "Letters enabled for names up to eight characters.",
      allowedColors: ["orange", "yellow", "white", "black", "red"],
    },
    {
      title: "Team Letters",
      description: "A spirit-forward design for team abbreviations, school initials, or short mascot names.",
      imageSrc: "/images/sports/basketball_mockup.jpg",
      imageAlt: "Sports charm keychain with letter beads",
      objectPosition: "52% 45%",
      colorPlan: "Start with primary team color.",
      sportPlan: "Sports charm plus letter beads.",
      textPlan: "Letters enabled for school, club, or team abbreviations.",
      allowedColors: ["blue", "red", "white", "black", "yellow"],
    },
    {
      title: "Spirit Pack",
      description: "Designed for fans and families who want the sport charm plus a personal word or initials.",
      imageSrc: finishedKeychainsImage,
      imageAlt: "Finished custom keychains with colorful sports and bead options",
      objectPosition: "28% 72%",
      colorPlan: "Coordinate the whole pack by palette.",
      sportPlan: "Sports charm leads, letters make it personal.",
      textPlan: "Letters enabled for initials, numbers, or a short name.",
      allowedColors: ["purple", "blue", "pink", "white", "black"],
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-slate-800">
      <Navbar />

      <main className="pt-32 pb-24">
        <section className="mx-auto mb-20 max-w-7xl px-6 text-center">
          <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-purple-100 p-3">
            <Trophy className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="mb-4 font-serif text-5xl text-slate-950 md:text-6xl">The Sports Arena</h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-500">
            Two clear ways to build a sports keychain: charms-only for clean game-day style, or sports charms with letters for names, teams, and school spirit.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-5">
            {[
              { icon: Star, label: "Hand-Woven" },
              { icon: Medal, label: "Team Spirit" },
              { icon: ShieldCheck, label: "Sports-Matched" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-stone-100 bg-white shadow-sm">
                  <Icon className="h-5 w-5 text-purple-500" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {catalog.length === 0 ? (
          <section className="mx-auto max-w-3xl px-6 text-center">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-amber-900">
              Sports products are temporarily unavailable because the product catalog could not load.
            </div>
          </section>
        ) : (
          <div className="mx-auto max-w-7xl space-y-24 px-6">
            <section aria-labelledby="sporty-heading">
              <div className="mb-10 max-w-3xl">
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.24em] text-purple-600">Sports Charms Only</p>
                <h2 id="sporty-heading" className="font-serif text-4xl text-slate-950">
                  Sporty
                </h2>
                <p className="mt-3 text-slate-500">
                  This lane keeps the design clean: team colors plus a sports charm, with letters intentionally turned off.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {sportyCards.map((card, index) => (
                  <SportsFeatureCard
                    key={card.title}
                    product={pickProduct(index)}
                    mode="sporty"
                    {...card}
                  />
                ))}
              </div>
            </section>

            <section aria-labelledby="spirit-heading">
              <div className="mb-10 max-w-3xl">
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.24em] text-purple-600">Sports Charms With Letters</p>
                <h2 id="spirit-heading" className="font-serif text-4xl text-slate-950">
                  Sporty with Spirit
                </h2>
                <p className="mt-3 text-slate-500">
                  This lane adds the personal layer: the sports charm stays, and letter beads open for names, initials, teams, or short school words.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {spiritCards.map((card, index) => (
                  <SportsFeatureCard
                    key={card.title}
                    product={pickProduct(index + sportyCards.length)}
                    mode="spirit"
                    {...card}
                  />
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className="border-t border-stone-100 py-20 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
          Lisa's Custom Keychains &copy; 2026
        </p>
      </footer>
    </div>
  );
}
