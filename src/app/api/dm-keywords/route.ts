import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { isOwnerSessionValid } from "@/lib/storefront-config";
import { safeReadJson, safeWriteJson } from "@/lib/server-storage";

// DM lead-bot keyword map: keyword -> auto-reply. Managed here, pasted into
// ManyChat (or any DM automation) which does the actual sending. Owner-gated.

const DATA_PATH = path.join(process.cwd(), "data", "dm-keywords.json");

export type DMKeyword = { keyword: string; reply: string };

const DEFAULT_KEYWORDS: DMKeyword[] = [
  { keyword: "wedding favors", reply: "Congratulations! For wedding favor bulk pricing, tell us your date + quantity here: https://lisascustomkeychains.com/customize — or reply with details and Lisa will send a quote." },
  { keyword: "bulk", reply: "We love bulk orders! Share your quantity and deadline and we'll put together a quote within 24 hours: https://lisascustomkeychains.com/customize" },
  { keyword: "memorial", reply: "We're honored you'd trust us with something so meaningful. Every memorial piece is hand-woven by Lisa with tenderness: https://lisascustomkeychains.com/customize" },
];

async function readKeywords(): Promise<DMKeyword[]> {
  return safeReadJson<DMKeyword[]>(DATA_PATH, DEFAULT_KEYWORDS);
}

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  return isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value);
}

export async function GET() {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await readKeywords());
}

export async function POST(req: NextRequest) {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { keyword, reply } = await req.json();
  if (!keyword || !reply) return NextResponse.json({ error: "keyword and reply required" }, { status: 400 });
  const items = await readKeywords();
  const idx = items.findIndex((k) => k.keyword.toLowerCase() === keyword.toLowerCase());
  if (idx >= 0) items[idx] = { keyword, reply };
  else items.push({ keyword, reply });
  await safeWriteJson(DATA_PATH, items);
  return NextResponse.json({ keyword, reply }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword");
  if (!keyword) return NextResponse.json({ error: "keyword required" }, { status: 400 });
  const items = (await readKeywords()).filter((k) => k.keyword.toLowerCase() !== keyword.toLowerCase());
  await safeWriteJson(DATA_PATH, items);
  return NextResponse.json({ ok: true });
}
