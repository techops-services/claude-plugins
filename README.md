# TechOps Claude Code Plugins

Claude Code plugin marketplace by TechOps Services.

## Install

```
/plugin marketplace add techops-services/claude-plugins
```

## Available Plugins

| Plugin | Description |
|---|---|
| `share` | Upload HTML and get a short URL. Includes `/share` command and auto-share skill. |

### share

```
/plugin install share@techops-plugins
```

Requires the `share` CLI:

```bash
go install github.com/techops-services/share/cmd/share@latest
share init
```

Adds:
- `/share` command -- share HTML files directly from Claude Code
- Auto-share skill -- Claude detects when it writes HTML pages and offers to share them
