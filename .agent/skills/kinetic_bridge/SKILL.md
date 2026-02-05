---
name: kinetic-bridge
description: Access high-performance local tools (Cribo, Saltare, Rotel) via CLI. Use for file ops, searching, and telemetry.
---

# KINETIC BRIDGE PROTOCOL
You do not use standard Python file tools. You use **Kinetic Binaries**.

## TOOLS
1. **CRIBO (Bundler):**  
   - Cmd: `cribo --tree-shake --entry src/main.py`  
   - Use: When asked to "read the code" or "understand the repo".
2. **SALTARE (Gateway):**  
   - Cmd: `curl -X POST http://localhost:8080/api/v1/tools/execute -d '{"query": "..."}'`  
   - Use: For ALL external tool calls (Weather, GitHub, Brave Search).
3. **ROTEL (Telemetry):**  
   - Cmd: `rotel --snapshot`  
   - Use: To check system health (RAM/CPU) before running heavy tasks.
