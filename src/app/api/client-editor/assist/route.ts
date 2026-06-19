// Conversational storefront editor — proposal endpoint.
//
// SAFE_MODE: this route only PROPOSES a change. It validates the model's patch
// against StorefrontConfigSchema and returns a candidate config + a diff. It
// never persists — applying requires the owner to explicitly accept (see
// applyProposedConfig in ../../../client-editor/actions.ts).

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { isOwnerSessionValid, getStorefrontConfig } from "@/lib/storefront-config";
import {
  applyAndValidate,
  buildSystemPrompt,
  complete,
  parseProposal,
  resolveProvider,
} from "@/lib/config-agent";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  if (!isOwnerSessionValid(cookieStore.get("lisa_owner_session")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const provider = resolveProvider();
  if (!provider) {
    return NextResponse.json(
      {
        error:
          "No AI provider configured. Set OLLAMA_BASE_URL, GOOGLE_AI_API_KEY, or ANTHROPIC_API_KEY.",
      },
      { status: 503 },
    );
  }

  let message: string;
  try {
    const body = (await request.json()) as { message?: unknown };
    message = typeof body.message === "string" ? body.message.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!message) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 });
  }
  if (message.length > 2000) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }

  // Always inject the live config as ground truth (no reliance on chat history).
  const current = await getStorefrontConfig();
  const system = buildSystemPrompt(current);

  let raw: string;
  try {
    raw = await complete(provider, system, message);
  } catch (err) {
    console.error("[config-agent] provider error:", err);
    return NextResponse.json(
      { error: `AI provider error (${provider})` },
      { status: 502 },
    );
  }

  let proposal;
  try {
    proposal = parseProposal(raw);
  } catch {
    return NextResponse.json({
      reply:
        "Sorry, I couldn't turn that into a clean change. Could you rephrase it?",
      patch: null,
      changes: [],
      provider,
    });
  }

  const validated = applyAndValidate(current, proposal.patch);
  if (!validated.ok) {
    return NextResponse.json({
      reply:
        proposal.reply ||
        "That change wouldn't pass validation, so I didn't apply it.",
      error: "validation_failed",
      validationErrors: validated.errors,
      patch: null,
      changes: [],
      provider,
    });
  }

  return NextResponse.json({
    reply: proposal.reply,
    changes: validated.changes,
    // Only present when there is something to apply.
    proposedConfig: validated.changes.length > 0 ? validated.config : null,
    provider,
  });
}
