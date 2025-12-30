'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShoppingBag } from 'lucide-react';

const THREAD_COLORS = [
  { id: 'purple', name: 'Royal Purple', hex: '#7e22ce' },
  { id: 'pink', name: 'Hot Pink', hex: '#db2777' },
  { id: 'teal', name: 'Ocean Teal', hex: '#0d9488' },
  { id: 'yellow', name: 'Sunny Yellow', hex: '#ca8a04' },
];

const CHARMS = [
  { id: 'none', name: 'No Charm', icon: '∅' },
  { id: 'basketball', name: 'Basketball', icon: '🏀' },
  { id: 'soccer', name: 'Soccer', icon: '⚽' },
  { id: 'heart', name: 'Heart', icon: '❤️' },
];

export default function KeychainBuilder() {
  const [text, setText] = useState('');
  const [selectedColor, setSelectedColor] = useState(THREAD_COLORS[0]);
  const [selectedCharm, setSelectedCharm] = useState(CHARMS[0]);

  return (
    <div className="grid md:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
      
      {/* LEFT: PREVIEW AREA */}
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-stone-100 sticky top-24">
        <h3 className="text-center font-serif text-slate-400 mb-8 tracking-widest text-sm">LIVE PREVIEW</h3>
        
        <div className="relative h-96 bg-stone-50 rounded-2xl flex items-center justify-center overflow-hidden border border-stone-200">
           {/* Simulated Keychain Visual */}
           <motion.div 
             className="relative flex flex-col items-center"
             animate={{ rotate: [0, -2, 2, 0] }}
             transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
           >
             {/* Keyring */}
             <div className="w-12 h-12 rounded-full border-4 border-slate-300 mb-[-10px] z-10"></div>
             
             {/* Woven Body */}
             <div 
               className="w-16 h-64 rounded-b-lg shadow-lg flex flex-col items-center justify-center gap-4 pt-4"
               style={{ backgroundColor: selectedColor.hex }}
             >
                {/* Custom Text */}
                <div className="flex flex-col gap-2">
                   {text.split('').map((char, i) => (
                     <motion.div 
                       key={i}
                       initial={{ opacity: 0, scale: 0.5 }}
                       animate={{ opacity: 1, scale: 1 }}
                       className="w-8 h-8 bg-white rounded-md flex items-center justify-center font-bold text-slate-900 shadow-sm"
                     >
                       {char.toUpperCase()}
                     </motion.div>
                   ))}
                </div>

                {/* Charm */}
                <AnimatePresence mode='wait'>
                  {selectedCharm.id !== 'none' && (
                    <motion.div 
                      key={selectedCharm.id}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      className="absolute bottom-4 right-[-10px] text-4xl drop-shadow-md"
                    >
                      {selectedCharm.icon}
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
             
             {/* Tassels */}
             <div className="flex gap-1 mt-[-5px]">
               {[1,2,3,4].map(i => (
                 <div key={i} className="w-2 h-8 rounded-full" style={{ backgroundColor: selectedColor.hex, opacity: 0.8 }}></div>
               ))}
             </div>
           </motion.div>
        </div>
      </div>

      {/* RIGHT: CONTROLS */}
      <div className="space-y-10 py-4">
        <div>
          <h2 className="text-4xl font-serif text-slate-900 mb-4">Design Your Own</h2>
          <p className="text-slate-600">Hand-woven explicitly for you. Choose your colors, add your name, and make it unique.</p>
        </div>

        {/* STEP 1: TEXT */}
        <div>
          <label className="block text-xs font-bold text-slate-400 tracking-widest uppercase mb-3">1. Add Your Name (Max 8 Letters)</label>
          <input 
            type="text" 
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 8))}
            placeholder="LISA"
            className="w-full text-3xl font-serif border-b-2 border-stone-200 py-2 focus:outline-none focus:border-purple-600 bg-transparent transition-colors placeholder:text-stone-300 uppercase tracking-widest text-slate-900"
          />
        </div>

        {/* STEP 2: COLOR */}
        <div>
           <label className="block text-xs font-bold text-slate-400 tracking-widest uppercase mb-3">2. Choose Thread Color</label>
           <div className="flex flex-wrap gap-4">
             {THREAD_COLORS.map((color) => (
               <button
                 key={color.id}
                 onClick={() => setSelectedColor(color)}
                 className={`w-12 h-12 rounded-full relative transition-transform hover:scale-110 ${selectedColor.id === color.id ? 'scale-110 ring-4 ring-offset-2 ring-purple-100' : ''}`}
                 style={{ backgroundColor: color.hex }}
               >
                 {selectedColor.id === color.id && <Check className="text-white w-6 h-6 absolute inset-0 m-auto" />}
               </button>
             ))}
           </div>
        </div>

        {/* STEP 3: CHARM */}
        <div>
           <label className="block text-xs font-bold text-slate-400 tracking-widest uppercase mb-3">3. Add a Charm (Optional)</label>
           <div className="grid grid-cols-4 gap-3">
             {CHARMS.map((charm) => (
               <button
                 key={charm.id}
                 onClick={() => setSelectedCharm(charm)}
                 className={`py-3 rounded-xl border-2 transition-all ${
                   selectedCharm.id === charm.id 
                     ? 'border-purple-600 bg-purple-50 text-purple-900' 
                     : 'border-stone-100 text-slate-500 hover:border-purple-200'
                 }`}
               >
                 <span className="text-2xl block mb-1">{charm.icon}</span>
                 <span className="text-[10px] font-bold uppercase tracking-wide">{charm.name}</span>
               </button>
             ))}
           </div>
        </div>

        {/* ACTION */}
        <div className="pt-8 border-t border-stone-100">
           <div className="flex justify-between items-center mb-6">
             <span className="text-sm text-slate-500">Total</span>
             <span className="text-3xl font-serif text-slate-900">$15.00</span>
           </div>
           
           <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-purple-900 transition-colors flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
             <ShoppingBag className="w-5 h-5" />
             Add Custom Order
           </button>
           <p className="text-center text-xs text-slate-400 mt-4">Custom orders take 2-3 days to craft.</p>
        </div>

      </div>
    </div>
  );
}
