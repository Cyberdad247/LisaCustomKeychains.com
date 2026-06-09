import { readFile } from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import type { BlogPost } from "@/app/api/blog/route";

export const revalidate = 3600;

async function getAllPosts(): Promise<BlogPost[]> {
  try {
    const raw = await readFile(
      path.join(process.cwd(), "data", "blog", "posts.json"),
      "utf-8"
    );
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts
    .filter((p) => p.status === "published")
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const posts = await getAllPosts();
  const post = posts.find((p) => p.slug === slug && p.status === "published");
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : [],
    },
  };
}

function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h4>$1</h4>")
    .replace(/^## (.+)$/gm, "<h3>$1</h3>")
    .replace(/^# (.+)$/gm, "<h2>$1</h2>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(
      /\[(.+?)\]\((.+?)\)/g,
      '<a href="$2" target="_blank" rel="noopener sponsored">$1</a>'
    )
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n\n/g, "</p><p>")
    .replace(/^([^<].+)$/gm, "<p>$1</p>");
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const posts = await getAllPosts();
  const post = posts.find((p) => p.slug === slug && p.status === "published");
  if (!post) notFound();

  const html = renderMarkdown(post.content ?? "");

  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-slate-400">
        <Link href="/blog" className="hover:text-purple-700 transition-colors">
          Blog
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">{post.title}</span>
      </nav>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">
        {post.title}
      </h1>

      {/* Meta */}
      <p className="mt-3 text-sm text-slate-400">
        Published{" "}
        {new Date(post.publishedAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </p>

      {/* Cover image */}
      {post.coverImageUrl && (
        <img
          src={post.coverImageUrl}
          alt={post.title}
          className="mt-6 w-full rounded-xl object-cover aspect-video"
        />
      )}

      {/* Excerpt */}
      {post.excerpt && (
        <p className="mt-6 text-lg leading-relaxed text-slate-600 border-l-4 border-purple-300 pl-4 italic">
          {post.excerpt}
        </p>
      )}

      {/* Content */}
      <div
        className="mt-8 prose prose-slate prose-a:text-purple-700 prose-headings:font-semibold max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Affiliate links section */}
      {post.affiliateLinks && post.affiliateLinks.length > 0 && (
        <section className="mt-10 rounded-xl border border-stone-200 bg-stone-50 p-5">
          <h3 className="text-sm font-black uppercase tracking-[0.14em] text-slate-700">
            Resources & Recommended Links
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Some links below are affiliate links — I may earn a small commission at no extra cost
            to you. Thank you for supporting the studio!
          </p>
          <ul className="mt-4 space-y-2">
            {post.affiliateLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="text-sm font-semibold text-purple-700 hover:underline"
                >
                  → {link.text}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Back */}
      <div className="mt-10 border-t border-stone-200 pt-6">
        <Link href="/blog" className="text-sm font-semibold text-purple-700 hover:underline">
          ← Back to Blog
        </Link>
      </div>
    </main>
  );
}
