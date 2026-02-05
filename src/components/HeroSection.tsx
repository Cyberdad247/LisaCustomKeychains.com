"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Sparkles, Heart, HeartHandshake } from "lucide-react";
import { type ShopifyProduct } from "../lib/shopify/types";

interface HeroSectionProps {
    featuredProduct?: ShopifyProduct;
}

export default function HeroSection({ featuredProduct }: HeroSectionProps) {
    return (
        <div className="grid md:grid-cols-2 gap-12 items-center py-12 mb-20 overflow-hidden">
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center md:text-left space-y-6"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full text-purple-900 text-xs font-bold tracking-wider uppercase">
                    <Sparkles className="w-3 h-3" />
                    <span>Handcrafted With Love</span>
                </div>

                <h2 className="text-5xl md:text-7xl font-serif italic leading-tight text-slate-900 font-bold">
                    Every Knot
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600">
                        Tells a Story
                    </span>
                </h2>

                <p className="text-lg text-slate-600 leading-relaxed max-w-xl mx-auto md:mx-0">
                    From my hands to yours. Each keychain is lovingly woven with
                    heart. Not mass-produced. Just handmade magic.
                </p>

                <div className="flex flex-wrap gap-6 pt-4 justify-center md:justify-start">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <HeartHandshake className="text-purple-700 w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 text-sm">
                                100% Handmade
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Heart className="text-pink-700 w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 text-sm">
                                Made to Last
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 2 }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                className="relative"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full blur-3xl opacity-20"></div>
                {featuredProduct && (
                    <div className="polaroid relative z-10 mx-auto md:mr-0 max-w-sm">
                        <div className="aspect-square bg-stone-100 overflow-hidden mb-4 border border-stone-200 relative">
                            {featuredProduct.featuredImage && (
                                <Image
                                    src={featuredProduct.featuredImage.url}
                                    alt={featuredProduct.title}
                                    fill
                                    priority
                                    className="object-cover transition-transform duration-700 hover:scale-110"
                                />
                            )}
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-slate-900 text-xl font-serif">
                                Featured This Week
                            </h3>
                            <p className="text-slate-600 text-sm italic">
                                {featuredProduct.title}
                            </p>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
