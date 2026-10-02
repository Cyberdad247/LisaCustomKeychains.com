import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { listSessionSummaries, markLisaSeen } from "@/lib/live-chat-store";
import { isOwnerSessionValid } from "@/lib/storefront-config";

/** Lisa's inbox: list all chat sessions. Owner-gated. */
export async function GET() {
  const cookieStore = await cookies();
  if (!isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  markLisaSeen(); // Lisa is here → shoppers see her as online
  return NextResponse.json({ sessions: listSessionSummaries() });
}
