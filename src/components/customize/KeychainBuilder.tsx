"use client";

import { useState, useOptimistic, useTransition, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ShoppingBag, Loader2, Check, Sparkles, Wand2 } from "lucide-react";
import { useCart } from "../CartProvider";
import { validateKeychain } from "../../lib/validation/keychain";
import {
    getTierByPrice,
    getCharLimit,
} from "../../lib/camelot/tiers";
import VibeInput from "../VibeInput";
import { type ShopifyProduct } from "../../lib/shopify/types";
import { THREAD_COLORS, CHARM_OPTIONS } from "../../lib/camelot/registry";
import { type ColorOption, type CharmOption } from "../../lib/camelot/schemas";

interface KeychainBuilderProps {
    product: ShopifyProduct;
    lockLetters?: boolean;
    charmCategory?: string;
    allowedColors?: string[]; // IDs of allowed colors
}

// Local interfaces removed in favor of schemas.ts exports

// Using central registry for thread colors

export default function KeychainBuilder({ 
    product,
    lockLetters = false,
    charmCategory = "all",
    allowedColors
}: KeychainBuilderProps) {
    const shouldReduceMotion = useReducedMotion();
    const isEarring = product.productType?.toLowerCase().includes("earring") || product.title?.toLowerCase().includes("earring") || product.title?.toLowerCase().includes("dangle");
    const productPrice =
        product.priceRange?.minVariantPrice?.amount ||
        product.variants?.edges[0]?.node?.price?.amount ||
        "9.95";
    const priceNum = parseFloat(productPrice);
    const tier = getTierByPrice(priceNum);
    const isTier1 = (tier === 1) || lockLetters;
    const isTier3 = tier === 3 && !lockLetters;

    const filteredColors = allowedColors 
        ? THREAD_COLORS.filter(c => allowedColors.includes(c.id))
        : THREAD_COLORS;

    const [text, setText] = useState(isEarring || lockLetters ? "" : "NAME");
    const [selectedColor, setSelectedColor] = useState<ColorOption>(filteredColors[0] || THREAD_COLORS[0]);
    
    const initialCharms = charmCategory === "sports"
        ? [CHARM_OPTIONS.find(c => c.id === "football") || CHARM_OPTIONS[0], CHARM_OPTIONS.find(c => c.id === "basketball") || CHARM_OPTIONS[1]]
        : [CHARM_OPTIONS[0], CHARM_OPTIONS[1]];

    const [selectedCharms, setSelectedCharms] = useState<CharmOption[]>(initialCharms);
    const [activeCharmIndex, setActiveCharmIndex] = useState(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    
    const charms = charmCategory === "sports"
        ? CHARM_OPTIONS.filter(c => ["football", "basketball", "soccer", "softball", "volleyball", "tennis-balls", "bowling-pins"].includes(c.id))
        : CHARM_OPTIONS;

    const [suggestedIcons, setSuggestedIcons] = useState<CharmOption[]>(charms);
    const [isPending, startTransition] = useTransition();
    const [optimisticText, setOptimisticText] = useOptimistic(
        text,
        (state, newText: string) => newText
    );

    const { addItemToCart } = useCart();

    const handleAddToCartAction = async (formData: FormData) => {
        const inputText = (formData.get("text") as string) || text;

        const validationResult = validateKeychain({
            text: isTier1 ? "COLORONLY" : inputText.toUpperCase(),
            color: selectedColor,
            charms: selectedCharms,
        });

        if (!validationResult.success) {
            setErrorMessage(validationResult.error || "Please verify your customization.");
            return;
        }

        const variants = product.variants?.edges || [];
        const matchedVariant =
            variants.find((v: { node: { title: string } }) =>
                v.node.title.toLowerCase().includes(selectedColor.name.toLowerCase())
            ) || variants[0];

        const currentVariantId = matchedVariant?.node?.id;

        if (!currentVariantId) {
            setErrorMessage("Configuration error: Variant not found.");
            return;
        }

        try {
            setErrorMessage(null);
            await addItemToCart(currentVariantId, 1, [
                {
                    key: "text",
                    value: isTier1 ? "No Name" : inputText.toUpperCase(),
                },
                { key: "color", value: selectedColor.name },
                {
                    key: "vibe_notes",
                    value: JSON.stringify({
                        charms: selectedCharms.map(c => c.name).join(", "),
                        charm_icons: selectedCharms.map(c => c.icon).join(" "),
                        tier: tier,
                        visual: `${selectedColor.name} with ${selectedCharms.map(c => c.icon).join(" ")}`,
                        source: "Standalone Builder"
                    }),
                },
            ]);
            // Navigate to bag or show success? For now, the CartDrawer will likely open.
        } catch (e) {
            setErrorMessage(e instanceof Error ? e.message : "Failed to add to bag.");
        }
    };

    const strand1 = isTier3 ? optimisticText.slice(0, 8) : optimisticText;
    const strand2 = isTier3 ? optimisticText.slice(8, 16) : "";

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid lg:grid-cols-2 gap-12 items-start">

                {/* Visual Preview Section */}
                <div className="sticky top-32 space-y-8">
                    <div className="relative aspect-square bg-stone-100 rounded-[2rem] overflow-hidden flex items-center justify-center p-12 border border-stone-200/50 shadow-inner">
                        {/* Live Preview Decoration */}
                        <div className="absolute top-8 left-8 flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-md border border-purple-100 rounded-full shadow-sm z-10">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span className="text-[10px] font-black text-slate-600 tracking-widest uppercase">
                                Forge Live
                            </span>
                        </div>

                        <div className="flex gap-8 items-center scale-110 lg:scale-125">
                            {/* Strand 1 */}
                            <motion.div
                                className="relative flex flex-col items-center"
                                animate={{ y: [0, -4, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <div
                                    className="w-20 h-[480px] rounded-b-3xl shadow-2xl flex flex-col items-center gap-1 pt-8 pb-4 overflow-hidden border-x-4 border-black/10 transition-colors"
                                    style={{ background: selectedColor.isRainbow ? selectedColor.hex : selectedColor.hex }}
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setActiveCharmIndex(0)}
                                        className={`w-16 min-h-8 bg-white text-slate-900 flex items-center justify-center font-black rounded-sm mb-4 shadow-md text-[6px] tracking-tight leading-none px-1 py-1 text-center transition-all ${activeCharmIndex === 0 ? "ring-4 ring-purple-600 ring-offset-2" : ""}`}
                                    >
                                        {selectedCharms[0]?.icon}
                                    </motion.button>

                                    <AnimatePresence mode="popLayout">
                                        {strand1.split("").map((char, i) => (
                                            <motion.div
                                                key={`s1-${i}-${char}`}
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className={`w-8 h-8 bg-white text-slate-900 flex items-center justify-center font-black rounded-sm text-sm shadow-md mb-1 ${i % 2 === 0 ? "rotate-2" : "-rotate-2"}`}
                                            >
                                                {char.toUpperCase()}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setActiveCharmIndex(1)}
                                        className={`w-16 min-h-8 bg-white text-slate-900 flex items-center justify-center font-black rounded-sm mt-auto mb-6 shadow-md text-[6px] tracking-tight leading-none px-1 py-1 text-center transition-all ${activeCharmIndex === 1 ? "ring-4 ring-purple-600 ring-offset-2" : ""}`}
                                    >
                                        {selectedCharms[1]?.icon || selectedCharms[0]?.icon}
                                    </motion.button>
                                </div>
                            </motion.div>

                            {/* Strand 2 (Tier 3) */}
                            {isTier3 && (
                                <motion.div
                                    className="relative flex flex-col items-center"
                                    animate={{ y: [-4, 0, -4] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                >
                                    <div
                                        className="w-20 h-[480px] rounded-b-3xl shadow-2xl flex flex-col items-center gap-1 pt-8 pb-4 overflow-hidden border-x-4 border-black/10 transition-colors"
                                        style={{ background: selectedColor.isRainbow ? selectedColor.hex : selectedColor.hex }}
                                    >
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setActiveCharmIndex(0)}
                                            className={`w-16 min-h-8 bg-white text-slate-900 flex items-center justify-center font-black rounded-sm mb-4 shadow-md text-[6px] tracking-tight leading-none px-1 py-1 text-center transition-all ${activeCharmIndex === 0 ? "ring-4 ring-purple-600 ring-offset-2" : ""}`}
                                        >
                                            {selectedCharms[0]?.icon}
                                        </motion.button>

                                        <AnimatePresence mode="popLayout">
                                            {strand2.split("").map((char, i) => (
                                                <motion.div
                                                    key={`s2-${i}-${char}`}
                                                    initial={{ opacity: 0, scale: 0.5 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className={`w-8 h-8 bg-white text-slate-900 flex items-center justify-center font-black rounded-sm text-sm shadow-md mb-1 ${i % 2 === 0 ? "-rotate-2" : "rotate-2"}`}
                                                >
                                                    {char.toUpperCase()}
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setActiveCharmIndex(1)}
                                            className={`w-16 min-h-8 bg-white text-slate-900 flex items-center justify-center font-black rounded-sm mt-auto mb-6 shadow-md text-[6px] tracking-tight leading-none px-1 py-1 text-center transition-all ${activeCharmIndex === 1 ? "ring-4 ring-purple-600 ring-offset-2" : ""}`}
                                        >
                                            {selectedCharms[1]?.icon || selectedCharms[0]?.icon}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    <div className="p-6 bg-white rounded-2xl border border-stone-200/50 shadow-sm flex items-start gap-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Wand2 className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800 tracking-tight">Hand-Woven Precision</p>
                            <p className="text-xs text-slate-500 leading-relaxed">Each bead is selected and woven manually by Lisa. Your customization will be forged within 24-48 hours of your order.</p>
                        </div>
                    </div>
                </div>

                {/* Configuration Controls */}
                <div className="space-y-12 pb-32">
                    <header>
                        <h1 className="text-5xl font-serif text-slate-900 mb-2">Build Your Own</h1>
                        <p className="text-slate-500 tracking-widest font-black text-xs uppercase">Sovereign Customization Engine</p>
                    </header>

                    <form action={handleAddToCartAction} className="space-y-10">
                        {/* 1. Thread Color */}
                        <section className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-[10px] font-black tracking-[.25em] uppercase text-slate-400">01. Choose Your Thread</h3>
                                <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">{selectedColor.name}</span>
                            </div>
                            <div className="grid grid-cols-6 sm:grid-cols-8 gap-3">
                                {filteredColors.map(color => (
                                    <button
                                        key={color.id}
                                        type="button"
                                        onClick={() => setSelectedColor(color)}
                                        className={`aspect-square rounded-full border-2 transition-all p-1 ${selectedColor.id === color.id ? "border-purple-600 scale-110 shadow-lg" : "border-transparent hover:border-stone-200"
                                            }`}
                                    >
                                        <div
                                            className="w-full h-full rounded-full border border-black/5"
                                            style={{ background: color.hex }}
                                        />
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* 2. Custom Text - Safely omitted for Earrings or Locked sections */}
                        {!isEarring && !lockLetters && (
                            <section className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-[10px] font-black tracking-[.25em] uppercase text-slate-400">02. Sequence Your Text</h3>
                                    <span className="text-[10px] font-bold font-mono text-slate-300">{text.length}/{getCharLimit(tier)}</span>
                                </div>
                                <input
                                    name="text"
                                    type="text"
                                    value={text}
                                    onChange={(e) => {
                                        const limit = getCharLimit(tier);
                                        const val = e.target.value.toUpperCase().slice(0, limit);
                                        setText(val);
                                        startTransition(() => {
                                            setOptimisticText(val);
                                        });
                                    }}
                                    className="w-full text-5xl font-serif bg-transparent border-b-2 border-stone-200 py-4 focus:outline-none focus:border-purple-600 text-slate-900 placeholder:text-stone-200 tracking-tighter transition-all"
                                    placeholder="YOUR TEXT"
                                />
                            </section>
                        )}

                        {lockLetters && (
                            <section className="p-6 bg-purple-50 rounded-2xl border border-purple-100">
                                <p className="text-xs font-bold text-purple-900 uppercase tracking-widest mb-2">Sports Edition Locked</p>
                                <p className="text-xs text-purple-700/70 leading-relaxed">This exclusive sports collection focuses on team spirit through color and charms. Text customization is disabled for this section.</p>
                            </section>
                        )}

                        {/* 3. Vibe Engine (Charms) */}
                        <section className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-[10px] font-black tracking-[.25em] uppercase text-slate-400">03. Define Your Vibe</h3>
                                <div className="flex gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setActiveCharmIndex(0)}
                                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all ${activeCharmIndex === 0 ? "bg-purple-600 text-white shadow-md shadow-purple-200" : "bg-stone-100 text-slate-400 hover:bg-stone-200"}`}
                                    >
                                        Edit Top
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveCharmIndex(1)}
                                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all ${activeCharmIndex === 1 ? "bg-purple-600 text-white shadow-md shadow-purple-200" : "bg-stone-100 text-slate-400 hover:bg-stone-200"}`}
                                    >
                                        Edit Bottom
                                    </button>
                                </div>
                            </div>
                            {!lockLetters && (
                                <VibeInput
                                    onVibeChange={(data) => {
                                        if (data.icon) {
                                            const newCharm = { id: `v-${data.label.toLowerCase()}`, name: data.label, icon: data.icon };
                                            const newCharms = [...selectedCharms];
                                            newCharms[activeCharmIndex] = newCharm;
                                            setSelectedCharms(newCharms);
                                            setSuggestedIcons(prev => {
                                                if (prev.find(p => p.icon === data.icon)) return prev;
                                                return [newCharm, ...prev.slice(0, 11)];
                                            });
                                        }
                                    }}
                                />
                            )}
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                {suggestedIcons.map((charm, idx) => (
                                    <motion.button
                                        key={idx}
                                        whileHover={shouldReduceMotion ? { opacity: 0.8 } : { scale: 1.05, y: -2 }}
                                        whileTap={shouldReduceMotion ? { opacity: 0.9 } : { scale: 0.95 }}
                                        type="button"
                                        onClick={() => {
                                            const newCharms = [...selectedCharms];
                                            newCharms[activeCharmIndex] = charm;
                                            setSelectedCharms(newCharms);
                                        }}
                                        className={`flex items-center justify-center p-4 rounded-2xl border transition-all ${selectedCharms[activeCharmIndex]?.id === charm.id ? "border-purple-600 bg-purple-50 ring-1 ring-purple-600 shadow-md" : "border-stone-100 bg-white hover:border-purple-200"
                                            }`}
                                    >
                                        <span className="text-[11px] font-black uppercase tracking-tight text-slate-800 text-center leading-tight">{charm.name}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </section>

                        {/* Final Action */}
                        <section className="pt-12">
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <p className="text-[10px] font-black tracking-[.3em] uppercase text-slate-400 mb-2">Total Valuation</p>
                                    <p className="text-5xl font-serif text-slate-900">${priceNum.toFixed(2)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black tracking-[.2em] uppercase text-purple-600 mb-1">Status</p>
                                    <p className="text-xs font-bold text-slate-800">Ready for Ignition</p>
                                </div>
                            </div>

                            {errorMessage && (
                                <motion.div
                                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                                    className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold text-center mb-6"
                                >
                                    ⚠️ {errorMessage}
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-slate-900 hover:bg-purple-700 text-white py-6 rounded-2xl font-black text-[11px] tracking-[.3em] uppercase transition-all flex items-center justify-center gap-4 shadow-xl hover:shadow-2xl disabled:opacity-50"
                            >
                                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        <ShoppingBag className="w-5 h-5" />
                                        <span>Ignite Transaction</span>
                                    </>
                                )}
                            </button>

                            <div className="mt-8 flex items-center justify-center gap-6 opacity-30">
                                <div className="h-px flex-1 bg-stone-300"></div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 whitespace-nowrap">Shopify Secure Connection</p>
                                <div className="h-px flex-1 bg-stone-300"></div>
                            </div>
                        </section>
                    </form>
                </div>
            </div>
        </div>
    );
}
