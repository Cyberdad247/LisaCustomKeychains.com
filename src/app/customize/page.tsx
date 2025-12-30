import type { Metadata } from "next";
export const dynamic = 'force-dynamic';
import Navbar from "../../components/Navbar";
import KeychainBuilder from "../../components/customize/KeychainBuilder";

export const metadata: Metadata = {
  title: "Design Your Own | Lisa's Custom Keychains",
  description: "Create a unique, hand-woven keychain with your name and favorite colors. Perfect for backpacks, gifts, and more.",
  openGraph: {
    title: "Design Your Own Custom Keychain",
    description: "Hand-woven, personalized keychains made just for you. Choose your colors and charm!",
    images: ["/images/Lisa'sSelfie.jpg"], // Using the selfie as a placeholder for the maker vibe
    type: "website",
  },
};

import { getAllProducts } from "../../lib/shopify";

export default async function CustomizePage() {
  const products = await getAllProducts();
  const baseProduct = products[0]?.node;
  const baseVariantId = baseProduct?.variants?.edges[0]?.node?.id;

  return (
    <div className="min-h-screen pb-24">
      <Navbar />
      
      {/* SPACER for fixed navbar */}
      <div className="h-32"></div>

      <main className="px-6">
        <KeychainBuilder baseVariantId={baseVariantId} />
      </main>
    </div>
  );
}
