// 🐝 [HIVE_SWARM_STAMP] Earring Customizer Component - Camelot OS v203.2
"use client";

import { useState, useOptimistic, useTransition, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, Loader2, Sparkles } from "lucide-react";
import { useCart } from "../CartProvider";
import { validateEarring } from "../../lib/validation/earring";
import SEOWrapper from "../SEOWrapper";
import { Sheet, SheetContent, SheetTitle } from "../ui/sheet";
import { type ShopifyProduct } from "../../lib/shopify/types";

interface EarringCustomizerProps {
    product: ShopifyProduct;
    isOpen: boolean;
    onClose: () => void;
}

interface ThreadColor {
    id: string;
    name: string;
    hex: string;
    isRainbow?: boolean;
}

interface Charm {
    id: string;
    name: string;
    icon: string;
}

const THREAD_COLORS: ThreadColor[] = [
    { id: "purple", name: "Royal Purple", hex: "#9333ea" },
    { id: "pink", name: "Soft Pink", hex: "#ec4899" },
    { id: "blue", name: "Sky Blue", hex: "#3b82f6" },
    { id: "lavender", name: "Lavender Mist", hex: "#E6E6FA" },
    { id: "mint", name: "Fresh Mint", hex: "#BDFCC9" },
    { id: "black", name: "Void Black", hex: "#18181b" },
    { id: "charcoal", name: "Charcoal Silk", hex: "#36454F" },
    { id: "rose", name: "Rose", hex: "#fb7185" },
    { id: "burgundy", name: "Classic Burgundy", hex: "#800020" },
    { id: "red", name: "Crimson Red", hex: "#dc2626" },
    { id: "orange", name: "Amber Orange", hex: "#f59e0b" },
    { id: "peach", name: "Sweet Peach", hex: "#FFDAB9" },
    { id: "yellow", name: "Golden Yellow", hex: "#fbbf24" },
    { id: "green", name: "Emerald Green", hex: "#10b981" },
    { id: "sage", name: "Velvet Sage", hex: "#BCB88A" },
    { id: "white", name: "Cloud White", hex: "#f8fafc" },
    { id: "grey", name: "Slate Grey", hex: "#475569" },
    { id: "brown", name: "Earth Brown", hex: "#451a03" },
    { id: "indigo", name: "Indigo Deep", hex: "#4338ca" },
    { id: "navy", name: "Midnight Navy", hex: "#000080" },
    { id: "teal", name: "Ocean Teal", hex: "#0d9488" },
    { id: "coral", name: "Sun Coral", hex: "#ff7f50" },
    { id: "violet", name: "Neon Violet", hex: "#a855f7" },
    {
        id: "rainbow",
        name: "Rainbow",
        hex: "linear-gradient(to bottom, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)",
        isRainbow: true,
    },
];

const MAX_LETTERS = 4;

const CHARM_OPTIONS: Charm[] = [
    { id: "none", name: "No Charm", icon: "" },
    { id: "heart", name: "Heart", icon: "❤️" },
    { id: "star", name: "Star", icon: "⭐" },
    { id: "butterfly", name: "Butterfly", icon: "🦋" },
    { id: "flower", name: "Flower", icon: "🌸" },
    { id: "diamond", name: "Diamond", icon: "💎" },
    { id: "moon", name: "Moon", icon: "🌙" },
    { id: "sun", name: "Sun", icon: "☀️" },
    { id: "clover", name: "Clover", icon: "🍀" },
    { id: "bow", name: "Bow", icon: "🎀" },
    { id: "rainbow", name: "Rainbow", icon: "🌈" },
    { id: "bouquet", name: "Bouquet", icon: "💐" },
    { id: "sparkle", name: "Sparkle", icon: "✨" },
];

export default function EarringCustomizer({
    product,
    isOpen,
    onClose,
}: EarringCustomizerProps) {
    const productPrice =
        product.priceRange?.minVariantPrice?.amount ||
        product.variants?.edges[0]?.node?.price?.amount ||
        "15.00";

    const [selectedColor, setSelectedColor] = useState<ThreadColor>(
        THREAD_COLORS[0]
    );
    const [text, setText] = useState("");
    const [selectedTopCharm, setSelectedTopCharm] = useState<Charm>(CHARM_OPTIONS[0]);
    const [selectedBottomCharm, setSelectedBottomCharm] = useState<Charm>(CHARM_OPTIONS[0]);
    const [activeSlot, setActiveSlot] = useState<'top' | 'bottom'>('bottom');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const { addItemToCart } = useCart();

    const [optimisticText, setOptimisticText] = useOptimistic(
        text,
        (state, newText: string) => newText
    );

    // 🛡️ Persistence Logic: Push State on Open
    useEffect(() => {
        if (isOpen) {
            setErrorMessage(null);
            window.history.pushState(
                { drawerOpen: true },
                "",
                window.location.pathname + "?customize=earrings"
            );
        } else {
            // Clean up URL if closed naturally
            if (window.location.search.includes("customize=earrings")) {
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

    const handleAddToCartAction = async (formData: FormData) => {
        const inputText = (formData.get("text") as string) || text;

        // 🛡️ Zod Validation Gate
        const validationResult = validateEarring({
            text: inputText.toUpperCase(),
            color: selectedColor,
            charmTop: selectedTopCharm.id !== "none" ? selectedTopCharm : undefined,
            charmBottom: selectedBottomCharm.id !== "none" ? selectedBottomCharm : undefined,
        });

        if (!validationResult.success) {
            setErrorMessage(validationResult.error || "Please verify your customization.");
            return;
        }

        // Additional 4-letter validation
        if (inputText.length > MAX_LETTERS) {
            setErrorMessage(`Maximum ${MAX_LETTERS} letters for earrings.`);
            return;
        }

        const variants = product.variants?.edges || [];
        const matchedVariant =
            variants.find((v: { node: { title: string } }) =>
                v.node.title.toLowerCase().includes(selectedColor.name.toLowerCase())
            ) || variants[0];

        const currentVariantId = matchedVariant?.node?.id;
        const isAvailable = matchedVariant?.node?.availableForSale;
        const qty = matchedVariant?.node?.quantityAvailable || 0;

        if (!currentVariantId) {
            console.error("Variant ID missing");
            setErrorMessage("Product variant not found. Please refresh.");
            return;
        }

        try {
            setErrorMessage(null);
            await startTransition(async () => {
                const attributes = [
                    { key: "Text", value: inputText.toUpperCase() },
                    { key: "Color", value: selectedColor.name },
                    { key: "Product Type", value: "Earrings (Matching Pair)" },
                ];

                if (selectedTopCharm.id !== "none") {
                    attributes.push({
                        key: "Top Charm",
                        value: `${selectedTopCharm.name} ${selectedTopCharm.icon}`
                    });
                }

                if (selectedBottomCharm.id !== "none") {
                    attributes.push({
                        key: "Bottom Charm",
                        value: `${selectedBottomCharm.name} ${selectedBottomCharm.icon}`
                    });
                }

                await addItemToCart(currentVariantId, 1, attributes);
            });
            onClose(); // Close drawer on success
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Failed to add to bag. Please try again.";
            setErrorMessage(msg);
        }
    };

    // Determine button state for render (outside handleAddToCartAction scope)
    const variants = product.variants?.edges || [];
    const matchedVariant =
        variants.find((v: { node: { title: string } }) =>
            v.node.title.toLowerCase().includes(selectedColor.name.toLowerCase())
        ) || variants[0];

    const isAvailable = matchedVariant?.node?.availableForSale;
    const qty = matchedVariant?.node?.quantityAvailable ?? 0;

    let renderButtonText = isPending ? "" : "Add to Bag (Pair)";
    if (!isPending) {
        if (!matchedVariant) renderButtonText = "Unavailable";
        else if (!isAvailable) renderButtonText = "Sold Out";
        else if (qty <= 0) renderButtonText = "Order (Made to Order)";
    }

    return (
        <>
            <SEOWrapper product={product} />
            <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent className="w-full md:max-w-[90vw] lg:max-w-6xl p-0 gap-0 overflow-hidden bg-white border-l border-white/20 shadow-2xl flex flex-col">
                    <SheetTitle className="sr-only">Customize {product.title}</SheetTitle>

                    {/* Custom Header / Close */}
                    <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-50 pointer-events-none">
                        <div className="pointer-events-auto"></div>
                        <button
                            onClick={onClose}
                            aria-label="Close customizer"
                            className="p-2 bg-white/80 backdrop-blur rounded-full text-slate-800 hover:bg-white shadow-lg pointer-events-auto transition-transform hover:rotate-90 md:mr-6 mt-2"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Responsive Layout: Vertical Mobile, Split Desktop */}
                    <div className="flex flex-col md:grid md:grid-cols-12 h-full w-full">

                        {/* LEFT: Visual Forge (Preview) - Takes 7/12 cols on Desktop */}
                        <div className="relative h-[45vh] md:h-full md:col-span-7 flex-shrink-0 crochet-yarn-light flex items-center justify-center p-8 border-b-4 md:border-b-0 md:border-r-4 border-stone-100 bg-stone-50 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none"></div>

                            {/* Live Preview Badge */}
                            <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-md border border-purple-100 rounded-full shadow-sm z-10">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                                <span className="text-[10px] font-black text-slate-600 tracking-widest uppercase">
                                    Live Forge
                                </span>
                            </div>

                            {/* Matching Pair Badge */}
                            <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 bg-purple-500/90 backdrop-blur-md border border-purple-300 rounded-full shadow-sm z-10">
                                <Sparkles className="w-3 h-3 text-white" />
                                <span className="text-[10px] font-black text-white tracking-widest uppercase">
                                    Matching Pair
                                </span>
                            </div>

                            {/* Centered Preview Content - Showing Two Matching Earrings */}
                            <div className="flex gap-8 items-center scale-75 md:scale-100 transition-transform h-full justify-center">
                                {/* Earring 1 (Left) */}
                                <motion.div
                                    className="relative flex flex-col items-center"
                                    animate={{ rotate: [0, -2, 0] }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                >
                                    <motion.div
                                        className={`w-16 h-[290px] rounded-b-3xl shadow-xl flex flex-col items-center gap-1 pt-4 pb-2 transition-all duration-700 border-x-4 border-black/10 bg-stone-50 ${selectedColor.isRainbow
                                            ? "bg-rainbow font-rainbow"
                                            : "yarn-hex-bg"
                                            }`}
                                        animate={{ "--yarn-color": selectedColor.hex } as any}
                                    >
                                        {/* Top Charm Slot */}
                                        <div className="h-10 w-full flex items-center justify-center -mt-2 mb-1">
                                            {selectedTopCharm.id !== "none" && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="w-8 h-8 bg-white/90 backdrop-blur-sm flex items-center justify-center font-bold rounded-full shadow-lg text-sm border border-stone-100"
                                                >
                                                    {selectedTopCharm.icon}
                                                </motion.div>
                                            )}
                                        </div>

                                        <AnimatePresence mode="popLayout">
                                            {optimisticText.split("").map((char: string, i: number) => (
                                                <motion.div
                                                    key={`e1-${i}-${char}`}
                                                    initial={{ opacity: 0, scale: 0.5, y: -10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    className={`w-8 h-8 bg-white text-slate-900 flex items-center justify-center font-black rounded-sm text-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-1 ${i % 2 === 0 ? "rotate-2" : "-rotate-2"
                                                        }`}
                                                >
                                                    {char.toUpperCase()}
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        {/* Bottom Charm Slot */}
                                        <div className="mt-auto mb-2 h-10 w-full flex items-center justify-center">
                                            {selectedBottomCharm.id !== "none" && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="w-10 h-10 bg-white flex items-center justify-center font-bold rounded-full shadow-lg text-xl border border-stone-100"
                                                >
                                                    {selectedBottomCharm.icon}
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>
                                </motion.div>

                                {/* Earring 2 (Right) - Matching Design */}
                                <motion.div
                                    className="relative flex flex-col items-center"
                                    animate={{ rotate: [0, 2, 0] }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: 0.5,
                                    }}
                                >
                                    <motion.div
                                        className={`w-16 h-[290px] rounded-b-3xl shadow-xl flex flex-col items-center gap-1 pt-4 pb-2 transition-all duration-700 border-x-4 border-black/10 bg-stone-50 ${selectedColor.isRainbow
                                            ? "bg-rainbow font-rainbow"
                                            : "yarn-hex-bg"
                                            }`}
                                        animate={{ "--yarn-color": selectedColor.hex } as any}
                                    >
                                        {/* Top Charm Slot - REMOVED for Mirror Earring */}
                                        <div className="h-10 w-full flex items-center justify-center -mt-2 mb-1">
                                            {/* Mirrored Empty Space */}
                                        </div>

                                        <AnimatePresence mode="popLayout">
                                            {optimisticText.split("").map((char: string, i: number) => (
                                                <motion.div
                                                    key={`e2-${i}-${char}`}
                                                    initial={{ opacity: 0, scale: 0.5, y: -10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    className={`w-8 h-8 bg-white text-slate-900 flex items-center justify-center font-black rounded-sm text-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-1 ${i % 2 === 0 ? "rotate-2" : "-rotate-2"
                                                        }`}
                                                >
                                                    {char.toUpperCase()}
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        {/* Bottom Charm Slot - REMOVED for Mirror Earring */}
                                        <div className="mt-auto mb-2 h-10 w-full flex items-center justify-center">
                                            {/* Mirrored Empty Space */}
                                        </div>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </div>

                        {/* RIGHT: Controls Panel - Takes 5/12 cols on Desktop */}
                        <div className="flex-1 md:col-span-5 flex flex-col h-full md:h-auto overflow-y-auto">
                            <form
                                action={handleAddToCartAction}
                                className="flex flex-col h-full p-8 md:p-10 space-y-8"
                            >
                                {/* Header */}
                                <div className="space-y-2">
                                    <h1 className="text-4xl font-serif text-slate-900 leading-tight">
                                        Design Your Custom Earrings
                                    </h1>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        Create matching pair earrings with up to {MAX_LETTERS} letters.
                                        One design for both earrings.
                                    </p>
                                </div>

                                {/* Color Palette Selector */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">
                                            Thread Palette
                                        </span>
                                        <span className="text-[10px] font-bold text-purple-600">
                                            {selectedColor.name}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-6 gap-2">
                                        {THREAD_COLORS.map((color) => (
                                            <button
                                                key={color.id}
                                                type="button"
                                                onClick={() => setSelectedColor(color)}
                                                className="group relative aspect-square"
                                            >
                                                <motion.div
                                                    className={`w-full h-full rounded-xl border-2 transition-all shadow-sm ${selectedColor.id === color.id
                                                        ? "border-purple-600 scale-110 shadow-lg"
                                                        : "border-stone-100 hover:scale-105 hover:border-purple-400"
                                                        }`}
                                                    style={{
                                                        background: color.isRainbow
                                                            ? color.hex
                                                            : color.hex,
                                                    }}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Charm Selector Section */}
                                <div className="space-y-4 pt-4 border-t border-stone-100">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">
                                            Add Charms (Top & Bottom)
                                        </span>
                                    </div>

                                    {/* Slot Toggle */}
                                    <div className="flex gap-2 p-1 bg-stone-100 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setActiveSlot('top')}
                                            className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${activeSlot === 'top'
                                                ? "bg-white text-purple-600 shadow-sm"
                                                : "text-slate-400 hover:text-slate-600"
                                                }`}
                                        >
                                            Top Slot {selectedTopCharm.id !== 'none' && '•'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveSlot('bottom')}
                                            className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${activeSlot === 'bottom'
                                                ? "bg-white text-purple-600 shadow-sm"
                                                : "text-slate-400 hover:text-slate-600"
                                                }`}
                                        >
                                            Bottom Slot {selectedBottomCharm.id !== 'none' && '•'}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between px-1">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                            Modifying {activeSlot === 'top' ? 'Top' : 'Bottom'} Slot
                                        </span>
                                        <span className="text-[10px] font-bold text-purple-600">
                                            {activeSlot === 'top' ? selectedTopCharm.name : selectedBottomCharm.name}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-4 gap-2">
                                        {CHARM_OPTIONS.map((charm) => (
                                            <button
                                                key={charm.id}
                                                type="button"
                                                onClick={() => {
                                                    if (activeSlot === 'top') setSelectedTopCharm(charm);
                                                    else setSelectedBottomCharm(charm);
                                                }}
                                                className={`group relative aspect-square flex items-center justify-center rounded-xl border-2 transition-all text-2xl ${(activeSlot === 'top' ? selectedTopCharm.id : selectedBottomCharm.id) === charm.id
                                                    ? "border-purple-600 bg-purple-50 scale-105 shadow-md"
                                                    : "border-stone-100 hover:border-purple-400 hover:scale-105 bg-white"
                                                    }`}
                                            >
                                                {charm.id === "none" ? (
                                                    <span className="text-xs text-slate-400 font-bold">None</span>
                                                ) : (
                                                    <motion.span
                                                        whileHover={{ scale: 1.2 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        {charm.icon}
                                                    </motion.span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Text Input Section */}
                                <div className="space-y-6 pt-4 border-t border-stone-100">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <label className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">
                                                Letters (Max {MAX_LETTERS})
                                            </label>
                                            <span
                                                className={`text-[10px] font-bold font-mono ${text.length > MAX_LETTERS
                                                    ? "text-red-500"
                                                    : "text-slate-300"
                                                    }`}
                                            >
                                                {text.length}/{MAX_LETTERS}
                                            </span>
                                        </div>
                                        <input
                                            name="text"
                                            type="text"
                                            value={text}
                                            onChange={(e) => {
                                                const val = e.target.value
                                                    .toUpperCase()
                                                    .slice(0, MAX_LETTERS);
                                                setText(val);
                                                startTransition(() => {
                                                    setOptimisticText(val);
                                                });
                                            }}
                                            className="w-full text-4xl font-serif border-b-2 border-stone-100 py-2 focus:outline-none focus:border-purple-600 bg-transparent text-slate-900 placeholder:text-stone-200 uppercase tracking-widest focus:placeholder:text-stone-100 transition-colors"
                                            placeholder="LISA"
                                        />
                                    </div>
                                </div>

                                <div className="pt-8 mt-auto sticky bottom-0 bg-white/95 backdrop-blur-sm pb-4">
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <span className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1">
                                                Total Valuation
                                            </span>
                                            <span className="text-4xl font-serif text-slate-900">
                                                ${parseFloat(productPrice).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    {errorMessage && (
                                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold text-center mb-4">
                                            ⚠️ {errorMessage}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isPending || (matchedVariant && !isAvailable)}
                                        className={`w-full py-5 text-white rounded-2xl font-black text-[11px] tracking-[0.25em] uppercase transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group ${!isAvailable ? "bg-stone-400" : "bg-slate-900 hover:bg-purple-700"
                                            }`}
                                    >
                                        {isPending ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                {isAvailable && <ShoppingBag className="w-5 h-5 group-hover:animate-bounce" />}
                                                <span>{renderButtonText}</span>
                                            </>
                                        )}
                                    </button>
                                    <p className="text-center mt-3 text-[9px] text-stone-300 uppercase tracking-widest font-bold">
                                        Secure Verification by Shopify
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
