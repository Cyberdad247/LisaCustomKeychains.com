// Hermes — web-safe AI client for the Bifrost assist route.
// Only callable from "use client" components. Owner-session gated server-side.

export type HermesIntent =
  | "improve-copy"
  | "headline-variants"
  | "announcement"
  | "section-body"
  | "social-caption"
  | "ad-copy";

export type HermesContext = {
  current?: string;   // existing text to improve
  field?: string;     // label of the field being edited
  extra?: string;     // additional context (product names, platform, etc.)
};

export type HermesRequest = {
  intent: HermesIntent;
  context: HermesContext;
};

export type HermesStreamCallbacks = {
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
};

export async function hermesStream(
  request: HermesRequest,
  { onChunk, onDone, onError }: HermesStreamCallbacks,
): Promise<void> {
  let res: Response;
  try {
    res = await fetch("/api/ai/assist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  } catch (err) {
    onError(`Network error: ${String(err)}`);
    return;
  }

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    onError(msg || `HTTP ${res.status}`);
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) { onError("No response stream"); return; }

  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) { onDone(); break; }

      const raw = decoder.decode(value, { stream: true });
      for (const line of raw.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;
        const payload = trimmed.slice(6);
        if (payload === "[DONE]") { onDone(); return; }
        try {
          const parsed = JSON.parse(payload) as { text?: string };
          if (parsed.text) onChunk(parsed.text);
        } catch {
          // non-JSON line — skip
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// Convenience: resolves to a full string instead of streaming
export function hermesTask(request: HermesRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    let output = "";
    hermesStream(request, {
      onChunk: (t) => { output += t; },
      onDone: () => resolve(output.trim()),
      onError: reject,
    });
  });
}
