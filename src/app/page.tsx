import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import ProductGallery from "../components/ProductGallery";
import { getAllProducts } from "../lib/shopify";
import { type ShopifyProductEdge } from "../lib/shopify/types";
import AboutSection from "../components/AboutSection";
import HeritageSection from "../components/HeritageSection";
import DedicationSection from "../components/DedicationSection";
import ProductJSONLD from "../components/ProductJSONLD";
import TestimonySection from "../components/TestimonySection";
import EventsSection from "../components/EventsSection";
import BlogSection from "../components/BlogSection";
import SocialFeedSection from "../components/SocialFeedSection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Custom Keychains | Lisa's Custom Keychains",
  description: "Explore our collection of hand-woven custom keychains. Personalize your threads and charms to forge your own legacy.",
  openGraph: {
    title: "Lisa's Custom Keychains | Handcrafted Legacy",
    description: "Every knot tells a story. Shop our hand-woven collection.",
    images: [{ url: 'https://i.postimg.cc/cvyv100W/Untitled_design_(2).png ' }],
  },
};

export const dynamic = "force-dynamic";

export default async function Home() {
  let products: ShopifyProductEdge[] = [];
  try {
    const rawProducts = await getAllProducts();
    products = rawProducts;
  } catch (e) {
    console.error("Shopify Fetch Error:", e);
  }

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
          <HeroSection featuredProduct={featuredProduct} />
        </div>

        {/* Heritage Section - Second */}
        <HeritageSection />

        {/* Product Gallery - Third */}
        <div id="products" className="py-24 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm uppercase tracking-widest text-purple-600 font-bold mb-3">
              Inspiration Gallery
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              Click any design below to open the designer and customize it just for you.
            </p>
          </div>
          <ProductGallery products={products} />
        </div>

        {/* 🌟 New Kinetic Sections */}
        <TestimonySection />
        <EventsSection />
        <BlogSection />
        <SocialFeedSection />

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
