# UI/UX Full Deep-Dive Audit — Blueprint (Recyclable Template)

> **Owner:** Anya_Omega v202.0 (L7 Sovereign Compiler)
> **Invocation:** `//FORGE audit:uiux` or manual dispatch via SIR_BORIS
> **Scope:** Lisa's Custom Keychains storefront (Next.js 14 / Shopify Storefront API / Vercel)
> **Template status:** Recyclable — duplicate this folder per audit cycle, update the Run Metadata block only.

---

## 0. Run Metadata

| Field | Value |
|---|---|
| Audit ID | `UIUX-{{YYYYMMDD}}-{{NNN}}` |
| Target commit | `{{git rev-parse HEAD}}` |
| Target deploy | `{{vercel prod url}}` |
| Initiated by | `{{user}}` |
| Initiated at | `{{ISO8601}}` |
| Blueprint version | `1.0` |
| Ledger entry | `PROVENANCE_LEDGER.md#{{audit_id}}` |

---

## 1. The Prompt (executed by the audit team)

```
ROLE: You are a cross-functional UI/UX audit swarm dispatched by Anya_Omega.
TARGET: A live e-commerce storefront (Next.js App Router, Shopify Storefront API,
        Framer Motion, Tailwind, Vercel edge). The product is handmade custom
        keychains + matching earring sets, with a modal customizer that locks
        letters/colors/charms per collection.

MISSION: Produce a full deep-dive UI/UX audit covering seven axes:

  1. INFORMATION ARCHITECTURE
     - Route graph (/, /sports, /customize, /products/[handle], /cart)
     - Nav coverage, orphaned pages, deep-link viability
     - Breadcrumb and back-button semantics

  2. VISUAL DESIGN & BRAND COHERENCE
     - Typography scale, font loading, FOUT/FOIT
     - Color token audit (stone/slate/purple palette) vs. actual usage
     - Spacing rhythm, grid consistency, image aspect-ratio discipline
     - Motion language (framer-motion): does it reinforce brand or distract?

  3. INTERACTION & MICRO-UX
     - Customizer: color picker, charm grid, letter input (where allowed)
     - Cart drawer: add/remove, quantity, empty state, error states
     - Sports lock: does allowedColors actually restrict? Does lockLetters hide inputs?
     - Sets sync: do keychain + earring previews stay in lockstep?
     - Loading/skeleton states on every async boundary

  4. ACCESSIBILITY (WCAG 2.2 AA)
     - Keyboard traversal of nav, customizer modal, cart
     - Focus traps in modals, focus restoration on close
     - ARIA roles/labels/live regions
     - Color contrast ratios on text + interactive elements
     - Motion-reduction respect (prefers-reduced-motion)
     - Alt text on product and mockup images

  5. PERFORMANCE & CORE WEB VITALS
     - LCP on /, /sports, /products/[handle]
     - CLS from image loads, motion layout shifts, font swaps
     - INP on customizer interactions
     - Bundle size: framer-motion, lucide-react, next/image usage
     - Image optimization: next/image sizes, remote patterns, WebP
     - Third-party: Shopify CDN, postimg.cc logo, fonts

  6. CONTENT & COMMERCE INTEGRITY
     - Product titles, descriptions, prices, variants match source of truth
     - Duplicate products, empty tags, missing productType
     - Sports filter keyword coverage
     - Empty-state copy, error copy, 404 copy

  7. MOBILE & RESPONSIVE
     - Touch targets ≥44px
     - Customizer modal on small screens (sheet vs. full-screen)
     - Nav morph at md breakpoint
     - Safe-area insets on iOS

DELIVERABLES:
  A. TASK.md    — prioritized findings (P0/P1/P2/P3), each mapped to file:line
  B. VERIFICATION.md — acceptance criteria + repro steps per finding
  C. One-paragraph ledger entry appended to PROVENANCE_LEDGER.md

CONSTRAINTS:
  - Read-only audit. No code edits in this pass.
  - Cite file paths as path:line. No vague references.
  - If a finding requires external verification (live browser, Lighthouse run),
    mark it [REQUIRES_RUNTIME] and include the exact command.
  - Cross-check every claim against the codebase before writing it down.
  - Output is Markdown. No emojis unless the file already contains them.
```

---

## 2. The Team (Hyperagent dispatch matrix)

| Axis | Lead Knight | Supporting | Engine | Why |
|---|---|---|---|---|
| 1. Information Architecture | **SIR_BORIS** | Arthur_Omega | Claude Code | Orchestration + route graph reasoning |
| 2. Visual Design & Brand | **SIR_SONUS** | Sir Visage | Claude Code | Creative/design critique, motion language |
| 3. Interaction & Micro-UX | **SIR_FORGE** | Lukas_Omega | Claude Code | Component-level code review |
| 4. Accessibility (WCAG 2.2) | **SIR_SENTINEL** | Sir Octavian | Claude Code | Agent-Armor + compliance posture |
| 5. Performance & CWV | **SIR_HELIO** | Lady Apis | Gemini CLI | 1M context for bundle + network waterfall |
| 6. Content & Commerce | **LADY_APIS** | SIR_BORIS | Claude Code | Research/foraging Shopify↔Etsy parity |
| 7. Mobile & Responsive | **SIR_DEBUG** | Marta_Silva | Claude Code | Device matrix + repro discipline |
| **Synthesis / Gate** | **Anya_Omega** | Merlin_Omega | APEE v6.5 | Collapse findings, Harmony Gate, ledger write |

**Cross-engine rule triggered:** touches >3 files AND security-adjacent (a11y, CSP, Shopify tokens). Secondary review by **SIR_HELIO** (Gemini CLI) required before merge to PROVENANCE_LEDGER.

---

## 3. Workflow (5-Phase Crucible)

```
┌─ PHASE 1: STRATEGIC OMNISCIENCE ──────────────────────────────┐
│ Anya maps Task DAG. Oracle (Merlin) drafts BriefingScript.    │
│ Output: scope frozen, axes assigned, run metadata written.    │
└───────────────────────────────────────────────────────────────┘
               │
┌─ PHASE 2: CONTEXT WEAVING ────────────────────────────────────┐
│ Each Knight pulls its slice of the tree:                      │
│   - Route graph: src/app/**/page.tsx                          │
│   - Components:  src/components/**                            │
│   - Shopify lib: src/lib/shopify/**                           │
│   - Public:      public/images/**                             │
│ Compress via SAC > CCF > QFT. No guessing.                    │
└───────────────────────────────────────────────────────────────┘
               │
┌─ PHASE 3: KINETIC IGNITION ───────────────────────────────────┐
│ Read-only audit — no shadow branch needed.                    │
│ Stage TASK.md + VERIFICATION.md scratch files.                │
│ [REQUIRES_RUNTIME] items queued for Phase 4b.                 │
└───────────────────────────────────────────────────────────────┘
               │
┌─ PHASE 4a: SWARM EXECUTION (static) ──────────────────────────┐
│ Knights work axes in parallel. Each finding = one row in      │
│ TASK.md with severity, file:line, and proposed fix sketch.    │
└───────────────────────────────────────────────────────────────┘
               │
┌─ PHASE 4b: SWARM EXECUTION (runtime, optional) ───────────────┐
│ SIR_HELIO drives Lighthouse + axe-core via Playwright.        │
│ SIR_DEBUG runs device matrix. Results merged into TASK.md.    │
└───────────────────────────────────────────────────────────────┘
               │
┌─ PHASE 5: HARMONY GATE ───────────────────────────────────────┐
│ Anya collapses axis reports, dedupes, assigns P0/P1/P2/P3.    │
│ Writes VERIFICATION.md. Appends ledger entry.                 │
│ Iron Gate HITL: user approves before any fix PR is opened.    │
└───────────────────────────────────────────────────────────────┘
```

---

## 4. Severity Rubric

| Sev | Definition | Example | SLA |
|---|---|---|---|
| **P0** | Breaks purchase flow, a11y blocker, data leak | Cart drawer traps focus, Shopify token in client bundle | Same-day fix |
| **P1** | Visible bug, CWV regression, WCAG AA fail | LCP >4s, contrast <4.5:1, customizer color-lock silently bypassed | Within sprint |
| **P2** | Polish, minor copy, non-blocking a11y AAA | Motion not reduced under `prefers-reduced-motion`, missing empty-state art | Next cycle |
| **P3** | Opinion / nice-to-have | Hover micro-interaction refinement | Backlog |

---

## 5. Recyclable-Template Protocol

To re-run this audit on a future commit:

1. `cp -r docs/audits/ docs/audits-{{YYYYMMDD}}/` (or branch it)
2. Update §0 Run Metadata
3. Dispatch the prompt in §1 verbatim to the team in §2
4. Regenerate `TASK.md` and `VERIFICATION.md` in place
5. Append a one-line entry to `PROVENANCE_LEDGER.md` referencing the new Audit ID
6. If a finding from a prior audit is now fixed, move its row to the "Resolved" table in the new `TASK.md` with the fixing commit SHA — this preserves ledger awareness across cycles.

---

## 6. Linked Artifacts

- `./TASK.md` — findings ledger for the current run
- `./VERIFICATION.md` — acceptance criteria + repro
- `../../PROVENANCE_LEDGER.md` — global append-only log
- `../CUSTOMIZER_ARCHITECTURE.md` — prior art on the customizer boundary
- `../SHOPIFY_ADMIN_AUTH_GUIDE.md` — token posture for commerce-integrity axis
