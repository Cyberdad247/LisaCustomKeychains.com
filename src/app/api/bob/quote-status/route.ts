import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { isOwnerSessionValid } from "@/lib/storefront-config";

// Local pipeline status overlay for VPS quotes (quotes.jsonl is append-only,
// so stage tracking lives here, keyed by quote ref). Owner-gated.

const DATA_PATH = path.join(process.cwd(), "data", "quote-status.json");

export type QuoteStage = "new" | "contacted" | "quoted" | "won" | "lost";
export type QuoteStatus = { stage: QuoteStage; note: string; updatedAt: string };

async function readStatus(): Promise<Record<string, QuoteStatus>> {
  try {
    return JSON.parse(await readFile(DATA_PATH, "utf-8"));
  } catch {
    return {};
  }
}

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  return isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value);
}

export async function GET() {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await readStatus());
}

export async function POST(req: NextRequest) {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { ref, stage, note } = await req.json();
  if (!ref || !stage) return NextResponse.json({ error: "ref and stage required" }, { status: 400 });
  const valid: QuoteStage[] = ["new", "contacted", "quoted", "won", "lost"];
  if (!valid.includes(stage)) return NextResponse.json({ error: "invalid stage" }, { status: 400 });
  const map = await readStatus();
  map[ref] = { stage, note: note ?? "", updatedAt: new Date().toISOString() };
  await mkdir(path.dirname(DATA_PATH), { recursive: true });
  await writeFile(DATA_PATH, JSON.stringify(map, null, 2));
  return NextResponse.json({ ref, ...map[ref] });
}
