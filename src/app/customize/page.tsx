import { getAllProducts } from "@/lib/shopify";
import CustomizationWalkthrough from "@/components/customize/CustomizationWalkthrough";
import Navbar from "@/components/Navbar";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Build Your Own Keychain | Lisa's Custom Keychains",
    description: "Walk the forge with Sir BoB: choose your occasion, thread, text, and charms — Lisa hand-weaves your one-of-a-kind keychain.",
};

export default async function CustomizePage() {
    const products = await getAllProducts();

    // Find the "Epic Custom" or similar Tier 3 product as the base
    // If not found, fallback to the first product
    const baseProduct = products.find(p => p.node.title.toLowerCase().includes("epic"))?.node
        || products.find(p => p.node.title.toLowerCase().includes("custom"))?.node
        || products[0]?.node;

    if (!baseProduct) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-500 font-serif">Sovereign Forge Offline: No base products found.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50">
            <Navbar />
            <main className="pt-24 min-h-screen">
                <CustomizationWalkthrough product={baseProduct} />
            </main>
        </div>
    );
}
