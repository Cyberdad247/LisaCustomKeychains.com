"use client";

import ProductCard from "./ProductCard";
import { motion } from "framer-motion";

import { type ShopifyProductEdge } from "../lib/shopify/types";

interface ProductGalleryProps {
  products: ShopifyProductEdge[];
  lockLetters?: boolean;
  charmCategory?: string;
  allowedColors?: string[];
}

export default function ProductGallery({
  products,
  lockLetters = false,
  charmCategory = "all",
  allowedColors,
}: ProductGalleryProps) {
  return (
    <div id="gallery" className="py-12">
      <div className="min-h-[400px]">
        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-stone-500 font-serif italic">
              Products are syncing from Shopify. Please check back shortly.
            </p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 px-4"
          >
            {products.map(({ node }: ShopifyProductEdge, index: number) => {
              const rotations = [-1, 2, -2, 1, -1.5, 1.5];
              const rotation = rotations[index % rotations.length];

              return (
                <motion.div
                  key={node.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <ProductCard
                    product={node}
                    rotation={rotation}
                    priority={index < 3}
                    lockLetters={lockLetters}
                    charmCategory={charmCategory}
                    allowedColors={allowedColors}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
