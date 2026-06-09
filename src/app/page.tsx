import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import ProductGallery from "../components/ProductGallery";
import { getAllProducts } from "../lib/shopify";
import { type ShopifyProductEdge } from "../lib/shopify/types";
import AboutSection from "../components/AboutSection";
import HeritageSection from "../components/HeritageSection";
import DedicationSection from "../components/DedicationSection";
import ProductJSONLD from "../components/ProductJSONLD";
import EventsSection from "../components/EventsSection";
import SocialFeedSection from "../components/SocialFeedSection";
import { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { getSocialPosts } from "@/lib/social";
import { getStorefrontConfig } from "@/lib/storefront-config";
import { getUpcomingPopups } from "@/lib/calendar.server";

export const metadata: Metadata = {
  title: "Shop All Custom Keychains | Lisa's Custom Keychains",
  description: "Explore our collection of hand-woven custom keychains. Personalize your threads and charms to forge your own legacy.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Lisa's Custom Keychains | Handcrafted Legacy",
    description: "Every knot tells a story. Shop our hand-woven collection.",
    url: SITE_URL,
    images: [{ url: "https://i.postimg.cc/cvyv100W/Untitled_design_(2).png" }],
  },
};

export const revalidate = 3600;

export default async function Home() {
  let products: ShopifyProductEdge[] = [];
  try {
    const rawProducts = await getAllProducts();
    products = rawProducts;
  } catch (e) {
    console.error("Shopify Fetch Error:", e);
  }

  const [socialFeed, storefrontConfig, upcomingEvents] = await Promise.all([
    getSocialPosts(),
    getStorefrontConfig(),
    getUpcomingPopups(),
  ]);
  const sectionById = new Map(
    storefrontConfig.homepageSections.map((s) => [s.id, s]),
  );

  // 🔄 Bio-Kinetic Rotation: Featured Product of the Week
  // Stable rotation based on week of year
  const getWeekNumber = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };
  
  const weekIndex = products.length > 0 ? getWeekNumber(new Date()) % products.length : 0;
  const featuredProduct = products.length > 0 ? products[weekIndex].node : undefined;

  return (
    <div className="min-h-screen text-slate-800 bg-white">
      <ProductJSONLD products={products.map((p: ShopifyProductEdge) => p.node)} />
      <Navbar />

      <div className="h-32"></div>

      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <HeroSection featuredProduct={featuredProduct} copy={storefrontConfig.hero} />
        </div>

        {/* Heritage Section - Second */}
        <HeritageSection />

        {/* Product Gallery - Third */}
        <div id="products" className="py-24 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] font-bold text-purple-500 mb-4">
              Handmade · One at a Time
            </p>
            <h2 className="text-5xl md:text-6xl font-serif font-bold mb-4">
              <span className="bg-chromium-purple bg-300% animate-chromium-glint text-transparent bg-clip-text">
                {sectionById.get("products")?.headline || "Inspiration Gallery"}
              </span>
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto text-base">
              {sectionById.get("products")?.body ||
                "Click any design below to open the designer and customize it just for you."}
            </p>
          </div>
          <SocialFeedSection
            posts={socialFeed.posts}
            source={socialFeed.source}
            config={storefrontConfig.social}
          />
          <ProductGallery products={products} />
        </div>

        {/* 💎 Signature Sets Section - NEW */}
        <div id="sets" className="py-24 bg-stone-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.3em] font-bold text-purple-500 mb-4">
                Synchronized Elegance
              </p>
              <h2 className="text-5xl md:text-6xl font-serif font-bold mb-4">
                <span className="bg-chromium-purple bg-300% animate-chromium-glint text-transparent bg-clip-text">
                  {sectionById.get("sets")?.headline || "Signature Sets"}
                </span>
              </h2>
              <p className="text-slate-500 max-w-lg mx-auto text-base">
                {sectionById.get("sets")?.body ||
                  "Perfectly matched keychain and earring pairs. One configuration, double the impact."}
              </p>
            </div>
            <ProductGallery 
              products={products.filter(({ node }) => 
                node.title.toLowerCase().includes("set") || 
                node.productType?.toLowerCase().includes("set")
              )} 
            />
          </div>
        </div>

        {/* Pop-up vending and social updates */}
        <EventsSection section={sectionById.get("events")} events={upcomingEvents} />

        {/* About Us - Fourth/Last */}
        <div className="max-w-7xl mx-auto px-6">
          <AboutSection />
        </div>

        {/* Dedication - Footer Lead-in */}
        <div className="max-w-7xl mx-auto px-6">
          <DedicationSection />
        </div>
      </main>

      <div className="h-20"></div>
    </div>
  );
}
