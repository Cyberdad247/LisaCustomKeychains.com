# UI/UX Audit — Task Ledger

> Template file. One `TASK.md` per audit cycle. Findings below are from the **initial** run; future cycles overwrite this table and move resolved rows into §Resolved.

**Audit ID:** `UIUX-20260413-001`
**Target commit:** `400ca8d` (main)
**Target deploy:** https://lisa-custom-keychains-com.vercel.app
**Run started:** 2026-04-13
**Blueprint:** [UIUX_AUDIT_BLUEPRINT.md](./UIUX_AUDIT_BLUEPRINT.md)

---

## Open Findings

| ID | Sev | Axis | Finding | Location | Proposed Fix | Owner | Status |
|---|---|---|---|---|---|---|---|
| F-001 | P1 | A11y | Mobile menu overlay lacks focus trap; tab escapes to body behind | `src/components/Navbar.tsx:130-154` | Wrap in `<FocusTrap>` or manage focus with `useEffect` on open | SIR_SENTINEL | open |
| F-002 | P1 | A11y | Nav morph hides links behind `pointer-events-none` pre-scroll but they remain in tab order via `pointer-events-auto` on inner motion div | `src/components/Navbar.tsx:34-52` | Toggle `tabIndex={-1}` and `aria-hidden` when `!isScrolled` | SIR_SENTINEL | open |
| F-003 | P2 | Perf | Logo sourced from `i.postimg.cc` — third-party, no local fallback, blocks LCP on cold cache | `src/components/Navbar.tsx:63` | Self-host in `public/brand/logo.png`, use `next/image` with `priority` | SIR_HELIO | open |
| F-004 | P2 | Perf | Sports mockup JPGs total ~20MB, served as-is via `next/image` | `public/images/sports/*.jpg` | Pre-compress to ≤500KB each (WebP preferred), or downscale to 1200px max | SIR_HELIO | open |
| F-005 | P1 | Interaction | `ProductGallery` sports filter duplicates the same keyword list as `/sports/page.tsx` — drift risk | `src/components/ProductGallery.tsx:36-38` vs `src/app/sports/page.tsx:16-19` | Extract `SPORTS_KEYWORDS` to `src/lib/constants/sports.ts` | SIR_FORGE | open |
| F-006 | P2 | IA | `/sports` exists in Navbar but has no breadcrumb back to `/`; `About` link points to `#about` which only exists on `/` | `src/components/Navbar.tsx:98,151` | Make About a full URL `/#about` or gate by route | SIR_BORIS | open |
| F-007 | P2 | Visual | Decorative sport labels rely on gradient-over-image — contrast untested on brightest mockup pixels | `src/app/sports/page.tsx:89-108` | Add solid scrim or measure contrast against worst-case pixel | SIR_SONUS | open |
| F-008 | P3 | Motion | No `prefers-reduced-motion` guard on framer-motion Navbar morph or ProductGallery grid entry | `src/components/Navbar.tsx:44-76`, `src/components/ProductGallery.tsx:77-95` | Wrap with `useReducedMotion()` from framer-motion | SIR_SONUS | open |
| F-009 | P1 | Commerce | Shopify catalog contains 5 duplicate clusters (largest: 9 copies of "Splashy with Soul") — documented in `SHOPIFY_CLEANUP_REPORT.md`, not yet executed | Shopify admin | Requires `SHOPIFY_ADMIN_API_ACCESS_TOKEN` → run dedupe script | LADY_APIS | blocked |
| F-010 | P2 | Commerce | 15 products have empty tags; 35 titles flagged for rewrite | Shopify admin | Bulk update via Admin API once token is issued | LADY_APIS | blocked |
| F-011 | P1 | Mobile | Customizer modal on <375px viewports — verify sheet height + scroll | `src/components/customize/KeychainCustomizer.tsx` | [REQUIRES_RUNTIME] test on iPhone SE profile | SIR_DEBUG | open |
| F-012 | P2 | Perf | No Lighthouse baseline captured for current deploy | — | [REQUIRES_RUNTIME] `npx lighthouse {prodUrl} --preset=desktop` | SIR_HELIO | open |

---

## Resolved (carry-over from prior cycles)

| ID | Sev | Axis | Finding | Fixed in | Verified by |
|---|---|---|---|---|---|
| F-000 | P1 | Interaction | Sports customizer did not enforce 4-color lock — used full `THREAD_COLORS` | `66ef061` | VERIFICATION.md §V-000 |

---

## [REQUIRES_RUNTIME] Queue

Runtime verifications pending a headed browser / Lighthouse / device matrix pass.

```bash
# F-011 — iPhone SE customizer
npx playwright test --project='iPhone SE' tests/customizer.spec.ts

# F-012 — Lighthouse baseline
npx lighthouse https://lisa-custom-keychains-com.vercel.app \
  --preset=desktop --output=json --output-path=./docs/audits/lh-desktop.json
npx lighthouse https://lisa-custom-keychains-com.vercel.app \
  --preset=mobile  --output=json --output-path=./docs/audits/lh-mobile.json
```

---

## Ledger Entry (append to PROVENANCE_LEDGER.md)

```
[2026-04-13][Omega_AUDIT] UIUX-20260413-001 — 12 findings (2 P1 a11y, 2 P1 commerce blocked on token, 1 P1 mobile runtime-pending). Blueprint v1.0. Target: 400ca8d.
```
