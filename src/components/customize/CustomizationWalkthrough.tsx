"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  Heart,
  Church,
  Trophy,
  User,
  ChevronLeft,
  ChevronRight,
  Check,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { useCart } from "../CartProvider";
import { validateKeychain } from "../../lib/validation/keychain";
import { getTierByPrice, getCharLimit } from "../../lib/camelot/tiers";
import { THREAD_COLORS, CHARM_OPTIONS } from "../../lib/camelot/registry";
import type { ColorOption, CharmOption } from "../../lib/camelot/schemas";
import type { ShopifyProduct } from "../../lib/shopify/types";
import ForgePreview from "./ForgePreview";
import BobForgeGuide, { type Occasion } from "./BobForgeGuide";

const OCCASIONS: { id: Exclude<Occasion, null>; label: string; hint: string; icon: typeof Gift }[] = [
  { id: "gift", label: "A gift", hint: "For someone you love", icon: Gift },
  { id: "memorial", label: "In memory", hint: "Honor someone dear", icon: Heart },
  { id: "wedding", label: "Wedding", hint: "Celebrate the union", icon: Church },
  { id: "sports", label: "Game day", hint: "Rep your team", icon: Trophy },
  { id: "self", label: "Just for me", hint: "Treat yourself", icon: User },
];

const STEPS = ["Occasion", "Thread", "Text", "Charms", "Review"];

interface Props {
  product: ShopifyProduct;
}

export default function CustomizationWalkthrough({ product }: Props) {
  const { addItemToCart } = useCart();

  const productPrice =
    product.priceRange?.minVariantPrice?.amount ||
    product.variants?.edges[0]?.node?.price?.amount ||
    "9.95";
  const priceNum = parseFloat(productPrice);
  const tier = getTierByPrice(priceNum);
  const isTier3 = tier === 3;
  const charLimit = getCharLimit(tier);

  const [step, setStep] = useState(0);
  const [occasion, setOccasion] = useState<Occasion>(null);
  const [color, setColor] = useState<ColorOption>(THREAD_COLORS[0]);
  const [text, setText] = useState("");
  const [charms, setCharms] = useState<CharmOption[]>([CHARM_OPTIONS[5], CHARM_OPTIONS[4]]);
  const [activeCharm, setActiveCharm] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const isSports = occasion === "sports";
  const charmPool = isSports
    ? CHARM_OPTIONS.filter((c) =>
        ["football", "basketball", "soccer", "softball", "volleyball", "tennis-balls", "bowling-pins"].includes(c.id)
      )
    : CHARM_OPTIONS;

  const canNext = (): boolean => {
    if (step === 0) return occasion !== null;
    if (step === 1) return true;
    if (step === 2) return isSports || text.trim().length > 0;
    if (step === 3) return true;
    return false;
  };

  const next = () => {
    if (step === 2 && !isSports && text.trim().length === 0) {
      setError("Give Lisa some words to weave — or tap a suggestion.");
      return;
    }
    setError(null);
    if (step < 4) setStep(step + 1);
  };

  const back = () => {
    setError(null);
    if (step > 0) setStep(step - 1);
  };

  const handleAddToCart = async () => {
    setAdding(true);
    setError(null);
    const result = validateKeychain({
      text: isSports ? "COLORONLY" : text.toUpperCase(),
      color,
      charms,
    });
    if (!result.success) {
      setError(result.error || "Please verify your customization.");
      setAdding(false);
      return;
    }
    const variants = product.variants?.edges || [];
    const matched =
      variants.find((v: { node: { title: string } }) =>
        v.node.title.toLowerCase().includes(color.name.toLowerCase())
      ) || variants[0];
    const variantId = matched?.node?.id;
    if (!variantId) {
      setError("Configuration error: variant not found.");
      setAdding(false);
      return;
    }
    try {
      await addItemToCart(variantId, 1, [
        { key: "text", value: isSports ? "No Name" : text.toUpperCase() },
        { key: "color", value: color.name },
        { key: "occasion", value: occasion ?? "unspecified" },
        {
          key: "vibe_notes",
          value: JSON.stringify({
            charms: charms.map((c) => c.name).join(", "),
            tier,
            visual: `${color.name} with ${charms.map((c) => c.icon).join(" ")}`,
            source: "Guided Walkthrough",
          }),
        },
      ]);
      setAdded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add to bag.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Step progress */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-1.5 rounded-full px-2.5 sm:px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                i === step
                  ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                  : i < step
                    ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
                    : "bg-stone-100 text-stone-400"
              }`}
            >
              {i < step ? <Check className="w-3 h-3" /> : <span>{i + 1}</span>}
              <span className="hidden sm:inline">{label}</span>
            </button>
            {i < STEPS.length - 1 && <div className="w-3 sm:w-6 h-px bg-stone-200" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
        {/* Step content */}
        <div className="min-h-[420px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              {/* STEP 0 — Occasion */}
              {step === 0 && (
                <section>
                  <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 mb-2">What brings you to the forge?</h2>
                  <p className="text-slate-500 text-sm mb-8">The occasion shapes everything Lisa weaves.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {OCCASIONS.map(({ id, label, hint, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          setOccasion(id);
                          if (id === "sports") {
                            setCharms([CHARM_OPTIONS[0], CHARM_OPTIONS[1]]);
                            setText("");
                          }
                        }}
                        className={`p-5 rounded-2xl border-2 text-left transition-all ${
                          occasion === id
                            ? "border-purple-600 bg-purple-50 shadow-md shadow-purple-100"
                            : "border-stone-200 bg-white hover:border-purple-300"
                        }`}
                      >
                        <Icon className={`w-6 h-6 mb-3 ${occasion === id ? "text-purple-600" : "text-stone-400"}`} />
                        <p className="font-bold text-slate-900 text-sm">{label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{hint}</p>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* STEP 1 — Thread */}
              {step === 1 && (
                <section>
                  <div className="flex justify-between items-baseline mb-2">
                    <h2 className="text-3xl sm:text-4xl font-serif text-slate-900">Choose your thread</h2>
                    <span className="text-xs font-black text-purple-600 uppercase tracking-widest">{color.name}</span>
                  </div>
                  <p className="text-slate-500 text-sm mb-8">The canvas Lisa weaves by hand.</p>
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-3">
                    {THREAD_COLORS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setColor(c)}
                        title={c.name}
                        className={`aspect-square rounded-full border-2 transition-all p-1 ${
                          color.id === c.id
                            ? "border-purple-600 scale-110 shadow-lg"
                            : "border-transparent hover:border-stone-300"
                        }`}
                      >
                        <div className="w-full h-full rounded-full border border-black/5" style={{ background: c.hex }} />
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* STEP 2 — Text */}
              {step === 2 && (
                <section>
                  <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 mb-2">Sequence your text</h2>
                  <p className="text-slate-500 text-sm mb-8">
                    {isSports
                      ? "Game day pieces speak through color and charms."
                      : "The words Lisa will weave bead by bead."}
                  </p>
                  {isSports ? (
                    <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100">
                      <p className="text-xs font-bold text-purple-900 uppercase tracking-widest mb-2">Sports Edition</p>
                      <p className="text-sm text-purple-700/80 leading-relaxed">
                        Team spirit lives in the colors and charms here — text stays off so the colors can shout.
                      </p>
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value.toUpperCase().slice(0, charLimit))}
                        placeholder="YOUR TEXT"
                        className="w-full text-4xl sm:text-5xl font-serif bg-transparent border-b-2 border-stone-200 py-4 focus:outline-none focus:border-purple-600 text-slate-900 placeholder:text-stone-200 tracking-tighter transition-all"
                      />
                      <p className="mt-2 text-right text-xs font-mono text-slate-400">
                        {text.length}/{charLimit}
                      </p>
                    </>
                  )}
                </section>
              )}

              {/* STEP 3 — Charms */}
              {step === 3 && (
                <section>
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-3xl sm:text-4xl font-serif text-slate-900">Define your vibe</h2>
                    <div className="flex gap-1">
                      {[0, 1].map((i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActiveCharm(i)}
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                            activeCharm === i
                              ? "bg-purple-600 text-white shadow-md"
                              : "bg-stone-100 text-slate-400 hover:bg-stone-200"
                          }`}
                        >
                          {i === 0 ? "Top" : "Bottom"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm mb-8">
                    Charms crown the piece — currently dressing the{" "}
                    <span className="font-bold text-slate-700">{activeCharm === 0 ? "top" : "bottom"}</span>.
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {charmPool.map((charm) => (
                      <button
                        key={charm.id}
                        type="button"
                        onClick={() => {
                          const next = [...charms];
                          next[activeCharm] = charm;
                          setCharms(next);
                        }}
                        className={`p-4 rounded-2xl border-2 transition-all text-center ${
                          charms[activeCharm]?.id === charm.id
                            ? "border-purple-600 bg-purple-50 shadow-md"
                            : "border-stone-100 bg-white hover:border-purple-200"
                        }`}
                      >
                        <span className="text-[11px] font-black uppercase tracking-tight text-slate-800 leading-tight">
                          {charm.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* STEP 4 — Review */}
              {step === 4 && (
                <section>
                  <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 mb-2">Behold your creation</h2>
                  <p className="text-slate-500 text-sm mb-8">One last look before Lisa takes up the thread.</p>
                  <dl className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100 mb-8">
                    {[
                      ["Occasion", occasion ? OCCASIONS.find((o) => o.id === occasion)?.label : "—"],
                      ["Thread", color.name],
                      ["Text", isSports ? "Team colors (no text)" : text.toUpperCase() || "—"],
                      ["Top charm", charms[0]?.name],
                      ["Bottom charm", charms[1]?.name],
                      ["Valuation", `$${priceNum.toFixed(2)}`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between px-5 py-3.5">
                        <dt className="text-[11px] font-black uppercase tracking-widest text-slate-400">{k}</dt>
                        <dd className="text-sm font-bold text-slate-900">{v}</dd>
                      </div>
                    ))}
                  </dl>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold text-center mb-6">
                      {error}
                    </div>
                  )}

                  {added ? (
                    <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                      <Check className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                      <p className="font-bold text-emerald-900">Added to your bag</p>
                      <p className="text-xs text-emerald-700/70 mt-1">Lisa will forge it within 24–48 hours.</p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={adding}
                      className="w-full bg-slate-900 hover:bg-purple-700 text-white py-5 rounded-2xl font-black text-[11px] tracking-[.3em] uppercase transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
                    >
                      {adding ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <ShoppingBag className="w-5 h-5" />
                          <span>Ignite Transaction — ${priceNum.toFixed(2)}</span>
                        </>
                      )}
                    </button>
                  )}
                </section>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Nav */}
          {error && step !== 4 && (
            <p className="mt-6 text-center text-xs font-bold text-red-600">{error}</p>
          )}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={back}
              disabled={step === 0}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-stone-200 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:border-purple-300 hover:text-purple-700 transition-all disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            {step < 4 && (
              <button
                type="button"
                onClick={next}
                disabled={!canNext()}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-slate-900 text-[11px] font-black uppercase tracking-widest text-white hover:bg-purple-700 transition-all disabled:opacity-30"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right rail: preview + BoB */}
        <div className="space-y-5 lg:sticky lg:top-28">
          <ForgePreview text={text || "NAME"} color={color} charms={charms} isTier3={isTier3} />
          <BobForgeGuide step={step} occasion={occasion} text={text} onSuggestion={(s) => setText(s)} />
        </div>
      </div>
    </div>
  );
}
