# UI Feedback Plugin Setup

## Prerequisites

- Node.js 20 or later
- Claude Code with plugin support

## Installation

1. Install the plugin in Claude Code:
   ```
   /install-plugin path/to/add-ui-feedback
   ```

2. Restart Claude Code to register the MCP bridge server.

3. Verify the bridge is available:
   ```
   curl http://localhost:4243/health
   ```
   Expected response: `{"status":"ok","pending_feedback":0,"pending_responses":0}`

## Usage

### Quick Start

1. Create or open an HTML file in your project.
2. Run `/add-feedback` to inject the annotation overlay.
3. Open the HTML file in a browser.
4. Click "Feedback" to enter annotation mode.
5. Click on UI elements and type your feedback.
6. Click "Send to Claude" to send annotations directly.
7. Claude processes your feedback and responds in the browser panel.

### Clipboard Fallback

If the MCP bridge is not running, the plugin works in clipboard mode:
- The status dot in the toolbar appears gray instead of green.
- The button reads "Copy for Claude" instead of "Send to Claude".
- Click to copy structured feedback to clipboard, then paste to Claude.

## Configuration

### Custom Port

The bridge server defaults to port 4243. To change it:

Set the `UI_FEEDBACK_PORT` environment variable before starting Claude Code:
```bash
export UI_FEEDBACK_PORT=5000
```

Or set `data-bridge-port` on the script tag when using the overlay with a custom port.

### Manual Server Start

If the MCP bridge doesn't start automatically:
```bash
cd /path/to/add-ui-feedback/server
node dist/cli.js --port 4243 --verbose
```

## Troubleshooting

### Bridge not connecting (gray dot)

1. Check if the server is running: `curl http://localhost:4243/health`
2. Check for port conflicts: `lsof -i :4243`
3. Try starting the server manually with `--verbose` flag
4. Verify Claude Code restarted after plugin installation

### Annotations not reaching Claude

1. Confirm the green dot appears in the browser toolbar
2. Check the browser console for network errors
3. Verify the `feedback_watch` or `feedback_get` MCP tools are available in Claude Code

### Port conflicts

If port 4243 is in use, set a different port via `UI_FEEDBACK_PORT` environment variable and restart Claude Code.
