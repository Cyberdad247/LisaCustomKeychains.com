// 🐝 [HIVE_SWARM_STAMP] Autonomously Audited by Lukas Swarm
'use client';

import { motion } from 'framer-motion';
import {
   Activity,
   Shield,
   Zap,
   Terminal,
   Cpu,
   Globe,
   Lock,
   Sparkles,
   Layers,
   Palette,
   CheckCircle2,
   Monitor,
   Eye
} from 'lucide-react';
import Navbar from '../../components/Navbar';

export default function DevPortal() {
   const nodes = [
      { name: 'ARCHITECT', role: 'Merlin (Decision)', status: 'Optimal', load: '14%', icon: Cpu },
      { name: 'FORGE', role: 'Syntax (Visual)', status: 'Online', load: '68%', icon: Zap },
      { name: 'SENTINEL', role: 'Zenith (Safety)', status: 'Active', load: '2%', icon: Shield },
      { name: 'HEALER', role: 'Antigravity (I/O)', status: 'Monitoring', load: '1%', icon: Activity },
   ];

   const logs = [
      { id: 1, action: 'CACHE_PURGE_v2.0', node: 'Lukas', result: 'Verified', details: 'Deleted .next, node_modules, regenerated lockfile. 0 vulnerabilities.', time: 'Just now' },
      { id: 2, action: 'HOMEPAGE_SEQUENCE_LOCK', node: 'Antigravity', result: 'Success', details: 'Verified Hero → Heritage → Gallery → About Us hierarchy.', time: '3m ago' },
      { id: 3, action: 'LEDGER_SYNC_032', node: 'Kaelen', result: 'Verified', details: 'Updated PROVENANCE_LEDGER.md with Gallery Reorder (Final) entry.', time: '10m ago' },
      { id: 4, action: 'ADEPT_ROSTER_QUERY', node: 'Anya', result: 'Success', details: 'Enumerated Aris, Maya, Vega, Kaelen. All nodes nominal.', time: '15m ago' },
      { id: 5, action: 'KINETIC_RESET', node: 'Squire Purge', result: 'Purged', details: 'git clean -fdx removed untracked artifacts and stale reports.', time: '20m ago' },
   ];


   return (
      <div className="min-h-screen bg-[#020202] text-white selection:bg-[#D4AF37] selection:text-black font-sans">
         <Navbar />

         <div className="pt-32 px-6 max-w-7xl mx-auto pb-24">

            {/* HEADER */}
            <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
               <div>
                  <div className="flex items-center gap-3 text-[#D4AF37] text-[10px] font-black tracking-[0.5em] uppercase mb-4">
                     <Lock className="w-3 h-3" />
                     Sovereign Access Only
                  </div>
                  <h1 className="text-7xl font-serif tracking-tighter italic">LCK Kernel <span className="text-zinc-800 tracking-normal not-italic font-sans text-4xl">v69.0</span></h1>
                  <p className="text-zinc-500 mt-4 max-w-xl font-light tracking-wide text-lg">
                     Tier-Adaptive Visual Forge & Shopify Storefront Core. Monitoring transactional verification and kinetic texture rendering across the swarm.
                  </p>
               </div>

               <div className="flex gap-4">
                  <div className="px-6 py-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex items-center gap-4">
                     <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                     <div>
                        <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">Global Status</span>
                        <span className="text-sm font-bold uppercase tracking-widest">Nominal</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* SWARM STATUS */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
               {nodes.map((node) => (
                  <motion.div
                     key={node.name}
                     whileHover={{ y: -5, borderColor: 'rgba(212, 175, 55, 0.4)' }}
                     className="p-8 bg-[#050507] border border-zinc-900 rounded-[2.5rem] group transition-all duration-500 shadow-2xl"
                  >
                     <div className="flex justify-between items-start mb-8">
                        <div className="p-4 bg-zinc-900 rounded-2xl group-hover:bg-[#D4AF37]/10 transition-colors border border-zinc-800 group-hover:border-[#D4AF37]/20">
                           <node.icon className="w-6 h-6 text-[#D4AF37]" />
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="text-[10px] font-black text-zinc-600 mb-1 uppercase tracking-tighter">Usage</span>
                           <span className="text-xl font-mono text-[#D4AF37]">{node.load}</span>
                        </div>
                     </div>
                     <h3 className="text-zinc-500 text-[10px] font-black tracking-[0.3em] mb-1">{node.name}</h3>
                     <p className="text-2xl font-serif text-white mb-6 italic">{node.role}</p>
                     <div className="w-full bg-zinc-900/50 h-1.5 rounded-full overflow-hidden border border-zinc-800">
                        <motion.div
                           initial={{ width: 0 }}
                           animate={{ width: node.load }}
                           className="bg-gradient-to-r from-[#D4AF37] to-[#fde047] h-full shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                        />
                     </div>
                  </motion.div>
               ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">

               {/* LOGS */}
               <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between mb-2">
                     <h2 className="text-xs font-black tracking-[0.4em] text-zinc-600 uppercase flex items-center gap-2">
                        <Terminal className="w-4 h-4" />
                        Kinetic Trace log
                     </h2>
                     <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 opacity-50" />
                        <div className="w-2 h-2 rounded-full bg-yellow-500 opacity-50" />
                        <div className="w-2 h-2 rounded-full bg-green-500 opacity-50" />
                     </div>
                  </div>
                  <div className="bg-[#050507] border border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                     <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#D4AF37]/5 to-transparent pointer-events-none" />
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead>
                              <tr className="border-b border-zinc-900 text-[10px] font-black text-zinc-700 tracking-widest bg-zinc-900/40">
                                 <th className="p-8">OPERATION</th>
                                 <th className="p-8">NODE</th>
                                 <th className="p-8">RESULT</th>
                                 <th className="p-8">TIMESTAMP</th>
                              </tr>
                           </thead>
                           <tbody className="text-sm font-light">
                              {logs.map((log) => (
                                 <tr key={log.id} className="border-b border-zinc-900/50 hover:bg-[#D4AF37]/5 transition-colors group">
                                    <td className="p-8">
                                       <div className="text-zinc-200 font-mono tracking-tighter mb-1 select-all">{log.action}</div>
                                       <div className="text-[11px] text-zinc-600 font-medium">{log.details}</div>
                                    </td>
                                    <td className="p-8">
                                       <span className="flex items-center gap-2 font-black text-[10px] tracking-widest uppercase text-zinc-400">
                                          <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_5px_#D4AF37]" />
                                          {log.node}
                                       </span>
                                    </td>
                                    <td className="p-8">
                                       <div className="flex items-center gap-2 text-green-500 text-[10px] font-black tracking-widest">
                                          <CheckCircle2 className="w-3 h-3" />
                                          {log.result.toUpperCase()}
                                       </div>
                                    </td>
                                    <td className="p-8 text-zinc-600 font-mono text-xs italic">{log.time}</td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>

                  {/* LIVE PREVIEW ENGINE STATUS */}
                  <div className="p-10 bg-[#050507] border border-zinc-900 rounded-[3rem] relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Monitor className="w-32 h-32 text-[#D4AF37]" />
                     </div>
                     <div className="flex items-center gap-4 mb-8">
                        <Eye className="w-6 h-6 text-[#D4AF37]" />
                        <h2 className="text-xs font-black tracking-[0.4em] text-zinc-300 uppercase">Live Forge Preview</h2>
                     </div>
                     <div className="grid md:grid-cols-3 gap-8 relative z-10">
                        <div className="p-6 bg-zinc-950/50 border border-zinc-900 rounded-2xl">
                           <span className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-4">Rendering Engine</span>
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full border border-[#D4AF37]/20 flex items-center justify-center bg-[#D4AF37]/5">
                                 <Layers className="w-4 h-4 text-[#D4AF37]" />
                              </div>
                              <div>
                                 <span className="block text-xs font-bold">Kinetic_v4.2</span>
                                 <span className="text-[10px] text-green-500 font-black">STABLE</span>
                              </div>
                           </div>
                        </div>
                        <div className="p-6 bg-zinc-950/50 border border-zinc-900 rounded-2xl">
                           <span className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-4">Texture Buffer</span>
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full border border-purple-500/20 flex items-center justify-center bg-purple-500/5">
                                 <Palette className="w-4 h-4 text-purple-500" />
                              </div>
                              <div>
                                 <span className="block text-xs font-bold">12-Yarn-Core</span>
                                 <span className="text-[10px] text-[#D4AF37] font-black">RESOLVED</span>
                              </div>
                           </div>
                        </div>
                        <div className="p-6 bg-zinc-950/50 border border-zinc-900 rounded-2xl">
                           <span className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-4">Tier Logic</span>
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full border border-blue-500/20 flex items-center justify-center bg-blue-500/5">
                                 <Activity className="w-4 h-4 text-blue-500" />
                              </div>
                              <div>
                                 <span className="block text-xs font-bold">Adaptive_Sync</span>
                                 <span className="text-[10px] text-green-500 font-black">NOMINAL</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* SIDEBAR: STACK STATS */}
               <div className="space-y-8">

                  {/* PROTOCOL STATUS */}
                  <div className="p-10 bg-gradient-to-br from-[#D4AF37] to-[#fde047] rounded-[3.5rem] text-black shadow-2xl relative overflow-hidden">
                     <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                     <div className="flex items-center gap-2 mb-8 relative z-10">
                        <Layers className="w-6 h-6" />
                        <span className="text-[11px] font-black tracking-[0.2em] uppercase">Core Topology</span>
                     </div>
                     <div className="space-y-6 relative z-10">
                        <div className="flex justify-between items-center border-b border-black/10 pb-4">
                           <span className="text-xs font-black uppercase tracking-widest">Shopify Storefront</span>
                           <span className="text-xs font-mono bg-black/5 px-2 py-1 rounded">2026-04</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-black/10 pb-4">
                           <span className="text-xs font-black uppercase tracking-widest">Palette Nodes</span>
                           <span className="text-xs font-mono bg-black/5 px-2 py-1 rounded">16+Rainbow Active</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-black/10 pb-4">
                           <span className="text-xs font-black uppercase tracking-widest">Tier Logic</span>
                           <span className="text-xs font-mono bg-black/5 px-2 py-1 rounded">Adaptive</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-xs font-black uppercase tracking-widest">Verification</span>
                           <span className="text-xs font-mono bg-black/5 px-2 py-1 rounded">Packet-Auth</span>
                        </div>
                     </div>
                     <motion.button
                        whileTap={{ scale: 0.98 }}
                        className="w-full mt-10 bg-black text-white py-5 rounded-2xl font-black text-[10px] tracking-[0.4em] uppercase hover:bg-zinc-800 transition-all shadow-xl"
                     >
                        Verify Kernel Integrity
                     </motion.button>
                  </div>

                  {/* ORACLE PREVIEW */}
                  <div className="p-10 bg-zinc-900 border border-zinc-800 rounded-[3.5rem] shadow-xl relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
                     <div className="flex items-center gap-3 mb-8 text-[#D4AF37]">
                        <Palette className="w-6 h-6" />
                        <span className="text-[11px] font-black tracking-[0.2em] uppercase">Visual Cortex</span>
                     </div>
                     <div className="space-y-4 relative z-10">
                        <p className="text-zinc-300 text-sm leading-relaxed font-light">
                           "The visual forge is now locked to v4.2 stability. Texture buffers are mirroring physical designs with <span className="text-white font-bold">100% variant accuracy</span>."
                        </p>
                        <div className="pt-6 border-t border-zinc-800 flex items-center justify-between">
                           <span className="text-xs font-bold text-zinc-500">Active Texture:</span>
                           <span className="text-[10px] font-black px-2 py-1 bg-purple-500/10 text-purple-400 rounded-md tracking-tighter uppercase font-mono border border-purple-500/20">Crochet_v4.2</span>
                        </div>
                     </div>
                  </div>

                  <div className="p-8 bg-zinc-900/20 border border-zinc-800 rounded-3xl flex items-center gap-4 group hover:bg-zinc-900/40 transition-all cursor-default">
                     <Shield className="w-5 h-5 text-zinc-700 group-hover:text-green-600 transition-colors" />
                     <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">
                        Secure Socket Layer Active
                     </p>
                  </div>

               </div>

            </div>

         </div>
      </div>
   );
}
