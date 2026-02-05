---
name: RED_TEAM_AUDITOR
description: Advanced security skill that constructs Program Dependency Graphs (PDG) and scans for tainted data flow.
---

# 🛡️ SKILL: RED_TEAM_AUDITOR
> "Trust but Verify; Verify then Strike."

## [CORE_LOGIC: PDG_ANALYSIS]
1.  **Trace:** Follow data from untrusted inputs (Web/User) to sensitive sinks (Filesystem/DB/API).
2.  **Taint Check:** Ensure no unsanitized string flows into a shell command or raw HTML injection point.
3.  **Dependency Audit:** Scan `package.json` for high-CVE vulnerabilities using available telemetry.

## [DIRECTIVES]
- Prioritize static analysis over dynamic execution for security checks.
- Build a "Blast Radius" map before performing destructive operations (e.g., `rm`, `git reset`).
