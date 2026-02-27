"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Sparkles, Heart, HeartHandshake } from "lucide-react";
import { type ShopifyProduct } from "../lib/shopify/types";
import PolaroidWrapper from "@/components/PolaroidWrapper";

interface HeroSectionProps {
    featuredProduct?: ShopifyProduct;
}

export default function HeroSection({ featuredProduct }: HeroSectionProps) {
    const shouldReduceMotion = useReducedMotion();

    // Simplified animation overrides for accessibility
    const slideAnimation = shouldReduceMotion
        ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
        : { initial: { opacity: 0, x: -50 }, animate: { opacity: 1, x: 0 } };

    const photoAnimation = shouldReduceMotion
        ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
        : { initial: { opacity: 0, scale: 0.8, rotate: -5 }, animate: { opacity: 1, scale: 1, rotate: 2 } };

    return (
        <div className="grid md:grid-cols-2 gap-12 items-center py-12 mb-20 overflow-hidden">
            <motion.div
                {...slideAnimation}
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

                <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
                    <motion.a
                        href="/customize"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-purple-600 text-white rounded-full font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                        <Sparkles className="w-5 h-5" />
                        BUILD YOURS
                    </motion.a>
                    <motion.a
                        href="/products"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-white text-slate-900 border-2 border-slate-100 rounded-full font-bold hover:border-purple-200 transition-colors"
                    >
                        SHOP ALL
                    </motion.a>
                </div>

                <div className="flex flex-wrap gap-6 pt-8 justify-center md:justify-start">
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
                {...photoAnimation}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                className="relative"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full blur-3xl opacity-20"></div>

                <PolaroidWrapper className="mx-auto md:mr-0 max-w-sm">
                    <div className="aspect-square bg-stone-100 overflow-hidden mb-4 border border-stone-200 relative">
                        <Image
                            src="/featured-earrings.jpg"
                            alt="Featured Handmade Earrings"
                            fill
                            priority
                            className="object-cover transition-transform duration-700 hover:scale-110"
                        />
                    </div>
                    <div className="text-center">
                        <h3 className="font-bold text-slate-900 text-xl font-serif">
                            Featured This Week
                        </h3>
                        <p className="text-slate-600 text-sm italic">
                            Handcrafted Heart Bead Earrings
                        </p>
                    </div>
                </PolaroidWrapper>
            </motion.div>
        </div>
    );
}
