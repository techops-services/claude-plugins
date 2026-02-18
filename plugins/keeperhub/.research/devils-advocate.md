# Devil's Advocate Analysis: KeeperHub Claude Code Plugin

Analysis date: 2026-02-18
Scope: Auth flow, MCP integration, skill design, app changes, missing pieces

---

## Critical (must fix before release)

### C1. MCP .mcp.json uses npx but keeperhub-mcp is not on npm

**Problem**: The `.mcp.json` in the plugin specifies:
```json
{ "command": "npx", "args": ["-y", "keeperhub-mcp@latest"] }
```
But `keeperhub-mcp` is not published to npm. The package name in `keeperhub-mcp/package.json` is `"keeperhub-mcp"` with no npm registry configuration. Running `npx keeperhub-mcp` will fail with a 404.

**Impact**: The plugin's MCP integration is completely non-functional out of the box. Every user who installs this plugin will get an error when Claude Code tries to start the MCP server.

**Fix**: Three options, in order of recommendation:
1. **Use the Docker approach** (already proven to work). The `.mcp.json.back` file in keeperhub shows the production config uses `ghcr.io/techops-services/keeperhub-mcp:latest`. Use this instead:
   ```json
   {
     "command": "docker",
     "args": ["run", "-i", "--rm", "-e", "KEEPERHUB_API_KEY", "ghcr.io/techops-services/keeperhub-mcp:latest"]
   }
   ```
2. **Use a local path with tsx** for dev/early adopters: `"command": "npx", "args": ["tsx", "/path/to/keeperhub-mcp/src/index.ts"]` -- but this requires the repo cloned locally.
3. **Publish to npm** before release -- but this requires npm credentials, CI setup, and versioning.

### C2. Two different API key systems with prefix mismatch

**Problem**: There are TWO separate API key tables and systems in KeeperHub:

| Table | Prefix | Scope | Route |
|-------|--------|-------|-------|
| `apiKeys` (main schema) | `wfb_` | User-scoped | `/api/api-keys` |
| `organizationApiKeys` (keeperhub extension) | `kh_` | Organization-scoped | `/keeperhub/api/keys` (via rewrites) |

The MCP server's `api-key-auth.ts` validates keys starting with `kh_` (organization keys). But the login command instructs users to get a key starting with `wfb_` and points them to `/settings/api-keys` (a page for user-scoped keys that uses the wrong table).

**Impact**: Users following the login flow will get a `wfb_` key, which the MCP server will reject because `api-key-auth.ts` checks for `kh_` prefix. Authentication will silently fail.

**Fix**:
1. The login command must create/use organization-scoped keys (`kh_` prefix) via the `keeperhub/api/keys` endpoint (likely mounted at `/api/keys` via Next.js rewrites)
2. The login command should validate keys start with `kh_`, not `wfb_`
3. The login command's reference to `/settings/api-keys` is wrong -- this page does not exist. Users need a different path to generate organization keys.

### C3. No /settings/api-keys page exists in the app

**Problem**: The login command tells users to visit `https://app.keeperhub.com/settings/api-keys` to create an API key. This page does not exist:
- No `settings` directory under `app/` or `keeperhub/app/`
- No `page.tsx` files related to settings or API keys
- Settings are rendered as overlays (see `components/overlays/settings-overlay.tsx`), not pages
- The settings overlay currently only shows Account, Change Password, and Deactivate Account sections -- no API keys management

**Impact**: Users will land on a 404 page. There is no UI anywhere in the app to create or manage organization-scoped API keys. The only way to create them is via API call.

**Fix** (two approaches):
1. **Add an API Keys section to the settings overlay** -- add a component similar to `keeperhub/components/settings/sendgrid-connection-section.tsx` that calls the `keeperhub/api/keys` endpoints. This is the right long-term fix.
2. **Change the login command** to create the key programmatically via API (requires the user to authenticate in-browser first, then use that session to call the key creation endpoint). This is a chicken-and-egg problem.

### C4. KEEPERHUB_API_KEY env var required at MCP startup (chicken-and-egg)

**Problem**: The MCP server exits immediately if `KEEPERHUB_API_KEY` is not set (`src/index.ts` line 75-78: `process.exit(1)`). But the plugin's login command is supposed to help users obtain this key. If the MCP server can't start without the key, users can't use MCP tools to interact with KeeperHub to get the key.

**Impact**: There is a circular dependency: you need the key to start the MCP server, but you need to be authenticated to get the key. The login command works around this with `curl`, but the MCP tools will show as unavailable until the user restarts Claude Code with the env var set.

**Fix**:
1. The login command must explicitly tell users they need to restart Claude Code (or reload the MCP config) after setting the env var
2. Consider making the MCP server start in a "degraded" mode without the key, where it only exposes a `setup` tool that guides through auth
3. Document this ordering requirement clearly in README/login output

---

## Important (should fix soon)

### I1. Config file stores API key but MCP reads env var -- sync gap

**Problem**: The login command saves the key to `~/.config/keeperhub/config.json`. But the MCP server reads `KEEPERHUB_API_KEY` from environment variables. There is no mechanism to bridge these two -- the config file is never read by the MCP server.

**Impact**: After login, the MCP server still won't work until the user manually exports the env var. The config file creates a false sense of completion.

**Fix**:
1. Either make the MCP server also check `~/.config/keeperhub/config.json` as a fallback
2. Or make the login command write to the shell profile directly (with user permission)
3. Or have the login command update `.claude/settings.json` or `.mcp.json` with the key (Claude Code supports `${env:VAR}` syntax in MCP configs)

### I2. No API key expiration handling in the plugin

**Problem**: The `organizationApiKeys` table has `expiresAt` and `revokedAt` columns. The `api-key-auth.ts` correctly checks both. But the plugin has no mechanism to detect or handle expired/revoked keys. The MCP server will just get 401 errors, and the error message ("Invalid or revoked API key") will bubble up cryptically.

**Impact**: When a key expires or is revoked, users will see confusing MCP tool errors with no guidance on how to fix them. They won't know to run `/keeperhub:login` again.

**Fix**:
1. Add a hook or periodic check that validates the API key
2. The status command should check key validity and warn about expiration
3. MCP server error responses should include actionable messages ("Run /keeperhub:login to re-authenticate")

### I3. SQLite database path is relative to `__dirname` inside dist/

**Problem**: In `keeperhub-mcp/src/index.ts` line 104:
```javascript
const dbPath = path.join(__dirname, '../plugins.db');
```
This resolves to `keeperhub-mcp/plugins.db` when running from source (`dist/../plugins.db`). But when running via Docker or npx, the database path will vary:
- Docker: inside the container filesystem (lost on container restart with `--rm`)
- npx: in a temporary npx cache directory (lost on next npx run)

**Impact**: Plugin and template data stored in SQLite will be lost every time the MCP server restarts. This means `search_plugins`, `get_plugin`, and `search_templates` will return empty results unless the index is rebuilt each time.

**Fix**:
1. For Docker: mount a volume for the database file
2. For any runtime: use `~/.config/keeperhub/plugins.db` or `$XDG_DATA_HOME/keeperhub/plugins.db` as the database path
3. Make the database path configurable via `KEEPERHUB_DB_PATH` env var

### I4. Cloudflare Access blocks CLI-initiated requests

**Problem**: The MCP server supports Cloudflare Access credentials (`CF_ACCESS_CLIENT_ID`, `CF_ACCESS_CLIENT_SECRET` in `src/index.ts` lines 71-74). This suggests that some environments (staging, internal) are behind Cloudflare Access. The login command uses `curl` to verify the key against `app.keeperhub.com`, which may be behind Cloudflare Access.

**Impact**: If the target environment is behind Cloudflare Access, the `curl` verification in the login command will fail (likely a 403 from Cloudflare). Users in those environments cannot complete setup. The MCP `.mcp.json` also has no way to pass CF Access credentials.

**Fix**:
1. The MCP `.mcp.json` should support CF Access env vars:
   ```json
   "env": {
     "KEEPERHUB_API_KEY": "${KEEPERHUB_API_KEY}",
     "CF_ACCESS_CLIENT_ID": "${CF_ACCESS_CLIENT_ID}",
     "CF_ACCESS_CLIENT_SECRET": "${CF_ACCESS_CLIENT_SECRET}"
   }
   ```
2. The login command should accept a `--url` flag or detect CF Access 403 responses and prompt for credentials
3. The config file should store the base URL and CF Access credentials

### I5. Login command opens non-existent browser URL

**Problem**: The login flow instructs users to open `https://app.keeperhub.com/settings/api-keys`. This assumes a specific app URL (production). There is no support for:
- Custom environments (staging, localhost dev)
- Self-hosted instances
- The URL also does not exist (see C3)

**Impact**: Users on non-production environments cannot use the login flow at all.

**Fix**:
1. Make the login command accept an optional `--url` argument
2. Store the base URL in `~/.config/keeperhub/config.json` (already partially done)
3. Default to `https://app.keeperhub.com` but allow override

### I6. verify-auth.sh script is empty

**Problem**: The file `scripts/verify-auth.sh` exists but is empty (1 line only). This script is likely referenced by commands or hooks for auth verification.

**Impact**: Any process depending on this script for auth checks will silently pass (empty script exits 0).

**Fix**: Implement the script or remove the file if not needed.

---

## Nice-to-Have (v2 improvements)

### N1. No "getting started" skill or onboarding flow

**Problem**: The four skills (workflow-builder, template-browser, execution-monitor, plugin-explorer) assume the user already understands KeeperHub concepts. There is no guided onboarding that explains what KeeperHub is, what plugins/chains are available, or how to build their first workflow.

**Impact**: New users will struggle to know which skill to invoke first. The MCP tools have 17+ tools, which is overwhelming without guidance.

**Fix**: Consider adding a `getting-started` skill that:
- Checks auth status
- Lists available plugins and integrations
- Suggests a simple first workflow based on what the user has configured
- Links to documentation

### N2. No hooks defined (pre/post tool execution)

**Problem**: Claude Code plugins support hooks for pre/post tool execution. None are defined. Hooks could:
- Auto-check auth before MCP tool calls
- Refresh the MCP server if the API key changes
- Validate workflow configs before creation

**Impact**: Missed opportunity for better UX, but not blocking.

### N3. No agent defined

**Problem**: Claude Code plugins support agent configurations. No agent is defined. An agent could provide persistent context about the user's KeeperHub setup (available integrations, chains, organization info).

**Impact**: Each conversation starts without context about the user's KeeperHub setup.

### N4. No upgrade/update mechanism

**Problem**: Once the plugin is installed, there is no mechanism to update it. If tool definitions change, skills are added, or the MCP server is updated, the user must manually update.

**Impact**: Users may run outdated plugin versions with missing features or bugs.

### N5. Four skills may be too many for v1

**Problem**: Four skills (workflow-builder, template-browser, execution-monitor, plugin-explorer) each need significant MCP tool interaction. But several overlap:
- `template-browser` is essentially `workflow-builder` with a template starting point
- `plugin-explorer` is a reference tool that `workflow-builder` should naturally call

**Impact**: Users may not know which skill to use, and maintaining four skill prompts adds surface area for bugs.

**Fix**: Consider consolidating to 2 skills for v1:
1. `workflow` -- handles building, templates, and plugin discovery
2. `monitor` -- handles execution status and logs

### N6. MCP server cold start time with Docker

**Problem**: The `.mcp.json.back` uses `--pull=always` which means every MCP server start will attempt to pull the latest Docker image. Combined with the `--rm` flag (container removed after use), this means:
- First start: full image pull (could be 100MB+)
- Subsequent starts: pull check + container creation
- SQLite database recreated every time (see I3)

**Impact**: Users experience slow first-time setup and potential timeouts.

---

## Summary of Action Items

| Priority | ID | One-line summary |
|----------|-----|-----------------|
| CRITICAL | C1 | Fix MCP .mcp.json -- npx won't work, use Docker or publish to npm |
| CRITICAL | C2 | Fix key prefix mismatch -- login creates wfb_ but MCP expects kh_ |
| CRITICAL | C3 | No /settings/api-keys page exists -- need UI or alternative flow |
| CRITICAL | C4 | MCP server won't start without key -- document restart requirement |
| IMPORTANT | I1 | Config file and env var are disconnected -- bridge them |
| IMPORTANT | I2 | No expired/revoked key handling in plugin |
| IMPORTANT | I3 | SQLite database lost on Docker/npx restart |
| IMPORTANT | I4 | Cloudflare Access blocks CLI requests in some environments |
| IMPORTANT | I5 | Login command hardcodes production URL |
| IMPORTANT | I6 | verify-auth.sh is empty |
| NICE | N1 | No onboarding/getting-started skill |
| NICE | N2 | No hooks for auto auth checks |
| NICE | N3 | No agent defined |
| NICE | N4 | No upgrade mechanism |
| NICE | N5 | Consider consolidating 4 skills to 2 |
| NICE | N6 | Docker cold start time concern |
