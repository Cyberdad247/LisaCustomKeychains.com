import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import path from "path";
import { safeReadJson, safeWriteJson } from "@/lib/server-storage";
import { isOwnerSessionValid } from "@/lib/storefront-config";

export type ContentItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

const DATA_PATH = path.join(process.cwd(), "data", "content-queue.json");

async function readQueue(): Promise<ContentItem[]> {
  return safeReadJson<ContentItem[]>(DATA_PATH, []);
}

async function requireOwner(): Promise<boolean> {
  const cookieStore = await cookies();
  return isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value);
}

export async function GET() {
  if (!(await requireOwner()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await readQueue();
  return NextResponse.json(items);
}

export async function PATCH(req: Request) {
  if (!(await requireOwner()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status, body } = await req.json();
  if (!id || !status) {
    return NextResponse.json({ error: "id and status required" }, { status: 400 });
  }

  const items = await readQueue();
  const idx = items.findIndex((item) => item.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  items[idx] = { ...items[idx], status, ...(body !== undefined ? { body } : {}) };
  await safeWriteJson(DATA_PATH, items);
  return NextResponse.json(items[idx]);
}

export async function POST(req: Request) {
  if (!(await requireOwner()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { type, title, body } = await req.json();
  if (!title || !body) {
    return NextResponse.json({ error: "title and body required" }, { status: 400 });
  }
  const items = await readQueue();
  const item: ContentItem = {
    id: `cq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: type ?? "note",
    title,
    body,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  items.unshift(item);
  await safeWriteJson(DATA_PATH, items);
  return NextResponse.json(item, { status: 201 });
}
