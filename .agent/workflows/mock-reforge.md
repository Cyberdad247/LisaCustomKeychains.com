---
description: Automatically reforge raw data into one of the 5 Singularity Lattice mock formats.
---

# /mock-reforge: MOCK_ENGINE_ACTIVATION

Use this workflow to transform flat JSON or raw text into a high-fidelity "Variable Mock" for testing.

## Protocol

1. **[🔮Scry] Intent Analysis**
   - Identify the target component (e.g., `ProductCard`, `CartDrawer`).
   - Analyze the existing data schema.

2. **[🔥Burn] Format Selection**
   - Choose the most relevant format based on the source:
     - **JSON-LD**: For complex entity relationships.
     - **Zustand Snapshot**: For full app state state-testing.
     - **Async Generator**: For time-sensitive/kinetic UI logic.
     - **MDX**: For content-rich layout testing.
     - **Variant Map**: For theme/visual logic testing.

3. **[⚡Strike] Refactor Execution**
   - Create the mock file in `src/mocks/`.
   - Update the target component to optionally accept the mock data during development.

4. **[💾Sync] Integration**
   - Log the new mock entity in `workflows.md` and `PROVENANCE_LEDGER.md`.
   - Update `PLAN.md` if this is part of a larger feature build.

## Activation Rune
"The Lattice is hungry. Feed the data, Merlin. Actuate /mock-reforge."
