import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { cookies } from "next/headers";
import path from "path";
import { isOwnerSessionValid } from "@/lib/storefront-config";

const DATA_FILE = path.join(process.cwd(), "data", "blog", "posts.json");

export type PostStatus = "draft" | "published";

export interface AffiliateLink {
  id: string;
  text: string;
  url: string;
  program: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  metaTitle: string;
  metaDescription: string;
  targetKeyword: string;
  tags: string[];
  affiliateLinks: AffiliateLink[];
  status: PostStatus;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

async function readPosts(): Promise<BlogPost[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writePosts(posts: BlogPost[]): Promise<void> {
  await mkdir(path.dirname(DATA_FILE), { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(posts, null, 2), "utf-8");
}

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  return isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value);
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export async function GET() {
  const posts = await readPosts();
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const posts = await readPosts();
  const now = new Date().toISOString();
  const baseSlug = slugify(body.title ?? "untitled");

  let slug = baseSlug;
  let attempt = 1;
  while (posts.some((p) => p.slug === slug)) {
    slug = `${baseSlug}-${attempt++}`;
  }

  const newPost: BlogPost = {
    id: crypto.randomUUID(),
    slug,
    title: body.title ?? "Untitled",
    excerpt: body.excerpt ?? "",
    content: body.content ?? "",
    coverImageUrl: body.coverImageUrl ?? "",
    metaTitle: body.metaTitle ?? body.title ?? "",
    metaDescription: body.metaDescription ?? body.excerpt ?? "",
    targetKeyword: body.targetKeyword ?? "",
    tags: body.tags ?? [],
    affiliateLinks: body.affiliateLinks ?? [],
    status: body.status ?? "draft",
    publishedAt: body.status === "published" ? now : "",
    createdAt: now,
    updatedAt: now,
  };
  posts.unshift(newPost);
  await writePosts(posts);
  return NextResponse.json(newPost, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body = await request.json();
  const posts = await readPosts();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const wasPublished = posts[idx].status !== "published";
  const nowPublishing = body.status === "published";
  const publishedAt =
    nowPublishing && wasPublished ? new Date().toISOString() : posts[idx].publishedAt;

  posts[idx] = {
    ...posts[idx],
    ...body,
    id,
    publishedAt,
    updatedAt: new Date().toISOString(),
  };
  await writePosts(posts);
  return NextResponse.json(posts[idx]);
}

export async function DELETE(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const posts = await readPosts();
  await writePosts(posts.filter((p) => p.id !== id));
  return NextResponse.json({ ok: true });
}
