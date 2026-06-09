import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { cookies } from "next/headers";
import path from "path";
import { isOwnerSessionValid } from "@/lib/storefront-config";

const DATA_FILE = path.join(process.cwd(), "data", "affiliate-programs.json");

export interface AffiliateProgram {
  id: string;
  name: string;
  baseUrl: string;
  trackingParam: string;
  affiliateId: string;
  categories: string[];
  commission: string;
  signupUrl: string;
  active: boolean;
  notes: string;
}

async function readPrograms(): Promise<AffiliateProgram[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  return isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value);
}

export async function GET() {
  const programs = await readPrograms();
  return NextResponse.json(programs);
}

export async function PUT(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const programs: AffiliateProgram[] = await request.json();
  await mkdir(path.dirname(DATA_FILE), { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(programs, null, 2), "utf-8");
  return NextResponse.json({ ok: true });
}
