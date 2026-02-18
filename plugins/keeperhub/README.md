# KeeperHub Plugin for Claude Code

Manage KeeperHub workflows, execute automations, and browse templates directly from Claude Code.

## Quick Start

**1. Install the plugin**

```
/plugin marketplace add techops-services/claude-plugins
/plugin install keeperhub@techops-plugins
```

**2. Run setup**

```
/keeperhub:login
```

This walks you through:
- Creating an organization API key (`kh_` prefix) at app.keeperhub.com
- Auto-installing the keeperhub-mcp server
- Saving config to `~/.claude/keeperhub/config.json`

**3. Restart Claude Code** for the MCP tools to become available.

That's it. Try asking Claude to "create a workflow that monitors a wallet" or run `/keeperhub:status` to verify.

## Commands

| Command | Description |
|---------|-------------|
| `/keeperhub:login` | Set up API key and install MCP server |
| `/keeperhub:status` | Check auth status, API connectivity, and MCP availability |

## Skills

- **workflow-builder** -- Create workflows from natural language. Triggered by "create a workflow", "monitor contract", "set up automation".
- **template-browser** -- Browse and deploy pre-built workflow templates. Triggered by "show templates", "find a workflow for".
- **execution-monitor** -- Monitor executions and debug failures. Triggered by "check execution", "why did my workflow fail".
- **plugin-explorer** -- Discover available plugins and integrations. Triggered by "what plugins are available", "show integrations".

## MCP Tools

This plugin configures the `keeperhub-mcp` server which provides 19 tools for full API access: workflow CRUD, execution management, template operations, plugin discovery, and integration queries. See the [keeperhub-mcp repository](https://github.com/techops-services/keeperhub-mcp) for tool documentation.

## Requirements

- A KeeperHub account at https://app.keeperhub.com
- Node.js 20+
- curl (pre-installed on macOS and most Linux)

The MCP server is auto-installed on first `/keeperhub:login`. No Docker or git required.
