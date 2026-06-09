"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ExternalLink,
  Facebook,
  Instagram,
  ChevronLeft,
  ChevronRight,
  Wifi,
  WifiOff,
} from "lucide-react";
import { type SocialPost } from "@/lib/social";
import { type StorefrontConfig } from "@/lib/storefront-config";

const INSTAGRAM_URL =
  "https://www.instagram.com/lisascustomkeychains?igsh=MXMzZWVyOGw2Z3Vtag==";
const FACEBOOK_URL = "https://www.facebook.com/share/14WQBPgC1Rz/";

interface SocialFeedSectionProps {
  posts: SocialPost[];
  source: "live" | "configured" | "fallback";
  config?: StorefrontConfig["social"];
}

const platformIcon = { facebook: Facebook, instagram: Instagram };
const platformLabel = { facebook: "Facebook", instagram: "Instagram" };

const CARD_GAP = 20; // px — matches gap-5
const CARD_WIDTH = 320; // px — max-w-[320px]

export default function SocialFeedSection({
  posts,
  source,
  config,
}: SocialFeedSectionProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(1);

  const socialConfig = config ?? {
    instagramUrl: INSTAGRAM_URL,
    facebookUrl: FACEBOOK_URL,
    source: "fallback",
    fallbackMessage:
      "Connect Meta credentials to stream live posts — showing curated photos until then.",
    headline: "Fresh From Lisa's Socials",
    body: "Recent table photos, finished custom pieces, sports charm ideas, and pop-up updates from Facebook and Instagram.",
  };

  const total = posts.length;

  // Track how many cards fit in the viewport
  useEffect(() => {
    function measure() {
      if (!railRef.current) return;
      const containerWidth = railRef.current.offsetWidth;
      const count = Math.max(1, Math.floor((containerWidth + CARD_GAP) / (CARD_WIDTH + CARD_GAP)));
      setVisibleCount(Math.min(count, total));
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (railRef.current) ro.observe(railRef.current);
    return () => ro.disconnect();
  }, [total]);

  const maxIndex = Math.max(0, total - visibleCount);

  const scrollToIndex = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, maxIndex));
      setCurrentIndex(clamped);
      if (railRef.current) {
        railRef.current.scrollTo({
          left: clamped * (CARD_WIDTH + CARD_GAP),
          behavior: "smooth",
        });
      }
    },
    [maxIndex],
  );

  const next = useCallback(() => {
    scrollToIndex(currentIndex >= maxIndex ? 0 : currentIndex + 1);
  }, [currentIndex, maxIndex, scrollToIndex]);

  const prev = useCallback(() => {
    scrollToIndex(currentIndex <= 0 ? maxIndex : currentIndex - 1);
  }, [currentIndex, maxIndex, scrollToIndex]);

  useEffect(() => {
    if (paused || total === 0) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [paused, next, total]);

  const dotCount = maxIndex + 1;

  return (
    <section className="overflow-hidden rounded-[2rem] bg-slate-950 px-5 py-12 text-white shadow-2xl shadow-slate-200 md:px-8">
      {/* ── Header ── */}
      <div className="mb-8 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                source === "live"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-amber-400/15 text-amber-300"
              }`}
            >
              {source === "live" ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              {source === "live" ? "Live Feed" : source === "configured" ? "Manual Feed" : "Curated"}
            </span>
          </div>
          <h2 className="font-serif text-3xl md:text-5xl">{socialConfig.headline}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/65 md:text-base">
            {socialConfig.body}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href={socialConfig.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-950 transition-colors hover:bg-purple-100"
          >
            <Instagram className="h-4 w-4" />
            Instagram
          </a>
          <a
            href={socialConfig.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/20"
          >
            <Facebook className="h-4 w-4" />
            Facebook
          </a>
        </div>
      </div>

      {source === "fallback" && (
        <div className="mb-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-xs font-semibold text-amber-100/80">
          {socialConfig.fallbackMessage}
        </div>
      )}

      {/* ── Slider ── */}
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {/* Card Rail — overflow hidden, programmatically scrolled */}
        <div
          ref={railRef}
          className="flex gap-5 overflow-x-hidden"
          aria-label="Social post slider"
        >
          {posts.map((post, index) => {
            const Icon = platformIcon[post.platform];
            const label = platformLabel[post.platform];
            return (
              <article
                key={post.id}
                aria-label={`${label} post ${index + 1} of ${total}`}
                className="w-[80vw] max-w-[320px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/10 transition-transform duration-300 hover:scale-[1.01]"
              >
                <a
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
                    <Image
                      src={post.thumbnailUrl || post.imageUrl}
                      alt={`${label}: ${post.caption.slice(0, 80)}`}
                      fill
                      sizes="(max-width: 768px) 80vw, 320px"
                      className="object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-slate-950/85 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white backdrop-blur">
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="line-clamp-3 text-sm leading-relaxed text-white/70">
                      {post.caption}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-purple-300">
                      Open post
                      <ExternalLink className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </a>
              </article>
            );
          })}
        </div>

        {/* ── Prev / Next arrows ── */}
        {total > visibleCount && (
          <>
            <button
              onClick={prev}
              aria-label="Previous posts"
              className="absolute -left-2 top-[38%] z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-slate-800/90 text-white shadow-lg backdrop-blur transition-all hover:bg-purple-700 hover:scale-110 focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              aria-label="Next posts"
              className="absolute -right-2 top-[38%] z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-slate-800/90 text-white shadow-lg backdrop-blur transition-all hover:bg-purple-700 hover:scale-110 focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* ── Dot indicators ── */}
      {dotCount > 1 && (
        <div className="mt-6 flex justify-center gap-2" role="tablist" aria-label="Slide indicators">
          {Array.from({ length: dotCount }).map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === currentIndex}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => scrollToIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? "w-7 bg-purple-400"
                  : "w-2 bg-white/25 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
