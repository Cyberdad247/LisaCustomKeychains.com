# Conversational Storefront Editor (Thread Control Pad)

A chat panel on `/client-editor` that lets Lisa edit her storefront in natural
language ("make the brand color pink", "rewrite the hero subcopy warmer"). It is
a **grounded, contained** implementation — not an arbitrary-code AI agent.

## Containment model (SAFE_MODE)

The agent's only output surface is a **partial `StorefrontConfig`**. That patch
is deep-merged onto the current config and validated by `StorefrontConfigSchema`
(Zod). The LLM literally cannot emit code, run commands, touch the repo, or
change Shopify products/inventory/checkout — anything outside the schema is
rejected or stripped.

```
Lisa types  ─▶  /api/client-editor/assist  (owner-gated)
                  │  injects LIVE config as ground truth
                  │  LLM returns { reply, patch }            ← config-agent.ts
                  │  deepMerge(current, patch) → Zod validate
                  ▼
            returns { reply, changes[], proposedConfig }     ← NO persistence
                  │
ThreadEditor ─▶  renders Accept / Discard card (diff)
                  │  Accept  ─▶  applyProposedConfig()        ← human-in-the-loop
                  │              re-validates, then saves     ← actions.ts
                  ▼
            Supabase storefront_config  →  storefront re-renders
```

### Why this is safe
- **Constrained surface:** the schema *is* the allow-list. No `data/ast.json`, no
  free-form code generation. Invalid patches (bad hex color, over-long copy,
  unknown keys) never persist.
- **Human-in-the-loop:** the chat route only *proposes*. Nothing is written until
  the owner clicks **Accept & publish**. Mirrors the "Preview & Confirm" gotcha
  mitigation.
- **No repo/deploy access:** there is no Git write or GitHub Action trigger.
  Publishing updates a Supabase row (see `STOREFRONT_CONFIG_PERSISTENCE.md`),
  which the storefront reads — the same path as the manual editor.
- **Grounded state (anti-hallucination):** every request injects the current
  live config as ground truth instead of relying on chat history, so long
  threads can't drift from reality.
- **Owner-gated:** both the proposal route and the apply action check the
  hardened owner session.

## Files
| File | Role |
|---|---|
| `src/lib/config-agent.ts` | Provider resolution, non-streaming completion, `deepMerge`, `computeChanges`, `parseProposal`, `applyAndValidate`, system prompt |
| `src/app/api/client-editor/assist/route.ts` | Owner-gated proposal endpoint (never persists) |
| `src/app/client-editor/actions.ts` → `applyProposedConfig` | Human-in-the-loop apply step (re-validates + saves) |
| `src/app/client-editor/ThreadEditor.tsx` | Chat UI with Accept/Discard diff cards |
| `src/lib/__tests__/config-agent.test.ts` | 14 tests incl. containment (rejects bad hex / over-long / unknown keys) |

## Setup
1. Set an AI provider (see `.env.example`): `OLLAMA_BASE_URL` (free/local),
   `GOOGLE_AI_API_KEY` (free tier), or `ANTHROPIC_API_KEY`. Precedence is
   Ollama → Gemini → Anthropic; override with `AI_PROVIDER`.
2. Configure Supabase persistence so accepted changes survive on Vercel
   (`docs/STOREFRONT_CONFIG_PERSISTENCE.md`).
3. Visit `/client-editor`, sign in, and use the "Talk to your storefront" panel.

## Acceptance criteria (met)
- Typing *"make the brand accent color pink"* returns a diff card showing
  `brand.accent` changing to a pink hex; Accept publishes it. ✔ (validated by
  `applyAndValidate` tests)
- An invalid request (e.g. a non-hex color) is refused and never persisted. ✔

## Deliberately NOT included
LobeHub, a Git "Kinetic Bridge", AST/Material-Design-3 token mutation, and
GitHub-Action deploy-on-chat — those would give an LLM write access to the
production repo, which is out of scope for SAFE_MODE. Product creation stays in
Shopify (the schema has no product mutation surface by design).
