// 🐝 [HIVE_SWARM_STAMP] Autonomously Audited by Lukas Swarm
"use client";

import { useCart } from "./CartProvider";
import {
  X,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Mail,
  Plus,
  Minus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { retrieveEmail } from "../lib/crm";
import { type CartLineItem } from "../lib/shopify/types";

export default function CartDrawer() {
  const {
    cart,
    cartOpen,
    toggleCart,
    checkoutUrl,
    removeItemFromCart,
    updateLineQuantity,
  } = useCart();
  const quantity = cart?.totalQuantity || 0;
  const lines = cart?.lines?.edges || [];
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Titan Principle 1.2: Form Focus Routine
  useEffect(() => {
    if (cartOpen && quantity > 0) {
      const timer = setTimeout(() => {
        emailInputRef.current?.focus();
      }, 500); // Wait for drawer transition
      return () => clearTimeout(timer);
    }
  }, [cartOpen, quantity]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutUrl) return;

    setIsSubmitting(true);

    // CRM: Capture email before redirect (Non-Blocking)
    if (email) {
      retrieveEmail(email, cart?.id).catch((err) => console.warn("CRM Background Sync:", err));
      setIsVerified(true);
      // UX Delay only
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    window.location.href = checkoutUrl;
  };

  const handleQuantityChange = async (
    lineId: string,
    currentQty: number,
    delta: number
  ) => {
    const newQty = currentQty + delta;
    if (newQty < 1) {
      await removeItemFromCart(lineId);
    } else {
      await updateLineQuantity(lineId, newQty);
    }
  };

  // Helper to extract vibe/icon from attributes
  const getVibeDisplay = (attributes: { key: string; value: string }[]) => {
    const textAttr = attributes.find((a) => a.key === "text")?.value;
    const legacyNameAttr = attributes.find((a) => a.key === "Custom Name")?.value;
    const customName = textAttr || legacyNameAttr || "";

    const vibeNotesAttr = attributes.find((a) => a.key === "vibe_notes")?.value;
    const legacyVibeAttr = attributes.find((a) => a.key === "Vibe")?.value;
    const legacyIconAttr = attributes.find((a) => a.key === "_Vibe_Icon")?.value;

    let vibe = legacyVibeAttr || "";
    let icon = legacyIconAttr || "";

    if (vibeNotesAttr) {
      try {
        const parsed = JSON.parse(vibeNotesAttr);
        vibe = parsed.charm || parsed.vibe_text || vibe;
        icon = parsed.icon || icon;
      } catch (e) {
        vibe = vibeNotesAttr;
      }
    }

    return { customName, vibe, icon };
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[200]"
            onClick={toggleCart}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#fdfbf7] z-[210] shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col h-full bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
              <div className="flex items-center justify-between p-6 border-b border-stone-200 bg-white shadow-sm">
                <h2 id="cart-title" className="font-serif text-2xl text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-purple-700" />
                  Your Bag{" "}
                  <span className="text-sm font-sans text-stone-500 font-normal">
                    ({quantity})
                  </span>
                </h2>
                <button
                  onClick={toggleCart}
                  aria-label="Close Shopping Bag"
                  className="p-2 hover:bg-stone-100 rounded-full transition-colors text-slate-600 focus:ring-2 focus:ring-purple-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {lines.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                    <ShoppingBag className="w-16 h-16 text-stone-300" />
                    <p className="font-serif text-xl text-stone-500">
                      Your bag is empty.
                    </p>
                    <button
                      onClick={toggleCart}
                      className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-purple-700 transition-all font-sans text-xs tracking-widest uppercase shadow-lg shadow-purple-900/10"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Added Items
                      </span>
                      <button
                        onClick={toggleCart}
                        aria-label="Add more products to bag"
                        className="text-[10px] font-black text-purple-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add More Products
                      </button>
                    </div>
                    {lines.map(({ node }: { node: CartLineItem }) => {
                      const { customName, vibe, icon } = getVibeDisplay(
                        node.attributes || []
                      );

                      return (
                        <article
                          key={node.id}
                          className="flex gap-4 bg-white/50 p-4 rounded-xl border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                        >
                          <div className="relative w-20 h-20 bg-stone-100 rounded-md overflow-hidden flex-shrink-0 border border-stone-200">
                            {node.merchandise.product?.featuredImage && (
                              <Image
                                src={node.merchandise.product.featuredImage.url}
                                alt={node.merchandise.product.featuredImage.altText || node.merchandise.product.title}
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h3 className="font-serif font-bold text-slate-900 text-sm">
                                {node.merchandise.product?.title || "Product"}
                              </h3>
                              <button
                                onClick={() => removeItemFromCart(node.id)}
                                aria-label={`Remove ${node.merchandise.product?.title || "item"} from bag`}
                                className="text-stone-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Display Custom Name and Vibe/Icon */}
                            {(customName || vibe) && (
                              <div className="mt-2 space-y-1">
                                {customName && customName !== "No Name" && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] uppercase font-bold text-slate-400">
                                      Name:
                                    </span>
                                    <span className="text-xs font-black text-purple-700">
                                      {customName}
                                    </span>
                                  </div>
                                )}
                                {vibe && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] uppercase font-bold text-slate-400">
                                      Vibe:
                                    </span>
                                    <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                                      {icon && (
                                        <span className="text-base" aria-hidden="true">{icon}</span>
                                      )}
                                      {vibe}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex justify-between items-center mt-3">
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2 bg-stone-100 rounded-lg p-1" aria-label="Quantity controls">
                                <button
                                  onClick={() =>
                                    handleQuantityChange(node.id, node.quantity, -1)
                                  }
                                  aria-label={`Decrease quantity of ${node.merchandise.product?.title || "item"}`}
                                  className="w-6 h-6 flex items-center justify-center bg-white rounded hover:bg-purple-100 transition-colors text-slate-700"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-bold text-slate-800 w-6 text-center" aria-live="polite">
                                  {node.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    handleQuantityChange(node.id, node.quantity, 1)
                                  }
                                  aria-label={`Increase quantity of ${node.merchandise.product?.title || "item"}`}
                                  className="w-6 h-6 flex items-center justify-center bg-white rounded hover:bg-purple-100 transition-colors text-slate-700"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <span className="text-sm font-bold text-purple-700">
                                $
                                {(
                                  parseFloat(
                                    node.merchandise?.price?.amount || "0"
                                  ) * node.quantity
                                ).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>

              {lines.length > 0 && (
                <div className="p-6 border-t border-stone-200 bg-white">
                  <div className="flex justify-between mb-4 px-2">
                    <span className="text-sm font-bold uppercase tracking-widest text-slate-400 font-sans">
                      Subtotal
                    </span>
                    <span className="text-xl font-serif text-slate-900" aria-live="polite">
                      $
                      {lines
                        .reduce(
                          (acc: number, { node }: { node: CartLineItem }) =>
                            acc +
                            parseFloat(node.merchandise?.price?.amount || "0") *
                            node.quantity,
                          0
                        )
                        .toFixed(2)}
                    </span>
                  </div>
                  <form onSubmit={handleCheckout} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" aria-hidden="true" />
                      <input
                        ref={emailInputRef}
                        type="email"
                        aria-label="Email for order updates and secure checkout"
                        placeholder="Email for order updates..."
                        value={email}
                        required
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting || !checkoutUrl}
                      className={`block w-full text-white text-center py-4 rounded-xl font-black text-[10px] tracking-[0.3em] uppercase transition-all shadow-xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${isVerified
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-slate-900 hover:bg-purple-700"
                        }`}
                    >
                      {isSubmitting ? (
                        isVerified ? (
                          <>
                            VERIFIED
                            <ArrowRight className="w-4 h-4" />
                          </>
                        ) : (
                          "Processing..."
                        )
                      ) : (
                        <>
                          GET MY CUSTOM KEYCHAINS
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                  <p className="text-center text-[10px] uppercase tracking-widest text-stone-400 mt-4 font-bold">
                    Powered by Shopify Secure Checkout
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
