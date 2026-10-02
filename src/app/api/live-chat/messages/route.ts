import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSession, markSessionRead, markLisaSeen } from "@/lib/live-chat-store";
import { isOwnerSessionValid } from "@/lib/storefront-config";

/** Lisa reads a full conversation. Owner-gated. Marks the session read. */
export async function GET(req: Request) {
  const cookieStore = await cookies();
  if (!isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessionId = new URL(req.url).searchParams.get("sessionId") ?? "";
  const session = getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Unknown session" }, { status: 404 });
  }

  markLisaSeen();
  markSessionRead(sessionId);
  return NextResponse.json({
    session: {
      id: session.id,
      name: session.name,
      createdAt: session.createdAt,
      messages: session.messages,
    },
  });
}
