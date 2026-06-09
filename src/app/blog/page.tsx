import { readFile } from "fs/promises";
import path from "path";
import Link from "next/link";
import type { BlogPost } from "@/app/api/blog/route";

export const revalidate = 3600;

async function getPublishedPosts(): Promise<BlogPost[]> {
  try {
    const raw = await readFile(
      path.join(process.cwd(), "data", "blog", "posts.json"),
      "utf-8"
    );
    const all: BlogPost[] = JSON.parse(raw);
    return all
      .filter((p) => p.status === "published")
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <header className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600">
          Lisa Custom Keychains
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          Blog &amp; Ideas
        </h1>
        <p className="mt-3 max-w-xl text-base text-slate-500 leading-relaxed">
          Tips, gift guides, and behind-the-scenes from a handmade keychain studio.
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 py-16 text-center">
          <p className="text-slate-400">No posts published yet — check back soon!</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm transition-shadow hover:shadow-md"
            >
              {post.coverImageUrl ? (
                <img
                  src={post.coverImageUrl}
                  alt={post.title}
                  className="h-48 w-full object-cover"
                />
              ) : (
                <div className="h-48 w-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <span className="text-3xl">✨</span>
                </div>
              )}
              <div className="p-5">
                {post.tags.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <h2 className="text-lg font-semibold leading-snug text-slate-900 group-hover:text-purple-800 transition-colors">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="mt-2 text-sm text-slate-500 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}
                <p className="mt-3 text-[11px] text-slate-400">
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
