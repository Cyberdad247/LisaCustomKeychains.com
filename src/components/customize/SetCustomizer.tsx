// 🐝 [HIVE_SWARM_STAMP] Synchronous Set Customizer - Camelot OS v203.2
"use client";

import { useState, useTransition, useEffect, useOptimistic } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ShoppingBag, X, Loader2, Check, Sparkles } from "lucide-react";
import { useCart } from "../CartProvider";
import SEOWrapper from "../SEOWrapper";
import { Sheet, SheetContent, SheetTitle } from "../ui/sheet";
import { type ShopifyProduct } from "../../lib/shopify/types";
import { THREAD_COLORS, CHARM_OPTIONS } from "../../lib/camelot/registry";
import { type ColorOption, type CharmOption } from "../../lib/camelot/schemas";

interface SetCustomizerProps {
    product: ShopifyProduct;
    isOpen: boolean;
    onClose: () => void;
}

export default function SetCustomizer({
    product,
    isOpen,
    onClose,
}: SetCustomizerProps) {
    const shouldReduceMotion = useReducedMotion();
    const productPrice =
        product.priceRange?.minVariantPrice?.amount ||
        product.variants?.edges[0]?.node?.price?.amount ||
        "25.00";

    const [selectedColor, setSelectedColor] = useState<ColorOption>(THREAD_COLORS[0]);
    const [selectedCharm, setSelectedCharm] = useState<CharmOption>(CHARM_OPTIONS[0]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const { addItemToCart } = useCart();

    // 🛡️ Persistence Logic: Push State on Open
    useEffect(() => {
        if (isOpen) {
            setErrorMessage(null);
            window.history.pushState(
                { drawerOpen: true },
                "",
                window.location.pathname + "?customize=set"
            );
        } else {
            if (window.location.search.includes("customize=set")) {
                window.history.back();
            }
        }

        const handlePopState = (event: PopStateEvent) => {
            if (!event.state?.drawerOpen && isOpen) {
                onClose();
            }
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [isOpen, onClose]);

    const handleAddToCartAction = async () => {
        const variants = product.variants?.edges || [];
        const matchedVariant =
            variants.find((v: { node: { title: string } }) =>
                v.node.title.toLowerCase().includes(selectedColor.name.toLowerCase())
            ) || variants[0];

        const currentVariantId = matchedVariant?.node?.id;
        const isAvailable = matchedVariant?.node?.availableForSale;

        if (!currentVariantId) {
            setErrorMessage("Product variant not found.");
            return;
        }

        try {
            setErrorMessage(null);
            await startTransition(async () => {
                const attributes = [
                    { key: "Color", value: selectedColor.name },
                    { key: "Charm", value: `${selectedCharm.name} ${selectedCharm.icon}` },
                    { key: "Set Type", value: "Synchronized Keychain & Earring Set" },
                    { key: "Vibe Note", value: "Color and Charm synchronized across all set components." }
                ];

                await addItemToCart(currentVariantId, 1, attributes);
            });
            onClose();
        } catch (e) {
            setErrorMessage(e instanceof Error ? e.message : "Failed to add set to bag.");
        }
    };

    const isAvailable = product.variants?.edges[0]?.node?.availableForSale;
    let renderButtonText = isPending ? "" : "Ignite Set Transaction";
    if (!isPending && !isAvailable) renderButtonText = "Sold Out";

    return (
        <>
            <SEOWrapper product={product} />
            <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent className="w-full md:max-w-[90vw] lg:max-w-6xl p-0 gap-0 overflow-hidden bg-white border-l border-white/20 shadow-2xl flex flex-col">
                    <SheetTitle className="sr-only">Customize {product.title}</SheetTitle>

                    <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-50 pointer-events-none">
                        <div className="pointer-events-auto"></div>
                        <button
                            onClick={onClose}
                            className="p-2 bg-white/80 backdrop-blur rounded-full text-slate-800 hover:bg-white shadow-lg pointer-events-auto transition-transform hover:rotate-90 md:mr-6 mt-2"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex flex-col md:grid md:grid-cols-12 h-full w-full">
                        {/* LEFT: Dual Visual Forge */}
                        <div className="relative h-[45vh] md:h-full md:col-span-7 flex-shrink-0 crochet-yarn-light flex items-center justify-center p-8 border-b-4 md:border-b-0 md:border-r-4 border-stone-100 bg-stone-50 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none"></div>

                            <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-md border border-purple-100 rounded-full shadow-sm z-10">
                                <Sparkles className="w-3 h-3 text-purple-600 animate-pulse" />
                                <span className="text-[10px] font-black text-slate-600 tracking-widest uppercase">
                                    Set Sync Active
                                </span>
                            </div>

                            <div className="flex gap-12 items-center scale-75 md:scale-90 lg:scale-110 transition-transform h-full justify-center">
                                {/* Keychain Preview */}
                                <motion.div
                                    className="relative flex flex-col items-center"
                                    animate={{ y: [0, -4, 0] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-4 bg-white/50 px-2 py-1 rounded-full">Signature Keychain</div>
                                    <div
                                        className="w-16 h-64 rounded-b-3xl shadow-2xl flex flex-col items-center gap-1 pt-6 pb-4 overflow-hidden border-x-4 border-black/10 transition-colors"
                                        style={{ background: selectedColor.hex }}
                                    >
                                        <div className="w-12 h-6 bg-white text-slate-900 flex items-center justify-center font-black rounded-sm mb-auto shadow-md text-[5px] text-center px-1">
                                            {selectedCharm.icon}
                                        </div>
                                        <div className="w-12 h-6 bg-white text-slate-900 flex items-center justify-center font-black rounded-sm mt-auto shadow-md text-[5px] text-center px-1">
                                            {selectedCharm.icon}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Earrings Preview */}
                                <div className="flex flex-col items-center gap-8">
                                    <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 bg-white/50 px-2 py-1 rounded-full">Matching Pair</div>
                                    <div className="flex gap-4">
                                        {[1, 2].map((i) => (
                                            <motion.div
                                                key={i}
                                                className="relative flex flex-col items-center"
                                                style={{ originY: 0 }}
                                                animate={{ rotate: i === 1 ? [0, -2, 0] : [0, 2, 0] }}
                                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                                            >
                                                <div
                                                    className="w-10 h-32 rounded-b-2xl shadow-xl flex flex-col items-center gap-1 pt-3 pb-2 border-x-2 border-black/10 transition-colors"
                                                    style={{ background: selectedColor.hex }}
                                                >
                                                    <div className="w-8 h-4 bg-white/90 flex items-center justify-center font-black rounded-sm shadow-md text-[4px] text-center">
                                                        {selectedCharm.icon}
                                                    </div>
                                                    <div className="mt-auto w-8 h-4 bg-white flex items-center justify-center font-black rounded-sm shadow-md text-[4px] text-center">
                                                        {selectedCharm.icon}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Controls */}
                        <div className="flex-1 md:col-span-5 overflow-y-auto p-8 bg-white h-full relative">
                            <div className="max-w-md mx-auto pb-24 md:pt-12">
                                <div className="mb-8">
                                    <h2 className="text-3xl font-serif text-slate-900 mb-1">{product.title}</h2>
                                    <p className="text-purple-600/80 text-[10px] tracking-[0.2em] uppercase font-black">
                                        Synchronized Bundle Forge
                                    </p>
                                </div>

                                <div className="space-y-10">
                                    {/* Sync Color */}
                                    <div className="space-y-4">
                                        <label className="flex items-center justify-between text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">
                                            <span>Unified Thread Color</span>
                                            <span className="text-purple-600">{selectedColor.name}</span>
                                        </label>
                                        <div className="grid grid-cols-6 gap-2.5">
                                            {THREAD_COLORS.map((color) => (
                                                <button
                                                    key={color.id}
                                                    onClick={() => setSelectedColor(color)}
                                                    className={`aspect-square rounded-full border-2 transition-all p-0.5 ${selectedColor.id === color.id ? "border-purple-600 scale-110 shadow-lg" : "border-transparent hover:border-stone-200"}`}
                                                >
                                                    <div className="w-full h-full rounded-full border border-black/5" style={{ background: color.hex }} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Sync Charm */}
                                    <div className="space-y-4 pt-6 border-t border-stone-100">
                                        <label className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase block">
                                            Synchronized Charm Selection
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {CHARM_OPTIONS.map((charm) => (
                                                <button
                                                    key={charm.id}
                                                    onClick={() => setSelectedCharm(charm)}
                                                    className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 transition-all ${selectedCharm.id === charm.id ? "border-purple-600 bg-purple-50 shadow-md scale-105" : "border-stone-100 bg-white hover:border-purple-200"}`}
                                                >
                                                    <span className="font-black text-[9px] uppercase tracking-tight text-slate-800 text-center leading-tight">
                                                        {charm.name}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 text-purple-900/60 text-[10px] leading-relaxed font-medium">
                                        ✨ Note: Selecting a color or charm here will apply the choice to the entire set (Keychain & Earrings) for a perfectly matched aesthetic.
                                    </div>
                                </div>

                                <div className="pt-8 mt-auto sticky bottom-0 bg-white/95 backdrop-blur-sm pb-4">
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <span className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1">Set Valuation</span>
                                            <span className="text-4xl font-serif text-slate-900">${parseFloat(productPrice).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {errorMessage && (
                                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold text-center mb-4">
                                            ⚠️ {errorMessage}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleAddToCartAction}
                                        disabled={isPending || !isAvailable}
                                        className="w-full py-5 bg-slate-900 hover:bg-purple-700 text-white rounded-2xl font-black text-[11px] tracking-[0.25em] uppercase transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
                                    >
                                        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                            <>
                                                <ShoppingBag className="w-5 h-5" />
                                                <span>{renderButtonText}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
