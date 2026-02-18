# KeeperHub App Changes Analysis

Analysis based on devil's advocate findings, researcher context, and direct code review.

---

## 1. API Keys: Two Systems, One Plugin

KeeperHub has TWO separate API key systems:

| System | Prefix | Table | Route | Scope |
|--------|--------|-------|-------|-------|
| User keys | `wfb_` | `apiKeys` | `/api/api-keys` | User-scoped |
| Organization keys | `kh_` | `organizationApiKeys` | `/api/keeperhub/keys` | Organization-scoped |

The MCP server's `authenticateApiKey()` in `keeperhub/lib/api-key-auth.ts` explicitly
validates that keys start with `kh_` and queries the `organizationApiKeys` table.

**Decision**: The plugin must use organization keys (`kh_` prefix) via `/api/keeperhub/keys`.
The user-scoped `wfb_` keys are for a different purpose and will not work with MCP.

## 2. API Keys UI: Already Exists

The API Keys overlay exists at `components/overlays/api-keys-overlay.tsx` and is accessible
from the user menu in the sidebar (click profile -> "API Keys"). It supports:
- Organisation and User tabs
- Listing keys with prefix, name, creator, and last-used date
- Creating new keys ("New API Key" button)
- Deleting keys

**No app changes needed** for the basic auth flow. The login command directs users to
this overlay with step-by-step instructions.

**Nice-to-have**: A "Claude Code Setup" button that pre-fills the name as "Claude Code Plugin".

## 3. CLI Auth Endpoint (v2)

Currently there is no device-code-style auth flow like `gh auth login`. The available flow is:
1. User authenticates in browser (session-based via better-auth)
2. User navigates to settings and creates an org API key
3. User copies the key to their CLI environment

A dedicated CLI auth endpoint would enable:
- `POST /api/auth/cli-token` -- generate a temporary code
- Browser-based approval page
- CLI polls for approved key

**Priority**: NICE-TO-HAVE for v2. The manual key flow is sufficient for v1.

## 4. API Key Naming

The POST `/api/keeperhub/keys` endpoint accepts:
- `name` (optional string) -- for labeling the key
- `expiresAt` (optional date) -- for key expiration

The login command should use `name: "Claude Code Plugin"` to help users identify
which key is for their CLI integration.

## 5. CORS/Auth for External CLI Tools

The MCP server already uses Bearer token auth successfully. All API routes under
`/api/keeperhub/` support this pattern. The `authenticateApiKey()` middleware extracts
the Bearer token from the Authorization header.

Cloudflare Access: Some environments may be behind CF Access. The MCP server supports
`CF_ACCESS_CLIENT_ID` and `CF_ACCESS_CLIENT_SECRET` env vars. The plugin's .mcp.json
should include these as optional env vars.

## 6. Critical Plugin Fixes Required

Based on this analysis, the following files need correction:

### login.md
- Change key prefix from `wfb_` to `kh_`
- Change URL from `/settings/api-keys` to correct path (or explain no UI exists yet)
- Verify key against `/api/workflows?limit=1` (this uses API key auth via middleware)

### .mcp.json
- npx approach won't work (keeperhub-mcp not on npm)
- Options: local path with tsx, or placeholder noting this needs npm publish first

### verify-auth.sh
- Key prefix validation should check for `kh_` not `wfb_`

---

## Summary of App Changes Needed

| Change | Priority | Effort | Description |
|--------|----------|--------|-------------|
| API Keys settings section | HIGH | Medium | Add key management UI to settings overlay |
| Fix plugin key prefix | CRITICAL | Low | Change wfb_ to kh_ in login command |
| Fix plugin URL | CRITICAL | Low | Remove reference to non-existent /settings/api-keys |
| Publish keeperhub-mcp to npm | HIGH | Medium | Enable npx installation in .mcp.json |
| CLI auth endpoint | LOW | High | Device code flow for v2 |
| CF Access in .mcp.json | MEDIUM | Low | Add optional CF env vars |
