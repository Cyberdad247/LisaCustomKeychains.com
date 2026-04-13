# UI/UX Audit — Verification Ledger

> Template file. Each row in `TASK.md` has a matching section here with acceptance criteria, repro steps, and a sign-off line. Recyclable across audit cycles — overwrite per run, move fully-verified entries into §Sealed.

**Audit ID:** `UIUX-20260413-001`
**Target commit:** `400ca8d`
**Blueprint:** [UIUX_AUDIT_BLUEPRINT.md](./UIUX_AUDIT_BLUEPRINT.md)
**Task ledger:** [TASK.md](./TASK.md)

---

## Verification Protocol

1. A finding is **Acceptable** only when all AC rows are ✅.
2. Each verification must include a **repro command** OR a **manual step-list** — no hand-waving.
3. Runtime checks (Lighthouse, axe, Playwright) must attach output artifacts under `docs/audits/artifacts/{audit_id}/`.
4. Sign-off line format: `VERIFIED: {knight} @ {ISO8601} commit={sha}`.
5. Unverified after 7 days → escalate to Iron Gate HITL review.

---

## V-001 — Mobile menu focus trap (F-001, P1, a11y)

**AC:**
- [ ] Opening menu moves focus to first interactive element inside overlay
- [ ] Tab cycles only within overlay (does not escape to body)
- [ ] Shift+Tab on first element wraps to last
- [ ] Esc closes menu and restores focus to the toggle button
- [ ] axe-core reports zero `aria-hidden-focus` or `focus-trap` violations

**Repro:**
```bash
# Manual
1. Open http://localhost:3000 on viewport 375×667
2. Click hamburger → focus should land on "SHOP"
3. Tab through all 5 items → focus must never leave the overlay
4. Press Esc → menu closes, focus returns to hamburger

# Automated
npx playwright test tests/a11y/nav-focus-trap.spec.ts
npx axe http://localhost:3000 --tags wcag2aa
```

**Sign-off:** _pending_

---

## V-002 — Nav links tab-order leak (F-002, P1, a11y)

**AC:**
- [ ] Pre-scroll (`!isScrolled`), desktop nav links are unreachable by Tab
- [ ] `aria-hidden="true"` present on the motion wrapper when pre-scroll
- [ ] Post-scroll, links re-enter tab order and lose `aria-hidden`
- [ ] No console warnings about focusable descendants of aria-hidden ancestors

**Repro:**
```bash
# DevTools: Elements panel → inspect nav wrapper during scroll
# Lighthouse a11y score must not drop after fix
```

**Sign-off:** _pending_

---

## V-003 — Self-host logo (F-003, P2, perf)

**AC:**
- [ ] `public/brand/logo.png` exists, ≤50KB
- [ ] No references to `i.postimg.cc` in `src/**`
- [ ] LCP on `/` improves by ≥200ms on 3G Fast profile (Lighthouse)
- [ ] Image still renders at correct aspect on all breakpoints

**Sign-off:** _pending_

---

## V-004 — Sport mockup compression (F-004, P2, perf)

**AC:**
- [ ] Each file in `public/images/sports/` ≤ 500KB
- [ ] Visual regression: SSIM ≥ 0.98 vs. original
- [ ] `/sports` LCP improves by ≥300ms on mobile profile
- [ ] No broken images in production build

**Repro:**
```bash
# Compression
for f in public/images/sports/*.jpg; do
  cwebp -q 82 "$f" -o "${f%.jpg}.webp"
done

# Lighthouse mobile
npx lighthouse https://lisa-custom-keychains-com.vercel.app/sports \
  --preset=mobile --output=json --output-path=./lh-sports-after.json
```

**Sign-off:** _pending_

---

## V-005 — Sports keyword DRY (F-005, P1, interaction)

**AC:**
- [ ] `src/lib/constants/sports.ts` exports `SPORTS_KEYWORDS`
- [ ] Both `ProductGallery.tsx` and `sports/page.tsx` import from it
- [ ] `grep -rn "football.*basketball.*soccer" src/` returns only the constants file
- [ ] Sports filter still matches same products as pre-refactor (snapshot test)

**Sign-off:** _pending_

---

## V-006 — About anchor routing (F-006, P2, IA)

**AC:**
- [ ] Clicking About from `/sports` navigates to `/#about` (not a broken in-page anchor)
- [ ] `/#about` scrolls to About section on `/`
- [ ] No console 404s

**Sign-off:** _pending_

---

## V-007 — Sport label contrast (F-007, P2, visual)

**AC:**
- [ ] Worst-case contrast ratio of white label over brightest mockup pixel ≥ 4.5:1
- [ ] Measured via axe or manual dropper on all 4 mockups
- [ ] Fix (if needed) preserves the gradient aesthetic

**Repro:**
```bash
npx axe http://localhost:3000/sports --tags wcag2aa
```

**Sign-off:** _pending_

---

## V-008 — Reduced motion (F-008, P3, motion)

**AC:**
- [ ] With OS `prefers-reduced-motion: reduce`, Navbar morph animates in <100ms or not at all
- [ ] ProductGallery grid entry animations disabled
- [ ] No layout shift introduced by the guard

**Repro:**
```bash
# Chrome DevTools: Rendering tab → Emulate CSS media feature prefers-reduced-motion
```

**Sign-off:** _pending_

---

## V-009 — Shopify dedupe execution (F-009, P1, commerce)

**Blocked on:** `SHOPIFY_ADMIN_API_ACCESS_TOKEN` issuance.

**AC:**
- [ ] Zero duplicate product clusters (measured by normalized title)
- [ ] Dedupe script log committed to `docs/audits/artifacts/{audit_id}/dedupe.log`
- [ ] Product count drops from 43 → expected ~30

**Sign-off:** _blocked_

---

## V-010 — Shopify tag + title hygiene (F-010, P2, commerce)

**Blocked on:** Same token.

**AC:**
- [ ] Zero products with empty `tags` array
- [ ] 35 flagged titles rewritten per `SHOPIFY_CLEANUP_REPORT.md`
- [ ] Spot-check 5 products against Etsy source of truth

**Sign-off:** _blocked_

---

## V-011 — Customizer on iPhone SE (F-011, P1, mobile)

**AC:**
- [ ] Modal opens without horizontal scroll on 375×667
- [ ] All controls (color swatches, charm grid, CTA) reachable without zoom
- [ ] Modal dismiss region ≥44px touch target
- [ ] No content clipped under iOS safe-area

**Repro:**
```bash
npx playwright test --project='iPhone SE' tests/customizer.spec.ts
```

**Sign-off:** _pending_

---

## V-012 — Lighthouse baseline (F-012, P2, perf)

**AC:**
- [ ] `lh-desktop.json` + `lh-mobile.json` committed under `docs/audits/artifacts/{audit_id}/`
- [ ] Performance score ≥ 85 desktop, ≥ 70 mobile
- [ ] Accessibility score ≥ 95
- [ ] Best Practices ≥ 95, SEO ≥ 95

**Sign-off:** _pending_

---

## Sealed (carry-over from prior cycles)

| ID | Finding | Sealed in | Sealed by |
|---|---|---|---|
| V-000 | Sports 4-color lock enforced via `filteredColors.map` | `66ef061` | SIR_FORGE @ 2026-04-13 |

---

## Gate: Harmony Check

Before closing this audit cycle, Anya_Omega runs:

```
[ ] All P0 findings resolved or explicitly waived
[ ] All P1 findings resolved, waived, or marked blocked with owner
[ ] Ledger entry appended to PROVENANCE_LEDGER.md
[ ] Artifacts archived under docs/audits/artifacts/{audit_id}/
[ ] Next-cycle recommendations drafted in TASK.md §Resolved notes
```

Only when all five are ✅ does the audit seal and the blueprint version may bump.
