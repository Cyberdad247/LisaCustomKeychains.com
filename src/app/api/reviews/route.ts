import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { isOwnerSessionValid } from "@/lib/storefront-config";
import { safeReadJson, safeWriteJson } from "@/lib/server-storage";

// Review flywheel tracker: log review requests sent, record reviews received,
// approve testimonials for the storefront. Owner-gated.

const DATA_PATH = path.join(process.cwd(), "data", "reviews.json");

export type ReviewEntry = {
  id: string;
  customer: string;
  orderRef: string;
  requestSentAt: string;
  receivedAt: string | null;
  rating: number | null;
  text: string;
  approved: boolean;
};

async function readReviews(): Promise<ReviewEntry[]> {
  return safeReadJson<ReviewEntry[]>(DATA_PATH, []);
}

async function writeReviews(items: ReviewEntry[]) {
  await safeWriteJson(DATA_PATH, items);
}

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  return isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value);
}

export async function GET() {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await readReviews());
}

export async function POST(req: NextRequest) {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { customer, orderRef } = await req.json();
  if (!customer) return NextResponse.json({ error: "customer required" }, { status: 400 });
  const items = await readReviews();
  const entry: ReviewEntry = {
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    customer,
    orderRef: orderRef ?? "",
    requestSentAt: new Date().toISOString(),
    receivedAt: null,
    rating: null,
    text: "",
    approved: false,
  };
  items.unshift(entry);
  await writeReviews(items);
  return NextResponse.json(entry, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, rating, text, approved } = await req.json();
  const items = await readReviews();
  const idx = items.findIndex((r) => r.id === id);
  if (idx === -1) return NextResponse.json({ error: "not found" }, { status: 404 });
  items[idx] = {
    ...items[idx],
    ...(rating !== undefined ? { rating, receivedAt: items[idx].receivedAt ?? new Date().toISOString() } : {}),
    ...(text !== undefined ? { text, receivedAt: items[idx].receivedAt ?? new Date().toISOString() } : {}),
    ...(approved !== undefined ? { approved } : {}),
  };
  await writeReviews(items);
  return NextResponse.json(items[idx]);
}
