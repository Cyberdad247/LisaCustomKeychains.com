// 🐝 [HIVE_SWARM_STAMP] Autonomously Audited by Lukas Swarm
"use client";

import { useState, useOptimistic, useTransition, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, Loader2, Sparkles } from "lucide-react";
import { useCart } from "../CartProvider";
import { validateKeychain } from "../../lib/validation/keychain";
import SEOWrapper from "../SEOWrapper";
import VibeInput from "../VibeInput";
import { Sheet, SheetContent, SheetTitle } from "../ui/sheet";

interface KeychainCustomizerProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

const THREAD_COLORS = [
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
}: KeychainCustomizerProps) {
  const productPrice =
    product.priceRange?.minVariantPrice?.amount ||
    product.variants?.edges[0]?.node?.price?.amount ||
    "9.95";
  const priceNum = parseFloat(productPrice);

  const isTier1 = priceNum <= 3.0; // Only color changes
  const isTier2 = priceNum > 3.0 && priceNum <= 7.0; // Color + 1 strand
  const isTier3 = priceNum > 7.0; // Color + 2 strands

  const getCharmInfo = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("tennis"))
      return {
        id: "tennis",
        name: "Tennis Ball",
        icon: "🎾",
        color: THREAD_COLORS.find((c) => c.id === "green"),
      };
    if (t.includes("baseball"))
      return {
        id: "baseball",
        name: "Baseball",
        icon: "⚾",
        color: THREAD_COLORS.find((c) => c.id === "white"),
      };
    if (t.includes("football"))
      return {
        id: "football",
        name: "Football",
        icon: "🏈",
        color: THREAD_COLORS.find((c) => c.id === "brown"),
      };
    if (t.includes("soccer"))
      return {
        id: "soccer",
        name: "Soccer Ball",
        icon: "⚽",
        color: THREAD_COLORS.find((c) => c.id === "white"),
      };
    if (t.includes("volleyball"))
      return {
        id: "volleyball",
        name: "Volleyball",
        icon: "🏐",
        color: THREAD_COLORS.find((c) => c.id === "blue"),
      };
    if (t.includes("softball"))
      return {
        id: "softball",
        name: "Softball",
        icon: "🥎",
        color: THREAD_COLORS.find((c) => c.id === "yellow"),
      };
    return { id: "heart", name: "Heart", icon: "❤️", color: THREAD_COLORS[0] };
  };

  const initialCharm = getCharmInfo(product.title || "");

  const [text, setText] = useState(
    isTier1 ? "" : product.title?.split(" ")[0]?.toUpperCase() || "NAME"
  );
  const [selectedColor, setSelectedColor] = useState(
    initialCharm.color || THREAD_COLORS[0]
  );
  const [selectedCharm, setSelectedCharm] = useState(initialCharm);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [suggestedIcons, setSuggestedIcons] = useState<any[]>([]);
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
      window.history.pushState(
        { drawerOpen: true },
        "",
        window.location.pathname + "?customize=true"
      );

      // ✨ Populate starter charms
      setSuggestedIcons([
        { id: "heart", name: "Heart", icon: "❤️" },
        { id: "star", name: "Star", icon: "⭐" },
        { id: "sparkles", name: "Sparkles", icon: "✨" },
        { id: "coffee", name: "Coffee", icon: "☕" },
        { id: "cat", name: "Kitty", icon: "🐱" },
        { id: "dog", name: "Puppy", icon: "🐶" },
      ]);
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
      charm: selectedCharm,
    });

    if (!validationResult.success) {
      // Defensive error handling - error is already a string from validateKeychain
      alert(validationResult.error || "Validation failed");
      return;
    }

    // Custom tier validation logic (redundant safeguard)
    if (!isTier1) {
      const limit = isTier3 ? 16 : 8;
      if (inputText.length > limit) {
        alert(`Maximum ${limit} characters for this product.`);
        return;
      }
    }

    const variants = product.variants?.edges || [];
    const matchedVariant =
      variants.find((v: any) =>
        v.node.title.toLowerCase().includes(selectedColor.name.toLowerCase())
      ) || variants[0];

    const currentVariantId = matchedVariant?.node?.id;

    if (!currentVariantId) {
      console.error("Variant ID missing");
      return;
    }

    try {
      await addItemToCart(currentVariantId, 1, [
        {
          key: "Custom Name",
          value: isTier1 ? "No Name" : inputText.toUpperCase(),
        },
        { key: "Color", value: selectedColor.name },
        { key: "Vibe", value: selectedCharm.name },
        { key: "_Vibe_Icon", value: selectedCharm.icon },
        {
          key: "Style",
          value: isTier3 ? "Premium Dual Strand" : "Single Strand",
        },
        {
          key: "vibe_notes",
          value: JSON.stringify({
            vibe_text: inputText.toLowerCase(), // Store raw vibe intent
            icon_id: selectedCharm.id, // Store specific icon ID
          }),
        },
        {
          key: "_Visual_Verification",
          value: `${selectedColor.name} with ${selectedCharm.icon}`,
        },
      ]);
      onClose(); // Close drawer on success
    } catch (e) {
      alert("Failed to add to bag.");
    }
  };

  // For Tier 3, split text into two strands (8 chars each max)
  const strand1 = isTier3 ? optimisticText.slice(0, 8) : optimisticText;
  const strand2 = isTier3 ? optimisticText.slice(8, 16) : "";

  return (
    <>
      <SEOWrapper product={product} />
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full sm:max-w-xl md:max-w-2xl p-0 gap-0 overflow-hidden bg-white border-l border-white/20 shadow-2xl flex flex-col">
          <SheetTitle className="sr-only">Customize {product.title}</SheetTitle>

          {/* Custom Header / Close */}
          {/* We can rely on standard SheetClose, but preserving the aesthetic */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-50 pointer-events-none">
            <div className="pointer-events-auto">
              {/* Optional interactive elements */}
            </div>
            {/* Visual Close Button for styling consistency */}
            <button
              onClick={onClose}
              aria-label="Close customizer"
              className="p-2 bg-white/80 backdrop-blur rounded-full text-slate-800 hover:bg-white shadow-lg pointer-events-auto transition-transform hover:rotate-90 md:mr-6 mt-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Split Layout: Visual (Top) + Controls (Bottom) */}
          <div className="flex flex-col h-full w-full">
            {/* TOP: Visual Forge (Crochet Texture) */}
            <div className="relative h-[45vh] flex-shrink-0 crochet-yarn-light flex items-center justify-center p-8 border-b-4 border-stone-100">
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

              <div className="flex gap-4 items-center scale-90 md:scale-100 transition-transform">
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
                  <div
                    className="w-20 h-[420px] rounded-b-3xl shadow-xl flex flex-col items-center gap-1 pt-6 pb-2 overflow-hidden border-x-4 bg-stone-50"
                    style={{
                      background: (selectedColor as any).isRainbow
                        ? selectedColor.hex
                        : selectedColor.hex,
                      borderColor: "rgba(0,0,0,0.1)",
                    }}
                  >
                    <div className="w-8 h-8 bg-white text-rose-500 flex items-center justify-center font-bold rounded-sm mb-2 shadow-md flex-shrink-0 text-sm">
                      {selectedCharm.icon}
                    </div>

                    <AnimatePresence mode="popLayout">
                      {strand1.split("").map((char: string, i: number) => (
                        <motion.div
                          key={`s1-${i}-${char}`}
                          initial={{ opacity: 0, scale: 0.5, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          className="w-8 h-8 bg-white text-slate-900 flex items-center justify-center font-black rounded-sm text-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-1"
                          style={{ rotate: `${(i % 2 === 0 ? 1 : -1) * 2}deg` }}
                        >
                          {char.toUpperCase()}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    <div className="w-8 h-8 bg-white text-rose-500 flex items-center justify-center font-bold rounded-sm mt-auto mb-4 shadow-md flex-shrink-0 text-sm">
                      {selectedCharm.icon}
                    </div>
                  </div>
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
                    <div
                      className="w-20 h-[420px] rounded-b-3xl shadow-xl flex flex-col items-center gap-1 pt-6 pb-2 overflow-hidden border-x-4 bg-stone-50"
                      style={{
                        background: (selectedColor as any).isRainbow
                          ? selectedColor.hex
                          : selectedColor.hex,
                        borderColor: "rgba(0,0,0,0.1)",
                      }}
                    >
                      <div className="w-8 h-8 bg-white text-rose-500 flex items-center justify-center font-bold rounded-sm mb-2 shadow-md flex-shrink-0 text-sm">
                        {selectedCharm.icon}
                      </div>

                      <AnimatePresence mode="popLayout">
                        {strand2.split("").map((char: string, i: number) => (
                          <motion.div
                            key={`s2-${i}-${char}`}
                            initial={{ opacity: 0, scale: 0.5, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="w-8 h-8 bg-white text-slate-900 flex items-center justify-center font-black rounded-sm text-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-1"
                            style={{
                              rotate: `${(i % 2 === 0 ? -1 : 1) * 2}deg`,
                            }}
                          >
                            {char.toUpperCase()}
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      <div className="w-8 h-8 bg-white text-rose-500 flex items-center justify-center font-bold rounded-sm mt-auto mb-4 shadow-md flex-shrink-0 text-sm">
                        {selectedCharm.icon}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* BOTTOM: Scrollable Controls */}
            <div className="flex-1 overflow-y-auto p-8 bg-white">
              <div className="max-w-md mx-auto pb-24">
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
                      {THREAD_COLORS.map((color) => (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          title={color.name}
                          className={`w-9 h-9 rounded-full border-2 transition-all duration-300 p-0.5 ${
                            selectedColor.id === color.id
                              ? "border-purple-600 scale-110 shadow-lg ring-2 ring-purple-100"
                              : "border-transparent hover:border-stone-200 hover:scale-105"
                          }`}
                        >
                          <div
                            className="w-full h-full rounded-full border border-black/5 shadow-inner"
                            style={{
                              background: (color as any).isRainbow
                                ? "linear-gradient(135deg, #ff0000 0%, #00ff00 50%, #0000ff 100%)"
                                : color.hex,
                            }}
                          ></div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Input Section */}
                  {!isTier1 && (
                    <div className="space-y-6 pt-4 border-t border-stone-100">
                      {/* AI Vibe Assistant */}
                      <VibeInput
                        onVibeChange={(data) => {
                          if (data.icon) {
                            const newCharm = {
                              id: data.label.toLowerCase(),
                              name: data.label,
                              icon: data.icon,
                              color: selectedColor,
                            };
                            setSelectedCharm(newCharm);
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
                                  setSelectedCharm(charm);
                                }}
                                className={`flex flex-col items-center gap-1 p-2 bg-stone-50 border rounded-lg transition-colors text-xs text-slate-600 group ${
                                  selectedCharm.icon === charm.icon
                                    ? "border-purple-600 bg-purple-50"
                                    : "border-stone-100 hover:border-purple-200 hover:bg-purple-50"
                                }`}
                              >
                                <div className="w-6 h-6 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                  {charm.icon}
                                </div>
                                <span className="font-bold text-[9px] uppercase">
                                  {charm.name}
                                </span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Manual Text Input */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <label className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">
                            {isTier3
                              ? "Dual Circuit (Max 16)"
                              : "Identifier (Max 8)"}
                          </label>
                          <span
                            className={`text-[10px] font-bold font-mono ${
                              text.length > (isTier3 ? 16 : 8)
                                ? "text-red-500"
                                : "text-slate-300"
                            }`}
                          >
                            {text.length}/{isTier3 ? 16 : 8}
                          </span>
                        </div>
                        <input
                          name="text"
                          type="text"
                          value={text}
                          onChange={(e) => {
                            const limit = isTier3 ? 16 : 8;
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
                    </div>
                  )}

                  {isTier1 && (
                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-blue-900/60 text-xs leading-relaxed">
                      ℹ️ Note: This basic tier allows for color selection only.
                      Upgrade to our Premium tiers to enable custom text
                      serialization.
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

                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[11px] tracking-[0.25em] uppercase hover:bg-purple-700 transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                      {isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <ShoppingBag className="w-5 h-5 group-hover:animate-bounce" />
                          <span>Process Transaction</span>
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
