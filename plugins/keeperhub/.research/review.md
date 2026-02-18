# Plugin Review Report

Reviewer: reviewer agent
Date: 2026-02-18

## Checklist Results

### 1. Plugin structure matches Claude Code plugin spec
**PASS**

Directory layout is correct:
- `.claude-plugin/plugin.json` at the right location
- `commands/` at plugin root (not inside `.claude-plugin/`)
- `skills/` at plugin root (not inside `.claude-plugin/`)
- `.mcp.json` at plugin root
- `scripts/` at plugin root
- `README.md` at plugin root
- `.research/` for internal docs

Matches the share plugin's structure pattern exactly.

### 2. All SKILL.md files have correct frontmatter
**PASS**

All four skills have valid YAML frontmatter with required `name` and `description` fields:
- `skills/workflow-builder/SKILL.md` -- name: workflow-builder, description: present
- `skills/template-browser/SKILL.md` -- name: template-browser, description: present
- `skills/execution-monitor/SKILL.md` -- name: execution-monitor, description: present
- `skills/plugin-explorer/SKILL.md` -- name: plugin-explorer, description: present

### 3. Commands have correct frontmatter
**PASS**

Both commands have `description` and `allowed-tools` fields:
- `commands/login.md` -- description: present, allowed-tools: [Bash, Read, Write, WebFetch]
- `commands/status.md` -- description: present, allowed-tools: [Bash, Read]

Note: login.md includes WebFetch in allowed-tools which is not strictly needed by the process (only uses curl/Bash), but this is not a functional issue -- just slightly over-permissive.

### 4. MCP server config valid
**PASS**

`.mcp.json` is valid JSON. It correctly:
- Uses Docker (`docker run -i --rm`) to run the `ghcr.io/techops-services/keeperhub-mcp:latest` image
- References `${KEEPERHUB_API_KEY}` and `${KEEPERHUB_API_URL}` as env vars (not hardcoded)
- Passes env vars both via `-e` flags and the `env` config block
- Follows the standard MCP server configuration format

### 5. marketplace.json valid JSON
**PASS**

`/Users/skp/Dev/TechOps Services/claude-plugins/.claude-plugin/marketplace.json` is valid JSON containing both the `share` and `keeperhub` plugin entries with correct metadata (name, source path, description, version, author, homepage, repository, license, keywords, category).

### 6. No emojis anywhere
**PASS**

Searched all files under the keeperhub plugin directory for non-ASCII characters. Zero matches found. No emojis in any file including README.md, all SKILL.md files, commands, scripts, or JSON configs.

### 7. Auth flow is secure
**PASS**

- API key is stored in `~/.config/keeperhub/config.json` with `chmod 600` (owner-only read/write)
- `.mcp.json` references `${KEEPERHUB_API_KEY}` env var, not a literal key
- `verify-auth.sh` reads from env var first, then config file -- never logs the full key
- Key prefix display uses 8 characters (after fix, see below)
- Config directory is created with `mkdir -p` (inherits parent permissions)

### 8. All MCP tool names match actual tools from keeperhub-mcp
**PASS**

Verified against the source at `/Users/skp/Dev/TechOps Services/keeperhub-mcp/src/index.ts`. The actual 19 tools registered are:

1. list_workflows
2. get_workflow
3. create_workflow
4. update_workflow
5. delete_workflow
6. ai_generate_workflow
7. execute_workflow
8. get_execution_status
9. get_execution_logs
10. list_action_schemas
11. search_plugins
12. get_plugin
13. validate_plugin_config
14. search_templates
15. get_template
16. deploy_template
17. tools_documentation
18. list_integrations
19. get_wallet_integration

Every tool referenced in the four SKILL.md files exists in this list. No phantom tools, no misspellings.

Coverage by skill:
- workflow-builder: list_action_schemas, ai_generate_workflow, create_workflow, update_workflow, delete_workflow, execute_workflow, search_plugins, get_plugin, validate_plugin_config (9 tools)
- template-browser: search_templates, get_template, deploy_template, update_workflow, execute_workflow (5 tools)
- execution-monitor: list_workflows, get_workflow, execute_workflow, get_execution_status, get_execution_logs, update_workflow (6 tools)
- plugin-explorer: search_plugins, get_plugin, list_action_schemas, list_integrations, get_wallet_integration, validate_plugin_config, tools_documentation (7 tools)

All 19 tools are referenced by at least one skill.

### 9. Share plugin patterns followed
**PASS**

The keeperhub plugin follows the same patterns as the share plugin:
- Auto-install: login command guides through setup, status command detects missing config
- Error handling: verify-auth.sh has comprehensive error cases (no key, invalid key, connection failure, unexpected HTTP codes)
- Config detection: dynamic context blocks in commands check for env vars and config files
- Dynamic context: both login.md and status.md use `!` backtick syntax for runtime context injection

### 10. Skills have proper trigger/do-not-trigger conditions
**PASS**

All four skills define both `<trigger_conditions>` and `<do_not_trigger>` blocks:
- workflow-builder: triggers on "create/build/make workflow", "monitor contract", "automate"; avoids conceptual questions, debugging, browsing
- template-browser: triggers on "show/browse/find templates", "deploy template"; avoids custom building, debugging
- execution-monitor: triggers on "check execution", "why did workflow fail", "show logs"; avoids creating/editing, template browsing
- plugin-explorer: triggers on "what plugins", "show integrations", "what can KeeperHub do"; avoids active building, debugging

Skills properly cross-reference each other in do-not-trigger blocks to avoid conflicts.

### 11. Skills reference /keeperhub:login for missing auth
**PASS**

All four skills include an auth check as step 1 in their `<process>` block. Each contains the exact phrase:
> "You need to authenticate first. Run `/keeperhub:login` to set up your API key."

The status command also references `/keeperhub:login` as a remediation step.

### 12. verify-auth.sh is executable
**PASS**

File has `-rwxr-xr-x` permissions (755) and correct `#!/bin/bash` shebang. Uses `set -euo pipefail` for strict error handling.

## Issues Found and Fixed

### Fix 1: Inconsistent API key prefix length in status command
**File**: `commands/status.md`
**Severity**: Low (cosmetic/consistency)
**Description**: The status command context block originally used `${KEEPERHUB_API_KEY:0:12}` to display 12 characters of the API key prefix, while `login.md` and `verify-auth.sh` use 8 characters. Consistency is better practice and slightly more conservative.
**Fix applied**: Changed `${KEEPERHUB_API_KEY:0:12}` to `${KEEPERHUB_API_KEY:0:8}` in `commands/status.md` line 13.

### Fix 2: README.md stale references after developer updates
**File**: `README.md`
**Severity**: Medium (incorrect user-facing documentation)
**Description**: The developer updated login.md, status.md, .mcp.json, and verify-auth.sh to use `kh_` key prefix and Docker-based MCP server, but README.md still referenced `wfb_` key prefix and Node.js/npx requirement.
**Fixes applied**:
- Changed `export KEEPERHUB_API_KEY="wfb_..."` to `export KEEPERHUB_API_KEY="kh_..."` in the Authenticate section
- Changed Requirements from "Node.js (for `npx` to run the MCP server)" to "Docker (for the MCP server container)"

### Note: Concurrent developer updates
During the review, the developer agent made the following improvements to the plugin (verified as correct):
- `commands/login.md`: Updated key prefix from `wfb_` to `kh_` (organization-scoped), added detailed setup instructions with fallback curl command, added `wfb_` rejection logic
- `commands/status.md`: Changed MCP availability check from npx to Docker image check, updated key prefix example to `kh_`
- `.mcp.json`: Changed from npx-based to Docker-based server execution, added `KEEPERHUB_API_URL` env var
- `scripts/verify-auth.sh`: Added `kh_` prefix validation with helpful error message for `wfb_` keys

All developer changes are internally consistent and improve the plugin. The README fixes above were needed to bring the README in line with these changes.

## Summary

**Overall result: PASS (12/12 checklist items pass, 2 fixes applied)**

The plugin is well-structured and follows Claude Code plugin conventions correctly. All MCP tool names verified against the keeperhub-mcp source code. Auth flow is secure with proper key prefix validation. No emojis anywhere. JSON files are valid. Skills have proper trigger/do-not-trigger conditions and auth checks. The verify-auth.sh script has comprehensive error handling including key prefix validation.
