---
description: Check KeeperHub authentication status, API connectivity, and MCP server availability.
allowed-tools: [Bash, Read]
---

<security>
CRITICAL: NEVER read, cat, echo, or display the config file contents or the API key.
NEVER construct Bash commands that contain the API key literal.
Use verify-auth.sh for all API connectivity checks -- it handles the key internally.
</security>

<objective>
Show the current status of the KeeperHub plugin: authentication state, API connectivity,
and whether the MCP server is installed. Provide actionable next steps if anything is misconfigured.
</objective>

<context>
API key env var set: !`[ -n "${KEEPERHUB_API_KEY:-}" ] && echo "YES" || echo "NO"`
API key prefix valid: !`[[ "${KEEPERHUB_API_KEY:-}" == kh_* ]] && echo "YES" || echo "NO"`
Config file exists: !`test -f ~/.claude/keeperhub/config.json && echo "YES" || echo "NO"`
Config has valid key: !`test -f ~/.claude/keeperhub/config.json && grep -q '"apiKey".*"kh_' ~/.claude/keeperhub/config.json && echo "YES" || echo "NO"`
MCP server installed: !`test -f ~/.claude/keeperhub/mcp-server/src/index.ts && echo "INSTALLED" || echo "NOT_INSTALLED"`
MCP deps present: !`test -d ~/.claude/keeperhub/mcp-server/node_modules && echo "YES" || echo "NO"`
Base URL: !`echo ${KEEPERHUB_API_URL:-https://app.keeperhub.com}`
Verify script exists: !`test -x "${CLAUDE_PLUGIN_ROOT}/scripts/verify-auth.sh" && echo "YES" || echo "NO"`
</context>

<process>
1. **Determine auth source** from context:
   - If `KEEPERHUB_API_KEY` env var is "YES", note "Auth source: environment variable"
   - Else if config file exists is "YES" and config has valid key is "YES", note "Auth source: config file"
   - Else report "Not authenticated" and suggest running `/keeperhub:login`

2. **Test API connection** using verify-auth.sh (NEVER use inline curl with the key):
   ```bash
   bash "${CLAUDE_PLUGIN_ROOT}/scripts/verify-auth.sh"
   ```
   - If output contains "OK": API is connected and key is valid
   - If output contains "ERROR": report the specific error (invalid key, connection failed, etc.)

3. **Check MCP server availability** from context values above (no additional commands needed)

4. **Present a status summary** (NEVER include any part of the API key):
   ```
   KeeperHub Status
   ----------------
   Auth:       [Authenticated / Not authenticated]
   Key source: [env var / config file / none]
   Key:        [Configured / Not configured]
   API:        [Connected / Unreachable / Auth failed]
   MCP server: [Installed / Not installed]
   Base URL:   https://app.keeperhub.com
   Config:     ~/.claude/keeperhub/config.json
   ```

5. **Suggest next steps** if anything is wrong:
   - No auth: run `/keeperhub:login`
   - Auth failed: key may be revoked, run `/keeperhub:login` to set up a new one
   - MCP not installed: run `/keeperhub:login` to auto-install
</process>

<success_criteria>
- Clear status summary displayed
- API key NEVER displayed in any form (no prefix, no characters, no partial mask)
- API connectivity tested via verify-auth.sh only (not inline curl)
- Actionable suggestions for any issues found
</success_criteria>
