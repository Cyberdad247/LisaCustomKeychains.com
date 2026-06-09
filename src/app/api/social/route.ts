import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { cookies } from "next/headers";
import path from "path";
import { isOwnerSessionValid } from "@/lib/storefront-config";

const DATA_FILE = path.join(process.cwd(), "data", "social-calendar.json");

export type SocialPlatform = "instagram" | "facebook" | "tiktok" | "pinterest";
export type PostStatus = "draft" | "scheduled" | "published";

export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  content: string;
  imageUrl: string;
  scheduledDate: string;
  status: PostStatus;
  hashtags: string[];
  createdAt: string;
  updatedAt: string;
}

async function readPosts(): Promise<SocialPost[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writePosts(posts: SocialPost[]): Promise<void> {
  await mkdir(path.dirname(DATA_FILE), { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(posts, null, 2), "utf-8");
}

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  return isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value);
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
  const newPost: SocialPost = {
    id: crypto.randomUUID(),
    platform: body.platform ?? "instagram",
    content: body.content ?? "",
    imageUrl: body.imageUrl ?? "",
    scheduledDate: body.scheduledDate ?? "",
    status: body.status ?? "draft",
    hashtags: body.hashtags ?? [],
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

  posts[idx] = { ...posts[idx], ...body, id, updatedAt: new Date().toISOString() };
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
  const filtered = posts.filter((p) => p.id !== id);
  await writePosts(filtered);
  return NextResponse.json({ ok: true });
}
