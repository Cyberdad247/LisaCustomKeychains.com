import { NextRequest, NextResponse } from "next/server";

// Bulk quote capture — forwards to the VPS BoB gateway, which stores the
// request and notifies Lisa. Nothing is promised to the customer here;
// Lisa reviews every request personally (human-in-the-loop).
// The gateway's /quote is a public storefront endpoint, so no secret here.

const GATEWAY = "https://bob.lisascustomkeychains.com";

export async function POST(req: NextRequest) {

  let body: { name?: string; contact?: string; quantity?: string; details?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad-request" }, { status: 400 });
  }

  const name = (body.name ?? "").trim().slice(0, 120);
  const contact = (body.contact ?? "").trim().slice(0, 160);
  const quantity = (body.quantity ?? "").trim().slice(0, 40);
  const details = (body.details ?? "").trim().slice(0, 1000);
  if (!name || !contact || !quantity) {
    return NextResponse.json({ ok: false, error: "missing-fields" }, { status: 400 });
  }

  try {
    const res = await fetch(`${GATEWAY}/quote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, contact, quantity, details }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`gateway ${res.status}`);
    const data = await res.json();
    return NextResponse.json({ ok: true, ref: data.ref ?? null });
  } catch (e) {
    console.error("BoB quote gateway error:", e);
    return NextResponse.json({ ok: false, error: "gateway" }, { status: 502 });
  }
}
