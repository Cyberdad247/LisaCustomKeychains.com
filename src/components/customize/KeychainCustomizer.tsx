// 🐝 [HIVE_SWARM_STAMP] Autonomously Audited by Lukas Swarm
"use client";

import { useState, useOptimistic, useTransition, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, Loader2, Sparkles, Check } from "lucide-react";
import { useCart } from "../CartProvider";
import { validateKeychain } from "../../lib/validation/keychain";
import {
  getTierByPrice,
  getCharLimit,
  getTierDescription,
} from "../../lib/camelot/tiers";
import SEOWrapper from "../SEOWrapper";
import VibeInput from "../VibeInput";
import { Sheet, SheetContent, SheetTitle } from "../ui/sheet";
import { type ShopifyProduct } from "../../lib/shopify/types";
import { THREAD_COLORS as REGISTRY_COLORS, CHARM_OPTIONS } from "../../lib/camelot/registry";
import { type CharmOption } from "../../lib/camelot/schemas";

interface KeychainCustomizerProps {
  product: ShopifyProduct;
  isOpen: boolean;
  onClose: () => void;
  lockLetters?: boolean;
  forceLetters?: boolean;
  charmCategory?: string;
  allowedColors?: string[];
}

interface ThreadColor {
  id: string;
  name: string;
  hex: string;
  isRainbow?: boolean;
}

type Charm = CharmOption;

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

export default function KeychainCustomizer({
  product,
  isOpen,
  onClose,
  lockLetters = false,
  forceLetters = false,
  charmCategory = "all",
  allowedColors,
}: KeychainCustomizerProps) {
  const productPrice =
    product.priceRange?.minVariantPrice?.amount ||
    product.variants?.edges[0]?.node?.price?.amount ||
    "9.95";
  const isEarring = product.productType?.toLowerCase().includes("earring") || product.title?.toLowerCase().includes("earring") || product.title?.toLowerCase().includes("dangle");
  const priceNum = parseFloat(productPrice);

  const tier = getTierByPrice(priceNum);
  const effectiveTier = forceLetters && tier === 1 && !lockLetters ? 2 : tier;
  const isTier1 = (effectiveTier === 1) || lockLetters;
  const isTier2 = effectiveTier === 2 && !lockLetters;
  const isTier3 = effectiveTier === 3 && !lockLetters;

  const filteredColors = allowedColors 
    ? THREAD_COLORS.filter(c => allowedColors.includes(c.id))
    : THREAD_COLORS;

  const getCharmFromTitle = (title: string): Charm => {
    const t = title.toLowerCase();
    const availableCharms = charmCategory === "sports" 
      ? CHARM_OPTIONS.filter(c => ["football", "basketball", "soccer", "softball", "volleyball", "tennis-balls", "bowling-pins"].includes(c.id))
      : CHARM_OPTIONS;
    
    const match = availableCharms.find((c) => t.includes(c.id.replace("-", " ")) || t.includes(c.name.toLowerCase()));
    return match || availableCharms[0];
  };

  const initialCharm = getCharmFromTitle(product.title || "");

  const [text, setText] = useState(
    isTier1 || isEarring ? "" : product.title?.split(" ")[0]?.toUpperCase() || "NAME"
  );
  const [selectedColor, setSelectedColor] = useState(filteredColors[0] || THREAD_COLORS[0]);
  const [selectedCharms, setSelectedCharms] = useState<Charm[]>([initialCharm]);
  const [activeCharmIndex, setActiveCharmIndex] = useState(0);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [suggestedIcons, setSuggestedIcons] = useState<Charm[]>([]);
  const [isPending, startTransition] = useTransition();
  const { addItemToCart } = useCart();

  const variantId = product.variants?.edges[0]?.node?.id;
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
        window.location.pathname + "?customize=true"
      );

      // ✨ Populate starter charms from curated text registry
      const charms = charmCategory === "sports"
        ? CHARM_OPTIONS.filter(c => ["football", "basketball", "soccer", "softball", "volleyball", "tennis-balls", "bowling-pins"].includes(c.id))
        : CHARM_OPTIONS;
      
      setSuggestedIcons(charms);
    } else {
      // Clean up URL if closed naturally
      if (window.location.search.includes("customize=true")) {
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
    const validationResult = validateKeychain({
      text: isTier1 ? "COLORONLY" : inputText.toUpperCase(),
      color: selectedColor,
      charms: selectedCharms,
    });

    if (!validationResult.success) {
      setErrorMessage(validationResult.error || "Please verify your customization.");
      return;
    }

    // Custom tier validation logic (redundant safeguard)
    if (!isTier1) {
      const limit = getCharLimit(effectiveTier);
      if (inputText.length > limit) {
        setErrorMessage(`Maximum ${limit} characters for this product.`);
        return;
      }
    }

    const variants = product.variants?.edges || [];
    const matchedVariant =
      variants.find((v: { node: { title: string } }) =>
        v.node.title.toLowerCase().includes(selectedColor.name.toLowerCase())
      ) || variants[0];

    const currentVariantId = matchedVariant?.node?.id;
    const isAvailable = matchedVariant?.node?.availableForSale;
    const qty = matchedVariant?.node?.quantityAvailable || 0;

    // Logic: 
    // If !available -> Sold Out (Blocked)
    // If available AND qty <= 0 -> Made to Order (Allowed)
    // If available AND qty > 0 -> In Stock (Allowed)

    let buttonText = "Process Transaction";
    let isDisabled = isPending;

    if (!matchedVariant) {
      buttonText = "Unavailable";
      isDisabled = true;
    } else if (!isAvailable) {
      buttonText = "Sold Out";
      isDisabled = true;
    } else if (qty <= 0) {
      buttonText = "Order (Made to Order)";
    }

    if (!currentVariantId) {
      console.error("Variant ID missing");
      setErrorMessage("Configuration error: Variant not found.");
      return;
    }

    try {
      if (!isAvailable) {
        setErrorMessage("This combination is currently sold out.");
        return;
      }

      setErrorMessage(null); // Clear errors
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
            tier: effectiveTier,
            style: isTier3 ? "Premium Dual Strand" : "Single Strand",
            visual: `${selectedColor.name} with ${selectedCharms.map(c => c.icon).join(" ")}`,
          }),
        },
      ]);
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
  const qty = matchedVariant?.node?.quantityAvailable ?? 0; // Default to 0 if undefined

  let renderButtonText = isPending ? "" : "Process Transaction";
  if (!isPending) {
    if (!matchedVariant) renderButtonText = "Unavailable";
    else if (!isAvailable) renderButtonText = "Sold Out";
    else if (qty <= 0) renderButtonText = "Order (Made to Order)";
  }


  // For Tier 3, split text into two strands (8 chars each max)
  const strand1 = isTier3 ? optimisticText.slice(0, 8) : optimisticText;
  const strand2 = isTier3 ? optimisticText.slice(8, 16) : "";

  return (
    <>
      <SEOWrapper product={product} />
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full md:max-w-[90vw] lg:max-w-6xl p-0 gap-0 overflow-hidden bg-white border-l border-white/20 shadow-2xl flex flex-col">
          <SheetTitle className="sr-only">Customize {product.title}</SheetTitle>

          {/* Custom Header / Close */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-50 pointer-events-none">
            <div className="pointer-events-auto">
              {/* Optional interactive elements */}
            </div>
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

              {/* Centered Preview Content */}
              <div className="flex gap-4 items-center scale-90 md:scale-125 transition-transform h-full justify-center">
                {/* Strand 1 */}
                <motion.div
                  className="relative flex flex-col items-center"
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <motion.div
                    className={`w-20 h-[420px] rounded-b-3xl shadow-xl flex flex-col items-center gap-1 pt-6 pb-2 overflow-hidden border-x-4 border-black/10 bg-stone-50 ${selectedColor.isRainbow
                      ? "bg-rainbow"
                      : "yarn-hex-bg"
                      }`}
                    animate={{ "--yarn-color": selectedColor.hex } as any}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selectedCharms[0]?.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="w-16 min-h-6 bg-white text-slate-900 flex items-center justify-center font-black rounded-sm mb-2 shadow-md flex-shrink-0 text-[6px] tracking-tight leading-none px-0.5 py-1 text-center"
                      >
                        {selectedCharms[0]?.icon}
                      </motion.div>
                    </AnimatePresence>

                    <AnimatePresence mode="popLayout">
                      {strand1.split("").map((char: string, i: number) => (
                        <motion.div
                          key={`s1-${i}-${char}`}
                          initial={{ opacity: 0, scale: 0.5, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          className={`w-8 h-8 bg-white text-slate-900 flex items-center justify-center font-black rounded-sm text-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-1 ${i % 2 === 0 ? "rotate-2" : "-rotate-2"
                            }`}
                        >
                          {char.toUpperCase()}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`bottom-${selectedCharms[0]?.id}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="w-16 min-h-6 bg-white text-slate-900 flex items-center justify-center font-black rounded-sm mt-auto mb-4 shadow-md flex-shrink-0 text-[6px] tracking-tight leading-none px-0.5 py-1 text-center"
                      >
                        {selectedCharms[0]?.icon}
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                </motion.div>

                {/* Strand 2 (Tier 3 Only) */}
                {isTier3 && (
                  <motion.div
                    className="relative flex flex-col items-center"
                    animate={{ y: [-4, 0, -4] }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                  >
                    <motion.div
                      className={`w-20 h-[420px] rounded-b-3xl shadow-xl flex flex-col items-center gap-1 pt-6 pb-2 overflow-hidden border-x-4 border-black/10 bg-stone-50 ${selectedColor.isRainbow
                        ? "bg-rainbow"
                        : "yarn-hex-bg"
                        }`}
                      animate={{ "--yarn-color": selectedColor.hex } as any}
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`s2-top-${selectedCharms[0]?.id}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="w-16 min-h-6 bg-white text-slate-900 flex items-center justify-center font-black rounded-sm mb-2 shadow-md flex-shrink-0 text-[6px] tracking-tight leading-none px-0.5 py-1 text-center"
                        >
                          {selectedCharms[0]?.icon}
                        </motion.div>
                      </AnimatePresence>

                      <AnimatePresence mode="popLayout">
                        {strand2.split("").map((char: string, i: number) => (
                          <motion.div
                            key={`s2-${i}-${char}`}
                            initial={{ opacity: 0, scale: 0.5, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className={`w-8 h-8 bg-white text-slate-900 flex items-center justify-center font-black rounded-sm text-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-1 ${i % 2 === 0 ? "-rotate-2" : "rotate-2"
                              }`}
                          >
                            {char.toUpperCase()}
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      <div className="flex gap-1 mt-auto mb-4">
                        {selectedCharms.map((charm, idx) => (
                          <motion.div
                            key={idx}
                            layoutId={`preview-charm-${idx}`}
                            className="w-16 min-h-6 bg-white text-slate-900 flex items-center justify-center font-black rounded-sm shadow-md flex-shrink-0 text-[5px] tracking-tight leading-none px-0.5 py-1 text-center"
                          >
                            {charm.icon}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* RIGHT: Controls - Takes 5/12 cols on Desktop */}
            <div className="flex-1 md:col-span-5 overflow-y-auto p-8 bg-white h-full relative">
              <div className="max-w-md mx-auto pb-24 md:pt-12">
                <div className="mb-8">
                  <h2 className="text-3xl font-serif text-slate-900 mb-1">
                    {product.title}
                  </h2>
                  <p className="text-purple-600/80 text-[10px] tracking-[0.2em] uppercase font-black">
                    {isTier1
                      ? "Basic Collection: Color Only"
                      : isTier3
                        ? "Premium Dual-Core Bundle"
                        : "Classic Signature Collection"}
                  </p>
                </div>

                <form action={handleAddToCartAction} className="space-y-8">
                  {/* Yarn Palette */}
                  <div className="space-y-4">
                    <label className="flex items-center justify-between text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">
                      <span>Signature Yarn</span>
                      <span className="text-purple-600">
                        {selectedColor.name}
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {filteredColors.map((color) => (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          title={color.name}
                          aria-label={`Select ${color.name} color`}
                          className={`w-9 h-9 rounded-full border-2 transition-all duration-300 p-0.5 ${selectedColor.id === color.id
                            ? "border-purple-600 scale-110 shadow-lg ring-2 ring-purple-100"
                            : "border-transparent hover:border-stone-200 hover:scale-105"
                            }`}
                        >
                          <motion.div
                            className={`w-full h-full rounded-full border border-black/5 shadow-inner flex items-center justify-center ${color.isRainbow
                              ? "bg-rainbow"
                              : "yarn-hex-bg"
                              }`}
                            animate={{ "--yarn-color": color.hex } as any}
                          >
                            {selectedColor.id === color.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                              >
                                <Check
                                  className={`w-4 h-4 ${color.id === 'white' || color.id === 'lavender' || color.id === 'peach'
                                    ? 'text-slate-900'
                                    : 'text-white'
                                    }`}
                                />
                              </motion.div>
                            )}
                          </motion.div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Input Section */}
                  {!isEarring && (
                    <div className="space-y-6 pt-4 border-t border-stone-100">
                      {/* AI Vibe Assistant */}
                      {!lockLetters && (
                        <VibeInput
                          onVibeChange={(data) => {
                            if (data.icon) {
                              const newCharm = {
                                id: data.label.toLowerCase(),
                                name: data.label,
                                icon: data.icon,
                                color: selectedColor,
                              };

                              setSelectedCharms(prev => {
                                const next = [...prev];
                                next[activeCharmIndex] = newCharm;
                                return next;
                              });

                              // Add to suggestions if not already there
                              setSuggestedIcons((prev) => {
                                const exists = prev.find(
                                  (p) => p.icon === data.icon
                                );
                                if (exists) return prev;
                                return [newCharm, ...prev.slice(0, 5)];
                              });
                            }
                          }}
                        />
                      )}

                      {/* Multi-Charm Selector Tabs Removed (Keychain is Single Active Strand for now) */}

                      <AnimatePresence>
                        {suggestedIcons.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="grid grid-cols-3 gap-2 overflow-hidden"
                          >
                            {suggestedIcons.map((charm, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setSelectedCharms(prev => {
                                    const next = [...prev];
                                    next[activeCharmIndex] = charm;
                                    return next;
                                  });
                                }}
                                className={`flex flex-col items-center justify-center gap-0.5 p-2 bg-stone-50 border rounded-lg transition-colors group ${selectedCharms[activeCharmIndex]?.id === charm.id
                                  ? "border-purple-600 bg-purple-50"
                                  : "border-stone-100 hover:border-purple-200 hover:bg-purple-50"
                                  }`}
                              >
                                <span className="font-black text-[10px] uppercase tracking-tight text-slate-800 group-hover:text-purple-700 transition-colors text-center leading-tight">
                                  {charm.name}
                                </span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Manual Text Input */}
                      {!lockLetters && !isTier1 && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-end">
                            <label className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">
                              {isTier3
                                ? "Dual Circuit (Max 16)"
                                : "Identifier (Max 8)"}
                            </label>
                            <span
                              className={`text-[10px] font-bold font-mono ${text.length > getCharLimit(effectiveTier)
                                ? "text-red-500"
                                : "text-slate-300"
                                }`}
                            >
                              {text.length}/{getCharLimit(effectiveTier)}
                            </span>
                          </div>
                          <input
                            name="text"
                            type="text"
                            value={text}
                            onChange={(e) => {
                              const limit = getCharLimit(effectiveTier);
                              const val = e.target.value
                                .toUpperCase()
                                .slice(0, limit);
                              setText(val);
                              startTransition(() => {
                                setOptimisticText(val);
                              });
                            }}
                            className="w-full text-4xl font-serif border-b-2 border-stone-100 py-2 focus:outline-none focus:border-purple-600 bg-transparent text-slate-900 placeholder:text-stone-200 uppercase tracking-widest focus:placeholder:text-stone-100 transition-colors"
                            placeholder="YOURTEXT"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {isTier1 && !lockLetters && (
                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-blue-900/60 text-xs leading-relaxed">
                      ℹ️ Note: This basic tier allows for color selection only.
                      Upgrade to our Premium tiers to enable custom text
                      serialization.
                    </div>
                  )}

                  {lockLetters && (
                    <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 text-purple-900/60 text-xs leading-relaxed">
                      🏆 Sports Edition: This customizer is locked to Sports Charms only. Choose your team colors and favorite sport!
                    </div>
                  )}

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
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
