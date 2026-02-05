import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import ProductGallery from "../components/ProductGallery";
import { getAllProducts } from "../lib/shopify";
import { type ShopifyProductEdge } from "../lib/shopify/types";
import AboutSection from "../components/AboutSection";
import HeritageSection from "../components/HeritageSection";
import ProductJSONLD from "../components/ProductJSONLD";
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

  const featuredProduct = products.length > 0 ? products[0].node : undefined;

  return (
    <div className="min-h-screen text-slate-800">
      <ProductJSONLD products={products.map((p: ShopifyProductEdge) => p.node)} />
      <Navbar />

      <div className="h-32"></div>

      <main className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
        <HeroSection featuredProduct={featuredProduct} />

        {/* Heritage Section - Second */}
        <HeritageSection />

        {/* Product Gallery - Third */}
        <div id="products" className="py-24">
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

        {/* About Us - Fourth/Last */}
        <AboutSection />
      </main>

      <div className="h-20"></div>
    </div>
  );
}
