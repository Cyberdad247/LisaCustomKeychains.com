"use client";

import Image from "next/image";
import { ExternalLink, Facebook, Instagram } from "lucide-react";
import { type SocialPost } from "@/lib/social";

const INSTAGRAM_URL = "https://www.instagram.com/lisascustomkeychains?igsh=MXMzZWVyOGw2Z3Vtag==";
const FACEBOOK_URL = "https://www.facebook.com/share/14WQBPgC1Rz/";

interface SocialFeedSectionProps {
  posts: SocialPost[];
  source: "configured" | "fallback";
}

const platformIcon = {
  facebook: Facebook,
  instagram: Instagram,
};

const platformLabel = {
  facebook: "Facebook",
  instagram: "Instagram",
};

export default function SocialFeedSection({ posts, source }: SocialFeedSectionProps) {
  const railPosts = posts.length > 0 ? posts : [];
  const animatedPosts = [...railPosts, ...railPosts];

  return (
    <section className="overflow-hidden rounded-[2rem] bg-slate-950 px-5 py-12 text-white shadow-2xl shadow-slate-200 md:px-8">
      <div className="mb-8 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <h2 className="font-serif text-3xl md:text-5xl">Fresh From Lisa&apos;s Socials</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/65 md:text-base">
            Recent table photos, finished custom pieces, sports charm ideas, and pop-up updates from Facebook and Instagram.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-950 transition-colors hover:bg-purple-100"
          >
            <Instagram className="h-4 w-4" />
            Instagram
          </a>
          <a
            href={FACEBOOK_URL}
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
        <div className="mb-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-xs font-semibold text-amber-50">
          Facebook and Instagram API credentials are not connected yet. Showing curated recent-work photos until the owner connects the feeds.
        </div>
      )}

      <div
        className="group relative -mx-5 overflow-x-auto px-5 pb-3 [scrollbar-width:thin] motion-reduce:overflow-x-auto md:-mx-8 md:px-8"
        aria-label="Scrollable Facebook and Instagram photo updates"
      >
        <div className="social-marquee flex w-max gap-5">
          {animatedPosts.map((post, index) => {
            const Icon = platformIcon[post.platform];
            return (
              <article
                key={`${post.id}-${index}`}
                className="w-[78vw] max-w-[320px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/10 focus-within:ring-2 focus-within:ring-white sm:w-[320px]"
              >
                <a
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block focus:outline-none"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
                    <Image
                      src={post.thumbnailUrl || post.imageUrl}
                      alt={`${platformLabel[post.platform]} photo: ${post.caption}`}
                      fill
                      sizes="(max-width: 768px) 78vw, 320px"
                      className="object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-slate-950/85 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white backdrop-blur">
                      <Icon className="h-3.5 w-3.5" />
                      {platformLabel[post.platform]}
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="line-clamp-3 text-sm leading-relaxed text-white/72">{post.caption}</p>
                    <div className="mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-purple-100">
                      Open post
                      <ExternalLink className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
