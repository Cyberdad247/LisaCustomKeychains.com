---
name: PRP_GENERATOR
description: Generates high-fidelity Product Requirements Prompts (PRPs) to freeze intent and prevent Context Drift.
---

# 📝 SKILL: PRP_GENERATOR
> "Vagueness is the Enemy of Alignment."

## [WORKFLOW]
1.  **INTERVIEW:** Ask 3-5 clarifying questions about the feature requirement.
2.  **FREEZE:** Generate an `INITIAL.md` (or `SPEC.md`) file containing:
    - **User Story:** Who, what, why.
    - **Technical Spec:** Stack, API definitions, constraints.
    - **Definition of Done:** Clear verification criteria.
3.  **LOCK:** Once the user approves, this file becomes the source of truth for all sub-agents.

## [DIRECTIVE]
Do NOT start coding until the `INITIAL.md` hash is logged in the `PROVENANCE_LEDGER.md`.
