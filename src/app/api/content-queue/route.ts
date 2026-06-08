import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";

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
  try {
    const raw = await readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
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
  await writeFile(DATA_PATH, JSON.stringify(items, null, 2));
  return NextResponse.json(items[idx]);
}
