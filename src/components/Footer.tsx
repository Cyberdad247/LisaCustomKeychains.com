export default function Footer() {
  return (
    <footer className="w-full py-8 bg-slate-950 text-center border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-sans">
          &copy; {new Date().getFullYear()} Lisa&apos;s Custom Keychains • All Rights Reserved
        </p>
        <div className="mt-4 flex justify-center items-center gap-2">
          <span className="text-[9px] uppercase tracking-[0.2em] text-slate-600">Handcrafted Excellence</span>
          <div className="w-1 h-1 rounded-full bg-slate-800"></div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-sans">
            Made by{' '}
            <span className="text-[#D4AF37] font-semibold drop-shadow-[0_0_10px_rgba(212,175,55,0.4)] animate-pulse">
              Invisioned Marketing inc.
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}

