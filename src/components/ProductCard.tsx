// 🐝 [HIVE_SWARM_STAMP] Autonomously Audited by Lukas Swarm
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { type ShopifyProduct } from "../lib/shopify/types";
import { ShoppingBag, Sparkles } from "lucide-react";
import KeychainCustomizer from "./customize/KeychainCustomizer";
import EarringCustomizer from "./customize/EarringCustomizer";

interface ProductCardProps {
  product: ShopifyProduct;
  rotation: number;
  priority?: boolean;
}

export default function ProductCard({
  product,
  rotation,
  priority = false,
}: ProductCardProps) {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const { title } = product;
  const image = product.featuredImage || product.images?.edges[0]?.node;
  const price =
    product.priceRange?.minVariantPrice?.amount ||
    product.variants?.edges[0]?.node?.price?.amount ||
    "9.95";

  const handleOpenCustomizer = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCustomizing(true);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20, rotate: rotation }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.05, zIndex: 10, rotate: 0 }}
        className="group relative bg-white p-4 pb-12 shadow-md cursor-pointer border border-stone-100 rounded-lg transition-all duration-300"
        role="article"
        aria-labelledby={`product-title-${product.id}`}
      >
        {/* THE IMAGE HOTSPOT */}
        <div
          className="relative aspect-square w-full overflow-hidden bg-stone-50 mb-4 border border-stone-100"
          onClick={handleOpenCustomizer}
          role="button"
          aria-label={`Customize ${title}`}
        >
          {image ? (
            <Image
              src={image.url}
              alt={image.altText || title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              priority={priority}
              loading={priority ? undefined : "lazy"}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-stone-100 text-stone-400">
              No Image
            </div>
          )}

          <div className="absolute inset-0 bg-purple-900/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
            <div className="bg-white text-purple-700 px-4 py-2 rounded-full font-bold tracking-widest text-[10px] uppercase flex items-center gap-2 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
              <Sparkles className="w-3 h-3 text-purple-600" />
              MAKE IT MINE
            </div>
          </div>
        </div>

        {/* Caption Area */}
        <div className="text-center px-2">
          <h3
            id={`product-title-${product.id}`}
            className="font-serif font-bold text-slate-900 text-lg group-hover:text-purple-700 transition-colors"
          >
            {title}
          </h3>

          <div className="flex justify-between items-center border-t border-stone-100 pt-3 mt-2">
            <span className="font-bold text-slate-800">
              ${parseFloat(price).toFixed(2)}
            </span>
            <button
              onClick={handleOpenCustomizer}
              className="flex items-center gap-2 text-xs font-bold text-purple-900 uppercase tracking-widest hover:underline"
              aria-label={`Personalize ${title}`}
            >
              <span>PERSONALIZE</span>
              <ShoppingBag className="w-3 h-3" />
            </button>
          </div>
        </div>
      </motion.div>

      {isCustomizing && (
        <>
          {/* Detect if this is an earring product */}
          {(product.productType?.toLowerCase().includes("earring") ||
            product.title?.toLowerCase().includes("earring")) ? (
            <EarringCustomizer
              product={product}
              isOpen={isCustomizing}
              onClose={() => setIsCustomizing(false)}
            />
          ) : (
            <KeychainCustomizer
              product={product}
              isOpen={isCustomizing}
              onClose={() => setIsCustomizing(false)}
            />
          )}
        </>
      )}
    </>
  );
}
