# TechOps Claude Code Plugins

Claude Code plugin marketplace by TechOps Services.

## Install

```
/plugin marketplace add techops-services/claude-plugins
```

## Available Plugins

### share

Upload HTML and get a short URL.

```
/plugin install share@techops-plugins
```

The `share` CLI binary is installed automatically on first use. Just run `/share` and it handles setup.

Adds:
- `/share` command -- share HTML files directly from Claude Code
- Auto-share skill -- Claude detects when it writes HTML pages and offers to share them

### keeperhub

Manage KeeperHub workflows, execute automations, and browse templates from Claude Code.

```
/plugin install keeperhub@techops-plugins
```

Run `/keeperhub:login` after install to set up your API key and MCP server.

Adds:
- `/keeperhub:login` command -- set up API key and install MCP server
- `/keeperhub:status` command -- check auth and connectivity
- 4 skills -- workflow-builder, template-browser, execution-monitor, plugin-explorer
- 19 MCP tools via keeperhub-mcp server
