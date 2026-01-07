---
description: BLUEPRINT_FORGE - Standardized Aspect Integration Workflow for engineering new features into Camelot OS
---

# 🏰 BLUEPRINT_FORGE: Aspect Integration Workflow

**Version:** v56.5 TITANIUM  
**Author:** Lukas Swarm (Invisioned Marketing Inc.)

---

## 📋 Prerequisites

Before invoking this workflow, ensure:

1. You are in the project root: `c:\Users\vizio\workspace\Lisacustomkeychains`
2. You have a clear feature specification
3. The dev server is NOT running (to avoid build conflicts)

---

## 🔧 Phase 1: RECONNAISSANCE (SIR_SYSTÉMA)

1. **Audit the current architecture**:

   - Review `CAMELOT_OS_MANIFEST.md` for active directives
   - Review `PROVENANCE_LEDGER.md` for recent changes
   - Identify affected domains (lib, components, app)

2. **Check Titanium Law compliance**:
   - Verify `tsconfig.json` has `strict: true`
   - Ensure no `any` types in target files
   - Confirm Zod schemas use `issues?.[0]?.message` pattern

---

## 🔨 Phase 2: SCHEMA DEFINITION (SIR_OCTAVIAN)

1. **Create or update Zod schemas** in `src/lib/validation/`:

   ```typescript
   import { z } from "zod";

   export const FeatureSchema = z.object({
     // Define strict types - NO optional unless required
   });
   ```

2. **Export validation wrapper**:

   ```typescript
   import { sovereignValidate } from "@/lib/camelot";

   export const validateFeature = (data: unknown) =>
     sovereignValidate(FeatureSchema, data);
   ```

---

## 🎨 Phase 3: COMPONENT ASSEMBLY (SIR_SYNTAX)

1. **Create component in `src/components/`**:

   - Use `'use client'` directive for interactive components
   - Import types from `src/lib/types.ts`
   - Use Framer Motion for animations

2. **Apply visual standards**:
   - Use Tailwind classes from design system
   - Follow existing Polaroid/organic aesthetic
   - Ensure mobile-first responsive design

---

## 🔗 Phase 4: INTEGRATION (SIR_KINETIC)

1. **Wire up to App Router**:

   - Create route in `src/app/[feature]/page.tsx`
   - Add metadata for SEO
   - Connect to data layer

2. **Register in navigation** (if applicable):
   - Update `src/components/Navbar.tsx`

---

## 🛡️ Phase 5: VERIFICATION (SIR_SENTRY)

// turbo

1. **Run local build**:
   ```powershell
   npm run build
   ```

// turbo 2. **Run linter**:

```powershell
npm run lint
```

3. **Verify routes manually**:
   - Open `http://localhost:3333`
   - Test new feature end-to-end

---

## 📖 Phase 6: LEDGER UPDATE

1. **Update `PROVENANCE_LEDGER.md`** with new entry:

   ```markdown
   | XXX | **Feat: [Name]** | Hive (Knight) | ⏳ PENDING | [Description] |
   ```

2. **Commit with semantic message**:
   ```
   feat(scope): description [Ω_KINETIC]
   ```

---

## 🚀 Phase 7: DEPLOYMENT

Follow `/deploy` workflow for production push.

---

## ⚠️ TITANIUM LAWS CHECKLIST

Before completing, verify:

- [ ] **Law 1**: No `any` types introduced
- [ ] **Law 2**: All Zod errors use `issues?.[0]?.message`
- [ ] **Law 3**: Client-side validation for critical paths
- [ ] **Law 5**: Code follows Shard → Scratchpad → Stitch pattern

---

_Made by Invisioned Marketing Inc._
