# EMC Cartridge V1 Production Contract

## Cartridge Decode

`[Omega_TITAN_V1000]::[EMC_CARTRIDGE_V1]` defines the next production lane for Lisa's Custom Keychains: a high-performance Next.js storefront with Shopify-sourced product customization, measurable accessibility, dashboard telemetry, and Vercel edge deployment.

## Target Stack

- **Reasoning layer**: BitNet-style lightweight local planning, Z3-like constraint checks, and CRDT-safe state snapshots for design choices.
- **Frontend**: Next.js App Router with static generation where product data is stable and server actions for mutations.
- **Commerce**: Shopify GraphQL as product and cart source of truth, including product attributes/metafields for customization.
- **Preview UX**: dynamic flexbox-based keychain preview with real-time text, color, charm, and image-state updates.
- **Operations**: Vercel KV dashboard metrics, webhook-triggered revalidation, edge cache validation, GitHub CI, Vitest, and Lighthouse.

## Implementation Milestones

1. **AST Parse & Current-State Audit**
   - Inspect `src/app`, `src/components/customize`, `src/lib/shopify.ts`, and validation schemas.
   - Record existing routes, client components, server components, and Shopify data contracts.

2. **Shopify Attribute Contract**
   - Extend Shopify GraphQL mapping for customization attributes or metafields.
   - Validate all customizer input with Zod before cart or checkout handoff.
   - Keep `.env.local` secrets local; never move tokens into source.

3. **Dynamic Preview Upgrade**
   - Promote `KeychainCustomizer` / `KeychainBuilder` into a stable preview engine.
   - Support responsive flexbox layout, keyboard-friendly controls, and empty-state fallbacks.
   - Preserve premium physical-product feel without blocking checkout.

4. **Revalidation & Edge Cache**
   - Add a Shopify webhook route that verifies requests and calls `revalidatePath` or `revalidateTag`.
   - Use server actions only for trusted mutations.
   - Document cache behavior for product, collection, and customizer routes.

5. **Dashboard & Telemetry**
   - Add an internal Vercel KV-backed status panel for product sync, webhook activity, and build health.
   - Treat KV as operational telemetry, not product source of truth.

6. **Production Gates**
   - `npm test`
   - `npm run build`
   - Shopify CLI probe against `jgvme0-av.myshopify.com`
   - Lighthouse target: 99 performance/accessibility where feasible; hard floor is no critical regressions.
   - WCAG AAA math pass for text contrast on primary purchase/customization flows.

## Acceptance Criteria

- Shopify remains the single source of truth for product data.
- Customization state is deterministic, validated, and recoverable.
- Product pages and key customization flows are mobile-first and accessible.
- Webhook revalidation updates storefront data without manual redeploy.
- CI blocks failed tests or failed production builds.
- Production deployment evidence is appended to `PROVENANCE_LEDGER.md`.

## First Practical Build Move

Start with the Shopify attribute contract and preview-state schema. This is the dependency for the customizer UI, checkout handoff, webhook revalidation, and dashboard telemetry.
