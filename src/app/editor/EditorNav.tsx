"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap,
  Share2,
  PenSquare,
  Image,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/editor", label: "Command", icon: Zap, exact: true },
  { href: "/editor/social", label: "Social", icon: Share2, exact: false },
  { href: "/editor/blog", label: "Blog", icon: PenSquare, exact: false },
  { href: "/editor/ads", label: "Ads", icon: Image, exact: false },
  { href: "/client-editor", label: "Storefront", icon: ShoppingBag, exact: false },
];

export default function EditorNav() {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        <div className="flex items-center gap-1">
          <span className="mr-3 hidden text-[9px] font-black uppercase tracking-[0.22em] text-purple-400 sm:block">
            CAMELOT
          </span>
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                isActive(href, exact)
                  ? "bg-purple-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="h-3 w-3" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-white"
          >
            <ExternalLink className="h-3 w-3" />
            <span className="hidden sm:inline">View Site</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
