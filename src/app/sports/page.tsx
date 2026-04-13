import Navbar from "@/components/Navbar";
import ProductGallery from "@/components/ProductGallery";
import { getAllProducts } from "@/lib/shopify";
import { type ShopifyProductEdge } from "@/lib/shopify/types";
import { Metadata } from "next";
import { Trophy, Medal, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Sports Keychains Collection | Lisa's Custom Keychains",
  description: "Exclusive sports collection. Choose your team colors and sports charms. Perfect for athletes, fans, and teams.",
};

export const dynamic = "force-dynamic";

export default async function SportsPage() {
  const SPORTS_KEYWORDS = [
    "sport", "football", "basketball", "soccer", "softball",
    "volleyball", "tennis", "bowling", "baseball", "hockey",
  ];

  let products: ShopifyProductEdge[] = [];
  try {
    const allProducts = await getAllProducts();
    products = allProducts.filter(({ node }) => {
      const type = (node.productType || "").toLowerCase();
      const title = (node.title || "").toLowerCase();
      return SPORTS_KEYWORDS.some((kw) => type.includes(kw) || title.includes(kw));
    });
  } catch (e) {
    console.error("Shopify Fetch Error:", e);
  }

  return (
    <div className="min-h-screen bg-stone-50 text-slate-800">
      <Navbar />

      <main className="pt-32 pb-24">
        {/* Sports Hero */}
        <section className="max-w-7xl mx-auto px-6 mb-20 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-2xl mb-6">
            <Trophy className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-6xl font-serif text-slate-900 mb-4">The Sports Arena</h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Celebrate every victory and show your team spirit. Our Sports Edition keychains are handcrafted with premium threads and authentic sports charms.
          </p>
          
          <div className="flex justify-center gap-8 mt-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-stone-100">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hand-Woven</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-stone-100">
                <Medal className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Team Spirit</span>
            </div>
          </div>
        </section>

        {/* Product Gallery with Sports Lock */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm uppercase tracking-widest text-purple-600 font-bold mb-3">
              Sports Collection
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto text-sm">
              Customized with your team colors and signature sport. Letters are disabled for this specialized collection to focus on the charms.
            </p>
          </div>
          
          <ProductGallery 
            products={products} 
            lockLetters={true} 
            charmCategory="sports" 
            allowedColors={["red", "blue", "black", "white"]}
          />
        </div>

        {/* Etsy Inspiration Section */}
        <section className="mt-32 max-w-5xl mx-auto px-6 py-16 bg-white rounded-[3rem] border border-stone-100 shadow-sm text-center">
          <h3 className="text-2xl font-serif mb-4">As Seen on Etsy</h3>
          <p className="text-slate-500 mb-8 max-w-xl mx-auto italic">
            "Each sport bead is hand-selected to ensure the highest quality for your custom keyring. From the court to the field, take your game everywhere."
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Basketball', 'Soccer', 'Football', 'Volleyball'].map((sport) => (
              <div key={sport} className="aspect-square bg-stone-50 rounded-2xl flex flex-col items-center justify-center border border-stone-100 group hover:border-purple-200 transition-colors">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-purple-600 transition-colors">{sport}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-20 text-center border-t border-stone-100">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
          Lisa's Custom Keychains &copy; 2026
        </p>
      </footer>
    </div>
  );
}
