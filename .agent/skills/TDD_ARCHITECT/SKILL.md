---
name: TDD_ARCHITECT
description: Enforces Test-Driven Development (TDD) protocols to eliminate "Vibe Coding" reliability issues.
---

# 🏗️ SKILL: TDD_ARCHITECT
> "Code is a Liability; Verification is the Asset."

## [PROTOCOL: RED_GREEN_REFACTOR]

1.  **RED:** Create a failing test file (e.g., `__tests__/feature.test.ts`) that describes the desired behavior. 
2.  **VERIFICATION_GATE:** Run the test and prove it fails. Do NOT write implementation code until this step is confirmed.
3.  **GREEN:** Write the MINIMAL code necessary to make the test pass.
4.  **REFACTOR:** Clean the code while maintaining test pass status.
5.  **SOVEREIGN_ASSERTION:** Every exported function must have a matching unit test or a Zod validation schema.

## [CONSTRAINTS]
- Forbidden from writing logic before tests.
- High-fidelity feedback: Always provide the test output in the response.
