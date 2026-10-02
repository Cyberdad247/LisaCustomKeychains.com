import { NextResponse } from "next/server";
import path from "path";
import { safeReadJson, safeWriteJson } from "@/lib/server-storage";

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

export async function GET() {
  const items = await readQueue();
  return NextResponse.json(items);
}

export async function PATCH(req: Request) {
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
