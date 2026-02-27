// 🐝 [HIVE_SWARM_STAMP] Autonomously Audited by Lukas Swarm
'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X } from 'lucide-react';
import Image from 'next/image';
import { useCart } from './CartProvider';
import { motion, AnimatePresence } from 'framer-motion';

/** 
 * Navbar Component - Singularity Lattice Standard
 * Implements Expanding Hero -> Sticky Nav Morphing.
 */
export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toggleCart, cart } = useCart();
  const quantity = cart?.totalQuantity || 0;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        role="navigation"
        aria-label="Main Navigation"
        className={`fixed top-0 w-full z-50 transition-all duration-700 ease-in-out ${isScrolled
          ? 'h-20 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm'
          : 'h-[40vh] bg-transparent pointer-events-none'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-full">
          <div className={`flex items-center h-full transition-all duration-700 relative ${isScrolled ? 'justify-between' : 'flex-col justify-center'
            }`}>

            {/* LEFT LINKS - Visible only when scrolled */}
            <motion.div
              initial={false}
              animate={{ opacity: isScrolled ? 1 : 0, x: isScrolled ? 0 : -20 }}
              className={`hidden md:flex flex-1 justify-start space-x-8 text-[10px] font-black tracking-[0.3em] text-slate-500 transition-opacity duration-500 pointer-events-auto`}
            >
              <a href="/" className="hover:text-purple-700 transition-colors" aria-label="Shop All Products">SHOP</a>
              <a href="/customize" className="hover:text-purple-700 transition-colors" aria-label="Build Your Own Keychain">CUSTOMIZE</a>
            </motion.div>

            {/* LOGO - Morphs from Huge Center to Small Side/Center */}
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className={`flex-shrink-0 pointer-events-auto relative z-10 ${isScrolled ? 'w-24' : 'w-48 mb-8'
                }`}
            >
              <a href="/" aria-label="Lisa's Custom Keychains - Home" className="block relative aspect-[2/1]">
                <Image
                  src="https://i.postimg.cc/cvyv100W/Untitled_design_(2).png"
                  alt="Lisa's Custom Keychains Logo"
                  fill
                  priority
                  className="object-contain"
                />
              </a>
            </motion.div>

            {/* RIGHT LINKS - Visible only when scrolled */}
            <motion.div
              initial={false}
              animate={{ opacity: isScrolled ? 1 : 0, x: isScrolled ? 0 : 20 }}
              className={`hidden md:flex flex-1 justify-end items-center space-x-8 transition-opacity duration-500 pointer-events-auto`}
            >
              <button
                onClick={toggleCart}
                className="text-slate-600 hover:text-purple-700 transition-colors relative group"
                aria-label={`Open Bag with ${quantity} items`}
              >
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <AnimatePresence>
                  {quantity > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 bg-purple-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
                    >
                      {quantity}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
              <div className="text-[10px] font-black tracking-[0.3em] text-slate-500">
                <a href="#about" className="hover:text-purple-700 transition-colors uppercase" aria-label="About the Artist">ABOUT</a>
              </div>
            </motion.div>

            {/* MOBILE TOGGLE */}
            <div className={`md:hidden flex items-center space-x-4 pointer-events-auto transition-opacity ${isScrolled ? 'opacity-100' : 'opacity-0'}`}>
              <button
                onClick={toggleCart}
                className="text-purple-900 relative p-2"
                aria-label={`Cart with ${quantity} items`}
              >
                <ShoppingBag className="w-6 h-6" />
                {quantity > 0 && (
                  <span className="absolute top-0 right-0 bg-purple-600 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">
                    {quantity}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-purple-900 p-2"
                aria-label={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center space-y-8 text-xl font-serif text-slate-900 md:hidden"
          >
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-8 right-8 text-slate-400"
              aria-label="Close Mobile Menu"
            >
              <X size={32} />
            </button>
            <a href="/" className="hover:text-purple-700 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>SHOP</a>
            <a href="/customize" className="hover:text-purple-700 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>CUSTOMIZE</a>
            <button onClick={() => { setIsMobileMenuOpen(false); toggleCart(); }} className="flex items-center gap-2 text-purple-700">
              <ShoppingBag /> Bag ({quantity})
            </button>
            <a href="#about" className="hover:text-purple-700 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>ABOUT</a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
