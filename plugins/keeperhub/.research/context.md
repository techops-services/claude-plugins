# KeeperHub Claude Code Plugin -- Research Context

## 1. KeeperHub MCP Tools (18 Tools)

All tools are defined in `keeperhub-mcp/src/index.ts` and communicate with the KeeperHub API via `KeeperHubClient`.

### Workflow CRUD (5 tools)
| Tool | Purpose |
|------|---------|
| `list_workflows` | List Web3 automation workflows with pagination (limit/offset) |
| `get_workflow` | Get workflow details by ID (triggers, actions, conditions) |
| `create_workflow` | Create workflow with explicit nodes/edges. Default method for creation |
| `update_workflow` | Update existing workflow (name, description, nodes, edges) |
| `delete_workflow` | Permanently delete a workflow |

### Workflow Execution (3 tools)
| Tool | Purpose |
|------|---------|
| `execute_workflow` | Manually trigger workflow execution with optional input data |
| `get_execution_status` | Check execution state (pending, running, completed, failed) |
| `get_execution_logs` | Get execution logs including tx hashes and error details |

### AI Generation (1 tool)
| Tool | Purpose |
|------|---------|
| `ai_generate_workflow` | Delegate to KeeperHub internal AI for workflow generation from prompt |

### Schema and Plugin Discovery (4 tools)
| Tool | Purpose |
|------|---------|
| `list_action_schemas` | List available action types with fields. Filter by category |
| `search_plugins` | Search plugins by name/description/category |
| `get_plugin` | Get plugin documentation with optional config fields and examples |
| `validate_plugin_config` | Validate step config against schema (strict/runtime/minimal modes) |

### Templates (3 tools)
| Tool | Purpose |
|------|---------|
| `search_templates` | Search pre-built workflow templates by query/category/difficulty |
| `get_template` | Get template metadata and optional setup guide / workflow config |
| `deploy_template` | Deploy template to KeeperHub with customizations |

### Integration and Documentation (2 tools)
| Tool | Purpose |
|------|---------|
| `list_integrations` | List configured integrations filtered by type (web3, discord, etc.) |
| `get_wallet_integration` | Get wallet integration ID for the org (for web3 write operations) |
| `tools_documentation` | Get MCP tool docs. Optional tool_name for specific tool details |

**Total: 18 tools** (list_workflows, get_workflow, create_workflow, update_workflow, delete_workflow, execute_workflow, get_execution_status, get_execution_logs, ai_generate_workflow, list_action_schemas, search_plugins, get_plugin, validate_plugin_config, search_templates, get_template, deploy_template, list_integrations, get_wallet_integration, tools_documentation)

**Note**: `tools_documentation` is a self-help/meta tool. Total is 19 if counted, but functionally 18 operational + 1 meta.


## 2. Authentication Flow

### MCP Server Auth
- **Env var**: `KEEPERHUB_API_KEY` (required, set in environment)
- **API URL**: `KEEPERHUB_API_URL` (defaults to `https://app.keeperhub.com`)
- **HTTP mode**: Optional `PORT` + `MCP_API_KEY` for HTTP transport
- **Cloudflare Access**: Optional `CF_ACCESS_CLIENT_ID` + `CF_ACCESS_CLIENT_SECRET`
- **Bearer token**: All API calls use `Authorization: Bearer ${apiKey}` header

### API Key Format
- Prefix: `wfb_` (workflow builder)
- Generation: `wfb_` + 24 bytes random base64url
- Storage: SHA-256 hash in database, prefix stored for display (`wfb_` + first 7 chars)
- Full key shown only once at creation time

### API Keys REST Endpoints
- `GET /api/api-keys` -- List all keys for authenticated user (returns id, name, prefix, dates)
- `POST /api/api-keys` -- Create new key (body: `{ name?: string }`). Returns full key once
- `DELETE /api/api-keys/[keyId]` -- Delete a key (user-scoped)
- Anonymous users cannot create API keys (403)

### App Auth Library
- **Library**: `better-auth` with drizzle adapter (PostgreSQL)
- **Plugins**: emailOTP, anonymous, organization, genericOAuth (Vercel)
- **Social**: GitHub, Google OAuth
- **Features**: Organization-based access control with owner/admin/member roles
- **RBAC**: Custom access control for workflow, credential, wallet, organization, member, invitation resources


## 3. API Keys UI Page

**No API keys management UI page exists.** There are only API routes:
- `/api/api-keys` (GET/POST)
- `/api/api-keys/[keyId]` (DELETE)

No page in `app/` or `keeperhub/app/` serves a settings or API key management interface. Users would need to generate keys via the API directly or through a CLI/script.


## 4. n8n-skills Patterns Applicable to KeeperHub

### Structure Pattern
- Plugin directory with `.claude-plugin/plugin.json` manifest
- Skills in `skills/<skill-name>/SKILL.md` structure
- Each skill is auto-activated based on description matching

### SKILL.md Pattern
```yaml
---
name: skill-name
description: Purpose and when to use it. Keywords that trigger activation.
---

# Title

Expert guide content organized as:
1. Quick reference table (immediate lookup)
2. Step-by-step guides
3. Common mistakes / pitfalls
4. Cross-references to related skills
5. Best practices (Do's and Don'ts)
```

### Key Design Decisions from n8n-skills
- Skills are knowledge-based, not task-based (teach Claude how to use tools correctly)
- Progressive disclosure: quick reference -> detailed guides -> supporting files
- Explicit cross-referencing between related skills
- No `disable-model-invocation` -- all skills are model-invocable (auto-activating)
- Frontmatter descriptions include trigger keywords for when to activate


## 5. Claude Plugin Component Types

Based on official docs at code.claude.com:

### Component Types
| Type | Location | Purpose |
|------|----------|---------|
| **Skills** | `skills/<name>/SKILL.md` | Model-invoked capabilities. Claude auto-loads when relevant |
| **Commands** | `commands/<name>.md` | User-invoked slash commands. Legacy but still supported |
| **Agents** | `agents/<name>.md` | Specialized subagents for delegation |
| **Hooks** | `hooks/hooks.json` | Event handlers (PreToolUse, PostToolUse, etc.) |
| **MCP Servers** | `.mcp.json` | External tool integrations |
| **LSP Servers** | `.lsp.json` | Language server configurations |

### Plugin Manifest (`plugin.json`)
Required field: `name` only. Key fields:
- `name`, `version`, `description`, `author` (name/email/url)
- `homepage`, `repository`, `license`, `keywords`
- Component paths: `commands`, `agents`, `skills`, `hooks`, `mcpServers`, `outputStyles`, `lspServers`

### SKILL.md Frontmatter Fields
| Field | Default | Purpose |
|-------|---------|---------|
| `name` | directory name | Display name and /slash-command |
| `description` | first paragraph | When to use; Claude uses for auto-activation |
| `argument-hint` | none | Autocomplete hint like `[workflow-name]` |
| `disable-model-invocation` | false | true = only user can invoke via /name |
| `user-invocable` | true | false = hidden from / menu, only Claude invokes |
| `allowed-tools` | all | Restrict tools: `Read, Grep, Glob` |
| `model` | default | Override model for this skill |
| `context` | inline | `fork` = run in subagent |
| `agent` | general-purpose | Which subagent when context: fork |
| `hooks` | none | Skill-scoped lifecycle hooks |

### String Substitutions
- `$ARGUMENTS` -- all args after skill name
- `$ARGUMENTS[N]` / `$N` -- positional args
- `${CLAUDE_SESSION_ID}` -- session ID
- `` !`command` `` -- dynamic context injection (shell command output)

### Environment Variables
- `${CLAUDE_PLUGIN_ROOT}` -- absolute path to plugin directory (for scripts/hooks)


## 6. Share Plugin Patterns to Replicate

### Directory Structure
```
share/
  .claude-plugin/
    plugin.json
  commands/
    share.md          (user-invoked /share command)
  skills/
    share/
      SKILL.md        (auto-activating skill)
```

### plugin.json Pattern
```json
{
  "name": "share",
  "description": "Upload HTML and get a short URL. Includes /share command and auto-share skill.",
  "version": "1.0.0",
  "author": { "name": "TechOps Services" },
  "homepage": "https://github.com/techops-services/share",
  "license": "MIT"
}
```

### Command Pattern (commands/share.md)
- Frontmatter: `description`, `argument-hint`, `allowed-tools`
- Sections: `<objective>`, `<context>` (with dynamic `!`command` injection), `<process>`, `<success_criteria>`
- Auto-install dependencies if missing
- Parse and present results

### Skill Pattern (skills/share/SKILL.md)
- Frontmatter: `name`, `description` (with trigger keyword list)
- Sections: `<objective>`, `<trigger_conditions>`, `<do_not_trigger>`, `<process>`, `<success_criteria>`
- Proactive detection + one-time offer pattern
- Graceful decline handling


## 7. Marketplace Integration

The `claude-plugins` repo is a marketplace with structure:
```
claude-plugins/
  .claude-plugin/
    marketplace.json
  plugins/
    share/
    keeperhub/        <-- new plugin goes here
```

### marketplace.json Entry Format
```json
{
  "name": "keeperhub",
  "source": "./plugins/keeperhub",
  "description": "...",
  "version": "1.0.0",
  "author": { "name": "TechOps Services" },
  "keywords": [...],
  "category": "..."
}
```


## 8. Key Architecture Notes for Plugin Design

### MCP Server Config
The plugin should NOT bundle an MCP server config (`.mcp.json`). The MCP server is already configured separately by users. The plugin's role is to provide skills/commands that teach Claude how to use the existing MCP tools effectively.

### Progressive Disclosure Strategy
Following n8n-skills pattern:
1. SKILL.md descriptions tell Claude when to activate
2. Quick reference in SKILL.md for immediate use
3. Supporting files for deep reference (linked from SKILL.md)
4. Skills cross-reference each other

### Tool Name References
Skills must reference MCP tools by their exact names as defined in the server:
- `list_workflows`, `get_workflow`, `create_workflow`, `update_workflow`, `delete_workflow`
- `execute_workflow`, `get_execution_status`, `get_execution_logs`
- `ai_generate_workflow`
- `list_action_schemas`, `search_plugins`, `get_plugin`, `validate_plugin_config`
- `search_templates`, `get_template`, `deploy_template`
- `list_integrations`, `get_wallet_integration`
- `tools_documentation`
