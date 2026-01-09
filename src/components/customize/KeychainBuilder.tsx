// 🐝 [HIVE_SWARM_STAMP] Autonomously Audited by Lukas Swarm
"use client";

import { useState, useOptimistic, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Loader2, Sparkles } from "lucide-react";
import { useCart } from "../CartProvider";
import { validateKeychain } from "../../lib/validation/keychain";
import {
  getTierByPrice,
  getCharLimit,
  getTierDescription,
} from "../../lib/camelot/tiers";

interface KeychainBuilderProps {
  product?: any;
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

export default function KeychainBuilder({ product }: KeychainBuilderProps) {
  const productPrice =
    product?.priceRange?.minVariantPrice?.amount ||
    product?.variants?.edges[0]?.node?.price?.amount ||
    "9.95";
  const priceNum = parseFloat(productPrice);

  const tier = getTierByPrice(priceNum);
  const isTier1 = tier === 1;
  const isTier2 = tier === 2;
  const isTier3 = tier === 3;

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

  const charmInfo = getCharmInfo(product?.title || "");

  const [text, setText] = useState(
    isTier1 ? "" : product?.title?.split(" ")[0]?.toUpperCase() || "NAME"
  );
  const [selectedColor, setSelectedColor] = useState(
    charmInfo.color || THREAD_COLORS[0]
  );
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isPending, startTransition] = useTransition();
  const { addItemToCart } = useCart();

  const baseVariantId = product?.variants?.edges[0]?.node?.id;
  const [optimisticText, setOptimisticText] = useOptimistic(text);

  const handleAddToCartAction = async (formData: FormData) => {
    if (!baseVariantId) return;
    const inputText = (formData.get("text") as string) || text;

    if (!isTier1) {
      const limit = getCharLimit(tier);
      if (inputText.length > limit) {
        alert(`Maximum ${limit} characters allowed.`);
        return;
      }
    }

    const variants = product?.variants?.edges || [];
    const matchedVariant =
      variants.find((v: any) =>
        v.node.title.toLowerCase().includes(selectedColor.name.toLowerCase())
      ) || variants[0];

    const currentVariantId = matchedVariant?.node?.id || baseVariantId;

    try {
      await addItemToCart(currentVariantId, 1, [
        {
          key: "text",
          value: isTier1 ? "No Name" : inputText.toUpperCase(),
        },
        { key: "color", value: selectedColor.name },
        {
          key: "vibe_notes",
          value: JSON.stringify({
            charm: charmInfo.name,
            icon: charmInfo.icon,
            style: isTier3 ? "Premium Dual Strand" : "Single Strand",
            visual: `${selectedColor.name} with ${charmInfo.icon}`,
          }),
        },
      ]);
    } catch (e) {
      alert("Failed to add to bag.");
    }
  };

  const handleAiSynthesis = async () => {
    if (!aiPrompt) return;
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/design-ai", {
        method: "POST",
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const design = await res.json();
      setText(design.text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // For Tier 3, split text into two strands (8 chars each max)
  const strand1 = isTier3 ? optimisticText.slice(0, 8) : optimisticText;
  const strand2 = isTier3 ? optimisticText.slice(8, 16) : "";

  return (
    <div className="grid md:grid-cols-2 gap-12 items-start max-w-7xl mx-auto p-4 md:p-12 bg-white rounded-[3rem] border border-stone-100 shadow-2xl mb-24">
      {/* LEFT: THE VISUAL FORGE */}
      <div className="relative aspect-square md:h-[700px] crochet-yarn-light rounded-3xl flex items-center justify-center p-12 overflow-hidden bg-stone-50 border border-stone-100">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-purple-500/10"></div>

        <div className="absolute top-8 left-8 flex items-center gap-2 px-4 py-1.5 bg-white/90 backdrop-blur-md border border-stone-100 rounded-full shadow-lg z-10">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_red]" />
          <span className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase">
            Live Preview
          </span>
        </div>

        <div className="flex gap-12 items-center">
          {/* Strand 1 */}
          <motion.div
            className="relative flex flex-col items-center"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div
              className={`w-24 h-[400px] rounded-b-3xl shadow-2xl flex flex-col items-center gap-1.5 pt-8 overflow-hidden border-x-4 border-black/10 ${
                (selectedColor as any).isRainbow ? "bg-rainbow" : "yarn-hex-bg"
              }`}
              animate={{ "--yarn-color": selectedColor.hex } as any}
            >
              <div className="w-12 h-12 bg-white text-rose-500 flex items-center justify-center font-bold rounded-sm mb-4 shadow-md transform rotate-6 text-2xl">
                {charmInfo.icon}
              </div>

              <AnimatePresence mode="popLayout">
                {strand1.split("").map((char: string, i: number) => (
                  <motion.div
                    key={`b1-${i}-${char}`}
                    initial={{ opacity: 0, scale: 0.5, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={`w-12 h-12 bg-white text-slate-900 flex items-center justify-center font-black rounded-sm text-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-1.5 ${
                      i % 2 === 0 ? "rotate-2" : "-rotate-2"
                    }`}
                  >
                    {char.toUpperCase()}
                  </motion.div>
                ))}
              </AnimatePresence>

              <div className="w-12 h-12 bg-white text-rose-500 flex items-center justify-center font-bold rounded-sm mt-auto mb-8 shadow-md transform -rotate-3 text-2xl">
                {charmInfo.icon}
              </div>
            </motion.div>
          </motion.div>

          {/* Strand 2 (Tier 3 Only) */}
          {isTier3 && (
            <motion.div
              className="relative flex flex-col items-center"
              animate={{ y: [-20, 0, -20] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.div
                className={`w-24 h-[400px] rounded-b-3xl shadow-2xl flex flex-col items-center gap-1.5 pt-8 relative overflow-hidden border-x-4 border-black/10 ${
                  (selectedColor as any).isRainbow
                    ? "bg-rainbow"
                    : "yarn-hex-bg"
                }`}
                animate={{ "--yarn-color": selectedColor.hex } as any}
              >
                <div className="w-12 h-12 bg-white text-rose-500 flex items-center justify-center font-bold rounded-sm mb-4 shadow-md transform rotate-6 text-2xl">
                  {charmInfo.icon}
                </div>

                <AnimatePresence mode="popLayout">
                  {strand2.split("").map((char: string, i: number) => (
                    <motion.div
                      key={`b2-${i}-${char}`}
                      initial={{ opacity: 0, scale: 0.5, y: -20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className={`w-12 h-12 bg-white text-slate-900 flex items-center justify-center font-black rounded-sm text-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-1.5 ${
                        i % 2 === 0 ? "-rotate-2" : "rotate-2"
                      }`}
                    >
                      {char.toUpperCase()}
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div className="w-12 h-12 bg-white text-rose-500 flex items-center justify-center font-bold rounded-sm mt-auto mb-8 shadow-md transform -rotate-3 text-2xl">
                  {charmInfo.icon}
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      {/* RIGHT: THE INTERFACE */}
      <div className="space-y-12 py-8">
        <div>
          <h2 className="text-6xl font-serif text-slate-900 mb-4 tracking-tighter italic">
            Forge Your Identity
          </h2>
          <p className="text-slate-500 text-lg font-light leading-relaxed">
            {isTier1
              ? "Exquisite colors, hand-woven just for you."
              : "Every knot tells a story. Every bead defines a legacy."}
          </p>
        </div>

        <form action={handleAddToCartAction} className="space-y-10">
          {/* Color Selection */}
          <div className="space-y-4">
            <label className="text-[11px] font-bold text-slate-400 tracking-[0.4em] uppercase">
              I. Essence (Yarn Color)
            </label>
            <div className="flex flex-wrap gap-4 max-w-sm">
              {THREAD_COLORS.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  title={color.name}
                  aria-label={`Select ${color.name} color`}
                  className={`w-10 h-10 rounded-full border-2 transition-all p-1 ${
                    selectedColor.id === color.id
                      ? "border-purple-600 scale-110 shadow-lg"
                      : "border-transparent hover:border-stone-200"
                  }`}
                >
                  <motion.div
                    className={`w-full h-full rounded-full border border-black/5 ${
                      (color as any).isRainbow ? "bg-rainbow" : "yarn-hex-bg"
                    }`}
                    animate={{ "--yarn-color": color.hex } as any}
                  ></motion.div>
                </button>
              ))}
            </div>
          </div>

          {/* AI ASSIST & Text Input */}
          {!isTier1 && (
            <>
              <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100 flex gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <input
                  type="text"
                  placeholder="Vibe request (e.g. 'FAITH')"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="flex-1 bg-transparent border-b border-purple-200 focus:outline-none focus:border-purple-600 text-slate-700 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={handleAiSynthesis}
                  disabled={isAiLoading}
                  title="Generate Design with AI"
                  aria-label="Generate Design with AI"
                  className="p-3 bg-white text-purple-600 rounded-xl hover:scale-110 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                >
                  {isAiLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Sparkles className="w-6 h-6" />
                  )}
                </button>
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">
                  {isTier3
                    ? "Dual Strand Text (Max 16)"
                    : "Custom Name (Max 8)"}
                </label>
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
                  placeholder="IDENTIFIER"
                  className="w-full text-6xl font-serif border-b-2 border-stone-100 py-4 focus:outline-none focus:border-purple-600 bg-transparent text-slate-900 transition-all placeholder:text-stone-200 uppercase tracking-[0.1em]"
                />
              </div>
            </>
          )}

          {isTier1 && (
            <div className="p-8 bg-stone-50 rounded-[2rem] border border-stone-100">
              <p className="text-slate-500 text-sm italic leading-relaxed">
                Custom name beads are reserved for our Classic ($5.95) and
                Premium ($9.95) collections. Upgrade to these tiers to add
                personalized identifiers and additional strands.
              </p>
            </div>
          )}

          <div className="pt-12 border-t border-stone-100 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-[0.3em] mb-1">
                Total Tribute
              </span>
              <span className="text-6xl font-serif text-slate-900">
                ${parseFloat(productPrice).toFixed(2)}
              </span>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="group relative px-16 py-6 bg-slate-900 text-white font-black tracking-[0.2em] uppercase rounded-2xl overflow-hidden transition-all hover:bg-purple-700 active:scale-95 shadow-[0_20px_40px_rgba(0,0,0,0.1)]"
            >
              <div className="relative z-10 flex items-center gap-3">
                {isPending ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <ShoppingBag className="w-6 h-6" />
                    Finalize Forge
                  </>
                )}
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
